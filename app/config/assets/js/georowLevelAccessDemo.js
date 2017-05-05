"use strict";

var currentTab = 0;

function display() { 
    updateForTab();
    // set up the click listeners.
    $('#launch-button').on(
            'click',
            function() {
                // Note we're relying on geotagger's list view to be set.
                odkTables.openTable('geoweather open table result',
                    'geoweather',
                    null,
                    null);

            });

    $('#launch-geo-button').on(
            'click',
            function() {
                // Note we're relying on geotagger's list view to be set.
                odkTables.openTable('geotagger open table result',
                    'geotagger',
                    null,
                    null);

            });

    $('#launch-conditions-button').on(
            'click',
            function() {
                // Note we're relying on geotagger's list view to be set.
                odkTables.openTable('geoweather-conditions open table result',
                    'geoweather_conditions',
                    null,
                    null);

            });

	$('#alter-button').on(
			'click',
			function() {
                odkTables.launchHTML('launch change filters result', 'config/assets/changeAccessFilters.html');
            });
    document.getElementById("wrapper").appendChild(followUp);    
}

function updateForTab() {
    var fileUri;
    var tabItem;
    var descriptionDiv = $('#description');
    // Remove all the active-tab classes.
   // $('.tab-item').removeClass('active');
    // Now add the current tab to active and update the description.
    // geotagger
    fileUri = odkCommon.getFileAsUrl(
            'config/assets/img/noaa_weather_nssl0010.jpg');
    descriptionDiv.text('See how row-level access controls work.');
    tabItem = $('#geoweatherTab');

    //$('#appImage').attr('src', fileUri);
    $('body').css('background-image', 'url(' + fileUri + ')');
    // Make the tab highlighted as active.
    tabItem.addClass('active');
}
