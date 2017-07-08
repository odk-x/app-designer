"use strict";

var currentTab = 0;

function display() { 
    updateForTab(currentTab);
    // set up the click listeners.
    $('#coldChainTab').on('click', function() {
        currentTab = 0;
        updateForTab(currentTab);
    });
    $('#geoWeatherTab').on('click', function() {
        currentTab = 1;
        updateForTab(currentTab);
    });

    $('#launch-button').on(
            'click',
            function() {
                if (currentTab === 0) {
                    odkTables.launchHTML(null,'config/assets/coldchaindemo.html');
                } else if (currentTab === 1) {
                    odkTables.launchHTML(null,'config/assets/rowlevelaccessdemo.html');
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
        // Cold Chain Demo
        fileUri = odkCommon.getFileAsUrl('config/assets/img/hallway.jpg');
        descriptionDiv.text('Cold Chain Management');
        descriptionDiv.attr('class','description-text-white');
        tabItem = $('#coldChainTab');
    } else if (tab === 1) {
        // Weather study
        fileUri = odkCommon.getFileAsUrl('config/assets/img/20160902_sky.JPG');
        descriptionDiv.text('Weather');
        descriptionDiv.attr('class','description-text-white');
        tabItem = $('#geoWeatherTab');
    } else {
        console.log('unrecognized tab index: ' + tab);
    }
    //$('#appImage').attr('src', fileUri);
    $('body').css('background-image', 'url(' + fileUri + ')');
    // Make the tab highlighted as active.
    tabItem.addClass('active');
}
