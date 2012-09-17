'use strict';
// depends upon: opendatakit 
define(['mdl','opendatakit'], function(mdl,opendatakit) {
    return {
  submissionDb:false,
  mdl:mdl,
  withDb:function(continuation, failureHandler, completionAction) {
    var that = this;
    if ( failureHandler == null ) {
        failureHandler = function(error) {
            console.log("withDb: transaction aborted");
        };
    }
    try {
        console.log("withDb: " + document.domain);
        if ( that.submissionDb ) {
            that.submissionDb.transaction(continuation, failureHandler, completionAction);
        } else if(!window.openDatabase) {
            alert('not supported');
        } else {
            var settings = opendatakit.getDatabaseSettings();
            var database = openDatabase(settings.shortName, settings.version, settings.displayName, settings.maxSize);
              // create the database...
            database.transaction(function(transaction) {
                    transaction.executeSql('CREATE TABLE IF NOT EXISTS attr_values(id INTEGER NOT NULL PRIMARY KEY, timestamp INTEGER NOT NULL, form_id TEXT NOT NULL, instance_id TEXT NOT NULL, saved NULL, name TEXT NOT NULL, type TEXT NOT NULL, val TEXT NULL);', [],
                                            function(transaction, result) {
                        transaction.executeSql('CREATE TABLE IF NOT EXISTS instance_info(id INTEGER NOT NULL PRIMARY KEY, timestamp INTEGER NOT NULL, form_id TEXT NOT NULL, instance_id TEXT NOT NULL, saved NULL, name TEXT NOT NULL, type TEXT NOT NULL, val TEXT NULL);', []);
                    });
                }, failureHandler, function() {
                    // DB is created -- record the submissionDb and initiate the transaction...
                    that.submissionDb = database;
                    that.withDb(continuation, failureHandler, completionAction);
                });
        }
    } catch(e) {
        // Error handling code goes here.
        if(e.INVALID_STATE_ERR) {
            // Version number mismatch.
            alert("Invalid database version.");
        } else {
            alert("Unknown error " + e + ".");
        }
        return;
    }
},
// get the most recent value for the given name
selectStmt:function(name) {
    return {
            stmt : 'select tbl.t1 type, tbl.v1 val from (select val v1, type t1, name, timestamp from attr_values where form_id=? and instance_id=? and name=? group by name having timestamp = max(timestamp)) tbl;',
            bind : [mdl.qp.formId.value, mdl.qp.instanceId.value, name]    
        };
},
selectAllStmt:function() {
    return {
            stmt : 'select tbl.name name, tbl.t1 type, tbl.v1 val from (select val v1, type t1, name, timestamp from attr_values where form_id=? and instance_id=? group by name having timestamp = max(timestamp)) tbl;',
            bind : [mdl.qp.formId.value, mdl.qp.instanceId.value]    
        };
},
// save the given value under that name
insertStmt:function(name, type, value) {
    var now = new Date().getTime();
    if (value == null) {
        return {
            stmt : 'insert into attr_values (timestamp,form_id,instance_id,name,type,val) VALUES (?,?,?,?,?,null);',
            bind : [now, mdl.qp.formId.value, mdl.qp.instanceId.value, name, type]
        };
    } else {
        return {
            stmt : 'insert into attr_values (timestamp,form_id,instance_id,name,type,val) VALUES (?,?,?,?,?,?);',
            bind : [now, mdl.qp.formId.value, mdl.qp.instanceId.value, name, type, value]
        };
    }
},
markCurrentStateAsSavedStmt:function(status) {
    return {
        stmt : 'update attr_values set saved = case when id in ( select tbl.id_key from ( select id id_key, instance_id, name, timestamp from attr_values where form_id = ? and instance_id = ? group by instance_id, name having timestamp = max(timestamp)) tbl ) then ? else null end where form_id = ? and instance_id = ?;',
        bind : [mdl.qp.formId.value, mdl.qp.instanceId.value, status, mdl.qp.formId.value, mdl.qp.instanceId.value]
    };
},
deletePriorChangesStmt:function() {
    return {
        stmt : 'delete from attr_values where id in (select tbl.id_key from ( select id id_key, instance_id, name, timestamp from attr_values where form_id = ? and instance_id = ? group by instance_id, name having timestamp < max(timestamp)) tbl );',
        bind : [mdl.qp.formId.value, mdl.qp.instanceId.value]
    };
},
deleteUnsavedChangesStmt:function() {
    return {
        stmt : 'delete from attr_values where form_id = ? and instance_id = ? and saved is null;',
        bind : [mdl.qp.formId.value, mdl.qp.instanceId.value]
    };
},
deleteStmt:function(formid, instanceid) {
    return {
        stmt : 'delete from attr_values where form_id = ? and instance_id = ?;',
        bind : [formid, instanceid]
    };
},
// get the most recent value for the given name
selectMetaDataStmt:function(name) {
    return {
            stmt : 'select tbl.v1 val, tbl.t1 type from (select val v1, type t1, name, timestamp from instance_info where form_id=? and instance_id=? and name=? group by name having timestamp = max(timestamp)) tbl;',
            bind : [mdl.qp.formId.value, mdl.qp.instanceId.value, name]    
        };
},
selectAllMetaDataStmt:function() {
    return {
            stmt : 'select tbl.name name, tbl.t1 type, tbl.v1 val from (select val v1, type t1, name, timestamp from instance_info where form_id=? and instance_id=? group by name having timestamp = max(timestamp)) tbl;',
            bind : [mdl.qp.formId.value, mdl.qp.instanceId.value]    
        };
},
// save the given value under that name
insertMetaDataStmt:function(name, type, value) {
    var now = new Date().getTime();
    if (value == null) {
        return {
            stmt : 'insert into instance_info (timestamp,form_id,instance_id,name,type,val) VALUES (?,?,?,?,?,null);',
            bind : [now, mdl.qp.formId.value, mdl.qp.instanceId.value, name, type]
        };
    } else {
        return {
            stmt : 'insert into instance_info (timestamp,form_id,instance_id,name,type,val) VALUES (?,?,?,?,?,?);',
            bind : [now, mdl.qp.formId.value, mdl.qp.instanceId.value, name, type, value]
        };
    }
},
// get the most recent value for the given name
selectCrossTableMetaDataStmt:function(formId, instanceId, name) {
    return {
            stmt : 'select tbl.v1 val, tbl.t1 type from (select val v1, type t1, name, timestamp from instance_info where form_id=? and instance_id=? and name=? group by name having timestamp = max(timestamp)) tbl;',
            bind : [formId, instanceId, name]    
        };
},
insertCrossTableMetaDataStmt:function(formId, instanceId, name, type, value) {
    var now = new Date().getTime();
    if (value == null) {
        return {
            stmt : 'insert into instance_info (timestamp,form_id,instance_id,name,type,val) VALUES (?,?,?,?,?,null);',
            bind : [now, formId, instanceId, name, type]
        };
    } else {
        return {
            stmt : 'insert into instance_info (timestamp,form_id,instance_id,name,type,val) VALUES (?,?,?,?,?,?);',
            bind : [now, formId, instanceId, name, type, value]
        };
    }
},
getAllFormInstancesStmt:function() {
    return {
            stmt : 'select group_concat(case when name=\'instanceName\' then val else null end) instanceName, ' +
                          'group_concat(case when name=\'version\' then val else null end) version, ' + 
                          'max(timestamp) last_saved_timestamp, max(saved) saved_status, instance_id from ' + 
                      '(select form_id, instance_id, timestamp, saved, name, v1 val from ' + 
                            '(select form_id, instance_id, timestamp, saved, name, val v1 from instance_info ' + 
                                'where form_id=? group by instance_id, name having timestamp = max(timestamp))) ' + 
                     'group by instance_id order by timestamp desc;',
            bind : [mdl.qp.formId.value]
            };
},
markCurrentMetaDataStateAsSavedStmt:function(status) {
    return {
        stmt : 'update instance_info set saved = case when id in ( select tbl.id_key from ( select id id_key, instance_id, name, timestamp from instance_info where form_id = ? and instance_id = ? group by instance_id, name having timestamp = max(timestamp)) tbl ) then ? else null end where form_id = ? and instance_id = ?;',
        bind : [mdl.qp.formId.value, mdl.qp.instanceId.value, status, mdl.qp.formId.value, mdl.qp.instanceId.value]
    };
},
deletePriorMetaDataChangesStmt:function() {
    return {
        stmt : 'delete from instance_info where id in (select tbl.id_key from ( select id id_key, instance_id, name, timestamp from instance_info where form_id = ? and instance_id = ? group by instance_id, name having timestamp < max(timestamp)) tbl );',
        bind : [mdl.qp.formId.value, mdl.qp.instanceId.value]
    };
},
deleteUnsavedMetaDataChangesStmt:function() {
    return {
        stmt : 'delete from instance_info where form_id = ? and instance_id = ? and saved is null;',
        bind : [mdl.qp.formId.value, mdl.qp.instanceId.value]
    };
},
deleteMetaDataStmt:function(formid, instanceid) {
    return {
        stmt : 'delete from instance_info where form_id = ? and instance_id = ?;',
        bind : [formid, instanceid]
    };
},
getData:function(name, action) {
      var that = this;
      var dbValue;
      var dbType;
      that.withDb( function(transaction) {
        var ss = that.selectStmt(name);
        transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
            if (result.rows.length == 0 ) {
                dbValue = null;                            
            } else {
                if(result.rows.length != 1) {
                    throw new Error("getData: multiple rows! " + name + " count: " + result.rows.length);
                }
                var row = result.rows.item(0);
                dbValue = row['val'];
                dbType = row['type'];
            }
        });
      }, function(error) {
        console.log("getData: failed to get " + name);
      }, function() {
        action(dbValue,dbType);
      });
},
putData:function(name, type, value, onSuccessfulSave) {
      var that = this;
      that.withDb( function(transaction) {
            var is = that.insertStmt(name, type, value);
            transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
                console.log("putData: successful insert: " + name);
            });
        }, function(error) {
        console.log("putData: failed to put " + name + " type: " + type + " value: " + value);
      }, onSuccessfulSave );
},
putDataKeyTypeValueMapHelper:function(idx, that, ktvlist) {
    return function(transaction) {
        // base case...
        if ( idx >= ktvlist.length ) {
            console.log("putDataKeyValueMap: successful insert: " + ktvlist.length);
            return;
        }
        var key = ktvlist[idx].key;
        var type = ktvlist[idx].type;
        var value = ktvlist[idx].value; // may be null...
        var is = that.insertStmt(key, type, value);
        transaction.executeSql(is.stmt, is.bind, that.putDataKeyValueMapHelper(idx+1, that, ktvlist));
    };
},
/**
 * ktvlist is: [ { key: 'keyname', type: 'typename', value: 'val' }, ...]
 */
putDataKeyTypeValueMap:function(ktvlist, onSuccessfulSave) {
      var that = this;
      that.withDb( that.putDataKeyTypeValueMapHelper(0, that, ktvlist), function(error) {
            console.log("putDataKeyValueMap: failed transaction for " + ktvlist.length );
        }, onSuccessfulSave );
},
constructJsonDataClosureHelper:function(continuation) {
    return function(transaction, result) {
        var tlo;
        var len = result.rows.length;
        if (len == 0 ) {
            tlo = null;                            
        } else {
            tlo = {};
            for (var i = 0 ; i < len ; ++i ) {
                var row = result.rows.item(i);
                var dbKey = row['name'];
                var dbValue = row['val'];
                var dbType = row['type'];
                
                var elem = {};
                elem['type'] = dbType;
                elem['value'] = dbValue;
                
                var path = dbKey.split('.');
                var e = tlo;
                var term;
                for (var j = 0 ; j < path.length-1 ; ++j) {
                    term = path[j];
                    if ( term == null || term == "" ) {
                        throw new Error("unexpected empty string in dot-separated variable name");
                    }
                    if ( e[term] == null ) {
                        e[term] = {};
                    }
                    e = e[term];
                }
                term = path[path.length-1];
                if ( term == null || term == "" ) {
                    throw new Error("unexpected empty string in dot-separated variable name");
                }
                e[term] = elem;
            }
        }
        continuation(tlo);
    };
},
getAllData:function(action) {
      var that = this;
      var tlo;
      that.withDb( function(transaction) {
        var ss = that.selectAllStmt();
        transaction.executeSql(ss.stmt, ss.bind, that.constructJsonDataClosureHelper(function(arg) { tlo = arg;}));
      }, function(error) {
        console.log("getAllData: failed");
      }, function() {
        action(tlo);
      });
},
cacheAllData:function(action) {
    var that = this;
    this.getAllData(function(tlo) {
        mdl.data = (tlo == null) ? {} : tlo;
        action();
    });
},
getMetaData:function(name, action) {
      var that = this;
      var dbType;
      var dbValue;
      that.withDb( function(transaction) {
        var ss = that.selectMetaDataStmt(name);
        transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
            if (result.rows.length == 0 ) {
                dbValue = null;                            
            } else {
                if(result.rows.length != 1) {
                    throw new Error("getMetaData: multiple rows! " + name + " count: " + result.rows.length);
                }
                var row = result.rows.item(0);
                dbValue = row['val'];
                dbType = row['type'];
            }
        });
      }, function(error) {
        console.log("getMetaData: failed to get " + name);
      }, function() {
        action(dbValue,dbType);
      });
},
putMetaData:function(name, type, value, onSuccessfulSave) {
      var that = this;
      that.withDb( function(transaction) {
            var is = that.insertMetaDataStmt(name, type, value);
            transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
                console.log("putMetaData: successful insert: " + name);
            });
        }, function(error) {
        console.log("putMetaData: failed to put " + name + " type: " + type + " value: " + value);
      }, onSuccessfulSave );
},
putMetaDataKeyTypeValueMapHelper:function(idx, that, ktvlist) {
    return function(transaction) {
        // base case...
        if ( idx >= ktvlist.length ) {
            console.log("putMetaDataKeyValueMap: successful insert: " + ktvlist.length);
            return;
        }
        var key = ktvlist[idx].key;
        var type = ktvlist[idx].type;
        var value = ktvlist[idx].value; // may be null...
        var is = that.insertMetaDataStmt(key, type, value);
        transaction.executeSql(is.stmt, is.bind, that.putMetaDataKeyTypeValueMapHelper(idx+1, that, ktvlist));
    };
},
/**
 * ktvlist is: [ { key: 'keyname', type: 'typename', value: 'val' }, ...]
 */
putMetaDataKeyTypeValueMap:function(ktvlist, onSuccessfulSave) {
      var that = this;
      that.withDb( that.putMetaDataKeyTypeValueMapHelper(0, that, ktvlist), function(error) {
            console.log("putMetaDataKeyValueMap: failed transaction for " + ktvlist.length );
        }, onSuccessfulSave );
},
getAllMetaData:function(action) {
      var that = this;
      var tlo;
      that.withDb( function(transaction) {
        var ss = that.selectAllMetaDataStmt();
        transaction.executeSql(ss.stmt, ss.bind, that.constructJsonDataClosureHelper(function(arg) { tlo = arg;}));
      }, function(error) {
        console.log("getAllMetaData: failed");
      }, function() {
        action(tlo);
      });
},
cacheAllMetaData:function(action) {
    var that = this;
    // pull everything for synchronous read access
    that.getAllMetaData(function(tlo) {
        if ( tlo == null ) {
            tlo = {};
        }
        // these values come from the current webpage
        tlo.formId = mdl.qp.formId;
        tlo.formVersion = mdl.qp.formVersion;
        tlo.formLocale = mdl.qp.formLocale;
        tlo.formName = mdl.qp.formName;
        tlo.instanceId = mdl.qp.instanceId;
        // update qp
        mdl.qp = tlo;
        action();
    });
},
getCrossTableMetaData:function(formId, instanceId, name, action) {
      var that = this;
      var dbType;
      var dbValue;
      that.withDb( function(transaction) {
        var ss = that.selectCrossTableMetaDataStmt(formId, instanceId, name);
        transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
            if (result.rows.length == 0 ) {
                dbValue = null;                            
            } else {
                if(result.rows.length != 1) {
                    throw new Error("getCrossTableMetaData: multiple rows! " +
						formId + ", " + instanceId + ", " + name + " count: " + result.rows.length);
                }
                var row = result.rows.item(0);
                dbValue = row['val'];
                dbType = row['type'];
            }
        });
      }, function(error) {
        console.log("getCrossTableMetaData: failed to get " + formId + ", " + instanceId + ", " + name);
      }, function() {
        action(dbValue,dbType);
      });
},
putCrossTableMetaData:function(formId, instanceId, name, type, value, onSuccessfulSave) {
      var that = this;
      that.withDb( function(transaction) {
            var is = that.insertCrossTableMetaDataStmt(formId, instanceId, name, type, value);
            transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
                console.log("putCrossTableMetaData: successful insert: " + formId + ", " + instanceId + ", " + name);
            });
        }, function(error) {
        console.log("putCrossTableMetaData: failed to put " +
			formId + ", " + instanceId + ", " + name + " type: " + type + " value: " + value);
      }, onSuccessfulSave );
},
putCrossTableMetaDataKeyTypeValueMapHelper:function(formId, instanceId, idx, that, ktvlist) {
    return function(transaction) {
        // base case...
        if ( idx >= ktvlist.length ) {
            console.log("putCrossTableMetaDataKeyTypeValueMapHelper: successful insert: " + ktvlist.length);
            return;
        }
        var key = ktvlist[idx].key;
        var type = ktvlist[idx].type;
        var value = ktvlist[idx].value; // may be null...
        var is = that.insertCrossTableMetaDataStmt(formId, instanceId, key, type, value);
        transaction.executeSql(is.stmt, is.bind, that.putMetaDataKeyTypeValueMapHelper(formId, instanceId, idx+1, that, ktvlist));
    };
},
/**
 * ktvlist is: [ { key: 'keyname', type: 'typename', value: 'val' }, ...]
 */
putCrossTableMetaDataKeyTypeValueMap:function(formId, instanceId, ktvlist, onSuccessfulSave) {
      var that = this;
      that.withDb( that.putCrossTableMetaDataKeyTypeValueMapHelper(formId, instanceId, 0, that, ktvlist), function(error) {
            console.log("putCrossTableMetaDataKeyTypeValueMap: failed transaction for " + ktvlist.length );
        }, onSuccessfulSave );
},
save_all_changes:function(asComplete, continuation) {
      var that = this;
    // TODO: ensure that all data on the current page is saved...
    // TODO: update list of instances available for editing (???)...
    // TODO: for above -- where would the instance name come from???
    
      that.withDb( function(transaction) {
            var cs = that.markCurrentStateAsSavedStmt('false');
            transaction.executeSql(cs.stmt, cs.bind, function(transaction, result) {
                var cs = that.markCurrentMetaDataStateAsSavedStmt('false');
                transaction.executeSql(cs.stmt, cs.bind);
            });
        }, function(error) {
            console.log("save_all_changes: failed preliminary save");
        }, function() {
            console.log("save_all_changes: successful markCurrentStateAsSavedStmt('false'): " +
                        mdl.qp.formId.value + " instanceId: " + mdl.qp.instanceId.value);
            if ( asComplete ) {
                // TODO: traverse all elements evaluating their constraints (validating their contents)
                // TODO: show error boxes for any violated constraints...
                // ONLY if successful, then:
                  that.withDb( function(transaction) {
                        var cs = that.markCurrentStateAsSavedStmt('true');
                        transaction.executeSql(cs.stmt, cs.bind, function(transaction, result) {
                            // and now delete the change history...
                            var cs = that.deletePriorChangesStmt();
                            transaction.executeSql(cs.stmt, cs.bind, function(transaction, result) {
                                // and update the metadata too...
                                var cs = that.markCurrentMetaDataStateAsSavedStmt('true');
                                transaction.executeSql(cs.stmt, cs.bind, function(transaction, result) {
                                    var cs = that.deletePriorMetaDataChangesStmt();
                                    transaction.executeSql(cs.stmt, cs.bind);
                                });
                            });
                        });
                    }, function(error) {
                        console.log("save_all_changes: failed final save");
                    }, function() {
                        console.log("save_all_changes: successful markCurrentStateAsSavedStmt('true'): " + 
                                    mdl.qp.formId.value + " instanceId: " + mdl.qp.instanceId.value);
                        console.log("save_all_changes: successful deletePriorChangesStmt(): " + 
                                    mdl.qp.formId.value + " instanceId: " + mdl.qp.instanceId.value);
                        if ( continuation != null ) {
                            continuation();
                        }
                    });
            } else {
                if ( continuation != null ) {
                    continuation();
                }
            }
        });
    // TODO: should we have a failure callback in to ODK Collect?
},
ignore_all_changes:function(continuation) {
      var that = this;
      that.withDb( function(transaction) {
            var cs = that.deleteUnsavedChangesStmt();
            transaction.executeSql(cs.stmt, cs.bind, function(transaction, result) {
                var cs = that.deleteUnsavedMetaDataChangesStmt();
                transaction.executeSql(cs.stmt, cs.bind);
            });
        }, function(error) {
            console.log("ignore_all_changes: failed delete unsaved changes");
        }, function() {
            console.log("ignore_all_changes: successful deleteUnsavedChangesStmt: " + 
                        mdl.qp.formId.value + " instanceId: " + mdl.qp.instanceId.value);
            if ( continuation != null ) {
                continuation();
            }
        });
},
 delete_all:function(formid, instanceId, continuation) {
      var that = this;
      that.withDb( function(transaction) {
            var cs = that.deleteStmt(formid, instanceId);
            transaction.executeSql(cs.stmt, cs.bind, function(transaction, result) {
                var cs = that.deleteMetaDataStmt(formid, instanceId);
                transaction.executeSql(cs.stmt, cs.bind);
            });
        }, function(error) {
            console.log("delete_all: failed delete all");
        }, function() {
            console.log("delete_all: successful deleteStmt: " + formid + " instanceId: " + instanceId);
            if ( continuation != null ) {
                continuation();
            }
        });
},
initializeTables:function(datafields, continuation) {
    var that = this;
    var formId = mdl.qp.formId.value;
    var formVersion = mdl.qp.formVersion.value;
    
    // mdl.qp has all the query parameters loaded
    // datafields describes the data fields
    // formId and formVersion identify the table name
    that.cacheAllData(continuation);
},
getDataValue:function(name) {
    var path = name.split('.');
    var v = mdl.data;
    for ( var i = 0 ; i < path.length ; ++i ) {
        v = v[path[i]];
        if ( v == null ) return v;
    }
    return v.value;
},
setData:function(name, datatype, value, onSuccess) {
    var that = this;
    that.putData(name, datatype, value, function() {
        that.cacheAllData(onSuccess);
    });
},
getMetaDataValue:function(name) {
    var path = name.split('.');
    var v = mdl.qp;
    for ( var i = 0 ; i < path.length ; ++i ) {
        v = v[path[i]];
        if ( v == null ) return v;
    }
    return v.value;
},
setMetaData:function(name, datatype, value, onSuccess) {
    var that = this;
    that.putMetaData(name, datatype, value, function() {
        that.cacheAllMetaData(onSuccess);
    });
}
};
});