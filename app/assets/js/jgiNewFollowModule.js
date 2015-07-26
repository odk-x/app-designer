/* global alert */
'use strict';

var $ = require('jquery');
var db = require('./jgiDb');
var urls = require('./jgiUrls');
var util = require('./jgiUtil');
var models = require('./jgiModels');

function invalidDataToStart(data) {
  if (!data || data === '') {
    return true;
  } else {
    return false;
  }
}


exports.initializeListeners = function(control) {

  $('#begin-follow').on('click', function() {
    // First retrieve the information from the form.
    var date = $('#FOL_date').val();
    var focalChimpId = $('#FOL_B_AnimID').val().toLowerCase();
    var communityId = $('#FOL_CL_community_id').val();
    var beginTimeDb = $('#FOL_begin_time').val();
    var researcher = $('#FOL_am_observer_1').val();

    if (
      invalidDataToStart(date) ||
      invalidDataToStart(focalChimpId) ||
      invalidDataToStart(beginTimeDb) ||
      invalidDataToStart(researcher)
      )
    {
      alert('Date, Focal Chimp, Start Time, and Researcher Required');
      return;
    }

    $('#formsubmitbutton').css('display', 'none'); // to undisplay
    $('#buttonreplacement').css('display', 'block'); // to display 

    var follow = new models.Follow(
        date,
        beginTimeDb,
        focalChimpId,
        communityId,
        researcher
    );

    // Update the database.
    db.writeNewFollow(
        control,
        follow
    );

    // Now we'll launch the follow screen. The follow screen needs to know
    // what date we're on, as well as the time it should be using.
    var queryString = urls.createParamsForFollow(
        date,
        beginTimeDb,
        focalChimpId
        );
    var url = control.getFileAsUrl(
        'assets/followScreen.html' + queryString);
    window.location.href = url;
  });
};



exports.initializeUi = function(control) {
  exports.initializeListeners(control);

  var timesDb = util.getAllTimesForDb();
  var timesUser = util.getAllTimesForUser();
  if (timesDb.length !== timesUser.length) {
    alert('Length of db times and user times not equal, problem!');
  }

  var $beginTime = $('#FOL_begin_time');

  timesDb.forEach(function(val, i) {
    var timeDb = val;
    var timeUser = timesUser[i];
    var option = $('<option></option>');
    option.prop('value', timeDb);
    option.text(timeUser);

    $beginTime.append(option);
  });

};
