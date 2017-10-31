'use strict';
/* global $, odkTables */
/* exported display */

/**
 * Responsible for rendering the main menu screen.
 */

var LOG_TAG = 'main_menu: ';

var actionTypeKey = 'actionTypeKey';
var rowIdKey = 'rowId';
var instanceIdKey = 'instanceId';
var savepointTypeKey = 'savepoint_type';
var navigateAction = 0;
var editQuestionnaireAction=1;
var filterByPointType = [];
var FILTER_KEY="filter_by_point_type";

function display() {
    
    init();

    odkCommon.registerListener(function() {
        actionCBFn();
    });
    actionCBFn();

    displayPlacesSelected();

    restoreFilterSelectControl();

    var collectButton = $('#collect');
    collectButton.on(
        'click',
        function() {
            odkTables.launchHTML(null, 'config/assets/eps_collect.html')
        }
    );

    var selectButton = $('#select');
    selectButton.on(
        'click',
        function() {
            odkTables.launchHTML(null, 'config/assets/eps_select.html')
        }
    );

    var navigateButton = $('#navigate');
    navigateButton.on(
        'click',
        function() {

            var sqlWhereClause = [];
            var sqlSelectionArgs = [];
            $.each(filterByPointType, function(index,value) {
                switch(value) {
                    case '1000'://main
                    case '100'://additional
                    case '10'://alternate
                      sqlWhereClause.push('(selected=? AND (questionnaire_status is null or questionnaire_status =?))');
                      sqlSelectionArgs.push(value);
                      sqlSelectionArgs.push('INCOMPLETE');
                      break;
                    case '1'://excluded
                        sqlWhereClause.push('(exclude=? AND (questionnaire_status is null or questionnaire_status =?))');
                        sqlSelectionArgs.push(value);
                        sqlSelectionArgs.push('INCOMPLETE');
                        break;
                    case '0'://not selected
                        sqlWhereClause.push('(selected=? AND exclude=? AND (questionnaire_status is null or questionnaire_status =?))');
                        sqlSelectionArgs.push('0');
                        sqlSelectionArgs.push('0');
                        sqlSelectionArgs.push('INCOMPLETE');
                        break;
                    case '-1'://finalized
                        sqlWhereClause.push('questionnaire_status =?');
                        sqlSelectionArgs.push('COMPLETE');
                        break;
                }
                
            });

            var sqlWhere = '(' + sqlWhereClause.join(' or ') + ') AND place_name=?';
            sqlSelectionArgs.push(localStorage.getItem("place_name_selected"));

            var dispatchStruct = {};
            dispatchStruct[actionTypeKey] = navigateAction;
            odkTables.openTableToNavigateView(JSON.stringify(dispatchStruct),
                                    'census', sqlWhere, sqlSelectionArgs, null);
        }
    );

    $('#point-types').change(function() {
        filterByPointType = [];
        $('#point-types option:selected').each(function() {
            filterByPointType.push($(this).val());
        });
        odkCommon.setSessionVariable(FILTER_KEY, JSON.stringify(filterByPointType));

        // if no value is selected, set Main, Additional and Alternate points
        if(filterByPointType.length === 0) {
          setDefaultPointTypes();
        }
    });
}

function restoreFilterSelectControl() {
    var filter = odkCommon.getSessionVariable(FILTER_KEY);
    if(filter !== null && filter !== undefined) {
        filterByPointType = JSON.parse(filter);
    }

    // if filterByPointType array is empty, select Main, Additional and Alternate points
    if(filterByPointType.length === 0) {
      setDefaultPointTypes();
    } else {
      $.each(filterByPointType, function(index,value) {
        $('#point-types option[value="'+value+'"]').prop('selected', true);
      });
    }
}

function setDefaultPointTypes() {
    filterByPointType.push("1000");
    filterByPointType.push("100");
    filterByPointType.push("10");
    odkCommon.setSessionVariable(FILTER_KEY, JSON.stringify(filterByPointType));
  
    $.each(filterByPointType, function(index,value) {
      $('#point-types option[value="'+value+'"]').prop('selected', true);
    });
}

function init() {
    if(EpsConfig.getShowCollectModule() === 0) {
        $('#collect').hide();
    }
    if(EpsConfig.getShowSelectModule() === 0) {
        $('#select').hide();
    }
    if(EpsConfig.getShowNavigateModule() === 0) {
        $('.navigate').hide();
    }
}

function displayPlacesSelected() {
    var places_selected = JSON.parse(localStorage.getItem("places_selected"));
    Object.keys(places_selected).forEach(function(key) {
        var li = $('<li>');
        li.html(key + ": <b>" + places_selected[key] + "</b>");
        $('#selected_place_name').append(li);
    });
}

function actionCBFn() {
  var action = odkCommon.viewFirstQueuedAction();
  console.log('I', LOG_TAG + 'callback entered with action: ' + action);

  if (action === null || action === undefined) {
    // The queue is empty
    return;
  }

  var dispatchStr = JSON.parse(action.dispatchStruct);
  if (dispatchStr === null || dispatchStr === undefined) {
    console.log('E', LOG_TAG + 'Error: missing dispatch struct');
    odkCommon.removeFirstQueuedAction();
    return;
  }

  var actionType = dispatchStr[actionTypeKey];
  switch (actionType) {
    case navigateAction:
      handleNavigationResult(action, dispatchStr);
      break;
    case editQuestionnaireAction:
        handleQuestionnaireEditResult(action, dispatchStr);
        break;
    default:
      console.log('E', LOG_TAG + 'Error: missing action type');
  }
  odkCommon.removeFirstQueuedAction();
};

function handleNavigationResult(action, dispatchStr) {
  var statusVal = action.jsonValue.status;
  if (statusVal !== -1) {
    console.log('I', LOG_TAG + 'Navigation was cancelled. No follow to perform');
    return;
  }

  var result = action.jsonValue.result;

  var rowId = result[rowIdKey];
  if (rowId === null || rowId === undefined) {
    console.log('E', LOG_TAG + 'Navigation result missing row ID');
  }
  if(rowId !== null && rowId !== undefined) {
    console.log(rowId);
    if(EpsConfig.getFormName().length>0) {
      var dispatchStruct = {};
      dispatchStruct[actionTypeKey] = editQuestionnaireAction;
      odkTables.editRowWithSurvey(JSON.stringify(dispatchStruct), EpsConfig.getFormName(), rowId, EpsConfig.getFormName(), null);
    } else {
      alert("Choose a form you want to start in the admin setting.");
    }
  }
};

function handleQuestionnaireEditResult(action, dispatchStr) {
  var statusVal = action.jsonValue.status;
  if (statusVal !== -1) {
    console.log('I', LOG_TAG + 'Questionnaire was cancelled.');
    return;
  }

  var result = action.jsonValue.result;

  //{instanceId: "d6ad6f6a-a3f6-48f4-abad-bc9ac5613438", savepoint_type: "COMPLETE"}

  var instanceId = result[instanceIdKey];
  var savepointType = result[savepointTypeKey];
  if(instanceId !== null && instanceId !== undefined && savepointType !== null && savepointType !== undefined) {
    var data = {'questionnaire_status':savepointType};
    odkData.updateRow('census', data, instanceId, null, null);
  }
};

$(document).ready(function() {
    display();
});