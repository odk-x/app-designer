// Helper function to make the sections of a query. It used to return the arguments to odkData.query so you could call
// odkData.query.apply(make_query(...)) but we need functionality that's not available in odkData.query, so we just pull
// random indexes out of its result array whenever we need them and use that to call arbitraryQuery
var make_query = function make_query(search, apply_where, for_total, cols_to_select) {
	// bind args
	var query_args = []
	// where clause, will be populated
	var where = null;
	// If we have a search,
	if (search != null && search.length > 0) {
		where = " " + display_col + " LIKE ?";
		query_args = ["%" + search + "%"];
	}
	join = ""
	// If we have a global join from the customJsOl configuration, apply that.
	if (global_join != null && global_join != undefined && global_join.trim().length > 0) {
		join = global_join;
	}
	var from = " FROM " + table_id;
	var group = " GROUP BY " + global_group_by;
	join = join.length > 0 ? " JOIN " + join : ""
	if (!apply_where) {
		from = "";
		where = null;
		group = "";
		join = "";
	}
	where = where != null ? " WHERE " + where : ""
	var raw = "SELECT " + cols_to_select + from + join + where + group
	console.log(raw);
	return [raw, query_args];
}
frameworkLoaded();
