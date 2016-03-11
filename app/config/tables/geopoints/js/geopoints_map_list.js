/**
 * This is the file that will be creating the list view.
 */
/* global $, odkTables, data */
/* exported display, handleClick */
'use strict';

// if (JSON.parse(odkCommon.getPlatformInfo()).container === 'Chrome') {
//     console.log('Welcome to Tables debugging in Chrome!');
//     $.ajax({
//         url: odkCommon.getFileAsUrl('output/debug/geopoints_data.json'),
//         async: false,  // do it first
//         success: function(dataObj) {
//             if (dataObj === undefined || dataObj === null) {
//                 console.log('Could not load data json for table: geopoints');
//             }
//             window.data.setBackingObject(dataObj);
//         }
//     });
// }
var geoResult = {};
var tableId = null;
var clientId = null;
function handleClick(rowId) {
    odkTables.openDetailView(
        tableId,
        rowId,
        'config/tables/geopoints/html/geopoints_detail.html');
}

function render(result) {
    // The client id should have been passed to us as the hash.
    var hash = window.location.hash;
    if (hash === '') {
        console.log('The hash containing the client id was not present!');
        console.log('Inferring from table');
        clientId = result.get('client_id');
    } else {
        // The has begins a physical hash. Strip it.
        clientId = hash.substring(1);
        console.log('client id is: ' + clientId);
    }

    if (clientId === null || clientId === '' ||
        clientId === undefined) {
        return;
    }

    geoResult = result;

    tableId = geoResult.getTableId();

    // Ensure that this is the first displayed in the list
    var mapIndex = geoResult.getMapIndex();
    
    // Make sure that it is valid
    if (mapIndex !== null && mapIndex !== undefined) {
        // Make sure that it is not invalid 
        if (mapIndex !== -1) {
            // Make this the first item in the list
            addDataForRow(mapIndex);
        }
    }

    for (var i = 0; i < geoResult.getCount(); i++) {
        // Make sure not to repeat the selected item if one existed
        if (i === mapIndex) {
            continue;
        }

        addDataForRow(i);
    }
}

function addDataForRow(rowNumber) {
    // Creating the item space
    var item = document.createElement('li');
    item.setAttribute('class', 'item_space');
    item.setAttribute(
        'onClick',
        'handleClick("' + geoResult.getRowId(rowNumber) + '")');
    item.innerHTML = clientId;
    document.getElementById('list').appendChild(item);

    var chevron = document.createElement('img');
    chevron.setAttribute(
        'src',
        odkCommon.getFileAsUrl('config/assets/img/little_arrow.png'));
    chevron.setAttribute('class', 'chevron');
    item.appendChild(chevron);

    // create sub-list in item space

    var step = document.createElement('li');
    step.setAttribute('class', 'detail');
    step.innerHTML = 'Step: ' + geoResult.getData(rowNumber, 'step');
    item.appendChild(step);

    var transportation = document.createElement('li');
    transportation.setAttribute('class', 'detail');
    transportation.innerHTML =
        'Transportation: ' +
        geoResult.getData(rowNumber, 'transportation_mode');
    item.appendChild(transportation);
}

function cbFailure(error) {
    console.log('geopoints_map_list: cbFailure failed with error: ' + error);
}


function display() {
    odkData.getViewData(render, cbFailure);
}
