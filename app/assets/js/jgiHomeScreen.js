/* global control */
'use strict';

function display() {
    $('#begin-follow-button').on('click', function() {
        control.launchHTML('assets/newFollow.html');
    });

    $('#existing-follow-button').on('click', function() {
        //alert('Not yet implemented');
        control.launchHTML('assets/followScreen.html');
    });

    // Set up the background image.
    // First we need the url as parsed by the ODK framework so that it works
    // in both the browser and on the device.
    var fileUri = control.getFileAsUrl('assets/img/chimp.png');
    $('body').css('background-image', 'url(' + fileUri + ')');

}
