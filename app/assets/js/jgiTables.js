'use strict';

/**
 * Identifiers about the tables we'll need to use for the JGI app.
 */

exports.followArrival = {
  tableId: 'follow_arrival',
  colums: {
    date: 'FA_FOL_date',
    time: 'FA_time_start',
    focalId: 'FA_FOL_B_focal_AnimID'
  }
};

exports.species = {
  tableId: 'other_species',
  columns: {
    date: 'OS_FOL_date',
    timeBegin: 'OS_time_begin',
    focalId: 'OS_FOL_B_focal_AnimID'
  }
};

exports.food = {
  tableId: 'food_bout',
  columns: {
    date: 'FB_FOL_date',
    focalId: 'FB_FOL_B_AnimID',
    timeBegin: 'FB_begin_feed_time'
  }
};
