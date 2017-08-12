
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


	main_col = "tiName";
	table_id = "Tea_inventory";
	global_join = "Tea_houses ON Tea_houses._id = Tea_inventory.House_id JOIN Tea_types ON Tea_types._id = Tea_inventory.Type_id"
	global_which_cols_to_select = "*, Tea_types.Name AS ttName, Tea_houses.Name AS thName, Tea_inventory.Name AS tiName"
	colmap = [
		["tiName", function(e, c, d) { return c }],
		["ttName", "Type: "],
		["Price_8oz", "8oz: "],
		["Price_12oz", "12oz: "],
		["Price_16oz", function(e, c, d) { return "<b>16oz</b>: " + c + "<br /><br /><b>Offered</b>:" }],
		["Iced", check("Iced")],
		["Hot", check("Hot")],
		["Loose_Leaf", check("Loose Leaf")],
		["Bags", check("Bags")],
	]
	colmap = [
		{"column": "tiName", "callback": function(e, c, d) { return c; }},
		{"column": "ttName", "display_name": "Type: "},
		{"column": "Price_8oz", "display_name": "8oz: "},
		{"column": "Price_12oz", "display_name": "12oz: "},
		{"column": "Price_16oz", "callback": function(e, c, d) { return "<b>16oz</b>: " + c + "<br /><br /><b>Offered</b>:"; }},
		{"column": "Iced", "callback": check("Iced")},
		{"column": "Hot", "callback": check("Hot")},
		{"column": "Loose_Leaf", "callback": check("Loose Leaf")},
		{"column": "Bags", "callback": check("Bags")}
	]

}
