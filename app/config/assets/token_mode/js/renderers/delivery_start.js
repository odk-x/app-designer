var insideQueue = false;
var htmlFileNameValue = "delivery_start";
var userActionValue = "launchBarcode";
var myTimeoutVal = null;
	var code = null;
	var id = null;
	var finished = false;
	var activeAuths = null;
	var authIndex = 1;

function display() {
	var launchBarcodeButton = $('#launch-barcode');
	launchBarcodeButton.on(
	'click',
	function() {
    	odkCommon.registerListener(function() {
        	    callBackFn();
    	});
    	var dispatchString = JSON.stringify({htmlPath:htmlFileNameValue, userAction:userActionValue});
    	odkCommon.doAction(dispatchString, 'com.google.zxing.client.android.SCAN', null);
	});
	myTimeoutVal = setTimeout(callBackFn(), 1000);
}

function callBackFn () {
    if (insideQueue == true) return;
    insideQueue = true;
    var value = odkCommon.viewFirstQueuedAction();
    console.log('callback entered with value: ' + value);
    if (value !== null && value !== undefined) {
        var action = JSON.parse(value);
        var dispatchStr = JSON.parse(action.dispatchString);

        console.log("callBackFn: action: " + dispatchStr.userAction + " htmlPath: " + dispatchStr.htmlPath);

        if (dispatchStr.userAction === userActionValue &&
            dispatchStr.htmlPath === htmlFileNameValue &&
            action.jsonValue.status === -1) {
        	code = action.jsonValue.result.SCAN_RESULT;
        	clearTimeout(myTimeoutVal);
            odkData.query(util.authorizationTable, 'is_active = ?', ['true'], null, null,
			            null, null, null, null, true, authCBSuccess, 
			            authCBFailure);

        } else {
            myTimeoutVal = setTimeout(callBackFn(), 1000);
            $('#message').text("No value");
            $('#launch').hide();
			odkCommon.removeFirstQueuedAction();
        }
    }
	console.log("callBackFn is called");
	insideQueue = false;
}

function authCBSuccess(result) {
    activeAuths = result;
    if (result.getCount() > 0) {
        odkData.query('deliveries', 'beneficiary_code = ? and is_delivered = ?', [code, 'true'],  null, null, null, null, null, null, true, deliveredSuccess, deliveredFailure);
    } else {
        $('#message').text('There are no currently active authorizations');
    }
}

function authCBFailure(error) {
    console.log('authCBFailure with error: ' + error);
}

function deliveredSuccess(result) {
    if (collision(activeAuths, result)) {
        $('#message').text('Barcode ' + code + ' has already received the current authorization');
    } else {
        id = activeAuths.getRowId(0);
        $('#launch').show();
        $('#launch').text('Click to Deliver');
        $('#launch').on('click', function() {
            odkTables.addRowWithSurvey('deliveries', 'deliveries', null, getJSONMapValues());
        });
    }  
    odkCommon.removeFirstQueuedAction();
}

function deliveredFailure(error) {
    console.log('update CBFailure with error : ' + error);
}

function collision(auths, deliveries) {
    console.log(deliveries.getCount());
    for (var i = 0; i < deliveries.getCount(); i++) {
        for (var j = 0; j < auths.getCount(); j++) {
            var deliveryAuth = deliveries.getData(i, 'authorization_id');
            console.log(deliveryAuth);
            var authAuth = auths.getData(j, '_id');
            console.log(authAuth);
            if (deliveryAuth == authAuth) {
                return true;
            }
        }
    }
    return false;
}

var getJSONMapValues = function() {
    var jsonMap = {};
    util.setJSONMap(jsonMap, 'beneficiary_code', code);
    util.setJSONMap(jsonMap, 'authorization_id', id);
    console.log(id);
    jsonMap = JSON.stringify(jsonMap);    
    return jsonMap;
};