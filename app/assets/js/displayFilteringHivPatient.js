/* global control */
'use strict';

function display() {
    var month = hiv_scanQueries.getQueryParameter(hiv_scanQueries.month);
    var age = hiv_scanQueries.getQueryParameter(hiv_scanQueries.age);
    var sex = hiv_scanQueries.getQueryParameter(hiv_scanQueries.sex);
    var test = hiv_scanQueries.getQueryParameter(hiv_scanQueries.test);
    // setting up the vlaue for queries on the result page
    // for month
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
    // for age
    if (age == "less") {
       var idCell = $('#age');
       $(idCell).html(" < 15 years");
    } else if(age == "all"){
      var idCell = $('#age');
       $(idCell).html(age);
    } else {
       var idCell = $('#age');
       $(idCell).html(" > 15 years");
    }
    
    // for sex
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
    // for test
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
            addRowAndCell(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Yes");
        } else if(test == "TB_screen") {
            addRowAndCell(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Yes");
        } else if(test == "STI_screen") {
            addRowAndCell(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Yes");
        } else if(test == "TB_screen_No") {
            addRowAndCell(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "No");
        } else if(test == "STI_screen_No") {
             addRowAndCell(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "No");
        } else {
              addRowAndCell(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "No");
        }
        
    } else if (month == "all" && age == "all" && sex == "F") {
       if (test == "Care_adherence_edu") {
            addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Female", "Yes");
        } else if(test == "TB_screen") {
            addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Female", "Yes");
        } else if(test == "STI_screen"){
            addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Female", "Yes");
        } else if(test == "TB_screen_No") {
            addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Female", "No");
        } else if(test == "STI_screen_No") {
            addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Female", "No");
        } else {
          addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Female", "No");
        }
    } else if(month == "all" && age == "all" && sex == "M") {
        if (test == "Care_adherence_edu") {
            addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Male", "Yes");
        } else if(test == "TB_screen") {
            addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Male", "Yes");
        } else if(test == "STI_screen"){
            addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Male", "Yes");
        } else if(test == "TB_screen_No") {
             addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Male", "No");
        } else if(test == "STI_screen_No") {
             addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Male", "No");
        } else {
            addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Male", "No");
        } 
    } else if (month == "all" && age == "less" && sex == "M") {
      if (test == "Care_adherence_edu") {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Male", age, "Yes");
      } else if(test == "TB_screen") {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Male", age, "Yes");
      } else if(test =="STI_screen"){
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Male", age, "Yes");
      } else if(test == "TB_screen_No") {
           addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Male", age, "No");
      } else if(test == "STI_screen_No") {
         addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Male", age, "No");
       } else {
          addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Male", age, "No");
       }

    } else if (month == "all" && age == "less" && sex == "F") {
      if (test == "Care_adherence_edu") {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Female", age, "Yes");
      } else if(test == "TB_screen") {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Female", age, "Yes");
      } else if(test == "STI_screen"){
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Female", age, "Yes");
      } else if(test == "TB_screen_No") {
           addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Female", age, "No");
      } else if(test == "STI_screen_No"){
          addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Female", age, "No");
      } else {
          addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Female", age, "No");
      }
    } else if (month == "all" && age == "greater" && sex == "F") {
      if (test == "Care_adherence_edu") {
        addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Female", age, ages, "Yes");
      } else if(test == "TB_screen") {
        addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Female", age, ages, "Yes");
      } else if(test == "STI_screen"){
        addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Female", age, ages, "Yes");
      } else if(test == "TB_screen_No") {
        addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Female", age, ages, "No");
      } else if("STI_screen_No") {
        addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Female", age, ages, "No");
      } else {
        addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Female", age, ages, "No");
      }
    } else if (month == "all" && age == "greater" && sex == "M") {
      if (test == "Care_adherence_edu") {
            addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Male", age, ages, "Yes");
      } else if(test == "TB_screen") {
         addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Male", age, ages, "Yes");
      } else if(test == "STI_screen"){
         addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Male", age, ages, "Yes");
      } else if(test == "TB_screen_No") {
         addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, "Male", age, ages, "No");
      } else if(test == "STI_screen_No") {
        addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, "Male", age, ages, "No");
      } else {
        addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, "Male", age, ages, "No");
      }
    }  else if (month == "all" && age == "less" && sex == "both") {
      if (test == "Care_adherence_edu") {
        addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, age, ages, "Yes");
      } else if(test == "TB_screen") {
        addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, age, ages, "Yes");
      } else if(test == "STI_screen") {
        addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, age, ages, "Yes");
      } else if(test == "TB_screen_No") {
        addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, age, ages, "No");
      }else if(test == "STI_screen_No") {
        addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, age, ages, "No");
      } else {
        addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, age, ages, "No");
      }
    } else if (month == "all" && age == "greater" && sex == "both") {
      if (test == "Care_adherence_edu") {
            addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, age, ages, "Yes");
      } else if(test == "TB_screen") {
            addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, age, ages, "Yes");
      } else if(test == "STI_screen"){
            addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, age, ages, "Yes");
      } else if(test == "TB_screen_No") {
          addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, age, ages, "No");
      } else if(test == "STI_screen_No") {
          addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, age, ages, "No");
      } else {
           addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, age, ages, "No");
      }
    } else if (month != "all" && age == "all" && sex == "both") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, null, null, null, "Yes");
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, null, null, null, "Yes");
      } else if(test == "STI_screen"){
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, null, null, null, "Yes");
      } else if(test == "TB_screen_No") {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, null, null, null, "No");
      } else if(test == "STI_screen_No") {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, null, null, null, "No");
      } else {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, null, null, null, "No");
      }
    } else if (month != "all" && age == "less" && sex == "both") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, null, "Yes");
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, null, "Yes");
      } else if(test == "STI_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, null, "Yes");
      } else if(test == "TB_screen_No") {
          ddRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, null, "No");
      } else if(test == "STI_screen_No") {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, null, "No");
      } else {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, null, "No");
      }
    } else if (month != "all" && age == "greater" && sex == "both") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, null, "Yes");
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, null, "Yes");
      } else if(test == "STI_screen"){
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, null, "Yes");
      } else if(test == "TB_screen_No") {
          ddRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, null, "No");
      } else if(test == "STI_screen_No") {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, null, "No");
      } else {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, null, "No");
      }
    } else if (month != "all" && age == "less" && sex == "F") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, "Female", "Yes");
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, "Female", "Yes");
      } else if(test == "STI_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, "Female", "Yes");
      } else if(test == "TB_screen_No") {
            ddRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, "Female", "No");
      } else if(test == "STI_screen_No") {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, "Female", "No");
      } else {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, "Female", "No");
      }
    } else if (month != "all" && age == "less" && sex == "M") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, "Male", "Yes");
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, "Male", "Yes");
      } else if(test == "STI_screen"){
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, "Male", "Yes");
      } else if (test == "TB_screen_No") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, "Male", "No");
      } else if(test == "STI_screen_No") {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, "Male", "No");
      } else {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, "Male", "No");
      }
    } else if (month != "all" && age == "greater" && sex == "F") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, "Female", "Yes");
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, "Female", "Yes");
      } else if(test == "STI_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, "Female", "Yes");
      } else if (test == "TB_screen_No") {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, "Female", "No");
      } else if(test == "STI_screen_No") {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, "Female", "No");
      } else {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, "Female", "No");
      }
    } else if (month != "all" && age == "greater" && sex == "M") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, "Male", "Yes");
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, "Male", "Yes");
      } else if(test == "STI_screen"){
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, "Male", "Yes");
      } else if (test == "TB_screen_No") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, ages, age, "Male", "No");
      } else if(test == "STI_screen_No") {
          ddRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, "Male", "No");
      } else {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, ages, age, "Male", "No");
      }
    } else if (month != "all" && age == "all" && sex == "M") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, null, null, "Male", "Yes");
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, null, null, "Male", "Yes");
      } else if(test == "STI_screen"){
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, "Male", "Yes");
      } else if(test == "TB_screen_No") {
          ddRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, null, null, "Male", "No");
      } else if(test == "STI_screen_No") {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, ages, age, "Male", "No");
      } else {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, null, null, "Male", "No");
      }
    } else if (month != "all" && age == "all" && sex == "F") {
      if (test == "Care_adherence_edu") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, null, null, "Female", "Yes");
      } else if(test == "TB_screen") {
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, null, null, "Female", "Yes");
      } else if(test == "STI_screen"){
            addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, null, null, "Female", "Yes");
      } else if(test == "TB_screen_No") {
          addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_tb, month, 
              arr_patient_ragistration, null, null, "Female", "No");
      } else if(test == "STI_screen_No") {
        addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_stis, month,
             arr_patient_ragistration, null, null, "Female", "No");
      } else {
        addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_patient_adherence, month, 
              arr_patient_ragistration, null, null, "Female", "No");
      }
    } 
}
function addRowAndCell(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_bubbles, respond) {
  for(var i = 0; i < 4; i ++) {
    if(arr_bubbles[i] == respond) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    }
  }
}
function addRowAndCell2(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_bubbles, sex, respond) {
  for(var i = 0; i < 4; i ++) {
    if(arr_bubbles[i] == respond && arr_patient_sex[i] == sex) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    }
  }
}
function addRowAndCell3(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_bubbles, sex, age, ages, respond) {
  for(var i = 0; i < 4; i ++) {
     if(arr_bubbles[i] == respond && arr_patient_sex[i] == sex && age == "less" && ages[i]  < 15) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    } else if (arr_bubbles[i] == respond && arr_patient_sex[i] == sex && age == "greater" && ages[i]  > 15) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    }
  }
}
function addRowAndCell4(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_bubbles, age, ages, respond) {
  for(var i = 0; i < 4; i ++) {
     if(arr_bubbles[i] == respond && age == "less" && ages[i]  < 15) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    } else if (arr_bubbles[i] == respond && age == "greater" && ages[i]  > 15) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    }
  }
}

function addRowAndCell5(arr_patient_name, arr_patient_dob, arr_patient_sex, arr_patientids, arr_bubbles, month, registration, ages, age, sex, respond) {
  for(var i = 0; i < 4; i ++) {
     var date = registration[i];
     var ind_1st_slash = date.indexOf("/");
     var reg_month = parseInt(date.substring(0, ind_1st_slash));
     console.log("registration and month " + registration[i]+" month "+reg_month);
    if(arr_bubbles[i] == respond && reg_month == parseInt(month) && ages == null && age == null && sex == null) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    } else if (arr_bubbles[i] == respond && reg_month == parseInt(month) && ages != null && age == "less" && ages[i] < 15 && sex == null) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    } else if (arr_bubbles[i] == respond && reg_month == parseInt(month) && ages != null && age == "greater" && ages[i] > 15 && sex == null) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    } else if (arr_bubbles[i] == respond && reg_month == parseInt(month) && ages != null && age == "less" && ages[i] < 15 && sex != null && 
      arr_patient_sex == sex ) {
      constructTable(arr_patientids[i], arr_patient_name[i], arr_patient_dob[i], arr_patient_sex[i]);
    } else if (arr_bubbles[i] == respond && reg_month == parseInt(month) && ages == null && age == null && sex != null && arr_patient_sex == sex) {
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

  // button for degraphic for each patient
  var newcell5 = document.createElement("th");
  var btn = document.createElement("input");
  btn.type = 'button';
  btn.value = 'View Detail';
  newcell5.appendChild(btn);
  btn.onclick = function(){
  var results = hiv_scanQueries.getExistingRecordById(id);
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
      [id],
      'tables/scan_HIV_Patient_Record/html/scan_HIV_Patient_Record_list.html');
    }
  };
  newRow.appendChild(newcell5)

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
 