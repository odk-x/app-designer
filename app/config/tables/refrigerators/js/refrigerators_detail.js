/**
 * The file for displaying the detail view of the refrigerator inventory table.
 */
/* global $, odkData, odkCommon, odkTables, data, util */
'use strict';

var refrigeratorsResultSet = {};
var typeData = {};
var facilityData = {};


function processFrigPromises(facilityResult, typeResult, logResult) {
    facilityData = facilityResult;
    typeData = typeResult;

    util.showIdForDetail('#refrigerator_id', '_id', refrigeratorsResultSet, false);
    util.showIdForDetail('#facility_name', 'facility_name', facilityData, false);
    util.showIdForDetail('#model_id', 'catalog_id', typeData, false);
    util.showIdForDetail('#tracking_id', 'tracking_id', refrigeratorsResultSet, false);
    util.showIdForDetail('#install_year', 'year', refrigeratorsResultSet, false);
    util.showIdForDetail('#functional_status', 'functional_status', refrigeratorsResultSet, true);
    util.showIdForDetail('#reason_not_working', 'reason_not_working', refrigeratorsResultSet, true);
    util.showIdForDetail('#voltage_regulator', 'voltage_regulator', refrigeratorsResultSet, true);
    util.showIdForDetail('#maintenance_priority', 'maintenance_priority', refrigeratorsResultSet, true);
    util.showIdForDetail('#date_serviced', 'date_serviced', logResult, true);
}

function cbSuccess(result) {
    refrigeratorsResultSet = result;

     var access = refrigeratorsResultSet.get('_effective_access');

    if (access.indexOf('w') !== -1) {
        var editButton = $('#editFrigBtn');
        editButton.removeClass('hideButton');

        var editStatusButton = $('#editFrigStatusBtn');
        editStatusButton.removeClass('hideButton');
    }

    if (access.indexOf('d') !== -1) {
        var deleteButton = $('#delFrigBtn');
        deleteButton.removeClass('hideButton');
    }

    var healthFacilityPromise = new Promise(function(resolve, reject) {
        odkData.query('health_facilities', '_id = ?', [refrigeratorsResultSet.get('facility_row_id')],
            null, null, null, null, null, null, true, resolve, reject);
    });

    var typePromise = new Promise(function(resolve, reject) {
        odkData.query('refrigerator_types', '_id = ?', [refrigeratorsResultSet.get('model_row_id')],
            null, null, null, null, null, null, true, resolve, reject);
    });

    var logPromise = new Promise(function(resolve, reject) {
        var logQuery = 'SELECT * FROM maintenance_logs WHERE maintenance_logs.refrigerator_id = ? ' +
            'AND maintenance_logs._savepoint_type != ? ORDER BY date_serviced DESC';
        var logParams = [refrigeratorsResultSet.get('_id'), 'INCOMPLETE'];
        odkData.arbitraryQuery('maintenance_logs', logQuery, logParams, null, null, resolve, reject);
    });

    Promise.all([healthFacilityPromise, typePromise, logPromise]).then(function (resultArray) {
        processFrigPromises(resultArray[0], resultArray[1], resultArray[2]);

    }, function(err) {
        console.log('promises failed with error: ' + err);
    });
}

function cbFailure(error) {
    console.log('cbFailure: getViewData failed with message: ' + error);
}

function cbDeleteSuccess() {
    console.log('cbDeleteSuccess: successfully deleted row');
}

function cbDeleteFailure(error) {
    console.log('cbDeleteFailure: deleteRow failed with message: ' + error);
}

function display() {
    var locale = odkCommon.getPreferredLocale();
    $('#frig-hdr').text(odkCommon.localizeText(locale, "refrigerator"));
    $('#basic-frig-info').text(odkCommon.localizeText(locale, "basic_refrigerator_information"));
    $('#fac').text(odkCommon.localizeText(locale, "facility"));
    $('#yr-install').text(odkCommon.localizeText(locale, "year_installed"));
    $('#stat').text(odkCommon.localizeText(locale, "status"));
    $('#rsn-not-work').text(odkCommon.localizeText(locale, "reason_not_working"));
    $('#srv-pri').text(odkCommon.localizeText(locale, "service_priority"));
    $('#mdl-id').text(odkCommon.localizeText(locale, "model_id"));
    $('#frig-id').text(odkCommon.localizeText(locale, "refrigerator_id"));
    $('#volt-reg').text(odkCommon.localizeText(locale, "voltage_regulator"));
    $('#date-srv').text(odkCommon.localizeText(locale, "date_serviced"));

    $('#vw-mdl-info').text(odkCommon.localizeText(locale, "view_model_information"));
    $('#vw-fac-info').text(odkCommon.localizeText(locale, "view_facility_information"));
    $('#add-mnt-rec').text(odkCommon.localizeText(locale, "add_maintenance_record"));
    $('#vw-all-mnt-rec').text(odkCommon.localizeText(locale, "view_all_maintenance_records"));
    $('#ed-frig-stat').text(odkCommon.localizeText(locale, "edit_refrigerator_status"));
    $('#ed-frig').text(odkCommon.localizeText(locale, "edit_refrigerator"));
    $('#del-frig').text(odkCommon.localizeText(locale, "delete_refrigerator"));
    $('#add-sent-survey').text(odkCommon.localizeText(locale, "add_sentinel_survey"));
    $('#vw-sent-survey').text(odkCommon.localizeText(locale, "view_sentinel_survey"))

    odkData.getViewData(cbSuccess, cbFailure);
}

function onLinkClickModel() {
    if (!$.isEmptyObject(typeData)) {

        odkTables.openDetailView(null,
            'refrigerator_types',
            typeData.getRowId(0),
            'config/tables/refrigerator_types/html/refrigerator_types_detail.html');
    }
}

function onLinkClickFacility() {
    if (!$.isEmptyObject(facilityData)) {

        odkTables.openDetailView(null,
            'health_facilities',
            facilityData.getRowId(0),
            'config/tables/health_facilities/html/health_facilities_detail.html');
    }
}

function onEditFrig() {
    if (!$.isEmptyObject(refrigeratorsResultSet)) {
        odkTables.editRowWithSurvey(null, refrigeratorsResultSet.getTableId(), refrigeratorsResultSet.getRowId(0), 'refrigerators', null, null);
    }
}

function onEditFrigStatus() {
    if (!$.isEmptyObject(refrigeratorsResultSet)) {
        odkTables.editRowWithSurvey(null, refrigeratorsResultSet.getTableId(), refrigeratorsResultSet.getRowId(0), 'refrigerator_status', null, null);
    }
}

function onDeleteFrig() {
    if (!$.isEmptyObject(refrigeratorsResultSet)) {

        if (confirm('Are you sure you want to delete this refrigerator?')) {

            odkData.deleteRow(
                'refrigerators',
                null,
                refrigeratorsResultSet.getRowId(0),
                cbDeleteSuccess, cbDeleteFailure);
        }
    }
}

function onClickAddMntRec() {
    if (!$.isEmptyObject(refrigeratorsResultSet)) {

		var defaults = {'refrigerator_id': refrigeratorsResultSet.get('_id'), 'date_serviced': odkCommon.toOdkTimeStampFromDate(new Date())};
		defaults['_default_access'] = refrigeratorsResultSet.get('_default_access');
		defaults['_group_read_only'] = refrigeratorsResultSet.get('_group_read_only');
		defaults['_group_modify'] = refrigeratorsResultSet.get('_group_modify');
		defaults['_group_privileged'] = refrigeratorsResultSet.get('_group_privileged');

        odkTables.addRowWithSurvey(null, 'maintenance_logs', 'maintenance_logs', null, defaults);
    }
}

function onClickViewAllMntRecs() {
    if (!$.isEmptyObject(refrigeratorsResultSet)) {

        var keyToAppend = 'maintenance_logs.refrigerator_id';

        var frigIdQueryParams = util.getKeyToAppendToColdChainURL(keyToAppend, refrigeratorsResultSet.get('_id'));
        odkTables.launchHTML(null,
            'config/tables/maintenance_logs/html/maintenance_logs_list.html' + frigIdQueryParams);
    }
}

function onClickSentinelSurvey() {
    if (!$.isEmptyObject(refrigeratorsResultSet)) {

        var defaults = {'refrigerator_id': refrigeratorsResultSet.get('_id'),
            'reporting_period': odkCommon.toOdkTimeStampFromDate(new Date())};
        defaults['voltage_stabilizer_present'] = refrigeratorsResultSet.get('voltage_regulator');
        defaults['year_installed'] = refrigeratorsResultSet.get('year');
        defaults['_default_access'] = refrigeratorsResultSet.get('_default_access');
        defaults['_group_read_only'] = refrigeratorsResultSet.get('_group_read_only');
        defaults['_group_modify'] = refrigeratorsResultSet.get('_group_modify');
        defaults['_group_privileged'] = refrigeratorsResultSet.get('_group_privileged');

        odkTables.addRowWithSurvey(null, 'indicators', 'indicators', null, defaults);
    }
}

function onClickViewSentinelSurvey() {
    if (!$.isEmptyObject(refrigeratorsResultSet)) {

        var keyToAppend = 'indicators.refrigerator_id';

        var frigIdQueryParams = util.getKeyToAppendToColdChainURL(keyToAppend, refrigeratorsResultSet.get('_id'));
        odkTables.launchHTML(null,
            'config/tables/indicators/html/indicators_list.html' + frigIdQueryParams);
    }
}
