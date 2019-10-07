/**
 * This is the file that will be creating the list view.
 */
/* global $, odkTables */
'use strict';

// This will map types of refrigerators.
var idxStart = -1;
var healthFacilityResultSet = {};
var locale = null;
var facIDTxt = 'Facility ID';

var cbSuccess = function(result) {

    healthFacilityResultSet = result;

    return (function() {
        displayGroup(idxStart);
    }());
};

var cbFailure = function(error) {

    console.log('health_facilities_list getViewData CB error : ' + error);
};

var resumeFn = function(fIdxStart) {
    locale = odkCommon.getPreferredLocale();
    facIDTxt = odkCommon.localizeText(locale, "facility_id");
    odkData.getViewData(cbSuccess, cbFailure);

    idxStart = fIdxStart;
    console.log('resumeFn called. idxStart: ' + idxStart);
    // The first time through we're going to make a map of typeId to
    // typeName so that we can display the name of each shop's specialty.
    if (idxStart === 0) {

        // We're also going to add a click listener on the wrapper ul that will
        // handle all of the clicks on its children.
        $('#list').click(function(e) {
            var tableId = healthFacilityResultSet.getTableId();
            // We set the rowId while as the li id. However, we may have
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
                odkTables.openDetailView(null, tableId, rowId, null);
            }
        });
    }
};

/**
 * Displays the list view in chunks or groups. Number of list entries per chunk
 * can be modified. The list view is designed so that each row in the table is
 * represented as a list item. If you touch a particular list item, it will
 * expand with more details (that you choose to include). Clicking on this
 * expanded portion will take you to the more detailed view.
*/
var displayGroup = function(idxStart) {
    // Ensure that this is the first displayed in the list
    var mapIndex = healthFacilityResultSet.getMapIndex();

    // Make sure that it is valid
    if (mapIndex !== null && mapIndex !== undefined) {
        // Make sure that it is not invalid
        if (mapIndex !== -1) {
            // Make this the first item in the list
            addDataForRow(mapIndex);
        }
    }

    console.log('displayGroup called. idxStart: ' + idxStart);
    /* Number of rows displayed per 'chunk' - can modify this value */
    var chunk = 50;
    for (var i = idxStart; i < idxStart + chunk; i++) {
        console.log('Health Facility Result Count: ' + healthFacilityResultSet.getCount());
        if (i >= healthFacilityResultSet.getCount()) {
            break;
        }

        // Make sure not to repeat the selected item if one existed
        if (i === mapIndex) {
            continue;
        }

        addDataForRow(i);
        console.log('Added data for row ' + i);
    }
    if (i < healthFacilityResultSet.getCount()) {
        setTimeout(resumeFn, 0, i);
    }
};

function addDataForRow(rowNumber) {
    /*    Creating the item space    */
    /* Creates the item space */
    // We're going to select the ul and then start adding things to it.
    //var item = $('#list').append('<li>');
    var item = $('<li>');
    item.attr('id', healthFacilityResultSet.getRowId(rowNumber));
    item.attr('rowId', healthFacilityResultSet.getRowId(rowNumber));
    item.attr('class', 'item_space');
    item.text(healthFacilityResultSet.getData(rowNumber, 'facility_name'));

    /* Creates arrow icon (Nothing to edit here) */
    var chevron = $('<img>');
    chevron.attr('src', odkCommon.getFileAsUrl('config/assets/img/white_arrow.png'));
    chevron.attr('class', 'chevron');
    item.append(chevron);

    var field1 = $('<li>');
    field1.attr('class', 'detail');
    field1.text(facIDTxt + ': ' + healthFacilityResultSet.getData(rowNumber, 'facility_id'));
    item.append(field1);

    $('#list').append(item);

    // don't append the last one to avoid the fencepost problem
    var borderDiv = $('<div>');
    borderDiv.addClass('divider');
    $('#list').append(borderDiv);
}
