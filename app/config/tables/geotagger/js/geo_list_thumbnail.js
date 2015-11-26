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

var geoListThumbResultSet = {};

function cbSuccess(result) {
    geoListThumbResultSet = result;

    displayGroup();

}

function cbFailure(error) {

    console.log('geo_list_thumbnail: cbFailure failed with error: ' + error);
}

function setup() {
    odkData.getViewData(cbSuccess, cbFailure);
}
        
function handleClick(index) {
    var tableId = geoListThumbResultSet.getTableId();
    var rowId = geoListThumbResultSet.getRowId(index);
    odkTables.openDetailView(tableId, rowId, null);
}

function displayGroup() {
    for (var i = 0; i < geoListThumbResultSet.getCount(); i++) {
        /*    Creating the item space    */
        var itemHeading = $('<div>');
        var headingText = $('<p>');
        headingText.text(geoListThumbResultSet.getData(i, 'Description'));
        itemHeading.attr('class', 'heading');
        
        var uriRelative = geoListThumbResultSet.getData(i, 'Image.uriFragment');
        var src = '';
        if (uriRelative !== null && uriRelative !== '') {
            var uriAbsolute = odkCommon.getRowFileAsUrl(geoListThumbResultSet.getTableId(), geoListThumbResultSet.getRowId(i), uriRelative);
            src = uriAbsolute;
        }

        var thumbnail = $('<img>');
        thumbnail.attr('src', src);
        thumbnail.attr('class', 'thumbnail');
        var buffer = $('<p>');
        buffer.attr('class', 'clear');
        itemHeading.append(thumbnail);
        itemHeading.append(headingText);
        itemHeading.append(buffer);
        
        var detailContainer = $('<div>');
        detailContainer.attr('onclick', 'handleClick(' + i + ')');
        detailContainer.attr('class', 'detail_container');
        detailContainer.attr('id', 'item_' + i);
        $(detailContainer).hide();
                  
        var lat = geoListThumbResultSet.getData(i,'Location_latitude');
        var lng = geoListThumbResultSet.getData(i,'Location_longitude');

        var field1 = $('<p>');
        field1.text('Latitude: ' + lat);
        var field2 = $('<p>');
        field2.text('Longitude: ' + lng);

        detailContainer.append(field1);
        detailContainer.append(field2);
        
        $(itemHeading).click(function()
        {
            if($(this).hasClass('selected')) {
                $(this).removeClass('selected');
            } else {
                $(this).addClass('selected');
            }
            $(this).next(detailContainer).slideToggle('fast');
        });
        
        $('#wrapper').append(itemHeading);
        $('#wrapper').append(detailContainer);
    }
}
