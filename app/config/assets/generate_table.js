// SET THIS
var table_id = "";
// A list of options to appear in the dropdown menu for group by.
// If you don't set it, all columns will appear. If you set it to an empty list, the
// group by button won't be shown. 
var allowed_group_bys = null;
// If set, "JOIN :global_join" is added to the query. So for Tea_houses, you might set it to
// Tea_types ON Tea_types._id = Tea_houses.Name
// There is better documentation on this in README.md
var global_join = "";
// Set this! The column id for the column to display in big text for each item in the list
var display_col = "";
// Stores the columns in the table, automatically populated
var cols = [];
// Starting limit, displays 20 elements per page. The user can change this via a dropdown menu
var limit = 20;
// Starting offset, next/previous page changes this
var offset = 0;
// Updated internally by get_total_rows, just stores the total number of possible results for the query
// It doesn't store the actual number of results from the query because then if the user had it set to
// show 20 results per page, it would show "Displaying rows 1-20 of 20" instead of the actual total
var total_rows = 0;
// If we try to perform the user's search and it comes back with no results, we set try_more_cols to true
// and search again. If the display_col is refrigerator_id, we'll make a query like
// SELECT * FROM refrigerators WHERE refrigerator_id LIKE %searched term%
// If that comes back with no results, we'll set try_more_cols to true, which tells make_query to add
// an extra where clause for every column in displaycols, so make something like
// SELECT * FROM refrigerators WHERE refrigerator_id LIKE %searched term% OR facility_name LIKE %searched term% OR catalog_id LIKE %searched term%
var try_more_cols = false;
// We pass these via the url hash when we're grouping by something and we open the collection view, they're simply AND'd to
// all queries
var global_where_clause = null;
var global_where_arg = null;
// Passed in via the url hash when the user selects something from the group by menu and we open a group by view
var global_group_by = null;
// If you have a join table with some columns with the same column ids as the main table, you might
// need to set this. It's better documented with examples in README.md
var global_which_cols_to_select = "*"
// Cache d.getMetadata() from queries for faster translation
var metadata = null;
// update_total_rows uses this to cache the value of the searchbox, and it will skip its query if the
// value is unchaned and its `force` argument is false
var cached_search = null;
// cached values for use in doSearch
var global_line_height = null;
var global_displays_width = null;

var global_static = false;
var global_static_args = false;
var global_human_readable_what = false;


// Helper function to add a row with formgen or survey. If the table is in allowed_tables it opens
// with formgen, otherwise survey
var add = function() {
    if (allowed_tables.indexOf(table_id) >= 0) {
        page_go("config/assets/formgen/"+table_id+"#" + newGuid());
    } else {
        // TODO
        //odkTables.addRowWithSurveyDefault({}, table_id);
        odkTables.addRowWithSurvey({}, table_id, table_id, null, null);
    }
}

// Function run on page load
var ol = function ol() {
    document.getElementById("back").innerText = _t("Back");
    document.getElementById("add").innerText = _t("Add Row");
    document.getElementById("group-by").innerText = _t("Group by");
    document.getElementById("group-by-go").innerText = _t("Go");
    document.getElementById("prev").innerText = _t("Previous Page");
    document.getElementById("next").innerText = _t("Next Page");
    document.getElementById("search-button").innerText = _t("Search");
    // The sections of the url hash delimited by slashes
    var sections = document.location.hash.substr(1).split("/");
    // The first section is always the table id
    table_id = sections[0]
    // If we have more than one section, we must either be in a group by view or a collection view
    if (sections.length == 0) {
        // let's hope the user configured one
    } else if (sections.length == 1) {
        // we should have a table id now
    } else if (sections.length == 2) {
        global_group_by = sections[1];
    } else if (sections.length == 3) {
        global_where_clause = sections[1]
        if (global_where_clause && !(global_where_clause.indexOf(".") >= 0)) global_where_clause = table_id + "." + global_where_clause
        global_where_arg = sections[2]
    } else {
        var selector = sections[1];
        if (selector == "STATIC") {
            global_static = sections[2];
            global_static_args = jsonParse(sections[3]);
            global_human_readable_what = sections[4];
        } else {
            alert(_t("Unknown selector in query hash") + ": " + selector);
        }
    }
    // SET THIS
    display_subcol = [];
    // SET THIS
    display_col = null;
    customJsOl();
    // If there are no columns the user is allowed to group by, disable the group by button
    if (allowed_group_bys != null && allowed_group_bys.length == 0) document.getElementById("group-by").style.display = "none"
    // If there are some columns, get them into the standard format, a list of pairs [:column_name, :display_name]
    // if true is passed (as a boolean, not a string) as the display name, pretty(column_name) is used as the display name
    if (allowed_group_bys != null && allowed_group_bys.length > 0) {
        for (var i = 0; i < allowed_group_bys.length; i++) {
            if (typeof(allowed_group_bys[i]) == "string") {
                allowed_group_bys[i] = [allowed_group_bys[i], true];
            }
        }
    }
    // If the user didn't set a display column (the one to show in the big text), then try and pull it
    // from the table's instance column
    if (display_col == null) {
        display_col = display_cols[table_id];
    }
    // If we fail, harshly warn the user (even though we're not actually bailing out)
    if (display_col == undefined || display_col == null) {
        alert(_t("Couldn't guess instance col. Bailing out, you're on your own."));
        display_col = "_id"; // BAD IDEA
    }
    // Try and load the contents of the search box, limit dropdown and offset (i.e. what page we're on) from
    // the session variables, so we can maintain them across rotations
    search = odkCommon.getSessionVariable(table_id + ":search");
    if (search != undefined && search != null && search.length > 0) {
        document.getElementById("search-box").value = search;
    }
    // odkCommon.getSessionVariable returns undefined if the key wasn't found, and Number(undefined) = NaN
    limit = Number(odkCommon.getSessionVariable(table_id + ":limit", limit));
    if (isNaN(limit)) limit = 20;
    offset = Number(odkCommon.getSessionVariable(table_id + ":offset"));
    if (isNaN(offset)) offset = 0;
    // This sets the value of the dropdown menu to limit
    var options = document.getElementById("limit").children;
    var res = 0;
    for (var i = 0; i < options.length; i++) {
        if (options[i].value == limit.toString()) {
            res = i;
            break;
        }
    }
    document.getElementById("limit").selectedIndex = res;
    // Make sure we have a table id before continuing, if we don't, try and get it from getViewData
    // This will slow down page loading by a good second, so just please set it in customJsOl
    if (table_id.length == 0) {
        alert(_t("No table id! Please set it in customJsOl or pass it in the url hash"));
        odkData.getViewData(function success(d) {
            table_id = d.getTableId();
            olHasTableId();
        }, function failure(e) {
            alert(e);
        }, 0, 0);
    } else {
        olHasTableId();
    }
}
// Just a continuation of the onLoad function
var olHasTableId = function olHasTableId() {
    // Put the translated display name of the table that's open in the header
    document.getElementById("table_id").innerText = display(localized_tables[table_id]);
    odkCommon.registerListener(function doaction_listener() {
        var a = odkCommon.viewFirstQueuedAction();
        if (a != null) {
            // may have added a new row, so force a refresh of the total number of rows
            update_total_rows(true);
            odkCommon.removeFirstQueuedAction();
        }
    });
    update_total_rows();
}
// Called when the user changes the limit dropdown menu.
// Attempts to change `limit` then calls doSearch
var newLimit = function newLimit() {
    var newlimit = Number(document.getElementById("limit").selectedOptions[0].value);
    if (!isNaN(newlimit)) {
        limit = newlimit;
    }
    doSearch();
}
// Updates the number of total rows that the query could potentially return, so when you see "Showing rows 1-20 of 841", this
// is the function that calcualted the 841.
// Will run its query then update `total_rows` and call doSearch
var update_total_rows = function update_total_rows(force) {
    var search = document.getElementById("search-box").value;
    if (search == cached_search && !force) {
        console.log("Search was unchanged!")
        // TODO this seems wrong
        doSearch();
        return;
    }
    cached_search = search;
    // Function to be called when we get the results of the query
    var success = function success(d) {
        total_rows = d.getData(0, "COUNT(*)");
        doSearch();
    };
    var failure = function failure(e) {
        alert(_t("Unexpected error ") + e);
    };
    // I don't really remember why these are different cases, but having them both use the query currently in the else
    // clause will cause it to return the wrong number of results in a group by view
    //var the_query = make_query(search, 10000, 0);
    if (global_group_by != null && global_group_by != undefined && global_group_by.trim().length > 0) {
        var the_query = make_query(search, false, true, "COUNT(*)")
        //var raw = "SELECT COUNT(*) FROM (SELECT * FROM " + table_id + (the_query[9].length > 0 ? " JOIN " + the_query[9] : "") + " GROUP BY " + the_query[2] + ")";
        //odkData.arbitraryQuery(table_id, raw, the_query[1], the_query[6], the_query[7], success, failure);
        // TEST
        odkData.arbitraryQuery(table_id, the_query[0], the_query[1], 10000, 0, success, failure);
    } else {
        var the_query = make_query(search, true, true, "COUNT(*)")
        //var raw = "SELECT COUNT(*) FROM " + table_id + (the_query[9].length > 0 ? " JOIN " + the_query[9] : "") + (the_query[0] ? " WHERE " + the_query[0] : "") + (the_query[2] ? " GROUP BY " + the_query[2] : "");
        console.log(the_query[0]);
        odkData.arbitraryQuery(table_id, the_query[0], the_query[1], 10000, 0, success, failure);
    }
}
// Called when the user clicks the next button. This can't make offset too big because doSearch will
// disable the button before that can happen
var next = function next() {
    offset += limit;
    doSearch();
}
// Called when the user clicks the next button. This can make the offset negative but doSearch will correct it
var prev = function next() {
    offset -= limit;
    doSearch();
}
// Helper function to make the sections of a query. It used to return the arguments to odkData.query so you could call
// odkData.query.apply(make_query(...)) but we need functionality that's not available in odkData.query, so we just pull
// random indexes out of its result array whenver we need them and use that to call arbitraryQuery
var make_query = function make_query(search, apply_where, for_total, cols_to_select) {
    if (global_static && global_static_args) {
        if (!for_total) {
            return [global_static, global_static_args];
        } else {
            return ["SELECT " + cols_to_select + " FROM (" + global_static + ")", global_static_args]
        }
    }
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
                // the configurer can set the column name to null to only display the raw text, see README.md
                if (display_subcol[i][1] == null) continue;
                // otherwise add the column to the list of columns to try
                cols = cols.concat(display_subcol[i][1]);
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
    // If we're in a collection view, apply that
    if (global_where_clause != undefined && global_where_clause != null) {
        if (where != null && where.trim() != "") {
            where += " AND ";
        }
        if (where == null) where = "";
        // TESTING
        var global_where_clause_temp = global_where_clause
        if (global_where_clause_temp.indexOf(".") > 0) global_where_clause_temp = global_where_clause_temp.split(".", 2)[1]

        where += global_where_clause_temp;
        // this is a bit of a hack, if we were passed 'refrigerator_type IS NULL' then don't put anything in the bindargs because
        // there's no question mark in the clause
        if (!(global_where_clause.indexOf("IS NULL") > 0)) {
            query_args = query_args.concat(global_where_arg);
        }
    }
    // If we're in a group by view, apply that. We have to add the table id because people like to group by things from join tables
    var group_by = null;
    if (global_group_by != undefined && global_group_by != null) {
        //group_by = table_id + "." + global_group_by
        group_by = global_group_by;
    }
    join = ""
    // If we have a global join from the customJsOl configuration, apply that.
    if (global_join != null && global_join != undefined && global_join.trim().length > 0) {
        join = global_join;
    }
    where = (where ? " WHERE " + where : "")
    if (!apply_where) {
        var raw = "SELECT COUNT(*) FROM (SELECT * FROM " + table_id + (join.length > 0 ? " JOIN " + the_query[9] : "") + " GROUP BY " + group_by + ")";
        return [raw, []]
    }
    var raw = "SELECT " + cols_to_select + " FROM " + table_id + (join.length > 0 ? " JOIN " + join : "") + where + (group_by ? " GROUP BY " + group_by : "")
    console.log(raw);
    //return [where, query_args, group_by, null, null, null, limit, offset, false, join, global_which_cols_to_select];
    return [raw, query_args];
}
// Helper function to populate cols with a list of the columns in the table. If no allowed_group_bys was set, we'll use that to
// populate the list of group by columns. Will only do anything on the first time its run
var getCols = function getCols() {
    if (cols.length == 0) {
        // Don't use global_which_cols_to_select or we will get extra columns in there that we can't actually group by
        odkData.arbitraryQuery(table_id, "SELECT * FROM " + table_id + " WHERE 0", [], 0, 0, function success(d) {
            metadata = d.getMetadata();
            // Skip all the columns that start with underscores
            for (var i = 0; i < d.getColumns().length; i++) {
                var col = d.getColumns()[i];
                if (col[0] != "_") {
                    cols = cols.concat(col);
                }
            }
            document.getElementById("group-by").disabled = false;
            // If we're in a group by view or a collection view, 
            // TODO document
            if (global_group_by != null && global_group_by != undefined && global_group_by.trim().length > 0) {
                document.getElementById("group-by").style.display = "none";
                display_subcol = [];
                display_col = global_group_by;
            } else if (global_where_clause != null && global_where_clause != undefined && global_where_clause.trim().length > 0) {
                document.getElementById("group-by").style.display = "none";
            } else if (global_static) {
                document.getElementById("group-by").style.display = "none";
            }
        }, function failure(e) {
            alert(_t("Could not get columns: ") + e);
        }, 0, 0);
    }
}
// Called on page load and when the user changes what they had typed into the search box
var doSearch = function doSearch() {
    // Make sure offset is positive and disable the next and previous buttons if they would take us too far
    offset = Math.max(offset, 0);
    document.getElementById("prev").disabled = offset <= 0
    document.getElementById("next").disabled = offset + limit >= total_rows
    var list = document.getElementById("list");
    // Gets what the user typed into the search box
    var search = document.getElementById("search-box").value;
    // Set session variables that we read in onLoad, so if we rotate the screen or something we'll still
    // have the same limit, offset and search
    odkCommon.setSessionVariable(table_id + ":search", search);
    odkCommon.setSessionVariable(table_id + ":limit", limit);
    odkCommon.setSessionVariable(table_id + ":offset", offset);
    // Populate the columns of the row so we can make the dropdown menu
    getCols()
    // Make a query for the results to put on the page and run it
    var the_query = make_query(search, true, false, global_which_cols_to_select);
    //var raw = "SELECT " + the_query[10] + " FROM " + table_id + (the_query[9].length > 0 ? " JOIN " + the_query[9] : "") + (the_query[0] ? " WHERE " + the_query[0] : "") + (the_query[2] ? " GROUP BY " + the_query[2] : "")
    console.log(the_query[0]);
    odkData.arbitraryQuery(table_id, the_query[0] , the_query[1], limit, offset, function success(d) {
        // Cache metadata for use in translating the column names later
        metadata = d.getMetadata();
        // If we have no results
        if (d.getCount() == 0) {
            // try more columns first
            if (!try_more_cols) {
                list.innerText = _t("Still searching...");
                try_more_cols = true;
                update_total_rows(true)
                return;
            } else {
                // if that doesn't work
                list.innerText = _t("No results");
                document.getElementById("navigation-text").innerText = ""
            }
        } else {
            // Clear the results of the last doSearch
            list.innerHTML = "";
            try_more_cols = false;
        }
        // in displaying rows x-y of z, this is the z
        var display_total = Number(total_rows);
        // trying to make a computer speak english is hard
        var rows = ""
        if (global_group_by == null && global_where_clause == null && !global_human_readable_what) {
            rows = _t("rows ");
        }
        var newtext = _t("Showing ") + rows + (offset + (total_rows == 0 ? 0 : 1)) + "-" + (offset + d.getCount()) + _t(" of ") + display_total;
        // if we have a group by, mention that we're in a group by view
        if (global_group_by != null && global_group_by != undefined && global_group_by.trim().length > 0) {
            newtext += _t(" distinct values of ") + get_from_allowed_group_bys(allowed_group_bys, global_group_by, false, metadata);
        }
        // if we're in a collection, mention that
        if (global_where_clause != null && global_where_clause != undefined && global_where_clause.trim().length > 0) {
            var where_col = global_where_clause.split(" ")[0];
            if (where_col.indexOf(".") >= 0) where_col = where_col.split(".")[1];
            newtext += _t(" rows where ") + get_from_allowed_group_bys(allowed_group_bys, global_where_clause.split(" ")[0], false, metadata) + _t(" is ") + _tc(table_id, where_col, global_where_arg);
        }
        if (global_human_readable_what) {
            hrw = _tu(global_human_readable_what);
            for (var i = 0; i < global_static_args.length; i++) {
                hrw = hrw.replace("?", global_static_args[i]);
            }
            newtext += " " + hrw
        }
        // we may have been passed html via global_human_readable_what
        document.getElementById("navigation-text").innerHTML = newtext;
        // for each row in the result set, make an element and add it to `list`
        // heirarchy looks something like this
        // li
        //      displays
        //          main display column value
        //          sub display 1
        //          sub display 2, etc...
        //      buttons
        //          edit
        //          delete
        for (var i = 0; i < d.getCount(); i++) {
            var li = document.createElement("div");
            var displays = document.createElement("span");
            displays.style.lineHeight = "normal";
            displays.classList.add("displays");
            var mainDisplay = document.createElement("div")
            mainDisplay.classList.add("main-display");
            mainDisplay.innerText = _tc(table_id, display_col, d.getData(i, display_col));
            if (global_group_by) mainDisplay.innerText = pretty(mainDisplay.innerText);
            displays.appendChild(mainDisplay)
            var subDisplay = null;
            // we keep this variable for use in poor-man's vertical centering later
            var addedSubDisplays = 0
            // This constructs the display subcolumns from display_subcol. Information on how to use display_subcol is in README.md
            // Basically it's a list of triplets, ["some literal text to display", "some_column_id_to_display_the_value_of", newline]
            // if newline is true, we skip down to a new sub-display div (and append the last one). Otherwise we continue appending
            // to the existing div
            // The user can specify either a literal string to display, or a function that will be passed the value of the column,
            // what the function returns will be displayed
            // They can also just specify true to get the value of the column pretty printed and nothing else
            // They can also give a string in the first position and null in the second position to insert that text and nothing else
            // the value in the third position is still honored
            for (var j = 0; j < display_subcol.length; j++) {
                if (subDisplay == null) {
                    subDisplay = document.createElement("div")
                    subDisplay.classList.add("sub-display");
                }
                if (typeof(display_subcol[j][0]) == "string") {
                    subDisplay.appendChild(document.createTextNode(_tu(display_subcol[j][0])))
                    if (display_subcol[j][1] != null) {
                        subDisplay.appendChild(document.createTextNode(_tc(table_id, display_subcol[j][1], d.getData(i, display_subcol[j][1]))))
                    }
                } else if (display_subcol[j][0] === true) {
                    subDisplay.appendChild(document.createTextNode(pretty(d.getData(i, display_subcol[j][1]))))
                } else {
                    subDisplay.appendChild(document.createTextNode(display_subcol[j][0](subDisplay, d.getData(i, display_subcol[j][1]), d, j)))
                }
                if (display_subcol[j][2]) {
                    displays.appendChild(subDisplay)
                    addedSubDisplays++;
                    subDisplay = null;
                }
            }
            // if the user forgot to set true for the third position in the last triplet in display_subcol, add it anyways
            if (subDisplay != null) {
                displays.appendChild(subDisplay)
                addedSubDisplays++;
            }
            li.appendChild(displays);
            li.classList.add("li");
            li.style.display = "inline-block";
            var buttons = document.createElement("div");
            buttons.classList.add("buttons");
            var edit = document.createElement("button");
            edit.innerText = _t("Edit");
            var _delete = document.createElement("button");
            _delete.innerText = _t("Delete");
            // Add event listeners for the edit and delete buttons, but also one for displays that will
            // launch a detail view if we're not in a group by view, otherwise add the collection view
            (function(edit, _delete, i, d) {
                edit.addEventListener("click", function() {
                    if (allowed_tables.indexOf(table_id) >= 0) {
                        page_go("config/assets/formgen/"+table_id+"#" + d.getData(i, "_id"));
                    } else {
                        // TODO
                        //odkTables.editRowWithSurveyDefault({}, table_id, d.getData(i, "_id"));
                        odkTables.editRowWithSurvey({}, table_id, d.getData(i, "_id"), table_id, null, null);
                    }
                });
                displays.addEventListener("click", function() {
                    console.log(global_group_by);
                    if (global_group_by == null || global_group_by == undefined || global_group_by.trim().length == 0) {
                        odkTables.openDetailView({}, table_id, d.getData(i, "_id"));
                    } else {
                        //odkTables.launchHTML({}, clean_href() + "#" + table_id + "/" + global_group_by + (d.getData(i, global_group_by) == null ? " IS NULL " : " = ?" ) + "/" + d.getData(i, global_group_by));
                        var global_group_by_temp = global_group_by
                        if (global_group_by_temp.indexOf(".") > 0) global_group_by_temp = global_group_by_temp.split(".", 2)[1]
                        odkTables.launchHTML({}, clean_href() + "#" + table_id + "/" + global_group_by_temp + (d.getData(i, global_group_by) == null ? " IS NULL " : " = ?" ) + "/" + d.getData(i, global_group_by));
                    }
                });
                _delete.addEventListener("click", function() {
                    if (!confirm(_t("Please confirm deletion of row ") + d.getData(i, "_id"))) {
                        return;
                    }
                    odkData.deleteRow(table_id, null, d.getData(i, "_id"), function(d) {
                        update_total_rows(true);
                    }, function(e) {
                        alert(_t("Failed to _delete row - ") + JSON.stringify(e));
                    });
                });
            })(edit, _delete, i, d);
            buttons.appendChild(edit);
            buttons.appendChild(_delete);
            // If we're in a group by view, don't show edit/delete buttons
            if (!global_group_by) {
                li.appendChild(buttons)
            }
            var hr2 = document.createElement("div")
            var hr = document.createElement("div")
            hr.classList.add("status");
            if (global_group_by == null || global_group_by == "undefined" || global_group_by.trim().length == 0) {
				hr.setAttribute("data-status", d.getData(i, "_savepoint_type"))
				hr.setAttribute("data-sync", d.getData(i, "_sync_state")) // no css rules for this one
            } else {
				hr.setAttribute("data-status", "COMPLETE")
				hr.setAttribute("data-sync", "synced")
            }
            list.appendChild(li);
            // We cache these two values because they're going to be the same for each item in the list, and clientWidth and clientHeight are very expensive
            // I used to call clientHeight and clientWidth for each iteration of this loop and the callback took ~250ms, now it takes ~40 for 20 rows
            // For 1000 rows, ~850ms with the caching, almost 60 seconds without
            // This (sort of) vertically centers the buttons
            if (global_line_height == null) {
                global_line_height = li.clientHeight.toString() + "px";
            }
            li.style.lineHeight = global_line_height;
            // This makes it so if you click anywhere on the row other than the buttons, it opens a detail view
            if (global_displays_width == null) {
                global_displays_width = (li.clientWidth - buttons.clientWidth - 10).toString() + "px";
            }
            displays.style.width = global_displays_width;
            list.appendChild(hr);
        }
        customJsSearch();
    }, function(d) {
        alert(_t("Failure! ") + d);
    });
}
// Called when the user clicks the group by button, or on load if we're in a group by view or a collection view
var groupBy = function groupBy() {
    var list = document.getElementById("group-by-list");
    // If the user didn't set a list of allowed group bys, add every column
    if (allowed_group_bys == null) {
        for (var i = 0; i < cols.length; i++) {
            var child = document.createElement("option");
            child.value = cols[i]; // value is the column id, text is the translated column name
            child.innerText = displayCol(cols[i], metadata);
            list.appendChild(child);
            // Not sure if this is important or not
            if (global_group_by == cols[i]) {
                list.selectedOptions = [child];
            }
        }
    } else {
        // If they did specify it, loop through the allowed group bys, and delegate figuring out what to display
        // to get_from_allowed_group_bys in formgen_common
        for (var i = 0; i < allowed_group_bys.length; i++) {
            var child = document.createElement("option");
            child.value = allowed_group_bys[i][0];
            child.innerText = _tu(get_from_allowed_group_bys(allowed_group_bys, allowed_group_bys[i][1], allowed_group_bys[i], metadata));
            list.appendChild(child);
            // Not sure if this is important or not
            if (global_group_by == cols[i]) {
                list.selectedOptions = [child];
            }
        }
    }
    // If there's only one thing to group by, just do it
    if (list.children.length == 1) {
        list.selectedOptions = [list.children[0]];
        groupByGo();
    }
    // Now that the user has hit the group by button, hide it and show the list
    list.style.display = "inline-block";
    document.getElementById("group-by").style.display = "none";
    document.getElementById("group-by-list").addEventListener("change", groupByGo);
    document.getElementById("group-by-list").addEventListener("blur", groupByGo);
    document.getElementById("group-by-list").focus()
    // This button doesn't actually go anywhere but it will trigger the blur listener in
    // the case that the user wants to group by the first thing in the list
    var fake_button = document.createElement("button")
    fake_button.appendChild(document.createTextNode("Go"))
    document.getElementById("navigation").insertBefore(fake_button, document.getElementById("limit"));
    document.getElementById("limit").style.display = "none";
}
// This is called when the user selects a group by option
var groupByGo = function groupByGo() {
    var go = true;
    if (global_group_by != null && global_group_by != undefined && global_group_by.trim().length > 0) {
        go = false;
    } else {
        var list = document.getElementById("group-by-list");
        global_group_by = list.selectedOptions[0].value;
    }
    //window.location.hash = "#" + table_id + "/" + global_group_by
    if (go) {
        odkTables.launchHTML({}, clean_href() + "#" + table_id + "/" + global_group_by);
        //update_total_rows(true);
    }
}
