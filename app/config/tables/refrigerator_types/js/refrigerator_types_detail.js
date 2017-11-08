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

    odkData.query('refrigerators', 'model_row_id = ?', [refrigeratorTypeResultSet.get('_id')],
        null, null, null, null, null, null, true, refrigeratorsCBSuccess, refrigeratorsCBFailure);

}

function cbFailure(error) {
    
    console.log('cbFailure: failed with error: ' + error);

}

function refrigeratorsCBSuccess(invData) {

    $('#model_name').text(refrigeratorTypeResultSet.get('model_id'));
    $('#catalog_id').text(refrigeratorTypeResultSet.get('catalog_id'));

    $('#manufacturer').text(refrigeratorTypeResultSet.get('manufacturer'));

    var powerArray = JSON.parse(refrigeratorTypeResultSet.get('power_source'));
    $('#power_sources').text(util.formatDisplayText(powerArray.join(', ')));

    $('#r_gross_vol').text(refrigeratorTypeResultSet.get('refrigerator_gross_volume') + ' m');
    $('#f_gross_vol').text(refrigeratorTypeResultSet.get('freezer_gross_volume') + ' m');

    $('#equipment_type').text(util.formatDisplayText(
        refrigeratorTypeResultSet.get('equipment_type')));
    $('#climate_zone').text(util.formatDisplayText(
        refrigeratorTypeResultSet.get('climate_zone')));
    $('#r_net_vol').text(refrigeratorTypeResultSet.get('refrigerator_net_volume') + ' m');
    $('#f_net_vol').text(refrigeratorTypeResultSet.get('freezer_net_volume') + ' m');

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

    $('#catalogID').text(refrigeratorTypeResultSet.get('catalog_id'));
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
