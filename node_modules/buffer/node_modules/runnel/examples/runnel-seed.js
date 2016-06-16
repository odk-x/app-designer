'use strict';

var path   =  require('path');
var fs     =  require('fs');
var runnel =  require('..');

var files = [ '.gitignore', '.jshintrc', '.travis.yml' ];

function size (file, acc, cb) {
  var p = path.join(__dirname, '..', file);

  fs.stat(p, function (err, stat) {
    if (err) return cb(err);

    acc[file] = stat.size;
    cb(null, acc);
  });
}

var tasks = files.map(function (file) {
  // after we bind 'file' to the size function the resulting custom size function has signature 'function (acc, cb) {}'
  return size.bind(null, file);
});

// {} will be passed as the first value to next function and thus become 'acc', the accumulator
runnel(
  [runnel.seed({})]
    .concat(tasks)
    .concat(function done (err, acc) {
      if (err) return console.error(err);
      console.log('sizes:', acc);
    })
);

// for another version of the same see: runnel-seed-explicit-functions.js
