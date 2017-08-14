
// If you set a display_col, that column will be shown in the large text for each row item.
// If you don't set one, we'll try and use the table id to pull it from this variable, which stores the
// instance column for each table or _id if it couldn't be found.
var display_cols = {"household_member": "name", "femaleClients": "_id", "maleClients": "_id", "exampleForm": "name", "Ethiopia_members": "name", "Tea_types": "Name", "plot": "plot_name", "Tea_inventory": "_id", "geopoints": "_id", "datesTest": "test", "selects": "_id", "visit": "_id", "Ethiopia_household": "household_id", "Tea_houses": "Name"}
// List of tables we can add/edit with formgen, if the table isn't found in this list, we'll use survey
var allowed_tables = ["household_member", "femaleClients", "maleClients", "exampleForm", "Ethiopia_members", "Tea_types", "plot", "Tea_inventory", "geopoints", "datesTest", "selects", "Ethiopia_household", "Tea_houses"]
// A map of table ids to tokens that can be used to localize their display name
var display_col_wrapper = null;
var clicked = function(table_id, row_id) {
	odkTables.openDetailView({}, table_id, row_id);
}
var customJsOl = function customJsOl() {
	
	display_col = "client_id";
	global_join = "femaleClients ON femaleClients.client_id = geopoints.client_id"
	global_which_cols_to_select = "geopoints.*"
	var transpo = function(e, c, d, i) {
		if (c == null) c = d.getData(i, "transportation_mode_other");
		return "Transportation: " + c;
	}
	display_subcol = [["Step: ", "step", true], [transpo, "transportation_mode", true]];
	display_subcol = [
		{"column": "step", "display_name": "Step: ", "newline": true},
		{"column": "transportation_mode", "callback": transpo, "newline": true}
	]
	table_id = "geopoints";

	var add = document.createElement("button");
	add.style.display = "block";
	add.style.width = "70%";
	add.innerText = "Add Waypoint";
	add.addEventListener("click", function() {
		alert("TODO"); // CACHED_D DOESN'T EXIST THIS IS A LIST VIEW
		var id = newGuid();
		odkData.addRow("geopoints", {"client_id": cached_d.getData(0, "client_id"), "_id": id})
		odkTables.launchHTML(null, "config/assets/formgen/geopoints/index.html#" + id);
	});
	var map = document.createElement("button");
	map.style.display = "block";
	map.style.width = "70%";
	map.innerText = "Map View";
	map.addEventListener("click", function() {
		alert("TODO");
		odkTables.openTableToMapView(null, global_where_clause, [global_where_arg], clean_href() + "#" + table_id + "/" + global_where_clause + "/" + global_where_arg);
	});
	document.insertBefore(map, document.getElementById("list"));
	document.insertBefore(add, document.getElementById("list"));

}
var customJsSearch = function customJsSearch() {
	
}


var embedded = false;
var forMapView = false;
