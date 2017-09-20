'use strict';


function display() {
    $('#barcode').on('click', function() {
        odkTables.launchHTML(null, 'config/assets/token_mode/delivery_start.html')
    });

    $('#manual').on('click', function() {
        odkTables.launchHTML(null, 'config/assets/token_mode/manual_start.html');
    });
}