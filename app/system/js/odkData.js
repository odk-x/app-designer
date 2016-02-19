/**
 * The that.getOdkDataIf() injected interface will be used in conjunction with this class to 
 * create closures for callback functions to be invoked once a response is available
 * from the Java side.
 */
'use strict';
/* jshint unused: vars */

window.odkData = {
    _requestMap: [],
//     _tableKVSCacheMap: [],
    _transactionId: 0,
    _callbackId: 0,
    
    getOdkDataIf: function() {
        return window.odkDataIf;
    },

    getViewData : function (successCallbackFn, failureCallbackFn) {
        var that = this;
        
        var transId = null;

        var req = that.queueRequest('getViewData', successCallbackFn, failureCallbackFn);

        that.getOdkDataIf().getViewData(req._callbackId);
    },

    getAllTableIds: function(successCallbackFn, failureCallbackFn) {
        var that = this;
        
        var req = that.queueRequest('getAllTableIds', successCallbackFn, failureCallbackFn);
        console.log('getAllTableIds cbId=' + req._callbackId);

        that.getOdkDataIf().getAllTableIds(req._callbackId);
    },

    query: function(tableId, whereClause, sqlBindParams, groupBy, having,
            orderByElementKey, orderByDirection, includeKVS, successCallbackFn, 
            failureCallbackFn) {
        var that = this;

        var req = that.queueRequest('query', successCallbackFn, failureCallbackFn);

//         var needToIncludeKVS = that.needToIncludeKVSInQuery(tableId);
//         console.log('odkData: query: Need to include the KVS is ' + needToIncludeKVS);

        // Test always make this false
        that.getOdkDataIf().query(tableId, whereClause, sqlBindParams, groupBy, 
            having, orderByElementKey, orderByDirection, includeKVS, req._callbackId);
//             having, orderByElementKey, orderByDirection, false, req._callbackId);
    },

    arbitraryQuery: function(tableId, sqlCommand, sqlBindParams, successCallbackFn, failureCallbackFn) {
        var that = this;
        
        var req = that.queueRequest('arbitraryQuery', successCallbackFn, failureCallbackFn);
        console.log('arbitraryQuery cbId=' + req._callbackId);

        that.getOdkDataIf().arbitraryQuery(tableId, sqlCommand, sqlBindParams, req._callbackId);
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

        var resultObj = null;

        /**
         * Returns true if str is a string, else false.
         */
        var isString = function(str) {
            return (typeof str === 'string');
        };

        /**
         * Returns ture if num is a number, else false.
         */
        var isNumber = function(num) {
            return (typeof num === 'number');
        };

        var isInteger = function(i) {
            return (typeof i === 'number' && Math.floor(i) === i);
        };

        // This is the object that will wrap up the result from an async query.
        var pub = {};

        /**
         * This function is used to set the 
         * backing data object that all of the 
         * member functions operate on
         *
         * jsonObj should be a JSON object.
         */
        pub.setBackingObject = function(jsonObj) {
            resultObj = jsonObj;
        };

        pub.getCount = function() {
            if (resultObj === null || resultObj === undefined) {
                return 0;
            }

            if (resultObj.data === null || resultObj.data === undefined) {
                return 0;
            }

            return resultObj.data.length;
        };

        pub.getColumnData = function(elementKey) {
            if (resultObj === null || resultObj === undefined) {
                return null;
            }

            if (arguments.length !== 1) {
                throw 'getColumnData()--incorrect number of arguments';
            }

            if (!isString(elementKey)) {
                throw 'getColumnData()--elementKey not a string';
            }

            elementKey = elementKey.replace(/\./g,'_');

            var colData = [];
            for (var i = 0; i < pub.getCount(); i ++) {
                colData.push(pub.getData(i, elementKey));
            }

            return colData;
        };

        pub.getTableId = function() {
            if (resultObj === null || resultObj === undefined) {
                return null;
            }

            if (resultObj.metadata === null || resultObj.metadata === undefined) {
                return null;
            }

            return resultObj.metadata.tableId;
        };

        pub.getRowId = function(index) {
            if (resultObj === null || resultObj === undefined) {
                return null;
            }

            if (resultObj.data === null || resultObj.data === undefined) {
                return null;
            }

            if (arguments.length !== 1) {
                throw 'getRowId()--incorrect number of arguments';
            }

            if (!isInteger(index)) {
                throw 'getRowId()--index must be an integer';
            }
    
            return pub.getData(index, '_id');
        };

        pub.getColumns = function() {
            if (resultObj === null || resultObj === undefined) {
                return null;
            }

            if (resultObj.metadata === null || resultObj.metadata === undefined) {
                return null;
            }

            if (resultObj.metadata.orderedColumns === null || resultObj.metadata.orderedColumns === undefined) {
                return null;
            }

            return resultObj.metadata.orderedColumns;
        };

        pub.getRowForegroundColor = function(rowNumber) {
            if (resultObj === null || resultObj === undefined) {
                return null;
            }

            if (resultObj.metadata === null || resultObj.metadata === undefined) {
                return null;
            }

            if (resultObj.metadata.rowColors === null || resultObj.metadata.rowColors === undefined) {
                return null;
            }

            if (arguments.length !== 1) {
                throw 'getRowForegroundColor()--incorrect number of arguments';
            }

            if (!isInteger(rowNumber)) {
                throw 'getRowForegroundColor()--rowNumber must be an integer';
            }

            var colorArray = resultObj.metadata.rowColors;

            if (rowNumber >= 0 && rowNumber < colorArray.length) {
                return colorArray[rowNumber].foregroundColor;
            } else {
                return null;
            }
        };

        pub.getRowBackgroundColor = function(rowNumber) {
            if (resultObj === null || resultObj === undefined) {
                return null;
            }

            if (resultObj.metadata === null || resultObj.metadata === undefined) {
                return null;
            }

            if (resultObj.metadata.rowColors === null || resultObj.metadata.rowColors === undefined) {
                return null;
            }

            if (arguments.length !== 1) {
                throw 'getRowBackgroundColor()--incorrect number of arguments';
            }

            if (!isInteger(rowNumber)) {
                throw 'getRowBackgroundColor()--rowNumber must be an integer';
            }

            var colorArray = resultObj.metadata.rowColors;

            if (rowNumber >= 0 && rowNumber < colorArray.length) {
                return colorArray[rowNumber].backgroundColor;
            } else {
                return null;
            }
        };

        pub.getStatusForegroundColor = function(rowNumber) {
            if (resultObj === null || resultObj === undefined) {
                return null;
            }

            if (resultObj.metadata === null || resultObj.metadata === undefined) {
                return null;
            }

            if (resultObj.metadata.statusColors === null || resultObj.metadata.statusColors === undefined) {
                return null;
            }

            if (arguments.length !== 1) {
                throw 'getStatusForegroundColor()--incorrect number of arguments';
            }

            if (!isInteger(rowNumber)) {
                throw 'getStatusForegroundColor()--rowNumber must be an integer';
            }

            var colorArray = resultObj.metadata.statusColors;

            if (rowNumber >= 0 && rowNumber < colorArray.length) {
                return colorArray[rowNumber].foregroundColor;
            } else {
                return null;
            }
        };

        pub.getStatusBackgroundColor = function(rowNumber) {
            if (resultObj === null || resultObj === undefined) {
                return null;
            }

            if (resultObj.metadata === null || resultObj.metadata === undefined) {
                return null;
            }

            if (resultObj.metadata.statusColors === null || resultObj.metadata.statusColors === undefined) {
                return null;
            }

            if (arguments.length !== 1) {
                throw 'getStatusBackgroundColor()--incorrect number of arguments';
            }

            if (!isInteger(rowNumber)) {
                throw 'getStatusBackgroundColor()--rowNumber must be an integer';
            }

            var colorArray = resultObj.metadata.statusColors;

            if (rowNumber >= 0 && rowNumber < colorArray.length) {
                return colorArray[rowNumber].backgroundColor;
            } else {
                return null;
            }
        };

        pub.getColumnForegroundColor = function(rowNumber, elementKey) {
            if (resultObj === null || resultObj === undefined) {
                return null;
            }

            if (resultObj.metadata === null || resultObj.metadata === undefined) {
                return null;
            }

            if (resultObj.metadata.statusColors === null || resultObj.metadata.statusColors === undefined) {
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

            var colorArray = resultObj.metadata.statusColors;

            if (rowNumber >= 0 && rowNumber < colorArray.length) {
                return colorArray[rowNumber].foregroundColor;
            } else {
                return null;
            }
        };

        pub.getColumnBackgroundColor = function(rowNumber, elementKey) {
            if (resultObj === null || resultObj === undefined) {
                return null;
            }

            if (resultObj.metadata === null || resultObj.metadata === undefined) {
                return null;
            }

            if (resultObj.metadata.columnColors === null || resultObj.metadata.columnColors === undefined) {
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

            var colorArray = resultObj.metadata.columnColors[elementKey];

            if (colorArray !== null && colorArray !== undefined) {
                if (rowNumber >= 0 && rowNumber < colorArray.length) {
                    return colorArray[rowNumber].backgroundColor;
                } else {
                    return null;
                }
            }
        };

        // This is not available in the current API
        // pub.isGroupedBy = function() {
        // 
        //      return resultObj.isGroupedBy;
        // };

        pub.getData = function(rowNumber, elementKey) {
            if (resultObj === null || resultObj === undefined) {
                return null;
            }

            if (resultObj.data === null || resultObj.data === undefined) {
                return null;
            }

            if (resultObj.metadata === null || resultObj.metadata === undefined) {
                return null;
            }

            if (resultObj.metadata.elementKeyMap === null || resultObj.metadata.elementKeyMap === undefined) {
                return null;
            }

            if (arguments.length !== 2) {
                throw 'getData()--incorrect number of arguments';
            }

            if (!isInteger(rowNumber)) {
                throw 'getData()--rowNumber must be an integer';
            }

            if (!isString(elementKey)) {
                throw 'getData()--elementKey must be a string';
            }

            elementKey = elementKey.replace(/\./g,'_');

            var colIndex = resultObj.metadata.elementKeyMap[elementKey];
            return resultObj.data[rowNumber][colIndex];
        };

        pub.get = function(elementKey) {
            if (resultObj === null || resultObj === undefined) {
                return null;
            }

            if (arguments.length !== 1) {
                throw 'get()--incorrect number of arguments';
            }
            return pub.getData(0, elementKey);
        };

        pub.getElementKey = function(elementPath) {
            var hackPath = elementPath.replace(/\./g, "_");
            return hackPath;
        };

        pub.getColumnDisplayName = function(elementPath) {
            var kvsLen = resultObj.metadata.keyValueStoreList.length;
            var retVal = elementPath;

            for (var i = 0; i < kvsLen; i++) {
                var kvs = resultObj.metadata.keyValueStoreList[i];
                if (kvs.aspect === elementPath && kvs.partition === 'column' &&
                    kvs.key === 'displayName') {
                    retVal = kvs.value;
                }
            }

            return retVal;
        };

        pub.getTableDisplayName = function(tableId) {
            var kvsLen = resultObj.metadata.keyValueStoreList.length;
            var retVal = tableId;

            for (var i = 0; i < kvsLen; i++) {
                var kvs = resultObj.metadata.keyValueStoreList[i];
                if (kvs.aspect === tableId && kvs.partition === 'table' &&
                    kvs.key === 'displayName') {
                    retVal = kvs.value;
                }
            }

            return retVal;
    
        };

        return pub;
    }
};