'use strict';

var registrationTable = 'registration';
var authorizationTable = 'authorizations';
var entitlementsTable = 'entitlements';
var deliveryTable = 'deliveries'

function display() {
    if (odkCommon.getSessionVariable('clicked') === 'true') {
        $('#deliver').prop('disabled', true);
        $('#confirmation').text('Delivery Confirmed!');
    }
}

function deliver() {
    var entitlement_id = util.getQueryParameter('entitlement_id');
    console.log("Delivering entitlement: " + entitlement_id);

    var entitlement_row = null;

    getEntitlementRow(entitlement_id).then( function(result) {
        console.log('Got entitlement row');
        if (!result || result.getCount === 0) {
            throw ('Failed to retrieve entitlement.');
        }

        entitlement_row = result;

        return addDeliveryRow(entitlement_row);
    }).then( function (result) {
        console.log('Added delivery row');
        if (!result || result.getCount === 0) {
            throw ('Failed to add delivery to root table.');
        }

        var root_delivery_row = result;
        var root_delivery_row_id = root_delivery_row.get('_id');
        console.log('Created new row in root delivery table: ' + root_delivery_row_id);

        return updateEntitlementDeliveryStatus(entitlement_id);
    }).then (function (result) {
        console.log('Updated entitlement to delivered');

        $('#deliver').prop('disabled', true);
        $('#confirmation').text('Delivery Confirmed!');
        odkCommon.setSessionVariable('clicked', 'true');
    }).catch( function(reason) {
        console.log('Failed to perform simple delivery: ' + reason);
    });
}

/************************** Utility functions *********************************/

var setJSONMap = function(JSONMap, key, value) {
    if (value !== null && value !== undefined) {
        JSONMap[key] = value;
    }
}

/****************** Query Functions ************************/

var getEntitlementRow = function(entitlement_id) {
    return new Promise(function(resolve, reject) {
        odkData.getMostRecentRow(entitlementsTable, entitlement_id, resolve, reject);
    });
}

var addDeliveryRow = function(entitlement_row) {
    var jsonMap = {};
    setJSONMap(jsonMap, 'beneficiary_code', entitlement_row.get('beneficiary_code'));
    setJSONMap(jsonMap, 'entitlement_id', entitlement_row.get('_id'));
    setJSONMap(jsonMap, 'authorization_id', entitlement_row.get('authorization_id'));
    setJSONMap(jsonMap, 'authorization_name', entitlement_row.get('authorization_name'));
    setJSONMap(jsonMap, 'item_pack_id', entitlement_row.get('item_pack_id'));
    setJSONMap(jsonMap, 'item_pack_name', entitlement_row.get('item_pack_name'));
    setJSONMap(jsonMap, 'item_description', entitlement_row.get('item_description'));
    setJSONMap(jsonMap, 'is_override', entitlement_row.get('is_override'));
    setJSONMap(jsonMap, 'is_delivered', 'TRUE');

    // Ori & Waylon will fix this
    //setJSONMap(jsonMap, 'assigned_code', entitlement_row.get('assigned_code'));
    setJSONMap(jsonMap, '_group_read_only', entitlement_row.get('_group_modify'));

    var user = odkCommon.getActiveUser();

    setJSONMap(jsonMap, '_row_owner', user);
    return new Promise(function(resolve, reject) {
        odkData.addRow(deliveryTable, jsonMap, util.genUUID(), resolve, reject);
    });

}

var updateEntitlementDeliveryStatus = function (entitlement_id) {
    var jsonMap = {};
    setJSONMap(jsonMap, 'is_delivered', 'TRUE');

    return new Promise(function(resolve, reject) {
        odkData.updateRow(entitlementsTable, jsonMap, entitlement_id, resolve, reject);
    });
}
