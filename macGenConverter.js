var XRegExp = require('./xlsxconverter/XRegExp-All-3.0.0-pre-2013-08-27.js');
var readline = require('readline');
var _ = require('./xlsxconverter/underscore.js');
var XLSXConverter = require('./xlsxconverter/XLSXConverter2.js');
var fs = require('fs');
var Buffer = require('buffer').Buffer;
var constants = require('constants');
var XLSX = require('xlsx');

function removeEmptyStrings(rObjArr){
    var outArr = [];
    _.each(rObjArr, function(row){
        var outRow = Object.create(row.__proto__);
        _.each(row, function(value, key){
            if(_.isString(value) && value.trim() === "") {
                return;
            } else if (_.isString(value)) {
                var lowerCase = value.toLowerCase();
                if (lowerCase === "false") {
                    value = false;
                } else if (lowerCase === "true") {
                    value = true;
                }
            }
            outRow[key] = value;
        });
        if(_.keys(outRow).length > 0) {
            outArr.push(outRow);
        }
    });
    return outArr;
}

function to_json(workbook) {
    var result = {};
    _.each(workbook.SheetNames, function(sheetName) {
        var rObjArr = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName],{raw:true});
        rObjArr = removeEmptyStrings(rObjArr);
        if(rObjArr.length > 0){
            result[sheetName] =  rObjArr;
        }
    });
    return result;
}

var result = "";
var b64xlsx = "";

// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
    console.log('Usage: node ' + process.argv[1] + ' FILENAME');
    process.exit(1);
}

// Read the file
var fs = require('fs');
var filename = process.argv[2];
fs.readFile(filename, 'base64', function(err, data) {
    if (err) {
        throw err;
    }
    b64xlsx += data;
});

b64xlsx = fs.readFileSync(filename, 'base64');

try {
    var xlsx = XLSX.read(b64xlsx, {type: 'base64'});    
    var jsonWorkbook = to_json(xlsx);
    var processedWorkbook = XLSXConverter.processJSONWb(jsonWorkbook);
    result = JSON.stringify(processedWorkbook, 2, 2);
} catch(e) {
    console.log(e.stack);
}
console.log(result);


