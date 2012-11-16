'use strict';
// TODO: Instance level: locale (used), at Table level: locales (available), formPath, formId, formVersion, 
// depends upon: opendatakit 
define(['mdl','opendatakit','jquery'], function(mdl,opendatakit,$) {
    return {
  submissionDb:false,
  dbTableMetadata: [ { key: '_uri_user', type: 'string', isNullable: true },
                     { key: '_last_mod_time', type: 'integer', isNullable: false, defaultValue: -1 },
                     { key: '_sync_tag', type: 'string', isNullable: true },
                     { key: '_sync_state', type: 'integer', isNullable: false, defaultValue: 0 },
                     { key: '_transactioning', type: 'integer', isNullable: false, defaultValue: 1 },
                     { key: '_timestamp', type: 'integer', isNullable: false },
                     { key: '_saved', type: 'string', isNullable: true },
                     { key: '_instance_name', type: 'string', isNullable: false },
                     { key: '_locale', type: 'string', isNullable: true } ],
  mdl:mdl,
  withDb:function(ctxt, transactionBody) {
    var inContinuation = false;
    ctxt.append('database.withDb');
	ctxt.sqlStatement = null;
    var that = this;
    try {
        if ( that.submissionDb ) {
            that.submissionDb.transaction(transactionBody, function(error,a) {
					if ( ctxt.sqlStatement != null ) {
						ctxt.append("withDb.transaction.error.sqlStmt", ctxt.sqlStatement.stmt);
					}
                    ctxt.append("withDb.transaction.error", error.message);
                    ctxt.append("withDb.transaction.error.transactionBody", transactionBody.toString());
                    inContinuation = true;
                    ctxt.failure({message: "Error while accessing or saving values to the database."});
                    }, function() {
                        ctxt.append("withDb.transaction.success");
                        inContinuation = true;
                        ctxt.success();
                    });
        } else if(!window.openDatabase) {
            ctxt.append('database.withDb.notSupported');
            alert('not supported');
            inContinuation = true;
            ctxt.failure({message: "Web client does not support the W3C SQL database standard."});
        } else {
            var settings = opendatakit.getDatabaseSettings(ctxt);
            var database = openDatabase(settings.shortName, settings.version, settings.displayName, settings.maxSize);
              // create the database...
            database.transaction(function(transaction) {
                    transaction.executeSql('CREATE TABLE IF NOT EXISTS _column_key_value_store_active('+
                                    'table_id TEXT NOT NULL,'+
                                    'element_key TEXT NOT NULL,'+
                                    'key TEXT NOT NULL,'+
                                    'type TEXT NULL,'+
                                    'value TEXT NULL'+
                                    ');', []);
                    transaction.executeSql('CREATE TABLE IF NOT EXISTS _column_definitions('+
                                    'table_id TEXT NOT NULL,'+
                                    'element_key TEXT NOT NULL,'+
                                    'element_name TEXT NOT NULL,'+
                                    'element_type TEXT NULL,'+
                                    'list_child_element_keys TEXT NULL,'+
                                    'is_persisted INTEGER NOT NULL,'+
                                    'joins TEXT NULL'+
                                    ');', []);
                    transaction.executeSql('CREATE TABLE IF NOT EXISTS _table_key_value_store_active('+
                                    'table_id TEXT NOT NULL,'+ 
                                    'key TEXT NOT NULL,'+
                                    'type TEXT NOT NULL,'+
                                    'value TEXT NOT NULL'+
                                    ');', []);
                    transaction.executeSql('CREATE TABLE IF NOT EXISTS _table_definitions('+
                                    'table_id TEXT NOT NULL,'+ 
                                    'table_key TEXT NOT NULL,'+
                                    'db_table_name TEXT NOT NULL,'+
                                    'type TEXT NOT NULL,'+
                                    'table_id_access_controls TEXT NULL,'+
                                    'sync_tag TEXT NULL,'+
                                    'last_sync_time INTEGER NOT NULL,'+
                                    'sync_state TEXT NOT NULL,'+
                                    'transactioning INTEGER NOT NULL'+
                                    ');', []);
                }, function(error) {
                    ctxt.append("withDb.createDb.transaction.error", error.message);
                    ctxt.append("withDb.transaction.error.transactionBody", "initializing database tables");
                    inContinuation = true;
                    ctxt.failure({message: "Error while initializing database tables."});
                }, function() {
                    // DB is created -- record the submissionDb and initiate the transaction...
                    that.submissionDb = database;
                    ctxt.append("withDb.createDb.transacton.success");
                    that.submissionDb.transaction(transactionBody, function(error) {
								if ( ctxt.sqlStatement != null ) {
									ctxt.append("withDb.afterCreateDb.transaction.error.sqlStmt", ctxt.sqlStatement.stmt);
								}
                                ctxt.append("withDb.afterCreateDb.transaction.error", error.message);
                                ctxt.append("withDb.afterCreateDb.transaction.error.transactionBody", transactionBody.toString());
                                inContinuation = true;
                                ctxt.failure({message: "Error while accessing or saving values to the database."});
                            }, function() {
                                ctxt.append("withDb.afterCreateDb.transaction.success");
                                inContinuation = true;
                                ctxt.success();
                            });
                });
        }
    } catch(e) {
        // Error handling code goes here.
		if ( ctxt.sqlStatement != null ) {
			ctxt.append("withDb.exception.sqlStmt", ctxt.sqlStatement.stmt);
		}
        if(e.INVALID_STATE_ERR) {
            // Version number mismatch.
            ctxt.append('withDb.exception', 'invalid db version');
            alert("Invalid database version.");
        } else {
            ctxt.append('withDb.exception', 'unknown error: ' + e);
            alert("Unknown error " + e + ".");
        }
        if ( !inContinuation ) {
            try {
                ctxt.failure({message: "Exception while accessing or saving values to the database."});
            } catch(e) {
                ctxt.append('withDb.ctxt.failure.exception', 'unknown error: ' + e);
                alert("withDb.ctxt.failure.exception " + e);
            }
        }
        return;
    }
},
// save the given value under that name
selectAllDbTableStmt:function(instanceId) {
    var t = new Date();
    var now = t.getTime();

    var tableId = opendatakit.getCurrentTableId();
    var dbTableName = mdl.dbTableName;
    var model = mdl.model;
    
    // TODO: select * ... for cross-table referencing...
    var stmt = "select _id";
    for (var j = 0 ; j < this.dbTableMetadata.length ; ++j) {
        var f = this.dbTableMetadata[j];
        stmt += ", " + f.key;
    }
    for ( var f in model ) {
        stmt += ', "' + f + '"';
    }
    stmt += ' from "' + dbTableName + '" where _id=? group by _id having _timestamp = max(_timestamp)'; 
    return {
        stmt : stmt,
        bind : [instanceId]
    };
},
// get the most recent value for the given name
selectCrossTableInstanceMetaDataStmt:function(dbTableName, instanceId, name) {
    return {
            stmt : 'select value from _table_key_value_store_active where table_id=? and key=?',
            bind : [opendatakit.getCurrentTableId(), name]    
        };
},
// save the given value under that name
insertDbTableStmt:function(name, type, value, isInstanceMetadata ) {
    var t = new Date();
    var now = t.getTime();

    var tableId = opendatakit.getCurrentTableId();
    var dbTableName = mdl.dbTableName;
    var model = mdl.model;
    
    var bindings = [];
    
    var stmt = 'insert into "' + dbTableName + '" (_id';
    for (var j = 0 ; j < this.dbTableMetadata.length ; ++j) {
        var f = this.dbTableMetadata[j];
        stmt += ", " + f.key;
    }
    for ( var f in model ) {
        stmt += ', "' + f + '"';
    }
    stmt += ") select _id";
    for (var j = 0 ; j < this.dbTableMetadata.length ; ++j) {
        var f = this.dbTableMetadata[j];
        if ( f.key == name && isInstanceMetadata ) {
            if (value == null) {
                stmt += ", null";
            } else {
                stmt += ", ?";
                bindings.push(value);
            }
        } else if ( f.key == "_last_mod_time" ) {
            stmt += ", ?";
            bindings.push(now);
        } else if ( f.key == "_timestamp" ) {
            stmt += ", ?";
            bindings.push(now);
        } else if ( f.key == "_saved" ) {
            stmt += ", null";
        } else {
            stmt += ", " + f.key;
        }
    }
    for ( var f in model ) {
        if ( f == name && !isInstanceMetadata ) {
            if (value == null) {
                stmt += ", null";
            } else {
                stmt += ", ?";
                bindings.push(value);
            }
        } else {
            stmt += ', "' + f + '"';
        }
    }
    stmt += ' from "' + dbTableName + '" where _id=? group by _id having _timestamp = max(_timestamp)'; 
    bindings.push(opendatakit.getCurrentInstanceId());
    return {
        stmt : stmt,
        bind : bindings
        };
},
getKtvmElement:function(ktvmList, name) {
    for( var j = 0 ; j < ktvmList.length ; ++j ) {
        var f = ktvmList[j];
        if ( f.key == name ) return f;
    }
    return null;
},
// save the given values under that name
// ktvmList : [ { key: blah, type: "string", value: "foo name", isInstanceMetadata: false } ...]
// able to set instance and instanceMetadata values
//
// Requires: mdl.dbTableName, mdl.model, opendatakit.getCurrentInstanceId()
//
insertKtvmListDbTableStmt:function(ktvmList) {
    var t = new Date();
    var now = t.getTime();

    var dbTableName = mdl.dbTableName;
    var model = mdl.model;
    
    var bindings = [];
    
    var stmt = 'insert into "' + dbTableName + '" (_id';
    for (var j = 0 ; j < this.dbTableMetadata.length ; ++j) {
        var f = this.dbTableMetadata[j];
        stmt += ", " + f.key;
    }
    for ( var f in model ) {
        stmt += ', "' + f + '"';
    }
    stmt += ") select _id";
    for (var j = 0 ; j < this.dbTableMetadata.length ; ++j) {
        var f = this.dbTableMetadata[j];
        var ktvmElement = this.getKtvmElement(ktvmList, f.key);
        if ( ktvmElement != null && ktvmElement.isInstanceMetadata ) {
            if (value == null) {
                stmt += ", null";
            } else {
                stmt += ", ?";
                bindings.push(value);
            }
        } else if ( f.key == "_last_mod_time" ) {
            stmt += ", ?";
            bindings.push(now);
        } else if ( f.key == "_timestamp" ) {
            stmt += ", ?";
            bindings.push(now);
        } else if ( f.key == "_saved" ) {
            stmt += ", null";
        } else {
            stmt += ", " + f.key;
        }
    }
    for ( var f in model ) {
        var ktvmElement = this.getKtvmElement(ktvmList, f);
        if ( ktvmElement != null && !ktvmElement.isInstanceMetadata ) {
            if (value == null) {
                stmt += ", null";
            } else {
                stmt += ", ?";
                bindings.push(value);
            }
        } else {
            stmt += ', "' + f + '"';
        }
    }
    stmt += ' from "' + dbTableName + '" where _id=? group by _id having _timestamp = max(_timestamp)'; 
    bindings.push(opendatakit.getCurrentInstanceId());
    return {
        stmt : stmt,
        bind : bindings
        };
},
markCurrentStateAsSavedDbTableStmt:function(status) {
    var t = new Date();
    var now = t.getTime();

    var tableId = opendatakit.getCurrentTableId();
    var dbTableName = mdl.dbTableName;
    var model = mdl.model;
    
    var bindings = [];
    
    var stmt = 'insert into "' + dbTableName + '" (_id';
    for (var j = 0 ; j < this.dbTableMetadata.length ; ++j) {
        var f = this.dbTableMetadata[j];
        stmt += ", " + f.key;
    }
    for ( var f in model ) {
        stmt += ', "' + f + '"';
    }
    stmt += ") select _id";
    for (var j = 0 ; j < this.dbTableMetadata.length ; ++j) {
        var f = this.dbTableMetadata[j];
        if ( f.key == "_timestamp" ) {
            stmt += ", ?";
            bindings.push(now);
        } else if ( f.key == "_last_mod_time" ) {
            stmt += ", ?";
            bindings.push(now);
        } else if ( f.key == "_saved" ) {
            stmt += ", ?";
            bindings.push(status);
        } else {
            stmt += ", " + f.key;
        }
    }
    for ( var f in model ) {
        stmt += ', "' + f + '"';
    }
    stmt += ' from "' + dbTableName + '" where _id=? group by _id having _timestamp = max(_timestamp)'; 
    bindings.push(opendatakit.getCurrentInstanceId());
    return {
        stmt : stmt,
        bind : bindings
        };
},
selectDbTableCountStmt:function(instanceId) {
    var dbTableName = mdl.dbTableName;
    
    var stmt = 'select count(*) as rowcount from "' + dbTableName + '" where _id=?';
    return {
        stmt : stmt,
        bind : [instanceId]
    };
},
insertNewDbTableStmt:function(instanceId,instanceName,locale,instanceMetadataKeyValueListAsJSON) {

    var t = new Date();
    var now = t.getTime();

    var tableId = opendatakit.getCurrentTableId();
    var dbTableName = mdl.dbTableName;
    var model = mdl.model;
    
    var bindings = [];
    
    var stmt = 'insert into "' + dbTableName + '" (_id';
    for (var j = 0 ; j < this.dbTableMetadata.length ; ++j) {
        var f = this.dbTableMetadata[j];
        stmt += ", " + f.key;
    }
    for ( var f in model ) {
        stmt += ', "' + f + '"';
    }
    stmt += ") values (?";
    bindings.push(instanceId);
    
    for (var j = 0 ; j < this.dbTableMetadata.length ; ++j) {
        var f = this.dbTableMetadata[j];
        if ( f.key == "_last_mod_time" ) {
            stmt += ", ?";
            bindings.push(now);
        } else if ( f.key == "_timestamp" ) {
            stmt += ", ?";
            bindings.push(now);
        } else if ( f.key == "_instance_name" ) {
            stmt += ", ?";
            bindings.push(instanceName);
        } else if ( f.key == "_locale" ) {
            stmt += ", ?";
            bindings.push(locale);
        } else if ( f.isNullable ) {
            stmt += ", null";
        } else {
            stmt += ", " + f.defaultValue
        }
    }
    for ( var f in model ) {
        stmt += ", null";
    }
    stmt += ")"; 
    return {
        stmt : stmt,
        bind : bindings
    };
},
deletePriorChangesDbTableStmt:function() {
    var dbTableName = mdl.dbTableName;
    
    var stmt = 'delete from "' + dbTableName + '" where _id=? and _timestamp not in (select max(_timestamp) from "' + dbTableName + '" where _id=?);';
    return {
        stmt : stmt,
        bind : [opendatakit.getCurrentInstanceId(), opendatakit.getCurrentInstanceId()]
    };
},
deleteUnsavedChangesDbTableStmt:function() {
    var dbTableName = mdl.dbTableName;
    return {
        stmt : 'delete from "' + dbTableName + '" where _id=? and _saved is null;',
        bind : [opendatakit.getCurrentInstanceId()]
    };
},
deleteDbTableStmt:function(formid, instanceid) {
    var dbTableName = mdl.dbTableName;
    return {
        stmt : 'delete from "' + dbTableName + '" where _id=?;',
        bind : [instanceid]
    };
},
getAllFormInstancesStmt:function() {
    var dbTableName = mdl.dbTableName;
    return {
            stmt : 'select _instance_name, _timestamp, _saved, _locale, _id from "' +
                    dbTableName + '" where _instance_name is not null group by _id having _timestamp = max(_timestamp);',
            bind : []
            };
},
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//   TABLE META DATA
//   TABLE META DATA
//   TABLE META DATA
//   TABLE META DATA
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
selectTableDefinitionsDataStmt:function() {
    return {
            stmt : 'select * from _table_definitions where table_id=?',
            bind : [opendatakit.getCurrentTableId()]    
        };
},

// get the most recent value for the given name
selectTableMetaDataStmt:function(name) {
    return {
            stmt : 'select value from _table_key_value_store_active where table_id=? and key=?',
            bind : [opendatakit.getCurrentTableId(), name]    
        };
},
selectAllTableMetaDataStmt:function(tableId) {
    return {
            stmt : 'select key, type, value from _table_key_value_store_active where table_id=?',
            bind : [tableId]    
        };
},
// save the given value under that name
insertTableMetaDataStmt:function(name, type, value) {
    var now = new Date().getTime();
    if (value == null) {
        return {
            stmt : 'insert into _table_key_value_store_active (table_id, key, type, value) values (?,?,?,"");',
            bind : [opendatakit.getCurrentTableId(), name, type]
        };
    } else {
        return {
            stmt : 'insert into _table_key_value_store_active (table_id, key, type, value) values (?,?,?,?)',
            bind : [opendatakit.getCurrentTableId(), name, type, value]
        };
    }
},
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//   COLUMN META DATA
//   COLUMN META DATA
//   COLUMN META DATA
//   COLUMN META DATA
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
selectColumnDefinitionsDataStmt:function() {
    return {
            stmt : 'select * from _column_definitions where table_id=?',
            bind : [opendatakit.getCurrentTableId()]    
        };
},

// get the most recent value for the given name
selectColumnMetaDataStmt:function(name) {
    return {
            stmt : 'select value from _column_key_value_store_active where table_id=? and key=?',
            bind : [opendatakit.getCurrentTableId(), name]    
        };
},
selectAllColumnMetaDataStmt:function(tableId) {
    return {
            stmt : 'select key, type, value from _column_key_value_store_active where table_id=?',
            bind : [tableId]    
        };
},
// save the given value under that name
insertColumnMetaDataStmt:function(name, type, value) {
    var now = new Date().getTime();
    if (value == null) {
        return {
            stmt : 'insert into _column_key_value_store_active (table_id, key, type, value) values (?,?,?,"");',
            bind : [opendatakit.getCurrentTableId(), name, type]
        };
    } else {
        return {
            stmt : 'insert into _column_key_value_store_active (table_id, key, type, value) values (?,?,?,?)',
            bind : [opendatakit.getCurrentTableId(), name, type, value]
        };
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
putData:function(ctxt, name, type, value) {
      var that = this;
      ctxt.append('putData', 'name: ' + name);
      that.withDb( ctxt, function(transaction) {
            var is = that.insertDbTableStmt(name, type, value, false);
			ctxt.sqlStatement = is;
            transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
                ctxt.append("putData: successful insert: " + name);
            });
        });
},
putInstanceMetaData:function(ctxt, name, type, value) {
      var that = this;
      ctxt.append('putInstanceMetaData', 'name: ' + name);
      that.withDb( ctxt, function(transaction) {
            var is = that.insertDbTableStmt(name, type, value, true);
			ctxt.sqlStatement = is;
            transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
                ctxt.append("putInstanceMetaData: successful insert: " + name);
            });
        });
},
/**
 * ktvmlist is: [ { key: 'keyname', type: 'typename', value: 'val', isInstanceMetadata: false }, ...]
 */
putDataKeyTypeValueMap:function(ctxt, ktvmlist) {
      var that = this;
      ctxt.append('database.putDataKeyTypeValueMap', ktvmlist.length );
      that.withDb( ctxt, function(transaction) {
            var is = that.insertKtvmListDbTableStmt(ktvmlist);
			ctxt.sqlStatement = is;
            transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
                ctxt.append("putDataKeyTypeValueMap: successful insert: " + ktvmlist.length);
            });
        });
},
asDbColumnDefinition:function(defn) {
    // { key: 'syncTag', type: 'string', isNullable: true },
    var prefix = defn.key + " ";
    var postfix = (defn.isNullable ? " NULL" : " NOT NULL");
    var type = defn.type;
    if ( type == 'string' ) {
        return prefix + "TEXT" + postfix;
    } else if ( type == 'integer' ) {
        return prefix + "INTEGER" + postfix;
    } else if ( type == 'number' ) {
        return prefix + "REAL" + postfix;
    } else if ( type == 'boolean' ) {
        return prefix + "INTEGER" + postfix;
    } else if ( type == 'object' ) {
        return prefix + "TEXT" + postfix;
    } else if ( type == 'array' ) {
        return prefix + "TEXT" + postfix;
    } else {
        alert("asDbColumnDefinition.unknown type");
    }
},
// TODO: update...
asColPropsEntry:function(tableId, defn) {
    return {
        tableId: tableId,
        elementKey: defn.key,
        elementName: (defn.propertyName != null ? defn.propertyName : defn.key),
        elementType: (defn.name != null ? defn.name : defn.type),
        listChildElementKeys: null,
        isPersisted: 1,
        joinTableId: null,
        joinElementKey: null,
        displayVisible: 1,
        displayName: (defn.title != null ? defn.title : defn.key),
        displayChoicesMap: null,
        displayFormat: null,
        smsIn: 1,
        smsOut: 1,
        smsLabel: null,
        footerMode: '0'
    };
},
// TODO: update
convertToMdlFromDbDataType:function(defn, storageValue) {
    if ( storageValue == null ) {
        return null;
    }
    var type = defn.type;
    if ( type == 'string' ) {
        return storageValue;
    } else if ( type == 'integer' ) {
        if ( storageValue == "" ) {
            return null;
        }
        return 0+storageValue;
    } else if ( type == 'number' ) {
        if ( storageValue == "" ) {
            return null;
        }
        return 0.0+storageValue;
    } else if ( type == 'boolean' ) {
        if ( storageValue == "" ) {
            return null;
        }
        return (0+storageValue) != 0;
    } else if ( type == 'object' ) {
        if ( storageValue == "" ) {
            return null;
        }
        return JSON.parse(storageValue);
    } else if ( type == 'array' ) {
        if ( storageValue == "" ) {
            return null;
        }
        return JSON.parse(storageValue);
    } else {
        alert("convertToMdlFromDbDataType.unknown type");
    }
},
// TODO: update
convertToDbFromMdlDataType:function(defn, mdlValue) {
    if ( mdlValue == null ) {
        return null;
    }
    var type = defn.type;
    if ( type == 'string' ) {
        return mdlValue;
    } else if ( type == 'integer' ) {
        return 0+mdlValue;
    } else if ( type == 'number' ) {
        return 0.0+mdlValue;
    } else if ( type == 'boolean' ) {
        return ( mdlValue ? 1 : 0);
    } else if ( type == 'object' ) {
        return JSON.stringify(mdlValue);
    } else if ( type == 'array' ) {
        return JSON.stringify(mdlValue);
    } else {
        alert("convertToDbFromMdlDataType.unknown type");
    }
},
getAllData:function(ctxt, instanceId) {
      var that = this;
      var tlo = { data: {}, metadata: {}};
      ctxt.append('getAllData');
	  var tmpctxt = $.extend({},ctxt,{success:function() {
                ctxt.append("getAllData.success");
                ctxt.success(tlo)}});
      that.withDb( tmpctxt, function(transaction) {
        var ss = that.selectAllDbTableStmt(instanceId);
		tmpctxt.sqlStatement = ss;
        transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
            var len = result.rows.length;
            if (len == 0 ) {
                alert("no record for getAllData!");
            } else if (len != 1 ) {
                alert("not exactly one record in getAllData!");
            } else {
                var row = result.rows.item(0);
                var model = mdl.model;

                for (var i = 0 ; i < that.dbTableMetadata.length ; ++i) {
                    var f = that.dbTableMetadata[i];
                    var dbKey = f.key;
                    var dbValue = row[dbKey];
                    var dbType = f.type;
    
                    var elem = {};
                    elem['type'] = dbType;
                    if ( dbType == 'string' ) {
                    } else if ( dbType == 'integer') {
                    } else if ( dbType == 'number') {
                    } else if ( dbType == 'boolean') {
                    } else if ( dbType == 'array') {
                    } else if ( dbType == 'object') {
                    }
                    elem['value'] = dbValue;
                    
                    var path = dbKey.split('.');
                    var e = tlo.metadata;
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

                for ( var f in mdl.model ) {
                    var dbKey = f;
                    var dbValue = row[dbKey];
                    var dbType = f.type;
    
                    var elem = {};
                    elem['type'] = dbType;
                    elem['value'] = dbValue;
                    
                    var path = dbKey.split('.');
                    var e = tlo.data;
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
        });
      });
},
cacheAllData:function(ctxt, instanceId) {
    var that = this;
    this.getAllData($.extend({},ctxt,{success:function(tlo) {
        ctxt.append("cacheAllData.success");
        mdl.metadata = tlo.metadata;
        mdl.data = tlo.data;
        opendatakit.setCurrentInstanceId(instanceId);
        ctxt.success();
    }}), instanceId);
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
putTableMetaData:function(ctxt, name, type, value) {
      var that = this;
      ctxt.append('putTableMetaData');
      that.withDb( ctxt, function(transaction) {
            var is = that.insertTableMetaDataStmt(name, type, value);
			ctxt.sqlStatement = is;
            transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
                console.log("putTableMetaData: successful insert: " + name);
            });
        });
},
putTableMetaDataKeyTypeValueMapHelper:function(idx, that, ctxt, ktvlist) {
    return function(transaction) {
        // base case...
        if ( idx >= ktvlist.length ) {
            console.log("putTableMetaDataKeyValueMap: successful insert: " + ktvlist.length);
            return;
        }
        var key = ktvlist[idx].key;
        var type = ktvlist[idx].type;
        var value = ktvlist[idx].value; // may be null...
        var is = that.insertTableMetaDataStmt(key, type, value);
		ctxt.sqlStatement = is;
        transaction.executeSql(is.stmt, is.bind, that.putTableMetaDataKeyTypeValueMapHelper(idx+1, that, ctxt, ktvlist));
    };
},
/**
 * ktvlist is: [ { key: 'keyname', type: 'typename', value: 'val' }, ...]
 */
putTableMetaDataKeyTypeValueMap:function(ctxt, ktvlist) {
      ctxt.append('database.putMetaDataKeyTypeValueMap', ktvlist.length);
      var that = this;
      that.withDb( ctxt, that.putTableMetaDataKeyTypeValueMapHelper(0, that, ctxt, ktvlist));
},
coreGetAllTableMetadata:function(transaction, ctxt, tableId, tlo) {
    var that = this;
    var ss = that.selectAllTableMetaDataStmt(tableId);
	ctxt.sqlStatement = ss;
    transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
        var len = result.rows.length;
        for (var i = 0 ; i < len ; ++i ) {
            var row = result.rows.item(i);
            var dbKey = row['key'];
            var dbValue = row['value'];
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
    });
},
getAllTableMetaData:function(ctxt, tableId) {
    var that = this;
    var tlo = {};
    ctxt.append('getAllTableMetaData');
	var tmpctxt = $.extend({},ctxt,{success:function() {
                ctxt.append('getAllTableMetaData.success');
                ctxt.success(tlo);
            }});
    that.withDb( tmpctxt, function(transaction) {
            that.coreGetAllTableMetadata(transaction, tmpctxt, tableId, tlo);
        });
},
cacheAllTableMetaData:function(ctxt) {
    var that = this;
    // pull everything for synchronous read access
    ctxt.append('cacheAllTableMetaData.getAllTableMetaData');
    that.getAllTableMetaData($.extend({},ctxt,{success:function(tlo) {
        ctxt.append('cacheAllTableMetaData.success');
        if ( tlo == null ) {
            tlo = {};
        }
        // these values come from the current webpage
        tlo.formDef = mdl.qp.formDef;
        tlo.formId = mdl.qp.formId;
        tlo.formVersion = mdl.qp.formVersion;
        tlo.formLocales = mdl.qp.formLocales;
        tlo.formTitle = mdl.qp.formTitle;
        // update qp
        mdl.qp = tlo;
        ctxt.success();
        }}), opendatakit.getCurrentTableId());
},
save_all_changes:function(ctxt, asComplete) {
      var that = this;
    // TODO: if called from Java, ensure that all data on the current page is saved...
      ctxt.append('save_all_changes');
	  var tmpctxt = $.extend({}, ctxt, {success:function() {
                ctxt.append('save_all_changes.markCurrentStateSaved.success', 
                mdl.qp.formId.value + " instanceId: " + opendatakit.getCurrentInstanceId() + " asComplete: " + asComplete);
                ctxt.success();
            }});
      that.withDb( tmpctxt, 
            function(transaction) {
                var cs = that.markCurrentStateAsSavedDbTableStmt((asComplete ? 'COMPLETE' : 'INCOMPLETE'));
				tmpctxt.sqlStatement = cs;
                transaction.executeSql(cs.stmt, cs.bind, function(transaction, result) {
                    if ( asComplete ) {
                        ctxt.append('save_all_changes.cleanup');
                        // and now delete the change history...
                        var cs = that.deletePriorChangesDbTableStmt();
						tmpctxt.sqlStatement = cs;
                        transaction.executeSql(cs.stmt, cs.bind);
                    }
                });
            }
        );
    // TODO: should we have a failure callback in to ODK Collect?
},
ignore_all_changes:function(ctxt) {
      var that = this;
      ctxt.append('database.ignore_all_changes');
      that.withDb( ctxt, function(transaction) {
            var cs = that.deleteUnsavedDbTableChangesStmt();
			ctxt.sqlStatement = cs;
            transaction.executeSql(cs.stmt, cs.bind);
        });
},
 delete_all:function(ctxt, formid, instanceId) {
      var that = this;
      ctxt.append('delete_all');
      that.withDb( ctxt, function(transaction) {
            var cs = that.deleteDbTableStmt(formid, instanceId);
			ctxt.sqlStatement = cs;
            transaction.executeSql(cs.stmt, cs.bind);
        });
},
initializeInstance:function(ctxt, instanceId, instanceMetadataKeyValueList) {
    var that = this;
    if ( instanceId == null ) {
        ctxt.append('initializeInstance.noInstance');
        mdl.metadata = {};
        mdl.data = {};
        opendatakit.setCurrentInstanceId(null);
        ctxt.success();
    } else {
        ctxt.append('initializeInstance.access', instanceId);
		var tmpctxt = $.extend({},ctxt,{success:function() {
                that.cacheAllData(ctxt, instanceId);
            }});
        that.withDb( tmpctxt, function(transaction) {
            var cs = that.selectDbTableCountStmt(instanceId);
			tmpctxt.sqlStatement = cs;
            transaction.executeSql(cs.stmt, cs.bind, function(transaction, result) {
                var count = 0;
                if ( result.rows.length == 1 ) {
                    var row = result.rows.item(0);
                    count = row['rowcount'];
                }
                if ( count == null || count == 0) {
                    ctxt.append('initializeInstance.insertEmptyInstance');
                    // construct a friendly name for this new form...
                    var date = new Date();
                    var dateStr = date.toISOString();
                    var locale = opendatakit.getDefaultFormLocale(mdl.qp.formDef.value);
                    var instanceName = dateStr; // .replace(/\W/g, "_")
                    var cs = that.insertNewDbTableStmt(instanceId, instanceName, locale, JSON.stringify(instanceMetadataKeyValueList));
					tmpctxt.sqlStatement = cs;
                    transaction.executeSql(cs.stmt, cs.bind);
                }
            });
        });
    }
},
initializeTables:function(ctxt, formDef, tableId, protoTableMetadata, formPath) {
    var that = this;
    var tlo = {};
                            
    ctxt.append('initializeTables');
	var tmpctxt = $.extend({},ctxt,{success:function() {
                ctxt.append('getAllTableMetaData.success');
                // these values come from the current webpage
                tlo = $.extend(tlo, protoTableMetadata);
                // update tableId and qp
                mdl.qp = tlo;
                opendatakit.setCurrentTableId(tableId);
                opendatakit.setCurrentFormPath(formPath);
                ctxt.success();
            }});
    that.withDb(tmpctxt, function(transaction) {
                // now insert records into these tables...
                var ss = that.getDbTableNameStmt(tableId);
				tmpctxt.sqlStatement = ss;
                transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
                    if (result.rows.length == 0 ) {
                        // TODO: use something other than formId for the dbTableName...
                        that._insertTableAndColumnProperties(transaction, tmpctxt, tableId, protoTableMetadata.formId.value, protoTableMetadata.formTitle, formDef, tlo);
                    } else {
                        if(result.rows.length != 1) {
                            throw new Error("getMetaData: multiple rows! " + name + " count: " + result.rows.length);
                        } else {
                            var rec = result.rows.item(0);
                            var dbTableName = rec['value'];
                            mdl.dbTableName = dbTableName;
                            mdl.model = formDef.model;
                            that.coreGetAllTableMetadata(transaction, tmpctxt, tableId, tlo);
                        }
                    }
                });
            });
},
// save the given value under that name
getDbTableNameStmt:function(tableId) {
    return {
        stmt : 'select * from _table_key_value_store_active where table_id=? and key=?',
        bind : [tableId, 'dbTableName']
    };
},
_insertTableAndColumnProperties:function(transaction, ctxt, tableId, dbTableName, formTitle, formDef, tlo) {
    var that = this;
    var fullDef = {
		_table_definitions: [],
        _table_key_value_store_active: [],
        _column_definitions: [],
		_column_key_value_store_active: []
        };

    var displayColumnOrder = [];

    // TODO: verify that dbTableName is not already in use...
    var createTableCmd = 'CREATE TABLE IF NOT EXISTS "' + dbTableName + '"(_id TEXT NOT NULL';
    for ( var j = 0 ; j < this.dbTableMetadata.length ; ++j ) {
        var f = this.dbTableMetadata[j];
        createTableCmd = createTableCmd + ',' + f.key + " ";
        if ( f.type == "string" ) {
            createTableCmd = createTableCmd + "TEXT" + (f.isNullable ? " NULL" : " NOT NULL");
        } else if ( f.type == "integer" ) {
            createTableCmd = createTableCmd + "INTEGER" + (f.isNullable ? " NULL" : " NOT NULL");
        } else if ( f.type == "number" ) {
            createTableCmd = createTableCmd + "REAL" + (f.isNullable ? " NULL" : " NOT NULL");
        } else if ( f.type == "boolean" ) {
            createTableCmd = createTableCmd + "INTEGER" + (f.isNullable ? " NULL" : " NOT NULL");
        } else if ( f.type == "object" ) {
            createTableCmd = createTableCmd + "TEXT" + (f.isNullable ? " NULL" : " NOT NULL");
        } else if ( f.type == "array" ) {
            createTableCmd = createTableCmd + "TEXT" + (f.isNullable ? " NULL" : " NOT NULL");
        } else {
            alert("unhandled type");
        }
    }

    for ( var df in formDef.model ) {
    
        var collectElementName = df;
        
        displayColumnOrder.push(collectElementName);
        
        var collectDataTypeName;
        
        var defn = $.extend({key: collectElementName},formDef.model[df]);
        var type = defn.type;
        if ( type == 'integer' ) {
            collectDataTypeName = 'integer';
            createTableCmd += ',"' + collectElementName + '" INTEGER NULL';
        } else if ( type == 'number' ) {
            collectDataTypeName = 'number';
            createTableCmd += ',"' + collectElementName + '" REAL NULL';
        } else if ( type == 'string' ) {
            collectDataTypeName = 'string';
            createTableCmd += ',"' + collectElementName + '" TEXT NULL';
        } else if ( type == 'image/*' ) {
            collectDataTypeName = 'mimeUri';
            createTableCmd += ',"' + collectElementName + '" TEXT NULL';
        } else if ( type == 'audio/*' ) {
            collectDataTypeName = 'mimeUri';
            createTableCmd += ',"' + collectElementName + '" TEXT NULL';
        } else if ( type == 'video/*' ) {
            collectDataTypeName = 'mimeUri';
            createTableCmd += ',"' + collectElementName + '" TEXT NULL';
        } else {
            // TODO: handle composite types...
            collectDataTypeName = 'text';
            createTableCmd += ',"' + collectElementName + '" TEXT NULL';
        }
        
        // case: simple type
        // TODO: case: geopoint -- expand to different persistence columns
    
        fullDef._column_definitions.push( {
            table_id: tableId,
            element_key: collectElementName,
            element_name: collectElementName,
            element_type: collectDataTypeName,
            list_child_element_keys : null,
            is_persisted : true,
            joins: null
        } );
        fullDef._column_key_value_store_active.push( {
            table_id: tableId,
            element_key: collectElementName,
            key: "displayVisible",
			type: "boolean",
			value: true
        } );
        fullDef._column_key_value_store_active.push( {
            table_id: tableId,
            element_key: collectElementName,
            key: "displayName",
			type: "string",
			value: collectElementName
        } );
        fullDef._column_key_value_store_active.push( {
            table_id: tableId,
            element_key: collectElementName,
            key: "displayChoicesMap",
			type: "string",
			value: null
        } );
        fullDef._column_key_value_store_active.push( {
            table_id: tableId,
            element_key: collectElementName,
            key: "displayFormat",
			type: "string",
			value: null
        } );
        fullDef._column_key_value_store_active.push( {
            table_id: tableId,
            element_key: collectElementName,
			key: "smsIn",
			type: "boolean",
			value: true
        } );
        fullDef._column_key_value_store_active.push( {
            table_id: tableId,
            element_key: collectElementName,
			key: "smsOut",
			type: "boolean",
			value: true
        } );
        fullDef._column_key_value_store_active.push( {
            table_id: tableId,
            element_key: collectElementName,
			key: "smsLabel",
			type: "string",
			value: null
        } );
        fullDef._column_key_value_store_active.push( {
            table_id: tableId,
            element_key: collectElementName,
			key: "footerMode",
			type: "string",
			value: '0'
        } );
    }
    createTableCmd += ');';

	fullDef._table_definitions.push( { 
		table_id: tableId, 
		table_key: dbTableName, 
		db_table_name: dbTableName, 
		type: 'data', 
		table_id_access_controls: null, 
		sync_tag: "", 
		last_sync_time: -1, 
		sync_state: 'REST', 
		transactioning: 0 } );
										
    
    // construct the kvPairs to insert into kvstore
    fullDef._table_key_value_store_active.push( { table_id: tableId, key: 'displayName', type: 'string', value: formTitle } );
    fullDef._table_key_value_store_active.push( { table_id: tableId, key: 'primeCols', type: 'string', value: '' } );
    fullDef._table_key_value_store_active.push( { table_id: tableId, key: 'sortCol', type: 'string', value: '' } );
    fullDef._table_key_value_store_active.push( { table_id: tableId, key: 'coViewSettings', type: 'string', value: '' } );
    fullDef._table_key_value_store_active.push( { table_id: tableId, key: 'detailViewFile', type: 'string', value: '' } );
    fullDef._table_key_value_store_active.push( { table_id: tableId, key: 'summaryDisplayFormat', type: 'string', value: '' } );
    fullDef._table_key_value_store_active.push( { table_id: tableId, key: 'colOrder', type: 'string', value: JSON.stringify(displayColumnOrder) } );
    fullDef._table_key_value_store_active.push( { table_id: tableId, key: 'ovViewSettings', type: 'string', value: '' } );

	var tableToUpdate = null;
	for ( var prop in fullDef ) {
		tableToUpdate = prop;
		break;
	}
	
    transaction.executeSql(createTableCmd, [], function(transaction, result) {
        that.fullDefHelper(transaction, ctxt, tableToUpdate, 0, fullDef, tableId, dbTableName, formDef, tlo);
    });
},
fullDefHelper:function(transaction, ctxt, tableToUpdate, idx, fullDef, tableId, dbTableName, formDef, tlo) {
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
			if ( prop == old ) {
				found = true; // get the table after this...
			} else if ( found ) {
				tableToUpdate = prop;
				break;
			}
		}
		
		if ( tableToUpdate == null ) {
			// end of the array -- we are done!
			mdl.dbTableName = dbTableName;
			mdl.model = formDef.model;
			that.coreGetAllTableMetadata(transaction, ctxt, tableId, tlo);
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
    
    transaction.executeSql(insertCmd, bindArray, function(transaction, result) {
        that.fullDefHelper(transaction, ctxt, tableToUpdate, idx+1, fullDef, tableId, dbTableName, formDef, tlo);
    });
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
setData:function(ctxt, name, datatype, value) {
    ctxt.append('setData: ' + name);
    var that = this;
    that.putData($.extend({}, ctxt, {success: function() {
            that.cacheAllData(ctxt, opendatakit.getCurrentInstanceId());
        }}), name, datatype, value);
},
getInstanceMetaDataValue:function(name) {
    var path = name.split('.');
    var v = mdl.metadata;
    for ( var i = 0 ; i < path.length ; ++i ) {
        v = v[path[i]];
        if ( v == null ) return v;
    }
    return v.value;
},
setInstanceMetaData:function(ctxt, name, datatype, value) {
    ctxt.append('setInstanceMetaData: ' + name);
    var that = this;
    that.putInstanceMetaData($.extend({}, ctxt, {success: function() {
                that.cacheAllData(ctxt, opendatakit.getCurrentInstanceId());
            }}), name, datatype, value);
},
getTableMetaDataValue:function(name) {
    var path = name.split('.');
    var v = mdl.qp;
    for ( var i = 0 ; i < path.length ; ++i ) {
        v = v[path[i]];
        if ( v == null ) return v;
    }
    return v.value;
},
setTableMetaData:function(ctxt, name, datatype, value) {
    ctxt.append('setTableMetaData: ' + name);
    var that = this;
    that.putTableMetaData($.extend({}, ctxt, {success: function() {
                that.cacheAllTableMetaData(ctxt);
            }}), name, datatype, value);
},
discoverTableFromTableId:function(ctxt, tableId) {

}
};
});
