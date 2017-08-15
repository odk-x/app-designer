
			var metadata = {};
			var list_views = {};
			var menu = ["Empty menu!", null, []];
			// BEGIN CONFIG
				list_views = {
		"Tea_houses": "config/assets/Tea_houses_list.html",
		"Tea_types": "config/assets/Tea_types_list.html",
		"Tea_inventory": "config/assets/Tea_inventory_list.html",
	}
	menu = {"label": "Tea Demo", "type": "menu", "contents": [
		{"label": "View Tea Houses (try searching for \"Hill\")", "type": "list_view", "table": "Tea_houses"},
		{"label": "View Tea Houses on a Map", "type": "js", "function": function() { odkTables.openTableToMapView(null, "Tea_Houses", null, null, "config/assets/Tea_houses_list.html"); }},
		{"label": "View Teas", "type": "list_view", "table": "Tea_inventory"},
		{"label": "View Teas by Tea House", "type": "group_by", "table": "Tea_inventory", "grouping": "thName"},
		{"label": "View Tea Types", "type": "list_view", "table": "Tea_types"},
	]}

			// END CONFIG
			