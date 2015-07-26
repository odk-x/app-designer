'use strict';

// This is the strange list of times that Ian wants to use. A and J for am/pm
// but in the Swahili form. The strange looping of times is something to do
// with how local time is kept.
var times = [
  '00-12:00A',
  '01-12:15A',
  '02-12:30A',
  '03-12:45A',
  '04-1:00A',
  '05-1:15A',
  '06-1:30A',
  '07-1:45A',
  '08-2:00A',
  '09-2:15A',
  '10-2:30A',
  '11-2:45A',
  '12-3:00A',
  '13-3:15A',
  '14-3:30A',
  '15-3:45A',
  '16-4:00A',
  '17-4:15A',
  '18-4:30A',
  '19-4:45A',
  '20-5:00A',
  '21-5:15A',
  '22-5:30A',
  '23-5:45A',
  '21-6:00J',
  '22-6:15J',
  '23-6:30J',
  '24-6:45J',
  '25-7:00J',
  '26-7:15J',
  '27-7:30J',
  '28-7:45J',
  '29-8:00J',
  '30-8:15J',
  '31-8:30J',
  '32-8:45J',
  '33-9:00J',
  '34-9:15J',
  '35-9:30J',
  '36-9:45J',
  '37-10:00J',
  '38-10:15J',
  '39-10:30J',
  '40-10:45J',
  '41-11:00J',
  '42-11:15J',
  '43-11:30J',
  '44-11:45J',
  '45-12:00J',
  '46-12:15J',
  '47-12:30J',
  '48-12:45J',
  '49-1:00J',
  '50-1:15J',
  '51-1:30J',
  '52-1:45J',
  '53-2:00J',
  '54-2:15J',
  '55-2:30J',
  '56-2:45J'
];

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
 * Return an array of all the times that will be stored in the database. These
 * are not user-facing, but are intended to be stored in the database
 * representing a particular time.
 */
exports.getAllTimesForDb = function() {
  // return a defensive copy
  return times.slice();
};


/**
 * Convert a user time to its db representation.
 */
exports.getDbTimeFromUserTime = function(userTime) {
  var userTimes = exports.getAllTimesForUser();

  var index = userTimes.indexOf(userTime);
  if (index < 0) {
    throw 'cannot find user time: ' + userTime;
  }

  return exports.getAllTimesForDb()[index];
};


exports.getUserTimeFromDbTime = function(dbTime) {
  var userTimes = exports.getAllTimesForUser();
  var dbTimes = exports.getAllTimesForDb();

  var index = dbTimes.indexOf(dbTime);
  if (index < 0) {
    throw 'Unrecognized db time: ' + dbTime;
  }

  return userTimes[index];
};


/**
 * Return an array of all user-facing time labels. These are the user-facing
 * strings corresponding to the database-facing strings returned by
 * getAllTimesForDb.
 */
exports.getAllTimesForUser = function() {
  var result = [];
  times.forEach(function(val) {
    // We expect something like 01-12:00J, so find the first - and take
    // everything after that.
    var dashIndex = val.indexOf('-');
    var userTime = val.substring(dashIndex + 1);
    result.push(userTime);
  });
  return result;
};


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
