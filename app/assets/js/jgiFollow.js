'use strict';

/**
 * Code for dealing with the follow screen, in particular the UI.
 */

var urls = require('./jgiUrls');
var models = require('./jgiModels');
var db = require('./jgiDb');
var $ = require('jquery');
var util = require('./jgiUtil');


function assertIsChimp(chimp) {
  if (chimp.constructor.name !== 'Chimp') {
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

  // We're putting the rowId on each of the chimps.
  var $chimp = $('#' + chimp.chimpId);
  $chimp.attr('rowId', chimp.rowId);

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

  // Store the arrival/departure time in the UI.
  // For now we're storing it in the td that holds the image.
  var $time = $('#' + chimp.chimpId + '_time');
  $time.attr('__data', chimp.time);

  // And now update the image.
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

  // Store the value in the UI.
  // For now we're storing it in the td. Note that we COULD get this stuff by
  // going backwards from the user-facing label. This would be reasonable, but
  // this feels cleaner and better separates UI from behavior, imo.
  var id = getIdForCertainty(chimp);
  var $certainty = $('#' + id);
  $certainty.attr('__data', chimp.certainty);

  // And now update the user facing label.
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
  // And store the value in the ui.
  $withinFive.attr('__data', chimp.withinFive);

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
  // Store the value in the UI.
  $estrus.attr('__data', chimp.estrus);

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
  // Store the value in the UI.
  $closest.attr('__data', chimp.closest);

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
 * Add the listeners to the elements relating to each chimp. 
 */
exports.initializeChimpListeners = function() {
  // The .time objects are the things we click to demonstrate when a chimp
  // arrives or leaves. This might be the image icons, for instance.
  $('.time').on('click', function() {
    var time = $(this).prop('id');

    var chimp = exports.getSelectedChimp();

    // The id is the value we want to persist in the database.
    chimp.time = time;

    exports.updateUiForChimp(chimp);
    exports.writeRowForChimp(chimp);
  });


  $('.certainty').on('click', function() {
    // Mark this chimp as selected.
    var chimp = exports.getChimpFromElement($(this));
    exports.showChimpIsSelected(chimp);
    // Make the certainty editable.
    exports.showCertaintyEditable(true, chimp);
  });


  $('.5-meter').on('click', function() {
    // Mark this chimp as selected.
    var chimp = exports.getChimpFromElement($(this));
    exports.showChimpIsSelected(chimp);
    // Make the within five meters as editable.
    exports.showWithinFiveEditable(true, chimp);
  });


  $('.sexual_state').on('click', function() {
    // Mark this chimp as selected
    var chimp = exports.getChimpIdFromElement($(this));
    exports.showChimpIsSelected(chimp);
    // Make the estrus state editable.
    exports.showEstrusEditable(true, chimp);
  });

  
  $('.closeness').on('click', function() {
    // mark this chimp as selected
    var chimp = exports.getChimpIdFromElement($(this));
    exports.showChimpIsSelected(chimp);
    // Make the closeness editable
    exports.showCloseEditable(true, chimp);
  });

};


/**
 * Plug in the click listeners in the UI.
 */
exports.initializeListeners = function(control) {

  $('#next-button').on('click', function() {
    exports.showLoadingScreen(true);

    // Prepare the url we're going to use for the next timepoint.
    var nextTime = util.incrementTime(urls.getFollowTimeFromUrl());
    var queryString = urls.createParamsForFollow(
      urls.getFollowDateFromUrl(),
      nextTime,
      urls.getFocalChimpIdFromUrl()
    );
    var url = control.getFileAsUrl('assets/followScreen.html' + queryString);

    // Navigate to that url to move to the next timepoint.
    window.location.href = url;
  });


  $('.chimp').on('click', function() {
    var chimpId = $(this).prop('id');
    var chimp = exports.getChimpFromUi(chimpId);
    if (!chimp) {
      console.log(
        'could not find chimp represented in UI with id: ' + chimpId
      );
    }

    exports.showChimpIsSelected(chimp);

    exports.showTimeIndicators(true, chimp);

    // show that chimp has been selected

  });

  // Add listeners to the elements important for each chimp
  exports.initializeChimpListeners();

};


/**
 * Show the time (arrival/departure) indicators in the save div.
 */
exports.showTimeIndicators = function(show, chimp) {
  var $timeIndicators = $('#time');

  if (show) {
    $timeIndicators.removeClass('hidden');
  } else {
    $timeIndicators.addClass('hidden');
  }

  // TODO: select the correct image as selected
  chimp();

};


/**
 * Show the certainty as editable for the given chimp. if show is falsey, hide
 * the ui instead.
 */
exports.showCertaintyEditable = function(show, chimp) {
  var $certaintyIndicator = $('#certainty');

  if (show) {
    $certaintyIndicator.removeClass('hidden');
  } else {
    $certaintyIndicator.addClass('hidden');
  }

  // TODO: check the correct certainty
  chimp();
  throw new Error('certainty editable not supported');
};


exports.showWithinFiveEditable = function(show, chimp) {
  var $withinFiveIndicator = $('#distance');

  if (show) {
    $withinFiveIndicator.removeClass('hidden');
  } else {
    $withinFiveIndicator.addClass('hidden');
  }
  show();
  chimp();
  // show the ui (hide of show === false);
  // select the values for the chimp.
  throw new Error('withi nfive editable not supported');
};


exports.showEstrusEditable = function(show, chimp) {
  var $estrusIndicator = $('#state');

  if (show) {
    $estrusIndicator.removeClass('hidden');
  } else {
    $estrusIndicator.addClass('hidden');
  }
  show();
  chimp();
  // show the ui for estrus editable (hide if !show)
  // mark the current selected values for the chimp
  throw new Error('estrus editable not supported');
};


exports.showCloseEditable = function(show, chimp) {
  var $closestIndicator = $('#close_focal');

  if (show) {
    $closestIndicator.removeClass('hidden');
  } else {
    $closestIndicator.addClass('hidden');
  }
  show();
  chimp();
  // show the ui for estrus editable (hide if !show)
  // mark the current selected values for the chimp
  throw new Error('close editable not supported');
};


/**
 * Get the chimp id from the element relating to a chimp's observation. E.g.
 * the within five meters, arrival/departure, certainty, etc elements.
 */
exports.getChimpIdFromElement = function($element) {
  var id = $element.prop('id');
  var chimpId = id.split('_')[0];
  return chimpId;
};


/**
 * Get the Chimp from the element relating to a chimp's observation. E.g. the
 * within five meters, arrival/departure, certainty, etc elements.
 *
 * This is a convenience method for calling getChimpIdFromElement and
 * getChimpFromUi.
 */
exports.getChimpFromElement = function($element) {
  var id = exports.getChimpIdFromElement($element);
  var chimp = exports.getChimpFromUi(id);
  return chimp;
};


/**
 * Get the selected Chimp by querying the UI. 
 */
exports.getSelectedChimp = function() {

  // We're going to use the '.selected-chimp' class.
  var $chimpElement = $('.selected-chimp');

  var chimpId = $chimpElement.prop('id');

  var chimp = exports.getChimpFromUi(chimpId);

  return chimp;

};


/**
 * Show that the current chimp has been selected.
 */
exports.showChimpIsSelected = function(chimp) {

  // The chimp as represented as elements for the user.
  var $chimpUser = $('#' + chimp.chimpId);

  $chimpUser.addClass('selected-chimp');

};


/**
 * Show or hide the loading screen.
 */
exports.showLoadingScreen = function(show) {
  var $loading = $('#loading');

  if (show) {
    $loading.css('visibility', 'visible');
  } else {
    $loading.css('visibility', 'hidden');
  }
};


/**
 * Return the Chimp with the matching chimpId by querying the UI. This does NOT
 * query the database for a chimp, making it a fast call.
 */
exports.getChimpFromUi = function(chimpId) {

  var $time = $('#' + chimpId + '_time');
  var $certainty = $('#' + chimpId + '_cer');
  var $withinFive = $('#' + chimpId + '_five');
  var $estrus = $('#' + chimpId + '_sexState');
  var $closest = $('#' + chimpId + '_close');

  var rowId = $('#' + chimpId).attr('rowId');
  var date = urls.getFollowDateFromUrl();
  var followStartTime = urls.getFollowTimeFromUrl();
  var focalChimpId = urls.getFocalChimpIdFromUrl();

  var result = new models.Chimp(
      rowId,
      date,
      followStartTime,
      focalChimpId,
      chimpId,
      $time.attr('__data'),
      $certainty.attr('__data'),
      $withinFive.attr('__data'),
      $estrus.attr('__data'),
      $closest.attr('__data')
  );

  return result;
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
  // $('.time_point').css('visibility', 'hidden');
  // $('.5-meter').css ('visibility', 'hidden');
  // $('.certainty').css ('visibility', 'hidden');
  // $('.sexual_state').css ('visibility', 'hidden');
  // $('.closeness').css ('visibility', 'hidden');

  $('#time').addClass('hidden');
  $('#certainty').addClass('hidden');
  $('#distance').addClass('hidden');
  $('#state').addClass('hidden');
  $('#close_focal').addClass('hidden');

  //save_bottom_div
  $('#save_bottom_div').css ('visibility', 'hidden');

  exports.initializeListeners();

  // And now we need to deal with the actual chimps themselves. There are two
  // possibilities here:
  //  1) we are recovering an existing timepoint, in which case we will be
  //     retrieving values from the database
  //  2) we are starting a new time point, in which case we need to create a
  //     bunch of new entries
  var existingData = db.getTableDataForTimePoint(
      control,
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
    exports.handleExistingTime(existingData);
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
  // We are seeing a timepoint for the first time. The general idea is this:
  // 1) Create Chimp objects for all the chimps we're going to need. These are
  // not going to have rowId objects, but just be 'default' chimp observations.
  //
  // 2) Write these default chimps to the database.
  //
  // 3) Read back out the chimps for this timepoint from the database. This
  // will be the values we just created, except that these will also have
  // rowIds for each of the chimps. We assume all chimps in the UI have rowIds,
  // so this is important.
  //
  // 4) update the ui for the chimps

  var chimpIds = exports.getChimpIdsFromUi();

  var chimps = [];

  // 1) create the chimps
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

  // 2) write the chimps
  chimps.forEach(function(chimp) {
    db.writeRowForChimp(control, chimp, false);
  });

  // 3) read the chimps back in for this time point.
  var tableData = db.getTableDataForTimePoint(
      control,
      date,
      followStartTime,
      focalChimpId
  );

  chimps = db.convertTableDataToChimps(tableData);
  
  // 4) update the UI for the chimps
  chimps.forEach(function(chimp) {
    exports.updateUiForChimp(chimp);
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
