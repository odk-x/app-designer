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

// Table IDs
var registrationTable = 'registration';
var authorizationTable = 'authorizations';

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
    if (type !== 'ent_override') {
        $('#view_details').hide();
    } else {
        idComponent = "&authorization_id=" + encodeURIComponent(util.getQueryParameter('authorization_id'));
        $('#view_details').on('click', function() {
            odkTables.openDetailView(
                                     null,
                                     authorizationTable,
                                     util.getQueryParameter('authorization_id'),
                                     'config/tables/authorizations/html/authorizations_detail.html');
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

    Promise.all([userPromise, rolesPromise, defaultGroupPromise]).then(function(resultArray) {
        console.log(resultArray.length);
        var users = resultArray[0].getUsers();
        var roles = resultArray[1].getRoles();
        var filteredRoles = _.filter(roles, function(s) {
            return s.substring(0, 5) === 'GROUP';
        });
        var defaultGroup = resultArray[2].getDefaultGroup();
        odkCommon.setSessionVariable(defaultGroupKey, defaultGroup);

        superUser = $.inArray('ROLE_SUPER_USER_TABLES', roles) > -1;
        console.log(superUser);
        console.log("ROLES: " + roles);
        console.log("USERS: " + users);
        console.log("DEFAULT_GROUP: " + defaultGroup);
        if (superUser && type === 'registration') {
            $('#choose_user').show();
            $('#barcode').prop("disabled", true).addClass('disabled');
            $('#search').prop("disabled", true).addClass('disabled');
            filteredRoles.forEach(addOption);
            $('#choose_user').append($("<option/>").attr("value", localizedUser).attr('selected', true).text(localizedUser));
            $('#choose_user').on('change', function() {
                defaultGroup = $('#choose_user').val();
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

        $('#barcode').on('click', function() {
            var dispatchStruct = JSON.stringify({actionTypeKey: actionBarcode,
                htmlPath:htmlFileNameValue, userAction:userActionValue});
            odkCommon.doAction(dispatchStruct, 'com.google.zxing.client.android.SCAN', null);
        });
        myTimeoutVal = setTimeout(callBackFn(), 1000);


        $('#search').on('click', function() {
            console.log("USERS: " + users);
            queryChain($('#code').val());
        });
    }, function(err) {
        console.log('promise failure with error: ' + err);
    });

    odkCommon.registerListener(function() {
        callBackFn();
    });

    // Call the registered callback in case the notification occured before the page finished
    // loading
    callBackFn();
}

function addOption(item) {
    $('#choose_user').append($("<option/>").attr("value", item).text(item));

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

    console.log("Registration action occured");

    var result = action.jsonValue.result;
    if (result === null || result === undefined) {
        console.log("Error: no result object on registration");
        return;
    }

    var instanceId = result.instanceId;
    if (instanceId === null || instanceId === undefined) {
        console.log("Error: no instance ID on registration");
        return;
    }

    var savepointType = result.savepoint_type;
    if (savepointType === null || savepointType === undefined) {
        console.log("Error: no savepoint type on registration");
        return;
    }

    if (savepointType !== savepointSuccess) {
        console.log("The row was not saved as complete. Not launching detailview");
        return;
    }

    if (type === 'delivery') {
        odkTables.openDetailWithListView(null, registrationTable, instanceId,
                                         'config/tables/registration/html/registration_detail.html?type=' +
                                         encodeURIComponent(type));
    } else if (type === 'registration') {
        odkTables.openDetailWithListView(null, registrationTable, instanceId,
                                         'config/tables/registration/html/registration_detail_hh.html?type=' +
                                         encodeURIComponent(type));
    }
}

function queryChain(passed_code) {
    code = passed_code;
    console.log(code);
    if (type === 'delivery') {
        deliveryFunction();
    } else if (type === 'registration') {
        if (code === null || code === undefined || code === "") {
             $('#search_results').text(odkCommon.localizeText(locale, "barcode_unavailable"));
        } else {
            registrationFunction();
        }
        
    } else if (type === 'activate' || type === 'disable') {
        regOverrideFunction();
    } else if (type === 'ent_override') {
        entOverrideFunction();
    }
}

function deliveryFunction() {
    odkData.query('registration', 'beneficiary_code = ? and (is_active = ? or is_active = ?)', [code, 'TRUE', 'true'], null,
                           null, null, null, null, null, true, deliveryBCheckCBSuccess, deliveryBCheckCBFailure);
}

function deliveryBCheckCBSuccess(result) {
    console.log('deliveryBCheckCBSuccess called');
    if (result.getCount() === 0) {
        odkData.query('registration', 'beneficiary_code = ? and (is_active = ? or is_active = ?)', [code, 'FALSE', 'false'],
                          null, null, null, null, null, null, true,
                          deliveryDisabledCBSuccess, deliveryDisabledCBFailure);
    } else if (result.getCount() === 1) {
        // TODO: This should be changed as well - probably don't need if and else 
        // double check that this is the case
        if (type === 'delivery') {
            odkTables.openDetailWithListView(null, registrationTable, result.getRowId(0),
                                             'config/tables/registration/html/registration_detail.html?type=' +
                                             encodeURIComponent(type));
        } else {
            odkTables.openDetailView(null, registrationTable,result.getRowId(0),
                                     'config/tables/registration/html/registration_detail.html?type=' +
                                     encodeURIComponent(type));
        }
    } else {
        var params;
        var vals;

        params = 'beneficiary_code = ? and (is_active = ? or is_active = ?)';
        vals = [code,'TRUE', 'true'];
        odkTables.openTableToListView(
                                      null,
                                      registrationTable, params, vals
                                      , 'config/tables/registration/html/registration_list.html?type=' + type);
    }
}

function deliveryBCheckCBFailure(error) {
    console.log('deliveryBCheckCBFailure called with error: ' + error);
}

function deliveryDisabledCBSuccess(result) {
    console.log('disabledCB called');
    if (result.getCount() > 0) {
        $('#search_results').text(odkCommon.localizeText(locale, "disabled_beneficiary_notification"));
    } else {
        $('#search_results').text(odkCommon.localizeText(locale, "missing_beneficiary_notification"));

    }
}

function deliveryDisabledCBFailure(error) {
    console.log('disableCB failed with error: ' + error);
}

function registrationFunction() {
    console.log('registration function path entered');
        odkData.query('registration', 'beneficiary_code = ?', [code], null, null,
                      null, null, null, null, true, registrationBCheckCBSuccess,
                      registrationBCheckCBFailure);
}

function registrationBCheckCBSuccess(result) {
    console.log('registrationBCheckCBSuccess called with value' + result);
    if (result.getCount() === 0) {
            odkData.query('entitlements', 'beneficiary_code = ?', [code], null, null,
                          null, null, null, null, true, registrationVoucherCBSuccess,
                          registrationVoucherCBFailure);

    } else {
        $('#search_results').text(odkCommon.localizeText(locale, "barcode_unavailable"));
        // Now launch the registration_detail_hh.html
        odkTables.openDetailWithListView(null, 'registration', result.getRowId(0),'config/tables/registration/html/registration_detail_hh.html');
    }
}

function registrationBCheckCBFailure(error) {
    console.log('registrationBCheckCBFailure called with error: ' + error);
}

function registrationVoucherCBSuccess(result) {
    var voucherResultSet = result;
    if (voucherResultSet.getCount() === 0) {
        $('#search_results').text(odkCommon.localizeText(locale, "barcode_available"));
    } else {
        $('#search_results').text(odkCommon.localizeText(locale, "voucher_detected"));
    }
    setTimeout(function() {
        var defaultGroup = odkCommon.getSessionVariable(defaultGroupKey);
        var user = odkCommon.getSessionVariable(userKey);

        var struct = {};
        struct['beneficiary_code'] = code;
        struct['_group_modify'] = defaultGroup;
        struct['_default_access'] = 'HIDDEN';
        struct['_row_owner'] = user;

        var dispatchStruct = JSON.stringify({actionTypeKey: actionRegistration});
        odkTables.addRowWithSurvey(dispatchStruct, registrationTable, 'registration', null, struct);
        
    }, 1000);
}

function registrationVoucherCBFailure(error) {
    console.log('registrationVoucherCBFailure called with error: ' + error);
}

function regOverrideFunction() {
    console.log('entered regoverride path');
    var queryCaseType;
    var queriedType;
    if (code !== "" && code !== undefined && code !== null) {
        console.log(code);
        if (type === 'activate') {
            queriedType = 'FALSE';
            queryCaseType = 'false';
        } else {
            queriedType = 'TRUE';
            queryCaseType = 'true';
        }
        odkData.query('registration', 'beneficiary_code = ? and (is_active = ? or is_active = ?)', [code, queriedType, queryCaseType],
                      null, null, null, null, null, null, true,
                      regOverrideBenSuccess, regOverrideBenFailure);
    }
}

function regOverrideBenSuccess(result) {
    if (result.getCount() === 1) {
        if (type === 'delivery') {
            odkTables.openDetailWithListView(null, registrationTable, result.getRowId(0),
                                             'config/tables/registration/html/registration_detail.html?type=' +
                                             encodeURIComponent(type));
        } else if (type === 'registration') {
            odkTables.openDetailView(null, registrationTable,result.getRowId(0),
                                     'config/tables/registration/html/registration_detail_hh.html?type=' +
                                     encodeURIComponent(type));
        } else {
            odkTables.openDetailView(null, registrationTable,result.getRowId(0),
                                     'config/tables/registration/html/registration_detail.html?type=' +
                                     encodeURIComponent(type));
        }
    } else if (result.getCount() > 1) {
        var queriedType;
        var queryCaseType;
        if (type === 'activate') {
            queriedType = 'FALSE';
            queryCaseType = 'false';
        } else {
            queriedType = 'TRUE';
            queryCaseType = 'true';
        }
        odkTables.openTableToListView(null, registrationTable,
                                      'beneficiary_code = ? and (is_active = ? or is_active = ?)',
                                      [code, queriedType, queryCaseType],
                                      'config/tables/registration/html/registration_list.html?type=' +
                                      encodeURIComponent(type));
    } else {
        if (type === 'activate') {
            $('#search_results').text(odkCommon.localizeText(locale, "no_disabled_beneficiary"));
        } else {
            $('#search_results').text(odkCommon.localizeText(locale, "no_active_beneficiary"));
        }
    }
}

function regOverrideBenFailure(error) {
    console.log('regOverrideFailure with error : ' + error)
}


function entOverrideFunction() {
    if (code !== "" && code !== undefined && code !== null) {
        odkData.query('registration', 'beneficiary_code = ?',
                      [code],
                      null, null, null, null, null, null, true, benEntOverrideCBSuccess,
                      benEntOverrideCBFailure);
    } else {
        $('#search_results').text(odkCommon.localizeText(locale, "enter_beneficiary_code"));
    }
}

function benEntOverrideCBSuccess(result) {
    if (result.getCount() != 0) {
        var entDefaultGroup = result.getData(0, '_group_modify');
        odkCommon.setSessionVariable(entDefaultGroupKey, entDefaultGroup);
        odkData.query('entitlements', 'beneficiary_code = ? and authorization_id = ?',
                      [code, util.getQueryParameter('authorization_id')], null, null, null, null, null,
                      null, true, entCheckCBSuccess, entCheckCBFailure);
    } else {
        $('#search_results').text(odkCommon.localizeText(locale, "missing_beneficiary_notification"));
    }
}

function benEntOverrideCBFailure(error) {
    console.log('failed with error: ' + error);
}

function entCheckCBSuccess(result) {
    if (result.getCount() === 0) {
        odkData.query('authorizations', '_id = ?',
                      [util.getQueryParameter('authorization_id')],
                      null, null, null, null, null, null, true, createOverrideCBSuccess,
                      createOverrideCBFailure);
    } else {
        $('#search_results').text(odkCommon.localizeText(locale, "already_qualifies_override"));
    }
}

function entCheckCBFailure(error) {
    console.log('scanCBFailure with error:' + error);
}

function createOverrideCBSuccess(result) {
    $('#search_results').text(odkCommon.localizeText(locale, "eligible_override"));

    var defaultGroup = odkCommon.getSessionVariable(entDefaultGroupKey);
    var user = odkCommon.getSessionVariable(userKey)

    var struct = {};
    struct['authorization_id'] = result.get('_id');
    struct['authorization_name'] = result.get('authorization_name');
    struct['item_pack_id'] = result.get('item_pack_id');
    struct['item_pack_name'] = result.get('item_pack_name');
    struct['item_description'] = result.get('item_description');
    struct['ranges'] = result.get('ranges');
    struct['beneficiary_code'] = code;
    struct['is_delivered'] = 'false';
    struct['is_override'] = 'true';
    struct['_default_access'] = 'HIDDEN'; 
    struct['_row_owner'] = user;
    struct['_group_modify'] = defaultGroup;
    odkData.addRow('entitlements', struct, util.genUUID(), addDistCBSuccess, addDistCBFailure);
}

function createOverrideCBFailure(error) {
    console.log('createOverride failed with error: ' + error);
}

var addDistCBSuccess = function(result) {
    console.log('authorizations_detail addDistCBSuccess');

    $('#search_results').text(odkCommon.localizeText(locale, "override_creation_success"));
};

var addDistCBFailure = function(error) {
    console.log('authorizations_detail addDistCBFailure: ' + error);
};
