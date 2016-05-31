var test = require('tape')
var assert = require('assert')
var through = require('through')

var split = require('..')

function testStream(send, splitInstance) {
    splitInstance = splitInstance || split()
    var output = []
    var ts = through()
    ts.pipe(splitInstance.on('data', function(data) {
        output.push(data)
    }))
    send(ts)
    ts.end()
    return output
}

test('multi-packet split', function (t) {
    var output = testStream(function(ts) {
        ts.write("hello")
        ts.write("world\n")
        ts.write("goodbye")
        ts.write("world\n")
        ts.end()
    })
    t.deepEqual(output, ["helloworld", "goodbyeworld"])
    t.end()
})

test('single-packet split', function (t) {
    var output = testStream(function(ts) {
        ts.write("helloworld\ngoodbyeworld\n")
        ts.end()
    })
    t.deepEqual(output, ["helloworld", "goodbyeworld"])
    t.end()
})
test('no end split', function (t) {
    var output = testStream(function(ts) {
        ts.write("helloworld\ngoodbyeworld")
        ts.end()
    })
    t.deepEqual(output, ["helloworld", "goodbyeworld"])
    t.end()
})

test('many split', function (t) {
    var output = testStream(function(ts) {
        ts.write("1\n2\n3\n4\n5\n6\n7\n8")
        ts.end()
    })
    t.deepEqual(output, ["1", "2", "3", "4", "5", "6", "7", "8"])
    t.end()
})

test('split on different character: |', function (t) {
    var output = testStream(function(ts) {
        ts.write("hello|")
        ts.write("there|")
        ts.write("big|world")
        ts.end()
    }, split('|'))
    t.deepEqual(output, ["hello", "there", "big", "world"])
    t.end()
})
