/* global control, util */
'use strict';

function display() {

    /**
     * Write the follow data into the database.
     */
    var retreiveFromDatabase = function(
            id,
            name,
            birthdate) {

        if (!id=="") {
            var results = hiv_scanQueries.getExistingRecordById(id);
            //We only found one record associated with this id so use that
            if (results.getCount()==1) {
                var rowId = results.getRowId(0);
                //Open the list view for the found record
                control.openDetailView(
                        'scan_HIV_Patient_Record',
                        rowId,
                        'tables/scan_HIV_Patient_Record/html/scan_HIV_Patient_Record_detail.html');
            } else{
                //We found multiple records associated with this id so let's look for more identifiers
                control.openTableToListView(
                'scan_HIV_Patient_Record',
                'Patient_ID = ?',
                [id],
                'tables/scan_HIV_Patient_Record/html/scan_HIV_Patient_Record_list.html');
            }
        }
    };

    $('#begin-search').on('click', function() {
        // First retrieve the information from the form.
        var id = $('#patient_id').val();
        retreiveFromDatabase(
            id);
    });

}
