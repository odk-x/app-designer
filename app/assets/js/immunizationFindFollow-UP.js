/* global control, util */
'use strict';
// getting todays date because we have to calculate the difference between next vaccination date
// from today's date
var date = new Date();
var current_month = parseInt(date.getMonth() + 1);
var current_date = parseInt(date.getDate()); 
var current_year = parseInt(date.getFullYear());
function display() {
  // getting the whole table
  var page1 = scanQueries.getExistingRecordByColumnID('patient_QRcode');
  // getting the patient qr code column which is json formatted array
  var patients_codes = page1.getColumnData('patient_QRcode');
  // for follow up, we need to check all the patients's record
  for (var i = 0; i < page1.getCount(); i++) {
    // parsing the json formatted array
    var test = JSON.parse(patients_codes);
    // getting the patient's qr code
    var patientcode = test[i].toString();
    // we start from page four if the page four is empty then goes down like page 3, page2
    var page4 = scanQueries.getExistingRecordByPatientCode(patientcode, 'scan_childvacc_825_pg4');
    //We may find multiple record associated with same qr code, that may happen only for this demo
    if (page4.getCount() > 0) {
      var rowId = page4.getRowId(0);
      // getting the next vaccination date
      var next_date = page4.getData(rowId, 'nextvaccination_at14weeks');
      // if the date is not null, then we will check wheter this patient is being qualified to be added to the follow up
      // report
      if (next_date != null) {
        addInfoToList(next_date, patientcode, "14 wks", i);
      } else if (next_date == null) {
        // next date was null for the patient in page 4 so that we are gonna check page 3 for this patient
        var page3 = scanQueries.getExistingRecordByPatientCode(patientcode, 'scan_childvacc_825_pg3');
        // We may find multiple records for this patient  only for this demo, but we are gonna use the first record
        // that we ahve found
        if (page3.getCount() > 0) {
          var rowId = page3.getRowId(0);
          var next_date = page3.getData(rowId, 'nextvaccination_at10weeks');
          // if the date is not null, then we will check wheter this patient is being qualified to be added to the follow up
          // report
          if (next_date != null) {
            addInfoToList(next_date, patientcode, "10 wks", i);
          } else if (next_date == null) {
            // next date was null for the patient in page 3 so that we are gonna check page 2 for this patient
            var page2 = scanQueries.getExistingRecordByPatientCode(patientcode, 'scan_childvacc_822a_pg2');
            // We may find multiple records for this patient  only for this demo, but we are gonna use the first record
            // that we ahve found
            if (page2.getCount() > 0) {
              var rowId = page2.getRowId(0);
              var next_date = page2.getData(rowId, 'nextvaccination_at6weeks');
              if (next_date != null) {
                // if the date is not null, then we will check wheter this patient is being qualified to be added to the follow up
                // report
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
      console.log("from here I am calling, for the first time");
      errorMesage(patientcode);
    }
  }
  $('#go_home').on('click', function() {
        //control.launchHTML('assets/immunizationDemo.html');
        var url = control.getFileAsUrl('assets/immunizationDemo.html');
        console.log('url: ' + url);
        window.location.href = url;
  });
}
// adding the information to the list
function addInfoToList(next_date, patientcode, last_session, btn_no) {
  // getting the next vaccination date
  // getting each mont, day, year individually
  var ind_1st_slash = next_date.indexOf("/");
  var next_month = parseInt(next_date.substring(0, ind_1st_slash));
  var rest_date = next_date.substring(ind_1st_slash + 1);
  var ind_2nd_slash = rest_date.indexOf("/");
  var next_date = parseInt(rest_date.substring(0, ind_2nd_slash));
  var next_year = parseInt(rest_date.substring(ind_2nd_slash + 1)) + 2000;

  var total = 24*60*60*1000;  // hours * minutes * seconds * miliseconds
  // instatiates new date object with the next vaccination day, month and year
  var form_next = new Date(next_year, next_month, next_date);
  console.log("current year ", current_year);
  console.log("current month ", current_month);
  console.log("current date ", current_date);
  // instatiates new date object with the current day, month and year
  var form_current = new Date(current_year, current_month, current_date);
  // subtract the next vaccination date from current date
  var difference = Math.round((form_current.getTime() - form_next.getTime()) / (total));
  // if the difference is greater than 30 days, then this patient will be added to the follow up list
  if (difference >=30) {
    console.log("I am here for", patientcode);
    var page1 = scanQueries.getExistingRecordByPatientCode(patientcode, 'scan_childvacc_822_pg1');
      if (page1.getCount() > 0) {
        var rowId = page1.getRowId(0);
        // filing out the name cell
        var name =  page1.getData(rowId, 'Child_name');
        var newRow = document.createElement("tr");
        var newcell1 = document.createElement("th")
        newcell1.innerText = name;
        newRow.appendChild(newcell1);

        // filing out the ID cell
        var patient_id = page1.getData(rowId, 'Child_patient_ID');
        var newcell2 = document.createElement("th")
        newcell2.innerText = patient_id;
        newRow.appendChild(newcell2);

        // filling out the Village cell
        var village = page1.getData(rowId, 'village')
        var newcell3 = document.createElement("th")
        if (village == undefined) {
          village = "";
        }
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
          var results = scanQueries.getExistingRecordById(patient_id);
          //We are expecting to get one record associated with this id, but for the demo purpose we
          // could get multiple records, but we are gonna use the first record that we have found
          console.log(results.getCount());
          if (results.getCount() > 0) {
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
        console.log("no, from here I am calling");
        errorMesage(child_id);
      }
   }           
}
// print the error message for finding more than one record associated with the one id
function errorMesage(child_id){
  //We found multiple records associated with this id so let's look for more identifiers
  //Figure out what to do if more than one record. Shouldn't happen in theory. 
  console.log("Oops. More than one record found with patient code " + child_id);
}

