/* global control, util */
'use strict';

function display() {



    var patientid = hiv_scanQueries.getQueryParameter(hiv_scanQueries.patientid);
    var idCell = $('#id');
    $(idCell).html(patientid);

    if (!patientid=="") {

        var visits = hiv_scanQueries.getExistingRecordByPatientCode(patientid, 'scan_HIV_Visit_Record');
        //We only found one record associated with this id so use that
        var name = visits.getData(0, 'patient_name')
        var nameCell = $('#name');
        $(nameCell).html(name);

        for (var j = 0; j < visits.getCount(); j++) {
            var newRow = document.createElement("tr");
            var newcell1 = document.createElement("th");
           
            // filling out the visit date cell
            var visit_date = visits.getData(j, 'date_of_record');
            if (visit_date == undefined) {
                newcell1.innerText = "";
            } else {
                newcell1.innerText = visit_date;
            }
            newRow.appendChild(newcell1);
            
            // filling out the CD4 count cell
            var num_cd4 = visits.getData(j, 'CD4_count');
            var newcell2 = document.createElement("th");
           
            if (num_cd4 == undefined) {
                 newcell2.innerText = "";
            } else {
                newcell2.innerText = num_cd4;
            }
            newRow.appendChild(newcell2);

            // filling out the CD4 percent cell
            var cd4_percent = visits.getData(j, 'CD4_percent');
            var newcell3 = document.createElement("th");
           
            if (cd4_percent == undefined) {
                 newcell3.innerText = "";
            } else {
                newcell3.innerText = cd4_percent;
            }
            newRow.appendChild(newcell3);

             // filling out the WHO Stage cell
            var who_stage = visits.getData(j, 'WHO_stage');
            var newcell4 = document.createElement("th");
           
            if (who_stage == undefined) {
                newcell4.innerText = "";
            } else {
                newcell4.innerText = who_stage;
            }
            newRow.appendChild(newcell4);

             // filling out the TB treatment status cell
            var tb_status = visits.getData(j, 'TB_treatment_status');
            var newcell5 = document.createElement("th");
           
            if (tb_status == undefined) {
                newcell5.innerText = "";
            } else {
                newcell5.innerText = tb_status;
            }
            newRow.appendChild(newcell5);

             // filling out the CTZ treatment status cell
            var ctz_status = visits.getData(j, 'CTZ_treatment_status');
            var newcell6 = document.createElement("th");
          
            if (ctz_status == undefined) {
                newcell6.innerText = "";
            } else {
                newcell6.innerText = ctz_status;
            } 
            newRow.appendChild(newcell6);

             // filling out the INH treatment status cell
            var inh_status = visits.getData(j, 'INH_treatment_status');
            var newcell7 = document.createElement("th");
         
            if (inh_status == undefined) {
                newcell7.innerText = "";
            } else {
                newcell7.innerText = inh_status;
            }
            newRow.appendChild(newcell7);
            if(j % 2 == 0) {
                newRow.className = "eachCell";
            }
            var myTable = document.getElementById("hiv-table");
            myTable.appendChild(newRow);
      } 
    var btn = document.createElement("input");
    btn.type = 'button';
    btn.value = 'View Graph';
    btn.className = "btn_style";
    var get_div = document.getElementById("button_id");
    //document.body.appendChild(get_div);
    get_div.appendChild(btn);
    btn.onclick = function() {
        control.launchHTML (
                'assets/graphForHivPatient.html');
    }; 
        
    }
}
