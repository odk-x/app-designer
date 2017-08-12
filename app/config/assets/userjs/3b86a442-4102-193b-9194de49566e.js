
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


	main_col = "Name";
	table_id = "Tea_types";
	colmap = [
		["Name", function(e, c, d) { return c }],
		["Origin", br("Origin", "<br /><br />Details:")],
		["Caffeinated", check("Caffeinated")],
		["Fermented", check("Fermented")],
	]
	colmap = [
		{"column": "Name", "callback": function(e, c, d) { return c; }},
		{"column": "Origin", "callback": br("Origin", "<br /><br />Details:")},
		{"column": "Caffeinated", "callback": check("Caffeinated")},
		{"column": "Fermented", "callback": check("Fermented")}
	]


}
