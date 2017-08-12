
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

	global_join = "refrigerator_types ON refrigerators.model_row_id = refrigerator_types._id JOIN health_facility ON refrigerators.facility_row_id = health_facility._id"
	//display_subcol = [["", "model_id", true], ["Healthcare Facility: ", "facility_name", true]];
	display_subcol = [
		{"column": "model_id", "newline": true},
		{"column": "facility_name", "display_name": "Healthcare Facility: ", "newline": true}
	]
	display_col = "tracking_id"
	table_id = "refrigerators";
	//allowed_group_bys = [["facility_row_id", "Facility"], ["model_row_id", "Model"], "reason_not_working", ["utilization", "Use"], "working_status", "year"]
	allowed_group_bys = [
		{"column": "facility_row_id", "display_name": "Facility"},
		{"column": "model_row_id", "display_name": "Model"},
		{"column": "reason_not_working"},
		{"column": "utilization", "display_name": "Use"},
		{"column": "working_status"},
		{"column": "year"}
	]

}
var customJsSearch = function customJsSearch() {
	
}


var embedded = false;
var forMapView = false;
