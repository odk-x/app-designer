// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Oyvind Sean Kinsey http://kinsey.no/blog (2010)
//                  Victor Homyakov <victor-homyakov@users.sourceforge.net> (2010)

var modes = {};

/**
 * @param {Error} ex The error to create a stacktrace from (optional)
 * @param {String} mode Forced mode (optional, mostly for unit tests)
 */
var run = function(ex, mode) {
    mode = mode || discover_mode(ex);

    var mode_fn = modes[mode];
    // handle this better?
    if (!mode_fn) {
        return [];
    }

    var arg = ex;
    if (mode === 'other') {
        arg = arguments.callee;
    }

    var str_frames = mode_fn(arg);
    var frames = [];
    var regex = /^(?:(.*)@)?(.*?):(\d+)(?::(\d+))?$/
    for (var i=0 ; i< str_frames.length ; ++i) {
        if (!str_frames[i]) {
            continue;
        }
        var matches = str_frames[i].match(regex);
        frames.push({
            func: matches[1],
            filename: matches[2],
            line: matches[3],
            column: matches[4]
        })
    }

    return frames;
};

/**
 * Mode could differ for different exception, e.g.
 * exceptions in Chrome may or may not have arguments or stack.
 *
 * @return {String} mode of operation for the exception
 */
var discover_mode = function(e) {
    if (e['arguments'] && e.stack) {
        return 'chrome';
    } else if (e.stackArray) {
        return 'chrome'; // TODO phantomjs
    } else if (e.stack && e.sourceURL) {
        return 'safari';
    } else if (e.stack && e.number) {
        return 'ie';
    } else if (e.stack && e.fileName) {
        return 'firefox';
    } else if (e.stack && !e.fileName) {
        // Chrome 27 does not have e.arguments as earlier versions,
        // but still does not have e.fileName as Firefox
        return 'chrome';
    }
    return 'other';
};

/**
 * Given an Error object, return a formatted Array based on Chrome's stack string.
 *
 * @param e - Error object to inspect
 * @return Array<String> of function calls, files and line numbers
 */
modes.chrome = function(e) {
    return (e.stack + '\n')
        .replace(/^[\s\S]+?\s+at\s+/, ' at ') // remove message
        .replace(/^\s+(at eval )?at\s+/gm, '') // remove 'at' and indentation
        .replace(/^([^\(]+?)([\n$])/gm, '{anonymous}() ($1)$2')
        .replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}() ($1)')
        .replace(/^(.+) \((.+)\)$/gm, '$1@$2')
        .split('\n')
        .slice(0, -1);
};

/**
 * Given an Error object, return a formatted Array based on Safari's stack string.
 *
 * @param e - Error object to inspect
 * @return Array<String> of function calls, files and line numbers
 */
modes.safari = function(e) {
    return e.stack.replace(/\[native code\]\n/m, '')
        .replace(/^(?=\w+Error\:).*$\n/m, '')
        .replace(/^@/gm, '{anonymous}()@')
        .split('\n');
};

/**
 * Given an Error object, return a formatted Array based on IE's stack string.
 *
 * @param e - Error object to inspect
 * @return Array<String> of function calls, files and line numbers
 */
modes.ie = function(e) {
    return e.stack
        .replace(/^\s*at\s+(.*)$/gm, '$1')
        .replace(/^Anonymous function\s+/gm, '{anonymous}() ')
        .replace(/^(.+)\s+\((.+)\)$/gm, '$1@$2')
        .split('\n')
        .slice(1);
};

/**
 * Given an Error object, return a formatted Array based on Firefox's stack string.
 *
 * @param e - Error object to inspect
 * @return Array<String> of function calls, files and line numbers
 */
modes.firefox = function(e) {
    return e.stack.replace(/(?:\n@:0)?\s+$/m, '')
        .replace(/^(?:\((\S*)\))?@/gm, '{anonymous}($1)@')
        .split('\n');
};

// Safari 5-, IE 9-, and others
modes.other = function(curr) {
    return [];

    // TODO how to handle legacy shit?
    var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
    while (curr && curr['arguments'] && stack.length < maxStackSize) {
        fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
        args = Array.prototype.slice.call(curr['arguments'] || []);
        stack[stack.length] = fn + '(' + stringifyArguments(args) + ')';
        curr = curr.caller;
    }
    return stack;
};

/**
 * Given arguments array as a String, substituting type names for non-string types.
 *
 * @param {Arguments,Array} args
 * @return {String} stringified arguments
 */
var stringifyArguments = function(args) {
    var result = [];
    var slice = Array.prototype.slice;
    for (var i = 0; i < args.length; ++i) {
        var arg = args[i];
        if (arg === undefined) {
            result[i] = 'undefined';
        } else if (arg === null) {
            result[i] = 'null';
        } else if (arg.constructor) {
            if (arg.constructor === Array) {
                if (arg.length < 3) {
                    result[i] = '[' + stringifyArguments(arg) + ']';
                } else {
                    result[i] = '[' + stringifyArguments(slice.call(arg, 0, 1)) + '...' + stringifyArguments(slice.call(arg, -1)) + ']';
                }
            } else if (arg.constructor === Object) {
                result[i] = '#object';
            } else if (arg.constructor === Function) {
                result[i] = '#function';
            } else if (arg.constructor === String) {
                result[i] = '"' + arg + '"';
            } else if (arg.constructor === Number) {
                result[i] = arg;
            }
        }
    }
    return result.join(',');
};

module.exports = run;

