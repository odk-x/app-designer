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
    $('#inner_delivery_site').text(registrationResultSet.get('delivery_site'));
    $('#inner_household_size').text(registrationResultSet.get('hh_size'));
    $('#inner_tent_caravan').text(registrationResultSet.get('tent_caravan'));


    $('#address').prepend(odkCommon.localizeText(locale, 'address') + ": ");
    $('#telephone').prepend(odkCommon.localizeText(locale, 'telephone') + ": ");
    $('#mobile_provider').prepend(odkCommon.localizeText(locale, 'mobile_provider') + ": ");
    $('#delivery_site').prepend(odkCommon.localizeText(locale, 'delivery_site') + ": ");
    $('#household_size').prepend(odkCommon.localizeText(locale, 'household_size') + ": ");
    $('#tent_caravan').prepend(odkCommon.localizeText(locale, 'tent_caravan') + ": ");


    $("#entitle").click(function(e) {
        e.preventDefault();   
        odkTables.openDetailWithListView(null, 'registration', registrationResultSet.getRowId(0),
            'config/tables/registration/html/registration_detail.html');
    }); 

    
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
