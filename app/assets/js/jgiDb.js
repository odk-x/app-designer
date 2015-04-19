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

/**
 * Write a follow object (as defined in the models module).
 */
exports.writeNewFollow = function(control, follow) {

  var table = tables.follow;
  var cols = table.columns;
  
  var struct = {};

  struct[cols.date] = follow.date;
  struct[cols.beginTime] = follow.beginTime;
  struct[cols.focalId] = follow.focalId;
  struct[cols.communityId] = follow.communityId;
  struct[cols.researcher] = follow.researcher;

  var stringified = JSON.stringify(struct);

  control.addRow(table.tableId, stringified);

};


/**
 * Write a row for the chimp into the database.
 *
 * If isUpdate is truthy, it instead updates, rather than adds a rwo, and the
 * rowId property of the chimp must be valid.
 */
exports.writeRowForChimp = function(control, chimp, isUpdate) {

  var table = tables.chimpObservation;
  var cols = table.columns;

  // We're going to assume that all variable have a value. In otherwords, there
  // can be no defaults that are cannot be written to the database. We write
  // every value.
  var struct = {};
  struct[cols.date] = chimp.date;
  struct[cols.followStartTime] = chimp.followStartTime;
  struct[cols.time] = chimp.time;
  struct[cols.focalId] = chimp.focalChimpId;
  struct[cols.chimpId] = chimp.chimpId;
  struct[cols.certainty] = chimp.certainty;
  struct[cols.withinFive] = chimp.distance;
  struct[cols.closest] = chimp.closest;
  struct[cols.estrus] = chimp.estrus;

  var stringified = JSON.stringify(struct);

  if (isUpdate) {
    var rowId = chimp.rowId;
    if (!rowId) {
      throw new Error('chimp.rowId was falsey!');
    }
    control.updateRow(table.tableId, stringified, rowId);
  } else {
    control.addRow(table.tableId, stringified);
  }

};
