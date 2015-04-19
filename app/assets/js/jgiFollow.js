'use strict';

/**
 * Code for dealing with the follow screen, in particular the UI.
 */


function assertIsChimp(chimp) {
  if (chimp.constructor.name === 'Chimp') {
    throw new Error('parameter must be a chimp');
  }
}

exports.updateUiForChimp = function(chimp) {
  assertIsChimp(chimp);

  exports.updateIconForChimp(chimp);
  exports.updateCertaintyUiForChimp(chimp);
  exports.updateWithinFiveUiForChimp(chimp);
  exports.updateEstrusUiForChimp(chimp);
  exports.updateClosestUiForChimp(chimp);

};


/**
 * Update the icon for arrival and departure for the given chimp.
 */
exports.updateIconForChimp = function(chimp) {
  assertIsChimp(chimp);

};


/**
 * Update the UI for the certainty for a particular chimp.
 */
exports.updateCertaintyUiForChimp = function(chimp) {
  assertIsChimp(chimp);

};


exports.updateWithinFiveUiForChimp = function(chimp) {
  assertIsChimp(chimp);


};


exports.updateEstrusUiForChimp = function(chimp) {
  assertIsChimp(chimp);

};


exports.updateClosestUiForChimp = function(chimp) {
  assertIsChimp(chimp);

};


exports.updateUiForFollowTime = function() {

  // var followTimeUserFriendly;
  // if (followTime === null) {
  //   // notify the user if we haven't specified a follow time. This will be
  //   // only useful for debugging purposes.
  //   alert('No follow time has been specified!');
  //   followTimeUserFriendly = 'N/A';
  // } else {
  //   followTimeUserFriendly = followTime.replace('_', ':');
  // }

  // $('#time-label').eq(0).html(followTimeUserFriendly);

};
