;(function () {
  'use strict';
  var slice = Array.prototype.slice;
  var isArray = typeof Array.isArray === 'function'
      ? Array.isArray
      : function (a) { return typeof a === 'object' && !!a.length; };

  function validate (funcs) {
    if (funcs.length < 2)
      throw new Error('Give runnel at least 2 functions to do any work.');

    for (var i = 0; i < funcs.length; i++) {
      if (typeof funcs[i] !== 'function')
        throw new Error('All arguments passed to runnel need to be a function. Argument at (zero based) position ' + i + ' is not.');
    }
  }

  function addDetails(err) {
    try {
      err.message = (err.message || '') + '\nDetails:\n' + err.stack;
    } catch (e) {
      // the error object is sealed, frozen or the message property is read-only
      var newError = new Error();
      newError.message = (err.message || '') + '\nDetails:\n' + err.stack;
      newError.type = err.type;
      newError.stack = err.stack;
      err = newError;
    }
    return err;
  }

  function runnel (arg) {
    var funcs = isArray(arg) ? arg : slice.call(arguments);
    validate(funcs);

    var done = funcs.pop()
      , func = funcs.shift()
      , bailed = false
      ;

    function handler (err, res /* optional and could be more than one */) {
      // Prevent re-triggering call chain when a func calls back with an err first and without one later
      if (bailed) return;
      var args;

      // Bail if any of the funcs encounters a problem
      if (err) {
        bailed = true;
        args = slice.call(arguments);
        addDetails(err);
        done.apply(this, args);
        return;
      }

      func = funcs.shift();

      if (func) {
        // get args without err
        args = slice.call(arguments, 1);

        // this handler becomes the callback for the current func we are calling
        args.push(handler);

        try {
          func.apply(this, args);
        } catch (err) {
          bailed = true;
          done.call(this, addDetails(err));
          return;
        }
      } else {
        args = slice.call(arguments);
        done.apply(this, args);
      }
    }

    func.call(this, handler);
  }

  runnel.seed = function () {
    var args = [null].concat(slice.call(arguments))
      , that = this;
    return function (cb) {
      setTimeout(function () { cb.apply(that, args); }, 0);
    };
  };

  if (typeof module === 'object' && typeof module.exports === 'object') {
    // CommonJS, just export
    module.exports = runnel;
  } else if (typeof define === 'function' && define.amd) {
    // AMD support
    define(function () { return runnel; });
  } else if (typeof window === 'object') {
    // If no AMD and we are in the browser, attach to window
    window.runnel = runnel;
  }
})();
