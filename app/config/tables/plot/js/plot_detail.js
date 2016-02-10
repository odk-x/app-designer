/**
 * The file for displaying a detail view.
 */
/* global $, odkTables, d3 */
'use strict';

// Handle the case where we are debugging in chrome.
// if (JSON.parse(odkCommon.getPlatformInfo()).container === 'Chrome') {
//     console.log('Welcome to Tables debugging in Chrome!');
//     $.ajax({
//         url: odkCommon.getFileAsUrl('output/debug/plot_data.json'),
//         async: false,  // do it first
//         success: function(dataObj) {
//             if (dataObj === undefined || dataObj === null) {
//                 console.log('Could not load data json for table: plot');
//             }
//             window.data.setBackingObject(dataObj);
//         }
//     });
// }

var plotDetailResultSet = {};
var visitData = {};
var plotId;

function visitCBSuccess(result) {
    visitData = result;

    display();
}

function visitCBFailure(error) {

    console.log('plot_detail: visitCBFailure failed with error: ' + error);
}

function cbSuccess(result) {
    
    plotDetailResultSet = result;

    plotId = plotDetailResultSet.getRowId(0); 

    odkData.query('visit', 'plot_id = ?', [plotId], null, null,
        null, null, true, visitCBSuccess, visitCBFailure);
}

function cbFailure(error) {

    console.log('plot_detail: cbFailure failed with error: ' + error);
}
 
function display() {
    // Perform your modification of the HTML page here and call display() in
    // the body of your .html file.
    
    var i;
    var plotId = plotDetailResultSet.getRowId(0);

    $('#NAME').text(plotDetailResultSet.get('plot_name'));
    $('#plot-id').text(plotId);
    $('#lat').text(plotDetailResultSet.get('location.latitude'));
    $('#long').text(plotDetailResultSet.get('location.longitude'));
    $('#crop').text(plotDetailResultSet.get('planting'));

// We want to get the count.
//     var table = odkTables.query(
//         'visit',
//         'plot_id = ?',
//         [plotId]);

    $('#visits').text(visitData.getCount());
    var margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 40
    };
    var width = 300 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    // Set up the scales.
    //var visitData = odkTables.query('visit', 'plot_id = ?', [plotId]);
    var xValues = visitData.getColumnData('date');

    //xValues = [xValues[0], xValues[1], xValues[2]];

    // because d3 domain expects an array of ints, make a map.
    var labelToValue = {};
    for (i = 0; i < xValues.length; i++) {
        labelToValue[xValues[i]] = i;
    }
    var x = d3.scale.ordinal().domain(d3.values(labelToValue)).rangePoints(
        [0, width],
        1);
    var yValues = visitData.getColumnData('plant_height');
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

function setup() {

    odkData.getViewData(cbSuccess, cbFailure);
}

