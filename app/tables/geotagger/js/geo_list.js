/* global $, control, data */
'use strict';

if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/geotagger_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            window.data.setBackingObject(dataObj);
        }
    });
}

function setup() {
    displayGroup();
}
        
function handleClick(index) {
    var tableId = data.getTableId();
    var rowId = data.getRowId(index);
    control.openDetailView(tableId, rowId, null);
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
    for (var i = 0; i < data.getCount(); i++) {
        /*    Creating the item space    */
        var itemHeading = $('<p>');
        itemHeading.text(data.getData(i, 'Description'));
        itemHeading.attr('class', 'heading');
        
        var detailContainer = $('<div>');
        detailContainer.attr('onclick', 'handleClick(' + i + ')');
        detailContainer.attr('class', 'detail_container');
        detailContainer.attr('id', 'item_' + i);
        $(detailContainer).hide();
                  
        var lat = data.getData(i,'Location_latitude');
        var lng = data.getData(i,'Location_longitude');

        var field1 = $('<p>');
        field1.text('Latitude: ' + lat);
        var field2 = $('<p>');
        field2.text('Longitude: ' + lng);
        
        var srcMimeUri = data.getData(i, 'Image');
        var src = '';
        if (srcMimeUri !== null  && srcMimeUri !== "") {
            var mimeUriObject = JSON.parse(srcMimeUri);
            var uriRelative = mimeUriObject.uriFragment;
            var uriAbsolute = control.getFileAsUrl(uriRelative);
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
