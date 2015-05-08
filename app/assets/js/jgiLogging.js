'use strict';

var $ = require('jquery');
var urls = require('./jgiUrls');


exports.DO_LOGGING = true;


exports.getFollowRepresentation = function() {
  var followDate = urls.getFollowDateFromUrl();
  var focalId = urls.getFocalChimpIdFromUrl();
  var intervalStart = urls.getFollowTimeFromUrl();
  var result = followDate + ' ' + focalId + ' ' + intervalStart;
  return result;
};



exports.initializeClickLogger = function() {
  $('button, select, option, input').click(function() {
    if (!exports.DO_LOGGING) {
      return;
    }

    var followRepresentation = exports.getFollowRepresentation();

    var $thisObj = $(this);
    var now = new Date().toISOString();
    console.log(
      ' jgiLogging: ' +
      now +
      ' clickId: ' +
      $thisObj.prop('id') +
      ' elementName: ' +
      $thisObj.get(0).tagName +
      ' followInfo: ' +
      followRepresentation
    );
  });

};

exports.initializeLogging = function() {
  exports.initializeClickLogger();
};
