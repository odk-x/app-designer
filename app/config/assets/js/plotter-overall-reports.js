/* global $, _, d3, odkData */
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

    displayPlotSize();
    displayMaizeVar();
    displaySoilType();

}

function displayPlotSize() {
    var paramWidth = 500;
    var paramHeight = 500;

    var margin = {top: 20, right: 20, bottom: 40, left: 80},
        width = paramWidth - margin.left - margin.right,
        height = paramHeight - margin.top - margin.bottom,
        radius = Math.min(width, height) / 2;

    var dataJ = [];
    for (var i = 0; i < plotData.getCount(); i++) {
        var plot = {};
        plot.x = plotData.getData(i, 'plot_name');
        plot.y = plotData.getData(i, 'plot_size');
        dataJ.push(plot);
    }

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.y; });

    var svg = d3.select($("#graph-div-plot-size").get(0)).append("svg")
        .attr("class", "wholeBody")
        .data([dataJ])
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
        .data(pie(dataJ))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d, i) {
            // Switch to a case statement
            // Maybe these colors should be available in a library or something
            if(i === 0) {
                return "lightseagreen";
            } else if(i === 1) {
                return "orangered";
            } else if(i === 2){
                return "mediumslateblue";
            } else if(i === 3){
                return "mediumspringgreen";
            } else if(i === 4){
                return "gold";
            } else if(i === 5){
                return "mediumvioletred";
            } else if(i === 6){
                return "azure";
            } else if(i === 7){
                return "chartreuse";
            }
        });

    g.append("text")
        .attr("transform", function(d) { 
            var a = arc.centroid(d) + "";
            var cent = a.split(",");
            var temp = 0;
            for (; temp < 2; temp++) {
                cent[temp] = cent[temp] * 1.3;
            }
            return "translate(" + cent[0] + "," + cent[1] + ")"; })
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .text(function(d, i) { return dataJ[i].x; });
}

function displaySoilType() {
    var paramWidth = 500;
    var paramHeight = 500;

    var margin = {top: 20, right: 20, bottom: 40, left: 80},
        width = paramWidth - margin.left - margin.right,
        height = paramHeight - margin.top - margin.bottom,
        radius = Math.min(width, height) / 2;

    var typesOfSoil = {};
    for (var i = 0; i < visitData.getCount(); i++) {

        if (visitData.getData(i, 'crop_yield') <= 0) {
            continue;
        }

        if (typesOfSoil[visitData.getData(i, 'soil')] === null ||
            typesOfSoil[visitData.getData(i, 'soil')] === undefined) {
            typesOfSoil[visitData.getData(i, 'soil')] = visitData.getData(i, 'crop_yield');
        } else {
            typesOfSoil[visitData.getData(i, 'soil')] += visitData.getData(i, 'crop_yield');
        } 
    }

    var dataJ = [];
    for (var property in typesOfSoil) {
        if (typesOfSoil.hasOwnProperty(property)) {
            var soil = {};
            var fullPropertyName = property;
            soil.x = fullPropertyName.replace(/_/g, " ");
            soil.y = typesOfSoil[property];
            dataJ.push(soil);
        }
    }

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.y; });

    var svg = d3.select($("#graph-div-soil-type").get(0)).append("svg")
        .attr("class", "wholeBody")
        .data([dataJ])
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
        .data(pie(dataJ))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d, i) {
            // Switch to a case statement
            // Maybe these colors should be available in a library or something
            if(i === 0) {
                return "darkseagreen";
            } else if(i === 1) {
                return "greenyellow";
            } else if(i === 2){
                return "green";
            } else if(i === 3){
                return "lightgray";
            } else if(i === 4){
                return "burlywood";
            } else if(i === 5){
                return "teal";
            } else if(i === 6){
                return "azure";
            } else if(i === 7){
                return "khaki";
            }
        });

    g.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .text(function(d, i) { return dataJ[i].x; });
}

function displayMaizeVar() {
    var paramWidth = 500;
    var paramHeight = 500;

    var margin = {top: 20, right: 20, bottom: 40, left: 80},
        width = paramWidth - margin.left - margin.right,
        height = paramHeight - margin.top - margin.bottom,
        radius = Math.min(width, height) / 2;

    var typesOfCorn = {};
    for (var i = 0; i < plotData.getCount(); i++) {

        if (plotData.getData(i, 'plot_size') <= 0) {
            continue;
        }

        if (typesOfCorn[plotData.getData(i, 'planting')] === null ||
            typesOfCorn[plotData.getData(i, 'planting')] === undefined) {
            typesOfCorn[plotData.getData(i, 'planting')] = plotData.getData(i, 'plot_size');
        } else {
            typesOfCorn[plotData.getData(i, 'planting')] += plotData.getData(i, 'plot_size');
        } 
    }

    var dataJ = [];
    for (var property in typesOfCorn) {
        if (typesOfCorn.hasOwnProperty(property)) {
            var corn = {};
            corn.x = property;
            corn.y = typesOfCorn[property];
            dataJ.push(corn);
        }
    }

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.y; });

    var svg = d3.select($("#graph-div-maize-var").get(0)).append("svg")
        .attr("class", "wholeBody")
        .data([dataJ])
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var g = svg.selectAll(".arc")
        .data(pie(dataJ))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d, i) {
            // Switch to a case statement
            // Maybe these colors should be available in a library or something
            if(i === 0) {
                return "teal";
            } else if(i === 1) {
                return "lightblue";
            } else if(i === 2){
                return "steelblue";
            } else if(i === 3){
                return "lightgray";
            } else if(i === 4){
                return "burlywood";
            } else if(i === 5){
                return "teal";
            } else if(i === 6){
                return "azure";
            } else if(i === 7){
                return "khaki";
            }
        });



    g.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .text(function(d, i) { return dataJ[i].x; });
}
