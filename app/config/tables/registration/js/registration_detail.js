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
        odkTables.openTableToListView(
          'distribution',
          'beneficiary_code = ?',
          [registrationResultSet.get('beneficiary_code')],
          'config/tables/distribution/html/auth_ben_list.html'
          )
       // var rowId = registrationResultSet.getRowId(0);
        /*odkTables.addRowWithSurvey(
          'deployment',
          'deploy_to_beneficiary',
          null,
          jsonMap);*/

      }
    );
}

function cbFailure(error) {
  console.log('registration_detail cbFailure: getViewData failed with message: ' + error);
}

function display() {
  odkData.getViewData(cbSuccess, cbFailure);
}

