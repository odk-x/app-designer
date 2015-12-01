'use strict';
// TODO: Instance level: locale (used), at Table level: locales (available), formPath, 
define(['opendatakit','databaseImpl','databaseUtils','databaseSchema','jquery'], function(opendatakit,databaseImpl,databaseUtils,databaseSchema,$) {
verifyLoad('database',
    ['opendatakit','databaseImpl','databaseUtils','databaseSchema','jquery'],
    [opendatakit,databaseImpl,databaseUtils,databaseSchema,$]);
return {
    readTableDefinition:function(ctxt, formDef, table_id, formPath) {
        // we can accomplish this via
		//  UserTable t <= DataIf.getMostRecentRow(model.table_id, genUUID(), postprocessorcb)
		// This will fetch an empty UserTable.
        // and we then can process the results of that fetch.
        //
        databaseImpl.readTableDefinition(ctxt, formDef, table_id, formPath);
    },
    
    purge:function(ctxt) {
        // this is only valid when inside Chrome
        if (opendatakit.getPlatformInfo().container === 'Android') {
            throw new Error("purge: Should never get here!");
        }
        databaseImpl.purge(ctxt);
    },
    
    initializeInstance:function(ctxt, instanceId, instanceMetadataKeyValueMap) {
        
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
        databaseImpl.initializeInstance(ctxt, instanceId, instanceMetadataKeyValueMap);
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

        databaseImpl.get_linked_instances(ctxt, dbTableName, selection, selectionArgs, displayElementName, orderBy);
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
        databaseImpl.save_all_changes(ctxt, model, formId, instanceId, asComplete);
    },
    
    ignore_all_changes:function(ctxt, model, formId, instanceId) {
        // DataIf.deleteAllCheckpoints(model.table_id, instanceId, callbackwrapper(ctxt));
        // BUGS: ???        
        // NOTE: does not reload model (marks it as stale)
        databaseImpl.ignore_all_changes(ctxt, model, formId, instanceId);
    },
    
    delete_checkpoints_and_row:function(ctxt, dbTableName, instanceId) {
        // This is a 2-step process
        // 
        // UserTable t <= DataIf.deleteAllCheckpoints( dbTableName, instanceId);
		// if ( t.getNumberOfRows() != 0 ) {
        //   DataIf.deleteRow(dbTableName, instanceId);
		// }
        databaseImpl.delete_checkpoints_and_row(ctxt, dbTableName, instanceId);
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
        //    model.loaded = true;
        // },
        // failure(m) {
        //    ctxt.failure(m)
        // }
        
        databaseImpl.getAllData(ctxt, model, instanceId);
    },
    
    /**
     * Not expected to be called expect internally
     */
    _add_checkpoint: function(ctxt, model, formId, instanceId, kvMap) {

        // DataIf.addCheckpoint( model.table_id, transform(kvMap, formId), instanceId, callbackwrapper(ctxt))

        //
        // checkpoint API should probably have a mechanism to return the new row values
        // so that we can update the model immediately, rather than having to re-query.
        //
        // ON SUCCESS:
        //
        // updates == kvMap + any changes done within dbservice (e.g., metadata fields)
        // databaseUtils.reconstructModelDataFromElementPathValueUpdates(model, updates);
        databaseImpl.putDataKeyValueMap(ctxt, model, formId, instanceId, kvMap);
    },

    /**
     * Implement pending changes at this layer
     */  
    pendingChanges: {},
    
    /**
     * Requires opendatakit.getCurrentModel()
     *
     * updates that model and records the field changes in the 
     * this.pendingChanges
     */
    setValueDeferredChange:function( name, value ) {
        var that = this;
        var justChange = {};
        justChange[name] = {value: value, isInstanceMetadata: false };
        that.pendingChanges[name] = {value: value, isInstanceMetadata: false };
        var formId = opendatakit.getSettingValue('form_id');
        var model = opendatakit.getCurrentModel();
        var instanceId = opendatakit.getCurrentInstanceId();
        // apply the change immediately...
        var is = databaseSchema.insertKeyValueMapDataTableStmt(model.table_id, 
                        model.dataTableModel, formId, instanceId, justChange);
        
        databaseUtils.reconstructModelDataFromElementPathValueUpdates(model, is.updates);
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
        var instanceId = opendatakit.getCurrentInstanceId();
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
            model.tableMetadata = tlo.tableMetadata;
            model.columnMetadata = tlo.columnMetadata;
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
        return databaseUtils.getElementPathValue(model.metadata, name);
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