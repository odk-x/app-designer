'use strict';

var LOG_TAG = 'entitlements_list: ';

var idxStart = -1;
var actionTypeKey = "actionTypeKey";
var actionAddCustomDelivery = 0;
var locale = odkCommon.getPreferredLocale();
var action = util.getQueryParameter('action');
var beneficiaryEntityId = util.getQueryParameter('beneficiary_entity_id');
var deliveriesForBeneficiary = null;
var mapRowIdToAuthInd = {};

var firstLoad = function() {
    odkCommon.registerListener(function() {
        actionCBFn();
    });
    actionCBFn();
    resumeFn(0);
};

var resumeFn = function(fIdxStart) {
    var entitlementsResultSet = null;
    dataUtil.getViewData().then( function(result) {
        entitlementsResultSet = result;

        idxStart = fIdxStart;
        console.log('I', LOG_TAG + 'resumeFn called. idxStart: ' + idxStart);
        // The first time through we're going to make a map of typeId to
        // typeName so that we can display the name of each shop's specialty.
        if (idxStart === 0) {
            // We're also going to add a click listener on the wrapper ul that will
            // handle all of the clicks on its children.
            if (action === 'detail' || action === 'deliver') {
                $('#list').click(function(e) {
                    // We set the rowId while as the li id. However, we may have
                    // clicked on the li or anything in the li. Thus we need to get
                    // the original li, which we'll do with jQuery's closest()
                    // method. First, however, we need to wrap up the target
                    // element in a jquery object.
                    // wrap up the object so we can call closest()
                    var jqueryObject = $(e.target);
                    // we want the closest thing with class item_space, which we
                    // have set up to have the row id
                    var containingDiv = jqueryObject.closest('.item_space');
                    var rowId = containingDiv.attr('rowId');
                    console.log('I', LOG_TAG + 'clicked with rowId: ' + rowId);
                    // make sure we retrieved the rowId
                    if (rowId !== null && rowId !== undefined) {
                        if (action === 'detail') {
                            launchDeliveryDetailView(rowId, beneficiaryEntityId);
                        } else if (action === 'deliver') {
                            dataUtil.triggerAuthorizationDelivery(rowId, beneficiaryEntityId, actionAddCustomDelivery);
                        }
                    }
                });
            } else if (action === 'change_status') {
                /*
                $('#list').find('#left').click(function() {
                    changeStatusPromise('ENABLED', entitlementsResultSet.getRowId(i));
                });

                toggle.find('#right_txt').text('Disabled');

                toggle.find('#right').click(function f(index) {
                    return changeStatusPromise('DISABLED', entitlementsResultSet.getRowId(index));
                })(i);

                toggle.show();

                item.append(toggle);
                */
            }

        }

        displayGroup(idxStart, result);
    }).catch( function(reason) {
        console.log('E', LOG_TAG +  LOG_TAG + "Failed to get view data: " + reason);
    });
};


var launchDeliveryDetailView = function(authorization_id, beneficiaryEntityId) {
    console.log('I', LOG_TAG + "Launching delivery detail view for authorization: " + authorization_id);

    new Promise(function(resolve, reject) {
        odkData.query(
          util.deliveryTable,
          'authorization_id = ? AND beneficiary_entity_id = ?',
          [authorization_id, beneficiaryEntityId],
          null,
          null,
          null,
          null,
          null,
          null,
          true,
          resolve,
          reject
        );
    }).then(function(result) {
        if (result.getCount() > 0) {
            odkTables.openDetailView(null, 'deliveries', result.getData(0, "_id"),
                'config/tables/deliveries/html/deliveries_detail.html')
        }
    }).catch(function(reason) {
        console.log('E', LOG_TAG + "Failed to retrieve delivery: " + reason);
    });
};


/************************** Action callback workflow *********************************/

var actionCBFn = function() {
    var action = odkCommon.viewFirstQueuedAction();
    console.log('E', LOG_TAG + 'callback entered with action: ' + action);

    if (action === null || action === undefined) {
        // The queue is empty
        return;
    }

    var dispatchStr = JSON.parse(action.dispatchStruct);
    if (dispatchStr === null || dispatchStr === undefined) {
        console.log('E', LOG_TAG + 'Error: missing dispatch struct');
        return;
    }

    var actionType = dispatchStr[actionTypeKey];
    switch (actionType) {
        case actionAddCustomDelivery:
            finishCustomDelivery(action, dispatchStr);
            break;
        default:
            console.log('E', LOG_TAG + "Error: unrecognized action type in callback");
    }


};

var finishCustomDelivery = function(action, dispatchStr) {
    if (dataUtil.validateCustomTableEntry(action, dispatchStr, "delivery", util.deliveryTable)) {
        // TODO: check to make sure that there are any entitlements left, otherwise return to previous screen
    }
};

/************************** UI Rending functions *********************************/

var displayGroup = function(idxStart, authorizationsResultSet) {
    console.log('I', LOG_TAG + 'displayGroup called. idxStart: ' + idxStart);

    /* If the list comes back empty, inform the user */
    if (authorizationsResultSet.getCount() === 0) {
        var errorText = $('#error');
        errorText.show();
        errorText.text('No item found');
    }

    /* Number of rows displayed per 'chunk' - can modify this value */
    var chunk = 50;
    var i = idxStart;
    for (i; i < idxStart + chunk; i++) {
        if (i >= authorizationsResultSet.getCount()) {
            break;
        }

        mapRowIdToAuthInd[authorizationsResultSet.getRowId(i)] = i;
        var item = $('<li>');
        item.attr('rowId', authorizationsResultSet.getRowId(i));
        item.attr('class', 'item_space');
        item.attr('id', authorizationsResultSet.getRowId(i));
        var auth_name = authorizationsResultSet.getData(i, 'item_pack_name');
        item.text(auth_name);

        var pam = null;
        var delivered_date = null;

        if (action === 'change_status') {
            var toggle = $(".switch-starter").clone();
            toggle.attr('class', 'switch-field');
            toggle.find('.left').attr('id', 'left' + '-' + i).attr('name', i);
            toggle.find('.left_txt').attr('for', 'left' + '-' + i);
            toggle.find('.left_txt').text('Enabled');
            toggle.find('#left' + '-' + i).click( {"index": i}, function(event) {
                return changeStatusPromise(authorizationsResultSet.getRowId(event.data.index), 'ENABLED');
            });

            toggle.find('.right').attr('id', 'right' + '-' + i).attr('name', i);
            toggle.find('.right_txt').attr('for', 'right' + '-' + i);
            toggle.find('.right_txt').text('Disabled');

            toggle.find('#right' + '-' + i).click( {"index": i}, function(event) {
                return changeStatusPromise(authorizationsResultSet.getRowId(event.data.index), 'DISABLED');
            });

            if (authorizationsResultSet.getData(i, 'status') === 'ENABLED') {
                toggle.find('.left').attr('checked', true);
            } else {
                toggle.find('.right').attr('checked', true);
            }

            toggle.show();
            item.append(toggle);
        } else if (action === 'deliver') {
            // TODO: Improve this code!!
            // Stopgap for Colombia pilot!
            item.addClass('neverBeenDeliveriedBackground');
            new Promise(function (resolve, reject) {
                odkData.query(util.deliveryTable, 'beneficiary_entity_id = ? AND authorization_id = ?',
                    [beneficiaryEntityId, authorizationsResultSet.getRowId(i)], null, null,
                    null, null, null, null, true, resolve, reject);
            }).then( function(result) {
                console.log(result);
                if (result.getCount() > 0) {
                    var elementId = '#' + result.get('authorization_id');
                    $(elementId).removeClass('neverBeenDeliveriedBackground');
                    $(elementId).addClass('deliveredBackground');
                }
            }).catch( function(reason) {
                console.log(reason);
            });
        } else if (action === 'detail') {
            // TODO: Improve this code!!
            // Stopgap for Colombia pilot!

            new Promise(function (resolve, reject) {
                odkData.query(util.deliveryTable, 'beneficiary_entity_id = ? AND authorization_id = ?',
                    [beneficiaryEntityId, authorizationsResultSet.getRowId(i)], null, null,
                    null, null, null, null, true, resolve, reject);
            }).then( function(result) {
                console.log(result);
                if (result && result.getCount() > 0) {
                    var idx = mapRowIdToAuthInd[result.get('authorization_id')]
                    var customDeliveryForm = authorizationsResultSet.getData(idx, 'custom_delivery_form_id');
                    if (customDeliveryForm !== null && customDeliveryForm !== undefined) {
                        var sqlCmd =
                            'SELECT \n' +
                                customDeliveryForm + '._id, \n' +
                                customDeliveryForm + '.pam, \n' +
                                customDeliveryForm + '.activity_date, \n' +
                                util.deliveryTable + '.authorization_id \n' +
                            'FROM ' + customDeliveryForm + ' \n' +
                            '  INNER JOIN ' + util.deliveryTable + ' ON '+ util.deliveryTable +
                                '.custom_delivery_row_id = ' + customDeliveryForm + '._id\n' +
                            'WHERE ' + util.deliveryTable + '.custom_delivery_row_id = ?';

                        return new Promise(function (resolve, reject) {
                            odkData.arbitraryQuery(util.deliveryTable, sqlCmd, [result.get('custom_delivery_row_id')], null, null, resolve, reject);
                        })

                    }
                } else {
                    return Promise.resolve(null);
                }

            }).then(function(result) {
                if (result && result.getCount() === 1) {
                    var elementId = '#' + result.get('authorization_id');

                    var field1 = $('<li>');
                    field1.attr('class', 'detail');
                    field1.text(result.get('activity_date'));
                    $(elementId).append(field1);

                    var field2 = $('<li>');
                    field2.attr('class', 'detail');
                    field2.text(result.get('pam'));
                    $(elementId).append(field2);
                }

            }).catch( function(reason) {
                console.log(reason);
            });
        }


        $('#list').append(item);

        // don't append the last one to avoid the fencepost problem
        var borderDiv = $('<div>');
        borderDiv.addClass('divider');
        $('#list').append(borderDiv);

    }
    if (i < authorizationsResultSet.getCount()) {
        setTimeout(resumeFn, 0, i);
    }
};

function changeStatusPromise(id, status) {
    return new Promise( function(resolve, reject) {
        odkData.updateRow(util.authorizationTable, {'status' : status}, id,
            resolve, reject);
    }).then( function(result) {
        console.log('Update success: ' + result);
    }).catch( function(reason) {
        console.log('Update failure: ' + reason);
    });
}
