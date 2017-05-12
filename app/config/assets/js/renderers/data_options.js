/**
 * Render the data options page
 */
'use strict';

var locale = odkCommon.getPreferredLocale();

// Displays homescreen
function display() {
    var type = util.getQueryParameter('type');
    var title = $('#title');
    var list = document.createElement('button');
    list.setAttribute('id', 'lists');
    if (type == 'registration') {
        title.text(odkCommon.localizeText(locale, "beneficiary_data_title"));
        list.innerHTML = odkCommon.localizeText(locale, "beneficiary_lists");
        list.onclick = function() {
            odkTables.launchHTML(null,
                                 'config/assets/beneficiary_lists.html');
        }
    } else {
        title.text(odkCommon.localizeText(locale, "delivery_data_title"));
        list.innerHTML = odkCommon.localizeText(locale, "view_all_deliveries");
        list.onclick = function() {
            odkTables.launchHTML(null,
                                 'config/tables/deliveries/html/deliveries_list.html');
        }
    }
    document.getElementById('wrapper').appendChild(list);

    var search = document.createElement('button');
    search.setAttribute('id', 'searcher');
    search.innerHTML = odkCommon.localizeText(locale, "advanced_search");
    search.onclick = function() {
        odkTables.launchHTML(null,
                             'config/assets/search.html?type=' + type);
    }
    document.getElementById('wrapper').appendChild(search);
}
