/**
 * Render the search page
 */
'use strict';

function cancel() {
    history.back();
}

function deliver() {
    var entitlement_id = util.getQueryParameter('entitlement_id');
    var struct = {};
    struct.is_delivered = 'TRUE';
    odkData.updateRow('entitlements', struct, entitlement_id, updateEntitlementsCBSuccess, updateEntitlementsCBFailure);

    var delivery_id = util.getQueryParameter('delivery_id');
    var struct = {};
    struct.is_delivered = 'TRUE';
    odkData.updateRow('deliveries', struct, delivery_id, updateDeliveriesCBSuccess, updateDeliveriesCBFailure);

    history.back();
}

var updateEntitlementsCBSuccess = function(result) {
  console.log('updateEntitlementsCBSuccess called');
}

var updateEntitlementsCBFailure = function(error) {
  console.log('updateEntitlementsCBFailure called with error: ' + error);
}

var updateDeliveriesCBSuccess = function(result) {
  console.log('updateDeliveriesCBSuccess called');
}

var updateDeliveriesCBFailure = function(error) {
  console.log('updateDeliveriesCBFailure called with error: ' + error);
}

