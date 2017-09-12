/**
 * This is the file that will create the list view for the refrigerator inventory table.
 */
/* global $, odkCommon, odkData, odkTables, util */
'use strict';

var refrigeratorsResultSet = {};
var typeData = {};
var typeIdMap = {};
var idxStart = -1;
var limit = 10;
var offset = 0;


/* Called when page loads to display things (Nothing to edit here) */
function resumeFn(fIdxStart) {
    var dist = util.getQueryParameter(util.leafRegion);
    if (dist === null) {
        console.log('No valid district passed in - nothing to display');
        return;
    }

    odkData.arbitraryQuery('refrigerators', 
        'SELECT * FROM refrigerators ' + 
        'JOIN health_facility ON refrigerators.facility_row_id = health_facility._id ' +
        'JOIN refrigerator_types ON refrigerators.model_row_id = refrigerator_types._id ' +
        'WHERE health_facility.admin_region = ?', [dist], limit, offset, cbSuccess, cbFailure);

        // Query for count
        //SELECT * FROM refrigerators 
        //JOIN health_facility ON refrigerators.facility_row_id = health_facility._id JOIN 
        //refrigerator_types ON refrigerators.model_row_id = refrigerator_types._id 
        //WHERE health_facility.admin_region = ?

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
                odkTables.openDetailView(null, tableId, rowId, null);
                console.log('opened detail view');

            }
        });
    }
}

function displayGroup(idxStart) {
    console.log('display group called. idxStart: ' + idxStart);

    /* Number of rows displayed per 'chunk' - can modify this value */
    for (var i = 0; i < refrigeratorsResultSet.getCount(); i++) {

        /* Creates the item space */
        var item = $('<li>');
        var catalogID = refrigeratorsResultSet.getData(i, 'catalog_id');
        item.attr('rowId', refrigeratorsResultSet.getRowId(i));
        item.attr('class', 'item_space');
        item.text('Refrigerator ' + refrigeratorsResultSet.getData(i, 'tracking_id') +
            ' | ' + catalogID);

        /* Creates arrow icon (Nothing to edit here) */
        var chevron = $('<img>');
        chevron.attr('src', odkCommon.getFileAsUrl('config/assets/img/white_arrow.png'));
        chevron.attr('class', 'chevron');
        item.append(chevron);

        var field1 = $('<li>');
        var facilityName = refrigeratorsResultSet.getData(i, 'facility_name');
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

        displayGroup(idxStart);
    }
}

function cbFailure(error) {

    console.log('getViewData failed with error: ' + error);

}

function clearRows() {
  $('#list').empty();
}

/**
 * Chunk the displays for larger tables
 */
function prevResults() {
  offset -= limit;
  if (offset < 0) {
    offset = 0;
  }

  clearRows();
  resumeFn(0);
}

function nextResults() {
  offset += limit;

  clearRows();
  resumeFn(0);
}

function refrigeratorTypesCBSuccess(result) {

    typeData = result;
    console.log('refrigeratorTypesCBSuccess');
    for (var i = 0; i < typeData.getCount(); i++) {
        console.log('Row ID: ' + typeData.getRowId(i));
        console.log('Catalog ID: ' + typeData.getData(i, 'catalog_id'));
        typeIdMap[typeData.getRowId(i)] = typeData.getData(i, 'catalog_id');
    }

    displayGroup(idxStart);

}

function refrigeratorTypesCBFailure(error) {

    console.log('refrigeratorTypesCBFailure: failed with error: ' + error);

}

function cbSearchSuccess (searchData) {
    console.log('cbSearchSuccess data is' + searchData);
    if(searchData.getCount() > 0) {
        // open filtered list view if facility found
        var rowId = searchData.getRowId(0);
        odkTables.openTableToListView(
                null, 
                'refrigerators',
                '_id = ?',
                [rowId],
                'config/tables/refrigerators/html/refrigerators_list.html');
    } else {
        document.getElementById('search').value = '';
        document.getElementsByName('query')[0].placeholder='Refrigerator not found';
    }
}

function cbSearchFailure(error) {
    console.log('refrigerators_list cbSearchFailure: ' + error);
}

function getSearchResults () {
    var searchText = document.getElementById('search').value;

    odkData.query('refrigerators', 'refrigerator_id = ?', [searchText],
        null, null, null, null, null, null, true, cbSearchSuccess, cbSearchFailure);
}
