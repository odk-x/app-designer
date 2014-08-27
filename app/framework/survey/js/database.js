'use strict';
// TODO: Instance level: locale (used), at Table level: locales (available), formPath, 
define(['mdl','opendatakit','databaseUtils','databaseSchema','jquery'], function(mdl,opendatakit,databaseUtils,databaseSchema,$) {
verifyLoad('database',
    ['mdl','opendatakit','databaseUtils','databaseSchema','jquery'],
    [mdl,opendatakit,databaseUtils,databaseSchema,$]);
return {
  pendingChanges: [],
  withDb:function(ctxt, transactionBody) {
    var inContinuation = false;
    ctxt.log('D','database.withDb');
    ctxt.sqlStatement = null;
    var that = this;
    try {
        if ( dbif.w3cSqlIsOpen() ) {
            dbif.w3cSqlTransaction(transactionBody, function(error) {
                    if ( ctxt.sqlStatement != null ) {
                        ctxt.log('E',"withDb.transaction.error.sqlStmt", ctxt.sqlStatement.stmt);
                        ctxt.log('E',"withDb.transaction.error.sqlBinds", ctxt.sqlStatement.bind);
                    }
                    ctxt.log('E',"withDb.transaction.error", error.message);
                    ctxt.log('E',"withDb.transaction.error.transactionBody", transactionBody.toString());
                    inContinuation = true;
                    ctxt.failure({message: "Error while accessing or saving values to the database."});
                    }, function() {
                        ctxt.log('D',"withDb.transaction.success");
                        inContinuation = true;
                        ctxt.success();
                    });
        } else if(dbif.w3cSqlIsUnsupported() ) {
            ctxt.log('E','database.withDb.notSupported w3c SQL interface is not supported');
            inContinuation = true;
            ctxt.failure({message: "Web client does not support the W3C SQL database standard."});
        } else {
            var settings = opendatakit.getDatabaseSettings();
            dbif.w3cSqlOpenAndInitializeDatabase(
                settings.shortName, settings.version, settings.displayName, settings.maxSize,
                // initialize the database...
                function(transaction) {
                    var td;
                    td = databaseSchema.createTableStmt('_column_definitions', 
                                                databaseSchema.columnDefinitionsPredefinedColumns,
                                                databaseSchema.columnDefinitionsTableConstraint );
                    ctxt.sqlStatement = td;
                    transaction.executeSql(td.stmt, td.bind);
                    td = databaseSchema.createTableStmt('_key_value_store_active', 
                                                databaseSchema.keyValueStoreActivePredefinedColumns,
                                                databaseSchema.keyValueStoreActiveTableConstraint );
                    ctxt.sqlStatement = td;
                    transaction.executeSql(td.stmt, td.bind);
                    td = databaseSchema.createTableStmt('_table_definitions', 
                                                databaseSchema.tableDefinitionsPredefinedColumns);
                    ctxt.sqlStatement = td;
                    transaction.executeSql(td.stmt, td.bind);
                    ctxt.sqlStatement = null;
                }, 
                // transaction to invoke...
                transactionBody,
                function(error) {
                    if ( ctxt.sqlStatement != null ) {
                        ctxt.log('E',"withDb.createDb.transaction.error.sqlStmt", ctxt.sqlStatement.stmt);
                        ctxt.log('E',"withDb.createDb.transaction.error.sqlBinds", ctxt.sqlStatement.bind);
                    }
                    ctxt.log('E',"withDb.createDb.transaction.error", error.message);
                    ctxt.log('E',"withDb.createDb.transaction.error.transactionBody", "initializing database tables");
                    inContinuation = true;
                    ctxt.failure({message: "Error while initializing database tables."});
                }, function() {
                    ctxt.log('D',"withDb.afterCreateDb.transaction.success");
                    inContinuation = true;
                    ctxt.success();
                });
        }
    } catch(e) {
        dbif.w3cSqlCloseDatabase();
        // Error handling code goes here.
        if ( ctxt.sqlStatement != null ) {
            ctxt.log('E',"withDb.exception.sqlStmt", ctxt.sqlStatement.stmt);
        }
        if(e.INVALID_STATE_ERR) {
            // Version number mismatch.
            ctxt.log('E','withDb.exception', 'invalid database version');
        } else {
            ctxt.log('E','withDb.exception', 'unknown error: ' + e.message + " e: " + String(e));
        }
        if ( !inContinuation ) {
            try {
                ctxt.failure({message: "Exception while accessing or saving values to the database."});
            } catch(e) {
                ctxt.log('E','withDb.ctxt.failure.exception caught while executing ctxt.failure(msg)', 'unknown error: ' + e.message + " e: " + String(e));
                alert('Fatal error while accessing or saving values to database');
            }
        } else {
            ctxt.log('E',"withDb: Unrecoverable Internal Error: Exception during success/failure continuation");
            alert('Fatal error while accessing or saving values to database');
        }
        return;
    }
},
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//   ACTIONS on DATA
//   ACTIONS on DATA
//   ACTIONS on DATA
//   ACTIONS on DATA
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
putInstanceMetaData:function(ctxt, name, value) {
      var that = this;
      var dbColumnName;
      var f;
      ctxt.log('D','putInstanceMetaData', 'name: ' + name);
      for ( f in databaseSchema.dataTablePredefinedColumns ) {
        var defn = databaseSchema.dataTablePredefinedColumns[f];
        if (  defn.elementSet === 'instanceMetadata' &&
              ( defn.elementPath === name ||
                (defn.elementPath ===undefined || defn.elementPath === null && f === name) ) ) {
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

      that.putDataKeyValueMap(ctxt, changes );
},
/**
 * kvMap is: { 'keyname' : {value: 'val', isInstanceMetadata: false }, ... }
 *
 * Requires: mdl to be initialized -- e.g., mdl.tableMetadata, mdl.dataTableModel
 */
putDataKeyValueMap:function(ctxt, kvMap) {
    if ($.isEmptyObject(kvMap)) {
        ctxt.success();
    } else {
          var that = this;
          var property;
          var names = '';
          for ( property in kvMap ) {
            names += "," + property;
          }
          names = names.substring(1);
          ctxt.log('D','database.putDataKeyValueMap.initiated', names );

          var updates = {};
          var tmpctxt = $.extend({}, ctxt, {success:function() {
                    ctxt.log('D','database.putDataKeyValueMap.updatingCache');
                    databaseUtils.reconstructModelDataFromElementPathValueUpdates(mdl, updates);
                    ctxt.success();
                }});

          that.withDb( tmpctxt, function(transaction) {
                var formId = opendatakit.getSettingValue('form_id');
                var is = databaseSchema.insertKeyValueMapDataTableStmt(mdl.tableMetadata.dbTableName, mdl.dataTableModel, formId, opendatakit.getCurrentInstanceId(), kvMap);
                transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
                    updates = is.updates;
                    tmpctxt.log('D',"putDataKeyValueMap.success", names);
                });
            });
    }
},
/*
 * Used by csv loader to load data directly in from a csv file that is assumed
 * to have exactly the right data columns for this formId.
 * kvMap is: { 'keyname' : {value: 'val', isInstanceMetadata: false }, ... }
 *
 * Requires: mdl to be initialized -- e.g., mdl.tableMetadata, mdl.dataTableModel
 */
loadDataKeyValueMap:function(ctxt, kvMap) {
    if ($.isEmptyObject(kvMap)) {
        ctxt.success();
    } else {
          var that = this;
          var property;
          var names = '';
          for ( property in kvMap ) {
            names += "," + property;
          }
          names = names.substring(1);
          ctxt.log('D','database.loadDataKeyValueMap.initiated', names );

          var updates = {};
          var tmpctxt = $.extend({}, ctxt, {success:function() {
                    ctxt.log('D','database.loadDataKeyValueMap.updatingCache');
                    ctxt.success();
                }});

          var instanceIdEntry = kvMap._id;
          delete kvMap._id;
          var instanceId = instanceIdEntry.value;
          
          that.withDb( tmpctxt, function(transaction) {
                var formId = opendatakit.getSettingValue('form_id');
                var is = databaseSchema.insertKeyValueMapDataTableStmt(mdl.tableMetadata.dbTableName, mdl.dataTableModel, formId, instanceId, kvMap);
                transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
                    updates = is.updates;
                    tmpctxt.log('D',"loadDataKeyValueMap.success", names);
                });
            });
    }
},
getAllData:function(ctxt, mdl, instanceId) {
      var that = this;
      mdl.data = {};
      mdl.metadata = {};
      mdl.loaded = false;
      ctxt.log('D','getAllData');
      if ( instanceId === undefined || instanceId === null ) {
        ctxt.log('D',"getAllData.instanceId.null");
        mdl.loaded = true;
        ctxt.success();
        return;
      }
      that.withDb( ctxt, function(transaction) {
        var ss = databaseSchema.selectAllFromDataTableStmt(mdl.tableMetadata.dbTableName, instanceId);
        ctxt.sqlStatement = ss;
        transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
            var len = result.rows.length;
            if (len === 0 ) {
                throw new Error("no record for getAllData!");
            } else if (len !== 1 ) {
                throw new Error("not exactly one record in getAllData!");
            } else {
                var row = result.rows.item(0);
                var dbKey, dbValue, jsonType;
                var elementPath;
                
                var updates = {};
                // and then just snarf the fields...
                for ( dbKey in mdl.dataTableModel ) {
                    jsonType = mdl.dataTableModel[dbKey];
                    if ( databaseUtils.isUnitOfRetention(jsonType) ) {
                        elementPath = jsonType.elementPath;
                        if ( jsonType.isSessionVariable ) {
                            var jsValue = shim.getSessionVariable(opendatakit.getRefId(), elementPath );
                            dbValue = (jsValue === null || jsValue === undefined) ? null : JSON.parse(jsValue);
                        } else {
                            dbValue = row[dbKey];
                        }
                        updates[dbKey] = { elementPath: elementPath, value: dbValue };
                    }
                }
    
                databaseUtils.reconstructModelDataFromElementPathValueUpdates(mdl, updates);
                mdl.loaded = true;
            }
        });
      });
},
cacheAllData:function(ctxt, instanceId) {
    var that = this;
    if (mdl.loaded) {
        ctxt.success();
    } else {
        this.getAllData(ctxt, mdl, instanceId);
    }
},
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//   ACTIONS on METADATA
//   ACTIONS on METADATA
//   ACTIONS on METADATA
//   ACTIONS on METADATA
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
_coreGetAllTableMetadata:function(transaction, ctxt, tlo) {
    var that = this;
    var outcome = true;
    var ss;
    ss = databaseSchema.selectTableDefinitionsDataStmt(tlo.table_id);
    ctxt.sqlStatement = ss;
    transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
        var len = result.rows.length;
        var f;
        var row;
        var defn;
        if ( len !== 1 ) {
            throw new Error("Internal error: unknown table_id");
        }
        row = result.rows.item(0);
        for ( f in databaseSchema.tableDefinitionsPredefinedColumns ) {
            defn = databaseSchema.tableDefinitionsPredefinedColumns[f];
            if ( defn.elementPath ) {
                databaseUtils.reconstructElementPath(defn.elementPath, defn, row[f], tlo.tableMetadata );
            }
        }
        ss = databaseSchema.selectAllTableMetaDataStmt(tlo.table_id);
        ctxt.sqlStatement = ss;
        transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
            var len = result.rows.length;
            var defn;
            for (var i = 0 ; i < len ; ++i ) {
                var row = result.rows.item(i);
                var dbKey = row['key'];
                var dbValue = row['value'];
                var dbType = row['type'];
                defn = databaseSchema.getAccessibleTableKeyDefinition(dbKey);
                if ( defn != null ) {
                    databaseUtils.reconstructElementPath(defn.elementPath, defn, dbValue, tlo.tableMetadata );
                }
            }
            // read all column definitions...
            ss = databaseSchema.selectColumnDefinitionsDataStmt(tlo.table_id);
            ctxt.sqlStatement = ss;
            transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
                var len = result.rows.length;
                var i, row;
                var f;
                var defn;
                var colDefn;
                tlo.columnMetadata = {};
                for ( i = 0 ; i < len ; ++i ) {
                    row = result.rows.item(i);
                    colDefn = {};
                    for ( f in databaseSchema.columnDefinitionsPredefinedColumns ) {
                        defn = databaseSchema.columnDefinitionsPredefinedColumns[f];
                        if ( defn.elementPath ) {
                            databaseUtils.reconstructElementPath(defn.elementPath, defn, row[f], colDefn );
                        }
                    }
                    tlo.columnMetadata[defn.elementKey] = defn;
                }
                
                ss = databaseSchema.selectAllColumnMetaDataStmt(tlo.table_id);
                ctxt.sqlStatement = ss;
                transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
                    var len = result.rows.length;
                    var defn;
                    for (var i = 0 ; i < len ; ++i ) {
                        var row = result.rows.item(i);
                        var elementKey = row['_element_key'];
                        var dbKey = row['_key'];
                        var dbValue = row['_value'];
                        var dbType = row['_type'];
                        defn = databaseSchema.getAccessibleColumnKeyDefinition(dbKey);
                        if ( defn != null ) {
                            databaseUtils.reconstructElementPath(defn.elementPath, defn, dbValue, tlo.columnMetadata[elementKey] );
                        }
                    }
                });
            });
        });
    });
},
save_all_changes:function(ctxt, asComplete) {
      var that = this;
    // TODO: if called from Java, ensure that all data on the current page is saved...
      ctxt.log('D','save_all_changes');
      var tmpctxt = $.extend({}, ctxt, {success:function() {
                ctxt.log('I','save_all_changes.markCurrentStateSaved.success', 
                opendatakit.getSettingValue('form_id') + " instanceId: " + opendatakit.getCurrentInstanceId() + " asComplete: " + asComplete);
                ctxt.success();
            }});
      that.withDb( tmpctxt, 
            function(transaction) {
                var formId = opendatakit.getSettingValue('form_id');
                var kvMap = {};
                kvMap['_savepoint_type'] = {value: (asComplete ? 'COMPLETE' : 'INCOMPLETE'), isInstanceMetadata: true };
                var is = databaseSchema.insertKeyValueMapDataTableStmt(mdl.tableMetadata.dbTableName, mdl.dataTableModel, formId, opendatakit.getCurrentInstanceId(), kvMap);
                tmpctxt.sqlStatement = is;
                transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
                    ctxt.log('D','save_all_changes.cleanup');
                    // and now delete the change history...
                    var cs = databaseSchema.deletePriorChangesDataTableStmt(mdl.tableMetadata.dbTableName, opendatakit.getCurrentInstanceId());
                    tmpctxt.sqlStatement = cs;
                    transaction.executeSql(cs.stmt, cs.bind);
                });
            }
        );
},
ignore_all_changes:function(ctxt) {
      var that = this;
      ctxt.log('I','database.ignore_all_changes');
      that.withDb( ctxt, function(transaction) {
            var cs = databaseSchema.deleteUnsavedChangesDataTableStmt(mdl.tableMetadata.dbTableName, opendatakit.getCurrentInstanceId());
            ctxt.sqlStatement = cs;
            transaction.executeSql(cs.stmt, cs.bind);
            mdl.loaded = false;
        });
},
_common_delete_linked_instance_all:function(ctxt, dbTableName, fnname, instanceId) {
      var that = this;
      ctxt.log('I',fnname);
      that.withDb( ctxt, function(transaction) {
            // delete unsaved revisions
            var cs = databaseSchema.deleteUnsavedChangesDataTableStmt(dbTableName, instanceId);
            ctxt.sqlStatement = cs;
            transaction.executeSql(cs.stmt, cs.bind, function(transaction, result) {
                // delete the record outright if it is 'new_row'
                var cs = databaseSchema.deleteNewRowDataTableStmt(dbTableName, instanceId);
                ctxt.sqlStatement = cs;
                transaction.executeSql(cs.stmt, cs.bind, function(transaction, result) {
                    // update the record to 'deleted' if it is not 'new_row'
                    var cs = databaseSchema.deleteMarkDeletedDataTableStmt(dbTableName, instanceId);
                    ctxt.sqlStatement = cs;
                    transaction.executeSql(cs.stmt, cs.bind);
                });
            });
        });
},
delete_all:function(ctxt, instanceId) {
      var that = this;
      that._common_delete_linked_instance_all(ctxt, mdl.tableMetadata.dbTableName, 'delete_all', instanceId);
},
get_all_instances:function(ctxt, selection, selectionArgs, orderBy) {
      var that = this;
      var displayElementName = opendatakit.getSettingValue('instance_name');
      that.get_linked_instances(ctxt, mdl.tableMetadata.dbTableName, selection, selectionArgs, displayElementName, orderBy);
},
delete_linked_instance_all:function(ctxt, dbTableName, instanceId) {
      var that = this;
      that._common_delete_linked_instance_all(ctxt, dbTableName, 'delete_linked_instance_all', instanceId);
},
get_linked_instances:function(ctxt, dbTableName, selection, selectionArgs, displayElementName, orderBy) {
      var that = this;
      var instanceList = [];
      ctxt.log('D','get_linked_instances', dbTableName);
      that.withDb($.extend({},ctxt,{success: function() {
            ctxt.log('D','get_linked_instances.overallSuccess', dbTableName);
            ctxt.success(instanceList);
        }}), function(transaction) {
            var ss = databaseSchema.selectMostRecentFromDataTableStmt(dbTableName, selection, selectionArgs, orderBy);
            ctxt.sqlStatement = ss;
            ctxt.log('D','get_linked_instances.inside', dbTableName);
            transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
                for ( var i = 0 ; i < result.rows.length ; i+=1 ) {
                    var instance = result.rows.item(i);
                    var ts = opendatakit.convertNanosToDateTime(instance._savepoint_timestamp);
                    instanceList.push({
                        display_field: (displayElementName === undefined || displayElementName === null) ? ((ts == null) ? "" : ts.toISOString()): instance[displayElementName],
                        instance_id: instance._id,
                        savepoint_timestamp: ts,
                        savepoint_type: instance._savepoint_type,
                        savepoint_creator: instance._savepoint_creator,
                        locale: instance._locale,
                        form_id: instance._form_id
                    });
                }
                ctxt.log('D','get_linked_instances.inside', dbTableName + " instanceList: " + instanceList.length);
            });
        });
},
initializeInstance:function(ctxt, instanceId, instanceMetadataKeyValueMap) {
    var that = this;
    instanceMetadataKeyValueMap = instanceMetadataKeyValueMap || {};
    if ( instanceId === undefined || instanceId === null ) {
        ctxt.log('D','initializeInstance.noInstance');
        mdl.metadata = {};
        mdl.data = {};
        mdl.loaded = false;
        ctxt.success();
    } else {
        ctxt.log('D','initializeInstance.access', instanceId);
        var tmpctxt = $.extend({},ctxt,{success:function() {
                that.cacheAllData(ctxt, instanceId);
            }});
        that.withDb( tmpctxt, function(transaction) {
            var cs = databaseSchema.selectDataTableCountStmt(mdl.tableMetadata.dbTableName, instanceId);
            tmpctxt.sqlStatement = cs;
            transaction.executeSql(cs.stmt, cs.bind, function(transaction, result) {
                var count = 0;
                if ( result.rows.length === 1 ) {
                    var row = result.rows.item(0);
                    count = row['rowcount'];
                }
                var formId = opendatakit.getSettingValue('form_id');
                var kvMap = {};
                var cs;
                if ( count === undefined || count === null || count === 0) {
                    ctxt.log('D','initializeInstance.insertEmptyInstance');
                    // construct a friendly name for this new form...
                    var date = new Date();
                    var dateStr = date.toISOString();
                    var locale = opendatakit.getDefaultFormLocale(mdl.formDef);
                    kvMap._id = { value: instanceId, isInstanceMetadata: true };
                    kvMap._locale = { value: locale, isInstanceMetadata: true };
                    // overwrite these with anything that was passed in...
                    databaseUtils.processPassedInKeyValueMap(databaseSchema.dataTablePredefinedColumns, kvMap, instanceMetadataKeyValueMap);
                    
                    cs = databaseSchema.insertNewKeyValueMapDataTableStmt(mdl.tableMetadata.dbTableName, mdl.dataTableModel, formId, kvMap);
                    tmpctxt.sqlStatement = cs;
                    transaction.executeSql(cs.stmt, cs.bind);
                } else {
                    // apply changes to the instance 
                    // gather anything that was passed in...
                    databaseUtils.processPassedInKeyValueMap(databaseSchema.dataTablePredefinedColumns, kvMap, instanceMetadataKeyValueMap);
                    if ( !$.isEmptyObject(kvMap) ) {
                        cs = databaseSchema.insertKeyValueMapDataTableStmt(mdl.tableMetadata.dbTableName, mdl.dataTableModel, formId, instanceId, kvMap);
                        tmpctxt.sqlStatement = cs;
                        transaction.executeSql(cs.stmt, cs.bind);
                    }
                }
            });
        });
    }
},
initializeTables:function(ctxt, formDef, table_id, formPath) {
    var that = this;
    var rectxt = $.extend({}, ctxt, {success:function(tlo) {
        ctxt.log('D','getAllTableMetaData.success');
        // these values come from the current webpage
        // update table_id and qp
        mdl.formDef = tlo.formDef;
        mdl.dataTableModel = tlo.dataTableModel;
        mdl.tableMetadata = tlo.tableMetadata;
        mdl.columnMetadata = tlo.columnMetadata;
        mdl.data = tlo.data;
        opendatakit.setCurrentTableId(table_id);
        opendatakit.setCurrentFormPath(formPath);
        ctxt.success();
    }});
    that.readTableDefinition(rectxt, formDef, table_id, formPath);
},
/**
 * Process the formDef into a table definition.
 *
 * On success, invoke ctxt.success(tlo); where tlo is what will become the mdl
 *
 */
readTableDefinition:function(ctxt, formDef, table_id, formPath) {
    var that = this;
    var tlo = {data: {},  // dataTable instance data values
        metadata: {}, // dataTable instance Metadata: (instanceName, locale)
        tableMetadata: {}, // _table_definitions and key_value_store_active values for ("table", "default") of: table_id, tableKey, dbTableName
        columnMetadata: {},// _column_definitions and key_value_store_active values for ("column", elementKey) of: none...
        dataTableModel: {},// inverted and extended formDef.model for representing data store
        formDef: formDef, 
        formPath: formPath, 
        instanceId: null, 
        table_id: table_id
        };
                            
    ctxt.log('D','readTableDefinition: ' + table_id);
    var tmpctxt = $.extend({},ctxt,{success:function() {
                ctxt.log('D','readTableDefinition.success: ' + table_id);
                ctxt.success(tlo);
            }});
    that.withDb(tmpctxt, function(transaction) {
                // now insert records into these tables...
                var ss = databaseSchema.selectTableDefinitionsDataStmt(table_id);
                ctxt.sqlStatement = ss;
                transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
                    var len = result.rows.length;
                    if (len === 0 ) {
                        // TODO: use something other than form_id for the dbTableName...
                        that._insertTableAndColumnProperties(transaction, tmpctxt, tlo, true);
                    } else if(len !== 1) {
                        throw new Error("getMetaData: multiple rows! " + name + " count: " + len);
                    } else {
                        // we have the table and column definitions in the database -- 
                        // assume the formPath description exactly matches and just build the metadata
                        // TODO: this does not verify that the database structure matches the
                        // structure defined by the formPath.
                        that._insertTableAndColumnProperties(transaction, tmpctxt, tlo, false);
                    }
                });
            });
},
/**
  writeDatabase = true if the database should be written. False if we are just building the metadata.
 */
_insertTableAndColumnProperties:function(transaction, ctxt, tlo, writeDatabase) {
    var that = this;
    ctxt.log('D','database._insertTableAndColumnProperties writeDatabase: ' + writeDatabase);
    var fullDef = 
        databaseSchema.updateDataTableModelAndReturnDatabaseInsertLists(tlo, opendatakit.getSectionTitle(tlo.formDef, 'survey'));

    if ( writeDatabase ) {
        // get first property in fullDef -- we use native iteration ordering to step through the properties.
        var tableToUpdate = null;
        for ( var prop in fullDef ) {
            tableToUpdate = prop;
            break;
        }
        
        var createTableCmd = databaseSchema.createTableStmt(tlo.table_id, tlo.dataTableModel);
        ctxt.sqlStatement = createTableCmd;
        transaction.executeSql(createTableCmd.stmt, createTableCmd.bind, function(transaction, result) {
            that.fullDefHelper(transaction, ctxt, tableToUpdate, 0, fullDef, tlo);
        });
    } else {
        // we don't need to write the database -- just update everything
        that._coreGetAllTableMetadata(transaction, ctxt, tlo);
    }
},
fullDefHelper:function(transaction, ctxt, tableToUpdate, idx, fullDef, tlo) {
    var that = this;
    var row = null;
    
    for (;;) {
        if ( fullDef[tableToUpdate].length > idx ) {
            row = fullDef[tableToUpdate][idx];
        }
    
        if ( row != null ) {
            break;
        }

        // find the next table to insert records into...
        var old = tableToUpdate;
        tableToUpdate = null;
        var found = false;
        for ( var prop in fullDef ) {
            if ( prop === old ) {
                found = true; // get the table after this...
            } else if ( found ) {
                tableToUpdate = prop;
                break;
            }
        }
        
        if ( tableToUpdate === undefined || tableToUpdate === null ) {
            // end of the array -- we are done!
            that._coreGetAllTableMetadata(transaction, ctxt, tlo);
            return;
        }

        // reset to the start of the insert array
        idx = 0;
    }
    
    // assemble insert statement...
    var insertStart = 'REPLACE INTO ' + tableToUpdate + ' (';
    var insertMiddle = ') VALUES (';
    var bindArray = [];
    for ( var col in row ) {
        insertStart += col + ',';
        bindArray.push(row[col]);
        insertMiddle += '?,';
    }
    var insertCmd = insertStart.substr(0,insertStart.length-1) + insertMiddle.substr(0,insertMiddle.length-1) + ');';
    ctxt.sqlStatement = { stmt: insertCmd, bind: bindArray };
        
    transaction.executeSql(insertCmd, bindArray, function(transaction, result) {
        that.fullDefHelper(transaction, ctxt, tableToUpdate, idx+1, fullDef, tlo);
    });
},
getDataValue:function(name) {
    var that = this;
    return databaseUtils.getElementPathValue(mdl.data, name);
},
getInstanceMetaDataValue:function(name) {
    var that = this;
    return databaseUtils.getElementPathValue(mdl.metadata, name);
},
setInstanceMetaData:function(ctxt, name, value) {
    ctxt.log('I','setInstanceMetaData: ' + name);
    var that = this;
    that.putInstanceMetaData($.extend({}, ctxt, {success: function() {
                that.cacheAllData(ctxt, opendatakit.getCurrentInstanceId());
            }}), name, value);
},
// TODO: table metadata is under mdl.tableMetadata
// TODO: column metadata is under mdl.columnMetadata
getTableMetaDataValue:function(name) {
    var that = this;
    return databaseUtils.getElementPathValue(mdl.tableMetadata, name);
},
getAllDataValues:function() {
    return mdl.data;
},
purge:function(ctxt) {
    var that = this;
    ctxt.log('I','database.purge.initiated');
    var tableSets = [];
    that.withDb( $.extend({},ctxt,{success:function() {
            // OK we have tableSets[] constructed.
            // Now drop all those tables and delete contents from metadata tables
            that.withDb( ctxt, function(transaction) {
                var i, sql, tableEntry;
                for ( i = 0 ; i < tableSets.length ; ++i ) {
                    tableEntry = tableSets[i];
                    sql = databaseSchema.dropTableStmt(tableEntry.dbTableName);
                    ctxt.sqlStatement = sql;
                    transaction.executeSql(sql.stmt, sql.bind);
                }
                sql = databaseSchema.deleteEntireTableContentsTableStmt('key_value_store_active');
                ctxt.sqlStatement = sql;
                transaction.executeSql(sql.stmt, sql.bind);
                
                sql = databaseSchema.deleteEntireTableContentsTableStmt('_column_definitions');
                ctxt.sqlStatement = sql;
                transaction.executeSql(sql.stmt, sql.bind);

                sql = databaseSchema.deleteEntireTableContentsTableStmt('_table_definitions');
                ctxt.sqlStatement = sql;
                transaction.executeSql(sql.stmt, sql.bind);
            });
        }}), function(transaction) {
        var is = databaseSchema.selectAllTableDbNamesAndIdsDataStmt();
        ctxt.sqlStatement = is;
        transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
            var len = result.rows.length;
            var i, row, tableEntry;
            for ( i = 0 ; i < len ; ++i ) {
                row = result.rows.item(i);
                tableEntry = { dbTableName: row['_db_table_name'], table_id: row['_table_id'] };
                tableSets.push(tableEntry);
            }
        });
    });
},
setValueDeferredChange: function( name, value ) {
    var that = this;
    var justChange = {};
    justChange[name] = {value: value, isInstanceMetadata: false };
    that.pendingChanges[name] = {value: value, isInstanceMetadata: false };
    var formId = opendatakit.getSettingValue('form_id');
    // apply the change immediately...
    var is = databaseSchema.insertKeyValueMapDataTableStmt(mdl.tableMetadata.dbTableName, 
                    mdl.dataTableModel, formId, opendatakit.getCurrentInstanceId(), justChange);
    
    databaseUtils.reconstructModelDataFromElementPathValueUpdates(mdl, is.updates);
},
applyDeferredChanges: function(ctxt) {
    var that = this;
    var changes = that.pendingChanges;
    that.pendingChanges = {};
    that.putDataKeyValueMap($.extend({},ctxt,{failure:function(m) {
        // a failure happened during writing -- reload state from db
        mdl.loaded = false;
        that.cacheAllData($.extend({},ctxt,{success:function() {
                ctxt.failure(m);
            }, failure:function(m2) {
                ctxt.failure(m);
            }}), opendatakit.getCurrentInstanceId());
        }}), changes );
},
convertSelectionString: function(linkedMdl, selection) {
    return databaseUtils.convertSelectionString(linkedMdl, selection);
},
convertOrderByString: function(linkedMdl, order_by) {
    return databaseUtils.convertOrderByString(linkedMdl, order_by);
}
};
});
