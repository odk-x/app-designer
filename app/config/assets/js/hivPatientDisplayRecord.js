/* global control, util */
'use strict';

function display() {
    var patientid = hiv_scanQueries.getQueryParameter(hiv_scanQueries.patientid);
    // filling out the id
    var idCell = $('#id');
    $(idCell).html(patientid);
    if (!patientid=="") {
        var visits = hiv_scanQueries.getExistingRecordByPatientCode(patientid, 'scan_HIV_Visit_Record');
        // filling out the name associated with this id
        var name = visits.getData(0, 'patient_name')
        var nameCell = $('#name');
        $(nameCell).html(name);
        // going through this patient's visit record
        for (var j = 0; j < visits.getCount(); j++) {
            var newRow = document.createElement("tr");
            var newcell1 = document.createElement("th");
           
            // filling out the visit date cell with the date of visit
            var visit_date = visits.getData(j, 'date_of_record');
            if (visit_date == undefined) {
                newcell1.innerText = "";
            } else {
                newcell1.innerText = visit_date;
            }
            newRow.appendChild(newcell1);
            
            // filling out the CD4 count cell with total CD4 count on that day
            var num_cd4 = visits.getData(j, 'CD4_count');
            var newcell2 = document.createElement("th");
           
            if (num_cd4 == undefined) {
                 newcell2.innerText = "";
            } else {
                newcell2.innerText = num_cd4;
            }
            newRow.appendChild(newcell2);

            // filling out the CD4 percent cell with the percentage of CD4 percent on that vist day
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

             // filling out the TB treatment status cell with the TB Screen status on that day
            var tb_status = visits.getData(j, 'TB_treatment_status');
            var newcell5 = document.createElement("th");
           
            if (tb_status == undefined) {
                newcell5.innerText = "";
            } else {
                newcell5.innerText = tb_status;
            }
            newRow.appendChild(newcell5);

             // filling out the CTZ treatment status cell with the CTZ treatment status on that day
            var ctz_status = visits.getData(j, 'CTZ_treatment_status');
            var newcell6 = document.createElement("th");
          
            if (ctz_status == undefined) {
                newcell6.innerText = "";
            } else {
                newcell6.innerText = ctz_status;
            } 
            newRow.appendChild(newcell6);

             // filling out the INH treatment status cell with the INH treatment status on that day
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
            // getting the table id and appending the row in each iteration
            var myTable = document.getElementById("hiv-table");
            myTable.appendChild(newRow);
        }
        // drawing the line graph with hard coded value
        var count = 3;
       // date is the x coordinate and corresponding y is the y coordinate
        var data=[{"date":new Date(2013,09,6), "value": 4.6},
                {"date":new Date(2013,09,12), "value": 3.9},
                {"date":new Date(2014,09,6), "value": 3.8},   
                {"date":new Date(2014,09,12), "value": 4},
                {"date":new Date(2014,09,7), "value": 4}];
        var margin = {top: 20, right: 30, bottom: 30, left: 40},
            width = 300 - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;
        // X scale will fit all values from data within pixels [0, width] with
        // padding .1
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);
        // Y scale will fit all the values from data within pixels[height, 0]
        var y = d3.scale.linear()
            .range([height, 0]);
        // format for the date on the x axis like 09-2014
        var format = d3.time.format("%d-%Y");
        // creating x axis
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(format);
        // creating y axis
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(6, "%");
        // creating line
        var line = d3.svg.line()
          .x(function(d, i) { return x(d.date); })
          .y(function(d) { return y(d.value); });
        // Adding a SVG element with the desired dimensions and margin  
        var chart = d3.select(".chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // specifying the dates from data[] are for x axis and the corresponding
        // values are for y axis 
        x.domain(data.map(function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return d.value; })]);
        // adding x axis
        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        // adding y axis
        chart.append("g")
            .attr("class", "y axis")
            .call(yAxis);
        // adding the line
        chart.append("path")
            .datum(data)
            .attr("class", 'line')
            .attr('d', line);
        // button at the end of the page to go back to the home page.
        $('#go_home').on('click', function() {
            var url = control.getFileAsUrl('config/assets/demoForHivReport.html');
            window.location.href = url;
        });
        
    }
}
