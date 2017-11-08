/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */
var noOptionSelectString = "none";
var regionQueryString = 'regionLevel2 = ?';
var typeQueryString = 'facility_type = ?';
var tableId = 'health_facility';
var healthFacilityData = {};

function healthFacilityCBSuccess(result) {
    healthFacilityData = result;

    return (function() {
        render();
    }());
}

function healthFacilityCBFailure(error) {
    console.log('healthFacilityCBFailure: failed with error: ' + error);
}

function display() {
    var locale = odkCommon.getPreferredLocale();
    $('#facility-inventory-by-grid-power').text(odkCommon.localizeText(locale, "facility_inventory_by_grid_power"));

    // Get the value of the type
    var selection = null;
    var selectionArgs = null;

    // Get the value of the type
    var facilityType = util.getQueryParameter(util.facilityType);
    if (facilityType !== noOptionSelectString && facilityType !== undefined &&
        facilityType !== null) {
        selection = typeQueryString;
        selectionArgs = [];
        selectionArgs.push(facilityType);
    }

    // Get the value of the region
    var facilityRegion = util.getQueryParameter(util.regionLevel2);
    if (facilityRegion !== noOptionSelectString && facilityRegion !== undefined &&
        facilityRegion !== null) {
        if (selection === null) {
            selection = regionQueryString;
        } else {
            selection += ' AND ' + regionQueryString;
        }

        if (selectionArgs === null) {
            selectionArgs = [];
        }

        selectionArgs.push(facilityRegion);
    }

    odkData.query(tableId, selection, selectionArgs, null, null, null, null, null, null, true,
        healthFacilityCBSuccess, healthFacilityCBFailure);
}

function render() {
    if (_.isEmpty(healthFacilityData)) {
        return;
    }

    displayHealthFacilityGridPower();
}

function getDataIndex(dataSet, x) {
    for (var i = 0; i < dataSet.length; i++) {
        if (dataSet[i].x === x) {
            return i;
        }
    }
    return -1;
}

var getAngle = function (d) {
    var angle = (180 / Math.PI * (d.startAngle + d.endAngle) / 2 - 90);
    if (angle > 180 && angle <= 270) {
        angle = angle - 180;
    } else if (angle > 90 && angle <= 180) {
        angle = angle + 180;
    }
    return angle;
};

function displayHealthFacilityGridPower() {
    var paramWidth = 500;
    var paramHeight = 500;

    var margin = {top: 20, right: 20, bottom: 40, left: 80},
        width = paramWidth - margin.left - margin.right,
        height = paramHeight - margin.top - margin.bottom,
        radius = Math.min(width, height) / 3;

    var dataJ = [];
    for (var i = 0; i < healthFacilityData.getCount(); i++) {
        var idx = getDataIndex(dataJ, healthFacilityData.getData(i, 'grid_power_availability'));

        if (idx === -1) {
            var hFacility = {};
            hFacility.x = healthFacilityData.getData(i, 'grid_power_availability');
            hFacility.y = 1;
            dataJ.push(hFacility);
        } else {
            dataJ[idx].y++;
        }
    }

    var arc = d3.svg.arc()
        .outerRadius(radius + 50)
        .innerRadius(0);

    var pos = d3.svg.arc().innerRadius(radius + 2).outerRadius(radius + 2);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.y; });

    var svg = d3.select($("#graph-div-grid-power").get(0)).append("svg")
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
                return "chartreuse";
            } else if(i === 3){
                return "mediumspringgreen";
            } else if(i === 4){
                return "gold";
            } else if(i === 5){
                return "mediumvioletred";
            } else if(i === 6){
                return "azure";
            } else if(i === 7){
                return "mediumslateblue";
            }
        });

    g.append("text")
        .attr("transform", function(d) {
            return "translate(" + pos.centroid(d) + ") " +
                    "rotate(" + getAngle(d) + ")"; })
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle")
        .text(function(d, i) { return dataJ[i].x; });
}
