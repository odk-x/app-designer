/* global odkCommon, odkData */
define(['opendatakit','databaseUtils','jquery'], function(opendatakit,databaseUtils,$) {
'use strict';
verifyLoad('database',
    ['opendatakit','databaseUtils','jquery'],
    [opendatakit,databaseUtils,$]);
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
            // TODO: should go away in the future??
            // This should REMAIN the only place that 
            //   formDef.specification.dataTableModel
            //   formDef.specification.properties
            // are directly referenced. 
            var tlo = {data: {},      // dataTable instance data values
                instanceMetadata: {}, // dataTable instance Metadata: (_savepoint_timestamp, _savepoint_creator, _savepoint_type, _form_id, _locale)
                metadata: {},         // see definition in opendatakit.js
                dataTableModel: formDef.specification.dataTableModel, // inverted and extended formDef.model for representing data store
                formDef: formDef,
                formPath: formPath,
                instanceId: null,
                table_id: table_id
                };
            tlo.metadata.tableId = table_id;
            tlo.metadata.schemaETag = null;
            tlo.metadata.lastDataETag = null;
            tlo.metadata.lastSyncTime = -1;
            tlo.metadata.dataTableModel = formDef.specification.dataTableModel;
            tlo.metadata.elementKeyMap = {};
            tlo.metadata.keyValueStoreList = [];
            var entry;
            var kvsEntry;
            var value;
            for ( entry in formDef.specification.properties ) {
                if ( formDef.specification.properties.hasOwnProperty(entry) ) {
                    kvsEntry = {};
                    kvsEntry.partition = entry._partition;
                    kvsEntry.aspect = entry._aspect;
                    kvsEntry.key = entry._key;
                    kvsEntry.type = entry._type;
                    value = entry._value;
                    kvsEntry.value = databaseUtils.fromKVStoreToElementType(kvsEntry.type, value);
                    tlo.metadata.keyValueStoreList.push(kvsEntry);
                }
            }
            ctxt.success(tlo);
        } else {
            var impossibleRowId = opendatakit.genUUID();
            odkData.getMostRecentRow(table_id, impossibleRowId,
                function(reqData) {
                    var tlo = {data: {},      // dataTable instance data values
                        instanceMetadata: {}, // dataTable instance Metadata: (_savepoint_timestamp, _savepoint_creator, _savepoint_type, _form_id, _locale)
                        metadata: {},         // see definition in opendatakit.js
                        dataTableModel: formDef.specification.dataTableModel, // inverted and extended formDef.model for representing data store
                        formDef: formDef,
                        formPath: formPath,
                        instanceId: null,
                        table_id: table_id
                        };
                    // save the result object
                    tlo.resultObject = reqData;
                    tlo.metadata = reqData.getMetadata();
                    // the dataTableModel returned from the Java side does not have session variables or retain the default values of the columns.
                    // therefore we should use the one in the form definition.
                    tlo.metadata.dataTableModel =  formDef.specification.dataTableModel;
                    ctxt.success(tlo);
                },
                function (errorMsg) {
                    ctxt.failure({message: errorMsg});
                });
        }
    },
    _applyPendingChangesToModelData:function(model, instanceId, logWarning) {
        var that = this;

        var updates = {};
        var jsonType;
        var dbKey;
        var pendingChangeEntry;

        // if requested, log a warning if not all pending changes have
        // been applied. This indicates that the UI is faster than the
        // db layer. It could potentially lead to loss of these updates.
        var keys = [];

        if ( ! $.isEmptyObject(that.pendingChanges)) {

            // apply any remaining pendingChanges
            // these are already in the odkData interface format.
            // we need to parse them back into their representation formats.
            for (dbKey in that.pendingChanges ) {
                if ( that.pendingChanges.hasOwnProperty(dbKey) ) {
                    // for logging...
                    keys.push(dbKey);
                    // get the type and the change entry
                    jsonType = model.dataTableModel[dbKey];
                    pendingChangeEntry = that.pendingChanges[dbKey];
                    if ( pendingChangeEntry !== undefined && pendingChangeEntry !== null ) {
                        // construct the data-update entry
                        updates[dbKey] = { elementPath: pendingChangeEntry.elementPath, value: pendingChangeEntry.value };
                    }
                }
            }
            // apply the updates
            databaseUtils.reconstructModelDataFromElementPathValueUpdates(model, updates);

            if ( logWarning ) {
                // log that we have a non-empty pendingChanges key-value set.
                odkCommon.log('W','_reconstructModelData: pendingChanges is not empty! ' +
                    model.table_id + ' _id: ' + instanceId + ' keys: ' + JSON.stringify(keys));
            }
        }
    },
    _reconstructModelData:function(model, reqData) {
        var that = this;

        var updates = {};
        var jsonType;
        var elementPath;
        var jsValue;
        var value;
        var dbKey;

        if ( reqData === null || reqData === undefined || reqData.getCount() === 0 ) {

            // clear any row data, but retain session variable values.

            // clear the pendingChanges, since no row exists.
            that.pendingChanges = {};

            // read any session variables into updates
            for ( dbKey in model.dataTableModel ) {
                if ( model.dataTableModel.hasOwnProperty(dbKey) ) {
                    jsonType = model.dataTableModel[dbKey];
                    if ( databaseUtils.isUnitOfRetention(jsonType) ) {
                        elementPath = jsonType.elementPath;
                        if ( jsonType.isSessionVariable ) {
                            jsValue = odkCommon.getSessionVariable(elementPath );
                            value = (jsValue === null || jsValue === undefined) ? null :
                                    databaseUtils.fromSerializationToElementType(jsonType, jsValue, true);
                            updates[dbKey] = { elementPath: elementPath, value: value };
                        }
                    }
                }
            }

            // reconstruct the data and instanceMetadata fields.
            model.data = {};
            model.instanceMetadata = {};
            databaseUtils.reconstructModelDataFromElementPathValueUpdates(model, updates);

            odkCommon.log('W','_reconstructModelData: no row returned -- clearing cached values: ' +
                            model.table_id);
            return;
        }

        if ( reqData.getCount() > 1 ) {
            // this is a serious error -- stall the ODKSurvey webkit and throw an error when this happens.
            throw new Error("_reconstructModelData: multiple rows were returned -- cannot process");
        }

        // otherwise, we have a record...
        // read data from the row and
        // read any session variables into model.data
        for ( dbKey in model.dataTableModel ) {
            if ( model.dataTableModel.hasOwnProperty(dbKey) ) {
                jsonType = model.dataTableModel[dbKey];
                if ( databaseUtils.isUnitOfRetention(jsonType) ) {
                    elementPath = jsonType.elementPath;
                    if ( jsonType.isSessionVariable ) {
                        jsValue = odkCommon.getSessionVariable(elementPath );
                        value = (jsValue === null || jsValue === undefined) ? null :
                                databaseUtils.fromSerializationToElementType(jsonType, jsValue, true);
                    } else {
                        value = reqData.getData(0, dbKey);
                        // mainly to convert datetime and time values...
                        value = databaseUtils.fromOdkDataInterfaceToElementType(jsonType, value, true);
                    }
                    updates[dbKey] = { elementPath: elementPath, value: value };
                }
            }
        }

        // if the pendingChanges are reflected in the updates[].value, then remove them
        var pendingChangeEntry, currentEntry;
        var keysToRemove = [];
        for (dbKey in that.pendingChanges ) {
            if ( that.pendingChanges.hasOwnProperty(dbKey) ) {
                jsonType = model.dataTableModel[dbKey];
                currentEntry = updates[dbKey];
                pendingChangeEntry = that.pendingChanges[dbKey];
                if ( currentEntry !== undefined && currentEntry !== null &&
                     pendingChangeEntry !== undefined && pendingChangeEntry !== null ) {
                    // the value in the values array may not be the correct data type -- force it to be converted
                    value = pendingChangeEntry.value;
                    value = databaseUtils.toOdkDataInterfaceFromElementType(jsonType, value, true);
                    value = databaseUtils.fromOdkDataInterfaceToElementType(jsonType, value, true);
                    if ( JSON.stringify(currentEntry.value) === JSON.stringify(value) ) {
                        keysToRemove.push(dbKey);
                    }
                }
            }
        }

        // do the removal outside the loop so that the for() iterator cannot be affected.
        while ( keysToRemove.length > 0 ) {
            dbKey = keysToRemove.shift();
            delete that.pendingChanges[dbKey];
        }

        // reconstruct the data and instanceMetadata fields.
        model.data = {};
        model.instanceMetadata = {};
        databaseUtils.reconstructModelDataFromElementPathValueUpdates(model, updates);

        that._applyPendingChangesToModelData(model, updates._id.value, true);
    },
    /**
     * accumulatedChanges[retentionColumn] = {"elementPath" : elementPath, "value": ???};
     *
     */
    _initializeInstanceWithPendingChanges:function(ctxt, model, formId, instanceId, accumulatedChanges ) {
        var that = this;

        var simpleMap = that._createSimpleMapPendingChanges(model.dataTableModel, accumulatedChanges, formId);
        odkData.addCheckpoint(model.table_id, simpleMap, instanceId,
            function(reqData) {
                that._reconstructModelData(model, reqData);
                if (reqData.getCount() !== 1) {
                    ctxt.failure({message: "unable to save pending changes!"});
                } else {
                    ctxt.success();
                }
            },
            function(errorMsg) {
                that._process_odkData_error(ctxt, errorMsg);
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

            var jsonType;
            var elementPath;
            var value;
            var accumulatedChanges = {};
            // NOTE: setModelDataValueDeferredChange will not accept any data table changes if instanceId is null or undefined
            // apply the model defaults.
            for ( elementPath in model.dataTableModel ) {
                if ( model.dataTableModel.hasOwnProperty(elementPath) ) {
                    jsonType = model.dataTableModel[elementPath];
                    if ( jsonType['default'] !== undefined && jsonType['default'] !== null ) {
                        // otherwise, use the default for the session variable
                        value = jsonType['default'];
                        databaseUtils.setModelDataValueDeferredChange( model, formId, instanceId, elementPath, value, accumulatedChanges, true);
                    }
                }
            }
            // NOTE: setModelDataValueDeferredChange will not accept any data table changes if instanceId is null or undefined
            // and now apply any changes from the instanceMetadataKeyValueMap
            // NOTE: this will have been cleared at the top of the method if sameInstance is true.
            for ( elementPath in instanceMetadataKeyValueMap ) {
                if ( instanceMetadataKeyValueMap.hasOwnProperty(elementPath) ) {
                    if ( instanceMetadataKeyValueMap[elementPath] === null ) {
                        value = null;
                    } else {
                        jsonType = model.dataTableModel[elementPath];
                        value = databaseUtils.fromSerializationToElementType(jsonType, instanceMetadataKeyValueMap[elementPath], true);
                    }
                    databaseUtils.setModelDataValueDeferredChange( model, formId, instanceId, elementPath, value, accumulatedChanges, true);
                }
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
                var value;
                var accumulatedChanges = {};

                if ( reqData.getCount() > 1 ) {
                    ctxt.failure({message: "multiple rows!"});
                    return;
                } else if ( reqData.getCount() === 0 ) {
                    if ( sameInstance ) {
                        ctxt.failure({message: "row not found!"});
                        return;
                    }

                    // we are initializing the instance -- discard all pending changes
                    // since those are presumably for some other instanceId.
                    that.pendingChanges = {};

                    // apply defaults
                    for ( elementPath in model.dataTableModel ) {
                        if ( model.dataTableModel.hasOwnProperty(elementPath) ) {
                            jsonType = model.dataTableModel[elementPath];
                            if ( jsonType['default'] !== undefined && jsonType['default'] !== null ) {
                                // otherwise, use the default for the session variable
                                databaseUtils.setModelDataValueDeferredChange( model, formId, instanceId, elementPath, jsonType['default'], accumulatedChanges, true);
                            }
                        }
                    }
                    // and now apply any changes from the instanceMetadataKeyValueMap
                    // NOTE: this will have been cleared at the top of the method if sameInstance is true.
                    for ( elementPath in instanceMetadataKeyValueMap ) {
                        if ( instanceMetadataKeyValueMap.hasOwnProperty(elementPath) ) {
                            jsonType = model.dataTableModel[elementPath];
                            value = databaseUtils.fromSerializationToElementType(jsonType, instanceMetadataKeyValueMap[elementPath], true);
                            databaseUtils.setModelDataValueDeferredChange( model, formId, instanceId, elementPath, value, accumulatedChanges, true);
                        }
                    }

                    if ( $.isEmptyObject(accumulatedChanges)) {
                        ctxt.success();
                    } else {
                        // apply the accumulated changes - this will also refresh the model's data and instanceMetadata
                        that._initializeInstanceWithPendingChanges(ctxt, model, formId, instanceId, accumulatedChanges );
                    }
                    return;
                } else {
                    if ( !sameInstance ) {
                        // we are initializing the instance -- discard all pending changes
                        // since those are presumably for some other instanceId.
                        that.pendingChanges = {};
                    }

                    that._reconstructModelData(model, reqData);

                    // and now apply any changes from the instanceMetadataKeyValueMap
                    // NOTE: this will have been cleared at the top of the method if sameInstance is true.
                    for ( elementPath in instanceMetadataKeyValueMap ) {
                        if ( instanceMetadataKeyValueMap.hasOwnProperty(elementPath) ) {
                            if ( instanceMetadataKeyValueMap[elementPath] === null ) {
                                value = null;
                            } else {
                                jsonType = model.dataTableModel[elementPath];
                                value = databaseUtils.fromSerializationToElementType(jsonType, instanceMetadataKeyValueMap[elementPath], true);
                            }
                            databaseUtils.setModelDataValueDeferredChange( model, formId, instanceId, elementPath, value, accumulatedChanges, true);
                        }
                    }

                    if ( $.isEmptyObject(accumulatedChanges)) {
                        ctxt.success();
                    } else {
                        // apply the accumulated changes - this will also refresh the model's data and instanceMetadata
                        that._initializeInstanceWithPendingChanges(ctxt, model, formId, instanceId, accumulatedChanges );
                    }
                }
            },
            function(errorMsg) { 
                ctxt.failure({message: errorMsg}); 
            });
    },

    ///////////////////////////////////////////////////
    // Low-level APIs mapped to DataIf
    ///////////////////////////////////////////////////

    get_linked_instances:function(ctxt, dbTableName, selection, selectionArgs, displayElementName, orderBy) {
        var that = this;
        //
        // UserTable lt = DataIf.query( dbTableName, selection, selectionArgs, null, null, orderBy, "ASC", null, null, false, postprocessorcb
        //
        // And, on the postprocessorcb success callback:
        //
        // for ( var i = 0 ; i < result.rows.length ; i+=1 ) {
        //      var instance = result.rows.item(i);
        //      var ts = odkCommon.toDateFromOdkTimeStamp(instance._savepoint_timestamp);
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

        var ss = that._selectMostRecentFromDataTableStmt(dbTableName, selection, selectionArgs, orderBy);
        odkData.arbitraryQuery(dbTableName, ss.stmt, ss.bind, null, null,
            function(reqData) {
                var instanceList = [];
                for (var rowCntr = 0; rowCntr < reqData.getCount(); rowCntr++) {
                    var ts = odkCommon.toDateFromOdkTimeStamp(reqData.getData(rowCntr, '_savepoint_timestamp'));
                    instanceList.push({
                        display_field: (displayElementName === undefined || displayElementName === null) ?
                                            ((ts === null) ? "" : ts.toISOString()): reqData.getData(rowCntr, displayElementName),
                        instance_id: reqData.getData(rowCntr, '_id'),
                        savepoint_timestamp: ts,
                        savepoint_type: reqData.getData(rowCntr, '_savepoint_type'),
                        savepoint_creator: reqData.getData(rowCntr, '_savepoint_creator'),
                        locale: reqData.getData(rowCntr, '_locale'),
                        form_id: reqData.getData(rowCntr, '_form_id'),
                        default_access: reqData.getData(rowCntr, '_default_access'),
                        row_owner: reqData.getData(rowCntr, '_row_owner'),
                        group_read_only: reqData.getData(rowCntr, '_group_read_only'),
                        group_modify: reqData.getData(rowCntr, '_group_modify'),
                        group_privileged: reqData.getData(rowCntr, '_group_privileged'),
                        effective_access: reqData.getData(rowCntr, '_effective_access')
                    });
                }
                ctxt.log('D','get_linked_instances.inside', dbTableName + " instanceList: " + instanceList.length);
                ctxt.success(instanceList);
            }, function(errorMsg) { 
                ctxt.failure({message: errorMsg}); 
            });
    },

    save_all_changes:function(ctxt, model, formId, instanceId, asComplete) {
        var that = this;
        var simpleMap = that._createSimpleMapPendingChanges(model.dataTableModel, that.pendingChanges, formId);

        // special case -- if this is the framework, then don't interact with
        // odkData since there is no backing table.
        if ( model.table_id === "framework" ) {
            that._reconstructModelData(model, null);
            ctxt.success();
            return;
        }

        if ( asComplete ) {
            odkData.saveCheckpointAsComplete(model.table_id, simpleMap, instanceId,
                function(reqData) {
                    that._reconstructModelData(model, reqData);
                    if (reqData.getCount() !== 1) {
                        ctxt.failure({message: "unable to save pending changes!"});
                    } else {
                        ctxt.success();
                    }
                },
                function(errorMsg) { 
                    that._process_odkData_error(ctxt, errorMsg);
                });
        } else {
            odkData.saveCheckpointAsIncomplete(model.table_id, simpleMap, instanceId,
                function(reqData) {
                    that._reconstructModelData(model, reqData);
                    if (reqData.getCount() !== 1) {
                        ctxt.failure({message: "unable to save pending changes!"});
                    } else {
                        ctxt.success();
                    }
                },
                function(errorMsg) { 
                    that._process_odkData_error(ctxt, errorMsg);
                });
        }
    },

    ignore_all_changes:function(ctxt, model, formId, instanceId) {
        var that = this;
        // clear the pending changes, since we are ignoring changes
        that.pendingChanges = {};

        // special case -- if this is the framework, then don't interact with
        // odkData since there is no backing table.
        if ( model.table_id === "framework" ) {
            that._reconstructModelData(model, null);
            ctxt.success();
            return;
        }

        odkData.deleteAllCheckpoints(model.table_id, instanceId,
                function(reqData) {
                    // clear the pending changes, since we are ignoring changes
                    that.pendingChanges = {};
                    that._reconstructModelData(model, reqData);
                    ctxt.success();
                },
                function(errorMsg) {
                    that._process_odkData_error(ctxt, errorMsg);
                });
    },

    delete_checkpoints_and_row:function(ctxt, model, instanceId) {
        var that = this;
        // clear the pending changes, since we are discarding the row
        that.pendingChanges = {};
        odkData.deleteRow( model.table_id, null, instanceId,
                            function(reqData) {
                                // clear the pending changes, since we are ignoring changes
                                that.pendingChanges = {};
                                that._reconstructModelData(model, reqData);
                                if (reqData.getCount() !== 0 && reqData.getData(0,'_sync_state') !== 'deleted' ) {
                                    ctxt.failure({message: "unable to delete row!"});
                                } else {
                                    ctxt.success();
                                }
                            },
                            function(errorMsg) {
                                that._process_odkData_error(ctxt, errorMsg);
                            });

    },

    // almost primitive...
    get_all_data:function(ctxt, model, instanceId) {
        var that = this;
        odkData.getMostRecentRow(model.table_id, instanceId,
            function(reqData) {
                that._reconstructModelData(model, reqData);
                if ( reqData.getCount() != 1 ) {
                    ctxt.failure({message: "no row or multiple rows!"});
                } else {
                    ctxt.success();
                }
            },
            function(errorMsg) { 
                ctxt.failure({message: errorMsg}); 
            });
    },

    _auth_error: "org.opendatakit.exception.ActionNotAuthorizedException:",
    _impl_class_qualifier: " ODKDatabaseImplUtils:",
    
    _process_odkData_error: function(ctxt, errorMsg) {
        var that = this;
        
        if ( errorMsg.startsWith(that._auth_error) ) {
            // we cannot make the changes because of an Authorization violation. Clear them!
            that.pendingChanges = {};
        }

        var exception = null;
        var idxColon = errorMsg.indexOf(':');
        if ( idxColon !== -1 ) {
            exception = errorMsg.substring(0,idxColon);
            errorMsg = errorMsg.substring(idxColon+2);
            var idxUtils = errorMsg.indexOf(that._impl_class_qualifier);
            if ( idxUtils !== -1 ) {
                errorMsg = errorMsg.substring(0, idxUtils) + errorMsg.substring(idxUtils + that._impl_class_qualifier.length);
            }
        }
        
        ctxt.failure({message: errorMsg, exception: exception, rolledBack: true});
    },
    
    /**
     * Not expected to be called expect internally
     *
     * changeMap[retentionColumn] = {"elementPath" : elementPath, "value": ???};
     */
    _add_checkpoint: function(ctxt, model, formId, instanceId, changeMap) {
        var that = this;
        var simpleMap = that._createSimpleMapPendingChanges(model.dataTableModel, changeMap, formId);
        odkData.addCheckpoint(model.table_id, simpleMap, instanceId,
            function(reqData) {
                that._reconstructModelData(model, reqData);
                if ( reqData.getCount() != 1 ) {
                    ctxt.failure({message: "no row or multiple rows!"});
                } else {
                    ctxt.success();
                }
            },
            function(errorMsg) {
                that._process_odkData_error(ctxt, errorMsg);
            });
    },

    /**
     * Implement pending changes at this layer
     */
    pendingChanges: {},

    /**
     * used by odkData interface to pass the simple columnNameValueMap of fields to change
     *
     * accumulatedChanges[retentionColumn] = {"elementPath" : elementPath, "value": ???};
     */
    _createSimpleMapPendingChanges:function(dataTableModel, accumulatedChanges, formId) {
        var that = this;
        var simpleMap = {};
        var key;
        var jsonType;
        for ( key in accumulatedChanges ) {
            if ( accumulatedChanges.hasOwnProperty(key) ) {
              jsonType = dataTableModel[key];
              simpleMap[key] = databaseUtils.toOdkDataInterfaceFromElementType(jsonType, accumulatedChanges[key].value, true);
            }
        }
        // metadata fields other than formId and creator are managed in the service layer.
        // TODO: should current user also be enforced here??
        simpleMap._form_id = formId;
        simpleMap._savepoint_creator = odkCommon.getActiveUser();
        return simpleMap;
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
        databaseUtils.setModelDataValueDeferredChange( model, formId, instanceId, name, value, that.pendingChanges, false );

        that._applyPendingChangesToModelData(model, instanceId, false);
    },

    /**
     * Requires opendatakit.getCurrentModel()
     *
     * updates the database with any accumulated changes in the
     * this.pendingChanges object and resets that object.
     */
    applyDeferredChanges:function(ctxt) {
        var that = this;
        var formId = opendatakit.getSettingValue('form_id');
        var model = opendatakit.getCurrentModel();
        if ( model.table_id === null || model.table_id === undefined || model.table_id === 'framework' ) {
            // clear pendingChanges -- there is no table to update
            that.pendingChanges = {};
            ctxt.success();
            return;
        }
        var instanceId = opendatakit.getCurrentInstanceId();
        if ( instanceId === null || instanceId === undefined ) {
            // clear pendingChanges -- there is no row to update
            that.pendingChanges = {};
            ctxt.success();
            return;
        }
        if ( $.isEmptyObject(that.pendingChanges) ) {
            ctxt.success();
            return;
        }
        
        that._add_checkpoint($.extend({}, ctxt, {
                failure:function(m) {
                    // a failure happened during writing -- reload state from db
                    that.get_all_data($.extend({},ctxt,{success:function() {
                            ctxt.failure(m);
                        }, failure:function(m2) {
                            ctxt.failure(m);
                        }}), model, instanceId);
                }
            }), model, formId, instanceId, that.pendingChanges );
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

        for ( f in model.dataTableModel ) {
          if ( model.dataTableModel.hasOwnProperty(f) ) {
            defn = model.dataTableModel[f];
            if (  defn.elementSet === 'instanceMetadata' &&
                  ( (defn.elementPath === name) ||
                   ((defn.elementPath === undefined || defn.elementPath === null) && (f === name)) ) ) {
              dbColumnName = f;
              break;
            }
          }
        }
        if ( dbColumnName === undefined || dbColumnName === null ) {
          ctxt.log('E','setInstanceMetaData: Unrecognized instance metadata name: ' + name);
          ctxt.failure({message:"Unrecognized instance metadata"});
          return;
        }

        // the elementPath and elementKey (dbColumnName) are the same for all instance metadata.
        that.pendingChanges[dbColumnName] = {elementPath: dbColumnName, value: value, isInstanceMetadata: true };

        // flush this and any pending changes too...
        that._add_checkpoint($.extend({}, ctxt, {
                failure:function(m) {
                    // a failure happened during writing -- reload state from db
                    that.get_all_data($.extend({},ctxt,{success:function() {
                            ctxt.failure(m);
                        }, failure:function(m2) {
                            ctxt.failure(m);
                        }}), model, instanceId);
                }
            }), model, formId, instanceId, that.pendingChanges );
    },

    initializeTables:function(ctxt, formDef, table_id, formPath) {
        var that = this;
        var rectxt = $.extend({}, ctxt, {success:function(tlo) {
            ctxt.log('D','initializeTables.readTableDefinition.success');
            // overwrite the existing model with this one
            var model = opendatakit.getCurrentModel();
            model.formDef = tlo.formDef;
            model.resultObject = tlo.resultObject;
            model.dataTableModel = tlo.dataTableModel;
            model.metadata = tlo.metadata;
            model.instanceMetadata = tlo.instanceMetadata;
            model.data = tlo.data;
            // clear pendingChanges
            // we are switching to a different table, so
            // any queued up pending changes must be for
            // some other table.
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
    },
    /**
     * get the contents of the active data table row for a given table
     * for related forms (with filters).
     *
     * NOTE: If the last update's _sync_state is 'deleted', then we do not return anything.
     *
     * dbTableName
     * selection  e.g., 'name=? and age=?'
     * selectionArgs e.g., ['Tom',33]
     * orderBy  e.g., 'name asc, age desc'
     *
     * Requires: no globals
     */
    _selectMostRecentFromDataTableStmt:function(dbTableName, selection, selectionArgs, orderBy) {
        var that = this;
        var args = ['deleted'];
        if ( selection === null || selection === undefined ) {
            return {
                    stmt : 'select * from "' + dbTableName + '" as T where (T._sync_state is null or T._sync_state != ?) and ' +
                        'T._savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + dbTableName +
                               '" as V where V._id=T._id)' +
                            ((orderBy === undefined || orderBy === null) ? '' : ' order by ' + orderBy),
                    bind : args
                };
        } else {
            if (selectionArgs !== null && selectionArgs !== undefined ) {
                args = args.concat(selectionArgs);
            }
            return {
                    stmt :  'select * from (select * from "' + dbTableName + '" as T where (T._sync_state is null or T._sync_state != ?) and ' +
                        'T._savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + dbTableName +
                            '" as V where V._id=T._id)) where ' + selection +
                            ((orderBy === undefined || orderBy === null) ? '' : ' order by ' + orderBy),
                    bind : args
                };
        }
    }
};
});
