'use strict';

var test = require('tape');
var util = require('./jgiUtil');

test('convertToStringWithTwoZeros', function(t) {
  t.plan(2);

  var oneDigit = util.convertToStringWithTwoZeros(1);
  t.equal(oneDigit, '01');

  var twoDigits = util.convertToStringWithTwoZeros(10);
  t.equal(twoDigits, '10');

});


function getTimePointObj(dbTime, userTime) {
  var result = {};
  result.dbTime = dbTime;
  result.userTime = userTime;
  return result;
}

test('getDbAndUserTimesInInterval 14-12:30J', function(t) {
  t.plan(1);

  var actual = util.getDbAndUserTimesInInterval('14-12:30J');

  var target = [];
  target.push(getTimePointObj('14.00-12:30J', '12:30J'));
  target.push(getTimePointObj('14.01-12:31J', '12:31J'));
  target.push(getTimePointObj('14.02-12:32J', '12:32J'));
  target.push(getTimePointObj('14.03-12:33J', '12:33J'));
  target.push(getTimePointObj('14.04-12:34J', '12:34J'));
  target.push(getTimePointObj('14.05-12:35J', '12:35J'));
  target.push(getTimePointObj('14.06-12:36J', '12:36J'));
  target.push(getTimePointObj('14.07-12:37J', '12:37J'));
  target.push(getTimePointObj('14.08-12:38J', '12:38J'));
  target.push(getTimePointObj('14.09-12:39J', '12:39J'));
  target.push(getTimePointObj('14.10-12:40J', '12:40J'));
  target.push(getTimePointObj('14.11-12:41J', '12:41J'));
  target.push(getTimePointObj('14.12-12:42J', '12:42J'));
  target.push(getTimePointObj('14.13-12:43J', '12:43J'));
  target.push(getTimePointObj('14.14-12:44J', '12:44J'));
    
  t.deepEqual(actual, target);
});

