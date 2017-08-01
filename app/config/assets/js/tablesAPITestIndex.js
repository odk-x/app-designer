/* global $, odkData, util */
/* exported resumeFn */
'use strict';

/**
 * This is the file that will be creating the list view.
 */
var result1;
            
/** 
 * Use chunked list view for larger tables: We want to chunk the displays so
 * that there is less load time.
 */
            
/**
 * Called when page loads to display things (Nothing to edit here)
 */

var cbFnQuery = function (result) {

    var resultVals = '';
    result1 = result;
    for (var i = 0; i < result.getCount(); i++) {
        resultVals += result.getData(i, 'Description') + ' '; 
    }

    var cnt = result.getCount();
    if (cnt === 13) {
        $('#outputResultsQuery').text('Query Geotagger CB PASSED: ' + result.getCount() + ' results');  
        $('#outputResultsQuery').css('color', 'green');
    } else {
        $('#outputResultsQuery').text('Query Geotagger CB: FAILED with ' + result.getCount() + ' results');  
        $('#outputResultsQuery').css('color', 'red');
    }  
    //$('#outputResultsQuery').append(' Query Geotagger CB: ' + result.getCount() + ' results: ' + resultVals);   
};

var cbFnQueryFailure = function (error) {

    $('#outputResultsQuery').text('Query Geotagger CB: FAILED with error: ' + error);  
    $('#outputResultsQuery').css('color', 'red');  
};

var cbFnQueryAfterAdd = function (result) {

    var resultVals = '';
    var pass = false;
    for (var i = 0; i < result.getCount(); i++) {
        var val = result.getData(i, 'Description');
        if (val === 'Test location') {
            pass = true;
        }
        resultVals += result.getData(i, 'Description') + ' '; 
    }

    var cnt = result.getCount();
    if (cnt === 14 && pass === true) {
        $('#outputResultsAddRow').append(' Query After Add Geotagger CB: PASSED: ' + result.getCount() + ' results');  
        $('#outputResultsAddRow').css('color', 'green');
    } else {
        $('#outputResultsAddRow').append(' Query After Add Geotagger CB: FAILED with ' + result.getCount() + ' results');  
        $('#outputResultsAddRow').css('color', 'red');
    }  

    //$('#outputResultsAddRow').append(' Query After Add Geotagger CB: ' + result.getCount() + ' results: ' + resultVals);    
};

var cbFnQueryFailureAfterAdd = function (error) {

    $('#outputResultsAddRow').append(' Query After Add Geotagger CB: FAILED with error: ' + error); 
    $('#outputResultsAddRow').css('color', 'red');    
};

var cbFnQueryAfterUpdate = function (result) {

    var resultVals = '';
    var pass = false;
    for (var i = 0; i < result.getCount(); i++) {
        var val = result.getData(i, 'Description');
        if (val === 'Test location 2') {
            pass = true;
        }
        resultVals += result.getData(i, 'Description') + ' '; 
    }

    var cnt = result.getCount();
    if (cnt === 14 && pass === true) {
        $('#outputResultsUpdateRow').append(' Query After Update Geotagger CB: PASSED: ' + result.getCount() + ' results');  
        $('#outputResultsUpdateRow').css('color', 'green');
    } else {
        $('#outputResultsUpdateRow').append(' Query After Update Geotagger CB: FAILED with ' + result.getCount() + ' results');  
        $('#outputResultsUpdateRow').css('color', 'red');
    } 

    //$('#outputResultsUpdateRow').append(' Query After Update Geotagger CB: ' + result.getCount() + ' results: ' + resultVals);    
};

var cbFnQueryFailureAfterUpdate = function (error) {

    $('#outputResultsUpdateRow').append(' Query After Update Geotagger CB: FAILED with error: ' + error);  
    $('#outputResultsUpdateRow').css('color', 'red');    
};

var cbFnQueryAfterDelete = function (result) {

    var resultVals = '';
    result1 = result;
    for (var i = 0; i < result.getCount(); i++) {
        resultVals += result.getData(i, 'Description') + ' '; 
    }

    var cnt = result.getCount();
    if (cnt === 13) {
        $('#outputResultsDeleteRow').append(' Query After Delete Geotagger CB: PASSED: ' + result.getCount() + ' results');  
        $('#outputResultsDeleteRow').css('color', 'green');
    } else {
        $('#outputResultsDeleteRow').append(' Query After Delete Geotagger CB: FAILED with ' + result.getCount() + ' results');  
        $('#outputResultsDeleteRow').css('color', 'red');
    }  
    
    //$('#outputResultsDeleteRow').append(' Query After Delete Geotagger CB: ' + result.getCount() + ' results: ' + resultVals);    
};

var cbFnQueryFailureAfterDelete = function (error) {

    $('#outputResultsDeleteRow').append(' Query After Delete Geotagger CB: FAILED with error: ' + error); 
    $('#outputResultsDeleteRow').css('color', 'red');     
};

var cbFnQueryAfterAddChkpt = function (result) {

    var resultVals = '';
    var pass = false;
    for (var i = 0; i < result.getCount(); i++) {
        var val = result.getData(i, 'Description');
        if (val === 'Add Checkpoint 1') {
            pass = true;
        }
        resultVals += result.getData(i, 'Description') + ' '; 
    }

    var cnt = result.getCount();
    if (cnt === 15 && pass === true) {
        $('#outputResultsAddCheckpoint').append(' Query After Add Checkpoint Geotagger CB: PASSED: ' + result.getCount() + ' results');  
        $('#outputResultsAddCheckpoint').css('color', 'green');
    } else {
        $('#outputResultsAddCheckpoint').append(' Query After Add Checkpoint Geotagger CB: FAILED with ' + result.getCount() + ' results');  
        $('#outputResultsAddCheckpoint').css('color', 'red');
    } 

    //$('#outputResultsAddCheckpoint').append(' Query After Add Checkpoint Geotagger CB: ' + result.getCount() + ' results: ' + resultVals);    
};

var cbFnQueryFailureAfterAddChkpt = function (error) {

    $('#outputResultsAddCheckpoint').append(' Query After Add Chkpt Geotagger CB: FAILED with error: ' + error); 
    $('#outputResultsAddCheckpoint').css('color', 'red');      
};

var cbFnQueryAfterAddChkpt2 = function (result) {

    var resultVals = '';
    var pass = false;
    for (var i = 0; i < result.getCount(); i++) {
        var val = result.getData(i, 'Description');
        if (val === 'Add Checkpoint 2') {
            pass = true;
        }
        resultVals += result.getData(i, 'Description') + ' '; 
    }

    var cnt = result.getCount();
    if (cnt === 15 && pass === true) {
        $('#outputResultsAddCheckpoint2').append(' Query After Add Checkpoint2 Geotagger CB: PASSED: ' + result.getCount() + ' results');  
        $('#outputResultsAddCheckpoint2').css('color', 'green');
    } else {
        $('#outputResultsAddCheckpoint2').append(' Query After Add Checkpoint2 Geotagger CB: FAILED with ' + result.getCount() + ' results');  
        $('#outputResultsAddCheckpoint2').css('color', 'red');
    } 

    //$('#outputResultsAddCheckpoint2').append(' Query After Add Checkpoint2 Geotagger CB: ' + result.getCount() + ' results: ' + resultVals);  
};

var cbFnQueryFailureAfterAddChkpt2 = function (error) {

    $('#outputResultsAddCheckpoint2').append(' Query After Add Chkpt2 Geotagger CB: FAILED with error: ' + error); 
    $('#outputResultsAddCheckpoint2').css('color', 'red');    
};
var cbFnQueryAfterAddChkpt3 = function (result) {

    var resultVals = '';
    var pass = false;
    for (var i = 0; i < result.getCount(); i++) {
        var val = result.getData(i, 'Description');
        if (val === 'Add Checkpoint 3') {
            pass = true;
        }
        resultVals += result.getData(i, 'Description') + ' '; 
    }

    var cnt = result.getCount();
    if (cnt === 15 && pass === true) {
        $('#outputResultsAddCheckpoint3').append(' Query After Add Checkpoint3 Geotagger CB: PASSED: ' + result.getCount() + ' results');  
        $('#outputResultsAddCheckpoint3').css('color', 'green');
    } else {
        $('#outputResultsAddCheckpoint3').append(' Query After Add Checkpoint3 Geotagger CB: FAILED with ' + result.getCount() + ' results');  
        $('#outputResultsAddCheckpoint3').css('color', 'red');
    } 

    //$('#outputResultsAddCheckpoint3').append(' Query After Add Checkpoint3 Geotagger CB: ' + result.getCount() + ' results: ' + resultVals);   
};

var cbFnQueryFailureAfterAddChkpt3 = function (error) {

    $('#outputResultsAddCheckpoint3').append(' Query After Add Chkpt3 Geotagger CB: FAILED with error: ' + error);   
    $('#outputResultsAddCheckpoint3').css('color', 'red');  
};

var cbFnQueryAfterChkptInc = function (result) {

    var resultVals = '';
    var pass = false;
    for (var i = 0; i < result.getCount(); i++) {
        var val = result.getData(i, 'Description');
        var spt = result.getData(i, '_savepoint_type');
        if (val === 'Add Checkpoint 1' && spt === 'INCOMPLETE') {
            pass = true;
        }
        resultVals += result.getData(i, 'Description') + ' '; 
    }

    var cnt = result.getCount();
    if (cnt === 14 && pass === true) {
        $('#outputResultsSaveCheckpointAsIncomplete').append(' Query After Save Chkpt Inc Geotagger CB: PASSED: ' + result.getCount() + ' results');  
        $('#outputResultsSaveCheckpointAsIncomplete').css('color', 'green');
    } else {
        $('#outputResultsSaveCheckpointAsIncomplete').append(' Query After Save Chkpt Inc Geotagger CB: FAILED with ' + result.getCount() + ' results');  
        $('#outputResultsSaveCheckpointAsIncomplete').css('color', 'red');
    } 
    
    //$('#outputResultsSaveCheckpointAsIncomplete').append(' Query After Save Chkpt Inc Geotagger CB: ' + result.getCount() + ' results: ' + resultVals); 
};

var cbFnQueryFailureAfterChkptInc = function (error) {

    $('#outputResultsSaveCheckpointAsIncomplete').append(' Query After Save Chkpt Inc Geotagger CB: FAILED with error: ' + error);  
    $('#outputResultsSaveCheckpointAsIncomplete').css('color', 'red');  
};

var cbFnQueryAfterChkptCom = function (result) {

    var resultVals = '';
    var pass = false;
    for (var i = 0; i < result.getCount(); i++) {
        var val = result.getData(i, 'Description');
        var spt = result.getData(i, '_savepoint_type');
        if (val === 'Add Checkpoint 2' && spt === 'COMPLETE') {
            pass = true;
        }
        resultVals += result.getData(i, 'Description') + ' '; 
    }

    var cnt = result.getCount();
    if (cnt === 14 && pass === true) {
        $('#outputResultsSaveCheckpointAsComplete').append(' Query After Save Chkpt Com Geotagger CB: PASSED: ' + result.getCount() + ' results');  
        $('#outputResultsSaveCheckpointAsComplete').css('color', 'green');
    } else {
        $('#outputResultsSaveCheckpointAsComplete').append('  Query After Save Chkpt Com Geotagger CB: FAILED with ' + result.getCount() + ' results');  
        $('#outputResultsSaveCheckpointAsComplete').css('color', 'red');
    } 

    //$('#outputResultsSaveCheckpointAsComplete').append(' Query After Save Chkpt Com Geotagger CB: ' + result.getCount() + ' results: ' + resultVals);
};

var cbFnQueryFailureAfterChkptCom = function (error) {

    $('#outputResultsSaveCheckpointAsComplete').append(' Query After Save Chkpt Com Geotagger CB: FAILED with error: ' + error);
    $('#outputResultsSaveCheckpointAsComplete').css('color', 'red');    
};

var cbFnQueryAfterDelChkpt = function (result) {

    var resultVals = '';
    for (var i = 0; i < result.getCount(); i++) {
        resultVals += result.getData(i, 'Description') + ' '; 
    }

    var cnt = result.getCount();
    if (cnt === 14) {
        $('#outputResultsDeleteLastCheckpoint').append(' Query After Delete Last Chkpt Geotagger CB: PASSED' + result.getCount() + ' results');  
        $('#outputResultsDeleteLastCheckpoint').css('color', 'green');
    } else {
        $('#outputResultsDeleteLastCheckpoint').append('  Query After Delete Last Chkpt Geotagger CB: FAILED with ' + result.getCount() + ' results');  
        $('#outputResultsDeleteLastCheckpoint').css('color', 'red');
    } 
    
    //$('#outputResultsDeleteLastCheckpoint').append(' Query After Delete Last Chkpt Geotagger CB: ' + result.getCount() + ' results: ' + resultVals);
};

var cbFnQueryFailureAfterDelChkpt = function (error) {

    $('#outputResultsDeleteLastCheckpoint').append(' Query After Delete Last Chkpt Geotagger CB: FAILED with error: ' + error);  
    $('#outputResultsDeleteLastCheckpoint').css('color', 'red');  
};

var cbFnTeaTypesQuery = function (result) {

    var resultVals = '';
    for (var i = 0; i < result.getCount(); i++) {
        resultVals += result.getData(i, 'Name') + ' ';
    }

    var cnt = result.getCount();
    var cnt2 = result1.getCount();
    if (cnt === 7 && cnt2 === 13) {
        $('#outputResultsQuery2').text('Query Tea_types CB PASSED: ' + result.getCount() + ' results');  
        $('#outputResultsQuery2').css('color', 'green');
    } else {
        $('#outputResultsQuery2').text('Query Tea_types CB: FAILED with ' + result.getCount() + ' results');  
        $('#outputResultsQuery2').css('color', 'red');
    }   
};

var cbFnQueryTeaTypesFailure = function (error) {

    $('#outputResultsQuery2').text('Query Tea_types CB: FAILED with error: ' + error); 
    $('#outputResultsQuery2').css('color', 'red');     
};

var cbFnAddRow = function (result) {

    $('#outputResultsAddRow').text('Add Row CB: Got ' + result.getCount() + ' results');    
};

var cbFnAddRowFail = function (error) {

    $('#outputResultsAddRow').text('Add Row CB: FAILED with error: ' + error);  
    $('#outputResultsAddRow').css('color', 'red');    
};

var cbFnUpdateRow = function (result) {

    $('#outputResultsUpdateRow').text('Update Row CB: Got ' + result.getCount() + ' results');    
};

var cbFnUpdateRowFailure = function (error) {

    $('#outputResultsUpdateRow').text('Update Row CB: FAILED with error: ' + error);  
    $('#outputResultsUpdateRow').css('color', 'red');    
};

var cbFnDeleteRow = function (result) {

    $('#outputResultsDeleteRow').text('Delete Row CB: Got ' + result.getCount() + ' results');    
};

var cbFnDeleteRowFailure = function (error) {

    $('#outputResultsDeleteRow').text('Delete Row CB: FAILED with error: ' + error);  
    $('#outputResultsDeleteRow').css('color', 'red');    
};

var cbFnAddCheckpt = function (result) {

    $('#outputResultsAddCheckpoint').text('Add Checkpoint CB: Got ' + result.getCount() + ' results');    
};

var cbFnAddCheckptFailure = function (error) {

    $('#outputResultsAddCheckpoint').text('Add Checkpoint CB: FAILED with error: ' + error); 
    $('#outputResultsAddCheckpoint').css('color', 'red');  
};

var cbFnAddCheckpt2 = function (result) {

    $('#outputResultsAddCheckpoint2').text('Add Checkpoint CB2: Got ' + result.getCount() + ' results');   
};

var cbFnAddCheckptFailure2 = function (error) {

    $('#outputResultsAddCheckpoint2').text('Add Checkpoint CB2: FAILED with error: ' + error); 
    $('#outputResultsAddCheckpoint2').css('color', 'red');  
};

var cbFnAddCheckpt3 = function (result) {

    $('#outputResultsAddCheckpoint3').text('Add Checkpoint CB3: Got ' + result.getCount() + ' results');   
};

var cbFnAddCheckptFailure3 = function (error) {

    $('#outputResultsAddCheckpoint3').text('Add Checkpoint CB3: FAILED with error: ' + error); 
    $('#outputResultsAddCheckpoint3').css('color', 'red');
};

var cbFnSaveCheckptInc = function (result) {

    $('#outputResultsSaveCheckpointAsIncomplete').text('Save Checkpoint As Incomplete CB: Got ' + result.getCount() + ' results');    
};

var cbFnSaveCheckptIncFailure = function (error) {

    $('#outputResultsSaveCheckpointAsIncomplete').text('Save Checkpoint As Incomplete CB: FAILED with error: ' + error);   
    $('#outputResultsSaveCheckpointAsIncomplete').css('color', 'red'); 
};

var cbFnSaveCheckptCom = function (result) {

    $('#outputResultsSaveCheckpointAsComplete').text('Save Checkpoint As Complete CB: Got ' + result.getCount() + ' results');    
};

var cbFnSaveCheckptComFailure = function (error) {

    $('#outputResultsSaveCheckpointAsComplete').text('Save Checkpoint As Complete CB: FAILED with error: Got ' + error);
    $('#outputResultsSaveCheckpointAsComplete').css('color', 'red');    
};

var cbFnDelLastCheckpt = function (result) {

    $('#outputResultsDeleteLastCheckpoint').text('Delete Last Checkpoint CB: Got ' + result.getCount() + ' results');    
};

var cbFnDelLastCheckptFailure = function (error) {

    $('#outputResultsDeleteLastCheckpoint').text('Delete Last Checkpoint CB: FAILED with error: ' + error);  
    $('#outputResultsDeleteLastCheckpoint').css('color', 'red');   

};

var resumeFn = function(idxStart) {

    console.log('resumeFn called. idxStart: ' + idxStart);

    // Geotagger Query Test
    odkData.query('geotagger', null, null, null, null, null, null, null, null, false, cbFnQuery, cbFnQueryFailure);

    // Not implemented
    //odkData.arbitraryQuery('geotagger', 'select * from geotagger where Description = ?', ['The Ave'], null, null, null, null, cbFnRawQuery, cbFnRawQueryFail);

    // Tea_types Query Test
    odkData.query('Tea_types', null, null, null, null, null, null, null, null, false, cbFnTeaTypesQuery, cbFnQueryTeaTypesFailure);

    var struct = {};

    // Geotagger Add Row Test
    struct.Description = 'Test location';
    var rowId = util.genUUID();
    odkData.addRow('geotagger', struct, rowId, cbFnAddRow, cbFnAddRowFail);
    odkData.query('geotagger', null, null, null, null, null, null, null, null, false, cbFnQueryAfterAdd, cbFnQueryFailureAfterAdd);

    // Geotagger Update Row Test
    struct.Description = 'Test location 2';
    odkData.updateRow('geotagger', struct, rowId, cbFnUpdateRow, cbFnUpdateRowFailure);
    odkData.query('geotagger', null, null, null, null, null, null, null, null, false, cbFnQueryAfterUpdate, cbFnQueryFailureAfterUpdate);

    // Geotagger Add Checkpoint Test
    struct.Description = 'Add Checkpoint 1';
    odkData.addCheckpoint('geotagger', struct, rowId, cbFnAddCheckpt, cbFnAddCheckptFailure);
    odkData.query('geotagger', null, null, null, null, null, null, null, null, false, cbFnQueryAfterAddChkpt, cbFnQueryFailureAfterAddChkpt);

    // Geotagger Save Checkpoint As Incomplete Test
	struct.Description = 'SaveAsIncomplete 1';
    odkData.saveCheckpointAsIncomplete('geotagger', struct, rowId, cbFnSaveCheckptInc, cbFnSaveCheckptIncFailure);
    odkData.query('geotagger', null, null, null, null, null, null, null, null, false, cbFnQueryAfterChkptInc, cbFnQueryFailureAfterChkptInc);

    // Geotagger Save Checkpoint As Incomplete Test
    struct.Description = 'Add Checkpoint 2';
    odkData.addCheckpoint('geotagger', struct, rowId, cbFnAddCheckpt2, cbFnAddCheckptFailure2);
    odkData.query('geotagger', null, null, null, null, null, null, null, null, false, cbFnQueryAfterAddChkpt2, cbFnQueryFailureAfterAddChkpt2);

	struct.Description = 'SaveAsComplete 1';
    odkData.saveCheckpointAsComplete('geotagger', struct, rowId, cbFnSaveCheckptCom, cbFnSaveCheckptComFailure);
    odkData.query('geotagger', null, null, null, null, null, null, null, null, false, cbFnQueryAfterChkptCom, cbFnQueryFailureAfterChkptCom);

    // Geotagger Delete Last Checkpoint Test
    struct.Description = 'Add Checkpoint 3';
    odkData.addCheckpoint('geotagger', struct, rowId, cbFnAddCheckpt3, cbFnAddCheckptFailure3);
    odkData.query('geotagger', null, null, null, null, null, null, null, null, false, cbFnQueryAfterAddChkpt3, cbFnQueryFailureAfterAddChkpt3);

    odkData.deleteLastCheckpoint('geotagger', rowId, false, cbFnDelLastCheckpt, cbFnDelLastCheckptFailure);
    odkData.query('geotagger', null, null, null, null, null, null, null, null, false, cbFnQueryAfterDelChkpt, cbFnQueryFailureAfterDelChkpt);

    // Geotagger Delete Row Test
    odkData.deleteRow('geotagger', struct, rowId, cbFnDeleteRow, cbFnDeleteRowFailure);
    odkData.query('geotagger', null, null, null, null, null, null, null, null, false, cbFnQueryAfterDelete, cbFnQueryFailureAfterDelete);
};
