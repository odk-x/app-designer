/* global control, util */
'use strict';

function display() {

    // Here we are expecting just to add a row with the data elements into
    // the FOLLOW table and go to the first follow screen.
    
    /**
     * Write the follow data into the database.
     */
    var writeNewFollow = function(
            date,
            focalChimpId,
            communityId,
            beginTime,
            researcher) {
        var struct = {};
        struct.FOL_date = date;
        struct.FOL_B_AnimID = focalChimpId;
        struct.FOL_CL_community_id = communityId;
        struct.FOL_begin_time = beginTime;
        struct.FOL_am_observe_1 = researcher;

        // Now we'll stringify the object and write it into the database.
        var stringified = JSON.stringify(struct);
        control.addRow('follow', stringified);
    };

    $('#begin-follow').on('click', function() {
        // First retrieve the information from the form.
        var date = $('#FOL_date').val();
        var focalChimpId = $('#FOL_B_AnimID').val();
        var communityId = $('#FOL_CL_community_id').val();
        var beginTime = $('#FOL_begin_time').val();
        var researcher = $('#FOL_am_observer_1').val();

        // Update the database.
        writeNewFollow(
            date,
            focalChimpId,
            communityId,
            beginTime,
            researcher);

        // Now we'll launch the follow screen. The follow screen needs to know
        // what date we're on, as well as the time it should be using.
        var queryString = util.getKeysToAppendToURL(
            date,
            beginTime,
            focalChimpId);
        control.launchHTML('assets/followScreen.html' + queryString);
    });

}
