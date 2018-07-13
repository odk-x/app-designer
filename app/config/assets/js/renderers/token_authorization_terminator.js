var locale = odkCommon.getPreferredLocale();
var currentAuthorization;

function display() {

    new Promise( function(resolve, reject) {
        odkData.query(util.authorizationTable, 'status = ? AND type = ?', ['ACTIVE', util.workflow.none],
            null, null, null, null, null, null, true, resolve, reject);
    }).then( function(result) {
        currentAuthorization = result;

        // set to current authorization name
        $('#title').text(currentAuthorization.getData(0, "name"));

        $('#trigger').text("Terminate Authorization");

        $('#trigger').click(triggerAuthorizationTermination);
    });

}

function triggerAuthorizationTermination() {

        var dbActions = [];

        for (var i = 0; i < currentAuthorization.getCount(); i++) {
            dbActions.push(new Promise(function(resolve, reject) {
                odkData.updateRow(util.authorizationTable, {'status' : 'INACTIVE'}, currentAuthorization.getRowId(i), resolve, reject);
            }));
        }
        Promise.all(dbActions).then( function(result) {
            $('#trigger').prop('disabled', true);
            $('#confirmation').text('Authorization Successfully Terminated');
        }, function(error) {
            $('#confirmation').text('Authorization Termination Failed');
        });
}
