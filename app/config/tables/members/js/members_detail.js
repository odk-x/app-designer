'use strict';

function display() {
    return new Promise( function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    }).then( function(result) {
        var locale = odkCommon.getPreferredLocale();
        util.populateDetailView(result, "field_list", locale, ["picture_contentType", "picture_uriFragment",
            "custom_beneficiary_entity_row_id", "first_last_name"]);
        $('#title').text(result.get('first_last_name'));


        return new Promise( function(resolve, reject) {
            odkData.query(util.membersTable, '_id = ?', [util.getQueryParameter('rootRowId')],
                null, null, null, null, null, null, true, resolve, reject)
        }).then( function(subResult) {
            util.populateDetailView(subResult, "field_list", locale, ["beneficiary_entity_row_id", "custom_member_row_id", "beneficiary_entity_status"]);
        })
    });
}
