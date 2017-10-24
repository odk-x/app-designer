'use strict';


function display(result) {
    var displayPromise = new Promise( function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    }).then( function(result) {
        var locale = odkCommon.getPreferredLocale();
        $('#title').text("Delivery Summary");

        util.populateDetailView(result, "field_list", locale, ["custom_delivery_row_id"]);
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

