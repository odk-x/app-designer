
			var metadata = {};
			var list_views = {};
			var menu = ["Empty menu!", null, []];
			// BEGIN CONFIG
			
	var send = function() {
		odkCommon.doAction(null, "org.opendatakit.services.sync.actions.activities.SyncActivity", {"componentPackage": "org.opendatakit.services", "componentActivity": "org.opendatakit.services.sync.actions.activities.SyncActivity"});
	}
	var newinstance = function newinstance(table, form) {
		return function() {
			var id = newGuid();
			if (form == table) form = "index";
			odkTables.launchHTML(null, "config/assets/formgen/"+table+"/" + form + ".html#" + id);
		}
	}
	list_views = {
		"femaleClients": "config/assets/femaleClients_list.html"
	}
	menu = {"label": "Hope Study" + "<br />xlsx not copied over yet, nothing will work", "type": "menu", "contents": [
		{"label": "Screen Female Client", "type": "js", "function": newinstance("femaleClients", "screenClient")},
		{"label": "Follow Up with Exsting Client", "type": "list_view", "table": "femaleClients"},
		{"label": "Send Data", "type": "js", "function": send}
	]};

			// END CONFIG
			