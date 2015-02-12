"use strict";

var currentTab = 0;

function display() { 
    updateForTab(currentTab);
    // set up the click listeners.
    $('#teaTimeTab').on('click', function() {
        currentTab = 0;
        updateForTab(currentTab);
    });
    $('#hopeTab').on('click', function() {
        currentTab = 1;
        updateForTab(currentTab);
    });
    $('#plotterTab').on('click', function() {
        currentTab = 2;
        updateForTab(currentTab);
    });
    $('#geotaggerTab').on('click', function() {
        currentTab = 3;
        updateForTab(currentTab);
    });
    $('#jgiTab').on('click', function() {
        currentTab = 4;
        updateForTab(currentTab);
    });

    $('#launch-button').on(
            'click',
            function() {
                if (currentTab === 0) {
                    control.launchHTML('assets/teatime.html');
                } else if (currentTab === 1) {
                    control.launchHTML('assets/hope.html');
                } else if (currentTab === 2) {
                    control.launchHTML('assets/plotter.html');
                } else if (currentTab === 3) {
                    // Note we're relying on geotagger's list view to be set.
                    control.openTable(
                        'geotagger',
                        null,
                        null);
                } else if (currentTab === 4) {
                    control.launchHTML('assets/jgiIndex.html');
                } else {
                    console.log('trouble, unrecognized tab');
                }
            });
}

function updateForTab(tab) {
    var fileUri;
    var tabItem;
    var descriptionDiv = $('#description');
    // Remove all the active-tab classes.
    $('.tab-item').removeClass('active');
    // Now add the current tab to active and update the description.
    if (tab === 0) {
        // Tea time in benin
        fileUri = control.getFileAsUrl('assets/img/teaBackground.jpg');
        descriptionDiv.text('Explore the hottest fictional tea houses in Benin.');
        tabItem = $('#teaTimeTab');
    } else if (tab === 1) {
        // Hope study
        fileUri = control.getFileAsUrl('/assets/img/hopePic.JPG');
        descriptionDiv.text('View the app used by healthcare workers for over eight months to track subjects in a study on HIV discordant couples.');
        tabItem = $('#hopeTab');
    } else if (tab === 2) {
        // Plotter
        fileUri = control.getFileAsUrl(
                'assets/img/Agriculture_in_Malawi_by_Joachim_Huber_CClicense.jpg');
        descriptionDiv.text('Review records of plot visits and monitor their progress.');
        tabItem = $('#plotterTab');
    } else if (tab === 3) {
        // geotagger
        fileUri = control.getFileAsUrl(
                'assets/img/spaceNeedle_CCLicense_goCardUSA.jpg');
        descriptionDiv.text('See sites around Seattle plotted using Google maps.');
        tabItem = $('#geotaggerTab');
    } else if (tab === 4) {
        // scan
        fileUri = control.getFileAsUrl(
                'assets/img/chimp.png');
        descriptionDiv.text('Follow a troop of chimps through the jungle.');
        tabItem = $('#jgiTab');
    } else {
        console.log('unrecognized tab index: ' + tab);
    }
    //$('#appImage').attr('src', fileUri);
    $('body').css('background-image', 'url(' + fileUri + ')');
    // Make the tab highlighted as active.
    tabItem.addClass('active');
}
