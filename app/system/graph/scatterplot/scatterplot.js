"use strict"

// Draws the scatter plot,
// dataJ is an array that follows this format: [(x:<number>, y:<number>, r:<number>), (x:<number>, y:<number>, r:<number>), ...]
// rString is the name of the scaling factor, xString is the name
// of the x axis values, yString is the name of the y axis values, targetBody is the name of the DOM
// object (must be an id) that will have the svg object placed in
//
// NOTE: A call is made to the native app and colors each dot according to the
// color rules and value given by the number in the r field
function drawScatter(dataJ, rString, xString, yString, targetBody) {
	var margin = {top: 20, right: 20, bottom: 40, left: 50};

//	Width and height
	var vWidth = paramWidth;
	var vHeight = paramHeight;
	var padding = 30;

	dataJ.forEach(function(d) {
		d.x = +d.x;
		d.y = +d.y;
		d.r = +d.r;
	});
	
	var x = d3.scale.ordinal()
		.rangeRoundBands([0, vWidth], .1);

	var y = d3.scale.linear()
		.range([vHeight, 0]);
		
	x.domain([0, d3.max(dataJ, function(d) { return d.x; })]);
	y.domain([0, d3.max(dataJ, function(d) { return d.y; })]);
	
	//		Create scale functions
	var xScale = d3.scale.linear()
	.domain([0, d3.max(dataJ, function(d) { return d.x; })])
	.range([padding, vWidth - padding * 2]);

	var yScale = d3.scale.linear()
	.domain([0, d3.max(dataJ, function(d) { return d.y; })])
	.range([vHeight - padding, padding]);
	
	var rScale = d3.scale.linear()
	.domain([0, d3.max(dataJ, function(d) { return d.y; })])
	.range([2, 5]);
	
	//		Define X axis
	var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom")
	.ticks(5);

//		Define Y axis
	var yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left")
	.ticks(5);
	
	
	function draw() {
		d3.selectAll(".wholeBody").remove();
		
	//	Create SVG element
		var svg = d3.select("#" + targetBody)
		.append("svg")
		.attr("class", "wholeBody")
		.attr("width", vWidth + margin.left + margin.right)
		.attr("height", vHeight + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");
		
		x.rangeRoundBands([0, vWidth], .1);
		y.range([vHeight, 0]);
		
		yScale.range([vHeight - padding, padding]);
		xScale.range([padding, vWidth - padding * 2]);
		
	//		Create circles
		svg.selectAll("circle")
		.data(dataJ)
		.enter()
		.append("circle")
		.attr("cx", function(d) {
			return xScale(d.x);
		})
		.attr("cy", function(d) {
			return yScale(d.y);
		})
		.attr("r", function(d) {
			return rScale(4);
		})
		.attr("fill", function(d) {
			if(rString != "No Scaling") {
				return data.getForegroundColor(rString, d.r);
			} else {
				return "black";
			}
		});

	//		Create X axis
		svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (vHeight - padding) + ")")
		.call(xAxis)
		.append("text")
		.attr("x", vWidth/2-50)
		.attr("y", 35)
		.style("font-size", "1.5em")
		.style("text-anchor", "start")
		.text(xString);

	//		Create Y axis
		svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -35)
		.attr("x", -1 * vHeight/2)
		.style("font-size", "1.5em")
		.style("text-anchor", "end")
		.text(yString);
	}
	draw();
	
	$('#y_up').click(function(){
		vHeight = vHeight + (vHeight * .2);
		draw();
	});
	$('#y_down').click(function(){
		vHeight = vHeight - (vHeight * .2);
		draw();
	});
	$('#x_up').click(function(){
		vWidth = vWidth + (vWidth * .2);
		draw();
	});
	$('#x_down').click(function(){
		vWidth = vWidth - (vWidth * .2);	
		draw();
	});
}
