/**
 * Render the registration detail page
 */

'use strict';

var registrationResultSet = {};
var type = util.getQueryParameter('type');
var locale = odkCommon.getPreferredLocale();

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

    $("#household").click(function(e) {
        e.preventDefault();   
        odkTables.openDetailWithListView(null, 'registration', registrationResultSet.getRowId(0),
            'config/tables/registration/html/registration_detail_hh.html');
    }); 
    
    if (type == 'activate' || type == 'disable') {
        var action = $('#followup');
        if (type == 'activate') {
            action.text(odkCommon.localizeText(locale, "enable_beneficiary"));
        } else {
            action.text(odkCommon.localizeText(locale, "disable_beneficiary"));
        }
        action.show();
        action.on('click', function() {
        
            var struct = {};
            if (type == 'activate') {
                struct.is_active = 'true';
            } else {
                struct.is_active = 'false';
            }
            struct.is_override = 'true';
            odkData.updateRow('registration', struct, registrationResultSet.getRowId(0),
                updateCBSuccess, updateCBFailure);
        });

    } else if (registrationResultSet.get('is_active') == 'false' || 
               registrationResultSet.get('is_active') == 'FALSE') {
        $('#inner_reject').text(odkCommon.localizeText(locale, 'disabled_beneficiary_notification'));
    } else {
        odkData.query('entitlements', 'beneficiary_code = ? and (is_delivered = ? or is_delivered = ?)',
                      [registrationResultSet.get('beneficiary_code'), 'false', 'FALSE'],
                      null, null, null, null, null, null, null, entCBSuccess, entCBFailure);
    }

    // Set onClick event listener
    $('#hh_members').click(function(e) {
        odkTables.openTableToListView(null, 'registrationMember', 'beneficiary_code = ?',
        [registrationResultSet.get('beneficiary_code')], 'config/tables/registrationMember/html/registrationMember_list.html') ;
    });
}

function cbFailure(error) {
    console.log('registration_detail cbFailure: getViewData failed with message: ' + error);
}

function updateCBSuccess(result) {
    console.log('Update is_active callback success');
    $("#followup").prop("disabled",true);
    if (type == 'activate') {
        $('#message').text('Successfully Enabled!');
    } else {
        $('#message').text('Successfully Disabled!');
    }
}

function updateCBFailure(result) {
    console.log('Update is_active callback failure');
}

function entCBSuccess(result) {
    console.log(result.getCount());

    $('#entitlements_switch').show();
    $('#entitlements_title').text('Entitlements Listed'); // TODO: localize this

    $('#pending_txt').text('Pending'); // TODO: Localize this
    $('#entitlements_pending').click(function() {
        updateSubListView(false)
    });

    $('#delivered_txt').text('Delivered'); // TODO: Localize this
    $('#entitlements_delivered').click(function() {
        updateSubListView(true)
    });

  updateSubListView(false);
}

function updateSubListView(forDelivered) {
    var groupModify = registrationResultSet.get('_group_modify');
    console.log("registrationResultSet: " + registrationResultSet);
    console.log("groupModify: " + groupModify);
    
    var showDelivered = 'false';
    var showDeliveredCase = 'FALSE';

    if (forDelivered === true) {
        showDelivered = 'true';
        showDeliveredCase = 'TRUE';
    }

    odkTables.setSubListView('entitlements',
                             'beneficiary_code = ? and (is_delivered = ? or is_delivered = ?)',
                             [registrationResultSet.get('beneficiary_code'), showDelivered, showDeliveredCase],
                             'config/tables/entitlements/html/entitlements_list.html?groupModify=' + encodeURIComponent(groupModify));
}

function entCBFailure(error) {
    console.log('entCBFailure with error: ' + error);
}

function display() {
    odkData.getViewData(cbSuccess, cbFailure);
}
