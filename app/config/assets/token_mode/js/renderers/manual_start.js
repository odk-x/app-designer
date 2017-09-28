var code = null;
var id = null;
var finished = false;
var activeAuths = null;
var authIndex = 1;


function display() {
    var enter = $('#enter');
    setTimeout(function() {
        var width = $(window).innerWidth();
        var height = $(window).innerHeight();
        document.getElementById("enter").style.width = width * .9 + "px";
        document.getElementById("enter").style.height = height * .15 + "px";
        document.getElementById("launch").style.width = width * .9 + "px";
        document.getElementById("launch").style.height = height * .15 + "px";
        document.getElementById('code').style.width = width * .6 + "px";
        document.getElementById('code').style.height = height * .07 + 'px';
    }, 0);

    enter.on('click', function() {
        code = $('#code').val();
        if (code !== "") {
            check();
        }
    });
}

function check () {
    odkData.query(util.authorizationTable, 'is_active = ?', ['true'], null, null,
                null, null, null, null, true, authCBSuccess,
                authCBFailure);
}

function authCBSuccess(result) {
    activeAuths = result;
    if (result.getCount() > 0) {
        /*var maxIndex = 0;
        id = result.getRowId(0);
        for (var i = 1; i < result.getCount(); i++) {
            if (parseInt(result.getRowId(i)) > id) {
                maxIndex = i;
                id = result.getRowId();
            }
        }
        var struct = {};
        struct.is_active = 'false';
        for (var i = 0; i < result.getCount(); i++) {
            if (i !== maxIndex) {
                odkData.updateRow(util.authorizationTable, struct, i, updateSuccess, updateFailure);
            }
        }*/
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
        $('#message').text('This barcode has already received the current authorization');
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
