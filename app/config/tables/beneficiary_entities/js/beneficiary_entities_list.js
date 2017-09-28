/**
 * Render registration list
 */
'use strict';

var idxStart = -1;
var beneficiaryEntitiesResultSet = {};


/**
 * Called when page loads to display things (Nothing to edit here)
 */
var registrationCBSuccess = function(result) {
    beneficiaryEntitiesResultSet = result;
    console.log(result.getCount());

    return (function() {
        displayGroup(idxStart);
    }());
};

var registrationCBFailure = function(error) {

    console.log('registration_list registrationCBFailure: ' + error);
};

var firstLoad = function() {
    resumeFn(0);
};

/**
 * Called when page loads to display things (Nothing to edit here)
 */
var resumeFn = function(fIdxStart) {
    $.getScript("../../../assets/js/util.js", function(){});
    odkData.getViewData(registrationCBSuccess, registrationCBFailure);

    idxStart = fIdxStart;
    console.log('resumeFn called. idxStart: ' + idxStart);
    if (idxStart === 0) {
        // We're also going to add a click listener on the wrapper ul that will
        // handle all of the clicks on its children.
        $('#list').click(function(e) {
            var tableId = beneficiaryEntitiesResultSet.getTableId();
            // We set the rootRowId while as the li id. However, we may have
            // clicked on the li or anything in the li. Thus we need to get
            // the original li, which we'll do with jQuery's closest()
            // method. First, however, we need to wrap up the target
            // element in a jquery object.
            // wrap up the object so we can call closest()
            var jqueryObject = $(e.target);
            // we want the closest thing with class item_space, which we
            // have set up to have the row id
            var containingDiv = jqueryObject.closest('.item_space');
            var rootRowId = containingDiv.attr('rootRowId');
            var customRowId = containingDiv.attr('customRowId');
            console.log('clicked with rootRowId: ' + rootRowId);
            // make sure we retrieved the rootRowId
            if (rootRowId !== null && rootRowId !== undefined) {
                // we'll pass null as the relative path to use the default file
                var launchType = util.getQueryParameter('type');
                if (launchType == 'enable' || launchType == 'disable') {
                    odkTables.openDetail(null, util.getBeneficiaryEntityCustomFormId(), customRowId,
                        'config/tables/' + util.beneficiaryEntityTable + '/html/' + util.beneficiaryEntityTable + '_detail.html?type=' +
                        encodeURIComponent(launchType) + '&rootRowId=' + rootRowId);

                } else {
                    odkTables.openDetailWithListView(null, util.getBeneficiaryEntityCustomFormId(), customRowId,
                        'config/tables/' + util.beneficiaryEntityTable + '/html/' + util.beneficiaryEntityTable + '_detail.html?type=' +
                        encodeURIComponent(launchType) + '&rootRowId=' + rootRowId);
                }
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
    if (beneficiaryEntitiesResultSet.getCount() === 0) {
        var errorText = $('#error');
        errorText.show();
        errorText.text('No beneficiaries found'); // TODO: Translate this
    }

    /* Number of rows displayed per 'chunk' - can modify this value */
    var chunk = 50;
    for (var i = idxStart; i < idxStart + chunk; i++) {
        if (i >= beneficiaryEntitiesResultSet.getCount()) {
            break;
        }
        /* Creates the item space */
        // We're going to select the ul and then start adding things to it.
        //var item = $('#list').append('<li>');
        var item = $('<li>');
        item.attr('rootRowId', beneficiaryEntitiesResultSet.getRowId(i));
        item.attr('customRowId', beneficiaryEntitiesResultSet.getData(i, "custom_beneficiary_entity_row_id"));
        item.attr('class', 'item_space');
        item.attr('id', beneficiaryEntitiesResultSet.getData(i, '_id'));
        var beneficiary_entity_id = beneficiaryEntitiesResultSet.getData(i, 'beneficiary_entity_id');
        item.text('Beneficiary Entity ID: ' + beneficiary_entity_id);

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
    if (i < beneficiaryEntitiesResultSet.getCount()) {
        setTimeout(resumeFn, 0, i);
    }
};
