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

var geoListResultSet = {};

function cbSuccess(result) {
    geoListResultSet = result;

    displayGroup();
}

function cbFailure(error) {
    console.log('gelo_list: cbFailure failed with error: ' + error);
}

function setup() {
    odkData.getViewData(cbSuccess, cbFailure);
}
        
function handleClick(index) {
    var tableId = geoListResultSet.getTableId();
    var rowId = geoListResultSet.getRowId(index);
    odkTables.openDetailView(tableId, rowId, null);
}

var imgHeight;
var imgWidth;

function adjustDimensions() {
    imgHeight = this.height;
    imgWidth = this.width;
    return true;
}

function showImage(imgPath) {
    var myImage = new Image();
    myImage.name = imgPath;
    myImage.onload = adjustDimensions;
    myImage.src = imgPath;
}

function displayGroup() {
    for (var i = 0; i < geoListResultSet.getCount(); i++) {
        /*    Creating the item space    */
        var itemHeading = $('<p>');
        itemHeading.text(geoListResultSet.getData(i, 'Description'));
        itemHeading.attr('class', 'heading');
        
        var detailContainer = $('<div>');
        detailContainer.attr('onclick', 'handleClick(' + i + ')');
        detailContainer.attr('class', 'detail_container');
        detailContainer.attr('id', 'item_' + i);
        $(detailContainer).hide();
                  
        var lat = geoListResultSet.getData(i,'Location_latitude');
        var lng = geoListResultSet.getData(i,'Location_longitude');

        var field1 = $('<p>');
        field1.text('Latitude: ' + lat);
        var field2 = $('<p>');
        field2.text('Longitude: ' + lng);
        
        var uriRelative = geoListResultSet.getData(i, 'Image.uriFragment');
        var src = '';
        if (uriRelative !== null  && uriRelative !== '') {
            var tableId = geoListResultSet.getTableId();
            var rowId = geoListResultSet.getRowId(i);
            var uriAbsolute = odkCommon.getRowFileAsUrl(tableId, rowId, uriRelative);
            src = uriAbsolute;
        }

        var thumbnail = $('<img>');
        thumbnail.attr('src', src);
        thumbnail.attr('class', 'thumbnail');
        var buffer = $('<p>');
        buffer.attr('class', 'clear');

        detailContainer.append(thumbnail);
        detailContainer.append(field1);
        detailContainer.append(field2);
        detailContainer.append(buffer);
        
        $(itemHeading).click(function()
        {
            if($(this).hasClass('selected')) {
                $(this).removeClass('selected');
            } else {
                $(this).addClass('selected');
            }
            $(this).next(detailContainer).slideToggle('slow');
        });
        
        $('#wrapper').append(itemHeading);
        $('#wrapper').append(detailContainer);
    }
}
