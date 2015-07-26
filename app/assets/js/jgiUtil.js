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
  '24-6:00J',
  '25-6:15J',
  '26-6:30J',
  '27-6:45J',
  '28-7:00J',
  '29-7:15J',
  '30-7:30J',
  '31-7:45J',
  '32-8:00J',
  '33-8:15J',
  '34-8:30J',
  '35-8:45J',
  '36-9:00J',
  '37-9:15J',
  '38-9:30J',
  '39-9:45J',
  '40-10:00J',
  '41-10:15J',
  '42-10:30J',
  '43-10:45J',
  '44-11:00J',
  '45-11:15J',
  '46-11:30J',
  '47-11:45J',
  '48-12:00J',
  '49-12:15J',
  '50-12:30J',
  '51-12:45J',
  '52-1:00J',
  '53-1:15J',
  '54-1:30J',
  '55-1:45J',
  '56-2:00J',
  '57-2:15J',
  '58-2:30J',
  '59-2:45J'
];


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


/**
 * Convert a time like '14.01-12:12J' to a completely user-facing time.
 */
exports.getUserTimeFromDbTime = function(dbTime) {
  var dashIndex = dbTime.indexOf('-');
  var result = dbTime.substring(dashIndex + 1);
  return result;
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


/**
 * Return the next time point from the given database-facing time. Throws an
 * error if canIncrementTime returns false.
 */
exports.incrementTime = function(time) {
  if (!exports.canIncrementTime(time)) {
    throw 'cannot increment time: ' + time;
  }
  var index = times.indexOf(time);
  var result = times[index + 1];
  return result;
};


/**
 * Take a database-facing time (e.g. 05-12:12J) and return an array of objects
 * with a 'dbTime' and 'userTime' value, corresponding to time points in the
 * interval specified by the dbTime parameter.
 *
 * The dbTime keys will have the prefix include '.00' to '.14' to accommodate
 * direct string comparisons. For instance, the time '00-12:00A' would return
 * an array like:
 * [
 *   {dbTime: 00.00-12:00A, userTime: 12:00A},
 *   {dbTime: 00.01-12:01A, userTime: 12:01A},
 *   ...
 *   {dbTime: 00.14-12:14A, userTime: 12:14A}
 * ]
 */
exports.getDbAndUserTimesInInterval = function(dbTime) {
  var dashIndex = dbTime.indexOf('-');
  var colonIndex = dbTime.indexOf(':');

  var prefix = dbTime.substring(0, dashIndex);
  var hour = dbTime.substring(dashIndex + 1, colonIndex);
  var mins = dbTime.substring(colonIndex + 1, colonIndex + 3);
  // Everything at the end.
  var period = dbTime.substring(colonIndex + 3);

  var result = [];

  for (var i = 0; i < 15; i++) {
    var minsNum = Number(mins);
    minsNum += i;
    
    var newMins;
    if (minsNum < 10) {
      newMins = '0' + String(minsNum);
    } else {
      newMins = String(minsNum);
    }

    var suffix;
    if (i < 10) {
      suffix = '0' + String(i);
    } else {
      suffix = String(i);
    }

    var newUserTime = hour + ':' + newMins + period;
    var newPrefix = prefix + '.' + suffix;
    var newDbTime = newPrefix + '-' + newUserTime;

    var timePoint = {};
    timePoint.dbTime = newDbTime;
    timePoint.userTime = newUserTime;
    result.push(timePoint);
  }

  return result;
};


/**
 * True if the two times represent a negative duration, else False. Returns
 * true also if either startDb or endDb is not truthy.
 *
 * Expects times to be in their db format, e.g. 13.01-12:00J.
 */
exports.isNegativeDuration = function(startDb, endDb) {
  if (!startDb || !endDb) {
    return true;
  }
  
  var startPrefix = startDb.substring(0, startDb.indexOf('-'));
  var endPrefix = endDb.substring(0, endDb.indexOf('-'));

  var startNum = Number(startPrefix);
  var endNum = Number(endPrefix);

  return endNum < startNum;
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


exports.canIncrementTime = function(time) {
  var index = times.indexOf(time);
  if (index < 0 || index === times.length) {
    return false;
  } else {
    return true;
  }
};


exports.canDecrementTime = function(time) {
  var index = times.indexOf(time);
  if (index < 0 || index === 0) {
    return false;
  } else {
    return true;
  }
};


/**
 * Return the previous time point for the given database-facing time. Throws an
 * error if canDecrementTime returns False.
 */
exports.decrementTime = function(time) {
  if (!exports.canDecrementTime(time)) {
    throw 'cannot decrement time: ' + time;
  }
  var index = times.indexOf(time);
  return times[index - 1];
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
