/**
 * The file for displaying detail views of the Tea Houses table.
 */
/* global $, odkTables, odkData */
'use strict';

var teaHouseResultSet = {}; 
var typeData = {};

function onLinkClick() {

    if (!$.isEmptyObject(teaHouseResultSet))
    {
        odkTables.openTableToListView(null, 
          'Tea_inventory',
          'House_id = ?',
          [teaHouseResultSet.getRowId(0)],
          'config/tables/Tea_inventory/html/Tea_inventory_list.html' );
    }
}

/**
 * Assumes teaHouseResultSet has valid content
 *
 * Updates document field with the value for the elementKey
 */
function nullCaseHelper(elementKey, documentSelector) {
    var temp = teaHouseResultSet.get(elementKey);
    if (temp !== null && temp !== undefined) {
        $(documentSelector).text(temp);
    }
}

/**
 * Assumes teaHouseResultSet has valid content.
 *
 * Updates the document content with the information from the teaHouseResultSet
 */
function updateTeaHouseContent() {

    nullCaseHelper('Name', '#TITLE');
    nullCaseHelper('State', "#FIELD_2");
    nullCaseHelper('Region', '#FIELD_3');
    nullCaseHelper('District', '#FIELD_4');
    nullCaseHelper('Neighborhood', '#FIELD_5');
    nullCaseHelper('Date_Opened', '#FIELD_13');
    nullCaseHelper('Customers', '#FIELD_7');
    nullCaseHelper('Visits', '#FIELD_18');
    // The latitude and longitude are stored in a single column as GeoPoint.
    // We need to extract the lat/lon from the GeoPoint.
    nullCaseHelper('Location.latitude', '#FIELD_8');
    nullCaseHelper('Location.longitude', '#FIELD_9');
    
    nullCaseHelper('Owner', '#FIELD_14');
    nullCaseHelper('Phone_Number', '#FIELD_15');

    if(teaHouseResultSet.get('Iced') === 'Yes') {
        $('#FIELD_10').attr('checked', true);
    }
    $('#FIELD_10').attr('disabled', true);
    if(teaHouseResultSet.get('Hot') === 'Yes') {
        $('#FIELD_11').attr('checked', true);
    }
    $('#FIELD_11').attr('disabled', true);
    if(teaHouseResultSet.get('WiFi') === 'Yes') {
        $('#FIELD_12').attr('checked', true);
    }
    $('#FIELD_12').attr('disabled', true);
}

function cbSuccess(result) {

    teaHouseResultSet = result;
	// and update the document with the values for this tea house
	updateTeaHouseContent();

	// get the broad type of tea (singleton) that this tea house specializes in
    odkData.query('Tea_types', '_id = ?', [teaHouseResultSet.get('Specialty_Type_id')], 
        null, null, null, null, null, null, true, teaTypeCBSuccess, teaTypeCBFailure);

    // get the inventory for this tea house
    odkData.query('Tea_inventory', 'House_id = ?', [teaHouseResultSet.getRowId(0)], 
        null, null, null, null, null, null, true, teaInvCBSuccess, teaInvCBFailure);
}

function cbFailure(error) {

	// a real application would perhaps clear the document fiels if there were an error
    console.log('Tea_houses_detail getViewData CB error : ' + error);
}

var display = function() {
	
    odkData.getViewData(cbSuccess, cbFailure);
};

function teaTypeCBSuccess(result) {

    console.log('Tea_houses_detail tea type query CB success');
    typeData = result;

    // populate the document field containing the name of
    // broad type of tea (singleton) that this tea house specializes in.
    if (typeData.getCount() > 0) {
        $('#FIELD_6').text(typeData.getData(0, 'Name'));
    }

}

function teaTypeCBFailure(error ) {
	// a real application would perhaps clear the document fiels if there were an error
    console.log('Tea_houses_detail tea type query CB error : ' + error);
}

function teaInvCBSuccess(invData) {

	// update the document field that reports the number of teas 
	// that are stocked by this tea house.
    var teaQuantity = invData.getCount();
    if (teaQuantity == 1) {
        document.getElementById("tea_button").innerHTML="1 Tea";
    } else if (teaQuantity > 1) {
        document.getElementById("tea_button").innerHTML=teaQuantity + " Teas";

    }
}

function teaInvCBFailure(error ) {
    console.log('Tea_houses_detail tea inv query CB error : ' + error);
}

