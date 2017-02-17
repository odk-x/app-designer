'use strict';

 
var entitlementsResultSet = {};
var compStr = 'COMPLETE';
var timer;

var display = function() {
  odkData.getViewData(cbSuccess, cbFailure);
  console.log('displayed');
};

var cbSuccess = function (result) {
  entitlementsResultSet = result;
  $('#authorization_name').text(entitlementsResultSet.get('authorization_name'));
  $('#item_pack_name').text(entitlementsResultSet.get('item_pack_name'));
  $('#item_description').text(entitlementsResultSet.get('item_description'));
  $('#is_override').text(entitlementsResultSet.get('is_override'));
  $('#beneficiary_code').text(entitlementsResultSet.get('beneficiary_code'));
  updateEntitlements();
  $('#launch').on(
    'click',
    function() {
      if (entitlementsResultSet.get('is_delivered') == 'false') {
        var jsonMap = getJSONMapValues();
        odkTables.addRowWithSurvey('deliveries', 'deliveries', null, jsonMap);
      }
    });
};

var updateEntitlements = function() {
  console.log('entitlement_id is: ' + entitlementsResultSet.get('_id'));
  odkData.query('deliveries', 'entitlement_id = ? and is_delivered = ? and _savepoint_type = ?',
                [entitlementsResultSet.get('_id'), 'true', compStr],
                null, null, null, null, null, null, null, queryCBSuccess, queryCBFailure);
}

var queryCBSuccess = function(result) {
  console.log(result.getCount());
  if (result.getCount() > 0) {
    var entitlement_id = result.get('entitlement_id');
    var struct = {};
    struct.is_delivered = result.get('is_delivered');
    $('#launch').hide();
    //clearInterval(timer);
    odkData.updateRow('entitlements', struct, entitlement_id, updateCBSuccess, updateCBFailure);
  }
}

var queryCBFailure = function(error) {
  console.log('queryCBFailure called with error: ' + error);
}

var updateCBSuccess = function(result) {
  console.log('updateCBSuccess called');
}

var updateCBFailure = function(error) {
  console.log('updateCBFailure called with error: ' + error);
}

var setJSONMap = function(JSONMap, key, value) {
    if (value !== null && value !== undefined) {
        JSONMap[key] = JSON.stringify(value);
    }
}

var getJSONMapValues = function() {
  console.log(entitlementsResultSet.getColumns());
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
  setJSONMap(jsonMap, 'assigned_code', entitlementsResultSet.get('assigned_code'));
  setJSONMap(jsonMap, 'sector', entitlementsResultSet.get('sector'));
  jsonMap = JSON.stringify(jsonMap);    
  return jsonMap;
};

var cbFailure = function (error) {
  console.log('dist_ben_detail cbFailure: getViewData failed with message: ' + error);

};
