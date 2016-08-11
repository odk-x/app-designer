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

    $('#model_name').text(refrigeratorTypeResultSet.get('model_id'));
    $('#catalog_id').text(refrigeratorTypeResultSet.get('catalog_id'));

    $('#manufacturer').text(refrigeratorTypeResultSet.get('manufacturer'));
    var powerArray = JSON.parse(refrigeratorTypeResultSet.get('power_source'));
    $('#power_sources').text(util.formatDisplayText(powerArray.toString()));
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
}

function cbFailure(error) {
    
    console.log('cbFailure: failed with error: ' + error);

}

var display = function() {

    odkData.getViewData(cbSuccess, cbFailure);

};

