/* global control, util */
'use strict';
function display() {
  
  for (var i = 0; i <= 4; i++) {
    addInfoToList("hello", "123", "20th", i);
  }
}
// adding the information to the list
function addInfoToList(next_date, patientcode, last_session, btn_no) {
 
  
 
  var newRow = document.createElement("tr");
  var newcell1 = document.createElement("th")
  newcell1.innerText = next_date;
  newRow.appendChild(newcell1);

  // filing out the ID cell
  var newcell2 = document.createElement("th")
  newcell2.innerText = patientcode;
  newRow.appendChild(newcell2);



  // filling out the Village cell
  var newcell3 = document.createElement("th")
  newcell3.innerText = "village";
  newRow.appendChild(newcell3);

  // filling out the session number 
  var newcell4 = document.createElement("th")
  newcell4.innerText = last_session;
  newRow.appendChild(newcell4);


  // filling out the overdue cell
  var newcell5 = document.createElement("th")
  newcell5.innerText = "session";
  newRow.appendChild(newcell5);
  var myTable = document.getElementById("vaccine-table");
  myTable.appendChild(newRow);         
}



