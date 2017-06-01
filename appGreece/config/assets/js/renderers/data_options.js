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

        title.text(odkCommon.localizeText(locale, "beneficiary_data_title"));
        activeHouseholds.innerHTML = odkCommon.localizeText(locale, "active_beneficiaries_title");
        activeHouseholds.onclick = function() {
            odkTables.openTableToListView(
                                      null, 'registration', '(is_active = ? or is_active = ?)', ['TRUE', 'true']
                                      , 'config/tables/registration/html/registration_list.html?type=standard');
        }

        var disabledHouseholds = document.createElement('button');
        disabledHouseholds.innerHTML = odkCommon.localizeText(locale, "disabled_beneficiaries_title");
        disabledHouseholds.onclick = function() {
            odkTables.openTableToListView(
                                      null, 'registration', '(is_active = ? or is_active)', ['FALSE', 'false']
                                      , 'config/tables/registration/html/registration_list.html?type=standard');
        }

        var householdSearch = document.createElement('button');
        householdSearch.innerHTML = odkCommon.localizeText(locale, "advanced_search");
        householdSearch.onclick = function() {
            odkTables.launchHTML(null,
                                 'config/assets/search.html?type=registrationMember');
        }

        var individualSearch = document.createElement('button');
        individualSearch.innerHTML = odkCommon.localizeText(locale, "advanced_search");
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
