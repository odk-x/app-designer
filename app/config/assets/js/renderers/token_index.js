
var tokenIndex = {};
tokenIndex.actionCustomAuthReset = "actionCustomAuthReset";
tokenIndex.actionTypeKey = "actionTypeKey";

tokenIndex.display = function() {
    dataUtil.reconcileTokenAuthorizations();
    $('#title').text(odkCommon.localizeText(locale, titleToken));

    var deliver = document.createElement("button");
    deliver.setAttribute("id", "deliver");
    deliver.setAttribute('type', 'reg');
    deliver.innerHTML = "Deliver";
    deliver.onclick = function() {
        // TODO put correct queryparams
        odkTables.launchHTML(null, 'config/assets/html/choose_method.html?title=' + encodeURIComponent('Please Enter Beneficiary Entity ID'));
    }
    document.getElementById("wrapper").appendChild(deliver);

    var del = document.createElement('button');
    del.setAttribute('id', 'view-deliveries');
    del.setAttribute('type', 'reg');
    del.innerHTML = 'View Deliveries';
    del.onclick = function() {
        odkTables.launchHTML(null, 'config/assets/token_mode/html/view_start.html');
    }
    document.getElementById('wrapper').appendChild(del);

    odkCommon.registerListener(function() {
        tokenIndex.callBackFn();
    });

    // Call the registered callback in case the notification occurred before the page finished
    // loading
    tokenIndex.callBackFn();

    return new Promise( function(resolve, reject) {
        odkData.getRoles(resolve, reject);
    }).then( function(result) {
        var roles = result.getRoles();
        if ($.inArray('ROLE_SUPER_USER_TABLES', roles) > -1) {
            var override = document.createElement("button");
            override.setAttribute("id", "override");
            override.setAttribute('type', 'reg');
            override.innerHTML = "Administrator Reset";
            override.onclick = function() {
                var formId = util.getTokenAuthorizationFormId();
                if (formId != null && formId != undefined && formId != "") {
                    var dispatchStruct = JSON.stringify({actionTypeKey: tokenIndex.actionCustomAuthReset});
                    odkTables.addRowWithSurvey(dispatchStruct, formId, formId, null, {'status' : 'ACTIVE', 'type' : 'TOKEN'});
                } else {
                    var followThrough = confirm("Are you sure you want to perform an Administrator Reset? \n" +
                        "All beneficiary entity IDs will be entitled to a delivery if confirmed");
                    if (followThrough) {
                        new Promise( function(resolve, reject) {
                            odkData.query(util.authorizationTable, 'status = ? AND type = ?', ['ACTIVE', 'TOKEN'],
                                null, null, null, null, null, null, true, resolve, reject);
                        }).then( function(result) {
                            var dbActions = [];
                            dbActions.push(new Promise(function(resolve, reject) {
                                odkData.updateRow(util.authorizationTable, {'status' : 'INACTIVE'}, result.getRowId(i), resolve, reject);
                            }));

                            dbActions.push(new Promise(function(resolve, reject) {
                                odkData.addRow(util.authorizationTable, {'status' : 'ACTIVE', 'type' : 'TOKEN'}, util.genUUID(),
                                    resolve, reject);
                            }));
                            return Promise.all(dbActions);
                        }).then( function(result) {
                            console.log('successfully updated active authorization without custom form');
                        });
                    }
                }
            }
            document.getElementById("wrapper").appendChild(override);
        }
    });
}

tokenIndex.callBackFn = function() {
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

    var actionType = dispatchStr[tokenIndex.actionTypeKey];
    console.log('callBackFn: actionType: ' + actionType);

    switch (actionType) {
        case tokenIndex.actionCustomAuthReset:
            console.log(action.jsonValue);
            var result = action.jsonValue.result;
            if (result != undefined && result != null) {
                var savepointType = result.savepoint_type;
                if (savepointType === util.savepointSuccess) {
                    dataUtil.reconcileTokenAuthorizations();
                }
            }
            odkCommon.removeFirstQueuedAction();
            break;
        default:
            console.log("Error: unrecognized action type in callback");
            odkCommon.removeFirstQueuedAction();
            break;
    }
}
