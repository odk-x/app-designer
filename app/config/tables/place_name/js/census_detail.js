/**
 * The file for displaying a detail view.
 */
/* global $, control */
'use strict';

var censusDetailResultSet = {};

function success(result) {
    censusDetailResultSet = result;
    alert("Hello");
    display();
}

function failure(error) {

    console.log('census_detail: failure() failed with error: ' + error);
}

function display() {
   
    nullCaseHelper('head_name', '#NAME');
    nullCaseHelper('house_number', '#HOUSE_NUMBER');
    
}

function nullCaseHelper(elementKey, documentSelector) {
  var temp = censusDetailResultSet.get(elementKey);
  if (temp !== null && temp !== undefined) {
    $(documentSelector).text(temp);
  }
}

function setup() {
    odkData.getViewData(success, failure);
}


