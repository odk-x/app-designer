/**
 * Render the choose method page
 */
'use strict';

var actionTypeKey = "actionTypeKey";
var actionBarcode = 0;
var actionRegistration = 1;
var htmlFileNameValue = "delivery_start";
var userActionValue = "launchBarcode";
var barcodeSessionVariable = "barcodeVal";
var chooseListSessionVariable = "chooseList";
var savepointSuccess = "COMPLETE";
var LOG_TAG = "choose_method.js";

// Table IDs

var myTimeoutVal = null;
var idComponent = "";
var user;
var locale = odkCommon.getPreferredLocale();
var superUser;
var type = util.getQueryParameter('type');
var code;
var userKey = "user";
var defaultGroupKey = "defaultGroup";
var entDefaultGroupKey = "entDefaultGroup";


function display() {

    $('#view_details').text(odkCommon.localizeText(locale, "view_authorization_details"));
    $('#barcode').text(odkCommon.localizeText(locale, "scan_barcode"));
    $('#search').text(odkCommon.localizeText(locale, "enter"));

    var barcodeVal = odkCommon.getSessionVariable(barcodeSessionVariable);
    if (barcodeVal !== null && barcodeVal !== undefined && barcodeVal !== "") {
        $('#code').val(barcodeVal);
    }

    var localizedUser = odkCommon.localizeText(locale, "select_group");
    $('#choose_user').hide();
    if (type !== 'new_ent') {
        $('#view_details').hide();
    } else {
        idComponent = "&authorization_id=" + encodeURIComponent(util.getQueryParameter('authorization_id'));
        $('#view_details').on('click', function() {
            clearSessionVars();
            odkTables.openDetailView(
                                     null,
                                     util.authorizationTable,
                                     util.getQueryParameter('authorization_id'),
                                     'config/tables/authorizations/html/' + util.authorizationTable + '_detail.html');
        });
    }

    $('#title').text(util.getQueryParameter('title'));


    user = odkCommon.getActiveUser();
    odkCommon.setSessionVariable(userKey, user);
    console.log("Active User:" + user);

    var userPromise = new Promise(function(resolve, reject) {
        odkData.getUsers(resolve, reject);
    });

    var rolesPromise = new Promise(function(resolve, reject) {
        odkData.getRoles(resolve, reject);
    });

    var defaultGroupPromise = new Promise(function(resolve, reject) {
        odkData.getDefaultGroup(resolve, reject);
    });

    return Promise.all([userPromise, rolesPromise, defaultGroupPromise, populateSyncList()]).then(function(resultArray) {
        var users = resultArray[0].getUsers();
        var roles = resultArray[1].getRoles();
        var filteredRoles = _.filter(roles, function (s) {
            return s.substring(0, 5) === 'GROUP';
        });
        var defaultGroupVal = odkCommon.getSessionVariable(defaultGroupKey);

        superUser = $.inArray('ROLE_SUPER_USER_TABLES', roles) > -1;
        if (!superUser) {
            var defaultGroup = resultArray[2].getDefaultGroup();
            odkCommon.setSessionVariable(defaultGroupKey, defaultGroup);
        } else if (util.getWorkflowMode() !== 'TOKEN' && type === 'registration') {
            if (filteredRoles.length > 0) {
                filteredRoles.forEach(addOption);
                addOption(localizedUser);
                $('#choose_user').show();
                if (defaultGroupVal !== null && defaultGroupVal !== undefined && defaultGroupVal !== "" && filteredRoles.includes(defaultGroupVal)) {
                    $('#choose_user').val(defaultGroupVal);
                } else {
                    $('#choose_user').val(localizedUser);
                    $('#barcode').prop("disabled", true).addClass('disabled');
                    $('#search').prop("disabled", true).addClass('disabled');

                    $('#choose_user').on('change', function() {
                        var defaultGroup = $('#choose_user').val();
                        odkCommon.setSessionVariable(defaultGroupKey, defaultGroup);
                        if ($('#choose_user').val() === localizedUser) {
                            $('#barcode').prop("disabled", true).addClass('disabled');
                            $('#search').prop("disabled", true).addClass('disabled');
                        } else {
                            $('#barcode').prop("disabled", false).removeClass('disabled');
                            $('#search').prop("disabled", false).removeClass('disabled');
                        }
                    });
                }
            }

        }

        $('#barcode').on('click', function() {
            var dispatchStruct = JSON.stringify({actionTypeKey: actionBarcode,
                htmlPath:htmlFileNameValue, userAction:userActionValue});

            odkCommon.doAction(dispatchStruct, 'com.google.zxing.client.android.SCAN', null);
        });
        myTimeoutVal = setTimeout(callBackFn(), 1000);


        $('#search').on('click', function() {
            var val = $('#code').val();
            odkCommon.setSessionVariable(barcodeSessionVariable, val);
            console.log("USERS: " + users);
            queryChain(val);
        });

        odkCommon.registerListener(function() {
            callBackFn();
        });

        // Call the registered callback in case the notification occured before the page finished
        // loading
        callBackFn();
    }, function(err) {
        console.log('promise failure with error: ' + err);
    });
}

function addOption(item) {
    $('#choose_user').append($("<option/>").attr("value", item).text(item));
}

function populateSyncList() {
    if (util.getWorkflowMode() === 'TOKEN' || type === 'delivery') {
        console.log('entered delivery sync path');
        var newRows = $('<h3>');
        return new Promise( function(resolve, reject) {
            odkData.arbitraryQuery(util.deliveryTable, 'SELECT count(*) AS total FROM ' +
                util.deliveryTable + ' WHERE _sync_state = ?', ['new_row'],
                null, null, resolve, reject);
        }).then( function(result) {
            newRows.text('New since last sync: ' + result.get('total'));
            $('#sync_list').append(newRows);
        });
    } else if (type === 'registration') {
        console.log('entered registration sync path');

        var newMergedEntities = $('<h3>');
        var newBeneficiaryEntitiesPromise = new Promise( function(resolve, reject) {
            odkData.arbitraryQuery(util.beneficiaryEntityTable, 'SELECT count(*) AS total FROM ' +
                util.beneficiaryEntityTable + ' WHERE _sync_state = ?', ['new_row'],
                null, null, resolve, reject);
        });

        var updatedMergedEntities = $('<h3>');
        var updatedBeneficiaryEntitiesPromise = new Promise( function(resolve, reject) {
            odkData.arbitraryQuery(util.beneficiaryEntityTable, 'SELECT count(*) AS total FROM ' +
                util.beneficiaryEntityTable + ' WHERE _sync_state = ? OR _sync_state = ?',
                ['changed', 'in_conflict'], null, null, resolve, reject);
        });

        if (util.getRegistrationMode() === 'INDIVIDUAL') {
            return Promise.all([newBeneficiaryEntitiesPromise, updatedBeneficiaryEntitiesPromise]).then( function(resultArr) {
                newMergedEntities.text('New since last sync: ' + resultArr[0].get('total'));
                updatedMergedEntities.text('Edited since last sync: ' + resultArr[1].get('total'));
                $('#sync_list').append(newMergedEntities);
                $('#sync_list').append(updatedMergedEntities);
            });
        } else {
            var newMembers = $('<h3>');
            var newMembersPromise = new Promise( function(resolve, reject) {
                odkData.arbitraryQuery(util.membersTable, 'SELECT count(*) AS total FROM ' +
                    util.membersTable + ' WHERE _sync_state = ?', ['new_row'],
                    null, null, resolve, reject);
            });

            var updatedMembers = $('<h3>');
            var updatedMembersPromise = new Promise( function(resolve, reject) {
                odkData.arbitraryQuery(util.membersTable, 'SELECT count(*) AS total FROM ' +
                    util.membersTable + ' WHERE _sync_state = ? OR _sync_state = ?',
                    ['changed', 'in_conflict'], null, null, resolve, reject);
            });

            return Promise.all([newBeneficiaryEntitiesPromise,
                                updatedBeneficiaryEntitiesPromise,
                                newMembersPromise,
                                updatedMembersPromise]).then( function(resultArr) {
                newMergedEntities.text('New households [members] since last sync: '
                    + resultArr[0].get('total') + ' [' + resultArr[1].get('total') + ']');
                updatedMergedEntities.text('Edited households [members] since last sync: '
                    + resultArr[1].get('total') + ' [' + resultArr[3].get('total') + ']');
                $('#sync_list').append(newMergedEntities);
                $('#sync_list').append(updatedMergedEntities);
            });
        }

    } else {
        return Promise.resolve(null);
    }


}

function callBackFn () {
    var action = odkCommon.viewFirstQueuedAction();
    console.log('callback entered with action: ' + action);

    if (action === null || action === undefined) {
        // The queue is empty
        return;
    }

    var dispatchStr = JSON.parse(action.dispatchStruct);
    if (dispatchStr === null || dispatchStr === undefined) {
        console.log('Error: missing dispatch struct');
        odkCommon.removeFirstQueuedAction();
        return;
    }

    var actionType = dispatchStr[actionTypeKey];
    console.log('callBackFn: actionType: ' + actionType);

    switch (actionType) {
        case actionBarcode:
            handleBarcodeCallback(action, dispatchStr);
            odkCommon.removeFirstQueuedAction();
            break;
        case actionRegistration:
            handleRegistrationCallback(action, dispatchStr);
            odkCommon.removeFirstQueuedAction();
            break;
        default:
            console.log("Error: unrecognized action type in callback");
            odkCommon.removeFirstQueuedAction();
            break;
    }
}

function handleBarcodeCallback(action, dispatchStr) {

    console.log("Barcode action occured");

    var actionStr = dispatchStr["userAction"];
    if (actionStr === null || actionStr === undefined ||
        !(actionStr === userActionValue)) {
        console.log('Error: missing or incorrect action string' + actionStr);
        return;
    }

    var htmlPath = dispatchStr["htmlPath"];
    if (htmlPath === null || htmlPath === undefined ||
        !(htmlPath === htmlFileNameValue)) {
        console.log('Error: missing or incorrect htmlPath string' + htmlPath);
        return;
    }

    console.log("callBackFn: action: " + actionStr + " htmlPath: " + htmlPath);

    if (action.jsonValue.status === -1) {
        clearTimeout(myTimeoutVal);
        var scanned = action.jsonValue.result.SCAN_RESULT;
        $('#code').val(scanned);
        odkCommon.setSessionVariable(barcodeSessionVariable, scanned);
        queryChain(action.jsonValue.result.SCAN_RESULT);
    }
}

function handleRegistrationCallback(action, dispatchStr) {
    dataUtil.validateCustomTableEntry(action, dispatchStr, "beneficiary_entity", util.beneficiaryEntityTable).then( function(result) {
        if (result) {
            var customRowId = action.jsonValue.result.instanceId;
            var rootRowId = dispatchStr[util.rootRowIdKey];
            if (util.getRegistrationMode() === "HOUSEHOLD") {
                dataUtil.selfHealMembers(rootRowId, customRowId)
                    .then( function(result) {
                        clearSessionVars();
                        if (result) {
                            console.log("added base member rows");
                        } else {
                            console.log("no members were created");
                        }
                        clearSessionVars();
                        odkTables.openDetailWithListView(null, util.getBeneficiaryEntityCustomFormId(), customRowId,
                            'config/tables/' + util.beneficiaryEntityTable + '/html/' + util.beneficiaryEntityTable
                            + '_detail.html?type=' + encodeURIComponent(type));

                    }).catch( function(error) {
                        console.log(error);
                    });
            } else if (util.getRegistrationMode() === "INDIVIDUAL") {

                // need to verify why it is necessary to add a base member row when in individual mode
                var jsonMap = {};
                util.setJSONMap(jsonMap, '_row_owner', odkCommon.getActiveUser());
                util.setJSONMap(jsonMap, "beneficiary_entity_row_id", rootRowId);
                util.setJSONMap(jsonMap, "date_created", util.getCurrentOdkTimestamp());
                util.setJSONMap(jsonMap, "status", 'ENABLED');
                util.setJSONMap(jsonMap, "_group_modify", odkCommon.getSessionVariable(defaultGroupKey));
                util.setJSONMap(jsonMap, "_default_access", "HIDDEN");

                new Promise( function(resolve, reject) {
                    odkData.addRow(util.membersTable, jsonMap, util.genUUID(), resolve, reject);
                }).then( function(result) {
                    clearSessionVars();
                    odkTables.openDetailWithListView(null, util.getBeneficiaryEntityCustomFormId(), customRowId,
                        'config/tables/' + util.beneficiaryEntityTable + '/html/' + util.beneficiaryEntityTable +
                        '_detail.html?type=delivery');
                });
            }
        }
    });
}

function queryChain(passed_code) {
    code = passed_code;
    if (code === null || code === undefined || code === "") {
        util.displayError("Enter a beneficiary entity id");
        return;
    }
    if (util.getWorkflowMode() === "TOKEN") {
        tokenDeliveryFunction();
    } else if (type === 'delivery') {
        deliveryFunction();
    } else if (type === 'registration') {
        registrationFunction();
    } else if (type === 'override_beneficiary_entity_status') {
        beneficiaryEntityStatusFunction();
    } else if (type === 'new_ent') {
        newEntitlementFunction();
    } else if (type === 'override_ent_status') {
        entitlementStatusFunction();
    }
}

function tokenDeliveryFunction() {
    // Could put this reconciliation function throughout the app
    console.log('entered token delivery function');
    var activeAuthorization;

    dataUtil.reconcileTokenAuthorizations().then( function(result) {
        return new Promise(function (resolve, reject) {
            odkData.query(util.authorizationTable, 'status = ? AND type = ?', ['ACTIVE', 'TOKEN'], null, null,
                null, null, null, null, true, resolve,
                reject);
        });
    }).then( function(result) {
        console.log(result);
        activeAuthorization = result;
        if (activeAuthorization.getCount() === 1) {
            return new Promise( function (resolve, reject) {
                odkData.query(util.deliveryTable, 'beneficiary_entity_id = ? AND authorization_id = ?', [code, activeAuthorization.getRowId(0)],  null, null,
                    null, null, null, null, true, resolve, reject);
            });
        } else if (activeAuthorization.getCount() === 0) {
            util.displayError('There currently are no active authorizations');
            return Promise.reject('There currently are no active authorizations');
        } else {
            //this should never happen
            util.displayError('Internal Error: please contact administrator');
            return Promise.reject('Internal Error: please contact administrator');
        }
    }).then( function(result) {
        console.log(result);
        if (result != null) {
            if (result.getCount() === 0) {
                console.log('Performing simple delivery');
                clearSessionVars();
                odkTables.launchHTML(null, 'config/assets/html/deliver.html?authorization_id=' +
                encodeURIComponent(activeAuthorization.getRowId(0)) + '&beneficiary_entity_id=' + encodeURIComponent(code));
            } else {
                util.displayError('This beneficiary entity id has already received the current authorization');
            }
        }
    }).catch( function(reason) {
        console.log(reason);
    });
}

function deliveryFunction() {
    odkData.query(util.beneficiaryEntityTable, 'beneficiary_entity_id = ? and (status = ? or status = ?)', [code, 'ENABLED', 'enabled'], null,
                           null, null, null, null, null, true, deliveryBCheckCBSuccess, deliveryBCheckCBFailure);
}

function deliveryBCheckCBSuccess(result) {
    console.log('deliveryBCheckCBSuccess called');
    if (result.getCount() === 0) {
        odkData.query(util.beneficiaryEntityTable, 'beneficiary_entity_id = ? and (status = ? or status = ?)', [code, 'DISABLED', 'disabled'],
                          null, null, null, null, null, null, true,
                          deliveryDisabledCBSuccess, deliveryDisabledCBFailure);
    } else if (result.getCount() === 1) {
        // double check that this is the case
        clearSessionVars();
        odkTables.openDetailWithListView(null, util.getBeneficiaryEntityCustomFormId(), result.getData(0, 'custom_beneficiary_entity_row_id'),
                                             'config/tables/' + util.beneficiaryEntityTable + '/html/' + util.beneficiaryEntityTable + '_detail.html?type=' +
                                             encodeURIComponent(type) + '&rootRowId=' + encodeURIComponent(result.getRowId(0)));
    } else {
        clearSessionVars();
        odkTables.openTableToListView(
                                      null,
                                      util.beneficiaryEntityTable, 'beneficiary_entity_id = ? and (status = ? or status = ?)', [code,'ENABLED', 'enabled'],
                                      'config/tables/registration/html/beneficiary_entities_list.html?type=' + type);
    }
}

function deliveryBCheckCBFailure(error) {
    console.log('deliveryBCheckCBFailure called with error: ' + error);
}

function deliveryDisabledCBSuccess(result) {
    console.log('disabledCB called');
    if (result.getCount() > 0) {
        util.displayError(odkCommon.localizeText(locale, "disabled_beneficiary_notification"));
    } else {
      if (util.getWorkflowMode() === 'VOUCHER') {
        // We are in Voucher mode: check for deliveries for this beneficiary
        var voucherPromise = new Promise( function(resolve, reject) {
          odkData.query(util.entitlementTable, 'beneficiary_entity_id = ?', [code], null, null, null, null, null, null, true, resolve, reject);
        }).then (function(entitlement_result) {
          // If there are deliveries for this beneficiary, we still want to give that option
          if (entitlement_result.getCount() > 0) {
              clearSessionVars();
              // opening an arbitrary row. hacky fix to the fact that you need to send in a row to open detail with list.
              // in this case the detail view is null because its a voucher
            odkTables.openDetailWithListView(null, util.authorizationTable, entitlement_result.getData(0, 'authorization_id'),
                                             'config/tables/' + util.beneficiaryEntityTable + '/html/' + util.beneficiaryEntityTable + '_detail.html?type=unregistered_voucher' +
                                             '&beneficiary_entity_id=' + encodeURIComponent(code));
          } else {
              util.displayError(odkCommon.localizeText(locale, "missing_beneficiary_notification"));
          }
        });

        voucherPromise.catch(function(reason) {
          console.log(reason);
        });

      } else {
        // We are not in voucher mode and there is no beneficiary, enabled or disabled
          util.displayError(odkCommon.localizeText(locale, "missing_beneficiary_notification"));
      }

    }
}

function deliveryDisabledCBFailure(error) {
    console.log('disableCB failed with error: ' + error);
}

function registrationFunction() {
    console.log('registration function path entered');
    odkData.query(util.beneficiaryEntityTable, 'beneficiary_entity_id = ?', [code], null, null,
        null, null, null, null, true, registrationBCheckCBSuccess,
        registrationBCheckCBFailure);
}

function registrationBCheckCBSuccess(result) {
    console.log('registrationBCheckCBSuccess called with value' + result);
    if (result.getCount() === 0) {
            odkData.query(util.entitlementTable, 'beneficiary_entity_id = ?', [code], null, null,
                          null, null, null, null, true, registrationVoucherCBSuccess,
                          registrationVoucherCBFailure);
    } else {
        util.displayError(odkCommon.localizeText(locale, "barcode_unavailable"));
        clearSessionVars();
        odkTables.openDetailWithListView(null, util.getBeneficiaryEntityCustomFormId(), result.getData(0, 'custom_beneficiary_entity_row_id'),
            'config/tables/' + util.beneficiaryEntityTable + '/html/' + util.beneficiaryEntityTable + '_detail.html?type=' +
            encodeURIComponent(type) + '&rootRowId=' + encodeURIComponent(result.getRowId(0)));

    }
}

function registrationBCheckCBFailure(error) {
    console.log('registrationBCheckCBFailure called with error: ' + error);
}

function registrationVoucherCBSuccess(result) {

    //TODO: if in VOUCHER WORKFLOW_MODE we do not force them to register the beneficiary_entity_id before delivering
    // in REGISTRATION_REQUIRED we would force them to

    var voucherResultSet = result;
    if (voucherResultSet.getCount() === 0) {
        $('#search_results').text(odkCommon.localizeText(locale, "barcode_available"));
    } else {
        $('#search_results').text(odkCommon.localizeText(locale, "voucher_detected"));
    }

    var defaultGroup = odkCommon.getSessionVariable(defaultGroupKey);
    var user = odkCommon.getSessionVariable(userKey);

    // TODO: verify that custom beneficiary entity table exists
    var customBEForm = util.getBeneficiaryEntityCustomFormId();
    if (customBEForm === undefined || customBEForm === null || customBEForm === "") {
        // should we provide a ui to register without survey?
        util.displayError("Beneficiary Entity Custom Form not defined");
        return;
    }
    var customRowId = util.genUUID();
    var rootRowId = util.genUUID();
    new Promise( function(resolve, reject) {
        var struct = {};
        struct['beneficiary_entity_id'] = code;
        struct['custom_beneficiary_entity_form_id'] = customBEForm;
        struct['custom_beneficiary_entity_row_id'] = customRowId;
        struct['status'] = 'ENABLED';
        struct['status_reason'] = 'standard';
        struct['_group_modify'] = defaultGroup;
        struct['_default_access'] = 'HIDDEN';
        struct['_row_owner'] = user;
        struct['date_created'] = util.getCurrentOdkTimestamp();
        odkData.addRow(util.beneficiaryEntityTable, struct, rootRowId, resolve, reject);
    }).then( function(result) {
        var customDispatchStruct = {};
        var additionalFormsTupleArr = [];

        var additionalFormTuple = {[util.additionalCustomFormsObj.formIdKey] : util.getMemberCustomFormId(), [util.additionalCustomFormsObj.foreignReferenceKey] : 'custom_beneficiary_entity_row_id', [util.additionalCustomFormsObj.valueKey] : customRowId};
        additionalFormsTupleArr.push(additionalFormTuple);

        customDispatchStruct[util.additionalCustomFormsObj.dispatchKey] = additionalFormsTupleArr;

        console.log(customDispatchStruct);
        clearSessionVars();
        dataUtil.createCustomRowFromBaseEntry(result, 'custom_beneficiary_entity_form_id', 'custom_beneficiary_entity_row_id', actionRegistration, customDispatchStruct, "_group_modify", null);
    });
}

function registrationVoucherCBFailure(error) {
    console.log('registrationVoucherCBFailure called with error: ' + error);
}

function beneficiaryEntityStatusFunction() {
    console.log('entered regoverride path');

    if (code !== "" && code !== undefined && code !== null) {
        odkData.query(util.beneficiaryEntityTable, 'beneficiary_entity_id = ?', [code],
                      null, null, null, null, null, null, true,
                      regOverrideBenSuccess, regOverrideBenFailure);
    }
}

function regOverrideBenSuccess(result) {
    if (result.getCount() === 1) {
        clearSessionVars();
        odkTables.openDetailView(null, util.getBeneficiaryEntityCustomFormId(), result.getData(0, 'custom_beneficiary_entity_row_id'),
            'config/tables/' + util.beneficiaryEntityTable + '/html/' + util.beneficiaryEntityTable + '_detail.html?type=' +
            encodeURIComponent(type) + '&rootRowId=' + encodeURIComponent(result.getRowId(0)));
    } else if (result.getCount() > 1) {
        clearSessionVars();
        odkTables.openTableToListView(null, util.beneficiaryEntityTable,
                                      'beneficiary_entity_id = ?',
                                      [code],
                                      'config/tables/' + util.beneficiaryEntityTable + '/html/' + util.beneficiaryEntityTable + '_list.html?type=' +
                                      encodeURIComponent(type));
    } else {
        util.displayError(odkCommon.localizeText(locale, "missing_beneficiary_notification"));
    }
}

function regOverrideBenFailure(error) {
    console.log('regOverrideFailure with error : ' + error)
}


function newEntitlementFunction() {
    $('#search_results').text('');
    odkData.query(util.beneficiaryEntityTable, 'beneficiary_entity_id = ?',
                  [code],
                  null, null, null, null, null, null, true, benEntOverrideCBSuccess,
                  benEntOverrideCBFailure);
}

function benEntOverrideCBSuccess(result) {
    if (result.getCount() !== 0) {
        var entDefaultGroup = result.getData(0, '_group_modify');
        odkCommon.setSessionVariable(entDefaultGroupKey, entDefaultGroup);
        odkData.query(util.authorizationTable, '_id = ?',
                      [util.getQueryParameter('authorization_id')], null, null, null, null, null,
                      null, true, restrictOverridesCheckSuccess, restrictOverridesCheckFailure);
    } else {
        util.displayError(odkCommon.localizeText(locale, "missing_beneficiary_notification"));
    }
}

function benEntOverrideCBFailure(error) {
    console.log('failed with error: ' + error);
}

function restrictOverridesCheckSuccess(result) {
    var overrideRestriction = result.getData(0, 'extra_field_entitlements').toUpperCase();
    console.log(overrideRestriction.toUpperCase());

    if (overrideRestriction === 'SINGLE') {

    } else if (overrideRestriction === 'MANY') {
        createOverrideCBSuccess(result);
    } else {
        // 'NONE' case, also acts as default
        // this case should not happen since ONE and MANY cases were the only ones not filtered in the previous authorization list view


    }

    if (overrideRestriction.toUpperCase() === 'TRUE') {
        odkData.query(util.entitlementTable, 'beneficiary_entity_id = ? and authorization_id = ?',
                      [code, util.getQueryParameter('authorization_id')], null, null, null, null, null,
                      null, true, entCheckCBSuccess, entCheckCBFailure);
    } else {
        createOverrideCBSuccess(result);
    }
}

function restrictOverridesCheckFailure(error) {
    console.log('restrict override failure with error: ' + error);
}

function entCheckCBSuccess(result) {
    if (result.getCount() > 1 || (result.getCount() === 1 && result.getData(0, 'is_override') === 'TRUE')) {
        util.displayError(odkCommon.localizeText(locale, "already_qualifies_override"));
    } else {
        odkData.query(util.authorizationTable, '_id = ?',
            [util.getQueryParameter('authorization_id')],
            null, null, null, null, null, null, true, createOverrideCBSuccess,
            createOverrideCBFailure);
    }
}

function entCheckCBFailure(error) {
    console.log('scanCBFailure with error:' + error);
}

function createOverrideCBSuccess(result) {
    var defaultGroup = odkCommon.getSessionVariable(entDefaultGroupKey);
    var user = odkCommon.getSessionVariable(userKey);

    var struct = {};

//TODO: would member ID be set here? is that a separate path? (post MVP)

    struct['authorization_id'] = result.get('_id');
    struct['authorization_name'] = result.get('name');
    struct['authorization_description'] = result.get('description');
    struct['authorization_type'] = result.get('type');
    struct['item_pack_id'] = result.get('item_pack_id');
    struct['item_pack_name'] = result.get('item_pack_name');
    struct['item_description'] = result.get('item_description');
    struct['beneficiary_entity_id'] = code;
    struct['is_override'] = 'TRUE';
    struct['status'] = 'ENABLED';
    struct['_default_access'] = 'HIDDEN';
    struct['_row_owner'] = user;
    struct['_group_read_only'] = defaultGroup;
    struct['date_created'] = util.getCurrentOdkTimestamp();
    odkData.addRow(util.entitlementTable, struct, util.genUUID(), addDistCBSuccess, addDistCBFailure);
}

function createOverrideCBFailure(error) {
    console.log('createOverride failed with error: ' + error);
}

var addDistCBSuccess = function(result) {
    $('#search_results').text(odkCommon.localizeText(locale, "override_creation_success"));
};

var addDistCBFailure = function(error) {
    console.log('addDistCBFailure: ' + error);
};

function entitlementStatusFunction() {
    new Promise( function(resolve, reject) {
        odkData.query(util.beneficiaryEntityTable, 'beneficiary_entity_id = ?',
            [code], null, null, null, null, null, null, true, resolve, reject)
    }).then( function(result) {
        if (result.getCount() === 0) {
            util.displayError(odkCommon.localizeText(locale, "missing_beneficiary_notification"));
        } else {
            clearSessionVars();
            odkTables.openDetailWithListView(null, util.getBeneficiaryEntityCustomFormId(), result.getData(0, 'custom_beneficiary_entity_row_id'),
                'config/tables/' + util.beneficiaryEntityTable + '/html/' + util.beneficiaryEntityTable + '_detail.html?type='
                + encodeURIComponent(type) + '&rootRowId=' + encodeURIComponent(result.getRowId(0)));
        }
    });
}

function clearSessionVars() {
    odkCommon.setSessionVariable(barcodeSessionVariable, null);
}
