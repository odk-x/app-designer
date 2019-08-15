/**
 * Various util methods that we are going to use for the ODK 2.0 development
 * environment.
 *
 * This file relies on the node lookup mechanism and exports a module called
 * devenv-util. To get it ready for the browser you'll need to use browserify:
 * https://github.com/substack/node-browserify
 *
 * Example usage:
 * browserify -r ./devenv-util.js:devenv-util > devenv.js
 *
 * We can then do:
 *
 * var util = require('devenv-util')
 *
 * after we've included devenv.js in a script tag. Pretty slick.
 */
'use strict';

if (typeof XMLHttpRequest !== 'undefined'){
    var request = require('browser-request');
} else {
    var request = {};
}

var _ = require('../libs/underscore.js');

/**
 * Get the path to the framework's formDef.json file. Returns:
 *
 * app/config/assets/framework/forms/framework[.variant]/formDef.json
 *
 * Includes the file name and does not begin with a slash.
 */
exports.getRelativePathToFrameworkFormDef = function(formDefJson) {

    var result = 'app/config/assets/framework/forms/framework' +
		getFrameworkVariantFromFormDef(formDefJson) + '/formDef.json';
    return result;
};

/**
 * Get the path to the frameworkDefinition file. Returns:
 *
 * app/config/assets/framework/frameworkDefinitions[.variant].js
 *
 * Includes the file name and does not begin with a slash.
 */
exports.getRelativePathToFrameworkDefinitionsJs = function(formDefJson) {

    var result = 'app/config/assets/framework/frameworkDefinitions' +
		getFrameworkVariantFromFormDef(formDefJson) + '.js';
    return result;
};

/**
 * Get the path to the commonDefinitions file. Returns:
 *
 * app/config/assets/commonDefinitions[.variant].js
 *
 * Includes the file name and does not begin with a slash.
 */
exports.getRelativePathToCommonDefinitionsJs = function(formDefJson) {

    var result = 'app/config/assets/commonDefinitions' +
		getFrameworkVariantFromFormDef(formDefJson) + '.js';
    return result;
};

/**
 * Returns the name of the reserved framework form id.
 */
var getFrameworkFormId = exports.getFrameworkFormId = function() {

    return 'framework';

};

exports.defaultResponseFunction = function(error, response, body) {

    if (error) {
        throw error;
    }

    console.log('status code is: ' + response.statusCode);
    console.log('response: ' + response);
    console.log('body: ' + body);

};

/**
 * POST a file to the server.
 *
 * path: the absolute path, excluding the location. I.e. if you want a file at
 * 'app/tables/test.html', just pass that--don't include the entire
 * http://localhost:8000/app/tables/test.html etc.
 *
 * content: the content of the file you want to post
 *
 * callback: request's post callback function. Typically takes three
 * parameters: error, response, body. If this value isn't passed, the
 * defaultResponseFunction is passed instead.
 */
exports.postFile = function(path, content, callback) {

    if (callback === undefined) {
        callback = exports.defaultResponseFunction;
    }

    if (request.post !== undefined) {
        request.post(
            {
                uri: '/' + path,
                body: content
            },
            callback);
    }
};

exports.postBase64File = function(path, content, callback) {

    if (callback === undefined) {
        callback = exports.defaultResponseFunction;
    }

    if (request.post !== undefined) {
        request.post(
            {
                uri: '/' + path,
                body: content,
                headers: { 
                    'Content-Type': 'application/octet-stream'
                }
            },
            callback);
    }
};

var getValueOfSetting = function(formDef, settingName) {

    var settings = formDef.specification.settings;

    for(var prop in settings) {
        if(settings.hasOwnProperty(prop)) {
            if (prop === settingName) {
                return settings[prop].value;
            }
        }
    }

    console.log('could not find setting with name: ' + settingName);

    return null;

};

/**
 * Get the table id from the formDef json object. This is intended mostly as
 * a placeholder until I see if there is a standardized way to do this with the
 * xlsxconverter code.
 */
var getTableIdFromFormDef = exports.getTableIdFromFormDef = function(formDef) {

    var result = getValueOfSetting(formDef, 'table_id');
    return result;

};

/**
 * Get the form id from the formDef json object. This is intended mostly as a
 * placeholder until I see if there is a standardized way to do this with the
 * xlsxconverter code.
 */
var getFormIdFromFormDef = exports.getFormIdFromFormDef = function(formDef) {

    var result = getValueOfSetting(formDef, 'form_id');
    return result;

};

/**
 * Get the framework_variant from the formDef json object and prepend ".". The variant is used
 * within the app-designer to manage the various independent demos that might 
 * otherwise collide in the naming of the common translations, framework translations
 * and framework form definitions. It is inserted into the filename to differentiate
 * among the independent demos.
 */
var getFrameworkVariantFromFormDef = exports.getFrameworkVariantFromFormDef = function(formDef) {

    var result = getValueOfSetting(formDef, 'framework_variant');
	if ( result === undefined || result === null ) {
		return "";
	}
    return "." + result;

};

/**
 * Remove empty strings for the XLSXConverter
 */
exports.removeEmptyStrings =  function(rObjArr){
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
};

/**
 * Determine whether to create defintion.csv and
 * properties.csv for the XLSXConverter
 */
exports.shouldWriteOutDefinitionAndPropertiesCsv = function(formDefJson) {
    var tableId = getTableIdFromFormDef(formDefJson);
    var formId = getFormIdFromFormDef(formDefJson);

    if (tableId === null || formId === null) {
        return false;
    } 

    if (formId === getFrameworkFormId()) {
        return false;
    }

    if (tableId !== formId) {
        return false;
    }
    
    if (tableId === formId) {
        return true;
    }

    return false;
};

exports.shouldWriteOutDefinitionsJs = function(formDefJson) {
    var tableId = getTableIdFromFormDef(formDefJson);
    var formId = getFormIdFromFormDef(formDefJson);

    if (tableId === null || formId === null) {
        return false;
    } 

    if (tableId !== formId) {
        return false;
    }
    
    if (tableId === formId) {
        return true;
    }

    return false;
};

/**
 *  Create definition.csv from inverted the formDef.json 
 * for XLSXConverter processing
 */
exports.createDefinitionCsvFromDataTableModel = function(dataTableModel) {
    var definitions = [];
    var jsonDefn;

    // and now traverse the dataTableModel making sure all the
    // elementSet: 'data' values have columnDefinitions entries.
    //
    for ( var dbColumnName in dataTableModel ) {
        // the XLSXconverter already handles expanding complex types
        // such as geopoint into their underlying storage representation.
        jsonDefn = dataTableModel[dbColumnName];
        
        if ( jsonDefn.elementSet === 'data' && !jsonDefn.isSessionVariable ) {
            var surveyElementName = jsonDefn.elementName;

            // Make sure that the listChildElementKeys have extra quotes
            // This breaks the RFC4180CsvReader otherwise
            var listChildElem = null;
            if (jsonDefn.listChildElementKeys !== undefined && jsonDefn.listChildElementKeys !== null && jsonDefn.listChildElementKeys.length !== 0) {
                listChildElem = jsonDefn.listChildElementKeys;
                listChildElem = doubleQuoteString(JSON.stringify(listChildElem));
            }
        
            definitions.push({
                _element_key: dbColumnName,
                _element_name: jsonDefn.elementName,
                _element_type: (jsonDefn.elementType === undefined || jsonDefn.elementType === null ? jsonDefn.type : jsonDefn.elementType),
                _list_child_element_keys : (listChildElem === undefined || listChildElem === null ? JSON.stringify([]) : listChildElem)
            });
        }
    }

    // Now sort the _column_definitions
    definitions = _.sortBy(definitions, function(o) {return o._element_key;});

    // Now write the definitions in CSV format
    var defCsv = "_element_key,_element_name,_element_type,_list_child_element_keys\r\n";
    definitions.forEach(function(colDef){
        var dataString = colDef._element_key + ",";
        dataString += colDef._element_name + ",";
        dataString += colDef._element_type + ",";
        dataString += colDef._list_child_element_keys + "\r\n";
        defCsv += dataString;
    });  

    return defCsv;
};

/**
 *  Create properties.csv from inverted the formDef.json 
 * for XLSXConverter processing
 */
exports.createPropertiesCsvFromDataTableModel = function(dataTableModel, formDefJson) {
    var properties = formDefJson.specification.properties;

    // Now write the properties in CSV format
    var propCsv = "_partition,_aspect,_key,_type,_value\r\n";
    properties.forEach(function(prop){
        var dataString = prop._partition + ",";
        dataString += prop._aspect + ",";
        dataString += prop._key + ",";
        dataString += prop._type + ",";
        dataString += doubleQuoteString(prop._value) + "\r\n";
        propCsv += dataString;
    });

    return propCsv;
};

/**
 *  Create ...Definitions.js from the formDef.json 
 * for XLSXConverter processing
 */
exports.createDefinitionsJsFromDataTableModel = function(tableId, formDefJson) {
	var defJs;
	var definitions;
	if ( tableId === undefined || tableId === null ) {
		definitions = formDefJson.specification.common_definitions;
		defJs = "window.odkCommonDefinitions = " + JSON.stringify(definitions, 2, 2);
	} else if ( tableId === 'framework' ) {
		definitions = formDefJson.specification.framework_definitions;
		defJs = "window.odkFrameworkDefinitions = " + JSON.stringify(definitions, 2, 2);
	} else {
		definitions = formDefJson.specification.table_specific_definitions;
		defJs = "window.odkTableSpecificDefinitions = " + JSON.stringify(definitions, 2, 2);
	}
	return defJs;
};

/**
 * Double quote strings if they contain 
 * a quote, carriage return, or line feed
 */
var doubleQuoteString = exports.doubleQuoteString = function(str) {
    if (str !== null) {
        if (str.length === 0 ||
            str.indexOf("\r") !== -1 ||
            str.indexOf("\n") !== -1 ||
            str.indexOf("\"") !== -1 ) {
            
            str = str.replace(/"/g, "\"\"");
            str = "\"" + str + "\"";
            return str;
        } else {
            return str;
        }
    }
};
