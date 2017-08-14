
			var metadata = {};
			var list_views = {};
			var menu = ["Empty menu!", null, []];
			// BEGIN CONFIG
			
	list_views = {
		"selects": "config/assets/selects_list.html"
	}
	var newinstance = function newinstance() {
		var id = newGuid();
		odkTables.launchHTML(null, "config/assets/formgen/selects#" + id);
	}
	menu = {"label": "Selects Demo", "type": "menu", "contents": [
		{"label": "New Instance", "type": "js", "function": function() { newinstance("selects"); }},
		{"label": "View Responses", "type": "list_view", "table": "selects"},
	]}

			// END CONFIG
			