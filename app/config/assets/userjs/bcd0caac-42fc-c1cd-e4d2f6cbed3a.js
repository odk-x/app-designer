
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
	
	global_join = "Tea_houses ON Tea_houses._id = Tea_inventory.House_id JOIN Tea_types ON Tea_types._id = Tea_inventory.Type_id"
	global_which_cols_to_select = "*, Tea_types.Name AS ttName, Tea_houses.Name AS thName, Tea_inventory.Name AS tiName"
	display_subcol = [["Tea House: ", "thName", true], ["Type: ", "ttName", true]];

	display_subcol = [
		{"column": "thName", "display_name": "Tea House: ", "newline": true},
		{"column": "ttName", "display_name": "Type: ", "newline": true}
	]
	display_col = "tiName";
	table_id = "Tea_inventory";
	allowed_group_bys = [
		{"column": "thName", "display_name": "House"},
		{"column": "ttName", "display_name": "Type"},
		{"column": "Iced"},
		{"column": "Hot"},
		{"column": "Bags"},
		{"column": "Loose_Leaf"}
	]

}
var customJsSearch = function customJsSearch() {
	
}


var embedded = false;
var forMapView = false;
