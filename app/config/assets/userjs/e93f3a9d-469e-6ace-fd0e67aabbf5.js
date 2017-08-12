
			var metadata = {};
			var list_views = {};
			var menu = ["Empty menu!", null, []];
			// BEGIN CONFIG
			
	list_views = {
		"Tea_houses": "config/assets/Tea_houses_list.html",
		"Tea_types": "config/assets/Tea_types_list.html",
		"Tea_inventory": "config/assets/Tea_inventory_list.html",
	}
	var newinstance = function newinstance(table) {
		return function() {
			var id = newGuid();
			odkTables.launchHTML(null, "config/assets/formgen/"+table+"#" + id);
		}
	}
	menu = {"label": "Tea Demo", "type": "menu", "contents": [
		{"label": "View Tea Houses (try searching for \"Hill\")", "type": "list_view", "table": "Tea_houses"},
		{"label": "View Tea Houses on a Map", "type": "js", "function": function() { odkTables.openTableToMapView(null, "Tea_Houses", null, null, "config/assets/Tea_houses_list.html"); }},
		{"label": "New tea house", "type": "js", "function": newinstance("Tea_houses")},
		{"label": "View Teas", "type": "list_view", "table": "Tea_inventory"},
		{"label": "View Teas by Tea House", "type": "group_by", "table": "Tea_inventory", "grouping": "thName"},
		{"label": "Add Tea", "type": "js", "function": newinstance("Tea_inventory")},
		{"label": "View Tea Types", "type": "list_view", "table": "Tea_types"},
		{"label": "Add Tea Type", "type": "js", "function": newinstance("Tea_types")},
	]}

			// END CONFIG
			