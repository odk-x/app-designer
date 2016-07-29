/**
 * This is the file that will create the list view for the refrigerator inventory table.
 */
/* global $, odkTables, data */
'use strict';

// if (JSON.parse(odkCommon.getPlatformInfo()).container === 'Chrome') {
//     console.log('Welcome to Tables debugging in Chrome!');
//     $.ajax({
//         url: odkCommon.getFileAsUrl('output/debug/refrigerators_data.json'),
//         async: false,  // do it first
//         success: function(dataObj) {
//             window.data.setBackingObject(dataObj);
//         }
//     });
// }

var refrigeratorsResultSet = {};
var facilityData = {};
var typeData = {};
var facilityNameMap = {};
var typeIdMap = {};
var idxStart = -1;

function refrigeratorTypesCBSuccess(result) {

    typeData = result;

    return (function() {
        displayGroup(idxStart);
    }());

}

function refrigeratorTypesCBFailure(error) {

    console.log('refrigeratorTypesCBFailure: failed with error: ' + error);

}

function refrigeratorFacilitiesCBSuccess(result) {

    facilityData = result;

    for (var i = 0; i < facilityData.getCount(); i++) {
        facilityNameMap[facilityData.getData(i, 'facility_id')] =
            facilityData.getData(i, 'Name');
    }
}

function refrigeratorFacilitiesCBFailure(error) {

    console.log('refrigeratorFacilitiesCBFailure: failed with error: ' + error);

}

function cbSuccess(result) {

    refrigeratorsResultSet = result;

    odkData.query('health_facility', null, null, null, null, null, null, true, 
        refrigeratorFacilitiesCBSuccess, refrigeratorFacilitiesCBFailure);

    odkData.query('refrigerator_types', null, null, null, null, null, null, true, 
        refrigeratorTypesCBSuccess, refrigeratorTypesCBFailure);

}

function cbFailure(error) {

    console.log('getViewData failed with error: ' + error);

}

/* Called when page loads to display things (Nothing to edit here) */
var resumeFn = function(fIdxStart) {
    odkData.getViewData(cbSuccess, cbFailure);

    idxStart = fIdxStart;
    console.log('resumeFn called. idxStart: ' + idxStart);
    // The first time through we're going to make a map of typeId to
    // typeName so that we can display the name of each shop's specialty.
    if (idxStart === 0) {

        // We're also going to add a click listener on the wrapper ul that will
        // handle all of the clicks on its children.
        $('#list').click(function(e) {
            var tableId = refrigeratorsResultSet.getTableId();
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
                odkTables.openDetailView(tableId, rowId, null);
                console.log('opened detail view');

            }
        });
    }
};


var displayGroup = function(idxStart) {
    console.log('display group called. idxStart: ' + idxStart);
    /* Number of rows displayed per 'chunk' - can modify this value */
    for (var i = 0; i < refrigeratorsResultSet.getCount(); i++) {

        /* Creates the item space */
        // We're going to select the ul and then start adding things to it.
        //var item = $('#list').append('<li>');
        var item = $('<li>');
        item.attr('rowId', refrigeratorsResultSet.getRowId(i));
        item.attr('class', 'item_space');
        item.text(refrigeratorsResultSet.getData(i, 'refrigerator_id'));
                
        /* Creates arrow icon (Nothing to edit here) */
        var chevron = $('<img>');
        chevron.attr('src', odkCommon.getFileAsUrl('config/assets/img/little_arrow.png'));
        chevron.attr('class', 'chevron');
        item.append(chevron);
                
        var field1 = $('<li>');
        var facilityName = facilityNameMap[refrigeratorsResultSet.getData(i, 'facility_id')];
        field1.attr('class', 'detail');
        field1.text('Healthcare Facility: ' + facilityName);
        item.append(field1);

        var field2 = $('<li>');
        var typeId = refrigeratorsResultSet.getData(i, 'model_id');
        field2.attr('class', 'detail');
        field2.text('Model ID: ' + typeId);
        item.append(field2);

        $('#list').append(item);

        // don't append the last one to avoid the fencepost problem
        var borderDiv = $('<div>');
        borderDiv.addClass('divider');
        $('#list').append(borderDiv);
    }

    if (i < refrigeratorsResultSet.getCount()) {
        setTimeout(resumeFn, 0, i);
    }

};
