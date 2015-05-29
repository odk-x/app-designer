'use strict';

var db = require('./jgiDb.js');
var urls = require('./jgiUrls.js');
var $ = require('jquery');
var logger = require('./jgiLogging');

/**
 * Called when page loads to display things (Nothing to edit here)
 */
exports.initializeUi = function initializeUi(control) {

  logger.initializeLogging();

  $('#list').click(function(e) {
    // We set the attributes we need in the li id. However, we may have
    // clicked on the li or anything in the li. Thus we need to get
    // the original li, which we'll do with jQuery's closest()
    // method. First, however, we need to wrap up the target
    // element in a jquery object.
    // wrap up the object so we can call closest()
    var jqueryObject = $(e.target);

    // we want the closest thing with class item_space, which we
    // have set up to have the row id
    var containingDiv = jqueryObject.closest('.item_space');
    var date = urls.getFollowDateFromUrl();
    var focalId = urls.getFocalChimpIdFromUrl();
    var beginTime = containingDiv.attr('time');

    // create url and launch list
    var queryParams = urls.createParamsForFollow(date, beginTime, focalId);
    console.log(
      ' jgiLogging: launchFollowScreenFromList with params: ' +
      queryParams
    );
    var url = control.getFileAsUrl(
      'assets/followScreen.html' + queryParams
    );

    window.location.href = url;
  });

  exports.displayFollowIntervals(control);

};
            

/**
 * Populate the list of Follows.
 */
exports.displayFollowIntervals = function displayFollowIntervals(control) {
  var followDate = urls.getFollowDateFromUrl();
  var focalId = urls.getFocalChimpIdFromUrl();

  var followIntervals = db.getFollowIntervalsForFollow(
      control,
      followDate,
      focalId
  );

  followIntervals.forEach(function(follow) {
    var item = $('<li>');
    item.attr('time', follow.beginTime);
    item.addClass('item_space');
    item.text(follow.beginTime);

    var chevron = $('<img>');
    chevron.attr('src', control.getFileAsUrl('assets/img/little_arrow.png'));
    chevron.attr('class', 'chevron');
    item.append(chevron);

    $('#list').append(item);

    var borderDiv = $('<div>');
    borderDiv.addClass('divider');
    $('#list').append(borderDiv);
  });
};
