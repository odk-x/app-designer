/* global confirm */
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

var FLAG_PLACE_HOLDER_TIME = 's:dk';
var FOOD_LIST_COOKIE = "JGIRecentFoodsList";
var RECENT_FOODS_MAX = 10;


/**
 * We have to store the actual number of the species in the db as integers, but
 * we want to represent ranges.
 */
var speciesNumberLabelsUser = {
  '1': '1',
  '2': '2-9',
  '10': '10-19',
  '20': '20+'
};


/**
 * Get the user-facing label for a given db-safe species number.
 */
function getSpeciesNumberUserLabel(dbNumber) {
  return speciesNumberLabelsUser[dbNumber];
}

function assertIsChimp(chimp) {
  if (chimp.constructor.name !== 'Chimp') {
    throw new Error('parameter must be a chimp');
  }
}


/**
 * Return an array of Chimp objects for the time before this one, returns an
 * empty array if no data or if can't be decremented.
 */
function getChimpsForPreviousTimepoint(control, currentTime, date, focalId) {
  if (!util.canDecrementTime(currentTime)) {
    return [];
  }
  var prevTime = util.decrementTime(currentTime);
  var prevTableData = db.getTableDataForTimePoint(
      control,
      date,
      prevTime,
      focalId
  );

  var result = db.convertTableDataToChimps(prevTableData);
  return result;
}


function assertFoundChimp(chimp) {
  if (!chimp) {
    console.log('could not find selected chimp!');
    window.alert('could not find selected chimp!');
    throw new Error('could not find selected chimp');
  }
}


/**
 * Append all valid minutes for this time as options to the $select.
 */
function appendTimesToSelect($select) {
  var currentTime = urls.getFollowTimeFromUrl();
  var validTimes = util.getDbAndUserTimesInInterval(currentTime);
  // The first value we want to be the place holder time.
  var placeHolderTime = {};
  placeHolderTime.dbTime = FLAG_PLACE_HOLDER_TIME;
  placeHolderTime.userTime = FLAG_PLACE_HOLDER_TIME;
  validTimes.unshift(placeHolderTime);
  validTimes.forEach(function(time) {
    var option = $('<option></option>');
    option.attr('value', time.dbTime);
    option.text(time.userTime);
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

  fetchFoods();
  fetchFoodParts();
}

/**
 * Read the food list from the config file and populate the UI.
 */
function fetchFoods() {
  var $foodsNode = $(".foods");

  // Clear old list and start fresh
  $foodsNode.empty();
  $foodsNode.append("<option value=\"0\">Chagua Chakula</option>");

  // Check for recent foods in the cookies
  var recentFoods = getRecentFoods();
  for (var i = 0; i < recentFoods.length; i++) {
    var food = recentFoods[i];
    $foodsNode.append("<option value=\"" + food + "\"><a id=\"" + food +
                      "\" class=\"food food-show\" href=\"#\">" + food + "</option>");
  }

  // Retrieve the full list from the text file
  var foodData = $.ajax({type: "GET", url: "config/foodList.txt", async:false}).responseText;
  var foodItems = foodData.split("\n");
  for (var i = 0; i < foodItems.length; i++) {
    if (foodItems[i]) {
      var foodValue = foodItems[i].trim().toLowerCase().replace(" ", "_");
      $foodsNode.append("<option value=\"" + foodValue + "\"><a id=\"" + foodValue +
                        "\" class=\"food food-show\" href=\"#\">" + foodItems[i] + "</option>");
    }
  }
}

/**
 * Read the food part list from the config file and populate the UI.
 */
function fetchFoodParts() {
  var $foodPartNode = $(".food-part");

  var foodPartData = $.ajax({type: "GET", url: "config/foodPartList.txt", async:false}).responseText;
  var foodParts = foodPartData.split("\n");
  for (var i = 0; i < foodParts.length; i++) {
    if (foodParts[i]) {
      var foodPartValue = foodParts[i].trim().toLowerCase().replace(" ", "_");
      $foodPartNode.append("<option value=\"" + foodPartValue + "\"><a id=\"" + foodPartValue +
                          "\" class=\"foodPart foodPart-show\" href=\"#\">" + foodParts[i] + "</option>");
    }
  }
}

/**
 * Stores a food at the top of the most recent foods list in the cookie
 */
function addToRecentFoods(newFood) {
  var foodList, foodCookie, index;
  foodList = getRecentFoods();

  // If the food is already in the list, remove it to prevent a duplicate
  index = foodList.indexOf(newFood);
  if (index >= 0) {
    foodList.splice(index, 1);
  }

  // Prepend the food to the front of the list
  foodList.unshift(newFood);

  if (foodList.length > RECENT_FOODS_MAX) {
    foodList.splice(RECENT_FOODS_MAX, foodList.length);
  }

  // Repackage as a string
  foodCookie = foodList.join(',');
  docCookies.setItem(FOOD_LIST_COOKIE, foodCookie, Infinity);
}

/**
 * Retrieves the recent food list cookie contents
 */
function getRecentFoods() {
  var foodList;
  if (docCookies.hasItem(FOOD_LIST_COOKIE)) {
    foodList = docCookies.getItem(FOOD_LIST_COOKIE);
    foodList = foodList.split(",");
  } else {
    foodList = [];
  }

  return foodList;
}

/**
 * Show the species editing div, hiding the food and chimps.
 */
function showSpecies() {
  $('.container').addClass('nodisplay');
  $('.food-container').addClass('nodisplay');
  $('.species-container').removeClass('nodisplay');
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

  $('.food-summary').removeAttr('__data');
  $('.species-summary').removeAttr('__data');

  $('.food-negative-message').addClass('nodisplay');
  $('.species-negative-message').addClass('nodisplay');

  exports.updateSaveFoodButton();
  exports.updateSaveSpeciesButton();
}


function timeIsValid(time) {
  // hh:mm is the default input. Faking begins with and ends with here.
  return (
    time &&
    time !==
    FLAG_PLACE_HOLDER_TIME && time !== ''
  );
}


function foodIsNegativeDuration(food) {
  if (timeIsValid(food.startTime)) {
    if (food.endTime !== util.flagEndTimeNotSet && timeIsValid(food.endTime)) {
      if (util.isNegativeDuration(food.startTime, food.endTime)) {
        return true;
      }
    }
  }
  return false;
}

function speciesIsNegativeDuration(species) {
  if (timeIsValid(species.startTime)) {
    if (
        species.endTime !== util.flagEndTimeNotSet &&
        timeIsValid(species.endTime))
    {
      if (util.isNegativeDuration(species.startTime, species.endTime)) {
        return true;
      }
    }
  }
  return false;
}


/**
 * True if the food can be persisted. This means all is valid except rowId and
 * end time.
 */
function foodCanBePersisted(food) {
  if (foodIsNegativeDuration(food)) {
    return false;
  }
  return (
      timeIsValid(food.startTime) &&
      food.foodName &&
      food.foodName !== '' &&
      food.foodPartEaten &&
      food.foodPartEaten !== ''
  );
}


/**
 * True if the species can be persisted. This means all is valid except rowId
 * and end time.
 */
function speciesCanBePersisted(species) {
  if (speciesIsNegativeDuration(species)) {
    return false;
  }
  return (
      timeIsValid(species.startTime) &&
      species.speciesName &&
      species.number &&
      species.number !== 0 &&
      species.number !== '0'
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
    option.text(
      getSpeciesNumberUserLabel(species.number) +
      ' ' +
      species.speciesName
    );

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

  if (activeSpecies.length === 0) {
    $activeList.removeClass('ongoing-list');
  } else {
    $activeList.addClass('ongoing-list');
  }

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

  if (activeFood.length === 0) {
    $activeList.removeClass('ongoing-list');
  } else {
    $activeList.addClass('ongoing-list');
  }

  exports.addFoodToList(activeFood, $activeList);
  exports.addFoodToList(completedFood, $completedList);
};


exports.editExistingFood = function(food) {
  var $sumStartTime = $('#food-summary-start-time');
  var $sumEndTime = $('#food-summary-end-time');
  var $sumName = $('#food-summary-food');
  var $sumPart = $('#food-summary-part');
  var $foodSummary = $('#food-summary');

  var $editName = $('#foods');
  var $editPart = $('#food-part');

  var userStartTime = util.getUserTimeFromDbTime(food.startTime);
  $sumStartTime.attr('__data', food.startTime);
  $sumStartTime.text(userStartTime);

  if (food.endTime !== util.flagEndTimeNotSet) {
    var userEndTime = util.getUserTimeFromDbTime(food.endTime);
    $sumEndTime.attr('__data', food.endTime);
    $sumEndTime.text(userEndTime);
  }

  $sumName.text(food.foodName);
  $sumName.attr('__data',food.foodName);
  $editName.val(food.foodName);

  $sumPart.text(food.foodPartEaten);
  $sumPart.attr('__data',food.foodPartEaten);
  $editPart.val(food.foodPartEaten);

  $foodSummary.attr('__rowid', food.rowId);

  exports.updateSaveFoodButton();

  showFood();
};


exports.editExistingSpecies = function(species) {
  var $sumStartTime = $('#species-summary-start-time');
  var $sumEndTime = $('#species-summary-end-time');
  var $sumName = $('#species-summary-name');
  var $sumNumber = $('#species-summary-number');
  var $speciesSummary = $('#species-summary');

  var $editName = $('#species');
  var $editPart = $('#species_number');

  var userStartTime = util.getUserTimeFromDbTime(species.startTime);
  $sumStartTime.attr('__data', species.startTime);
  $sumStartTime.text(userStartTime);

  if (species.endTime !== util.flagEndTimeNotSet) {
    var userEndTime = util.getUserTimeFromDbTime(species.endTime);
    $sumEndTime.attr('__data', species.endTime);
    $sumEndTime.text(userEndTime);
  }

  $sumName.text(species.speciesName);
  $sumName.attr('__data', species.speciesName);
  $editName.val(species.speciesName);

  $sumNumber.text(getSpeciesNumberUserLabel(species.number));
  $sumNumber.attr('__data', species.number);
  $editPart.val(species.number);

  $speciesSummary.attr('__rowid', species.rowId);

  showSpecies();
};


exports.updateNegativeFoodDurationMessage = function() {
  var food = exports.getFoodFromUi();
  var $foodMsg = $('#food-negative-message');

  if (foodIsNegativeDuration(food)) {
    $foodMsg.removeClass('nodisplay');
  } else {
    $foodMsg.addClass('nodisplay');
  }
};


exports.updateNegativeSpeciesDurationMessage = function() {
  var species = exports.getSpeciesFromUi();
  var $speciesMsg = $('#species-negative-message');

  if (speciesIsNegativeDuration(species)) {
    $speciesMsg.removeClass('nodisplay');
  } else {
    $speciesMsg.addClass('nodisplay');
  }
};


/**
 * Enable or disable the food save button as appropriate.
 */
exports.updateSaveFoodButton = function() {
  var $saveFood = $('#saving_food');

  if (validFoodSelected()) {
    $saveFood.prop('disabled', false);
  } else {
    $saveFood.prop('disabled', true);
  }
};


/**
 * Update the UI after an edit to a species has taken place.
 */
exports.updateSaveSpeciesButton = function() {
  var $saveSpecies = $('#saving_species');

  if (validSpeciesSelected()) {
    $saveSpecies.prop('disabled', false);
  } else {
    $saveSpecies.prop('disabled', true);
  }
};


/**
 * Labels that are used to indicate at what point in a 15 minute interval a
 * chimp arrived.
 */
var timeLabels = db.timeLabels;

/**
 * The labels we use to indicate certainty of an observation. These are the
 * labels we use internally, not the ones shown to the user.
 */
var certaintyLabels = db.certaintyLabels;

/**
 * The labels for certainty that are shown to a user.
 */
var certaintyLabelsUser = {
  certain: '✓',
  uncertain: '•',
  nestCertain: 'N✓',
  nestUncertain: 'N•'
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
    case certaintyLabels.nestCertain:
      $certainty.text(certaintyLabelsUser.nestCertain);
      break;
    case certaintyLabels.nestUncertain:
      $certainty.text(certaintyLabelsUser.nestUncertain);
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
    followTimeUser = util.getUserTimeFromDbTime(followTime);
  }

  $('#time-label').text(followTimeUser);

};

exports.updateUiForCommunity = function() {

  var community = urls.getCommunityFromUrl();
  var $chimps = $("#table-container");

  if (!community || community === '') {
    console.log('No community has been specified!');
    return;
  }

  initializeChimpTable($chimps);

  var chimpListCSV = $.ajax({type: "GET", url: "config/chimpList.csv", async:false}).responseText;

  // Fetch chimps in this community
  Papa.parse(chimpListCSV, {
    header: true,
    complete: function(results) {
      var chimpData = results["data"];
      var femaleChimps = [];
      var maleChimps = [];
      var tableData = "";

      // Collect all chimps and organize them into gender lists
      for (var i = 0; i < chimpData.length; i++) {
        var currChimp = chimpData[i]["Chimp"];
        var currCommunity = chimpData[i]["Community"];
        var currGender = chimpData[i]["Sex"];
        if (currChimp && currCommunity === community) {
          if (currGender === "F") {
            femaleChimps.push(currChimp);
          } else if (currGender === "M") {
            maleChimps.push(currChimp);
          }
        }
      }

      $chimps.empty();
      tableData = initializeChimpTable();

      tableData += addGenderListToTable(femaleChimps, true);
      tableData += addGenderListToTable(maleChimps, false);

      tableData += "</table>";

      $chimps.append(tableData);
    },
    error: function() {
      alert("Error reading chimp list");
    }
  });

};

function addGenderListToTable(genderList, isFemale) {
  var tableData = "";
  var lastRowIndex = genderList.length - (genderList.length % 2 === 0 ? 2 : 1);

  for (var i = 0; i < genderList.length; i++) {
    var isLeftColumn = (i % 2 === 0);

    // The last row in the female portion gets a css class to delineate the border
    if (isFemale && (i === lastRowIndex)) {
      tableData += "<tr class=\"male-female-divider\">";
    } else if (isLeftColumn) {
      tableData +="<tr>";
    }

    tableData += generateChimpTableData(genderList[i], isFemale);

    // If there are an odd number of chimps, end the row with only one column
    if (!isLeftColumn || (i === lastRowIndex && i % 2 !== 0)) {
      tableData += "</tr>";
    } else {
      tableData += "<td></td>";
    }

  }

  return tableData;
}

function initializeChimpTable() {
  return ("<table id=\"observation-table\" style=\"font-size: 10.5px;\">" +
          "<tr>" +
          "<td></td>" +
          "<td></td>" +
          "<td>C</td>" +
          "<td>U</td>" +
          "<td>5m</td>" +
          "<td>JK</td>" +
          "<td style=\"padding-right: 1.3em;\"></td>" +
          "<td></td>" +
          "<td></td>" +
          "<td>C</td>" +
          "<td>U</td>" +
          "<td>5m</td>" +
          "<td>JK</td>" +
          "</tr>");
}

function generateChimpTableData(chimp, isFemale) {
  var chimpVal = chimp.trim().toLowerCase().replace(" ", "_");

  return ("<td><button id=\"" + chimpVal + "\" class=\"" +
          (isFemale ? "female" : "male") + "-chimp chimp\">" + chimp + "</button></td>" +
          "<td class=\"time_point\" id=\"" + chimpVal + "_time\">" +
          "<img src=\"./img/time_empty.png\" id=\"" + chimpVal + "_time_img\"/></td>" +
          "<td><button class=\"certainty\" id=\"" + chimpVal + "_cer\">✓</button></td>" +
          "<td><button class=\"sexual_state\" id=\"" + chimpVal + "_sexState\">U</button></td>" +
          "<td><button class=\"5-meter\" id=\"" + chimpVal + "_five\">&#x2717;</button></td>" +
          "<td><button class=\"closeness\" id=\"" + chimpVal + "_close\">&#x2717;</button></td>");
}

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
  var communityId = urls.getCommunityFromUrl();

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
      focalId,
      communityId
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
exports.updateIconForSelectedChimp = function(chimp, chimpid) {
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
      case certaintyLabels.nestCertain:
        valueForDb = certaintyLabels.nestCertain;
        break;
      case certaintyLabels.nestUncertain:
        valueForDb = certaintyLabels.nestUncertain;
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

  $('#start-time-food').change(function() {
    var $foodSummaryStart = $('#food-summary-start-time');
    var $foodEditStart = $('#start-time-food');
    var foodEditStartDb = $foodEditStart.val();

    if (timeIsValid(foodEditStartDb)) {
      var userStartTime = util.getUserTimeFromDbTime(foodEditStartDb);
      $foodSummaryStart.text(userStartTime);
      $foodSummaryStart.attr('__data', foodEditStartDb);
    } else {
      $foodSummaryStart.text('?');
      $foodSummaryStart.removeAttr('__data');
    }
    exports.updateNegativeFoodDurationMessage();
    exports.updateSaveFoodButton();
  });

  $('#end-time-food').change(function() {
    var $foodSummaryEnd = $('#food-summary-end-time');
    var $foodEditEnd = $('#end-time-food');
    var foodEditEndDb = $foodEditEnd.val();

    if (timeIsValid(foodEditEndDb)) {
      var userEndtime = util.getUserTimeFromDbTime(foodEditEndDb);
      $foodSummaryEnd.text(userEndtime);
      $foodSummaryEnd.attr('__data', foodEditEndDb);
    } else {
      $foodSummaryEnd.text('?');
      $foodSummaryEnd.removeAttr('__data');
    }
    exports.updateNegativeFoodDurationMessage();
    exports.updateSaveFoodButton();
  });

  $('#foods').change(function() {
    var $foodSummaryFood = $('#food-summary-food');
    var $foodEditName = $('#foods');
    var foodEditName = $foodEditName.val();

    if (foodEditName !== '0') {
      $foodSummaryFood.text(foodEditName);
      $foodSummaryFood.attr('__data', foodEditName);
    } else {
      $foodSummaryFood.text('?');
      $foodSummaryFood.removeAttr('__data');
    }
    exports.updateSaveFoodButton();
  });

  $('#food-part').change(function() {
    var $foodSummaryPart = $('#food-summary-part');
    var $foodEditPart = $('#food-part');
    var foodEditPart = $foodEditPart.val();

    if (foodEditPart !== '0') {
      $foodSummaryPart.text(foodEditPart);
      $foodSummaryPart.attr('__data', foodEditPart);
    } else {
      $foodSummaryPart.text('?');
      $foodSummaryPart.removeAttr('__data');
    }
    exports.updateSaveFoodButton();
  });

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

    addToRecentFoods(activeFood.foodName);

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
  $('#start-time-species').change(function() {
    var $speciesSummaryStart = $('#species-summary-start-time');
    var $speciesEditStart = $('#start-time-species');
    var speciesEditStartDb = $speciesEditStart.val();

    if (timeIsValid(speciesEditStartDb)) {
      var userStartTime = util.getUserTimeFromDbTime(speciesEditStartDb);
      $speciesSummaryStart.text(userStartTime);
      $speciesSummaryStart.attr('__data', speciesEditStartDb);
    } else {
      $speciesSummaryStart.text('?');
      $speciesSummaryStart.removeAttr('__data');
    }
    exports.updateNegativeSpeciesDurationMessage();
    exports.updateSaveSpeciesButton();
  });

  $('#end-time-species').change(function() {
    var $speciesSummaryEnd = $('#species-summary-end-time');
    var $speciesEditEnd = $('#end-time-species');
    var speciesEditEndDb = $speciesEditEnd.val();

    if (timeIsValid(speciesEditEndDb)) {
      var userTime = util.getUserTimeFromDbTime(speciesEditEndDb);
      $speciesSummaryEnd.text(userTime);
      $speciesSummaryEnd.attr('__data', speciesEditEndDb);
    } else {
      $speciesSummaryEnd.text('?');
      $speciesSummaryEnd.removeAttr('__data');
    }
    exports.updateNegativeSpeciesDurationMessage();
    exports.updateSaveSpeciesButton();
  });

  $('#species').change(function() {
    var $speciesSummaryName = $('#species-summary-name');
    var $speciesEditName = $('#species');
    var speciesName = $speciesEditName.val();

    if (speciesName !== '0') {
      $speciesSummaryName.text(speciesName);
      $speciesSummaryName.attr('__data', speciesName);
    } else {
      $speciesSummaryName.text('?');
      $speciesSummaryName.removeAttr('__data');
    }
    exports.updateSaveSpeciesButton();
  });

  $('#species_number').change(function() {
    var $speciesSummaryNumber = $('#species-summary-number');
    var $speciesEditNumber = $('#species_number');
    var speciesNumber = $speciesEditNumber.val();

    if (speciesNumber !== '0') {
      // 0 is the default, illegal, unselectable value
      $speciesSummaryNumber.text(getSpeciesNumberUserLabel(speciesNumber));
      $speciesSummaryNumber.attr('__data', speciesNumber);
    } else {
      $speciesSummaryNumber.text('?');
      $speciesSummaryNumber.removeAttr('__data');
    }
    exports.updateSaveSpeciesButton();
  });

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
  var $startTime = $('#start-time-food');
  var $endTime = $('#end-time-food');

  appendTimesToSelect($startTime);
  appendTimesToSelect($endTime);

  // We'll start with the save button disabled. You have to select valid food
  // times to enable it.
  $('#saving_food').prop('disabled', true);

  exports.initializeFoodListeners(control);
};


exports.initializeSpecies = function(control) {
  var $startTime = $('#start-time-species');
  var $endTime = $('#end-time-species');

  appendTimesToSelect($startTime);
  appendTimesToSelect($endTime);

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
      noClosestOk = confirm('Hakuna sokwe jirani. Una uhakika?');
    } else {
      noClosestOk = true;
    }

    var $withinFiveElement = $('.5-meter[__data=1]');
    var noneWithin5Ok = false;
    if ($withinFiveElement.length === 0) {
      noneWithin5Ok = confirm('Hakuna sokwe ndani ya 5m. Una uhakika?');
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
      urls.getFocalChimpIdFromUrl(),
      urls.getCommunityFromUrl()
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
 * Return the active food from the summary UI. Does NOT have to be a valid food
 * that can be saved.
 */
exports.getFoodFromUi = function() {
  var startTime = $('#food-summary-start-time').attr('__data');
  var endTime = $('#food-summary-end-time').attr('__data');
  var food = $('#food-summary-food').attr('__data');
  var foodPart = $('#food-summary-part').attr('__data');

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
 * Return the active species from the summary UI.
 */
exports.getSpeciesFromUi = function() {
  var startTime = $('#species-summary-start-time').attr('__data');
  var endTime = $('#species-summary-end-time').attr('__data');
  var species = $('#species-summary-name').attr('__data');
  var number = $('#species-summary-number').attr('__data');

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

  exports.updateUiForCommunity();

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

  if (!existingData || existingData.getCount() === 0) {
    exports.handleFirstTime(
        control,
        urls.getFollowDateFromUrl(),
        urls.getFollowTimeFromUrl(),
        urls.getFocalChimpIdFromUrl()
    );
  } else {
    exports.handleExistingTime(
        control,
        urls.getFollowDateFromUrl(),
        urls.getFollowTimeFromUrl(),
        urls.getFocalChimpIdFromUrl(),
        existingData
    );
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
  var prevChimps = getChimpsForPreviousTimepoint(
      control,
      followStartTime,
      date,
      focalChimpId
  );
  chimps = db.updateChimpsForPreviousTimepoint(prevChimps, chimps, false);

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
exports.handleExistingTime = function(
    control,
    date,
    startTime,
    focalId,
    existingData
) {

  // Find previous data and update the chimps in case one was added
  // retroActively.
  var currChimps = db.convertTableDataToChimps(existingData);
  var prevChimps = getChimpsForPreviousTimepoint(
      control,
      startTime,
      date,
      focalId
  );

  currChimps = db.updateChimpsForPreviousTimepoint(
      prevChimps,
      currChimps,
      true
  );

  // Now write them. We don't have to read them back in because we are writing
  // what we currently have as ground truth, we don't need to create row ids
  // like we do for handleFirstTime.
  currChimps.forEach(function(chimp) {
    db.writeRowForChimp(control, chimp, true);
  });

  currChimps.forEach(function(chimp) {
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


/**
 * Below is Firefox's cookies library.
 * TODO: This should be converted to browserify made available to the rest of the
 * project.
 */

/*\
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  Revision #1 - September 4, 2014
|*|
|*|  https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
|*|  https://developer.mozilla.org/User:fusionchess
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path[, domain]])
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

var docCookies = {
  getItem: function (sKey) {
    if (!sKey) { return null; }
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  },
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toUTCString();
          break;
      }
    }
    document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    return true;
  },
  removeItem: function (sKey, sPath, sDomain) {
    if (!this.hasItem(sKey)) { return false; }
    document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
    return true;
  },
  hasItem: function (sKey) {
    if (!sKey) { return false; }
    return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
  },
  keys: function () {
    var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
    for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
    return aKeys;
  }
};
