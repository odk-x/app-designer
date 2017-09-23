/************************** Query function object **********************************/

var queryUtil = {}

queryUtil.getViewData = function() {
    return new Promise(function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    });
}

queryUtil.getEntitlementRow = function(entitlement_id) {
    return new Promise(function(resolve, reject) {
        odkData.getMostRecentRow(util.entitlementTable, entitlement_id, resolve, reject);
    });
}

queryUtil.getCustomDeliveryForm = function(auth_id) {
    return new Promise(function(resolve, reject) {
        odkData.arbitraryQuery(util.authorizationTable,
                               'SELECT delivery_table, delivery_form, ranges'
                               +' FROM authorizations WHERE _id = ?',
                               [auth_id], null, null, resolve, reject);
    });
}

queryUtil.getRootDeliveryRow = function(delivery_id) {
    return new Promise(function(resolve, reject) {
        odkData.getMostRecentRow(util.deliveryTable, delivery_id, resolve, reject);
    });
}

queryUtil.getCustomDeliveryRow = function(custom_delivery_id, custom_delivery_table) {
    return new Promise(function(resolve, reject) {
        odkData.getMostRecentRow(custom_delivery_table, custom_delivery_id, resolve, reject);
    });
}


//TODO: branch on whether to include an individual_id
//TODO: add date created attribute
queryUtil.addDeliveryRow = function(entitlement_row, custom_delivery_table, custom_delivery_row_id) {
    var jsonMap = {};
    util.setJSONMap(jsonMap, 'beneficiary_entity_id', entitlement_row.get('beneficiary_entity_id'));
    util.setJSONMap(jsonMap, 'entitlement_id', entitlement_row.get('_id'));
    util.setJSONMap(jsonMap, 'authorization_id', entitlement_row.get('authorization_id'));
    util.setJSONMap(jsonMap, 'authorization_name', entitlement_row.get('authorization_name'));
    util.setJSONMap(jsonMap, 'authorization_type', entitlement_row.get('authorization_type'));
    util.setJSONMap(jsonMap, 'authorization_description', entitlement_row.get('authorization_description'));
    util.setJSONMap(jsonMap, 'item_pack_id', entitlement_row.get('item_pack_id'));
    util.setJSONMap(jsonMap, 'item_pack_name', entitlement_row.get('item_pack_name'));
    util.setJSONMap(jsonMap, 'item_description', entitlement_row.get('item_description'));
    util.setJSONMap(jsonMap, 'is_override', entitlement_row.get('is_override'));
    util.setJSONMap(jsonMap, 'custom_delivery_form_id', custom_delivery_table);
    util.setJSONMap(jsonMap, 'custom_delivery_row_id', custom_delivery_row_id);

    // Ori & Waylon will fix this
    //util.setJSONMap(jsonMap, 'assigned_code', entitlement_row.get('assigned_code'));
    util.setJSONMap(jsonMap, '_group_read_only', entitlement_row.get('_group_modify'));

    var user = odkCommon.getActiveUser();

    util.setJSONMap(jsonMap, '_row_owner', user);
    return new Promise(function(resolve, reject) {
        odkData.addRow(util.deliveryTable, jsonMap, util.genUUID(), resolve, reject);
    });
}



//(action, dispatchStr, 'delivery', 'deliveryId', deliveryTableKey) params used for delivery call (to be implemented)
queryUtil.finishCustomEntry = function(action, dispatchStr, label, rootTableId, rootIdDispatchKey, customTableIdDispatchKey, logTag) {

    var result = action.jsonValue.result;

    odkCommon.log('I', logTag + "Finishing custom " + label);
    odkCommon.log('I', logTag +  "" + result);

    var rootRowId = dispatchStr[rootIdDispatchKey];
    if (rootRowId === null || rootRowId === undefined) {
        odkCommon.log('E', logTag + "Error: no root" + label + "id");
        odkCommon.removeFirstQueuedAction();
        return;
    }

    if (result === null || result === undefined) {
        odkCommon.log('E', logTag + "Error: no result object on delivery");
        queryUtil.executeDeleteRowCleanup(rootRowId, label, rootTableId);
        // TODO change to generic function
        return;
    }

    var customRowId = result.instanceId;
    if (customRowId === null || customRowId === undefined) {
        odkCommon.log('E', logTag + "Error: no instance ID on " + label);
        queryUtil.executeDeleteRowCleanup(rootRowId, label, rootTableId);
        return;
    }
    odkCommon.log('I', dispatchStr);
    odkCommon.log('I', customTableIdDispatchKey);
    var customTableId = dispatchStr[customTableIdDispatchKey];
    if (customTableId === null || customTableId === undefined) {
        odkCommon.log('E', logTag + "Error: no " + label + " table name");
        queryUtil.executeDeleteRowCleanup(rootRowId, label, rootTableId);
        return;
    }

    var customRow = null;

    new Promise(function(resolve, reject) {
        odkData.getMostRecentRow(customTableId, customRowId, resolve, reject);
    }).then( function(result) {
        odkCommon.log('I', logTag +  'Got custom ' + label  + ' row');
        if (!result || result.getCount === 0) {
            throw ('Failed to retrieve custom ' + label + ' row.');
        }

        var customRow = result;
        var dbActions = [];


        // Check if the entry succeeded
        var savepointType = customRow.get('_savepoint_type');
        console.log(savepointType);

        if (savepointType === util.savepointSuccess) {
            odkCommon.log('I', logTag + label + " succeeded");
        } else {
            odkCommon.log('I', logTag + label + " is false; delete rows");
            dbActions.push(queryUtil.deleteRowPromise(rootTableId, rootRowId));
            dbActions.push(queryUtil.deleteRowPromise(customRowId, customTableId));
        }

        Promise.all(dbActions).then( function(resultArr) {
            odkCommon.log('I', logTag +  'Cleaned up invalid + ' + label + ' rows');

            odkCommon.removeFirstQueuedAction();
        }).catch( function(reason) {
            odkCommon.log('E', logTag + 'Failed to clean up invalid ' + label + ' rows: ' + reason);

            odkCommon.removeFirstQueuedAction();
        });


    }).catch( function(reason) {
        odkCommon.log('E', logTag + 'Failed to finish custom ' + label + ': ' + reason);

        odkCommon.removeFirstQueuedAction();
    });
}

// Convenience because we call this on any kind of error
queryUtil.executeDeleteRowCleanup = function(rowId, label, tableId) {
    queryUtil.deleteRowPromise(tableId, rowId).then( function(result) {
        odkCommon.log('I', LOG_TAG + 'Deleted root ' + label + ' row: ' + rowId);

        odkCommon.removeFirstQueuedAction();
    }).catch( function(reason) {
        odkCommon.log('E', LOG_TAG + 'Failed to delete root ' + label + ' row: ' + reason);

        odkCommon.removeFirstQueuedAction();
    });

}

queryUtil.deleteRowPromise = function(tableId, rowId) {
    console.log(tableId);
    console.log(rowId);
    return new Promise(function(resolve, reject) {
        odkData.deleteRow(tableId, null, rowId, resolve, reject);
    });
}

queryUtil.deleteRootDeliveryRow = function(delivery_id) {
    return new Promise(function(resolve, reject) {
        odkData.deleteRow(util.deliveryTable, null, delivery_id, resolve, reject);
    });
}

queryUtil.deleteCustomDeliveryRow = function(custom_delivery_id, custom_delivery_table) {
    return new Promise(function(resolve, reject) {
        odkData.deleteRow(custom_delivery_table, null, custom_delivery_id, resolve, reject);
    });
}

queryUtil.deleteRootBeneficiaryEntityRow = function(rowId) {
    return new Promise(function(resolve, reject) {
        odkData.deleteRow(util.beneficiaryEntityTable, null, rowId, resolve, reject);
    });
}

queryUtil.deleteCustomBeneficiaryEntityRow = function(custom_beneficiary_entity_id, custom_beneficiary_entity_table) {
    return new Promise(function(resolve, reject) {
        odkData.deleteRow(custom_beneficiary_entity_table, null, custom_beneficiary_entity_id, resolve, reject);
    });
}

queryUtil.entitlementIsDelivered = function(entitlement_id) {
    new Promise(function(resolve, reject) {
        odkData.query(util.deliveryTable, 'entitlement_id = ?',
                      [entitlement_id], null, null, null, null, null,
                      null, true, resolve, reject);
        }).then(function(result) {
            if (result.getCount() == 0) {
                return false;
            } else {
                return true;
            }
        }).catch( function(reason) {
            odkCommon.log('E', 'Failed to check if entitlement is delivered: ' + reason);
            return false;
        });
}
