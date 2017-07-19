/**
 * The that.getOdkDataIf() injected interface will be used in conjunction with this class to 
 * create closures for callback functions to be invoked once a response is available
 * from the Java side.
 */
 
 (function() {
'use strict';

window.odkData = {
    _requestMap: [],
//     _tableKVSCacheMap: [],
    _transactionId: 0,
    _callbackId: 0,
    
    getOdkDataIf: function() {
        return window.odkDataIf;
    },

    getViewData : function (successCallbackFn, failureCallbackFn, limit, offset) {
        var that = this;

        var req = that.queueRequest('getViewData', successCallbackFn, failureCallbackFn);

        limit = (limit !== undefined ? limit : null);
        offset = (offset !== undefined ? offset : null);

        that.getOdkDataIf().getViewData(req._callbackId, limit, offset);
    },

    getRoles: function(successCallbackFn, failureCallbackFn) {
        var that = this;
        
        var req = that.queueRequest('getRoles', successCallbackFn, failureCallbackFn);
        console.log('getRoles cbId=' + req._callbackId);

        that.getOdkDataIf().getRoles(req._callbackId);
    },

    getDefaultGroup: function(successCallbackFn, failureCallbackFn) {
        var that = this;
        
        var req = that.queueRequest('getDefaultGroup', successCallbackFn, failureCallbackFn);
        console.log('getDefaultGroup cbId=' + req._callbackId);

        that.getOdkDataIf().getDefaultGroup(req._callbackId);
    },

    getUsers: function(successCallbackFn, failureCallbackFn) {
        var that = this;
        
        var req = that.queueRequest('getUsers', successCallbackFn, failureCallbackFn);
        console.log('getUsers cbId=' + req._callbackId);

        that.getOdkDataIf().getUsers(req._callbackId);
    },

    getAllTableIds: function(successCallbackFn, failureCallbackFn) {
        var that = this;
        
        var req = that.queueRequest('getAllTableIds', successCallbackFn, failureCallbackFn);
        console.log('getAllTableIds cbId=' + req._callbackId);

        that.getOdkDataIf().getAllTableIds(req._callbackId);
    },

    query: function(tableId, whereClause, sqlBindParams, groupBy, having,
            orderByElementKey, orderByDirection, limit, offset, includeKVS, successCallbackFn, 
            failureCallbackFn) {
        var that = this;

        var req = that.queueRequest('query', successCallbackFn, failureCallbackFn);

        // need to JSON.stringify bind parameters so we can pass integer, numeric and boolean parameters as-is.
        var sqlBindParamsJSON = (sqlBindParams === null || sqlBindParams === undefined) ? null : 
                JSON.stringify(sqlBindParams);
        that.getOdkDataIf().query(tableId, whereClause, sqlBindParamsJSON, groupBy, 
            having, orderByElementKey, orderByDirection, limit, offset, includeKVS, req._callbackId);
    },

    arbitraryQuery: function(tableId, sqlCommand, sqlBindParams, limit, offset, successCallbackFn, failureCallbackFn) {
        var that = this;
        
        var req = that.queueRequest('arbitraryQuery', successCallbackFn, failureCallbackFn);
        var stringLimit = limit == null ? null : limit.toString();
        var stringOffset = offset == null ? null : offset.toString();
        console.log('arbitraryQuery cbId=' + req._callbackId);

        // need to JSON.stringify bind parameters so we can pass integer, numeric and boolean parameters as-is.
        var sqlBindParamsJSON = (sqlBindParams === null || sqlBindParams === undefined) ? null : 
                JSON.stringify(sqlBindParams);
        that.getOdkDataIf().arbitraryQuery(tableId, sqlCommand, sqlBindParamsJSON, stringLimit, stringOffset, req._callbackId);
    },

    getRows: function(tableId, rowId, successCallbackFn, failureCallbackFn) {
        var that = this;

        var req = that.queueRequest('getRows', successCallbackFn, failureCallbackFn);

        that.getOdkDataIf().getRows(tableId, rowId, req._callbackId);
    },

    getMostRecentRow: function(tableId, rowId, successCallbackFn, failureCallbackFn) {
        var that = this;

        var req = that.queueRequest('getMostRecentRow', successCallbackFn, failureCallbackFn);

        that.getOdkDataIf().getMostRecentRow(tableId, rowId, req._callbackId);
    },

    changeAccessFilterOfRow: function(tableId, defaultAccess, rowOwner, groupReadOnly, groupModify, 
        groupPrivileged, rowId, successCallbackFn, failureCallbackFn) {
        var that = this;

        var req = that.queueRequest('changeAccessFilterOfRow', successCallbackFn, failureCallbackFn);

    that.getOdkDataIf().changeAccessFilterOfRow(tableId, defaultAccess, rowOwner, groupReadOnly, groupModify,
        groupPrivileged, rowId, req._callbackId);
    },
    
    updateRow: function(tableId, columnNameValueMap, rowId, successCallbackFn, failureCallbackFn) {
        var that = this;

        var req = that.queueRequest('updateRow', successCallbackFn, failureCallbackFn);

    that.getOdkDataIf().updateRow(tableId, JSON.stringify(columnNameValueMap), rowId, req._callbackId);
    },

    deleteRow: function(tableId, columnNameValueMap, rowId, successCallbackFn, failureCallbackFn) {
        var that = this;

        var req = that.queueRequest('deleteRow', successCallbackFn, failureCallbackFn);

        that.getOdkDataIf().deleteRow(tableId, JSON.stringify(columnNameValueMap), rowId, req._callbackId);
    },

    addRow: function(tableId, columnNameValueMap, rowId, successCallbackFn, failureCallbackFn) {
        var that = this;

        var req = that.queueRequest('addRow', successCallbackFn, failureCallbackFn);

        that.getOdkDataIf().addRow(tableId, JSON.stringify(columnNameValueMap), rowId, req._callbackId);
    },

    addCheckpoint: function(tableId, columnNameValueMap, rowId, successCallbackFn, failureCallbackFn) {
        var that = this;

        var req = that.queueRequest('addCheckpoint', successCallbackFn, failureCallbackFn);

        that.getOdkDataIf().addCheckpoint(tableId, JSON.stringify(columnNameValueMap), rowId, req._callbackId);
    },

    saveCheckpointAsIncomplete: function(tableId, columnNameValueMap, rowId, successCallbackFn, failureCallbackFn) {
        var that = this;

        var req = that.queueRequest('saveCheckpointAsIncomplete', successCallbackFn, failureCallbackFn);

        that.getOdkDataIf().saveCheckpointAsIncomplete(tableId, JSON.stringify(columnNameValueMap), rowId, req._callbackId); 
    },

    saveCheckpointAsComplete: function(tableId, columnNameValueMap, rowId, successCallbackFn, failureCallbackFn) {
        var that = this;

        var req = that.queueRequest('saveCheckpointAsComplete', successCallbackFn, failureCallbackFn);

        that.getOdkDataIf().saveCheckpointAsComplete(tableId, JSON.stringify(columnNameValueMap), rowId, req._callbackId);
    },

    deleteAllCheckpoints: function(tableId, rowId, successCallbackFn, failureCallbackFn) {
        var that = this;

        var req = that.queueRequest('deleteLastCheckpoint', successCallbackFn, failureCallbackFn);

        that.getOdkDataIf().deleteAllCheckpoints(tableId, rowId, req._callbackId);
    },

    deleteLastCheckpoint: function(tableId, rowId, successCallbackFn, failureCallbackFn) {
        var that = this;

        var req = that.queueRequest('deleteLastCheckpoint', successCallbackFn, failureCallbackFn);

        that.getOdkDataIf().deleteLastCheckpoint(tableId, rowId, req._callbackId);
    },

    queueRequest: function (type, successCallbackFn, failureCallbackFn) {
        var that = this;

        var cbId = that._callbackId;

        var activeRequest = {
            _callbackId: cbId, 
            _successCbFn: successCallbackFn,
            _failureCbFn: failureCallbackFn,
            _requestType: type
        };
        that._requestMap.push(activeRequest);

        that._callbackId = that._callbackId + 1;

        return activeRequest;
    },

    invokeCallbackFn: function (jsonResult, cbId) {
        console.log('odkData: invokeCallbackFn called with cbId ' + cbId);
        var that = this;
        var found = false;

        if (cbId === null || cbId === undefined) {
            return;
        }

        var errorMsg = null;
        if (jsonResult.error !== undefined && jsonResult.error !== null) {
            errorMsg = jsonResult.error;
        }

        var cbIdNum = parseInt(cbId);
        for (var i = 0; i < that._requestMap.length; i++) {
            if (that._requestMap[i]._callbackId === cbIdNum) {
                var trxn = that._requestMap[i];
                that._requestMap.splice(i, 1);
                if (errorMsg !== null && errorMsg !== undefined) {
                    console.log('odkData invokeCallbackFn error - requestType: ' + trxn._requestType + ' callbackId: ' + trxn._callbackId +
                    ' error: ' + errorMsg);
                    if (errorMsg.indexOf("org.opendatakit.exception.ActionNotAuthorize") === 0) {
                        document.body.innerHTML = "<h1>Access denied</h1>You do have access to perform this action. Please log in or check your credentials."; // TODO: TEMPORARY
                    }
                    if(trxn._failureCbFn !== null && trxn._failureCbFn !== undefined) {
                        (trxn._failureCbFn)(errorMsg);
                    }
                } else {
                    console.log('odkData invokeCallbackFn success - requestType: ' + trxn._requestType + ' callbackId: ' + trxn._callbackId);
                    
                    // Need to update the cached KVS if we have a query request type
//                     if (trxn._requestType === 'query') {
//                         that.updateCachedMetadataForTableId(jsonResult, cbId);
//                     }

                    if (trxn._successCbFn !== null && trxn._successCbFn !== undefined) {
                        var reqData = new that.__getResultData();
                        reqData.setBackingObject(jsonResult); 
                        (trxn._successCbFn)(reqData);
                    }
                }
                found = true;
            }
        }
        
        if (!found) {
            console.log('odkData invokeCallbackFn - no callback found for callbackId: ' + cbId);
        }
    },
    
//     updateCachedMetadataForTableId: function(jsonResult, cbId) {
//         var that = this;
//         // If the metadata does not contain the tableId log to console
//         if (jsonResult.metadata.tableId === null || jsonResult.metadata.tableId === undefined) {
//             throw new Error('table id not found in the metadata for callback id: ' + cbId);
//         }
// 
//         // If there is metadata in this response for a table id that
//         // is not cached, cache it now
//         var tableKVSCache = null;
//         tableKVSCache = that.getCachedMetadataForTableId(jsonResult.metadata.tableId);
//         
//         if (tableKVSCache === null) {
//             if (jsonResult.metadata.keyValueStoreList !== null && jsonResult.metadata.keyValueStoreList !== undefined) {
//                 console.log('odkData: invokeCallbackFn: adding KVS for tableId: ' + jsonResult.metadata.tableId);
//                 tableKVSCache = {};
//                 tableKVSCache.tableId = jsonResult.metadata.tableId;
//                 tableKVSCache.keyValueStoreList = jsonResult.metadata.keyValueStoreList; 
//                 that._tableKVSCacheMap.push(tableKVSCache);
//             } else {
//                 throw new Error('odkData: tableKVSCache does not contain metadata for table id: ' + jsonResult.metadata.tableId + ' but should');   
//             }
//         }
// 
//         // At this point, we should always have metadata for any table
//         // that has been queried before 
//         if (jsonResult.metadata.keyValueStoreList === null || jsonResult.metadata.keyValueStoreList === undefined) {
//             jsonResult.metadata.keyValueStoreList = tableKVSCache;
//         }
//     },
// 
//     getCachedMetadataForTableId : function(tableId) {
//         var that = this;
//         var tableKVSMetadata = null;
//         for (var i = 0; i < that._tableKVSCacheMap.length; i++) {
//             if (that._tableKVSCacheMap[i].tableId === tableId) {
//                 tableKVSMetadata = that._tableKVSCacheMap[i].keyValueStoreList;
//                 console.log('odkData: getCachedMetadataForTableId: found KVS for tableId: ' + tableId);
//                 break;
//             }
//         }
//         return tableKVSMetadata;
//     },
// 
//     needToIncludeKVSInQuery : function(tableId) {
//         var that = this;
//         var includeKVS = true;
//         var cachedKVS = that.getCachedMetadataForTableId(tableId);
//         if (cachedKVS !== null && cachedKVS !== undefined) {
//             includeKVS = false;
//         }
//         return includeKVS;
//     },

    responseAvailable: function() {
        var that = this;
        setTimeout(function() {
            var resultJSON = that.getOdkDataIf().getResponseJSON();
            //console.log('odkData: resultJSON is ' + resultJSON);

            var result = JSON.parse(resultJSON);

            var callbackFnStr = result.callbackJSON;
            console.log('odkData: callbackJSON is ' + callbackFnStr);

            that.invokeCallbackFn(result, callbackFnStr);

        }, 0);
    },

    //
    // The code for the data object has 
    // been moved here since this is only
    // accessed here  
    //
    __getResultData : function() {

        /**
         * Returns true if str is a string, else false.
         */
        var isString = function(str) {
            return (typeof str === 'string');
        };

        /**
         * Returns ture if num is an integer, else false.
         */
        var isInteger = function(i) {
            return (typeof i === 'number' && Math.floor(i) === i);
        };

        // This is the object that will wrap up the result from an async query.
        var pub = {
            resultObj : null,
            // holds keyValueList re-imagined as a map.
            kvMap : {},

            /**
             * This function is used to set the 
             * backing data object that all of the 
             * member functions operate on
             *
             * jsonObj should be a JSON object.
             */
            setBackingObject:function(jsonObj) {
                var that = this;
                
                that.resultObj = jsonObj;

                // and build the kvMap
                if (that.resultObj.metadata.keyValueStoreList === null || 
                    that.resultObj.metadata.keyValueStoreList === undefined) {
                    return;
                }

                var kvsLen = that.resultObj.metadata.keyValueStoreList.length;

                odkCommon.log('W',"odkData/setBackingObject: processing keyValueStoreList of size " + kvsLen);

                // the keyValueStoreList is not very efficient for accessing values.
                // Convert this into a Javascript map stored in that.kvMap so we can access it as:
                //      that.kvMap[partition][aspect][key]
                // And, for partition === 'Column' && key === 'displayChoicesList', add 
                // two new synthesized keys:
                //      _displayChoicesList -- JSON.parse of 'displayChoicesList' value (array)
                //      _displayChoicesMap -- conversion of this list into a map indexed by data_value.
                //
                for (var i = 0; i < kvsLen; i++) {
                    var kvs = that.resultObj.metadata.keyValueStoreList[i];
                    if ( !(that.kvMap.hasOwnProperty(kvs.partition)) ) {
                        that.kvMap[kvs.partition] = {};
                    }
                    var partition = that.kvMap[kvs.partition];
                    if ( !(partition.hasOwnProperty(kvs.aspect)) ) {
                        partition[kvs.aspect] = {};
                    }
                    var aspect = partition[kvs.aspect];
                    aspect[kvs.key] = kvs;
                    
                    // Transform the choice list into a map. 
                    // Use _displayChoicesList as the key.
                    if ( kvs.partition === "Column" &&
                         kvs.key === "displayChoicesList" &&
                         kvs.value !== null ) {

                        // save the parsed content
                        var choiceList = JSON.parse(kvs.value);
                        aspect["_" + kvs.key] = choiceList;

                        // create a map of choiceList data_value to object
                        var choiceMap = {};
                        aspect["_displayChoicesMap"] = choiceMap;
                        
                        var choiceListLen = choiceList.length;
                        for ( var j = 0 ; j < choiceListLen ; j++) {
                            var choice = choiceList[j];
                            choiceMap[choice.data_value] = choice;
                        }
                    }
                }
            },

            // get the number of rows in the result set
            getCount:function() {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return 0;
                }

                if (that.resultObj.data === null || that.resultObj.data === undefined) {
                    return 0;
                }

                return that.resultObj.data.length;
            },

            // convert the elementPath to a unique elementKey (column name in database)
            // assumes the elementPath is a unit of retention in the database.
            getElementKey:function(elementPath) {
                // var that = this;
                var hackPath = elementPath.replace(/\./g, "_");
                return hackPath;
            },

            // get a vector of the values for the given elementKey.
            // useful for generating plots and graphs.
            // assumes the field is a unit of retention in the database
            getColumnData:function(elementKeyOrPath) {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (arguments.length !== 1) {
                    throw 'getColumnData()--incorrect number of arguments';
                }

                if (!isString(elementKeyOrPath)) {
                    throw 'getColumnData()--elementKey not a string';
                }

                var elementKey = that.getElementKey(elementKeyOrPath);

                var colData = [];
                for (var i = 0; i < that.getCount(); i ++) {
                    colData.push(that.getData(i, elementKey));
                }

                return colData;
            },

            // get the _id (a.k.a. instance id -- a component of the PK) 
            // of a row in the result set.
            getRowId:function(rowNumber) {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.data === null || that.resultObj.data === undefined) {
                    return null;
                }

                if (arguments.length !== 1) {
                    throw 'getRowId()--incorrect number of arguments';
                }

                if (!isInteger(rowNumber)) {
                    throw 'getRowId()--index must be an integer';
                }
        
                return that.getData(rowNumber, '_id');
            },

            // get the value for an individual field in a row of the result set
            // assumes the field is a unit of retention in the database
            getData:function(rowNumber, elementKeyOrPath) {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.data === null || that.resultObj.data === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                if (that.resultObj.metadata.elementKeyMap === null || 
                    that.resultObj.metadata.elementKeyMap === undefined) {
                    return null;
                }

                if (arguments.length !== 2) {
                    throw 'getData()--incorrect number of arguments';
                }

                if (!isInteger(rowNumber)) {
                    throw 'getData()--rowNumber must be an integer';
                }

                if (!isString(elementKeyOrPath)) {
                    throw 'getData()--elementKey must be a string';
                }

                var elementKey = that.getElementKey(elementKeyOrPath);

                var colIndex = that.resultObj.metadata.elementKeyMap[elementKey];
                return that.resultObj.data[rowNumber][colIndex];
            },

            // for singleton result sets, get the value of the given field.
            // assumes the field is a unit of retention in the database
            get:function(elementKeyOrPath) {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (arguments.length !== 1) {
                    throw 'get()--incorrect number of arguments';
                }
                return that.getData(0, elementKeyOrPath);
            },

            //////////////////////////////////////////////////////////////////////////////
            // metadata content passed back for use in interpreting the result set
            
            getTableId:function() {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                return that.resultObj.metadata.tableId;
            },

            // get the limit setting for the number of rows in the result set
            getLimit:function() {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                var retval = that.resultObj.metadata.limit;
                
                if ( retval === undefined ) {
                    return null;
                }
                return retval;
            },

            // get the offset setting for the result set
            getOffset:function() {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                var retval = that.resultObj.metadata.offset;
                
                if ( retval === undefined ) {
                    return null;
                }
                return retval;
            },
            
            getColumns:function() {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                if (that.resultObj.metadata.elementKeyMap === null || 
                    that.resultObj.metadata.elementKeyMap === undefined) {
                    return null;
                }

                var elementKeyMap = that.resultObj.metadata.elementKeyMap;
                
                var columns = [];
                var i;
                var key;
                for ( key in elementKeyMap ) {
                    if (elementKeyMap.hasOwnProperty(key)) {
                        i = elementKeyMap[key];
                        columns[i] = key;
                    }
                }
                return columns;
            },

            getRowForegroundColor:function(rowNumber) {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                if (that.resultObj.metadata.rowColors === null || 
                    that.resultObj.metadata.rowColors === undefined) {
                    return null;
                }

                if (arguments.length !== 1) {
                    throw 'getRowForegroundColor()--incorrect number of arguments';
                }

                if (!isInteger(rowNumber)) {
                    throw 'getRowForegroundColor()--rowNumber must be an integer';
                }

                var colorArray = that.resultObj.metadata.rowColors;

                if (rowNumber >= 0 && rowNumber < that.getCount()) {
                    for (var i = 0; i < colorArray.length; i++) {
                        if (colorArray[i].rowIndex === rowNumber) {
                            return colorArray[i].foregroundColor;
                        }
                    }
                }
                return null;
            },

            getRowBackgroundColor:function(rowNumber) {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                if (that.resultObj.metadata.rowColors === null || 
                    that.resultObj.metadata.rowColors === undefined) {
                    return null;
                }

                if (arguments.length !== 1) {
                    throw 'getRowBackgroundColor()--incorrect number of arguments';
                }

                if (!isInteger(rowNumber)) {
                    throw 'getRowBackgroundColor()--rowNumber must be an integer';
                }

                var colorArray = that.resultObj.metadata.rowColors;

                if (rowNumber >= 0 && rowNumber < that.getCount()) {
                    for (var i = 0; i < colorArray.length; i++) {
                        if (colorArray[i].rowIndex === rowNumber) {
                            return colorArray[i].backgroundColor;
                        }
                    }
                }
                return null;

            },

            getStatusForegroundColor:function(rowNumber) {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                if (that.resultObj.metadata.statusColors === null || 
                    that.resultObj.metadata.statusColors === undefined) {
                    return null;
                }

                if (arguments.length !== 1) {
                    throw 'getStatusForegroundColor()--incorrect number of arguments';
                }

                if (!isInteger(rowNumber)) {
                    throw 'getStatusForegroundColor()--rowNumber must be an integer';
                }

                var colorArray = that.resultObj.metadata.statusColors;

                if (rowNumber >= 0 && rowNumber < that.getCount()) {
                    for (var i = 0; i < colorArray.length; i++) {
                        if (colorArray[i].rowIndex === rowNumber) {
                            return colorArray[i].foregroundColor;
                        }
                    }
                }
                return null;
            },

            getStatusBackgroundColor:function(rowNumber) {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                if (that.resultObj.metadata.statusColors === null || 
                    that.resultObj.metadata.statusColors === undefined) {
                    return null;
                }

                if (arguments.length !== 1) {
                    throw 'getStatusBackgroundColor()--incorrect number of arguments';
                }

                if (!isInteger(rowNumber)) {
                    throw 'getStatusBackgroundColor()--rowNumber must be an integer';
                }

                var colorArray = that.resultObj.metadata.statusColors;

                if (rowNumber >= 0 && rowNumber < that.getCount()) {
                    for (var i = 0; i < colorArray.length; i++) {
                        if (colorArray[i].rowIndex === rowNumber) {
                            return colorArray[i].backgroundColor;
                        }
                    }
                }
                return null;

            },

            getColumnForegroundColor:function(rowNumber, elementKey) {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                if (that.resultObj.metadata.columnColors === null || 
                    that.resultObj.metadata.columnColors === undefined) {
                    return null;
                }

                if (arguments.length !== 2) {
                    throw 'getColumnForegroundColor()--incorrect number of arguments';
                }

                if (!isInteger(rowNumber)) {
                    throw 'getColumnForegroundColor()--rowNumber must be an integer';
                }

                if (!isString(elementKey)) {
                    throw 'getColumnForegroundColor()--elementKey must be a string';
                }

                if (that.resultObj.metadata.columnColors[elementKey] === null || 
                    that.resultObj.metadata.columnColors[elementKey] === undefined) {
                    return null;
                }

                var colorArray = that.resultObj.metadata.columnColors[elementKey];

                if (rowNumber >= 0 && rowNumber < that.getCount()) {
                    for (var i = 0; i < colorArray.length; i++) {
                        if (colorArray[i].rowIndex === rowNumber) {
                            return colorArray[i].foregroundColor;
                        }
                    }
                }
                return null;
            },

            getColumnBackgroundColor:function(rowNumber, elementKey) {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                if (that.resultObj.metadata.columnColors === null || 
                    that.resultObj.metadata.columnColors === undefined) {
                    return null;
                }

                if (arguments.length !== 2) {
                    throw 'getColumnBackgroundColor()--incorrect number of arguments';
                }

                if (!isInteger(rowNumber)) {
                    throw 'getColumnBackgroundColor()--rowNumber must be an integer';
                }

                if (!isString(elementKey)) {
                    throw 'getColumnBackgroundColor()--elementKey must be a string';
                }

                if (that.resultObj.metadata.columnColors[elementKey] === null ||
                    that.resultObj.metadata.columnColors[elementKey] === undefined) {
                    return null;
                }

                var colorArray = that.resultObj.metadata.columnColors[elementKey];

                if (rowNumber >= 0 && rowNumber < that.getCount()) {
                    for (var i = 0; i < colorArray.length; i++) {
                        if (colorArray[i].rowIndex === rowNumber) {
                            return colorArray[i].backgroundColor;
                        }
                    }
                }
            },

            getMapIndex:function() {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                if (that.resultObj.metadata.mapIndex === null || 
                    that.resultObj.metadata.mapIndex === undefined) {
                    return null;
                }

                return that.resultObj.metadata.mapIndex;
            },

            getColumnDisplayName:function(elementPath) {
                var that = this;
                var retVal = elementPath;

                if (that.resultObj === null || that.resultObj === undefined) {
                    return retVal;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return retVal;
                }

                if (that.resultObj.metadata.keyValueStoreList === null || 
                    that.resultObj.metadata.keyValueStoreList === undefined) {
                    return retVal;
                }

                var ref = that.kvMap['Column'];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                var ref = ref[elementPath];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                var ref = ref['displayName'];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                retVal = ref.value;
                return retVal;
            },

            getTableDisplayName:function(tableId) {
                var that = this;
                var retVal = tableId;

                if (that.resultObj === null || that.resultObj === undefined) {
                    return retVal;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return retVal;
                }

                if (that.resultObj.metadata.keyValueStoreList === null || 
                    that.resultObj.metadata.keyValueStoreList === undefined) {
                    return retVal;
                }

                var ref = that.kvMap['Table'];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                var ref = ref['default'];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                var ref = ref['displayName'];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                retVal = ref.value;
                return retVal;       
            },

            getIsTableLocked:function() {
                var that = this;
                var retVal = false;

                if (that.resultObj === null || that.resultObj === undefined) {
                    return retVal;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return retVal;
                }

                if (that.resultObj.metadata.keyValueStoreList === null ||
                    that.resultObj.metadata.keyValueStoreList === undefined) {
                    return retVal;
                }

                var ref = that.kvMap['Table'];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                var ref = ref['security'];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                var ref = ref['locked'];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                var v = ref.value;
                if ( v !== null && v !== undefined && (v.toLowerCase() == "true") ) {
                    retVal = true;
                }
                return retVal;
            },

            //
            // Retrieves the list of choices for the given elementPath
            // or null if there is not a list of choices in the table
            // properties for this column. This is the already-JSON-parsed
            // value. The list order is the order in which these choices
            // should be presented in the selection-list.
            getColumnChoicesList:function(elementPath) {
                var that = this;
                var retVal = null;

                if (that.resultObj === null || that.resultObj === undefined) {
                    return retVal;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return retVal;
                }

                if (that.resultObj.metadata.keyValueStoreList === null || 
                    that.resultObj.metadata.keyValueStoreList === undefined) {
                    return retVal;
                }

                var ref = that.kvMap['Column'];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                var elementKey = that.getElementKey(elementPath);
                var ref = ref[elementKey];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                // NOTE: this is synthesized within setBackingObject()
                var ref = ref['_displayChoicesList'];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                retVal = ref;
                return retVal;
            },

            //
            // Effectively retrieves the object for the given data_value from 
            // the displayChoicesList for the given elementPath. Equivalent to 
            // searching through the '_displayChoicesList' value for the object
            // where object.data_value === choiceDataValue.
            //
            // The caller can then access the .display.title for the 
            // text translation of this object or any custom property 
            // associated with this choice data value (via the tableId form).
            getColumnChoiceDataValueObject:function(elementPath, choiceDataValue) {
                var that = this;
                var retVal = null;

                if (that.resultObj === null || that.resultObj === undefined) {
                    return retVal;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return retVal;
                }

                if (that.resultObj.metadata.keyValueStoreList === null || 
                    that.resultObj.metadata.keyValueStoreList === undefined) {
                    return retVal;
                }

                var ref = that.kvMap['Column'];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                var elementKey = that.getElementKey(elementPath);
                var ref = ref[elementKey];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                // NOTE: this is synthesized within setBackingObject()
                var ref = ref['_displayChoicesMap'];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                var ref = ref[choiceDataValue];
                if ( ref === null || ref === undefined ) {
                    return retVal;
                }
                retVal = ref;
                return retVal;
            },

            getCanCreateRow:function() {
                var that = this;
                var retVal = false;
                
                if (that.resultObj === null || that.resultObj === undefined) {
                    return retVal;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return retVal;
                }

                return that.resultObj.metadata.canCreateRow;
        
            },

            // may need to get the raw metadata content to get access to some of the content.
            getMetadata:function() {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                return that.resultObj.metadata;
            },

            // only valid after call to getAllTableIds()
            getAllTableIds:function() {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                if (that.resultObj.metadata.tableIds === null || 
                    that.resultObj.metadata.tableIds === undefined) {
                    return null;
                }

                return that.resultObj.metadata.tableIds;
            },

            // only valid after call to getRoles()
            getRoles:function() {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                if (that.resultObj.metadata.roles === null || 
                    that.resultObj.metadata.roles === undefined) {
                    return null;
                }

                return that.resultObj.metadata.roles;
            },

            // only valid after call to getDefaultGroup()
            getDefaultGroup:function() {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                if (that.resultObj.metadata.defaultGroup === null || 
                    that.resultObj.metadata.defaultGroup === undefined) {
                    return null;
                }

                return that.resultObj.metadata.defaultGroup;
            },

            // only valid after call to getUsers()
            getUsers:function() {
                var that = this;
                if (that.resultObj === null || that.resultObj === undefined) {
                    return null;
                }

                if (that.resultObj.metadata === null || that.resultObj.metadata === undefined) {
                    return null;
                }

                if (that.resultObj.metadata.users === null || 
                    that.resultObj.metadata.users === undefined) {
                    return null;
                }

                return that.resultObj.metadata.users;
            }
            
        };

        return pub;
    }
};
 })();
