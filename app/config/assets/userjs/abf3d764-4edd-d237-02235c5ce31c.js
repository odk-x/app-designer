
			var metadata = {};
			var list_views = {};
			var menu = ["Empty menu!", null, []];
			// BEGIN CONFIG
			
	list_views = {
		"plot": "config/assets/plot_list.html",
		"visit": "config/assets/visit_list.html",
	}
	menu = {"label": "Plots demo", "type": "menu", "contents": [
		{"label": "View Plots", "type": "list_view", "table": "plot"},
		{"label": "View Plots on a Map", "type": "js", "function": function() { odkTables.openTableToMapView(null, "plot", null, null, "config/assets/plot_map.html#plot"); }},
		{"label": "View Visits", "type": "list_view", "table": "visit"},
		{"label": "View Reports", "type": "menu", "contents": [
			{"label": "View Overall Data", "type": "html", "file": "config/assets/view_overall_data.html"},
			{"label": "View Single Plot Data", "type": "html", "file": "config/assets/single_plot_data_list.html"},
			{"label": "View Comparison Data", "type": "menu", "contents": [
				{"label": "Compare by plant type", "type": "html", "file": "config/assets/compare_list_planting.html#plot/STATIC/SELECT * FROM plot GROUP BY planting/[]/distinct values of planting"},
				{"label": "Compare by soil type", "type": "html", "file": "config/assets/compare_list_soil.html#plot/STATIC/SELECT * FROM plot JOIN visit ON visit.plot_id = plot._id GROUP BY soil/[]/distinct values of soil type"},
				{"label": "Compare all plots", "type": "html", "file": "config/assets/compare_all_plots.html"},
			]}
		]}
	]}

			// END CONFIG
			