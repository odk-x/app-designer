/* global alert */
'use strict';

// For the JGI Home Screen, but to be used with browserify.

var db = require('./jgiDb');
var $ = require('jquery');
var util = require('./jgiUtil');
var urls = require('./jgiUrls');

exports.initializeListeners = function(control) {
  var $mostRecentFollow = $('#most-recent-follow-button');
  $mostRecentFollow.click(function() {
    console.log('clicked most recent');
    var follows = db.getAllFollows(control);
    
    if (follows.length === 0) {
      alert('No Follows!');
      return;
    }

    util.sortFollows(follows);

    var mostRecentFollow = follows[follows.length - 1];

    var intervals = db.getFollowIntervalsForFollow(
        control,
        mostRecentFollow.date,
        mostRecentFollow.focalId
    );

    if (intervals.length === 0) {
      alert('No observations yet recorded for the latest Follow');
      return;
    }

    util.sortFollowIntervals(intervals);
    var lastInterval = intervals[intervals.length - 1];

    var queryParams = urls.createParamsForFollow(
        lastInterval.date,
        lastInterval.beginTime,
        lastInterval.focalId
    );

    control.launchHTML('assets/followScreen.html' + queryParams);
  });

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

};

exports.initializeUi = function(control) {
  exports.initializeListeners(control);
};
