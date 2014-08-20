/* global control, util, alert */
'use strict';

if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/follow_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            if (dataObj === undefined || dataObj === null) {
                console.log('Could not load data json for table: follow');
            }
            window.data.setBackingObject(dataObj);
        }
    });
}

function display() {

    // We're expecting the follow time to be present as a url parameter,
    // something along the lines of:
    // ?follow_time=07_15
    var followTime = util.getQueryParameter(util.timeKey);

    var followDate = util.getQueryParameter(util.dateKey);
    var focalChimpId = util.getQueryParameter(util.focalChimpKey);

    // These flags correspond to the values of the FA_type_of_certainty column
    // in the follow_arrival table. They don't have a type 2, while we do. This
    // is going to mean "not present", as we're going to have a row per chimp
    // per time point, even if they're not there, just to simplify the logic.
    var flag_chimpPresent = 1;
    var flag_chimpAbsent = 2;

    // These are the suffixes we'll use for the ids of the checkboxes. A whole
    // id would thus consist of something along the lines of:
    // chimpId + present_suffix
    var presentSuffix = '_present';
    var fiveMeterSuffix = '_5m';
    var sexualStateSuffix = '_sexual-state';

    var sexualStates = ['0', '0.25', '0.5', '0.75', '1.0', 'U'];

    // This will hold the values for the numbers of species present;
    var speciesCounts = {};
    speciesCounts.chatu = 0;
    speciesCounts.kenge = 0;
    speciesCounts.kima = 0;
    speciesCounts.nguruwe = 0;
    speciesCounts.nkunge = 0;
    speciesCounts.nyani = 0;
    speciesCounts.nyoka = 0;
    speciesCounts.pongo = 0;
    speciesCounts.vyondi = 0;
    speciesCounts.unknown = 0;

    // This will hold whether or not food is present. This is just binary
    // like this, or should we actually be tallying them as in the species
    // case?
    var foodPresent = {};
    foodPresent.bananas = false;
    foodPresent.berries = false;
    foodPresent.flesh = false;

    var followTimeUserFriendly;
    if (followTime === null) {
        // notify the user if we haven't specified a follow time. This will be
        // only useful for debugging purposes.
        alert('No follow time has been specified!');
        followTimeUserFriendly = 'N/A';
    } else {
        followTimeUserFriendly = followTime.replace('_', ':');
    }

    /**
     * Return true if a valid species else false.
     */
    var isValidSpecies = function(species) {
        // First make sure this is a valid key.
        if (!(species in speciesCounts)) {
            return false;
        } else {
            return true;
        }
    };

    var isValidFood = function(food) {
        // First make sure this is a valid key.
        if (!(food in foodPresent)) {
            return false;
        } else {
            return true;
        }
    };

    /**
     * Get the number present for a species.
     */
    var getNumberOfSpeciesPresent = function(species) {
        // First make sure this is a valid key.
        if (!isValidSpecies(species)) {
            console.trace();
            alert('get number unrecognized species: ' + species);
            return;
        }
        var result = speciesCounts[species];
        return result;
    };

    /**
     * True if the food is present, else false
     */
    var foodIsPresent = function(food) {
        // First make sure this is a valid key.
        if (!isValidFood(food)) {
            console.trace();
            alert('unrecognized food: ' + food);
            return;
        }
        var result = foodPresent[food];
        return result;
    };

    var setFoodIsPresent = function(foodId, isPresent) {
        if (!isValidFood(foodId)) {
            alert('unrecognized food: ' + foodId);
            return;
        }
        foodPresent[foodId] = isPresent;
    };

    var setNumberOfSpecies = function(speciesId, count) {
        if (!isValidSpecies(speciesId)) {
            alert('unrecognized species: ' + speciesId);
            return;
        }
        speciesCounts[speciesId] = count;
    };

    /**
     * Update the state of the UI to reflect what is stored in the database.
     * I.e. if someone goes back to look at an earlier time, this method will
     * retrieve the existing data and update the checkboxes with the
     * appropriate contents.
     */
    var initUIFromDatabaseForTime = function(time, isNew) {
        var tableData = util.getTableDataForTimePoint(
                followDate,
                time,
                focalChimpId);
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

        // Now update the food and species lists.
        var speciesData = util.getSpeciesDataForTimePoint(
                followDate,
                time,
                focalChimpId);
        console.log('species count before updating from db: ' + speciesCounts);
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
            if (isValidSpecies(speciesId)) {
                setNumberOfSpecies(speciesId, speciesCount);
            }

        }
        console.log('species count after updating from db: ' + speciesCount);

        var foodData = util.getFoodDataForTimePoint(
                followDate,
                time,
                focalChimpId);
        console.log('food present before updating from db: ' + foodPresent);
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

    };

    var isNewTimePoint = function(time) {
        // just query for any rows in the db. This is an extra call that we
        // might be able to cache the results of if performance is bad
        var tableData = util.getTableDataForTimePoint(
                followDate,
                time,
                focalChimpId);
        return tableData.getCount() === 0;
    };

    // The way we interact with the database can lead to a bit of wonkiness
    // here. Essentially, we want to be able to update rows, but to do that we
    // need their row ids. We're going to do a query once to get all the data
    // at this time point and build the row ids out of that to try and speed
    // things up.
    /**
     * Create an object that serves as a cache for the row id for each chimp.
     * Row ids will be stored keyed against the chimp id.
     */
    var createIdCache = function() {
        var tableData = util.getTableDataForTimePoint(
                followDate,
                followTime,
                focalChimpId);
        var result = {};
        for (var i = 0; i < tableData.getCount(); i++) {
            var chimpId = tableData.getData(i, 'FA_B_arr_AnimID');
            var rowId = tableData.getRowId(i);
            result[chimpId] = rowId;
        }
        return result;
    };

    var createFoodRowIdCache = function() {
        var foodData = util.getFoodDataForTimePoint(
                followDate,
                followTime,
                focalChimpId);
        var result = {};
        for (var i = 0; i < foodData.getCount(); i++) {
            var foodId = foodData.getData(i, 'FB_FL_local_food_name');
            var rowId = foodData.getRowId(i);
            result[foodId] = rowId;
        }
        return result;
    };

    var createSpeciesRowIdCache = function() {
        var speciesData = util.getSpeciesDataForTimePoint(
                followDate,
                followTime,
                focalChimpId);
        var result = {};
        for (var i = 0; i < speciesData.getCount(); i++) {
            var speciesId = speciesData.getData(
                    i,
                    'OS_local_species_name_written');
            var rowId = speciesData.getRowId(i);
            result[speciesId] = rowId;
        }
        return result;
    };

    var updateOlderMenu = function() {

        var dropdownMenu = $('#older-items-menu');
        // Remove any older items that are somehow hanging around. This
        // should always be unnecessary, I think.
        dropdownMenu.empty();
        
        // First, get the older times.
        var existingTimes = util.getExistingTimesForDate(
                followDate,
                focalChimpId);

        console.log('existing timepoints: ' + existingTimes);

        var baseUrl = 'assets/followScreen.html';

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

        for (var i = 0; i < existingTimes.length; i++) {
            var olderFollowTime = existingTimes[i];
            // The url these will launch is ths jgiFollowScreen plus the query
            // parameters defining the unique moment (date, time, and chimp).
            var queryString = util.getKeysToAppendToURL(
                    followDate,
                    olderFollowTime,
                    focalChimpId);
            var anchor = $('<a>');
            //anchor.prop('href', control.getFileAsUrl(baseUrl + queryString));
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
                    var url = control.getFileAsUrl(baseUrl + queryStr);
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

    /**
     * Add the requesite checkboxes for the male chimps.
     */
    var appendMaleCheckBoxes = function(chimpTDArray) {
        // We're assuming that we have two checkboxes each, in the order:
        // present, within five meters
        for (var i = 0; i < chimpTDArray.length; i++) {
            var chimpNode = chimpTDArray[i];
            var chimpId = chimpNode.id;
            
            // make the td elements. I don't remember having to do [0] in the
            // past, but apparently you usually do. Hmm.
            var presentTD = $('<td>')[0];
            var fiveMetersTD = $('<td>')[0];
            
            // The checkboxes that will go in each row.
            var presentCB =
            $('<input type="checkbox" class="present-checkbox">')[0];
            var fiveMetersCB =
            $('<input type="checkbox" class="five-checkbox">')[0];
            
            // Set the ids so we can retrieve and save the data later.
            presentCB.id = chimpId + presentSuffix;
            fiveMetersCB.id = chimpId + fiveMeterSuffix;
            
            // Add the checkboxes to the td elements.
            presentTD.appendChild(presentCB);
            fiveMetersTD.appendChild(fiveMetersCB);
            
            // And then add the td to the table.
            insertAfter(fiveMetersTD, chimpNode);
            insertAfter(presentTD, chimpNode);
        }
    };
    
    /**
     * Add the requesite checkboxes for the female chimps.
     */
    var appendFemaleCheckBoxes = function(chimpTDArray) {
        // We're assuming that we have three checkboxes each, in the order:
        // present, within five meters, closest to primary chimp
        for (var i = 0; i < chimpTDArray.length; i++) {
            var chimpNode = chimpTDArray[i];
            var chimpId = chimpNode.id;

            // make the td elements. I don't remember having to do [0] in the
            // past, but apparently you usually do. Hmm.
            var presentTD = $('<td>')[0];
            var fiveMetersTD = $('<td>')[0];
            var sexualState = $('<td class="sexual-state">')[0];
            // update the sexual state to be the first value, just so there's
            // always something there.
            $(sexualState).html(sexualStates[0]);

            // The checkboxes that will go in each row.
            var presentCB =
                $('<input type="checkbox" class="present-checkbox">')[0];
            var fiveMetersCB =
                $('<input type="checkbox" class="five-checkbox">')[0];

            // Set the ids so we can retrieve and save the data later.
            presentCB.id = chimpId + presentSuffix;
            fiveMetersCB.id = chimpId + fiveMeterSuffix;
            sexualState.id = chimpId + sexualStateSuffix;

            // Add the checkboxes to the td elements.
            presentTD.appendChild(presentCB);
            fiveMetersTD.appendChild(fiveMetersCB);

            // And then add the td to the table.
            insertAfter(sexualState, chimpNode);
            insertAfter(fiveMetersTD, chimpNode);
            insertAfter(presentTD, chimpNode);
        }
    };

    var getMaleChimps = function() {
        // We've defined the male chimps by giving them the
        // class 'male-chimp'. Selectors use '.class', so we'll find them and
        // append three checkboxes to each.
        var result = $('.male-chimp');
        return result;
    };

    var getSpecies = function() {
        var result = $('.species');
        return result;
    };

    var getFoods = function() {
        var result = $('.food');
        return result;
    };

    var getFemaleChimps = function() {
        var result = $('.female-chimp');
        return result;
    };


    /**
     * Update the contents of the database based on the state of the UI.
     * Creates rows, does not update rows.
     */
    var initDatabaseFromUI = function() {
        // Update the database with the contents of the boxes that are
        // checked. This is complicated slightly by the fact that the database
        // structure we currently have doesn't match perfectly with the way
        // we'd ideally be doing this. We'll make a best pass.

        // First, get all the chimps. This means the male chimps and the female
        // chimps.
        var maleChimps = getMaleChimps();
        var femaleChimps = getFemaleChimps();
        
        var allChimps = maleChimps.toArray().concat(femaleChimps.toArray());
        
        for (var i = 0; i < allChimps.length; i++) {
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
        
        for (var i = 0; i < species.length; i++) {

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
        for (var i = 0; i < foods.length; i++) {
            var id = foods.eq(i).prop('id');
            var isPresent = foodIsPresent(id);
            writeForFood(false, null, id, isPresent, null, null);
        }


    };

    var writeForSpecies = function(isUpdate, rowId, speciesId, numPresent) {

        var struct = {};
        struct['OS_FOL_date'] = followDate;
        struct['OS_time_begin'] = followTime;
        struct['OS_FOL_B_focal_AnimID'] = focalChimpId;

        struct['OS_local_species_name_written'] = speciesId;
        var numPresentStr = numPresent.toString();
        struct['OS_duration'] = numPresentStr;

        var stringified = JSON.stringify(struct);
        if (isUpdate) {
            var updateSuccessfully = control.updateRow(
                    'other_species',
                    stringified,
                    rowId);
            console.log('updated species successfully: ' + updateSuccessfully);
        } else {
            var addSuccessfully = control.addRow(
                    'other_species',
                    stringified);
            //console.log('added species successfully: ' + addSuccessfully);
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

        var stringified = JSON.stringify(struct);
        if (isUpdate) {
            var updateSuccessfully = control.updateRow(
                    'food_bout',
                    stringified,
                    rowId);
            console.log('updated food successfully: ' + updateSuccessfully);
        } else {
            var addSuccessfully = control.addRow(
                    'food_bout',
                    stringified);
            console.log('added food successfully: ' + addSuccessfully);
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


    /**
     * Increment the time for the next interval. time is expected to be of the
     * format hh:mm. Returns the next time point, accounting for minute
     * overflows. Does NOT consider hour overflows.
     */
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

    /**
     * Take an integer and return a correctly formatted string--i.e. one with
     * two zeros.
     */
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

    /*****  end function declaractions  *****/

    // First we'll add the dynamic UI elements.
    // First get all the male chimps
    var maleChimps = getMaleChimps();
    appendMaleCheckBoxes(maleChimps);

    // and now take care of the ladies.
    var femaleChimps = getFemaleChimps();
    appendFemaleCheckBoxes(femaleChimps);

    // Now handle the first pass of the screen.
    if (isNewTimePoint(followTime)) {
        // Might have to update the UI from the previous time point.
        // We'll do this if the previous time exists.
        var previousTime = decrementTime(followTime);
        console.log(
                'this time is: ' +
                followTime +
                ', previous time is: ' +
                previousTime);
        if (!isNewTimePoint(previousTime)) {
            console.log(
                    'there is a previous time point, updating ui for that');
            initUIFromDatabaseForTime(previousTime, true);
            // And now generate entries for all the rows. This will also
            // establish a row for every chimp, which is important for our
            // assumptions down the line.
            initDatabaseFromUI();
        } else {
            // Then all the checkboxes are empty. We'll generate a row for
            // every chimp with this call, which is important for establishing
            // the invariants we're going to use later.
            initDatabaseFromUI();
        }
    } else {
        // We're returning to an existing timepoint, so update the UI to
        // reflect this.
        initUIFromDatabaseForTime(followTime, false);
    }

    var rowIdCache = createIdCache();
    var speciesRowIdCache = createSpeciesRowIdCache();
    var foodRowIdCache = createFoodRowIdCache();

    $('#time-label').eq(0).html(followTimeUserFriendly);

    updateOlderMenu();
    initUIForFocalChimp();
    updateUIForAllSpecies();
    updateUIForFood();

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
            noClosestOk = confirm("No nearest to focal. Are you sure?");
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
            noneWithin5ok = confirm("No chimps within 5m. Are you sure?");
        }

        if ((noClosestOk == true) && (noneWithin5ok == true)) {
            // And now launch the next screen
            var nextTime = incrementTime(followTime);

            var queryString = util.getKeysToAppendToURL(
                followDate,
                nextTime,
                focalChimpId);
            var url =
                control.getFileAsUrl('assets/followScreen.html' + queryString);
            console.log('url: ' + url);
            window.location.href = url;
        }
        
    });

    $('.sexual-state').on('click', function() {
        console.log('clicked sexual state');
        // find the current sexual state, just as a sanity check.
        var chimpId = this.id;
        
        var indexOfSuffix = this.id.indexOf(sexualStateSuffix);
        var chimpName = this.id.substr(0, indexOfSuffix);
        
        var currentState = $(this).html();
        console.log(
            'sexual state for chimp ' + chimpName + ' is ' + currentState);
        // now update it to be the next one.
        var nextIndex =
            (sexualStates.indexOf(currentState) + 1) % sexualStates.length;
        var nextState = sexualStates[nextIndex];
        $(this).html(nextState);
        var rowId = rowIdCache[chimpName];
        
        writeRowForChimp(true, rowId, chimpName, null, null, null, nextState);
        console.log('next sexual state for ' + chimpName + ' is: ' + nextState);
                    
    });

}
