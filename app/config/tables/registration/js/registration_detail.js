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

function cbSuccess(result) {

  registrationResultSet = result;
  var first_name = registrationResultSet.get('first_name');
  var last_name = registrationResultSet.get('last_name');
  $('#TITLE').text(first_name + ' ' + last_name);

  $('#FIELD_17').text(registrationResultSet.get('beneficiary_code'));



  $('#FIELD_4').text(registrationResultSet.get('address'));
  $('#FIELD_1').text(registrationResultSet.get('id_number'));
  $('#FIELD_5').text(registrationResultSet.get('city'));

  $('#FIELD_8').text(registrationResultSet.get('telephone'));
  $('#FIELD_24').text(registrationResultSet.get('mobile_provider'));

  if (registrationResultSet.get('is_active') == 'true') {
    var deliver = $('#deliver');
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
  }
}

function cbFailure(error) {
  console.log('registration_detail cbFailure: getViewData failed with message: ' + error);
}

function display() {
  odkData.getViewData(cbSuccess, cbFailure);
}

