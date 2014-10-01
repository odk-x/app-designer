/* global control */
'use strict';

function display() {
    var month = hiv_scanQueries.getQueryParameter(hiv_scanQueries.month);
    var age = hiv_scanQueries.getQueryParameter(hiv_scanQueries.age);
    var sex = hiv_scanQueries.getQueryParameter(hiv_scanQueries.sex);
    var test = hiv_scanQueries.getQueryParameter(hiv_scanQueries.test);
    if (month == "all") {
      var idCell = $('#month');
      $(idCell).html(month);
    } else{
      if (parseInt(month) == 4) {
        var idCell = $('#month');
        $(idCell).html("April");
      } else if (parseInt(month) == 5) {
         var idCell = $('#month');
        $(idCell).html("May");
      } else if(parseInt(month) == 6) {
         var idCell = $('#month');
        $(idCell).html("June");
      } else if(parseInt(month) == 7) {
        var idCell = $('#month');
        $(idCell).html("July");
      } else if(parseInt(month) == 8) {
        var idCell = $('#month');
        $(idCell).html("August");
      } else if(parseInt(month) == 9) {
         var idCell = $('#month');
        $(idCell).html("September");
      } else if(parseInt(month) == 12) {
        var idCell = $('#month');
        $(idCell).html("December");
      }
    }
   
    if (age == "less") {
       var idCell = $('#age');
       $(idCell).html(" < 5 years");
    } else if(age == "all"){
      var idCell = $('#age');
       $(idCell).html(age);
    } else {
       var idCell = $('#age');
       $(idCell).html(" > 5 years");
    }
    
    if (sex == "F") {
      var idCell = $('#sex');
      $(idCell).html("Female");
    } else if(sex == "both") {
      var idCell = $('#sex');
      $(idCell).html(sex);
    }else {
     var idCell = $('#sex');
     $(idCell).html("Male");
    }
    
    var idCell = $('#test');
    $(idCell).html(test);

    //console.log("I am in displayFilterRecord ", month);
    var record = hiv_scanQueries.getExistingRecordByColumnID('Patient_ID');
   
    var patientids = record.getColumnData('Patient_ID');
    var patient_name = record.getColumnData('Patient_name');
    var patient_dob = record.getColumnData('Patient_DOB');
    var patient_sex = record.getColumnData('Patient_sex');
    var patient_registration = record.getColumnData('Date_of_registration');
    var patient_adherence = record.getColumnData("Care_adherence_edu");
    var patient_tb = record.getColumnData("TB_screen");
    var patient_stis = record.getColumnData("STI_screen");

    var arr_patientids = JSON.parse(patientids);
    var arr_patient_name = JSON.parse(patient_name);
    var arr_patient_dob = JSON.parse(patient_dob);
    var arr_patient_sex = JSON.parse(patient_sex);
    var arr_patient_ragistration = JSON.parse(patient_registration);
    var arr_patient_adherence = JSON.parse(patient_adherence);
    var arr_patient_tb = JSON.parse(patient_tb);
    var arr_patient_stis = JSON.parse(patient_stis);
	  
    var ages = [];
    for (var i = 0; i < arr_patient_dob.length; i++) {
      ages[i] = ageCalculator(arr_patient_dob[i]);
    }
      
    if (month == "all" && age == "all" && sex == "both") {
        if (test == "Care_adherence_edu") {
            addRowAndCell(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence);
        } else if(test == "TB_screen") {
            addRowAndCell(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb);
        } else {
            addRowAndCell(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis);
        }
        
    } else if (month == "all" && age == "all" && sex == "F") {
       if (test == "Care_adherence_edu") {
            addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Female");
        } else if(test == "TB_screen") {
            addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Female");
        } else {
            addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Female");
        }
    } else if(month == "all" && age == "all" && sex == "M") {
        if (test == "Care_adherence_edu") {
            addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Male");
        } else if(test == "TB_screen") {
            addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Male");
        } else {
            addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Male");
        }
    } else if (month == "all" && age == "less" && sex == "M") {
      if (test == "Care_adherence_edu") {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Male", age);
      } else if(test == "TB_screen") {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Male", age);
      } else {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Male", age);
      }

    } else if (month == "all" && age == "less" && sex == "F") {
      if (test == "Care_adherence_edu") {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Female", age);
      } else if(test == "TB_screen") {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Female", age);
      } else {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Female", age);
      }
    } else if (month == "all" && age == "greater" && sex == "F") {
      if (test == "Care_adherence_edu") {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Female", age, ages);
      } else if(test == "TB_screen") {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Female", age, ages);
      } else {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Female", age, ages);
      }
    } else if (month == "all" && age == "greater" && sex == "M") {
      if (test == "Care_adherence_edu") {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Male", age, ages);
      } else if(test == "TB_screen") {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Male", age, ages);
      } else {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Male", age, ages);
      }
    }  else if (month == "all" && age == "less" && sex == "both") {
      if (test == "Care_adherence_edu") {
            addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, age, ages);
      } else if(test == "TB_screen") {
            addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, age, ages);
      } else {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, age, ages);
      }
    } else if (month == "all" && age == "greater" && sex == "both") {
      if (test == "Care_adherence_edu") {
            addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, age, ages);
      } else if(test == "TB_screen") {
            addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, age, ages);
      } else {
            addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, age, ages);
      }
    } else if (month != "all" && age == "all" && sex == "both") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, null, null, null);
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, null, null, null);
      } else {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, null, null, null);
      }
    } else if (month != "all" && age == "less" && sex == "both") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, null);
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, null);
      } else {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, null);
      }
    } else if (month != "all" && age == "greater" && sex == "both") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, null);
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, null);
      } else {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, null);
      }
    } else if (month != "all" && age == "less" && sex == "F") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, "Female");
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, "Female");
      } else {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, "Female");
      }
    } else if (month != "all" && age == "less" && sex == "M") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, "Male");
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, "Male");
      } else {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, "Male");
      }
    } else if (month != "all" && age == "greater" && sex == "F") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, "Female");
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, "Female");
      } else {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, "Female");
      }
    } else if (month != "all" && age == "greater" && sex == "M") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, "Male");
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, "Male");
      } else {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, "Male");
      }
    } else if (month != "all" && age == "all" && sex == "M") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, null, null, "Male");
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, null, null, "Male");
      } else {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, "Male");
      }
    } else if (month != "all" && age == "all" && sex == "F") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, null, null, "Female");
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, null, null, "Female");
      } else {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, null, null, "Female");
      }
    } 
}
function addRowAndCell(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_bubbles) {
  for(var i = 0; i < 4; i ++) {
    if(arr_bubbles[i] == "Yes") {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    }
  }
}
function addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_bubbles, sex) {
  for(var i = 0; i < 4; i ++) {
     if(arr_bubbles[i] == "Yes" && arr_patient_sex[i] == sex) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    } 
  }
}
function addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_bubbles, sex, age, ages) {
  for(var i = 0; i < 4; i ++) {
     if(arr_bubbles[i] == "Yes" && arr_patient_sex[i] == sex && age == "less" && ages[i]  < 5) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    } else if (arr_bubbles[i] == "Yes" && arr_patient_sex[i] == sex && age == "greater" && ages[i]  > 5) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    }
  }
}
function addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_bubbles, age, ages) {
  for(var i = 0; i < 4; i ++) {
     if(arr_bubbles[i] == "Yes" && age == "less" && ages[i]  < 5) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    } else if (arr_bubbles[i] == "Yes" && age == "greater" && ages[i]  > 5) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    }
  }
}

function addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_bubbles, month, registration, ages, age, sex) {
  for(var i = 0; i < 4; i ++) {
     var date = registration[i];
     var ind_1st_slash = date.indexOf("/");
     var reg_month = parseInt(date.substring(0, ind_1st_slash));
     console.log("registration and month " + registration[i]+" month "+reg_month);
    if(arr_bubbles[i] == "Yes" && reg_month == parseInt(month) && ages == null && age == null && sex == null) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    } else if (arr_bubbles[i] == "Yes" && reg_month == parseInt(month) && ages != null && age == "less" && ages[i] < 5 && sex == null) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    } else if (arr_bubbles[i] == "Yes" && reg_month == parseInt(month) && ages != null && age == "greater" && ages[i] > 5 && sex == null) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    }else if (arr_bubbles[i] == "Yes" && reg_month == parseInt(month) && ages != null && age == "less" && ages[i] < 5 && sex != null && 
      arr_patient_sex == sex ) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    } else if (arr_bubbles[i] == "Yes" && reg_month == parseInt(month) && ages == null && age == null && sex != null && arr_patient_sex == sex) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    }
  }
}
function constructTable(id, name, birth, sex) {
  var newRow = document.createElement("tr");
  var newcell1 = document.createElement("th")
  newcell1.innerText = id;
  newRow.appendChild(newcell1);

  var newcell2 = document.createElement("th")
  newcell2.innerText = name;
  newRow.appendChild(newcell2);

  var newcell3 = document.createElement("th")
  newcell3.innerText = birth;
  newRow.appendChild(newcell3);

  var newcell4 = document.createElement("th")
  newcell4.innerText = sex;
  newRow.appendChild(newcell4);

  var myTable = document.getElementById("report-table");
  myTable.appendChild(newRow);

}
function ageCalculator(birthdate) {
    // getting the next vaccination date
  var ind_1st_slash = birthdate.indexOf("/");
  var birth_month = parseInt(birthdate.substring(0, ind_1st_slash));
  var rest_date = birthdate.substring(ind_1st_slash + 1);
  var ind_2nd_slash = rest_date.indexOf("/");
  var birth_date = parseInt(rest_date.substring(0, ind_2nd_slash));
  var birth_year = parseInt(rest_date.substring(ind_2nd_slash + 1));
  if (birth_year >= 0 && birth_year <= 14) {
    birth_year += 2000;
  } else {
    birth_year += 1900;
  }
  var new_birthday = new Date(birth_year, birth_month, birth_date);
  var diff = Date.now() - new_birthday; // in miliseconds
  var age = new Date(diff);
  return Math.abs(age.getUTCFullYear() - 1970);
}
 