/**
 * This is the file that will be creating the list view.
 */
/* global $, odkTables, odkData, odkCommon */
'use strict';

// This will map types of teas.
var typeNameMap = {};  
var idxStart = -1;  
var teaHouseResultSet = {};        
/** 
 * Use chunked list view for larger tables: We want to chunk the displays so
 * that there is less load time.
 */
            
/**
 * Called when page loads to display things (Nothing to edit here)
 */
var teaTypeCBSuccess = function(result) {
    var typeData = result;

    for (var typeCntr = 0; typeCntr < typeData.getCount(); typeCntr++) {
        typeNameMap[typeData.getRowId(typeCntr)] =
            typeData.getData(typeCntr, 'Name');
    }

	odkData.getViewData(function(result) {
			teaHouseResultSet = result;
			// we know this is the first time - so displayGroup argument idxStart === 0.
			displayGroup(0);
	}, cbFailure);

};

var teaTypeCBFailure = function(error) {

    console.log('Tea_houses_list teaTypeCBFailure: ' + error);
};

var cbFailure = function(error) {

    console.log('Tea_houses_list getViewData CB error : ' + error);
};

var resumeFn = function(fIdxStart) {
    console.log('resumeFn called. idxStart: ' + idxStart);
    idxStart = fIdxStart;
	if ( fIdxStart === 0 ) {
		// First time through...
		
		// Add a click listener on the wrapper ul that will
		// handle all of the clicks on its children (which we need to populate)
		$('#list').click(function(e) {
			var tableId = teaHouseResultSet.getTableId();
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
				odkTables.openDetailWithListView(null, tableId, rowId,
                                         'config/tables/Tea_houses/html/Tea_houses_detail.html');
			}
		});

		// Make a map of typeId to typeName so that we can display
		// the name of each shop's specialty. After we get the type 
		// map, we will fetch the list of tea houses and populate the display.
		odkData.query('Tea_types', null, null, 
			null, null, null, null, null, null, true, teaTypeCBSuccess, teaTypeCBFailure);

	} else if ( $.isEmptyObject(typeNameMap) ) {
		console.log('unable to display subsequent list of tea houses because tea types map is empty');
	} else {
		// we have the type map, so we can display this new list of houses.
		
		// if we were paginating the odkData results, we would test whether we
        // exhausted the data in the teaHouseResultSet and issue a new query 
		//  on the "Tea_houses" table with a new offset (fIdxStart) and limit.
		displayGroup(fIdxStart);
	}
};
            
/**
 * Displays the list view in chunks or groups. Number of list entries per chunk
 * can be modified. The list view is designed so that each row in the table is
 * represented as a list item. If you touch a particular list item, it will
 * expand with more details (that you choose to include). Clicking on this
 * expanded portion will take you to the more detailed view.
 *
 * The chunking is to give the display a more responsive feel. It does not
 * refresh the list or page through the set of values in the list. 
 */
var displayGroup = function(idxStart) {
    // Ensure that this is the first displayed in the list
    var mapIndex = teaHouseResultSet.getMapIndex();
    
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
        if (i >= teaHouseResultSet.getCount()) {
            break;
        }

        // Make sure not to repeat the selected item if one existed
        if (i === mapIndex) {
            continue;
        }

        addDataForRow(i);

    }
    if (i < teaHouseResultSet.getCount()) {
        setTimeout(resumeFn, 0, i);
    }
};

function addDataForRow(rowNumber) {
    /*    Creating the item space    */
    /* Creates the item space */
    // We're going to select the ul and then start adding things to it.
    //var item = $('#list').append('<li>');
    var item = $('<li>');
    item.attr('id', teaHouseResultSet.getRowId(rowNumber));
    item.attr('rowId', teaHouseResultSet.getRowId(rowNumber));
    item.attr('class', 'item_space');
    var name = teaHouseResultSet.getData(rowNumber, 'Name');
    if (name === null || name === undefined) {
        name = 'unknown name';
    } 
    item.text(name);
     
            
    /* Creates arrow icon (Nothing to edit here) */
    var chevron = $('<img>');
    chevron.attr('src', odkCommon.getFileAsUrl('config/assets/img/little_arrow.png'));
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
    var specialtyId = teaHouseResultSet.getData(rowNumber, 'Specialty_Type_id');
    var typeName = typeNameMap[specialtyId];
    if (typeName === null || typeName === undefined) {
        typeName = 'unknown';
    }
    field1.text('Specialty: ' + typeName);
    item.append(field1);

    var field2 = $('<li>');
    field2.attr('class', 'detail');
    var district = teaHouseResultSet.getData(rowNumber, 'District');
    if (district === null || district === undefined) {
        district = 'unknown district';
    }
    var neighborhood = teaHouseResultSet.getData(rowNumber, 'Neighborhood');
    if (neighborhood === null || neighborhood === undefined) {
        neighborhood = 'unknown neighborhood';
    }
    field2.text(district + ', ' + neighborhood);
    item.append(field2);

    $('#list').append(item);

    // don't append the last one to avoid the fencepost problem
    var borderDiv = $('<div>');
    borderDiv.addClass('divider');
    $('#list').append(borderDiv);
}

