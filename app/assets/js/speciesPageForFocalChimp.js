/* global control */
'use strict';

function display() {
    var beginTime = util.getQueryParameter(util.timeKey);
    var date = util.getQueryParameter(util.dateKey);
    var focalChimpId = util.getQueryParameter(util.focalChimpKey);

    var writeSpecies = function(  
        focalChimpId,
        followDate,
        startTimeSpecies,
        endTimeSpecies, localSpecies, numberOfSpecies) {
    
        var struct = {};
        struct['OS_FOL_B_focal_AnimID'] = focalChimpId;
        struct['OS_FOL_date'] = followDate;
        struct['OS_time_begin'] = startTimeSpecies;
        struct['OS_time_end'] = endTimeSpecies;
        struct['OS_local_species_name_written'] = localSpecies;

        // Now we'll stringify the object and write it into the database.
        var stringified = JSON.stringify(struct);
        control.addRow('other_species', stringified);
    };

    // CAL: Adding the logic for saving a food
    $('#saving_species').on('click', function() {
        // First retrieve the information from the form.
        var followDate = date;
        var localSpecies = $('#species').val();
        var startTime = $('#start_time_species').val();
        var endTime = $('#end_time_species').val();
        var number = $('#species_number').val();
        // Update the database.
        writeSpecies(focalChimpId, followDate, startTime,endTime, localSpecies, number);
        //We are done writing to data Base so that we can go back to the followScreen
        goBackToFollowScreen();

    });

     $('#goBack').on('click', function() {
        // Now we'll launch the follow screen. The follow screen needs to know
        // what date we're on, as well as the time it should be using.
         goBackToFollowScreen();
    });

     var goBackToFollowScreen = function(){
        var queryString = util.getKeysToAppendToURL(
            date,
            beginTime,
            focalChimpId);
        var url = control.getFileAsUrl(
                'assets/followScreen.html' + queryString);
        window.location.href = url;

    }
}
