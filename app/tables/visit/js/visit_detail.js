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
    var PH_GOOD = 'good';
    var PH_FAIR = 'ok';
    var PH_BAD = 'bad';
    var SOIL_WET = 'wet';
    var SOIL_DRY = 'dry';
    var BUG_LADY = 'lady';
    var BUG_STICK = 'stick';
    var BUG_BEETLE = 'beetle';
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
    if (soil === SOIL_WET) {
        $('#soil-wet').attr('checked', true);
    } else if (soil === SOIL_DRY) {
        $('#soil-dry').attr('checked', true);
    } else {
        console.log('unrecognized soil type: ' + soil);
    }

    // Now do the bugs.
    var bugs = data.get('bugs');
    if (bugs !== undefined) {
        bugs = bugs.split(',');
        if (bugs.indexOf(BUG_LADY) > 0) {
            $('#bugs-lady').attr('checked', true);
        }
        if (bugs.indexOf(BUG_STICK) > 0) {
            $('#bugs-stick').attr('checked', true);
        }
        if (bugs.indexOf(BUG_BEETLE) > 0) {
            $('#bugs-beetle').attr('checked', true);
        }
    }

    $('#observations').text(data.get('observations'));
}

