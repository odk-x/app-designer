/* global odkTables */
'use strict';

function display() {
    $('#begin-follow-button').on('click', function() {
        odkTables.launchHTML('config/assets/newFollow.html');
    });

    $('#existing-follow-button').on('click', function() {
        //alert('Not yet implemented');
        odkTables.launchHTML('config/assets/followScreen.html');
    });

    // Set up the background image.
    // First we need the url as parsed by the ODK framework so that it works
    // in both the browser and on the device.
    var fileUri = odkCommon.getFileAsUrl('config/assets/img/chimp.png');
    $('body').css('background-image', 'url(' + fileUri + ')');

}
