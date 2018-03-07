'use strict';

function display() {
    return new Promise( function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    }).then( function(customResult) {
        var locale = odkCommon.getPreferredLocale();
        $('#title').text(customResult.get('first_last_name'));

        return new Promise( function(resolve, reject) {
            odkData.query(util.membersTable, '_id = ?', [util.getQueryParameter('rootRowId')],
                null, null, null, null, null, null, true, resolve, reject)
        }).then( function(baseResult) {
            util.populateDetailViewArbitrary([baseResult, customResult], null, "field_list", locale
                , ["picture_contentType", "picture_uriFragment", "custom_beneficiary_entity_row_id", "first_last_name",
                    "beneficiary_entity_row_id", "custom_member_row_id", "beneficiary_entity_status"]);
        });
    });
}
