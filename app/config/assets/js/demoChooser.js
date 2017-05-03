"use strict";

var currentTab = 0;

// define a callback handler
// this doesn't need to return anything.
// we register it (at the bottom of the file)
//
// The framework will call this asynchronously 
// when a result is available. It does not call it
// if there is already a result available. You 
// should call this once after you are initialized
// to process any queued results.
function doActionCallback() {
   var action = odkCommon.viewFirstQueuedAction();
   if ( action !== null ) {
	  // process action -- be idempotent!
	  // if processing fails, the action will still
	  // be on the queue.
	  odkCommon.removeFirstQueuedAction();
   }
}

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
                    odkTables.launchHTML('launch result teatime.html', 'config/assets/teatime.html');
                } else if (currentTab === 1) {
                    odkTables.launchHTML('launch result hope.html', 'config/assets/hope.html');
                } else if (currentTab === 2) {
                    odkTables.launchHTML('launch result plotter.html', 'config/assets/plotter.html');
                } else if (currentTab === 3) {
                    // Note we're relying on geotagger's list view to be set.
                    odkTables.openTable('openTable result geotagger',
                        'geotagger',
                        null,
                        null);
                } else if (currentTab === 4) {
                    odkTables.launchHTML('launch result jgiIndex.html', 'config/assets/jgiIndex.html');
                } else {
                    console.log('trouble, unrecognized tab');
                }
            });

	// we are initialized -- 
	// process any queued results.
	doActionCallback();
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
        fileUri = odkCommon.getFileAsUrl('config/assets/img/teaBackground.jpg');
        descriptionDiv.text('Explore the hottest fictional tea houses in Benin.');
        descriptionDiv.attr('class','description-text-white');
        tabItem = $('#teaTimeTab');
    } else if (tab === 1) {
        // Hope study
        fileUri = odkCommon.getFileAsUrl('config/assets/img/hopePic.JPG');
        descriptionDiv.text('View the app used by healthcare workers for over eight months to track subjects in a study on HIV discordant couples.');
        descriptionDiv.attr('class','description-text-white');
        tabItem = $('#hopeTab');
    } else if (tab === 2) {
        // Plotter
        fileUri = odkCommon.getFileAsUrl(
                'config/assets/img/Agriculture_in_Malawi_by_Joachim_Huber_CClicense.jpg');
        descriptionDiv.text('Review records of plot visits and monitor their progress.');
        descriptionDiv.attr('class','description-text-black');
        tabItem = $('#plotterTab');
    } else if (tab === 3) {
        // geotagger
        fileUri = odkCommon.getFileAsUrl(
                'config/assets/img/spaceNeedle_CCLicense_goCardUSA.jpg');
        descriptionDiv.text('See sites around Seattle plotted using Google maps.');
        descriptionDiv.attr('class','description-text-white');
        tabItem = $('#geotaggerTab');
    } else if (tab === 4) {
        // scan
        fileUri = odkCommon.getFileAsUrl(
                'config/assets/img/chimp.png');
        descriptionDiv.text('Follow a troop of chimps through the jungle.');
        descriptionDiv.attr('class','description-text-black');
        tabItem = $('#jgiTab');
    } else {
        console.log('unrecognized tab index: ' + tab);
    }
    //$('#appImage').attr('src', fileUri);
    $('body').css('background-image', 'url(' + fileUri + ')');
    // Make the tab highlighted as active.
    tabItem.addClass('active');
}

// register the callback handler
if ( !odkCommon.hasListener() ) {
   odkCommon.registerListener(doActionCallback);
}


