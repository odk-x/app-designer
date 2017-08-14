
// A map of table ids to their instance columns (or _id if we couldn't pull it)
var display_cols = {"refrigerators": "tracking_id", "health_facility": "facility_name", "m_logs": "date_serviced", "refrigerator_types": "model_id"}
// List of tables to edit with formgen. If a table isn't found in this list, we edit it with survey instead
var allowed_tables = ["refrigerators", "health_facility", "m_logs", "refrigerator_types"];
var customJsOl = function customJsOl() {
	var generic_callback = function generic_callback(element, columnValue, data, which, pretty, optional_col_name) {
	if (optional_col_name == null || optional_col_name == undefined || typeof(optional_col_name) != "string") {
		optional_col_name = displayCol(which, data.getMetadata(), data.getTableId());
	} else {
		optional_col_name = translate_user(optional_col_name);
	}
	wrapper = function(i) { return translate_choice(data, which, i); };
	if (pretty) wrapper = function(i) { return window.pretty(translate_choice(data, which, i.toString())); };
	if (columnValue == null) columnValue = "null"; // because null.toString() will throw an exception
	document.getElementById("inject-" + which).innerHTML = "<b>" + optional_col_name + "</b>: " + wrapper(columnValue);
	document.getElementById("inject-" + which).classList.add("li-inner");
}
var build_generic_callback = function build_generic_callback(which, pretty, optional_col_name) {
	return function _generic_callback_wrapper(element, columnValue, data) {
		if (typeof(pretty) == "string") {
			columnValue += pretty;
			pretty = false;
		}
		if (typeof(pretty) == "function") {
			columnValue = pretty(columnValue)
			pretty = false;
		}
		return generic_callback(element, columnValue, data, which, pretty, optional_col_name);
	}
}
allowed_tables = [];

	document.getElementById("bfi").innerText = translate_user("Basic Refrigerator Information")
	var model_callback = function model_callback(element, columnValue, data) {
		var btn = document.getElementById("open_model");
		btn.innerText = translate_user("Model Information");
		var model = data.getData(0, "catalog_id"); // from join, not actually the model id
		var model_row_id = data.getData(0, "model_row_id");
		btn.disabled = false;
		btn.addEventListener("click", function() {
			odkTables.openDetailView(null, "refrigerator_types", model_row_id);
		});
		build_generic_callback("model_id", true, translate_user("Model ID"))(element, columnValue, data)
		return "";
	}
	var hf_callback = function hf_callback(element, columnValue, data) {
		/*
			var btn = document.getElementById("open_hf");
			btn.innerText = translate_user("Health Facility Information");
			var hf = data.getData(0, "facility_name"); // from join, not actually the hf id
			var hf_row_id = data.getData(0, "facility_row_id");
			btn.disabled = false;
			btn.addEventListener("click", function() {
				odkTables.openDetailView(null, "health_facility", hf_row_id, "config/assets/aa_health_facility_detail.html#health_facility/" + hf_row_id);
			});
		*/
		build_generic_callback("facility_name", true, "Facility")(element, columnValue, data)
		document.getElementById("add_m_log").disabled = false;
		document.getElementById("add_m_log").innerText = translate_user("Add Maintenance Record");
		var defaults = {"refrigerator_id": data.getData(0, "_id"), "date_serviced": odkCommon.toOdkTimeStampFromDate(new Date())};
		defaults["_default_access"] = data.getData(0, "_default_access");
		defaults["_group_read_only"] = data.getData(0, "_group_read_only");
		defaults["_group_modify"] = data.getData(0, "_group_modify");
		defaults["_group_privileged"] = data.getData(0, "_group_privileged");
		document.getElementById("add_m_log").addEventListener("click", function add_m_log() {
			if (allowed_tables.indexOf("m_logs") >= 0) {
				var id = newGuid();
				odkData.addRow("m_logs", defaults, id, function() {
					// Escape the LIMIT 1
					odkData.arbitraryQuery("m_logs", "UPDATE m_logs SET _savepoint_type = ? WHERE _id = ?;--", ["INCOMPLETE", id], 100, 0, function success(data) {
						odkTables.launchHTML({}, "config/assets/formgen/m_logs#" + id);
					}, null);
				});
			} else {
				odkTables.addRowWithSurvey({}, "m_logs", "m_logs", null, defaults);
			}
		});
		document.getElementById("view_m_log").disabled = false;
		document.getElementById("view_m_log").innerText = translate_user("View all maintenance logs")
		document.getElementById("view_m_log").addEventListener("click", function add_m_log() {
			odkTables.launchHTML(null, "config/assets/aa_m_logs_list.html#m_log/STATIC/SELECT *, refrigerators.tracking_id AS refs_tracking_number FROM m_logs JOIN refrigerators ON refrigerators._id = m_logs.refrigerator_id WHERE m_logs.refrigerator_id = ?/" + JSON.stringify([data.getData(0, "_id")]) + "/maintenance records for the selected refrigerator");
		});

		return "";
	}

	main_col = "";
	global_join = "refrigerator_types ON refrigerators.model_row_id = refrigerator_types._id JOIN health_facility ON refrigerators.facility_row_id = health_facility._id"
	global_which_cols_to_select = "*"
	var subquery = "(SELECT date_serviced FROM m_logs WHERE m_logs.refrigerator_id = refrigerators._id AND m_logs._savepoint_type != 'INCOMPLETE' ORDER BY date_serviced DESC LIMIT 1)"
	global_which_cols_to_select = global_which_cols_to_select.concat(", (CASE WHEN "+subquery+" IS NOT NULL THEN "+subquery+" ELSE 'No Records' END) as date_serviced")
	colmap = [
		{"column": "facility_name", "callback": hf_callback},
		{"column": "year", "callback": build_generic_callback("year", true, "Year Installed")},
		{"column": "working_status", "callback": build_generic_callback("working_status", true, "Status")},
		{"column": "reason_not_working", "callback": build_generic_callback("reason_not_working", true)},
		{"column": "model_row_id", "callback": model_callback},
		{"column": "tracking_id", "callback": build_generic_callback("tracking_id", false, "Tracking Number")},
		{"column": "voltage_regulator", "callback": build_generic_callback("voltage_regulator", true)},
		{"column": "date_serviced", "callback": build_generic_callback("date_serviced", function(i) {
			if (i == "No Records") {
				return translate_user(i);
			}
			return i.split("T")[0];
		}, translate_user("Date Serviced"))}
	]

}
