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

    var followTimeUserFriendly;
    if (followTime === null) {
        // notify the user if we haven't specified a follow time. This will be
        // only useful for debugging purposes.
        alert('No follow time has been specified!');
        followTimeUserFriendly = 'N/A';
    } else {
        followTimeUserFriendly = followTime.replace('_', ':');
    }

    $('#time-label').eq(0).html(followTimeUserFriendly);

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
                    control.launchHTML(baseUrl + queryStr);
                });
            })(queryString);
            //anchor.on('click', function() {
                //control.launchHTML(baseUrl + queryString);
            //});
            var menuItem = $('<li>');
            menuItem.append(anchor);
            
            // And now append the menu item.
            dropdownMenu.append(menuItem);
        }
    };

    updateOlderMenu();

    // These are the suffixes we'll use for the ids of the checkboxes. A whole
    // id would thus consist of something along the lines of:
    // chimpId + present_suffix
    var presentSuffix = '_present';
    var fiveMeterSuffix = '_5m';
    var closestSuffix = '_closest';
    
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
     * Add the requesite checkboxes for the chimps.
     */
    var appendCheckBoxes = function(chimpTDArray) {
        // We're assuming that we have three checkboxes each, in the order:
        // present, within five meters, closest to primary chimp
        for (var i = 0; i < chimpTDArray.length; i++) {
            var chimpNode = chimpTDArray[i];
            var chimpId = chimpNode.id;

            // make the td elements. I don't remember having to do [0] in the
            // past, but apparently you usually do. Hmm.
            var presentTD = $('<td>')[0];
            var fiveMetersTD = $('<td>')[0];
            var closestTD = $('<td>')[0];

            // The checkboxes that will go in each row.
            var presentCB = $('<input type="checkbox">')[0];
            var fiveMetersCB = $('<input type="checkbox">')[0];
            var closestCB = $('<input type="checkbox">')[0];

            // Set the ids so we can retrieve and save the data later.
            presentCB.id = chimpId + presentSuffix;
            fiveMetersCB.id = chimpId + fiveMeterSuffix;
            closestCB.id = chimpId + closestSuffix;

            // Add the checkboxes to the td elements.
            presentTD.appendChild(presentCB);
            fiveMetersTD.appendChild(fiveMetersCB);
            closestTD.appendChild(closestCB);

            // And then add the td to the table.
            insertAfter(closestTD, chimpNode);
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

    var getFemaleChimps = function() {
        var result = $('.female-chimp');
        return result;
    };


    // First get all the male chimps, which     var maleChimps = $('.male-chimp');
    var maleChimps = getMaleChimps();
    appendCheckBoxes(maleChimps);

    // and now take care of the ladies.
    var femaleChimps = getFemaleChimps();
    appendCheckBoxes(femaleChimps);

    /**
     * Update the contents of the database.
     */
    var updateDatabase = function() {
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
            // JGI wanted three checkboxes. However, it isn't obvious to me how
            // we'll be persisting those checkboxes. So, let's just use the 
            // 'present' checkbox and persist a row if they are there.
            var presentId = chimpId + presentSuffix;
            var presentCB = $('#' + presentId).eq(0);
            if (presentCB.prop('checked')) {
                var struct = {};
                struct['FA_FOL_date'] = followDate;
                struct['FA_FOL_B_focal_AnimID'] = focalChimpId;
                struct['FA_B_arr_AnimID'] = chimpId;
                struct['FA_time_start'] = followTime;
                var stringified = JSON.stringify(struct);
                control.addRow('follow_arrival', stringified);
            } else {
                // do nothing.
            }
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
        var hoursStr;
        var minsStr;
        if (hours < 10) {
            hoursStr = '0' + hours;
        } else {
            hoursStr = hours.toString();
        }
        if (mins < 10) {
            minsStr = '0' + mins.toString();
        } else {
            minsStr = mins.toString();
        }
        var result = hoursStr + ':' + minsStr;
        return result;
    };

    $('#next-button').on('click', function() {
        console.log('clicked next');

        updateDatabase();

        // And now launch the next screen
        var nextTime = incrementTime(followTime);

        var queryString = util.getKeysToAppendToURL(
            followDate,
            nextTime,
            focalChimpId);
        control.launchHTML('assets/followScreen.html' + queryString);

    });

}
