var type = "";
var graph_cols = [];
var raw = "";
var args = [];
var table_id = "";
var title = "";

var all_values = [];
var total_total = 0;
var global_width = 0;
var canvas = document.createElement("canvas");

var parseReallyDirtyInt = function parseReallyDirtyInt(val) {
	if (val.length == 29 && val.indexOf("T") == 10) {
		// It's a date
		return odkCommon.toDateFromOdkTimeStamp(val).getTime();
	}
	var newstr = ""
	for (var i = 0; i < val.length; i++) {
		if ("0123456789.".indexOf(val[i]) >= 0) {
			newstr = newstr.concat(val[i])
		} else {
			if (newstr.length == 0) {
				return  -1 * (255 - val.charCodeAt(0));
			}
			return Number(newstr)
		}
	}
	return Number(newstr);
}

var ol = function ol() {
	var split = window.location.hash.substr(1).split("/");
	if (split.length < 6) {
		alert(translate_formgen("Need at least 6 arguments"));
	}
	type = split[0];
	table_id = split[1];
	graph_cols = jsonParse(split[2]);
	raw = split[3];
	args = jsonParse(split[4]);
	title = split[5];
	title = translate_user(title);
	console.log(raw);
	for (var i = 0; i < args.length; i++) {
		title = title.replace("?", args[i]);
	}
	document.getElementById("title").innerText = title;
	if (!use_d3) {
		document.body.insertBefore(canvas, document.getElementById("key"));
		document.getElementById("d3_wrapper").style.display = "none";
	}
	var w = Math.min(document.body.clientHeight - document.getElementById("title").clientHeight, document.body.clientWidth) - 16;
	canvas.style.marginLeft = "8px";
	canvas.style.width = w;
	canvas.style.height = w;
	canvas.width = w;
	canvas.height = w;
	global_width = w;
	console.log(window.iframeOnly);
	if (!window.iframeOnly) {
		odkData.arbitraryQuery(table_id, raw, args, 10000, 0, success, function(e) {
			alert(e);
		})
	}
}
var global_sort_function = function global_sort_function(a, b) {
	var retVal = 0;
	if (window.sort === true) {
		retVal = b[1] - a[1];
	} else if (window.sort === false) {
		retVal = parseReallyDirtyInt(a[0]) - parseReallyDirtyInt(b[0]);
	} else {
		retVal = window.sort(a[1], b[1]);
	}
	if (window.reverse) {
		retVal *= -1
	}
	return retVal;
}

// Needs to be on window because the odkData callback above will never occur if we're inside an iframe.
// If we are inside an iframe, the parent can do something like this
// odkData.arbitraryQuery("table", raw, [args], 10000, 0, document.getElementById("iframe").contentWindow.success, function(e) { alert(e); });
window.success = function success(d) {
	console.log(d.resultObj)
	console.log(graph_cols)
	// reset state, as this might be called more than once to update our contents
	total_total = 0; key = {}; all_values = []; document.getElementById("key").innerHTML = ""; current_color_idx = 0;
	for (var i = 0; i < d.getCount(); i++) {
		var key = d.getData(i, graph_cols[0]);
		var val = d.getData(i, graph_cols[1]);
		if (graph_cols[0] == "__formgen_raw" && graph_cols[0] == "__formgen_raw") {
			key = d.resultObj.data[i][0]
			val = d.resultObj.data[i][1]
		}
		all_values = all_values.concat(0);
		all_values[all_values.length - 1] = [key, val]
		total_total += Number(val);
	}
	all_values.sort(global_sort_function);
	if (total_total == 0) {
		document.getElementById("key").innerText = translate_formgen("No results")
	} else {
		if (!use_d3) {
			if (type == "pie") {
				doPie(d);
			} else if (type == "line" || type == "scatter") {
				doLine(d, type == "line");
			} else {
				doBar(d);
			}
		} else {
			if (type == "pie") {
				d3Pie(d);
			} else if (type == "line" || type == "scatter") {
				d3Line(d, type == "line");
			} else {
				d3Bar(d);
			}
		}
		if (use_d3) {
			document.getElementById("d3_wrapper").style.height = global_width.toString() + "px";
			document.getElementsByTagName("svg")[0].style.height = global_width.toString() + "px";
		} else {
			document.getElementById("key").style.marginTop = (canvas.height + 30).toString() + "px";
		}
		document.getElementById("bg").style.height = document.body.clientHeight.toString() + "px";
	}
}

var current_color_idx = 0;
/*
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
*/
var drawSegment = function drawSegment(center_x, center_y, starting_percent, percent, color) {
	var end_percent = starting_percent + percent;
	/*
	var x1 = (1 + Math.cos(2 * Math.PI * starting_percent)) * center_y;
	var y1 = (1 + Math.sin(2 * Math.PI * starting_percent)) * center_x;
	var x2 = (1 + Math.cos(2 * Math.PI * end_percent)) * center_y;
	var y2 = (1 + Math.sin(2 * Math.PI * end_percent)) * center_x;
	*/
	var ctxt = canvas.getContext("2d");
	ctxt.fillStyle = color;
	ctxt.beginPath();
	ctxt.moveTo(center_x, center_y);
	/*
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
	*/
	ctxt.arc(center_x, center_y, center_x /* that's the radius */, starting_percent * 2 * Math.PI, end_percent * 2 * Math.PI)
	ctxt.closePath();
	ctxt.fill();
}
var key = {};
var add_key = function add_key(color, val, d, percent, raw_number) {
	var label = document.createElement("div");
	var square = document.createElement("span");
	square.style.backgroundColor = color;
	square.style.width = square.style.height = "30px";
	square.style.display = "inline-block";
	label.appendChild(square);
	var label_text = val;
	if (val === null || val === undefined) val = "null"
	if (typeof(val) != "string") val = val.toString();
	if (val.length == 29 && val[10] == "T") {
		label_text = val.split("T")[0]
	} else {
		label_text = translate_user(translate_choice(d, graph_cols[0], val));
	}
	label.appendChild(document.createTextNode(" " + label_text + " - " + (show_value ? (show_value === true ? raw_number : show_value(raw_number, percent)) : pretty_percent(percent))));
	document.getElementById("key").appendChild(label);
}
var doPie = function doPie(d) {
	var current_percent = 0;
	var center_x = canvas.width / 2;
	var center_y = canvas.height / 2;
	var ctxt = canvas.getContext("2d");
	/*
	ctxt.beginPath();
	ctxt.arc(center_x, center_y, Math.min(center_x, center_y), 0, Math.PI * 2);
	ctxt.clip();
	*/
	for (var i = 0; i < all_values.length; i++) {
		var key = all_values[i][0];
		var val = all_values[i][1];
		var percent = val / total_total;
		var color = newColor();
		drawSegment(center_x, center_y, current_percent, percent, color);
		current_percent += percent;
		add_key(color, key, d, percent, val);
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
	if (current_color_idx == window.all_colors.length) {
		// We're out of colors!
		return "#" + newGuid().replace("-", "").substr(0, 6);
	}
	return window.all_colors[current_color_idx++];
}
var doBar = function doBar(d) {
	var h = canvas.height;
	var w = canvas.width
	var max_percent = 0;
	var percentages = [];
	var width_of_one_bar = w / all_values.length;
	width_of_one_bar = Math.min(width_of_one_bar, w / 3);
	for (var i = 0; i < all_values.length; i++) {
		var val = all_values[i][1];
		var percent = val / total_total;
		percentages = percentages.concat(percent);
		max_percent = Math.max(max_percent, percent);
	}
	for (var i = 0; i < all_values.length; i++) {
		var key = all_values[i][0];
		var val = all_values[i][1];
		var percent = percentages[i];
		var color = newColor();
		add_key(color, key, d, percent, val);
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
var doLine = function doLine(d, draw_lines) {
	var h = canvas.height;
	var w = canvas.width
	var max_percent = 0;
	var percentages = [];
	var max_key = 0;
	var min_key = null;
	for (var i = 0; i < all_values.length; i++) {
		var key = all_values[i][0];
		var val = all_values[i][1];
		var percent = val / total_total;
		percentages = percentages.concat(percent);
		max_percent = Math.max(max_percent, percent);
		max_key = Math.max(parseReallyDirtyInt(key), max_key);
		min_key = min_key == null ? parseReallyDirtyInt(key) : Math.min(parseReallyDirtyInt(key), min_key);
	}
	var points = []
	for (var i = 0; i < all_values.length; i++) {
		var key = all_values[i][0]
		var val = all_values[i][1]
		var percent = percentages[i];
		var color = newColor();
		add_key(color, key, d, percent, val);
		var bar_height = h * (percent / max_percent);
		points = points.concat(0);
		points[points.length - 1] = [20 + ((w - 40) * (parseReallyDirtyInt(key) - min_key) / (max_key - min_key)), (canvas.height + /* line graph point radius */ 10) - bar_height, color];
	}
	var current = points[0];
	var last = null;
	for (var i = 0; i < points.length - 1; i++) {
		last = current;
		current = points[i + 1];
		if (draw_lines) {
			drawLine(last, current);
		}
		drawPoint(last);
	}
	drawPoint(current);
}
var drawPoint = function drawPoint(point) {
	var ctxt = canvas.getContext("2d");
	ctxt.fillStyle = point[2];
	ctxt.beginPath();
	ctxt.arc(point[0], point[1], 10, 0, 2 * Math.PI);
	ctxt.closePath();
	ctxt.fill();
}
var drawLine = function drawLine(a, b) {
	var ctxt = canvas.getContext("2d");
	ctxt.strokeStyle = "#37393d";
	ctxt.beginPath();
	ctxt.moveTo(a[0], a[1]);
	ctxt.lineTo(b[0], b[1]);
	ctxt.closePath();
	ctxt.stroke();
}
