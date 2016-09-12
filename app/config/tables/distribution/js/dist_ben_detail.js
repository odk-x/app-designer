'use strict';

 
var distributionsResultSet = {};

var display = function() {
  odkData.getViewData(cbSuccess, cbFailure);
};

var cbSuccess = function (result) {
  distributionsResultSet = result;
  console.log(distributionsResultSet);
  $('#FIELD_1').text(distributionsResultSet.get('authorization_name'));
  $('#FIELD_2').text(distributionsResultSet.get('authorization_id'));
  $('#FIELD_3').text(distributionsResultSet.get('item_pack_name'));
  $('#FIELD_4').text(distributionsResultSet.get('item_pack_id'));
  $('#FIELD_5').text(distributionsResultSet.get('item_description'));
  $('#FIELD_8').text(distributionsResultSet.get('_id'));
  $('#FIELD_7').text(distributionsResultSet.get('is_override'));
  $('#FIELD_9').text(distributionsResultSet.get('beneficiary_code'));

  var launchButton = $('#launch');
  launchButton.on(
    'click',
    function() {
      if (distributionsResultSet.get('is_distributed') == 'false') {
        var jsonMap = getJSONMapValues();
        odkTables.addRowWithSurvey('deployment', 'deploy_to_specific', null, jsonMap);
      }
    });
    //myTimeoutVal = setTimeout(callBackFn(), 1000);
};

var setJSONMap = function(JSONMap, key, value) {
    if (value !== null && value !== undefined) {
        distributionsResultSet.get(key);
        JSONMap[key] = JSON.stringify(value);
    }
}

var getJSONMapValues = function() {
  var jsonMap = {};
  setJSONMap(jsonMap, 'beneficiary_code', distributionsResultSet.get('beneficiary_code'));
  setJSONMap(jsonMap, 'distribution_id', distributionsResultSet.get('_id'));
  setJSONMap(jsonMap, 'authorization_id', distributionsResultSet.get('authorization_id'));
  setJSONMap(jsonMap, 'authorization_name', distributionsResultSet.get('authorization_name'));
  setJSONMap(jsonMap, 'item_pack_id', distributionsResultSet.get('item_pack_id'));
  setJSONMap(jsonMap, 'item_pack_name', distributionsResultSet.get('item_pack_name'));
  setJSONMap(jsonMap, 'item_description', distributionsResultSet.get('item_description'));
  setJSONMap(jsonMap, 'is_override', distributionsResultSet.get('is_override'));
    // Writing out number values needs more investigation
  setJSONMap(jsonMap, 'ranges', distributionsResultSet.get('ranges'));
    jsonMap = JSON.stringify(jsonMap);    
    return jsonMap;
};

var cbFailure = function (error) {
  console.log('authorizations_detail cbFailure: getViewData failed with message: ' + error);

};
