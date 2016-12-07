'use strict';

 
var authorizationsResultSet = {};
var insideQueue = false;
var htmlFileNameValue = "authorizations_detail";
var userActionValue = "launchBarcode";
var myTimeoutVal = null;
var beneficiary_code = null;


var display = function() {
  odkData.getViewData(cbSuccess, cbFailure);
};

var cbSuccess = function (result) {
  authorizationsResultSet = result;

  $('#FIELD_1').text(authorizationsResultSet.get('authorization_name'));
  $('#FIELD_2').text(authorizationsResultSet.get('_id'));
  $('#FIELD_3').text(authorizationsResultSet.get('item_pack_name'));
  $('#FIELD_4').text(authorizationsResultSet.get('item_pack_id'));
  $('#FIELD_5').text(authorizationsResultSet.get('item_description'));

  var launchBarcodeButton = $('#launch-barcode');
  var launchButton = $('#launch');
  launchBarcodeButton.on(
    'click',
    function() {
        odkCommon.registerListener(function() {
                callBackFnScan();
        });
        var dispatchString = JSON.stringify({htmlPath:htmlFileNameValue, userAction:userActionValue});
        odkCommon.doAction(dispatchString, 'com.google.zxing.client.android.SCAN', null);
    });
    myTimeoutVal = setTimeout(callBackFnScan(), 1000);

  launchButton.on(
    'click',
    function() {
        callBackFn();
    });
}


var callBackFnScan = function() {
  if (insideQueue == true) return;
  insideQueue = true;
  var value = odkCommon.viewFirstQueuedAction();
  console.log(value);
  if ( value !== null && value !== undefined ) {
    var action = JSON.parse(value);
    var dispatchStr = JSON.parse(action.dispatchString);

    console.log("callBackFn: action: " + dispatchStr.userAction + " htmlPath: " + dispatchStr.htmlPath);

    if (dispatchStr.userAction === userActionValue &&
      dispatchStr.htmlPath === htmlFileNameValue &&
      action.jsonValue.status === -1) {
      beneficiary_code = action.jsonValue.result.SCAN_RESULT;

      clearTimeout(myTimeoutVal);
      $('#manual').val(beneficiary_code);


    }
  }
  insideQueue = false;
}

var callBackFn = function () {
  console.log($('#manual').val().length);
  beneficiary_code = $('#manual').val();
    if (beneficiary_code.length > 0 && beneficiary_code !== "Manually Enter Barcode") {
      odkData.query('registration', 'beneficiary_code = ?', 
                    [beneficiary_code],
                    null, null, null, null, null, null, true, firstCBSuccess, firstCBFailure);
    } else {
        $('#results').text("Please Enter Beneficiary Code");
    }
}


var firstCBSuccess = function(result) {
  if (result.getCount() != 0) {
    odkData.query('entitlements', 'beneficiary_code = ? and authorization_id = ?', 
                    [beneficiary_code, authorizationsResultSet.get('_id')],
                    null, null, null, null, null, null, true, scanCBSuccess, scanCBFailure);
  } else {
    $('#results').text('beneficiary with scanned code (' + beneficiary_code
                              + ') not found in system.');
        odkCommon.removeFirstQueuedAction();
  }
}

var firstCBFailure = function(error) {
  console.log('failed with error: ' + error);
}

var scanCBSuccess = function (result) {
  var isEmpty = true;
  for (var key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      isEmpty = false;
    }
  }
  if (result.getCount() == 0) {
    var struct = {};
    struct['authorization_id'] = authorizationsResultSet.get('_id');
    struct['authorization_name'] = authorizationsResultSet.get('authorization_name');
    struct['item_pack_id'] = authorizationsResultSet.get('item_pack_id');
    struct['item_pack_name'] = authorizationsResultSet.get('item_pack_name');
    struct['item_description'] = authorizationsResultSet.get('item_description');
    struct['ranges'] = authorizationsResultSet.get('ranges');
    struct['beneficiary_code'] = beneficiary_code;
    struct['is_delivered'] = 'false';
    struct['is_override'] = 'true';
    odkData.addRow(
      'entitlements',
      struct,
      util.genUUID(),
      addDistCBSuccess,
      addDistCBFailure
    );
    $('#results').text('Override Successfully Created');
  } else {
    $('#results').text('Scanned beneficiary already qualifies for this authorization. Override not created.');

  }

}

var scanCBFailure = function (error) {
  console.log('scanCBFailure with error:' + error);
}

var cbFailure = function (error) {
  console.log('authorizations_detail cbFailure: getViewData failed with message: ' + error);

};


var addDistCBSuccess = function(result) {

    console.log('authorizations_detail addDistCBSuccess');

};

var addDistCBFailure = function(error) {

    console.log('authorizations_detail addDistCBFailure: ' + error);
};

