/**
 * Render the registration detail page
 */

'use strict';

var beneficiaryEntityResultSet = {};
var type = util.getQueryParameter('type');
var locale = odkCommon.getPreferredLocale();
var showDelivered = 'false';
var type = util.getQueryParameter("type");
var toggleSublist = $("#toggle_sublist");

function cbSuccess(result) {
    beneficiaryEntityResultSet = result;
    $('#title').text(beneficiaryEntityResultSet.get('beneficiary_entity_id'));
    $('#title').prepend(odkCommon.localizeText(locale, 'beneficiary_code') + ": ");


    //TODO: add translations entry for each column of all tables
    var exclusionList = ["beneficiary_entity_id"];
    util.populateDetailView(beneficiaryEntityResultSet, "field_list", locale, exclusionList);

    /*$('#inner_address').text(beneficiaryEntityResultSet.get('address'));
    $('#inner_telephone').text(beneficiaryEntityResultSet.get('telephone'));
    $('#inner_mobile_provider').text(beneficiaryEntityResultSet.get('mobile_provider'));
    $('#inner_delivery_site').text(beneficiaryEntityResultSet.get('delivery_site'));
    $('#inner_household_size').text(beneficiaryEntityResultSet.get('hh_size'));
    $('#inner_tent_caravan').text(beneficiaryEntityResultSet.get('tent_caravan'));


    $('#address').prepend(odkCommon.localizeText(locale, 'address') + ": ");
    $('#telephone').prepend(odkCommon.localizeText(locale, 'telephone') + ": ");
    $('#mobile_provider').prepend(odkCommon.localizeText(locale, 'mobile_provider') + ": ");
    $('#delivery_site').prepend(odkCommon.localizeText(locale, 'delivery_site') + ": ");
    $('#household_size').prepend(odkCommon.localizeText(locale, 'household_size') + ": ");
    $('#tent_caravan').prepend(odkCommon.localizeText(locale, 'tent_caravan') + ": ");*/

    if (util.getRegistrationMode() == "INDIVIDUAL") {
        setToDeliveryView();
        toggleSublist.hide();
    } else if (util.getRegistrationMode() == "HOUSEHOLD") {
        if (type == "registration") {
            setToHouseholdView();
        } else if (type == "registration") {
            setToDeliveryView()
        }
    }
}

function cbFailure(error) {
    console.log('registration_detail_hh cbFailure: getViewData failed with message: ' + error);
}

function display() {
    // Default to showing undelivered entitlements
    showDelivered = 'false';

    odkData.getViewData(cbSuccess, cbFailure);
}

function setToHouseholdView() {
    odkTables.setSubListView(util.entitlementTable, 'beneficiary_entity_id = ?',
        [beneficiaryEntityResultSet.get('beneficiary_code')],
        'config/tables/' + util.individualTable + '/html/individuals_list.html');

    toggleSublist.find(".sr-only").text("Entitlements");
    toggleSublist.click(function(e) {
        e.preventDefault();
        //TODO: set sublist to pending entitlements
    });
}

function setToDeliveryView() {
    //TODO: set sublist to pending entitlements
    toggleSublist.find(".sr-only").text("Household");
    toggleSublist.click(function(e) {
        e.preventDefault();
        odkTables.setSubListView(util.individualTable, 'beneficiary_entity_id = ?',
            [beneficiaryEntityResultSet.get('beneficiary_code')],
            'config/tables/' + util.individualTable + '/html/individuals_list.html');
    });
}
