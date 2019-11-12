/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */
// TODO: Get rid of these duplicate values!!
var noOptionSelectString = "none";
var typeQueryString = 'health_facilities.facility_type = ?';
var powerSourceQueryString = 'refrigerators.power_source = ?';
var numOfFrigsLabel = "Number of Refrigerators";
var yearsLabel = "years";
var refrigeratorsYearInstalled = 'year_installed';

var bucket0 = 0;
var bucket1 = 1;
var bucket2 = 2;
var bucket3 = 3;

var bucketLabels = ['0-1','2-4','5-10','10+'];

var frigData = {};

var graphQueryStr = 'SELECT refrigerators.' + refrigeratorsYearInstalled + ', COUNT(*) FROM refrigerators JOIN health_facilities ON ' +
    'refrigerators.facility_row_id = health_facilities._id JOIN geographic_regions ON ' +
    'health_facilities.admin_region_id = geographic_regions._id';

var graphQueryGroupBy = ' GROUP BY refrigerators.' + refrigeratorsYearInstalled;


function healthFacilityCBSuccess(result) {
    frigData = result;

    return (function() {
        render();
    }());
}



function healthFacilityCBFailure(error) {
    console.log('healthFacilityCBFailure: failed with error: ' + error);
}

function display() {
    var locale = odkCommon.getPreferredLocale();
    $('#refrigerator-inventory-by-age').text(odkCommon.localizeText(locale, "refrigerator_inventory_by_age"));
    numOfFrigsLabel = odkCommon.localizeText(locale, "number_of_refrigerators");
    yearsLabel = odkCommon.localizeText(locale, "years");

    var query = graphQueryStr;
    var queryParams = [];

    // Get the value of the type
    var facilityType = util.getQueryParameter(util.facilityType);
    query = util.addSelAndSelArgs(query, queryParams, typeQueryString, facilityType);

    var powerSrc = util.getQueryParameter(util.powerSource);
    query = util.addSelAndSelArgs(query, queryParams, powerSourceQueryString, powerSrc);

    var adminLevel = util.getQueryParameter(util.adminRegionLevel);
    var geographicRegionField = util.regionLevel + adminLevel;

    // Get the value of the region
    var adminReg = util.getQueryParameter(util.adminRegion);
    var geoQueryStr = 'geographic_regions.' + geographicRegionField + ' = ?';
    query = util.addSelAndSelArgs(query, queryParams, geoQueryStr, adminReg);

    query += graphQueryGroupBy;

    odkData.arbitraryQuery('refrigerators', query, queryParams, null, null, healthFacilityCBSuccess,
        healthFacilityCBFailure);
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

function  putFrigInAgeBucket(frigYear) {
    var d = new Date();
    var refYear = d.getFullYear();

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
        var idx = getDataIndex(dataJ, putFrigInAgeBucket(frigData.getData(i, refrigeratorsYearInstalled)));

        if (idx === -1) {
            var frig = {};
            frig.bucket = putFrigInAgeBucket(frigData.getData(i, refrigeratorsYearInstalled));
            frig.value = parseInt(frigData.getData(i, 'COUNT(*)'));
            dataJ.push(frig);
        } else {
            dataJ[idx].value += parseInt(frigData.getData(i, 'COUNT(*)'));
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
