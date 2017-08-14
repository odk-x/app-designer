
// A map of table ids to their instance columns (or _id if we couldn't pull it)
var display_cols = {"refrigerators": "tracking_id", "health_facility": "facility_name", "m_logs": "date_serviced", "refrigerator_types": "model_id"}
// List of tables to edit with formgen. If a table isn't found in this list, we edit it with survey instead
var allowed_tables = ["refrigerators", "health_facility", "m_logs", "refrigerator_types"];
var customJsOl = function customJsOl() {
	
}
