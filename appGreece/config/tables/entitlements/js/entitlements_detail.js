'use strict';

var actionTypeKey = "actionTypeKey";
var actionAddDelivery = 0;
var actionEditDelivery = 1;
var entitlementsResultSet = {};
var compStr = 'COMPLETE';
var timer;
var locale = odkCommon.getPreferredLocale();
var savepointSuccess = "COMPLETE";
// Table IDs
var registrationTable = 'registration';
var authorizationTable = 'authorizations';


var display = function() {

  odkCommon.registerListener(function() {
      actionCBFn();
  });
  actionCBFn();

  odkData.getViewData(cbSuccess, cbFailure);
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

    var actionType = dispatchStr[actionTypeKey];
    switch (actionType) {
        case actionAddDelivery:
        case actionEditDelivery:
            handleSurveyRowCallback(action, dispatchStr);
            break;
        default:
            console.log("Error: unrecognized action type in callback");
    }

    odkCommon.removeFirstQueuedAction();

}

function handleSurveyRowCallback(action, dispatchStr) {

    console.log("Row change action occured");
    console.log(result);
    var result = action.jsonValue.result;
    if (result === null || result === undefined) {
        console.log("Error: no result object on registration");
        return;
    }

    var instanceId = result.instanceId;
    if (instanceId === null || instanceId === undefined) {
        console.log("Error: no instance ID on registration");
        return;
    }

    var savepointType = result.savepoint_type;
    if (savepointType === null || savepointType === undefined) {
        console.log("Error: no savepoint type on registration");
        return;
    }

    if (savepointType !== savepointSuccess) {
        console.log("The row was not saved as complete. Not launching detailview");
        return;
    }
    //updateEntitlementsWithRowId(instanceId);

    odkTables.openDetailView(null, 'deliveries', instanceId,
                             'config/tables/deliveries/html/deliveries_detail.html?type=delivery');
}

var cbSuccess = function (result) {
  entitlementsResultSet = result;
  $('#launch').text(odkCommon.localizeText(locale, 'click_to_deliver'));
  $('#title').text(odkCommon.localizeText(locale, 'entitlement_details'));
  $('#authorization_name').prepend(odkCommon.localizeText(locale, 'authorization_name') + ": ");
  $('#item_pack_name').prepend(odkCommon.localizeText(locale, 'item_pack_name') + ": ");
  $('#item_description').prepend(odkCommon.localizeText(locale, 'item_pack_description') + ": ");
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

  var authorizationPromise = new Promise(function(resolve, reject) {
    odkData.arbitraryQuery('authorizations',
      'SELECT delivery_table, delivery_form, ranges FROM authorizations WHERE _id = ?',
       [entitlementsResultSet.get('authorization_id')],
        null, null, resolve, reject);
  });

  Promise.all([rolesPromise, authorizationPromise]).then(function(resultArray) {
    var roles = resultArray[0].getRoles();
    if (resultArray[1].getCount() > 0) {
      $('#launch').text(odkCommon.localizeText(locale, 'click_to_deliver'));
      var deliveryTable = resultArray[1].getData(0, 'delivery_table');
      var deliveryForm = resultArray[1].getData(0, 'delivery_form');
      var ranges = resultArray[1].getData(0, 'ranges');

      // arbitrary default delivery table/form
      if (deliveryTable == undefined || deliveryTable == null || deliveryTable == "") {
        deliveryTable = 'deliveries';
      }
      if (deliveryForm == undefined || deliveryForm == null || deliveryForm == "" ) {
        deliveryForm = 'deliveries';
      }
      console.log(deliveryTable + deliveryForm);

      $('#launch').on(
      'click',
      function() {
        var jsonMap = getJSONMapValues();
        setJSONMap(jsonMap, 'ranges', ranges);

        if ($.inArray('ROLE_SUPER_USER_TABLES', roles) > -1) {
          var dispatchStruct = JSON.stringify({actionTypeKey: actionEditDelivery});
          odkTables.addRowWithSurvey(dispatchStruct, deliveryTable, deliveryForm, null, jsonMap);
        } else if (entitlementsResultSet.get('is_delivered') == 'false' || entitlementsResultSet.get('is_delivered') == 'FALSE') {
          var dispatchStruct = JSON.stringify({actionTypeKey: actionAddDelivery});

          odkTables.addRowWithSurvey(dispatchStruct, deliveryTable, deliveryForm, null, jsonMap);
        }
      });
    } else {
      $('#launch').prop("disabled", true);
      $('#launch').text('Missing Authorization Data');
    }
  });

  
};

var updateEntitlements = function() {
  console.log('entitlement_id is: ' + entitlementsResultSet.get('_id'));
  odkData.query('deliveries', 'entitlement_id = ? and (is_delivered = ? or is_delivered = ?) and _savepoint_type = ?',
                [entitlementsResultSet.get('_id'), 'true', 'TRUE', compStr],
                null, null, null, null, null, null, null, queryCBSuccess, queryCBFailure);
}

var updateEntitlementsWithRowId = function(rowId) {
  console.log('entitlement_id is: ' + rowId);
  odkData.query('deliveries', 'entitlement_id = ? and (is_delivered = ? or is_delivered = ?) and _savepoint_type = ?',
                [rowId, 'true', 'TRUE', compStr],
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
        JSONMap[key] = value;
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
  setJSONMap(jsonMap, 'assigned_code', entitlementsResultSet.get('assigned_code'));
  setJSONMap(jsonMap, '_group_modify', entitlementsResultSet.get('_group_modify'));

  user = odkCommon.getActiveUser();
  setJSONMap(jsonMap, '_row_owner', user);

  return jsonMap;
};

var cbFailure = function (error) {
  console.log('entitlements_detail cbFailure: getViewData failed with message: ' + error);

};
