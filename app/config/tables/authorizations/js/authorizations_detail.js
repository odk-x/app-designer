'use strict';

 
var authorizationsResultSet = {};
var insideQueue = false;
var htmlFileNameValue = "authorizations_detail";
var userActionValue = "launchBarcode";
var myTimeoutVal = null;


var display = function() {
  odkData.getViewData(cbSuccess, cbFailure);
};

var cbSuccess = function (result) {

  authorizationsResultSet = result;

  $('FIELD_1').text(authorizationsResultSet.get('authorization_name'));
  $('FIELD_2').text(authorizationsResultSet.get('authorization_id'));
  $('FIELD_3').text(authorizationsResultSet.get('item_pack_name'));
  $('FIELD_4').text(authorizationsResultSet.get('item_pack_id'));
  $('FIELD_5').text(authorizationsResultSet.get('min_range'));
  $('FIELD_6').text(authorizationsResultSet.get('max_range'));

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
};

var callBackFn = function () {
  if (insideQueue == true) return;
  insideQueue = true;
  var value = odkCommon.viewFirstQueuedAction();
  if ( value !== null || value !== undefined ) {
    var action = JSON.parse(value);
    var dispatchStr = JSON.parse(action.dispatchString);

    console.log("callBackFn: action: " + dispatchStr.userAction + " htmlPath: " + dispatchStr.htmlPath);

    if (dispatchStr.userAction === userActionValue &&
      dispatchStr.htmlPath === htmlFileNameValue &&
      action.jsonValue.status === -1) {
      $('#scanned-barcode').text(action.jsonValue.result.SCAN_RESULT);
      clearTimeout(myTimeoutVal);
      odkCommon.removeFirstQueuedAction();
      var struct = {};
      struct['authorization_id'] = authorizationsResultSet.get('authorization_id');
      struct['authorization_name'] = authorizationsResultSet.get('authorization_name');
      struct['item_pack_id'] = authorizationsResultSet.get('item_pack_id');
      struct['item_pack_name'] = authorizationsResultSet.get('item_pack_name');
      struct['min_range'] = authorizationsResultSet.get('min_range');
      struct['max_range'] = authorizationsResultSet.get('max_range');

      odkData.addRow(
        'distribution',
        struct,
        util.genUUID(),
        addDistCBSuccess,
        addDistCBFailure
      );
    } else {
        myTimeoutVal = setTimeout(callBackFn(), 1000);
        $('#scanned-barcode').text("No value");
    }
  }
  console.log("callBackFn is called");
  insideQueue = false;

};

var cbFailure = function (error) {
  console.log('authorizations_detail cbFailure: getViewData failed with message: ' + error);
};


var addDistCBSuccess = function(result) {

    console.log('authorizations_detail addDistCBSuccess');

};

var addDistCBFailure = function(error) {

    console.log('authorizations_detail addDistCBFailure: ' + error);
};

