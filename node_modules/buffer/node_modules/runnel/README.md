# runnel [![Build Status](https://secure.travis-ci.org/thlorenz/runnel.png)](http://travis-ci.org/thlorenz/runnel)
[![testling badge](https://ci.testling.com/thlorenz/runnel.png)](https://ci.testling.com/thlorenz/runnel)

**run·nel/ˈrənl/** -  *A narrow channel in the ground for liquid to flow through.*

Simple and small (~ 80 loc) flow control library to execute async functions in sequence.

**Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*

- [Installation](#installation)
- [Examples](#examples)
  - [Parameter passing](#parameter-passing)
  - [Passing Array of functions](#passing-array-of-functions)
  - [Seeding a start value](#seeding-a-start-value)
- [Features](#features)
- [API](#api)
  - [*runnel(fn1[, fn2][, fn3][, ...], done)*](#runnelfn1-fn2-fn3--done)
  - [*runnel([fn1, fn2, .., done])*](#runnelfn1-fn2--done)
  - [*runnel.seed(value)*](#runnelseedvalue)
- [Compatibility](#compatibility)
- [Early failure](#early-failure)
- [Why another flow control library](#why-another-flow-control-library)
- [More Examples](#more-examples)
- [Similar libraries with larger feature set](#similar-libraries-with-larger-feature-set)

## Installation

    npm install runnel

## Examples

### Parameter passing

```javascript
var runnel = require('runnel');

function uno (cb) {
  setTimeout(function () { cb(null, 'eins'); } , 100);
}

function dos (resuno, cb) {
  setTimeout(function () { cb(null, resuno, 'zwei'); } , 100);
}

function tres (resuno, resdos, cb) {
  setTimeout(function () { cb(null, resuno, resdos, 'drei'); } , 100);
}

runnel(
    uno
  , dos
  , tres 
  , function done(err, resuno, resdos, restres) {
      if (err) return console.error('Error: ', err);
      console.log('Success: uno: %s, dos: %s, tres: %s', resuno, resdos, restres);
    }
);

// => Success: uno: eins, dos: zwei, tres: drei
```

### Passing Array of functions

```js
// using uno, dos, tres and done functions from above

var funcs = [uno, dos, tres ];
funcs.push(done);

runnel(funcs);
```

### Seeding a start value

```js
function size (file, acc, cb) {
  var p = path.join(__dirname, '..', file);

  fs.stat(p, function (err, stat) {
    if (err) return cb(err);

    acc[file] = stat.size;
    cb(null, acc);
  });
}

runnel(
    // {} will be passed as the first value to next function 
    // and thus become 'acc', the accumulator
    runnel.seed({})
  
    // after we bind 'file' to the size function the resulting 
    // custom size function has signature 'function (acc, cb) {}'
  , size.bind(null, '.gitignore')
  , size.bind(null, '.jshintrc')
  , size.bind(null, '.travis.yml')

  , function done (err, acc) {
      if (err) return console.error(err);
      console.log('sizes:', acc);
    }
);

// => sizes: { '.gitignore': 96, '.jshintrc': 249, '.travis.yml': 52 }
```
[full example](https://github.com/thlorenz/runnel/blob/master/examples/runnel-seed-explicit-functions.js)

[same example using array of functions](https://github.com/thlorenz/runnel/blob/master/examples/runnel-seed.js)

## Features

- intuitive argument passing
- seeding a start value to enable async reduce like functionality
- [fails early](#early-failure)
- **no magic**
  - no special (ab)uses of `this`
  - no context passing
- adheres to known nodejs pattern i.e., callbacks are expected to be of the form `function (err[,res]*) { ... }`
- super small
- browser support

## API

All functions below are expected to invoke the callback like so:
  - `cb(null, res1[, res2][,..]` if no error occurred
  - `cb(err)` if an error occurred

### *runnel(fn1[, fn2][, fn3][, ...], done)*

Sequentially runs all the given functions, passing results from one to the next. In case any of the functions calls back
with an error `done` will be called with that error immediately.

### *runnel([fn1, fn2, .., done])*

Same as above except that functions are passed as an array rather than as separate values, which allows building up a
flows with array operations like `concat` and `push` like is done in [this example](
https://github.com/thlorenz/runnel/blob/master/examples/runnel-seed.js).

More importantly it allows `map`ping values to async functions and then execute them sequentially, akin to
[`Q.all`](https://github.com/kriskowal/q#combination).

For more information see [this real world example](https://github.com/thlorenz/bromote/blob/master/index.js).

### *runnel.seed(value)*

Returns a function that will call back with the seeded `value` as the result, which can then be consumed by the next
function in line. This allows easily implementing async reduce flows as shown in [this
example](https://github.com/thlorenz/runnel#seeding-a-start-value)

## Compatibility

- commonJS compatible, so it works with nodejs and browserify
- AMD compliant (i.e., shimlessly works with [requirejs](https://github.com/jrburke/requirejs))
- attaches itself to the `window` object if neither commonJS or AMD support is detected

## Early failure

In order to avoid surprises runnel aborts the entire call chain once any function calls back with an error.

In that case the last function in the chain is called with the error in order to provide feedback that something went wrong.

## Why another flow control library

From my experience simple, sequential flow control is sufficient in 90% of the cases and therefore using fuller featured
and therefore also larger flow control libraries is unnecessary in those instances.

runnel however was designed for exactly these situations.

It helps avoid nesting callbacks and results in much more readable and maintainable code.

It also helps minimize repetitive `if (err) { cb(err); return; } ...` occurences.

Finally because runnel focuses only on one thing it's a very small module (~ 80 loc).

## More Examples

Looky here: [examples](https://github.com/thlorenz/runnel/tree/master/examples) or consult the [tests](https://github.com/thlorenz/runnel/tree/master/test).

## Similar libraries with larger feature set 

- [async](https://github.com/caolan/async)
- [asyncjs](https://github.com/fjakobs/async.js)
- [step](https://github.com/creationix/step) 
- [q](https://github.com/kriskowal/q) (promises library)
