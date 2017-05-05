/* global $, _, d3, odkData, util */
/* exported display */
'use strict';

/**
 * Responsible for rendering the home screen.
 */
var visitData = {};
var plotData = {};

function visitCBSuccess(result) {

    visitData = result;

    return (function() {
        render();
    }());

}

function visitCBFailure(error) {

    console.log('visitCBFailure: failed with error: ' + error);

}

function plotCBSuccess(result) {
    plotData = result;

    return (function() {
        render();
    }());
}

function plotCBFailure(error) {

    console.log('plotFailure: failed with error: ' + error);

}

function display() {
    odkData.query('plot', null, null, null, null, null, null, null, null, true, 
        plotCBSuccess, plotCBFailure);

    odkData.query('visit', null, null, null, null, null, null, null, null, true, 
        visitCBSuccess, visitCBFailure);
}

function render() {
    if (_.isEmpty(plotData) || _.isEmpty(visitData)) {
        return;
    }

    var rowId = util.getQueryParameter('rowId');
    var plotName = null;
    for (var i = 0; i < plotData.getCount(); i++) {
        if (plotData.getRowId(i) === rowId) {
            plotName = plotData.getData(i, 'plot_name');
            $('#NAME').text('Single Plot Data for ' + plotName);
            
            var maizeVariety = plotData.getData(i, 'planting');
            $('#maize-variety').text('Crop: ' + maizeVariety);
        }
    }
    
    if (plotName !== null && plotName !== undefined) {
        bargraphColAgainstDate(plotName, 'crop_yield', '#graph-div-yield', 'Yield (kg/ha)');
        linegraphColAgainstDate(plotName, 'plant_height', '#graph-div-growth', 'Height (cm)');
    }
}

function linegraphColAgainstDate(plotName, colName, divName, yAxisText) {
    var paramWidth = 500;
    var paramHeight = 500;

    var margin = {top: 20, right: 20, bottom: 100, left: 60},
        width = paramWidth - margin.left - margin.right,
        height = paramHeight - margin.top - margin.bottom;

	var i;
    var plot_id = null;
    for (i = 0; i < plotData.getCount(); i++) {
        var name = plotData.getData(i, 'plot_name');
        if (name === plotName) {
            plot_id = plotData.getRowId(i);
            break;
        }
    }
        
    if (plot_id === null || plot_id === undefined) {
        console.log('plot_id is null - cannot continue');
        return;
    }

    // Parse the date / time
    var	parseDate = d3.time.format("%Y-%m-%d").parse;

    var x = d3.time.scale().range([0, width]);

    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3.time.format("%Y-%m-%d"));

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    var data = [];
    for (i = 0; i < visitData.getCount(); i++) {
        var visit_plot_id = visitData.getData(i, 'plot_id');
        if (visit_plot_id === plot_id) {
            var visit = {};
            var fullDateString = visitData.getData(i,'date');
            var dateTimeSplit = fullDateString.split('T');
            if (dateTimeSplit[0] === null || dateTimeSplit[0] === undefined) {
                // Use default string
                visit.date = "0001-01-01";
            } else {
                visit.date = dateTimeSplit[0];
            }
            //visit.x =  visitData.getData(i,'date');
            visit.value = visitData.getData(i, colName);
            data.push(visit);
        }
    }

    data = _.sortBy(data, 'date');
    data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.value = +d.value;
    });
	
    var line = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);

    var svg = d3.select(divName).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -100)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(yAxisText);

    svg.append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('d', line);

}

function bargraphColAgainstDate(plotName, colName, divName, yAxisText) {
    var paramWidth = 500;
    var paramHeight = 500;

    var margin = {top: 20, right: 20, bottom: 100, left: 78},
        width = paramWidth - margin.left - margin.right,
        height = paramHeight - margin.top - margin.bottom;

	var i;
    var plot_id = null;
    for (i = 0; i < plotData.getCount(); i++) {
        var name = plotData.getData(i, 'plot_name');
        if (name === plotName) {
            plot_id = plotData.getRowId(i);
            break;
        }
    }
        
    if (plot_id === null || plot_id === undefined) {
        console.log('plot_id is null - cannot continue');
        return;
    }

    // Parse the date / time
    var	parseDate = d3.time.format("%Y-%m-%d").parse;

    var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.05);

    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(d3.time.format("%Y-%m-%d"));

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    var data = [];
    for (i = 0; i < visitData.getCount(); i++) {
        var visit_plot_id = visitData.getData(i, 'plot_id');
        if (visit_plot_id === plot_id) {
            var visit = {};
            var fullDateString = visitData.getData(i,'date');
            var dateTimeSplit = fullDateString.split('T');
            if (dateTimeSplit[0] === null || dateTimeSplit[0] === undefined) {
                // Use default string
                visit.date = "0001-01-01";
            } else {
                visit.date = dateTimeSplit[0];
            }
            //visit.x =  visitData.getData(i,'date');
            visit.value = visitData.getData(i, colName);
            data.push(visit);
        }
    }

    data = _.sortBy(data, 'date');
    data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.value = +d.value;
    });
	
    x.domain(data.map(function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);

    var svg = d3.select(divName).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.6em")
        .attr("transform", "rotate(-90)");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -100)
        .attr("dy", "-.6em")
        .style("text-anchor", "end")
        .text(yAxisText);

    svg.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .style("fill", "YellowGreen")
        .attr("x", function(d) { return x(d.date); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });
}
