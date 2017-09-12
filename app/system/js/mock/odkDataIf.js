define(['mockImpl', 'mockUtils', 'mockSchema', 'mockDbif', 'jquery'],function(mockImpl, mockUtils,  mockSchema, mockDbif, $) {
/* global odkCommon */
'use strict';
verifyLoad('mockImpl',
    ['mockImpl', 'mockUtils', 'mockSchema', 'mockDbif', 'jquery'],
    [mockImpl,    mockUtils,   mockSchema,   mockDbif,  $]);
var odkDataIf = {
    _responseQueue: [],

    _queueResponse: function(resp) {
        this._responseQueue.push(resp);
        setTimeout( function() { window.odkData.responseAvailable(); }, 10 );
    },
    eventCount: 1,
    outstandingContexts: [],
    removeAndLogOutstandingContexts: function(ctxt) {
        var that = this;
        var i;
        for ( i = 0 ; i < that.outstandingContexts.length ; ++i ) {
            if ( that.outstandingContexts[i] === ctxt.seq ) {
                that.outstandingContexts.splice(i,1);
                break;
            }
        }
        if ( that.outstandingContexts.length === 0 ) {
                ctxt.log('D',"atEnd.outstandingContext nothingOutstanding!");
        } else {
            for ( i = 0 ; i < that.outstandingContexts.length ; ++i ) {
                ctxt.log('W',"atEnd.outstandingContext seqNo: " + that.outstandingContexts[i]);
            }
        }
    },
    baseContext : {
        loggingContextChain: [],

        log : function( severity, method, detail ) {
            var now = new Date().getTime();
            var log_obj = {method: method, timestamp: now, detail: detail };
            if ( this.loggingContextChain.length === 0 ) {
                this.loggingContextChain.push( log_obj );
            }
            var dlog =  method + " (seq: " + this.seq + " timestamp: " + now +
                   ((detail === null || detail === undefined) ? ")" : (") detail: " + detail));
            odkCommon.log(severity, dlog);
        },

        success: function(){
            this.updateAndLogOutstandingContexts(this);
            this._log('S', 'success!');
        },

        failure: function(m) {
            this.updateAndLogOutstandingContexts(this);
            this._log('E', 'failure! ' +
                (( m !== null && m !== undefined && m.message !== null && m.message !== undefined) ? m.message : ""));
        },
        _log: function( severity, contextMsg ) {
            var value = this.loggingContextChain[0];
            var flattened = contextMsg + " contextType: " + value.method + " (" +
                value.detail + ") seqAtEnd: " + this.getCurrentSeqNo();
            var pi = JSON.parse(odkCommon.getPlatformInfo());
            var ll = (pi && pi.logLevel) ? pi.logLevel : 'D';
            switch(severity) {
            case 'S':
                odkCommon.log(severity, flattened);
                break;
            case 'F':
                odkCommon.log(severity, flattened);
                break;
            case 'E':
                odkCommon.log(severity, flattened);
                break;
            case 'W':
                if ( ll !== 'E' ) {
                    odkCommon.log(severity, flattened);
                }
                break;
            case 'I':
                if ( ll !== 'E' && ll !== 'W' ) {
                    odkCommon.log(severity, flattened);
                }
                break;
            case 'D':
                if ( ll !== 'E' && ll !== 'W' && ll !== 'I' ) {
                    odkCommon.log(severity, flattened);
                }
                break;
            case 'T':
                if ( ll !== 'E' && ll !== 'W' && ll !== 'I' && ll !== 'D' ) {
                    odkCommon.log(severity, flattened);
                }
                break;
            default:
                odkCommon.log(severity, flattened);
                break;
            }
        }
    },
    newStartContext: function(_callbackId) {
        var that = this;
        that.eventCount = 1 + that.eventCount;
        var count = that.eventCount;
        that.outstandingContexts.push(count);
        var now = new Date().getTime();
        var detail =  "seq: " + count + " timestamp: " + now;
        var ctxt = $.extend({}, that.baseContext,
            { seq: count,
              loggingContextChain: [],
              getCurrentSeqNo:function() { return that.eventCount;},
              updateAndLogOutstandingContexts:function() { that.removeAndLogOutstandingContexts(this); } },
            { success: function(content) {
                    content.callbackJSON = _callbackId;
                    that._queueResponse( JSON.stringify(content) );
                },
              failure: function(m) {
                    var content = {
                        callbackJSON: _callbackId,
                        error: m.message };
                    that._queueResponse( JSON.stringify(content) );
                }
            });
        ctxt.log('D','startup', detail);
        return ctxt;
    },

    /**
     * Remove the first queued response and return it.
     */
    getResponseJSON: function() {
        if ( this._responseQueue.length !== 0 ) {
            var result = this._responseQueue[0];
            this._responseQueue.shift();
            return result;
        }
        return null;
    },

    getViewData : function (_callbackId, limit, offset) {
        var that = this;
        var ctxt = that.newStartContext(_callbackId);
        ctxt.failure({message: "not implemented"});
    },

    _tableDefs: {},

    ////////////////////////////////////////////////
    // Internal methods to construct database tables
    ////////////////////////////////////////////////

    _importAsynchronousText: function(script, completeFn) {
        var that = this;
        // script is appName-relative -- need to prepend the appName.

        var path = window.location.pathname;
        if ( path[0] === '/' ) {
            path = path.substr(1);
        }
        if ( path[path.length-1] === '/' ) {
            path = path.substr(0,path.length-1);
        }
        var parts = path.split('/');
        // IMPORTANT: ajax doesn't like the explicit
        // scheme and hostname. Drop those, and just
        // specify a URL (starting with /).
        var urlScript = window.odkCommonIf._computeBaseUri() + script;

        // get the script body
        var jqxhr = $.ajax({
            type: 'GET',
            cache: true,
            ifModified: false,
            url: urlScript,
            dataType: 'text',
            async: true,
            complete: completeFn
        });
    },

    _getTableDef: function(defCtxt, tableId) {
        var that = this;

        if ( tableId === null || tableId === undefined ) {
            defCtxt.failure({message: "tableId cannot be null"});
            return;
        }

        if ( tableId === "framework" ) {
            defCtxt.failure({message: "tableId cannot be 'framework'"});
            return;
        }

        var def = that._tableDefs[tableId];
        if ( def !== null && def !== undefined ) {
            defCtxt.success(def);
            return;
        }
        // otherwise, we need to reconstruct a defn.
        def = {};
        def.tableId = tableId;

        var formPath;
        if ( tableId === 'framework' ) {
            formPath = "config/assets/framework/forms/framework/formDef.json";
        } else {
            formPath = "config/tables/" + tableId + "/forms/" + tableId + "/formDef.json";
        }
        that._importAsynchronousText(formPath, function (jqXHR, textStatus ) {
            if ( textStatus !== "success" ) {
                throw Error("Unable to read " + formPath);
            }

            var formDef = JSON.parse(jqXHR.responseText);

            // and we need to fold in the admin columns to construct the data table model...
            def.dataTableModel = formDef.specification.dataTableModel;

            var ctxt = $.extend({}, defCtxt, {
                success: function() {
                    that._tableDefs[tableId] = def;
                    defCtxt.success(def);
                }
            });
            mockImpl.withDb(ctxt,
            function (transaction) {
                ctxt.sqlStatement = {
                    stmt : "select _schema_etag, _last_data_etag, _last_sync_time from _table_definitions where _table_id = ?",
                    bind : [tableId]
                };
                transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                function(transaction, result) {
                    if ( result.rows.length === 0 ) {
                        that._defineTable(ctxt, transaction, tableId, def, formDef);
                    } else {
                        var row = result.rows.item(0);
                        def.schemaETag = row._schema_etag;
                        def.lastDataETag = row._last_data_etag;
                        def.lastSyncTime = row._last_sync_time;
                        ctxt.sqlStatement = {
                            stmt : "select _partition, _aspect, _key, _type, _value from _key_value_store_active where _table_id = ? order by _partition ASC, _aspect ASC, _key ASC",
                            bind : [tableId]
                        };
                        transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                        function(transaction, result) {
                            var count = result.rows.length;
                            var keyValueList = [];
                            var i;
                            for ( i = 0 ; i < count ; ++i ) {
                                var row = result.rows.item(i);
                                var kvsEntry = {};
                                kvsEntry.partition = row._partition;
                                kvsEntry.aspect = row._aspect;
                                kvsEntry.key = row._key;
                                kvsEntry.type = row._type;
                                var value = row._value;
                                kvsEntry.value = mockUtils.fromKVStoreToElementType(kvsEntry.type, value);
                                keyValueList.push(kvsEntry);
                            }
                            def.keyValueStoreList = keyValueList;
                        });
                    }
                });
            });
        });
    },
    _defineTableColumnsEntry: function(ctxt, transaction, tableId, def, formDef, colDefs) {
        var that = this;
        if ( colDefs === null || colDefs === undefined || colDefs.length === 0 ) {
            def.schemaETag = null;
            def.lastDataETag = null;
            def.lastSyncTime = -1;
            ctxt.sqlStatement = {
                stmt : "insert into _table_definitions ( _table_id, _schema_etag, _last_data_etag, _last_sync_time ) values ( ?, null, null, -1)",
                bind : [tableId]
            };
            transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
            function(transaction, result) {
                // we are done creating the table and its metadata!
            });
        } else {
            var colDef = colDefs.shift();
            ctxt.sqlStatement = {
                stmt : "insert into _column_definitions ( _table_id, _element_key, _element_name, _element_type, _list_child_element_keys ) values ( ?, ?, ?, ?, ? )",
                bind : [tableId,
                        colDef._element_key,
                        colDef._element_name,
                        colDef._element_type,
                        colDef._list_child_element_keys]
            };
            transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
            function(transaction, result) {
                that._defineTableColumnsEntry(ctxt, transaction, tableId, def, formDef, colDefs);
            });
        }
    },
    _defineTableColumns: function(ctxt, transaction, tableId, def, formDef) {
        var that = this;
        ctxt.sqlStatement = {
            stmt : "delete from _column_definitions where _table_id = ?",
            bind : [tableId]
        };
        transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
        function(transaction, result) {

            var colDefs = [];

            for ( var dbColumnName in def.dataTableModel ) {
                if ( def.dataTableModel.hasOwnProperty(dbColumnName) ) {
                    // the XLSXconverter already handles expanding complex types
                    // such as geopoint into their underlying storage representation.
                    var jsonDefn = def.dataTableModel[dbColumnName];

                    if ( jsonDefn.elementSet === 'data' && !jsonDefn.isSessionVariable ) {
                        colDefs.push( {
                            _table_id: tableId,
                            _element_key: dbColumnName,
                            _element_name: jsonDefn.elementName,
                            _element_type: (jsonDefn.elementType === undefined || jsonDefn.elementType === null ? jsonDefn.type : jsonDefn.elementType),
                            _list_child_element_keys : ((jsonDefn.listChildElementKeys === undefined || jsonDefn.listChildElementKeys === null) ? JSON.stringify([]) : JSON.stringify(jsonDefn.listChildElementKeys))
                        } );
                    }
                }
            }
            // create the data table
            ctxt.sqlStatement = mockSchema.createTableStmt(tableId, def.dataTableModel);
            transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
            function(transaction, result) {
                that._defineTableColumnsEntry(ctxt, transaction, tableId, def, formDef, colDefs);
            });
        });
    },
    _defineTableKVS: function(ctxt, transaction, tableId, def, formDef, properties) {
        var that = this;
        if ( properties === null || properties === undefined || properties.length === 0 ) {
            // retrieve the KVS entries we just added...
            ctxt.sqlStatement = {
                stmt : "select _partition, _aspect, _key, _type, _value from _key_value_store_active where _table_id = ? order by _partition ASC, _aspect ASC, _key ASC",
                bind : [tableId]
            };
            transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
            function(transaction, result) {
                var count = result.rows.length;
                var keyValueList = [];
                var i;
                for ( i = 0 ; i < count ; ++i ) {
                    var row = result.rows.item(i);
                    var kvsEntry = {};
                    kvsEntry.partition = row._partition;
                    kvsEntry.aspect = row._aspect;
                    kvsEntry.key = row._key;
                    kvsEntry.type = row._type;
                    var value = row._value;
                    kvsEntry.value = mockUtils.fromKVStoreToElementType(kvsEntry.type, value);
                    keyValueList.push(kvsEntry);
                }
                def.keyValueStoreList = keyValueList;
                // now define columns
                that._defineTableColumns(ctxt, transaction, tableId, def, formDef);
            });
        } else {
            var kvsProperty = properties.shift();
            ctxt.sqlStatement = {
                stmt : "insert into _key_value_store_active ( _table_id, _partition, _aspect, _key, _type, _value) values (?, ?, ?, ?, ?, ?)",
                bind : [tableId,
                        kvsProperty._partition,
                        kvsProperty._aspect,
                        kvsProperty._key,
                        kvsProperty._type,
                        kvsProperty._value]
            };
            transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
            function(transaction, result) {
                that._defineTableKVS(ctxt, transaction ,tableId, def, formDef, properties);
            });
        }
    },
    _defineTable: function(ctxt, transaction, tableId, def, formDef) {
        var that = this;
        ctxt.sqlStatement = {
            stmt : "delete from _key_value_store_active where _table_id = ?",
            bind : [tableId]
        };
        transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
        function(transaction, result) {
            def.keyValueStoreList = [];
            that._defineTableKVS(ctxt, transaction, tableId, def, formDef, formDef.specification.properties);
        });
    },
    _constructResponse: function( ctxt, tableDef, sqlStatement ) {
        var that = this;
        var content = {};
        content.metadata = {};

        mockImpl.withDb($.extend({}, ctxt, {
            success: function() {
                ctxt.success(content);
            }
        }), function (transaction) {
            ctxt.sqlStatement = sqlStatement;
            transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                function(transaction, result) {
                    var count = result.rows.length;
                    // this is approximate.
                    var first = true;
                    var elementNameMap = {};
                    var defElement;
                    var dbValue;
                    var value;
                    var f;
                    var mdlf;
                    var i;
                    var j;
                    var resultRows = [];
                    var row;
                    var rowArray;
                    for ( i = 0 ; i < count ; ++i ) {
                        row = result.rows.item(i);
                        if ( first ) {
                            first = false;
                            // initialize the elementNameMap
                            j = 0;
                            for ( f in row ) {
                                if ( row.hasOwnProperty(f) ) {
                                    elementNameMap[f] = j;
                                    ++j;
                                }
                            }
                        }
                        rowArray = [];
                        for ( f in row ) {
                            if ( row.hasOwnProperty(f) ) {
                                mdlf = f;
                                if ( f.lastIndexOf('.') != -1 ) {
                                    mdlf = f.substring(f.lastIndexOf('.')+1);
                                }
                                defElement = tableDef.dataTableModel[mdlf];
                                if ( defElement === null || defElement === undefined ) {
                                    dbValue = row[f];
                                    // don't do any conversion
                                    rowArray.push(dbValue);
                                } else if ( mockUtils.isUnitOfRetention(defElement) && !defElement.isSessionVariable ) {
                                    dbValue = row[f];
                                    value = mockUtils.fromDatabaseToOdkDataInterfaceElementType( defElement, dbValue );
                                    rowArray.push(value);
                                }
                            }
                        }
                        resultRows.push(rowArray);
                    }

                    if ( $.isEmptyObject(elementNameMap) ) {
                        // fake it -- assume these are in the order they appear in dataTableModel
                        i = 0;
                        for ( f in tableDef.dataTableModel ) {
                            if ( tableDef.dataTableModel.hasOwnProperty(f) ) {
                                var entry = tableDef.dataTableModel[f];
                                if ( !entry.isSessionVariable && !entry.notUnitOfRetention ) {
                                    elementNameMap[entry.elementKey] = i;
                                    ++i;
                                }
                            }
                        }
                    }
                    content.data = resultRows;
                    content.metadata = {};
                    content.metadata.tableId = tableDef.tableId;
                    content.metadata.schemaETag = tableDef.schemaETag;
                    content.metadata.lastDataETag = tableDef.lastDataETag;
                    content.metadata.lastSyncTime = tableDef.lastSyncTime;
                    content.metadata.elementKeyMap = elementNameMap;
                    // TODO: determine the correct value for this
                    content.metadata.canCreateRow = true;
                    // HACK: always use the cached metadata if it is present
                    var metaDataRev = window.odkData._getTableMetadataRevision(tableDef.tableId);
                    if ( metaDataRev === null || metaDataRev === undefined ) {
                        content.metadata.cachedMetadata = {};
                        // this can be any value...
                        metaDataRev = that.eventCount;
                        content.metadata.cachedMetadata.metaDataRev = metaDataRev;
                        
                        // the tableDef.dataTableModel is fully expanded. Create the minimal
                        // model by removing the nested elements from the list. Those are the 
                        // ones with an elementPath !== elementKey.
                        var dataTableModelAdjusted = {};
                        var ddef; 
                        
                        for ( f in tableDef.dataTableModel ) {
                            if ( tableDef.dataTableModel.hasOwnProperty(f) ) {
                                ddef = tableDef.dataTableModel[f];
                                if ( ddef.elementPath === ddef.elementKey ) {
                                    dataTableModelAdjusted[f] = ddef;
                                }
                            }
                        }
                        content.metadata.cachedMetadata.dataTableModel = dataTableModelAdjusted;
                        // synthesize the choiceListMap and the choice-compressed keyValueStoreList
                        // the later is the same as the tableDef.keyValueStoreList except that 
                        // any displayChoicesList is collapsed into a property string and the value is moved
                        // into the choiceListMap, referenced by that property string.
                        var choiceNamesMap = {};
                        var kvsListAdjusted = [];
                        var fmatch;
                        var kvs;
                        var kvsNew;
                        for ( i = 0 ; i < tableDef.keyValueStoreList.length ; ++i ) {
                            kvs = tableDef.keyValueStoreList[i];
                            if ( kvs.partition === "Column" && 
                                 kvs.key === "displayChoicesList" && 
                                 kvs.value !== null ) {
                                fmatch = null;
                                for ( f in choiceNamesMap ) {
                                    if ( choiceNamesMap.hasOwnProperty(f) ) {
                                        ddef = choiceNamesMap[f];
                                        if ( ddef === kvs.value ) {
                                            fmatch = f;
                                            break;
                                        }
                                    }
                                }
                                if ( fmatch === null ) {
                                    fmatch = 'a_' + i;
                                    choiceNamesMap[fmatch] = kvs.value;
                                }
                                kvsNew = $.extend({}, kvs);
                                kvsNew.value = fmatch;
                                kvsListAdjusted.push(kvsNew);
                            } else {
                                kvsListAdjusted.push(kvs);
                            }
                        }
                        content.metadata.cachedMetadata.keyValueStoreList = kvsListAdjusted;
                        content.metadata.cachedMetadata.choiceListMap = choiceNamesMap;
                    }
                });
        });
    },

    getRoles: function(_callbackId) {
        var that = this;

        var ctxt = that.newStartContext(_callbackId);

        throw new Error("Not implemented in app-designer");
    },

    getDefaultGroup: function(_callbackId) {
        var that = this;

        var ctxt = that.newStartContext(_callbackId);

        throw new Error("Not implemented in app-designer");
    },

    getUsers: function(_callbackId) {
        var that = this;

        var ctxt = that.newStartContext(_callbackId);

        throw new Error("Not implemented in app-designer");
    },

    getAllTableIds: function(_callbackId) {
        var that = this;

        var ctxt = that.newStartContext(_callbackId);

        throw new Error("Not implemented in app-designer");
    },

    query: function(tableId, whereClause, sqlBindParamsJSON, groupBy, having,
            orderByElementKey, orderByDirection, limit, offset, includeKVS, metaDataRev, _callbackId) {
        var that = this;

        var sqlBindParams = (sqlBindParamsJSON === null || sqlBindParamsJSON === undefined) ?
            [] : JSON.parse(sqlBindParamsJSON);
            
        var ctxt = that.newStartContext(_callbackId);

        that._getTableDef($.extend({}, ctxt, {
            success: function(tableDef) {
                // TODO: row filtering
                var sql = 'SELECT * FROM "' + tableId + '"';
                if ( whereClause !== null && whereClause !== undefined ) {
                    sql = sql + " WHERE " + whereClause;
                }
                if ( groupBy !== null && groupBy !== undefined ) {
                    sql = sql + " GROUP BY " + groupBy;
                }
                if ( having !== null && having !== undefined ) {
                    sql = sql + " HAVING " + having;
                }
                if ( orderByElementKey !== null && orderByElementKey !== undefined ) {
                    if ( orderByDirection === null || orderByDirection === undefined ) {
                        ctxt.failure({message: "order by direction was not specified"});
                        return;
                    }
                    sql = sql + " ORDER BY " + orderByElementKey + " " + orderByDirection;
                }
                var sqlStatement = {
                        stmt : sql,
                        bind : sqlBindParams,
                        limit : limit,
                        offset : offset
                    };
                that._constructResponse(ctxt, tableDef, sqlStatement);
            }
        }), tableId);
    },

    arbitraryQuery: function(tableId, sqlCommand, sqlBindParamsJSON, limit, offset, metaDataRev, _callbackId) {
        var that = this;

        // TODO: row filtering
        var sqlBindParams = (sqlBindParamsJSON === null || sqlBindParamsJSON === undefined) ?
            [] : JSON.parse(sqlBindParamsJSON);

        var ctxt = that.newStartContext(_callbackId);

        that._getTableDef($.extend({}, ctxt, {
            success: function(tableDef) {
                var sqlStatement = {
                        stmt : sqlCommand,
                        bind : sqlBindParams,
                        limit : limit,
                        offset : offset
                    };
                that._constructResponse(ctxt, tableDef, sqlStatement);
            }
        }), tableId);
    },

    getRows: function(tableId, rowId, metaDataRev, _callbackId) {
        var that = this;

        var ctxt = that.newStartContext(_callbackId);

        if ( rowId === null || rowId === undefined ) {
            ctxt.failure({message: "rowId is not specified!"});
            return;
        }

        that._getTableDef($.extend({}, ctxt, {
            success: function(tableDef) {
                // TODO: row filtering
                var sqlStatement = {
                        stmt : 'select * from "' + tableId + '" where _id=?',
                        bind : [ rowId ]
                    };
                that._constructResponse(ctxt, tableDef, sqlStatement);
            }
        }), tableId);
    },

    _getMostRecentRow: function( ctxt, tableDef, rowId ) {
        var that = this;

        // TODO: row filtering
        var sqlStatement =  {
            stmt : 'select * from "' + tableDef.tableId + '" as T where _id=? and ' +
                    'T._savepoint_timestamp=(select max(V._savepoint_timestamp) from "' +
                    tableDef.tableId + '" as V where V._id=T._id)',
            bind : [rowId]
        };

        that._constructResponse(ctxt, tableDef, sqlStatement);
    },

    getMostRecentRow: function(tableId, rowId, metaDataRev, _callbackId) {
        var that = this;

        var ctxt = that.newStartContext(_callbackId);

        if ( rowId === null || rowId === undefined ) {
            ctxt.failure({message: "rowId is not specified!"});
            return;
        }

        that._getTableDef($.extend({}, ctxt, {
            success: function(tableDef) {
                that._getMostRecentRow(ctxt, tableDef, rowId);
            }
        }), tableId);
    },

    updateRow: function(tableId, stringifiedJSON, rowId, metaDataRev, _callbackId) {
        var that = this;

        var ctxt = that.newStartContext(_callbackId);

        if ( rowId === null || rowId === undefined ) {
            ctxt.failure({message: "rowId is not specified!"});
            return;
        }

        that._getTableDef($.extend({}, ctxt, {
            success: function(tableDef) {
                var changes;
                if ( stringifiedJSON === null || stringifiedJSON === undefined ) {
                    changes = {};
                } else {
                    changes = JSON.parse(stringifiedJSON);
                }
                changes._savepoint_type = "INCOMPLETE";
                // these metadata columns are managed by the database service
                delete changes._id;
                delete changes._savepoint_timestamp;
                delete changes._savepoint_creator; // odkCommon.getActiveUser()
                delete changes._sync_state;

                mockImpl.withDb($.extend({}, ctxt, {
                        success: function() {
                            that._getMostRecentRow(ctxt, tableDef, rowId);
                        }
                    }), function(transaction) {
                        ctxt.sqlStatement = mockSchema.updateChangesDataTableStmt(tableDef, changes, rowId);
                        transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                            function(transaction, result) {});
                });
            }
        }), tableId);
    },

    deleteRow: function(tableId, stringifiedJSON, rowId, metaDataRev, _callbackId) {
        var that = this;

        var ctxt = that.newStartContext(_callbackId);

        if ( rowId === null || rowId === undefined ) {
            ctxt.failure({message: "rowId is not specified!"});
            return;
        }

        that._getTableDef($.extend({}, ctxt, {
            success: function(tableDef) {
                mockImpl.withDb($.extend({}, ctxt, {
                        success: function() {
                            that._getMostRecentRow(ctxt, tableDef, rowId);
                        }
                    }), function(transaction) {
                        // the mocked API will delete everything. 
                        // The device API may return a _sync_state = 'deleted' row.
                        var sqlCommand = "DELETE FROM " + tableId + " WHERE _id=?";
                        ctxt.sqlStatement = {
                                stmt : sqlCommand,
                                bind : [ rowId ]
                            };
                        transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                            function(transaction, result) {});
                });
            }
        }), tableId);
    },

    addRow: function(tableId, stringifiedJSON, rowId, metaDataRev, _callbackId) {
        var that = this;

        var ctxt = that.newStartContext(_callbackId);

        if ( rowId === null || rowId === undefined ) {
            ctxt.failure({message: "rowId is not specified!"});
            return;
        }

        that._getTableDef($.extend({}, ctxt, {
            success: function(tableDef) {
                var changes;
                if ( stringifiedJSON === null || stringifiedJSON === undefined ) {
                    changes = {};
                } else {
                    changes = JSON.parse(stringifiedJSON);
                }
                changes._savepoint_type = "INCOMPLETE";
                // these metadata columns are managed by the database service
                delete changes._id;
                delete changes._savepoint_timestamp;
                delete changes._savepoint_creator; // odkCommon.getActiveUser()
                delete changes._sync_state;

                mockImpl.withDb($.extend({}, ctxt, {
                        success: function() {
                            that._getMostRecentRow(ctxt, tableDef, rowId);
                        }
                    }), function(transaction) {
                        ctxt.sqlStatement = mockSchema.addChangesDataTableStmt(tableDef, changes, rowId);
                        transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                            function(transaction, result) {});
                });
            }
        }), tableId);
    },

    addCheckpoint: function(tableId, stringifiedJSON, rowId, metaDataRev, _callbackId) {
        var that = this;

        var ctxt = that.newStartContext(_callbackId);

        if ( rowId === null || rowId === undefined ) {
            ctxt.failure({message: "rowId is not specified!"});
            return;
        }

        if ( stringifiedJSON === null || stringifiedJSON === undefined ) {
            ctxt.failure({message: 'change set cannot be empty'});
            return;
        }

        //////// prepare for checkpoint
        var changes;
        changes = JSON.parse(stringifiedJSON);
        changes._savepoint_type = null;
        // these metadata columns are managed by the database service
        delete changes._id;
        delete changes._savepoint_timestamp;
        delete changes._savepoint_creator; // odkCommon.getActiveUser()
        delete changes._sync_state;

        that._getTableDef($.extend({}, ctxt, {
            success: function(tableDef) {

                mockImpl.withDb($.extend({}, ctxt, {
                    success: function() {
                        that._getMostRecentRow(ctxt, tableDef, rowId);
                    }
                }), function (transaction) {
                    ctxt.sqlStatement = mockSchema.countRowTypeStmt(tableDef, rowId);
                    transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                        function(transaction, result) {
                            // determine whether there is an existing row
                            if ( result.rows.length === 0 ) {
                                // no new row -- add one
                                // insert new checkpoint row
                                ctxt.sqlStatement = mockSchema.addChangesDataTableStmt(tableDef, changes, rowId);
                                transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                                                            function(transaction, result) {});
                            } else {
                                var row = result.rows.item(0);
                                var c_all = row.c_all;
                                if ( c_all === null || c_all === undefined || c_all === 0 ) {
                                    // no new row -- add one
                                    // insert new checkpoint row
                                    ctxt.sqlStatement = mockSchema.addChangesDataTableStmt(tableDef, changes, rowId);
                                    transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                                                                function(transaction, result) {});
                                } else {
                                    // insert additional checkpoint row
                                    ctxt.sqlStatement = mockSchema.insertCheckpointChangesDataTableStmt(tableDef, changes, rowId);
                                    transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                                                                function(transaction, result) {});
                                }
                            }
                        });
                });
            }
        }), tableId);
    },

    _saveCheckpointAction: function(tableId, changes, rowId, metaDataRev, _callbackId) {
        var that = this;

        var ctxt = that.newStartContext(_callbackId);

        if ( rowId === null || rowId === undefined ) {
            ctxt.failure({message: "rowId is not specified!"});
            return;
        }

        that._getTableDef($.extend({}, ctxt, {
            success: function(tableDef) {

                mockImpl.withDb($.extend({}, ctxt, {
                    success: function() {
                        that._getMostRecentRow(ctxt, tableDef, rowId);
                    }
                }), function (transaction) {
                    ctxt.sqlStatement = mockSchema.countRowTypeStmt(tableDef, rowId);
                    transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                        function(transaction, result) {
                            // determine whether there is an existing row
                            if ( result.rows.length === 0 ) {
                                // no new row -- add one
                                // insert new INCOMPLETE row
                                ctxt.sqlStatement = mockSchema.addChangesDataTableStmt(tableDef, changes, rowId);
                                transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                                                            function(transaction, result) {
                                        var sqlCommand = 'DELETE FROM "' + tableId +
                    '" where _id = ? and _savepoint_timestamp < (select max(V._savepoint_timestamp) from "' + tableId + '" as V where V._id=? )';

                                        ctxt.sqlStatement = {
                                                stmt : sqlCommand,
                                                bind : [ rowId, rowId ]
                                            };
                                        transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                                                                    function(transaction, result) {});
                                    });
                            } else {
                                var row = result.rows.item(0);
                                var c_all = row.c_all;
                                if ( c_all === null || c_all === undefined || c_all === 0 ) {
                                    // no new row -- add one
                                    // insert new INCOMPLETE row
                                    ctxt.sqlStatement = mockSchema.addChangesDataTableStmt(tableDef, changes, rowId);
                                    transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                                                                function(transaction, result) {
                                        var sqlCommand = 'DELETE FROM "' + tableId +
                    '" where _id = ? and _savepoint_timestamp < (select max(V._savepoint_timestamp) from "' + tableId + '" as V where V._id=? )';

                                        ctxt.sqlStatement = {
                                                stmt : sqlCommand,
                                                bind : [ rowId, rowId ]
                                            };
                                        transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                                                                    function(transaction, result) {});
                                    });
                                } else {
                                    // insert additional checkpoint row
                                    ctxt.sqlStatement = mockSchema.insertCheckpointChangesDataTableStmt(tableDef, changes, rowId);
                                    transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                                                                function(transaction, result) {
                                        var sqlCommand = 'DELETE FROM "' + tableId +
                    '" where _id = ? and _savepoint_timestamp < (select max(V._savepoint_timestamp) from "' + tableId + '" as V where V._id=? )';

                                        ctxt.sqlStatement = {
                                                stmt : sqlCommand,
                                                bind : [ rowId, rowId ]
                                            };
                                        transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                                                                    function(transaction, result) {});
                                    });
                                }
                            }
                        });
                });
            }
        }), tableId);
    },

    saveCheckpointAsIncomplete: function(tableId, stringifiedJSON, rowId, metaDataRev, _callbackId) {
        var that = this;

        var changes = {};
        if ( stringifiedJSON !== null || stringifiedJSON !== undefined ) {
            changes = JSON.parse(stringifiedJSON);
        }
        changes._savepoint_type = "INCOMPLETE";
        // these metadata columns are managed by the database service
        delete changes._id;
        delete changes._savepoint_timestamp;
        delete changes._savepoint_creator; // odkCommon.getActiveUser()
        delete changes._sync_state;

        that._saveCheckpointAction(tableId, changes, rowId, metaDataRev, _callbackId);
    },

    saveCheckpointAsComplete: function(tableId, stringifiedJSON, rowId, metaDataRev, _callbackId) {
        var that = this;

        var changes = {};
        if ( stringifiedJSON !== null || stringifiedJSON !== undefined ) {
            changes = JSON.parse(stringifiedJSON);
        }
        changes._savepoint_type = "COMPLETE";
        // these metadata columns are managed by the database service
        delete changes._id;
        delete changes._savepoint_timestamp;
        delete changes._savepoint_creator; // odkCommon.getActiveUser()
        delete changes._sync_state;

        that._saveCheckpointAction(tableId, changes, rowId, metaDataRev, _callbackId);
    },

    deleteAllCheckpoints: function(tableId, rowId, metaDataRev, _callbackId) {
        var that = this;

        var ctxt = that.newStartContext(_callbackId);

        if ( rowId === null || rowId === undefined ) {
            ctxt.failure({message: "rowId is not specified!"});
            return;
        }

        that._getTableDef($.extend({}, ctxt, {
            success: function(tableDef) {
                mockImpl.withDb($.extend({}, ctxt, {
                        success: function() {
                            that._getMostRecentRow(ctxt, tableDef, rowId);
                        }
                    }), function(transaction) {
                        var sqlCommand = 'DELETE FROM "' + tableId +
                            '" where _id = ? and _savepoint_type is null';

                        ctxt.sqlStatement = {
                                stmt : sqlCommand,
                                bind : [ rowId ]
                            };
                        transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                            function(transaction, result) {});
                });
            }
        }), tableId);
    },

    deleteLastCheckpoint: function(tableId, rowId, metaDataRev, _callbackId) {
        var that = this;

        var ctxt = that.newStartContext(_callbackId);

        if ( rowId === null || rowId === undefined ) {
            ctxt.failure({message: "rowId is not specified!"});
            return;
        }

        that._getTableDef($.extend({}, ctxt, {
            success: function(tableDef) {
                mockImpl.withDb($.extend({}, ctxt, {
                        success: function() {
                            that._getMostRecentRow(ctxt, tableDef, rowId);
                        }
                    }), function(transaction) {
                        var sqlCommand = 'DELETE FROM "' + tableId +
                            '" where _id = ? and _savepoint_type is null and _savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + tableId + '" as V where V._id=? )';

                        ctxt.sqlStatement = {
                                stmt : sqlCommand,
                                bind : [ rowId, rowId ]
                            };
                        transaction.executeSql(ctxt.sqlStatement.stmt, ctxt.sqlStatement.bind,
                            function(transaction, result) {});
                });
            }
        }), tableId);
    }
};
if ( window.odkDataIf === null || window.odkDataIf === undefined ) {
    window.odkDataIf = odkDataIf;
}
return odkDataIf;
});

