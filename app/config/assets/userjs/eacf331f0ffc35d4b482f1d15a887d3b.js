
			var metadata = {};
			var list_views = {};
			var menu = ["Empty menu!", null, []];
			// BEGIN CONFIG
			
list_views = {
	"health_facility": "config/assets/aa_health_facility_list.html",
	"refrigerators": "config/assets/aa_refrigerators_list.html",
	"refrigerator_types": "config/assets/aa_refrigerator_types_list.html",
}
menu = {"label": "PATH Cold Chain Demo", "type": "menu", "contents": [{"label": "Central", "type": "menu", "contents": [{"label": "Central East", "type": "menu", "contents": [{"label": "Dowa", "type": "html", "page": "config/assets/admin_region.html#Dowa:"}, {"label": "Kasungu", "type": "html", "page": "config/assets/admin_region.html#Kasungu:"}, {"label": "Nkhotakota", "type": "html", "page": "config/assets/admin_region.html#Nkhotakota:"}, {"label": "Ntchisi", "type": "html", "page": "config/assets/admin_region.html#Ntchisi:"}, {"label": "Salima", "type": "html", "page": "config/assets/admin_region.html#Salima:"}, {"label": "Filter By Type", "type": "html", "page": "config/assets/admin_region_filter.html#Central East:"}]}, {"label": "Central West", "type": "menu", "contents": [{"label": "Dedza", "type": "html", "page": "config/assets/admin_region.html#Dedza:"}, {"label": "Lilongwe", "type": "html", "page": "config/assets/admin_region.html#Lilongwe:"}, {"label": "Mchinji", "type": "html", "page": "config/assets/admin_region.html#Mchinji:"}, {"label": "Ntcheu", "type": "html", "page": "config/assets/admin_region.html#Ntcheu:"}, {"label": "Filter By Type", "type": "html", "page": "config/assets/admin_region_filter.html#Central West:"}]}]}, {"label": "North", "type": "menu", "contents": [{"label": "Chitipa", "type": "html", "page": "config/assets/admin_region.html#Chitipa:"}, {"label": "Karonga", "type": "html", "page": "config/assets/admin_region.html#Karonga:"}, {"label": "Likoma", "type": "html", "page": "config/assets/admin_region.html#Likoma:"}, {"label": "Mzimba North", "type": "html", "page": "config/assets/admin_region.html#Mzimba North:"}, {"label": "Mzimba South", "type": "html", "page": "config/assets/admin_region.html#Mzimba South:"}, {"label": "Nkhata Bay", "type": "html", "page": "config/assets/admin_region.html#Nkhata Bay:"}, {"label": "Rumphi", "type": "html", "page": "config/assets/admin_region.html#Rumphi:"}, {"label": "Filter By Type", "type": "html", "page": "config/assets/admin_region_filter.html#North:"}]}, {"label": "South", "type": "menu", "contents": [{"label": "South East", "type": "menu", "contents": [{"label": "Balaka", "type": "html", "page": "config/assets/admin_region.html#Balaka:"}, {"label": "Machinga", "type": "html", "page": "config/assets/admin_region.html#Machinga:"}, {"label": "Mangochi", "type": "html", "page": "config/assets/admin_region.html#Mangochi:"}, {"label": "Mulanje", "type": "html", "page": "config/assets/admin_region.html#Mulanje:"}, {"label": "Phalombe", "type": "html", "page": "config/assets/admin_region.html#Phalombe:"}, {"label": "Zomba", "type": "html", "page": "config/assets/admin_region.html#Zomba:"}, {"label": "Filter By Type", "type": "html", "page": "config/assets/admin_region_filter.html#South East:"}]}, {"label": "South West", "type": "menu", "contents": [{"label": "Blantyre", "type": "html", "page": "config/assets/admin_region.html#Blantyre:"}, {"label": "Chikwawa", "type": "html", "page": "config/assets/admin_region.html#Chikwawa:"}, {"label": "Chiladzulu", "type": "html", "page": "config/assets/admin_region.html#Chiladzulu:"}, {"label": "Mwanza", "type": "html", "page": "config/assets/admin_region.html#Mwanza:"}, {"label": "Neno", "type": "html", "page": "config/assets/admin_region.html#Neno:"}, {"label": "Nsanje", "type": "html", "page": "config/assets/admin_region.html#Nsanje:"}, {"label": "Thyolo", "type": "html", "page": "config/assets/admin_region.html#Thyolo:"}, {"label": "Filter By Type", "type": "html", "page": "config/assets/admin_region_filter.html#South West:"}]}]}, {"label": "All Regions", "type": "menu", "contents": [{"label": "Dowa", "type": "html", "page": "config/assets/admin_region.html#Dowa:"}, {"label": "Kasungu", "type": "html", "page": "config/assets/admin_region.html#Kasungu:"}, {"label": "Nkhotakota", "type": "html", "page": "config/assets/admin_region.html#Nkhotakota:"}, {"label": "Ntchisi", "type": "html", "page": "config/assets/admin_region.html#Ntchisi:"}, {"label": "Salima", "type": "html", "page": "config/assets/admin_region.html#Salima:"}, {"label": "Dedza", "type": "html", "page": "config/assets/admin_region.html#Dedza:"}, {"label": "Lilongwe", "type": "html", "page": "config/assets/admin_region.html#Lilongwe:"}, {"label": "Mchinji", "type": "html", "page": "config/assets/admin_region.html#Mchinji:"}, {"label": "Ntcheu", "type": "html", "page": "config/assets/admin_region.html#Ntcheu:"}, {"label": "Chitipa", "type": "html", "page": "config/assets/admin_region.html#Chitipa:"}, {"label": "Karonga", "type": "html", "page": "config/assets/admin_region.html#Karonga:"}, {"label": "Likoma", "type": "html", "page": "config/assets/admin_region.html#Likoma:"}, {"label": "Mzimba North", "type": "html", "page": "config/assets/admin_region.html#Mzimba North:"}, {"label": "Mzimba South", "type": "html", "page": "config/assets/admin_region.html#Mzimba South:"}, {"label": "Nkhata Bay", "type": "html", "page": "config/assets/admin_region.html#Nkhata Bay:"}, {"label": "Rumphi", "type": "html", "page": "config/assets/admin_region.html#Rumphi:"}, {"label": "Balaka", "type": "html", "page": "config/assets/admin_region.html#Balaka:"}, {"label": "Machinga", "type": "html", "page": "config/assets/admin_region.html#Machinga:"}, {"label": "Mangochi", "type": "html", "page": "config/assets/admin_region.html#Mangochi:"}, {"label": "Mulanje", "type": "html", "page": "config/assets/admin_region.html#Mulanje:"}, {"label": "Phalombe", "type": "html", "page": "config/assets/admin_region.html#Phalombe:"}, {"label": "Zomba", "type": "html", "page": "config/assets/admin_region.html#Zomba:"}, {"label": "Blantyre", "type": "html", "page": "config/assets/admin_region.html#Blantyre:"}, {"label": "Chikwawa", "type": "html", "page": "config/assets/admin_region.html#Chikwawa:"}, {"label": "Chiladzulu", "type": "html", "page": "config/assets/admin_region.html#Chiladzulu:"}, {"label": "Mwanza", "type": "html", "page": "config/assets/admin_region.html#Mwanza:"}, {"label": "Neno", "type": "html", "page": "config/assets/admin_region.html#Neno:"}, {"label": "Nsanje", "type": "html", "page": "config/assets/admin_region.html#Nsanje:"}, {"label": "Thyolo", "type": "html", "page": "config/assets/admin_region.html#Thyolo:"}]}, {"label": "View Data", "type": "menu", "contents": [{"label": "View Health Facilities", "type": "menu", "contents": [{"label": "Search By Name/ID", "type": "list_view", "table": "health_facility"}]}, {"label": "View Inventory", "type": "menu", "contents": [{"label": "Refrigerator Age", "type": "html", "page": "config/assets/inv_by_age.html"}, {"label": "Facility Grid Power Availability", "type": "html", "page": "config/assets/inv_by_grid_power.html"}]}, {"label": "View Refrigerator Models", "type": "group_by", "table": "refrigerator_types", "grouping": "equipment_type"}, {"label": "More Options", "type": "menu", "contents": [{"label": "Health Facilities (Advanced)", "type": "menu", "contents": [{"label": "View All", "type": "list_view", "table": "health_facility"}, {"type": "group_by", "table": "health_facility", "grouping": "admin_region"}, {"type": "group_by", "table": "health_facility", "grouping": "facility_type"}, {"label": "Ownership", "type": "group_by", "table": "health_facility", "grouping": "facility_ownership"}, {"label": "More", "type": "menu", "contents": [{"type": "group_by", "table": "health_facility", "grouping": "delivery_type"}, {"type": "group_by", "table": "health_facility", "grouping": "electricity_source"}, {"type": "group_by", "table": "health_facility", "grouping": "storage_type"}, {"type": "group_by", "table": "health_facility", "grouping": "solar_suitable_climate"}, {"type": "group_by", "table": "health_facility", "grouping": "solar_suitable_site"}, {"type": "group_by", "table": "health_facility", "grouping": "vaccine_supply_mode"}, {"label": "By Reserve Stock Requirement", "type": "group_by", "table": "health_facility", "grouping": "vaccine_reserve_stock_requirement"}]}]}, {"type": "menu", "label": "Refrigerators (Advanced)", "contents": [{"label": "View All", "type": "list_view", "table": "refrigerators"}, {"label": "By Facility", "type": "group_by", "table": "refrigerators", "grouping": "facility_name"}, {"label": "By Model", "type": "group_by", "table": "refrigerators", "grouping": "catalog_id"}, {"type": "group_by", "table": "refrigerators", "grouping": "year"}, {"label": "More", "type": "menu", "contents": [{"label": "By Use", "type": "group_by", "table": "refrigerators", "grouping": "utilization"}, {"type": "group_by", "table": "refrigerators", "grouping": "working_status"}, {"type": "group_by", "table": "refrigerators", "grouping": "reason_not_working"}]}]}, {"label": "Models (Advanced)", "type": "menu", "contents": [{"label": "View All", "type": "list_view", "table": "refrigerator_types"}, {"type": "group_by", "table": "refrigerator_types", "grouping": "manufacturer"}, {"type": "group_by", "table": "refrigerator_types", "grouping": "equipment_type"}, {"label": "More", "type": "menu", "contents": [{"type": "group_by", "table": "refrigerator_types", "grouping": "climate_zone"}]}]}]}]}]};
var addhf = function addhf() {
	odkTables.addRowWithSurvey(null, "health_facility", "health_facility", null, null);
}
var addrf = function addrf() {
	odkTables.addRowWithSurvey(null, "refrigerators", "refrigerators", null, null);
}
menu["contents"] = menu["contents"].concat(0);
menu["contents"][menu["contents"].length - 1] = {"label": "Administrative Actions", "type": "menu", "contents": [
		//["Add Health Facility", "_js", addhf],
		{"label": "Add Health Facility", "type": "html", "page": "config/assets/add_hf.html"},
		//["Add Refrigerator", "_js", addrf]
	]}

var make_path_from_string = function make_path_from_string(str, incomplete) {
	var submenu = make_submenu(incomplete);
	if (submenu["label"].toUpperCase() == str.toUpperCase()) {
		return incomplete;
	}
	if (submenu["type"] != "menu") {
		return null;
	}
	for (var i = 0; i < submenu["contents"].length; i++) {
		var found = make_path_from_string(str, incomplete.concat(i));
		if (found != null) {
			return found;
		}
	}
	return null;
}
if (window.location.hash.substr(1).length == 0) {
	var region_as_role = "";
	var all_regions = [];
	var redirect = function redirect() {
		if (region_as_role.length == 0) {
			// TODO LOCKOUT
			return;
		}
		var path = make_path_from_string(region_as_role, [])
		// TODO CHECK IF path IS NULL, IF IT IS WE COULDN'T FIND THE REGION
		menu_path = path;
		doMenu();
	}
	odkData.getDefaultGroup(function(r) {
		r = r.getDefaultGroup();
		if (r == null) {
			menu = {"label": "Not logged in!", "type": "menu", "contents": [
				{"label": "Log in", "type": "js", "function": function() {
					odkCommon.doAction(null, "org.opendatakit.services.sync.actions.activities.SyncActivity", {"extras": {"showLogin": "true"}, "componentPackage": "org.opendatakit.services", "componentActivity": "org.opendatakit.services.sync.actions.activities.SyncActivity"});
				}}
			]};
			doMenu();
		} else if (r.indexOf("GROUP_REGION_") == 0) {
			var region = r.replace("GROUP_REGION_", "");
			// replace all occurrences
			region = region.replace(/_/g, " ");
			region_as_role = region;
			redirect();
		}
	});
}
		
			// END CONFIG
			