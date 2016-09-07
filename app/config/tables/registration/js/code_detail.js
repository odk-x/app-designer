/**
 * The file for displaying detail views of the Tea Houses table.
 */
/* global $, control, data */
'use strict';

 
var registrationResultSet = {};


function cbSuccess(result) {

  registrationResultSet = result;
  if (registrationResultSet.get('is_active') === 'true') {
    $('#deliver').text('Disable Beneficiary');
  } else {
    $('#deliver').text('Enable Beneficiary');
    if (registrationResultSet.get('disabled_reason') == null) {
      $('#disabled_reason').text('Disabled reason: Disabled by administrator');      
    } else {
      $('#disabled_reason').text('Disabled reason: ' + registrationResultSet.get('disabled_reason'));
    }
  }
  var first_name = registrationResultSet.get('first_name');
  var last_name = registrationResultSet.get('last_name');
  $('#TITLE').text(first_name + ' ' + last_name);

  $('#FIELD_17').text(registrationResultSet.get('beneficiary_code'));



  $('#FIELD_4').text(registrationResultSet.get('address'));

  $('#FIELD_5').text(registrationResultSet.get('city'));

  $('#FIELD_8').text(registrationResultSet.get('telephone'));


  $('#FIELD_20').text(registrationResultSet.get('village'));
  $('#FIELD_21').text(registrationResultSet.get('sub_village'));
  $('#FIELD_22').text(registrationResultSet.get('district'));
  $('#FIELD_24').text(registrationResultSet.get('mobile_provider'));


  

  var deliver = $('#deliver');
  deliver.on(
      'click',
      function() {
        var struct = {};
        if (registrationResultSet.get('is_active') === 'true') {
          struct.is_active = 'false';
        } else {
          struct.is_active = 'true'
          struct.ignore_validation = 'true';
        }
        console.log(registrationResultSet.getRowId(0));
        odkData.updateRow(
          'registration', struct, registrationResultSet.getRowId(0), updateCBSuccess, updateCBFailure
          );
      }
    );
}

function cbFailure(error) {
  console.log('registration_detail cbFailure: getViewData failed with message: ' + error);
}

function updateCBSuccess(result) {
  console.log('Update is_active callback success');
}

function updateCBFailure(result) {
  console.log('Update is_active callback failure');
}

function display() {
  odkData.getViewData(cbSuccess, cbFailure);
}

