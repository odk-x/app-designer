'use strict';

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

    dataUtil.getEntitlementRow(entitlement_id).then( function(result) {
        console.log('Got entitlement row');
        if (!result || result.getCount === 0) {
            throw ('Failed to retrieve entitlement.');
        }

        entitlement_row = result;

        return dataUtil.addDeliveryRow(entitlement_row);
    }).then( function (result) {
        console.log('Added delivery row');
        if (!result || result.getCount === 0) {
            throw ('Failed to add delivery to root table.');
        }

        var root_delivery_row = result;
        var root_delivery_row_id = root_delivery_row.get('_id');

        odkCommon.setSessionVariable('clicked', 'true');

        $('#deliver').prop('disabled', true);
        $('#confirmation').text('Delivery Confirmed!');

        console.log('Created new row in root delivery table: ' + root_delivery_row_id);

    }).catch( function(reason) {
        console.log('Failed to perform simple delivery: ' + reason);
    });
}
