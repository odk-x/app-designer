'use strict';

var idxStart = -1;
var actionTypeKey = "actionTypeKey";
var deliveryTableKey = "deliveryTableKey";
var actionAddCustomDelivery = 0;
var actionAddSimpleDelivery = 1;
var entitlementsResultSet = {};
var locale = odkCommon.getPreferredLocale();
var savepointSuccess = "COMPLETE";

// Table IDs
var registrationTable = 'registration';
var authorizationTable = 'authorizations';
var entitlementsTable = 'entitlements';
var defaultDeliveryTable = 'deliveries';
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
    getViewData().then( function(result) {
        entitlementsResultSet = result;

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
                    if (entitlementsResultSet.getData(0, 'is_delivered') === 'true'
                        || entitlementsResultSet.getData(0, 'is_delivered') === 'TRUE') {
                        launchDeliveryDetailView(rowId);
                    } else {
                        prepareToDeliver(rowId);
                    }
                }
            });
        }

        displayGroup(idxStart, result);
    }).catch( function(reason) {
        console.log("Failed to get view data: " + reason);
    });


}


var launchDeliveryDetailView = function(entitlement_id) {
    console.log("Launching delivery detail view for entitlement: " + entitlement_id);

    var deliveryIdPromise = new Promise(function(resolve, reject) {
        odkData.query(defaultDeliveryTable, 'entitlement_id = ?', [entitlement_id], null,
                      null, null, null, null, null, true, resolve, reject);
    });

    deliveryIdPromise.then(function(result) {
        if (result.getCount() > 0) {
            odkTables.openDetailView(null, 'deliveries', result.getData(0, "_id"),
                                     'config/tables/deliveries/html/deliveries_detail.html')
        }
    }).catch(function(reason) {
        console.log("Failed to retrieve delivery: " + reason);
    });
}


/**
 * Given an entitlement id, grab the record, add a new entry in the delivery table,
 * and launch the UI to either perform a simple or a custom delivery
 **/
var prepareToDeliver = function(entitlement_id) {
    console.log("Preparing to deliver entitlement: " + entitlement_id);

    var entitlementRow = null;
    var rootDeliveryRow = null;
    var rootDeliveryRowId = null;
    var authTableRow = null;

    getEntitlementRow(entitlement_id).then( function(result) {
        console.log('Got entitlement row');
        if (!result || result.getCount === 0) {
            throw ('Failed to retrieve entitlement.');
        }
        entitlementRow = result;

        return addDeliveryRow(entitlementRow);
    }).then( function(result) {
        console.log('Added delivery row');
        if (!result || result.getCount === 0) {
            throw ('Failed to add delivery to root table.');
        }
        rootDeliveryRow = result;
        rootDeliveryRowId = rootDeliveryRow.get('_id');
        console.log('Created new row in root delivery table: ' + rootDeliveryRowId);

        return getCustomDeliveryForm(entitlementRow.get('authorization_id'));
    }).then( function(result) {
        console.log('Got auth row');
        if (!result || result.getCount() === 0) {
            console.log('Failed to retrieve custom delivery form. Defaulting to simple delivery');
            performSimpleDelivery(rootDeliveryRowId, entitlement_id);
            return;
        }
        console.log('auth row count: ' + result.getCount())
        authTableRow = result;

        var deliveryTable = authTableRow.getData(0, 'delivery_table');
        var deliveryForm = authTableRow.getData(0, 'delivery_form');
        if (deliveryTable === undefined || deliveryTable === null || deliveryTable === "") {
            deliveryTable = defaultDeliveryTable;
        }
        if (deliveryForm === undefined || deliveryForm === null || deliveryForm === "" ) {
            deliveryForm = defaultDeliveryForm;
        }

        // TODO: Check if the custom delivery table ID exists before launching survey
        // Use odkData.getAllTableIds(resolve, reject);

        if (deliveryTable === defaultDeliveryTable) {
            // Standard simple delivery
            performSimpleDelivery(rootDeliveryRowId, entitlement_id);
        } else {
            // Custom delivery form
            performCustomDelivery(rootDeliveryRowId, entitlement_id, deliveryTable, deliveryForm);
        }

        // Control flow is now handed off to the conditional delivery user interface.
        // When that returns it will trigget actionCBFn, where we will finalize
    }).catch( function(reason) {
        console.log('Failed to prepare delivery: ' + reason);
    });
}

var performSimpleDelivery = function(rootDeliveryRowId, entitlement_id) {
    console.log('Performing simple delivery');
    var dispatchStruct = JSON.stringify({actionTypeKey: actionAddSimpleDelivery,
        deliveryId: rootDeliveryRowId});
    odkTables.launchHTML(null,
                         'config/assets/deliver.html?delivery_id='
                         + encodeURIComponent(rootDeliveryRowId)
                         + '&entitlement_id='
                         + encodeURIComponent(entitlement_id)
                        );

}

var performCustomDelivery = function(rootDeliveryRowId, entitlement_id, deliveryTable, deliveryForm) {
    console.log('Launching custom delivery form: ' + deliveryForm);

    var jsonMap = {};
    setJSONMap(jsonMap, 'delivery_id', rootDeliveryRowId);
    setJSONMap(jsonMap, 'entitlement_id', entitlement_id);

    var dispatchStruct = JSON.stringify({actionTypeKey: actionAddCustomDelivery,
        deliveryId: rootDeliveryRowId,
        deliveryTableKey: deliveryTable});
    odkTables.addRowWithSurvey(dispatchStruct, deliveryTable, deliveryForm, null, jsonMap);

}

/************************** Action callback workflow *********************************/

var actionCBFn = function() {
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
        case actionAddSimpleDelivery:
            finishSimpleDelivery(action, dispatchStr);
        case actionAddCustomDelivery:
            finishCustomDelivery(action, dispatchStr);
            break;
        default:
            console.log("Error: unrecognized action type in callback");
    }

    odkCommon.removeFirstQueuedAction();

}

var finishSimpleDelivery = function(action, dispatchStr) {

    console.log("Finishing simple delivery");
    var result = action.jsonValue.result;
    console.log(result);

    var rootDeliveryRowId = dispatchStr[deliveryId];
    if (rootDeliveryRowId === null || rootDeliveryRowId === undefined) {
        console.log("Error: no delivery id");
        return;
    }

    if (result === null || result === undefined) {
        console.log("Error: no result object on delivery");
        executeDeleteRootDeliveryRow(root_delivery_id);
        return;
    }


    isDeliveredSimpleDeliveryRow(deliveryId);
    getRootDeliveryRow(rootDeliveryRowId).then( function(result) {
        if (!result || result.getCount === 0) {
            throw ('Failed to retrieve root delivery row.');
        }
        var rootDeliveryRow = result;

        // Check if the delivery succeeded
        var is_delivered = rootDeliveryRow.get('is_delivered');

        if (is_delivered === 'true' || is_delivered === 'TRUE') {
            // The delivery is finished, and the entitlement should have been updated by the delivery.js
            // file, so we are done
            return;
        } else {
            // The delivery failed, so remove the row
            return deleteRootDeliveryRow(rootDeliveryRowId);
        }
    }).catch( function(reason) {
        console.log('Failed to finish simple delivery: ' + reason);
    });
}

var finishCustomDelivery = function(action, dispatchStr) {

    var result = action.jsonValue.result;

    console.log("Finishing custom delivery");
    console.log(result);

    var root_delivery_id = dispatchStr['deliveryId'];
    if (root_delivery_id === null || root_delivery_id === undefined) {
        console.log("Error: no root delivery id");
        return;
    }

    if (result === null || result === undefined) {
        console.log("Error: no result object on delivery");
        executeDeleteRootDeliveryRow(root_delivery_id);
        return;
    }

    var custom_delivery_id = result.instanceId;
    if (custom_delivery_id === null || custom_delivery_id === undefined) {
        console.log("Error: no instance ID on delivery");
        executeDeleteRootDeliveryRow(root_delivery_id);
        return;
    }

    var custom_delivery_table = dispatchStr[deliveryTableKey];
    if (custom_delivery_table === null || custom_delivery_table === undefined) {
        console.log("Error: no delivery table name");
        executeDeleteRootDeliveryRow(root_delivery_id);
        return;
    }

    var custom_delivery_row = null;

    getCustomDeliveryRow(custom_delivery_id, custom_delivery_table).then( function(result) {
        if (!result || result.getCount === 0) {
            throw ('Failed to retrieve custom delivery row.');
        }
        var custom_delivery_row = result;

        // Check if the delivery succeeded
        var is_delivered = custom_delivery_row.get('is_delivered');
        var savepoint_type = custom_delivery_row.get('_savepoint_type');
        var entitlement_id = custom_delivery_row.get('entitlement_id');

        // Update the entitlement to reflect the delivery status
        updateEntitlementDeliveryStatus(entitlement_id, is_delivered).then( function(result) {
            console.log('Updated entitlement delivery status: ' + entitlement_id + ' to: '
                        + is_delivered);
        }).catch( function(reason) {
            console.log('Failed to update entitlement delivery status: ' + reason);
        });

        if ((is_delivered === 'true' || is_delivered === 'TRUE')
            && savepoint_type === savepointSuccess) {

            // Successfully delivered, so update the root directory
            updateRootDeliveryStatus(root_delivery_id, is_delivered).then( function(result) {
                console.log('Updated root delivery status: ' + root_delivery_id + ' to: '
                            + is_delivered);
            }).catch( function(reason) {
                console.log('Failed to update root delivery status: ' + reason);
            });

        } else {

            // Failed delivery, so clean up delivery tables
            executeDeleteRootDeliveryRow(root_delivery_id);

            deleteCustomDeliveryRow(custom_delivery_id, custom_delivery_table).then( function(result) {
                console.log('Deleted custom delivery row: ' + custom_delivery_id
                            + ' from table: ' + custom_delivery_table);
            }).catch( function(reason) {
                console.log('Failed to delete custom delivery row: ' + reason);
            });
        }
    }).catch( function(reason) {
        console.log('Failed to finish custom delivery: ' + reason);
    });
}

// Convenience because we call this on any kind of error
var executeDeleteRootDeliveryRow = function(root_delivery_id) {
    deleteRootDeliveryRow(root_delivery_id).then( function(result) {
        console.log('Deleted root delivery row: ' + root_delivery_id);
    }).catch( function(reason) {
        console.log('Failed to delete root delivery row: ' + reason);
    });

}

/************************** UI Rending functions *********************************/

var displayGroup = function(idxStart, entitlementsResultSet) {
    console.log('displayGroup called. idxStart: ' + idxStart);

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

/************************** Utility functions *********************************/

var setJSONMap = function(JSONMap, key, value) {
    if (value !== null && value !== undefined) {
        JSONMap[key] = value;
    }
}

/************************** Query functions **********************************/

var getViewData = function() {
    return new Promise(function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    });
}

var getEntitlementRow = function(entitlement_id) {
    return new Promise(function(resolve, reject) {
        odkData.getMostRecentRow(entitlementsTable, entitlement_id, resolve, reject);
    });
}

var getCustomDeliveryForm = function(auth_id) {
    return new Promise(function(resolve, reject) {
        odkData.arbitraryQuery(authorizationTable,
                               'SELECT delivery_table, delivery_form, ranges'
                               +' FROM authorizations WHERE _id = ?',
                               [auth_id], null, null, resolve, reject);
    });

}

var getRootDeliveryRow = function(delivery_id) {
    return new Promise(function(resolve, reject) {
        odkData.getMostRecentRow(defaultDeliveryTable, delivery_id, resolve, reject);
    });
}
var getCustomDeliveryRow = function(custom_delivery_id, custom_delivery_table) {
    return new Promise(function(resolve, reject) {
        odkData.getMostRecentRow(custom_delivery_table, custom_delivery_id, resolve, reject);
    });
}

var addDeliveryRow = function(entitlementRow) {
    var jsonMap = {};
    setJSONMap(jsonMap, 'beneficiary_code', entitlementRow.get('beneficiary_code'));
    setJSONMap(jsonMap, 'entitlement_id', entitlementRow.get('_id'));
    setJSONMap(jsonMap, 'authorization_id', entitlementRow.get('authorization_id'));
    setJSONMap(jsonMap, 'authorization_name', entitlementRow.get('authorization_name'));
    setJSONMap(jsonMap, 'item_pack_id', entitlementRow.get('item_pack_id'));
    setJSONMap(jsonMap, 'item_pack_name', entitlementRow.get('item_pack_name'));
    setJSONMap(jsonMap, 'item_description', entitlementRow.get('item_description'));
    setJSONMap(jsonMap, 'is_override', entitlementRow.get('is_override'));
    setJSONMap(jsonMap, 'is_delivered', 'FALSE');

    // Ori & Waylon will fix this
    //setJSONMap(jsonMap, 'assigned_code', entitlementRow.get('assigned_code'));
    setJSONMap(jsonMap, '_group_read_only', entitlementRow.get('_group_modify'));

    var user = odkCommon.getActiveUser();

    setJSONMap(jsonMap, '_row_owner', user);
    return new Promise(function(resolve, reject) {
        odkData.addRow(defaultDeliveryTable, jsonMap, util.genUUID(), resolve, reject);
    });

}

var updateEntitlementDeliveryStatus = function (entitlement_id, is_delivered) {
    var jsonMap = {};
    setJSONMap(jsonMap, 'is_delivered', is_delivered);

    return new Promise(function(resolve, reject) {
        odkData.updateRow(entitlementsTable, jsonMap, entitlement_id, resolve, reject);
    });
}

var updateRootDeliveryStatus = function(delivery_id, is_delivered) {
    var jsonMap = {};
    setJSONMap(jsonMap, 'is_delivered', is_delivered);

    return new Promise(function(resolve, reject) {
        odkData.updateRow(defaultDeliveryTable, jsonMap, delivery_id, resolve, reject);
    });
}

var deleteRootDeliveryRow = function(delivery_id) {
    return new Promise(function(resolve, reject) {
        odkData.deleteRow(defaultDeliveryTable, null, delivery_id, resolve, reject);
    });
}

var deleteCustomDeliveryRow = function(custom_delivery_id, custom_delivery_table) {
    return new Promise(function(resolve, reject) {
        odkData.deleteRow(custom_delivery_table, null, custom_delivery_id, resolve, reject);
    });
}
