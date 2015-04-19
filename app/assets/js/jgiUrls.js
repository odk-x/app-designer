'use strict';

/**
 * Functions for manipulating URLs in the JGI app.
 */

/**
 * Query parameters we expect on URLs e.g. '?date=BLAH'.
 */
exports.queryParameters = {
  date: 'follow_date',
  time: 'follow_time',
  focalChimp: 'focal_chimp',

  beginToEat: 'begin_eating',
  eatenFood: 'eaten_food',
  eatenFoodPart: 'eaten_foodPart',

  timeOfPresence: 'time_presence',
  speciesName: 'name_species',
  numOfSpecies: 'num_of_species'
};


/**
 * Get the query parameter from the url. Note that this is kind of a hacky/lazy
 * implementation that will fail if the key string appears more than once, etc.
 */
exports.getQueryParameter = function(key) {
  var href = document.location.search;
  var startIndex = href.search(key);
  if (startIndex < 0) {
    console.log('requested query parameter not found: ' + key);
    return null;
  }
  // Then we want the substring beginning after "key=".
  var indexOfValue = startIndex + key.length + 1;  // 1 for '='
  // And now it's possible that we have more than a single url parameter, so
  // only take as many characters as we need. We'll stop at the first &,
  // which is what specifies more keys.
  var fromValueOnwards = href.substring(indexOfValue);
  var stopAt = fromValueOnwards.search('&');
  if (stopAt < 0) {
    return decodeURIComponent(fromValueOnwards);
  } else {
    return decodeURIComponent(fromValueOnwards.substring(0, stopAt));
  }
};

exports.createParamsForFollow = function(date, time, focalChimp) {

  var result =
    '?' +
    exports.queryParameters.date +
    '=' +
    encodeURIComponent(date) +
    '&' +
    exports.queryParameters.time +
    '=' +
    encodeURIComponent(time) +
    '&' +
    exports.queryParameters.focalChimp +
    '=' +
    encodeURIComponent(focalChimp);
  return result;

};

exports.createParamsForFood = function(
    date,
    time,
    focalChimp,
    beginToEat,
    food,
    foodPart
) {

  var result = exports.createParamsForFollow(date, time, focalChimp);
  result +=
    '&' +
    exports.queryParameters.beginToEat +
    '=' +
    encodeURIComponent(beginToEat) +
    '&' +
    exports.queryParameters.eatenFood +
    '=' +
    encodeURIComponent(food) +
    '&' +
    exports.queryParameters.eatenFoodPart +
    '=' +
    encodeURIComponent(foodPart);

  return result;
  
};

exports.createParamsForSpecies = function(
    date,
    time,
    focalChimp,
    timeOfPresence,
    speciesName,
    numOfSpecies
) {

  var result = exports.createParamsForFollow(date, time, focalChimp);
  result +=
    '&' +
    exports.queryParameters.timeOfPresence +
    '=' +
    encodeURIComponent(timeOfPresence) +
    '&' +
    exports.queryParameters.speciesName +
    '=' +
    encodeURIComponent(speciesName) +
    '&' +
    exports.queryParameters.numOfSpecies +
    '=' +
    encodeURIComponent(numOfSpecies);

  return result;

};


exports.getFollowTimeFromUrl = function() {

  var result = exports.getQueryParameter(exports.queryParameters.time);
  return result;

};


exports.getFollowDateFromUrl = function() {

  var result = exports.getQueryParameter(exports.queryParameters.date);
  return result;

};


exports.getFocalChimpIdFromUrl = function() {

  var result = exports.getQueryParameter(exports.queryParameters.focalChimp);
  return result;

};
