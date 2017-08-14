
// A map of table ids to their instance columns (or _id if we couldn't pull it)
var display_cols = {"Tea_houses_editable": "Name", "imnci": "_id", "sign": "_id", "household_member": "name", "follow_arrival": "_id", "femaleClients": "_id", "complex_validate_test": "_id", "maleClients": "_id", "eonasdan": "_id", "section_test": "_id", "gridScreen": "_id", "geotagger_default_location": "_id", "large_dataset": "object_name", "testRun": "test", "follow_map_position": "_id", "customAppearance": "_id", "refrigerators": "_id", "agriculture": "plot_name", "food_bout": "_id", "exampleForm": "_id", "farm_field": "field_uuid", "household": "household_id", "Ethiopia_members": "name", "breathcounter": "_id", "Tea_types": "Name", "geoweather": "Description_Date", "child_coverage": "_id", "plot": "plot_name", "other_species": "_id", "mating_event": "_id", "farms": "farm_uuid", "follow": "_id", "send_sms": "_id", "Tea_inventory": "_id", "follow_map_time": "_id", "scan_example": "_id", "geopoints": "_id", "adult_coverage": "_id", "farm_crop": "crop_name", "sms_example": "_id", "selects_demo": "_id", "graphExample": "_id", "selects": "_id", "visit": "_id", "groom_bout": "_id", "geoweather_conditions": "Description", "datatypes": "_id", "twoColumn": "_id", "Ethiopia_household": "household_id", "Tea_houses": "Name", "geotagger": "_id", "imgci": "_id"}
// List of tables to edit with formgen. If a table isn't found in this list, we edit it with survey instead
var allowed_tables = ["Tea_houses_editable", "household_member", "follow_arrival", "femaleClients", "complex_validate_test", "maleClients", "eonasdan", "section_test", "gridScreen", "geotagger_default_location", "large_dataset", "testRun", "follow_map_position", "customAppearance", "refrigerators", "food_bout", "exampleForm", "farm_field", "household", "Ethiopia_members", "Tea_types", "geoweather", "child_coverage", "plot", "other_species", "mating_event", "farms", "follow", "Tea_inventory", "follow_map_time", "geopoints", "adult_coverage", "farm_crop", "selects_demo", "graphExample", "selects", "groom_bout", "geoweather_conditions", "datatypes", "twoColumn", "Ethiopia_household", "Tea_houses", "geotagger"];
var customJsOl = function customJsOl() {
		var br = function(col, extra) {
		return function(e, c, d) { return "<b>" + col + "</b>: " + c + (extra ? extra : "<br />"); };
	}
	var check = function(col, accepting, type) {
		if (accepting === undefined) {
			accepting = function(e, c, d) {
				return c.toUpperCase() == "YES";
			}
		}
		if (type === undefined) type = "checkbox"
		return function(e, c, d) {
			return "<input disabled type='"+type+"' " + (accepting(e, c, d) ? "checked=checked" : "") + " /><b>" + col + "</b>";
		};
	}
	var selected = function(a, b) {
		if (a == null) return false;
		if (a[0] == "[") {
			return jsonParse(a).indexOf(b) >= 0;
		}
		return a.toUpperCase() == b.toUpperCase();
	}

	main_col = "Name";
	table_id = "Tea_types";
	colmap = [
		["Name", function(e, c, d) { return c }],
		["Origin", br("Origin", "<br /><br />Details:")],
		["Caffeinated", check("Caffeinated")],
		["Fermented", check("Fermented")],
	]
	colmap = [
		{"column": "Name", "callback": function(e, c, d) { return c; }},
		{"column": "Origin", "callback": br("Origin", "<br /><br />Details:")},
		{"column": "Caffeinated", "callback": check("Caffeinated")},
		{"column": "Fermented", "callback": check("Fermented")}
	]

}
