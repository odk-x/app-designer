
// A map of table ids to their instance columns (or _id if we couldn't pull it)
var display_cols = {"refrigerators": "tracking_id", "health_facility": "facility_name", "m_logs": "date_serviced", "refrigerator_types": "model_id"}
// List of tables to edit with formgen. If a table isn't found in this list, we edit it with survey instead
var allowed_tables = ["refrigerators", "health_facility", "m_logs", "refrigerator_types"];
var customJsOl = function customJsOl() {
	var generic_callback = function generic_callback(element, columnValue, data, which, pretty, optional_col_name) {
	if (optional_col_name == null || optional_col_name == undefined || typeof(optional_col_name) != "string") {
		optional_col_name = displayCol(which, data.getMetadata(), data.getTableId());
	} else {
		optional_col_name = _tu(optional_col_name);
	}
	wrapper = function(i) { return _tc(data, which, i); };
	if (pretty) wrapper = function(i) { return window.pretty(_tc(data, which, i.toString())); };
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


	document.getElementById("mi").innerText = _tu("Model Information")
	document.getElementById("edit").style.display = "none";
	document.getElementById("delete").style.display = "none";

	main_col = "";
	global_which_cols_to_select = "*, (SELECT COUNT(*) FROM refrigerators WHERE model_row_id = refrigerator_types._id) as refrig_with_this_model_count"
	var mid_callback = function mid_callback(element, columnValue, data) {
		generic_callback(element, columnValue, data, "model_id", true);
		document.getElementById("open_model").innerHTML = _tu("View All ") + columnValue + _tu(" Refrigerators (<span id='refrig_with_this_model_count'>Loading...</span>)")
		document.getElementById("open_model").disabled = false;
		document.getElementById("open_model").addEventListener("click", function click() {
			odkTables.launchHTML(null, "config/assets/aa_refrigerators_list.html#refrigerators/model_row_id = ?/" + row_id);
		});
		document.getElementById("refrig_with_this_model_count").innerText = data.getData(0, "refrig_with_this_model_count");
	}
	colmap = [
		{"column": "manufacturer", "callback": build_generic_callback("manufacturer", true)},
		{"column": "power_source", "callback": build_generic_callback("power_source", function(i) { return pretty(jsonParse(i).join(", ")); })},
		{"column": "refrigerator_gross_volume", "callback": build_generic_callback("refrigerator_gross_volume", " litres")},
		{"column": "freezer_gross_volume", "callback": build_generic_callback("freezer_gross_volume", " litres")},
		{"column": "equipment_type", "callback": build_generic_callback("equipment_type", true)},
		{"column": "climate_zone", "callback": build_generic_callback("climate_zone", true)},
		{"column": "refrigerator_net_volume", "callback": build_generic_callback("refrigerator_net_volume", " litres")},
		{"column": "freezer_net_volume", "callback": build_generic_callback("freezer_net_volume", " litres")},
		{"column": "model_id", "callback": mid_callback},
		{"column": "catalog_id", "callback": build_generic_callback("catalog_id", true)},
		{"column": "refrigerator_picture", "callback": function(element,columnValue,data){document.getElementById("inject-refrigerator_picture").appendChild(columnValue)}}
	]

}
