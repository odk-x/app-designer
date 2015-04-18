'use strict';

var test = require('tape');
var urls = require('./jgiUrls');

var queryParameters = urls.queryParameters;

var raw5 = '5:00';
var raw6 = '6:15';
var rawDate = '03-27';
var rawId = 'fr';


var encoded5 = encodeURIComponent(raw5);
var encoded6 = encodeURIComponent(raw6);
var encodedDate = encodeURIComponent(rawDate);
var encodedId = encodeURIComponent(rawId);

var encodedFollowComponent =
  '?' +
  queryParameters.date +
  '=' +
  encodedDate +
  '&' +
  queryParameters.time +
  '=' +
  encoded5 +
  '&' +
  queryParameters.focalChimp +
  '=' +
  encodedId;

test('createParamsForFollow', function(t) {
  t.plan(1);

  var actual = urls.createParamsForFollow(rawDate, raw5, rawId);

  var target = encodedFollowComponent;

  t.equal(actual, target);

});

test('createParamsForFood', function(t) {

  t.plan(1);

  var food = 'banana';
  var part = 'peel';

  var actual = urls.createParamsForFood(
    rawDate,
    raw5,
    rawId,
    raw6,
    food,
    part
  );

  var target =
    encodedFollowComponent +
    '&begin_eating=' +
    encoded6 +
    '&eaten_food=banana&eaten_foodPart=peel';

  t.equal(actual, target);
    

});

test('createParamsForSpecies', function(t) {

  t.plan(1);

  var species = 'hedgehog';
  var numSpecies = 1234;

  var actual = urls.createParamsForSpecies(
    rawDate,
    raw5,
    rawId,
    raw6,
    species,
    numSpecies
  );

  // time, name, num

  var target =
    encodedFollowComponent +
    '&time_presence=' +
    encoded6 +
    '&name_species=hedgehog&num_of_species=1234';

  t.equal(actual, target);

});
