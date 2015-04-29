/* global control */
'use strict';

// The schemae of our tables
var tables = require('./jgiTables');
var models = require('./jgiModels');
var utils = require('./jgiUtil.js')

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
exports.getTableDataForTimePoint = function(
    control,
    date,
    followStartTime,
    focalChimpId
) {

  var table = tables.chimpObservation;

  var whereClause = exports.createWhereClause(
    [
      table.columns.date,
      table.columns.focalId,
      table.columns.followStartTime
    ]
  );

  var selectionArgs = [date, focalChimpId, followStartTime];

  var result = control.query(
      table.tableId,
      whereClause,
      selectionArgs
  );

  return result;
};


/**
 * Convert a table data (eg as returned by getTableDataForTimepoint) to an
 * array of Chimp objects.
 */
exports.convertTableDataToChimps = function(data) {

  var result = [];

  var cols = tables.chimpObservation.columns;

  for (var i = 0; i < data.getCount(); i++) {

    var rowId = data.getRowId(i);

    var chimpId = data.getData(i, cols.chimpId).trim();
    var time = data.getData(i, cols.time).trim();
    var certainty = data.getData(i, cols.certainty).trim();
    var withinFive = data.getData(i, cols.withinFive).trim();
    var estrus = data.getData(i, cols.estrus).trim();
    var closest = data.getData(i, cols.closest).trim();
    var focalChimpId = data.getData(i, cols.focalId).trim();
    var date = data.getData(i, cols.date).trim();
    var followStartTime = data.getData(i, cols.followStartTime).trim();

    var newChimp = new models.Chimp(
        rowId,
        date,
        followStartTime,
        focalChimpId,
        chimpId,
        time,
        certainty,
        withinFive,
        estrus,
        closest
    );

    result.push(newChimp);

  }

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
  struct[cols.time] = parseInt(chimp.time);
  struct[cols.focalId] = chimp.focalChimpId;
  struct[cols.chimpId] = chimp.chimpId;
  struct[cols.certainty] = parseInt(chimp.certainty);
  struct[cols.withinFive] = parseInt(chimp.withinFive);
  struct[cols.closest] = parseInt(chimp.closest);
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

  // var previousTime = util.decrementTime(time); 

  // var table = exports.getTableDataforTimePoint(control, date, previousTime, focalChimpId)

// updates the current set of chimps to presist data from the previous set of chimps
// returns an array filled with the updated chimps containing persistent data
exports.updateChimpsForPreviousTimepoint = function(Chimp[] prev, Chimp[] curr) {
  if (prev.length != curr.length) {
    throw new Error('not the same set of chimps');
  }

  var prevMap = {}; 
  var currMap = {}; 
  var result = {}; 

  // mapping the previous and current arrays where the Keys are chimpIDs
  for (var i = 0; i < prev.length; i++) { 
    prevMap[prev[i].chimpId] = prev[i]; 
    currMap[curr[i].chimpId] = curr[i];    
  }

  for (var chimpId in currMap) {
    if (currMap.hasOwnProperty(chimpId)) {
      var updatedChimp = updateChimpsForPreviousTimepoint(prevMap[chimpId], currMap[chimpId]);
      result.push(updatedChimp);      
    }
  }

  return result; 
};

// updates the current chimp to presist data from its previous information
// returns the updated current chimp
exports.updateChimpsForPreviousTimepoint = function(Chimp prev, Chimp curr) {
  if (prev.chimpId != curr.chimpId) {
    throw new Error('chimps must have same ID to compare'); 
  }

  curr.defCertainty = prev.defCertainty; 
  curr.defEstrus = prev.defEstrus; 

  switch(prev.defTime) {
    case 15: 
    case 10: 
    case 5: 
    case 1: 
      curr.defTime = 1; // chimps arrived at prev timepoint 
      break; 
    case 0:
    case -5:
    case -10: 
    case -15:
      curr.defTime = 0; // chimps never arrived or left
      break;
  }

  return curr; 
};
