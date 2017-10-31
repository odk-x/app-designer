/**
 * This is the file that will be creating the list view.
 */
/* global $, control, data */
'use strict';

// Use chunked list view for larger tables: We want to chunk the displays so
// that there is less load time.
var censusData = {};                 
/**
 * Called when page loads. idxStart is the index of the row that should be
 * displayed at this iteration through the loop.
 */
var resumeFn = function(idxStart) {

    console.log('resumeFn called. idxStart: ' + idxStart);
    // The first time through construct any constants you need to refer to
    // and set the click handler on the list elements.
    if (idxStart === 0) {
        // This add a click handler on the wrapper ul that will handle all of
        // the clicks on its children.
        $('#list').click(function(e) {
            var tableId = censusData.getTableId();
            // We have set the rowId while as the li id. However, we may have
            // clicked on the li or anything in the li. Thus we need to get
            // the original li, which we'll do with jQuery's closest()
            // method. First, however, we need to wrap up the target
            // element in a jquery object.
            // wrap up the object so we can call closest()
            var jqueryObject = $(e.target);
            // we want the closest thing with class item_space, which we
            // have set up to have the row id
            var containingDiv = jqueryObject.closest('.item_space');
            var rowId = containingDiv.attr('rowId');
            console.log('clicked with rowId: ' + rowId);
            // make sure we retrieved the rowId
            if (rowId !== null && rowId !== undefined) {
                // we'll pass null as the relative path to use the default file
                odkTables.openDetailView(null, tableId, rowId,
                                         'config/tables/census/html/census_detail.html');
            }
        });
    }
    
    odkData.getViewData(function(result) {
            censusData = result;
            // we know this is the first time - so displayGroup argument idxStart === 0.
            addDataForRow(0);
    }, epFailure);

};


var epFailure = function(error) {

    console.log('Census_list getViewData error : ' + error);
};
            
/**
 * Displays the list view in chunks. The number of list entries per chunk
 * can be modified. The list view is designed so that each row in the table is
 * represented as a list item. If you click a particular list item, it will
 * call the click handler defined in resumeFn. In the example case it opens
 * a detail view on the clicked row.
 */
var addDataForRow = function(idxStart) {
    // Number of rows displayed per chunk
    var chunk = 50;
    for (var i = idxStart; i < idxStart + chunk; i++) {
        if (i >= censusData.getCount()) {
            break;
        }

        // Creates the space for a single element in the list. We add rowId as
        // an attribute so that the click handler set in resumeFn knows which
        // row was clicked.
        var item = $('<li>');
        item.attr('id', censusData.getRowId(i));
        item.attr('rowId', censusData.getRowId(i));
        item.attr('class', 'item_space');
        item.text(censusData.getData(i, 'head_name'));

        var houseNumberField = $('<li>');
        houseNumberField.attr('class', 'detail');
        var houseNumber = "House No: " + censusData.getData(i, 'house_number');
        if (houseNumber === null || houseNumber === undefined) {
            houseNumber += ' Unknown';
        }
        houseNumberField.text(houseNumber);
        item.append(houseNumberField);
                
        /* Creates arrow icon (Nothing to edit here) */
        var chevron = $('<img>');
        chevron.attr('src', odkCommon.getFileAsUrl('config/assets/img/little_arrow.png'));
        chevron.attr('class', 'chevron');
        item.append(chevron);

        // Add any other details in your list item here.
                
        $('#list').append(item);
    }
    if (i < censusData.getCount()) {
        setTimeout(resumeFn, 0, i);
    }
};
