'use strict';


/**
 * Convert hours an mins integers to a zero-padded string. 1,5, would become:
 * '01:05'.
 */
function convertToTime(hours, mins) {
  var hoursStr = exports.convertToStringWithTwoZeros(hours);
  var minsStr = exports.convertToStringWithTwoZeros(mins);
  return hoursStr + ':' + minsStr;
}


function sortItemsWithDate(objects) {
  objects.sort(function(a, b) {
    if (a.date < b.date) {
      return -1;
    } else if (a.date > b.date) {
      return 1;
    } else {
      return 0;
    }
  });
}

/**
 * A flag to be used for end time on species and food observations in the case
 * that an end time has not yet been set.
 */
exports.flagEndTimeNotSet = 'ongoing';


/**
 * Sort the array of Follow objects.
 */
exports.sortFollows = function(follows) {
  sortItemsWithDate(follows);
};


exports.sortFollowIntervals = function(intervals) {
  sortItemsWithDate(intervals);
};

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
 * Get an array of the times that fall within an interval. If you passed
 * '7:00', this would return an array of ['mm', '7:00', '7:01', ..., '7:14'].
 */
exports.getTimesInInterval = function(time) {
  var interval = 15;
  var parts = time.split(':');
  var hours = parseInt(parts[0]);
  var mins = parseInt(parts[1]);

  var result = ['mm'];
  // Fow now, assume our start times begin at 0, 15, 30, 45. This will prevent
  // us having to worry about overflowing.
  for (var i = 0; i < mins + interval; i++) {
    var newMins = mins + i;
    var nextTime = convertToTime(hours, newMins);
    result.push(nextTime);
  }
  
  return result;
};


/**
 * Return ['hh', '00', '01', ..., '23'].
 */
exports.getAllHours = function() {
  var result = ['hh'];
  for (var i = 0; i < 24; i++) {
    var hour = exports.convertToStringWithTwoZeros(i);
    result.push(hour);
  }
  return result;
};


/**
 * Return ['mm', '01', '02', ..., '59']
 */
exports.getAllMinutes = function() {
  var result = ['mm'];
  for (var i = 0; i < 60; i++) {
    var mins = exports.convertToStringWithTwoZeros(i);
    result.push(mins);
  }
  return result;
};


/**
 * True if parseInt will succeed.
 */
exports.isInt = function(val) {
  // This is kind of hacky, but it will do for converting from user input.
  return val !== '' && !isNaN(val);
};


exports.decrementTime = function(time) {
  var interval = 15;
  var parts = time.split(':');
  var hours = parseInt(parts[0]);
  var mins = parseInt(parts[1]);
  var maybeTooSmall = mins - interval;

  if (maybeTooSmall < 0) {
    // negative time
    mins = 60 + maybeTooSmall;
    hours = (hours === 24) ? 0 : (hours - 1);
  } else {
    mins = maybeTooSmall;
  }

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
