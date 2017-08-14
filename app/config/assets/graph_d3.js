var d3Pie = function doPie(d) {
	var w = global_width;
	var arc = d3.svg.arc().outerRadius(w / 2);

	var pie = d3.layout.pie()
		.sort(global_sort_function)
		.value(function(pair) { return pair[1]; });

	var svg = d3.select(document.getElementById("d3_wrapper")).append("svg")
		.data([all_values])
		.append("g")
		.attr("transform", "translate("+(document.getElementById("d3_wrapper").clientWidth/2)+", "+(w/2)+")");
	var g = svg.selectAll(".arc")
		.data(pie(all_values))
		.enter().append("g");

	g.append("path")
		.attr("d", arc)
		.style("fill", function(garbage, unused) {
			pair = garbage["data"];
			var color = newColor();
			add_key(color, pair[0], d, pair[1] / total_total, pair[1])
			return color;
		});
}
var d3Bar = function doBar(d) {
	alert("Sorting options not available in bar graph because I had to switch to d3. Sorry. <-- TODO translate")
	var x = d3.scale.ordinal().rangeRoundBands([0, global_width], 0.1);

	var y = d3.scale.linear().range([global_width /* height */, 0]);

	var x_axis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var y_axis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickSubdivide(true)
		.ticks(global_width / 30);

	var x_domain = [];
	var max = 0;
	for (var i = 0; i < all_values.length; i++) {
		x_domain = x_domain.concat(all_values[i][0]);
		max = Math.max(max, all_values[i][1]);
	}
	x.domain(x_domain);
	y.domain([0, d3.max(all_values, function(pair) { return pair[1]; })]);

	var svg = d3.select(document.getElementById("d3_wrapper")).append("svg")
		.append("g")

	svg.append("g")
		.attr("transform", "translate(0," + global_width + ")")
		.call(x_axis)
		.attr("x", global_width/2-50)
		.attr("y", 35)
		.attr("dx", ".71em")
		.style("text-anchor", "start")

	svg.append("g")
		.call(y_axis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -35)
		.attr("x", -1 * global_width/2)
		.style("text-anchor", "end")
		.text("y-axis");
	 var lines = svg.selectAll(".bar")
		.data(all_values);

	lines.enter()
		.append("rect")
		.attr("width", x.rangeBand())
		.attr("fill", function(pair) {
			var color = newColor();
			add_key(color, pair[0], d, pair[1] / total_total, pair[1]);
			return color;
		});
	lines.attr("x", function(pair) { return x(pair[0]); })
		.attr("y", function(pair) { return global_width - (global_width * pair[1] / max); })
		.attr("height", function(pair) { return (global_width * pair[1] / max); });

}
var d3Line = function d3Line(d, type) {
	alert("Not supported yet with d3, falling back to native");
	// TEMP HACK
	canvas = document.createElement("canvas")
	document.body.insertBefore(canvas, document.getElementById("key"));
	document.getElementById("key").style.marginTop = global_width.toString() + "px";
	doLine(d, type);
	throw "die"; // don't actually set height
}
