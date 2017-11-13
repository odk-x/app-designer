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

        title.text(odkCommon.localizeText(locale, "registration_data"));


        var enabledBeneficiaryEntities = document.createElement('button');
        enabledBeneficiaryEntities.onclick = function() {
            odkTables.openTableToListView(
                                      null, util.beneficiaryEntityTable, '(status = ? or status = ?)', ['ENABLED', 'enabled']
                                      , 'config/tables/' + util.beneficiaryEntityTable + '/html/' + util.beneficiaryEntityTable + '_list.html?type=delivery');
        }

        var disabledBeneficiaryEntities = document.createElement('button');
        disabledBeneficiaryEntities.onclick = function() {
            odkTables.openTableToListView(
                                      null, util.beneficiaryEntityTable, '(status = ? or status = ?)', ['DISABLED', 'disabled']
                                      , 'config/tables/' + util.beneficiaryEntityTable + '/html/' + util.beneficiaryEntityTable + '_list.html?type=delivery');
        }

        var beneficiaryEntitySearch = document.createElement('button');
        beneficiaryEntitySearch.onclick = function() {
            odkTables.launchHTML(null,
                                 'config/assets/html/search.html?type=' + util.getBeneficiaryEntityCustomFormId());
        }

        if (util.getRegistrationMode() == 'HOUSEHOLD') {
            enabledBeneficiaryEntities.innerHTML = odkCommon.localizeText(locale, "enabled_households");
            disabledBeneficiaryEntities.innerHTML = odkCommon.localizeText(locale, "disabled_households");
            beneficiaryEntitySearch.innerHTML = odkCommon.localizeText(locale, "search_households");
        } else {
            enabledBeneficiaryEntities.innerHTML = odkCommon.localizeText(locale, "enabled_beneficiaries");
            disabledBeneficiaryEntities.innerHTML = odkCommon.localizeText(locale, "disabled_beneficiaries");
            beneficiaryEntitySearch.innerHTML = odkCommon.localizeText(locale, "search_beneficiaries");
        }

        // append buttons
        document.getElementById('wrapper').appendChild(enabledBeneficiaryEntities);
        document.getElementById('wrapper').appendChild(disabledBeneficiaryEntities);
        document.getElementById('wrapper').appendChild(beneficiaryEntitySearch);

        if (util.getRegistrationMode() == 'HOUSEHOLD') {
            var individualSearch = document.createElement('button');
            individualSearch.innerHTML = odkCommon.localizeText(locale, "search_individuals");
            individualSearch.onclick = function() {
                odkTables.launchHTML(null,
                    'config/assets/html/search.html?type=' + util.getMemberCustomFormId());
            }
            //append individual search button
            document.getElementById('wrapper').appendChild(individualSearch);
        }

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
                                 'config/assets/html/search.html?type=' + util.deliveryTable);
        }

        // append buttons
        document.getElementById('wrapper').appendChild(deliveries);
        document.getElementById('wrapper').appendChild(deliverySearch);
    }
}
