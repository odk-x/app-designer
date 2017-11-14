'use strict';


function display(result) {
    var displayPromise = new Promise( function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    }).then( function(result) {
        var locale = odkCommon.getPreferredLocale();
        $('#title').text("Delivery Summary");

        let exclusionList = [];
        if (util.getWorkflowMode() === 'TOKEN') {
            exclusionList = ['authorization_description', 'authorization_id', 'custom_delivery_form_id',
                                'custom_delivery_row_id', 'entitlement_id', 'member_id', 'is_override',
                                'item_pack_description', 'item_pack_id', 'item_pack_name'];
        } else {
            exclusionList = ['custom_delivery_row_id'];
        }

        util.populateDetailView(result, "field_list", locale, exclusionList);
        if (result.get("custom_delivery_form_id") !== null && result.get("custom_delivery_form_id") !== undefined && result.get("custom_delivery_form_id") !== "") {
            return new Promise( function(resolve, reject) {
                odkData.query(result.get("custom_delivery_form_id"), '_id = ?', [result.get("custom_delivery_row_id")],
                    null, null, null, null, null, null, true, resolve, reject);
            }).then( function(result) {
                util.populateDetailView(result, "field_list", locale, []);
            });
        }
    });

    displayPromise.catch( function(reason) {
        console.log(reason);
    });

    return displayPromise;
}

