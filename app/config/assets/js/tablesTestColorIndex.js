/**
 * This is the file that will be creating the list view.
 */
/* global $, control, data */
'use strict';
 
// This will be used to store the geotagger locations.
var dataMap = {};
var retObj = {};
            
/** 
 * Use chunked list view for larger tables: We want to chunk the displays so
 * that there is less load time.
 */
            
/**
 * Called when page loads to display things (Nothing to edit here)
 */

var cbFn = function (result) {

    retObj = result;
    for (var i = 0; i < result.getCount(); i++) {
        dataMap[i] = result.getData(i, 'Description');
        //console.log("dataMap[" + i + "] = " + dataMap[i]);

        var rowId = result.getRowId(i);
        console.log('Test of getRowId ' + rowId);
    }
    
    return (function() {
        displayGroup(0);
    }());
};

var cbFnFailure = function (error) {

    console.log('Unable to get query for geotagger FAILED with error: ' + error);
};

var resumeFn = function(idxStart) {

    console.log('resumeFn called. idxStart: ' + idxStart);
    // The first time through query for the geotagger data
    if (idxStart === 0) {
        console.log('Invoking dataif for the tables color rules test');

        // Get the KVS when set to true
        // Original query
        datarsp.query('geotagger', null, null, null, null, null, null, true, cbFn, cbFnFailure, null, false);

        //var typeData = control.query('Tea_types', null, null);
        //for (var typeCntr = 0; typeCntr < typeData.getCount(); typeCntr++) {
        //    typeNameMap[typeData.getData(typeCntr, 'Type_id')] =
        //        typeData.getData(typeCntr, 'Name');
        //}

        // We're also going to add a click listener on the wrapper ul that will
        // handle all of the clicks on its children.
        //$('#list').click(function(e) {
          //var tableId = data.getTableId();
            // We set the rowId while as the li id. However, we may have
            // clicked on the li or anything in the li. Thus we need to get
            // the original li, which we'll do with jQuery's closest()
            // method. First, however, we need to wrap up the target
            // element in a jquery object.
            // wrap up the object so we can call closest()
        //var jqueryObject = $(e.target);
            // we want the closest thing with class item_space, which we
            // have set up to have the row id
        //var containingDiv = jqueryObject.closest('.item_space');
        //var rowId = containingDiv.attr('rowId');
        //console.log('clicked with rowId: ' + rowId);
            // make sure we retrieved the rowId
        //if (rowId !== null && rowId !== undefined) {
                // we'll pass null as the relative path to use the default file
            //control.openDetailView(tableId, rowId, null);
        //}
        //});
    }
};


       
/**
 * Displays the list view in chunks or groups. Number of list entries per chunk
 * can be modified. The list view is designed so that each row in the table is
 * represented as a list item. If you touch a particular list item, it will
 * expand with more details (that you choose to include). Clicking on this
 * expanded portion will take you to the more detailed view.
*/
function displayGroup(idxStart) {
    console.log('displayGroup called. idxStart: ' + idxStart);
    /* Number of rows displayed per 'chunk' - can modify this value */
    var chunk = 50;
    for (var i = idxStart; i < idxStart + chunk; i++) {
        if (i >= retObj.getCount()) {
            break;
        }
        /* Creates the item space */
        var item = $('<li>');
        item.attr('rowId', retObj.getRowId(i));
        item.attr('class', 'item_space');
        item.text(dataMap[i]);
                
        /* Creates arrow icon (Nothing to edit here) */
        var chevron = $('<img>');
        chevron.attr('src', control.getFileAsUrl('config/assets/img/little_arrow.png'));
        chevron.attr('class', 'chevron');
        item.append(chevron);
                
        /**
         * Adds other data/details in item space.
         * Replace COLUMN_NAME with the column whose data you want to display
         * as an extra detail etc. Duplicate the following block of code for
         * different details you want to add. You may replace occurrences of
         * 'field1' with new, specific label that are more meaningful to you
         */
        var field1 = $('<li>');
        field1.attr('class', 'detail');
        var dateTime = retObj.getData(i, 'Date_and_Time');
        field1.text(dateTime);
        item.append(field1);

        var field2 = $('<li>');
        field2.attr('class', 'detail');
        var lat = retObj.getData(i, 'Location_latitude');
        var lon = retObj.getData(i, 'Location_longitude');
        field2.text('Latitude: ' + lat + ' Longitude: ' + lon);
        item.append(field2);

        // Set the color here if one is passed in
        item.css({backgroundColor:retObj.getRowBackgroundColor(i)});
        item.css({color:retObj.getRowForegroundColor(i)});
        $('#list').append(item);

        // don't append the last one to avoid the fencepost problem
        var borderDiv = $('<div>');
        borderDiv.addClass('divider');
        $('#list').append(borderDiv);

    }
    if (i < retObj.getCount()) {
        setTimeout(resumeFn, 0, i);
    }
}
