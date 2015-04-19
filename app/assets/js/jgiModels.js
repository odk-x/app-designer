'use strict';

/**
 * The models we will use for rows in the database.
 */


/**
 * A follow, which includes a set of timepoints, where each time point has a
 * set of observations about chimps.
 */
exports.Follow = function Follow(
    date,
    beginTime,
    focalId,
    communityId,
    researcher
) {

  if (!(this instanceof Follow)) {
    throw new Error('must use new');
  }
  
  this.date = date;
  this.beginTime = beginTime;
  this.focalId = focalId;
  this.communityId = communityId;
  this.researcher = researcher;

};


/**
 * The observation of a chimp in the a particular timepoint.
 */
exports.Chimp = function Chimp(
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
) {

  if (!(this instanceof Chimp)) {
    throw new Error('must use new');
  }

  // for our model only--can be undefined
  this.rowId = rowId;

  // data that we must set.
  this.date = date;
  this.followStartTime = followStartTime;
  this.focalChimpId = focalChimpId;
  this.chimpId = chimpId;
  this.time = time;
  this.certainty = certainty;
  this.withinFive = withinFive;
  this.estrus = estrus;
  this.closest = closest;

};
