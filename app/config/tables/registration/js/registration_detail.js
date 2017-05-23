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
    var first_name = registrationResultSet.get('first_name');
    var last_name = registrationResultSet.get('last_name');
    $('#title').text(first_name + ' ' + last_name);


    $('#inner_beneficiary_code').text(registrationResultSet.get('beneficiary_code'));
    $('#inner_address').text(registrationResultSet.get('address'));
    $('#inner_id_number').text(registrationResultSet.get('id_number'));
    $('#inner_city').text(registrationResultSet.get('city'));
    $('#inner_telephone').text(registrationResultSet.get('telephone'));
    $('#inner_mobile_provider').text(registrationResultSet.get('mobile_provider'));

    $('#beneficiary_code').prepend(odkCommon.localizeText(locale, 'beneficiary_code') + ": ");
    $('#address').prepend(odkCommon.localizeText(locale, 'address') + ": ");
    $('#id_number').prepend(odkCommon.localizeText(locale, 'id_number') + ": ");
    $('#city').prepend(odkCommon.localizeText(locale, 'city') + ": ");
    $('#telephone').prepend(odkCommon.localizeText(locale, 'telephone') + ": ");
    $('#mobile_provider').prepend(odkCommon.localizeText(locale, 'mobile_provider') + ": ");

    


    
    if (type == 'activate' || type == 'disable') {
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
    } else if (registrationResultSet.get('is_active') == 'false' || 
               registrationResultSet.get('is_active') == 'FALSE') {
      $('#inner_reject').text(odkCommon.localizeText(locale, 'disabled_beneficiary_notification'));
    } else {
      odkData.query('entitlements', 'beneficiary_code = ? and (is_delivered = ? or is_delivered = ?)',
                      [registrationResultSet.get('beneficiary_code'), 'false', 'FALSE'],
                      null, null, null, null, null, null, null, entCBSuccess, entCBFailure);
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
  console.log(result.getCount());

  $('#entitlements_switch').show();
  $('#entitlements_title').text('Entitlements Listed'); // TODO: localize this

  $('#pending_txt').text('Pending'); // TODO: Localize this
  $('#entitlements_pending').click(updateSubListView);

  $('#delivered_txt').text('Delivered'); // TODO: Localize this
  $('#entitlements_delivered').click(updateSubListView);

  updateSubListView();
}

function updateSubListView() {
    var groupModify = registrationResultSet.get('_group_modify');
    console.log("registrationResultSet: " + registrationResultSet);
    console.log("groupModify: " + groupModify);
    
    var showDeliveredCase = 'FALSE';
    if (showDelivered === 'true') {
        showDeliveredCase = 'TRUE';
    } else if (showDelivered === 'TRUE') {
        showDeliveredCase = 'true';
    } else if (showDelivered === 'false') {
        showDeliveredCase = 'FALSE';
    } else if (showDelivered === 'FALSE'){
        showDeliveredCase = 'false';
    }
    odkTables.setSubListView('entitlements',
                             'beneficiary_code = ? and (is_delivered = ? or is_delivered = ?)',
                             [registrationResultSet.get('beneficiary_code'), showDelivered, showDeliveredCase],
                             'config/tables/entitlements/html/entitlements_list.html?groupModify=' + encodeURIComponent(groupModify));

    if (showDelivered === 'true') {
        showDelivered = 'false';
    } else {
        showDelivered = 'true';
    }
}

function entCBFailure(error) {
    console.log('entCBFailure with error: ' + error);
}

function display() {
    // Default to showing undelivered entitlements
    showDelivered = 'false';

    odkData.getViewData(cbSuccess, cbFailure);
}
