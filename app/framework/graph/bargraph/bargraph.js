"use strict";

// Draws the graph in d3 using svg on an svg canvas
// dataJ is an array that follows this format: [(x:<name>, y:<number>), (x:<name>, y:<number>), ...]
// xString is the string name of the x axis label
// yString is the string name of the y axis label
function drawGraph(dataJ, xString, yString, targetBody, isCount) {
	var margin = {top: 20, right: 20, bottom: 40, left: 50},
	width = paramWidth - margin.left - margin.right,
	height = paramHeight - margin.top - margin.bottom;
	var x = d3.scale.ordinal()
	.rangeRoundBands([0, width], .1);

	var y = d3.scale.linear()
	.range([height, 0]);

	var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

	var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left")
	.tickSubdivide(true)
	dataJ.forEach(function(d) {
			d.y = +d.y;
		});
		
		x.domain(dataJ.map(function(d) { return d.x; }));
		y.domain([0, d3.max(dataJ, function(d) { return d.y; })]);
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
		x.rangeRoundBands([0, vWidth + nDiff], .2);
		y.range([tempHeight, 0]);
		yAxis.ticks(tempHeight/30);
		
		svg = d3.select("#" + targetBody).append("svg")
		.attr("id", "svgElement")
		.attr("class", "wholeBody")
		.attr("z-index", 1)
		.attr("width", vWidth + margin.left + margin.right + nDiff)
		.attr("height", vHeight + margin.top + margin.bottom + yDiff)
		.append("g")
		.attr("transform", "translate(" + (margin.left + lMarg) + "," + (margin.top + tMarg) + ")");
		
		svg.append("g")
		.attr("class", "x_axis")
		.attr("z-index", 4)
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
		.attr("class", "y_axis")
		.attr("z-index", 4)
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -35)
		.attr("x", -1 * tempHeight/2)
		.style("font-size", "1.5em")
		.style("text-anchor", "end")
		.text(yString);
		 var lines = svg.selectAll(".bar")
          .data(dataJ);
      lines.exit().remove();
	  var oldX = null;
      lines.enter()
        .append("rect")
          .attr("class", "bar")
		  .attr("width", x.rangeBand())
		  .attr("fill", function(d) {
			if(isCount == "count") {
				return data.getForegroundColor(xString, d.y);
			}
			return data.getForegroundColor(yString, d.y);})
		  .on("click", function(d) {
		  
			$('#observe_column').unbind();
			$('#observe_column').change(function(){
				d.x = $('#observe_column').val();
				x.domain(dataJ.map(function(d) { return d.x; }));
				draw(0, 0);
			});
			
			//document.getElementById("test").innerHTML = "1" + lines.getAttribute("fill");
			//$("#current_color").css('background-color', lines.getAttribute("fill"));
			//$('#color_selection').slideDown();
			//$('') {
			//	
			//}
			
			if(oldX != d.x) {
				$('.observe_panel').slideDown('fast', function() {});
				$('#observe_column').val(d.x);
				$('#observe_value').val(d.y);
				oldX = d.x;
			} else {
				$('.observe_panel').slideUp('fast', function() {});
				oldX = null;
			}
			
		  });
      lines
          .attr("x", function(d) { return x(d.x); })
          .attr("y", function(d) { return y(d.y); })
		  .attr("height", function(d) { return tempHeight - y(d.y); });
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