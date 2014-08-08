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

    request.post(
        {
            uri: 'http://localhost:8000/testFromPost.txt',
            body: 'this is some test content'
        },
        function (error, response, body) {
            if (error) {
                throw error;
            }
            console.log('status code is: ' + response.statusCode);
            console.log('response: ' + response);
            console.log('body: ' + body);
        });
    //'http://localhost:8000/testFromPost.txt',
    //{ json: {content: "hello from grunt"} },
    //function (error, response, body) {
        //if (error) {
            //throw error;
        //}
        //console.log('status code is: ' + response.statusCode);
        //console.log('response: ' + response);
        //console.log('body: ' + body);
    //});

    //if (callback === undefined) {
        //callback = exports.defaultResponseFunction;
    //}

    //var fullPath = exports.rootpath + '/' + path;

    //request.post(
            //fullPath,
            //{ 'body': body },
            //callback);

};
