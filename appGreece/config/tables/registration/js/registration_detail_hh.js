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
    $('#title').text(registrationResultSet.get('beneficiary_code'));
    $('#title').prepend(odkCommon.localizeText(locale, 'beneficiary_code') + ": ");

    $('#inner_address').text(registrationResultSet.get('address'));
    $('#inner_telephone').text(registrationResultSet.get('telephone'));
    $('#inner_mobile_provider').text(registrationResultSet.get('mobile_provider'));

    $('#address').prepend(odkCommon.localizeText(locale, 'address') + ": ");
    $('#telephone').prepend(odkCommon.localizeText(locale, 'telephone') + ": ");
    $('#mobile_provider').prepend(odkCommon.localizeText(locale, 'mobile_provider') + ": ");
    
    odkTables.setSubListView('registrationMember', 'beneficiary_code = ?', 
        [registrationResultSet.get('beneficiary_code')], 
        'config/tables/registrationMember/html/registrationMember_list.html');
}

function cbFailure(error) {
    console.log('registration_detail_hh cbFailure: getViewData failed with message: ' + error);
}

function display() {
    // Default to showing undelivered entitlements
    showDelivered = 'false';

    odkData.getViewData(cbSuccess, cbFailure);
}
