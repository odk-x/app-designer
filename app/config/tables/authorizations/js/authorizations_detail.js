'use strict';

 
var authorizationsResultSet = {};
var insideQueue = false;
var htmlFileNameValue = "authorizations_detail";
var userActionValue = "launchBarcode";
var myTimeoutVal = null;
var beneficiary_code = null;


var display = function() {
  odkData.getViewData(cbSuccess, cbFailure);
};

var cbSuccess = function (result) {
  authorizationsResultSet = result;

  $('#FIELD_1').text(authorizationsResultSet.get('authorization_name'));
  $('#FIELD_2').text(authorizationsResultSet.get('_id'));
  $('#FIELD_3').text(authorizationsResultSet.get('item_pack_name'));
  $('#FIELD_4').text(authorizationsResultSet.get('item_pack_id'));
  $('#FIELD_5').text(authorizationsResultSet.get('item_description'));
}

var cbFailure = function(error) {
  console.log('dispaly failure with error: ' + error);
}