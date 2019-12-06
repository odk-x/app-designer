/**
 * The file for displaying the detail views of the refrigerator Types table.
 */
/* global $, odkTables, data */
'use strict';

// Handle the case where we are debugging in chrome.
// if (JSON.parse(odkCommon.getPlatformInfo()).container === 'Chrome') {
//     console.log('Welcome to Tables debugging in Chrome!');
//     $.ajax({
//         url: odkCommon.getFileAsUrl('output/debug/refrigerator_types_data.json'),
//         async: false,  // do it first
//         success: function(dataObj) {
//             window.data.setBackingObject(dataObj);
//         }
//     });
// }
var refrigeratorTypeResultSet = {};

function cbSuccess(result) {

    refrigeratorTypeResultSet = result;

    odkData.query('refrigerators', 'model_row_id = ? AND _sync_state != ?',
        [refrigeratorTypeResultSet.get('_id'), util.deletedSyncState],
        null, null, null, null, null, null, true, refrigeratorsCBSuccess, refrigeratorsCBFailure);

}

function cbFailure(error) {

    console.log('cbFailure: failed with error: ' + error);

}

function refrigeratorsCBSuccess(invData) {
    var locale = odkCommon.getPreferredLocale();

    util.showIdForDetail('#model_name', 'model_id', refrigeratorTypeResultSet, false);
    util.showIdForDetail('#catalog_id', 'catalog_id', refrigeratorTypeResultSet, false);

    util.showIdForDetail('#manufacturer', 'manufacturer', refrigeratorTypeResultSet, false);

    util.showIdForDetail('#power_sources', 'power_source', refrigeratorTypeResultSet, true);

    $('#r_gross_vol').text(refrigeratorTypeResultSet.get('refrigerator_gross_volume') + ' ' +
        odkCommon.localizeText(locale, "liters_unit"));

    $('#f_gross_vol').text(refrigeratorTypeResultSet.get('freezer_gross_volume') + ' ' +
        odkCommon.localizeText(locale, "liters_unit"));

    util.showIdForDetail('#power_sources', 'power_source', refrigeratorTypeResultSet, true);
    util.showIdForDetail('#equipment_type', 'equipment_type', refrigeratorTypeResultSet, true);
    util.showIdForDetail('#climate_zone', 'climate_zone', refrigeratorTypeResultSet, true);

    $('#r_net_vol').text(refrigeratorTypeResultSet.get('refrigerator_net_volume') + ' ' +
        odkCommon.localizeText(locale, "liters_unit"));
    $('#f_net_vol').text(refrigeratorTypeResultSet.get('freezer_net_volume') + ' ' +
        odkCommon.localizeText(locale, "liters_unit"));

    var uriRelative = refrigeratorTypeResultSet.get('refrigerator_picture_uriFragment');
    var src = '';
    var refPic = $('#refPic');

    if (uriRelative !== null  && uriRelative !== '') {
        var tableId = refrigeratorTypeResultSet.getTableId();
        var rowId = refrigeratorTypeResultSet.getRowId(0);
        var uriAbsolute = odkCommon.getRowFileAsUrl(tableId, rowId, uriRelative);
        src = uriAbsolute;

    } else {
        src = odkCommon.getFileAsUrl('config/assets/img/img_unavailable.png');
    }

    refPic.attr('src', src);
    refPic.attr('class', 'img');

    util.showIdForDetail('#catalogID', 'catalog_id', refrigeratorTypeResultSet, false);
    $('#fridge_list').text(invData.getCount());
}

function refrigeratorsCBFailure(error) {

    console.log('refrigerator_types_detail refrigerators query CB error: ' + error);

}

var display = function() {
    var locale = odkCommon.getPreferredLocale();
    $('#mdl-hdr').text(odkCommon.localizeText(locale, "model"));
    $('#cat-id-hdr').text(odkCommon.localizeText(locale, "catalog_id"));
    $('#mdl-info').text(odkCommon.localizeText(locale, "model_information"));
    $('#man').text(odkCommon.localizeText(locale, "manufacturer"));
    $('#pwr-src').text(odkCommon.localizeText(locale, "power_sources"));
    $('#frig-grs-vol').text(odkCommon.localizeText(locale, "fridge_gross_volume"));
    $('#frz-grs-vol').text(odkCommon.localizeText(locale, "freezer_gross_volume"));
    $('#equip-type').text(odkCommon.localizeText(locale, "equipment_type"));
    $('#clim-zn').text(odkCommon.localizeText(locale, "climate_zone"));
    $('#frig-net-vol').text(odkCommon.localizeText(locale, "fridge_net_volume"));
    $('#frz-net-vol').text(odkCommon.localizeText(locale, "freezer_net_volume"));

    $('#vw-all').text(odkCommon.localizeText(locale, "view_all"));
    $('#frig-txt').text(odkCommon.localizeText(locale, "refrigerators"));

    odkData.getViewData(cbSuccess, cbFailure);

};

function onLinkClick() {

    if (!$.isEmptyObject(refrigeratorTypeResultSet))
    {
        var modelRowIdQueryParams = util.getKeyToAppendToColdChainURL(util.modelRowId, refrigeratorTypeResultSet.get('_id'));
        odkTables.launchHTML(null,
            'config/tables/refrigerators/html/refrigerators_list.html' + modelRowIdQueryParams);
    }
}
