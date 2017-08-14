
			var metadata = {};
			var list_views = {};
			var menu = ["Empty menu!", null, []];
			// BEGIN CONFIG
			
list_views = {
	"health_facility": "config/assets/aa_health_facility_list.html",
}

	var hash = window.location.hash.substr(1);
	var val = ""
	if (hash.indexOf(":") == -1) {
		val = odkCommon.getSessionVariable("val");
	} else {
		val = hash.split(":")[0];
		window.location.hash = "#" + hash.split(":").slice(1)
	}
	odkCommon.setSessionVariable("val", val);
	menu = {"label": "Loading...", "type": "menu", "contents": []};
	
	odkData.arbitraryQuery("health_facility", "SELECT admin_region, facility_type, regionLevel2, COUNT(facility_type) as cnt, _id FROM health_facility WHERE UPPER(admin_region) = UPPER(?) OR UPPER(regionLevel2) = UPPER(?) GROUP BY facility_type ORDER BY cnt DESC", [val, val], 100, 0, function(data) {
		if (data.getCount() == 0) {
			menu = {"label": translate_user("Admin region ") + val + translate_user(" has no health facilities!"), "type": "menu", "contents": []};
			doMenu();
		} else {
			var distinct_admin_regions = 0;
			var all_regions = [];
			for (var i = 0; i < data.getCount(); i++) {
				var this_admin_region = data.getData(i, "admin_region")
				if (all_regions.indexOf(this_admin_region) == -1) {
					all_regions = all_regions.concat(this_admin_region);
					distinct_admin_regions++;
				}
			}
			var where = "";
			var args = "";
			var hr_text = "";
			var old_val = val;
			if (distinct_admin_regions == 1) {
				val = data.getData(0, "admin_region");
				where = "UPPER(admin_region) = UPPER(?) AND facility_type = ?";
				hr_text = "health facilities in the admin region ? of the type ?";
			} else {
				val = data.getData(0, "regionLevel2");
				where = "UPPER(regionLevel2) = UPPER(?) AND facility_type = ?";
				hr_text = "health facilities in the region level 2 ? of the type ?";
			}
			menu = {"label": translate_user("Filtering ") + val, "type": "menu", "contents": []}

			for (var i = 0; i < data.getCount(); i++) {
				var ftype = data.getData(i, "facility_type")
				args = [val, ftype];
				var count = data.getData(i, "cnt").toString();
				var id = data.getData(i, "_id");
				menu["contents"] = menu["contents"].concat(0);
				(function(val, where, args, count, id) {
					var cb = null;
					//if (count == 1) {
						//cb = function() {
							//odkTables.launchHTML(null, "config/assets/aa_health_facility_detail.html#health_facility/" + id);
						//};
					//} else {
						cb = function() {
							odkTables.openTableToMapView(null, "health_facility", where, args, "config/assets/hack_for_hf_map.html#health_facility/STATIC/SELECT * FROM health_facility WHERE " + where + "/" + JSON.stringify(args) + "/" + hr_text);
						}
					//}
					menu["contents"][menu["contents"].length - 1] = {"label": translate_choice(data, "facility_type", ftype) + " (" + count + ")", "type": "js", "function": cb}
				})(val, where, args, count, id);
			}
			doMenu();
		}
	}, function(e) { alert(e); });
		
			// END CONFIG
			