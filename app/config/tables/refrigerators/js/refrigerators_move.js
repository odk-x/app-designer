/**
 * The file for displaying the detail view of the refrigerator inventory table.
 */
/* global $, odkData, odkCommon, odkTables, data, util */
'use strict';

var refrigeratorsResultSet = {};
var typeData = {};
var facilityData = {};
var refrigeratorRowId = null;

var listQuery = 'SELECT * FROM health_facilities WHERE _sync_state != ?';

var listQueryParams = [util.deletedSyncState];
var searchParams = '(facility_id LIKE ? OR facility_name LIKE ?)';
var orderBy = 'ORDER BY facility_name ASC';

function resumeFunc(state) {
    if (state === 'init') {
        refrigeratorRowId = util.getQueryParameter(util.refrigeratorRowId);
        getRefrigeratorInfo();

        var locale = odkCommon.getPreferredLocale();
        $('#frig-hdr').text(odkCommon.localizeText(locale, "refrigerator"));
        $('#frig-info').text(odkCommon.localizeText(locale, "basic_refrigerator_information"));

        $('#manu-id').text(odkCommon.localizeText(locale, "manufacturer"));
        $('#mdl-id').text(odkCommon.localizeText(locale, "model_id"));
        $('#frig-id').text(odkCommon.localizeText(locale, "refrigerator_id"));
        $('#ser-num').text(odkCommon.localizeText(locale, "serial_number"));

        $('#curr-fac').text(odkCommon.localizeText(locale, "current_facility"));
        $('#fac-to-move-to').text(odkCommon.localizeText(locale, "facility_to_move_to"));


        $('#mv-ref').text(odkCommon.localizeText(locale, "move_refrigerator"));

        var defNewFac = $('#facility_to_move_to_name');
        defNewFac.text("");
        defNewFac.removeAttr('data-fac-row-id');

        // Translations
        $('#showing').text(odkCommon.localizeText(locale, "showing"));
        $('#of').text(odkCommon.localizeText(locale, "of"));
        $('#prevButton').text(odkCommon.localizeText(locale, "previous"));
        $('#nextButton').text(odkCommon.localizeText(locale, "next"));
        $('#submit').val(odkCommon.localizeText(locale, "search"));

        // set the parameters for the list view
        listViewLogic.setTableId('health_facilities');
        listViewLogic.setListQuery(listQuery);
        listViewLogic.setListQueryParams(listQueryParams);
        listViewLogic.setSearchParams(searchParams);
        listViewLogic.setListElement('#list');
        listViewLogic.setSearchTextElement('#search');
        listViewLogic.setHeaderElement('#header');
        listViewLogic.setLimitElement('#limitDropdown');
        listViewLogic.setPrevAndNextButtons('#prevButton', '#nextButton');
        listViewLogic.setNavTextElements('#navTextLimit', '#navTextOffset', '#navTextCnt');
        listViewLogic.setUseUriParams(false);

        var onClickMoveHandler = function (rowId, facilityName) {
            var newFac = $('#facility_to_move_to_name');
            newFac.text(facilityName);
            newFac.attr('data-fac-row-id', rowId);
        };

        listViewLogic.setOnClickHandler(onClickMoveHandler);

        listViewLogic.setColIdsToDisplayInList('', 'facility_name');

        listViewLogic.setOrderBy(orderBy);
    }

    listViewLogic.resumeFn(state);
}

function clearListResults() {
    listViewLogic.clearResults();
}

function prevListResults() {
    listViewLogic.prevResults();
}

function nextListResults() {
    listViewLogic.nextResults();
}

function getSearchListResults(){
    listViewLogic.getSearchResults();
}

function newListLimit(){
    listViewLogic.newLimit();
}


function processFrigPromises(facilityResult, typeResult) {
    var access = refrigeratorsResultSet.get('_effective_access');

    if (access.indexOf('w') !== -1) {
        var editButton = $('#mvRefBtn');
        editButton.removeClass('hideButton');
    }

    facilityData = facilityResult;
    typeData = typeResult;

    util.showIdForDetail('#refrigerator_id', '_id', refrigeratorsResultSet, false);
    util.showIdForDetail('#serial_number', 'serial_number', refrigeratorsResultSet, false);
    util.showIdForDetail('#facility_name', 'facility_name', facilityData, false);
    util.showIdForDetail('#manufacturer_id', 'manufacturer', typeData, false);
    util.showIdForDetail('#model_id', 'model_id', typeData, false);
    util.showIdForDetail('#tracking_id', 'tracking_id', refrigeratorsResultSet, false);

}

function getRefrigeratorInfo() {
    var refrigeratorPromise = new Promise(function(resolve, reject) {
       odkData.query('refrigerators', '_id = ?', [refrigeratorRowId],
           null, null, null, null, null, null, true, resolve, reject);
    });

    refrigeratorPromise.then(function(result) {
        refrigeratorsResultSet = result;
        var healthFacilityPromise = new Promise(function(resolve, reject) {
            odkData.query('health_facilities', '_id = ?', [refrigeratorsResultSet.get(util.facilityRowId)],
                null, null, null, null, null, null, true, resolve, reject);
        });

        var typePromise = new Promise(function(resolve, reject) {
            odkData.query('refrigerator_types', '_id = ?', [refrigeratorsResultSet.get('model_row_id')],
                null, null, null, null, null, null, true, resolve, reject);
        });

        Promise.all([healthFacilityPromise, typePromise]).then(function (resultArray) {
            processFrigPromises(resultArray[0], resultArray[1]);

        }, function(err) {
            console.log('promises failed with error: ' + err);
        });
    });

}


function onMoveRefrigerator() {
    if (!$.isEmptyObject(refrigeratorsResultSet)) {
        var locale = odkCommon.getPreferredLocale();
        var confirmMsg = odkCommon.localizeText(locale, 'are_you_sure_you_want_to_move_this_refrigerator');
        if (confirm(confirmMsg)) {

            var newFac = $('#facility_to_move_to_name');

            var oldFacId = refrigeratorsResultSet.get(util.facilityRowId);
            var newFacId = newFac.attr('data-fac-row-id');

            if (newFacId === null || newFacId === undefined || newFacId === oldFacId) {
                var alertMsg = odkCommon.localizeText(locale, 'move_will_not_be_performed');
                alert(alertMsg);
                return;
            }


            var updateRefrigeratorPromise = new Promise(function(resolve, reject) {
                // Update the refrigerator with new facility id
                var newFacilityMap = {};
                newFacilityMap[util.facilityRowId] = newFacId;
                odkData.updateRow('refrigerators', newFacilityMap, refrigeratorsResultSet.get('_id'), resolve, reject);
            });

            updateRefrigeratorPromise.then(function(result){
                return new Promise (function(resolve, reject) {
                    var defaults = {'refrigerator_id': refrigeratorsResultSet.get('_id')};
                    defaults['move_date'] = odkCommon.toOdkTimeStampFromDate(new Date());
                    defaults['old_facility_id'] = refrigeratorsResultSet.get(util.facilityRowId);
                    defaults['new_facility_id'] = newFacId;
                    defaults['_default_access'] = refrigeratorsResultSet.get('_default_access');
                    defaults['_group_read_only'] = refrigeratorsResultSet.get('_group_read_only');
                    defaults['_group_modify'] = refrigeratorsResultSet.get('_group_modify');
                    defaults['_group_privileged'] = refrigeratorsResultSet.get('_group_privileged');

                    var rowId = util.genUUID();
                    odkData.addRow('refrigerator_moves', defaults, rowId, resolve, reject);
                });
            }).then(function(result){
                console.log('Added a row to refrigerator_moves');
                var alertMsg = odkCommon.localizeText(locale, 'move_performed_successfully');
                alert(alertMsg);
                resumeFunc('init');

            }).catch( function(reason) {
                error = 'onMoveRefrigerator failed: ' + reason;
                console.log(error);
            });
        }
    }
}
