'use strict';
/* global _, d3, odkData, util */
/* exported display */

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

    var originPlotId = util.getQueryParameter('plotId');
    var originPlotName = null;
    for (var i = 0; i < plotData.getCount(); i++) {
        if (plotData.getRowId(i) === originPlotId) {
            originPlotName = plotData.getData(i, 'plot_name');
            break;
        }
    }

    bargraphColAgainstDate(originPlotName, 'plant_height', '#graph-div-growth', 'Height (cm)');
    bargraphColAgainstDate(originPlotName, 'crop_yield', '#graph-div-yield', 'Yield (kg/ha)');

}

function bargraphColAgainstDate(originPlotName, colName, divName, yAxisText) {
    var paramWidth = 500;
    var paramHeight = 500;

    var margin = {top: 20, right: 20, bottom: 100, left: 78},
        width = paramWidth - margin.left - margin.right,
        height = paramHeight - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.05);

    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    var data = [];
    for (var i = 0; i < plotData.getCount(); i++) {
        var visit = {};
        visit.plot = plotData.getData(i, 'plot_name');
        visit.value = getRecentVisit(plotData.getRowId(i), colName);

        data.push(visit);
    }
    data = _.sortBy(data, 'value');

    x.domain(data.map(function(d) { return d.plot; }));
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
        .style("fill", function(d) {
            return d.plot === originPlotName ? "gold":"mediumaquamarine";
        })
        .attr("x", function(d) { return x(d.plot); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });
}

// returns height for the most recent visit of the given plot
function getRecentVisit(plotId, colName) {
    // Parse the date / time
    var parseDate = d3.time.format("%Y-%m-%d").parse;

    var data = [];
    for (var i = 0; i < visitData.getCount(); i++) {
        var visit_plot_id = visitData.getData(i, 'plot_id');
        if (visit_plot_id === plotId) {
            var visit = {};
            var fullDateString = visitData.getData(i, 'date');
            var dateTimeSplit = fullDateString.split('T');
            if (dateTimeSplit[0] === null || dateTimeSplit[0] === undefined) {
                // Use default string
                visit.date = "0001-01-01";
            } else {
                visit.date = dateTimeSplit[0];
            }
            visit.value = visitData.getData(i, colName);
            data.push(visit);
        }
    }
    data = _.sortBy(data, 'date');
    data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.value = +d.value;
    });

    return data[data.length - 1].value;

}