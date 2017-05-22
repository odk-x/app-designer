/**
 * The file for displaying detail views of the Tea Houses table.
 */
'use strict';

var deliveriesResultSet = {};

function cbSuccess(result) {
  deliveriesResultSet = result;
  updateEntitlement();
  var locale = odkCommon.getPreferredLocale();
  $('#ben_code').prepend(odkCommon.localizeText(locale, 'beneficiary_code') + ": ");
  $('#del_id').prepend(odkCommon.localizeText(locale, 'delivery_id') + ": ");
  $('#auth_name').prepend(odkCommon.localizeText(locale, 'authorization_name') + ": ");
  $('#del_time').prepend(odkCommon.localizeText(locale, 'date_time') + ": ");
  $('#del_site').prepend(odkCommon.localizeText(locale, 'delivery_site') + ": ");
  $('#distributor').prepend(odkCommon.localizeText(locale, 'distributor') + ": ");
  $('#item_pack_name').prepend(odkCommon.localizeText(locale, 'item_pack_name') + ": ");
  $('#scanned').prepend(odkCommon.localizeText(locale, 'scanned_item_pack') + ": ");


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

function updateEntitlement() {
  var struct = {};
  struct.is_delivered = 'true';
  odkData.updateRow('entitlements', struct, deliveriesResultSet.get('entitlement_id')
  , updateCBSuccess, updateCBFailure);
}

var updateCBSuccess = function(result) {
  console.log('updateCBSuccess called');
}

var updateCBFailure = function(error) {
  console.log('updateCBFailure called with error: ' + error);
}

function display() {
  odkData.getViewData(cbSuccess, cbFailure);
}

