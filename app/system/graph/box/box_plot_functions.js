"use strict";

//Groups the column names in the 'names' array and sums
// the corresponding grouped values in the 'values' array
//i.e. names: a, b, a  values:, 1, 2, 4 -> dataJ: (x:a,y:5), (x:b, y:2)
function simpleWhiskerBox(values) {
	var dataJ = new Array();
	var count = 0;
	for(var i = 0; i < values.length; i++) {
		count++;
		dataJ[i] = {Name: "", Expt:1, Run:count, Speed:values[i]};
	}
	return dataJ;
}

function comparisonWhiskerBox(type, iterations, values) {
	var dataJ = new Array();
	var typeArray = new Array();
	var count = 1;
	for(var i = 0; i < type.length; i++) {
		if(!(type[i] in typeArray)) {
			typeArray[type[i]] = count;
			count++;
		}		
		dataJ[i] = {Name:type[i], Expt:typeArray[type[i]], Run:iterations[i], Speed:values[i]};
	}
	return dataJ;
}