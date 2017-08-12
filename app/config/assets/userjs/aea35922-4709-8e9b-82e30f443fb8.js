
			var metadata = {};
			var list_views = {};
			var menu = ["Empty menu!", null, []];
			// BEGIN CONFIG
			
	list_views = {
		"exampleForm": "config/assets/example_list.html",
		"datesTest": "config/assets/table.html"
	}
	var newinstance = function newinstance(table) {
		return function() {
			var id = newGuid();
			odkTables.launchHTML(null, "config/assets/formgen/"+table+"#" + id);
		}
	}
	menu = {"label": "Example Form", "type": "menu", "contents": [
		{"label": "New Instance", "type": "js", "function": newinstance("exampleForm")},
		{"label": "View Responses", "type": "list_view", "table": "exampleForm"},
		{"label": "Custom prompt types", "type": "js", "function": newinstance("datesTest")},
		{"label": "ETHIOPIA", "type": "js", "function": newinstance("Ethiopia_household")},
	]}

			// END CONFIG
			