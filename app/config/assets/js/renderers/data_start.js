/**
 * Render the data start page
 */
'use strict';

var locale = odkCommon.getPreferredLocale();

function display() {
    $('#title').text(odkCommon.localizeText(locale, "data_categories"));
    var benData = document.createElement("button");
    benData.setAttribute("id", "beneficiary");
    benData.innerHTML = odkCommon.localizeText(locale, "view_registration_data");
    benData.onclick = function() {
        odkTables.launchHTML(null,
                             'config/assets/data_options.html?type=registration');
    }
    document.getElementById("wrapper").appendChild(benData);

    var delData = document.createElement("button");
    delData.setAttribute("id", "delivery");
    delData.innerHTML = odkCommon.localizeText(locale, "view_delivery_data");
    delData.onclick = function() {
        odkTables.launchHTML(null,
                             'config/assets/data_options.html?type=deliveries');
    }
    document.getElementById("wrapper").appendChild(delData);
}
