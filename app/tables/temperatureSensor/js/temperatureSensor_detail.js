/**
 * The file for displaying a detail view.
 */
/* global $, control, d3, data */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/temperatureSensor_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            if (dataObj === undefined || dataObj === null) {
                console.log('Could not load data json for table: temperatureSensor');
            }
            window.data.setBackingObject(dataObj);
        }
    });
}
 
function display() {
    // Perform your modification of the HTML page here and call display() in
    // the body of your .html file.
    $('#SENSOR-ID').text(data.get('sensorid'));
    $('#sensor-type').text(data.get('sensortype'));
    $('#msg-type').text(data.get('msgtype'));

    // Get the data to graph from the database
    var tempData = control.query('temperatureSensor', 'sensorid = ?', [data.get('sensorid')]);
    var yValues = JSON.parse(tempData.getColumnData('sample'));

    // Map the values so that they can be used by d3
    var dataJ = new Array();
    for (var i = 0; i < yValues.length; i++) {
        dataJ.push({x:i, y:yValues[i]});
    } 

    var xString = "time";
    var yString = "degrees Celsius";
    var legendString = "Temperature Sensor Readings";

    var paramWidth = 450;
    var paramHeight = 400;
    
    var margin = {top: 50, right: 20, bottom: 60, left: 90},
        width = paramWidth - margin.left - margin.right,
        height = paramHeight - margin.top - margin.bottom;

    var x = d3.scale.linear().range([0, width]);

    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSubdivide(true);

     var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSubdivide(true);

    // Making sure that these values are numbers
    dataJ.forEach(function(d) {
        d.y = +d.y;
        d.x = +d.x;
    });

    // Setting up x and y values for the line
    var line = d3.svg.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); });

    // Setting up the x and y domain values
    x.domain([0, d3.max(dataJ, function(d) { return d.x; })]);
    y.domain([d3.min(dataJ, function(d) { return d.y; })-1, d3.max(dataJ, function(d) { return d.y; })+1]);

    // vWidth and wHeight were used for scaling
    /*if (that.vWidth == 0) {
        that.vWidth = width;
    }
    if (that.vHeight == 0) {
        that.vHeight = height;
    }*/

    var vWidth = width;
    var vHeight = height;

    var lMarg = 0;
    var tMarg = 0;

    x.range([0, vWidth]);
    y.range([vHeight, 0]);
    yAxis.ticks(vHeight/30);

    // Setting up graph parameters
    var svg = d3.select('#graph-div').append('svg')
        .attr("id", "svgElement")
        .attr("class", "wholeBody")
        .attr("z-index", 1)
        .attr("width", vWidth + margin.left + margin.right + 0)
        .attr("height", vHeight + margin.top + margin.bottom + 0)
        .append("g")
        .attr("transform", "translate(" + (margin.left + lMarg) + "," + (margin.top + tMarg) + ")");

    // Setting up x-axis parameters
    svg.append("g")
        .attr("class", "x-axis")
        .attr("z-index", 4)
        .attr("transform", "translate(0," + vHeight + ")")
        .call(xAxis)
        .append("text")
        .attr("x", vWidth/2-50)
        .attr("y", 50)
        .attr("dx", ".71em")
        .attr("pointer-events", "all")
        .style("font-size", "1em")
        .style("text-anchor", "start")
        .text(xString);  

    // Setting up y-axis parameters
    svg.append("g")
        .attr("class", "y_axis")
        .attr("z-index", 4)
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -65)
        .attr("x", -1 * vHeight/2)
        .style("font-size", "1em")
        .style("text-anchor", "end")
        .text(yString);

    // Setting up line parameters
    svg.append("path")
        .datum(dataJ)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("d", line);

    // add legend   
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("height", 50)
        .attr("width", 100);

    // Add blue rect to legend
    legend
        .append("rect")
        .attr("x", -10 )
        .attr("y", -30)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", 'blue');
  
    // Add legend text
    legend
    .append("text")
    .attr("x", 10)
    .attr("y", -20)
    .text(legendString);
}

