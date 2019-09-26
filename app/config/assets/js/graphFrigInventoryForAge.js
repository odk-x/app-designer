/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */
// TODO: Get rid of these duplicate values!!
var noOptionSelectString = "none";
var regionQueryString = 'admin_region = ?';
var typeQueryString = 'facility_type = ?';
var powerSourceQueryString = 'power_source = ?';
var numOfFrigsLabel = "Number of Refrigerators";
var yearsLabel = "years";

var bucket0 = 0;
var bucket1 = 1;
var bucket2 = 2;
var bucket3 = 3;

var bucketLabels = ['0-1','2-4','5-10','10+'];

var healthFacilityData = {};
var frigData = {};

function frigCBSuccess(result) {
    frigData = result;

    return (function() {
        render();
    }());
}

function frigCBFailure(error) {
    console.log('frigCBFailure: failed with error: ' + error);
}

function healthFacilityCBSuccess(result) {
    healthFacilityData = result;

    var selection = null;
    var selectionArgs = null;

    var powerSource = util.getQueryParameter(util.powerSource);
    if (_.isEmpty(healthFacilityData)) {

        selection = addQueryParamAndVal(selection, selectionArgs, powerSourceQueryString, powerSource);
        odkData.query('refrigerators', selection, selectionArgs, null, null, null, null, null, null, true,
            frigCBSuccess, frigCBFailure);
    } else {

        selection = "select * from refrigerators where facility_row_id in (";
        selectionArgs = [];
        for (var i = 0; i < healthFacilityData.getCount(); i++) {
            selection += "?,";
            selectionArgs.push(healthFacilityData.getRowId(i));
        }

        selection = selection.substring(0, selection.length - 1);
        selection += ")";

        selection = addQueryParamAndVal(selection, selectionArgs, powerSourceQueryString, powerSource);
        odkData.arbitraryQuery('refrigerators', selection, selectionArgs, null, null, frigCBSuccess, frigCBFailure);
    }
}

function addQueryParamAndVal(sel, selArgs, queryStr, value) {
    if (value !== noOptionSelectString && value !== undefined &&
        value !== null) {
        if (sel === null) {
            sel = queryStr;
        } else {
            sel += ' AND ' + queryStr;
        }

        if (selArgs === null) {
            selArgs = [];
        }

        selArgs.push(value);
    }
    return sel;
}

function healthFacilityCBFailure(error) {
    console.log('healthFacilityCBFailure: failed with error: ' + error);
}

function display() {
    var locale = odkCommon.getPreferredLocale();
    $('#refrigerator-inventory-by-age').text(odkCommon.localizeText(locale, "refrigerator_inventory_by_age"));
    numOfFrigsLabel = odkCommon.localizeText(locale, "number_of_refrigerators");
    yearsLabel = odkCommon.localizeText(locale, "years");

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
    var facilityRegion = util.getQueryParameter(util.adminRegion);
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

    odkData.query('health_facility', selection, selectionArgs, null, null, null, null, null, null, true,
        healthFacilityCBSuccess, healthFacilityCBFailure);
}

function render() {
    if (_.isEmpty(frigData)) {
        return;
    }

    frigHistogramByAge('#graph-div-age', numOfFrigsLabel);
}

function getDataIndex(dataSet, bucket) {
    for (var i = 0; i < dataSet.length; i++) {
        if (dataSet[i].bucket === bucket) {
            return i;
        }
    }
    return -1;
}

function getLabelForAgeBucket(bucket) {

    if (Number.isInteger(bucket)) {
        var intBucket = parseInt(bucket);
        if (intBucket >= 0 && intBucket < bucketLabels.length) {
            return bucketLabels[bucket % (bucketLabels.length)] + ' ' + yearsLabel;
        }
    }

    return -1;
}

function putFrigInAgeBucket(frigYear) {
    var refYear = 2011;

    var refAge = refYear - frigYear;

    if (refAge <= 1) {
        return bucket0;
    } else if (refAge <= 4) {
        return bucket1;
    } else if (refAge <= 10) {
        return bucket2;
    } else {
        return bucket3;
    }
}

function frigHistogramByAge(divName, yAxisText) {
    var paramWidth = 500;
    var paramHeight = 500;

    var margin = {top: 20, right: 20, bottom: 100, left: 78},
        width = paramWidth - margin.left - margin.right,
        height = paramHeight - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(getLabelForAgeBucket);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

    var dataJ = [];
    for (var i = 0; i < frigData.getCount(); i++) {
        var idx = getDataIndex(dataJ, putFrigInAgeBucket(frigData.getData(i, 'year')));

        if (idx === -1) {
            var frig = {};
            frig.bucket = putFrigInAgeBucket(frigData.getData(i, 'year'));
            frig.value = 1;
            dataJ.push(frig);
        } else {
            dataJ[idx].value++;
        }
    }

    // sort by bucket for axis labels
    dataJ.sort(function (a, b) {
        return a.bucket - b.bucket;
    });

    x.domain(dataJ.map(function(d) { return d.bucket; }));
    y.domain([0, d3.max(dataJ, function(d) { return d.value; })]);

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
        .data(dataJ)
        .enter().append("rect")
        .style("fill", function(d) {return "mediumaquamarine";})
        .attr("x", function(d) { return x(d.bucket); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
}
