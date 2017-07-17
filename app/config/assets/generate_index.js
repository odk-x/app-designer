var ol = function ol() {
	if (window.location.hash.slice(1).length > 0) {
		new_menu_path = window.location.hash.slice(1).split("/");
		for (var i = 0; i < new_menu_path.length; i++) {
			if (!isNaN(Number(new_menu_path[i]))) {
				menu_path = menu_path.concat(Number(new_menu_path[i]));
			}
		}
	}
	doMenu();
}
var getMetadataAndThen = function getMetadata(table, callback) {
	if (metadata[table] == undefined && table != null) {
		odkData.arbitraryQuery(table, "SELECT _id FROM " + table, [], 0, 0, function success(d) {
			metadata[table] = d.getMetadata();
			callback(metadata[table]);
		}, function error(e) {
			alert("Error: " + e);
		});
	} else {
		callback(metadata[table]);
	}
}
var menu_path = [];
var make_submenu = function make_submenu() {
	var submenu = menu;
	for (var i = 0; i < menu_path.length; i++) {
		submenu = submenu[2][menu_path[i]];
	}
	return submenu;
}
var buttonClick = function doButtonClick(path) {
	menu_path = menu_path.concat(Number(path));
	var submenu = make_submenu();
	if (submenu[1] == "_html") {
		odkTables.launchHTML(null, submenu[2]);
	} else {
		// Must be a group by
		if (typeof(submenu[2]) == "string") {
			var listview = list_views[submenu[1]]
			if (listview == undefined) listview = "config/assets/table.html"
			odkTables.launchHTML(null, listview + "#" + submenu[1] + "/" + submenu[2]);
		} else {
			var new_hash = "#";
			for (var i = 0; i < menu_path.length; i++) {
				new_hash += menu_path[i] + "/";
			}
			odkTables.launchHTML(null, clean_href() + new_hash);
		}
	}
}
var doMenu = function doMenu() {
	document.getElementById("list").innerHTML = "";
	var submenu = make_submenu();
	document.getElementById("title").innerText = _tu(submenu[0]);
	getMetadataAndThen(submenu[1], function(this_table_metadata) {
		var len = submenu[2].length;
		for (var i = 0; i < len; i++) {
			var triplet = submenu[2][i];
			var button = document.createElement("button");
			if (triplet[0] === true) {
				button.innerText = _t("By ") + displayCol(triplet[2], this_table_metadata);
			} else {
				button.innerText = _tu(triplet[0]);
			}
			button.classList.add("button");
			if (len > 10) {
				button.classList.add("tiny-button");
			} else if (len > 6) {
				button.classList.add("small-button")
			}
			document.getElementById("list").appendChild(button);
			(function(button, i) {
				button.addEventListener("click", function() {
					buttonClick(i);
				});
			})(button, i);
			console.log(button)
			document.getElementById("list").appendChild(button);
		}
	});
}
