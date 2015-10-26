/**
 * The dataif injected interface will be used in conjunction with this class to 
 * create closures for callback functions to be invoked once a response is available
 * from the Java side.
 */
'use strict';
/* jshint unused: vars */

window.datarsp = {
    _requestMap: [],
    _transactionId: 0,
    _callbackId: 0,

    query: function(tableId, whereClause, sqlBindParams, groupBy, having,
            orderByElementKey, orderByDirection, includeKVS, successCallbackFn, 
            failureCallbackFn, transId, leaveTransOpen) {
        var that = this;

        var req = that.queueRequest('query', leaveTransOpen, transId, successCallbackFn, failureCallbackFn);

        dataif.query(tableId, whereClause, sqlBindParams, groupBy, 
            having, orderByElementKey, orderByDirection, includeKVS, req._callbackId, req._trxnId, leaveTransOpen);
    },

    rawQuery: function(sqlCommand, sqlBindParams, successCallbackFn, failureCallbackFn, transId, leaveTransactionOpen) {
        var that = this;
        
        var req = that.queueRequest('rawQuery', leaveTransactionOpen, transId, successCallbackFn, failureCallbackFn);
		console.log('rawQuery cbId=' + req._callbackId);

        dataif.rawQuery(sqlCommand, sqlBindParams, req._callbackId, req._trxnId, leaveTransactionOpen);
    },

    updateRow: function(tableId, stringifiedJSON, rowId, successCallbackFn, failureCallbackFn, transId, leaveTransactionOpen) {
        var that = this;

        var req = that.queueRequest('udpateRow', leaveTransactionOpen, transId, successCallbackFn, failureCallbackFn);

        dataif.updateRow(tableId, stringifiedJSON, rowId, req._callbackId, req._trxnId, leaveTransactionOpen);
    },

    deleteRow: function(tableId, stringifiedJSON, rowId, successCallbackFn, failureCallbackFn, transId, leaveTransactionOpen) {
        var that = this;

        var req = that.queueRequest('deleteRow', leaveTransactionOpen, transId, successCallbackFn, failureCallbackFn);

        dataif.deleteRow(tableId, stringifiedJSON, rowId, req._callbackId, req._trxnId, leaveTransactionOpen);
    },

    addRow: function(tableId, stringifiedJSON, rowId, successCallbackFn, failureCallbackFn, transId, leaveTransactionOpen) {
        var that = this;

        var req = that.queueRequest('addRow', leaveTransactionOpen, transId, successCallbackFn, failureCallbackFn);

        dataif.addRow(tableId, stringifiedJSON, rowId, req._callbackId, req._trxnId, leaveTransactionOpen);
    },

    addCheckpoint: function(tableId, stringifiedJSON, rowId, successCallbackFn, failureCallbackFn, transId, leaveTransactionOpen) {
        var that = this;

        var req = that.queueRequest('addCheckpoint', leaveTransactionOpen, transId, successCallbackFn, failureCallbackFn);

        dataif.addCheckpoint(tableId, stringifiedJSON, rowId, req._callbackId, req._trxnId, leaveTransactionOpen);
    },

    saveCheckpointAsIncomplete: function(tableId, rowId, successCallbackFn, 
        failureCallbackFn, transId, leaveTransactionOpen) {
        var that = this;

        var req = that.queueRequest('saveCheckpointAsIncomplete', leaveTransactionOpen, transId, successCallbackFn, 
            failureCallbackFn);

        dataif.saveCheckpointAsIncomplete(tableId, rowId, req._callbackId, req._trxnId, leaveTransactionOpen); 
    },

    saveCheckpointAsComplete: function(tableId, rowId, successCallbackFn, failureCallbackFn,
        transId, leaveTransactionOpen) {
        var that = this;

        var req = that.queueRequest('saveCheckpointAsComplete', leaveTransactionOpen, transId, successCallbackFn, failureCallbackFn);

        dataif.saveCheckpointAsComplete(tableId, rowId, req._callbackId, req._trxnId, leaveTransactionOpen);
    },

    deleteLastCheckpoint: function(tableId, rowId, deleteAllCheckpoints, successCallbackFn, failureCallbackFn, 
        transId, leaveTransactionOpen) {
        var that = this;

        var req = that.queueRequest('deleteLastCheckpoint', leaveTransactionOpen, transId, successCallbackFn, failureCallbackFn);

        dataif.deleteLastCheckpoint(tableId, rowId, deleteAllCheckpoints, req._callbackId, req._trxnId, leaveTransactionOpen);
    },

    closeTransaction: function(transId, commitTransaction, successCallbackFn, failureCallbackFn) {
        var that = this;

        // Set leaveTransactionOpen to false to ensure that the transId 
        // passed in is used
        var req = that.queueRequest('closeTransaction', false, transId, successCallbackFn, failureCallbackFn);

        dataif.closeTransaction(req._trxnId, commitTransaction, req._callbackId);
    },

    queueRequest: function (type, leaveTransOpen, transId, successCallbackFn, failureCallbackFn) {
        var that = this;

        var txId = transId;
        if (leaveTransOpen) {
            if (txId === undefined || txId === null) {
                txId = that._transactionId;
                that._transactionId = that._transactionId + 1;
            }
        }

        var cbId = that._callbackId;

        var activeRequest = {
            _trxnId: txId,
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
        console.log('invokeCallbackFn called with cbId ' + cbId);
        var that = this;
        var found = false;

        if (cbId === null || cbId === undefined) {
            return;
        }

        var errorMsg = null;
        if (jsonResult.error !== undefined && jsonResult.error !== null) {
            errorMsg = jsonResult.error;
        }

        var txId = null;
        if (jsonResult.transId !== null && jsonResult.transId !== undefined) {
            txId = jsonResult.transId;
        }

        var cbIdNum = parseInt(cbId);
        for (var i = 0; i < that._requestMap.length; i++) {
            if (that._requestMap[i]._callbackId === cbIdNum) {
                var trxn = that._requestMap[i];
                that._requestMap.splice(i, 1);
                if (errorMsg !== null && errorMsg !== undefined) {
                    console.log('datarsp invokeCallbackFn error - requestType: ' + trxn._requestType + ' callbackId: ' + trxn._callbackId +
                    ' transId: ' + txId + ' error: ' + errorMsg);
                    if(trxn._failureCbFn !== null && trxn._failureCbFn !== undefined) {
                        (trxn._failureCbFn)(errorMsg);
                    }
                } else {
                    console.log('datarsp invokeCallbackFn success - requestType: ' + trxn._requestType + ' callbackId: ' + trxn._callbackId +
                    ' transId: ' + txId);
                    if (trxn._successCbFn !== null && trxn._successCbFn !== undefined) {
                        var reqData = new window.__getResultData();
                        reqData.setBackingObject(jsonResult); 
                        (trxn._successCbFn)(reqData);
                    }
                }
                found = true;
            }
        }
        
        if (!found) {
            console.log('datarsp invokeCallbackFn - no callback found for callbackId: ' + cbId);
        }
    },

	responseAvailable: function() {
        var that = this;
		setTimeout(function() {
			var resultJSON = window.dataif.getResponseJSON();
			//console.log('datarsp: resultJSON is ' + resultJSON);

			var result = JSON.parse(resultJSON);

            var callbackFnStr = result.callbackJSON;
			console.log('datarsp: callbackJSON is ' + callbackFnStr);

            that.invokeCallbackFn(result, callbackFnStr);

		}, 0);
	}
};