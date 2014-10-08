/**
 * The file for displaying a detail view.
 */
/* global $, control, d3, data */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/plot_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            if (dataObj === undefined || dataObj === null) {
                console.log('Could not load data json for table: plot');
            }
            window.data.setBackingObject(dataObj);
        }
    });
}
 
function display() {
    // Perform your modification of the HTML page here and call display() in
    // the body of your .html file.
    
    var i;
    var plotId = data.getRowId(0);

    $('#NAME').text(data.get('plot_name'));
    $('#plot-id').text(plotId);
    $('#lat').text(data.get('location.latitude'));
    $('#long').text(data.get('location.longitude'));
    $('#crop').text(data.get('planting'));

    // We want to get the count.
    var table = control.query(
        'visit',
        'plot_id = ?',
        [plotId]);

    $('#visits').text(table.getCount());
    var margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 40
    };
    var width = 300 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    // Set up the scales.
    var visitData = control.query('visit', 'plot_id = ?', [plotId]);
    var xValues = JSON.parse(visitData.getColumnData('date'));

    //xValues = [xValues[0], xValues[1], xValues[2]];

    // because d3 domain expects an array of ints, make a map.
    var labelToValue = {};
    for (i = 0; i < xValues.length; i++) {
        labelToValue[xValues[i]] = i;
    }
    var x = d3.scale.ordinal().domain(d3.values(labelToValue)).rangePoints(
        [0, width],
        1);
    var yValues = JSON.parse(visitData.getColumnData('plant_height'));
    var newYs = [];
    // Now parse to strings.
    for (i = 0; i < yValues.length; i++) {
        newYs.push(parseInt(yValues[i]));
    }
    yValues = newYs;
    var y = d3.scale.linear().range([height, 0]);
    var yExtent = d3.extent(yValues);
    y.domain(yExtent);
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');
    var line = d3.svg.line()
        .x(function(d) { return x(String(labelToValue[d.date])); })
        .y(function(d) { return y(d.plant_height); });
    var combinedData = [];
    for (i = 0; i < xValues.length; i++) {
        var d = {};
        d.date = xValues[i];
        d.plant_height = yValues[i];
        combinedData.push(d);
    }
    var svg = d3.select('#graph-div').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
    .append('g')
        .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
    svg.append('path')
        .datum(combinedData)
        .attr('class', 'line')
        .attr('d', line);

}

