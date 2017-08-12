
// A map of table ids to their instance columns (or _id if we couldn't pull it)
var display_cols = {"household_member": "name", "femaleClients": "_id", "maleClients": "_id", "exampleForm": "name", "Ethiopia_members": "name", "Tea_types": "Name", "plot": "plot_name", "Tea_inventory": "_id", "geopoints": "_id", "datesTest": "test", "selects": "_id", "visit": "_id", "Ethiopia_household": "household_id", "Tea_houses": "Name"}
// List of tables to edit with formgen. If a table isn't found in this list, we edit it with survey instead
var allowed_tables = ["household_member", "femaleClients", "maleClients", "exampleForm", "Ethiopia_members", "Tea_types", "plot", "Tea_inventory", "geopoints", "datesTest", "selects", "Ethiopia_household", "Tea_houses"];
var customJsOl = function customJsOl() {
	
	var br = function(col, extra) {
		return function(e, c, d) { return "<b>" + col + "</b>: " + c + (extra ? extra : "<br />"); };
	}
	var check = function(col, accepting, type) {
		if (accepting === undefined) {
			accepting = function(e, c, d) {
				return c.toUpperCase() == "YES";
			}
		}
		if (type === undefined) type = "checkbox"
		return function(e, c, d) {
			return "<input disabled type='"+type+"' " + (accepting(e, c, d) ? "checked=checked" : "") + " /><b>" + col + "</b>";
		};
	}
	var selected = function(a, b) {
		if (a == null) return false;
		if (a[0] == "[") {
			return jsonParse(a).indexOf(b) >= 0;
		}
		return a.toUpperCase() == b.toUpperCase();
	}

	main_col = "date";
	table_id = "visit";
	global_which_cols_to_select = "visit.*, plot.plot_name AS plot_name"
	global_join = "plot ON plot._id = visit.plot_id"
	colmap = [
		{"column": "date", "callback": function(e, c, d) { return "Visit on " + c.split("T")[0]; }},
		{"column": "plot_name"},
		{"column": "plant_height", "callback": br("Plant height", "cm")},
		{"column": "plant_health", "callback": function(e, c, d) {
			var retVal = "<b>Plant Health</b>:<br />";
			retVal += check("Good", function(e, c, d) { return selected(c, "good"); }, "radio")(e, c, d) + "<br />";
			retVal += check("Fair", function(e, c, d) { return selected(c, "fair"); }, "radio")(e, c, d) + "<br />";
			retVal += check("Bad", function(e, c, d) { return selected(c, "bad"); }, "radio")(e, c, d);
			return retVal;
		}},
		{"column": "soil", "callback": function(e, c, d) {
			var retVal = "<b>Soil</b>: <br />";
			retVal += check("Medium Sand", function(e, c, d) { return selected(c, "medium_sand"); }, "radio")(e, c, d) + "<br />";
			retVal += check("Fine Sand", function(e, c, d) { return selected(c, "fine_sand"); }, "radio")(e, c, d) + "<br />";
			retVal += check("Sandy Loam", function(e, c, d) { return selected(c, "sandy_loam"); }, "radio")(e, c, d) + "<br />";
			retVal += check("Loam", function(e, c, d) { return selected(c, "loam"); }, "radio")(e, c, d);
			return retVal;
		}},
		{"column": "pests", "callback": function(e, c, d) {
			var retVal = "<b>Pests</b>: <br />"
			retVal += check("Earworm", function(e, c, d) { return selected(c, "earworm"); })(e, c, d) + "<br />";
			retVal += check("Stink Bug", function(e, c, d) { return selected(c, "stink_bug"); })(e, c, d) + "<br />";
			retVal += check("Beetle", function(e, c, d) { return selected(c, "beetle"); })(e, c, d) + "<br />";
			retVal += check("Cutworm", function(e, c, d) { return selected(c, "cutworm"); })(e, c, d) + "<br />";
			retVal += "<h3>Observations: </h3>"
			return retVal;
		}},
		{"column": "observations", "callback": function(e, c, d) { return c; }}
	]

}
