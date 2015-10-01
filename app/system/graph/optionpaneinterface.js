"use strict";

var paramHeight = Math.round(screen.height * .58);
var paramWidth = Math.round(screen.width * .75);

//handles events from html page
var selections;
var currentTab;
var graphSelection;

$(document).on('ready', function () {
	var info = data.getColumns();
	selections = jQuery.parseJSON(info);
	populateOperationSettings();
	populateBoxOperationSettings();
	populateXSettings();
	populateSliceSettings();
	populateYSettings();
	populateRSettings();
	populateBoxLabelSettings();
	populateBoxValueSettings();
	populateBoxIterationSettings();
	InitialMenuOptions(); 
	$(".category:not("+appropriateFolders()+")").hide();
	$('#scaling_buttons').hide();
	$('#scaling_button_pie_chart').hide();
	$('.observe_panel').hide();
	$("#title").on('click', function() {
		var graphSelection = "";
		if($('#graphtype').children('.selected').length != 0) {
			graphSelection = $('#graphtype').children('.selected')[0].id;
		}
		$("#title").siblings().removeClass("previous");
		if ( $("#title").hasClass('rolled_up') ) {
			$("#title").removeClass('rolled_up');
			$("#title").html("Edit");
			var selector = appropriateFolders();
			$("#title").siblings(":not("+selector+")").hide();
			$("#title").siblings(selector).slideDown('slow', function() {
				if(graphSelection == "Pie Chart") {
					$('#scaling_button_pie_chart').slideUp('fast', function() {});
				} else {
					$('#scaling_buttons').slideUp('fast', function() {});
				}
			});
		} else {
			// if we had a folder open, fold it up...
			if(currentTab !== null && currentTab !== undefined &&
			   currentTab !== "none") {
				// do not make any selection changes for the tab that is open
				// just close it.
				$("#" + currentTab).children(".selected").css('fontSize', '14pt');
				deactivateTitle($("#" + currentTab).children(".title"));
				deactivateTitle($("#" + currentTab + ":first-child").siblings(".title"));
				$("#" + currentTab).children(".unselected").slideUp('fast');
				currentTab = "none";
			}
			$("#title").addClass('rolled_up');
			$("#title").html("Click to Edit");
			$("#title").siblings().slideUp('slow', function() {
				if(graphSelection == "Pie Chart") {
					$('#scaling_button_pie_chart').slideDown('fast', function() {});
				} else {
					$('#scaling_buttons').slideDown('fast', function() {});
				}
			});
			selectGraph();
		}
	});
	//$('#color_selection').hide();
});

//First option menu: Select a graph type
function InitialMenuOptions() {
	currentTab = "graphtype";
	$('#title').html("Select a graph type");
	var category = $("#"+currentTab);
	category.hide();
	category.addClass("essential");
	category.addClass("category");
	category.empty();
	category.append($(createTitle("Graph Type")));
	category.append($(createItem("Bar Graph", "graphtype_choice", currentTab)));
	category.append($(createItem("Pie Chart", "graphtype_choice", currentTab)));
	category.append($(createItem("Box Plot", "graphtype_choice", currentTab)));
	category.append($(createItem("Line Graph", "graphtype_choice", currentTab)));
	category.append($(createItem("Scatter Plot", "graphtype_choice", currentTab)));
	$(category.children()).hide();
	var graphType = graph_data.getGraphType();
	loadFromKeyValueStore(category, graphType);
}

//does not work with keystore
//Second option menu: Select an aggregate mode
function populateOperationSettings() {
	currentTab = "operation";
	$('#title').html("Select an aggregation");
	var category = $("#"+currentTab);
	category.hide();
	category.addClass("bargraph");
	category.addClass("piechart");
	category.addClass("linegraph");
	category.addClass("scatterplot");
	category.addClass("category");
	category.empty();
	category.append($(createTitle("Operation")));
	category.append($(createItem("Simple Plot", "operation_choice", currentTab)));
	category.append($(createItem("Count", "operation_choice", currentTab)));
	category.append($(createItem("Sum", "operation_choice", currentTab)));
	category.append($(createItem("Average", "operation_choice", currentTab)));
	category.append($(createItem("Max", "operation_choice", currentTab)));
	category.append($(createItem("Min", "operation_choice", currentTab)));
	$(category.children()).hide();
	var graphOperation = graph_data.getGraphOp();
	loadFromKeyValueStore(category, graphOperation);
	return true;
}

function populateBoxOperationSettings() {
	currentTab = "box_operation";
	$('#title').html("Select a box");
	var category = $("#"+currentTab);
	category.hide();
	category.addClass("box_plot_component");
	category.addClass("category");
	category.empty();
	category.append($(createTitle("Operation")));
	category.append($(createItem("Single Column", "box_operation_choice", currentTab)));
	category.append($(createItem("Comparison Plot", "box_operation_choice", currentTab)));
	$(category.children()).hide();
	var graphOperation = graph_data.getBoxOperation();
	loadFromKeyValueStore(category, graphOperation);
	return true;
}

//Select X axis
function populateXSettings() {
	currentTab = "selectx";
	$('#title').html("Select an x axis");
	var category = $("#"+currentTab);
	category.hide();
	category.addClass("bargraph");
	category.addClass("linegraph");
	category.addClass("scatterplot");
	category.addClass("category");
	category.empty();
	category.append($(createTitle("X axis")));
	for(var k in selections) {
		category.append($(createItem(k, selections[k], currentTab)));
	}
	$(category.children()).hide();
	var graphX = graph_data.getGraphXAxis();
	loadFromKeyValueStore(category, graphX);
	return true;
}

//Select Slice dimension
function populateSliceSettings() {
	currentTab = "selectslice";
	$('#title').html("Select pie slice labels");
	var category = $("#"+currentTab);
	category.hide();
	category.addClass("piechart");
	category.addClass("notOperationCount");
	category.addClass("category");
	category.empty();
	category.append($(createTitle("Pie Slices")));
	for(var k in selections) {
		category.append($(createItem(k, selections[k], "selectx")));
	}
	$(category.children()).hide();
	var graphSlice = graph_data.getGraphXAxis();
	loadFromKeyValueStore(category, graphSlice);
	return true;
}

//Select Y axis: Must be numerical
function populateYSettings() {	
	currentTab = "selecty";
	$('#title').html("Select a y axis");
	var category = $("#"+currentTab);
	category.hide();
	category.addClass("bargraph");
	category.addClass("piechart");
	category.addClass("linegraph");
	category.addClass("scatterplot");
	category.addClass("notOperationCount");
	category.addClass("category");
	category.empty();
	category.append($(createTitle("Y axis")));
	for(var k in selections) {
		category.append($(createItem(k, selections[k], currentTab)));
	}
	$(category.children()).hide();
	var graphY = graph_data.getGraphYAxis();
	loadFromKeyValueStore(category, graphY);	
	return true;
}

//Select R scale: meant to scale (change the size of) dots based on numerical value
function populateRSettings() {	
	currentTab = "selectr";
	$('#title').html("scale the points by");
	var category = $("#"+currentTab);
	category.hide();
	category.addClass("scatterplot");
	category.addClass("category");
	category.empty();
	category.append($(createTitle("Scale Points")));
	category.append($(createItem("No Scaling", "Number", currentTab)));
	for(var k in selections) {
		category.append($(createItem(k, selections[k], currentTab)));
	}
	$(category.children()).hide();
	var graphR = graph_data.getGraphRAxis();
	loadFromKeyValueStore(category, graphR);	
	return true;
}

//Select Box source
function populateBoxLabelSettings() {
	currentTab = "box_source";
	$('#title').html("Select Labels");
	var category = $("#"+currentTab);
	category.hide();
	category.addClass("box_plot_component");
	category.addClass("notBoxOperationSingle");
	category.addClass("category");
	category.empty();
	category.append($(createTitle("Box Labels")));
	for(var k in selections) {
		category.append($(createItem(k, selections[k], currentTab)));
	}
	$(category.children()).hide();
	var boxSource = graph_data.getBoxSource();
	loadFromKeyValueStore(category, boxSource);
	return true;
}

// Select Box values
function populateBoxValueSettings() {	
	currentTab = "box_values";
	$('#title').html("Select values");
	var category = $("#"+currentTab);
	category.hide();
	category.addClass("box_plot_component");
	category.addClass("category");
	category.empty();
	category.append($(createTitle("Select Values")));
	for(var k in selections) {
		category.append($(createItem(k, selections[k], currentTab)));
	}
	$(category.children()).hide();
	var boxValues = graph_data.getBoxValues();
	loadFromKeyValueStore(category, boxValues);	
	return true;
}

// Select Iteration count
function populateBoxIterationSettings() {	
	currentTab = "iteration_counter";
	$('#title').html("Select an iteration column");
	var category = $("#"+currentTab);
	category.hide();
	category.addClass("box_plot_component");
	category.addClass("category");
	category.empty();
	category.append($(createTitle("Select Iteration Column")));
	for(var k in selections) {
		category.append($(createItem(k, selections[k], currentTab)));
	}
	$(category.children()).hide();
	var boxIterationColumn = graph_data.getBoxIterations();
	loadFromKeyValueStore(category, boxIterationColumn);	
	return true;
}
//Call to the native app and attempt to recover saved options for
//particular key
function loadFromKeyValueStore(category, priorValue) {
	var prevEl;
	manageInvalidInputs(category);
	category.show();
	category.children(".title").show();
	if(priorValue !== null && priorValue !== null && priorValue !== "") {
		prevEl = category.children().filter(function() {
			return $(this).text() === priorValue;
		});
	}
	// if the priorValue (if any) is still valid, mark it as the 
	// prior value and as selected.
	if ( prevEl !== null && prevEl !== undefined && !prevEl.hasClass('invalid') ) {
		prevEl.addClass('previous');
		prevEl.removeClass("unselected");
		prevEl.addClass('selected');
	}
	// show everything...
	category.children(":not(.invalid)").slideDown('slow', function() {});
}

//Generic function that populates title with given string
function createTitle(title) {
	var div = document.createElement("div");
	$(div).addClass("title");
	$(div).append("<p class=\"label\">" + title + "</p>");
	return div;
}

//shrink title from view to become part of the regular menu
function deactivateTitle(title) {
	$(title).animate({
		fontSize: '18pt',
	}, 200, function() {});
}

//expand title to demonstrate focus
function activateTitle(title) {
	$(title).animate({
		fontSize: '26pt',
	}, 200, function() {});
}

//Creates a interactable menu item, button, staircase
//Clicking one shrinks its sibling options and makes it the selected option
//Clicking it when it has shrunk to be part of the menu and not in focus, puts it back
//in focus and re-displays the other unchosen sibling arguments
function createItem(text, type, kvstoreval) {
	var div = document.createElement("div");
	$(div).addClass("listing");
	$(div).addClass(type);
	$(div).addClass("unselected");
	$(div).attr('id', text);
	$(div).append("<p class=\"label\">" + text + "</p>");
	$(div).on('click',function() {
		if ( currentTab !== null && currentTab !== undefined &&
			 currentTab === $(div).parent().attr('id') ) {
			// we clicked within the current folder.
			// update that folder's selection if it 
			// has changed, close that folder and 
			// advance to the new folder.
			if ( $(div).hasClass('unselected') ) {
				// remove unselected from current
				// add unselected to formerly selected
				// remove formerly selected
				// add selected to current 
				$(div).removeClass("unselected");
				$(div).siblings(".selected").addClass("unselected");
				$(div).siblings(".selected").removeClass("selected");
				$(div).addClass("selected");
				//Save the selection in Key Value Store
				graph_data.saveSelection(kvstoreval, text);
				// remove formerly previous
				// add previous to current 
				$(div).siblings(".previous").removeClass("previous");
				$(div).addClass("previous");
			}
			// roll everything up
			$(div).siblings(".unselected").slideUp('slow');
			$(div).promise().done(function() {
				$(div).animate({
					fontSize: '14pt',
				}, 200, function() {});
				deactivateTitle($(div).siblings(".title"));
				dispatchNextFolder($(div).parent().attr('id'), $(div).attr('id'));
			});
		} else {
			// we clicked outside the current folder.
			// leave existing selection unchanged and
			// switch to that new folder.
			//opening file
			//if the tab being opened is not the current tab, select a default
			//value in that tab and open the new one.
			$(div).animate({
				fontSize: '24pt',
			}, 200, function() {
				if(currentTab !== null &&
				   currentTab !== undefined &&
				   currentTab !== "none") {
					// do not make any selection changes for the tab that is open
					// just close it.
					$("#" + currentTab).children(".selected").css('fontSize', '14pt');
					deactivateTitle($("#" + currentTab).children(".title"));
					deactivateTitle($("#" + currentTab + ":first-child").siblings(".title"));
					$("#" + currentTab).children(".unselected").slideUp('fast');
				}
				// change to the selected tab...
				currentTab = $(div).parent().attr('id');
				// open it...
				activateTitle($(div).siblings(".title"));
				dispatchCurrentFolder($(div).parent().attr('id'), $(div).attr('id'));
			});
		}
	});
	return div;
}

//List of titles when menu is leading user through options
function selectTitle() {
	if(currentTab == "graphtype") {
		$('#title').html("Select a graph type");
	}
	else if(currentTab == "selectx") {
		$('#title').html("Select an x axis");
	}
	else if(currentTab == "selectslice") {
		$('#title').html("Select pie label");
	}
	else if(currentTab == "selecty") {
		$('#title').html("Select a y axis");
	}
	else if(currentTab == "selectr") {
		$('#title').html("Select a scale");
	}
	else if(currentTab == "operation") {
		$('#title').html("Select an operation");
	}
	else if(currentTab == "box_operation") {
		$('#title').html("Select a box plot Type");
	}
	else if(currentTab == "box_source") {
		$('#title').html("Box Labels");
	}
	else if(currentTab == "box_values") {
		$('#title').html("Select Values");
	}
	else if(currentTab == "iteration_counter") {
		$('#title').html("Select Iteration Column");
	}
	else {
		$('#title').html("Edit");
	}
}


//Determines which menu item should be displayed next, this assumes that the
//calling function has finished with all preceding menus and is ready to display the new one
var navMap = {
   "Bar Graph" : {
		selector: function() {
			var selectedOp = $("#operation").children(".selected");
			if(selectedOp.length > 0 && selectedOp[0].id == "Count") {
				return ".essential, .bargraph:not(.notOperationCount)";
			} else {
				return ".essential, .bargraph";
			}
		},
		nextState : { 
			'graphtype' : 'operation',
			'operation' : 'selectx',
			'selectx' : function() { 
				var selectedOp = $("#operation").children(".selected");
				if(selectedOp.length > 0 && selectedOp[0].id == "Count") {
					return null;
				} else {
					return 'selecty';
				}
			}
		},
		stateAction : {
			'graphtype': InitialMenuOptions,
			'operation': populateOperationSettings,
			'selectx': populateXSettings,
			'selecty': populateYSettings
		}
	},
	"Pie Chart": {
		selector: function() {
			var selectedOp = $("#operation").children(".selected");
			if(selectedOp.length > 0 && selectedOp[0].id == "Count") {
				return ".essential, .piechart:not(.notOperationCount)";
			} else {
				return ".essential, .piechart";
			}
		},
		nextState: {
			'graphtype' : 'operation',
			'operation' : 'selectslice',
			'selectslice' : function() { 
				var selectedOp = $("#operation").children(".selected");
				if(selectedOp.length > 0 && selectedOp[0].id == "Count") {
					return null;
				} else {
					return 'selecty';
				}
			}
		},
		stateAction: {
			'graphtype': InitialMenuOptions,
			'operation': populateOperationSettings,
			'selectslice': populateSliceSettings,
			'selecty': populateYSettings
		}
	},
	"Scatter Plot" : {
		selector: function() {
			var selectedOp = $("#operation").children(".selected");
			if(selectedOp.length > 0 && selectedOp[0].id == "Count") {
				return ".essential, .scatterplot:not(.notOperationCount)";
			} else {
				return ".essential, .scatterplot";
			}
		},
		nextState: {
			'graphtype' : 'operation',
			'operation' : 'selectx',
			'selectx' : function() { 
				var selectedOp = $("#operation").children(".selected");
				if(selectedOp.length > 0 && selectedOp[0].id == "Count") {
					return 'selectr';
				} else {
					return 'selecty';
				}
			},
			'selecty' : 'selectr'
		},
		stateAction: {
			'graphtype': InitialMenuOptions,
			'operation': populateOperationSettings,
			'selectx': populateXSettings,
			'selecty': populateYSettings,
			'selectr': populateRSettings
		}
	},
	"Box Plot" : {
		selector: function() {
			var selectedOp = $("#box_operation").children(".selected");
			if(selectedOp.length > 0 && selectedOp[0].id == "Single Column") {
				return ".essential, .box_plot_component:not(.notBoxOperationSingle)";
			} else {
				return ".essential, .box_plot_component";
			}
		},
		nextState : { 
			'graphtype' : 'box_operation',
			'box_operation' : function() { 
				var selectedOp = $("#box_operation").children(".selected");
				if(selectedOp.length > 0 && selectedOp[0].id == "Single Column") {
					return 'iteration_counter';
				} else {
					return 'box_source';
				}
			},
			'box_source' : 'iteration_counter',
			'iteration_counter' : 'box_values'
			
		},
		stateAction : {
			'graphtype': InitialMenuOptions,
			'box_operation': populateBoxOperationSettings,
			'box_source': populateBoxLabelSettings,
			'iteration_counter': populateBoxIterationSettings,
			'box_values': populateBoxValueSettings
		}
	},
	"Line Graph" : {
		selector: function() {
			var selectedOp = $("#operation").children(".selected");
			if(selectedOp.length > 0 && selectedOp[0].id == "Count") {
				return ".essential, .linegraph:not(.notOperationCount)";
			} else {
				return ".essential, .linegraph";
			}
		},
		nextState : { 
			'graphtype' : 'operation',
			'operation' : 'selectx',
			'selectx' : function() { 
				var selectedOp = $("#operation").children(".selected");
				if(selectedOp.length > 0 && selectedOp[0].id == "Count") {
					return null;
				} else {
					return 'selecty';
				}
			}
		},
		stateAction : {
			'graphtype': InitialMenuOptions,
			'operation': populateOperationSettings,
			'selectx': populateXSettings,
			'selecty': populateYSettings
		}
	}
};

function appropriateFolders() {
	var graphSelection = "";
	if($('#graphtype').children('.selected').length != 0) {
		graphSelection = $('#graphtype').children('.selected')[0].id;
	}
		   
	var graphType = navMap[graphSelection];
	if ( graphType === null || graphType === undefined ) {
		return '.essential';
	}
	
	var selector = (graphType.selector)();
	return selector;
}

function dispatchNextFolder(currentState, folder) {
	var graphSelection = "";
	if($('#graphtype').children('.selected').length != 0) {
		graphSelection = $('#graphtype').children('.selected')[0].id;
	}
		   
	var graphType = navMap[graphSelection];
	if ( graphType === null || graphType === undefined ) {
		return;
	}
	
	var selector = (graphType.selector)();
	$(selector).show();
	$(".category:not("+selector+")").hide();
	var nextState = graphType.nextState[currentState];
	if ( nextState !== null && nextState !== undefined &&
		 $.isFunction(nextState) ) {
		// evaluate it...
		nextState = (nextState)();
	}
	if ( nextState === null || nextState === undefined ) {
		packageEditMenu();
	} else {
		var action = graphType.stateAction[nextState];
		if ( action != null ) {
			(action)();
		}
		$("#"+nextState).show();
	}
}

function dispatchCurrentFolder(currentState, folder) {
	var graphSelection = "";
	if($('#graphtype').children('.selected').length != 0) {
		graphSelection = $('#graphtype').children('.selected')[0].id;
	}
		   
	var graphType = navMap[graphSelection];
	if ( graphType === null || graphType === undefined ) {
		return;
	}
	
	var selector = (graphType.selector)();
	$(selector).show();
	$(".category:not("+selector+")").hide();
	if ( currentState === null || currentState === undefined ) {
		packageEditMenu();
	} else {
		var action = graphType.stateAction[currentState];
		if ( action != null ) {
			(action)();
		}
		$("#"+currentState).show();
	}
}

//This shrinks the menu into an edit button, when pressed it reexpands
//When pressed again it closes the menu. Inversely zoom function appear and dissappear
//when the menu is hidden and not hidden
function packageEditMenu() {
	$("#title").addClass('rolled_up');
	$("#title").html("Click to Edit");
	$("#title").siblings().slideUp('slow', function() {
		if(graphSelection == "Pie Chart") {
			$('#scaling_button_pie_chart').slideDown('fast', function() {});
		} else {
			$('#scaling_buttons').slideDown('fast', function() {});
		}
	});
	selectGraph();
}

//Determines which columns should be selected and listed in a given menu. Determined
//by column properties set in the native app
function manageInvalidInputs(category) {
	var itemId = "";
	if ( $("#graphtype").children(".selected").length > 0) {
		itemId = $("#graphtype").children(".selected")[0].id;
	}
	var operation = "";
	if($("#operation").children(".selected").length > 0) {
		operation = $("#operation").children(".selected")[0].id;
	}
	if (itemId === "Bar Graph") {
		$("#selectx").children(".invalid").removeClass("invalid");
		if (operation != "Count") {
			$("#selecty").children(".invalid").removeClass("invalid");
			$("#selecty").children(':not(.Number, .title)').addClass("invalid");
		}
	} else if (itemId === "Line Graph") {
		$("#selectx").children(".invalid").removeClass("invalid");
		$("#selectx").children(':not(.Number, .title)').addClass("invalid");
		if (operation !== "Count") {
			$("#selecty").children(".invalid").removeClass("invalid");
			$("#selecty").children(':not(.Number, .title)').addClass("invalid");
		}
	} else if (itemId === "Pie Chart") {
		$("#selectslice").children(".invalid").removeClass("invalid");
		if (operation !== "Count") {
			$("#selecty").children(".invalid").removeClass("invalid");
			$("#selecty").children(':not(.Number, .title)').addClass("invalid");
		}
	} else if (itemId === "Scatter Plot") {
		$("#selectx").children(".invalid").removeClass("invalid");
		$("#selectx").children(':not(.Number, .title)').addClass("invalid");
		if(operation !== "Count") {
			$("#selecty").children(".invalid").removeClass("invalid");
			$("#selecty").children(':not(.Number, .title)').addClass("invalid");
		}
		$("#selectr").children(".invalid").removeClass("invalid");
		$("#selectr").children(':not(.Number, .title)').addClass("invalid");
	} else if (itemId === "Box Plot") {
		$("#iteration_counter").children(".invalid").removeClass("invalid");
		$("#iteration_counter").children(':not(.Number, .title)').addClass("invalid");
		$("#box_values").children(".invalid").removeClass("invalid");
		$("#box_values").children(':not(.Number, .title)').addClass("invalid");
	}
}

//Called when the menu is completed and ready to produce a graph, runs through previously selected options
//to determine which function to run to compute the data and which graph to produce
function selectGraph() {
	$('#svg_body').html("");
	$('.scale_button').off('click');
	var graphType = "";
	if ( $("#graphtype").children(".selected").length > 0 ) {
		graphType = $("#graphtype").children(".selected")[0].id;
	}
	
	if(graphType == "Bar Graph") {
		var xString = $('#selectx').children('.selected')[0].id;
		var names = JSON.parse(data.getColumnData(xString));
		var operation = $("#operation").children(".selected")[0].id;
		if(operation == "Count") {
			drawGraph(countGraphData(names), xString, "Count", "svg_body", "count");
		} else {
			var yString = $('#selecty').children('.selected')[0].id;
			var values = JSON.parse(data.getColumnData(yString));
			if (operation == "Sum") {
				drawGraph(sumGraphData(names, values), xString, yString, "svg_body");
			} else if (operation == "Average") {
				drawGraph(avgGraphData(names, values), xString, yString, "svg_body");
			} else if (operation == "Min") {
				drawGraph(minGraphData(names, values), xString, yString, "svg_body");
			} else if (operation == "Max") {
				drawGraph(maxGraphData(names, values), xString, yString, "svg_body");
			} else {
				drawGraph(avgGraphData(names, values), xString, yString, "svg_body");
			}
		}
	} else if(graphType == "Pie Chart") {
		var xString = $('#selectslice').children('.selected')[0].id;
		var names = JSON.parse(data.getColumnData(xString));
		var operation = $("#operation").children(".selected")[0].id;
		if (operation == "Count") {
			drawPieChart(countGraphData(names), xString, "Count", "svg_body", "count");
		} else {
			var yString = $('#selecty').children('.selected')[0].id;
			var values = JSON.parse(data.getColumnData(yString));
			if (operation == "Min") {
				drawPieChart(minGraphData(names, values), xString, yString, "svg_body");
			} else if (operation == "Max") {
				drawPieChart(maxGraphData(names, values), xString, yString, "svg_body");
			} else if (operation == "Sum") {
				drawPieChart(sumGraphData(names, values), xString, yString, "svg_body");
			} else if (operation == "Average") {
				drawPieChart(avgGraphData(names, values), xString, yString, "svg_body");
			} else {
				drawPieChart(avgGraphData(names, values), xString, yString, "svg_body");
			}
		}
	} else if(graphType == "Scatter Plot") {
		var xString = $('#selectx').children('.selected')[0].id;
		var names = JSON.parse(data.getColumnData(xString));
		var operation = $("#operation").children(".selected")[0].id;
		var yString = $('#selecty').children('.selected')[0].id;
		var rString = $('#selectr').children('.selected')[0].id;
		var size;
		if(rString != "No Scaling") {
			size = JSON.parse(data.getColumnData(rString));
		} else {
			size = new Array();
			for(var k = 0; k < names.length; k++) {
				size[k] = 20;
			}
		}
		if (operation == "Count") {
			drawScatter(countScatterData(names), xString, yString, "svg_body");
		} else {
			var values = JSON.parse(data.getColumnData(yString));
			if (operation == "Min") {
				drawScatter(minGraphData(names, values), "No Scaling", xString, yString, "svg_body");
			} else if (operation == "Max") {
				drawScatter(maxGraphData(names, values), "No Scaling", xString, yString, "svg_body");
			} else if (operation == "Sum") {
				drawScatter(sumGraphData(names, values), "No Scaling", xString, yString, "svg_body");
			} else if (operation == "Average") {
				drawScatter(avgGraphData(names, values), "No Scaling", xString, yString, "svg_body");
			} else {
				drawScatter(getSimplePlotScatterData(names, values, size),
					$('#selectr').children('.selected')[0].id, xString, yString, "svg_body");
			}
		}
	} else if(graphType == "Box Plot") {
		var operation = $("#box_operation").children(".selected")[0].id;
		var values = JSON.parse(data.getColumnData($("#box_values").children(".selected")[0].id));
		if (operation == "Single Column") {
			drawBox(simpleWhiskerBox(values), "svg_body");
		} else {
			var iterations = JSON.parse(data.getColumnData($("#iteration_counter").children(".selected")[0].id));
			var type = JSON.parse(data.getColumnData($("#box_source").children(".selected")[0].id));
			drawBox(comparisonWhiskerBox(type, iterations, values), "svg_body");
		}
	} else if(graphType == "Line Graph") {
		var xString = $('#selectx').children('.selected')[0].id;
		var names = JSON.parse(data.getColumnData(xString));
		var yString = $('#selecty').children('.selected')[0].id;
		var values = JSON.parse(data.getColumnData(yString));
		drawLineGraph(avgGraphData(names, values), xString, yString, "svg_body", 0, minGraphData(names, values), maxGraphData(names, values));
	}
}