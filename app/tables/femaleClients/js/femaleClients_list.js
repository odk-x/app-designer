/**
 * This is the file that will be creating the list view.
 */
/* global $, control, data */
/*exported display, handleClick, getResults */
'use strict';

if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/femaleClients_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            if (dataObj === undefined || dataObj === null) {
                console.log('Could not load data json for table: femaleClients');
            }
            window.data.setBackingObject(dataObj);
        }
    });
}

/** Handles clicking on a list item. Applied via a string. */
function handleClick(index) {
    control.openDetailView(
            data.getTableId(),
            index,
            'tables/femaleClients/html/femaleClients_detail.html');
}

// filters list view by client id entered by user
function getResults() {
    var searchText = document.getElementById('search').value;
    var searchData = control.query(
            'femaleClients',
            'client_id = ?',
            [searchText]);
    if(searchData.getCount() > 0) {
        // open filtered list view if client found
        control.openTableToListView(
                'femaleClients',
                'client_id = ?',
                [searchText],
                '/tables/FemaleClients/html/femaleClients_list.html');
    } else {
        // open 'client not found' page
        control.openTableToListView(
                'femaleClients',
                null,
                null,
                'assets/clients_not_found_list.html');
    }
}

// displays list view of clients
function display() {

    // create button that adds enrolled client to the system - launches mini
    // 'add client' form
    var addClient = document.createElement('p');
    addClient.onclick = function() {
        control.addRowWithSurvey(
                'femaleClients',
                'addClient',
                null,
                null);
    };
    addClient.setAttribute('class', 'launchForm');
    addClient.innerHTML = 'Add Client';
    document.getElementById('searchBox').appendChild(addClient);

    /* create button that launches graph display */
    var graphView = document.createElement('p');
    graphView.onclick = function() {
        control.openTableToListView(
                'femaleClients',
                null,
                null,
                'tables/femaleClients/html/graph_view.html');
    };
    graphView.setAttribute('class', 'launchForm');
    graphView.innerHTML = 'Graph View';
    document.getElementById('searchBox').appendChild(graphView);

    for (var i = 0; i < data.getCount(); i++) {

        var clientId = data.getData(i, 'client_id');
        var ageEntered = data.getData(i, 'age');
        var armText = data.getData(i, 'randomization');

        // make list entry only if client id, age, randomization arm exists
        if (clientId !== null &&
            clientId !== '' &&
            ageEntered !== null &&
            ageEntered !== '' &&
            armText !== null &&
            armText !== '') {
            /*    Creating the item space    */
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
            //  Age information
            var age = document.createElement('li');
            age.setAttribute('class', 'detail');
            age.innerHTML = 'Age: ' + ageEntered;
            item.appendChild(age);

            //  Randomization Arm
            var arm = document.createElement('li');
            arm.setAttribute('class', 'detail');
            if(armText === '1') {
                armText = 'HOPE';
            } else if(armText === '2') {
                armText = 'Control';
            }
            arm.innerHTML = 'Randomization: ' + armText;
            item.appendChild(arm);
        }
    }
}
