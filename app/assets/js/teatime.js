/**
 * Responsible for rendering the home screen.
 */
'use strict';
/* global control */

function display() {

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/teaBackground.jpg)');

    var viewHousesButton = $('<button>');
    viewHousesButton.text('View Tea Houses');
    viewHousesButton.on(
        'click',
        function() {
            control.openTableToListView(
                'Tea_houses',
                null,
                null,
                'tables/Tea_houses/html/Tea_houses_list.html');
        }
    );
    $('#wrapper').append(viewHousesButton);

    var viewTeasButton = $('<button>');
    viewTeasButton.text('View Teas');
    viewTeasButton.on(
        'click',
        function() {
            control.openTableToListView(
                'Tea_inventory',
                null,
                null,
                'tables/Tea_inventory/html/Tea_inventory_list.html');
        }
    );
    $('#wrapper').append(viewTeasButton);

    var viewTeaTypesButton = $('<button>');
    viewTeaTypesButton.text('Tea Types');
    viewTeaTypesButton.on(
        'click',
        function() {
            control.openTableToListView(
                'Tea_types',
                null,
                null,
                'tables/Tea_types/html/Tea_types_list.html');
        }
    );
    $('#wrapper').append(viewTeaTypesButton);

}
