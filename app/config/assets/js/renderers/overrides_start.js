/**
 * Render the overrides start page
 */
'use strict';

var locale = odkCommon.getPreferredLocale();

// Displays homescreen
function display() {
    $('#title').text(odkCommon.localizeText(locale, "override_options"));
    var override_registration = document.createElement("button");
    override_registration.setAttribute("id", "registration");
    override_registration.innerHTML = odkCommon.localizeText(locale, "override_registration");
    override_registration.onclick = function() {
        odkTables.launchHTML(null,
                             'config/assets/overrides_registration_start.html');
    };
    document.getElementById("wrapper").appendChild(override_registration);

    var override_entitlement = document.createElement("button");
    override_entitlement.setAttribute("id", "authorization");
    override_entitlement.innerHTML = odkCommon.localizeText(locale, "override_entitlement");;
    override_entitlement.onclick = function() {
        odkTables.launchHTML(null,
                             'config/tables/authorizations/html/authorizations_list.html');
    }
    document.getElementById("wrapper").appendChild(override_entitlement);
}
