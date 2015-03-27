/**
 * The file for displaying a detail view.
 */
/* global $, control, data */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/visit_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            if (dataObj === undefined || dataObj === null) {
                console.log('Could not load data json for table: visit');
            }
            window.data.setBackingObject(dataObj);
        }
    });
}
 
function display() {
    // We don't want any of the input elements to be editable.
    $('input').attr('disabled', true);
    var PH_GOOD = 'good';
    var PH_FAIR = 'fair';
    var PH_BAD = 'bad';
    var SOIL_MEDIUM_SAND = 'medium_sand';
    var SOIL_FINE_SAND = 'fine_sand';
    var SOIL_SANDY_LOAM = 'sandy_loam';
    var SOIL_LOAM = 'loam';
    var BUG_EARWORM = 'earworm';
    var BUG_STINK = 'stink_bug';
    var BUG_BEETLE = 'beetle';
    var BUG_CUTWORM = 'cutworm';
    // Perform your modification of the HTML page here and call display() in
    // the body of your .html file.

    var plotId = data.get('plot_id');

    var plots = control.query(
        'plot',
        '_id = ?',
        [plotId]);

    var plotName = plots.get('plot_name');

    $('#plot-name').text(plotName);
    $('#plant-height').text(data.get('plant_height'));
    // We need to fiddle with the date a little bit to get back a more
    // human-readable value.
    var displayDate = data.get('date');
    if (displayDate !== null && displayDate !== undefined) {
        displayDate = displayDate.substring(0, 10);
    }
    $('#DATE').text(displayDate);

    // Get the plant health.
    var ph = data.get('plant_health');
    if (ph === PH_GOOD) {
        $('#plant-health-good').attr('checked', true);
    } else if (ph === PH_FAIR) {
        $('#plant-health-fair').attr('checked', true);
    } else if (ph === PH_BAD) {
        $('#plant-health-bad').attr('checked', true);
    } else {
        console.log('unrecognized plant health: ' + ph);
    }

    // Now do the soil.
    var soil = data.get('soil');
    if (soil === SOIL_MEDIUM_SAND) {
        $('#medium-sand').attr('checked', true);
    } else if (soil === SOIL_FINE_SAND) {
        $('#fine-sand').attr('checked', true);
    } else if (soil === SOIL_SANDY_LOAM) {
        $('#sandy-loam').attr('checked', true);
    } else if (soil === SOIL_LOAM) {
        $('#loam').attr('checked', true);
    } else {
        console.log('unrecognized soil type: ' + soil);
    }

    // Now do the pests.
    var bugs = data.get('pests');
	var bugArray = (bugs !== null && bugs !== undefined) ? JSON.parse(bugs) : [];
	for ( var i = 0 ; i < bugArray.length ; ++i ) {
		var bug = bugArray[i];
        if (bug===BUG_EARWORM) {
            $('#bugs-earworm').attr('checked', true);
        }
        if (bug===BUG_STINK) {
            $('#bugs-stink').attr('checked', true);
        }
        if (bug===BUG_BEETLE) {
            $('#bugs-beetle').attr('checked', true);
        }
        if (bug===BUG_CUTWORM) {
            $('#bugs-cutworm').attr('checked', true);
        }
    }

    $('#observations').text(data.get('observations'));
}

