'use strict';

var path   =  require('path');
var fs     =  require('fs');
var runnel =  require('..');

function size (file, acc, cb) {
  var p = path.join(__dirname, '..', file);

  fs.stat(p, function (err, stat) {
    if (err) return cb(err);

    acc[file] = stat.size;
    cb(null, acc);
  });
}

runnel(
    // {} will be passed as the first value to next function and thus become 'acc', the accumulator
    runnel.seed({})
  
    // after we bind 'file' to the size function the resulting custom size function has signature 'function (acc, cb) {}'
  , size.bind(null, '.gitignore')
  , size.bind(null, '.jshintrc')
  , size.bind(null, '.travis.yml')

  , function done (err, acc) {
      if (err) return console.error(err);
      console.log('sizes:', acc);
    }
);

// for another version of the same see: runnel-seed.js
