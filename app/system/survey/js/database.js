'use strict';
// TODO: Instance level: locale (used), at Table level: locales (available), formPath, 
define(['opendatakit','databaseUtils','databaseSchema','jquery'], function(opendatakit,databaseUtils,databaseSchema,$) {
verifyLoad('database',
    ['opendatakit','databaseUtils','databaseSchema','jquery'],
    [opendatakit,databaseUtils,databaseSchema,$]);
return {
    readTableDefinition:function(ctxt, formDef, table_id, formPath) {
		// If table_id is 'framework' then we dummy-up a definition
		// because there is no 'framework' table.
		//
		// Otherwise, we can accomplish this via
        //  UserTable t <= DataIf.getMostRecentRow(model.table_id, genUUID(), postprocessorcb)
        // This will fetch an empty UserTable.
        // and we then can process the results of that fetch to
		// construct the table definition.
        //
		// When complete, we invoke ctxt.success(tlo)
		// passing in the table definition. That definition
		// does not have any instance or session variable
		// data associated with it.
		//     
		var that = this;
				
		if ( table_id === 'framework' ) {
			var tlo = {data: {},      // dataTable instance data values
				instanceMetadata: {}, // dataTable instance Metadata: (_savepoint_timestamp, _savepoint_creator, _savepoint_type, _form_id, _locale)
				metadata: {},         // see definition in opendatakit.js
				dataTableModel: {},   // inverted and extended formDef.model for representing data store
				formDef: formDef, 
				formPath: formPath, 
				instanceId: null, 
				table_id: table_id
				};
			databaseSchema.constructDataTableModel(tlo);
			tlo.metadata.tableId = table_id;
			tlo.metadata.schemaETag = null;
			tlo.metadata.lastDataETag = null;
			tlo.metadata.lastSyncTime = -1;
			tlo.metadata.elementKeyMap = {};
			tlo.metadata.orderedColumns = {};
			tlo.metadata.keyValueStoreList = [];
			var entry;
			var kvsEntry;
			var value;
			for ( entry in formDef.specification.properties ) {
				kvsEntry = {};
				kvsEntry.partition = entry['_partition'];
				kvsEntry.aspect = entry['_aspect'];
				kvsEntry.key = entry['_key'];
				kvsEntry.type = entry['_type'];
				value = entry['_value'];
				kvsEntry.value = databaseUtils.fromKVStoreToElementType(kvsEntry.type, value);
				tlo.metadata.keyValueStoreList.push(kvsEntry);
			}
			ctxt.success(tlo);
		} else {
			var impossibleRowId = opendatakit.genUUID();
			odkData.getMostRecentRow(table_id, impossibleRowId, 
				function(reqData) {
					var tlo = {data: {},      // dataTable instance data values
						instanceMetadata: {}, // dataTable instance Metadata: (_savepoint_timestamp, _savepoint_creator, _savepoint_type, _form_id, _locale)
						metadata: {},         // see definition in opendatakit.js
						dataTableModel: {},   // inverted and extended formDef.model for representing data store
						formDef: formDef, 
						formPath: formPath, 
						instanceId: null, 
						table_id: table_id
						};
					databaseSchema.constructDataTableModel(tlo);
					tlo.metadata = reqData.metadata;
					ctxt.success(tlo);
				}, 
				function (errorMsg) {
					ctxt.failure({message: errorMsg});
				});
		}
    },
	/**
	 * accumulatedChanges[retentionColumn] = {"elementPath" : elementPath, "value": ???};
	 *
	 */
	_initializeInstanceWithPendingChanges:function(ctxt, model, formId, instanceId, accumulatedChanges ) {
		var that = this;
		
		var stringifiedJSON = that._createStringifiedJSONPendingChanges(model.dataTableModel, accumulatedChanges, formId);
		odkData.addCheckpoint(model.table_id, stringifiedJSON, instanceId,
			function(reqData) {
				// read data from the row and
				// read any session variables into model.data
				var updates = {};
				var jsonType;
				var elementPath;
				var jsValue;
				var value;
				var dbKey;
				for ( dbKey in model.dataTableModel ) {
					jsonType = model.dataTableModel[dbKey];
					if ( databaseUtils.isUnitOfRetention(jsonType) ) {
						elementPath = jsonType.elementPath;
						if ( jsonType.isSessionVariable ) {
							jsValue = odkCommon.getSessionVariable(elementPath );
							value = (jsValue === null || jsValue === undefined) ? null : 
									databaseUtils._fromSerializationToElementType(jsonType, jsValue, true);
						} else {
							value = reqData.getData(0, dbKey);
							// mainly to convert datetime and time values...
							value = databaseUtils._fromOdkDataInterfaceToElementType(jsonType, value);
						}
						updates[dbKey] = { elementPath: elementPath, value: value };
					}
				}
				// reconstruct the data and instanceMetadata fields.
				model.data = {};
				model.instanceMetadata = {};
				databaseUtils.reconstructModelDataFromElementPathValueUpdates(model, updates);
				ctxt.success();
			}, 
			function(errorMsg) {
				ctxt.failure({message: errorMsg});
			});
	},
    
    initializeInstance:function(ctxt, model, formId, instanceId, sameInstance, instanceMetadataKeyValueMap) {
        var that = this;

		if ( sameInstance ) {
			instanceMetadataKeyValueMap = {};
		} else {
			instanceMetadataKeyValueMap = instanceMetadataKeyValueMap || {};
		}
		///////////////////////////////////////////////////////////////////////////////////////////
		// If instanceId is null:
		//
		// If sameInstance is true, initialize all non-session variable values to null and reads 
		// the session values into the model. The instanceMetadataKeyValueMap is ignored.
		//
		// Otherwise, initialize all non-session variable values to null and all session variable
		// values to their defaults then apply the instanceMetadataKeyValueMap for any session 
		// variables to the data set (any settings for data table content are ignored).
		//
		if ( instanceId === null || instanceId === undefined || (model.table_id === "framework") ) {
			ctxt.log('D','initializeInstance.noInstance');
			model.instanceMetadata = {};
			model.data = {};
			model.loaded = false;

			var jsonType;
			var elementPath;
			var value;
			var accumulatedChanges = {};
			// NOTE: setModelDataValueDeferredChange will not accept any data table changes if instanceId is null or undefined
			// apply the model defaults.
			for ( elementPath in model.dataTableModel ) {
				jsonType = model.dataTableModel[elementPath];
				if ( jsonType['default'] !== undefined && jsonType['default'] !== null ) {
					// otherwise, use the default for the session variable
					value = jsonType['default'];
					that.setModelDataValueDeferredChange( model, formId, instanceId, elementPath, value, accumulatedChanges);
				}
			}
			// NOTE: setModelDataValueDeferredChange will not accept any data table changes if instanceId is null or undefined
			// and now apply any changes from the instanceMetadataKeyValueMap
			// NOTE: this will have been cleared at the top of the method if sameInstance is true.
			for ( elementPath in instanceMetadataKeyValueMap ) {
				if ( instanceMetadataKeyValueMap[elementPath] === null ) {
					value = null;
				} else {
					jsonType = model.dataTableModel[elementPath];
					value = databaseUtils._fromSerializationToElementType(jsonType, instanceMetadataKeyValueMap[elementPath], true);
				}
				that.setModelDataValueDeferredChange( model, formId, instanceId, elementPath, value, accumulatedChanges);
			}
			// and discard the accumulated changes, since those relate to database column values and we don't have an instance.
			// and clear the pending changes set.
			that.pendingChanges = {};
			ctxt.success();
			return;
		}
		///////////////////////////////////////////////////////////////////////////////////////////
		// InstanceId is NOT null:
		//
		// If sameInstance is true:
		//
		// Read the instance from the database. If the database does not contain an instance, 
		// then it is an error. Otherwise, it initializes the model with the content from the row and
		// the session values. The instanceMetadataKeyValueMap is ignored.
		//
		// If sameInstance is false:
		//
		// If the row does not exist, construct the default values and apply the 
		// updates from the instanceMetadataKeyValueMap then write a checkpoint row with that content.
		//
		// If the row exists, then read it in and apply the updates from the
		// instanceMetadataKeyValueMap and write a checkpoint row with that revised content. 
		// If there were no updates, then no checkpoint row is written.
		//

		//
		// Otherwise, after reading in the row, the 
        // TODO: confirm semantics
        // If this is always creating a new row, we can just call addRow() and rely on the user to never 
        // confound things by re-using an instanceId.
        //
        // Otherwise, we first try to read the entry:
        // UserTable t <== DataIf.getMostRecentRow(model.table_id, instanceId, postprocessorcb);
        // if ( t.getNumberOfRows() == 0 ) {
        //    UserTable t <= DataIf.addRow(modle.table_id, initialMetadataValueMap, instanceId, postprocessorcb);
        // }
        // In post-processor, update model with t.
        // 
        // This returns the last checkpoint row for an instanceId, or the row itself if there is no checkpoint, or zero-length UserTable if the row does not exist.
		odkData.getMostRecentRow(model.table_id, instanceId, 
			function(reqData) {
				
				var elementPath;
				var jsonType;
				var jsValue;
				var value;
				var dbKey;
				var accumulatedChanges = {};
				
				if ( reqData.getCount() > 1 ) {
					ctxt.failure({message: "multiple rows!"});
					return;
				} else if ( reqData.getCount() === 0 ) {
					if ( sameInstance ) {
						ctxt.failure({message: "row not found!"});
						return;
					}
					
					that.pendingChanges = {};
					
					// apply defaults
					for ( elementPath in model.dataTableModel ) {
						jsonType = model.dataTableModel[elementPath];
						if ( jsonType['default'] !== undefined && jsonType['default'] !== null ) {
							// otherwise, use the default for the session variable
							that.setModelDataValueDeferredChange( model, formId, instanceId, elementPath, jsonType['default'], accumulatedChanges);
						}
					}
					// and now apply any changes from the instanceMetadataKeyValueMap
					// NOTE: this will have been cleared at the top of the method if sameInstance is true.
					for ( elementPath in instanceMetadataKeyValueMap ) {
						jsonType = model.dataTableModel[elementPath];
						value = databaseUtils._fromSerializationToElementType(jsonType, instanceMetadataKeyValueMap[elementPath], true);
						that.setModelDataValueDeferredChange( model, formId, instanceId, elementPath, value, accumulatedChanges);
					}
					
					if ( $.isEmptyObject(accumulatedChanges)) {
						ctxt.success();
					} else {
						// apply the accumulated changes - this will also refresh the model's data and instanceMetadata
						that._initializeInstanceWithPendingChanges(ctxt, model, formId, instanceId, accumulatedChanges );
					}
					return;
				} else {
					// read data from the row and
					// read any session variables into model.data
					var updates = {};
					for ( dbKey in model.dataTableModel ) {
						jsonType = model.dataTableModel[dbKey];
						if ( databaseUtils.isUnitOfRetention(jsonType) ) {
							elementPath = jsonType.elementPath;
							if ( jsonType.isSessionVariable ) {
								jsValue = odkCommon.getSessionVariable(elementPath );
								value = (jsValue === null || jsValue === undefined) ? null :
									databaseUtils._fromSerializationToElementType(jsonType, jsValue, true);
							} else {
								value = reqData.getData(0, dbKey);
								// mainly to convert datetime and time values...
								value = databaseUtils._fromOdkDataInterfaceToElementType(jsonType, value);
							}
							updates[dbKey] = { elementPath: elementPath, value: value };
						}
					}
					model.data = {};
					model.instanceMetadata = {};
					databaseUtils.reconstructModelDataFromElementPathValueUpdates(model, updates);
					// and clear the pending changes set.
					that.pendingChanges = {};
					// and now apply any changes from the instanceMetadataKeyValueMap
					// NOTE: this will have been cleared at the top of the method if sameInstance is true.
					for ( elementPath in instanceMetadataKeyValueMap ) {
						if ( instanceMetadataKeyValueMap[elementPath] === null ) {
							value = null;
						} else {
							jsonType = model.dataTableModel[elementPath];
							value = databaseUtils._fromSerializationToElementType(jsonType, instanceMetadataKeyValueMap[elementPath], true);
						}
						that.setModelDataValueDeferredChange( model, formId, instanceId, elementPath, value, accumulatedChanges);
					}
					if ( $.isEmptyObject(accumulatedChanges)) {
						ctxt.success();
					} else {
						// apply the accumulated changes - this will also refresh the model's data and instanceMetadata
						that._initializeInstanceWithPendingChanges(ctxt, model, formId, instanceId, accumulatedChanges );
					}
				}
			},
			function(errorMsg) { ctxt.failure({message: errorMsg}); });
    },

    ///////////////////////////////////////////////////
    // Low-level APIs mapped to DataIf
    ///////////////////////////////////////////////////
    
    get_linked_instances:function(ctxt, dbTableName, selection, selectionArgs, displayElementName, orderBy) {
        // 
        // UserTable lt = DataIf.query( dbTableName, selection, selectionArgs, null, null, orderBy, "ASC", false, postprocessorcb
        //
        // And, on the postprocessorcb success callback:
        //
        // for ( var i = 0 ; i < result.rows.length ; i+=1 ) {
        //      var instance = result.rows.item(i);
        //      var ts = opendatakit.convertNanosToDateTime(instance._savepoint_timestamp);
        //      instanceList.push({
        //          display_field: (displayElementName === undefined || displayElementName === null) ? ((ts == null) ? "" : ts.toISOString()): instance[displayElementName],
        //          instance_id: instance._id,
        //          savepoint_timestamp: ts,
        //          savepoint_type: instance._savepoint_type,
        //          savepoint_creator: instance._savepoint_creator,
        //          locale: instance._locale,
        //          form_id: instance._form_id
        //      });
        //  }
        //  ctxt.log('D','get_linked_instances.inside', dbTableName + " instanceList: " + instanceList.length);
        //  ctxt.success(instanceList);
		if ( dbTableName === "framework" ) {
			ctxt.success([]);
			return;
		}
		
		var ss = databaseSchema.selectMostRecentFromDataTableStmt(dbTableName, selection, selectionArgs, orderBy);
		odkData.rawQuery(dbTableName, ss.stmt, ss.bind, 
			function(reqData) {
				var instanceList = [];
				for (var rowCntr = 0; rowCntr < reqData.getCount(); rowCntr++) {
					var ts = opendatakit.convertNanosToDateTime(reqData.getData(rowCntr, '_savepoint_timestamp'));
					instanceList.push({
						display_field: (displayElementName === undefined || displayElementName === null) ?
											((ts === null) ? "" : ts.toISOString()): reqData.getData(rowCntr, displayElementName),
						instance_id: reqData.getData(rowCntr, '_id'),
						savepoint_timestamp: ts,
						savepoint_type: reqData.getData(rowCntr, '_savepoint_type'),
						savepoint_creator: reqData.getData(rowCntr, '_savepoint_creator'),
						locale: reqData.getData(rowCntr, '_locale'),
						form_id: reqData.getData(rowCntr, '_form_id')
					});
				}
				ctxt.log('D','get_linked_instances.inside', dbTableName + " instanceList: " + instanceList.length);
				ctxt.success(instanceList);
			}, function(errorMsg) { ctxt.failure({message: errorMsg}); });
    },
    
    save_all_changes:function(ctxt, model, formId, instanceId, asComplete) {
        // UserTable t;
        // if ( asComplete ) {
        //   t = DataIf.saveCheckpointAsComplete(model.table_id, keyValueMap, instanceId, callbackwrapper(ctxt));
        // } else {
        //   t = DataIf.saveCheckpointAsIncomplete(model.table_id, keyValueMap, instanceId, callbackwrapper(ctxt));
        // }
        // In post-processor, update model with t.
        // BUGS: ???        
        // NOTE: does not apply changes into model (and does not mark it as stale)
		var that = this;
		var savedPendingChanges = that.pendingChanges;
		that.pendingChanges = {};
		var stringifiedJSON = that._createStringifiedJSONPendingChanges(model.dataTableModel, savedPendingChanges, formId);
		if ( asComplete ) {
			odkData.saveCheckpointAsComplete(model.table_id, stringifiedJSON, instanceId, 
				function(reqData) { ctxt.success(); }, 
				function(errorMsg) { that.pendingChanges = savedPendingChanges; ctxt.failure({message: errorMsg}); });
		} else {
			odkData.saveCheckpointAsIncomplete(model.table_id, stringifiedJSON, instanceId, 
				function(reqData) { ctxt.success(); }, 
				function(errorMsg) { that.pendingChanges = savedPendingChanges; ctxt.failure({message: errorMsg}); });
		}
    },
    
    ignore_all_changes:function(ctxt, model, formId, instanceId) {
        // NOTE: does not reload model (marks it as stale)
		odkData.deleteAllCheckpoints(model.table_id, instanceId, 
                function(reqData) { ctxt.success(); }, 
                function(errorMsg) { ctxt.failure({message: errorMsg}); });
    },
    
    delete_checkpoints_and_row:function(ctxt, dbTableName, instanceId) {
        // This is a 2-step process
        // 
        // UserTable t <= DataIf.deleteAllCheckpoints( dbTableName, instanceId);
        // if ( t.getNumberOfRows() != 0 ) {
        //   DataIf.deleteRow(dbTableName, instanceId);
        // }
		odkData.deleteAllCheckpoints(dbTableName, instanceId, function() { 
				odkData.deleteRow( dbTableName, null, instanceId, 
									function (reqData) { ctxt.success(); }, 
									function(errorMsg) { ctxt.failure({message: errorMsg, rolledBack: true }); });
							}, function(errorMsg) { ctxt.failure({message: errorMsg, rolledBack: false }); });
    },
    
    // almost primitive...
    get_all_data:function(ctxt, model, instanceId) {

        // UserTable t = DataIf.getMostRecentRow(model.table_id, instanceId)
        // wrappedctxt:
        // successs(userTable) {
        // if ( t.getNumberOfRows() != 1 ) {
        //    ctxt.failure("no row or multiple rows!");
        // } else {
        //    apply returned row content PLUS sessionVariables to update model
        //    i.e.,
        //    updates == kvMap + any changes done within dbservice (e.g., metadata fields)
        //                     + session variables from odkCommon
        //    databaseUtils.reconstructModelDataFromElementPathValueUpdates(model, updates);
        //    model.loaded = true;
        // },
        // failure(m) {
        //    ctxt.failure(m)
        // }
		odkData.getMostRecentRow(model.table_id, instanceId, 
			function(reqData) {
				if ( reqData.getCount() != 1 ) {
					ctxt.failure({message: "no row or multiple rows!"});
					return;
				}
				// read data from the row and
				// read any session variables into model.data
				var updates = {};
				var jsonType;
				var elementPath;
				var jsValue;
				var value;
				var dbKey;
				for ( dbKey in model.dataTableModel ) {
					jsonType = model.dataTableModel[dbKey];
					if ( databaseUtils.isUnitOfRetention(jsonType) ) {
						elementPath = jsonType.elementPath;
						if ( jsonType.isSessionVariable ) {
							jsValue = odkCommon.getSessionVariable(elementPath );
							value = (jsValue === null || jsValue === undefined) ? null : 
								databaseUtils._fromSerializationToElementType(jsonType, jsValue, true);
						} else {
							value = reqData.getData(0, dbKey);
							// mainly to convert datetime and time values...
							value = databaseUtils._fromOdkDataInterfaceToElementType(jsonType, value);
						}
						updates[dbKey] = { elementPath: elementPath, value: value };
					}
				}
				databaseUtils.reconstructModelDataFromElementPathValueUpdates(model, updates);
				ctxt.success();
			},
			function(errorMsg) { ctxt.failure({message: errorMsg}); });
    },
    
    /**
     * Not expected to be called expect internally
	 *
	 * changeMap[retentionColumn] = {"elementPath" : elementPath, "value": ???};
     */
    _add_checkpoint: function(ctxt, model, formId, instanceId, changeMap) {
        var that = this;

        // DataIf.addCheckpoint( model.table_id, transform(kvMap, formId), instanceId, callbackwrapper(ctxt))

        //
        // checkpoint API should probably have a mechanism to return the new row values
        // so that we can update the model immediately, rather than having to re-query.
        //
        // ON SUCCESS:
        //
        // updates == kvMap + any changes done within dbservice (e.g., metadata fields)
        // databaseUtils.reconstructModelDataFromElementPathValueUpdates(model, updates);
        // model.loaded = true;
		var stringifiedJSON = that._createStringifiedJSONPendingChanges(model.dataTableModel, changeMap, formId);
		odkData.addCheckpoint(model.table_id, stringifiedJSON, instanceId, 
			function(reqData) {
				if ( reqData.getCount() != 1 ) {
					ctxt.failure({message: "no row or multiple rows!"});
					return;
				}
				// read data from the row and
				// read any session variables into model.data
				var updates = {};
				var jsonType;
				var elementPath;
				var jsValue;
				var value;
				var dbKey;
				for ( dbKey in model.dataTableModel ) {
					jsonType = model.dataTableModel[dbKey];
					if ( databaseUtils.isUnitOfRetention(jsonType) ) {
						elementPath = jsonType.elementPath;
						if ( jsonType.isSessionVariable ) {
							jsValue = odkCommon.getSessionVariable(elementPath );
							value = (jsValue === null || jsValue === undefined) ? null : 
								databaseUtils._fromSerializationToElementType(jsonType, jsValue, true);
						} else {
							value = reqData.getData(0, dbKey);
							// mainly to convert datetime and time values...
							value = databaseUtils._fromOdkDataInterfaceToElementType(jsonType, value);
						}
						updates[dbKey] = { elementPath: elementPath, value: value };
					}
				}
				model.data = {};
				model.instanceMetadata = {};
				databaseUtils.reconstructModelDataFromElementPathValueUpdates(model, updates);
				ctxt.success();
			}, 
			function(errorMsg) {
				ctxt.failure({message: errorMsg});
			});
    },

    /**
     * Implement pending changes at this layer
     */  
    pendingChanges: {},
    
    /**
     * used by odkData interface to pass the stringified kvMap of fields to change
	 *
 	 * accumulatedChanges[retentionColumn] = {"elementPath" : elementPath, "value": ???};
     */
    _createStringifiedJSONPendingChanges:function(dataTableModel, accumulatedChanges, formId) {
        var simpleMap = {};
		var key;
		var jsonType;
        for ( key in accumulatedChanges ) {
			jsonType = dataTableModel[key];
            simpleMap[key] = databaseUtils.toOdkDataInterfaceFromElementType(jsonType, accumulatedChanges[key].value);
        }
		// metadata fields other than formId and creator are managed in the service layer.
        // TODO: should current user also be enforced here??
        simpleMap._form_id = formId;
		simpleMap._savepoint_creator = odkCommon.getActiveUser();
        return JSON.stringify(simpleMap);
    },

    /**
     * Requires opendatakit.getCurrentModel()
     *
     * updates that model and records the field changes in the 
     * this.pendingChanges
     */
    setValueDeferredChange:function( name, value ) {
        var that = this;
        var formId = opendatakit.getSettingValue('form_id');
        var model = opendatakit.getCurrentModel();
        var instanceId = opendatakit.getCurrentInstanceId();
		that.setModelDataValueDeferredChange( model, formId, instanceId, name, value, that.pendingChanges );

        databaseUtils.reconstructModelDataFromElementPathValueUpdates(model, that.pendingChanges);
    },

    /**
     * Does not depend upon any global values.
     *
     * updates the model and records the field changes in 
     * this.pendingChanges
     */
    setModelDataValueDeferredChange:function( model, formId, instanceId, name, value, accumulatedChanges ) {
        var that = this;
        var justChange = {};
        justChange[name] = {value: value, isInstanceMetadata: false };
        // apply the change immediately...
        databaseSchema.accumulateUnitOfRetentionUpdates(model, formId, instanceId, justChange, accumulatedChanges );
    },

    /**
     * Requires opendatakit.getCurrentModel()
     *
     * updates the database with any accumulated changes in the 
     * this.pendingChanges object and resets that object.
     */
    applyDeferredChanges:function(ctxt) {
        var that = this;
        var changes = that.pendingChanges;
        that.pendingChanges = {};
        var formId = opendatakit.getSettingValue('form_id');
        var model = opendatakit.getCurrentModel();
		if ( model.table_id === null || model.table_id === undefined || model.table_id === 'framework' ) {
			ctxt.success();
			return;
		}
        var instanceId = opendatakit.getCurrentInstanceId();
		if ( instanceId === null || instanceId === undefined ) {
			ctxt.success();
			return;
		}
        that._add_checkpoint($.extend({}, ctxt, {
                success:function() {
                    if (model.loaded) {
                        // we don't need to fetch the row
                        ctxt.success();
                    } else {
                        that.get_all_data(ctxt, model, instanceId);
                    }
                },
                failure:function(m) {
                    // a failure happened during writing -- reload state from db
                    model.loaded = false;
                    that.get_all_data($.extend({},ctxt,{success:function() {
                            ctxt.failure(m);
                        }, failure:function(m2) {
                            ctxt.failure(m);
                        }}), model, instanceId);
                }
            }), model, formId, instanceId, changes );
    },

    /**
     * Requires opendatakit.getCurrentModel()
     *
     * updates the database with the specified metadata change
     * and applies any accumulated changes in the 
     * this.pendingChanges object and resets that object.
     */
    setInstanceMetaData:function(ctxt, name, value) {
        ctxt.log('I','setInstanceMetaData: ' + name);
        var that = this;
        var formId = opendatakit.getSettingValue('form_id');
        var model = opendatakit.getCurrentModel();
        var instanceId = opendatakit.getCurrentInstanceId();
        var dbColumnName;
        var f;
        var defn;
        
        ctxt.log('D','putInstanceMetaData', 'name: ' + name);
        for ( f in databaseSchema.dataTablePredefinedColumns ) {
          defn = databaseSchema.dataTablePredefinedColumns[f];
          if (  defn.elementSet === 'instanceMetadata' &&
              ( (defn.elementPath === name) ||
                ((defn.elementPath === undefined || defn.elementPath === null) && (f === name)) ) ) {
            dbColumnName = f;
            break;
          }
        }
        if ( dbColumnName === undefined || dbColumnName === null ) {
          ctxt.log('E','putInstanceMetaData.elementPath.missing', 'name: ' + name);
          ctxt.failure({message:"Unrecognized instance metadata"});
          return;
        }

        // and still use the elementPath for the lookup.
        // this simply ensures that the name is exported above 
        // the database layer. 
        // The database layer uses putDataKeyValueMap()
        // for lower-level manipulations.

        // flush any pending changes too...
        var changes = that.pendingChanges;
        that.pendingChanges = {};
        changes[name] = {value: value, isInstanceMetadata: true };
        that._add_checkpoint($.extend({}, ctxt, {
                success:function() {
                    if (model.loaded) {
                        // we don't need to fetch the row
                        ctxt.success();
                    } else {
                        that.get_all_data(ctxt, model, instanceId);
                    }
                },
                failure:function(m) {
                    // a failure happened during writing -- reload state from db
                    model.loaded = false;
                    that.get_all_data($.extend({},ctxt,{success:function() {
                            ctxt.failure(m);
                        }, failure:function(m2) {
                            ctxt.failure(m);
                        }}), model, instanceId);
                }
            }), model, formId, instanceId, changes );
    },

    initializeTables:function(ctxt, formDef, table_id, formPath) {
        var that = this;
        var rectxt = $.extend({}, ctxt, {success:function(tlo) {
            ctxt.log('D','getAllTableMetaData.success');
            // these values come from the current webpage
            // update table_id and qp
            var model = opendatakit.getCurrentModel();
            model.formDef = tlo.formDef;
            model.dataTableModel = tlo.dataTableModel;
            model.metadata = tlo.metadata;
            model.instanceMetadata = tlo.instanceMetadata;
            model.data = tlo.data;
            model.loaded = false;
            that.pendingChanges = {};

            opendatakit.setCurrentTableId(table_id);
            opendatakit.setCurrentFormPath(formPath);
            ctxt.success();
        }});
        that.readTableDefinition(rectxt, formDef, table_id, formPath);
    },

    // synchronous implementation may make use of the databaseUtils class

    /**
     * Requires opendatakit.getCurrentModel()
     */
    getInstanceMetaDataValue:function(name) {
        var that = this;
        var model = opendatakit.getCurrentModel();
        return databaseUtils.getElementPathValue(model.instanceMetadata, name);
    },
    /**
     * Requires opendatakit.getCurrentModel()
     */
    getDataValue:function(name) {
        var that = this;
        var model = opendatakit.getCurrentModel();
        return databaseUtils.getElementPathValue(model.data, name);
    },
    /**
     * Requires opendatakit.getCurrentModel()
     */
    getAllDataValues:function() {
        var model = opendatakit.getCurrentModel();
        return model.data;
    },
    convertSelectionString:function(linkedModel, selection) {
        return databaseUtils.convertSelectionString(linkedModel, selection);
    },
    convertOrderByString:function(linkedModel, order_by) {
        return databaseUtils.convertOrderByString(linkedModel, order_by);
    }
    
};
});