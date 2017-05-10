/**
 * The file for displaying detail views of the Tea Houses table.
 */
'use strict';

 
var deliveriesResultSet = {};

function cbSuccess(result) {
  deliveriesResultSet = result;
  var locale = odkCommon.getPreferredLocale();
  $('#ben_code').text(odkCommon.localizeText(locale, 'beneficiary_code') + ": ");
  $('#del_id').text(odkCommon.localizeText(locale, 'delivery_id') + ": ");
  $('#auth_name').text(odkCommon.localizeText(locale, 'authorization_name') + ": ");
  $('#del_time').text(odkCommon.localizeText(locale, 'date_time') + ": ");
  $('#del_site').text(odkCommon.localizeText(locale, 'delivery_site') + ": ");
  $('#distributor').text(odkCommon.localizeText(locale, 'distributor') + ": ");
  $('#item_pack_name').text(odkCommon.localizeText(locale, 'item_pack_name') + ": ");
  $('#scanned').text(odkCommon.localizeText(locale, 'scanned_item_pack') + ": ");


  $('#inner_ben_code').text(deliveriesResultSet.get('beneficiary_code'));
  $('#inner_del_id').text(deliveriesResultSet.get('_id'));
  $('#inner_auth_name').text(deliveriesResultSet.get('authorization_name'));
  $('#inner_del_time').text(deliveriesResultSet.get('date_time'));
  $('#inner_del_site').text(deliveriesResultSet.get('delivery_site'));
  $('#inner_distributor').text(deliveriesResultSet.get('distributor'));
  if (deliveriesResultSet.get('is_delivered') == 'true') {
    $('#is_delivered').text('Successfully Delivered');
  } else {
    $('#is_delivered').text('Not Delivered!');
  }
  $('#inner_item_pack_name').text(deliveriesResultSet.get('item_pack_name'));
  $('#inner_scanned').text(deliveriesResultSet.get('scanned_item_pack'));
}

function cbFailure(error) {
  console.log('deliveries_detail cbFailure: getViewData failed with message: ' + error);
}

function display() {
  odkData.getViewData(cbSuccess, cbFailure);
}

