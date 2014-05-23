/**
 * The file for displaying a detail view.
 */
/* global $, control, data */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/femaleClients_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            if (dataObj === undefined || dataObj === null) {
                console.log(
                    'Could not load data json for table: femaleClients');
            }
            window.data.setBackingObject(dataObj);
        }
    });
}

function createFormLauncherForEdit(tableId, formId, rowId, label, element) {
    var formLauncher = document.createElement('p');
    formLauncher.setAttribute('class', 'forms');
    formLauncher.innerHTML = label;
    formLauncher.onclick = function() {
        control.editRowWithSurvey(
                tableId,
                rowId,
                formId,
                null);
    };
    element.appendChild(formLauncher);
}

function createFormLauncherForAdd(tableId, formId, jsonMap, label, element) {
    var formLauncher = document.createElement('p');
    formLauncher.setAttribute('class', 'forms');
    formLauncher.innerHTML = label;
    formLauncher.onclick = function() {
        control.addRowWithSurvey(
                tableId,
                formId,
                null,
                jsonMap);
    };
    element.appendChild(formLauncher);
}

// Displays details about client and links to various forms
function display() {

    // Details - Client id, age, randomization arm
    var clientId = data.get('client_id');
    document.getElementById('title').innerHTML = clientId;
    document.getElementById('age').innerHTML = data.get('age');
    var armText = data.get('randomization');
    if(armText === '1') {
        armText = 'HOPE';
    } else if(armText === '2') {
        armText = 'Control';
    }
    document.getElementById('arm').innerHTML = armText;

    // Creates key-to-value map that can be interpreted by the specified
    // Collect form - to prepopulate forms with client id
    var mapMaleId = JSON.stringify({'_client_id': clientId});

    // Create item that displays links to all female forms when clicked
    var fItem = document.createElement('p');
    fItem.innerHTML = 'Client Forms';
    fItem.setAttribute('class', 'heading');

    var fContainer = document.createElement('div');
    fContainer.setAttribute('class', 'detail_container');

    var homeLocator = document.createElement('p');
    homeLocator.setAttribute('class', 'forms');
    homeLocator.innerHTML = 'Home Locator';
    // When we open the geopoints file, we want to communicate the client id so
    // that the file will know whose data it is displaying. We're going to do
    // this using a hash.
    console.log('in this particularly XXXXXXXXX file!');
    $(homeLocator).click(function() {
        control.openTableToListView(
            'geopoints',
            'client_id = ?',
            [clientId],
            'tables/geopoints/html/geopoints_list.html#' + clientId);
    });
    fContainer.appendChild(homeLocator);

    var rowId = data.getRowId(0);
    console.log('rowId: ' + rowId);
    createFormLauncherForEdit(
            'femaleClients',
            'client6Week',
            rowId,
            'Six Week Follow-Up',
            fContainer);
    createFormLauncherForEdit(
            'femaleClients',
            'client6Month',
            rowId,
            'Six Month Follow-Up',
            fContainer);

    $(fContainer).hide();
    $(fItem).click(function() {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            $(this).addClass('selected');
        }
        $(this).next(fContainer).slideToggle('slow');
    });

    // Create item that displays links to all male forms when clicked
    var mItem = document.createElement('p');
    mItem.innerHTML = 'Partner Forms';
    mItem.setAttribute('class', 'heading');

    var mContainer = document.createElement('div');
    mContainer.setAttribute('class', 'detail_container');
    createFormLauncherForAdd(
            'maleClients',
            'screenPartner',
            mapMaleId,
            'Partner Screening',
            mContainer);
    // TODO: this should be passing the rowId of the entry in the client table,
    // as filtered by the clientId.
    createFormLauncherForEdit(
            'maleClients',
            'partner6Month',
            clientId,
            'Six Month Follow-Up',
            mContainer);

    $(mContainer).hide();
    $(mItem).click(function() {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            $(this).addClass('selected');
        }
        $(this).next(mContainer).slideToggle('slow');
    });

    document.getElementById('wrapper').appendChild(fItem);
    document.getElementById('wrapper').appendChild(fContainer);

    document.getElementById('wrapper').appendChild(mItem);
    document.getElementById('wrapper').appendChild(mContainer);

}

// handles events from html page
function setup() {
    display();
}

$(document).ready(setup);


