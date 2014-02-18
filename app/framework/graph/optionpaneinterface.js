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
	InitialMenuOptions(); 
	$('#scaling_buttons').hide();
	$('#scaling_button_pie_chart').hide();
	$('.observe_panel').hide();
	$("#title").on('click', function() {
		if ( $("#title").hasClass('rolled_up') ) {
			$("#title").removeClass('rolled_up');
			$("#title").siblings().slideDown('slow', function() {
				if(graphSelection == "Pie Chart") {
					$('#scaling_button_pie_chart').slideUp('fast', function() {});
				} else {
					$('#scaling_buttons').slideUp('fast', function() {});
				}
			});
		} else {
			$("#title").addClass('rolled_up');
			$("#title").siblings().slideUp('slow', function() {
				if(graphSelection == "Pie Chart") {
					$('#scaling_button_pie_chart').slideDown('fast', function() {});
				} else {
					$('#scaling_buttons').slideDown('fast', function() {});
				}
			});
		}
	});
	//$('#color_selection').hide();
});

//First option menu: Select a graph type
function InitialMenuOptions() {
	currentTab = "selectgraph";
	$("#selectgraph").hide();
	$("#selectgraph").addClass("defaultoption");
	$("#selectgraph").addClass("category");
	$('#title').html("Select a graph type");
	$("#selectgraph").append($(createTitle("Graph Type")));
	$("#selectgraph").append($(createItem("Bar Graph", "graphtype", "graphtype")));
	$("#selectgraph").append($(createItem("Box Plot", "graphtype", "graphtype")));
	$("#selectgraph").append($(createItem("Line Graph", "graphtype", "graphtype")));
	$("#selectgraph").append($(createItem("Scatter Plot", "graphtype", "graphtype")));
	$($("#selectgraph").children()).hide();
	var graphType = graph_data.getGraphType();
	loadFromKeyValueStore($("#selectgraph"), graphType);
}

//does not work with keystore
//Second option menu: Select an aggregate mode
function populateOperationSettings() {
	if($("#operation").children().length == 0) {
		$("#operation").hide();
		$("#operation").addClass("defaultoption");
		$("#operation").addClass("category");
		currentTab = "operation";
		$('#title').html("Select an aggregation");
		$("#operation").append($(createTitle("Operation")));
		$("#operation").append($(createItem("Simple Plot", "operation", "operation")));
		$("#operation").append($(createItem("Count", "operation", "operation")));
		$("#operation").append($(createItem("Sum", "operation", "operation")));
		$("#operation").append($(createItem("Average", "operation", "operation")));
		$("#operation").append($(createItem("Max", "operation", "operation")));
		$("#operation").append($(createItem("Min", "operation", "operation")));
		$($("#operation").children()).hide();
		var graphOperation = graph_data.getGraphOp();
		loadFromKeyValueStore($("#operation"), graphOperation);
		return true;
	}
	return false;
}

//Select X axis
function populateXSettings() {
	if($("#selectx").children().length == 0) {
		$("#selectx").hide();
		$("#selectx").addClass("defaultoption");
		$("#selectx").addClass("category");
		currentTab = "selectx";
		$('#title').html("Select an x axis");
		$("#selectx").empty();
		$("#selectx").append($(createTitle("X axis")));
		for(var k in selections) {
			$("#selectx").append($(createItem(k, selections[k], "selectx")));
		}
		$($("#selectx").children()).hide();
		manageInvalidInputs();
		
		var graphX = graph_data.getGraphXAxis();
		loadFromKeyValueStore($("#selectx"), graphX);
		return true;
	}
	return false;
}

//Select Y axis: Must be numerical
function populateYSettings() {	
	if($("#selecty").children().length == 0) {
		$('#selecty').hide();
		$("#selecty").addClass("defaultoption");
		$("#selecty").addClass("category");
		currentTab = "selecty";
		$('#title').html("Select a y axis");
		$("#selecty").empty();
		$("#selecty").append($(createTitle("Y axis")));
		for(var k in selections) {
			$("#selecty").append($(createItem(k, selections[k], "selecty")));
		}
		$($("#selecty").children()).hide();
		manageInvalidInputs();
		
		var graphY = graph_data.getGraphYAxis();
		loadFromKeyValueStore($("#selecty"), graphY);	
		return true;
	}
	return false;
}

//Select R scale: meant to scale (change the size of) dots based on numerical value
function populateRSettings() {	
	if($("#selectr").children().length == 0) {
		$('#selectr').hide();
		$("#selectr").addClass("scatterplot");
		$("#selectr").addClass("category");
		currentTab = "selectr";
		$('#title').html("scale the points by");
		$("#selectr").empty();
		$("#selectr").append($(createTitle("Scale Points")));
		$("#selectr").append($(createItem("No Scaling", "Number", "selectr")));
		for(var k in selections) {
			$("#selectr").append($(createItem(k, selections[k], "selectr")));
		}
		$($("#selectr").children()).hide();
		manageInvalidInputs();
		var graphR = graph_data.getGraphRAxis();
		loadFromKeyValueStore($("#selectr"), graphR);	
		return true;
	}
	return false;
}

//Call to the native app and attempt to recover saved options for
//particular key
function loadFromKeyValueStore(category, key) {
	if(key == "") {
		rollDownNewOptions(category);
	} else {
		var prevEl = category.children().filter(function() {
			return $(this).text() == key;
		});
		category.show();
		category.children(".title").show();
		category.children(":not(.invalid)").show();
		prevEl.click();
	}
}

//Generic function that rolls down new options in a given menu, argument is a jQuery object
function rollDownNewOptions(form) {
	form.show();
	form.children(".title").show();
	form.children(":not(.invalid)").slideDown('slow', function() {});
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
		if ( $(div).hasClass('unselected') ) {
			//closing file
			if($("#title").hasClass("edit_button")) {
				$("#title").html("Edit");
			}
			currentTab = "none";
			$(div).removeClass("unselected");
			$(div).addClass("selected");
			//Save the selection in Key Value Store
			graph_data.saveSelection(kvstoreval, text);
			$(div).siblings(".unselected").slideUp('slow');
			$(div).promise().done(function() {
				$(div).siblings(".unselected").removeClass("previous");
				$(div).animate({
					fontSize: '14pt',
				}, 200, function() {});
				deactivateTitle($(div).siblings(".title"));
				if(!$(div).hasClass("previous")) {
					dispatchNextFolder($(div).parent().attr('id'), $(div).attr('id'));
				}
			});
		} else {
			//opening file
			//if the tab being opened is not the current tab, select a default
			//value in that tab and open the new one.
			$(div).animate({
				fontSize: '24pt',
			}, 200, function() {
				$(div).siblings(":not(.invalid)").slideDown('slow');
				if(currentTab != "none" && currentTab != $(div).parent().attr('id')) {
					if($("#" + currentTab).find('.previous').length > 0) {
						$("#" + currentTab).find('.previous').click();
					}
					else {
						var noneDiv = $(createItem("none", currentTab, kvstoreval));
						$("#" + currentTab).children(".title").after(noneDiv);
						$(noneDiv).addClass("none");
						$(noneDiv).click();
					}
				}
				currentTab = $(div).parent().attr('id');
				selectTitle();
				if($(div).hasClass("none")) {
					$(div).remove();
				}
			});
			activateTitle($(div).siblings(".title"));
			$(div).removeClass("selected");
			$(div).addClass("unselected");
			$(div).addClass("previous");
		}
	});
	return div;
}

//List of titles when menu is leading user through options
function selectTitle() {
	if(currentTab == "selectgraph") {
		$('#title').html("Select a graph type");
	}
	else if(currentTab == "selectx") {
		$('#title').html("Select an x axis");
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
}

//Determines which menu item should be displayed next, this assumes that the
//calling function has finished with all preceding menus and is ready to display the new one
function dispatchNextFolder(form, folder) {
	if($('#selectgraph').children('.selected').length != 0) {
		graphSelection = $('#selectgraph').children('.selected')[0].id;
	}
	manageInvalidInputs();
	if($('.none').length == 0) {
		if(graphSelection == "Bar Graph" || graphSelection == "Pie Chart") {
			$(".category:not(.defaultoption)").hide();
			if(folder == "Bar Graph" || folder == "Pie Chart") {
				if(!populateOperationSettings()) {
					form = "operation";
				}
			}
			if(form == "operation") {
				if(!populateXSettings()) {
					form = "selectx";
				}
			}
			if(form == "selectx") {
				if($("#operation").children(".selected")[0].id == "Count") {
					$("#selecty").hide();
					packageEditMenu();
				} else if(!populateYSettings()) {
					form = "selecty";
				}
			}
			if(form == "selecty") {
				$("#selecty").show();
				packageEditMenu();
			}
		}
		else if(graphSelection == "Scatter Plot") {
			$(".category:not(.defaultoption, .scatterplot)").hide();
			if($("#title").hasClass("edit_button")) {
				$(".scatterplot").show();
			}
			if(folder == "Scatter Plot") {
				if(!populateOperationSettings()) {
					form = "operation";
				}
			}
			if(form == "operation") {
				if(!populateXSettings()) {
					form = "selectx";
				}
			}
			if(form == "selectx") {
				var operation = $("#operation").children(".selected")[0].id;
				if(operation == "Count") {
					$("#selecty").hide();
					packageEditMenu();
				} else if(!populateYSettings()) {
					form = "selecty";
				}
			}
			if(form == "selecty") {
				$("#selecty").show();
				if(!populateRSettings()) {
					form = "selectr";
				}
			}
			if(form == "selectr") {
				packageEditMenu();
			}
		} else if(graphSelection == "Box Plot") {
			$(".category:not(.defaultoption)").hide();
			packageEditMenu();
		} else if(graphSelection == "Line Graph") {
			$(".category:not(.defaultoption)").hide();
			if(folder == "Line Graph") {
				if(!populateXSettings()) {
					form = "selectx";
				}
			}
			if(form == "selectx") {
				if(!populateYSettings()) {
					form = "selecty";
				}
			}
			if(form == "selecty") {
				$("#selecty").show();
				packageEditMenu();
			}
		}
		manageInvalidInputs();
	}
}

//This shrinks the menu into an edit button, when pressed it reexpands
//When pressed again it closes the menu. Inversely zoom function appear and dissappear
//when the menu is hidden and not hidden
function packageEditMenu() {
	$("#title").html("Edit");
	$("#title").addClass("edit_button");
	$("#title").addClass("rolled_up");
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
function manageInvalidInputs() {
	$(".invalid").removeClass("invalid");
	var operation = "";
	if($("#operation").children(".selected").length > 0) {
		operation = $("#operation").children(".selected")[0].id;
	}
	if (operation == "Bar Graph" || operation == "Pie Chart") {
		if (operation != "Count") {
			$("#selecty").children(':not(.Number, .title)').addClass("invalid");
		}
	} else if (operation == "Scatter Plot") {
		if(operation != "Count") {
			$("#selectx").children(':not(.Number, .title)').addClass("invalid");
			$("#selecty").children(':not(.Number, .title)').addClass("invalid");
			$("#selectr").children(':not(.Number, .title)').addClass("invalid");
		}
	}
}

//Called when the menu is completed and ready to produce a graph, runs through previously selected options
//to determine which function to run to compute the data and which graph to produce
function selectGraph() {
	$('#svg_body').html("");
	$('.scale_button').off('click');
	var graphType = $("#selectgraph").children(".selected")[0].id;
	//temporary code:
	if(graphType == "Box Plot") {
		var run = JSON.parse(data.getColumnData("Time"));
		var speed = JSON.parse(data.getColumnData("Temperature"));
		var dataJ = new Array();
		var count = 0;
		for(var i = 0; i < run.length; i++) {
			if(0 == +run[i]) {
				count++;
			}
			dataJ[i] = {Expt:count, Run:run[i], Speed:speed[i]};
		}		
		drawBox(dataJ, "x", "s", "svg_body", 1);
		return 1;
	}
	
	//end of temporary code
	var xString = $('#selectx').children('.selected')[0].id;
	var names = JSON.parse(data.getColumnData(xString));
	if(graphType == "Bar Graph") {
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
	}
	else if(graphType == "Scatter Plot") {
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
	} else if(graphType == "Pie Chart") {
		var operation = $("#operation").children(".selected")[0].id;
		if (operation == "Count") {
			drawPieChart(countGraphData(names), xString, yString);
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
	} else if(graphType == "Line Graph") {
		var yString = $('#selecty').children('.selected')[0].id;
		var values = JSON.parse(data.getColumnData(yString));
		drawLineGraph(avgGraphData(names, values), xString, yString, "svg_body", 0, minGraphData(names, values), maxGraphData(names, values));
	}
}