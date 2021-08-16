/* global odkTables */

'use strict';

(function () {
  var openSkipLogicOnClick = function () {
    // Open SkipLogic's list view with the default query
    odkTables.openTableToListView(null, 'SkipLogic');
  };

  document.addEventListener('DOMContentLoaded', function () {
    document
      .getElementById('openSkipLogicBtn')
      .addEventListener('click', openSkipLogicOnClick);

    // remove d-none so the page is visible
    document.getElementById('wrapper').classList.remove('d-none');
  });
})();
