
var titleToken = "main_title";
var tokenIndex = {};
tokenIndex.actionCustomAuthReset = "actionCustomAuthReset";
tokenIndex.actionTypeKey = "actionTypeKey";

var locale = odkCommon.getPreferredLocale();

tokenIndex.display = function() {
    dataUtil.reconcileTokenAuthorizations();
    $('#title').text(odkCommon.localizeText(locale, titleToken));

    var deliver = document.createElement("button");
    deliver.setAttribute("id", "deliver");
    deliver.setAttribute('type', 'reg');
    deliver.innerHTML = odkCommon.localizeText(locale, 'deliver');
    deliver.onclick = function() {
        odkTables.launchHTML(null, 'config/assets/html/choose_method.html?title=' + encodeURIComponent('Please Enter Beneficiary Entity ID'));
    };
    document.getElementById("wrapper").appendChild(deliver);

    var del = document.createElement('button');
    del.setAttribute('id', 'view-deliveries');
    del.setAttribute('type', 'reg');
    del.innerHTML = odkCommon.localizeText('view_deliveries');
    del.onclick = function() {
        odkTables.launchHTML(null, 'config/assets/html/data_options.html?type=deliveries');
    };
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
            override.innerHTML = odkCommon.localizeText(locale, 'administrator_options');
            override.onclick = function() {
                odkTables.launchHTML(null, 'config/assets/html/token_overrides.html');
            };
            document.getElementById("wrapper").appendChild(override);
        }
    });
};

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
