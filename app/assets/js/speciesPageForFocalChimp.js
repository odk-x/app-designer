/* global control */
'use strict';

function display() {
    var followTime = util.getQueryParameter(util.timeKey);
    var date = util.getQueryParameter(util.dateKey);
    var focalChimpId = util.getQueryParameter(util.focalChimpKey);

    var timeOfPresence = util.getQueryParameter(util.timeOfPresence);
    console.log("");
    var speciesName = util.getQueryParameter(util.speciesName);
    var numOfSpecies = util.getQueryParameter(util.numOfSpecies);

    if((timeOfPresence == null || timeOfPresence == undefined || timeOfPresence.length == 0) &&
        (speciesName == null || speciesName == undefined || speciesName.length == 0) &&
        (numOfSpecies == null || numOfSpecies == undefined || numOfSpecies.length == 0)) {
        $("#species").val(0);
        $('#start_time_species').attr('placeholder', 'Start Time');
        $('#species_number').attr('placeholder', 'Number');
    } else {
         $("#species").val(speciesName);
        $('#start_time_species').attr('placeholder', timeOfPresence);
        $('#species_number').attr('placeholder', numOfSpecies);
    }

    var writeSpecies = function(  
        focalChimpId,
        followDate,
        startTimeSpecies,
        endTimeSpecies, localSpecies, numberOfSpecies) {
        
        var speciesData = util.getSpeciesDataForTimePoints(date, focalChimpId);
        var rowId = null;
        if (speciesData.getCount() > 0) {
            //rowId = speciesData.getRowId(0);
            for(var i = 0; i < speciesData.getCount(); i++) {
                if (startTimeSpecies == speciesData.getData(i, 'OS_time_begin')
                    && numberOfSpecies == speciesData.getData(i, 'OS_duration')
                    && localSpecies == speciesData.getData(i, 'OS_local_species_name_written')){

                    rowId = speciesData.getRowId(i);
                    break;
                }
            }  
        }
        console.log("rowId is: " +rowId);
         if (rowId != null || rowId != undefined) {
            if(startTimeSpecies == null || startTimeSpecies == undefined || startTimeSpecies === 0) {
                startTimeSpecies = speciesData.getData(rowId, 'OS_time_begin');

            }
            if (localSpecies == null || localSpecies == undefined || localSpecies === 0) {
                localSpecies = speciesData.getData(rowId, 'OS_local_species_name_written');
            }
       
            if (numberOfSpecies == null || numberOfSpecies == undefined || numberOfSpecies === 0) {
                numberOfSpecies = speciesData.getData(rowId, 'OS_duration');
            }
        }
        var struct = {};
        struct['OS_FOL_B_focal_AnimID'] = focalChimpId;
        struct['OS_FOL_date'] = date;
        struct['OS_time_begin'] = startTimeSpecies;
        struct['OS_time_end'] = endTimeSpecies;
        struct['OS_local_species_name_written'] = localSpecies;
        struct['OS_duration'] = numberOfSpecies;

        // Now we'll stringify the object and write it into the database.
        var stringified = JSON.stringify(struct);
        //control.addRow('other_species', stringified);
         if(endTimeSpecies != undefined ||  endTimeSpecies != null) {
            //var rowId = createFoodRowIdCache();
            var updateSuccessfully = control.updateRow(
                    'other_species',
                    stringified,
                    rowId);
            console.log('updated species successfully: ' + updateSuccessfully);

        } else {
            console.log("I am here to mess up things by adding an extra row");
            control.addRow('other_species', stringified);    
        }

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

        if (endTime == null || endTime == undefined || endTime.length === 0) {
            writeSpecies(focalChimpId, followDate, startTime, null, localSpecies, number);
        } else {
            // Update the database.
             writeSpecies(focalChimpId, followDate, timeOfPresence, endTime, speciesName, numOfSpecies);
            
        }
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
            followTime,
            focalChimpId);
        var url = control.getFileAsUrl(
                'assets/followScreen.html' + queryString);
        window.location.href = url;

    }
}
