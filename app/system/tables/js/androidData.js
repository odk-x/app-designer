/**
 * This represents the data object handed to the webview in the Tables code.
 *
 * It provides all the functions available to the javascript. It corresponds
 * to org.opendatakit.tables.view.webkits.TableDataIf.
 */
'use strict';
/* jshint unused: vars */

/**
 * This stores the actual functionality of the data objects. Unlike control.js,
 * there can be multiple TableData objects at a time in the code, one as a
 * member of window and others returned from the code. Therefore the code has
 * to live elsewhere like this.
 */
window.__getResultData = function() {

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
    
    // This is the object that will end up as window.androidData.
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

        var result = [];
        for (var i = 0; i < pub.getCount(); i ++) {
            result.push(pub.getData(i, elementKey));
        }

        // We need to turn this into a string to mirror the phone api.
        // Maybe this should change to just return the data structure
        var colData = JSON.stringify(result);
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

        // Have to return a string because the phone returns a string.
        var result = JSON.stringify(resultObj.metadata.orderedColumns);
        return result;
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
};

/**
 * The idea of this call is that if we're on the phone, control will have been
 * set by the java framework. This script, however, should get run at the top
 * of the file no matter what. This way we're sure not to stomp on the java
 * object.
 */
if (!window.androidData) {

    // This will be the object specified by the appropriate data.json file.
    //var resultObj = null;

    // This is the object that will end up as window.data.
    var dataPub = window.__getResultData();

    window.androidData = window.androidData || dataPub;
}