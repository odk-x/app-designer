/**
 * The file for displaying a detail view.
 */
/* global $, odkData */
'use strict';
 
var resultSet = {};

function updateContent() {
    // Perform your modification of the HTML page here and call display() in
    // the body of your .html file.
    $('#PLOT-NAME').text(resultSet.get('plot_name'));
    $('#soil-condition').text(resultSet.get('soil_condition'));
    $('#sample').text(resultSet.get('Sample'));
}

function cbSuccess(result) {

    resultSet = result;
	// and update the document with the values for this plot
	updateContent();
}

function cbFailure(error) {

	// a real application would perhaps clear the document fiels if there were an error
    console.log('Tea_houses_detail getViewData CB error : ' + error);
}

var display = function() {
	
    odkData.getViewData(cbSuccess, cbFailure);
};

