"use strict";

 // Returns a function to compute the interquartile range.
 function iqr(k) {
   return function(d, i) {
     var q1 = d.quartiles[0],
         q3 = d.quartiles[2],
         iqr = (q3 - q1) * k,
         i = -1,
         j = d.length;
     while (d[++i] < q1 - iqr);
     while (d[--j] > q3 + iqr);
     return [i, j];
   };
 }

function drawBox(dataJ, targetBody) {
	var colNameCallCount = 0;
	var w = 160,
      h = 650,
      m = [20, 50, 40, 80], // top right bottom left
      min = Infinity,
      max = -Infinity;
  
  var chart = d3.chart.box()
      .whiskers(iqr(1.5))
      .width(w - m[1] - m[3])
      .height(h - m[0] - m[2]);
	  
	  
  var data = [];
  var columnNames = [];
  dataJ.forEach(function(x) {
	 if(!(x.Name in columnNames)) {
			columnNames[~~x.Expt] = x.Name;
		}
     var e = ~~x.Expt - 1,
         r = ~~x.Run - 1,
         s = ~~x.Speed,
         d = data[e];
     if (!d) d = data[e] = [s];
     else d.push(s);
     if (s > max) max = s;
     if (s < min) min = s;
   });
 
   chart.domain([min, max]);
 
  var vis = d3.select("#" + targetBody).selectAll("svg")
       .data(data)
     .enter().append("svg:svg")
       .attr("class", "box")
       .attr("width", w)
       .attr("height", h)
     .append("svg:g")
       .attr("transform", "translate(" + m[3] + "," + m[0] + ")")
       .call(chart)
	   .append("text")
		.attr("dx", ".71em")
		.attr("y", 630)
		.attr("pointer-events", "all")
		.style("font-size", "1.5em")
		.style("text-anchor", "start")
		.text(function(d){
			colNameCallCount++;
			return columnNames[colNameCallCount];
		});
}
 