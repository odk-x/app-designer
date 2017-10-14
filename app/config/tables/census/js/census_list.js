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
    var divPanel = $('<div>');

    var divPanelBody = $('<div>');
    divPanelBody.attr('class', 'panel-body');

    var divParentRow = $('<div>');
    divParentRow.attr('class', 'row');


    var divCol1 = $('<div>');
    divCol1.attr('class','col-xs-3');


    var img = $('<img>');
    img.attr('class','img-responsive');
    var selected = geoListResultSet.getData(rowNumber, 'selected');
    var exclude = geoListResultSet.getData(rowNumber, 'exclude');

    if(exclude === 1) {
        img.attr('src','../../../assets/img/ic_excluded.png');
        divPanel.attr('class', 'panel panel-default');
    } else if(selected === 1000) {
        img.attr('src','../../../assets/img/ic_main.png');
        divPanel.attr('class', 'panel panel-primary');
    } else if(selected === 100) {
        img.attr('src','../../../assets/img/ic_additional.png');
        divPanel.attr('class', 'panel panel-primary');
    } else if (selected === 10) {
        img.attr('src','../../../assets/img/ic_alternate.png');
        divPanel.attr('class', 'panel panel-primary');
    } else {
        img.attr('src','../../../assets/img/ic_not_selected.png');
        divPanel.attr('class', 'panel panel-default');
    }
    
    var divCol2 = $('<div>');
    divCol2.attr('class','col-xs-9');

    var dl = $('<dl>');

    var dt = $('<dt>');
    dt.html(geoListResultSet.getData(rowNumber, 'head_name'));

    var dd1 = $('<dd>');
    dd1.html('House No: ' + geoListResultSet.getData(rowNumber, 'house_number'));

    var dd2 = $('<dd>');
    dd2.html(geoListResultSet.getData(rowNumber, 'comment'));

    dl.append(dt)
    dl.append(dd1);
    dl.append(dd2);

    divCol2.append(dl);

    divCol1.append(img);

    divParentRow.append(divCol1);
    divParentRow.append(divCol2);

    divPanelBody.append(divParentRow);
    divPanel.append(divPanelBody);

    $('#wrapper').append(divPanel);
}

$(document).ready(function() {
    setup();
});