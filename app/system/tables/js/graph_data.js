/**
 * This represents the graph_data object handed to the webview in the Tables code.
 *
 * It provides all the functions available to the javascript. It corresponds
 * to org.opendatakit.tables.view.webkits.GraphDataIf.
 */
'use strict';
/* jshint unused: vars */

/**
 * This stores the actual functionality of the graph_data objects. Unlike control.js,
 * there can be multiple TableGraphData objects at a time in the code, one as a
 * member of window and others returned from the code. Therefore the code has
 * to live elsewhere like this.
 */
window.__getTableGraphData = function() {

    var graphDataObj = null;

    /**
     * Returns true if str is a string, else false.
     */
    var isString = function(str) {
        return (typeof str === 'string');
    };

    var isInteger = function(i) {
        return (typeof i === 'number' && Math.floor(i) === i);
    };
    
    // This is the object that will end up as window.graph_data.
    var pub = {};

    /**
     * This is the only function that is exposed to the caller that is NOT a
     * function exposed on the android object. It is intended only for use
     * while testing on Chrome.
     *
     * jsonObj should be a JSON object.
     */
    pub.setBackingObject = function(jsonObj) {
        dataObj = jsonObj;
    };

	var dataObj = {
		isModified: false,
		is_modifiable: true,
		graphtype: '',
		selectx: '',
		selecty: '',
		selectr: '',
		operation: '',
		box_operation: '',
		box_source: '',
		box_values: '',
		box_iterations: '',
		potentialGraphName: 'un-named-graph-1',
		graphName: 'un-named-graph-1',
		graphs: {
			'un-named-graph-1' : {
				graphtype: '',
				is_modifiable: true,
				selectx: '',
				selecty: '',
				selectr: '',
				operation: '',
				box_operation: '',
				box_source: '',
				box_values: '',
				box_iterations: ''
				}
			}
	};
	
	pub.isModified = function() {
		return dataObj.isModified;
	};

	pub.hasGraph = function(graph) {
		return dataObj.graphs[graph] !== undefined;
	};

	pub.isModifiable = function() {
		var ref = dataObj.is_modifiable;
		if ( ref === null || ref === undefined ) {
			ref = true;
		}
		return ref;
	};

	pub.setPermissions = function(name, modifiable) {
		var graph = dataObj.graphs[name];
		if ( graph == null || graph === undefined ) {
			graph = { is_modifiable: modifiable };
			dataObj.graphs[name] = graph;
		} else {
			graph.is_modifiable = modifiable;
		}
	};
	
	pub.getGraphType = function() {
		var ref = dataObj.graphtype;
		if ( ref === null || ref === undefined || ref === "unset type" ) {
			ref = "";
		}
		return ref;
	};
	pub.getGraphType = function() {
		var ref = dataObj.graphtype;
		if ( ref === null || ref === undefined || ref === "unset type" ) {
			ref = "";
		}
		return ref;
	};

	pub.getGraphXAxis = function() {
		var ref = dataObj.selectx;
		if ( ref === null || ref === undefined ) {
			ref = "";
		}
		return ref;
	};

	pub.getGraphYAxis = function() {
		var ref = dataObj.selecty;
		if ( ref === null || ref === undefined ) {
			ref = "";
		}
		return ref;
	};

	pub.getGraphRAxis = function() {
		var ref = dataObj.selectr;
		if ( ref === null || ref === undefined ) {
			ref = "";
		}
		return ref;
	};

	pub.getGraphOp = function() {
		var ref = dataObj.operation;
		if ( ref === null || ref === undefined ) {
			ref = "";
		}
		return ref;
	};

	pub.getBoxOperation = function() {
		var ref = dataObj.box_operation;
		if ( ref === null || ref === undefined ) {
			ref = "";
		}
		return ref;
	};

	pub.getBoxSource = function() {
		var ref = dataObj.box_source;
		if ( ref === null || ref === undefined ) {
			ref = "";
		}
		return ref;
	};

	pub.getBoxValues = function() {
		var ref = dataObj.box_values;
		if ( ref === null || ref === undefined ) {
			ref = "";
		}
		return ref;
	};

	pub.getBoxIterations = function() {
		var ref = dataObj.box_iterations;
		if ( ref === null || ref === undefined ) {
			ref = "";
		}
		return ref;
	};

	pub.saveSelection = function(aspect, value) {
		var ref = dataObj[aspect];
		if ( ref === null || ref === undefined || ref !== value ) {
			dataObj.isModified = true;
		}
		dataObj[aspect] = value;
	};

	pub.deleteDefaultGraph = function() {
		dataObj.isModified = false;
		dataObj.graphtype = '';
		dataObj.selectx = '';
		dataObj.selecty = '';
		dataObj.selectr = '';
		dataObj.operation = '';
		dataObj.potentialGraphName = 'un-named-graph-1';
		dataObj.graphName = 'un-named-graph-1';
	};

    return pub;
};

/**
 * The idea of this call is that if we're on the phone, control will have been
 * set by the java framework. This script, however, should get run at the top
 * of the file no matter what. This way we're sure not to stomp on the java
 * object.
 */
if (!window.graph_data) {

    // This is the object that will end up as window.graph_data.
    var graphDataPub = window.__getTableGraphData();


    window.graph_data = window.graph_data || graphDataPub;

}


