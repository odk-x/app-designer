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
  var register = hiv_scanQueries.getExistingRecordByColumnID('Patient_ID');
  // getting the patient id column which is json formatted array
  var patients_codes = register.getColumnData('Patient_ID');
  // for follow up, we need to check all the patients's record
  for (var i = 0; i < register.getCount(); i++) {
    // parsing the json formatted array
    var test = JSON.parse(patients_codes);
    // getting the patient id
    var patientcode = test[i].toString();
    // getting the all the visit record associated with this patient id.
    var visits = hiv_scanQueries.getExistingRecordByPatientCode(patientcode, 'scan_HIV_Visit_Record');
   
    var max_month = 0;
    var max_year = 0;
    var next_date_visit;
    var last_cd4;
    var date_of_record;

    // traversing all the visit record associated with this patient
    // we will find out the most recent date for the next visit
    // and sbtruct that day from todays date. If the difference is between 30 and 120 inclusive
    // we will add that patient to our follow up list
    for (var j = 0; j < visits.getCount(); j++) {
      if (visits.getData(j, 'permanent_status') == undefined || visits.getData(j, 'permanent_status') == null) {
        var next_dates = visits.getData(j, 'date_next_visit');

        if (next_dates != null) {
          // getting the next vist day and it is is mm/dd/yy format
          // so we parse the date to get individual mondth, day and year

          // getting month
          var ind_1st_slash = next_dates.indexOf("/");
          var next_month = parseInt(next_dates.substring(0, ind_1st_slash));

          // getting day
          var rest_date = next_dates.substring(ind_1st_slash + 1);
          var ind_2nd_slash = rest_date.indexOf("/");

          // getting year
          var next_date = parseInt(rest_date.substring(0, ind_2nd_slash));
          var next_year = parseInt(rest_date.substring(ind_2nd_slash + 1));

          // figuring out the most recent date for the next visit
          if (max_year < next_year){
            if (max_month < next_month) {
               max_month = next_month;
               max_year = next_year;
               next_date_visit = next_dates;
            }
          }
        }

        // if the CD4 count is empty or null, hardcoding the value as 230
        // it is only because demp purpose
        last_cd4 = visits.getData(j, 'CD4_count');
        if (last_cd4 == undefined || last_cd4 == null) {
          last_cd4 = 230;
        }

        // getting the visit date for this patient
        date_of_record = visits.getData(j, 'date_of_record');
      } else {  // if the next visit date is null or undefined we will break out from this inner loop
        break;
      }
    }
    // adding row and cell to the table with this patient code
    addInfoToList(next_date_visit, patientcode, date_of_record, last_cd4);
  }
}
// adding the information to the list
function addInfoToList(next_date, patientcode, last_session, last_cd4) {
  // getting the next vaccination date and parsing it to get month, date and year individually
  var ind_1st_slash = next_date.indexOf("/");
  var next_month = parseInt(next_date.substring(0, ind_1st_slash));
  var rest_date = next_date.substring(ind_1st_slash + 1);
  var ind_2nd_slash = rest_date.indexOf("/");
  var next_date = parseInt(rest_date.substring(0, ind_2nd_slash));
  var next_year = parseInt(rest_date.substring(ind_2nd_slash + 1)) + 2000;

  var total = 24*60*60*1000;  // hours * minutes * seconds * miliseconds
  var form_next = new Date(next_year, next_month, next_date);
  
  var form_current = new Date(current_year, current_month, current_date);
  // subtracting the noxe vist date form today's date
  var difference = Math.round((form_current.getTime() - form_next.getTime()) / (total));

  // if the difference is between 30 and 120 we will add that patient to the follow up list
  if (difference >=30 && difference <= 120) {
    console.log("I am here");
    var page1 = hiv_scanQueries.getExistingRecordByPatientCode(patientcode, 'scan_HIV_Patient_Record');
    var rowId = page1.getRowId(0);

    // filing out the name cell
    var name =  page1.getData(rowId, 'Patient_name');
    var newRow = document.createElement("tr");
    var newcell1 = document.createElement("th");
    newcell1.className = "textAllign";
    newcell1.innerText = name;
    newRow.appendChild(newcell1);

    // filling out the Village cell
    var village = page1.getData(rowId, 'Home_village');
    var newcell2 = document.createElement("th");
    newcell2.innerText = village;
    newcell2.className = "textAllign";
    newRow.appendChild(newcell2);

    // filling out the session number 
    var last_visited = last_session;
    var newcell3 = document.createElement("th");
    newcell3.innerText = last_visited;
    newcell3.className = "textAllign";
    newRow.appendChild(newcell3);

    // filling out the session number 
    var last_cdCount = last_cd4;
    var newcell4 = document.createElement("th");
    newcell4.innerText = last_cdCount;
    newcell4.className = "textAllign";
    newRow.appendChild(newcell4);

    // filling out the overdue cell
    var newcell5 = document.createElement("th");
    newcell5.innerText = difference;
    newcell5.className = "textAllign";
    newRow.appendChild(newcell5);

    // button for biographic for each patient
    var newcell6 = document.createElement("th");
    var btn = document.createElement("input");
    btn.type = 'button';
    btn.value = 'View Detail';
    newcell6.appendChild(btn);
    btn.onclick = function(){
    var results = hiv_scanQueries.getExistingRecordById(patientcode);
      //We only found one record associated with this id so use that
      if (results.getCount() > 0) {
        var rowId = results.getRowId(0);
        //Open the list view for the found record
        control.openDetailView(
          'scan_HIV_Patient_Record',
           rowId,
           'config/tables/scan_HIV_Patient_Record/html/scan_HIV_Patient_Record_detail.html');
      } else {
        control.openTableToListView(
        'scan_HIV_Patient_Record',
        'Patient_ID = ?',
        [patientcode],
        'config/tables/scan_HIV_Patient_Record/html/scan_HIV_Patient_Record_list.html');
      }
    };
    newcell6.className = "textAllign";
    newRow.appendChild(newcell6)
    // append the row to the table
    var myTable = document.getElementById("hiv-table");
    myTable.appendChild(newRow);
  }           
}
