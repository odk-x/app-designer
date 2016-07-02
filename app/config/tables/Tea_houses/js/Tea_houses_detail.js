/**
 * The file for displaying detail views of the Tea Houses table.
 */
/* global $, odkTables */
'use strict';

// Handle the case where we are debugging in chrome.
// if (JSON.parse(odkCommon.getPlatformInfo()).container === 'Chrome') {
//     console.log('Welcome to Tables debugging in Chrome!');
//     $.ajax({
//         url: odkCommon.getFileAsUrl('output/debug/Tea_houses_data.json'),
//         async: false,  // do it first
//         success: function(dataObj) {
//             window.data.setBackingObject(dataObj);
//         }
//     });
// }

var teaHouseResultSet = {}; 
var typeData = {};

function onLinkClick() {

    if (!$.isEmptyObject(teaHouseResultSet))
    {
        odkTables.openTableToListView(
          'Tea_inventory',
          'House_id = ?',
          [teaHouseResultSet.getRowId(0)],
          'config/tables/Tea_inventory/html/Tea_inventory_list.html');
    }
}

function cbSuccess(result) {

    teaHouseResultSet = result;

    odkData.query('Tea_types', '_id = ?', [teaHouseResultSet.get('Specialty_Type_id')], 
        null, null, null, null, true, teaTypeCBSuccess, teaTypeCBFailure);

    // CAL: I'm not positive that this is all we need to change to get this to work!!
    odkData.query('Tea_inventory', 'House_id = ?', [teaHouseResultSet.getRowId(0)], 
        null, null, null, null, true, teaInvCBSuccess, teaInvCBFailure);
}

function cbFailure(error) {

    console.log('Tea_houses_detail getViewData CB error : ' + error);
}

var display = function() {

    odkData.getViewData(cbSuccess, cbFailure);
}

function teaTypeCBSuccess(result) {

    console.log('Tea_houses_detail tea type query CB success');
    typeData = result;
}

function teaTypeCBFailure(error ) {

    console.log('Tea_houses_detail tea type query CB error : ' + error);
}

function teaInvCBSuccess(invData) {

    nullCaseHelper('Name', '#TITLE');
    nullCaseHelper('State', "#FIELD_2");
    nullCaseHelper('Region', '#FIELD_3');
    nullCaseHelper('District', 'FIELD_4');
    nullCaseHelper('Neighborhood', '#FIELD_5');
    nullCaseHelper('Date_Opened', 'FIELD_13');
    nullCaseHelper('Customers', 'FIELD_7');
    nullCaseHelper('Visits', 'FIELD_18');
    // The latitude and longitude are stored in a single column as GeoPoint.
    // We need to extract the lat/lon from the GeoPoint.
    nullCaseHelper('Location.latitude', '#FIELD_8');
    nullCaseHelper('Location.longitude', '#FIELD_9');
    
    nullCaseHelper('Owner', '#FIELD_14');
    nullCaseHelper('Phone_Number', '#FIELD_15');
    
    if (typeData.getCount() > 0) {
        $('#FIELD_6').text(typeData.getData(0, 'Name'));
    }


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

function nullCaseHelper(input, output) {
    var temp = teaHouseResultSet.get(input);
    if (temp != null) {
        $(output).text(temp);
    }
}

function teaInvCBFailure(error ) {
    console.log('Tea_houses_detail tea inv query CB error : ' + error);
}
