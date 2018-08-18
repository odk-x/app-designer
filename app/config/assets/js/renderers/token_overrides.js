var locale = odkCommon.getPreferredLocale();

function display() {

    return dataUtil.getCurrentTokenAuthorizations().then(function (result) {
        var numAuthorizations = result.getCount();

        if (numAuthorizations > 1) {
            dataUtil.reconcileTokenAuthorizations();
        }

        $('#title').text(odkCommon.localizeText(locale, 'administrator_options'));

        var terminate = document.createElement("button");
        terminate.setAttribute("id", "terminate");
        terminate.innerHTML = "Terminate Current Authorization";
        terminate.onclick = function() {
            odkTables.launchHTML(null,
                'config/assets/html/token_authorization_terminator.html');
        };
        if (numAuthorizations === 0) {
            terminate.disabled = true;
        }

        document.getElementById("wrapper").appendChild(terminate);

        var create = document.createElement("button");
        create.setAttribute("id", "create");
        create.innerHTML = odkCommon.localizeText(locale, 'start_new_authorization');
        if (numAuthorizations > 0) {
            create.disabled = true;
        }
        create.onclick = function() {
            odkTables.launchHTML(null,
                'config/assets/html/token_authorization_creator.html');
        };
        document.getElementById("wrapper").appendChild(create);
    });
}
