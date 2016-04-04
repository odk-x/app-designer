/**
 * The file for displaying detail views of the Tea Houses table.
 */
/* global $, control, data */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
  console.log('Welcome to Tables debugging in Chrome!');
  $.ajax({
      url: control.getFileAsUrl('output/debug/Tea_houses_data.json'),
      async: false,  // do it first
      success: function(dataObj) {
          window.data.setBackingObject(dataObj);
        }
  });
}
 
function display() {
  var first_name = data.get('first_name');
  var last_name = data.get('last_name');
  $('#TITLE').text(first_name + ' ' + last_name);

  $('#FIELD_17').text(data.get('beneficiary_code'));
  $('#FIELD_18').text(data.get('envelope_code'));

  var received_card = data.get('received_card');
  var card_label = 'NO';
  if (received_card === '1') {
    card_label = 'YES';
  }
  $('#FIELD_19').text(card_label);


  $('#FIELD_4').text(data.get('address'));

  $('#FIELD_5').text(data.get('city'));
  $('#FIELD_6').text(data.get('state'));
  $('#FIELD_13').text(data.get('postcode'));
  $('#FIELD_7').text(data.get('country'));

  $('#FIELD_8').text(data.get('telephone'));

  $('#FIELD_9').text(data.get('date_screened'));
  $('#FIELD_10').text(data.get('date_distributed'));

  var enterEnvelope = $('#enter-envelope');
  enterEnvelope.on(
      'click',
      function() {
        var rowId = data.getRowId(0);
        control.editRowWithSurvey(
          'beneficiaries',
          rowId,
          'enter_envelope_form',
          null);
      }
    );


}

