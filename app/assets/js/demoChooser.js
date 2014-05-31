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

    $('#appImage').on(
            'click',
            function() {
                if (currentTab === 0) {
                    alert('time for tea!');
                } else if (currentTab === 1) {
                    alert('hope!');
                } else if (currentTab === 2) {
                    alert('I am plotting something');
                } else {
                    console.log('trouble, unrecognized tab');
                }
            });
}



function updateForTab(tab) {
    var fileUri;
    var tabItem;
    // Remove all the active-tab classes.
    $('.tab-item').removeClass('active');
    // Now add the current tab to active.
    if (tab === 0) {
        fileUri = control.getFileAsUrl('assets/img/teaBackground.jpg');
        tabItem = $('#teaTimeTab');
    } else if (tab === 1) {
        fileUri = control.getFileAsUrl('/assets/img/form_logo.png');
        tabItem = $('#hopeTab');
    } else if (tab === 2) {
        fileUri = control.getFileAsUrl(
                'assets/img/Agriculture_in_Malawi_by_Joachim_Huber_CClicense.jpg');
        tabItem = $('#plotterTab');
    } else {
        console.log('unrecognized tab index: ' + tab);
    }
    $('#appImage').attr('src', fileUri);
    // Make the tab highlighted as active.
    tabItem.addClass('active');
}
