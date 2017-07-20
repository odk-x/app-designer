var type = "";
var graph_col = "";
var raw = "";
var args = [];
var table_id = "";
var title = "";

var map = {};
var all_values = [];
var total_total = 0;
var canvas = document.createElement("canvas");

var ol = function ol() {
	var split = window.location.hash.substr(1).split("/");
	if (split.length < 6) {
		// TODO localize
		alert("Need at least 6 arguments");
	}
	type = split[0];
	table_id = split[1];
	graph_col = split[2];
	raw = split[3];
	args = jsonParse(split[4]);
	title = split[5];
	title = _tu(title);
	for (var i = 0; i < args.length; i++) {
		title = title.replace("?", args[i]);
	}
	document.getElementById("title").innerText = title;
	//document.getElementById("graph").appendChild(canvas);
	//document.body.appendChild(canvas);
	document.body.insertBefore(canvas, document.getElementById("key"));
	var w = Math.min(document.body.clientHeight - document.getElementById("title").clientHeight, document.body.clientWidth);
	canvas.style.width = w;
	canvas.style.height = w;
	canvas.width = w;
	canvas.height = w;
	document.getElementById("key").style.marginTop = w + 30 + "px";
	odkData.arbitraryQuery(table_id, raw, args, 10000, 0, function success(d) {
		for (var i = 0; i < d.getCount(); i++) {
			var val = d.getData(i, graph_col);
			if (map[val] === undefined) {
				map[val] = 0;
				all_values = all_values.concat(val);
			}
			map[val]++;
			total_total++;
		}
		all_values.sort(function(a, b) {
			return map[a] < map[b];
		});
		doGraph(d);
	}, function(e) {
		alert(e);
	})
}

// If we need more than this the graph is going to look ugly anyways
// Colors are Oxley, Serenade, Chilean Fire, Vulcan, Zest, Froly, Havelock Blue, Firebrick and Purple
var all_colors = ["#85ac85", "#ffebd7", "#993300", "#37393d", "#e58755", "#ff8080", "#4891d9", "#cc2e2d", "#9900ff"]
var current_color_idx = 0;
var getCorner = function getCorner(center_x, center_y, x, y) {
	var ret_x = 0;
	var ret_y = 0;
	if (x >= center_x) {
		ret_x = center_x * 2;
	}
	if (y >= center_y) {
		ret_y = center_y * 2;
	}
	return [ret_x, ret_y];
}
var drawSegment = function drawSegment(center_x, center_y, starting_percent, percent, color) {
	var end_percent = starting_percent + percent;
	var x1 = (1 + Math.cos(2 * Math.PI * starting_percent)) * center_y;
	var y1 = (1 + Math.sin(2 * Math.PI * starting_percent)) * center_x;
	var x2 = (1 + Math.cos(2 * Math.PI * end_percent)) * center_y;
	var y2 = (1 + Math.sin(2 * Math.PI * end_percent)) * center_x;
	var ctxt = canvas.getContext("2d");
	ctxt.fillStyle = color;
	ctxt.beginPath();
	ctxt.moveTo(center_x, center_y);
	ctxt.lineTo(x1, y1);
	var corner = getCorner(center_x, center_y, x1, y1);
	ctxt.lineTo(corner[0], corner[1]);
	//if (percent > .5 && percent < .75) {
	if (true) {
		var x125 = (1 + Math.cos(2 * Math.PI * (starting_percent + 0.33 * percent))) * center_y;
		var y125 = (1 + Math.sin(2 * Math.PI * (starting_percent + 0.33 * percent))) * center_x;
		corner = getCorner(center_x, center_y, x125, y125);
		ctxt.lineTo(corner[0], corner[1]);
		var x175 = (1 + Math.cos(2 * Math.PI * (starting_percent + 0.66 * percent))) * center_y;
		var y175 = (1 + Math.sin(2 * Math.PI * (starting_percent + 0.66 * percent))) * center_x;
		corner = getCorner(center_x, center_y, x175, y175);
		ctxt.lineTo(corner[0], corner[1]);
	}
	corner = getCorner(center_x, center_y, x2, y2);
	ctxt.lineTo(corner[0], corner[1]);
	ctxt.lineTo(x2, y2);
	ctxt.closePath();
	ctxt.fill();
}
var key = {};
var doGraph = function doGraph(d) {
	var current_percent = 0;
	var center_x = canvas.width / 2;
	var center_y = canvas.height / 2;
	var ctxt = canvas.getContext("2d");
	ctxt.beginPath();
	ctxt.arc(center_x, center_y, Math.min(center_x, center_y), 0, Math.PI * 2);
	ctxt.clip();
	for (var i = 0; i < all_values.length; i++) {
		var val = all_values[i];
		var percent = map[val] / total_total;
		var color = newColor();
		drawSegment(center_x, center_y, current_percent, percent, color);
		current_percent += percent;
		var label = document.createElement("div");
		var square = document.createElement("span");
		square.style.backgroundColor = color;
		//square.style.border = "1px solid black";
		square.style.width = square.style.height = "30px";
		square.style.display = "inline-block";
		label.appendChild(square);
		label.appendChild(document.createTextNode(" " + _tu(_tc(d, graph_col, val))+ " - " + pretty_percent(percent)));
		document.getElementById("key").appendChild(label);
	}
}
var pretty_percent = function pretty_percent(n) {
	var s = (n * 100).toString();
	var idx = s.indexOf(".");
	if (idx == -1) {
		// 45%
		return s.substr(0, 3) + "%";
	}
	if (idx == 0) {
		// 0.12%
		return "0" + s.substr(0, 3) + "%"
	}
	if (idx == 1) {
		// 3.5%
		return s.substr(0, 3) + "%";
	}
	if (idx == 2) {
		// 34.5%
		return s.substr(0, 4) + "%"
	}
}
var newColor = function newColor() {
	if (current_color_idx == all_colors.length) {
		// We're out of colors!
		return "#" + newGuid().replace(/-/g, "").substr(0, 6);
	}
	return all_colors[current_color_idx++];
}