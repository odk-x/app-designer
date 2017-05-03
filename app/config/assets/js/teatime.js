/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global odkTables */


// define a callback handler
// this doesn't need to return anything.
// we register it (at the bottom of the file)
//
// The framework will call this asynchronously 
// when a result is available. It does not call it
// if there is already a result available. You 
// should call this once after you are initialized
// to process any queued results.
function doActionCallback() {
   var action = odkCommon.viewFirstQueuedAction();
   if ( action !== null ) {
	  // process action -- be idempotent!
	  // if processing fails, the action will still
	  // be on the queue.
	  odkCommon.removeFirstQueuedAction();
	  return true;
   } else { 
	  return false;
   }
}

function display() {
	
    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/teaBackground.jpg)');

    var viewHousesButton = $('#view-houses');
    viewHousesButton.on(
        'click',
        function() {
            odkTables.openTableToListView(
				'teatime.js - openTableToListView -- Tea_houses',
                'Tea_houses',
                null,
                null,
                'config/tables/Tea_houses/html/Tea_houses_list.html');
        }
    );

    var viewTeasButton = $('#view-teas');
    viewTeasButton.on(
        'click',
        function() {
            odkTables.openTableToListView(
				'teatime.js - openTableToListView -- Tea_inventory',
                'Tea_inventory',
                null,
                null,
                'config/tables/Tea_inventory/html/Tea_inventory_list.html');
        }
    );

    var viewTeaTypesButton = $('#view-types');
    viewTeaTypesButton.on(
        'click',
        function() {
            odkTables.openTableToListView(
				'teatime.js - openTableToListView -- Tea_types',
                'Tea_types',
                null,
                null,
                'config/tables/Tea_types/html/Tea_types_list.html');
        }
    );

	// we are initialized -- 
	// process any queued results.
	doActionCallback();
}

// register the callback handler -- this might stomp on other handlers.
// since we don't do anything with the outcome, don't register if someone 
// else has.
if ( !odkCommon.hasListener() ) {
   odkCommon.registerListener(doActionCallback);
}
