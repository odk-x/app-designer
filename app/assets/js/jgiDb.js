/* global control */
'use strict';

// The schemae of our tables
var tables = require('./jgiTables');
var db = require('./jgiDb');
db.noop();

/**
 * Create a where clause for use in a Tables query. columns must be an array
 * of strings.
 *
 * ['foo', 'bar'] would create something like:
 *  foo = ? AND bar = ?
 */
exports.createWhereClause = function createWhereClause(columns) {
  var result = '';
  columns.forEach(function(value, index, array) {
    result += value + ' = ?';
    if (index !== array.length - 1) {
      result += ' AND ';
    }
  });
  return result;
};

/**
 * Get a query for all the data at the given date and time for the specified
 * focal chimp. Together this specifies a unique time point in a follow.
 */
exports.getTableDataForTimePoint = function(date, time, focalChimpId) {

  var table = tables.followArrival;

  var whereClause = exports.createWhereClause(
    [
      table.columns.date,
      table.columns.focalId,
      table.columns.time
    ]
  );

  var selectionArgs = [date, focalChimpId, time];

  var result = control.query(
      table.tableId,
      whereClause,
      selectionArgs
  );

  return result;
};

exports.getFoodDataForTimePoint = function(date, timeBegin, focalChimpId) {

  var table = tables.food;

  var whereClause = exports.createWhereClause(
    [
      table.columns.date,
      table.columns.focalId,
      table.columns.timeBegin
    ]
  );

  var selectionArgs = [date, focalChimpId, timeBegin];

  var result = control.query(
      table.tableId,
      whereClause,
      selectionArgs
  );

  return result;

};

exports.getFoodDataForDatePoint = function(date, focalChimpId) {

  var table = tables.food;

  var whereClause = exports.createWhereClause(
    [
      table.columns.date,
      table.columns.focalId
    ]
  );

  var selectionArgs = [date, focalChimpId];

  var result = control.query(
      table.tableId,
      whereClause,
      selectionArgs
  );

  return result;

};

exports.getSpeciesDataForTimePoint = function(date, timeBegin, focalChimpId) {

  var table = tables.species;

  var whereClause = exports.createWhereClause(
    [
      table.columns.date,
      table.columns.focalId,
      table.column.timeBegin
    ]
  );

  var selectionArgs = [date, focalChimpId, timeBegin];

  var result = control.query(
      table.tableId,
      whereClause,
      selectionArgs
  );

  return result;

};

exports.getSpeciesDataForTimePoints = function(date, focalChimpId) {

  var table = tables.species;

  var whereClause = exports.createWhereClause(
    [
      table.columns.date,
      table.columns.focalId,
    ]
  );

  var selectionArgs = [date, focalChimpId];

  var result = control.query(
      table.tableId,
      whereClause,
      selectionArgs
  );

  return result;

};

/**
 * Get a query for all the data at the given date and time for all
 * the chimps
 */
exports.getUpdateAboutAllChimps = function(date, time) {

  var table = tables.followArrival;

  var whereClause = exports.createWhereClause(
    [
      table.columns.date,
      table.columns.time,
    ]
  );

  var selectionArgs = [date, time];

  var result = control.query(
      table.tableId,
      whereClause,
      selectionArgs
  );

  return result;

};
