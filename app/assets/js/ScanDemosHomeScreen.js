/* global control */
'use strict';

function display() {
    $('#immunization-demo-button').on('click', function() {
        control.launchHTML('assets/immunizationDemo.html');
    });

    $('#register-demo-button').on('click', function() {
        alert('Not yet implemented');
    });

    // Set up the background image.
    // First we need the url as parsed by the ODK framework so that it works
    // in both the browser and on the device.
    var fileUri = control.getFileAsUrl('assets/img/odkScanPic.jpg');
    $('body').css('background-image', 'url(' + fileUri + ')');

}
