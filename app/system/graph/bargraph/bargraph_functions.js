"use strict";

//Groups the column names in the 'names' array and sums
// the corresponding grouped values in the 'values' array
//i.e. names: a, b, a  values:, 1, 2, 4 -> dataJ: (x:a,y:5), (x:b, y:2)
function sumGraphData(names, values) {
	var dataJ = new Array();
	var tempSpot = new Array();
	
	for(var j = 0; j < names.length; j++) {
		if(!(names[j] in tempSpot)) {
			tempSpot[names[j]] = 0;
		}
		
		tempSpot[names[j]] += +values[j];
	}
	var i = 0;
	var avg = 2;
	for (var key in tempSpot) {
		if( tempSpot.hasOwnProperty( key ) ) {
			dataJ[i] = {x:key, y:tempSpot[key], r:avg};
			i++;
		} 
    }
	return dataJ; 
}

//Groups the column names in the 'names' array and averages
// the corresponding grouped values in the 'values' array
//i.e. names: a, b, a  values:, 1, 2, 4 -> dataJ: (x:a,y:2.5), (x:b, y:2)
function avgGraphData(names, values) {
	var dataJ = new Array();
	var tempSpot = new Array();
	var divis = new Array();
	
	for(var j = 0; j < names.length; j++) {
		if(!(names[j] in tempSpot)) {
			tempSpot[names[j]] = 0;
			divis[names[j]] = 0;
		}
		tempSpot[names[j]] += +values[j];
		divis[names[j]]++;
	}
	var i = 0;
	var avg = 2;
	for (var key in tempSpot) {
		if( tempSpot.hasOwnProperty( key ) ) {
			var divValue = (tempSpot[key])/(divis[key]);
			dataJ[i] = {x:key, y:divValue, r:avg};
			i++;
		} 
    }
	return dataJ; 
}

//Groups the column names in the 'names' array and selects the min value in
// the corresponding grouped values in the 'values' array
//i.e. names: a, b, a  values:, 1, 2, 4 -> dataJ: (x:a,y:1), (x:b, y:2)
function minGraphData(names, values) {
	var dataJ = new Array();
	var tempSpot = new Object();
	
	for(var j = 0; j < names.length; j++) {
		if(!(names[j] in tempSpot)) {
			tempSpot[names[j]] = values[j];
		}
		if(+tempSpot[names[j]] > +values[j]) {
			tempSpot[names[j]] = values[j];
		}
	}
	var i = 0;
	var avg = 2;
	for (var key in tempSpot) {
		if( tempSpot.hasOwnProperty( key ) ) {
			dataJ[i] = {x:key, y:tempSpot[key], r:avg};
			i++;
		} 
    }
	return dataJ; 
}

//Groups the column names in the 'names' array and selects the max value in
// the corresponding grouped values in the 'values' array
//i.e. names: a, b, a  values:, 1, 2, 4 -> dataJ: (x:a,y:4), (x:b, y:2)
function maxGraphData(names, values) {
	var dataJ = new Array();
	var tempSpot = new Array();
	
	for(var j = 0; j < names.length; j++) {
		if(!(names[j] in tempSpot)) {
			tempSpot[names[j]] = values[j];
		}
		if(+tempSpot[names[j]] < +values[j]) {
			tempSpot[names[j]] = values[j];
		}
	}
	var i = 0;
	var avg = 2;
	for (var key in tempSpot) {
		if( tempSpot.hasOwnProperty( key ) ) {
			dataJ[i] = {x:key, y:tempSpot[key], r:avg};
			i++;
		} 
    }
	return dataJ; 
}

//Groups the column names in the 'names' array and counts the number of occurrences
//and stores that value as the y value
//i.e. names: a, b, a  -> dataJ: (x:a, y:2), (x:b, y:1)
function countGraphData(names) {
	var dataJ = new Array();
	var tempSpot = new Array();
	for(var j = 0; j < names.length; j++) {
		if(!(names[j] in tempSpot)) {
			tempSpot[names[j]] = 0;
		}
		tempSpot[names[j]]++;
	}
	var i = 0;
	var avg = 2;
	for (var key in tempSpot) {
		if( tempSpot.hasOwnProperty( key ) ) {
			dataJ[i] = {x:key, y:tempSpot[key], r:avg};
			i++;
		} 
    }
	return dataJ;
}
