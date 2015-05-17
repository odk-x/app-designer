/* global alert, confirm */
'use strict';

/**
 * Code for dealing with the follow screen, in particular the UI.
 */

var urls = require('./jgiUrls');
var models = require('./jgiModels');
var db = require('./jgiDb');
var $ = require('jquery');
var util = require('./jgiUtil');
var logging = require('./jgiLogging');
//var chimpid = "";

function assertIsChimp(chimp) {
  if (chimp.constructor.name !== 'Chimp') {
    throw new Error('parameter must be a chimp');
  }
}


function assertFoundChimp(chimp) {
  if (!chimp) {
    console.log('could not find selected chimp!');
    window.alert('could not find selected chimp!');
    throw new Error('could not find selected chimp');
  }
}


/**
 * Append all minutes as options to the select element.
 */
function appendMinsToSelect($select) {
  var mins = util.getAllMinutes();
  mins.forEach(function(minute) {
    var option = $('<option></option>');
    option.attr('value', minute);
    option.text(minute);
    $select.append(option);
  });
}


/**
 * Append all hours as options to the select element.
 */
function appendHoursToSelect($select) {
  var hours = util.getAllHours();
  hours.forEach(function(hour) {
    var option = $('<option></option>');
    option.attr('value', hour);
    option.text(hour);
    $select.append(option);
  });
}


/**
 * Create the id for the element representing the chimp's presence.
 */
function getIdForTimeImage(chimp) {
  return chimp.chimpId + '_time_img';
}


/**
 * Create the id for the element containing the image showing
 * arrival/departure.
 */
function getIdForTime(chimp) {
  return chimp.chimpId + '_time';
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
 * Show the food editing div, hiding the species and chimps.
 */
function showFood() {
  $('.container').addClass('nodisplay');
  $('.species-container').addClass('nodisplay');
  $('.food-container').removeClass('nodisplay');
  exports.updateFoodAfterEdit();
}


/**
 * Show the species editing div, hiding the food and chimps.
 */
function showSpecies() {
  $('.container').addClass('nodisplay');
  $('.food-container').addClass('nodisplay');
  $('.species-container').removeClass('nodisplay');
  exports.updateSpeciesAfterEdit();
}


/**
 * Show the chimps, hiding the species and food.
 */
function showChimps() {
  $('.food-container').addClass('nodisplay');
  $('.species-container').addClass('nodisplay');
  $('.container').removeClass('nodisplay');
}


/**
 * Clear the UI of food and species editing of whatever had previous been
 * selected. That way we won't populate with old state when a new item is set
 * to be entered.
 */
function clearSpeciesAndFoodSelected() {
  $('.food-select option').prop('selected', false);
  $('.species-select option').prop('selected', false);

  $('.food-spec-select').val('0');
  $('.species-spec-select').val('0');

  $('.food-summary').text('?');
  $('.species-summary').text('?');

  $('#food-summary').attr('__rowid', '');
  $('#species-summary').attr('__rowid', '');
}


function timeIsValid(time) {
  // hh:mm is the default input. Faking begins with and ends with here.
  return (
      time.lastIndexOf('hh', 0) !== 0 &&
      time.lastIndexOf('mm') !== time.length - 2
  );
}


/**
 * True if the food can be persisted. This means all is valid except rowId and
 * end time.
 */
function foodCanBePersisted(food) {
  return (
      timeIsValid(food.startTime) &&
      food.foodName !== '0' &&
      food.foodPartEaten !== '0'
  );
}


/**
 * True if the species can be persisted. This means all is valid except rowId
 * and end time.
 */
function speciesCanBePersisted(species) {
  return (
      timeIsValid(species.startTime) &&
      species.speciesName !== '0' &&
      util.isInt(species.number) &&
      species.number > 0
  );
}


/**
 * True if a valid food can be selected from the UI (i.e. if it can be saved).
 */
function validFoodSelected() {
  // A valid food means food and part selected, begin hh and mm selected. Not
  // necessarily an end time selected.
  var food = exports.getFoodFromUi();
  return foodCanBePersisted(food);
}


/**
 * True if a valid food can be selected from the UI (i.e. if it can be saved).
 */
function validSpeciesSelected() {
  // A valid food means food and part selected, begin hh and mm selected. Not
  // necessarily an end time selected.
  var species = exports.getSpeciesFromUi();
  return speciesCanBePersisted(species);
}


/**
 * Add the Species in the species array to a select list as options.
 */
exports.addSpeciesToList = function(speciesArr, $list) {
  speciesArr.forEach(function(species) {
    var option = $('<option></option>');
    option.attr('value', species.speciesName);
    option.addClass('dynamic');
    option.text(species.number + ' ' + species.speciesName);

    option.attr('__rowid', species.rowId);
    option.attr('__date', species.date);
    option.attr('__focalId', species.focalChimpId);
    option.attr('__startTime', species.startTime);
    option.attr('__endTime', species.endTime);
    option.attr('__number', species.number);
    option.attr('__name', species.speciesName);

    $list.append(option);
  });
};


/**
 * Add the Food in the food array to a select list as options.
 */
exports.addFoodToList = function(foodArr, $list) {
  foodArr.forEach(function(food) {
    var option = $('<option></option>');
    option.attr('value', food.foodName);
    option.addClass('dynamic');
    option.text(food.foodName + ' ' + food.foodPartEaten);

    option.attr('__rowid', food.rowId);
    option.attr('__date', food.date);
    option.attr('__focalId', food.focalChimpId);
    option.attr('__startTime', food.startTime);
    option.attr('__endTime', food.endTime);
    option.attr('__name', food.foodName);
    option.attr('__part', food.foodPartEaten);

    $list.append(option);
  });

};


exports.refreshSpeciesList = function(control) {
  // remove the existing dynamic items from both lists.
  $('.species-spec-select .dynamic').remove();
  
  var date = urls.getFollowDateFromUrl();
  var focalId = urls.getFocalChimpIdFromUrl();
  var speciesTableData = db.getSpeciesDataForDate(control, date, focalId);
  
  var allSpecies = db.convertTableDataToSpecies(speciesTableData);

  var activeSpecies = [];
  var completedSpecies = [];

  allSpecies.forEach(function(species) {
    if (species.endTime === util.flagEndTimeNotSet) {
      activeSpecies.push(species);
    } else {
      completedSpecies.push(species);
    }
  });

  var $activeList = $('#active-species');
  var $completedList = $('#finished-species');

  exports.addSpeciesToList(activeSpecies, $activeList);
  exports.addSpeciesToList(completedSpecies, $completedList);
};


exports.refreshFoodList = function(control) {
  // remove the existing dynamic items from both lists.
  $('.food-spec-select .dynamic').remove();
  
  var date = urls.getFollowDateFromUrl();
  var focalId = urls.getFocalChimpIdFromUrl();
  var foodTableData = db.getFoodDataForDate(control, date, focalId);
  
  var allFood = db.convertTableDataToFood(foodTableData);

  var activeFood = [];
  var completedFood = [];

  allFood.forEach(function(food) {
    if (food.endTime === util.flagEndTimeNotSet) {
      activeFood.push(food);
    } else {
      completedFood.push(food);
    }
  });

  var $activeList = $('#active-food');
  var $completedList = $('#finished-food');

  exports.addFoodToList(activeFood, $activeList);
  exports.addFoodToList(completedFood, $completedList);
};


exports.editExistingFood = function(food) {
  var timeParts = food.startTime.split(':');
  var startHours = timeParts[0];
  var startMins = timeParts[1];

  var endHours;
  var endMins;
  if (food.endTime === util.flagEndTimeNotSet) {
    endHours = 'hh';
    endMins = 'mm';
  } else {
    var endParts = food.endTime.split(':');
    endHours = endParts[0];
    endMins = endParts[1];
  }

  var $startHours = $('#start-time-food-hours');
  var $startMins = $('#start-time-food-mins');
  var $endHours = $('#end-time-food-hours');
  var $endMins = $('#end-time-food-mins');
  var $food = $('#foods');
  var $foodPart = $('#food-part');
  var $foodSummary = $('#food-summary');

  $startHours.val(startHours);
  $startMins.val(startMins);
  $endHours.val(endHours);
  $endMins.val(endMins);
  $food.val(food.foodName);
  $foodPart.val(food.foodPartEaten);
  $foodSummary.attr('__rowid', food.rowId);

  showFood();
};


exports.editExistingSpecies = function(species) {
  var timeParts = species.startTime.split(':');
  var startHours = timeParts[0];
  var startMins = timeParts[1];

  var endHours;
  var endMins;
  if (species.endTime === util.flagEndTimeNotSet) {
    endHours = 'hh';
    endMins = 'mm';
  } else {
    var endParts = species.endTime.split(':');
    endHours = endParts[0];
    endMins = endParts[1];
  }

  var $startHours = $('#start-time-species-hours');
  var $startMins = $('#start-time-species-mins');
  var $endHours = $('#end-time-species-hours');
  var $endMins = $('#end-time-species-mins');
  var $species = $('#species');
  var $speciesNumber = $('#species_number');
  var $speciesSummary = $('#species-summary');

  $startHours.val(startHours);
  $startMins.val(startMins);
  $endHours.val(endHours);
  $endMins.val(endMins);
  $species.val(species.speciesName);
  $speciesNumber.val(species.number);
  $speciesSummary.attr('__rowid', species.rowId);

  showSpecies();
};


/**
 * Update the UI after an edit to a food has taken place.
 */
exports.updateFoodAfterEdit = function() {
  var $saveFood = $('#saving_food');
  var $foodSummaryStart = $('#food-summary-start-time');
  var $foodSummaryEnd = $('#food-summary-end-time');
  var $foodSummaryFood = $('#food-summary-food');
  var $foodSummaryPart = $('#food-summary-part');

  if (validFoodSelected()) {
    $saveFood.prop('disabled', false);
  } else {
    $saveFood.prop('disabled', true);
  }

  var food = exports.getFoodFromUi();

  if (timeIsValid(food.startTime)) {
    $foodSummaryStart.text(food.startTime);
  } else {
    $foodSummaryStart.text('?');
  }

  if (timeIsValid(food.endTime)) {
    $foodSummaryEnd.text(food.endTime);
  } else {
    $foodSummaryEnd.text('?');
  }

  if (food.foodName !== '0') {
    $foodSummaryFood.text(food.foodName);
  } else {
    $foodSummaryFood.text('?');
  }

  if (food.foodPartEaten !== '0') {
    $foodSummaryPart.text(food.foodPartEaten);
  } else {
    $foodSummaryPart.text('?');
  }
};


/**
 * Update the UI after an edit to a species has taken place.
 */
exports.updateSpeciesAfterEdit = function() {
  var $saveSpecies = $('#saving_species');
  var $speciesSummaryStart = $('#species-summary-start-time');
  var $speciesSummaryEnd = $('#species-summary-end-time');
  var $speciesSummaryName = $('#species-summary-name');
  var $speciesSummaryNumber = $('#species-summary-number');

  if (validSpeciesSelected()) {
    $saveSpecies.prop('disabled', false);
  } else {
    $saveSpecies.prop('disabled', true);
  }

  var species = exports.getSpeciesFromUi();

  if (timeIsValid(species.startTime)) {
    $speciesSummaryStart.text(species.startTime);
  } else {
    $speciesSummaryStart.text('?');
  }

  if (timeIsValid(species.endTime)) {
    $speciesSummaryEnd.text(species.endTime);
  } else {
    $speciesSummaryEnd.text('?');
  }

  if (species.speciesName !== '0') {
    $speciesSummaryName.text(species.speciesName);
  } else {
    $speciesSummaryName.text('?');
  }

  if (species.number !== '0') {
    // 0 is the default, illegal, unselectable value
    $speciesSummaryNumber.text(species.number);
  } else {
    $speciesSummaryNumber.text('?');
  }
};


/**
 * Labels that are used to indicate at what point in a 15 minute interval a
 * chimp arrived.
 */
var timeLabels = {
  absent: '0',
  continuing: '1',
  arriveFirst: '5',
  arriveSecond: '10',
  arriveThird: '15',
  departFirst: '-5',
  departSecond: '-10',
  departThird: '-15'
};


/**
 * The labels we use to indicate certainty of an observation. These are the
 * labels we use internally, not the ones shown to the user.
 */
var certaintyLabels = {
  certain: '1',
  uncertain: '2'
};


/**
 * The labels for certainty that are shown to a user.
 */
var certaintyLabelsUser = {
  certain: '✓',
  uncertain: '•'
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
  no: 'X',
  yes: '✓'
};


/**
 * The labels we use internally for whether or a chimp's estrus state.
 */
var estrusLabels = {
  a: '0',
  b: '25',
  c: '50',
  d: '75',
  e: '100'
};


/**
 * The labels we display to the user for a chimp's estrus state.
 */
var estrusLabelsUser = {
  a: '.00',
  b: '.25',
  c: '.50',
  d: '.75',
  e: '1.0'
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

  // And now make visible as necessary.
  exports.updateVisiblityForChimp(chimp);

};


/**
 * Update the icon for arrival and departure for the given chimp.
 */
exports.updateIconForChimp = function(chimp) {
  assertIsChimp(chimp);

  var imagePaths = {
    absent: './img/time_empty.png',
    continuing: './img/time_continues.png',
    arriveFirst: './img/time_arriveFirst.png',
    arriveSecond: './img/time_arriveSecond.png',
    arriveThird: './img/time_arriveThird.png',
    departFirst: './img/time_departFirst.png',
    departSecond: './img/time_departSecond.png',
    departThird: './img/time_departThird.png'
  };

  // Store the arrival/departure time in the UI.
  // For now we're storing it in the td that holds the image.
  var timeId = getIdForTime(chimp);
  var $time = $('#' + timeId);
  $time.attr('__data', chimp.time);

  // And now update the image.
  var id = getIdForTimeImage(chimp);
  var $img = $('#' + id);
  var path = imagePaths.absent;

  switch (chimp.time) {
    case timeLabels.absent:
      path = imagePaths.absent;
      break;
    case timeLabels.continuing:
      path = imagePaths.continuing;
      break;
    case timeLabels.arriveFirst:
      path = imagePaths.arriveFirst;
      break;
    case timeLabels.arriveSecond:
      path = imagePaths.arriveSecond;
      break;
    case timeLabels.arriveThird:
      path = imagePaths.arriveThird;
      break;
    case timeLabels.departFirst:
      path = imagePaths.departFirst;
      break;
    case timeLabels.departSecond:
      path = imagePaths.departSecond;
      break;
    case timeLabels.departThird:
      path = imagePaths.departThird;
      break;
    default:
      console.log('unrecognized time label: ' + chimp.time);
  }

  $img.prop('src', path);

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
    case estrusLabels.e:
      $estrus.text(estrusLabelsUser.e);
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

  if (!followTime || followTime === '') {
    console.log('No follow time has been specified!');
    followTimeUser = 'N/A';
  } else {
    followTimeUser = followTime.replace('_', ':');
  }

  $('#time-label').text(followTimeUser);

};


/**
 * Update the UI for the "previous" button.
 */
exports.initializePreviousButton = function(control) {
  // Hide the button if there is no previous instance. Otherwise, go back in
  // time 15 minutes. We will determine if there is a previous instance by
  // whether or not the current time is the start time of the follow.
  var focalId = urls.getFocalChimpIdFromUrl();
  var date = urls.getFollowDateFromUrl();
  var currentTime = urls.getFollowTimeFromUrl();
  var previousTime = util.decrementTime(currentTime);

  var $prevButton = $('#previous-button');

  var arrThisFollow = db.getFollowForDateAndChimp(control, date, focalId);
  if (arrThisFollow.length === 0) {
    // No follow for this day. Trouble!!!
    console.log('no follow found for this day! this is a bug.');
    $prevButton.addClass('nodisplay');
    return;
  }
  var thisFollow = arrThisFollow[0];

  if (thisFollow.beginTime === currentTime) {
    // We're at the first interval.
    $prevButton.addClass('nodisplay');
    return;
  }

  // Otherwise we have a valid previous time.
  $prevButton.click(function() {
    exports.showLoadingScreen(true);

    // Prepare the url we're going to use for the next timepoint.
    var queryString = urls.createParamsForFollow(
      date,
      previousTime,
      focalId
    );
    var url = control.getFileAsUrl('assets/followScreen.html' + queryString);

    // Navigate to that url to move to the next timepoint.
    window.location.href = url;
  });

};


exports.updateUiForFocalId = function() {
  var focalId = urls.getFocalChimpIdFromUrl();
  var $focalButton = $('#' + focalId);
  $focalButton.addClass('focal-chimp');
};


exports.updateUiForEndOfInterval = function() {
  // update the UI to show time has expired
  var $nextButton = $('#next-button');
  $nextButton.removeClass('btn-primary');
  $nextButton.addClass('btn-danger');
  $nextButton.text('Time Up!');
};

/**
 * update the icon for selected chimp
 */
exports.updateIconForSelectedChimp = function(chimp, chimpid, timeid) {
  var imagePaths = {
    absent: './img/time_empty.png',
    continuing: './img/time_continues.png',
    arriveFirst: './img/time_arriveFirst.png',
    arriveSecond: './img/time_arriveSecond.png',
    arriveThird: './img/time_arriveThird.png',
    departFirst: './img/time_departFirst.png',
    departSecond: './img/time_departSecond.png',
    departThird: './img/time_departThird.png'
  };
  var imageId = chimpid + '_img';
  //var $img = $('#' + imageId);
  //imageId.setAttribute("id", timeid);

  switch (chimp.time) {
    case timeLabels.absent:
      document.getElementById(imageId).src = imagePaths.absent;
      //$img.src = imagePaths.absent;
      break;
    case timeLabels.continuing:
      document.getElementById(imageId).src = imagePaths.continuing;
      //$img.src = imagePaths.continuing;
      break;
    case timeLabels.arriveFirst:
      document.getElementById(imageId).src = imagePaths.arriveFirst;
      //$img.src = imagePaths.arriveFirst;
      break;
    case timeLabels.arriveSecond:
      document.getElementById(imageId).src = imagePaths.arriveSecond;
      //$img.src = imagePaths.arriveSecond;
      break;
    case timeLabels.arriveThird:
      document.getElementById(imageId).src = imagePaths.arriveThird;
      //$img.src = imagePaths.arriveThird;
      break;
    case timeLabels.departFirst:
      document.getElementById(imageId).src = imagePaths.departFirst;
      //$img.src = imagePaths.departFirst;
      break;
    case timeLabels.departSecond:
      document.getElementById(imageId).src = imagePaths.departSecond;
      //$img.src = imagePaths.departSecond;
      break;
    case timeLabels.departThird:
      document.getElementById(imageId).src = imagePaths.departThird;
      //$img.src = imagePaths.departThird;
      break;
    default:
      console.log('unrecognized time label: ' + chimp.time);
  }
};
/**
 * Add the listeners for the items that update a chimp's records.
 */
exports.initializeEditListeners = function(control) {
 
  // The .time objects are the things we click to demonstrate when a chimp
  // arrives or leaves. This might be the image icons, for instance.
  $('.time').on('click', function() {
    var valueFromUi = $(this).prop('id');
    var valueForDb;
    switch (valueFromUi) {
      case timeLabels.absent:
        valueForDb = timeLabels.absent;
        break;
      case timeLabels.continuing:
        valueForDb = timeLabels.continuing;
        break;
      case timeLabels.arriveFirst:
        valueForDb = timeLabels.arriveFirst;
        break;
      case timeLabels.arriveSecond:
        valueForDb = timeLabels.arriveSecond;
        break;
      case timeLabels.arriveThird:
        valueForDb = timeLabels.arriveThird;
        break;
      case timeLabels.departFirst:
        valueForDb = timeLabels.departFirst;
        break;
      case timeLabels.departSecond:
        valueForDb = timeLabels.departSecond;
        break;
      case timeLabels.departThird:
        valueForDb = timeLabels.departThird;
        break;
      default:
        console.log('unrecognized time from ui: ' + valueFromUi);
        window.alert('unrecognized time from ui: ' + valueFromUi);
    }

    var chimp = exports.getSelectedChimp();
    var chimpid = getIdForTime(chimp);
    assertFoundChimp(chimp);
    chimp.time = valueForDb;
    exports.updateUiForChimp(chimp);
    db.writeRowForChimp(control, chimp, true);

    exports.showTimeIndicatorsToEdit(false, chimp);  // added chimp
    exports.updateIconForSelectedChimp(chimp, chimpid, valueFromUi);
  });

  // Certainty
  $('input[name=certain]:radio').on('change', function() {
    var value = $(this).val();

    var valueForDb;
    switch (value) {
      case certaintyLabels.certain:
        valueForDb = certaintyLabels.certain;
        break;
      case certaintyLabels.uncertain:
        valueForDb = certaintyLabels.uncertain;
        break;
      default:
        console.log('unrecognized chimp certainty value from ui: ' + value);
        window.alert('unrecognized chimp certainty value from ui: ' + value);
        return;
    }

    var chimp = exports.getSelectedChimp();
    assertFoundChimp(chimp);
    chimp.certainty = valueForDb;

    exports.updateUiForChimp(chimp);
    db.writeRowForChimp(control, chimp, true);

    exports.showCertaintyToEdit(false);
  });

  $('input[name=certain]:radio').click(function() {
    var chimp = exports.getSelectedChimp();
    if (chimp.certainty === $(this).val()) {
      // then we've reselected the same value. hide the buttons
      exports.showCertaintyToEdit(false);
    }
  });

  // Within five meters
  $('input[name=distance]:radio').on('change', function() {
    var valueFromUi = $(this).val();

    var valueForDb;
    switch (valueFromUi) {
      case withinFiveLabels.no:
        valueForDb = withinFiveLabels.no;
        break;
      case withinFiveLabels.yes:
        valueForDb = withinFiveLabels.yes;
        break;
      default:
        console.log('unrecognized within five value from ui: ' + valueFromUi);
        window.alert('unrecognized within five value from ui: ' + valueFromUi);
        return;
    }
  
    var chimp = exports.getSelectedChimp();
    assertFoundChimp(chimp);
    chimp.withinFive = valueForDb;

    exports.updateUiForChimp(chimp);
    db.writeRowForChimp(control, chimp, true);

    exports.showWithinFiveToEdit(false);
  });

  $('input[name=distance]:radio').click(function() {
    var chimp = exports.getSelectedChimp();
    if (chimp.withinFive === $(this).val()) {
      // then we've reselected the same value. hide the buttons
      exports.showWithinFiveToEdit(false);
    }
  });

  // Estrus
  $('input[name=sex_state]:radio').on('change', function() {
    var valueFromUi = $(this).val();

    var valueForDb;
    switch (valueFromUi) {
      case estrusLabels.a:
        valueForDb = estrusLabels.a;
        break;
      case estrusLabels.b:
        valueForDb = estrusLabels.b;
        break;
      case estrusLabels.c:
        valueForDb = estrusLabels.c;
        break;
      case estrusLabels.d:
        valueForDb = estrusLabels.d;
        break;
      case estrusLabels.e:
        valueForDb = estrusLabels.e;
        break;
      default:
        console.log('unrecognized estrus value from ui: ' + valueFromUi);
        window.alert('unrecognized estrus value from ui: ' + valueFromUi);
    }

    var chimp = exports.getSelectedChimp();
    assertFoundChimp(chimp);
    chimp.estrus = valueForDb;

    exports.updateUiForChimp(chimp);
    db.writeRowForChimp(control, chimp, true);

    exports.showEstrusToEdit(false);
  });

  $('input[name=sex_state]:radio').click(function() {
    var chimp = exports.getSelectedChimp();
    if (chimp.estrus === $(this).val()) {
      // then we've reselected the same value. hide the buttons
      exports.showEstrusToEdit(false);
    }
  });

  // Closest to focal
  $('input[name=close]:radio').on('change', function() {
    var valueFromUi = $(this).val();

    var valueForDb;
    switch (valueFromUi) {
      case closestLabels.no:
        valueForDb = closestLabels.no;
        break;
      case closestLabels.yes:
        valueForDb = closestLabels.yes;
        break;
      default:
        console.log('unrecognized closest value from ui: ' + valueFromUi);
        window.alert('unrecognized closest value from ui: ' + valueFromUi);
    }

    // We're using this as a makeshift radio button, so handle that ourselves
    // by deselecting and writing to the db the currently closest chimp.
    
    // First deselect the existing closest chimp and write.
    var $closestChimp = $('.closeness[__data=1]');
    if ($closestChimp.length > 1) {
      alert('More than one chimp marked as closest!');
    } else if ($closestChimp.length === 0) {
      // Nothing to do.
      console.log('no closest chimp selected already');
    } else {
      var closestIdElement = $closestChimp.prop('id');
      var indexOfClosestSuffix = closestIdElement.indexOf('_close');
      var closestChimpId = closestIdElement.substring(0, indexOfClosestSuffix);
      var closestChimp = exports.getChimpFromUi(closestChimpId);
      closestChimp.closest = closestLabels.no;
      db.writeRowForChimp(control, closestChimp, true);
      exports.updateUiForChimp(closestChimp);
    }

    // Then handle the existing chimp.
    var chimp = exports.getSelectedChimp();
    assertFoundChimp(chimp);
    chimp.closest = valueForDb;

    
    exports.updateUiForChimp(chimp);
    db.writeRowForChimp(control, chimp, true);

    exports.showClosestToEdit(false);
  });

  $('input[name=close]:radio').click(function() {
    var chimp = exports.getSelectedChimp();
    if (chimp.closest === $(this).val()) {
      // then we've reselected the same value. hide the buttons
      exports.showClosestToEdit(false);
    }
  });


};


exports.initializeFoodListeners = function(control) {
  $('.food-edit').change(exports.updateFoodAfterEdit);

  $('#saving_food').click(function() {
    console.log('save food');
    var activeFood = exports.getFoodFromUi();
    // We can save something if it doesn't have a valid end time, but we want
    // to flag it as invalid.
    if (!timeIsValid(activeFood.endTime)) {
      activeFood.endTime = util.flagEndTimeNotSet;
    }

    if (activeFood.rowId) {
      // update
      db.writeRowForFood(control, activeFood, true);
    } else {
      // add
      db.writeRowForFood(control, activeFood, false);
    }

    exports.refreshFoodList(control);
    showChimps();
    clearSpeciesAndFoodSelected();
  });

  $('.food-spec-select').change(function() {
    var $option = $('option:selected', this);
    var food = new models.Food(
      $option.attr('__rowid'),
      $option.attr('__date'),
      $option.attr('__focalId'),
      $option.attr('__startTime'),
      $option.attr('__endTime'),
      $option.attr('__name'),
      $option.attr('__part')
    );
    exports.editExistingFood(food);
  });
};


exports.initializeSpeciesListeners = function(control) {
  $('.species-edit').change(exports.updateSpeciesAfterEdit);

  $('#saving_species').click(function() {
    console.log('save species');
    var activeSpecies = exports.getSpeciesFromUi();
    // We can save something if it doesn't have a valid end time, but we want
    // to flag it as invalid.
    if (!timeIsValid(activeSpecies.endTime)) {
      activeSpecies.endTime = util.flagEndTimeNotSet;
    }

    if (activeSpecies.rowId) {
      // update
      db.writeRowForSpecies(control, activeSpecies, true);
    } else {
      // add
      db.writeRowForSpecies(control, activeSpecies, false);
    }

    showChimps();
    clearSpeciesAndFoodSelected();
    exports.refreshSpeciesList(control);
  });

  $('.species-spec-select').change(function() {
    var $option = $('option:selected', this);
    var species = new models.Species(
      $option.attr('__rowid'),
      $option.attr('__date'),
      $option.attr('__focalId'),
      $option.attr('__startTime'),
      $option.attr('__endTime'),
      $option.attr('__name'),
      $option.attr('__number')
    );
    exports.editExistingSpecies(species);
  });
};


/**
 * Add the listeners to the elements relating to each chimp. 
 */
exports.initializeChimpListeners = function() {

  $('.certainty').on('click', function() {
    // Mark this chimp as selected.
    var chimp = exports.getChimpFromElement($(this));
    exports.showChimpIsSelected(chimp);
    // Make the certainty editable.
    exports.showCertaintyToEdit(true, chimp);
  });


  $('.5-meter').on('click', function() {
    // Mark this chimp as selected.
    var chimp = exports.getChimpFromElement($(this));
    exports.showChimpIsSelected(chimp);
    // Make the within five meters as editable.
    exports.showWithinFiveToEdit(true, chimp);
  });


  $('.sexual_state').on('click', function() {
    // Mark this chimp as selected
    var chimp = exports.getChimpFromElement($(this));
    exports.showChimpIsSelected(chimp);
    // Make the estrus state editable.
    exports.showEstrusToEdit(true, chimp);
  });

  
  $('.closeness').on('click', function() {
    // mark this chimp as selected
    var chimp = exports.getChimpFromElement($(this));
    exports.showChimpIsSelected(chimp);
    // Make the closeness editable
    exports.showClosestToEdit(true, chimp);
  });

};


exports.initializeFood = function(control) {
  var $startHours = $('#start-time-food-hours');
  var $startMins = $('#start-time-food-mins');
  var $endHours = $('#end-time-food-hours');
  var $endMins = $('#end-time-food-mins');

  appendHoursToSelect($startHours);
  appendHoursToSelect($endHours);
  appendMinsToSelect($startMins);
  appendMinsToSelect($endMins);

  // We'll start with the save button disabled. You have to select valid food
  // times to enable it.
  $('#saving_food').prop('disabled', true);

  exports.initializeFoodListeners(control);

};


exports.initializeSpecies = function(control) {
  var $startHours = $('#start-time-species-hours');
  var $startMins = $('#start-time-species-mins');
  var $endHours = $('#end-time-species-hours');
  var $endMins = $('#end-time-species-mins');

  appendHoursToSelect($startHours);
  appendHoursToSelect($endHours);
  appendMinsToSelect($startMins);
  appendMinsToSelect($endMins);

  // Start with the save button disabled.
  $('#saving_species').prop('disabled', true);

  exports.initializeSpeciesListeners(control);
};


/**
 * Plug in the click listeners in the UI.
 */
exports.initializeListeners = function(control) {

  $('#next-button').on('click', function() {

    var $closestElement = $('.closeness[__data=1]');
    var noClosestOk = false;
    if ($closestElement.length === 0) {
      noClosestOk = confirm('No nearest to focal. Are you sure?');
    } else {
      noClosestOk = true;
    }

    var $withinFiveElement = $('.5-meter[__data=1]');
    var noneWithin5Ok = false;
    if ($withinFiveElement.length === 0) {
      noneWithin5Ok = confirm('No chimps within 5m. Are you sure?');
    } else {
      noneWithin5Ok = true;
    }

    if (!noClosestOk || !noneWithin5Ok) {
      return;
    }

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

  $('#button-food').on('click', function() {
    showFood();
  });

  $('.go-back').on('click', function() {
    showChimps();
    clearSpeciesAndFoodSelected();
  });

  $('#button-species').on('click', function() {
    showSpecies();
  });

  $('.chimp').on('click', function() {
    var chimpId = $(this).prop('id');
    //chimpid = chimpId;
    var chimp = exports.getChimpFromUi(chimpId);
    if (!chimp) {
      console.log(
        'could not find chimp represented in UI with id: ' + chimpId
      );
    }

    exports.showChimpIsSelected(chimp);

    exports.showTimeIndicatorsToEdit(true, chimp);
  });

  // Add listeners to the elements important for each chimp
  exports.initializeChimpListeners();

  // Add listeners for the editing items
  exports.initializeEditListeners(control);

};


/**
 * Show the time (arrival/departure) indicators in the save div.
 */
exports.showTimeIndicatorsToEdit = function(show, chimp) {
  if (!show) {
    $('.time').addClass('novisibility');
    return;
  }
  // If a chimp has arrived or is empty, we want to display the arrival
  // options. This means that a chimp won't be able to arrive and leave in the
  // same interval, but this was told to be ok. It simplifies our db logic for
  // sure, as we can stick to the 'single record per chimp per interval' model.
  var $timeIndicators;
  switch (chimp.time) {
    case timeLabels.absent:
    case timeLabels.arriveFirst:
    case timeLabels.arriveSecond:
    case timeLabels.arriveThird:
      $timeIndicators = $('.arrival');
      break;
    case timeLabels.continuing:
    case timeLabels.departFirst:
    case timeLabels.departSecond:
    case timeLabels.departThird:
      $timeIndicators = $('.depart');
      break;
    default:
      console.log('unrecognized chimp.time: ' + chimp.time);
  }
  $timeIndicators.removeClass('novisibility');
  // TODO: select the correct image as selected
  console.log('need to indicate the correct time in the save div: ' + chimp);
};


/**
 * Show the certainty as editable for the given chimp. if show is falsey, hide
 * the ui instead.
 */
exports.showCertaintyToEdit = function(show, chimp) {
  var $certaintyIndicator = $('#certainty');

  if (show) {
    $certaintyIndicator.removeClass('novisibility');
  } else {
    $certaintyIndicator.addClass('novisibility');
    return;
  }

  // Get all the certainty radio buttons, then filter for the one with the
  // matching value and set it to checked.
  var $allCertainty = $('input[name=certain]:radio');
  var $targetButton = $allCertainty.filter('[value=' + chimp.certainty + ']');

  if ($targetButton.length === 0) {
    console.log('Did not find radio certainty button for chimp: ' + chimp);
    return;
  }
  
  $targetButton.prop('checked', true);
};


exports.showWithinFiveToEdit = function(show, chimp) {
  var $withinFiveIndicator = $('#distance');

  if (show) {
    $withinFiveIndicator.removeClass('novisibility');
  } else {
    $withinFiveIndicator.addClass('novisibility');
    return;
  }

  // select the values for the chimp.
  var $allWithinFive = $('input[name=distance]:radio');
  var $targetButton = $allWithinFive.filter(
      '[value=' + chimp.withinFive + ']'
  );

  if ($targetButton.length === 0) {
    console.log('Did not find radio w/in 5 for chimp: ' + chimp);
  }

  $targetButton.prop('checked', true);
};


exports.showEstrusToEdit = function(show, chimp) {
  var $estrusIndicator = $('#state');

  if (show) {
    $estrusIndicator.removeClass('novisibility');
  } else {
    $estrusIndicator.addClass('novisibility');
    return;
  }

  // select the values for the chimp.
  var $allEstrus = $('input[name=sex_state]:radio');
  var $targetButton = $allEstrus.filter(
      '[value=' + chimp.estrus + ']'
  );

  if ($targetButton.length === 0) {
    console.log('Did not find radio estrus for chimp: ' + chimp);
  }

  $targetButton.prop('checked', true);
};


exports.showClosestToEdit = function(show, chimp) {
  var $closestIndicator = $('#close_focal');

  if (show) {
    $closestIndicator.removeClass('novisibility');
  } else {
    $closestIndicator.addClass('novisibility');
    return;
  }

  // select the values for the chimp.
  var $allClosest = $('input[name=close]:radio');
  var $targetButton = $allClosest.filter(
      '[value=' + chimp.closest + ']'
  );

  if ($targetButton.length === 0) {
    console.log('Did not find radio closest for chimp: ' + chimp);
  }

  $targetButton.prop('checked', true);
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
  // first unselect all other chimps, as we can only ever have one selected.
  $('*').removeClass('selected-chimp');

  // also remove all existing editing options
  exports.showCertaintyToEdit(false);
  exports.showWithinFiveToEdit(false);
  exports.showEstrusToEdit(false);
  exports.showClosestToEdit(false);
  exports.showTimeIndicatorsToEdit(false);
  
  // Then select the passed in chimp.
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

  if (!chimpId) {
    console.log('chimp id not defined: ' + chimpId);
    window.alert('chimp id not defined: ' + chimpId);
    throw new Error('chimp id not defind: ' + chimpId);
  }

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
 * Return the active food from the UI. Does NOT have to be a valid food that
 * can be saved. For instance, at first it might return 'mm' as the start time
 * place holder.
 */
exports.getFoodFromUi = function() {
  var startHours = $('#start-time-food-hours').val();
  var startMins = $('#start-time-food-mins').val();
  var startTime = startHours + ':' + startMins;

  var endHours = $('#end-time-food-hours').val();
  var endMins = $('#end-time-food-mins').val();
  var endTime = endHours + ':' + endMins;

  var food = $('#foods').val();
  var foodPart = $('#food-part').val();

  var date = urls.getFollowDateFromUrl();
  var focalId = urls.getFocalChimpIdFromUrl();

  var rowId = $('#food-summary').attr('__rowid');
  if (rowId === '') {
    rowId = null;
  }

  var result = new models.Food(
      rowId,
      date,
      focalId,
      startTime,
      endTime,
      food,
      foodPart
  );
  
  return result;
};


/**
 * Return the active species from the UI.
 */
exports.getSpeciesFromUi = function() {
  var startHours = $('#start-time-species-hours').val();
  var startMins = $('#start-time-species-mins').val();
  var startTime = startHours + ':' + startMins;

  var endHours = $('#end-time-species-hours').val();
  var endMins = $('#end-time-species-mins').val();
  var endTime = endHours + ':' + endMins;

  var species = $('#species').val();
  var number = $('#species_number').val();

  var date = urls.getFollowDateFromUrl();
  var focalId = urls.getFocalChimpIdFromUrl();

  var rowId = $('#species-summary').attr('__rowid');
  if (rowId === '') {
    rowId = null;
  }

  var result = new models.Species(
      rowId,
      date,
      focalId,
      startTime,
      endTime,
      species,
      number
  );
  
  return result;
};


/**
 * Make chimp-specific items visible as necessary. E.g. if the chimp is
 * present, it should be possible to edit the certainty, etc. To be editble
 * they have to be visible.
 */
exports.updateVisiblityForChimp = function(chimp) {
  var timeId = getIdForTime(chimp);
  var $time = $('#' + timeId);

  var withinFiveId = getIdForWithinFiveMeters(chimp);
  var $withinFive = $('#' + withinFiveId);

  var certaintyId = getIdForCertainty(chimp);
  var $certainty = $('#' + certaintyId);

  var estrusId = getIdForEstrus(chimp);
  var $estrus = $('#' + estrusId);

  var closestId = getIdForClosest(chimp);
  var $closest = $('#' + closestId);

  // We want to make things editable in every instance except absence.
  if (chimp.time !== timeLabels.absent) {
    $time.removeClass('novisibility');
    $withinFive.removeClass('novisibility');
    $certainty.removeClass('novisibility');
    $estrus.removeClass('novisibility');
    $closest.removeClass('novisibility');
  } else {
    $time.addClass('novisibility');
    $withinFive.addClass('novisibility');
    $certainty.addClass('novisibility');
    $estrus.addClass('novisibility');
    $closest.addClass('novisibility');
  }
};


/**
 * Updates the UI after loading a page.
 * 
 * This used to be called 'display', in case you're looking for that method.
 */
exports.initializeUi = function(control) {

  logging.initializeLogging();

  $('.food-container').addClass('nodisplay');
  $('.species-container').addClass('nodisplay');

  // Hide the editing UI to start with.
  //$('#time').addClass('novisibility');
  $('.arrival').addClass('novisibility');
  $('.depart').addClass('novisibility');
  $('#certainty').addClass('novisibility');
  $('#distance').addClass('novisibility');
  $('#state').addClass('novisibility');
  $('#close_focal').addClass('novisibility');

  exports.updateUiForFollowTime();
  exports.updateUiForFocalId();
  exports.initializePreviousButton(control);

  exports.initializeListeners(control);
  exports.initializeFood(control);
  exports.initializeSpecies(control);

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

  exports.refreshSpeciesList(control);
  exports.refreshFoodList(control);

  // 15 minutes
  var intervalDuration = 1000 * 60 * 15;
  window.setTimeout(exports.updateUiForEndOfInterval, intervalDuration);

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


  // update the chimps for the previous timepoint
  var previousTime = util.decrementTime(followStartTime);
  var previousTableData = db.getTableDataForTimePoint(
      control,
      date,
      previousTime,
      focalChimpId
  );
  var prevChimps = db.convertTableDataToChimps(previousTableData);
  chimps = db.updateChimpsForPreviousTimepoint(prevChimps, chimps);

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
