"use strict";

// Draws the graph in d3 using svg on an svg canvas
// dataJ is an array that follows this format: [(x:<name>, y:<number>), (x:<name>, y:<number>), ...]
// xString is the string name of the x axis label
// yString is the string name of the y axis label
function drawLineGraph(dataJ, xString, yString, targetBody, isCount, dataMin, dataMax) {
	var margin = {top: 20, right: 20, bottom: 40, left: 50},
	width = paramWidth - margin.left - margin.right,
	height = paramHeight - margin.top - margin.bottom;
	
	var x = d3.scale.linear()
		.range([0, width]);

	var y = d3.scale.linear()
		.range([height, 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.tickSubdivide(true);

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickSubdivide(true);
	
	dataJ.forEach(function(d) {
			d.y = +d.y;
			d.x = +d.x;
	});
	
	dataMin.forEach(function(d) {
			d.y = +d.y;
			d.x = +d.x;
	});
	
	dataMax.forEach(function(d) {
			d.y = +d.y;
			d.x = +d.x;
	});

	var line = d3.svg.line()
		.x(function(d) { return x(d.x); })
		.y(function(d) { return y(d.y); });

		
	x.domain([0, d3.max(dataJ, function(d) { return d.x; })]);
	y.domain([d3.min(dataMin, function(d) { return d.y; }), d3.max(dataMax, function(d) { return d.y; })]);
	
	//x.domain(d3.extent(dataJ, function(d) { return d.x; }));
	//y.domain(d3.extent(dataJ, function(d) { return d.y; }));
	var vWidth = width;
	var vHeight = height;
	var downx = 0;
	var downy = Math.NaN;
	var isClicked = 0;
    var downscalex;
	var downscaley;
	var clickX;
	var clickY;
	var lMarg = 0;
	var tMarg = 0;
	var svg;
	
	function draw(nDiff, yDiff) {
		d3.selectAll(".wholeBody").remove();
		
		var tempHeight = vHeight + yDiff;
		x.range([0, vWidth + nDiff]);
		y.range([tempHeight, 0]);
		yAxis.ticks(tempHeight/30);
		
		var svg = d3.select("#" + targetBody).append("svg")
			.attr("id", "svgElement")
			.attr("class", "wholeBody")
			.attr("z-index", 1)
			.attr("width", vWidth + margin.left + margin.right + nDiff)
			.attr("height", vHeight + margin.top + margin.bottom + yDiff)
			.append("g")
			.attr("transform", "translate(" + (margin.left + lMarg) + "," + (margin.top + tMarg) + ")");
		
		  svg.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + tempHeight + ")")
			  .call(xAxis)
			  .append("text")
				.attr("x", vWidth/2-50)
				.attr("y", 35)
				.attr("dx", ".71em")
				.attr("pointer-events", "all")
				.style("font-size", "1.5em")
				.style("text-anchor", "start")
				.text(xString);

		  svg.append("g")
			  .attr("class", "y axis")
			  .call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", -35)
			.attr("x", -1 * tempHeight/2)
			.style("font-size", "1.5em")
			.style("text-anchor", "end")
			.text(yString);

		  svg.append("path")
			  .datum(dataJ)
			  .attr("class", "line")
			  .attr("d", line);
			  
		  svg.append("path")
			  .datum(dataMin)
			  .attr("class", "min_line")
			  .attr("d", line);
			  
		  svg.append("path")
			  .datum(dataMax)
			  .attr("class", "max_line")
			  .attr("d", line);
	}
	draw(0, 0);
	$('#y_up').click(function(){
		vHeight = vHeight + (vHeight * .2);
		draw(0, 0);
	});
	$('#y_down').click(function(){
		vHeight = vHeight - (vHeight * .2);
		draw(0, 0);
	});
	$('#x_up').click(function(){
		vWidth = vWidth + (vWidth * .2);
		draw(0, 0);
	});
	$('#x_down').click(function(){
		vWidth = vWidth - (vWidth * .2);	
		draw(0, 0);
	});
}




