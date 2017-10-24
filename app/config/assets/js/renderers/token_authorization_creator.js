var locale = odkCommon.getPreferredLocale();

function display() {

    $('#title').text(odkCommon.localizeText(locale, 'choose_authorization_name'));

    $('#trigger').text(odkCommon.localizeText(locale, 'trigger_reset'));

    //$('#code').attr('placeholder', odkCommon.localizeText(locale, ''))

    $('#trigger').click(triggerAuthorizationCreation);
}

function triggerAuthorizationCreation() {
    new Promise( function(resolve, reject) {
        odkData.query(util.authorizationTable, 'status = ? AND type = ?', ['ACTIVE', 'TOKEN'],
            null, null, null, null, null, null, true, resolve, reject);
    }).then( function(result) {
        var dbActions = [];

        for (let i = 0; i < result.getCount(); i++) {
            dbActions.push(new Promise(function(resolve, reject) {
                odkData.updateRow(util.authorizationTable, {'status' : 'INACTIVE'}, result.getRowId(i), resolve, reject);
            }));
        }

        dbActions.push(new Promise(function(resolve, reject) {
            let jsonMap = {};
            let authorizationName = $('#code').val();
            util.setJSONMap(jsonMap, 'name', authorizationName)
            util.setJSONMap(jsonMap, 'status', 'ACTIVE');
            util.setJSONMap(jsonMap, 'type', 'TOKEN');
            util.setJSONMap(jsonMap, 'date_created', util.getCurrentOdkTimestamp());
            odkData.addRow(util.authorizationTable, jsonMap , util.genUUID(),
                resolve, reject);
        }));
        return Promise.all(dbActions);
    }).then( function(result) {
        $('#trigger').prop('disabled', true);
        $('#confirmation').text(odkCommon.localizeText(locale, 'administrator_reset_succeeded'));
    }, function(error) {
        $('#confirmation').text(odkCommon.localizeText(locale, 'administrator_reset_failed'));
    });
}
