'use strict';

function display() {
    return new Promise( function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    }).then( function(result) {
        var locale = odkCommon.getPreferredLocale();
        util.populateDetailView(result, "field_list", locale, ["beneficiary_entity_row_id", "custom_individual_row_id", "beneficiary_entity_status"]);
        return new Promise( function(resolve, reject) {
            odkData.query(util.getIndividualCustomFormId(), '_id = ?', [result.get('custom_individual_row_id')],
                null, null, null, null, null, null, true, resolve, reject)
        }).then( function(subResult) {
            console.log(subResult.getColumns());
            $('#title').text(subResult.get('first_last_name'));
            util.populateDetailView(subResult, "field_list", locale, ["picture_contentType", "picture_uriFragment",
                "custom_beneficiary_entity_row_id", "first_last_name"]);
        })
    });
}
