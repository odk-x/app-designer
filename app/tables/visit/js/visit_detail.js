/**
 * The file for displaying a detail view.
 */
/* global $, control */
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
    var BUG_EARWORM = 'earmworm';
    var BUG_STINK = 'stink_bug';
    var BUG_BEETLE = 'beetle';
    var BUG_CUTWORM = 'cutworm';
    // Perform your modification of the HTML page here and call display() in
    // the body of your .html file.
    $('#DATE').text(data.get('date'));
    // Get the plant health.
    var ph = data.get('plantHealth');
    if (ph === PH_GOOD) {
        $('#plant-health-good').attr('checked', true);
    } else if (ph === PH_FAIR) {
        $('#plant-health-fair').attr('checked', true);
    } else if (ph === PH_BAD) {
        $('#plan-health-bad').attr('checked', true);
    } else {
        console.log('unrecognized plant health: ' + ph);
    }

    // Now do the soil.
    var soil = data.get('soil');
    if (soil === SOIL_MEDIUM_SAND) {
        $('#medium-sand').attr('checked', true);
    } else if (soil === SOIL_FINE_SAND) {
        $('#fine_sand').attr('checked', true);
    } else if (soil === SOIL_SANDY_LOAM) {
        $('#sandy_loam').attr('checked', true);
    } else if (soil === SOIL_LOAM) {
        $('#loam').attr('checked', true);
    } else {
        console.log('unrecognized soil type: ' + soil);
    }

    // Now do the bugs.
    var bugs = data.get('bugs');
    if (bugs !== undefined) {
        bugs = bugs.split(',');
        if (bugs.indexOf(BUG_EARWORM) > 0) {
            $('#bugs-lady').attr('checked', true);
        }
        if (bugs.indexOf(BUG_STINK) > 0) {
            $('#bugs-stick').attr('checked', true);
        }
        if (bugs.indexOf(BUG_BEETLE) > 0) {
            $('#bugs-beetle').attr('checked', true);
        }
        if (bugs.indexOf(BUG_CUTWORM) > 0) {
            $('#bugs-cutworm').attr('checked', true);
        }
    }

    $('#observations').text(data.get('observations'));
}

