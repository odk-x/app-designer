/**
 * Some basic things useful in testing.
 */
/* global define */
'use strict';
define([], function() {
    
    var pub = {};

    /**
     * Checks if the passed in parameter is a function.
     */
    pub.isFunction = function(functionToCheck) {
        var getType = {};
        return functionToCheck &&
            getType.toString.call(functionToCheck) === '[object Function]';
    };

    return pub;

});
