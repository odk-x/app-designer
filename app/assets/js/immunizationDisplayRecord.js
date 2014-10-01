/* global control, util */
'use strict';

function display() {

    var patientcode = scanQueries.getQueryParameter(scanQueries.p_code);

    var childid = scanQueries.getQueryParameter(scanQueries.childid);
    var idCell = $('#id');
    $(idCell).html(childid);

    var name = scanQueries.getQueryParameter(scanQueries.name);
    var nameCell = $('#name');
    $(nameCell).html(name);

    var birthdate = scanQueries.getQueryParameter(scanQueries.birthdate);
    var birthdateCell = $('#birthdate');
    $(birthdateCell).html(birthdate);
    

    if (!childid=="") {
        var page2 = scanQueries.getExistingRecordByPatientCode(patientcode, 'scan_childvacc_822a_pg2');
        //We only found one record associated with this id so use that
        if (page2.getCount()==1)
        {
            var rowId = page2.getRowId(0);
            var opv0date = page2.getData(rowId, 'opv0_dategiven');
            if (opv0date != undefined) {
                var opv0cell = $('#opv0');

                $(opv0cell).html(opv0date);
                $(opv0cell).removeClass('not-delivered');
                $(opv0cell).addClass('delivered');
            }

            var hepb0date = page2.getData(rowId, 'hepb0_dategiven');
            if (hepb0date != undefined) {
                var hepb0cell = $('#hepb0');    
                $(hepb0cell).html(hepb0date);  
                $(hepb0cell).removeClass('not-delivered');
                $(hepb0cell).addClass('delivered'); 
            }     
        }
        //We found multiple records associated with this id so let's look for more identifiers
        else if (page2.getCount() > 1)
        {
            //Figure out what to do if more than one record. Shouldn't happen in theory. 
            console.log("Oops. More than one record found with patient code " + childid);
        }

        var page3 = scanQueries.getExistingRecordByPatientCode(patientcode, 'scan_childvacc_825_pg3');
        //We only found one record associated with this id so use that
        if (page3.getCount()==1)
        {
            var rowId = page3.getRowId(0);
            var opv1date = page3.getData(rowId, 'opv1_dategiven');
            if (opv1date != undefined) {
                var opv1cell = $('#opv1');
                $(opv1cell).html(opv1date);
                $(opv1cell).removeClass('not-delivered');
                $(opv1cell).addClass('delivered');
            }

            var pcv1date = page3.getData(rowId, 'pcv1_dategiven');
            if (pcv1date != undefined) {
            var pcv1cell = $('#pcv1');    
                $(pcv1cell).html(pcv1date);  
                $(pcv1cell).removeClass('not-delivered');
                $(pcv1cell).addClass('delivered');
            }

            var rota1date = page3.getData(rowId, 'rota1_dategiven');
            if (rota1date) {
                var rota1cell = $('#rota1');
                $(rota1cell).html(rota1date);
                $(rota1cell).removeClass('not-delivered');
                $(rota1cell).addClass('delivered');
            }
       
            var penta1date = page3.getData(rowId, 'penta1_dategiven');
            if (penta1date != undefined) {
                var penta1cell = $('#penta1');    
                $(penta1cell).html(penta1date);  
                $(penta1cell).removeClass('not-delivered');
                $(penta1cell).addClass('delivered');
            }

        }
        //We found multiple records associated with this id so let's look for more identifiers
        else if (page3.getCount() > 1)
        {
            //Figure out what to do if more than one record. Shouldn't happen in theory. 
            console.log("Oops. More than one record found with patient code " + childid);
        }

        var page4 = scanQueries.getExistingRecordByPatientCode(patientcode, 'scan_childvacc_825_pg4');
        //We only found one record associated with this id so use that
        if (page4.getCount()==1)
        {
            var rowId = page4.getRowId(0);
            var opv2date = page4.getData(rowId, 'opv2_dategiven');
            if (opv2date != undefined) {
                console.log("opv2 date", opv2date);
                var opv2cell = $('#opv2');
                $(opv2cell).html(opv2date);
                $(opv2cell).removeClass('not-delivered');
                $(opv2cell).addClass('delivered');
            }

            var pcv2date = page4.getData(rowId, 'pcv2_dategiven');
            if (pev2date != undefined) {
                var pcv2cell = $('#pcv2');    
                $(pcv2cell).html(pcv2date); 
                $(pcv2cell).removeClass('not-delivered');
                $(pcv2cell).addClass('delivered'); 
            }

            var rota2date = page4.getData(rowId, 'rota2_dategiven');
            if (rota2date != undefined) {
                var rota2cell = $('#rota2');
                $(rota2cell).html(rota2date);
                $(rota2cell).removeClass('not-delivered');
                $(rota2cell).addClass('delivered');
            }         

            var penta2date = page4.getData(rowId, 'penta2_dategiven');
            if (penta2date != undefined) {
                var penta2cell = $('#penta2');    
                $(penta2cell).html(penta2date);  
                $(penta2cell).removeClass('not-delivered');
                $(penta2cell).addClass('delivered');
            }
        }
        //We found multiple records associated with this id so let's look for more identifiers
        else if (page4.getCount() > 1)
        {
            //Figure out what to do if more than one record. Shouldn't happen in theory. 
            console.log("Oops. More than one record found with patient code " + childid);
        }
    }

}
