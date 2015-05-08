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
    var date = containingDiv.attr('date');
    var focalId = containingDiv.attr('focal-id');
    var beginTime = containingDiv.attr('begin-time');

    // create url and launch list
    var queryParams = urls.createParamsForFollow(date, beginTime, focalId);
    console.log(
      ' jgiLogging: showIntervals with params: ' +
      queryParams
    );
    var url = control.getFileAsUrl(
      'assets/followIntervalList.html' + queryParams
    );

    window.location.href = url;
  });

  exports.displayFollows(control);

};
            

/**
 * Populate the list of Follows.
 */
exports.displayFollows = function displayFollows(control) {
  var follows = db.getAllFollows(control);

  follows.forEach(function(follow) {
    var item = $('<li>');
    item.attr('date', follow.date);
    item.attr('focal-id', follow.focalId);
    item.attr('begin-time', follow.beginTime);
    item.addClass('item_space');
    item.text(follow.date + ' ' + follow.beginTime);

    var chevron = $('<img>');
    chevron.attr('src', control.getFileAsUrl('assets/img/little_arrow.png'));
    chevron.attr('class', 'chevron');
    item.append(chevron);

    var focalIdItem = $('<li>');
    focalIdItem.attr('class', 'detail');
    focalIdItem.text('Focal: ' + follow.focalId);
    item.append(focalIdItem);

    $('#list').append(item);
    //
    // don't append the last one to avoid the fencepost problem
    var borderDiv = $('<div>');
    borderDiv.addClass('divider');
    $('#list').append(borderDiv);
  });
};
