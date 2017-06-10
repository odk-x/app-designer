'use strict';

var idxStart = -1;
var actionTypeKey = "actionTypeKey";
var deliveryTableKey = "deliveryTableKey";
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
var entitlementsTable = 'entitlements';
var defaultDeliveryTable = 'deliveries';
var defaultDeliveryForm = 'deliveries';


var entitlementsCBSuccess = function(result) {
    entitlementsResultSet = result;

    return (function() {
        displayGroup(idxStart);
    }());
};

var entitlementsCBFailure = function(error) {

    console.log('entitlements_list entitlementsCBFailure: ' + error);
};

var firstLoad = function() {
    odkCommon.registerListener(function() {
      actionCBFn();
  });
  actionCBFn();
  resumeFn(0);
};

var resumeFn = function(fIdxStart) {
    odkData.getViewData(entitlementsCBSuccess, entitlementsCBFailure);

    idxStart = fIdxStart;
    console.log('resumeFn called. idxStart: ' + idxStart);
    // The first time through we're going to make a map of typeId to
    // typeName so that we can display the name of each shop's specialty.
    if (idxStart === 0) {
        // We're also going to add a click listener on the wrapper ul that will
        // handle all of the clicks on its children.
        $('#list').click(function(e) {
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
                // we'll pass null as the relative path to use the default file
                 // odkTables.openDetailView(null, 'entitlements', rowId,
                 // 'config/tables/entitlements/html/entitlements_detail.html');
                if (entitlementsResultSet.getData(0, 'is_delivered') === 'true' || entitlementsResultSet.getData(0, 'is_delivered') === 'TRUE') {
                  odkData.query('deliveries', 'entitlement_id = ?', [rowId], null,
                      null, null, null, null, null, true, deliveredCaseSuccess, 
                      deliveredCaseFailure);
                } else {
                  odkData.query('entitlements', '_id = ?', [rowId], null,
                      null, null, null, null, null, true, formResolutionSuccess, 
                      formResolutionFailure);
                }
            }
        });
    }
};

function deliveredCaseSuccess(result) {
  if (result.getCount() > 0) {
    odkTables.openDetailView(null, 'deliveries', result.getData(0, "_id"), 
      'config/tables/deliveries/html/deliveries_detail.html')
  }
}

function deliveredCaseFailure(error) {
  console.log("deliveredCaseFailure with error: " + error);
}

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
        console.log("Error: no result object on delivery");
        return;
    }

    var instanceId = result.instanceId;
    if (instanceId === null || instanceId === undefined) {
        console.log("Error: no instance ID on delivery");
        return;
    }

    var deliveryTableName = dispatchStr[deliveryTableKey];
    if (deliveryTableName === null || deliveryTableName === undefined) {
        console.log("Error: no delivery table name");
        return;
    }

    var savepointType = result.savepoint_type;
    if (savepointType === null || savepointType === undefined) {
        console.log("Error: no savepoint type on delivery");
        return;
    }

    if (savepointType !== savepointSuccess) {
        console.log("The row was not saved as complete. Not launching detailview");
        return;
    }
    isDeliveredCustomDeliveryRow(instanceId, deliveryTableName);
}

function formResolutionFailure(error) {
  console.log('form resolution failure with error: ' + error);
}

var newEntitlementsResultSet;

function formResolutionSuccess(result) {
  // Add a new role to the root deliveries table, then trigger the delivery on the callback
  // TODO: Don't just keep polluting all the time. Update a previous row if it exists
  newEntitlementsResultSet = result;
  var jsonMap = getJSONMapValues();
  odkData.addRow(defaultDeliveryTable, jsonMap, util.genUUID(), addDefaultDeliverySuccess, addDefaultDeliveryFailure);
}

function addDefaultDeliverySuccess(result) {
    var rowId = result.getRowId(0);
    console.log('add default delivery success ' + rowId);

    var authorizationPromise = new Promise(function(resolve, reject) {
    var auth_id = newEntitlementsResultSet.get('authorization_id');
    console.log("authorizationPromise auth_id:" + auth_id);
    odkData.arbitraryQuery('authorizations',
      'SELECT delivery_table, delivery_form, ranges FROM authorizations WHERE _id = ?',
       [auth_id],
        null, null, resolve, reject);
    });

    /* TODO: Check if the table ID exists before launching survey
  var tableIDsPromise = new Promise(function(resolve, reject) {
    odkData.getAllTableIds(resolve, reject);
  });
  */

    Promise.all([authorizationPromise]).then(function(resultArray) {
        if (resultArray[0].getCount() > 0) {
            var deliveryTable = resultArray[0].getData(0, 'delivery_table');
            var deliveryForm = resultArray[0].getData(0, 'delivery_form');

            // arbitrary default delivery table/form
            if (deliveryTable == undefined || deliveryTable == null || deliveryTable == "") {
                deliveryTable = defaultDeliveryTable;
            }
            if (deliveryForm == undefined || deliveryForm == null || deliveryForm == "" ) {
                deliveryForm = defaultDeliveryForm;
            }

            var entitlement_id = newEntitlementsResultSet.get('_id');
            if (deliveryTable !== defaultDeliveryTable) {
                // Custom delivery form
                console.log('Launching custom delivery form: ' + deliveryForm);

                var jsonMap = {};
                setJSONMap(jsonMap, 'delivery_id', rowId);
                setJSONMap(jsonMap, 'entitlement_id', entitlement_id);

                var dispatchStruct = JSON.stringify({actionTypeKey: actionAddDelivery, deliveryTableKey: deliveryTable});
                odkTables.addRowWithSurvey(dispatchStruct, deliveryTable, deliveryForm, null, jsonMap);
            } else {
                // Standard simple delivery
                odkTables.launchHTML(null,
                                     'config/assets/deliver.html?delivery_id='
                                     + encodeURIComponent(rowId)
                                     + '&entitlement_id='
                                     + encodeURIComponent(entitlement_id)
                                     );
            }
        }
    });
}

function addDefaultDeliveryFailure(error) {
    console.log('add default delivery failure with error: ' + error);
}

var displayGroup = function(idxStart) {
    console.log('displayGroup called. idxStart: ' + idxStart);

    /* If the list comes back empty, inform the user */
    if (entitlementsResultSet.getCount() === 0) {
        var errorText = $('#error');
        errorText.show();
        errorText.text('No entitlements found'); // TODO: Translate this
    }

    /* Number of rows displayed per 'chunk' - can modify this value */
    var chunk = 50;
    for (var i = idxStart; i < idxStart + chunk; i++) {
      if (i >= entitlementsResultSet.getCount()) {
        break;
      }

      var item = $('<li>');
      item.attr('rowId', entitlementsResultSet.getRowId(i));
      item.attr('class', 'item_space');
      item.attr('id', entitlementsResultSet.getRowId(i));
      var auth_name = entitlementsResultSet.getData(i, 'authorization_name');
      item.text(auth_name);

      var item2 = $('<li>');
      item2.attr('class', 'detail');
      var ipn = entitlementsResultSet.getData(i, 'item_pack_name');
      item2.text(ipn);

      /* Creates arrow icon (Nothing to edit here) */
      var chevron = $('<img>');
      chevron.attr('src', odkCommon.getFileAsUrl('config/assets/img/little_arrow.png'));
      chevron.attr('class', 'chevron');
      item.append(chevron);
      item.append(item2);
      item.append(item2);

      $('#list').append(item);

      // don't append the last one to avoid the fencepost problem
      var borderDiv = $('<div>');
      borderDiv.addClass('divider');
      $('#list').append(borderDiv);

    }
    if (i < entitlementsResultSet.getCount()) {
        setTimeout(resumeFn, 0, i);
    }
};

var isDeliveredCustomDeliveryRow = function(rowId, deliveryTableName) {
  console.log('delivery_id is: ' + rowId);
  console.log('delivery table is ' + deliveryTableName);

  odkData.query(deliveryTableName, '_id = ? and (is_delivered = ? or is_delivered = ?) and _savepoint_type = ?',
                [rowId, 'true', 'TRUE', compStr],
                null, null, null, null, null, null, null, isDeliveredCBSuccess, isDeliveredCBFailure);
}

var isDeliveredCBFailure = function(error) {
  console.log('isDeliveredCBFailure called with error: ' + error);
}

var isDeliveredCBSuccess = function(result) {
  console.log(result.getCount());
  if (result.getCount() > 0) {
    var entitlement_id = result.get('entitlement_id');
    var struct = {};
    struct.is_delivered = result.get('is_delivered');
    odkData.updateRow('entitlements', struct, entitlement_id, updateEntitlementsCBSuccess, updateEntitlementsCBFailure);

    var rootDelivery_id = result.get('delivery_id');
    var struct = {};
    struct.is_delivered = result.get('is_delivered');
    odkData.updateRow('deliveries', struct, rootDelivery_id, updateDeliveriesCBSuccess, updateDeliveriesCBFailure);
  }
}

var updateDeliveriesCBSuccess = function(result) {
  console.log('updateDeliveriesCBSuccess called');
}

var updateDeliveriesCBFailure = function(error) {
  console.log('updateDeliveriesCBFailure called with error: ' + error);
}

var updateEntitlementsCBSuccess = function(result) {
  console.log('updateEntitlementsCBSuccess called');
}

var updateEntitlementsCBFailure = function(error) {
  console.log('updateEntitlementsCBFailure called with error: ' + error);
}

var setJSONMap = function(JSONMap, key, value) {
    if (value !== null && value !== undefined) {
        JSONMap[key] = value;
    }
}

var getJSONMapValues = function() {
  console.log(entitlementsResultSet.getColumns());
  var jsonMap = {};
  setJSONMap(jsonMap, 'beneficiary_code', newEntitlementsResultSet.get('beneficiary_code'));
  setJSONMap(jsonMap, 'entitlement_id', newEntitlementsResultSet.get('_id'));
  setJSONMap(jsonMap, 'authorization_id', newEntitlementsResultSet.get('authorization_id'));
  setJSONMap(jsonMap, 'authorization_name', newEntitlementsResultSet.get('authorization_name'));
  setJSONMap(jsonMap, 'item_pack_id', newEntitlementsResultSet.get('item_pack_id'));
  setJSONMap(jsonMap, 'item_pack_name', newEntitlementsResultSet.get('item_pack_name'));
  setJSONMap(jsonMap, 'item_description', newEntitlementsResultSet.get('item_description'));
  setJSONMap(jsonMap, 'is_override', newEntitlementsResultSet.get('is_override'));
  setJSONMap(jsonMap, 'assigned_code', newEntitlementsResultSet.get('assigned_code'));
  setJSONMap(jsonMap, '_group_read_only', newEntitlementsResultSet.get('_group_modify'));

  var user = odkCommon.getActiveUser();
  setJSONMap(jsonMap, '_row_owner', user);

  return jsonMap;
}
