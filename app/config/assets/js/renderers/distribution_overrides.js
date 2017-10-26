'use strict';

let locale = odkCommon.getPreferredLocale();

function display() {
    $('#title').text('Distribution Options');
    let newEntitlement = document.createElement("button");
    newEntitlement.setAttribute("id", "authorization");
    newEntitlement.innerHTML = odkCommon.localizeText(locale, "create_new_entitlement");;
    newEntitlement.onclick = function() {
        odkTables.launchHTML(null,
            'config/tables/' + util.authorizationTable + '/html/' + util.authorizationTable + '_list.html?type=new_ent');
    };
    document.getElementById("wrapper").appendChild(newEntitlement);

    let modifyEntitlement = document.createElement("button");
    modifyEntitlement.setAttribute("id", "authorization");
    modifyEntitlement.innerHTML = odkCommon.localizeText(locale, "change_entitlement_status");;
    modifyEntitlement.onclick = function() {
        odkTables.launchHTML(null,
            'config/assets/html/choose_method.html?type=override_ent_status&title=' + odkCommon.localizeText(locale, "enter_beneficiary_entity_id"));
    };
    document.getElementById("wrapper").appendChild(modifyEntitlement);


    let distributionReport = document.createElement("button");
    distributionReport.setAttribute("id", "distribution_report");
    distributionReport.innerHTML = "Fill Authorization Report";
    distributionReport.onclick = function() {
        odkTables.launchHTML(null,
                        'config/tables/' + util.authorizationTable + '/html/' + util.authorizationTable + '_list.html?type=authorization_report');
    };
    document.getElementById("wrapper").appendChild(distributionReport);
}
