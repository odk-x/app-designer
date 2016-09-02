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
  $('#FIELD_2').text(authorizationsResultSet.get('authorization_id'));
  $('#FIELD_3').text(authorizationsResultSet.get('item_pack_name'));
  $('#FIELD_4').text(authorizationsResultSet.get('item_pack_id'));

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
  console.log(value);
  if ( value !== null && value !== undefined ) {
    var action = JSON.parse(value);
    var dispatchStr = JSON.parse(action.dispatchString);

    console.log("callBackFn: action: " + dispatchStr.userAction + " htmlPath: " + dispatchStr.htmlPath);

    if (dispatchStr.userAction === userActionValue &&
      dispatchStr.htmlPath === htmlFileNameValue &&
      action.jsonValue.status === -1) {
      beneficiary_code = action.jsonValue.result.SCAN_RESULT;
      $('#scanned_barcode').text(beneficiary_code);
      clearTimeout(myTimeoutVal);
      odkData.query('distribution', 'beneficiary_code = ? and authorization_id = ?', 
                    [beneficiary_code,authorizationsResultSet.get('authorization_id')],
                    null, null, null, null, null, null, true, scanCBSuccess, scanCBFailure);
     /* var struct = {};
  struct['authorization_id'] = authorizationsResultSet.get('authorization_id');
  struct['authorization_name'] = authorizationsResultSet.get('authorization_name');
  struct['item_pack_id'] = authorizationsResultSet.get('item_pack_id');
  struct['distribution_id'] = util.genUUID();
  struct['min_range'] = authorizationsResultSet.get('min_range');
  struct['max_range'] = authorizationsResultSet.get('max_range');
  struct['beneficiary_code'] = action.jsonValue.result.SCAN_RESULT;
  odkData.addRow(
    'distribution',
    struct,
    util.genUUID(),
    addDistCBSuccess,
    addDistCBFailure
  );*/


    } else {
        myTimeoutVal = setTimeout(callBackFn(), 1000);
        $('#scanned_barcode').text("No value");
    }
  }
  console.log("callBackFn is called");
  insideQueue = false;

};

var scanCBSuccess = function (result) {
  var isEmpty = true;
  for (var key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      isEmpty = false;
    }
  }
  if (result.getCount() == 0) {
    console.log('go ahead and make that override');
    var struct = {};
    struct['authorization_id'] = authorizationsResultSet.get('authorization_id');
    struct['authorization_name'] = authorizationsResultSet.get('authorization_name');
    struct['item_pack_id'] = authorizationsResultSet.get('item_pack_id');
    struct['item_pack_name'] = authorizationsResultSet.get('item_pack_name');
    struct['distribution_id'] = util.genUUID();
    //struct['item_pack_name'] = authorizationsResultSet.get('item_pack_name');
    struct['ranges'] = authorizationsResultSet.get('ranges');
    struct['beneficiary_code'] = beneficiary_code;
    struct['is_distributed'] = '0';
    struct['is_override'] = '1';
    odkData.addRow(
      'distribution',
      struct,
      util.genUUID(),
      addDistCBSuccess,
      addDistCBFailure
    );
    odkCommon.removeFirstQueuedAction();

  } else {
    //console.(result.getRowId());
    console.log(result.getCount());
    console.log('distribution already exists!, do not create override');
    $('#rejected').text('Scanned beneficiary already qualifies for this authorization. Override not created.');
    odkCommon.removeFirstQueuedAction();

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

