
// A map of table ids to their instance columns (or _id if we couldn't pull it)
var display_cols = {"refrigerators": "tracking_id", "health_facility": "facility_name", "m_logs": "date_serviced", "refrigerator_types": "model_id"}
// List of tables to edit with formgen. If a table isn't found in this list, we edit it with survey instead
var allowed_tables = ["refrigerators", "health_facility", "m_logs", "refrigerator_types"];
var customJsOl = function customJsOl() {
	var generic_callback = function generic_callback(e, c, d, which, pretty, optional_col_name) {
	if (optional_col_name == null || optional_col_name == undefined || typeof(optional_col_name) != "string") {
		optional_col_name = displayCol(which, d.getMetadata(), d.getTableId());
	} else {
		optional_col_name = _tu(optional_col_name);
	}
	wrapper = function(i) { return _tc(d, which, i); };
	if (pretty) wrapper = function(i) { return window.pretty(_tc(d, which, i.toString())); };
	if (c == null) c = "null"; // because null.toString() will throw an exception
	document.getElementById("inject-" + which).innerHTML = "<b>" + optional_col_name + "</b>: " + wrapper(c);
	document.getElementById("inject-" + which).classList.add("li-inner");
}
var build_generic_callback = function build_generic_callback(which, pretty, optional_col_name) {
	return function _generic_callback_wrapper(e, c, d) {
		if (typeof(pretty) == "string") {
			c = c + pretty;
			pretty = false;
		}
		if (typeof(pretty) == "function") {
			c = pretty(c)
			pretty = false;
		}
		return generic_callback(e, c, d, which, pretty, optional_col_name);
	}
}
allowed_tables = [];


	main_col = "";
	global_which_cols_to_select = "*, (SELECT COUNT(*) FROM refrigerators WHERE facility_row_id = health_facility._id) as refrig_with_this_hfid_count"
	var fname_callback = function fname_callback(e, c, d) {
		generic_callback(e, c, d, "facility_name", true, "Health Facility ID");
		document.getElementById("refrigerator_inventory").innerHTML = _tu("Refrigerator Inventory (<span id='refrig_with_this_hfid_count'>Loading...</span>)")
		document.getElementById("refrigerator_inventory").disabled = false;
		document.getElementById("refrigerator_inventory").addEventListener("click", function click() {
			odkTables.launchHTML(null, "config/assets/aa_refrigerators_list.html#refrigerators/health_facility.facility_name = ?/" + d.getData(0, "facility_name"));
		});
		document.getElementById("refrig_with_this_hfid_count").innerText = d.getData(0, "refrig_with_this_hfid_count");
		document.getElementById("addref").addEventListener("click", function() {
			var defaults = {"facility_row_id": d.getData(0, "_id")};
			defaults["refrigerator_id"] = newGuid();
			defaults["_default_access"] = d.getData(0, "_default_access");
			defaults["_group_read_only"] = d.getData(0, "_group_read_only");
			defaults["_group_modify"] = d.getData(0, "_group_modify");
			defaults["_group_privileged"] = d.getData(0, "_group_privileged");
			if (allowed_tables.indexOf("refrigerators") >= 0) {
				var id = newGuid();
				odkData.addRow("refrigerators", defaults, id, function() {
					// Escape the LIMIT 1
					odkData.arbitraryQuery("refrigerators", "UPDATE refrigerators SET _savepoint_type = ? WHERE _id = ?;--", ["INCOMPLETE", id], 100, 0, function success(d) {
						odkTables.launchHTML({}, "config/assets/formgen/refrigerators#" + id);
					}, null);
				});
			} else {
				odkTables.addRowWithSurvey({}, "refrigerators", "refrigerators", null, defaults);
			}
		});
	}
	colmap = [
		{"column": 'facility_name', "callback": fname_callback},
		{"column": 'facility_id', "callback": build_generic_callback("facility_id", true, "Health Facility ID")},
		{"column": 'facility_type', "callback": build_generic_callback("facility_type", true)},
		{"column": 'facility_ownership', "callback": build_generic_callback("facility_ownership", true, "Ownership")},
		{"column": 'facility_population', "callback": build_generic_callback("facility_population", true, "Population")},
		{"column": 'facility_coverage', "callback": build_generic_callback("facility_coverage", "%", "Coverage")},
		{"column": 'admin_region', "callback": build_generic_callback("admin_region", true, "Admin Region")},
		{"column": 'electricity_source', "callback": build_generic_callback("electricity_source", true)},
		{"column": 'grid_power_availability', "callback": build_generic_callback("grid_power_availability", true, "Grid Availability")},
		{"column": 'gas_availability', "callback": build_generic_callback("gas_availability", true)},
		{"column": 'kerosene_availability', "callback": build_generic_callback("kerosene_availability", true)},
		{"column": 'solar_suitable_climate', "callback": build_generic_callback("solar_suitable_climate", true, "Solar Suitable Climate?")},
		{"column": 'solar_suitable_site', "callback": build_generic_callback("solar_suitable_site", true, "Solar Suitable Site?")},
		{"column": 'Location_latitude', "callback": build_generic_callback("Location_latitude", true, "Latitude (GPS)")},
		{"column": 'Location_longitude', "callback": build_generic_callback("Location_longitude", true, "Longitude (GPS)")},
		{"column": 'climate_zone', "callback": build_generic_callback("climate_zone", true, "Climate")},
		{"column": 'distance_to_supply', "callback": build_generic_callback("distance_to_supply", true, "Distance to Supply Point")},
		{"column": 'vaccine_supply_interval', "callback": build_generic_callback("vaccine_supply_interval", true)},
		{"column": 'vaccine_reserve_stock_requirement', "callback": build_generic_callback("vaccine_reserve_stock_requirement", true, "Vaccine Reserve Stock Req")},
		{"column": 'vaccine_supply_mode', "callback": build_generic_callback("vaccine_supply_mode", true)},
	]
	document.getElementById("bfi").innerText = _tu("Basic Facility Information");
	document.getElementById("pi").innerText = _tu("Power Information");
	document.getElementById("locationi").innerText = _tu("Location Information");
	document.getElementById("stocki").innerText = _tu("Stock Information");
	document.getElementById("addref").innerText = _tu("Add Refrigerator");

}
