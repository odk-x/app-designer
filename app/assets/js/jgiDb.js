/* global control */
'use strict';

// The schemae of our tables
var tables = require('./jgiTables');
var models = require('./jgiModels');

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
 * Get an array of FollowInterval objects for the Follow specified by the date,
 * beginTime, and focalId.
 */
exports.getFollowIntervalsForFollow = function getFollowIntervalsForFollow(
    control,
    date,
    beginTime,
    focalId
) {
  // We don't have a straight forward way of getting FollowInterval objects out
  // of the database, as we've had to create the notion for our own purposes.
  // Since a FollowInterval is a subset of the information in a Chimp, we're
  // going to just query for a Chimp known to be present that day (which thus
  // might break as we try to generalize this function), and then pull the
  // necessary data out of the Chimp.
  var table = tables.chimpObservation;
  var cols = table.columns;

  var knownChimpId = 'sam';

  var whereClause = exports.createWhereClause(
    [
      cols.date,
      cols.focalId,
      cols.followStartTime,
      cols.chimpId
    ]
  );

  var selectionArgs = [date, focalId, beginTime, knownChimpId];

  var tableData = control.query(
      table.tableId,
      whereClause,
      selectionArgs
  );

  var result = exports.convertTableDataToFollowIntervals(tableData);
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
 * Convert a TableData object that has queried the chimpObservation table to an
 * array of FollowInterval objects.
 */
exports.convertTableDataToFollowIntervals = function(data) {
  var result = [];

  var cols = tables.chimpObservation.columns;

  for (var i = 0; i < data.getCount(); i++) {
    var date = data.getData(i, cols.date);
    var beginTime = data.getData(i, cols.followStartTime);
    var focalId = data.getData(i, cols.focalId);

    var followInterval = new models.FollowInterval(date, beginTime, focalId);

    result.push(followInterval);
  }

  return result;
};


exports.convertTableDataToSpecies = function(data) {
  var result = [];
  var cols = tables.species.columns;

  for (var i = 0; i < data.getCount(); i++) {
    var date = data.getData(i, cols.date);
    var startTime = data.getData(i, cols.startTime);
    var endTime = data.getData(i, cols.endTime);
    var focalId = data.getData(i, cols.focalId);
    var speciesName = data.getData(i, cols.speciesName);
    var speciesCount = data.getData(i, cols.speciesCount);
    var rowId = data.getRowId(i);

    var species = new models.Species(
        rowId,
        date,
        focalId,
        startTime,
        endTime,
        speciesName,
        speciesCount
    );

    result.push(species);
  }

  return result;
};


exports.convertTableDataToFood = function(data) {
  var result = [];
  var cols = tables.food.columns;

  for (var i = 0; i < data.getCount(); i++) {
    var rowId = data.getRowId(i);

    var date = data.getData(i, cols.date);
    var focalId = data.getData(i, cols.focalId);
    var foodName = data.getData(i, cols.foodName);
    var foodPart = data.getData(i, cols.foodPart);
    var startTime = data.getData(i, cols.startTime);
    var endTime = data.getData(i, cols.endTime);

    var food = new models.Food(
        rowId,
        date,
        focalId,
        startTime,
        endTime,
        foodName,
        foodPart
    );

    result.push(food);
  }

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


/**
 * Convert a TableData object to a list of Follow objects.
 */
exports.convertTableDataToFollows = function convertTableDataToFollows(data) {
  var result = [];

  var cols = tables.follow.columns;

  for (var i = 0; i < data.getCount(); i++) {
    var date = data.getData(i, cols.date);
    var beginTime = data.getData(i, cols.beginTime);
    var focalId = data.getData(i, cols.focalId);
    var communityId = data.getData(i, cols.communityId);
    var researcher = data.getData(i, cols.researcher);

    var follow = new models.Follow(
        date,
        beginTime,
        focalId,
        communityId,
        researcher
    );

    result.push(follow);
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

exports.getFoodDataForDate = function(control, date, focalChimpId) {

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

exports.getSpeciesDataForDate = function(control, date, focalChimpId) {

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
 * Return an array of all the Follow objects in the database.
 *
 * Note that this returns actual Follow objects, NOT a TableData object
 * containing all follows.
 */
exports.getAllFollows = function getAllFollows(control) {
  var table = tables.follow;

  var tableData = control.query(table.tableId, null, null);

  var result = exports.convertTableDataToFollows(tableData);
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


exports.updateChimpsForPreviousTimepoint = function(prev, curr) {
  if (prev.length === 0) {
    return curr;
  } else if (prev.length !== curr.length) {
    throw new Error('previous and current chimps not the same size');
  }

  var prevMap = {};
  var currMap = {};

  for (var i = 0; i < prev.length; i++) {
    var prevChimpId = prev[i].chimpId;
    var currChimpId = curr[i].chimpId;
    prevMap[prevChimpId] = prev[i];
    currMap[currChimpId] = curr[i];
  }

  var result = [];
  prev.forEach(function(chimp) {
    var chimpId = chimp.chimpId;
    var prevChimp = prevMap[chimpId];
    var currChimp = currMap[chimpId];
    if (!prevChimp || !currChimp) {
      throw new Error('did not find prev or curr chimp with id: ' + chimpId);
    }

    result.push(exports.updateChimpForPreviousTimepoint(prevChimp, currChimp));
  });

  return result;
};


exports.updateChimpForPreviousTimepoint = function(prev, curr) {
  if (!prev || !curr) {
    throw new Error('prev and curr chimps must be truthy');
  }

  if (prev.chimpId !== curr.chimpId) {
    throw new Error('chimp ids must be identical to update');
  }

  curr.certainty = prev.certainty;
  curr.estrus = prev.estrus;

  // chimp was there in the last time slot, update to continuing
  if (prev.time === '15' ||
      prev.time === '10' ||
      prev.time === '5' ||
      prev.time === '1'
  ) {
    // Must match timeLabels in jgiFollow.js.
    curr.time = '1';
  }

  return curr;
};


/**
 * Write a row for the food item into the database.
 *
 * If isUpdate is truthy, it instead updates, rather than adds, a row, and the
 * rowId property of the food must be valid.
 */
exports.writeRowForFood = function(control, food, isUpdate) {
  var table = tables.food;
  var cols = table.columns;

  var struct = {};
  struct[cols.focalId] = food.focalChimpId;
  struct[cols.date] = food.date;
  struct[cols.foodName] = food.foodName;
  struct[cols.foodPart] = food.foodPartEaten;
  struct[cols.startTime] = food.startTime;
  struct[cols.endTime] = food.endTime;

  var stringified = JSON.stringify(struct);

  if (isUpdate) {
    var rowId = food.rowId;
    if (!rowId) {
      throw new Error('food.rowId was falsey!');
    }
    control.updateRow(table.tableId, stringified, rowId);
  } else {
    control.addRow(table.tableId, stringified);
  }
};


/**
 * Write a row for the species into the database.
 *
 * If isUpdate is truthy, update, rather than add a row. In the case of an
 * update the rowId property of the species must be valid.
 */
exports.writeRowForSpecies = function(control, species, isUpdate) {
  var table = tables.species;
  var cols = table.columns;

  var struct = {};
  struct[cols.focalId] = species.focalChimpId;
  struct[cols.date] = species.date;
  struct[cols.speciesName] = species.speciesName;
  struct[cols.speciesCount] = species.number;
  struct[cols.startTime] = species.startTime;
  struct[cols.endTime] = species.endTime;

  var stringified = JSON.stringify(struct);

  if (isUpdate) {
    var rowId = species.rowId;
    if (!rowId) {
      throw new Error('species.foodId was falsey');
    }
    control.updateRow(table.tableId, stringified, rowId);
  } else {
    control.addRow(table.tableId, stringified);
  }
};
