load('xlsxconverter/js-xlsx/jszip.js');
load('xlsxconverter/js-xlsx/xlsx.js');
load('xlsxconverter/XRegExp-All-3.0.0-pre-2013-08-27.js');
load('xlsxconverter/underscore.js');
load('xlsxconverter/XLSXConverter.js');
function removeEmptyStrings(rObjArr){
    var outArr = [];
    _.each(rObjArr, function(row){
        var outRow = Object.create(row.__proto__);
        _.each(row, function(value, key){
            if(_.isString(value) && value.trim() === "") {
                return;
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
        var rObjArr = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        rObjArr = removeEmptyStrings(rObjArr);
        if(rObjArr.length > 0){
            result[sheetName] =  rObjArr;
        }
    });
    return result;
}

var result;
var b64xlsx = "";
var line = readline();
while(line) {
    b64xlsx += line;
    line = readline();
}

try {
    var xlsx = XLSX.read(b64xlsx, {type: 'base64'});    
    var jsonWorkbook = to_json(xlsx);
    var processedWorkbook = XLSXConverter.processJSONWorkbook(jsonWorkbook);
    result = JSON.stringify(processedWorkbook, 2, 2);
} catch(e) {
    throw e;
}
print(result);


