/* global $, odkData */
'use strict';


var cbSuccess = function (result) {

    $('#NAME').text(result.get('obj_name'));

    $('#desc').text(result.get('description'));

    $('#lat').text(result.get('location_latitude'));
    $('#long').text(result.get('location_longitude'));

    $('#quantity').text(result.get('quantity'));
    $('#price').text(result.get('price'));

    $('#scancode').text(result.get('scancode'));
    $('#asOfDate').text(result.get('as_of_date'));

};

var cbFailure = function (error) {
    console.log('display failed with error: ' + error);
};

var display = function() {
    odkData.getViewData(cbSuccess, cbFailure);
};
