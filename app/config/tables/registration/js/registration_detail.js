/**
 * Render the registration detail page
 */

'use strict';

var registrationResultSet = {};
var type = util.getQueryParameter('type');
var locale = odkCommon.localizeText();

function cbSuccess(result) {
    registrationResultSet = result;
    var first_name = registrationResultSet.get('first_name');
    var last_name = registrationResultSet.get('last_name');
    $('#title').text(first_name + ' ' + last_name);

    $('#beneficiary_code').text(odkCommon.localizeText(locale, 'beneficiary_code') + ": ");
    $('#address').text(odkCommon.localizeText(locale, 'address') + ": ");
    $('#id_number').text(odkCommon.localizeText(locale, 'id_number') + ": ");
    $('#city').text(odkCommon.localizeText(locale, 'city') + ": ");
    $('#telephone').text(odkCommon.localizeText(locale, 'telephone') + ": ");
    $('#mobile_provider').text(odkCommon.localizeText(locale, 'mobile_provider') + ": ");


    $('#inner_beneficiary_code').text(registrationResultSet.get('beneficiary_code'));
    $('#inner_address').text(registrationResultSet.get('address'));
    $('#inner_id_number').text(registrationResultSet.get('id_number'));
    $('#inner_city').text(registrationResultSet.get('city'));
    $('#inner_telephone').text(registrationResultSet.get('telephone'));
    $('#inner_mobile_provider').text(registrationResultSet.get('mobile_provider'));

    if (registrationResultSet.get('is_active') == 'true' && type == 'delivery') {
        odkData.query('entitlements', 'beneficiary_code = ? and is_delivered = ?',
                      [registrationResultSet.get('beneficiary_code'), 'false'],
                      null, null, null, null, null, null, null, entCBSuccess, entCBFailure);
    }  else if (registrationResultSet.get('is_active') == 'false' && type == 'delivery') {
        $('#inner_reject').text(odkCommon.localizeText(locale, 'disabled_beneficiary_notification'));
    } else {
        var action = $('#followup');
        if (type == 'activate') {
            action.text(odkCommon.localizeText(locale, "enable_beneficiary"));
        } else {
            action.text(odkCommon.localizeText(locale, "disable_beneficiary"));
        }
        action.show();
        action.on(
                  'click',
                  function() {
                      var struct = {};
                      if (type == 'activate') {
                          struct.is_active = 'true';
                      } else {
                          struct.is_active = 'false';
                      }
                      struct.is_override = 'true';
                      odkData.updateRow('registration', struct, registrationResultSet.getRowId(0),
                                        updateCBSuccess, updateCBFailure);
                  }
                 );
    }
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
    if (result.getCount() > 0) {
        console.log(result.getCount());
        var deliver = $('#followup');
        deliver.text(odkCommon.localizeText(locale, "choose_entitlement"));
        deliver.show();
        deliver.on(
                   'click',
                   function() {
                       odkTables.openTableToListView(null, 'entitlements',
                                                     'beneficiary_code = ? and is_delivered = ?',
                                                     [registrationResultSet.get('beneficiary_code'), 'false'],
                                                     'config/tables/entitlements/html/entitlements_list.html'
                                                    );
                   }
                  );
    } else {
        $('#reject').text(odkCommon.localizeText(locale, "no_entitlements"));
    }
}

function entCBFailure(error) {
    console.log('entCBFailure with error: ' + error);
}

function display() {
    odkData.getViewData(cbSuccess, cbFailure);
}
