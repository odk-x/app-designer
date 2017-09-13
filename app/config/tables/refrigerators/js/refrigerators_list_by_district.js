/**
 * This is the file that will create the list view for the table.
 */
/* global $, odkCommon, odkData, odkTables, util */
'use strict';

var idxStart = -1;
var limit = 20;
var offset = 0;
var rowCount = 0;
var tableId = 'refrigerators';

var districtQuery = 'SELECT * FROM refrigerators ' + 
    'JOIN health_facility ON refrigerators.facility_row_id = health_facility._id ' +
    'JOIN refrigerator_types ON refrigerators.model_row_id = refrigerator_types._id ' +
    'WHERE health_facility.admin_region = ?';

var cntDistrictQuery = 'SELECT COUNT(*) AS cnt FROM (' +
    districtQuery + ')';

var districtSearchQuery = 'SELECT * FROM refrigerators ' + 
    'JOIN health_facility ON refrigerators.facility_row_id = health_facility._id ' +
    'JOIN refrigerator_types ON refrigerators.model_row_id = refrigerator_types._id ' +
    'WHERE (health_facility.admin_region = ? AND (facility_name LIKE ? OR facility_id LIKE ? OR ' + 
    'tracking_id LIKE ? OR refrigerator_id LIKE ?))';

var cntDistrictSearchQuery = 'SELECT COUNT(*) AS cnt FROM (' +
    districtSearchQuery + ')';

var queryToRun = null;
var queryToRunParams = null;
var cntQueryToRun = null;

function processPromises(cntResultSet, resultSet) {
    // Set the text for the number of rows
    if (cntResultSet.getCount() > 0) {
        rowCount = cntResultSet.getData(0, 'cnt');
    } else {
        rowCount = 0;
    }

    if (rowCount === 0) {
        offset = 0;
    }

    // Display the results in the list
    updateNavButtons();
    updateNavText();
    clearRows();

    if (resultSet.getCount() === 0) {
        console.log('No ' + util.formatDisplayText(tableId));
        var note = $('<li>');
        note.attr('class', 'note');
        note.text('No ' + util.formatDisplayText(tableId));
        $('#list').append(note);

    } else {
        displayGroup(resultSet);
    }
}

function resumeFn(fIdxStart) {
    idxStart = fIdxStart;
    console.log('resumeFn called. idxStart: ' + idxStart);

    if (idxStart === 0) {
        rowCount = 0;
        offset = 0;
        limit = parseInt($('#limitDropdown option:selected').text());

        // Init display
        var queryParamArg = util.getQueryParameter(util.leafRegion);
        if (queryParamArg === null) {
            console.log('No valid query param passed in - nothing to display');
            return;
        }

        $('#header').text(queryParamArg);

        cntQueryToRun = cntDistrictQuery;
        queryToRun = districtQuery;
        queryToRunParams = [queryParamArg];
    }

    var cntQueryPromise = new Promise(function(resolve, reject) {
        odkData.arbitraryQuery(tableId, 
            cntQueryToRun, queryToRunParams, null, null, resolve, reject);
    });

    var queryPromise = new Promise(function(resolve, reject)  {
        odkData.arbitraryQuery(tableId, 
            queryToRun, queryToRunParams, limit, offset, resolve, reject);
        
    });

    Promise.all([cntQueryPromise, queryPromise]).then(function(resultArray) {
        processPromises(resultArray[0], resultArray[1]);

    }, function(err) {
        console.log('promises failed with error: ' +  err);
    });

    if (idxStart === 0) {
        // We're also going to add a click listener on the wrapper ul that will
        // handle all of the clicks on its children.
        $('#list').click(function(e) {
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

function displayGroup(resultSet) {
    /* Number of rows displayed per 'chunk' - can modify this value */
    for (var i = 0; i < resultSet.getCount(); i++) {

        /* Creates the item space */
        var item = $('<li>');
        var catalogID = resultSet.getData(i, 'catalog_id');
        item.attr('rowId', resultSet.getRowId(i));
        item.attr('class', 'item_space');
        item.text('Refrigerator ' + resultSet.getData(i, 'tracking_id') +
            ' | ' + catalogID);

        /* Creates arrow icon (Nothing to edit here) */
        var chevron = $('<img>');
        chevron.attr('src', odkCommon.getFileAsUrl('config/assets/img/white_arrow.png'));
        chevron.attr('class', 'chevron');
        item.append(chevron);

        var field1 = $('<li>');
        var facilityName = resultSet.getData(i, 'facility_name');
        field1.attr('class', 'detail');
        field1.text('Healthcare Facility: ' + facilityName);
        item.append(field1);

        $('#list').append(item);

        // don't append the last one to avoid the fencepost problem
        var borderDiv = $('<div>');
        borderDiv.addClass('divider');
        $('#list').append(borderDiv);
    }
}

function clearRows() {
  $('#list').empty();
}

function updateNavText() {
    $('#navTextCnt').text(rowCount);
    if (rowCount <= 0) {
        $('#navTextOffset').text(0);
        $('#navTextLimit').text(0);
    } else {
        var offsetDisplay = offset + 1;
        $('#navTextOffset').text(offsetDisplay);

        var limitVal = (offset + limit >= rowCount) ? rowCount : offset + limit;
        $('#navTextLimit').text(limitVal);
    }
}

function updateNavButtons() {
  if (offset === 0) {
    $('#prevButton').prop('disabled',true);  
  } else {
    $('#prevButton').prop('disabled',false);
  }

  if (offset + limit >= rowCount) {
    $('#nextButton').prop('disabled',true);  
  } else {
     $('#nextButton').prop('disabled',false);  
  }
}

function prevResults() {
    offset -= limit;
    if (offset < 0) {
        offset = 0;
    }

    updateNavButtons();

    clearRows();
    resumeFn(1);
}

function nextResults() {
    updateNavButtons();

    if (offset + limit >= rowCount) {  
        return;
    }

    offset += limit;

    clearRows();
    resumeFn(1);
}

function newLimit() {

    limit = parseInt($('#limitDropdown option:selected').text());

    clearRows();
    resumeFn(3);
}

function getSearchResults () {
    var queryParamArg = util.getQueryParameter(util.leafRegion);
    if (queryParamArg === null) {
        console.log('No valid query param passed in - nothing to display');
        return;
    }

    var searchText = $('#search').val();

    if (searchText !== null && searchText !== undefined &&
        searchText.length !== 0) {
        searchText = '%' + searchText + '%';
        cntQueryToRun = cntDistrictSearchQuery;
        queryToRun = districtSearchQuery;
        queryToRunParams = [queryParamArg, searchText, searchText, searchText, searchText];
        offset = 0;
        resumeFn(5);
    }
    
}

function clearResults() {
    var queryParamArg = util.getQueryParameter(util.leafRegion);
    if (queryParamArg === null) {
        console.log('No valid param passed in - nothing to display');
        return;
    }

    var searchText = $('#search').val();

    if (searchText === null || searchText === undefined ||
        searchText.length === 0) {

        cntQueryToRun = cntDistrictQuery;
        queryToRun = districtQuery;
        queryToRunParams = [queryParamArg];
        offset = 0;
        resumeFn(6);  
    }  
}
