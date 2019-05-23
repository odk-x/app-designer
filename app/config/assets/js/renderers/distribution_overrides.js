'use strict';

var locale = odkCommon.getPreferredLocale();

function display() {
    $('#title').text(odkCommon.localizeText(locale, 'distribution_options'));
    var newEntitlement = document.createElement("button");
    newEntitlement.setAttribute("id", "authorization");
    newEntitlement.innerHTML = odkCommon.localizeText(locale, "create_new_entitlement");
    newEntitlement.onclick = function() {
        odkTables.launchHTML(null,
            'config/tables/' + util.authorizationTable + '/html/' + util.authorizationTable + '_list.html?type=new_ent');
    };
    document.getElementById("wrapper").appendChild(newEntitlement);

    var modifyEntitlement = document.createElement("button");
    modifyEntitlement.setAttribute("id", "authorization");
    modifyEntitlement.innerHTML = odkCommon.localizeText(locale, "change_entitlement_status");
    modifyEntitlement.onclick = function() {
        odkTables.launchHTML(null,
            'config/assets/html/choose_method.html?type=override_ent_status&title=' + odkCommon.localizeText(locale, "enter_beneficiary_entity_id"));
    };
    document.getElementById("wrapper").appendChild(modifyEntitlement);


    var distributionReport = document.createElement("button");
    distributionReport.setAttribute("id", "distribution_report");
    distributionReport.innerHTML = odkCommon.localizeText(locale, 'fill_field_report');
    distributionReport.onclick = function() {
        odkTables.launchHTML(null,
                        'config/tables/' + util.distributionTable + '/html/' + util.distributionTable + '_list_field_report.html');
    };
    document.getElementById("wrapper").appendChild(distributionReport);
}
