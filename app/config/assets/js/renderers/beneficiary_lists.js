/**
 * Render the beneficiary lists page
 */

'use strict';

var locale = odkCommon.getPreferredLocale();

function display() {
    var active = document.createElement("button");
    active.setAttribute("id", "active");
    active.innerHTML = odkCommon.localizeText(locale, "active_beneficiaries_title");
    active.onclick = function() {
        odkTables.openTableToListView(
                                      null, 'registration', 'is_active = ?', ['true']
                                      , 'config/tables/registration/html/registration_list.html?type=delivery');

    }
    document.getElementById("wrapper").appendChild(active);

    // Follow up with existing client option that launches
    // 'femaleClients' table list view
    var disabled = document.createElement("button");
    disabled.setAttribute("id", "disabled");
    disabled.innerHTML = odkCommon.localizeText(locale, "disabled_beneficiaries_title");
    disabled.onclick = function() {
        odkTables.openTableToListView(
                                      null, 'registration', 'is_active = ?', ['false']
                                      , 'config/tables/registration/html/registration_list.html?type=delivery');
    }
    document.getElementById("wrapper").appendChild(disabled);
}



