'use strict';

 
var authorizationsResultSet = {};

var display = function() {
  odkData.getViewData(cbSuccess, cbFailure);
};

var cbSuccess = function (result) {
  authorizationsResultSet = result;

  $('#FIELD_1').text(authorizationsResultSet.get('authorization_name'));
  $('#FIELD_2').text(authorizationsResultSet.get('authorization_id'));
  $('#FIELD_3').text(authorizationsResultSet.get('item_pack_name'));
  $('#FIELD_4').text(authorizationsResultSet.get('item_pack_id'));
  $('#FIELD_8').text(authorizationsResultSet.get('distribution_id'));
  $('#FIELD_7').text(authorizationsResultSet.get('is_override'));
  $('#FIELD_9').text(authorizationsResultSet.get('beneficiary_code'));

  var launchButton = $('#launch');
  launchButton.on(
    'click',
    function() {
      var jsonMap = getJSONMapValues();
      odkTables.addRowWithSurvey('deployment', 'deploy_to_specific', null, jsonMap);
    });
    //myTimeoutVal = setTimeout(callBackFn(), 1000);
};

var setJSONMap = function(JSONMap, key, value) {
    if (value !== null && value !== undefined) {
        authorizationsResultSet.get(key);
        JSONMap[key] = JSON.stringify(value);
    }
}

var getJSONMapValues = function() {
  var jsonMap = {};
  setJSONMap(jsonMap, 'beneficiary_code', authorizationsResultSet.get('beneficiary_code'));
  setJSONMap(jsonMap, 'distribution_id', authorizationsResultSet.get('distribution_id'));
  setJSONMap(jsonMap, 'authorization_id', authorizationsResultSet.get('authorization_id'));
  setJSONMap(jsonMap, 'authorization_name', authorizationsResultSet.get('authorization_name'));
  setJSONMap(jsonMap, 'item_pack_id', authorizationsResultSet.get('item_pack_id'));
  setJSONMap(jsonMap, 'item_pack_name', authorizationsResultSet.get('item_pack_name'));
  setJSONMap(jsonMap, 'is_override', authorizationsResultSet.get('is_override'));
    // Writing out number values needs more investigation
  setJSONMap(jsonMap, 'ranges', authorizationsResultSet.get('ranges'));
    jsonMap = JSON.stringify(jsonMap);    
    return jsonMap;
};

var cbFailure = function (error) {
  console.log('authorizations_detail cbFailure: getViewData failed with message: ' + error);

};
