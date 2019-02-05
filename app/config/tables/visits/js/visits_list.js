/**
 * This is the file that will be creating the list view.
 */

'use strict';

var locale = odkCommon.getPreferredLocale();
var idxStart = -1;
var visitsResultSet = {};

/**
 * Use chunked list view for larger tables: We want to chunk the displays so
 * that there is less load time.
 */

/**
 * Called when page loads to display things (Nothing to edit here)
 */
var deliveriesCBSuccess = function(result) {
    visitsResultSet = result;

    return (function() {
        displayGroup(idxStart);
    }());
};

var deliveriesCBFailure = function(error) {

    console.log('visits_list deliveriesCBFailure: ' + error);
};

var firstLoad = function() {
  resumeFn(0);
};

/**
 * Called when page loads to display things (Nothing to edit here)
 */
var resumeFn = function(fIdxStart) {
    odkData.getViewData(deliveriesCBSuccess, deliveriesCBFailure);

    idxStart = fIdxStart;
    console.log('resumeFn called. idxStart: ' + idxStart);
    // The first time through we're going to make a map of typeId to
    // typeName so that we can display the name of each shop's specialty.
    if (idxStart === 0) {
        // We're also going to add a click listener on the wrapper ul that will
        // handle all of the clicks on its children.
        $('#list').click(function(e) {
            var tableId = visitsResultSet.getTableId();
            // We set the rowId while as the li id. However, we may have
            // clicked on the li or anything in the li. Thus we need to get
            // the original li, which we'll do with jQuery's closest()
            // method. First, however, we need to wrap up the target
            // element in a jquery object.
            // wrap up the object so we can call closest()
            var jqueryObject = $(e.target);
            // we want the closest thing with class item_space, which we
            // have set up to have the row id
            var containingDiv = jqueryObject.closest('.item_space');
            var rowId = containingDiv.attr('rowId');
            console.log('clicked with rowId: ' + rowId);
            // make sure we retrieved the rowId
            if (rowId !== null && rowId !== undefined) {
                odkTables.editRowWithSurvey(null, visitsResultSet.getData(0, 'custom_visit_table_id'), rowId, visitsResultSet.getData(0, 'custom_visit_form_id'), null);
            }
        });
    }
};

/**
 * Displays the list view in chunks or groups. Number of list entries per chunk
 * can be modified. The list view is designed so that each row in the table is
 * represented as a list item. If you touch a particular list item, it will
 * expand with more details (that you choose to include). Clicking on this
 * expanded portion will take you to the more detailed view.
*/
var displayGroup = function(idxStart) {
    console.log('displayGroup called. idxStart: ' + idxStart);

    /* If the list comes back empty, inform the user */
    if (visitsResultSet.getCount() === 0) {
        var errorText = $('#error');
        errorText.show();
        errorText.text('No visits found'); // TODO: Translate this
    }

    /* Number of rows displayed per 'chunk' - can modify this value */
    var chunk = 50;
    for (var i = idxStart; i < idxStart + chunk; i++) {
      if (i >= visitsResultSet.getCount()) {
        break;
      }
      /* Creates the item space */
      // We're going to select the ul and then start adding things to it.
      //var item = $('#list').append('<li>');
      var item = $('<li>');
      item.attr('rowId', visitsResultSet.getData(i, 'customRowId'));
      item.attr('class', 'item_space');

      item.text(visitsResultSet.getData(i, 'first_name'));

      /* Creates arrow icon (Nothing to edit here) */
      var chevron = $('<img>');
      chevron.attr('src', odkCommon.getFileAsUrl('config/assets/img/little_arrow.png'));
      chevron.attr('class', 'chevron');
      item.append(chevron);

      /**
       * Adds other data/details in item space.
       * Replace COLUMN_NAME with the column whose data you want to display
       * as an extra detail etc. Duplicate the following block of code for
       * different details you want to add. You may replace occurrences of
       * 'field1' with new, specific label that are more meaningful to you
       */

      $('#list').append(item);

      // don't append the last one to avoid the fencepost problem
      var borderDiv = $('<div>');
      borderDiv.addClass('divider');
      $('#list').append(borderDiv);

    }
    if (i < visitsResultSet.getCount()) {
        setTimeout(resumeFn, 0, i);
    }
};
