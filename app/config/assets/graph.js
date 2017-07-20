var type = "";
var graph_col = "";
var raw = "";
var args = [];
var table_id = "";
var title = "";
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
	var map = {};
	var all_values = [];
	odkData.arbitraryQuery(table_id, raw, args, 10000, 0, function success(d) {
		for (var i = 0; i < d.getCount(); i++) {
			var val = d.getData(i, graph_col);
			if (map[val] === undefined) {
				map[val] = 0;
				all_values = all_values.concat(val);
			}
			map[val]++;
		}
		var ul = document.createElement("ul");
		for (var i = 0; i < all_values.length; i++) {
			var li = document.createElement("li");
			li.innerHTML = "<b>" + _tc(d, graph_col, all_values[i]) + "</b>: "
			li.appendChild(document.createTextNode(map[all_values[i]]));
			ul.appendChild(li);
		}
		document.getElementById("graph").appendChild(ul);
		document.getElementById("graph").appendChild(document.createTextNode(raw + JSON.stringify(args)));
	}, function(e) {
		alert(e);
	})
}