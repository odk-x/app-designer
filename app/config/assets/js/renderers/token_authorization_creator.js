var locale = odkCommon.getPreferredLocale();

function display() {

    $('#title').text(odkCommon.localizeText(locale, 'choose_authorization_name'));

    $('#trigger').text(odkCommon.localizeText(locale, 'create_authorization'));

    //$('#code').attr('placeholder', odkCommon.localizeText(locale, ''))

    $('#trigger').click(triggerAuthorizationCreation);
}

function triggerAuthorizationCreation() {
    new Promise( function(resolve, reject) {
        odkData.query(util.authorizationTable, 'status = ? AND type = ?', ['ACTIVE', util.workflow.none],
            null, null, null, null, null, null, true, resolve, reject);
    }).then( function(result) {
        var dbActions = [];

        for (var i = 0; i < result.getCount(); i++) {
            dbActions.push(new Promise(function(resolve, reject) {
                odkData.updateRow(util.authorizationTable, {'status' : 'INACTIVE'}, result.getRowId(i), resolve, reject);
            }));
        }

        dbActions.push(new Promise(function(resolve, reject) {
            var jsonMap = {};
            var authorizationName = $('#code').val();
            util.setJSONMap(jsonMap, 'name', authorizationName)
            util.setJSONMap(jsonMap, 'status', 'ACTIVE');
            util.setJSONMap(jsonMap, 'type', util.workflow.none);
            util.setJSONMap(jsonMap, 'date_created', util.getCurrentOdkTimestamp());
            util.setJSONMap(jsonMap, 'extra_field_entitlements', 'NONE');
            odkData.addRow(util.authorizationTable, jsonMap , util.genUUID(),
                resolve, reject);
        }));
        return Promise.all(dbActions);
    }).then( function(result) {
        $('#trigger').prop('disabled', true);
        $('#confirmation').text(odkCommon.localizeText(locale, 'create_authorization_success'));
    }, function(error) {
        $('#confirmation').text(odkCommon.localizeText(locale, 'create_authorization_failed'));
    });
}
