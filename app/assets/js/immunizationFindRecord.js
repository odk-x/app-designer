/* global control, util */
'use strict';

function display() {

    // Here we are expecting just to add a row with the data elements into
    // the FOLLOW table and go to the first follow screen.
    
    /**
     * Write the follow data into the database.
     */
    var retreiveFromDatabase = function(
            id,
            name,
            month) {
		
        var struct = {};
        struct['FOL_date'] = id;
        struct['FOL_B_AnimID'] = name;
        struct['FOL_CL_community_id'] = month;
		
		console.log('ID is ' + id + " name is " + name + " month is " + month);

        // Now we need to search the database for records that match
    };

    $('#begin-search').on('click', function() {
        // First retrieve the information from the form.
        var id = $('#patient_id').val();
        var name = $('#patient_name').val();
        var month = $('#patient_birth_month').val();

        retreiveFromDatabase(
            id,
            name,
            month);

        // Now we'll launch the results screen. 
		//var queryString = util.getKeysToAppendToURL(
        //    date,
        //    beginTime,
        //    focalChimpId);
        //var url = control.getFileAsUrl(
        //        'assets/followScreen.html' + queryString);
        //window.location.href = url;
    });

}
