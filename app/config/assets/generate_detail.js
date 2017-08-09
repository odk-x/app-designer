var table_id = null;
var row_id = null;
// a map you can override in customJsOnload that dictates which columns get printed and how they get printed
// e.g. pretty printed or not, or you can give a callback for a column that returns what should get printed
// If you leave it as this, it will just print every column as not pretty printed no matter what
// If you set it, only the things you put in it will get set. For what to put in it, see README.md
var colmap = [];
// The main column. We'll try and get this from display_cols unless you override it in customJsOl
var main_col = "";
// Used so we only have to query the database once, just save the result object
var cached_d = null;
// Global join and select arguments, see README
var global_join = "";
var global_which_cols_to_select = "*"
// Function called on page load, tries to pull table id and row id from url hash, sets up doAction listener so we'll reload
// when the user comes back from editing the row
var ol = function ol() {
	document.getElementById("back").innerText = _t("Back")
	document.getElementById("delete").innerText = _t("Delete Row")
	document.getElementById("edit").innerText = _t("Edit Row")
	var hash = document.location.hash.substr(1);
	if (hash.length > 0 && hash.indexOf("/") > 0) {
		table_id = hash.split("/")[0]
		row_id = hash.split("/")[1]
	}
	customJsOl();
	if (main_col.length == 0) {
		main_col = display_cols[table_id];
	}
	// Don't call update until we have our table id and our row id
	getWhichColumnAndThen(update);
	odkCommon.registerListener(function doaction_listener() {
		var a = odkCommon.viewFirstQueuedAction();
		if (a != null) {
			// may have edited this row
			clear_cached_d_and_update();
			odkCommon.removeFirstQueuedAction();
		}
	});
}
// If we couldn't figure out our row/table ids, this function will try and get them from the view data
var getWhichColumnAndThen = function getWhichColumnAndThen(callback) {
	try {
		odkData.getViewData(function (d) {
			row_id = d.getData(0, "_id");
			table_id = d.getTableId();
			callback();
		}, failure_callback, 1, 0);
	} catch (e) {
		// not in a detail view, oh well, hope they didn't need it to look good
		callback();
	}
}
// Called when the user clicks the delete row button, asks for a confirmation then calls deleteRow
var _delete = function _delete() {
	if (confirm(_t("Please confirm deletion of row ") + row_id)) {
		odkData.deleteRow(table_id, null, row_id, function(d) {
			odkCommon.closeWindow();
		}, function(e) {
			alert(_t("Failed to _delete row - ") + JSON.stringify(e));
		});
	}
}
// Called with the results of our arbitraryQuery, sets cached_d and displays all the columns on the page
var update_callback = function update_callback(d) {
	cached_d = d;
	// Used for localization of column ids
	var metadata = d.getMetadata();

	// Enable the edit and delete buttons now that we know which row id we're operating on
	if (d.getData(0, "_effective_access").indexOf("w") >= 0) {
		document.getElementById("edit").disabled = false;
	} else {
		document.getElementById("edit").style.display = "none";
	}
	if (d.getData(0, "_effective_access").indexOf("d") >= 0) {
		document.getElementById("delete").disabled = false;
	} else {
		document.getElementById("delete").style.display = "none";
	}

	var ul = document.getElementById("rest");
	// Clear the "Loading..." message
	ul.innerHTML = "";
	// Handle no row
	if (d.getCount() == 0) {
		ul.innerText = _t("Row not found!");
	}
	var temp_colmap = colmap;
	if (colmap.length == 0) {
		for (var i = 0; i < d.getColumns().length; i++) {
			var col = d.getColumns()[i]
			if (col.substr(0, 1) == "_") continue
			temp_colmap = temp_colmap.concat(0);
			temp_colmap[temp_colmap.length - 1] = [col, true];
		}
	}
	for (var i = 0; i < temp_colmap.length; i++) {
		// holds whether we found this column id in the colmap
		var found = temp_colmap[i];
		// col is the column key, val is the value of that cell in our row
		var col = found[0];
		var val = (col === null ? "" : d.getData(0, col));
		// If we found a column that isn't in the database, it might be a picture, so check that
		var checkMedia = d.getColumns().indexOf(col) < 0;
		// If it's the main column (to be displayed in big letters at the top), put it in the header instead
		var li = null;
		if (col == main_col) {
			li = document.getElementById("main-col")
		} else {
			li = document.createElement("li");
		}
		// This has to do with how colmap is specified. If the user writes literal text, we should display that text
		// and we know we can set innerText (because setting innerHTML is slower).
		// However if we're displaying the result of a user-given callback, it might contain html, so we'll put "html" in this variable
		// If it's media, like a picture or video, it'll be a dom element, so this will be set to "element"
		var is_html = "text";
		if (checkMedia) {
			if (d.getColumns().indexOf(col + "_uriFragment") >= 0 && d.getColumns().indexOf(col + "_contentType") >= 0) {
				is_html = "element";
				var type = d.getData(0, col + "_contentType").split("/")[0];
				var src = odkCommon.getRowFileAsUrl(table_id, row_id, d.getData(0, col + "_uriFragment"));
				if (type == "audio" || type == "video") {
					var elem = document.createElement(type);
					var source = document.createElement("source");
					source.src = src;
					elem.appendChild(source)
					val = elem;
				} else if (type == "image") {
					var elem = document.createElement("img");
					elem.src = src;
					val = elem;
				} else {
					alert("unknown content type for column " + col);
				}
			} else {
				continue;
			}
		} 
		if (typeof(found[1]) == "string") {
			li.appendChild(make_li(col, _tu(found[1]), _tc(d, col, val), "html"));
		} else if (found[1] === true) {
			li.appendChild(make_li(col, displayCol(col, metadata, table_id), pretty(_tc(d, col, val)), "text"));
		} else if (found[1] === false) {
			li.appendChild(make_li(col, displayCol(col, metadata, table_id), _tc(d, col, val), "text"));
		} else {
			li.appendChild(make_li(col, "", found[1](li, val, d), "html"));
		}
		if (col != main_col) {
			ul.appendChild(li);
		}
	}
}
var make_li = function make_li(column_id, column_text, value_text, is_html) {
	var wrapper = document.createElement("span");
	wrapper.setAttribute("data-column", column_id);
	wrapper.classList.add("li-inner")
	var colelem = document.createElement("span");
	colelem.innerText = column_text
	colelem.style.fontWeight = "bold";
	wrapper.appendChild(colelem);
	if (is_html == "html") {
		var inner = document.createElement("span")
		inner.innerHTML = value_text;
		wrapper.appendChild(inner);
	} else if (is_html == "text") {
		wrapper.appendChild(document.createTextNode(": " + value_text));
	} else if (is_html == "element") {
		wrapper.appendChild(value_text);
	}
	return wrapper;
}
var failure_callback = function failure_callback(e) {
	alert(_t("Error querying data: ") + e);
	odkCommon.closeWindow();
}
var update = function update() {
	if (cached_d != null) {
		update_callback(cached_d);
		return;
	}
	odkData.arbitraryQuery(table_id, "SELECT " + global_which_cols_to_select + " FROM " + table_id + (global_join.trim().length > 0 ? " JOIN " : "") + global_join + " WHERE " + table_id + "._id = ?", [row_id], 1, 0, update_callback, failure_callback);
}
var clear_cached_d_and_update = function clear_cached_d_and_update() {
	cached_d = null;
	update();
}
var edit = function() {
	if (allowed_tables.indexOf(table_id) >= 0){ 
		odkTables.launchHTML({}, "config/assets/formgen/" + table_id + "#" + row_id);
	} else {
		odkTables.editRowWithSurvey({}, table_id, row_id, table_id, null, null);
	}
}

