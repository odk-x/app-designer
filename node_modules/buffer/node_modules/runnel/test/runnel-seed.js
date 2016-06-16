'use strict';
/*jshint asi: true */

var test = require('tape')
var runnel = require('..')


// OMG -- IE8

if (typeof Array.prototype.map !== 'function') {
  Array.prototype.map = function (fn) {
    var mapped = [];
    for (var i = 0; i < this.length; i++) {
      mapped.push(fn(this[i]));
    }
    return mapped;
  }
}

test('\nseeding one value ', function (t) {
  runnel(runnel.seed(1), function (err, val) {
    t.notOk(err, 'no error')
    t.equal(val, 1, 'passes seed as value to next function in chain')
    t.end()
  })
})

test('\nseeding three values', function (t) {
  runnel(runnel.seed(1, 2, 3), function (err, uno, dos, tres) {
    t.notOk(err, 'no error')
    t.equal(uno, 1, 'passes first')
    t.equal(dos, 2, 'passes second')
    t.equal(tres, 3, 'passes third')
    t.end()
  })
})

test('\nasync reduce long running computations', function (t) {
  var computations = [ '1 + 2', '2 + 3', '3 + 4'  ]

  var tasks = computations.map(
    function (op) {
      return function compute (acc, cb) {
        // long running computation ;)

        setTimeout(function () {
          var args = op.split('+');
          acc[op] = parseInt(args[0], 10) + parseInt(args[1], 10);
          cb(null, acc)
        }, 10);

      };
    });

  runnel(
    [ runnel.seed({}) ]
      .concat(tasks)
      .concat(function done (err, acc) {
        t.notOk(err, 'no error')
        t.deepEqual(acc, { '1 + 2': 3, '2 + 3': 5, '3 + 4': 7 })
        t.end()
      })
  )
})
