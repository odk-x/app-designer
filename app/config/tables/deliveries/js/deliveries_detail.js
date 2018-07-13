'use strict';


function display() {
    var displayPromise = new Promise( function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    }).then( function(baseResult) {
        var locale = odkCommon.getPreferredLocale();
        $('#title').text("Delivery Summary");

        var exclusionList = [];
        if (util.getWorkflowMode() === util.workflow.none) {
            exclusionList = ['assigned_item_pack_code', 'authorization_description', 'authorization_id', 'custom_delivery_form_id',
                                'custom_delivery_row_id', 'entitlement_id', 'member_id', 'is_override',
                                'item_pack_description', 'item_pack_id', 'item_pack_name'];
        } else {
            exclusionList = ['authorization_id', 'custom_delivery_form_id', 'entitlement_id',
                                'custom_delivery_row_id', 'item_pack_id'];
        }

        if (baseResult.get("custom_delivery_form_id") !== null
            && baseResult.get("custom_delivery_form_id") !== undefined
            && baseResult.get("custom_delivery_form_id") !== "") {
            return new Promise( function(resolve, reject) {
                odkData.query(baseResult.get("custom_delivery_form_id"), '_id = ?',
                    [baseResult.get("custom_delivery_row_id")],
                    null, null, null, null, null, null, true, resolve, reject);
            }).then( function(customResult) {
                if (customResult.getTableId() === 'ctp_delivery') {
                    exclusionList.push('receive_signature_contentType');
                    exclusionList.push('receive_signature_uriFragment');
                }
                util.populateDetailViewArbitrary([baseResult, customResult], null, "field_list", locale, exclusionList);
            });
        } else {
            util.populateDetailView(baseResult, "field_list", locale, exclusionList);
        }
    });

    displayPromise.catch( function(reason) {
        console.log(reason);
    });

    return displayPromise;
}

