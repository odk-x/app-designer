
// A map of table ids to their instance columns (or _id if we couldn't pull it)
var display_cols = {"household_member": "name", "femaleClients": "_id", "maleClients": "_id", "exampleForm": "name", "Ethiopia_members": "name", "Tea_types": "Name", "plot": "plot_name", "Tea_inventory": "_id", "geopoints": "_id", "datesTest": "test", "selects": "_id", "visit": "_id", "Ethiopia_household": "household_id", "Tea_houses": "Name"}
// List of tables to edit with formgen. If a table isn't found in this list, we edit it with survey instead
var allowed_tables = ["household_member", "femaleClients", "maleClients", "exampleForm", "Ethiopia_members", "Tea_types", "plot", "Tea_inventory", "geopoints", "datesTest", "selects", "Ethiopia_household", "Tea_houses"];
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

	main_col = "plot_name";
	table_id = "plot";
	global_which_cols_to_select = "plot.*, COUNT(*) AS num_visits"
	global_join = "visit ON plot._id = visit.plot_id"
	colmap = [
		{"column": "plot_name", "callback": function(e, c, d) { return c; }},
		{"column": "location_latitude", "display_name": "Latitude: "},
		{"column": "location_longitude", "callback": br("Longitude")},
		{"column": "planting", "display_name": "Crop: "},
		{"column": "num_visits", "callback": function(e, c, d) {
			num = Number(c);
			return "<span style=\"color: blue; text-decoration: underline;\" onClick='openVisits(\""+d.getData(0, 'plot_name')+"\")'>" + c + " visit" + (num == 1 ? "" : "s") + "</span>";
		}},
		{"callback": makeIframe},
		{"callback": makeButtons},
	]
	document.getElementById("header").id = "title"

}

	var openVisits = function(id) {
		odkTables.openTableToListView(null, "visit", "plot_name = ?", [id], "config/assets/visit_list.html#visit/plot_name = ?/" + id);
	}
	var newVisit = function() {
		odkTables.addRowWithSurvey({}, "visit", "visit", null, {"plot_id": row_id, "date": odkCommon.toOdkTimeStampFromDate(new Date())});
	}
	var raw = "SELECT date, plant_height FROM visit WHERE plot_id = ?";
	var makeIframe = function() {
		var src = "plot_graph.html#bar/visit/" + JSON.stringify(["date", "plant_height"]) + "/"+raw+"/" + JSON.stringify([row_id]) + "/History of plot " + cached_d.getData(0, "plot_name");
		return "<iframe scrolling='no' style='width: 70vw; min-height: 100vw; border: none;' id='iframe' src='"+src+"' onLoad='doGraphQuery();' />";
	}
	var makeButtons = function() {
		return "<button onClick='newVisit()'>New Visit</button><br /><button onClick='alert(\"TODO\")'>Compare Plots</button>"
	}
	var doGraphQuery = function() {
		document.getElementById("iframe").contentWindow.show_value = function(num, percent) { return num + " cm" };
		odkData.arbitraryQuery("visit", raw, [row_id], 10000, 0, document.getElementById("iframe").contentWindow.success, function(e) {
			alert(e);
		});
	}
