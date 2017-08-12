
// A map of table ids to their instance columns (or _id if we couldn't pull it)
var display_cols = {"household_member": "name", "femaleClients": "_id", "maleClients": "_id", "exampleForm": "name", "Ethiopia_members": "name", "Tea_types": "Name", "plot": "plot_name", "Tea_inventory": "_id", "geopoints": "_id", "datesTest": "test", "selects": "_id", "visit": "_id", "Ethiopia_household": "household_id", "Tea_houses": "Name"}
// List of tables to edit with formgen. If a table isn't found in this list, we edit it with survey instead
var allowed_tables = ["household_member", "femaleClients", "maleClients", "exampleForm", "Ethiopia_members", "Tea_types", "plot", "Tea_inventory", "geopoints", "datesTest", "selects", "Ethiopia_household", "Tea_houses"];
var customJsOl = function customJsOl() {
	
	main_col = "client_id";
	table_id = "geopoints";
	colmap = [
		{"column": "client_id", "callback": function(e, c, d) { return c; }},
		{"column": "transportation_mode", "callback": function(e, c, d) {
			if (c == null) c = d.getData(0, "transportation_mode_other")
			return "MODE OF TRANSPORTATION: " + c;
		}},
		{"column": "description", "display_name": "DESCRIPTION"},
		{"column": "coordinates_latitude", "callback": function(e, c, d) {
		 	return "COORDINATES: " + c + " " + d.getData(0, "coordinates_longitude");
		}}
	]
	var newinstance = function(table, form) {
		if (form == table) form = "index";
		odkTables.launchHTML(null, "config/assets/formgen/" + table + "/" + form + ".html#" + newGuid());
	};
	var homeLocator = function homeLocator() {
		var where = "client_id = ?"
		var args = [cached_d.getData(0, "client_id")]
		odkTables.openTableToListView(null, "geopoints", where, args, "config/assets/geopoints_list.html#geopoints/" + where + "/" + args[0]);
	}

}
