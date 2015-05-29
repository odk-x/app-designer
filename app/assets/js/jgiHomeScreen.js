/* global control */
'use strict';

var urls = require('./jgiUrls');
function display() {
    $('#begin-follow-button').on('click', function() {
        control.launchHTML('assets/newFollow.html');
    });

   $('#existing-follow-button').on('click', function() {
        var queryParams = urls.createParamsForIsReview(false);
        var url = control.getFileAsUrl(
            'assets/followList.html' + queryParams
        );
        window.location.href = url;
        //control.launchHTML('assets/followList.html');
    });
    $('#review-follow-button').on('click', function() {
        var queryParams = urls.createParamsForIsReview(true);
        var url = control.getFileAsUrl(
            'assets/followList.html' + queryParams
        );
        window.location.href = url;
       // control.launchHTML('assets/followList.html');
    });

    // Set up the background image.
    // First we need the url as parsed by the ODK framework so that it works
    // in both the browser and on the device.
    var fileUri = control.getFileAsUrl('assets/img/chimp.png');
    $('body').css('background-image', 'url(' + fileUri + ')');

}
