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
window.__getTableData = function() {

    var dataObj = null;

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
    
    // This is the object that will end up as window.data.
    var pub = {};

    /**
     * This is the only function that is exposed to the caller that is NOT a
     * function exposed on the android object. It is intended only for use
     * while testing on Chrome.
     *
     * jsonObj should be a JSON object.
     */
    pub.setBackingObject = function(jsonObj) {
        dataObj = jsonObj;
    };

    pub.getCount = function() {
        return dataObj.count;
    };

    pub.getColumnData = function(elementPath) {
        // TODO: we should be getting the elementKey, not the path.
        if (!isString(elementPath)) {
            throw 'getColumnData()--elementPath not a string';
        }
        if (arguments.length !== 1) {
            throw 'getColumnData()--incorrect number of arguments';
        }
        // We need to turn this into a string to mirror the phone api.
        var result = JSON.stringify(dataObj.columnData[elementPath]);
        return result;
    };

    pub.getTableId = function() {
        return dataObj.tableId;
    };

    pub.getRowId = function(index) {
        // should only be a number and an int at that.
        if (!isInteger(index)) {
            throw 'getRowId()--index not an integer';
        }
        if (arguments.length !== 1) {
            throw 'getRowId()--incorrect number of arguments';
        }
        return dataObj.rowIds[index];
    };

    pub.getColumns = function() {
        // Have to return a string because the phone returns a string.
        var result = JSON.stringify(dataObj.columns);
        return result;
    };

    pub.getForegroundColor = function(elementPath, value) {
        if (arguments.length !== 2) {
            throw 'getForegroundColor()--incorrect number of arguments';
        }
        if (!isString(elementPath)) {
            throw 'getForegroundColor()--elementPath must be string';
        }
        if (!isString(value) && !isNumber(value)) {
            throw 'getForegroundColor()--value must be string or number';
        }
        var len = 0;
        if (value !== null && value !== undefined) {
            len = (''+value).length;
        }
        console.log('getForegroundColor() called');
        // we need to return a string, so we'll just bring back a dummy value
        var colors = ['blue','red','yellow','orange','green'];
        return colors[len % colors.length];
    };

    pub.isGroupedBy = function() {
        return dataObj.isGroupedBy;
    };

    pub.getData = function(rowNumber, elementPath) {
        return dataObj.data[rowNumber][elementPath];
    };

    pub.get = function(elementPath) {
        return pub.getData(0, elementPath);
    };

    return pub;
};

/**
 * The idea of this call is that if we're on the phone, control will have been
 * set by the java framework. This script, however, should get run at the top
 * of the file no matter what. This way we're sure not to stomp on the java
 * object.
 */
if (!window.data) {

    // This will be the object specified by the appropriate data.json file.
    //var dataObj = null;

    // This is the object that will end up as window.data.
    var dataPub = window.__getTableData();


    window.data = window.data || dataPub;

}


