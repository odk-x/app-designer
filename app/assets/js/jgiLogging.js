'use strict';

var $ = require('jquery');


exports.DO_LOGGING = true;


exports.initializeClickLogger = function() {
  $('button, select, option, input').click(function() {
    if (!exports.DO_LOGGING) {
      return;
    }
    var $thisObj = $(this);
    var now = new Date().toISOString();
    console.log(
      ' jgiLogging: ' +
      now +
      ' clickId: ' +
      $thisObj.prop('id') +
      ' elementName: ' +
      $thisObj.get(0).tagName
    );
  });

};

exports.initializeLogging = function() {
  exports.initializeClickLogger();
};
