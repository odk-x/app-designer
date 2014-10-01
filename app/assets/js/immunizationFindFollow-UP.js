/* global control, util */
'use strict';
var date = new Date();
var current_month = parseInt(date.getMonth() + 1);
var current_date = parseInt(date.getDate()); 
var current_year = parseInt(date.getFullYear());
function display() {
  var page1 = scanQueries.getExistingRecordByColumnID('patient_QRcode');
  console.log("page1 ", page1.getColumnData('patient_QRcode'));
  var patients_codes = page1.getColumnData('patient_QRcode');

  for (var i = 0; i <= 4; i++) {
    var test = JSON.parse(patients_codes);//.getCount();//[i];
    var patientcode = test[i].toString();
    var page4 = scanQueries.getExistingRecordByPatientCode(patientcode, 'scan_childvacc_825_pg4');
    //We only found one record associated with this id so use that
    if (page4.getCount()==1) {
      var rowId = page4.getRowId(0);
      var next_date = page4.getData(rowId, 'nextvaccination_at14weeks');
      if (next_date != null) {
        addInfoToList(next_date, patientcode, "14 wks", i);
      } else if (next_date == null) {
        var page3 = scanQueries.getExistingRecordByPatientCode(patientcode, 'scan_childvacc_825_pg3');
        //We only found one record associated with this id so use that
        if (page3.getCount()==1) {
          var rowId = page3.getRowId(0);
          var next_date = page3.getData(rowId, 'nextvaccination_at10weeks');
          if (next_date != null) {
            addInfoToList(next_date, patientcode, "10 wks", i);
          } else if (next_date == null) {
            var page2 = scanQueries.getExistingRecordByPatientCode(patientcode, 'scan_childvacc_822a_pg2');
            //We only found one record associated with this id so use that
            if (page2.getCount()==1) {
              var rowId = page2.getRowId(0);
              var next_date = page2.getData(rowId, 'nextvaccination_at6weeks');
              if (next_date != null) {
                addInfoToList(next_date, patientcode, "6 wks", i);
              }
            } else if (page2.getCount() > 1) {
              errorMesage(patientcode);
            }
          }  // end of next_date == null (for page 3)
        } else if (page3.getCount() > 1) { 
          errorMesage(patientcode);
        }
      }  // end of next_date == null (for page 4)   
    } else if (page4.getCount() > 1) {
      errorMesage(patientcode);
    }
  }
}
// adding the information to the list
function addInfoToList(next_date, patientcode, last_session, btn_no) {
  // getting the next vaccination date
  var ind_1st_slash = next_date.indexOf("/");
  var next_month = parseInt(next_date.substring(0, ind_1st_slash));
  var rest_date = next_date.substring(ind_1st_slash + 1);
  var ind_2nd_slash = rest_date.indexOf("/");
  var next_date = parseInt(rest_date.substring(0, ind_2nd_slash));
  var next_year = parseInt(rest_date.substring(ind_2nd_slash + 1)) + 2000;

  var total = 24*60*60*1000;  // hours * minutes * seconds * miliseconds
  var form_next = new Date(next_year, next_month, next_date);
  console.log("current year ", current_year);
  console.log("current month ", current_month);
  console.log("current date ", current_date);
  var form_current = new Date(current_year, current_month, current_date);
  //var difference = Math.round(Math.abs((form_next.getTime() - form_current.getTime()) / (total)));
  var difference = Math.round((form_current.getTime() - form_next.getTime()) / (total));
  if (difference >=30) {
    var page1 = scanQueries.getExistingRecordByPatientCode(patientcode, 'scan_childvacc_822_pg1');
      if (page1.getCount() == 1) {
        var rowId = page1.getRowId(0);
        // filing out the name cell
        var name =  page1.getData(rowId, 'Child_name');
        var newRow = document.createElement("tr");
        var newcell1 = document.createElement("th")
        newcell1.innerText = name;
        newRow.appendChild(newcell1);

        // filing out the ID cell
        var newcell2 = document.createElement("th")
        newcell2.innerText = patientcode;
        newRow.appendChild(newcell2);

        // filling out the Village cell
        var village = page1.getData(rowId, 'village')
        var newcell3 = document.createElement("th")
        newcell3.innerText = village;
        newRow.appendChild(newcell3);

        // filling out the session number 
        var session = last_session;
        var newcell4 = document.createElement("th")
        newcell4.innerText = session;
        newRow.appendChild(newcell4);


        // filling out the overdue cell
        var newcell5 = document.createElement("th")
        newcell5.innerText = difference;
        newRow.appendChild(newcell5);
        

        // filling out the record view cell
        var newcell6 = document.createElement("th");
        var btn = document.createElement("input");
        btn.type = 'button';
        btn.value = 'View Detail';
        newcell6.appendChild(btn);
        btn.onclick = function(){
          var results = scanQueries.getExistingRecordById(patientcode);
          //We only found one record associated with this id so use that
          if (results.getCount()==1) {
            var rowId = results.getRowId(0);
            //Open the list view for the found record
            control.openDetailView(
              'scan_childvacc_822_pg1',
               rowId,
               'tables/scan_childvacc_822_pg1/html/scan_childvacc_822_pg1_detail.html');
          } else {
            control.openTableToListView(
            'scan_childvacc_822_pg1',
            'Child_patient_ID = ?',
            [patientcode],
            'tables/scan_childvacc_822_pg1/html/scan_childvacc_822_pg1_list.html');
          }
        };
        newRow.appendChild(newcell6);

        var myTable = document.getElementById("vaccine-table");
        myTable.appendChild(newRow);
      } else if (page1.getCount() > 1) {
        errorMesage(child_id);
      }
   }           
}
// print the error message for finding more than one record associated with the one id
function errorMesage(child_id){
  //We found multiple records associated with this id so let's look for more identifiers
  //Figure out what to do if more than one record. Shouldn't happen in theory. 
  console.log("Oops. More than one record found with patient code " + patientcode);
}

