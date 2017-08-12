// Will be a list of integers indicating the buttons you had to press to get to the current screen
var menu_path = [];
// On load, pull the menu path from the url hash and go to it
// url hash will be something like #0/2/2 if you pressed the first button, then the third then the third again on each successive menu
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
// Will attempt to pull metadata for the requested table then run the callback with the result. If the table is null, it just calls it immediately with undefined
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
// Given a complex menu object like this:
//	["View Data", None, [
//		["View Health Facilities", "health_facility", [
//			["View All", "health_facility", ""],
//			[True, "health_facility", "admin_region"],
//		]], ["View Refrigerators", "refrigerators", [
//			["View All", "refrigerators", ""],
//			["More", "refrigerators", [
//				["By Use", "refrigerators", "utilization"],
//				["By Reason Not Working", "refrigerators", "reason_not_working"]
//			]]
//		]]
//	]]
// and a menu_path like [1, 1, 0]
// it will navigate down the chain and return ["By Use", "refrigerators", "utilization"]

var make_submenu = function make_submenu(menu_path) {
	var submenu = menu;
	for (var i = 0; i < menu_path.length; i++) {
		submenu = submenu["contents"][menu_path[i]];
	}
	return submenu;
}
// Called when the user clicks a button. If the button was to launch an html page or list view,
// it launches it, otherwise if it was for a submenu, it adds the button's index in the page to
// the menu_path and opens the same html document but with the updated menu_path passed through via the hash
var buttonClick = function doButtonClick(path) {
	// first get the submenu that the button represents
	// Don't want to actually change menu_path because if we open a html view or something and then the activity DOESN'T get destroyed and recreated when we return, menu_path will be pointed into a string and the whole thing will get fucked up
	var submenu = make_submenu(menu_path)["contents"][Number(path)];
	// _html should launch a page
	if (submenu["type"] == "html") {
		odkTables.launchHTML(null, submenu["page"]);
	} else if (submenu["type"] == "js") {
		submenu["function"]();
	} else {
		if (submenu["type"] == "menu") {
			// otherwise it's a submenu. Construct a new hash with our current menu path and open it
			menu_path = menu_path.concat(Number(path));
			var new_hash = "#";
			for (var i = 0; i < menu_path.length; i++) {
				new_hash += menu_path[i] + "/";
			}
			odkTables.launchHTML(null, clean_href() + new_hash);
		} else {
			var listview = list_views[submenu["table"]];
			if (listview == undefined) listview = "config/assets/table.html"
			if (submenu["type"] == "list_view") {
				odkTables.launchHTML(null, listview + "#" + submenu["table"]);
			} else if (submenu["type"] == "group_by") {
				odkTables.launchHTML(null, listview + "#" + submenu["table"] + "/" + submenu["grouping"]);
			} else if (submenu["type"] == "collection") {
				odkTables.launchHTML(null, listview + "#" + submenu["table"] + "/" + submenu["column"] + " = ?/" + submenu["value"]);
			} else if (submenu["type"] == "static") {
				odkTables.launchHTML(null, listview + "#" + submenu["table"] + "/STATIC/" + submenu["query"] + "/" + JSON.stringify(submenu["args"]) + "/" + submenu["explanation"]);
			}
		}
	}
}
// Displays the current submenu to the screen
var doMenu = function doMenu() {
	// First clear the existing buttons
	document.getElementById("list").innerHTML = "";
	var submenu = make_submenu(menu_path);
	// Set the title of the page
	document.getElementById("title").innerHTML = _tu(submenu["label"]);
	// len is the number of buttons to put on the screen
	var len = submenu["contents"].length;
	var adjusted_len = len;
	//if (screen.height <= 640) adjusted_len += 4
	if (window.innerHeight <= 640) adjusted_len += 4
	for (var i = 0; i < len; i++) {
		// the triplet that represents the button
		var triplet = submenu["contents"][i];
		var button = document.createElement("button");
		// If they passed in a literal true for the text, set the text to "By " + the translated column name
		if (!("label" in triplet)) {
			button.innerText = _t("Loading...");
			(function(button, triplet) {
				getMetadataAndThen(triplet["table"], function(this_table_metadata) {
					button.innerText = _t("By ") + displayCol(triplet["grouping"], this_table_metadata, triplet["table"]);
				});
			})(button, triplet);
		} else {
			// Otherwise just set the button text to the text they specified
			button.innerText = _tu(triplet["label"]);
		}
		button.classList.add("button");
		// If we have a lot of buttons, make the buttons smaller
		if (adjusted_len > 20) {
			button.classList.add("grid-button");
		} else if (adjusted_len > 9) {
			button.classList.add("tiny-button");
		} else if (adjusted_len > 6) {
			button.classList.add("small-button")
		}
		// buttonClick will be passed the index into the list of buttons, so it knows what to add to menu_path
		(function(button, i) {
			button.addEventListener("click", function() {
				buttonClick(i);
			});
		})(button, i);
		document.getElementById("list").appendChild(button);
	}
}
