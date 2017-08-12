
// If you set a display_col, that column will be shown in the large text for each row item.
// If you don't set one, we'll try and use the table id to pull it from this variable, which stores the
// instance column for each table or _id if it couldn't be found.
var display_cols = {"household_member": "name", "femaleClients": "_id", "maleClients": "_id", "exampleForm": "name", "Ethiopia_members": "name", "Tea_types": "Name", "plot": "plot_name", "Tea_inventory": "_id", "geopoints": "_id", "datesTest": "test", "selects": "_id", "visit": "_id", "Ethiopia_household": "household_id", "Tea_houses": "Name"}
// List of tables we can add/edit with formgen, if the table isn't found in this list, we'll use survey
var allowed_tables = ["household_member", "femaleClients", "maleClients", "exampleForm", "Ethiopia_members", "Tea_types", "plot", "Tea_inventory", "geopoints", "datesTest", "selects", "Ethiopia_household", "Tea_houses"]
// A map of table ids to tokens that can be used to localize their display name
var display_col_wrapper = null;
var clicked = function(table_id, row_id) {
	odkTables.openDetailView({}, table_id, row_id);
}
var customJsOl = function customJsOl() {
	
	display_col = "client_id";
	display_subcol = [["Age: ", "age", true], ["Randomization: ", "randomization", true]];
	display_subcol = [
		{"column": "age", "display_name": "Age: ", "newline": true},
		{"column": "randomization", "display_name": "Randomization: ", "newline": true}
	]
	table_id = "femaleClients";

	document.getElementById("search").insertAdjacentHTML("beforeend", "<button onClick='addClient()' style='margin-left: 15%; min-height: 1.5em; width: 70%; display: block;'>Add Client</button>")
	document.getElementById("search").insertAdjacentHTML("beforeend", "<button onClick='graphView()' style='margin-left: 15%; min-height: 1.5em; width: 70%; display: block;'>Graph View</button>")

}
var customJsSearch = function customJsSearch() {
	
}

	var addClient = function() {
		odkTables.launchHTML(null, "config/assets/formgen/femaleClients/screenClient.html#" + newGuid());
	}
	var graphView = function() {
		odkTables.launchHTML(null, "config/assets/hope_graph_view.html");
	}


var embedded = false;
var forMapView = false;
