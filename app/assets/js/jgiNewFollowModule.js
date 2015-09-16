/* global alert */
'use strict';

var $ = require('jquery');
var db = require('./jgiDb');
var urls = require('./jgiUrls');
var util = require('./jgiUtil');
var models = require('./jgiModels');

var chimpData;

function invalidDataToStart(data) {
  if (!data || data === '') {
    return true;
  } else {
    return false;
  }
}

/*
 *

/**
 * Read the chimp list from the config file.
 */
function fetchChimpList() {
  Papa.parse("config/chimpList.csv", {
    header: true,
    download: true,
    complete: function(results) {
      chimpData = results["data"];
      var communityList = [];

      // Create a list of all communities
      for (var i = 0; i < chimpData.length; i++) {
        var community = chimpData[i]["Community"];
        if (community && communityList.indexOf(community) < 0) {
          communityList.push(community);
        }
      }

      var $communities = $("#FOL_CL_community_id");

      // Clear the UI element and add all communities to it
      $communities.empty();
      $communities.append("<option class=\"first\"><span>Kundi</span></option>");

      for (var i = 0; i < communityList.length; i++) {
        var communityVal = communityList[i].trim().toLowerCase().replace(" ", "_");
        $communities.append("<option><a id=\"" + communityVal + "\">" + communityList[i] + "</a></option>");
      }

    },
    error: function() {
      alert("Error reading chimp list");
    }
  });
}


exports.initializeListeners = function(control) {

  $("#FOL_CL_community_id").change(function() {
    var $chimps = $("#FOL_B_AnimID");
    var community = $("#FOL_CL_community_id").val();

    // Clear old entries
    $chimps.empty();
    $chimps.append("<option class=\"first\"><span>Target</span></option>");

    // Add all chimps with a matching community to the dropdown
    for (var i = 0; i < chimpData.length; i++) {
      var currChimp = chimpData[i]["Chimp"];
      var currCommunity = chimpData[i]["Community"];
      if (currChimp && currCommunity === community) {
        var chimpVal = currChimp.trim().toLowerCase().replace(" ", "_");
        $chimps.append("<option><a id=\"" + chimpVal + "\">" + currChimp + "</a></option>");
      }
    }

    // Enable chimp selection
    $chimps.prop("disabled", false);

  });

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
        focalChimpId,
        communityId
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

  fetchChimpList();

};
