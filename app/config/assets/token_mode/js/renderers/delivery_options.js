'use strict';


function display() {
    $('#barcode').on('click', function() {
        odkTables.launchHTML(null, 'config/assets/token_mode/html/delivery_start.html')
    });

    $('#manual').on('click', function() {
        odkTables.launchHTML(null, 'config/assets/token_mode/html/manual_start.html');
    });
}