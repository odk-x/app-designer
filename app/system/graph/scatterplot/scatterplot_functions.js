"use strict";

//NOTE: that the R value in each dataJ data point is meant to represent a third numerical value
//In the case of a scatter plot it would represent the scale or size of the dot

//Groups the column names in the 'names' array and counts the number of occurrences
//and stores that value as the y value
//at the moment r is constant: value is 2
//i.e. names: a, b, a  -> dataJ: (x:a, y:2, r:2), (x:b, y:1, r:2)
function countScatterData(names) {
	var dataJ = new Array();
	var tempSpot = new Array();
	for(var j = 0; j < names.length; j++) {
		if(!(names[j] in tempSpot)) {
			tempSpot[names[j]] = 0;
		}
		tempSpot[names[j]]++;
	}
	var avg = 2;
	var i = 0;
	for (var key in tempSpot) {
		if( tempSpot.hasOwnProperty( key ) ) {
			dataJ[i] = {x:i + 1, y:tempSpot[key], r:avg};
			i++;
		} 
    }
	return dataJ;
}

//maps corresponding indexes in names, values, and size into corresponding
//x, y, r fields in dataJ object. i.e.
//names: 1, 2 | values: 2, 5 size: 1, 3 -> dataJ: (x:1 y:2 r:1), (x:2, y:5, r:3)
function getSimplePlotScatterData(names, values, size) {
	var dataJ = new Array();
	for(var j = 0; j < names.length; j++) {
		dataJ[j] = {x:names[j], y:values[j], r:size[j]};
	}
	return dataJ;
}