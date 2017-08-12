
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
	
	var extras_cb = function extras_cb(e, c, d, i) {
		var caffeinated = d.getData(i, "Caffeinated").toUpperCase() == "YES"
		var fermented = d.getData(i, "Fermented").toUpperCase() == "YES"
		var extras = []
		if (caffeinated) extras = extras.concat("Caffeinated");
		if (fermented) extras = extras.concat("Fermented");
		return extras.join(", ");
	}
	display_subcol = [["Origin: ", "Origin", true], [extras_cb, "_id", true]];

	display_subcol = [
		{"column": "Origin", "display_name": "Origin: ", "newline": true},
		{"column": "_id", "callback": extras_cb, "newline": true}
	]
	display_col = "Name";
	table_id = "Tea_types";
	allowed_group_bys = [
		{"column": "Origin"},
		{"column": "Caffeinated"},
		{"column": "Fermented"}
	]

}
var customJsSearch = function customJsSearch() {
	
}


var embedded = false;
var forMapView = false;
