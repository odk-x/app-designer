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
	document.body.insertBefore(canvas, document.getElementById("key"));
	var w = Math.min(document.body.clientHeight - document.getElementById("title").clientHeight, document.body.clientWidth) - 16;
	canvas.style.marginLeft = "8px";
	canvas.style.width = w;
	canvas.style.height = w;
	canvas.width = w;
	canvas.height = w;
	odkData.arbitraryQuery(table_id, raw, args, 10000, 0, function success(d) {
		total_total = d.getCount();
		for (var i = 0; i < d.getCount(); i++) {
			var val = d.getData(i, graph_col);
			if (map[val] === undefined) {
				map[val] = 0;
				all_values = all_values.concat(val);
			}
			map[val]++;
		}
		all_values.sort(function(a, b) {
			return map[a] < map[b];
		});
		if (total_total == 0) {
			document.getElementById("key").innerText = _t("No results")
		} else {
			if (type == "pie") {
				doPie(d);
			} else {
				doBar(d);
			}
			document.getElementById("key").style.marginTop = (canvas.height + 30).toString() + "px";
			document.getElementById("bg").style.height = document.body.clientHeight.toString() + "px";
		}
	}, function(e) {
		alert(e);
	})
}

// If we need more than this the graph is going to look ugly anyways
// Colors are Oxley, Serenade, Chilean Fire, Vulcan, Zest, Froly, Havelock Blue, Firebrick, Purple and Regal Blue
var all_colors = ["#85ac85", "#ffebd7", "#993300", "#37393d", "#e58755", "#ff8080", "#4891d9", "#cc2e2d", "#9900ff", "#1f4864"]
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
var add_key = function add_key(color, val, d, percent) {
	var label = document.createElement("div");
	var square = document.createElement("span");
	square.style.backgroundColor = color;
	square.style.width = square.style.height = "30px";
	square.style.display = "inline-block";
	label.appendChild(square);
	label.appendChild(document.createTextNode(" " + _tu(_tc(d, graph_col, val))+ " - " + pretty_percent(percent)));
	document.getElementById("key").appendChild(label);
}
var doPie = function doPie(d) {
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
		add_key(color, val, d, percent);
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
		return "#" + newGuid().replace("-", "").substr(0, 6);
	}
	return all_colors[current_color_idx++];
}
var doBar = function doBar(d) {
	var h = canvas.height;
	var w = canvas.width
	var max_percent = 0;
	var percentages = [];
	var width_of_one_bar = w / all_values.length;
	width_of_one_bar = Math.min(width_of_one_bar, w / 3);
	for (var i = 0; i < all_values.length; i++) {
		var val = all_values[i];
		var percent = map[val] / total_total;
		percentages = percentages.concat(percent);
		max_percent = Math.max(max_percent, percent);
	}
	for (var i = 0; i < all_values.length; i++) {
		var val = all_values[i];
		var percent = percentages[i];
		var color = newColor();
		add_key(color, val, d, percent);
		var bar_height = h * (percent / max_percent);
		drawBar(bar_height, width_of_one_bar * i, width_of_one_bar, color);
	}
}
var drawBar = function drawBar(bar_height, starting_y, bar_width, color) {
	starting_y += bar_width * .05;
	bar_width *= .90;
	var ctxt = canvas.getContext("2d");
	ctxt.fillStyle = color;
	ctxt.beginPath();
	ctxt.moveTo(starting_y, canvas.height);
	ctxt.lineTo(starting_y, canvas.height - bar_height);
	ctxt.lineTo(starting_y + bar_width, canvas.height - bar_height);
	ctxt.lineTo(starting_y + bar_width, canvas.height);
	ctxt.closePath();
	ctxt.fill();
}
