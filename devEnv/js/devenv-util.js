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

var request = require('browser-request');

console.log('in devenv-util');

exports.rootpath = 'http://localhost:8000';

/**
 * Get the path to the framework's formDef.json file. Returns something like:
 * app/framework/formDef.json. Includes the file name and does not begin with
 * a slash.
 */
exports.getRelativePathToFrameworkFormDef = function() {

    var result = 'app/framework/formDef.json';
    return result;

};

/**
 * Returns the name of the reserved framework form id.
 */
exports.getFrameworkFormId = function() {

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

    request.post(
        {
            uri: exports.rootpath + '/' + path,
            body: content
        },
        callback);

};

var getValueOfSetting = function(formDef, settingName) {

    var settings = formDef.xlsx.settings;

    for (var i = 0; i < settings.length; i++) {
        var setting = settings[i];
        if (setting.setting_name === settingName) {
            return setting.value;
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
exports.getTableIdFromFormDef = function(formDef) {

    var result = getValueOfSetting(formDef, 'table_id');
    return result;

};

/**
 * Get the form id from the formDef json object. This is intended mostly as a
 * placeholder until I see if there is a standardized way to do this with the
 * xlsxconverter code.
 */
exports.getFormIdFromFormDef = function(formDef) {

    var result = getValueOfSetting(formDef, 'form_id');
    return result;

};
