/**
 * The file for displaying detail views of the Tea Houses table.
 */
/* global $, control, data */
'use strict';

// Handle the case where we are debugging in chrome.
// if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
//   console.log('Welcome to Tables debugging in Chrome!');
//   $.ajax({
//       url: odkCommon.getFileAsUrl('output/debug/Tea_houses_data.json'),
//       async: false,  // do it first
//       success: function(dataObj) {
//           window.data.setBackingObject(dataObj);
//         }
//   });
// }
 
var registrationResultSet = {};
var type = util.getQueryParameter('type');

function cbSuccess(result) {

  registrationResultSet = result;
  var first_name = registrationResultSet.get('first_name');
  var last_name = registrationResultSet.get('last_name');
  $('#TITLE').text(first_name + ' ' + last_name);

  $('#FIELD_17').text(registrationResultSet.get('beneficiary_code'));

  $('#FIELD_2').text(registrationResultSet.get('sector'));

  $('#FIELD_4').text(registrationResultSet.get('address'));
  $('#FIELD_1').text(registrationResultSet.get('id_number'));
  $('#FIELD_5').text(registrationResultSet.get('city'));

  $('#FIELD_8').text(registrationResultSet.get('telephone'));
  $('#FIELD_24').text(registrationResultSet.get('mobile_provider'));

  if (registrationResultSet.get('is_active') == 'true' && type == 'regular') {
    odkData.query('entitlements', 'beneficiary_code = ? and is_delivered = ?',
                  [registrationResultSet.get('beneficiary_code'), 'false'],
                  null, null, null, null, null, null, null, entCBSuccess, entCBFailure);
  } else {
    var activate = $('#followup');
    if (type = 'activate') {
      activate.text('Enable Beneficiary');
    } else {
      activate.text('Disable Beneficiary');
    }
    activate.show();
    activate.on(
      'click',
      function() {
        var struct = {};
        if (type = 'activate') {
          struct.is_active = 'true';
        } else {
          struct.is_active = 'false';
        }
        struct.is_override = 'true';
        odkData.updateRow(
          'registration', struct, registrationResultSet.getRowId(0), updateCBSuccess, updateCBFailure);
      }
    );
  }
}

function cbFailure(error) {
  console.log('registration_detail cbFailure: getViewData failed with message: ' + error);
}

function updateCBSuccess(result) {
  console.log('Update is_active callback success');
  if (type = 'activate') {
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
    deliver.text('Choose an Authorized Item Pack To Deliver');
    deliver.show();
    deliver.on(
        'click',
        function() {
            odkTables.openTableToListView(
                'entitlements',
                'beneficiary_code = ? and is_delivered = ?',
                [registrationResultSet.get('beneficiary_code'), 'false'],
                'config/tables/entitlements/html/dist_ben_list.html'
            );
        }
    );
  } else {
    console.log('rejected');
    $('#reject').text('No Authorized Item Packs to Deliver');
  }
}

function entCBFailure(error) {
  console.log('entCBFailure with error: ' + error);
}

function display() {
  odkData.getViewData(cbSuccess, cbFailure);
}

