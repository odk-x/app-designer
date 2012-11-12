'use strict';
// TODO: Instance level: locale (used), at Table level: locales (available), formPath, formId, formVersion, 
// depends upon: opendatakit 
define(['mdl','opendatakit','jquery'], function(mdl,opendatakit,$) {
    return {
  submissionDb:false,
  dbTableMetadata: [ { key: 'srcPhoneNum', type: 'string', isNullable: true },
                     { key: 'lastModTime', type: 'string', isNullable: false },
                     { key: 'syncTag', type: 'string', isNullable: true },
                     { key: 'syncState', type: 'integer', isNullable: false, defaultValue: 0 },
                     { key: 'transactioning', type: 'integer', isNullable: false, defaultValue: 1 },
                     { key: 'timestamp', type: 'integer', isNullable: false },
                     { key: 'saved', type: 'string', isNullable: true },
                     { key: 'instanceName', type: 'string', isNullable: false },
                     { key: 'locale', type: 'string', isNullable: true },
                     { key: 'instanceArguments', type: 'object', isNullable: true },
                     { key: 'xmlPublishTimestamp', type: 'integer', isNullable: true },
                     { key: 'xmlPublishStatus', type: 'string', isNullable: true } ],
  mdl:mdl,
  withDb:function(ctxt, transactionBody) {
    var inContinuation = false;
    ctxt.append('database.withDb');
    var that = this;
    try {
        if ( that.submissionDb ) {
            that.submissionDb.transaction(transactionBody, function(error,a) {
                    ctxt.append("withDb.transaction.error", error.message);
                    ctxt.append("withDb.transaction.error.transactionBody", transactionBody.toString());
                    inContinuation = true;
                    ctxt.failure();
                    }, function() {
                        ctxt.append("withDb.transaction.success");
                        inContinuation = true;
                        ctxt.success();
                    });
        } else if(!window.openDatabase) {
            ctxt.append('database.withDb.notSupported');
            alert('not supported');
            inContinuation = true;
            ctxt.failure();
        } else {
            var settings = opendatakit.getDatabaseSettings(ctxt);
            var database = openDatabase(settings.shortName, settings.version, settings.displayName, settings.maxSize);
              // create the database...
            database.transaction(function(transaction) {
                    transaction.executeSql('CREATE TABLE IF NOT EXISTS colProps('+
                                    'tableId TEXT NOT NULL,'+
                                    'elementKey TEXT NOT NULL,'+
                                    'elementName TEXT NOT NULL,'+
                                    'elementType TEXT NULL,'+
                                    'listChildElementKeys TEXT NULL,'+
                                    'isPersisted INTEGER NOT NULL,'+
                                    'joinTableId TEXT NULL,'+
                                    'joinElementKey TEXT NULL,'+
                                    'displayVisible INTEGER NOT NULL,'+
                                    'displayName TEXT NOT NULL,'+
                                    'displayChoicesMap TEXT NULL,'+
                                    'displayFormat TEXT NULL,'+
                                    'smsIn INTEGER NOT NULL,'+
                                    'smsOut INTEGER NOT NULL,'+
                                    'smsLabel TEXT NULL,'+
                                    'footerMode TEXT NOT NULL'+
                                    ');', []);
                    transaction.executeSql('CREATE TABLE IF NOT EXISTS keyValueStoreActive('+
                                    'TABLE_UUID TEXT NOT NULL,'+ 
                                    '_KEY TEXT NOT NULL,'+
                                    '_TYPE TEXT NOT NULL,'+
                                    'VALUE TEXT NOT NULL'+
                                    ');', []);
                }, function(error) {
                    ctxt.append("withDb.createDb.transaction.error", error.message);
                    ctxt.append("withDb.transaction.error.transactionBody", "initializing database tables");
                    inContinuation = true;
                    ctxt.failure();
                }, function() {
                    // DB is created -- record the submissionDb and initiate the transaction...
                    that.submissionDb = database;
                    ctxt.append("withDb.createDb.transacton.success");
                    that.submissionDb.transaction(transactionBody, function(error) {
                                ctxt.append("withDb.transaction.error", error.message);
                                ctxt.append("withDb.transaction.error.transactionBody", transactionBody.toString());
                                inContinuation = true;
                                ctxt.failure();
                            }, function() {
                                ctxt.append("withDb.transaction.success");
                                inContinuation = true;
                                ctxt.success();
                            });
                });
        }
    } catch(e) {
        // Error handling code goes here.
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
                ctxt.failure();
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
    var isoNow = t.toISOString();

    var tableId = opendatakit.getCurrentTableId();
    var dbTableName = mdl.dbTableName;
    var model = mdl.model;
    
    // TODO: select * ... for cross-table referencing...
    var stmt = "select id";
    for (var j = 0 ; j < this.dbTableMetadata.length ; ++j) {
        var f = this.dbTableMetadata[j];
        stmt += ", " + f.key;
    }
    for ( var f in model ) {
        stmt += ', "' + f + '"';
    }
    stmt += ' from "' + dbTableName + '" where id=? group by id having timestamp = max(timestamp)'; 
    return {
        stmt : stmt,
        bind : [instanceId]
    };
},
// get the most recent value for the given name
selectCrossTableInstanceMetaDataStmt:function(dbTableName, instanceId, name) {
    return {
            stmt : 'select VALUE from keyValueStoreActive where TABLE_UUID=? and _KEY=?',
            bind : [opendatakit.getCurrentTableId(), name]    
        };
},
// save the given value under that name
insertDbTableStmt:function(name, type, value, isInstanceMetadata ) {
    var t = new Date();
    var now = t.getTime();
    var isoNow = t.toISOString();

    var tableId = opendatakit.getCurrentTableId();
    var dbTableName = mdl.dbTableName;
    var model = mdl.model;
    
    var bindings = [];
    
    var stmt = 'insert into "' + dbTableName + '" (id';
    for (var j = 0 ; j < this.dbTableMetadata.length ; ++j) {
        var f = this.dbTableMetadata[j];
        stmt += ", " + f.key;
    }
    for ( var f in model ) {
        stmt += ', "' + f + '"';
    }
    stmt += ") select id";
    for (var j = 0 ; j < this.dbTableMetadata.length ; ++j) {
        var f = this.dbTableMetadata[j];
        if ( f.key == name && isInstanceMetadata ) {
            if (value == null) {
                stmt += ", null";
            } else {
                stmt += ", ?";
                bindings.push(value);
            }
        } else if ( f.key == "lastModTime" ) {
            stmt += ", ?";
            bindings.push(isoNow);
        } else if ( f.key == "timestamp" ) {
            stmt += ", ?";
            bindings.push(now);
        } else if ( f.key == "xmlPublishTimestamp" ) {
            stmt += ", null";
        } else if ( f.key == "saved" || f.key == "xmlPublishStatus" ) {
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
    stmt += ' from "' + dbTableName + '" where id=? group by id having timestamp = max(timestamp)'; 
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
    var isoNow = t.toISOString();

    var dbTableName = mdl.dbTableName;
    var model = mdl.model;
    
    var bindings = [];
    
    var stmt = 'insert into "' + dbTableName + '" (id';
    for (var j = 0 ; j < this.dbTableMetadata.length ; ++j) {
        var f = this.dbTableMetadata[j];
        stmt += ", " + f.key;
    }
    for ( var f in model ) {
        stmt += ', "' + f + '"';
    }
    stmt += ") select id";
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
        } else if ( f.key == "lastModTime" ) {
            stmt += ", ?";
            bindings.push(isoNow);
        } else if ( f.key == "timestamp" ) {
            stmt += ", ?";
            bindings.push(now);
        } else if ( f.key == "xmlPublishTimestamp" ) {
            stmt += ", null";
        } else if ( f.key == "saved" || f.key == "xmlPublishStatus" ) {
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
    stmt += ' from "' + dbTableName + '" where id=? group by id having timestamp = max(timestamp)'; 
    bindings.push(opendatakit.getCurrentInstanceId());
    return {
        stmt : stmt,
        bind : bindings
        };
},
markCurrentStateAsSavedDbTableStmt:function(status) {
    var t = new Date();
    var now = t.getTime();
    var isoNow = t.toISOString();

    var tableId = opendatakit.getCurrentTableId();
    var dbTableName = mdl.dbTableName;
    var model = mdl.model;
    
    var bindings = [];
    
    var stmt = 'insert into "' + dbTableName + '" (id';
    for (var j = 0 ; j < this.dbTableMetadata.length ; ++j) {
        var f = this.dbTableMetadata[j];
        stmt += ", " + f.key;
    }
    for ( var f in model ) {
        stmt += ', "' + f + '"';
    }
    stmt += ") select id";
    for (var j = 0 ; j < this.dbTableMetadata.length ; ++j) {
        var f = this.dbTableMetadata[j];
        if ( f.key == "timestamp" ) {
            stmt += ", ?";
            bindings.push(now);
        } else if ( f.key == "saved" ) {
            stmt += ", ?";
            bindings.push(status);
        } else if ( f.key == "xmlPublishTimestamp" ) {
            stmt += ", null";
        } else if ( f.key == "xmlPublishStatus" ) {
            stmt += ", null";
        } else {
            stmt += ", " + f.key;
        }
    }
    for ( var f in model ) {
        stmt += ', "' + f + '"';
    }
    stmt += ' from "' + dbTableName + '" where id=? group by id having timestamp = max(timestamp)'; 
    bindings.push(opendatakit.getCurrentInstanceId());
    return {
        stmt : stmt,
        bind : bindings
        };
},
selectDbTableCountStmt:function(instanceId) {
    var dbTableName = mdl.dbTableName;
    
    var stmt = 'select count(*) as rowcount from "' + dbTableName + '" where id=?';
    return {
        stmt : stmt,
        bind : [instanceId]
    };
},
insertNewDbTableStmt:function(instanceId,instanceName,locale,instanceMetadataKeyValueListAsJSON) {

    var t = new Date();
    var now = t.getTime();
    var isoNow = t.toISOString();

    var tableId = opendatakit.getCurrentTableId();
    var dbTableName = mdl.dbTableName;
    var model = mdl.model;
    
    var bindings = [];
    
    var stmt = 'insert into "' + dbTableName + '" (id';
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
        if ( f.key == "lastModTime" ) {
            stmt += ", ?";
            bindings.push(isoNow);
        } else if ( f.key == "timestamp" ) {
            stmt += ", ?";
            bindings.push(now);
        } else if ( f.key == "instanceName" ) {
            stmt += ", ?";
            bindings.push(instanceName);
        } else if ( f.key == "locale" ) {
            stmt += ", ?";
            bindings.push(locale);
        } else if ( f.key == "instanceArguments" ) {
            stmt += ", ?";
            bindings.push(instanceMetadataKeyValueListAsJSON);
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
    
    var stmt = 'delete from "' + dbTableName + '" where id=? and timestamp not in (select max(timestamp) from "' + dbTableName + '" where id=?);';
    return {
        stmt : stmt,
        bind : [opendatakit.getCurrentInstanceId(), opendatakit.getCurrentInstanceId()]
    };
},
deleteUnsavedChangesDbTableStmt:function() {
    var dbTableName = mdl.dbTableName;
    return {
        stmt : 'delete from "' + dbTableName + '" where id=? and saved is null;',
        bind : [opendatakit.getCurrentInstanceId()]
    };
},
deleteDbTableStmt:function(formid, instanceid) {
    var dbTableName = mdl.dbTableName;
    return {
        stmt : 'delete from "' + dbTableName + '" where id=?;',
        bind : [instanceid]
    };
},
getAllFormInstancesStmt:function() {
    var dbTableName = mdl.dbTableName;
    return {
            stmt : 'select instanceName, timestamp, saved, locale, xmlPublishTimestamp, xmlPublishStatus, id from "' +
                    dbTableName + '" where instanceName is not null group by id having timestamp = max(timestamp);',
            bind : []
            };
},
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//   META DATA
//   META DATA
//   META DATA
//   META DATA
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
// get the most recent value for the given name
selectTableMetaDataStmt:function(name) {
    return {
            stmt : 'select VALUE from keyValueStoreActive where TABLE_UUID=? and _KEY=?',
            bind : [opendatakit.getCurrentTableId(), name]    
        };
},
selectAllTableMetaDataStmt:function(tableId) {
    return {
            stmt : 'select _KEY, _TYPE, VALUE from keyValueStoreActive where TABLE_UUID=?',
            bind : [tableId]    
        };
},
// save the given value under that name
insertTableMetaDataStmt:function(name, type, value) {
    var now = new Date().getTime();
    if (value == null) {
        return {
            stmt : 'insert into keyValueStoreActive (TABLE_UUID, _KEY, _TYPE, VALUE) values (?,?,?,"");',
            bind : [opendatakit.getCurrentTableId(), name, type]
        };
    } else {
        return {
            stmt : 'insert into keyValueStoreActive (TABLE_UUID, _KEY, _TYPE, VALUE) values (?,?,?,?)',
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
      that.withDb( $.extend({},ctxt,{success:function() {
                ctxt.append("getAllData.success");
                ctxt.success(tlo)}}), function(transaction) {
        var ss = that.selectAllDbTableStmt(instanceId);
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
            transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
                console.log("putTableMetaData: successful insert: " + name);
            });
        });
},
putTableMetaDataKeyTypeValueMapHelper:function(idx, that, ktvlist) {
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
        transaction.executeSql(is.stmt, is.bind, that.putTableMetaDataKeyTypeValueMapHelper(idx+1, that, ktvlist));
    };
},
/**
 * ktvlist is: [ { key: 'keyname', type: 'typename', value: 'val' }, ...]
 */
putTableMetaDataKeyTypeValueMap:function(ctxt, ktvlist) {
      ctxt.append('database.putMetaDataKeyTypeValueMap', ktvlist.length);
      var that = this;
      that.withDb( ctxt, that.putTableMetaDataKeyTypeValueMapHelper(0, that, ktvlist));
},
coreGetAllTableMetadata:function(transaction, tableId, tlo) {
    var that = this;
    var ss = that.selectAllTableMetaDataStmt(tableId);
    transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
        var len = result.rows.length;
        for (var i = 0 ; i < len ; ++i ) {
            var row = result.rows.item(i);
            var dbKey = row['_KEY'];
            var dbValue = row['VALUE'];
            var dbType = row['_TYPE'];
            
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
    that.withDb( $.extend({},ctxt,{success:function() {
                ctxt.append('getAllTableMetaData.success');
                ctxt.success(tlo);
            }}), function(transaction) {
            that.coreGetAllTableMetadata(transaction, tableId, tlo);
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
      that.withDb( $.extend({}, ctxt, {success:function() {
                ctxt.append('save_all_changes.markCurrentStateSaved.success', 
                mdl.qp.formId.value + " instanceId: " + opendatakit.getCurrentInstanceId() + " asComplete: " + asComplete);
                ctxt.success();
            }}), 
            function(transaction) {
                var cs = that.markCurrentStateAsSavedDbTableStmt((asComplete ? 'COMPLETE' : 'INCOMPLETE'));
                transaction.executeSql(cs.stmt, cs.bind, function(transaction, result) {
                    if ( asComplete ) {
                        ctxt.append('save_all_changes.cleanup');
                        // and now delete the change history...
                        var cs = that.deletePriorChangesDbTableStmt();
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
            transaction.executeSql(cs.stmt, cs.bind);
        });
},
 delete_all:function(ctxt, formid, instanceId) {
      var that = this;
      ctxt.append('delete_all');
      that.withDb( ctxt, function(transaction) {
            var cs = that.deleteDbTableStmt(formid, instanceId);
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
        that.withDb( $.extend({},ctxt,{success:function() {
                that.cacheAllData(ctxt, instanceId);
            }}), function(transaction) {
            var cs = that.selectDbTableCountStmt(instanceId);
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
    that.withDb($.extend({},ctxt,{success:function() {
                ctxt.append('getAllTableMetaData.success');
                // these values come from the current webpage
                tlo = $.extend(tlo, protoTableMetadata);
                // update tableId and qp
                mdl.qp = tlo;
                opendatakit.setCurrentTableId(tableId);
                opendatakit.setCurrentFormPath(formPath);
                ctxt.success();
            }}), function(transaction) {
                // now insert records into these tables...
                var ss = that.getDbTableNameStmt(tableId);
                transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
                    if (result.rows.length == 0 ) {
                        // TODO: use something other than formId for the dbTableName...
                        that._insertTableAndColumnProperties(transaction, tableId, protoTableMetadata.formId.value, protoTableMetadata.formTitle, formDef, tlo);
                    } else {
                        if(result.rows.length != 1) {
                            throw new Error("getMetaData: multiple rows! " + name + " count: " + result.rows.length);
                        } else {
                            var rec = result.rows.item(0);
                            var dbTableName = rec['VALUE'];
                            mdl.dbTableName = dbTableName;
                            mdl.model = formDef.model;
                            that.coreGetAllTableMetadata(transaction, tableId, tlo);
                        }
                    }
                });
            });
},
// save the given value under that name
getDbTableNameStmt:function(tableId) {
    return {
        stmt : 'select * from keyValueStoreActive where TABLE_UUID=? and _KEY=?',
        bind : [tableId, 'dbTableName']
    };
},
_insertTableAndColumnProperties:function(transaction, tableId, dbTableName, formTitle, formDef, tlo) {
    var that = this;
    var fullDef = {
        keyValueStoreActive: [],
        colProps: []
        };

    var displayColumnOrder = [];

    // TODO: verify that dbTableName is not already in use...
    var createTableCmd = 'CREATE TABLE IF NOT EXISTS "' + dbTableName + '"(id TEXT NOT NULL';
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
    
        fullDef.colProps.push( {
            tableId: tableId,
            elementKey: collectElementName,
            elementName: collectElementName,
            elementType: collectDataTypeName,
            listChildElementKeys: null,
            isPersisted: 1,
            joinTableId: null,
            joinElementKey: null,
            displayVisible: 1,
            displayName: collectElementName,
            displayChoicesMap: null,
            displayFormat: null,
            smsIn: 1,
            smsOut: 1,
            smsLabel: null,
            footerMode: '0'
        } );
    }
    createTableCmd += ');';
    
    // construct the kvPairs to insert into kvstore
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'dbTableName', _TYPE: 'string', VALUE: dbTableName } );
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'displayName', _TYPE: 'string', VALUE: formTitle } );
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'type', _TYPE: 'integer', VALUE: '0' } );
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'primeCols', _TYPE: 'string', VALUE: '' } );
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'sortCol', _TYPE: 'string', VALUE: '' } );
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'readAccessTid', _TYPE: 'string', VALUE: '' } );
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'writeAccessTid', _TYPE: 'string', VALUE: '' } );
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'syncTag', _TYPE: 'string', VALUE: '' } );
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'lastSyncTime', _TYPE: 'integer', VALUE: '-1' } );
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'coViewSettings', _TYPE: 'string', VALUE: '' } );
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'detailViewFile', _TYPE: 'string', VALUE: '' } );
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'summaryDisplayFormat', _TYPE: 'string', VALUE: '' } );
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'syncState', _TYPE: 'integer', VALUE: '' } );
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'transactioning', _TYPE: 'integer', VALUE: '' } );
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'colOrder', _TYPE: 'string', VALUE: JSON.stringify(displayColumnOrder) } );
    fullDef.keyValueStoreActive.push( { TABLE_UUID: tableId, _KEY: 'ovViewSettings', _TYPE: 'string', VALUE: '' } );

    transaction.executeSql(createTableCmd, [], function(transaction, result) {
        that.fullDefHelper(transaction, true, 0, fullDef, tableId, dbTableName, formDef, tlo);
    });
},
fullDefHelper:function(transaction, insertColProps, idx, fullDef, tableId, dbTableName, formDef, tlo) {
    var that = this;
    var dbPropertyTableName = null;
    var row = null;
    if ( insertColProps ) {
        if ( fullDef.colProps.length > idx ) {
            row = fullDef.colProps[idx];
            dbPropertyTableName = 'colProps';
        }
        if ( row == null ) {
            insertColProps = false;
            idx = 0;
        }
    }
    if ( !insertColProps ) {
        if ( fullDef.keyValueStoreActive.length > idx ) {
            row = fullDef.keyValueStoreActive[idx];
            dbPropertyTableName = 'keyValueStoreActive';
        }
    }
    
    // done if no row to process...
    if ( row == null ) {
        mdl.dbTableName = dbTableName;
        mdl.model = formDef.model;
        that.coreGetAllTableMetadata(transaction, tableId, tlo);
        return;
    }
    
    // assemble insert statement...
    var insertStart = 'REPLACE INTO ' + dbPropertyTableName + ' (';
    var insertMiddle = ') VALUES (';
    var bindArray = [];
    for ( var col in row ) {
        insertStart += col + ',';
        bindArray.push(row[col]);
        insertMiddle += '?,';
    }
    var insertCmd = insertStart.substr(0,insertStart.length-1) + insertMiddle.substr(0,insertMiddle.length-1) + ');';
    
    transaction.executeSql(insertCmd, bindArray, function(transaction, result) {
        that.fullDefHelper(transaction, insertColProps, idx+1, fullDef, tableId, dbTableName, formDef, tlo);
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
