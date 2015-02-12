/**
 * This is the file that will be creating the list view.
 */
/* global $, control, data */
'use strict';

if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/visit_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            if (dataObj === undefined || dataObj === null) {
                console.log('Could not load data json for table: visit');
            }
            window.data.setBackingObject(dataObj);
        }
    });
}

// we need plot names.
var plotIdToName = {};
var plots = control.query('plot', null, null);

for (var rowI = 0; rowI < plots.getCount(); rowI++) {
    var rowId = plots.getRowId(rowI);
    var plotName = plots.getData(rowI, 'plot_name');

    plotIdToName[rowId] = plotName;
}

// Use chunked list view for larger tables: We want to chunk the displays so
// that there is less load time.
            
/**
 * Called when page loads. idxStart is the index of the row that should be
 * displayed at this iteration through the loop.
 */
var resumeFn = function(idxStart) {

    if (idxStart === 0) {
        // We want to be able to drag and drop without the drop triggering a click.
        // Idea for this taken from:
        // http://stackoverflow.com/questions/14301026/how-do-i-avoid-a-click-event-firing-after-dragging-a-gridster-js-widget-with-cli

        var preventClick = function(e) {
            e.stopPropagation();
            e.preventDefault();
        };

        $('.gridster ul').gridster({
            widget_margins: [10, 10],
            widget_base_dimensions: [140, 140],
            draggable: {
                start: function(event, ui) {
                    // stop propagating in the capture phase.
                    ui.$player[0].addEventListener('click', preventClick, true);
                },
                stop: function(event, ui) {
                    var player = ui.$player;
                    setTimeout(function() {
                        player[0].removeEventListener(
                          'click',
                          preventClick,
                          true);
                    });
                }
            }
        });
    }

    console.log('resumeFn called. idxStart: ' + idxStart);
    // The first time through construct any constants you need to refer to
    // and set the click handler on the list elements.
    if (idxStart === 0) {
        // This add a click handler on the wrapper ul that will handle all of
        // the clicks on its children.
        $('#list').click(function(e) {
            var tableId = data.getTableId();
            // We have set the rowId while as the li id. However, we may have
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
                // we'll pass null as the relative path to use the default file
                control.openDetailView(
                    tableId,
                    rowId,
                    'tables/visit/html/visit_detail.html');
            }
        });
    }
    
    return (function() {
        displayGroup(idxStart);
    }());
};
            
/**
 * Displays the list view in chunks. The number of list entries per chunk
 * can be modified. The list view is designed so that each row in the table is
 * represented as a list item. If you click a particular list item, it will
 * call the click handler defined in resumeFn. In the example case it opens
 * a detail view on the clicked row.
 */
var displayGroup = function(idxStart) {

    var gridster = $('.gridster ul').gridster().data('gridster');

    // Number of rows displayed per chunk
    var chunk = 50;
    for (var i = idxStart; i < idxStart + chunk; i++) {
        if (i >= data.getCount()) {
            break;
        }

        // Creates the space for a single element in the list. We add rowId as
        // an attribute so that the click handler set in resumeFn knows which
        // row was clicked.
        var item = $('<li>');

        var containerDiv = $('<div>');
        containerDiv.addClass('content-holder');
        
        var displayDate = data.getData(i, 'date');
        // We only want to display the date, not the time and 'T', which are
        // important to the db representation
        if (displayDate !== undefined && displayDate !== null) {
            displayDate = displayDate.substring(0, 10);
        }
        containerDiv.text(displayDate);

        item.attr('rowId', data.getRowId(i));
        item.addClass('item_space');
        item.addClass('grid-item');
        item.append(containerDiv);
                
        var plotItem = $('<li>');
        plotItem.attr('class', 'detail');

        var plotId = data.getData(i, 'plot_id');
        var plotName = plotIdToName[plotId];
        if (!plotName) {
            console.log('could not find plot name for id: ' + plotId);
            plotName = plotId;
        }

        plotItem.text(plotName);
        item.append(plotItem);

        gridster.add_widget(item, 1, 1);
                
        //$('#list').append(item);

        // don't append the last one to avoid the fencepost problem
        //var borderDiv = $('<div>');
        //borderDiv.addClass('divider');
        //$('#list').append(borderDiv);

    }
    if (i < data.getCount()) {
        setTimeout(resumeFn, 0, i);
    }
};
