/* global control, util */
'use strict';
var date = new Date();
var current_month = parseInt(date.getMonth() + 1);
var current_date = parseInt(date.getDate()); 
var current_year = parseInt(date.getFullYear());
function display() {
  var register = hiv_scanQueries.getExistingRecordByColumnID('Patient_ID');
  var patients_codes = register.getColumnData('Patient_ID');
  console.log("homw many patients ",register.getCount());
  for (var i = 0; i < register.getCount(); i++) {
    var test = JSON.parse(patients_codes);//.getCount();//[i];
    var patientcode = test[i].toString();
    var visits = hiv_scanQueries.getExistingRecordByPatientCode(patientcode, 'scan_HIV_Visit_Record');
   
    var max_month = 0;
    var max_year = 0;
    var next_date_visit;
    var last_cd4;
    var date_of_record;
    for (var j = 0; j < visits.getCount(); j++) {
      if (visits.getData(j, 'permanent_status') == undefined || visits.getData(j, 'permanent_status') == null) {
        //var rowId = visits.getRowId(j);
        var next_dates = visits.getData(j, 'date_next_visit');
        
        if (next_dates != null) {
          var ind_1st_slash = next_dates.indexOf("/");
          var next_month = parseInt(next_dates.substring(0, ind_1st_slash));

          var rest_date = next_dates.substring(ind_1st_slash + 1);
          var ind_2nd_slash = rest_date.indexOf("/");

          var next_date = parseInt(rest_date.substring(0, ind_2nd_slash));
          var next_year = parseInt(rest_date.substring(ind_2nd_slash + 1));
          if (next_year == 14){
            if (max_month < next_month) {
               max_month = next_month;
               max_year = next_year;
               next_date_visit = next_dates;
            }
          }
        }

        last_cd4 = visits.getData(j, 'CD4_count');
        //console.log("last_cd4 ", last_cd4);
        date_of_record = visits.getData(j, 'date_of_record');
      } else {
        break;
      }
    }
    
    addInfoToList(next_date_visit, patientcode, date_of_record, last_cd4);
   
    console.log("patientcode ", patientcode);
    //We only found one record associated with this id so use 
    console.log("count ", visits.getCount());
    //addInfoToList("8/1/14", "4334", "5/23/14", "420");

  }
}
// adding the information to the list
function addInfoToList(next_date, patientcode, last_session, last_cd4) {
  // getting the next vaccination date
  var ind_1st_slash = next_date.indexOf("/");
  var next_month = parseInt(next_date.substring(0, ind_1st_slash));
  var rest_date = next_date.substring(ind_1st_slash + 1);
  var ind_2nd_slash = rest_date.indexOf("/");
  var next_date = parseInt(rest_date.substring(0, ind_2nd_slash));
  var next_year = parseInt(rest_date.substring(ind_2nd_slash + 1)) + 2000;

  var total = 24*60*60*1000;  // hours * minutes * seconds * miliseconds
  var form_next = new Date(next_year, next_month, next_date);
  
  var form_current = new Date(current_year, current_month, current_date);
  //var difference = Math.round(Math.abs((form_next.getTime() - form_current.getTime()) / (total)));
  var difference = Math.round((form_current.getTime() - form_next.getTime()) / (total));
  console.log("difference is ", difference);
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

        // button for degraphic for each patient
        var newcell6 = document.createElement("th");
        var btn = document.createElement("input");
        btn.type = 'button';
        btn.value = 'View Detail';
        newcell6.appendChild(btn);
        btn.onclick = function(){
        var results = hiv_scanQueries.getExistingRecordById(patientcode);
          //We only found one record associated with this id so use that
          if (results.getCount()==1) {
            var rowId = results.getRowId(0);
            //Open the list view for the found record
            control.openDetailView(
              'scan_HIV_Patient_Record',
               rowId,
               'tables/scan_HIV_Patient_Record/html/scan_HIV_Patient_Record_detail.html');
          } else {
            control.openTableToListView(
            'scan_HIV_Patient_Record',
            'Patient_ID = ?',
            [patientcode],
            'tables/scan_HIV_Patient_Record/html/scan_HIV_Patient_Record_list.html');
          }
        };
        newcell6.className = "textAllign";
        newRow.appendChild(newcell6)

        var myTable = document.getElementById("hiv-table");
        myTable.appendChild(newRow);
   }           
}
