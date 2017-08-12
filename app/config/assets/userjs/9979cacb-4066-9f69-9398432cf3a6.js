
// If you set a display_col, that column will be shown in the large text for each row item.
// If you don't set one, we'll try and use the table id to pull it from this variable, which stores the
// instance column for each table or _id if it couldn't be found.
var display_cols = {"refrigerators": "tracking_id", "health_facility": "facility_name", "m_logs": "date_serviced", "refrigerator_types": "model_id"}
// List of tables we can add/edit with formgen, if the table isn't found in this list, we'll use survey
var allowed_tables = ["refrigerators", "health_facility", "m_logs", "refrigerator_types"]
// A map of table ids to tokens that can be used to localize their display name
var display_col_wrapper = null;
var clicked = function(table_id, row_id) {
	odkTables.openDetailView({}, table_id, row_id);
}
var customJsOl = function customJsOl() {
	allowed_tables = [];
document.getElementById("add").style.display = "none";

	display_col = "facility_name"
	table_id = "health_facility";
	//allowed_group_bys = ["admin_region", "climate_zone", "delivery_type", "electricity_source", ["facility_ownership", "Ownership"], "facility_type", "storage_type", "solar_suitable_climate", "solar_suitable_site", "vaccine_supply_mode", "vaccine_reserve_stock_requirement"];
	allowed_group_bys = [
		{"column": "admin_region"},
		{"column": "climate_zone"},
		{"column": "delivery_type"},
		{"column": "electricity_source"},
		{"column": "facility_ownership", "display_name": "Ownership"},
		{"column": "facility_type"},
		{"column": "storage_type"},
		{"column": "solar_suitable_climate"},
		{"column": "solar_suitable_site"},
		{"column": "vaccine_supply_mode"},
		{"column": "vaccine_reserve_stock_requirement"},
	]

	global_which_cols_to_select = "*"
	//display_subcol = [
		//["Facility ID: ", "facility_id", true],
		//["Refrigerators: ", "refrigerator_count", true]
	//]
	display_subcol = [
		{"column": "facility_id", "display_name": "Facility ID: ", "newline": true},
	]
	document.getElementById("add").style.display = "none";

}
var customJsSearch = function customJsSearch() {
	
}


var embedded = false;
var forMapView = false;
