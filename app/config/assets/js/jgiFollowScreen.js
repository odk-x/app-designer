/* global odkCommon, util, alert */
/* jshint camelcase:false */ 
'use strict';

// if (JSON.parse(odkCommon.getPlatformInfo()).container === 'Chrome') {
//     console.log('Welcome to Tables debugging in Chrome!');
//     $.ajax({
//         url: odkCommon.getFileAsUrl('output/debug/follow_data.json'),
//         async: false,  // do it first
//         success: function(dataObj) {
//             if (dataObj === undefined || dataObj === null) {
//                 console.log('Could not load data json for table: follow');
//             }
//             window.data.setBackingObject(dataObj);
//         }
//     });
// }
var previousTime;
var rowIdCache = {};
var speciesRowIdCache = {};
var foodRowIdCache = {};
var isNew = true;

function cbAddRowOSSuccess(result) {
    console.log('jgiFollowScreen: cbAddRowOSSuccess with result: ' + result);
}

function cbAddRowOSFail(error) {
    console.log('jgiFollowScreen: cbAddRowOSFail with error: ' + error);
}

function cbAddRowFASuccess(result) {
    console.log('jgiFollowScreen: cbAddRowFASuccess with result: ' + result);
}

function cbAddRowFAFail(error) {
    console.log('jgiFollowScreen: cbAddRowFAFail with error: ' + error);
}

function cbAddRowFBSuccess(result) {
    console.log('jgiFollowScreen: cbAddRowFBSuccess with result: ' + result);
}

function cbAddRowFBFail(error) {
    console.log('jgiFollowScreen: cbAddRowFBFail with error: ' + error);
}



// start trying to update beginning



    // var beginUpdateChimpInfo = function(){
    //     // var chimpId = $(this).prop('id');
    //     // console.log("in event handeler " + chimpId);
    //     // // removing event handeler from all other chimps right now since we want the
    //     // // user to be able update one chimp at a time.
    //     // $('.chimp').unbind("click", updateChimpInfo);
    //     // document.getElementById(chimpId).style.backgroundColor = "green";

    //     var chimpList = util.getTableDataForTimePoint(
    //     followDate, "01:00",
    //     focalChimpId);

    //     var rowId = null;
    //     for(var i = 0; i < chimpList.getCount(); i++) {
    //         var chimpId = chimpList.getData(i, 'FA_B_arr_AnimID').trim(); 
    //         rowId = chimpList.getRowId(i);
     
          
    //         if (rowId != null) {
    //             var curTime = chimpList.getData(rowId, 'FA_duration_of_obs').trim();
    //             var curCertain = chimpList.getData(rowId, 'FA_type_of_certainty').trim();
    //             var curDist = chimpList.getData(rowId, 'FA_within_five_meters').trim();
    //             var curS = chimpList.getData(rowId, 'FA_type_of_cycle').trim(); 
    //             var curClose = chimpList.getData(rowId, 'FA_closest_to_focal').trim();
    //             updateUI(false, chimpId, curTime, curCertain, curDist, curS, curClose); 
    //         } else {
    //              console.log("There is no Chimp with this name in the database!!!!");
    //              return;
    //         }
    //     }
       
    //     // // getting the information from the div and saving it to the database and
    //     // // updates the ui
    //     // var time = null;
    //     // var certain = null;
    //     // var distance = null;
    //     // var sex_state = null;
    //     // var close = null;
    //     // $('.save_bottom_div').on('click', function() {
    //     //     time = $('input[name="time"]:checked').val();
    //     //     certain = $('input[name="certain"]:checked').val();
    //     //     distance = $('input[name="distance"]:checked').val();
    //     //     sex_state = $('input[name="sex_state"]:checked').val();
    //     //     close = $('input[name="close"]:checked').val();
    //     //     updateUI(true, chimpId,
    //     //     time,
    //     //     certain,
    //     //     distance,
    //     //     sex_state,
    //     //     close);

    //     //     if (rowId != null) {
    //     //         writeRowForChimp(
    //     //             true,
    //     //             rowId,
    //     //             chimpId,
    //     //             time,
    //     //             certain,
    //     //             distance,
    //     //             sex_state,
    //     //             close);
    //     //     } else {
    //     //         console.log("There is no Chimp with this name in the database!!!!");
    //     //         return;
    //     //     }

    //         // we are done with updating the current chimp. so we can re bind the
    //         // all the chimps to the event handeler
    //     //     $('.chimp').bind("click", updateChimpInfo);
    //     // }); 
    // };  


// end trying to update beginning





function display() {
    // We're expecting the follow time to be present as a url parameter,
    // something along the lines of:
    // ?follow_time=07_15
    var followTime = util.getQueryParameter(util.timeKey);

    var followDate = util.getQueryParameter(util.dateKey);
    var focalChimpId = util.getQueryParameter(util.focalChimpKey);

    var oldTime = util.getQueryParameter(util.timeKey); 

    console.log("new page, display is being called"); 


    console.log("This is the current followTime: " + followTime + " which is true?: " + followTime == "1:15"); 

    if (followTime == "1:15") {
        var chimpList = util.getTableDataForTimePoint(
        followDate, "01:00",
        focalChimpId);

        var rowId = null;
        for(var i = 0; i < chimpList.getCount(); i++) {
            var chimpId = chimpList.getData(i, 'FA_B_arr_AnimID').trim(); 
            rowId = chimpList.getRowId(i);
     
          
            if (rowId != null) {
                var curTime = chimpList.getData(rowId, 'FA_duration_of_obs').trim();
                var curCertain = chimpList.getData(rowId, 'FA_type_of_certainty').trim();
                var curDist = chimpList.getData(rowId, 'FA_within_five_meters').trim();
                var curS = chimpList.getData(rowId, 'FA_type_of_cycle').trim(); 
                var curClose = chimpList.getData(rowId, 'FA_closest_to_focal').trim();
                console.log("Curren time: " + curTime);
                console.log("Curren certain: " + curCertain);
                console.log("Curren dist: " + curDist);
                console.log("Curren sex: " + curS);
                console.log("Curren close: " + curClose);
                updateUI(false, chimpId, curTime, curCertain, curDist, curS, curClose); 
            } else {
                 console.log("There is no Chimp with this name in the database!!!!");
                 return;
            }
        }        
    }

    /**
     * Update the row for the given chimp. As we start persisting more data
     * this function should grow.
     *
     * isUpdate is true if we are updating the database rather than writing a
     * new row. If true, rowId cannot be null. If false, rowId is ignored.
     *
     * If isWithin5 is null, no update is performed.
     */
    var writeRowForChimp = function(isUpdate, rowId, chimpId, time, certain, distance, sState, closest_to_focal) {
        var struct = {};
        struct['FA_FOL_date'] = followDate;
        struct['FA_FOL_B_focal_AnimID'] = focalChimpId;
        struct['FA_B_arr_AnimID'] = chimpId;
        struct['FA_time_start'] = followTime;

        if (time != null || time != undefined) {
            struct['FA_duration_of_obs'] = time;
        }
        if (sState !== null || sState != undefined) {
            struct['FA_type_of_cycle'] = sState;
        }
        
        if (certain !== null || certain != undefined) {
            struct['FA_type_of_certainty'] = certain;
        } 

        if (distance !== null || distance != undefined) {
            struct['FA_within_five_meters'] = distance;
        } 

        if (closest_to_focal !== null || closest_to_focal != undefined) {
            struct['FA_closest_to_focal'] = closest_to_focal;
        } 
        
        var stringified = JSON.stringify(struct);
        if (isUpdate) {
            var updateSuccessfully =
                control.updateRow('follow_arrival', stringified, rowId);
            //console.log('updateSuccessfully: ' + updateSuccessfully);
        } else {
            var addedSuccessfully =
                control.addRow('follow_arrival', stringified);
            //console.log('added successfully: ' + addedSuccessfully);
        }
    };

    var cbSuccessTimePoint = function (result) {
        var tableData = result;
        // First get all the data for the chimp table.
        for (var i = 0; i < tableData.getCount(); i++) {
            // First get the ids of the chimp. These are stored in the
            // FA_B_arr_AnimID column.
            var id = tableData.getData(i, 'FA_B_arr_AnimID');
            // The "present" checkbox id is the combination of the id and the
            // suffix defined above.
            var presentCheckboxId = id + presentSuffix;
            var checkbox = $('#' + presentCheckboxId);
            var valueOfPresent = tableData.getData(i, 'FA_type_of_certainty');
            if (valueOfPresent !== undefined && valueOfPresent !== '') {
                valueOfPresent = parseInt(valueOfPresent);
            }
            if (valueOfPresent === flag_chimpPresent) {
                checkbox.prop('checked', true);
            } else {
                checkbox.prop('checked', false);
            }

            // The "within5meter" checkbox id is the combination of the id and the
            // suffix defined above.
            var fiveCheckboxId = id + fiveMeterSuffix;
            var checkbox5m = $('#' + fiveCheckboxId);

            if (isNew) {
                checkbox5m.prop('checked', false);
            }
            else {
                var valueOfFive = tableData.getData(i, 'FA_within_five_meters');
                if (valueOfFive !== undefined && valueOfPresent !== '') {
                    valueOfFive = parseInt(valueOfFive);
                }
                if (valueOfFive === flag_chimpPresent) {
                    checkbox5m.prop('checked', true);
                } else {
                    checkbox5m.prop('checked', false);
                }
            }

            // Retrieve closest to focal chimp if there is one
            if (isNew) {
                $('.closest-chimp').removeClass('closest-chimp');
            }
            else {
                var name = $('#' + id);
                var valueOfClosest = tableData.getData(i, 'FA_closest_to_focal');
                if (valueOfClosest !== undefined && valueOfClosest !== '') {
                    valueOfClosest = parseInt(valueOfClosest);
                }
                if (valueOfClosest === flag_chimpPresent) {
                    $('.closest-chimp').removeClass('closest-chimp');
                    name.addClass('closest-chimp');
                }
            }

            // Retrieve sexual state from database if it exists
            var sexualStateId = id + sexualStateSuffix;
            var sexualState = $('#' + sexualStateId);
            var valueOfSexualState = tableData.getData(i, 'FA_type_of_cycle');
            if (sexualState !== undefined) {
                $(sexualState).html(valueOfSexualState);
            }
        }
    };
    var cbFailTimePoint = function (error) {
        console.log('jgiFollowScreen: cbFailTimePoint from initUIFromDatabaseForTime failed with error: ' + error);
    };

    var cbSuccessSpeciesData = function (result) {
        var speciesData = result;
        console.log('species count before updating from db: ' + speciesCounts);
        var i = 0;
        for (i = 0; i < speciesData.getCount(); i++) {
            var speciesId = speciesData.getData(
                    i,
                    'OS_local_species_name_written');
            // there isn't an obvious 'count' field in the db schema. for now
            // I'm going to overload the duration field.
            var speciesCount = speciesData.getData(
                    i,
                    'OS_duration');
            if (speciesCount !== '') {
                speciesCount = parseInt(speciesCount);
            }
            if (update) {
                document.getElementById(chimpId+"_cer").style.backgroundColor = "#3399FF";
            }
            
        }
        console.log('species count after updating from db: ' + speciesData.getCount());

    };
    var cbFailSpeciesData = function (error) {
        console.log('jgiFollowScreen: cbFailSpeciesData from initUIFromDatabaseForTime failed with error: ' + error);
    };

    var cbSuccessFoodData = function (result) {
        var foodData = result;
        console.log('food present before updating from db: ' + foodPresent);
        var i = 0;
        for (i = 0; i < foodData.getCount(); i++) {
            var foodId = foodData.getData(
                    i,
                    'FB_FL_local_food_name');
            var isPresent = foodData.getData(
                    i,
                    'FB_duration');
            if (isPresent === '1') {
                isPresent = true;
            } else if (isPresent === '0') {
                isPresent = false;
            } else {
                console.log(
                        'unrecognized value of food present: ' + isPresent);
            }
            setFoodIsPresent(foodId, isPresent);

        }
        console.log('food present after updating from db: ' + foodPresent);

        updateUIForAllSpecies();
        updateUIForFood();

        // Now need to init the db since the UI should be all SET!!
        initDatabaseFromUI();
    };

    var cbSuccessFoodDataFullyInit = function (result) {
        var foodData = result;
        console.log('food present before updating from db: ' + foodPresent);
        var i = 0;
        for (i = 0; i < foodData.getCount(); i++) {
            var foodId = foodData.getData(
                    i,
                    'FB_FL_local_food_name');
            var isPresent = foodData.getData(
                    i,
                    'FB_duration');
            if (isPresent === '1') {
                isPresent = true;
            } else if (isPresent === '0') {
                isPresent = false;
            } else {
                console.log(
                        'unrecognized value of food present: ' + isPresent);
            }
            setFoodIsPresent(foodId, isPresent);

        }
        console.log('food present after updating from db: ' + foodPresent);

        console.log('initUIFromDatabaseForTime called with false so initialize has to happen');

        updateUIForAllSpecies();
        updateUIForFood();

        odkData.query('food_bout', null, null, null, null,
            null, null, true, dbInitCBSuccess, 
            dbInitCBFail);
    };

    var cbFailFoodData = function (error) {
        console.log('jgiFollowScreen: cbFailFoodData from initUIFromDatabaseForTime failed with error: ' + error);
    };

    /**
     * Update the state of the UI to reflect what is stored in the database.
     * I.e. if someone goes back to look at an earlier time, this method will
     * retrieve the existing data and update the checkboxes with the
     * appropriate contents.
     *
     * NOTE: The order of the the util calls matter!  The cbSuccessFoodData*
     * callback functions have some extra initialization in them.  They must be
     * called last.  This should be re-worked to avoid such dependencies.  
     *
     */
    var initUIFromDatabaseForTime = function(time, isNewVar) {
        isNew = isNewVar;

        util.getTableDataForTimePoint(
                followDate,
                time,
                focalChimpId,
                cbSuccessTimePoint,
                cbFailTimePoint);
        
        // Now update the food and species lists.
        util.getSpeciesDataForTimePoint(
                followDate,
                time,
                focalChimpId,
                cbSuccessSpeciesData,
                cbFailSpeciesData);

        if (isNew == false) {
            // Fixes the back button issues
            // Ensures caches and time are set as appropriate 
            util.getFoodDataForTimePoint(
                followDate,
                time,
                focalChimpId,
                cbSuccessFoodDataFullyInit,
                cbFailFoodData);
        } else {
            util.getFoodDataForTimePoint(
                followDate,
                time,
                focalChimpId,
                cbSuccessFoodData,
                cbFailFoodData);
        }
    };

    var isNewTimePoint = function(time, cbSuccess, cbFailure) {
        // just query for any rows in the db. This is an extra call that we
        // might be able to cache the results of if performance is bad
        util.getTableDataForTimePoint(
                followDate,
                time,
                focalChimpId, cbSuccess, cbFailure);
        //return tableData.getCount() === 0;
    };

    var createIdCacheSuccess = function (tableData) {
        var result = {};
        for (var i = 0; i < tableData.getCount(); i++) {
            var chimpId = tableData.getData(i, 'FA_B_arr_AnimID');
            var rowId = tableData.getRowId(i);
            result[chimpId] = rowId;
        }
        //return result;
        rowIdCache = result;
    };

    var createIdCacheFailure = function (error) {
        console.log('jgiFollowScreen: createIdCacheFailure failed with error: ' + error);
    };

    /* Updates the bottom div when user selects any of the chimp. It updates the 
     * div according to that's chimp.
     */
    var createIdCache = function() {
        util.getTableDataForTimePoint(
        followDate,
        followTime,
        focalChimpId,
        createIdCacheSuccess,
        createIdCacheFailure);
    };

    var createFoodRowIdCacheSuccess = function (foodData) {
        var result = {};
        for (var i = 0; i < foodData.getCount(); i++) {
            var foodId = foodData.getData(i, 'FB_FL_local_food_name');
            var rowId = foodData.getRowId(i);
            result[foodId] = rowId;
        }
        //return result;
        foodRowIdCache = result;
    };

    var createFoodRowIdCacheFailure = function (error) {
        console.log('jgiFollowScreen: createFoodRowIdCacheFailure failed with error: ' + error);
    };

    var createFoodRowIdCache = function() {
        util.getFoodDataForTimePoint(
            followDate,
            followTime,
            focalChimpId,
            createFoodRowIdCacheSuccess,
            createFoodRowIdCacheFailure);
    };

    var createSpeciesRowIdCacheSuccess = function (speciesData) {
        var result = {};
        for (var i = 0; i < speciesData.getCount(); i++) {
            var speciesId = speciesData.getData(
                    i,
                    'OS_local_species_name_written');
            var rowId = speciesData.getRowId(i);
            result[speciesId] = rowId;
        }
        //return result;
        speciesRowIdCache = result;
    };

    var createSpeciesRowIdCacheFailure = function (error) {
        console.log('jgiFollowScreen: createSpeciesRowIdCacheFailure failed with error: ' + error);
    };
    var createSpeciesRowIdCache = function() {
        util.getSpeciesDataForTimePoint(
                followDate,
                followTime,
                focalChimpId,
                createSpeciesRowIdCacheSuccess,
                createSpeciesRowIdCacheFailure);
    };

    var getExistingTimeSuccess = function(tableData) {
        var dropdownMenu = $('#older-items-menu');
        var existingTimes = [];
        var i;
        for (i = 0; i < tableData.getCount(); i++) {
            var dataPoint = tableData.getData(i, 'FA_time_start');
            // now see if we already have this value, in which case we won't add it
            if (existingTimes.indexOf(dataPoint) < 0) {
                existingTimes.push(dataPoint);
            }
        }

        var baseUrl = 'config/assets/followScreen.html';

        // handle the case where there are no timepoints yet.
        if (existingTimes.length === 0) {
            var noTimesItem = $('<li>').eq(0);
            // we also need to create an anchor to get bootstrap to style the
            // item correctly
            var anchor = $('<a>');
            anchor.prop('href', '#');  // we don't want it to go anywhere
            anchor.html('No Other Time Points');
            noTimesItem.append(anchor);
            dropdownMenu.append(noTimesItem);
            return;
        }

        for (i = 0; i < existingTimes.length; i++) {
            var olderFollowTime = existingTimes[i];
            // The url these will launch is ths jgiFollowScreen plus the query
            // parameters defining the unique moment (date, time, and chimp).
            var queryString = util.getKeysToAppendToURL(
                    followDate,
                    olderFollowTime,
                    focalChimpId);
            var anchor = $('<a>');
            //anchor.prop('href', odkCommon.getFileAsUrl(baseUrl + queryString));
            anchor.html(olderFollowTime);
            // Ok, and now yet another annoyance of dealing with the current
            // setup. We can't let the links launch themselves, as this
            // wouldn't inject the correct objects. We need to launch the page
            // using our own method.
            // Note that weirdness of adding the click handler in a closure is
            // due to the way that javascript scope works--it only has function
            // scope, so without the closure we only ever call the last value,
            // which obviously isn't correct. Assigning the correct query
            // string in the closure solves this.
            (function(queryStr) {
                anchor.on('click', function() {
                    var url = odkCommon.getFileAsUrl(baseUrl + queryStr);
                    console.log('url: ' + url);
                    window.location.href = url;
                });
            })(queryString);
            
            var menuItem = $('<li>');
            menuItem.append(anchor);
            
            // And now append the menu item.
            dropdownMenu.append(menuItem);
        }
    };

    var getExistingTimeFailure = function(error) {
        console.log('jgiFollowScreen: getExistingTimeFailure with error: ' + error);
    };

    var updateOlderMenu = function() {
        var dropdownMenu = $('#older-items-menu');
        // Remove any older items that are somehow hanging around. This
        // should always be unnecessary, I think.
        dropdownMenu.empty();
        
        // First, get the older times.
        util.getExistingTimesForDate(
                followDate,
                focalChimpId,
                getExistingTimeSuccess,
                getExistingTimeFailure);
    };

    /**
     * Annoyingly, js has an 'insertBefore' but not an 'insertAfter' function.
     * Why, I could not begin to explain. Maybe because you can do something
     * like this, but still, that's no reason at all.
     *
     * This method came from:
     * http://stackoverflow.com/questions/4793604/how-to-do-insert-after-in-javascript-without-using-a-library
     */
    var insertAfter = function(newNode, node) {
        node.parentNode.insertBefore(newNode, node.nextSibling);
    };


    /* It returns all the male chimps available.
    */
    var getMaleChimps = function() {
        // We've defined the male chimps by giving them the
        // class 'male-chimp'. Selectors use '.class', so we'll find them and
        // append three checkboxes to each.
        var result = $('.male-chimp');
        return result;
    };

    /* It returns all the female chimps available.
    */
    var getFemaleChimps = function() {
        var result = $('.female-chimp');
        return result;
    };

    /* It updates the ui while page is loading. If this new time point, then it 
    * updates the ui with default values, otherwise it retrieves the data from database and
    * updates the ui according to that. It also writes a each row for each chimp for
    * each new time point.
    */
    var chimpList = util.getTableDataForTimePoint(
            followDate, followTime,
            focalChimpId);
    if (chimpList == null || chimpList.getCount() == 0) {
        // all default values
        var defTime = "0"; 
        var defcer = "2";  
        var defDistance = "0";
        var def_sState = "0";
        var defClose = "0";
        var maleChimps = getMaleChimps();
        var femaleChimps = getFemaleChimps();
        var allChimps = maleChimps.toArray().concat(femaleChimps.toArray());
        var i = 0;
        for (i = 0; i < allChimps.length; i++) {
            var chimp = allChimps[i];
            var chimpId = chimp.id;
            var presentCheckbox = $('#' + chimpId + presentSuffix);
            var isChecked = presentCheckbox.prop('checked');
            var within5Checkbox = $('#' + chimpId + fiveMeterSuffix);
            var isWithinFive = within5Checkbox.prop('checked');
            
            var isClosest = false;
            if ($('.closest-chimp').prop('id') === chimpId) {
                isClosest = true;
            }
            
            var sexualState = $('#' + chimpId + sexualStateSuffix);
            var sexState = $(sexualState).html();
            if (sexState == null) {
                sexState = 'N/A';
            }

            writeRowForChimp(
                    false,
                    null,
                    chimpId,
                    isChecked,
                    isWithinFive,
                    isClosest,
                    sexState);
        }

        // add rows for the species
        var species = getSpecies();
        
        for (i = 0; i < species.length; i++) {

            var speciesId = species.eq(i).prop('id');
            var numPresent = getNumberOfSpeciesPresent(speciesId);
            writeForSpecies(
                    false,
                    null,
                    speciesId,
                    numPresent);
        }
        
        // add rows for the foods
        var foods = getFoods();
        for (i = 0; i < foods.length; i++) {
            var id = foods.eq(i).prop('id');
            var isPresent = foodIsPresent(id);
            writeForFood(false, null, id, isPresent, null, null);
        }

        // I need a callback function that will tell me once all of 
        // this initialization is done
        odkData.query('food_bout', null, null, null, null,
            null, null, true, dbInitCBSuccess, 
            dbInitCBFail);
    };

    var dbInitCBSuccess = function(result) {
        console.log('After initDatabaseFromUI succeeded with result count: ' +result.getCount());
        setupUI();
    };

    var dbInitCBFail = function(error) {
        console.log('After initDatabaseFromUI failed with error: ' + error);
    };

    var cacheInitCBSuccess = function(result) {
        console.log('After createFoodRowIdCache succeeded with result count: ' +result.getCount());
        afterCacheInit();
    };

    var cacheInitCBFail = function(error) {
        console.log('After createFoodRowIdCache failed with error: ' + error);
    };

    var afterCacheInit = function() {
        $('#time-label').eq(0).html(followTimeUserFriendly);

        updateOlderMenu();
        initUIForFocalChimp();
        updateUIForAllSpecies();
        updateUIForFood();
    };

    var setupUI = function() {
        createIdCache();
        createSpeciesRowIdCache();
        createFoodRowIdCache();

        // I need a callback function that will tell me once 
        // the caches are done
        odkData.query('food_bout', null, null, null, null,
            null, null, true, cacheInitCBSuccess, 
            cacheInitCBFail);
    };

    var writeForSpecies = function(isUpdate, rowId, speciesId, numPresent) {

        var struct = {};
        struct['OS_FOL_date'] = followDate;
        struct['OS_time_begin'] = followTime;
        struct['OS_FOL_B_focal_AnimID'] = focalChimpId;

        struct['OS_local_species_name_written'] = speciesId;
        var numPresentStr = numPresent.toString();
        struct['OS_duration'] = numPresentStr;


        if (isUpdate) {
            window.odkData.updateRow(
                    'other_species',
                    struct,
                    rowId,
                    cbAddRowOSSuccess,
                    cbAddRowOSFail);
            console.log('called updated species: ' + speciesId);
        } else {
            var newRowId = util.genUUID();
            window.odkData.addRow(
                    'other_species',
                    struct,
                    newRowId,
                    cbAddRowOSSuccess,
                    cbAddRowOSFail);
            console.log('called added species: ' + speciesId);
        }

    };

    var writeForFood = function(isUpdate, rowId, foodId, isPresent, foodPart1, foodPart2) {

        var struct = {};
        struct['FB_FOL_date'] = followDate;
        struct['FB_begin_feed_time'] = followTime;
        struct['FB_FOL_B_AnimID'] = focalChimpId;

        if (foodId !== null) {
            struct['FB_FL_local_food_name'] = foodId;
        }
        if (foodId !== null) {
            struct['FB_FPL_local_food_part'] = foodPart1;
        }
        if (foodId !== null) {
            struct['FB_FPL_local_food_part2'] = foodPart2;
        }

        // this column is an integer in the database.
        if (isPresent !== null) {
            var isPresentStr = isPresent ? '1' : '0';
            struct['FB_duration'] = isPresentStr;
        }

        if (isUpdate) {
            window.odkData.updateRow(
                    'food_bout',
                    struct,
                    rowId, 
                    cbAddRowFBSuccess, 
                    cbAddRowFBFail);
            console.log('called updated food: ' + foodId);
        } else {
            var newRowId = util.genUUID();
            window.odkData.addRow(
                    'food_bout',
                    struct,
                    newRowId,
                    cbAddRowFBSuccess,
                    cbAddRowFBFail);
            console.log('called added food: ' + foodId);
        }

    };

    /**
     * Update the row for the given chimp. As we start persisting more data
     * this function should grow.
     *
     * isUpdate is true if we are updating the database rather than writing a
     * new row. If true, rowId cannot be null. If false, rowId is ignored.
     *
     * If isWithin5 is null, no update is performed.
     */
    var writeRowForChimp = function(
            isUpdate,
            rowId,
            chimpId,
            isPresent,
            isWithin5,
            isClosest,
            sState) {
        var struct = {};
        // JGI wanted three checkboxes. However, it isn't obvious to me how
        // we'll be persisting those checkboxes. So, let's just use the 
        // 'present' checkbox and persist a row if they are there.
        // We're also going to be using the FA_type_of_certainty column to
        // indicate the state of the chimp. They have in the data tables
        // document that 1 is chimp definitely seen, 0 is expected to be
        // nearby. We're also going to say 2 is not present.
        struct['FA_FOL_date'] = followDate;
        struct['FA_FOL_B_focal_AnimID'] = focalChimpId;
        struct['FA_B_arr_AnimID'] = chimpId;
        struct['FA_time_start'] = followTime;
        
        if (sState !== null) {
            struct['FA_type_of_cycle'] = sState;
        }
        
        if (isPresent !== null) {
            if (isPresent) {
                struct['FA_type_of_certainty'] = flag_chimpPresent;
            } else {
                struct['FA_type_of_certainty'] = flag_chimpAbsent;
            }
        } 

        if (isWithin5 !== null) {
            if (isWithin5) {
                struct['FA_within_five_meters'] = flag_chimpPresent;
            } else {
                struct['FA_within_five_meters'] = flag_chimpAbsent;
            }
        } 

        if (isClosest !== null) {
            if (isClosest) {
                struct['FA_closest_to_focal'] = flag_chimpPresent;
            } else {
                struct['FA_closest_to_focal'] = flag_chimpAbsent;
            }
        } 
        
        if (isUpdate) {
            window.odkData.updateRow('follow_arrival', struct, rowId,
                    cbAddRowFASuccess, cbAddRowFAFail);
            console.log('called update chimp: ' + chimpId);
        } else {
            var newRowId = util.genUUID();
            window.odkData.addRow('follow_arrival', struct, newRowId, 
                    cbAddRowFASuccess, cbAddRowFAFail);
            console.log('called added chimp: ' + chimpId);
        }
    }

    var incrementTime = function(time) {
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
        var hoursStr = convertToStringWithTwoZeros(hours);
        var minsStr = convertToStringWithTwoZeros(mins);
        var result = hoursStr + ':' + minsStr;
        return result;
    };

    var convertToStringWithTwoZeros = function(time) {
        var result;
        if (time < 10) {
            result = '0' + time;
        } else {
            result = time.toString();
        }
        return result;
    };    

    /**
     * Get the time point for the interval before this one. Does NOT consider
     * hour overflows/underflows (if an underflow is when it goes below 0...
     */
    var decrementTime = function(time) {
        var interval = 15;
        var parts = time.split(':');
        var hours = parseInt(parts[0]);
        var mins = parseInt(parts[1]);
        var maybeTooSmall = mins - interval;

        if (maybeTooSmall < 0) {
            mins = maybeTooSmall + 60;
            hours = hours - 1;
        } else {
            mins = maybeTooSmall;
        }

        // Format these strings to be two digits.
        var minsStr = convertToStringWithTwoZeros(mins);
        var hoursStr = convertToStringWithTwoZeros(hours);
        var result = hoursStr + ':' + minsStr;
        return result;
    };

    /**
     * Set up the ui to show the focal chimp.
     */
    var initUIForFocalChimp = function() {
        // There are four items pertaining to the focal chimp:
        // its id, present, 5m, and closest.
        // we are going to hide the three checkboxes and create a new td
        // spanning its space saying "Focal"
        var present = $('#' + focalChimpId + presentSuffix);
        var fiveMeters = $('#' + focalChimpId + fiveMeterSuffix);
        var sexualState = $('#' + focalChimpId + sexualStateSuffix);
        
        // We have selected the inputs, but we actually need to remove their
        // parents to keep the correct number of td elements.
        present.parent().remove();
        fiveMeters.parent().remove();
        if (sexualState) {
            sexualState.remove();
        }

        // Now add the new element.
        // If the focal chimp is male, we only have two checkboxes, so we'll
        // need to set a colspan to 2. If it's a female, we want three.
        var focalChimp = $('#' + focalChimpId);
        var colSpan;
        if (focalChimp.hasClass('male-chimp')) {
            colSpan = 2;
            console.log ('focal chimp is male');
        } else {
            colSpan= 3;
            console.log('focal chimp is female');
        }
        var focalTd = $('<td class="focal-label">');
        focalTd.prop('colspan', colSpan);
        focalTd.html('Focal');
        var chimp = $('#' + focalChimpId)[0];
        // we're passing the first element because we want the HTML object, not
        // the jquery object.
        insertAfter(focalTd[0], chimp);

        // and assign the focal-chimp class to the chimp.
        $('#' + focalChimpId).addClass('focal-chimp');
    };

    /**
     * This updates the database to say that the chimp currently marked as
     * closest to the focal chimp is no longer closest. This is important so
     * that we don't end up with numerous closest chimps. This doesn't update
     * anything in the UI.
     */
    var writeClosestChimpNoLongerClosest = function() {
        // First we have to find the closest chimp.
        var closestChimp = $('.closest-chimp');
        if (closestChimp.size() === 0) {
            // then there wasn't a previous closest.
            console.log('there was no previous closest chimp');
            return;
        }
        var chimpId = closestChimp.prop('id');
        var rowId = rowIdCache[chimpId];
        
        console.log('the id of the formerly closest chimp is: ' + chimpId);
        console.log('the row id of the formerly closest chimp is: ' + rowId);
        writeRowForChimp(true, rowId, chimpId, true, null, false, null);
    };

    var updateUIForFood = function() {

        var foodIds = ['bananas', 'berries', 'flesh'];
        foodIds.forEach(function(foodId) {
            updateUIForFoodPresence(foodId);
        });
    };

    /**
     *  Update the food with the ID to show that it is visible.
     */
    var updateUIForFoodPresence = function(foodId) {
        // in this iteration we're just showing the -user-list element.
        // we're expecting the id to be foodId-user-list
        var item = $('#' + foodId + '-user-list');
        if (!(isValidFood(foodId))) {
            alert('invalid food selected: ' + foodId);
            return;
        }
        var isPresent = foodIsPresent(foodId);
        if (isPresent) {
            item.css('display', 'block');
        } else {
            item.css('display', 'none');
        }
    };

    var updateUIForSpeciesCount = function(speciesId) {
        
        if (!(isValidSpecies(speciesId))) {
            alert('update ui for count unrecognized species: ' + speciesId);
            return;
        }

        var numPresent = getNumberOfSpeciesPresent(speciesId);

        var countBadge = $('#' + speciesId + '-count');
        countBadge.html(numPresent);

        // now show or hide the user item depending on the count.
        var item = $('#' + speciesId + '-user-list');
        if (numPresent === 0) {
            item.css('display', 'none');
        } else {
            item.css('display', 'block');
        }

    };

    var updateUIForAllSpecies = function() {

        // We're going to flag the food user lists as visible or not.
        var speciesIds = ['chatu', 'kenge', 'kima', 'nguruwe', 'nkunge', 'nyani', 'nyoka', 'pongo', 'unknown', 'vyondi'];

        speciesIds.forEach(function(speciesId) {
            updateUIForSpeciesCount(speciesId);
        });

    };

    var cbPrevNewTimePointSuccess = function(result) {
        // previous time is not a new time point
        if (!(result.getCount() === 0)) {
            console.log(
                    'there is a previous time point, updating ui for that');
            initUIFromDatabaseForTime(previousTime, true);
            // And now generate entries for all the rows. This will also
            // establish a row for every chimp, which is important for our
            // assumptions down the line.

            // Have to make sure that the UI is done before this can be done correctly!!
            //initDatabaseFromUI();
        } else {
            // Then all the checkboxes are empty. We'll generate a row for
            // every chimp with this call, which is important for establishing
            // the invariants we're going to use later.
            initDatabaseFromUI();
        }
    };

    var cbPrevNewTimePointFail = function(error) {
        console.log('jgiFollowScreen: cbPrevNewTimePointFail failed with error: ' + error);
    };

    var cbNewTimePointSuccess = function(result) {
        var tableData = result;
        if(tableData.getCount() === 0) {
            // Might have to update the UI from the previous time point.
            // We'll do this if the previous time exists.
            previousTime = decrementTime(followTime);
            console.log(
                    'this time is: ' +
                    followTime +
                    ', previous time is: ' +
                    previousTime);
            isNewTimePoint(previousTime, cbPrevNewTimePointSuccess, cbPrevNewTimePointFail);
        } else {
            // We're returning to an existing timepoint, so update the UI to
            // reflect this.
            console.log('Initializing the UI from an existing time');
            initUIFromDatabaseForTime(followTime, false);
        }
    };

    var cbNewTimePointFail = function(error) {
        console.log('jgiFollowScreen: cbNewTimePointFail failed with error: ' + error);
    };

    /*****  end function declaractions  *****/

    // First we'll add the dynamic UI elements.
    // First get all the male chimps
    var maleChimps = getMaleChimps();
    appendMaleCheckBoxes(maleChimps);

    // and now take care of the ladies.
    var femaleChimps = getFemaleChimps();
    appendFemaleCheckBoxes(femaleChimps);

    isNewTimePoint(followTime, cbNewTimePointSuccess, cbNewTimePointFail);

    // Now we'll attach a click listener that rights the state of the checkbox
    // into the database. Note that for now we're only using the present
    // checkboxes, as those are the only ones we're bothering to persist atm
    // until we get a better sense of the database schema.
    $('.present-checkbox').on('click', function() {
        // Get the id of the chimp this box is associated with. Note that the
        // id of the checkbox is the chimp's id + presentSuffix, so we can
        // reclaim the chimp id without issue.
        var indexOfSuffix = this.id.indexOf(presentSuffix);
        var chimpId = this.id.substr(0, indexOfSuffix);
        // now we have the chimp id. Now we need the id of the row for this
        // chimp, which we've cached above.
        var rowId = rowIdCache[chimpId];
        // log it for a sanity check
        console.log('chimp id: ' + chimpId + ' is present with row id: ' + rowId);
        // And now write the value into the database.
        var isChecked = this.checked;
        writeRowForChimp(true, rowId, chimpId, isChecked, null, null, null);
    });
    
    $('.five-checkbox').on('click', function() {
        // Get the id of the chimp this box is associated with. Note that the
        // id of the checkbox is the chimp's id + presentSuffix, so we can
        // reclaim the chimp id without issue.
        var indexOfSuffix = this.id.indexOf(fiveMeterSuffix);
        var chimpId = this.id.substr(0, indexOfSuffix);
        // now we have the chimp id. Now we need the id of the row for this
        // chimp, which we've cached above.
        var rowId = rowIdCache[chimpId];
        // log it for a sanity check
        console.log(
            'chimp id: ' +
            chimpId +
            ' is within 5m with row id: ' +
            rowId);
        // And now write the value into the database.
        var isChecked = this.checked;
        // Assuming that if a chimp is within 5m then it is also present
        writeRowForChimp(true, rowId, chimpId, null, isChecked, null, null);
    });

    $('.species-show').on('click', function() {
        var speciesId = $(this).prop('id');
        console.log('clicked species ' + speciesId);
        setNumberOfSpecies(speciesId, 1);

        updateUIForAllSpecies();

        var rowId = speciesRowIdCache[speciesId];
        writeForSpecies(true, rowId, speciesId, 1);
    });

    $('.food-show').on('click', function() {
        var foodId = $(this).prop('id');
        setFoodIsPresent(foodId, true);
        updateUIForFood();
        var rowId = foodRowIdCache[foodId];
        writeForFood(true, rowId, foodId, true, null, null);

    });

    $('.food-remove').on('click', function() {
        var removeId = $(this).prop('id');
        var dashIndex = removeId.indexOf('-');
        var foodId = removeId.substring(0, dashIndex);
        setFoodIsPresent(foodId, false);
        updateUIForFood();
        var rowId = foodRowIdCache[foodId];
        writeForFood(true, rowId, foodId, false, null, null);

    });

    $('.species-plus').on('click', function() {
        var itemId = $(this).prop('id');
        var indexDash = itemId.indexOf('-');
        var speciesId = itemId.substring(0, indexDash);

        var numberPresent = getNumberOfSpeciesPresent(speciesId) + 1;
        setNumberOfSpecies(speciesId, numberPresent);
        
        updateUIForAllSpecies();

        var rowId = speciesRowIdCache[speciesId];
        writeForSpecies(true, rowId, speciesId, numberPresent);
    });

    $('.species-minus').on('click', function(e) {
        // We don't want the event to propagate up, or else it will hit the
        // plus button as well, which is, quite obviously, wrong.
        e.stopPropagation();

        var itemId = $(this).prop('id');
        var indexDash = itemId.indexOf('-');
        var speciesId = itemId.substring(0, indexDash);

        var numberPresent = getNumberOfSpeciesPresent(speciesId) - 1;
        setNumberOfSpecies(speciesId, numberPresent);

        updateUIForAllSpecies();

        var rowId = speciesRowIdCache[speciesId];
        writeForSpecies(true, rowId, speciesId, numberPresent);
    });
    
    // We also want a click listener on each of the chimp names, which will
    // mark that it is closest to the active chimp.
    $('.chimp').on('click', function() {
        var chimp = $(this);
        if (chimp.hasClass('focal-chimp')) {
            // do nothing
            return;
        }
        if (chimp.hasClass('closest-chimp')){
            chimp.removeClass('closest-chimp');
            writeClosestChimpNoLongerClosest();
        } else {
            // first remove the fact that the oldest closest is closest.
            writeClosestChimpNoLongerClosest();
            // We want to eliminate the closest-chimp class on anything else
            // that has it, lest we end up with two active chimps.
            $('.closest-chimp').removeClass('closest-chimp');
            chimp.addClass('closest-chimp');
            var chimpId = $('.closest-chimp').prop('id');
            var rowId = rowIdCache[chimpId];
            console.log('chimp id: ' + chimpId + ' is closest');
            console.log('row id of cloest chimp is: ' + rowId);
            writeRowForChimp(true, rowId, chimpId, null, null, true, null);
        }
    });

    $('#next-button').on('click', function() {
        console.log('clicked next');        
        //Check if we have a closest to focal checked
        var closestId = $('.closest-chimp').prop('id');
        var noClosestOk = false;
        //If no closest to focal, give an alert. 
        if (closestId == undefined) {
            noClosestOk = confirm('No nearest to focal. Are you sure?');
        }
        else {
            noClosestOk = true;
        }

        //Check if we have any chimps within 5m
        var maleChimps = getMaleChimps();
        var femaleChimps = getFemaleChimps();
        var allChimps = maleChimps.toArray().concat(femaleChimps.toArray());
        
        var noneWithin5ok = false;
        for (var i = 0; i < allChimps.length; i++) {
            var chimpId = allChimps[i].id;
            var within5Checkbox = $('#' + chimpId + fiveMeterSuffix);
            if (within5Checkbox.prop('checked') == true) {
                noneWithin5ok = true;
            }
        }
        //If none within 5m of focal, give an alert. 
        if (noneWithin5ok == false) {
            noneWithin5ok = confirm('No chimps within 5m. Are you sure?');
        }


        // //Check if we have any chimps within 5m
        // var maleChimps = getMaleChimps();
        // var femaleChimps = getFemaleChimps();
        // var allChimps = maleChimps.toArray().concat(femaleChimps.toArray());
        
        // var noneWithin5ok = false;

        // for (var i = 0; i < allChimps.length; i++) {
        //     var chimpId = allChimps[i].id;
        //     var within5Checkbox = $('#' + chimpId + fiveMeterSuffix);
        //     if (within5Checkbox.prop('checked') == true) {
        //         noneWithin5ok = true;
        //     }
        // }
        
        // //If none within 5m of focal, give an alert. 
        // if (noneWithin5ok == false) {
        //     noneWithin5ok = confirm("No chimps within 5m. Are you sure?");
        // }

        if ((noClosestOk == true) && (noneWithin5ok == true)) {
            // And now launch the next screen
            document.getElementById("loading").style.visibility = 'visible'; // shows loading screen        
            
            var nextTime = incrementTime(followTime);

            var queryString = util.getKeysToAppendToURL(
                followDate,
                nextTime,
                focalChimpId);
            var url =
                odkCommon.getFileAsUrl('config/assets/followScreen.html' + queryString);
            console.log('url: ' + url);
            window.location.href = url;
        }
        
    });
    
    // It helps the user to update ui and save the new information to
    // the database
    var updateChimpInfo = function(){
        var chimpId = $(this).prop('id');
        console.log("in event handeler " + chimpId);
        // removing event handeler from all other chimps right now since we want the
        // user to be able update one chimp at a time.
        $('.chimp').unbind("click", updateChimpInfo);
        document.getElementById(chimpId).style.backgroundColor = "green";

        var chimpList = util.getTableDataForTimePoint(
        followDate, followTime,
        focalChimpId);
        var rowId = null;
        for(var i = 0; i < chimpList.getCount(); i++) {
            if (chimpList.getData(i, 'FA_B_arr_AnimID').trim() == chimpId.trim()) {
                rowId = chimpList.getRowId(i);
                break;
            }
        }
        if (rowId != null) {
            var curTime = chimpList.getData(rowId, 'FA_duration_of_obs').trim();
            var curCertain = chimpList.getData(rowId, 'FA_type_of_certainty').trim();
            var curDist = chimpList.getData(rowId, 'FA_within_five_meters').trim();
            var curS = chimpList.getData(rowId, 'FA_type_of_cycle').trim(); 
            var curClose = chimpList.getData(rowId, 'FA_closest_to_focal').trim();
            updateBottomDiv(curTime, curCertain, curDist, curS, curClose);
        } else {
             console.log("There is no Chimp with this name in the database!!!!");
             return;
        }
       
        // getting the information from the div and saving it to the database and
        // updates the ui
        var time = null;
        var certain = null;
        var distance = null;
        var sex_state = null;
        var close = null;
        $('.save_bottom_div').on('click', function() {
            time = $('input[name="time"]:checked').val();
            certain = $('input[name="certain"]:checked').val();
            distance = $('input[name="distance"]:checked').val();
            sex_state = $('input[name="sex_state"]:checked').val();
            close = $('input[name="close"]:checked').val();
            updateUI(true, chimpId,
            time,
            certain,
            distance,
            sex_state,
            close);

            if (rowId != null) {
                writeRowForChimp(
                    true,
                    rowId,
                    chimpId,
                    time,
                    certain,
                    distance,
                    sex_state,
                    close);
            } else {
                console.log("There is no Chimp with this name in the database!!!!");
                return;
            }

            // we are done with updating the current chimp. so we can re bind the
            // all the chimps to the event handeler
            $('.chimp').bind("click", updateChimpInfo);
        }); 
    };       
   // binding event handler to all the chimps
   $('.chimp').bind("click", updateChimpInfo);
    
    // Updates the follow page according to the current information regarding foods
    var foodData = util.getFoodDataForDatePoint(
            followDate, focalChimpId);

    var tableLength = foodData.getCount();
    var ul = document.createElement('ul');
    ul.setAttribute('id','shown-food');
    ul.className = 'foodList';
    ul.className = 'list-group'; // for pretty purpose
    document.getElementById('buttons').appendChild(ul);
    var li = document.createElement('li');
    li.innerHTML = "FOOD: "
    ul.appendChild(li);

    
    for (var i = 0; i < tableLength; i++) {
        var test = foodData.getData(i, 'FB_end_feed_time');
        if (test == null  || test == undefined) {
            var followArray = followTime.split(":");
            var follow = new Date(99, 1, 1, parseInt(followArray[0]), parseInt(followArray[1]), 0, 0);
            var beginTimeEat = foodData.getData(i, 'FB_begin_feed_time');
            var beginTimeArray = beginTimeEat.split(":");
            
            var beginTime = new Date(99, 1, 1, parseInt(beginTimeArray[0]), parseInt(beginTimeArray[1]), 0, 0);
            
            if (follow <= beginTime){
                var li_1 = document.createElement('li');
                li_1.className = 'list-group-item';
                ul.appendChild(li_1);
                var a_tag = document.createElement('a');
                a_tag.setAttribute('id', foodData.getData(i, 'FB_FL_local_food_name').trim() + " " +foodData.getData(i, 'FB_FPL_local_food_part').trim()
                    + " " +foodData.getData(i, 'FB_begin_feed_time').trim());
                a_tag.className = "food food-remove";
                a_tag.setAttribute('href', "#"); // its not gonna go anywhere
                a_tag.innerHTML = foodData.getData(i, 'FB_FL_local_food_name');
                li_1.appendChild(a_tag);
            } 
        }
    }
    // by clicking on the food, user will go to the food page and iput the end time only and come
    // back to the follow page which make the food disappeared from th efolow page.
    $('.food-remove').on('click', function() {
        var foodId = $(this).prop('id');
        var foods = foodId.split(" ");
        var foodName = foods[0];
        var foodPartName = foods[1];
        var foodStartTime = foods[2];
        console.log("FoodName " + foodName);
        console.log("FoodPartName " + foodPartName);
        var queryString = util.getKeysToAppendToURL2(
           followDate,
           followTime,
           focalChimpId, foodStartTime, foodName, foodPartName);
        var url = control.getFileAsUrl(
                'assets/foodPageForFocalChimp.html' + queryString);
        window.location.href = url;

    });

    // Updates the follow page according to the current information regarding species
    var sul = document.createElement('ul');
    sul.setAttribute('id','shown-species');
    sul.className = 'list-group';
    var sli = document.createElement('li');
    sul.appendChild(sli);
    sli.innerHTML = "Species: "
    document.getElementById('buttons').appendChild(sul);
    var speciesData = util.getSpeciesDataForTimePoints(followDate, focalChimpId);
    var sTableLength = speciesData.getCount();
    console.log("table length right now: " + sTableLength);
    for (var i = 0; i < sTableLength; i++) {
        var test = speciesData.getData(i, 'OS_time_end');

        if (test == null  || test == undefined) {
            var sFollowArray = followTime.split(":");
            var sFollow = new Date(99, 1, 1, parseInt(sFollowArray[0]), parseInt(sFollowArray[1]), 0, 0);
            var sBeginTimeFollow = speciesData.getData(i, 'OS_time_begin');
            var sBeginTimeArray = sBeginTimeFollow.split(":");
            var sBeginTime = new Date(99, 1, 1, parseInt(sBeginTimeArray[0]), parseInt(sBeginTimeArray[1]), 0, 0);
            
            if (sFollow <= sBeginTime){
                var sli_1 = document.createElement('li');
                sli_1.className = 'list-group-item';
                sul.appendChild(sli_1);
                var sa_tag = document.createElement('a');
                sa_tag.setAttribute('id', speciesData.getData(i, 'OS_time_begin').trim() + " " + speciesData.getData(i, 'OS_local_species_name_written').trim()
                    + " " + speciesData.getData(i, 'OS_duration').trim());
                sa_tag.className = "species species-remove";
                sa_tag.setAttribute('href', "#"); // its not gonna go anywhere
                sa_tag.innerHTML = speciesData.getData(i, 'OS_local_species_name_written')
                sli_1.appendChild(sa_tag);
            }
        }
    }
    
    // by clicking on the species, user will go to the species page and iput the end time only and come
    // back to the follow page which make the species disappeared from th efolow page.
    $('.species-remove').on('click', function() {
        var removeId = $(this).prop('id');
        var species = removeId.split(" ");
        var timeOfPresence = species[0];
        var speciesName = species[1];
        var numOfSpecies = species[2];
        
        var queryString = util.getKeysToAppendToURL3(
           followDate,
           followTime,
           focalChimpId, timeOfPresence, speciesName, numOfSpecies);
        var url = control.getFileAsUrl(
                'assets/speciesPageForFocalChimp.html' + queryString);
        window.location.href = url;
    });

    // taking to the food page
    $('#button-food').on('click', function() {
        var queryString = util.getKeysToAppendToURL2(
           followDate,
           followTime,
           focalChimpId, "", "", "");
        var url = control.getFileAsUrl(
                'assets/foodPageForFocalChimp.html' + queryString);
        window.location.href = url;
    });

    // taking to the species page
    $('#button-species').on('click', function() {
        var queryString = util.getKeysToAppendToURL3(
           followDate,
           followTime,
           focalChimpId, "", "", "");
        var url = control.getFileAsUrl(
                'assets/speciesPageForFocalChimp.html' + queryString);
        window.location.href = url;
    });
}
