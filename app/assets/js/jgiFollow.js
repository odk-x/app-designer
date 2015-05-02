'use strict';

/**
 * Code for dealing with the follow screen, in particular the UI.
 */

var urls = require('./jgiUrls');
var models = require('./jgiModels');
var db = require('./jgiDb');
var $ = require('jquery');
var util = require('./jgiUtil');
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

  switch (chimp.time) {
    case timeLabels.absent:
      $img.src = imagePaths.absent;
      break;
    case timeLabels.continuing:
      $img.src = imagePaths.continuing;
      break;
    case timeLabels.arriveFirst:
      $img.src = imagePaths.arriveFirst;
      break;
    case timeLabels.arriveSecond:
      $img.src = imagePaths.arriveSecond;
      break;
    case timeLabels.arriveThird:
      $img.src = imagePaths.arriveThird;
      break;
    case timeLabels.departFirst:
      $img.src = imagePaths.departFirst;
      break;
    case timeLabels.departSecond:
      $img.src = imagePaths.departSecond;
      break;
    case timeLabels.departThird:
      $img.src = imagePaths.departThird;
      break;
    default:
      console.log('unrecognized time label: ' + chimp.time);
  }

  $('#' + id).attr('src', $img.src); 


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
  var imageId = chimpid + "_img";  
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
      case certaintyLabels.notApplicable:
        valueForDb = certaintyLabels.notApplicable;
        break;
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

    var chimp = exports.getSelectedChimp();
    assertFoundChimp(chimp);
    chimp.closest = valueForDb;

    exports.updateUiForChimp(chimp);
    db.writeRowForChimp(control, chimp, true);

    exports.showClosestToEdit(false);
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

  // Food
  $('#button-food').on('click', function() {
    console.log("food button clicked"); 
    $('.container').addClass('nodisplay');
    $('.food-container').removeClass('nodisplay');
  });


  // goes back to the page without saving any food or species data
  $('.go-back').on('click', function() {
    console.log("back to main follow screen"); 
    $('.container').removeClass('nodisplay');
    $('.food-container').addClass('nodisplay');
    $('.species-container').addClass('nodisplay');
  });

  // Species
  $('#button-species').on('click', function() {
    console.log("species button clicked")
    $('.container').addClass('nodisplay');
    $('.species-container').removeClass('nodisplay');

  });  


/**
 * Plug in the click listeners in the UI.
 */
exports.initializeListeners = function(control) {

  // saving the food item
  $('#saving_food').on('click', function() {
    console.log("food being saved button clicked"); 

    // makes main display visibile and food page visible
    $('.container').removeClass('nodisplay');
    $('.food-container').addClass('nodisplay');

    // retrieve food data from form
    var foodVal = $('#foods').val();
    var foodPartVal = $('#food-part').val();
    var startTime =  $('#start_time_food').val();
    var endTime = $('#end_time_food').val();
    var date = urls.getFollowDateFromUrl(); 
    var focalChimpId = urls.getFocalChimpIdFromUrl();

    if (foodPartVal != null) {
      foodPartVal = foodPartVal.toLowerCase(); 
    }   

    var food = models.createNewFood(
      date, 
      focalChimpId,
      startTime,
      endTime,
      foodVal,
      foodPartVal
    );

    if (endTime == null || endTime == undefined || endTime.length == 0) {
      db.writeRowForFood(control, food, false); 
    } else {
      db.writeRowForFood(control, food, true); 
    }
  });  

  // saving the species item
  $('#saving_species').on('click', function() {
    console.log("species being saved button clicked"); 

    // makes main display visibile and food page visible
    $('.container').removeClass('nodisplay');
    $('.species-container').addClass('nodisplay');

    // retrieve food data from form
    var speciesName = $('#species').val();
    var startTime = $('#start_time_species').val();
    var endTime =  $('#end_time_species').val();
    var speciesNumber = $('#species_number').val();
    var date = urls.getFollowDateFromUrl(); 
    var focalChimpId = urls.getFocalChimpIdFromUrl();

    if (speciesName != null) {
      speciesName = foodPartVal.toLowerCase(); 
    }   

    var species = models.createNewSpecies(
      date, 
      focalChimpId,
      startTime,
      endTime,
      speciesName,
      speciesNumber
    );

    if (endTime == null || endTime == undefined || endTime.length == 0) {
      db.writeRowForSpecies(control, species, false); 
    } else {
      db.writeRowForSpecies(control, species, true); 
    }
  });    

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
    //chimpid = chimpId;
    var chimp = exports.getChimpFromUi(chimpId);
    if (!chimp) {
      console.log(
        'could not find chimp represented in UI with id: ' + chimpId
      );
    }

    exports.showChimpIsSelected(chimp);

    exports.showTimeIndicatorsToEdit(true, chimp);

    // show that chimp has been selected

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
  var $timeIndicators = null; 
  var chimpid =getIdForTimeImage(chimp);
  var img_source = document.getElementById(chimpid).src;
  var array_splitting_with_slash = img_source.split("/");
  var current_img = array_splitting_with_slash[array_splitting_with_slash.length - 1];
  if (current_img == "time_empty.png") {
    $timeIndicators = $('.arrival');
  } else {
    $timeIndicators = $('.depart');
  }
  if (show) {
    $timeIndicators.removeClass('novisibility');
  } 
  
  
  if (!show) {
    $timeIndicators.addClass('novisibility');
    return;
  }

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

  // initializing food and species containers
  $('.food-container').addClass('nodisplay');
  $('.species-container').addClass('nodisplay');  
  // $( "#foods" ).combobox();
  // $( "#food-part" ).combobox();

  // $('#start_time_food').timepicker({
  //   timeFormat: 'HH:mm',
  //   minTime: '0:00:00',
  //   maxHour: 20,
  //   maxMinutes: 30,
  //   interval: 1 // 15 minutes
  // });  

  // $('#end_time_food').timepicker({
  //   timeFormat: 'HH:mm',
  //   minTime: '0:00:00',
  //   maxHour: 20,
  //   maxMinutes: 30,
  //   interval: 1 // 15 minutes
  // });  


  //window.alert('hello from script');

  // Hide the editing UI to start with.
  //$('#time').addClass('novisibility');
  $('.arrival').addClass('novisibility');
  $('.depart').addClass('novisibility');
  $('#certainty').addClass('novisibility');
  $('#distance').addClass('novisibility');
  $('#state').addClass('novisibility');
  $('#close_focal').addClass('novisibility');

  exports.initializeListeners(control);

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

<<<<<<< local
  // update chimp for previous timepoint
  var previousTime = util.decrementTime(followStartTime); 
  var previousTableData = db.getTableDataForTimePoint(
    control,
    date,
    previousTime,
    focalChimpId
  );
  var prevChimps = db.convertTableDataToChimps(previousTableData); 

  chimps = db.updateChimpsForPreviousTimepoint(prevChimps, chimps); 

=======
  // update chimp for previous timepoint
  var previousTime = util.decrementTime(followStartTime); 
  var table = exports.getTableDataforTimePoint(control, date, previousTime, focalChimpId);
  var prevChimps = exports.convertTableDataToChimps(table); 

  chimps = exports.updateChimpsForPreviousTimepoint(prevChimps, chimps); 

>>>>>>> other
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
