/**
 * The file for displaying detail views of the Tea Houses table.
 */
'use strict';

 
var deliveriesResultSet = {};

function cbSuccess(result) {
  deliveriesResultSet = result;
  $('#FIELD_1').text(deliveriesResultSet.get('beneficiary_code'));
  $('#FIELD_2').text(deliveriesResultSet.get('_id'));
  $('#FIELD_3').text(deliveriesResultSet.get('authorization_name'));
  $('#FIELD_4').text(deliveriesResultSet.get('date_time'));
  $('#FIELD_5').text(deliveriesResultSet.get('delivery_site'));
  $('#FIELD_6').text(deliveriesResultSet.get('distributor'));
  if (deliveriesResultSet.get('is_delivered') == 'true') {
    $('#FIELD_7').text('Successfully Delivered');
  } else {
    $('#FIELD_8').text('Not Delivered!');
  }
  $('#FIELD_9').text(deliveriesResultSet.get('item_pack_name'));
  $('#FIELD_10').text(deliveriesResultSet.get('scanned_item_pack'));
}

function cbFailure(error) {
  console.log('deliveries_detail cbFailure: getViewData failed with message: ' + error);
}

function display() {
  odkData.getViewData(cbSuccess, cbFailure);
}

