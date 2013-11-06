'use strict';
// TODO: Instance level: locale (used), at Table level: locales (available), formPath, 
define(['mdl','opendatakit','jquery','XRegExp'], function(mdl,opendatakit,$,XRegExp) {
verifyLoad('database',
    ['mdl','opendatakit','jquery'],
    [mdl,opendatakit,$]);
return {
  submissionDb:false,
  pendingChanges: [],
        // maps of:
        //   dbColumnName : { 
        //        type: databaseType, 
        //         isNotNullable: false/true, 
        //        isPersisted: false/true,
        //      'default': defaultValue,
        //      elementPath: exposedName }
        // 
        // elementPath is the inversion of the property name and model's value name.
        // if elementPath is null, then the entry is not exposed above the database layer.
        // i.e., it is not settable/gettable via Javascript used in prompts.
        // This is used for bookkeeping columns (e.g., server sync, save status).
        //
  dataTablePredefinedColumns: { 
                     // these have leading underscores because they are hidden from the user and not directly manipulable
                     _id: {type: 'string', isNotNullable: true, isPersisted: true, elementSet: 'instanceMetadata' },
                     _uri_access_control: { type: 'string', isNotNullable: false, isPersisted: true, elementSet: 'instanceMetadata' },
                     _sync_tag: { type: 'string', isNotNullable: false, isPersisted: true, elementSet: 'instanceMetadata' },
                     _sync_state: { type: 'integer', isNotNullable: true, 'default': 0, isPersisted: true, elementSet: 'instanceMetadata' },
                     _conflict_type: { type: 'integer', isNotNullable: false, isPersisted: true, elementSet: 'instanceMetadata' },
                     _savepoint_timestamp: { type: 'integer', isNotNullable: true, isPersisted: true, elementSet: 'instanceMetadata' },
                     _savepoint_type: { type: 'string', isNotNullable: false, isPersisted: true, elementSet: 'instanceMetadata' },
                     _form_id: { type: 'string', isNotNullable: false, isPersisted: true, elementSet: 'instanceMetadata' },
                     _locale: { type: 'string', isNotNullable: false, isPersisted: true, elementSet: 'instanceMetadata' } },
  tableDefinitionsPredefinedColumns: {
                    _table_id: { type: 'string', isNotNullable: true, isPersisted: true, dbColumnConstraint: 'PRIMARY KEY', elementPath: 'table_id', elementSet: 'tableMetadata' },
                    _table_key: { type: 'string', isNotNullable: true, isPersisted: true, dbColumnConstraint: 'UNIQUE', elementPath: 'tableKey', elementSet: 'tableMetadata' },
                    _db_table_name: { type: 'string', isNotNullable: true, isPersisted: true, dbColumnConstraint: 'UNIQUE', elementPath: 'dbTableName', elementSet: 'tableMetadata' },
                    _sync_tag: { type: 'string', isNotNullable: false, isPersisted: true, elementSet: 'tableMetadata' },
                    _last_sync_time: { type: 'integer', isNotNullable: true, isPersisted: true, elementSet: 'tableMetadata' },
                    _sync_state: { type: 'string', isNotNullable: true, isPersisted: true, elementSet: 'tableMetadata' },
                    _transactioning: { type: 'integer', isNotNullable: true, isPersisted: true, elementSet: 'tableMetadata' } },
  columnDefinitionsTableConstraint: 'PRIMARY KEY ( "_table_id", "_element_key" )',
  columnDefinitionsPredefinedColumns: {
                    _table_id: { type: 'string', isNotNullable: true, isPersisted: true, elementPath: 'table_id', elementSet: 'columnMetadata' },
                    _element_key: { type: 'string', isNotNullable: true, isPersisted: true, elementPath: 'elementKey', elementSet: 'columnMetadata' },
                    _element_name: { type: 'string', isNotNullable: true, isPersisted: true, elementPath: 'elementName', elementSet: 'columnMetadata' },
                    _element_type: { type: 'string', isNotNullable: false, isPersisted: true, elementPath: 'elementType', elementSet: 'columnMetadata' },
                    _list_child_element_keys: { type: 'array', items: { type: 'string' }, isNotNullable: false, elementPath: 'listChildElementKeys', isPersisted: true, elementSet: 'columnMetadata' },
                    _is_persisted: { type: 'boolean', isNotNullable: true, isPersisted: true, elementPath: 'isPersisted', elementSet: 'columnMetadata' } },
  // key value stores are fairly straightforward...
  keyValueStoreActiveTableConstraint: 'PRIMARY KEY ("_table_id", "_partition", "_aspect", "_key")',
  keyValueStoreActivePredefinedColumns: {
                    _table_id: { type: 'string', isNotNullable: true, isPersisted: true },
                    _partition: { type: 'string', isNotNullable: true, isPersisted: true },
                    _aspect: { type: 'string', isNotNullable: true, isPersisted: true },
                    _key: { type: 'string', isNotNullable: true, isPersisted: true },
                    _type: { type: 'string', isNotNullable: false, isPersisted: true },
                    _value: { type: 'string', isNotNullable: false, isPersisted: true } },
   _tableKeyValueStoreActiveAccessibleKeys: {
            // keys we are allowing the user to access from within Javascript
            // _partition: table
            // _aspect: default
            // mapped as psuedo-columns per PredefinedColumns objects, above.
            // propertyName is the value of the 'key' in the database.
    },
   _columnKeyValueStoreActiveAccessibleKeys: {
            // keys we are allowing the user to access from within Javascript
            // _partition: column
            // _aspect: element_key
            // mapped as psuedo-columns per PredefinedColumns objects, above.
            // propertyName is the value of the 'key' in the database.
     },
    _reservedFieldNames: {
        /**
         * ODK Metadata reserved names
         */
        savepoint_timestamp: true,
        savepoint_type: true,
        form_id: true,
        locale: true,

        /**
         * SQLite keywords ( http://www.sqlite.org/lang_keywords.html )
         */
        abort: true,
        action: true,
        add: true,
        after: true,
        all: true,
        alter: true,
        analyze: true,
        and: true,
        as: true,
        asc: true,
        attach: true,
        autoincrement: true,
        before: true,
        begin: true,
        between: true,
        by: true,
        cascade: true,
        'case': true,
        cast: true,
        check: true,
        collate: true,
        column: true,
        commit: true,
        conflict: true,
        constraint: true,
        create: true,
        cross: true,
        current_date: true,
        current_time: true,
        current_timestamp: true,
        database: true,
        'default': true,
        deferrable: true,
        deferred: true,
        'delete': true,
        desc: true,
        detach: true,
        distinct: true,
        drop: true,
        each: true,
        'else': true,
        end: true,
        escape: true,
        except: true,
        exclusive: true,
        exists: true,
        explain: true,
        fail: true,
        'for': true,
        foreign: true,
        from: true,
        full: true,
        glob: true,
        group: true,
        having: true,
        'if': true,
        ignore: true,
        immediate: true,
        'in': true,
        index: true,
        indexed: true,
        initially: true,
        inner: true,
        insert: true,
        instead: true,
        intersect: true,
        into: true,
        is: true,
        isnull: true,
        join: true,
        key: true,
        left: true,
        like: true,
        limit: true,
        match: true,
        natural: true,
        no: true,
        not: true,
        notnull: true,
        'null': true,
        of: true,
        offset: true,
        on: true,
        or: true,
        order: true,
        outer: true,
        plan: true,
        pragma: true,
        primary: true,
        query: true,
        raise: true,
        references: true,
        regexp: true,
        reindex: true,
        release: true,
        rename: true,
        replace: true,
        restrict: true,
        right: true,
        rollback: true,
        row: true,
        savepoint: true,
        select: true,
        set: true,
        table: true,
        temp: true,
        temporary: true,
        then: true,
        to: true,
        transaction: true,
        trigger: true,
        union: true,
        unique: true,
        update: true,
        using: true,
        vacuum: true,
        values: true,
        view: true,
        virtual: true,
        when: true,
        where: true
    },
    // Unicode extensions to standard RegExp...
    _pattern_valid_user_defined_name: 
        XRegExp('^\\p{L}\\p{M}*(\\p{L}\\p{M}*|\\p{Nd}|_)*$', 'A'),
    isValidElementPath: function(path) {
        var that = this;
        if ( path == null ) {
            return false;
        }
        if ( path.length > 62 ) {
            return false;
        }
        var parts = path.split('.');
        var i;
        for ( i = 0 ; i < parts.length ; ++i ) {
            var name = parts[i];
            if ( !that._pattern_valid_user_defined_name.test(name) ) {
                return false;
            }
            var lowercase = name.toLowerCase();
            if (lowercase in that._reservedFieldNames) {
                return false;
            }
        }
        return true;
    },
    _getAccessibleTableKeyDefinition: function( key ) {
        return this._tableKeyValueStoreActiveAccessibleKeys[key];
    },
    _getAccessibleColumnKeyDefinition: function( key ) {
        return this._columnKeyValueStoreActiveAccessibleKeys[key];
    },
    _createTableStmt: function( dbTableName, kvMap, tableConstraint ) {
        // TODO: verify that dbTableName is not already in use...
        var createTableCmd = 'CREATE TABLE IF NOT EXISTS "' + dbTableName + '"(';
        var comma = '';
        for ( var dbColumnName in kvMap ) {
            var f = kvMap[dbColumnName];
            if ( f.isPersisted ) {
                createTableCmd += comma + dbColumnName + " ";
                comma = ',';
                if ( f.type === "string" ) {
                    createTableCmd += "TEXT" + (f.isNotNullable ? " NOT NULL" : " NULL");
                } else if ( f.type === "integer" ) {
                    createTableCmd += "INTEGER" + (f.isNotNullable ? " NOT NULL" : " NULL");
                } else if ( f.type === "number" ) {
                    createTableCmd += "REAL" + (f.isNotNullable ? " NOT NULL" : " NULL");
                } else if ( f.type === "boolean" ) {
                    createTableCmd += "INTEGER" + (f.isNotNullable ? " NOT NULL" : " NULL");
                } else if ( f.type === "object" ) {
                    createTableCmd += "TEXT" + (f.isNotNullable ? " NOT NULL" : " NULL");
                } else if ( f.type === "array" ) {
                    createTableCmd += "TEXT" + (f.isNotNullable ? " NOT NULL" : " NULL");
                } else {
                    throw new Error("unhandled type: " + f.type);
                }
            }
        }
        if ( tableConstraint != null ) {
            createTableCmd += comma + tableConstraint + " ";
        }
        createTableCmd += ');';
        return  {
            stmt : createTableCmd,
            bind : []
        };
    },
    _dropTableStmt: function(dbTableName) {
        return { stmt: 'drop table if exists "' + dbTableName + '"',
                bind: [] 
            };
    },
    _deleteEntireTableContentsTableStmt: function(dbTableName) {
        return { stmt: 'delete from "' + dbTableName + '"',
                bind: []
            };
    },
    _fromDatabaseToElementType: function( jsonType, value ) {
        var that = this;
        // date conversion elements...
        var yyyy, mm, dd, hh, min, sec, msec, zsign, zhh, zmm;

        if ( value === undefined || value === null ) {
            if ( jsonType.isNotNullable ) {
                throw new Error("unexpected null value for non-nullable field");
            }
            return null;
        }
        
        if ( jsonType.type === 'array' ) {
            value = JSON.parse(value);
            // TODO: ensure object spec conformance on read?
            return value;
        } else if ( jsonType.type === 'object' ) {
            if ( jsonType.elementType === 'date' ||
                 jsonType.elementType === 'dateTime' ) {
                // convert an iso8601 date yyyymmddTHH:MM:SS.ssszzzzz 
                // to a Date object...
                // TODO: FIX FRAGILE: loss of timezone info
                yyyy = Number(value.substr(0,4));
                mm = Number(value.substr(4,2))-1;// months are 0-11
                dd = Number(value.substr(6,2));
                hh = Number(value.substr(9,2));
                min = Number(value.substr(12,2));
                sec = Number(value.substr(15,2));
                msec = Number(value.substr(18,3));
                zsign = value.substr(21,1);
                zhh = Number(value.substr(22,2));
                zmm = Number(value.substr(24,2));
                value = new Date(Date.UTC(yyyy,mm,dd,hh,min,sec,msec));
                return value;
            } else if ( jsonType.elementType === 'time' ) {
                // convert an iso8601 time HH:MM:SS.ssszzzzz to a Date object...
                // TODO: FIX FRAGILE: loss of timezone info
                var idx = value.indexOf(':');
                hh = Number(value.substring(0,idx));
                min = Number(value.substr(idx+1,2));
                sec = Number(value.substr(idx+4,2));
                msec = Number(value.substr(idx+7,3));
                value = new Date();
                value.setHours(hh,min,sec,msec);
                return value;
            } else {
                value = JSON.parse(value);
                return value;
            }
        } else if ( jsonType.type === 'boolean' ) {
            return (value === undefined || value === null) ? null : (Number(value) !== 0); // '0' is false. 
        } else if ( jsonType.type === 'integer' ) {
            value = Number(value);
            if ( Math.round(value) != value ) {
                throw new Error("non-integer value for integer type");
            }
            return value;
        } else if ( jsonType.type === 'number' ) {
            return Number(value);
        } else if ( jsonType.type === 'string' ) {
            return '' + value;
        } else {
            throw new Error("unrecognized JSON schema type");
        }
    },
    _padWithLeadingZeros: function( value, places ) {
        var digits = [];
        var d, i, s;
        var sign = (value >= 0);
        value = Math.abs(value);
        while ( value !== 0 ) {
            d = (value % 10);
            digits.push(d);
            value = Math.floor(value/10);
        }
        while ( digits.length < places ) {
            digits.push(0);
        }
        digits.reverse();
        s = '';
        for ( i = 0 ; i < digits.length ; ++i ) {
            d = digits[i];
            s += d;
        }
        return (sign ? '' : '-') + s;
    },
    _toDatabaseFromElementType: function( jsonType, value ) {
        var that = this;
        var refined;
        var itemType;
        var item;
        var itemValue;
        // date conversion elements...
        var yyyy, mm, dd, hh, min, sec, msec, zsign, zhh, zmm;

        if ( value === undefined || value === null ) {
            if ( jsontype.isNotNullable ) {
                throw new Error("unexpected null value for non-nullable field");
            }
            return null;
        }
        
        if ( jsonType.type === 'array' ) {
            // ensure that it is an array of the appropriate type...
            if ( value instanceof Array ) {
                refined = [];
                itemType = jsonType.items;
                if (itemType === undefined || itemType === null ) {
                    value = JSON.stringify(value);
                } else {
                    for ( item = 0 ; item < value.length ; ++item ) {
                        itemValue = that._toDatabaseFromElementType( itemType, value[item] );
                        refined.push(itemValue);
                    }
                    value = JSON.stringify(refined);
                }
            } else {
                throw new Error("unexpected non-array value");
            }
            return value;
        } else if ( jsonType.type === 'object' ) {
            if ( jsonType.elementType === 'dateTime' ||
                 jsonType.elementType === 'date' ) {

                yyyy = value.getUTCFullYear();
                mm = value.getUTCMonth() + 1; // months are 0-11
                dd = value.getUTCDate();
                hh = value.getUTCHours();
                min = value.getUTCMinutes();
                sec = value.getUTCSeconds();
                msec = value.getUTCMilliseconds();
                zsign = 'Z';
                zhh = '';
                zmm = '';
                value = that._padWithLeadingZeros(yyyy,4) + 
                        that._padWithLeadingZeros(mm,2) +
                        that._padWithLeadingZeros(dd,2) + 'T' +
                        that._padWithLeadingZeros(hh,2) + ':' +
                        that._padWithLeadingZeros(min,2) + ':' +
                        that._padWithLeadingZeros(sec,2) + '.' +
                        that._padWithLeadingZeros(msec,3) + 'Z';
                return value;
            } else if ( jsonType.elementType === 'time' ) {
                // strip off the time-of-day and drop the rest...
                hh = value.getHours();
                min = value.getMinutes();
                sec = value.getSeconds();
                msec = value.getMilliseconds();
                var n = value.getTimezoneOffset();
                var sign = false;
                if ( n < 0) {
                    n = -n;
                    sign = true;
                }
                zhh = Math.floor(n/60);
                zmm = n - zhh*60;
                zsign = (sign ? '+' : '-');
                value = that._padWithLeadingZeros(hh,2) + ':' +
                        that._padWithLeadingZeros(min,2) + ':' +
                        that._padWithLeadingZeros(sec,2) + '.' +
                        that._padWithLeadingZeros(msec,3) + zsign +
                        that._padWithLeadingZeros(zhh,2) +
                        that._padWithLeadingZeros(zmm,2);
                return value;
            } else if ( !jsonType.properties ) {
                // this is an opaque BLOB w.r.t. database layer
                return JSON.stringify(value);
            } else {
                // otherwise, enforce spec conformance...
                // Only values in the properties list, and those
                // must match the type definitions recursively.
                refined = {};
                for ( item in jsonType.properties ) {
                    if ( value[item] != null ) {
                        itemType = jsonType.properties[item];
                        itemValue = that._toDatabaseFromElementType(itemType, value[item]);
                        if ( itemValue != null ) {
                            refined[item] = itemValue;
                        }
                    }
                }
                value = JSON.stringify(refined);
                return value;
            }
        } else if ( jsonType.type === 'boolean' ) {
            return (value ? '1' : '0'); // make it a boolean
        } else if ( jsonType.type === 'integer' ) {
            value = '' + Math.round(value);
            return value;
        } else if ( jsonType.type === 'number' ) {
            return '' + value;
        } else if ( jsonType.type === 'string' ) {
            return '' + value;
        } else {
            throw new Error("unrecognized JSON schema type");
        }
    },
    _reconstructElementPath: function(elementPath, jsonType, dbValue, topLevelObject) {
        var value = this._fromDatabaseToElementType( jsonType, dbValue );
        var path = elementPath.split('.');
        var e = topLevelObject;
        var term;
        for (var j = 0 ; j < path.length-1 ; ++j) {
            term = path[j];
            if ( term === undefined || term === null || term === "" ) {
                throw new Error("unexpected empty string in dot-separated variable name");
            }
            if ( e[term] === undefined || e[term] === null ) {
                e[term] = {};
            }
            e = e[term];
        }
        term = path[path.length-1];
        if ( term === undefined || term === null || term === "" ) {
            throw new Error("unexpected empty string in dot-separated variable name");
        }
        e[term] = value;
    },
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
                        ctxt.append("withDb.transaction.error.sqlBinds", ctxt.sqlStatement.bind);
                    }
                    ctxt.append("withDb.transaction.error", error.message);
                    ctxt.append("withDb.transaction.error.transactionBody", transactionBody.toString());
                    inContinuation = true;
                    that.submissionDb = null;
                    ctxt.failure({message: "Error while accessing or saving values to the database."});
                    }, function() {
                        ctxt.append("withDb.transaction.success");
                        inContinuation = true;
                        ctxt.success();
                    });
        } else if(!window.openDatabase) {
            ctxt.append('database.withDb.notSupported');
            console.error('w3c SQL interface is not supported');
            inContinuation = true;
            ctxt.failure({message: "Web client does not support the W3C SQL database standard."});
        } else {
            var settings = opendatakit.getDatabaseSettings();
            var database = openDatabase(settings.shortName, settings.version, settings.displayName, settings.maxSize);
              // create the database...
            database.transaction(function(transaction) {
                    var td;
                    td = that._createTableStmt('_column_definitions', 
                                                that.columnDefinitionsPredefinedColumns,
                                                that.columnDefinitionsTableConstraint );
                    ctxt.sqlStatement = td;
                    transaction.executeSql(td.stmt, td.bind);
                    td = that._createTableStmt('_key_value_store_active', 
                                                that.keyValueStoreActivePredefinedColumns,
                                                that.keyValueStoreActiveTableConstraint );
                    ctxt.sqlStatement = td;
                    transaction.executeSql(td.stmt, td.bind);
                    td = that._createTableStmt('_table_definitions', 
                                                that.tableDefinitionsPredefinedColumns);
                    ctxt.sqlStatement = td;
                    transaction.executeSql(td.stmt, td.bind);
                }, function(error) {
                    if ( ctxt.sqlStatement != null ) {
                        ctxt.append("withDb.createDb.transaction.error.sqlStmt", ctxt.sqlStatement.stmt);
                        ctxt.append("withDb.createDb.transaction.error.sqlBinds", ctxt.sqlStatement.bind);
                    }
                    ctxt.append("withDb.createDb.transaction.error", error.message);
                    ctxt.append("withDb.createDb.transaction.error.transactionBody", "initializing database tables");
                    inContinuation = true;
                    ctxt.failure({message: "Error while initializing database tables."});
                }, function() {
                    // DB is created -- record the submissionDb and initiate the transaction...
                    that.submissionDb = database;
                    ctxt.append("withDb.createDb.transacton.success");
                    ctxt.sqlStatement = null;
                    that.submissionDb.transaction(transactionBody, function(error) {
                                if ( ctxt.sqlStatement != null ) {
                                    ctxt.append("withDb.afterCreateDb.transaction.error.sqlStmt", ctxt.sqlStatement.stmt);
                                    ctxt.append("withDb.afterCreateDb.transaction.error.sqlBinds", ctxt.sqlStatement.bind);
                                }
                                ctxt.append("withDb.afterCreateDb.transaction.error", error.message);
                                ctxt.append("withDb.afterCreateDb.transaction.error.transactionBody", transactionBody.toString());
                                that.submissionDb = null;
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
        that.submissionDb = null;
        // Error handling code goes here.
        if ( ctxt.sqlStatement != null ) {
            ctxt.append("withDb.exception.sqlStmt", ctxt.sqlStatement.stmt);
        }
        if(e.INVALID_STATE_ERR) {
            // Version number mismatch.
            ctxt.append('withDb.exception', 'invalid db version');
            console.error("Invalid database version.");
        } else {
            ctxt.append('withDb.exception', 'unknown error: ' + String(e));
            console.error("Unknown error " + String(e) + ".");
        }
        if ( !inContinuation ) {
            try {
                ctxt.failure({message: "Exception while accessing or saving values to the database."});
            } catch(e) {
                ctxt.append('withDb.ctxt.failure.exception', 'unknown error: ' + String(e));
                console.error("withDb.ctxt.failure.exception " + String(e));
                ctxt._log('E','withDb: exception caught while executing ctxt.failure(msg)');
                alert('Fatal error while accessing or saving values to database');
            }
        } else {
            console.error("Unrecoverable Internal Error: Exception during success/failure continuation");
            ctxt._log('E',"withDb: Unrecoverable Internal Error: Exception during success/failure continuation");
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
//   DATA TABLE DATA
//   DATA TABLE DATA
//   DATA TABLE DATA
//   DATA TABLE DATA
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
// Records in the data table are always inserted.
// Metadata columns are indicated by a leading underscore in the name.
// 
// The _savepoint_type (metadata) column === "COMPLETE" if they are 'official' values.
// Otherwise, _savepoint_type === "INCOMPLETE" indicates a manual user savepoint and
// _savepoint_type IS NULL indicates an automatic (checkpoint) savepoint. 
// The _savepoint_timestamp indicates the time at which the savepoint occured.
 
/**
 * get the contents of the active data table row for a given instanceId
 *
 * Requires: no globals
 */
_selectAllFromDataTableStmt:function(dbTableName, instanceId) {
    var stmt = 'select * from "' + dbTableName + '" where _id=? group by _id having _savepoint_timestamp = max(_savepoint_timestamp)'; 
    return {
        stmt : stmt,
        bind : [instanceId]
    };
},

/**
 * get the most recent 'COMPLETE' contents of the active data table row for a given instanceId
 * If the row is currently being edited, this will display the last 'COMPLETE' old value.
 *
 * If supplied, the selection filter is applied to the returned set of 'COMPLETE' entries.
 * This query is used for cascading select statements
 *
 * Requires: no globals
 */
_selectAllCompleteFromDataTableStmt:function(dbTableName, selection, selectionArgs) {
    if ( selection != null ) {
        var args = ['COMPLETE'];
        if ( selectionArgs != null ) {
            args = args.concat(selectionArgs);
        }
        return {
                stmt : 'select * from (select * from "' + dbTableName +
                        '" where _savepoint_type=?  group by _id having _savepoint_timestamp = max(_savepoint_timestamp)) where ' + selection,
                bind : args
            };
    } else {
        return {
                stmt : 'select * from "' + dbTableName + '" where _savepoint_type=? group by _id having _savepoint_timestamp = max(_savepoint_timestamp)',
                bind : ['COMPLETE']    
            };
    }
},
/**
 * get the contents of the active data table row for a given table
 * for related forms (with filters).
 *
 * dbTableName
 * selection  e.g., 'name=? and age=?'
 * selectionArgs e.g., ['Tom',33]
 * orderBy  e.g., 'name asc, age desc'
 *
 * Requires: no globals
 */
selectMostRecentFromDataTableStmt:function(dbTableName, selection, selectionArgs, orderBy) {
    if ( selection != null ) {
        return {
                stmt :  'select * from (select * from "' + dbTableName +
                        '" group by _id having _savepoint_timestamp = max(_savepoint_timestamp)) where ' + selection +
                        ((orderBy === undefined || orderBy === null) ? '' : ' order by ' + orderBy),
                bind : selectionArgs
            };
    } else {
        return {
                stmt : 'select * from "' + dbTableName + '" group by _id having _savepoint_timestamp = max(_savepoint_timestamp)' +
                        ((orderBy === undefined || orderBy === null) ? '' : ' order by ' + orderBy),
                bind : []    
            };
    }
},
_getElementPathPairFromKvMap: function(kvMap, elementPath) {
    var path = elementPath.split('.');
    var e = kvMap;
    var i, j, term, value, pathChain;
    // work from most specific to least specific searching for a value match
    for (j = path.length-1 ; j >= 0 ; --j) {
        pathChain = '';
        for (i = 0 ; i <= j ; ++i) {
            pathChain = '.' + path[i] + pathChain;
        }
        pathChain = pathChain.substring(1);
        if ( kvMap[pathChain] != null ) {
            // found a definition...
            term = kvMap[pathChain];
            value = term.value;
            // now find the definition for this element
            // within the composite value
            for ( i = j+1 ; i <= path.length-1 ; ++i ) {
                value = value[path[i]];
                if ( value === undefined || value === null ) break;
            }
            var e = {};
            var f;
            for ( f in term ) {
                if ( f !== "value" ) {
                    e[f] = term[f];
                }
            }
            e['value'] = value;
            return {element: e, elementPath: pathChain};
        }
    }
    return null;
},
/**
 * insert a new automatic savepoint for the given record and change the 
 * database columns (including instance metadata columns) specified in the kvMap.
 * Also used to set a manual savepoint when the kvMap specifies the '_savepoint_type' 
 * instance metadata value (not accessible to external users).
 *
 * kvMap : { 'columnName' : { value: "foo name", isInstanceMetadata: false } ...}
 *
 * Assumes: all complex values are already reduced to its persisted column set.
 *
 * Requires: No global dependencies
 */
_insertKeyValueMapDataTableStmt:function(dbTableName, dataTableModel, instanceId, kvMap) {
    var t = new Date();
    var now = t.getTime();
    
    var bindings = [];
    var processSet = {};
    
    var j, f, defElement, elementPathPair, kvElement, v;
    var comma = '';
    
    var stmt = 'insert into "' + dbTableName + '" (';
    for ( f in dataTableModel ) {
        defElement = dataTableModel[f];
        if ( defElement.isPersisted ) {
            stmt += comma;
            comma = ', ';
            stmt += '"' + f + '"';
        }
    }
    stmt += ") select ";
    comma = '';
    var updates = {};
    for (f in dataTableModel) {
        defElement = dataTableModel[f];
        if ( defElement.isPersisted ) {
            stmt += comma;
            comma = ', ';
            var elementPath = defElement['elementPath'];
            if ( elementPath === undefined || elementPath === null ) elementPath = f;
            // TODO: get kvElement for this elementPath
            elementPathPair = this._getElementPathPairFromKvMap(kvMap, elementPath);
            if ( elementPathPair != null ) {
                kvElement = elementPathPair.element;
                updates[f] = {"elementPath" : elementPath, "value": null};
                // track that we matched the keyname...
                processSet[elementPathPair.elementPath] = true;
                if (kvElement.value === undefined || kvElement.value === null) {
                    stmt += "null";
                } else {
                    stmt += "?";
                    // remap kvElement.value into storage value...
                    v = this._toDatabaseFromElementType(defElement, kvElement.value);
                    bindings.push(v);
                    updates[f].value = v; 
                }
            } else if (f === "_savepoint_timestamp") {
                stmt += "?";
                v = now;
                bindings.push(v);
                updates[f] = {"elementPath" : elementPath, "value": v};
            } else if ( f === "_form_id" ) {
                stmt += "?";
                v = opendatakit.getSettingValue('form_id');
                bindings.push(v);
                updates[f] = {"elementPath" : elementPath, "value": v};
            } else if ( f === "_savepoint_type" ) {
                stmt += "null";
            } else {
                stmt += '"' + f + '"';
            }
        }
    }
    stmt += ' from "' + dbTableName + '" where _id=? group by _id having _savepoint_timestamp = max(_savepoint_timestamp)'; 
    bindings.push(instanceId);
    
    for ( f in kvMap ) {
        if ( processSet[f] != true ) {
            console.error("_insertKeyValueMapDataTableStmt: kvMap contains unrecognized database column " + dbTableName + "." + f );
        }
    }
    return {
        stmt : stmt,
        bind : bindings,
        updates : updates
        };
},
/**
 * compose query to get 'rowcount' value -- the number of records with the given instanceId in the dbTableName.
 *
 * Requires: no globals
 */
_selectDataTableCountStmt:function(dbTableName, instanceId) {
    
    var stmt = 'select count(*) as rowcount from "' + dbTableName + '" where _id=?';
    return {
        stmt : stmt,
        bind : [instanceId]
    };
},
/**
 * insert an entirely new savepoint for the given instanceId (not based upon 
 * the values in any existing record). Called when creating a new instance
 * or (TODO) sub-form instance.
 *
 * kvMap : { 'columnName' : { value: "foo name", isInstanceMetadata: false } ...}
 *
 * additionally, the dataTablePredefinedColumns and model are assumed to be enhanced
 * JSON schema maps. e.g.,
 * 
 * jsonSchemaMap : { 'columnName' : { type: 'elementType', 
 *                            'default': 'defaultValue',
 *                            isInstanceMetadata: false,
 *                            isPersisted: true } ... }
 *
 * NON_CONFORMANCE NOTE: rather than express everything as a list of 
 * types ['elementType', 'null'] we assume that 'null' is implicitly 
 * allowed. Use isNotNullable: true to force a non-null database restriction.
 * Enforcement of this is primarily in support of metadata.
 *
 * If a kvMap entry is present, its 'value' field is used (and null if 'value' 
 * is undefined).If no kvMap entry is present, the ''default'' field, from 
 * the dataTableModel, if present,  is used as the initial
 * value for this column. If ''default'' is not present, null is used.
 *
 * Assumes: all complex values are already reduced to their persisted column set.
 *
 * Requires: No global context
 */
_insertNewKeyValueMapDataTableStmt:function(dbTableName, dataTableModel, kvMap) {
    var t = new Date();
    var now = t.getTime();
    
    var bindings = [];
    var processSet = {};
    
    var j, f, defElement, kvElement;
    var comma = '';
    
    var stmt = 'insert into "' + dbTableName + '" (';
    for ( f in dataTableModel ) {
        defElement = dataTableModel[f];
        if ( defElement.isPersisted ) {
            stmt += comma;
            comma = ', ';
            stmt += '"' + f + '"';
        }
    }
    stmt += ") values (";
    comma = '';
    for (f in dataTableModel) {    
        defElement = dataTableModel[f];
        if ( defElement.isPersisted ) {
            stmt += comma;
            comma = ', ';
            kvElement = kvMap[f];
            if ( kvElement != null ) {
                // track that we matched the keyname...
                processSet[f] = true;
                if (kvElement.value === undefined || kvElement.value === null) {
                    stmt += "null";
                } else {
                    stmt += "?";
                    bindings.push(kvElement.value);
                }
            } else if ( f === "_savepoint_timestamp" ) {
                stmt += "?";
                bindings.push(now);
            } else if ( f === "_form_id" ) {
                stmt += "?";
                bindings.push(opendatakit.getSettingValue('form_id'));
            } else {
                // use default values from reference map...
                if ( defElement['default'] === undefined || defElement['default'] === null ) {
                    stmt += "null";
                } else {
                    stmt += "?";
                    bindings.push(defElement['default']);
                }
            }
        }
    }
    stmt += ');'; 
    
    for ( f in kvMap ) {
        if ( processSet[f] != true ) {
            console.error("_insertNewKeyValueMapDataTableStmt: kvMap contains unrecognized database column " + dbTableName + "." + f );
        }
    }
    return {
        stmt : stmt,
        bind : bindings
        };
},
/**
 * Delete all but the last savepoint for this instanceId.
 *
 * NOTE: This can make a currently-visible row invisible in a concurrent ODK Tables if 
 * the current record is not a 'COMPLETE' record. We prevent this by only calling this 
 * within the save-as-complete transaction.
 *
 * Requires: no globals
 */
_deletePriorChangesDataTableStmt:function(dbTableName, instanceId) {
    
    var stmt = 'delete from "' + dbTableName + '" where _id=? and _savepoint_timestamp not in (select max(_savepoint_timestamp) from "' + dbTableName + '" where _id=?);';
    return {
        stmt : stmt,
        bind : [instanceId, instanceId]
    };
},
/**
 * Delete all automatic save points for a row. This leaves all the user's manual
 * 'INCOMPLETE' savepoints and any 'COMPLETE' savepoints.
 *
 * Requires: no globals
 */
_deleteUnsavedChangesDataTableStmt:function(dbTableName, instanceId) {
    return {
        stmt : 'delete from "' + dbTableName + '" where _id=? and _savepoint_type is null;',
        bind : [instanceId]
    };
},
/**
 * Delete the instanceId entirely from the table (all savepoints).
 *
 * Requires: no globals
 */
_deleteDataTableStmt:function(dbTableName, instanceid) {
    return {
        stmt : 'delete from "' + dbTableName + '" where _id=?;',
        bind : [instanceid]
    };
},
/**
 * Retrieve the latest information on all instances in a given data table.
 * Ordered by most recent first, in reverse chronological order.
 *
 * Requires: no globals
 */
_getAllInstancesDataTableStmt:function(dbTableName, displayElementName) {
    if ( displayElementName === undefined || displayElementName === null ) {
        displayElementName = '';
    } else {
        displayElementName = displayElementName + ', ';
    }
    return {
            stmt : 'select ' + displayElementName + ' _savepoint_timestamp, _savepoint_type, _locale, _id from "' +
                    dbTableName + '" group by _id having _savepoint_timestamp = max(_savepoint_timestamp) order by _savepoint_timestamp desc;',
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
_selectTableDefinitionsDataStmt:function(table_id) {
    return {
            stmt : 'select * from _table_definitions where _table_id=?',
            bind : [table_id]    
        };
},

_selectAllTableDbNamesAndIdsDataStmt: function() {
    return {
            stmt: 'select _db_table_name, _table_id from _table_definitions',
            bind: []
        };
},
_selectAllTableMetaDataStmt:function(table_id) {
    return {
            stmt : 'select _key, _type, _value from _key_value_store_active where _table_id=? and _partition=? and _aspect=?',
            bind : [table_id, "Table", "default"]    
        };
},
// save the given value under that name
insertTableMetaDataStmt:function(table_id, name, type, value) {
    var now = new Date().getTime();
    if (value === undefined || value === null) {
        return {
            stmt : 'insert into _key_value_store_active (_table_id, _partition, _aspect, _key, _type, _value) values (?,?,?,?,?,"");',
            bind : [table_id, "Table", "default", name, type]
        };
    } else {
        return {
            stmt : 'insert into _key_value_store_active (_table_id, _partition, _aspect, _key, _type, _value) values (?,?,?,?,?,?)',
            bind : [table_id, "Table", "default", name, type, value]
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
_selectColumnDefinitionsDataStmt:function(table_id) {
    return {
            stmt : 'select * from _column_definitions where _table_id=?',
            bind : [table_id]    
        };
},
_selectAllColumnMetaDataStmt:function(table_id) {
    return {
            stmt : 'select _aspect as _element_key, _key, _type, _value from _key_value_store_active where _table_id=? and _partition=?',
            bind : [table_id, "Column"]    
        };
},
// save the given value under that name
insertColumnMetaDataStmt:function(table_id, elementKey, name, type, value) {
    var now = new Date().getTime();
    if (value === undefined || value === null) {
        return {
            stmt : 'insert into _key_value_store_active (_table_id, _partition, _aspect, _key, _type, _value) values (?,?,?,?,?,"");',
            bind : [table_id, "Column", elementKey, name, type]
        };
    } else {
        return {
            stmt : 'insert into _key_value_store_active (_table_id, _partition, _aspect, _key, _type, _value) values (?,?,?,?,?,?)',
            bind : [table_id, "Column", elementKey, name, type, value]
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
putInstanceMetaData:function(ctxt, name, value) {
      var that = this;
      var kvMap = {};
      var dbColumnName;
      var f;
      ctxt.append('putInstanceMetaData', 'name: ' + name);
      for ( f in that.dataTablePredefinedColumns ) {
        var defn = that.dataTablePredefinedColumns[f];
        if (  defn.elementSet === 'instanceMetadata' &&
              ( defn.elementPath === name ||
                (defn.elementPath ===undefined || defn.elementPath === null && f === name) ) ) {
            dbColumnName = f;
            break;
        }
      }
      if ( dbColumnName === undefined || dbColumnName === null ) {
        ctxt.append('putInstanceMetaData.elementPath.missing', 'name: ' + name);
        ctxt.failure({message:"Unrecognized instance metadata"});
        return;
      }
      // and still use the elementPath for the lookup.
      // this simply ensures that the name is exported above 
      // the database layer. 
      // The database layer uses putDataKeyValueMap()
      // for lower-level manipulations.
      kvMap[name] = {value: value, isInstanceMetadata: true };
      that.putDataKeyValueMap(ctxt, kvMap );
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
          ctxt.append('database.putDataKeyValueMap.initiated', names );

          var updates = {};
          var tmpctxt = $.extend({}, ctxt, {success:function() {
                    ctxt.append('database.putDataKeyValueMap.updatingCache');
                    var uf;
                    for (var f in updates) {
                        var uf = updates[f];
                        var de = mdl.dataTableModel[f];
                        if (de.isPersisted) {
                            var elementPath = de.elementPath || uf.elementPath;
                            if ( de.elementSet === 'instanceMetadata' ) {
                                that._reconstructElementPath(elementPath, de, uf.value, mdl.metadata );
                            } else {
                                that._reconstructElementPath(elementPath, de, uf.value, mdl.data );
                            }
                        }
                    }
                    ctxt.success();
                }});

          that.withDb( tmpctxt, function(transaction) {
                var is = that._insertKeyValueMapDataTableStmt(mdl.tableMetadata.dbTableName, mdl.dataTableModel, opendatakit.getCurrentInstanceId(), kvMap);
                transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
                    updates = is.updates;
                    tmpctxt.append("putDataKeyValueMap.success", names);
                });
            });
    }
},
getAllData:function(ctxt, dataTableModel, dbTableName, instanceId) {
      var that = this;
      var tlo = { data: {}, metadata: {}};
      ctxt.append('getAllData');
      var tmpctxt = $.extend({},ctxt,{success:function() {
                ctxt.append("getAllData.success");
                ctxt.success(tlo);
            }});
      if ( instanceId === undefined || instanceId === null ) {
        ctxt.append("getAllData.instanceId.null");
        tmpctxt.success();
        return;
      }
      that.withDb( tmpctxt, function(transaction) {
        var ss = that._selectAllFromDataTableStmt(dbTableName, instanceId);
        tmpctxt.sqlStatement = ss;
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
                
                // and then just snarf the fields...
                for ( dbKey in dataTableModel ) {
                    jsonType = dataTableModel[dbKey];
                    if ( jsonType.isPersisted ) {
                        dbValue = row[dbKey];
                        elementPath = jsonType.elementPath;
                        if ( elementPath != null ) {
                            // we expose it to the Javascript layer if it has an elementPath...
                            if ( jsonType.elementSet === 'instanceMetadata' ) {
                                that._reconstructElementPath(elementPath, jsonType, dbValue, tlo.metadata );
                            } else {
                                that._reconstructElementPath(elementPath, jsonType, dbValue, tlo.data );
                            }
                        }
                    }
                }
            }
        });
      });
},
cacheAllData:function(ctxt, instanceId) {
    var that = this;
    if (mdl.loaded) {
        ctxt.success();
    } else {
        this.getAllData($.extend({},ctxt,{success:function(tlo) {
            ctxt.append("cacheAllData.success");
            mdl.metadata = tlo.metadata;
            mdl.data = tlo.data;
            mdl.loaded = true;
            ctxt.success();
        }}), mdl.dataTableModel, mdl.tableMetadata.dbTableName, instanceId);
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
    ss = that._selectTableDefinitionsDataStmt(tlo.table_id);
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
        for ( f in that.tableDefinitionsPredefinedColumns ) {
            defn = that.tableDefinitionsPredefinedColumns[f];
            if ( defn.elementPath ) {
                that._reconstructElementPath(defn.elementPath, defn, row[f], tlo.tableMetadata );
            }
        }
        ss = that._selectAllTableMetaDataStmt(tlo.table_id);
        ctxt.sqlStatement = ss;
        transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
            var len = result.rows.length;
            var defn;
            for (var i = 0 ; i < len ; ++i ) {
                var row = result.rows.item(i);
                var dbKey = row['key'];
                var dbValue = row['value'];
                var dbType = row['type'];
                defn = that._getAccessibleTableKeyDefinition(dbKey);
                if ( defn != null ) {
                    that._reconstructElementPath(defn.elementPath, defn, dbValue, tlo.tableMetadata );
                }
            }
            // read all column definitions...
            ss = that._selectColumnDefinitionsDataStmt(tlo.table_id);
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
                    for ( f in that.columnDefinitionsPredefinedColumns ) {
                        defn = that.columnDefinitionsPredefinedColumns[f];
                        if ( defn.elementPath ) {
                            that._reconstructElementPath(defn.elementPath, defn, row[f], colDefn );
                        }
                    }
                    tlo.columnMetadata[defn.elementKey] = defn;
                }
                
                ss = that._selectAllColumnMetaDataStmt(tlo.table_id);
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
                        defn = that._getAccessibleColumnKeyDefinition(dbKey);
                        if ( defn != null ) {
                            that._reconstructElementPath(defn.elementPath, defn, dbValue, tlo.columnMetadata[elementKey] );
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
      ctxt.append('save_all_changes');
      var tmpctxt = $.extend({}, ctxt, {success:function() {
                ctxt.append('save_all_changes.markCurrentStateSaved.success', 
                opendatakit.getSettingValue('form_id') + " instanceId: " + opendatakit.getCurrentInstanceId() + " asComplete: " + asComplete);
                ctxt.success();
            }});
      that.withDb( tmpctxt, 
            function(transaction) {
                var kvMap = {};
                kvMap['_savepoint_type'] = {value: (asComplete ? 'COMPLETE' : 'INCOMPLETE'), isInstanceMetadata: true };
                var is = that._insertKeyValueMapDataTableStmt(mdl.tableMetadata.dbTableName, mdl.dataTableModel, opendatakit.getCurrentInstanceId(), kvMap);
                tmpctxt.sqlStatement = is;
                transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
                    ctxt.append('save_all_changes.cleanup');
                    // and now delete the change history...
                    var cs = that._deletePriorChangesDataTableStmt(mdl.tableMetadata.dbTableName, opendatakit.getCurrentInstanceId());
                    tmpctxt.sqlStatement = cs;
                    transaction.executeSql(cs.stmt, cs.bind);
                });
            }
        );
},
ignore_all_changes:function(ctxt) {
      var that = this;
      ctxt.append('database.ignore_all_changes');
      that.withDb( ctxt, function(transaction) {
            var cs = that._deleteUnsavedChangesDataTableStmt(mdl.tableMetadata.dbTableName, opendatakit.getCurrentInstanceId());
            ctxt.sqlStatement = cs;
            transaction.executeSql(cs.stmt, cs.bind);
            mdl.loaded = false;
        });
},
delete_all:function(ctxt, instanceId) {
      var that = this;
      ctxt.append('delete_all');
      that.withDb( ctxt, function(transaction) {
            var cs = that._deleteDataTableStmt(mdl.tableMetadata.dbTableName, instanceId);
            ctxt.sqlStatement = cs;
            transaction.executeSql(cs.stmt, cs.bind);
        });
},
get_all_instances:function(ctxt) {
      var that = this;
      var instanceList = [];
      ctxt.append('get_all_instances');
      that.withDb($.extend({},ctxt,{success: function() {
            ctxt.success(instanceList);
        }}), function(transaction) {
            var displayElementName = opendatakit.getSettingValue('instance_name');
            var ss = that._getAllInstancesDataTableStmt(mdl.tableMetadata.dbTableName, displayElementName);
            ctxt.sqlStatement = ss;
            transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
                for ( var i = 0 ; i < result.rows.length ; i+=1 ) {
                    var instance = result.rows.item(i);
                    var ts = new Date(instance._savepoint_timestamp);
                    instanceList.push({
                        display_field: (displayElementName === undefined || displayElementName === null) ? ts.toISOString(): instance[displayElementName],
                        instance_id: instance._id,
                        savepoint_timestamp: ts,
                        savepoint_type: instance._savepoint_type,
                        locale: instance._locale
                    });
                }
            });
        });
},
delete_linked_instance_all:function(ctxt, dbTableName, instanceId) {
      var that = this;
      ctxt.append('delete_linked_instance_all');
      that.withDb( ctxt, function(transaction) {
            var cs = that._deleteDataTableStmt(dbTableName, instanceId);
            ctxt.sqlStatement = cs;
            transaction.executeSql(cs.stmt, cs.bind);
        });
},
get_linked_instances:function(ctxt, dbTableName, selection, selectionArgs, displayElementName, orderBy) {
      var that = this;
      var instanceList = [];
      ctxt.append('get_linked_instances', dbTableName);
      that.withDb($.extend({},ctxt,{success: function() {
            ctxt.success(instanceList);
        }}), function(transaction) {
            var ss = that.selectMostRecentFromDataTableStmt(dbTableName, selection, selectionArgs, orderBy);
            ctxt.sqlStatement = ss;
            transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
                for ( var i = 0 ; i < result.rows.length ; i+=1 ) {
                    var instance = result.rows.item(i);
                    var ts = new Date(instance._savepoint_timestamp);
                    instanceList.push({
                        display_field: (displayElementName === undefined || displayElementName === null) ? ts.toISOString(): instance[displayElementName],
                        instance_id: instance._id,
                        savepoint_timestamp: ts,
                        savepoint_type: instance._savepoint_type,
                        locale: instance._locale,
                        form_id: instance._form_id
                    });
                }
            });
        });
},
/**
 * Process instanceMetadataKeyValueMap and add entries to kvMap.
 * Common code to construct the update kvMap for arguments passed
 * in on the command line.
 */
processPassedInKeyValueMap: function(kvMap, instanceMetadataKeyValueMap) {
    var that = this;
    var propList = '';
    var propertyCount = 0;
    for ( var f in instanceMetadataKeyValueMap ) {
        propList = propList + ' ' + f;
        ++propertyCount;
        // determine if f is metadata or not...
        var metaField, isMetadata;
        var found = false;
        for ( var g in that.dataTablePredefinedColumns ) {
            var eDefn = that.dataTablePredefinedColumns[g];
            var eName = g;
            if ( 'elementPath' in eDefn ) {
                eName = eDefn.elementPath;
            }
            if ( f === eName ) {
                found = true;
                metaField = g;
                isMetadata = (eDefn.elementSet === 'instanceMetadata');
                break;
            }
        }
        
        if ( found ) {
            kvMap[metaField] = { value: instanceMetadataKeyValueMap[f], 
                                 isInstanceMetadata: isMetadata };
        } else {
            // TODO: convert f from elementPath into elementKey
            kvMap[f] = { value: instanceMetadataKeyValueMap[f], 
                                 isInstanceMetadata: false };
        }
    }
    
    if ( propertyCount !== 0 ) {
        shim.log('I',"Extra arguments found in instanceMetadataKeyValueMap" + propList);
    }
},
initializeInstance:function(ctxt, instanceId, instanceMetadataKeyValueMap) {
    var that = this;
    instanceMetadataKeyValueMap = instanceMetadataKeyValueMap || {};
    if ( instanceId === undefined || instanceId === null ) {
        ctxt.append('initializeInstance.noInstance');
        mdl.metadata = {};
        mdl.data = {};
        mdl.loaded = false;
        ctxt.success();
    } else {
        ctxt.append('initializeInstance.access', instanceId);
        var tmpctxt = $.extend({},ctxt,{success:function() {
                that.cacheAllData(ctxt, instanceId);
            }});
        that.withDb( tmpctxt, function(transaction) {
            var cs = that._selectDataTableCountStmt(mdl.tableMetadata.dbTableName, instanceId);
            tmpctxt.sqlStatement = cs;
            transaction.executeSql(cs.stmt, cs.bind, function(transaction, result) {
                var count = 0;
                if ( result.rows.length === 1 ) {
                    var row = result.rows.item(0);
                    count = row['rowcount'];
                }
                if ( count === undefined || count === null || count === 0) {
                    ctxt.append('initializeInstance.insertEmptyInstance');
                    // construct a friendly name for this new form...
                    var date = new Date();
                    var dateStr = date.toISOString();
                    var locale = opendatakit.getDefaultFormLocale(mdl.formDef);
                    
                    var kvMap = {};
                    kvMap._id = { value: instanceId, isInstanceMetadata: true };
                    kvMap._locale = { value: locale, isInstanceMetadata: true };
                    // overwrite these with anything that was passed in...
                    that.processPassedInKeyValueMap(kvMap, instanceMetadataKeyValueMap);
                    
                    var cs = that._insertNewKeyValueMapDataTableStmt(mdl.tableMetadata.dbTableName, mdl.dataTableModel, kvMap);
                    tmpctxt.sqlStatement = cs;
                    transaction.executeSql(cs.stmt, cs.bind);
                } else {
                    // apply changes to the instance 
                    var kvMap = {};
                    // gather anything that was passed in...
                    that.processPassedInKeyValueMap(kvMap, instanceMetadataKeyValueMap);
                    if ( !$.isEmptyObject(kvMap) ) {
                        var cs = that._insertKeyValueMapDataTableStmt(mdl.tableMetadata.dbTableName, mdl.dataTableModel, instanceId, kvMap);
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
        ctxt.append('getAllTableMetaData.success');
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
                            
    ctxt.append('initializeTables');
    var tmpctxt = $.extend({},ctxt,{success:function() {
                ctxt.append('readTableDefinition.success');
                ctxt.success(tlo);
            }});
    that.withDb(tmpctxt, function(transaction) {
                // now insert records into these tables...
                var ss = that._selectTableDefinitionsDataStmt(table_id);
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
_clearPersistedFlag: function( dbKeyMap, listChildElementKeys) {
    var i;
    var f;
    if ( listChildElementKeys != null ) {
        for ( i = 0 ; i < listChildElementKeys.length ; ++i ) {
            var f = listChildElementKeys[i];
            var jsonType = dbKeyMap[f];
            jsonType.isPersisted = false;
            if ( jsonType.type === 'array' ) {
                this._clearPersistedFlag(dbKeyMap, jsonType.listChildElementKeys);
            } else if ( jsonType.type === 'object' ) {
                this._clearPersistedFlag(dbKeyMap, jsonType.listChildElementKeys);
            }
        }
    }
},
_flattenElementPath: function( dbKeyMap, elementPathPrefix, elementName, elementKeyPrefix, jsonType ) {
    var fullPath;
    var elementKey;
    var i = 0;

    // remember the element name...
    jsonType.elementName = elementName;
    // and the set is 'data' because it comes from the data model...
    jsonType.elementSet = 'data';
    
    // update element path prefix for recursive elements
    elementPathPrefix = ( elementPathPrefix === undefined || elementPathPrefix === null ) ? elementName : (elementPathPrefix + '.' + elementName);
    // and our own element path is exactly just this prefix
    jsonType.elementPath = elementPathPrefix;

    // use the user's elementKey if specified
    elementKey = jsonType.elementKey;

    if ( elementKey === undefined || elementKey === null ) {
        throw new Error("elementKey is not defined for '" + jsonType.elementPath + "'.");
    }

    // simple error tests...
    // throw an error if the elementkey is longer than 62 characters
    // or if it is already being used and not by myself...
    if ( elementKey.length > 62 ) {
        throw new Error("supplied elementKey is longer than 62 characters");
    }
    if ( dbKeyMap[elementKey] !== undefined && dbKeyMap[elementKey] !== null && dbKeyMap[elementKey] != jsonType ) {
        throw new Error("supplied elementKey is already used (autogenerated?) for another model element");
    }
    if ( elementKey.charAt(0) === '_' ) {
        throw new Error("supplied elementKey starts with underscore");
    }

    // assume the primitive types are persisted.
    // this will be updated if there is an outer array or object
    // that persists itself (below).
    if ( jsonType.type === 'string' || 
            jsonType.type === 'number' || 
            jsonType.type === 'integer' ||
            jsonType.type === 'boolean' ) {
        // these should be persisted...
        jsonType.isPersisted = true;
    }

    // remember the elementKey we have chosen...
    dbKeyMap[elementKey] = jsonType;

    // handle the recursive structures...
    if ( jsonType.type === 'array' ) {
        // explode with subordinate elements
        f = this._flattenElementPath( dbKeyMap, elementPathPrefix, 'items', elementKey, jsonType.items );
        jsonType.listChildElementKeys = [ f.elementKey ];
        jsonType.isPersisted = true;
    } else if ( jsonType.type === 'object' ) {
        // object...
        var hasProperties = false;
        var e;
        var f;
        var listChildElementKeys = [];
        for ( e in jsonType.properties ) {
            hasProperties = true;
            f = this._flattenElementPath( dbKeyMap, elementPathPrefix, e, elementKey, jsonType.properties[e] );
            listChildElementKeys.push(f.elementKey);
        }
        jsonType.listChildElementKeys = listChildElementKeys;
        if ( !hasProperties ) {
            jsonType.isPersisted = true;
        }
    }

    if ( jsonType.isPersisted && (jsonType.listChildElementKeys != null)) {
        // we have some sort of structure that is persisting
        // clear the isPersisted tags on the nested elements
        this._clearPersistedFlag(dbKeyMap, jsonType.listChildElementKeys);
    }
    return jsonType;
},
/**
  writeDatabase = true if the database should be written. False if we are just building the metadata.
 */
_insertTableAndColumnProperties:function(transaction, ctxt, tlo, writeDatabase) {
    var that = this;
    var fullDef = {
        _table_definitions: [],
        _key_value_store_active: [],
        _column_definitions: []
        };

    ctxt.append('database._insertTableAndColumnProperties writeDatabase: ' + writeDatabase);
    var displayColumnOrder = [];
    
    // TODO: synthesize dbTableName from some other source...
    var dbTableName = tlo.table_id;
    // dataTableModel holds an inversion of the tlo.formDef.model
    //
    //  elementKey : jsonSchemaType
    //
    // with the addition of:
    //    isPersisted : true if elementKey is a dbColumnName
    //    elementPath : pathToElement
    //    elementSet : 'data'
    //    listChildElementKeys : ['key1', 'key2' ...]
    //
    // within the jsonSchemaType to be used to transform to/from
    // the model contents and data table representation.
    //    
    var dataTableModel = {};
    var f;
    for ( f in that.dataTablePredefinedColumns ) {
        dataTableModel[f] = that.dataTablePredefinedColumns[f];
    }
    
    // go through the supplied tlo.formDef model
    // and invert it into the dataTableModel
    var jsonDefn;
    for ( f in tlo.formDef.specification.model ) {
        jsonDefn = that._flattenElementPath( dataTableModel, null, f, null, tlo.formDef.specification.model[f] );
    }

    // and now traverse the dataTableModel making sure all the
    // elementSet: 'data' values have columnDefinitions entries.
    //
    for ( var dbColumnName in dataTableModel ) {
        // case: simple type
        // TODO: case: geopoint -- expand to different persistence columns
        jsonDefn = dataTableModel[dbColumnName];
        
        if ( jsonDefn.elementSet === 'data' ) {
            var surveyElementName = jsonDefn.elementName;
            var surveyDisplayName = (jsonDefn.displayName === undefined || jsonDefn.displayName === null) ? surveyElementName : jsonDefn.displayName;
            
            fullDef._column_definitions.push( {
                _table_id: tlo.table_id,
                _element_key: dbColumnName,
                _element_name: jsonDefn.elementName,
                _element_type: (jsonDefn.elementType === undefined || jsonDefn.elementType === null ? jsonDefn.type : jsonDefn.elementType),
                _list_child_element_keys : ((jsonDefn.listChildElementKeys === undefined || jsonDefn.listChildElementKeys === null) ? null : JSON.stringify(jsonDefn.listChildElementKeys)),
                _is_persisted : (jsonDefn.isPersisted ? 1 : 0)
            } );
            
            // displayed columns within Tables, at least for now, are the persisted columns only.
            if ( jsonDefn.isPersisted ) {
                displayColumnOrder.push(dbColumnName);
            }

            fullDef._key_value_store_active.push( {
                _table_id: tlo.table_id,
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "displayVisible",
                _type: "boolean",
                _value: true
            } );
            fullDef._key_value_store_active.push( {
                _table_id: tlo.table_id,
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "displayName",
                _type: "string",
                _value: JSON.stringify(surveyDisplayName) // this is a localizable string...
            } );
            fullDef._key_value_store_active.push( {
                _table_id: tlo.table_id,
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "displayChoicesList",
                _type: "string",
                _value: ((jsonDefn.choicesList === undefined || jsonDefn.choicesList === null) ? "" : JSON.stringify(tlo.formDef.specification.choices[jsonDefn.choicesList]))
            } );
            fullDef._key_value_store_active.push( {
                _table_id: tlo.table_id,
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "displayFormat",
                _type: "string",
                _value: (jsonDefn.displayFormat === undefined || jsonDefn.displayFormat === null) ? "" : jsonDefn.displayFormat
            } );
            fullDef._key_value_store_active.push( {
                _table_id: tlo.table_id,
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "smsIn",
                _type: "boolean",
                _value: true
            } );
            fullDef._key_value_store_active.push( {
                _table_id: tlo.table_id,
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "smsOut",
                _type: "boolean",
                _value: true
            } );
            fullDef._key_value_store_active.push( {
                _table_id: tlo.table_id,
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "smsLabel",
                _type: "string",
                _value: ""
            } );
            fullDef._key_value_store_active.push( {
                _table_id: tlo.table_id,
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "footerMode",
                _type: "string",
                _value: 'none'
            } );
            fullDef._key_value_store_active.push( {
                _table_id: tlo.table_id,
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "joins",
                _type: "string",
                _value: ""
            } );
        }
    }

    fullDef._table_definitions.push( { 
        _table_id: tlo.table_id, 
        _table_key: dbTableName, 
        _db_table_name: dbTableName, 
        _sync_tag: "", 
        _last_sync_time: -1, 
        _sync_state: 'rest', 
        _transactioning: 0 } );

    // construct the kvPairs to insert into kvstore
    fullDef._key_value_store_active.push( { _table_id: tlo.table_id, _partition: "Table", _aspect: "default", _key: 'tableType', _type: 'string', _value: 'data' } );
    fullDef._key_value_store_active.push( { _table_id: tlo.table_id, _partition: "Table", _aspect: "default", _key: 'accessControlTableId', _type: 'string', _value: '' } );
    fullDef._key_value_store_active.push( { _table_id: tlo.table_id, _partition: "Table", _aspect: "default", _key: 'displayName', _type: 'string', _value: JSON.stringify(opendatakit.getSectionTitle(tlo.formDef, 'survey')) } );
    fullDef._key_value_store_active.push( { _table_id: tlo.table_id, _partition: "Table", _aspect: "default", _key: 'colOrder', _type: 'string', _value: JSON.stringify(displayColumnOrder) } );
    fullDef._key_value_store_active.push( { _table_id: tlo.table_id, _partition: "Table", _aspect: "default", _key: 'primeCols', _type: 'string', _value: '' } );
    fullDef._key_value_store_active.push( { _table_id: tlo.table_id, _partition: "Table", _aspect: "default", _key: 'sortCol', _type: 'string', _value: '' } );
    fullDef._key_value_store_active.push( { _table_id: tlo.table_id, _partition: "Table", _aspect: "default", _key: 'indexCol', _type: 'string', _value: '' } );
    fullDef._key_value_store_active.push( { _table_id: tlo.table_id, _partition: "Table", _aspect: "default", _key: 'currentViewType', _type: 'string', _value: 'Spreadsheet' } );
    fullDef._key_value_store_active.push( { _table_id: tlo.table_id, _partition: "Table", _aspect: "default", _key: 'summaryDisplayFormat', _type: 'string', _value: '' } );
    fullDef._key_value_store_active.push( { _table_id: tlo.table_id, _partition: "Table", _aspect: "default", _key: 'currentQuery', _type: 'string', _value: '' } );

    // get first property in fullDef -- we use native iteration ordering to step through the properties.
    var tableToUpdate = null;
    for ( var prop in fullDef ) {
        tableToUpdate = prop;
        break;
    }

    if ( writeDatabase ) {
        tlo.dataTableModel = dataTableModel;
        var createTableCmd = this._createTableStmt(dbTableName, dataTableModel);
        ctxt.sqlStatement = createTableCmd;
        transaction.executeSql(createTableCmd.stmt, createTableCmd.bind, function(transaction, result) {
            that.fullDefHelper(transaction, ctxt, tableToUpdate, 0, fullDef, tlo);
        });
    } else {
        // we don't need to write the database -- just update everything
        tlo.dataTableModel = dataTableModel;
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
    var path = name.split('.');
    var v = mdl.data;
    for ( var i = 0 ; i < path.length ; ++i ) {
        v = v[path[i]];
        if ( v === undefined || v === null ) {
            return null;
        }
    }
    return v;
},
getInstanceMetaDataValue:function(name) {
    var path = name.split('.');
    var v = mdl.metadata;
    for ( var i = 0 ; i < path.length ; ++i ) {
        v = v[path[i]];
        if ( v === undefined || v === null ) {
            return v;
        }
    }
    return v;
},
setInstanceMetaData:function(ctxt, name, value) {
    ctxt.append('setInstanceMetaData: ' + name);
    var that = this;
    that.putInstanceMetaData($.extend({}, ctxt, {success: function() {
                that.cacheAllData(ctxt, opendatakit.getCurrentInstanceId());
            }}), name, value);
},
// TODO: table metadata is under mdl.tableMetadata
// TODO: column metadata is under mdl.columnMetadata
getTableMetaDataValue:function(name) {
    var path = name.split('.');
    var v = mdl.tableMetadata;
    for ( var i = 0 ; i < path.length ; ++i ) {
        v = v[path[i]];
        if ( v === undefined || v === null ) {
            return v;
        }
    }
    return v;
},
getAllDataValues:function() {
    return mdl.data;
},
purge:function(ctxt) {
    var that = this;
    ctxt.append('database.purge.initiated');
    var tableSets = [];
    that.withDb( $.extend({},ctxt,{success:function() {
            // OK we have tableSets[] constructed.
            // Now drop all those tables and delete contents from metadata tables
            that.withDb( ctxt, function(transaction) {
                var i, sql, tableEntry;
                for ( i = 0 ; i < tableSets.length ; ++i ) {
                    tableEntry = tableSets[i];
                    sql = that._dropTableStmt(tableEntry.dbTableName);
                    ctxt.sqlStatement = sql;
                    transaction.executeSql(sql.stmt, sql.bind);
                }
                sql = that._deleteEntireTableContentsTableStmt('key_value_store_active');
                ctxt.sqlStatement = sql;
                transaction.executeSql(sql.stmt, sql.bind);
                
                sql = that._deleteEntireTableContentsTableStmt('_column_definitions');
                ctxt.sqlStatement = sql;
                transaction.executeSql(sql.stmt, sql.bind);

                sql = that._deleteEntireTableContentsTableStmt('_table_definitions');
                ctxt.sqlStatement = sql;
                transaction.executeSql(sql.stmt, sql.bind);
            });
        }}), function(transaction) {
        var is = that._selectAllTableDbNamesAndIdsDataStmt();
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
discoverTableFromTableId:function(ctxt, table_id) {
},
setValueDeferredChange: function( name, value ) {
    var justChange = {};
    justChange[name] = {value: value, isInstanceMetadata: false };
    this.pendingChanges[name] = {value: value, isInstanceMetadata: false };
    // apply the change immediately...
    var is = this._insertKeyValueMapDataTableStmt(mdl.tableMetadata.dbTableName, 
                    mdl.dataTableModel, opendatakit.getCurrentInstanceId(), justChange);
    var uf;
    for (var f in is.updates) {
        var uf = is.updates[f];
        var de = mdl.dataTableModel[f];
        if (de.isPersisted) {
            var elementPath = de.elementPath || uf.elementPath;
            if ( de.elementSet === 'instanceMetadata' ) {
                this._reconstructElementPath(elementPath, de, uf.value, mdl.metadata );
            } else {
                this._reconstructElementPath(elementPath, de, uf.value, mdl.data );
            }
        }
    }
},
applyDeferredChanges: function(ctxt) {
    var changes = this.pendingChanges;
    this.pendingChanges = {};
    this.putDataKeyValueMap($.extend({},ctxt,{failure:function(m) {
        // a failure happened during writing -- reload state from db
        mdl.loaded = false;
        that.cacheAllData($.extend({},ctxt,{success:function() {
                ctxt.failure(m);
            }, failure:function(m2) {
                ctxt.failure(m);
            }}), opendatakit.getCurrentInstanceId());
        }}), changes );
}
};
});
