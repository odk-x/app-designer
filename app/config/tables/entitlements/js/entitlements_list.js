'use strict';

let LOG_TAG = 'entitlements_list: ';

let idxStart = -1;
let actionTypeKey = "actionTypeKey";
let deliveryTableKey = "deliveryTableKey";
let actionAddCustomDelivery = 0;
let locale = odkCommon.getPreferredLocale();
let action = util.getQueryParameter('action');


let firstLoad = function() {
    odkCommon.registerListener(function() {
        actionCBFn();
    });
    actionCBFn();
    resumeFn(0);
};

let resumeFn = function(fIdxStart) {
    let entitlementsResultSet = null;
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
                    let jqueryObject = $(e.target);
                    // we want the closest thing with class item_space, which we
                    // have set up to have the row id
                    let containingDiv = jqueryObject.closest('.item_space');
                    let rowId = containingDiv.attr('rowId');
                    console.log('I', LOG_TAG + 'clicked with rowId: ' + rowId);
                    // make sure we retrieved the rowId
                    if (rowId !== null && rowId !== undefined) {
                        if (action === 'detail') {
                            launchDeliveryDetailView(rowId);
                        } else if (action === 'deliver') {
                            dataUtil.triggerEntitlementDelivery(rowId, actionAddCustomDelivery);
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
}


let launchDeliveryDetailView = function(entitlement_id) {
    console.log('I', LOG_TAG + "Launching delivery detail view for entitlement: " + entitlement_id);

    new Promise(function(resolve, reject) {
        odkData.query(util.deliveryTable, 'entitlement_id = ?', [entitlement_id], null,
            null, null, null, null, null, true, resolve, reject);
    }).then(function(result) {
        if (result.getCount() > 0) {
            odkTables.openDetailView(null, 'deliveries', result.getData(0, "_id"),
                'config/tables/deliveries/html/deliveries_detail.html')
        }
    }).catch(function(reason) {
        console.log('E', LOG_TAG + "Failed to retrieve delivery: " + reason);
    });
}


/************************** Action callback workflow *********************************/

let actionCBFn = function() {
    let action = odkCommon.viewFirstQueuedAction();
    console.log('E', LOG_TAG + 'callback entered with action: ' + action);

    if (action === null || action === undefined) {
        // The queue is empty
        return;
    }

    let dispatchStr = JSON.parse(action.dispatchStruct);
    if (dispatchStr === null || dispatchStr === undefined) {
        console.log('E', LOG_TAG + 'Error: missing dispatch strct');
        return;
    }

    let actionType = dispatchStr[actionTypeKey];
    switch (actionType) {
        case actionAddCustomDelivery:
            finishCustomDelivery(action, dispatchStr);
            break;
        default:
            console.log('E', LOG_TAG + "Error: unrecognized action type in callback");
    }


};

let finishCustomDelivery = function(action, dispatchStr) {
    if (dataUtil.validateCustomTableEntry(action, dispatchStr, "delivery", util.deliveryTable)) {
        // TODO: check to make sure that there are any entitlements left, otherwise return to previous screen
    }
};

/************************** UI Rending functions *********************************/

let displayGroup = function(idxStart, entitlementsResultSet) {
    console.log('I', LOG_TAG + 'displayGroup called. idxStart: ' + idxStart);

    /* If the list comes back empty, inform the user */
    if (entitlementsResultSet.getCount() === 0) {
        let errorText = $('#error');
        errorText.show();
        errorText.text('No entitlements found');
    }

    /* Number of rows displayed per 'chunk' - can modify this value */
    let chunk = 50;
    let i = idxStart;
    for (i; i < idxStart + chunk; i++) {
        if (i >= entitlementsResultSet.getCount()) {
            break;
        }

        let item = $('<li>');
        item.attr('rowId', entitlementsResultSet.getRowId(i));
        item.attr('class', 'item_space');
        item.attr('id', entitlementsResultSet.getRowId(i));
        let auth_name = entitlementsResultSet.getData(i, 'item_pack_name');
        item.text(auth_name);

        let item2 = $('<li>');
        item2.attr('class', 'detail');
        let ipn = entitlementsResultSet.getData(i, 'authorization_name');
        item2.text(ipn);
        item.append(item2);

        if (action === 'change_status') {
            let toggle = $(".switch-starter").clone();
            toggle.attr('class', 'switch-field');
            toggle.find('.left').attr('id', 'left' + '-' + i).attr('name', i);
            toggle.find('.left_txt').attr('for', 'left' + '-' + i);
            toggle.find('.left_txt').text('Enabled');
        //TODO: fix
            toggle.find('#left' + '-' + i).click( {"index": i}, function(event) {
                return changeStatusPromise(entitlementsResultSet.getRowId(event.data.index), 'ENABLED');
            });

            toggle.find('.right').attr('id', 'right' + '-' + i).attr('name', i);
            toggle.find('.left_txt').attr('for', 'right' + '-' + i);
            toggle.find('.right_txt').text('Disabled');

            toggle.find('#right' + '-' + i).click( {"index": i}, function(event) {
                return changeStatusPromise(entitlementsResultSet.getRowId(event.data.index), 'DISABLED');
            });

            if (entitlementsResultSet.getData(i, 'status') === 'ENABLED') {
                $('#left').prop('checked', true);
            } else {
                $('#right').prop('checked', true);
            }

            toggle.show();
            item.append(toggle);
        } else {
            let chevron = $('<img>');
            chevron.attr('src', odkCommon.getFileAsUrl('config/assets/img/little_arrow.png'));
            chevron.attr('class', 'chevron');
            item.append(chevron);
        }


        $('#list').append(item);

        // don't append the last one to avoid the fencepost problem
        let borderDiv = $('<div>');
        borderDiv.addClass('divider');
        $('#list').append(borderDiv);

    }
    if (i < entitlementsResultSet.getCount()) {
        setTimeout(resumeFn, 0, i);
    }
};

function changeStatusPromise(id, status) {
    return new Promise( function(resolve, reject) {
        odkData.updateRow(util.entitlementTable, {'status' : status}, id,
            resolve, reject);
    }).then( function(result) {
        console.log('Update success: ' + result);
    }).catch( function(reason) {
        console.log('Update failure: ' + reason);
    });
}
