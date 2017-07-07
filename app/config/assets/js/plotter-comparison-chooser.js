/* global $, _, odkTables, odkData, util */
/* exported resumeFn */
'use strict';

/**
 * This is the file that will be creating the list view.
 */

 // Use chunked list view for larger tables: We want to chunk the displays so
// that there is less load time.
var visitResultSet = {};   
var idxStart = -1;
var compareTypeValStr = 'compareTypeVal';
var compareTypeStr = 'compareType';
var compareTypeFromChooser = util.getQueryParameter('compareType');
var originPlotId = util.getQueryParameter('plotId');
    
function cbSuccess(result) {
    visitResultSet = result;

    
    return (function() {
        displayGroup();
    }());
}

function cbFailure(error) {

    console.log('visit_list: cbFailure failed with error: ' + error);
}
     
/**
 * Called when page loads. idxStart is the index of the row that should be
 * displayed at this iteration through the loop.
 */
var resumeFn = function(fidxStart) {
    odkData.query('visit', null, null, null, null, null, null, null, null, true, 
        cbSuccess, cbFailure);

    idxStart = fidxStart;
    if (idxStart === 0) {
        // We want to be able to drag and drop without the drop triggering a click.
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
            var compareTypeVal = containingDiv.attr(compareTypeValStr);
            console.log('clicked with ' + compareTypeValStr + ': ' + compareTypeVal);
          // make sure we retrieved the rowId
            if (compareTypeVal !== null && compareTypeVal !== undefined) {
                // we'll pass null as the relative path to use the default file
                var compareTypeQueryParam =
					'?' + compareTypeStr + '=' + encodeURIComponent(compareTypeFromChooser) +
                    // Soil should be changed to compareType passed in via query parameter
                    '&' + compareTypeValStr + '=' + encodeURIComponent(compareTypeVal);

                if (originPlotId !== null) {
                    compareTypeQueryParam += '&plotId=' + encodeURIComponent(originPlotId);
                }

                odkTables.launchHTML(null, 'config/assets/plotter-comparison-reports.html' + compareTypeQueryParam);
            }
        });
    }

};


var displayGroup = function() {
    var compareTypeArray = [];
    var i = 0;
    console.log('Compare type chosen: '  + compareTypeFromChooser);
    // Create an array of values of the chosen type from the visit results
    for (i = 0; i < visitResultSet.getCount(); i++) {
        compareTypeArray.push(visitResultSet.getData(i, compareTypeFromChooser));    
    }

    console.log(compareTypeFromChooser + " list: " + compareTypeArray);

    // Remove repeating values so the comparison choices are unique
    var uniqCompareTypeArray = [];
    uniqCompareTypeArray = _.uniq(compareTypeArray);

    for (i = 0; i < uniqCompareTypeArray.length; i++) {
        addDataForCompareType(uniqCompareTypeArray[i]);
    }
    console.log(compareTypeFromChooser + ' list (unique): ' + uniqCompareTypeArray);

    console.log('Leaving displayGroup');
        
};


function addDataForCompareType(compareType) {
    var gridster = $('.gridster ul').gridster().data('gridster');
    // Creates the space for a single element in the list. We add rowId as
    // an attribute so that the click handler set in resumeFn knows which
    // row was clicked.
    var item = $('<li>');

    var containerDiv = $('<div>');
    containerDiv.text(util.formatDisplayText(compareType));
    containerDiv.addClass('content-holder');

    item.attr('compareTypeVal', compareType);
    item.attr('class', 'item_space');
    item.addClass('grid-item');

    item.append(containerDiv);

    gridster.add_widget(item, 1, 1);
}
