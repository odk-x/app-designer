/**
 * The file for displaying the detail view of the refrigerator inventory table.
 */
/* global $, odkData, odkCommon, odkTables, data, util */
'use strict';

var coldRoomsResultSet = {};
var facilityData = {};


function processCRPromises(facilityResult, logResult) {
    facilityData = facilityResult;

    util.showIdForDetail('#cold_room_id', '_id', coldRoomsResultSet, false);
    util.showIdForDetail('#facility_name', 'facility_name', facilityData, false);
    util.showIdForDetail('#model_id', 'model', coldRoomsResultSet, false);
    util.showIdForDetail('#tracking_id', 'tracking_id', coldRoomsResultSet, false);
    util.showIdForDetail('#install_year', 'year', coldRoomsResultSet, false);
    util.showIdForDetail('#functional_status', 'functional_status', coldRoomsResultSet, true);
    util.showIdForDetail('#reason_not_working', 'reason_not_working', coldRoomsResultSet, true);
    util.showIdForDetail('#maintenance_priority', 'maintenance_priority', coldRoomsResultSet, true);
    util.showIdForDetail('#date_serviced', 'date_serviced', logResult, true);
}

function cbSuccess(result) {
    coldRoomsResultSet = result;

     var access = coldRoomsResultSet.get('_effective_access');

    if (access.indexOf('w') !== -1) {
        var editButton = $('#editCRBtn');
        editButton.removeClass('hideButton');

        var editStatusButton = $('#editCRStatusBtn');
        editStatusButton.removeClass('hideButton');
    }

    if (access.indexOf('d') !== -1) {
        var deleteButton = $('#delCRBtn');
        deleteButton.removeClass('hideButton');
    }

    var healthFacilityPromise = new Promise(function(resolve, reject) {
        odkData.query('health_facilities', '_id = ?', [coldRoomsResultSet.get('facility_row_id')],
            null, null, null, null, null, null, true, resolve, reject);
    });

    var logPromise = new Promise(function(resolve, reject) {
        var logQuery = 'SELECT * FROM cold_room_maintenance_logs WHERE cold_room_maintenance_logs.cold_room_id = ? ' +
            'AND cold_room_maintenance_logs._savepoint_type != ? AND cold_room_maintenance_logs._sync_state != ? ' +
            'ORDER BY date_serviced DESC';
        var logParams = [coldRoomsResultSet.get('_id'), 'INCOMPLETE', util.deletedSyncState];
        odkData.arbitraryQuery('cold_room_maintenance_logs', logQuery, logParams, null, null, resolve, reject);
    });

    Promise.all([healthFacilityPromise, logPromise]).then(function (resultArray) {
        processCRPromises(resultArray[0], resultArray[1]);

    }, function(err) {
        console.log('promises failed with error: ' + err);
    });
}

function cbFailure(error) {
    console.log('cbFailure: getViewData failed with message: ' + error);
}

function cbDeleteSuccess() {
    console.log('cbDeleteSuccess: successfully deleted row');
    var locale = odkCommon.getPreferredLocale();
    var successMsg = odkCommon.localizeText(locale, 'cold_room_deleted_successfully');
    alert(successMsg);
    odkCommon.closeWindow(-1);
}

function cbDeleteFailure(error) {
    console.log('cbDeleteFailure: deleteRow failed with message: ' + error);
    var locale = odkCommon.getPreferredLocale();
    var failMsg = odkCommon.localizeText(locale, 'deletion_failed');
    alert(failMsg);
    odkCommon.closeWindow(-1);
}

function display() {
    var locale = odkCommon.getPreferredLocale();
    $('#cold-hdr').text(odkCommon.localizeText(locale, "cold_room"));
    $('#basic-cr-info').text(odkCommon.localizeText(locale, "basic_cold_room_information"));
    $('#fac').text(odkCommon.localizeText(locale, "facility"));
    $('#yr-install').text(odkCommon.localizeText(locale, "year_installed"));
    $('#stat').text(odkCommon.localizeText(locale, "status"));
    $('#rsn-not-work').text(odkCommon.localizeText(locale, "reason_not_working"));
    $('#srv-pri').text(odkCommon.localizeText(locale, "service_priority"));
    $('#mdl-id').text(odkCommon.localizeText(locale, "model_id"));
    $('#cold-id').text(odkCommon.localizeText(locale, "cold_room_id"));
    $('#date-srv').text(odkCommon.localizeText(locale, "date_serviced"));

    $('#vw-fac-info').text(odkCommon.localizeText(locale, "view_facility_information"));
    $('#add-mnt-rec').text(odkCommon.localizeText(locale, "add_maintenance_record"));
    $('#vw-all-mnt-rec').text(odkCommon.localizeText(locale, "view_all_maintenance_records"));
    $('#ed-cr-stat').text(odkCommon.localizeText(locale, "edit_cold_room_status"));
    $('#ed-cr').text(odkCommon.localizeText(locale, "edit_cold_room"));
    $('#del-cr').text(odkCommon.localizeText(locale, "delete_cold_room"));

    odkData.getViewData(cbSuccess, cbFailure);
}

function onLinkClickFacility() {
    if (!$.isEmptyObject(facilityData)) {

        odkTables.openDetailView(null,
            'health_facilities',
            facilityData.getRowId(0),
            'config/tables/health_facilities/html/health_facilities_detail.html');
    }
}

function onEditCR() {
    if (!$.isEmptyObject(coldRoomsResultSet)) {
        odkTables.editRowWithSurvey(null, coldRoomsResultSet.getTableId(), coldRoomsResultSet.getRowId(0), 'cold_rooms', null, null);
    }
}

function onEditCRStatus() {
    if (!$.isEmptyObject(coldRoomsResultSet)) {
        odkTables.editRowWithSurvey(null, coldRoomsResultSet.getTableId(), coldRoomsResultSet.getRowId(0), 'cold_room_status', null, null);
    }
}

function onDeleteCR() {
    if (!$.isEmptyObject(coldRoomsResultSet)) {

        var locale = odkCommon.getPreferredLocale();
        var confirmMsg = odkCommon.localizeText(locale, 'are_you_sure_you_want_to_delete_this_cold_room');

        if (confirm(confirmMsg)) {

            odkData.deleteRow(
                'cold_rooms',
                null,
                coldRoomsResultSet.getRowId(0),
                cbDeleteSuccess, cbDeleteFailure);
        }
    }
}

function onClickAddMntRec() {
    if (!$.isEmptyObject(coldRoomsResultSet)) {

		var defaults = {'cold_room_id': coldRoomsResultSet.get('_id'), 'date_serviced': odkCommon.toOdkTimeStampFromDate(new Date())};
		defaults['_default_access'] = coldRoomsResultSet.get('_default_access');
		defaults['_group_read_only'] = coldRoomsResultSet.get('_group_read_only');
		defaults['_group_modify'] = coldRoomsResultSet.get('_group_modify');
		defaults['_group_privileged'] = coldRoomsResultSet.get('_group_privileged');

        odkTables.addRowWithSurvey(null, 'cold_room_maintenance_logs', 'cold_room_maintenance_logs', null, defaults);
    }
}

function onClickViewAllMntRecs() {
    if (!$.isEmptyObject(coldRoomsResultSet)) {

        var keyToAppend = 'cold_room_maintenance_logs.cold_room_id';

        var crIdQueryParams = util.getKeyToAppendToColdChainURL(keyToAppend, coldRoomsResultSet.get('_id'));
        odkTables.launchHTML(null,
            'config/tables/cold_room_maintenance_logs/html/cold_room_maintenance_logs_list.html' + crIdQueryParams);
    }
}
