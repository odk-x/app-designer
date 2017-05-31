/**
 * Render the registration detail page
 */

'use strict';

var registrationResultSet = {};
var type = util.getQueryParameter('type');
var locale = odkCommon.getPreferredLocale();
var showDelivered = 'false';

function cbSuccess(result) {
    registrationResultSet = result;
    console.log(registrationResultSet.get('beneficiary_code'));
    $('#title').text(registrationResultSet.get('first_last_name'));

    $('#inner_id_type').text(registrationResultSet.get('id_type'));
    $('#inner_id_number').text(registrationResultSet.get('id_number'));
    $('#inner_gender').text(registrationResultSet.get('gender'));
    $('#inner_age').text(registrationResultSet.get('age'));

    $('#id_type').prepend(odkCommon.localizeText(locale, 'id_type') + ": ");
    $('#id_number').prepend(odkCommon.localizeText(locale, 'id_number') + ": ");
    $('#gender').prepend(odkCommon.localizeText(locale, 'gender') + ": ");
    $('#age').prepend(odkCommon.localizeText(locale, 'age') + ": ");
    
}

function cbFailure(error) {
    console.log('registrationMember_detail cbFailure: getViewData failed with message: ' + error);
}

function display() {
    // Default to showing undelivered entitlements
    showDelivered = 'false';

    odkData.getViewData(cbSuccess, cbFailure);
}
