'use strict';

var test = require('tape');
var db = require('./jgiDb');

test('create where clause test', function(t) {
  t.plan(2);

  var fooBar = db.createWhereClause(['foo', 'bar']);
  t.equal(fooBar, 'foo = ? AND bar = ?');

  var foo = db.createWhereClause(['foo']);
  t.equal(foo, 'foo = ?');

});
