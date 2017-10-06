/**
 * Render the overrides start page
 */
'use strict';

var locale = odkCommon.getPreferredLocale();

// Displays homescreen
function display() {
    $('#title').text(odkCommon.localizeText(locale, "administrator_options"));

    var override_registration = document.createElement("button");
    override_registration.setAttribute("id", "registration");
    override_registration.innerHTML = odkCommon.localizeText(locale, "registration");
    override_registration.onclick = function() {
        odkTables.launchHTML(null,
                             'config/assets/html/choose_method.html?title=placeholder&type=override_beneficiary_entity_status');
    };
    document.getElementById("wrapper").appendChild(override_registration);

    var override_distribution = document.createElement("button");
    override_distribution.setAttribute("id", "distribution");
    override_distribution.innerHTML = odkCommon.localizeText(locale, "distribution");
    override_distribution.onclick = function() {
        odkTables.launchHTML(null,
            'config/assets/html/distribution_overrides.html');
    };
    document.getElementById("wrapper").appendChild(override_distribution);

    /*var override_entitlement = document.createElement("button");
    override_entitlement.setAttribute("id", "authorization");
    override_entitlement.innerHTML = odkCommon.localizeText(locale, "override_entitlement");;
    override_entitlement.onclick = function() {
        odkTables.launchHTML(null,
                             'config/tables/authorizations/html/authorizations_list.html?type=override');
    }
    document.getElementById("wrapper").appendChild(override_entitlement);

    var distribution_report = document.createElement("button");
    distribution_report.setAttribute("id", "distribution_report");
    distribution_report.innerHTML = "Fill Distribution Report";
    distribution_report.onclick = function() {
        odkTables.launchHTML(null,
                        'config/tables/authorizations/html/authorizations_list.html?type=distribution_report')
    }
    document.getElementById("wrapper").appendChild(distribution_report);*/
}
