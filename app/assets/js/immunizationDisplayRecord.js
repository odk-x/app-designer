/* global control, util */
'use strict';

function display() {

    var id = scanQueries.getQueryParameter(scanQueries.id);

    console.log("id " + id);

    if (!id=="") {
        var page2 = scanQueries.getExistingRecordByPatientCode(patientcode, 'scan_page2');
        //We only found one record associated with this id so use that
        if (page2.getCount()==1)
        {
            var rowId = page2.getRowId(0);
            var opv0date = page2.getData(rowId, '');

            var opv0button = $('#opv0');
        }
        //We found multiple records associated with this id so let's look for more identifiers
        else if (page2.getCount() > 1)
        {
            //Figure out what to do if more than one record. Shouldn't happen in theory. 
            console.log("Oops. More than one record found with patient code " + id);
        }
    }

}
