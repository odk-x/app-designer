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

exports.rootpath = 'http://localhost:8000';

/**
 * Get the path to the framework's formDef.json file. Returns:
 *
 * app/config/assets/framework/forms/framework/formDef.json
 *
 * Includes the file name and does not begin with a slash.
 */
exports.getRelativePathToFrameworkFormDef = function() {

    var result = 'app/config/assets/framework/forms/framework/formDef.json';
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
                uri: exports.rootpath + '/' + path,
                body: content
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
exports.shouldWriteOutDefinitionAndPropertiesCsv = function(formDefStr) {
    var formDefJson = JSON.parse(formDefStr);
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

/**
 * Mark all of the session variables for XLSXConverter
 */
var _setSessionVariableFlag = function( dbKeyMap, listChildElementKeys) {
    //var that = this;
    var i;
    if ( listChildElementKeys != null ) {
        for ( i = 0 ; i < listChildElementKeys.length ; ++i ) {
            var f = listChildElementKeys[i];
            var jsonType = dbKeyMap[f];
            jsonType.isSessionVariable = true;
            if ( jsonType.type === 'array' ) {
                _setSessionVariableFlag(dbKeyMap, jsonType.listChildElementKeys);
            } else if ( jsonType.type === 'object' ) {
                _setSessionVariableFlag(dbKeyMap, jsonType.listChildElementKeys);
            }
        }
    }
};

/**
 * Invert a formDef.json for XLSXConverter
 */
var flattenElementPath = exports.flattenElementPath = function( dbKeyMap, elementPathPrefix, elementName, elementKeyPrefix, jsonType ) {
    //var that = this;
    var fullPath;
    var elementKey;
    var i = 0;

    // remember the element name...
    jsonType.elementName = elementName;
    // and the set is 'data' because it comes from the data model...
    jsonType.elementSet = 'data';
    
    // update element path prefix for recursive elements
    elementPathPrefix = ( elementPathPrefix === undefined || elementPathPrefix === null ) ? elementName : (elementPathPrefix + '.' + elementName);
    // and our own element path is exactly just this prefix
    jsonType.elementPath = elementPathPrefix;

    // use the user's elementKey if specified
    elementKey = jsonType.elementKey;

    if ( elementKey === undefined || elementKey === null ) {
        throw new Error("elementKey is not defined for '" + jsonType.elementPath + "'.");
    }

    // simple error tests...
    // throw an error if the elementkey is longer than 62 characters
    // or if it is already being used and not by myself...
    if ( elementKey.length > 62 ) {
        throw new Error("supplied elementKey is longer than 62 characters");
    }
    if ( dbKeyMap[elementKey] !== undefined && dbKeyMap[elementKey] !== null && dbKeyMap[elementKey] != jsonType ) {
        throw new Error("supplied elementKey is already used (autogenerated?) for another model element");
    }
    if ( elementKey.charAt(0) === '_' ) {
        throw new Error("supplied elementKey starts with underscore");
    }

    // remember the elementKey we have chosen...
    dbKeyMap[elementKey] = jsonType;

    // handle the recursive structures...
    if ( jsonType.type === 'array' ) {
        // explode with subordinate elements
        f = flattenElementPath( dbKeyMap, elementPathPrefix, 'items', elementKey, jsonType.items );
        jsonType.listChildElementKeys = [ f.elementKey ];
    } else if ( jsonType.type === 'object' ) {
        // object...
        var e;
        var f;
        var listChildElementKeys = [];
        for ( e in jsonType.properties ) {
            f = flattenElementPath( dbKeyMap, elementPathPrefix, e, elementKey, jsonType.properties[e] );
            listChildElementKeys.push(f.elementKey);
        }
        jsonType.listChildElementKeys = listChildElementKeys;
    }

    if ( jsonType.isSessionVariable && (jsonType.listChildElementKeys != null)) {
        // we have some sort of structure that is a sessionVariable
        // Set the isSessionVariable tags on all its nested elements.
        _setSessionVariableFlag(dbKeyMap, jsonType.listChildElementKeys);
    }
    return jsonType;
};

/**
 * Mark the elements of an inverted formDef.json
 * that will be retained in the database for XLSXConverter
 */
var markUnitOfRetention = exports.markUnitOfRetention = function(dataTableModel) {
    // for all arrays, mark all descendants of the array as not-retained
    // because they are all folded up into the json representation of the array
    var startKey;
    var jsonDefn;
    var elementType;
    var key;
    var jsonSubDefn;
        
    for ( startKey in dataTableModel ) {
        jsonDefn = dataTableModel[startKey];
        if ( jsonDefn.notUnitOfRetention ) {
            // this has already been processed
            continue;
        }
        elementType = (jsonDefn.elementType === undefined || jsonDefn.elementType === null ? jsonDefn.type : jsonDefn.elementType);
        if ( elementType === "array" ) {
            var descendantsOfArray = ((jsonDefn.listChildElementKeys === undefined || jsonDefn.listChildElementKeys === null) ? [] : jsonDefn.listChildElementKeys);
            var scratchArray = [];
            while ( descendantsOfArray.length !== 0 ) {
                var i;
                for ( i = 0 ; i < descendantsOfArray.length ; ++i ) {
                    key = descendantsOfArray[i];
                    jsonSubDefn = dataTableModel[key];
                    if ( jsonSubDefn !== null && jsonSubDefn !== undefined ) {
                        if ( jsonSubDefn.notUnitOfRetention ) {
                            // this has already been processed
                            continue;
                        }
                        jsonSubDefn.notUnitOfRetention = true;
                        var listChildren = ((jsonSubDefn.listChildElementKeys === undefined || jsonSubDefn.listChildElementKeys === null) ? [] : jsonSubDefn.listChildElementKeys);
                        scratchArray = scratchArray.concat(listChildren);
                    }
                }
                descendantsOfArray = scratchArray;
            }
        }
    }
    // and mark any non-arrays with multiple fields as not retained
    for ( startKey in dataTableModel ) {
        jsonDefn = dataTableModel[startKey];
        if ( jsonDefn.notUnitOfRetention ) {
            // this has already been processed
            continue;
        }
        elementType = (jsonDefn.elementType === undefined || jsonDefn.elementType === null ? jsonDefn.type : jsonDefn.elementType);
        if ( elementType !== "array" ) {
            if (jsonDefn.listChildElementKeys !== undefined &&
                jsonDefn.listChildElementKeys !== null &&
                jsonDefn.listChildElementKeys.length !== 0 ) {
                jsonDefn.notUnitOfRetention = true;
            }
        }
    }
};

/**
 * Determine which elements 
 * will be retained in the database for XLSXConverter
 */
exports.isUnitOfRetention = function(jsonDefn) {
    if (jsonDefn.notUnitOfRetention) return false;
    return true;
};

/**
 * Invert the formDef.json for XLSXConverter
 * processing
 */
exports.getDataTableModelFromFormDef = function(formDef) {
    // TODO: synthesize dbTableName from some other source...
    var dbTableName = formDef.specification.settings.table_id.value;

    // dataTableModel holds an inversion of the protoModel.formDef.model
    //
    // elementKey : jsonSchemaType
    //
    // with the addition of:
    //    isSessionVariable : true if this is not retained across sessions
    //    elementPath : pathToElement
    //    elementSet : 'data'
    //    listChildElementKeys : ['key1', 'key2' ...]
    //
    // within the jsonSchemaType to be used to transform to/from
    // the model contents and data table representation.
    //    
    var dataTableModel = {};
    var displayColumnOrder = [];
    var f;
    for ( f in formDef.specification.model ) {
        dataTableModel[f] = formDef.specification.model[f];
    }
    
    // go through the supplied protoModel.formDef model
    // and invert it into the dataTableModel
    var jsonDefn;
    for ( f in dataTableModel ) {
        jsonDefn = flattenElementPath( dataTableModel, null, f, null, dataTableModel[f] );
    }

    // traverse the dataTableModel marking which elements are 
    // not units of retention.
    markUnitOfRetention(dataTableModel);

    return dataTableModel;
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
            var surveyDisplayName = (jsonDefn.displayName === undefined || jsonDefn.displayName === null) ? surveyElementName : jsonDefn.displayName;

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
exports.createPropertiesCsvFromDataTableModel = function(dataTableModel, formDef) {
    var properties = [];
    var jsonDefn;
    var displayColumnOrder = [];

    // and now traverse the dataTableModel making sure all the
    // elementSet: 'data' values have columnDefinitions entries.
    //
    for ( var dbColumnName in dataTableModel ) {
        // the XLSXconverter already handles expanding complex types
        // such as geopoint into their underlying storage representation.
        jsonDefn = dataTableModel[dbColumnName];
        
        if ( jsonDefn.elementSet === 'data' && !jsonDefn.isSessionVariable ) {
            var surveyElementName = jsonDefn.elementName;
            var surveyDisplayName = (jsonDefn.displayName === undefined || jsonDefn.displayName === null) ? surveyElementName : jsonDefn.displayName;

            // displayed columns within Tables, at least for now, are just the unit-of-retention columns.
            if (!jsonDefn.notUnitOfRetention) {
                displayColumnOrder.push(dbColumnName);
            }

            properties.push( {
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "displayVisible",
                _type: "boolean",
                _value: "TRUE"
            });

            properties.push( {
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "displayName",
                _type: "string",
                _value: doubleQuoteString(JSON.stringify(surveyDisplayName)) // this is a localizable string...
            });

            var choicesJson;
            if ( jsonDefn.valuesList === undefined || jsonDefn.valuesList === null ) {
                choicesJson = JSON.stringify([]);
            } else {
                var ref = formDef.specification.choices[jsonDefn.valuesList];
                if ( ref === undefined || ref === null ) {
                    choicesJson = JSON.stringify([]);
                } else {
                    choicesJson = doubleQuoteString(JSON.stringify(ref));
                }
            }

            properties.push( {
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "displayChoicesList",
                _type: "object",
                _value: choicesJson
            });

            properties.push( {
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "displayFormat",
                _type: "string",
                _value: (jsonDefn.displayFormat === undefined || jsonDefn.displayFormat === null) ? JSON.stringify("") : jsonDefn.displayFormat
            });

            properties.push( {
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "joins",
                _type: "object",
                _value: JSON.stringify("")
            });
        }
    }

    // Now sort the _key_value_store_active
    properties = _.chain(properties)
    .sortBy(function(o) {
        return o._key;
    }).sortBy(function(p) {
        return p._aspect;
    }).value();

    // Make Survey the default form
    var formId = formDef.specification.settings.form_id.value
    properties.push( {_partition: "FormType", _aspect: "default", _key: 'FormType.formType', _type: 'string', _value: 'SURVEY'});
    properties.push( {_partition: "SurveyUtil", _aspect: "default", _key: 'SurveyUtil.formId', _type: 'string', _value: formId } );
    
    // Add in the table specific properties
    properties.push( {_partition: "Table", _aspect: "default", _key: "colOrder", _type: "array", _value: doubleQuoteString(JSON.stringify(displayColumnOrder))});
    properties.push( {_partition: "Table", _aspect: "default", _key: "defaultViewType", _type: "string", _value: "SPREADSHEET" } );

    var formTitle = (formDef.specification.settings.survey.display.title === undefined || formDef.specification.settings.survey.display.title === null) ? formId : formDef.specification.settings.survey.display.title;
    properties.push( {_partition: "Table", _aspect: "default", _key: "displayName", _type: "object", _value: doubleQuoteString(JSON.stringify(formTitle))} );
    properties.push( {_partition: "Table", _aspect: "default", _key: "groupByCols", _type: "object", _value: JSON.stringify([]) } );
    properties.push( {_partition: "Table", _aspect: "default", _key: "indexCol", _type: "string", _value: JSON.stringify("") } );
    properties.push( {_partition: "Table", _aspect: "default", _key: "sortCol", _type: "string", _value: JSON.stringify("") } );
    properties.push( {_partition: "Table", _aspect: "default", _key: "sortOrder", _type: "string", _value: JSON.stringify("") } ); 

    // Now write the properties in CSV format
    var propCsv = "_partition,_aspect,_key,_type,_value\r\n";
    properties.forEach(function(prop){
        var dataString = prop._partition + ",";
        dataString += prop._aspect + ",";
        dataString += prop._key + ",";
        dataString += prop._type + ",";
        dataString += prop._value + "\r\n";
        propCsv += dataString;
    }); 

    return propCsv;
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
