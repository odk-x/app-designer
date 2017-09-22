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