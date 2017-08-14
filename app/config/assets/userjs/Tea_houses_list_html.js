
// If you set a display_col, that column will be shown in the large text for each row item.
// If you don't set one, we'll try and use the table id to pull it from this variable, which stores the
// instance column for each table or _id if it couldn't be found.
var display_cols = {"Tea_houses_editable": "Name", "imnci": "_id", "sign": "_id", "household_member": "name", "follow_arrival": "_id", "femaleClients": "_id", "complex_validate_test": "_id", "maleClients": "_id", "eonasdan": "_id", "section_test": "_id", "gridScreen": "_id", "geotagger_default_location": "_id", "large_dataset": "object_name", "testRun": "test", "follow_map_position": "_id", "customAppearance": "_id", "refrigerators": "_id", "agriculture": "plot_name", "food_bout": "_id", "exampleForm": "_id", "farm_field": "field_uuid", "household": "household_id", "Ethiopia_members": "name", "breathcounter": "_id", "Tea_types": "Name", "geoweather": "Description_Date", "child_coverage": "_id", "plot": "plot_name", "other_species": "_id", "mating_event": "_id", "farms": "farm_uuid", "follow": "_id", "send_sms": "_id", "Tea_inventory": "_id", "follow_map_time": "_id", "scan_example": "_id", "geopoints": "_id", "adult_coverage": "_id", "farm_crop": "crop_name", "sms_example": "_id", "selects_demo": "_id", "graphExample": "_id", "selects": "_id", "visit": "_id", "groom_bout": "_id", "geoweather_conditions": "Description", "datatypes": "_id", "twoColumn": "_id", "Ethiopia_household": "household_id", "Tea_houses": "Name", "geotagger": "_id", "imgci": "_id"}
// List of tables we can add/edit with formgen, if the table isn't found in this list, we'll use survey
var allowed_tables = ["Tea_houses_editable", "household_member", "follow_arrival", "femaleClients", "complex_validate_test", "maleClients", "eonasdan", "section_test", "gridScreen", "geotagger_default_location", "large_dataset", "testRun", "follow_map_position", "customAppearance", "refrigerators", "food_bout", "exampleForm", "farm_field", "household", "Ethiopia_members", "Tea_types", "geoweather", "child_coverage", "plot", "other_species", "mating_event", "farms", "follow", "Tea_inventory", "follow_map_time", "geopoints", "adult_coverage", "farm_crop", "selects_demo", "graphExample", "selects", "groom_bout", "geoweather_conditions", "datatypes", "twoColumn", "Ethiopia_household", "Tea_houses", "geotagger"]
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
