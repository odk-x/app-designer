'use strict';

function display() {
    return new Promise( function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    }).then( function(result) {
        var locale = odkCommon.getPreferredLocale();
        $('#title').text(result.get('first_last_name'));
        util.populateDetailView(result, "field_list", locale, ["beneficiary_entity_row_id", "custom_individual_row_id"]);
        return new Promise( function(resolve, reject) {
            odkData.query(util.getIndividualCustomFormId(), '_id = ?', [result.get('custom_individual_row_id')],
                null, null, null, null, null, null, true, resolve, reject)
        }).then( function(subResult) {
            console.log(subResult);
            console.log(subResult.getCount());
            console.log(subResult.getColumns());

            util.populateDetailView(subResult, "field_list", locale, ["custom_beneficiary_entity_row_id"]);
        })
    });
}
