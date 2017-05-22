/**
 * Render the data options page
 */
'use strict';

var locale = odkCommon.getPreferredLocale();

// Displays homescreen
function display() {
    var type = util.getQueryParameter('type');
    var title = $('#title');
    var top = document.createElement('button');
    var middle = null;
    top.setAttribute('id', 'top');
    if (type == 'registration') {
        title.text(odkCommon.localizeText(locale, "beneficiary_data_title"));
        top.innerHTML = odkCommon.localizeText(locale, "active_beneficiaries_title");
        top.onclick = function() {
            odkTables.openTableToListView(
                                      null, 'registration', 'is_active = ?', ['TRUE']
                                      , 'config/tables/registration/html/registration_list.html?type=delivery');
        }
        var middle = document.createElement('button');
        middle.setAttribute('id', 'middle');
        middle.innerHTML = odkCommon.localizeText(locale, "disabled_beneficiaries_title");
        middle.onclick = function() {
            odkTables.openTableToListView(
                                      null, 'registration', 'is_active = ?', ['FALSE']
                                      , 'config/tables/registration/html/registration_list.html?type=delivery');
        }
    } else {
        title.text(odkCommon.localizeText(locale, "delivery_data_title"));
        top.innerHTML = odkCommon.localizeText(locale, "view_all_deliveries");
        top.onclick = function() {
            odkTables.openTableToListView(null, 'deliveries', null, null,
                                 'config/tables/deliveries/html/deliveries_list.html');
        }
    }
    document.getElementById('wrapper').appendChild(top);
    if (middle !== null) {
        document.getElementById('wrapper').appendChild(middle);
    }

    var search = document.createElement('button');
    search.setAttribute('id', 'searcher');
    search.innerHTML = odkCommon.localizeText(locale, "advanced_search");
    search.onclick = function() {
        odkTables.launchHTML(null,
                             'config/assets/search.html?type=' + type);
    }
    document.getElementById('wrapper').appendChild(search);
}
