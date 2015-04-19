'use strict';

/**
 * Code for dealing with the follow screen, in particular the UI.
 */

var urls = require('./jgiUrls');
var models = require('./jgiModels');
var db = require('./jgiDb.js');
var $ = require('jquery');


function assertIsChimp(chimp) {
  if (chimp.constructor.name === 'Chimp') {
    throw new Error('parameter must be a chimp');
  }
}


/**
 * Create the id for the element representing the chimp's presence.
 *
 */
function getIdForTimeImage(chimp) {
  return chimp.chimpId + '_time_img';
}


/**
 * Create the id for the certainty item.
 */
function getIdForCertainty(chimp) {
  return chimp.chimpId + '_cer';
}


/**
 * Get the id for the element representing whether the chimp is within 5m of
 * the focal chimp.
 */
function getIdForWithinFiveMeters(chimp) {
  return chimp.chimpId + '_five';
}


/**
 * Get the id for the element representing the chimp's estrus state.
 */
function getIdForEstrus(chimp) {
  return chimp.chimpId + '_sexState';
}


/**
 * Get the id for the element displaying whether or not the chimp is cloest to
 * focal.
 */
function getIdForClosest(chimp) {
  return chimp.chimpId + '_close';
}


/**
 * Labels that are used to indicate at what point in a 15 minute interval a
 * chimp arrived.
 */
var timeLabels = {
  bottom: '15',
  middle: '10',
  top: '5',
  empty: '0',
  full: '1'
};


/**
 * The labels we use to indicate certainty of an observation. These are the
 * labels we use internally, not the ones shown to the user.
 */
var certaintyLabels = {
  notApplicable: '0',
  certain: '1',
  uncertain: '2'
};


/**
 * The labels for certainty that are shown to a user.
 */
var certaintyLabelsUser = {
  notApplicable: '0',
  certain: 'C',
  uncertain: 'U'
};


/**
 * The labels we use internally for whether or not a chimp is within 5 meters.
 */
var withinFiveLabels = {
  no: '0',
  yes: '1'
};


/**
 * The labels we show users if for whether or not a chimp is within 5 meters.
 */
var withinFiveLabelsUser = {
  no: 'N',
  yes: 'Y'
};


/**
 * The labels we use internally for whether or a chimp's estrus state.
 */
var estrusLabels = {
  a: '0',
  b: '25',
  c: '50',
  d: '75'
};


/**
 * The labels we display to the user for a chimp's estrus state.
 */
var estrusLabelsUser = {
  a: '.00',
  b: '.25',
  c: '.50',
  d: '.75'
};


/**
 * The labels we use internally to keep track if something is closest to focal.
 */
var closestLabels = {
  no: '0',
  yes: '1'
};


/**
 * The labels we display to the user for whether or not a chimp is closest to
 * focal.
 */
var closestLabelsUser = {
  no: 'N',
  yes: 'Y'
};


exports.updateUiForChimp = function(chimp) {
  assertIsChimp(chimp);

  exports.updateIconForChimp(chimp);
  exports.updateCertaintyUiForChimp(chimp);
  exports.updateWithinFiveUiForChimp(chimp);
  exports.updateEstrusUiForChimp(chimp);
  exports.updateClosestUiForChimp(chimp);

};


/**
 * Update the icon for arrival and departure for the given chimp.
 */
exports.updateIconForChimp = function(chimp) {
  assertIsChimp(chimp);

  var imagePaths = {
    bottom: './img/timeBottom.gif',
    middle: './img/timeMiddle.gif',
    top: './img/timeTop.gif',
    empty: './img/timeEmpty.gif',
    full: './img/timeEmpty.gif'
  };

  var id = getIdForTimeImage(chimp);

  var $img = $('#' + id);

  switch (chimp.time) {
    case timeLabels.bottom:
      $img.src = imagePaths.bottom;
      break;
    case timeLabels.middle:
      $img.src = imagePaths.middle;
      break;
    case timeLabels.top:
      $img.src = imagePaths.top;
      break;
    case timeLabels.empty:
      $img.src = imagePaths.empty;
      break;
    case timeLabels.full:
      $img.src = imagePaths.full;
      break;
    default:
      console.log('unrecognized time label: ' + chimp.time);
  }

};


/**
 * Update the UI for the certainty for a particular chimp.
 */
exports.updateCertaintyUiForChimp = function(chimp) {
  assertIsChimp(chimp);

  var id = getIdForCertainty(chimp);

  var $certainty = $('#' + id);

  switch (chimp.certainty) {
    case certaintyLabels.notApplicable:
      $certainty.text(certaintyLabelsUser.notApplicable);
      break;
    case certaintyLabels.certain:
      $certainty.text(certaintyLabelsUser.certain);
      break;
    case certaintyLabels.uncertain:
      $certainty.text(certaintyLabelsUser.uncertain);
      break;
    default:
      console.log('unrecognized chimp certainty: ' + chimp);
  }

};


exports.updateWithinFiveUiForChimp = function(chimp) {
  assertIsChimp(chimp);

  var id = getIdForWithinFiveMeters(chimp);

  var $withinFive = $('#' + id);

  switch (chimp.withinFive) {
    case withinFiveLabels.yes:
      $withinFive.text(withinFiveLabelsUser.yes);
      break;
    case withinFiveLabels.no:
      $withinFive.text(withinFiveLabelsUser.no);
      break;
    default:
      console.log('unrecognized within five meters: ' + chimp);
  }

};


exports.updateEstrusUiForChimp = function(chimp) {
  assertIsChimp(chimp);

  var id = getIdForEstrus(chimp);

  var $estrus = $('#' + id);

  switch (chimp.estrus) {
    case estrusLabels.a:
      $estrus.text(estrusLabelsUser.a);
      break;
    case estrusLabels.b:
      $estrus.text(estrusLabelsUser.b);
      break;
    case estrusLabels.c:
      $estrus.text(estrusLabelsUser.c);
      break;
    case estrusLabels.d:
      $estrus.text(estrusLabelsUser.d);
      break;
    default:
      console.log('unrecognized chimp estrus state: ' + chimp);
  }

};


exports.updateClosestUiForChimp = function(chimp) {
  assertIsChimp(chimp);

  var id = getIdForClosest(chimp);

  var $closest = $('#' + id);

  switch (chimp.closest) {
    case closestLabels.no:
      $closest.text(closestLabelsUser.no);
      break;
    case closestLabels.yes:
      $closest.text(closestLabelsUser.yes);
      break;
    default:
      console.log('unrecognized closest label: ' + chimp);
  }

};


exports.updateUiForFollowTime = function() {

  var followTime = urls.getFollowTimeFromUrl();

  var followTimeUser;

  if (!followTime) {
    console.log('No follow time has been specified!');
    followTimeUser = 'N/A';
  } else {
    followTimeUser = followTime.replace('_', ':');
  }

  $('#time-label').text(followTimeUser);

};


/**
 * Add a row_id property to each of the chimps in the UI. This will let us use
 * the UI instead of going to the database every single time we need info.
 */
exports.populateRowIds = function() {

  exports.foo();

};


exports.updateUiForEndOfInterval = function() {

  // update the UI to show time has expired
  var $nextButton = $('#next-button');
  $nextButton.removeClass('btn-primary');
  $nextButton.addClass('btn-danger');
  $nextButton.text('Time Up!');

};


/**
 * Updates the UI after loading a page.
 * 
 * This used to be called 'display', in case you're looking for that method.
 */
exports.initializeUi = function(control) {

  // We want to show the detailed UI indicators (eg estrus, whether or not they
  // are within five meters, etc) only for the chimps that are present. To do
  // this we're going to start by hiding all the UI and making it visible only
  // when wea re sure the chimp is present (either by receiving manual input
  // from a user or by querying the database and restoring a previous
  // timepoint.
  $('.time_point').css('visibility', 'hidden');
  $('.5-meter').css ('visibility', 'hidden');
  $('.certainty').css ('visibility', 'hidden');
  $('.sexual_state').css ('visibility', 'hidden');
  $('.closeness').css ('visibility', 'hidden');

  $('#time').css ('visibility', 'hidden');

  $('#certainty').css ('visibility', 'hidden');
  $('#distance').css ('visibility', 'hidden');
  $('#state').css ('visibility', 'hidden');
  $('#close_focal').css ('visibility', 'hidden');

  //save_bottom_div
  $('#save_bottom_div').css ('visibility', 'hidden');

  // And now we need to deal with the actual chimps themselves. There are two
  // possibilities here:
  //  1) we are recovering an existing timepoint, in which case we will be
  //     retrieving values from the database
  //  2) we are starting a new time point, in which case we need to create a
  //     bunch of new entries
  var existingData = db.getTableDataForTimePoint(
      urls.getFollowDateFromUrl(),
      urls.getFollowTimeFromUrl(),
      urls.getFocalChimpIdFromUrl()
  );

  if (existingData.getCount() === 0) {
    exports.handleFirstTime(
        control,
        urls.getFollowDateFromUrl(),
        urls.getFollowTimeFromUrl(),
        urls.getFocalChimpIdFromUrl()
    );
  } else {
    exports.handleRepeatTime(existingData);
  }

};


/**
 * Set up the screen for a time point we've not yet visited.
 */
exports.handleFirstTime = function(
    control,
    date,
    followStartTime,
    focalChimpId
) {

  var chimpIds = exports.getChimpIdsFromUi();

  var chimps = [];

  chimpIds.forEach(function(value) {
    var newChimp = models.createNewChimp(
      date,
      followStartTime,
      focalChimpId,
      value
    );
    this.push(newChimp);
  },
    chimps
  );

  
  chimps.forEach(function(chimp) {
    exports.updateUiForChimp(chimp);
  });

  chimps.forEach(function(chimp) {
    db.writeRowForChimp(control, chimp, false);
  });

};


/**
 * Set up the screen for a time point we've already visited.
 */
exports.handleExistingTime = function(existingData) {

  var chimps = db.convertTableDataToChimps(existingData);

  chimps.forEach(function(chimp) {
    exports.updateUiForChimp(chimp);
  });

};


/**
 * Get an array of all the chimp ids by querying the UI. Fast call.
 */
exports.getChimpIdsFromUi = function() {

  // For legacy reasons, we're going to do this by getting all the male and
  // female chimps and concatenating the results.
  var $maleChimps = $('.male-chimp');
  var $femaleChimps = $('.female-chimp');
  
  var allChimps = $maleChimps.toArray().concat($femaleChimps.toArray());

  var chimpIds = [];

  allChimps.forEach(function(value) {
    this.push(value.id);
  },
    chimpIds
  );

  return chimpIds;

};
