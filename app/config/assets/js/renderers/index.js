/**
 * Render index.html
 */
'use strict';

var titleToken = "main_title";
var registrationToken = "registration_path";
var deliveryToken = "delivery_path";
var dataToken = "data_path";
var overrideToken = "override_path";
var registrationTitleToken = 'registration_title';
var deliveryTitleToken = 'delivery_title';
var locale = odkCommon.getPreferredLocale();

// Displays homescreen
function display() {
    $('#title').text(odkCommon.localizeText(locale, titleToken));

    var newClient = document.createElement("button");
    newClient.innerHTML = odkCommon.localizeText(locale, registrationToken);
    newClient.setAttribute("id", "register");
    newClient.onclick = function() {
        odkTables.launchHTML(null,
                             'config/assets/choose_method.html?title='
                             + encodeURIComponent(odkCommon.localizeText(locale,
                                                                         registrationTitleToken))
                             + '&type=registration');
    }
    document.getElementById("wrapper").appendChild(newClient);

    var followUp = document.createElement("button");
    followUp.innerHTML = odkCommon.localizeText(locale, deliveryToken);
    followUp.setAttribute("id", "deliver");
    followUp.onclick = function() {
        odkTables.launchHTML(null,
                             'config/assets/choose_method.html?title='
                             + encodeURIComponent(odkCommon.localizeText(locale,
                                                                         deliveryTitleToken))
                             +'&type=delivery');
    }
    document.getElementById("wrapper").appendChild(followUp);

    var viewData = document.createElement("button");
    viewData.innerHTML = odkCommon.localizeText(locale, dataToken);
    viewData.setAttribute("id", "data");
    viewData.onclick = function() {
        odkTables.launchHTML(null,
                             'config/assets/data_start.html');
    }
    document.getElementById("wrapper").appendChild(viewData);

    // Create a overrides if user is a tables superuser
    odkData.getRoles(rolesCBSuccess, rolesCBFailure);
}

function rolesCBSuccess(result) {
    var roles = result.getRoles();
    console.log(roles);
    if ($.inArray('ROLE_SUPER_USER_TABLES', roles) > -1) {
        var override = document.createElement("button");
        override.innerHTML = odkCommon.localizeText(locale, overrideToken);
        override.setAttribute("id", "overrides");
        override.onclick = function() {
            odkTables.launchHTML(null,
                                 'config/assets/overrides_start.html');
        }
        document.getElementById("wrapper").appendChild(override);
    }
}

function rolesCBFailure(error) {
    console.log('roles failed with error: ' + error);
}


