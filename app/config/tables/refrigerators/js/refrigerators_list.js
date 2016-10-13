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
    console.log('refrigeratorTypesCBSuccess');
    for (var i = 0; i < typeData.getCount(); i++) {
        console.log('Row ID: ' + typeData.getRowId(i));
        console.log('Catalog ID: ' + typeData.getData(i, 'catalog_id'));
        typeIdMap[typeData.getRowId(i)] = typeData.getData(i, 'catalog_id');
    }

    return (function() {
        displayGroup(idxStart);
    }());

}

function refrigeratorTypesCBFailure(error) {

    console.log('refrigeratorTypesCBFailure: failed with error: ' + error);

}

function healthFacilitiesCBSuccess(result) {

    facilityData = result;

    for (var i = 0; i < facilityData.getCount(); i++) {

        facilityNameMap[facilityData.getRowId(i)] =
            facilityData.getData(i, 'facility_name');

    }
}

function healthFacilitiesCBFailure(error) {

    console.log('healthFacilitiesCBFailure: failed with error: ' + error);

}

function cbSuccess(result) {

    refrigeratorsResultSet = result;

    if (refrigeratorsResultSet.getCount() === 0) {
        console.log('No Refrigerators');
        var note = $('<li>');
        note.attr('class', 'note');
        note.text('No Refrigerators');
        $('#list').append(note);

    } else {

        odkData.query('health_facility', null, null, null, null, null, null, null, null, true, 
            healthFacilitiesCBSuccess, healthFacilitiesCBFailure);

        odkData.query('refrigerator_types', null, null, null, null, null, null, null, null, true, 
            refrigeratorTypesCBSuccess, refrigeratorTypesCBFailure);

    }

}

function cbFailure(error) {

    console.log('getViewData failed with error: ' + error);

}

var cbSearchSuccess = function(searchData) {
    console.log('cbSearchSuccess data is' + searchData);
    if(searchData.getCount() > 0) {
        // open filtered list view if facility found
        var rowId = searchData.getRowId(0);
        odkTables.openTableToListView(
                'refrigerators',
                '_id = ?',
                [rowId],
                'config/tables/refrigerators/html/refrigerators_list.html');
    } else {
        document.getElementById("search").value = "";
        document.getElementsByName("query")[0].placeholder="Refrigerator not found";
    }
}

var cbSearchFailure = function(error) {
    console.log('refrigerators_list cbSearchFailure: ' + error);
}

var getSearchResults = function() {
    var searchText = document.getElementById('search').value;

    odkData.query('refrigerators', 'refrigerator_id = ?', [searchText], 
        null, null, null, null, null, null, true, cbSearchSuccess, cbSearchFailure);
}

/* Called when page loads to display things (Nothing to edit here) */
var resumeFn = function(fIdxStart) {
    odkData.getViewData(cbSuccess, cbFailure);

    idxStart = fIdxStart;
    console.log('resumeFn called. idxStart: ' + idxStart);

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
        var catalogID = typeIdMap[refrigeratorsResultSet.getData(i, 'model_row_id')];
        item.attr('rowId', refrigeratorsResultSet.getRowId(i));
        item.attr('class', 'item_space');
        item.text('Refrigerator ' + refrigeratorsResultSet.getData(i, 'refrigerator_id')
            + ' | ' + catalogID);
                
        /* Creates arrow icon (Nothing to edit here) */
        var chevron = $('<img>');
        chevron.attr('src', odkCommon.getFileAsUrl('config/assets/img/white_arrow.png'));
        chevron.attr('class', 'chevron');
        item.append(chevron);
                
        var field1 = $('<li>');
        var facilityName = facilityNameMap[refrigeratorsResultSet.getData(i, 'facility_row_id')];
        field1.attr('class', 'detail');
        field1.text('Healthcare Facility: ' + facilityName);
        item.append(field1);

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
