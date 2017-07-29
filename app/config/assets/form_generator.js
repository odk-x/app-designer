// keeps track of which row we're editing
var row_id = "";
// keeps track of whether we were opened to edit an existing row or add a new row, automatically determined
var opened_for_edit = false;
// Stores the entire row we're editing right now
var row_data = {};
// Holds whether the row exists or not yet, set in onLoad (`ol`)
var row_exists = true;

// Helper package for doActions, used in makeIntent
var survey = "org.opendatakit.survey"
// The index of the currently displayed screen in `screens`. 
// Initially set to -1 and the onLoad function (`ol`) will call update(1) to force displaying of the screen at index 0, whereas
// if we just started it at zero and called update(0) it wouldn't change the current screen data
var global_screen_idx = -1;

// noop is a magic and special variable, if noop is set to true then update() will refuse to do anything and display an error message
// Set to true initially and set to false in onLoad (`ol`) before it calls update()
var noop = true;

// some user defined javascript (like assigns, query filters) takes place before row_data has been updated with the data
// that's actually on the screen, so we should poll screen data first
var _data_wrapper = function _data_wrapper(i) {
	var gsp_result = get_screen_prompt(i);
	if (gsp_result[0]) {
		if (gsp_result[1].getAttribute("data-data_populated") == "done") {
			return screen_data(i);
		} else {
			throw -1;
		}
	} else {
		return row_data[i];
	}
}


// Helper function for constraints, so people can write like "selected(data('color'), 'blue')" and it will return true/false 
var selected = function selected(value1, value2) {
	if (value1 == null) {
		return value2 == null || value2.length == 0;
	}
	// If value1 is the result of data() on a select_multiple, decode it and return true if value2 is one of the selected options
	if (value1.indexOf("[") == 0) {
		try {
			value1 = jsonParse(value1);
			for (var i = 0; i < value1.length; i++) {
				if (value1[i] == value2) return true;
			}
		} catch (e) {
			// keep going
		}
	}
	// otherwise just check if they're equal
	return value1 == value2
}
// Given a dbcol, try and pull the data currently in the prompt object on the screen.
// Checked in update(), and if it differs from row_data then update knows to go update the database with row_data now
var screen_data = function screen_data(id, optional_no_alert) {
	// This will throw an error if the requested prompt isn't on the screen
	var gsp_result = get_screen_prompt(id);
	if (!gsp_result[0]) {
		if (optional_no_alert != true) {
			alert(_t("Prompt for database column ") + id + _t(" not found on the screen! Will be stored in the database as null!"))
		}
		return null;
	}
	var elem = get_screen_prompt(id)[1]
	// If it's a text input
	if (elem.tagName == "INPUT") {
		// IMPORTANT!!
		// If it's empty, the user left it blank, so return null. If we return an empty string, and the field is a
		// double or something, we'll get a "column has multiple datatypes" over the aidl interface and it will actually
		// break the rest of the Tables tool too, it will crash any time it tries to select all the rows in the table
		if (elem.value.trim().length == 0) {
			return null;
		}
		// If it's supposed to be a number/double, cast it to a number and return it. IMPORTANT - If it's an invalid number/double,
		// the code will never reach here. If it's not a valid Number, then element.value will return an empty string instead of 
		// the invalid stuff the user put in the textbox, and we will have returned null already. The way you check if there's really
		// nothing in the box versus if there's something in the box but it's not a valid number is by checking elem.validity, and that's
		// exactly what the validation function does
		if (elem.getAttribute("data-validate") == "integer" || elem.getAttribute("data-validate") == "double") {
			return Number(elem.value);
		}
		// Otherwise return the contents of the text box
		return elem.value.trim();
	} else if (elem.tagName == "SELECT") {
		// Dropdown menu, pretty simple
		if (elem.selectedOptions.length > 0) {
			return elem.selectedOptions[0].value.trim();
		}
		return null;
	} else if (elem.classList.contains("select-multiple")) {
		// for select multiple, accumulate everything the user checked in a list, then stringify it
		// we stringify it because whatever we return will be put into row_data and then from row_data into the database by update()
		// When update() encounters a select multiple element that has no data yet, it will attempt to populate it from the database
		// by calling changeElement, which will expect something that it can jsonParse
		var result = [];
		// Selects all the input elements that have our span as a parent, in this case all checkboxes
		var subs = elem.getElementsByTagName("input");
		for (var j = 0; j < subs.length; j++) {
			if (subs[j].checked) {
				result = result.concat(subs[j].value.trim());
			}
		}
		return JSON.stringify(result);
	} else if (elem.classList.contains("select-one") || elem.classList.contains("select-one-with-other")) {
		// For select one and select one with an "Other: " option as a text box
		// Selects all the input elements that have our span as a parent, in this case all radio buttons
		var subs = elem.getElementsByTagName("input");
		for (var j = 0; j < subs.length; j++) {
			if (subs[j].checked) {
				// If the selected radio button corrisponds to the "Other: " text field, grab the label text box and return its value
				// Otherwise, just return the value of the radio button
				if (subs[j].value.trim() == "_other") {
					return document.getElementById(id + "_" + "_other" + "_tag").children[0].value;
				} else {
					return subs[j].value.trim();
				}
			}
		}
		// No radio buttons checked? Just leave it as null in the database, that's what survey does
		return null;
	} else if (elem.classList.contains("date")) {
		// Dates are a little complicated, they're made up of three dropdown menus. 
		// First, grab the three dropdowns
		var fields = elem.getElementsByTagName("select");
		// This will be used to store the result once we've scraped all three dropdown menus
		var total = ["0", "0", "0"];
		// For each dropdown, update total
		for (var j = 0; j < fields.length; j++) {
			var field = fields[j]; // the select element for day, month or year
			if (field.selectedOptions[0] == undefined) {
				// If there's nothing, set to "0", will be padded with zeroes later
				total[j] = "0"
			} else {
				// But if there was a value to pull, put it in the right place in totals
				total[j] = field.selectedOptions[0].value.trim();
			}
		}
		// fields on the screen are in the order YYYY/MM/DD
		// return here as YYYY-MM-DDT00:00:00.000000000 for storage in the database, will need to pad things to the
		// right length, e.g. "6" -> "06"
		var pad = odkCommon.padWithLeadingZeros
		return pad(total[0], 4) + "-" + pad(total[1], 2) + "-" + pad(total[2], 2) + "T00:00:00.000000000";
	} else {
		for (var i = 0; i < all_custom_prompt_types.length; i++) {
			if (elem.classList.contains(all_custom_prompt_types[i]) >= 0) {
				return custom_prompt_types[all_custom_prompt_types[i]]["screen_data"](elem);
			}
		}
		// fuck
		alert("Unknown prompt type!"); // TODO LOCALIZE
		return "ERROR";
	}
}
// Helper function used by assigns, validation, if statements, etc...
// For example, if some questions should only appear if the survey taker is under 18, so one if statement
// might have the clause "data('age') < 18"
// or a prompt's response might only be valid if "data('color') == 'red'" if the only possible favorite color is red
// that exact example is used in default/complex_validate_test
var data = function data(id) {
	return row_data[id];
}
// This function is called in get_choices if the choices list for a particular prompt is a csv query AND the choices for that
// query haven't been populated yet
var do_csv_xhr = function do_csv_xhr(choice_id, filename, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			// Appends each row to this list
			var all = []
			// split by lines
			var s = this.responseText.split("\n")
			// split the first line by a comma to extract a list of the headers in the csv
			var cols = s[0].split(",");
			// remove the headers line from the data
			var s = s.slice(1);
			// for all the other rows, parse them to an object and put the object in `all`
			for (var i = 0; i < s.length; i++) {
				// holds each of the cells in the current row
				var cs = s[i].split(",");
				// the object we'll put the things in
				var choice = {};
				var found_at_least_one = false;
				// For each cell in this row of the csv, set choice[column] = cell
				for (var j = 0; j < cols.length; j++) {
					// Strip quotes, not really parsing it correctly
					// I commented it out because I haven't tested it yet, and also we don't need it for the CSVs I'm parsing so far
					/*
					if (cols[j][0] = '"' && cols[j][cols[j].length - 1] == '"') {
						cols[j] = cols[j].substr(1, cols[j].length - 2);
					}
					if (j >= cs.length) break;
					if (cs[j][0] = '"' && cs[j][cs[j].length - 1] == '"') {
						cs[j] = cs[j].substr(1, cs[j].length - 2);
					}
					*/
					// Trim out the column name and the cell
					cols[j] = cols[j].trim().replace("\r", "");
					if (cs[j] == undefined) continue; // HACK
					var this_col = cs[j].trim().replace("\r", "");
					// If there's no trailing comma or something weird, put it in choice
					if (cols[j].length > 0 && this_col.length > 0) {
						choice[cols[j]] = this_col
						found_at_least_one = true;
					}
				}
				// we don't want to add an empty object, that would generate a yucky "Error translating {}" in the dropdown menu or whatever it is
				if (found_at_least_one) {
					// put choice in all
					all = all.concat(choice);
				}
			}
			try {
				// the callback is specified in the xlsx and expects the list to be called "context". It also expects it to have a choice_list_name
				// set to the name of the query, and I add "notranslate" in there so it will be evaluated with fake_translate rather than
				// display, which is faster but doesn't localize. I can't imagine that the callback that the users wrote will handle
				// translating the items in the csv to other languages.
				var context = all
				var new_choices = eval(callback);
				for (var i = 0; i < new_choices.length; i++) {
					new_choices[i]["choice_list_name"] = choice_id;
					new_choices[i]["notranslate"] = true;
				}
				// Add every choice to the choices list, then call update() to populate the prompts on the screen with our newly-generated choices
				choices = choices.concat(new_choices);
			} catch (e) {
				// ignore
				console.log(e);
			}
			console.log("XHR complete: " + choice_id)
			// don't ask me why we have to call it twice, but it fixes regionlevel1/regionlevel2/adminregion
			// sometimes
			update(0);
			update(0);
		}
	};
	url = odkCommon.localizeUrl(odkCommon.getPreferredLocale(), {"text": filename}, "text", "/" + appname + "/config/tables/" + table_id + "/forms/" + table_id + "/")
	xhr.open("GET", url, true);
	xhr.send();
}
// Called in update() to return a list of choices to put in a select one or select multiple (or select one dropdown or select one with other) prompt
// It returns a list, first thing in the returned list is a boolean, true if the results are all there, false if they will be added to choices later
// Everything after that is a pair of [real_value, translated_display_name], and all of those pairs are added to the on-screen prompt's options
// in update()
var get_choices = function get_choices(which, not_first_time, filter, raw) {
	// Default result - we didn't find anything so check again later
	var result = [false];
	// For each choice
	for (var j = 0; j < choices.length; j++) {
		// If the choice's "choice_list_name" is the name of the choice list we're called upon to return, add it to the result
		if (choices[j].choice_list_name == which) {
			// If there's no filter, add it. If there is a filter, add it only if the filter matches
			var filter_result = true;
			if (filter != null) {
				choice_item = choices[j] // used in the eval
				var data = _data_wrapper
				try {
					filter_result = eval(tokens[filter])
				} catch (e) {
					if (e == -1) filter_result = false;
				}
			}
			if (filter_result) {
				var displayed = null;
				if (raw) {
					displayed = choices[j]
				} else {
					var displayed = choices[j].display;
					// If there's no "notranslate" key, translate it using display, otherwise fake translate it
					if (choices[j].notranslate == undefined) {
						displayed = display(choices[j].display, table_id, window.possible_wrapped.concat("title"))
					} else {
						displayed = fake_translate(choices[j].display);
					}
				}
				// concat on a list will merge them
				result = result.concat(0);
				result[result.length - 1] = [choices[j].data_value, displayed];
				result[0] = true; // we found at least one thing
			}
		}
	}
	// If we found choices, return them
	if (result.length > 1) return result;
	// If the csv xhr or cross table query is still in progress, return false and we'll be asked again later
	if (not_first_time) return [false];
	// Otherwise check queries
	for (var j = 0; j < queries.length; j++) {
		if (queries[j].query_name == which) {
			if (queries[j].query_type == "linked_table") {
				do_cross_table_query(which, queries[j]);
				// false to let update() know that more choices will be added, so we'll be called again later
				return [false];
			}
			// If it's a csv query, start do_csv_xhr
			if (queries[j].query_type == "csv") {
				// Can be an expression, expects some function that I don't actually provide like encodeUrlPart or something, look at selects demo xlsx
				var filename = eval(queries[j].uri);
				do_csv_xhr(which, filename, queries[j].callback);
				return [false]
			}
			// Don't know that kind of query
			return [true, ["ERROR", _t("Unknown query type ") + queries[j].query_type]]
		}
	}
	// Wasn't in choices or queries, don't know what to do, just leave it as empty
	return [true];
}
// function that performs a cross table query based on the query in the formdef. Puts all its
// results in the global `choices` list and calls update(0), which should call get_choices again which should
// now have choices to return in the global `choices` list
// `which` is the choice_list_id, query is the entire json object
var do_cross_table_query = function do_cross_table_query(which, query) {
	var sql = "SELECT * FROM " + query.linked_table_id;
	if (query.selection) {
		sql = sql.concat(" WHERE " + query.selection + " ");
	}
	var selectionArgs = [];
	if (query.selectionArgs) {
		try {
			selectionArgs = jsonParse(query.selectionArgs);
		} catch (e) {
			alert(_t("Failed to start cross-table query: ") + e);
			console.log(e);
			return;
		}
	}
	// Perform the requested query
	odkData.arbitraryQuery(query.linked_table_id, sql, selectionArgs, 1000, 0, function success_callback(d) {
		// On success, add everything to "choices" and call update(0)
		for (var i = 0; i < d.getCount(); i++) {
			// The raw value to get stored in the database is the id of the row in the other table
			var val = d.getData(i, "_id")
			// the display text is the value of the instance column for that row in the other table, but guessing
			// the instance column is unreliable and a lot of times query.yanked_col might just be "_id"
			var text = d.getData(i, query.yanked_col);
			// append the entire thing to choices
			choices = choices.concat(0);
			// notranslate: true so that we don't try and localize it, which would be slow and I doubt the column in the other
			// row has multiple translations anyways
			choices[choices.length - 1] = {"choice_list_name": which, "data_value": val, "display": text, notranslate: true};
			// Copy in all the columns of the row
			var all_cols = d.getColumns()
			for (var j = 0; j < d.getColumns().length; j++) {
				var this_col = all_cols[j];
				var this_val = d.getData(i, this_col);
				choices[choices.length - 1][this_col] = this_val;
			}
		}
		// make update() call get_choices again now that we've added things to the global `choices` list
		update(0);
	}, function failure_callback(e) {
		alert(_t("Unexpected failure") + " " + e);
	});
}
// Helper function called by update, detects if a prompt in the given list of prompts has had choices added to it yet,
// and if it hasn't it calls get_choices, and pass the result to the given callback which handles the dirty dom element adding stuff
// If get_choices returns [true, [...], [...], ...] with some choices, then set "populated" to done. Otherwise,
// if it returns [false], set "populated" to "loading". When we encounter an element, if it was "done", skip it, if it was "loading",
// give that information to get_choices, otherwise it must not have been populated yet so just call get_choices
var populate_choices = function populate_choices(selects, callback) {
	for (var i = 0; i < selects.length; i++) {
		var select = selects[i];
		// if it's already populated, skip it
		if (select.getAttribute("data-populated") == "done" && !select.hasAttribute("data-choice-filter")) {
			continue;
		}
		var stuffs = null;
		// pulls the choice_list_name from the prompt
		var which = select.getAttribute("data-values-list");
		var filter = null;
		// Dates are selects but they don't have a dbcol
		var saved = null;
		if (select.hasAttribute("data-dbcol")) {
			saved = screen_data(select.getAttribute("data-dbcol"))
		}
		if (select.hasAttribute("data-choice-filter")) {
			filter = select.getAttribute("data-choice-filter")
			select.innerHTML = ""; // Remove all children
		}
		if (select.getAttribute("data-populated") == "loading") {
			stuffs = get_choices(which, true, filter);
		} else {
			stuffs = get_choices(which, false, filter);
		}
		// If we got results, set "done", otherwise it must have started a csv xhr or cross table query, so set "loading"
		if (stuffs[0]) {
			select.setAttribute("data-populated", "done");
		} else {
			select.setAttribute("data-populated", "loading");
		}
		// remove the boolean from the beginning of get_choices's result
		stuffs = stuffs.slice(1);
		// give the list of choices to set and the element to put them on to the callback
		callback(stuffs, select);
		if (saved != null && saved != undefined && saved.toString().trim().length > 0) {
			if (changeElement(select, saved) == "failure") {
				if (select.getAttribute("data-data_populated") == "done") {
					// BAD HACK
					var col = select.getAttribute("data-dbcol")
					var newdata = screen_data(col);
					console.log("POPULATE CHOICES setting " + col + " to " + newdata + " because we couldn't restore it to saved")
					row_data[col] = newdata;
				}
			}
		}
	}
}
// This takes a prompt and tries to set the data on that prompt to to `newdata`
// Returns false if successful, or true if the prompt couldn't be set because
// it's still in the process of fetching choices from a csv or another table
var changeElement = function changeElement(elem, newdata) {
	// We know data-populated will be set because changeElement gets called in the database handling, which is
	// after the populate_choices calls in update()
	// If it's not populated yet, loop until it is.
	if (elem.getAttribute("data-populated") == "loading") {
		setTimeout(100, function(){
			changeElement(elem, newdata);
		});
		return true;
	}

	// If it's a text box, just set the value
	if (elem.tagName == "INPUT") {
		elem.value = newdata;
	} else if (elem.tagName == "SELECT") {
		// This handles regular old dropdown menus


		// fix for acknowledges
		if (typeof(newdata) == "boolean") {
			newdata = newdata.toString();
		}
		// trim the data
		if (newdata != null && typeof(newdata) == "string") {
			newdata = newdata.trim();
		}
		// we won't be able to find null in the options list
		if (newdata == null || newdata.length == 0) {
			return false;
		}
		// Get the list of options in the dropdown menu
		var options = elem.options;
		var index = -1;
		// Try and find the option in the dropdown menu where the option's value is what we're trying to set the dropdown menu to
		for (var i = 0; i < options.length; i++) {
			var val = options[i].value
			if (val != null) val = val.trim()
			if (val == newdata || (newdata == "1" && val == "true") || (newdata == "0" && val == "false")) {
				index = i;
				break;
			}
		}
		if (index == -1) {
			// !!! THIS IS BAD !!!
			console.log("Couldn't set selected option for " + elem.getAttribute("data-dbcol") + " - Tried to set it to " + newdata)
			return "failure"
		}
		// Set the selected option on the dropdown menu
		elem.selectedIndex = index;
	} else if (elem.classList.contains("select-multiple")) {
		// For select multiples, json parse what we're supposed to set the prompt to
		if (!newdata || newdata.length == 0) {
			newdata = [];
		} else {
			newdata = jsonParse(newdata);
			for (var k = 0; k < newdata.length; k++) {
				newdata[k] = newdata[k].trim();
			}
		}
		// then loop through the checkboxes and set checked to true if it's in newdata, false otherwise
		var children = elem.getElementsByTagName("input");
		for (var k = 0; k < children.length; k++) {
			if (newdata.indexOf(children[k].value.trim()) >= 0) {
				children[k].checked = true;
			} else {
				children[k].checked = false;
			}
		}
	} else if (elem.classList.contains("select-one") || elem.classList.contains("select-one-with-other")) {
		// For select one, select one with other, get all the radio buttons and if a radio button's value is equal to newdata, select it
		var children = elem.getElementsByTagName("input");
		var found = false;
		for (var k = 0; k < children.length; k++) {
			if (newdata == children[k].value) {
				children[k].checked = true;
				found = true;
			}
			if (newdata == null) { // if we're setting this field to null, uncheck everything
				children[k].checked = false;
			}
		}
		// If we didn't find any radio buttons to select and it's a select one with other, select the "Other: " radio button and set
		// the text box's value to newdata
		if (!found && elem.classList.contains("select-one-with-other") && newdata != null) {
			document.getElementById(elem.getAttribute("data-dbcol") + "_" + "_other" + "_tag").children[0].value = newdata;
			document.getElementById(elem.getAttribute("data-dbcol") + "_" + "_other").checked = true;
		}
	} else if (elem.classList.contains("date")) {
		// For dates, first extract the year month and date from newdata, then set the three subfields to that data in order
		var total = ["-1", "-1", "-1"]
		if (newdata != null) {
			total = newdata.split("-"); // total is now [YYYY, MM, DD plus some garbage]
		}
		total[2] = total[2].split("T")[0]; // should now be [YYYY, MM, DD]
		var fields = elem.getElementsByTagName("select");
		for (var i = 0; i < fields.length; i++) {
			total[i] = Number(total[i]).toString(); // "06" -> "6"
			var field = fields[i]; // the select element for day, month or year
			changeElement(field, total[i]);
		}
	} else {
		for (var i = 0; i < all_custom_prompt_types.length; i++) {
			if (elem.classList.contains(all_custom_prompt_types[i]) >= 0) {
				return !custom_prompt_types[all_custom_prompt_types[i]]["changeElement"](elem, newdata);
			}
		}
		alert("This shouldn't be possible, don't know how to update screen column " + elem.getAttribute("data-dbcol"));
	}
	// remember, false means success
	return false;
}
// helper function
var toArray = function toArray(i) {
	return Array.prototype.slice.call(i, 0);
}
// Makes and returns an intent that can be used to launch the given component
// package is usually the `survey` variable and activity is something like "org.opendatakit.survey.activities.GeoPointActivity" or something
var makeIntent = function makeIntent(package, activity, optional_dbcol) {
	var i = {action: "android.intent.action.MAIN", componentPackage: package, componentActivity: activity, extras: {tableId: table_id, instanceId: row_id}};
	//i.extras.uriFragmentNewFileBase: "opendatakit-macro(uriFragmentNewInstanceFile)";
	if (optional_dbcol != undefined && optional_dbcol != null) {
		// This will fail when making a new selection with a SQLiteError - android.database.sqlite.SQLiteConstraintException: column _data is not unique (code 19)
		// column _data is set to /storage/emulated/0/opendatakit/default/data/tables/:table_id/instances/:row_id/:db_col.jpg
		// so just pass a new uuid instead
		//i.extras["uriFragmentNewFileBase"] = optional_dbcol;
		i.extras["uriFragmentNewFileBase"] = newGuid();
	}
	return i;
}
// Helper function used by update() whenever something on the screen has changed and we should put row_data in the database
// Also sets savepoint type to incomplete
var updateOrInsert = function updateOrInsert() {
	var temp_row_data = row_data;
	for (var i = 0; i < hack_for_acknowledges.length; i++) {
		var col = hack_for_acknowledges[i];
		if (typeof(temp_row_data[col]) == "string") {
			temp_row_data[col] = temp_row_data[col].toUpperCase() == "TRUE" ? 1 : 0;
		}
	}
	if (!row_exists) {
		odkData.addRow(table_id, temp_row_data, row_id, function(d) {
			row_exists = true;
		}, function(d) {
			if (d.indexOf("ActionNotAuthorizedException") >= 0) {
				alert("ActionNotAuthorizedException")
			}
			if (d.indexOf("is already present in table") >= 0) {
				row_exists = true;
				updateOrInsert();
				return;
			}
			console.log("Unexpected error on ADD row");
			noop = d;
			if (!noop) noop = true;
		});
	} else {
		// acknowledges MUST go into the database as integer 1 or 0, don't ask me why
		// But we can't do that in screen_data/changeElement/row_data because survey stores it in the javascript as
		// true/false and that's what a bunch of constraints/validations/if statements expect
		odkData.updateRow(table_id, temp_row_data, row_id, function(){}, function() {
			alert(_t("Unexpected failure to save row"));
			console.log(arguments);
		});
	}
	// null -> will prompt to finish making changes on opening a tool
	// INCOMPLETE -> saved incomplete, can resume editing later but won't be sync'd (?)
	var setTo = "INCOMPLETE"
	// var setTo = null;
	// Escape the LIMIT 1
	odkData.arbitraryQuery(table_id, "UPDATE " + table_id + " SET _savepoint_type = ? WHERE _id = ?;--", [setTo, row_id], 1000, 0, function success_callback(d) {
		console.log("Set _savepoint_type to "+setTo+" successfully");
	}, function failure(d) {
		alert(_t("Error saving row: ") + d);
	});
}
var updateAllSelects = function updateAllSelects(with_filter_only) {

	populate_choices(document.getElementsByTagName("select"), function(stuffs, select) {
		for (var j = 0; j < stuffs.length; j++) {
			var elem = document.createElement("option")
			if (with_filter_only && !elem.hasAttribute("data-choice-filter")) continue;
			elem.setAttribute("value", stuffs[j][0]);
			elem.innerHTML = stuffs[j][1];
			select.appendChild(elem);
		}
	});
	// Helper function that takes a list of pairs and a prompt element, then adds radio buttons or
	// checkboxes (depending on the type) with labels to the given element
	var pop_choices_for_select_one = function(stuffs, select, type) {
		for (var j = 0; j < stuffs.length; j++) {
			var id = select.getAttribute("data-dbcol") + "_" + stuffs[j][0];
			var elem = document.createElement("div")
			if (with_filter_only && !elem.hasAttribute("data-choice-filter")) continue;
			//elem.style.width = "100%";
			elem.classList.add("option")
			var inner = document.createElement("input")
			inner.type = type;
			inner.setAttribute("value", stuffs[j][0]);
			inner.setAttribute("id", id);
			inner.setAttribute("name", select.getAttribute("data-dbcol"));
			inner.addEventListener("change", function() {update(0);});
			elem.appendChild(inner);
			var label = document.createElement("label");
			//var n = document.createElement("span");
			//n.style.width = "100%";
			//n.innerHTML = stuffs[j][1];
			//label.appendChild(n);
			label.innerHTML = stuffs[j][1]
			label.setAttribute("for", id);
			label.id = id + "_tag";
			elem.appendChild(label);
			//elem.appendChild(document.createElement("br"));
			select.appendChild(elem);
			//label.style.width = (elem.clientWidth - inner.clientWidth - 10).toString() + "px"
		}
	};
	// For select multiple, populate using checkboxes
	populate_choices(document.getElementsByClassName("select-multiple"), function(stuffs, select) {
		pop_choices_for_select_one(stuffs, select, "checkbox")
	});
	// For select one, populate using radio buttons
	populate_choices(document.getElementsByClassName("select-one"), function(stuffs, select) {
		pop_choices_for_select_one(stuffs, select, "radio");
	});
	// For select one with other, populate normally then add an extra _other value with the label set to an input element
	populate_choices(document.getElementsByClassName("select-one-with-other"), function(stuffs, select) {
		pop_choices_for_select_one(stuffs, select, "radio");
		var dbcol = select.getAttribute("data-dbcol")
		pop_choices_for_select_one([["_other", "<input type='text' name='"+dbcol+"' id='"+dbcol+"__other_tag' onblur='document.getElementById(\""+dbcol+"__other\").checked = true; update(0);' />"]], select, "radio");
	});
}

// This is the big function that expects to be called every time there's a change.
// First argument is a number to be added to global_screen_idx, and if it's not zero, it will redraw the screen with the new page and call update(0)
// It handles putting the results of doactions onto the screen, setting event listeners on input and select elements, assigns, translations
// populating choices for select one dropdown, select one, select one with other and select multiple prompts, putting data from the screen
// into row_data if it was changed and setting the prompt value on the screen to the value from row_data if it hasn't been populated yet,
// inserting or updating this row in the database if anything new was changed in row_data, screen validation and displaying translated validation failure
// messages, and displaying media that the user has selected
var update = function update(delta) {
	console.log("Update called " + delta);
	// If we failed to load the data from the database in the first place,
	if (noop) {
		var error = _t("An error occurred while loading the page. ");
		if (noop !== true) {
			error = error.concat(noop);
		}
		document.getElementById("odk-container").innerHTML = error;
		return;
	}
	// DOACTION RESULT LOGIC
	var num_updated = 0;
	while (true) {
		var a = odkCommon.viewFirstQueuedAction();
		if (a == null) {
			break;
		} else {
			console.log(a);
			console.log(a.jsonValue);
			console.log(a.jsonValue.result);
			var s = a["dispatchStruct"];
			if (s != undefined && s != null && s.type != undefined) {
				if (s.type == "geopoint") {
					// geopoint prompts are actually four seperate prompts, one :dbcol_:suffix for each suffix
					if (a.jsonValue.status == 0) {
						alert(_t("Error, location providers are disabled.")) // (or the action was cancelled)
					} else {
						var suffixes = ["latitude", "longitude", "altitude", "accuracy"];
						// update the screen data for each suffix with the results of the action
						for (var i = 0; i < suffixes.length; i++) {
							var suffix = suffixes[i];
							var gsp_result = get_screen_prompt(s.dbcol + "_" + suffix)
							// If the prompt is on the screen, set the prompt to the result, and we will notice
							// that it was changed and put the new value in row_data later in this function
							// Otherwise, put it in row_data and remind us we need to call updateOrInsert
							if (gsp_result[0]) {
								changeElement(gsp_result[1], a.jsonValue.result[suffix]);
							} else {
								row_data[s.dbcol + "_" + suffix] = a.jsonValue.result[suffix];
								num_updated++; // let it know we have at least one changed cell to update into the database
							}
						}
					}
				} else if (s.type == "image") {
					// image prompts are actually two seperate prompts, one :dbcol_:suffix for each suffix
					if (a.jsonValue.status == 0) {
						// cancelled
					} else if (a.jsonValue.result != undefined) {
						var suffixes = ["uriFragment", "contentType"];
						for (var i = 0; i < suffixes.length; i++) {
							var suffix = suffixes[i];
							if (a.jsonValue.result[suffix] == undefined) continue;
							var gsp_result = get_screen_prompt(s.dbcol + "_" + suffix);
							// If the prompt is on the screen, set the prompt to the result, and we will notice
							// that it was changed and put the new value in row_data later in this function
							// Otherwise, put it in row_data and remind us we need to call updateOrInsert
							if (gsp_result[0]) {
								changeElement(gsp_result[1], a.jsonValue.result[suffix]);
							} else {
								row_data[s.dbcol + "_" + suffix] = a.jsonValue.result[suffix];
								num_updated++; // let it know we have at least one changed cell to update into the database
							}
						}
					} else {
						console.log("No result in result object!");
					}
				} else if (s.type == "barcode") { // TOTALLY UNTESTED
					if (a.jsonValue.status == 0) {
						// cancelled
					} else if (a.jsonValue.result != undefined) {
						var suffixes = ["uriFragment", "contentType"];
						var gsp_result = get_screen_prompt(s.dbcol);
						if (gsp_result[0]) {
							changeElement(gsp_result[1], a.jsonValue.result.SCAN_RESULT_BYTES);
						} else {
							row_data[s.dbcol] = a.jsonValue.result.SCAN_RESULT_BYTES;
						}
					} else {
						console.log("No result in result object!");
					}
				} else {
					alert(_t("Unknown type in dispatch struct!"));
				}
			}
			odkCommon.removeFirstQueuedAction();
		}
	}
	// EVENT LISTENER LOGIC
	// Set an onblur event listener on all selects, and an onchange event listener for all dropdown menus
	var elems = toArray(document.getElementsByTagName("select")).concat(toArray(document.getElementsByTagName("input")));
	for (var i = 0; i < elems.length; i++) {
		if (elems[i].getAttribute("data-has_event_listener") == "1") {
			continue;
		}
		var listener = function() {setTimeout(function(){update(0);},0);};
		elems[i].addEventListener("blur", listener);
		if (elems[i].tagName == "SELECT") {
			elems[i].addEventListener("change", listener);
		}
		elems[i].setAttribute("data-has_event_listener", "1");
	}

	// ASSIGNS LOGIC
	// If an assign hasn't been put in the database yet, eval it and put that in,
	// then remind ourselves that we need to call updateOrInsert later
	var elems = document.getElementsByClassName("assign");
	var data = _data_wrapper;
	for (var i = 0; i < elems.length; i++) {
		var elem = elems[i];
		var col = elem.getAttribute("data-dbcol");
		// the "data-calculation" attribute holds a key to a string in `tokens` that we can eval to get the result
		try {
			var new_value = eval(tokens[elem.getAttribute("data-calculation")]).toString();
			row_data[col] = new_value;
		} catch (e) {
			if (e != -1) {
				//noop = e
			}
		}
		// If it's on the screen, let us update it from row_data later
		var gsp_result = get_screen_prompt(col);
		if (gsp_result[0]) {
			gsp_result[1].setAttribute("data-data_populated", "");
		}
		num_updated++;
	}

	// TRANSLATION LOGIC
	// First, iterate through anything with a `data-placeholder` attribute set, pull the real placeholder from
	// tokens using the value of `data-placeholder` translate it and set it as the regular old `placeholder` attribute
	// then clear the `data-placeholder` attribute so we don't hit it twice
	var elems = document.getElementsByTagName("input");
	for (var i = 0; i < elems.length; i++) {
		if (elems[i].getAttribute("data-placeholder") != undefined && elems[i].getAttribute("data-placeholder").length > 0) {
			elems[i].setAttribute("placeholder", display(tokens[elems[i].getAttribute("data-placeholder")], table_id));
			elems[i].setAttribute("data-placeholder", "");
		}
	}
	// First, iterate through anything with a class name of `translate` set, pull the real string from
	// tokens using the innerText, translate it and set it as the outer html (translation tokens can contain html)
	// when we set outerHTML it removes the "translate" class
	var elems = document.getElementsByClassName("translate");
	// IMPORTANT - DO NOT INLINE `len`, as `elems.length` will shrink by one on every iteration
	var len = elems.length;
	for (var i = 0; i < len; i++) {
		var text = tokens[elems[0].innerText];
		try {
			// YES elems[0] NOT elems[i]
			elems[0].outerHTML = display(text, table_id);
		} catch (e) {
			console.log(e)
			elems[0].outerHTML = _t("Error translating ") + JSON.stringify(text);
		}
	}
	var elems = document.getElementsByClassName("formgen-specific-translate");
	var len = elems.length;
	for (var i = 0; i < len; i++) {
		var text = elems[0].innerText;
		try {
			// YES elems[0] NOT elems[i]
			elems[0].outerHTML = _t(text);
		} catch (e) {
			console.log(e)
			elems[0].outerHTML = _t("Error translating ") + JSON.stringify(text);
		}
	}

	// SET UP SELECT ONE, SELECT MULTIPLE AVAILABLE CHOICES LOGIC
	updateAllSelects(false);

	// DATA UPDATE LOGIC
	// Scrapes all prompts on the screen, compares the result of screen_data(dbcol) against row_data[dbcol] for that prompt,
	// and if they differ, and the data is entirely populated, then update row_data to match and set num_changed so we know we
	// have to call updateOrInsert
	// If the data wasn't already populated (we've just changed screens and we need to load the value for this from the database)
	// then we put it in to_set, and then we loop through to_set and change the screen data to match the data in row_data
	var to_set = [];
	var elems = document.getElementsByClassName("prompt");
	for (var i = 0; i < elems.length; i++) {
		var elem = elems[i];
		var col = elem.getAttribute("data-dbcol");
		if (elem.getAttribute("data-populated") == "loading") {
			// if it's a select one or select multiple, and it doesn't have any choices yet, don't touch it
			continue;
		} else if (elem.getAttribute("data-data_populated") == "done") {
			var newdata = screen_data(col);
			if (newdata != null) {
				newdata = newdata.toString();
			}
			if (row_data[col] != newdata) {
				num_updated++;
				// update row_data to match what's on the screen
				row_data[col] = newdata;
				console.log("Updating database value for " + col + " to screen value " + row_data[col]);
			}
		} else {
			to_set = to_set.concat(col);
		}
	}
	if (to_set.length > 0) {
		console.log("Need to set screen data for " + to_set.join(", "))
		var elems = document.getElementsByClassName("prompt");
		for (var j = 0; j < elems.length; j++) {
			var elem = elems[j];
			if (to_set.indexOf(elem.getAttribute("data-dbcol")) >= 0) {
				col = elem.getAttribute("data-dbcol");
				if (typeof(row_data[col]) == "boolean") {
					// this fixes acknowledges, otherwise we would changeElement to true (boolean) then screen_data would return true (string)
					row_data[col] = row_data[col].toString();
				}
				var saved_value = row_data[col];
				if (hack_for_acknowledges.indexOf(col) >= 0) {
					saved_value = (saved_value == null || saved_value == undefined || saved_value == false || saved_value == 0) ? "false" : "true";
				}
				console.log("Updating " + col + " to saved value " + saved_value);
				var loading = changeElement(elem, saved_value);
				var sdat = screen_data(col);
				if (loading == "failure" || (saved_value !== null && sdat != saved_value && loading !== true)) {
					// This can happen when the database says a select one should be set to "M55" or something, but that's not one of the possible options.
					var message = "Unexpected failure to set screen value of " + col + ". Tried to set it to " + saved_value + " ("+typeof(saved_value)+") but it came out as " + sdat + " ("+typeof(sdat)+")";
					// noop = message;
					console.log(message);
					row_data[col] = sdat;
				} else {
					if (loading === false) {
						// Since the choice filters of other prompts might depend on the value of this prompt, update all the prompts with choice filters
						// Except for some reason updateAllSelects(true) doesn't work, but this does
						console.log("Updating all selects after successful set of " + col)
						updateAllSelects(false);
						elem.setAttribute("data-data_populated", "done");
					}
				}
			}
		}
		// If we changed something (like region level 1), we might need to cascade those changes to other things with query filters (like admin region)
		// Otherwise we might end up with admin region having data-populated=loading and data-data_populated totally unset
	}


	// VALIDATION LOGIC
	// A field can be invalid if it's required and empty, if it's supposed to be a number but it's not a valid number, or if
	// a user defined rule from the xlsx returns false. The user defined rules are often like "data('age') > 18", and they get evaled
	// `valid` is set to false if ANY of the prompts are invalid
	var valid = true
	// Remove all constraint warning messages, we're about to re-add them
	var elems = document.getElementsByClassName("constraint-message");
	for (var i = 0; i < elems.length; i++) {
		elems[i].outerHTML = ""; // remove the element
	}
	// Check validation for each prompt
	var elems = document.getElementsByClassName("prompt");
	for (var i = 0; i < elems.length; i++) {
		var this_valid = true;
		var col = elems[i].getAttribute("data-dbcol");
		if (elems[i].getAttribute("data-validate") == "double" || elems[i].getAttribute("data-validate") == "integer") {
			// This code can handle both doubles and ints because validity.valid's behavior depends on step, which defaults
			// to 1 but we set it to any for doubles
			var num = Number(elems[i].value);
			if (isNaN(num) || !elems[i].validity.valid) {
				this_valid = false;
			}
		} else {
			// if it's not a custom prompt type, it'll just default to true
			for (var j = 0; j < all_custom_prompt_types.length; j++) {
				if (elems[i].classList.contains(all_custom_prompt_types[j]) >= 0) {
					this_valid = custom_prompt_types[all_custom_prompt_types[j]]["validate"](elems[i]);
					break;
				}
			}
		}
		// Checks if the field is required
		var required = elems[i].getAttribute("data-required");
		if (required != null && eval(tokens[required])) {
			elems[i].placeholder = _t("Required field")
			var entered = screen_data(col);
			if (entered == null || entered.length == 0) {
				this_valid = false;
			}
		}
		// Handles evaling the user defined constraints
		if (elems[i].getAttribute("data-constraint") != null) {
			if (!eval(tokens[elems[i].getAttribute("data-constraint")])) {
				this_valid = false;
			}
		}
		// If this prompt is invalid, set valid to false, display a warning message if there is one, and make it red so the user notices
		if (!this_valid) {
			valid = false;
			elems[i].style.backgroundColor = "pink";
			if (elems[i].getAttribute("data-constraint_message") != null) {
				var message = document.createElement("div");
				message.classList.add("constraint-message");
				// constraint messages can contain html
				message.innerHTML = display(tokens[elems[i].getAttribute("data-constraint_message")], table_id);
				elems[i].parentNode.insertBefore(message, elems[i].nextSibling);
			}
		} else {
			elems[i].style.backgroundColor = ""; // Default
		}
	}
	// If the row was invalid, trap the user on the current screen
	if (!valid) {
		document.getElementById("next").disabled = true;
		document.getElementById("back").disabled = true;
		document.getElementById("finalize").disabled = true;
		delta = 0;
	}

	// DATABASE UPDATE
	// If the screen is valid and we changed something in row_data, updateOrInsert()
	if (num_updated > 0 && valid) {
		updateOrInsert()
	}

	// If statements may be run more than once, so let's cache their results in this validates object
	var validates = {}
	// For each of the if statements, eval it then set the display style on it if applicable
	var spans = document.getElementsByClassName("validate");
	for (var i = 0; i < spans.length; i++) {
		var rule = spans[i].getAttribute("data-validate-rule");
		if (validates[rule] == undefined) {
			validates[rule] = eval(tokens[rule]);
		}
		if (validates[rule]) {
			spans[i].style.display = "block";
		} else {
			spans[i].style.display = "none";
		}
	}

	// Displays media
	// For each "image" prompt, which includes image, video and audio prompt types, find that element on the
	// screen and if there is a uri fragment for that image in row_data, then set the source to that fragment
	var elems = document.getElementsByClassName("image");
	for (var i = 0; i < elems.length; i++) {
		var elem = elems[i];
		var source_col = elem.getAttribute("data-dbcol") + "_uriFragment";
		if (row_data[source_col] == null || row_data[source_col] == undefined || row_data[source_col].trim().length == 0) {
			// don't bother setting it if there's no source to set
			continue;
		}
		var newsrc = odkCommon.getRowFileAsUrl(table_id, row_id, data(source_col));
		var type = data(elem.getAttribute("data-dbcol") + "_contentType")
		if (elem.src != newsrc) {
			if (elem.classList.contains("audio") || elem.classList.contains("video")) {
				elem.innerHTML = "";
				var newsource = document.createElement("source");
				newsource.src = newsrc;
				newsource.type = type;
				elem.appendChild(newsource);
				elem.controls = "controls"
			} else {
				elem.src = newsrc;
			}
			elem.style.display = "block";
		}
	}

	// Display graphs
	var elems = document.getElementsByClassName("graph")
	for (var i = 0; i < elems.length; i++) {
		var elem = elems[i];
		if (elem.getAttribute("data-src_set") == "done" && num_updated == 0) continue
		var x_value = data(elem.getAttribute("data-x_value"))
		var y_value = data(elem.getAttribute("data-y_value"))
		var label = tokens[elem.getAttribute("data-legend_text")]
		var type = elem.getAttribute("data-type")
		var type = type == "linegraph" ? "line" : (type == "bargraph" ? "bar" : "pie")
		var query = elem.getAttribute("data-query")
		var choices = get_choices(query, false, null, true);
		if (choices[0] !== false) {
			choices = choices.slice(1)
			var raw = "SELECT CAST(? AS TEXT), CAST(? AS TEXT) "
			var args = [x_value, y_value]
			for (var j = 0; j < choices.length; j++) {
				var choice = choices[j][1];
				raw = raw.concat(" UNION ALL SELECT CAST(? AS TEXT), CAST(? AS TEXT) ")
				console.log(choice)
				args = args.concat(choice["x"])
				args = args.concat(choice["y"])
			}
			var columns = ['__formgen_raw', '__formgen_raw']
			var table = table_id;
			var src = "../graph_iframe.html#" + type + "/" + table + "/" + JSON.stringify(columns) + "/" + raw + "/" + JSON.stringify(args) + "/" + label;
			var loaded = !(elem.src == null || elem.src == undefined || elem.src.trim().length == 0)
			if (loaded) {
				graph_loaded(elem, raw, args)
			} else {
				(function(elem, raw, args) {
					var this_run = false;
					elem.addEventListener("load", function() {
						if (this_run) return;
						this_run = true;
						graph_loaded(elem, raw, args);
					});
				})(elem, raw, args);
			}
			elem.src = src;
			elem.setAttribute("data-src_set", "done");
		}
	}

	// ENABLE/DISABLE NEXT/BACK/FINALIZE BUTTON LOGIC
	if (!valid) return; // buttons have already been disabled
	// Update global_screen_idx to prepare to change the data on the screen to it
	global_screen_idx += delta;
	odkCommon.setSessionVariable(table_id + ":" + row_id + ":global_screen_idx", global_screen_idx);
	// If we're at the beginning, disable the back button, otherwise enable it
	if (global_screen_idx <= 0) {
		global_screen_idx = 0;
		document.getElementById("back").disabled = true;
	} else {
		document.getElementById("back").disabled = false;
	}
	if (global_screen_idx >= screens.length - 1) {
		// If we're at the end of the survey, disable the next button and show the finalize button
		global_screen_idx = screens.length - 1;
		document.getElementById("next").disabled = true;
		document.getElementById("next").style.display = "none";
		document.getElementById("finalize").style.display = "block";
		document.getElementById("finalize").disabled = false;
	} else {
		// Otherwise, enable the next button and hide the finalize button
		document.getElementById("finalize").style.display = "none";
		document.getElementById("next").disabled = false;
		document.getElementById("next").style.display = "block";
	}
	// If we're actually switching to a new screen, change the html on the page
	if (delta != 0) {
		var container = document.getElementById("odk-container");
		container.innerHTML = screens[global_screen_idx];
		update(0);
	}
}
// Helper function to determine if the screen has a particular prompt or not, and if so, return it as a dom element
var get_screen_prompt = function get_screen_prompt(id) {
	var elems = document.getElementsByClassName("prompt");
	for (var i = 0; i < elems.length; i++) {
		if (elems[i].getAttribute("data-dbcol") == id) {
			return [true, elems[i]];
		}
	}
	return [false, null];
}
// Function to insert the row into the database one last time (does that by calling update()), then sets savepoint type to complete and finishes
var finalize = function finalize() {
	update(0);
	// Make sure all required fields were provided
	for (var i = 0; i < requireds.length; i++) {
		var column = requireds[i][0];
		var js = requireds[i][1];
		if ((data(column) == null || data(column) == undefined || (typeof(data(column)) == "string" && data(column).trim().length == 0)) && eval(tokens[js])) {
			alert(_t("Column ? is required but no value was provided").replace("?", column))
			return;
		}
	}
	odkCommon.setSessionVariable(table_id + ":" + row_id + ":global_screen_idx", 0);
	// Escape the LIMIT 1
	odkData.arbitraryQuery(table_id, "UPDATE " + table_id + " SET _savepoint_type = ? WHERE _id = ?;--", ["COMPLETE", row_id], 1000, 0, function success_callback(d) {
		console.log("Set _savepoint_type to COMPLETE successfully");
		page_back();
	}, function failure(d) {
		// TODO
		alert(d);
		if (d) {
			noop = d
		} else {
			noop = true
		}
	});
};
// Cancels the add and deletes the intermediate row, asks for confirmation if we've already inserted data but if they didn't type anything yet, it doesn't
var cancel = function cancel() {
	if (!opened_for_edit) {
		if (row_exists) {
			if (confirm(_t("Are you sure? All entered data will be deleted."))) {
				odkData.deleteRow(table_id, null, row_id, function() {
					page_back();
				}, function(err) {
					alert(_t("Unexpected error deleting row: ") + JSON.stringify(err));
					page_back();
				})
			}
		} else {
			page_back();
		}
	} else {
		page_back();
	}
}
// Simple wrapper for odkCommon.doAction that shows a warning if the doAction fails.
var doAction = function doAction(dStruct, act, intent) {
	var result = odkCommon.doAction(dStruct, act, intent);
	if (result == "OK" || result == "IGNORED") {
		return;
	}
	alert(_t("Error launching ") + act + ": " + result);
}
// Function that runs on page load, sets up some initial choices, gets the row id from the uri, determines if the row
// we're editing exists or not and sets up opened_for_edit and row_exists based on that, 
var ol = function onLoad() {
	document.getElementById("next").innerText = _t("Next");
	document.getElementById("back").innerText = _t("Back");
	document.getElementById("finalize").innerText = _t("Finalize");
	if (has_dates) {
		// won't be localized, so we can set display to i instead of {text: i}
		for (var i = 1; i <= 31; i++) {
			choices = choices.concat({choice_list_name: "_day", data_value: i.toString(), display: i.toString(), notranslate: true})
		}
		for (var i = 1; i <= 12; i++) {
			choices = choices.concat({choice_list_name: "_month", data_value: i.toString(), display: i.toString(), notranslate: true})
		}
		for (var i = 2020; i >= 1940; i--) {
			choices = choices.concat({choice_list_name: "_year", data_value: i.toString(), display: i.toString(), notranslate: true})
		}
	}
	choices = choices.concat({"choice_list_name": "_yesno", "data_value": "false", "display": {"text": _t("no")}});
	choices = choices.concat({"choice_list_name": "_yesno", "data_value": "true", "display": {"text": _t("yes")}});
	// Get the row id from the url, or makes a new id if it can't get it
	row_id = window.location.hash.substr(1);
	if (row_id.length == 0) {
		row_id = newGuid();
		alert("No row id in uri, beginning new instance with id " + row_id);
		opened_for_edit = false;
	}
	// Try to load global_screen_idx from a session variable, but default to zero (we will subtract one later)
	global_screen_idx = Number(odkCommon.getSessionVariable(table_id + ":" + row_id + ":global_screen_idx"));
	if (isNaN(global_screen_idx)) {
		global_screen_idx = 0;
	}
	// Set to default to -1 so we can update(1) to force displaying of the screen at index 0, whereas
	// if we just started it at zero and called update(0) it wouldn't change the current screen data
	global_screen_idx -= 1;
	// Get row data
	odkData.getRows(table_id, row_id, function success(d) {
		try {
			// Try to load all rows from the result object into row_data if we're editing a row
			var cols = d.getColumns();
			var generator = function(i) { return d.getData(0, cols[i]); };
			if (d.getCount() == 0) {
				row_exists = false;
				opened_for_edit = false;
				generator = function(i) { return null; };
			} else {
				row_exists = true;
				opened_for_edit = true;
			}
			for (var i = 0; i < cols.length; i++) {
				// Do not load columns that start with underscores
				if (cols[i][0] != "_") {
					row_data[cols[i]] = generator(i);
				}
			}
			// Change the text in the cancel button based on whether we're adding or editing a row
			var cancel = document.getElementById('cancel');
			if (opened_for_edit) {
				cancel.innerText = _t("Save incomplete");
			} else {
				cancel.innerText = _t("Cancel and delete row")
			}
			cancel.disabled = false;
			//console.log(row_data);
			noop = false;
		} catch (e) {
			noop = e.toString();
		}
		// Actually display the stuff on the screen
		update(1);
		// TODO left off here
		odkCommon.registerListener(function doaction_listener() {
			var a = odkCommon.viewFirstQueuedAction();
			if (a != null) {
				update(0);
			}
		});
	}, function failure(d) {
		console.log(d);
		noop = d;
		if (!d) noop = true;
		update(1); // Display the error
	});
};

var graph_loaded = function graph_loaded(elem, raw, args) {
	odkData.arbitraryQuery(table_id, raw, args, 10000, 0, elem.contentWindow.success, function failure(e) {
		alert(_t("Unexpected failure") + " " + e);
	});
}
