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


test('incrementTime 00:00', function(t) {
  t.plan(1);

  var actual = util.incrementTime('00:00');
  t.equal(actual, '00:15');

});


test('incrementTime 00:15', function(t) {
  t.plan(1);

  var actual = util.incrementTime('00:15');
  t.equal(actual, '00:30');

});


test('incrementTime 00:30', function(t) {
  t.plan(1);

  var actual = util.incrementTime('00:30');
  t.equal(actual, '00:45');

});


test('incrementTime 00:45', function(t) {
  t.plan(1);

  var actual = util.incrementTime('00:45');
  t.equal(actual, '01:00');

});


test('incrementTime 09:45', function(t) {
  t.plan(1);

  var actual = util.incrementTime('09:45');
  t.equal(actual, '10:00');
});


test('decrementTime 07:00', function(t) {
  t.plan(1);

  var actual = util.decrementTime('07:00');
  t.equal(actual, '06:45');
});


test('decrementTime 07:15', function(t) {
  t.plan(1);

  var actual = util.decrementTime('07:15');
  t.equal(actual, '07:00');
});


test('decrementTime 07:30', function(t) {
  t.plan(1);

  var actual = util.decrementTime('07:30');
  t.equal(actual, '07:15');
});


test('decrementTime 07:45', function(t) {
  t.plan(1);

  var actual = util.decrementTime('07:45');
  t.equal(actual, '07:30');
});


test('decrementTime 08:00', function(t) {
  t.plan(1);

  var actual = util.decrementTime('08:00');
  t.equal(actual, '07:45');
});
