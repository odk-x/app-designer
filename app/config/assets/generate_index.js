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

var make_submenu = function make_submenu() {
	var submenu = menu;
	for (var i = 0; i < menu_path.length; i++) {
		submenu = submenu[2][menu_path[i]];
	}
	return submenu;
}
// Called when the user clicks a button. If the button was to launch an html page or list view,
// it launches it, otherwise if it was for a submenu, it adds the button's index in the page to
// the menu_path and opens the same html document but with the updated menu_path passed through via the hash
var buttonClick = function doButtonClick(path) {
	// first get the submenu that the button represents
	var submenu = make_submenu()[2][Number(path)];
	// _html should launch a page
	if (submenu[1] == "_html") {
		odkTables.launchHTML(null, submenu[2]);
	} else if (submenu[1] == "_js") {
		submenu[2]();
	} else {
		// if the third thing is a string, it should be appended to the end of a hash for a list view and then launch the list view
		if (typeof(submenu[2]) == "string") {
			var listview = list_views[submenu[1]]
			if (listview == undefined) listview = "config/assets/table.html"
			odkTables.launchHTML(null, listview + "#" + submenu[1] + "/" + submenu[2]);
		} else {
			// otherwise it's a submenu. Construct a new hash with our current menu path and open it
			menu_path = menu_path.concat(Number(path));
			var new_hash = "#";
			for (var i = 0; i < menu_path.length; i++) {
				new_hash += menu_path[i] + "/";
			}
			odkTables.launchHTML(null, clean_href() + new_hash);
		}
	}
}
// Displays the current submenu to the screen
var doMenu = function doMenu() {
	// First clear the existing buttons
	document.getElementById("list").innerHTML = "";
	var submenu = make_submenu();
	// Set the title of the page
	document.getElementById("title").innerText = _tu(submenu[0]);
	// len is the number of buttons to put on the screen
	var len = submenu[2].length;
	var adjusted_len = len;
	if (screen.height <= 640) adjusted_len += 4
	for (var i = 0; i < len; i++) {
		// the triplet that represents the button
		var triplet = submenu[2][i];
		var button = document.createElement("button");
		// If they passed in a literal true for the text, set the text to "By " + the translated column name
		if (triplet[0] === true) {
			button.innerText = _t("Loading...");
			(function(button, triplet) {
				getMetadataAndThen(triplet[1], function(this_table_metadata) {
					button.innerText = _t("By ") + displayCol(triplet[2], this_table_metadata, triplet[1]);
				});
			})(button, triplet);
		} else {
			// Otherwise just set the button text to the text they specified
			button.innerText = _tu(triplet[0]);
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
