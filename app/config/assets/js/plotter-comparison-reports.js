/* global $, _, d3, odkData, util */
/* exported display */
'use strict';

/**
 * Responsible for rendering the home screen.
 */
var visitData = {};
var plotData = {};
var compareTypeDisplay = '';
var compareTypeValDisplay = '';

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

    var compareType = util.getQueryParameter('compareType');
    compareTypeDisplay = util.formatDisplayText(compareType);
    var compareTypeVal = util.getQueryParameter('compareTypeVal');
    compareTypeValDisplay = util.formatDisplayText(compareTypeVal);

    var originPlotId = util.getQueryParameter('plotId');
 
    if (compareType === 'plant_type') {
        compareTypeDisplay = 'Maize';
    } else {
        compareTypeDisplay = '';
    }

    $('#NAME').text('Plots with ' + compareTypeValDisplay + ' ' + compareTypeDisplay);

	var i;
    var plotId = null;
    var plotIdArray = [];
    for (i = 0; i < visitData.getCount(); i++) {
        if (visitData.getData(i, compareType) === compareTypeVal) {
            plotId = visitData.getData(i, 'plot_id');
            plotIdArray.push(plotId);
        }
    }

    var uniqPlotIdArray = [];
    uniqPlotIdArray = _.uniq(plotIdArray);

    console.log('Plot Id array: ' + plotIdArray.toString());
    console.log('Uniq plot id array: ' + uniqPlotIdArray.toString());

    var fromPlotDetail = false;
    var belongsToComparison = false;
    if (originPlotId !== null) {
        fromPlotDetail = true;
        var originPlotIndex = _.indexOf(uniqPlotIdArray, originPlotId, false);
        // Removes the origin plot ID from the unique plot ID array if it is an element
        if (originPlotIndex !== -1) {
            uniqPlotIdArray.splice(originPlotIndex, 1);
            belongsToComparison = true;
        }
        // Adds the origin plot ID to the front regardless of whether or not it belonged 
        // to the array
        uniqPlotIdArray.splice(0, 0, originPlotId);
    }

    for (i = 0; i < uniqPlotIdArray.length; i++) {
        var highlight = false;
        if (fromPlotDetail && i === 0) {
            highlight = true;
        }
        graphPlot(uniqPlotIdArray[i], highlight, belongsToComparison);
        belongsToComparison = true;
    }

}

function graphPlot(plotId, highlight, belongsToComparison) {
    var plotName = null;
    for (var i = 0; i < plotData.getCount(); i++) {
        if (plotData.getRowId(i) === plotId) {
            plotName = plotData.getData(i, 'plot_name');
        }
    }

    var plotGraphHeader = $('<h2>');
    plotGraphHeader.text(plotName + " Plot");
    if (highlight) {
        plotGraphHeader.addClass('highlightedPlot');
    }
    $('#graph-div').append(plotGraphHeader);

    if (!belongsToComparison && highlight) {
        var plotGraphNote = $('<h4>');
        plotGraphNote.text('Note: This plot does not have ' + compareTypeValDisplay + ' ' + compareTypeDisplay);
        plotGraphNote.addClass('note');
        $('#graph-div').append(plotGraphNote);
    }

    var plotGraphDiv = $('<div>');
    plotGraphDiv.attr('id', plotName);
    $('#graph-div').append(plotGraphDiv);

    bargraphColAgainstDate(plotId, 'plant_height', '#'+plotName, 'Height', highlight);
    console.log('After bargraph');
}

function bargraphColAgainstDate(plotId, colName, divName, yAxisText, highlight) {
    var paramWidth = 500;
    var paramHeight = 500;

    var margin = {top: 20, right: 20, bottom: 100, left: 78},
        width = paramWidth - margin.left - margin.right,
        height = paramHeight - margin.top - margin.bottom;

        
    if (plotId === null || plotId === undefined) {
        console.log('plotId is null - cannot continue');
        return;
    }

    // Parse the date / time
    var parseDate = d3.time.format("%Y-%m-%d").parse;

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
    for (var i = 0; i < visitData.getCount(); i++) {
        var visit_plot_id = visitData.getData(i, 'plot_id');
        if (visit_plot_id === plotId) {
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
        // .style("fill", "YellowGreen")
        .style("fill", function(d) {
            return highlight ? "turquoise":"yellowgreen";
        })
        .attr("x", function(d) { return x(d.date); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });
}
