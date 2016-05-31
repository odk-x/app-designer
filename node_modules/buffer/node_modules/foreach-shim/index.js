"use strict";

module.exports = function(arr, callback, context) {
    for (var i = 0, l = arr.length; i < l; i++) {
        callback.call(context, arr[i], i, arr);
    }
};
