'use strict';

 
var entitlementsResultSet = {};

var display = function() {
  odkData.getViewData(cbSuccess, cbFailure);
};

var cbSuccess = function (result) {
  entitlementsResultSet = result;
  $('#FIELD_1').text(entitlementsResultSet.get('authorization_name'));
  $('#FIELD_2').text(entitlementsResultSet.get('authorization_id'));
  $('#FIELD_3').text(entitlementsResultSet.get('item_pack_name'));
  $('#FIELD_4').text(entitlementsResultSet.get('item_pack_id'));
  $('#FIELD_5').text(entitlementsResultSet.get('item_description'));
  $('#FIELD_8').text(entitlementsResultSet.get('_id'));
  $('#FIELD_7').text(entitlementsResultSet.get('is_override'));
  $('#FIELD_9').text(entitlementsResultSet.get('beneficiary_code'));

  var launchButton = $('#launch');
  launchButton.on(
    'click',
    function() {
      if (entitlementsResultSet.get('is_delivered') == 'false') {
        var jsonMap = getJSONMapValues();
        odkTables.addRowWithSurvey('deliveries', 'deliveries', null, jsonMap);
      }
    });
    //myTimeoutVal = setTimeout(callBackFn(), 1000);
};

var setJSONMap = function(JSONMap, key, value) {
    if (value !== null && value !== undefined) {
        entitlementsResultSet.get(key);
        JSONMap[key] = JSON.stringify(value);
    }
}

var getJSONMapValues = function() {
  var jsonMap = {};
  setJSONMap(jsonMap, 'beneficiary_code', entitlementsResultSet.get('beneficiary_code'));
  setJSONMap(jsonMap, 'entitlement_id', entitlementsResultSet.get('_id'));
  setJSONMap(jsonMap, 'authorization_id', entitlementsResultSet.get('authorization_id'));
  setJSONMap(jsonMap, 'authorization_name', entitlementsResultSet.get('authorization_name'));
  setJSONMap(jsonMap, 'item_pack_id', entitlementsResultSet.get('item_pack_id'));
  setJSONMap(jsonMap, 'item_pack_name', entitlementsResultSet.get('item_pack_name'));
  setJSONMap(jsonMap, 'item_description', entitlementsResultSet.get('item_description'));
  setJSONMap(jsonMap, 'is_override', entitlementsResultSet.get('is_override'));
  setJSONMap(jsonMap, 'ranges', entitlementsResultSet.get('ranges'));
    jsonMap = JSON.stringify(jsonMap);    
    return jsonMap;
};

var cbFailure = function (error) {
  console.log('dist_ben_detail cbFailure: getViewData failed with message: ' + error);

};
