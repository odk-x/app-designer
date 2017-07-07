/* global $, odkTables, odkData, odkCommon */
'use strict';

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
    odkTables.openDetailView(null, tableId, rowId, null);
}

var imgHeight;
var imgWidth;

function showImage(imgPath) {
    var myImage = new Image();
    myImage.name = imgPath;
    myImage.onload = function () {
		imgHeight = this.height;
		imgWidth = this.width;
		return true;
	};
    myImage.src = imgPath;
}

function displayGroup() {
    // Ensure that this is the first displayed in the list
    var mapIndex = geoListResultSet.getMapIndex();
    
    // Make sure that it is valid
    if (mapIndex !== null && mapIndex !== undefined) {
        // Make sure that it is not invalid 
        if (mapIndex !== -1) {
            // Make this the first item in the list
            addDataForRow(mapIndex);
        }
    }

    for (var i = 0; i < geoListResultSet.getCount(); i++) {
        // Make sure not to repeat the selected item if one existed
        if (i === mapIndex) {
            continue;
        }

        addDataForRow(i);
    }
}

function addDataForRow(rowNumber) {
    /*    Creating the item space    */
    var itemHeading = $('<p>');
    itemHeading.text(geoListResultSet.getData(rowNumber, 'Description'));
    itemHeading.attr('class', 'heading');
    
    var detailContainer = $('<div>');
    detailContainer.attr('onclick', 'handleClick(' + rowNumber + ')');
    detailContainer.attr('class', 'detail_container');
    detailContainer.attr('id', 'item_' + rowNumber);
    $(detailContainer).hide();
              
    var lat = geoListResultSet.getData(rowNumber,'Location_latitude');
    var lng = geoListResultSet.getData(rowNumber,'Location_longitude');

    var field1 = $('<p>');
    field1.text('Latitude: ' + lat);
    var field2 = $('<p>');
    field2.text('Longitude: ' + lng);
    
    var uriRelative = geoListResultSet.getData(rowNumber, 'Image.uriFragment');
    var src = '';
    if (uriRelative !== null  && uriRelative !== '') {
        var tableId = geoListResultSet.getTableId();
        var rowId = geoListResultSet.getRowId(rowNumber);
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
