'use strict';

var fs = require('fs');
var path = require('path');
var asyncReduce = require('..');

asyncReduce(
    [ '.gitignore', '.jshintrc', '.travis.yml', 'index.js', 'Readme.md' ]
  , {}
  , function size (acc, file, cb) {
      var p = path.join(__dirname, '..', file);

      fs.stat(p, function (err, stat) {
        if (err) return cb(err);

        acc[file] = stat.size;
        cb(null, acc);
      });
    }
  , function done (err, acc) {
      if (err) return console.error(err);
      console.log('sizes:\n', acc);
    }
);
