
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
	
	var cb = function(elem, bird, d, i) {
		if (bird == null || bird == undefined || bird.trim().length == 0) return "Didn't see anything";
		var color = d.getData(i, "color");
		var n = ""
		if ("aeiou".indexOf(color[0].toLowerCase()) >= 0) n = "n"
		return "Saw a" + n + " " + color + " " + bird;
	}
	display_subcol = [[cb, "bird", true]];
	display_subcol = [{"column": "bird", "callback": cb, "newline": true}]
	display_col = "user_name"
	table_id = "selects";

}
var customJsSearch = function customJsSearch() {
	
}


var embedded = false;
var forMapView = false;
