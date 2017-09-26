'use strict';

var LOG_TAG = 'entitlements_list: ';

var idxStart = -1;
var actionTypeKey = "actionTypeKey";
var deliveryTableKey = "deliveryTableKey";
var actionAddCustomDelivery = 0;
var entitlementsResultSet = {};
var locale = odkCommon.getPreferredLocale();
var savepointSuccess = "COMPLETE";

// Table IDs
var defaultDeliveryForm = 'deliveries';

var firstLoad = function() {
    odkCommon.registerListener(function() {
        actionCBFn();
    });
    actionCBFn();
    resumeFn(0);
};

var resumeFn = function(fIdxStart) {
    var entitlementsResultSet = null;
    queryUtil.getViewData().then( function(result) {
        entitlementsResultSet = result;

        idxStart = fIdxStart;
        odkCommon.log('I', LOG_TAG + 'resumeFn called. idxStart: ' + idxStart);
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
                odkCommon.log('I', LOG_TAG + 'clicked with rowId: ' + rowId);
                // make sure we retrieved the rowId
                if (rowId !== null && rowId !== undefined) {
                    if (util.entitlementIsDelivered(entitlementsResultSet.getRowId(0))) {
                        launchDeliveryDetailView(rowId);
                    } else {
                        prepareToDeliver(rowId);
                    }
                }
            });
        }

        displayGroup(idxStart, result);
    }).catch( function(reason) {
        odkCommon.log('E', LOG_TAG +  LOG_TAG + "Failed to get view data: " + reason);
    });


}


var launchDeliveryDetailView = function(entitlement_id) {
    odkCommon.log('I', LOG_TAG + "Launching delivery detail view for entitlement: " + entitlement_id);

    var deliveryIdPromise = new Promise(function(resolve, reject) {
        odkData.query(util.deliveryTable, 'entitlement_id = ?', [entitlement_id], null,
                      null, null, null, null, null, true, resolve, reject);
    });

    deliveryIdPromise.then(function(result) {
        if (result.getCount() > 0) {
            odkTables.openDetailView(null, 'deliveries', result.getData(0, "_id"),
                                     'config/tables/deliveries/html/deliveries_detail.html')
        }
    }).catch(function(reason) {
        odkCommon.log('E', LOG_TAG + "Failed to retrieve delivery: " + reason);
    });
}


/**
 * Given an entitlement id, grab the record, add a new entry in the delivery table,
 * and launch the UI to either perform a simple or a custom delivery
 **/
var prepareToDeliver = function(entitlement_id) {
    odkCommon.log('I', LOG_TAG + "Preparing to deliver entitlement: " + entitlement_id);

    var entitlement_row = null;
    var authTableRow = null;

    queryUtil.getEntitlementRow(entitlement_id).then( function(result) {
        odkCommon.log('I', LOG_TAG + 'Got entitlement row');
        if (!result || result.getCount === 0) {
            throw ('Failed to retrieve entitlement.');
        }
        entitlement_row = result;

        return queryUtil.getCustomDeliveryForm(entitlement_row.get('authorization_id'));
    }).then( function (result) {
        odkCommon.log('I', LOG_TAG + 'Got auth row');
        if (!result || result.getCount() === 0) {
            odkCommon.log('E', LOG_TAG + 'Failed to retrieve custom delivery form. Defaulting to simple delivery');
            performSimpleDelivery(entitlement_id);
            return;
        }
        odkCommon.log('I', LOG_TAG + 'auth row count: ' + result.getCount())
            authTableRow = result;

        var custom_delivery_form_id = authTableRow.getData(0, 'custom_delivery_form_id');

        // TODO: Check if the custom delivery table ID exists before launching survey
        // Use odkData.getAllTableIds(resolve, reject);

        if (custom_delivery_table === undefined || custom_delivery_table === null || custom_delivery_table === "" || custom_delivery_table === util.deliveryTable) {
            performSimpleDelivery(entitlement_id);
        } else {
            performCustomDelivery(entitlement_row, entitlement_id, custom_delivery_table);
        }

    }).catch( function(reason) {
        odkCommon.log('E', LOG_TAG + 'Failed to prepare delivery: ' + reason);
    });
}

var performSimpleDelivery = function(entitlement_id) {
    odkCommon.log('I', LOG_TAG + 'Performing simple delivery');
    odkTables.launchHTML(null,
                         'config/assets/deliver.html?entitlement_id='
                         + encodeURIComponent(entitlement_id)
                        );

}

var performCustomDelivery = function(entitlement_row, entitlement_id, custom_delivery_table) {
    odkCommon.log('I', LOG_TAG + 'Performing custom delivery: ' + custom_delivery_table);
    var custom_delivery_row_id = util.genUIID();
    queryUtil.addDeliveryRow(entitlement_row, custom_delivery_table, custom_delivery_row_id).then( function(result) {
        odkCommon.log('I', LOG_TAG + 'Added delivery row');
        if (!result || result.getCount === 0) {
            throw ('Failed to add delivery to root table.');
        }
        var root_delivery_row = result;
        var root_delivery_row_id = root_delivery_row.get('_id');
        odkCommon.log('I', LOG_TAG + 'Created new row in root delivery table: ' + root_delivery_row_id);

        var jsonMap = {};
        util.setJSONMap(jsonMap, 'delivery_id', root_delivery_row_id);
        util.setJSONMap(jsonMap, 'entitlement_id', entitlement_id);

        // We also need to add group permission fields
        util.setJSONMap(jsonMap, '_group_read_only', entitlement_row.get('_group_modify'));

        var user = odkCommon.getActiveUser();
        util.setJSONMap(jsonMap, '_row_owner', user);

        var dispatchStruct = JSON.stringify({actionTypeKey: actionAddCustomDelivery,
            deliveryId: root_delivery_row_id,
            deliveryTableKey: delivery_table});
        odkTables.addRowWithSurvey(dispatchStruct, custom_delivery_table, custom_delivery_table, null, jsonMap);

        // Control flow is now handed off to the delivery user interface.
        // When that returns it will trigget actionCBFn, where we will finalize
    }).catch( function(reason) {
        odkCommon.log('E', LOG_TAG + 'Failed to perform custom delivery: ' + reason);
    });
}

/************************** Action callback workflow *********************************/

var actionCBFn = function() {
    var action = odkCommon.viewFirstQueuedAction();
    odkCommon.log('E', LOG_TAG + 'callback entered with action: ' + action);

    if (action === null || action === undefined) {
        // The queue is empty
        return;
    }

    var dispatchStr = JSON.parse(action.dispatchStruct);
    if (dispatchStr === null || dispatchStr === undefined) {
        odkCommon.log('E', LOG_TAG + 'Error: missing dispatch strct');
        return;
    }

    var actionType = dispatchStr[actionTypeKey];
    switch (actionType) {
        case actionAddCustomDelivery:
            finishCustomDelivery(action, dispatchStr);
            break;
        default:
            odkCommon.log('E', LOG_TAG + "Error: unrecognized action type in callback");
    }


}

var finishCustomDelivery = function(action, dispatchStr) {

    if (queryUtil.validateCustomTableEntry(action, dispatchStr, "delivery", util.deliveryTable, "deliveryId", "deliveryTableKey", LOG_TAG)) {
        // TODO: check to make sure that there are any entitlements left, otherwise return to previous screen
    }
}

// Convenience because we call this on any kind of error
var executeDeleteRootDeliveryRow = function(root_delivery_id) {
    queryUtil.deleteRootDeliveryRow(root_delivery_id).then( function(result) {
        odkCommon.log('I', LOG_TAG + 'Deleted root delivery row: ' + root_delivery_id);

        odkCommon.removeFirstQueuedAction();
    }).catch( function(reason) {
        odkCommon.log('E', LOG_TAG + 'Failed to delete root delivery row: ' + reason);

        odkCommon.removeFirstQueuedAction();
    });

}

/************************** UI Rending functions *********************************/

var displayGroup = function(idxStart, entitlementsResultSet) {
    odkCommon.log('I', LOG_TAG + 'displayGroup called. idxStart: ' + idxStart);

    /* If the list comes back empty, inform the user */
    if (entitlementsResultSet.getCount() === 0) {
        var errorText = $('#error');
        errorText.show();
        errorText.text('No entitlements found');
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
      var auth_name = entitlementsResultSet.getData(i, 'item_pack_name');
      item.text(auth_name);

      var item2 = $('<li>');
      item2.attr('class', 'detail');
      var ipn = entitlementsResultSet.getData(i, 'authorization_name');
      item2.text(ipn);

      /* Creates arrow icon (Nothing to edit here) */
      var chevron = $('<img>');
      chevron.attr('src', odkCommon.getFileAsUrl('config/assets/img/little_arrow.png'));
      chevron.attr('class', 'chevron');
      item.append(chevron);
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
