/**
 * This is the file that will be creating the list view.
 */
/* global $, control, data */
/* exported display, handleClick */
'use strict';

if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/geopoints_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            if (dataObj === undefined || dataObj === null) {
                console.log('Could not load data json for table: geopoints');
            }
            window.data.setBackingObject(dataObj);
        }
    });
}

function handleClick(rowId) {
    control.openDetailView(
        data.getTableId(),
        rowId,
        'tables/geopoints/html/geopoints_detail.html');
}

function display() {

    // The client id should have been passed to us as the hash.
    var hash = window.location.hash;
    var clientId = null;
    if (hash === '') {
        console.log('The hash containing the client id was not present!');
        console.log('Inferring from table');
        clientId = data.get('client_id');
    } else {
        // The has begins a physical hash. Strip it.
        clientId = hash.substring(1);
        console.log('client id is: ' + clientId);
    }

    // Create item to launch map view display
    //var mapView = document.createElement('p');
    //mapView.setAttribute('class', 'launchForm');
    //mapView.innerHTML = 'Map View';
    //mapView.style.backgroundColor = '#66A3C2';
    //mapView.onclick = function() {
        //control.openTableToMapView(
                //'geopoints',
                //'client_id = ?',
                //[clientId],
                //'tables/geopoints/html/geopoints_map_list.html#' + clientId);
    //};
    //document.getElementById('header').appendChild(mapView);

    //// Create item to launch geo point form
    //var waypoint = document.createElement('p');
    //waypoint.setAttribute('class', 'launchForm');
    //var jsonMap = {};
    //// Prepopulate client id
    //jsonMap._client_id = clientId;
    //// Add step every time you launch waypoint form
    //jsonMap._step = data.getCount() + 1;
    //jsonMap = JSON.stringify(jsonMap);

    //waypoint.onclick = function() {
        //data.addRowWithSurvey(
                //'geopoints',
                //'geopoints',
                //null,
                //jsonMap);
    //};
    //waypoint.innerHTML = 'Add Waypoint';
    //document.getElementById('header').appendChild(waypoint);

    for (var i = 0; i < data.getCount(); i++) {

        // Make list entry only if client id exists
        if(clientId !== null && clientId !== '') {
            // Creating the item space
            var item = document.createElement('li');
            item.setAttribute('class', 'item_space');
            item.setAttribute(
                'onClick',
                'handleClick("' + data.getRowId(i) + '")');
            item.innerHTML = clientId;
            document.getElementById('list').appendChild(item);

            var chevron = document.createElement('img');
            chevron.setAttribute(
                'src',
                '../../../assets/img/little_arrow.png');
            chevron.setAttribute('class', 'chevron');
            item.appendChild(chevron);

            // create sub-list in item space

            var step = document.createElement('li');
            step.setAttribute('class', 'detail');
            step.innerHTML = 'Step: ' + data.getData(i, 'step');
            item.appendChild(step);

            var transportation = document.createElement('li');
            transportation.setAttribute('class', 'detail');
            transportation.innerHTML =
                'Transportation: ' +
                data.getData(i, 'transportation_mode');
            item.appendChild(transportation);
        }
    }
}
