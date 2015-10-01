// dataJ is an array that follows this format: [(x:<name>, y:<number>), (x:<name>, y:<number>), ...]
// xString is the string name of the x axis label
// yString is the string name of the y axis label
function drawPieChart(dataJ, xString, yString, target) {
	var margin = {top: 20, right: 20, bottom: 40, left: 80};
	var width = paramWidth - margin.left - margin.right;
	var height = paramHeight - margin.top - margin.bottom;
	var radius = Math.min(width, height) / 2;
	
	var vWidth = width;
	var vHeight = height;
	var vRadius = radius;
	function draw() {
		d3.selectAll(".wholeBody").remove();
		var arc = d3.svg.arc()
			.outerRadius(vRadius - 10)
			.innerRadius(0);

		var pie = d3.layout.pie()
			.sort(null)
			.value(function(d) { return d.y; });

		var svg = d3.select("#" + target).append("svg")
			.attr("class", "wholeBody")
			.data([dataJ])
			.attr("width", vWidth)
			.attr("height", vHeight)
		  .append("g")
			.attr("transform", "translate(" + vWidth / 2 + "," + vHeight / 2 + ")");

		  dataJ.forEach(function(d) {
			d.y = +d.y;
		  });

		  var g = svg.selectAll(".arc")
			  .data(pie(dataJ))
			.enter().append("g")
			  .attr("class", "arc");

		  g.append("path")
			  .attr("d", arc)
			  .style("fill", function(d, i) {
				if(i == 0) {
					return "green";
				} else if(i == 1) {
					return "yellow";
				} else if(i == 2){
					return "blue";
				} else if(i == 3){
					return "red";
				} else if(i == 4){
					return "orange";
				} else if(i == 5){
					return "purple";
				} else if(i == 6){
					return "pink";
				} else if(i == 7){
					return "teal";
				}
			  });

		  g.append("text")
			  .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
			  .attr("dy", "2em")
			  .style("text-anchor", "middle")
			  .text(function(d, i) { return dataJ[i].x; });
	}
	draw();
	$('#scale_up').click(function(){
		vHeight = vHeight + (vHeight * .1);
		vWidth = vWidth + (vWidth * .1);
		vRadius = vRadius * 1.1;
		draw();
	});
	$('#scale_down').click(function(){
		vHeight = vHeight - (vHeight * .1);
		vWidth = vWidth - (vWidth * .1);
		vRadius = vRadius * 0.9;
		draw();
	});
}