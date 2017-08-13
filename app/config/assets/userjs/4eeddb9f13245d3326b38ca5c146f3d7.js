
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

	var notes_cb = function notes_cb(element, notes) {
		if (notes == undefined || notes == null) {
			return "";
		}
		return notes;
	}
	display_col_wrapper = function display_col_wrapper(data, i, columnValue) {
		return columnValue.split("T")[0];
	}
	display_col = "date_serviced"
	//display_subcol = [["", "refs_tracking_number", true], [notes_cb, "notes", true]];
	display_subcol = [
		{"column": "refs_tracking_number", "newline": true},
		{"column": "notes", "callback": notes_cb, "newline": true},
	]
	allowed_group_bys = [];
	table_id = "m_logs";
	global_join = "refrigerators ON refrigerators.refrigerator_id = m_logs.refrigerator_id"
	global_which_cols_to_select = "*, refrigerators.refrigerator_id AS refs_refid, refrigerators.tracking_id AS refs_tracking_number"
	document.getElementById("add").style.display = "none";

}
var customJsSearch = function customJsSearch() {
	
}


var embedded = false;
var forMapView = false;
