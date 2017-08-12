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
		// At first, just try searching in the main display column. If we get no results for this,
		// we'll set try_more_cols and try again. If try_more_cols is set, we'll add an "OR" statement for
		// each display subcol
		var cols = [display_col];
		if (try_more_cols) {
			// if we got no results the first time around, add all the display subcol column ids
			for (var i = 0; i < display_subcol.length; i++) {
				// the configurer omit the column to only display the raw text, see README.md
				if (!("column" in display_subcol[i])) continue;
				// otherwise add the column to the list of columns to try
				cols = cols.concat(display_subcol[i]["column"]);
			}
		}
		// For each column in cols, put it in the where clause and put search in the bindargs
		where = "("
		for (var i = 0; i < cols.length; i++) {
			if (i != 0) {
				where += " OR "
			}
			where += cols[i] + " LIKE ?"
			query_args = query_args.concat("%" + search + "%");
		}
		where += ")"
	}
	join = ""
	// If we have a global join from the customJsOl configuration, apply that.
	if (global_join != null && global_join != undefined && global_join.trim().length > 0) {
		join = global_join;
	}
	var from = " FROM " + table_id;
	if (!apply_where) {
		from = "";
		where = null;
	}
	where = where != null ? " WHERE " + where : ""
	join = join.length > 0 ? " JOIN " + join : ""
	var raw = "SELECT " + cols_to_select + from + join + where
	console.log(raw);
	return [raw, query_args];
}
frameworkLoaded();
