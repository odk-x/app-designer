var locale = odkCommon.getPreferredLocale();


function display() {
    let displayPromise = new Promise( function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    }).then( function(result) {

        let authId = result.getRowId(0);

        $('#title').text(result.getData(0, "name"));
        $('#view_deliveries').text(odkCommon.localizeText(locale, "view_deliveries"));
        $('#view_deliveries').click(function() {
           odkTables.openTableToListView(null, util.deliveryTable, 'authorization_id = ?',
               [authId], 'config/tables/' + util.deliveryTable + "/html/" + util.deliveryTable + '_list.html');
        });

        let promises = [];

        let pendingQuery = 'SELECT count(*) as count FROM ' + util.entitlementTable + ' ent LEFT JOIN ' +  util.deliveryTable +
            ' del ON del.entitlement_id = ent._id WHERE del._id IS NULL AND ent.authorization_id = ?';

        let deliveredQuery = 'SELECT count(*) as count FROM ' + util.deliveryTable + ' del WHERE del.authorization_id = ?';

        let syncQuery = 'SELECT count(*) as count FROM ' + util.deliveryTable + ' WHERE _sync_state = ? AND authorization_id = ?';

        promises.push(new Promise(function (resolve, reject) {
            odkData.arbitraryQuery(util.entitlementTable, pendingQuery, [authId], null, null, resolve, reject);
        }));

        promises.push(new Promise(function (resolve, reject) {
            odkData.arbitraryQuery(util.deliveryTable, deliveredQuery, [authId], null, null, resolve, reject);
        }));

        promises.push(new Promise(function (resolve, reject) {
            odkData.arbitraryQuery(util.deliveryTable, syncQuery, ['new_row', authId], null, null, resolve, reject);
        }));

        return Promise.all(promises);
    }).then( function(result) {
        $('#pending').text("Pending: " + result[0].get('count'));
        $('#delivered').text("Delivered: " + result[1].get('count'));
        $('#since_sync').text("Delivered since sync: " + result[2].get('count'));
    });

    return displayPromise;
}

