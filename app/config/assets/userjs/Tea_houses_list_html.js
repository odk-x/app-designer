
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
	
	clicked = function clicked(table_id, row_id) {
		odkTables.openDetailWithListView(null, table_id, row_id, "config/assets/Tea_houses_detail.html");
	}
	global_join = "Tea_types ON Tea_types._id = Tea_houses.Specialty_Type_id"
	global_which_cols_to_select = "*, Tea_types.Name AS ttName, Tea_houses.Name AS thName"
	display_subcol = [["Specialty: ", "ttName", true], ["", "District", false], [", ", "Neighborhood", true]];

	display_subcol = [
		{"column": "ttName", "display_name": "Specialty: ", "newline": true},
		{"column": "District", "newline": false},
		{"column": "Neighborhood", "display_name": ", ", "newline": true}
	]
	display_col = "thName";
	table_id = "Tea_houses";
	allowed_group_bys = [
		{"column": "District"},
		{"column": "Neighborhood"},
		{"column": "State"},
		{"column": "WiFi"},
		{"column": "Hot"},
		{"column": "Iced"},
		{"column": "State"},
		{"column": "ttName", "display_name": "Specialty"},
	]

}
var customJsSearch = function customJsSearch() {
	
}


var embedded = false;
var forMapView = false;
