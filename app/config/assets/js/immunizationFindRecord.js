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
            var results = scanQueries.getExistingRecordById(id);
            //We only found one record associated with this id so use that
            if (results.getCount()==1)
            {
                var rowId = results.getRowId(0);
                //Open the list view for the found record
                control.openDetailView(
                        'scan_childvacc_822_pg1',
                        rowId,
                        'tables/scan_childvacc_822_pg1/html/scan_childvacc_822_pg1_detail.html');
            }
            //We found multiple records associated with this id so let's look for more identifiers
            else
            {
                control.openTableToListView(
                'scan_childvacc_822_pg1',
                'Child_patient_ID = ?',
                [id],
                'tables/scan_childvacc_822_pg1/html/scan_childvacc_822_pg1_list.html');
            }
        }
        else if (!name==""){
            var results = scanQueries.getExistingRecordByName(name);
            if (results.getCount()==1)
            {
                var rowId = results.getRowId(0);
                //Open the list view for the found record
                control.openDetailView(
                        'scan_childvacc_822_pg1',
                        rowId,
                        'tables/scan_childvacc_822_pg1/html/scan_childvacc_822_pg1_detail.html');
            }
            //We found multiple records associated with this id so let's look for more identifiers
            else
            {
                control.openTableToListView(
                'scan_childvacc_822_pg1',
                'Child_name = ?',
                [name],
                'tables/scan_childvacc_822_pg1/html/scan_childvacc_822_pg1_list.html');
            }
        }
        else if (!birthdate==""){
            var results = scanQueries.getExistingRecordByBirthDate(birthdate);
            if (results.getCount()==1)
            {
                var rowId = results.getRowId(0);
                //Open the list view for the found record
                control.openDetailView(
                        'scan_childvacc_822_pg1',
                        rowId,
                        'tables/scan_childvacc_822_pg1/html/scan_childvacc_822_pg1_detail.html');
            }
            //We found multiple records associated with this id so let's look for more identifiers
            else
            {
                control.openTableToListView(
                'scan_childvacc_822_pg1',
                'Child_DOB = ?',
                [birthdate],
                'tables/scan_childvacc_822_pg1/html/scan_childvacc_822_pg1_list.html');
            }
        }
		console.log('Done finding ' + id);
    };

    $('#begin-search').on('click', function() {
        // First retrieve the information from the form.
        var id = $('#patient_id').val();
        var name = $('#patient_name').val();
        var birthdate = $('#patient_birth_date').val();

        retreiveFromDatabase(
            id,
            name,
            birthdate);
    });

}
