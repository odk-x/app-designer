'use strict';

var actionTypeKey = "actionTypeKey";
var actionAddDelivery = 0;
var actionEditDelivery = 1;
var entitlementsResultSet = {};
var compStr = 'COMPLETE';
var timer;
var locale = odkCommon.getPreferredLocale();

var display = function() {
  $('#launch').text(odkCommon.localizeText('click_to_deliver'));
  $('#title').text(odkCommon.localizeText('entitlement_details'));

  odkCommon.registerListener(function() {
      actionCBFn();
  });
  actionCBFn();

  odkData.getViewData(cbSuccess, cbFailure);
  console.log('displayed');
};

function actionCBFn() {
    var action = odkCommon.viewFirstQueuedAction();
    console.log('callback entered with action: ' + action);

    if (action === null || action === undefined) {
        // The queue is empty
        return;
    }

    var dispatchStr = JSON.parse(action.dispatchStruct);
    if (dispatchStr === null || dispatchStr === undefined) {
        console.log('Error: missing dispatch strct');
        return;
    }

    var actionType = dipatchStr[actionTypeKey];
    switch (actionType) {
        case actionAddDelivery:
            console.log("TODO: LAUNCH DETAIL VIEW add delivery");
            break;
        case actionEditDelivery:
            console.log("TODO: What do we do here? Probably launch detail view (edit delivery)");
            break;
        default:
            console.log("Error: unrecognized action type in callback");
    }

}

var cbSuccess = function (result) {
  entitlementsResultSet = result;
  $('#authorization_name').prepend(odkCommon.localizeText(locale, 'authorization_name') + ": ");
  $('#item_pack_name').prepend(odkCommon.localizeText(locale, 'item_pack_name') + ": ");
  $('#item_description').prepend(odkCommon.localizeText(locale, 'item_description') + ": ");
  $('#is_override').prepend(odkCommon.localizeText(locale, 'is_override') + ": ");
  $('#beneficiary_code').prepend(odkCommon.localizeText(locale, 'beneficiary_code') + ": ");


  $('#inner_authorization_name').text(entitlementsResultSet.get('authorization_name'));
  $('#inner_item_pack_name').text(entitlementsResultSet.get('item_pack_name'));
  $('#inner_item_description').text(entitlementsResultSet.get('item_description'));
  $('#inner_is_override').text(entitlementsResultSet.get('is_override'));
  $('#inner_beneficiary_code').text(entitlementsResultSet.get('beneficiary_code'));
  updateEntitlements();

  var rolesPromise = new Promise(function(resolve, reject) {
      odkData.getRoles(resolve, reject);
  });

  var deliveryTablePromise = new Promise(function(resolve, reject) {
    odkData.arbitraryQuery('authorizations',
      'SELECT delivery_table FROM authorizations WHERE _id = ?',
       [entitlementsResultSet.get('authorization_id')],
        null, null, resolve, reject);
  });

  var deliveryFormPromise = new Promise(function(resolve, reject) {
    odkData.arbitraryQuery('authorizations',
      'SELECT delivery_form FROM authorizations WHERE _id = ?',
       [entitlementsResultSet.get('authorization_id')],
        null, null, resolve, reject);
  });

  Promise.all([rolesPromise, deliveryTablePromise, deliveryFormPromise]).then(function(resultArray) {
      console.log(resultArray.length);
    var roles = resultArray[0].getRoles();
    var deliveryTable = resultArray[1];
    var deliveryForm = resultArray[2];
  });

  $('#launch').on(
    'click',
    function() {
      if ($.inArray('ROLE_SUPER_USER_TABLES', roles) > -1) {
        odkData.addRow(deliveryName, getStructVals(), util.genUUID(), proxyRowSuccess, proxyRowFailure);
      } else if (entitlementsResultSet.get('is_delivered') == 'false') {
          var jsonMap = getJSONMapValues();
          var dispatchStruct = JSON.stringify({actionTypeKey: actionAddDelivery});
          odkTables.addRowWithSurvey(dispatchStruct, deliveryTable, deliveryForm, null, jsonMap);
      }
    });
};

function proxyRowSuccess(result) {
    console.log('made it!');
    odkData.changeAccessFilterOfRow('deliveries', 'HIDDEN',
      entitlementsResultSet.get('_filter_value'),
      result.getRowId(0), setFilterSuccess, setFilterFailure);
}

function proxyRowFailure(error) {
    console.log('proxy set failure with error: ' + error);
}

function setFilterSuccess(result) {
    var dispatchStruct = JSON.stringify({actionTypeKey: actionEditDelivery});
    odkTables.editRowWithSurvey(dispatchStruct, 'deliveries', result.getRowId(0), 'deliveries', null);
    console.log('set filter success');
}

function setFilterFailure(error) {
    console.log('set filter failure with error: ' + error);
}

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

 function getStructVals() {
  var struct = {};
  struct['beneficiary_code'] = entitlementsResultSet.get('beneficiary_code');
  struct['entitlement_id'] = entitlementsResultSet.get('_id');
  struct['authorization_id'] = entitlementsResultSet.get('authorization_id');
  struct['authorization_name'] = entitlementsResultSet.get('authorization_name');
  struct['item_pack_id'] = entitlementsResultSet.get('item_pack_id');
  struct['item_pack_name'] = entitlementsResultSet.get('item_pack_name');
  struct['item_description'] = entitlementsResultSet.get('item_description');
  struct['is_override'] = entitlementsResultSet.get('is_override');
  struct['ranges'] = entitlementsResultSet.get('ranges');
  struct['assigned_code'] = entitlementsResultSet.get('assigned_code');
  console.log(struct);
  return struct;
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
  jsonMap = JSON.stringify(jsonMap);
  return jsonMap;
};

var cbFailure = function (error) {
  console.log('entitlements_detail cbFailure: getViewData failed with message: ' + error);

};
