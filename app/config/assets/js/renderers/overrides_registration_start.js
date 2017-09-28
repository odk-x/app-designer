/**
 * Render the overrides registration page
 */
'use strict';

var locale = odkCommon.getPreferredLocale();

// Displays homescreen
function display() {
    var chooseText = odkCommon.localizeText(locale, "choose_method");
    var enable = document.createElement("button");
    enable.setAttribute("id", "enable");
    var enableText = odkCommon.localizeText(locale, "enable_beneficiary");
    enable.innerHTML = enableText;
    enable.onclick = function() {
        odkTables.launchHTML(null,
                             'config/assets/html/choose_method.html?title='
                             + encodeURIComponent(chooseText)
                             + '&secondary_manual_title='
                             + encodeURIComponent(enableText)
                             + '&type=enable');
    }
    document.getElementById("wrapper").appendChild(enable);

    var disable = document.createElement("button");
    disable.setAttribute("id", "disable");
    var disableText = odkCommon.localizeText(locale, "disable_beneficiary");
    disable.innerHTML = disableText;
    disable.onclick = function() {
        odkTables.launchHTML(null,
                             'config/assets/html/choose_method.html?title='
                             + encodeURIComponent(chooseText)
                             + '&secondary_manual_title='
                             + encodeURIComponent(disableText)
                             + '&type=disable');
    }
    document.getElementById("wrapper").appendChild(disable);
}
