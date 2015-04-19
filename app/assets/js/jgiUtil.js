'use strict';

// var chimpIsPresent = function chimpIsPresent(chimpId) {

// };

// /**
//  * Get the default state for a chimp that nothing is known about. I.e. this
//  * would be the state of the chimp when the follow begins.
//  */
// var getDefaultChimpState = function getDefaultChimpState() {

// };

// // Mutate chimp states


exports.incrementTime = function(time) {

  var interval = 15;
  var parts = time.split(':');
  var hours = parseInt(parts[0]);
  var mins = parseInt(parts[1]);
  var maybeTooLarge = mins + interval;

  if (maybeTooLarge > 59) {
    // then we've overflowed our time system.
    mins = maybeTooLarge % 60;
    // Don't worry about overflowing hours. Not going to worry about
    // late night chimp monitoring.
    hours = hours + 1;
  } else {
    mins = maybeTooLarge;
  }

  // Format these strings to be two digits.
  var hoursStr = exports.convertToStringWithTwoZeros(hours);
  var minsStr = exports.convertToStringWithTwoZeros(mins);
  var result = hoursStr + ':' + minsStr;
  return result;

};


/**
 * Convert an integer to a string, padded to two zeros.
 */
exports.convertToStringWithTwoZeros = function(intTime) {

  if (intTime > 59) {
    throw new Error('invalid intTime: ' + intTime);
  }

  var result;
  if (intTime < 10) {
    result = '0' + intTime;
  } else {
    result = intTime.toString();
  }
  return result;

};
