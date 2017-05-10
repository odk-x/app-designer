'use strict';


var display = function() {
	odkData.getViewData(cbSuccess, cbFailure);
};

var cbSuccess = function (result) {
	var locale = odkCommon.getPreferredLocale();

	$('#title').text(odkCommon.localizeText(locale, "authorization_details"));
	$('#auth_name').text(odkCommon.localizeText(locale, "authorization_name") + ': ');
	$('#auth_id').text(odkCommon.localizeText(locale, "authorization_id"));
	$('#item_pack_name').text(odkCommon.localizeText(locale, "item_pack_name") + ': ');
	$('#item_pack_id').text(odkCommon.localizeText(locale, "item_pack_id") + ': ');
	$('#item_description').text(odkCommon.localizeText(locale, "item_description") + ': ');

	$('#inner_auth_name').text(result.get('authorization_name'));
	$('#inner_auth_id').text(result.get('_id'));
	$('#inner_item_pack_name').text(result.get('item_pack_name'));
	$('#inner_item_pack_id').text(result.get('item_pack_id'));
	$('#inner_item_description').text(result.get('item_description'));
}

var cbFailure = function(error) {
	console.log('dispaly failure with error: ' + error);
}