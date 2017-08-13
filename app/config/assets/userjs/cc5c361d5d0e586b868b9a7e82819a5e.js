
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

	var makepicture = function makepicture(element, columnValue, data, i) {
		if (columnValue == null || columnValue == "null") return "No picture available";
		return "<div class='img-wrapper'><img class='refrig-img' src='" + odkCommon.getRowFileAsUrl(table_id, data.getData(i, "_id"), columnValue) + "' /></div>";
	}
	//display_subcol = [["Manufacturer: ", "manufacturer", true], ["Model ID: ", "model_id", true], [makepicture, "refrigerator_picture_uriFragment", true]];
	display_subcol = [
		{"column": "manufacturer", "display_name": "Manufacturer: ", "newline": true},
		{"column": "model_id", "display_name": "Model ID: ", "newline": true},
		{"column": "refrigerator_picture_uriFragment", "callback": makepicture, "newline": true}
	]
	//allowed_group_bys = ["manufacturer", "climate_zone", "equipment_type"]
	allowed_group_bys = [
		{"column": "manufacturer"},
		{"column": "climate_zone"},
		{"column": "equipment_type"}
	]
	display_col = "catalog_id"
	table_id = "refrigerator_types";

}
var customJsSearch = function customJsSearch() {
	
	var stuff = document.getElementsByClassName("buttons");
	for (var i = 0; i < stuff.length; i++) {
		stuff[i].style.display = "none";
	}
	stuff = document.getElementsByClassName("displays");
	for (var i = 0; i < stuff.length; i++) {
		stuff[i].style.width = "100%";
	}

}


var embedded = false;
var forMapView = false;
