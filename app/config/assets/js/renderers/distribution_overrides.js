'use strict';

let locale = odkCommon.getPreferredLocale();

function display() {
    $('#title').text('Distribution Options');
    let newEntitlement = document.createElement("button");
    newEntitlement.setAttribute("id", "authorization");
    newEntitlement.innerHTML = odkCommon.localizeText(locale, "create_new_entitlement");;
    newEntitlement.onclick = function() {
        odkTables.launchHTML(null,
            'config/tables/authorizations/html/authorizations_list.html?type=new_entitlement');
    };
    document.getElementById("wrapper").appendChild(newEntitlement);

    let modifyEntitlement = document.createElement("button");
    modifyEntitlement.setAttribute("id", "authorization");
    modifyEntitlement.innerHTML = odkCommon.localizeText(locale, "change_entitlement_status");;
    modifyEntitlement.onclick = function() {
        odkTables.launchHTML(null,
            'config/assets/html/choose_method.html?type=override_entitlement_status');
    };
    document.getElementById("wrapper").appendChild(modifyEntitlement);


    let distributionReport = document.createElement("button");
    distributionReport.setAttribute("id", "distribution_report");
    distributionReport.innerHTML = "Fill Distribution Report";
    distributionReport.onclick = function() {
        odkTables.launchHTML(null,
                        'config/tables/authorizations/html/authorizations_list.html?type=distribution_report')
    };
    document.getElementById("wrapper").appendChild(distributionReport);
}
