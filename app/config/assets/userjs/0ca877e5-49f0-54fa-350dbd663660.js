
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
	
	display_subcol = [];
	table_id = "plot";

		display_col = "planting";
		clicked = function clicked(table_id, row_id, d, i) {
			odkTables.launchHTML(null, "config/assets/plot_data.html#" + all_with_this_type[d.getData(i, "planting")].join("/"));
		}
		odkData.arbitraryQuery("plot", "SELECT plot_name, planting FROM plot", [], 10000, 0, function(d) {
			for (var i = 0; i < d.getCount(); i++) {
				var planting = d.getData(i, "planting");
				if (all_with_this_type[planting] === undefined) {
					all_with_this_type[planting] = []
				}
				all_with_this_type[planting] = all_with_this_type[planting].concat(d.getData(i, "plot_name"))
			}
		}, function(e) { alert(e); });

}
var customJsSearch = function customJsSearch() {
	
}

	var all_with_this_type = {};


var embedded = false;
var forMapView = false;
