/**
 * Render the data options page
 */
'use strict';

var locale = odkCommon.getPreferredLocale();

// Displays homescreen
function display() {
    var type = util.getQueryParameter('type');
    var title = $('#title');
    if (type == 'registration') {
        var activeHouseholds = document.createElement('button');

        title.text(odkCommon.localizeText(locale, "household_data"));
        activeHouseholds.innerHTML = odkCommon.localizeText(locale, "active_households");
        activeHouseholds.onclick = function() {
            odkTables.openTableToListView(
                                      null, 'registration', '(is_active = ? or is_active = ?)', ['TRUE', 'true']
                                      , 'config/tables/registration/html/registration_list_hh.html?type=standard');
        }

        var disabledHouseholds = document.createElement('button');
        disabledHouseholds.innerHTML = odkCommon.localizeText(locale, "disabled_households");
        disabledHouseholds.onclick = function() {
            odkTables.openTableToListView(
                                      null, 'registration', '(is_active = ? or is_active)', ['FALSE', 'false']
                                      , 'config/tables/registration/html/registration_list_hh.html?type=standard');
        }

        var householdSearch = document.createElement('button');
        householdSearch.innerHTML = odkCommon.localizeText(locale, "search_members");
        householdSearch.onclick = function() {
            odkTables.launchHTML(null,
                                 'config/assets/search.html?type=registrationMember');
        }

        var individualSearch = document.createElement('button');
        individualSearch.innerHTML = odkCommon.localizeText(locale, "search_households");
        individualSearch.onclick = function() {
            odkTables.launchHTML(null,
                                 'config/assets/search.html?type=registration');
        }

        // append buttons
        document.getElementById('wrapper').appendChild(activeHouseholds);
        document.getElementById('wrapper').appendChild(disabledHouseholds);
        document.getElementById('wrapper').appendChild(householdSearch);
        document.getElementById('wrapper').appendChild(individualSearch);

    } else {
        var deliveries = document.createElement('button');

        title.text(odkCommon.localizeText(locale, "delivery_data_title"));
        deliveries.innerHTML = odkCommon.localizeText(locale, "view_all_deliveries");
        deliveries.onclick = function() {
            odkTables.openTableToListView(null, 'deliveries', null, null,
                                 'config/tables/deliveries/html/deliveries_list.html');
        }


        var deliverySearch = document.createElement('button');
        deliverySearch.innerHTML = odkCommon.localizeText(locale, "advanced_search");
        deliverySearch.onclick = function() {
            odkTables.launchHTML(null,
                                 'config/assets/search.html?type=deliveries');
        }

        // append buttons
        document.getElementById('wrapper').appendChild(deliveries);
        document.getElementById('wrapper').appendChild(deliverySearch);
    }
}
