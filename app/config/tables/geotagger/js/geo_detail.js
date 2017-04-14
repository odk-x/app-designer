/* global $, odkTables */
'use strict';

// if (JSON.parse(odkCommon.getPlatformInfo()).container === 'Chrome') {
//     console.log('Welcome to Tables debugging in Chrome!');
//     $.ajax({
//         url: odkCommon.getFileAsUrl('output/debug/geotagger_data.json'),
//         async: false,  // do it first
//         success: function(dataObj) {
//             window.data.setBackingObject(dataObj);
//         }
//     });
// }
var geoDetailResultSet = {};

function cbSuccess(result) {
    geoDetailResultSet = result;
    
    display();
}

function cbFailure(error) {

    console.log('geo_detail: cbFailure failed with error: ' + error);
}

function display() {
    var uriRelative = geoDetailResultSet.get('Image.uriFragment');
    var src = '';
    if (uriRelative !== null && uriRelative !== '') {
        var uriAbsolute = odkCommon.getRowFileAsUrl(geoDetailResultSet.getTableId(), geoDetailResultSet.getRowId(0), uriRelative);
        src = uriAbsolute;
    }

    var body = document.getElementById('main');
    body.style.background = 'url(' + src + ')';

    document.getElementById('TITLE').innerHTML = geoDetailResultSet.get('Description');

    var lat = geoDetailResultSet.get('Location_latitude');
    var lng = geoDetailResultSet.get('Location_longitude');
    document.getElementById('FIELD_1').innerHTML = lat;
    document.getElementById('FIELD_2').innerHTML = lng;

}

function setup() {

    odkData.getViewData(cbSuccess, cbFailure);
}
