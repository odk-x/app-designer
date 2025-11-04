/**
 * The file for displaying detail views of the Health Facilities table.
 */
/* global $, odkTables, util, odkData */
'use strict';

var healthFacilityResultSet = {};

function onFacilitySummaryClick() {
    if (!$.isEmptyObject(healthFacilityResultSet))
    {
        var rowIdQueryParams = util.getKeyToAppendToColdChainURL(util.facilityRowId, healthFacilityResultSet.get('facility_id'));
        odkTables.launchHTML(null,
            'config/tables/health_facilities/html/health_facilities_detail_summary.html' + rowIdQueryParams);
    }
}

function onLinkClick() {
    if (!$.isEmptyObject(healthFacilityResultSet))
    {
        var rowIdQueryParams = util.getKeyToAppendToColdChainURL(util.facilityRowId, healthFacilityResultSet.get('_id'));
        odkTables.launchHTML(null,
            'config/tables/refrigerators/html/refrigerators_list.html' + rowIdQueryParams);
    }
}

function onAddFridgeClick() {
    var jsonMap = {};
    jsonMap.facility_row_id = healthFacilityResultSet.getRowId(0);
	jsonMap._default_access = healthFacilityResultSet.get('_default_access');

    var customGroupReadOnly = healthFacilityResultSet.get('cceGroupReadOnly');
    if (customGroupReadOnly !== null && customGroupReadOnly !== undefined && customGroupReadOnly.length > 0) {
        jsonMap._group_read_only = healthFacilityResultSet.get('cceGroupReadOnly');
    } else {
        jsonMap._group_read_only = healthFacilityResultSet.get('_group_read_only');
    }

    var customGroupModify = healthFacilityResultSet.get('cceGroupModify');
    if (customGroupModify !== null && customGroupModify !== undefined && customGroupModify.length > 0) {
        jsonMap._group_modify = healthFacilityResultSet.get('cceGroupModify');
    } else {
        jsonMap._group_modify = healthFacilityResultSet.get('_group_modify');
    }

    var customGroupPrivileged = healthFacilityResultSet.get('cceGroupPrivileged');
    if (customGroupPrivileged !== null && customGroupPrivileged !== undefined && customGroupPrivileged.length > 0) {
        jsonMap._group_privileged = healthFacilityResultSet.get('cceGroupPrivileged');
    } else {
        jsonMap._group_privileged = healthFacilityResultSet.get('_group_privileged');
    }

    odkTables.addRowWithSurvey(null, 'refrigerators', 'refrigerators', null, jsonMap);
}

function onCRInvClick() {

    if (!$.isEmptyObject(healthFacilityResultSet))
    {
        var rowIdQueryParams = util.getKeyToAppendToColdChainURL(util.facilityRowId, healthFacilityResultSet.get('_id'));
        odkTables.launchHTML(null,
            'config/tables/cold_rooms/html/cold_rooms_list.html' + rowIdQueryParams);
    }
}

function onAddCRClick() {
    var jsonMap = {};
    jsonMap.facility_row_id = healthFacilityResultSet.getRowId(0);
    jsonMap._default_access = healthFacilityResultSet.get('_default_access');

    var customGroupReadOnly = healthFacilityResultSet.get('cceGroupReadOnly');
    if (customGroupReadOnly !== null && customGroupReadOnly !== undefined && customGroupReadOnly.length > 0) {
        jsonMap._group_read_only = healthFacilityResultSet.get('cceGroupReadOnly');
    } else {
        jsonMap._group_read_only = healthFacilityResultSet.get('_group_read_only');
    }

    var customGroupModify = healthFacilityResultSet.get('cceGroupModify');
    if (customGroupModify !== null && customGroupModify !== undefined && customGroupModify.length > 0) {
        jsonMap._group_modify = healthFacilityResultSet.get('cceGroupModify');
    } else {
        jsonMap._group_modify = healthFacilityResultSet.get('_group_modify');
    }

    var customGroupPrivileged = healthFacilityResultSet.get('cceGroupPrivileged');
    if (customGroupPrivileged !== null && customGroupPrivileged !== undefined && customGroupPrivileged.length > 0) {
        jsonMap._group_privileged = healthFacilityResultSet.get('cceGroupPrivileged');
    } else {
        jsonMap._group_privileged = healthFacilityResultSet.get('_group_privileged');
    }

    odkTables.addRowWithSurvey(null, 'cold_rooms', 'cold_rooms', null, jsonMap);
}

function onEditFacility() {
    if (!$.isEmptyObject(healthFacilityResultSet)) {
        odkTables.editRowWithSurvey(null, healthFacilityResultSet.getTableId(), healthFacilityResultSet.getRowId(0), 'health_facilities', null, null);
    }
}

function onDeleteFacility() {
    if (!$.isEmptyObject(healthFacilityResultSet)) {
        var locale = odkCommon.getPreferredLocale();
        var confirmMsg = odkCommon.localizeText(locale, 'are_you_sure_you_want_to_delete_this_facility');
        if (confirm(confirmMsg)) {

            odkData.deleteRow(healthFacilityResultSet.getTableId(),
                null,
                healthFacilityResultSet.getRowId(0),
                cbDeleteSuccess, cbDeleteFailure);
        }
    }
}

function cbDeleteSuccess() {
    console.log('health facility deleted successfully');
    var locale = odkCommon.getPreferredLocale();
    var successMsg = odkCommon.localizeText(locale, 'health_facility_deleted_successfully');
    alert(successMsg);
    odkCommon.closeWindow(-1);
}

function cbDeleteFailure(error) {
    console.log('health facility delete failure CB error : ' + error);
    var locale = odkCommon.getPreferredLocale();
    var failMsg = odkCommon.localizeText(locale, 'deletion_failed');
    alert(failMsg);
    odkCommon.closeWindow(-1);
}

async function cbSuccess(healthFacilityResult) {
    var locale = odkCommon.getPreferredLocale();
    healthFacilityResultSet = healthFacilityResult;

    $('#TITLE').text(healthFacilityResultSet.get('facility_name'));

    $('#facility_id').text(healthFacilityResultSet.get('facility_id'));
    $('#facility_type').text(util.formatDisplayText(healthFacilityResultSet.get('facility_type')));
    $('#contact_name').text(healthFacilityResultSet.get('contact_name'));
    $('#contact_phone_number').text(healthFacilityResultSet.get('contact_phone_number'));
    $('#catchment_population').text(healthFacilityResultSet.get('catchment_population'));
    $('#facility_ownership').text(util.formatDisplayText(healthFacilityResultSet.get('facility_ownership')));

    var linkedRegionId = healthFacilityResultSet.get('admin_region_id');
    $('#admin_region').text(linkedRegionId);

    // Get the breadcrumb
    if (linkedRegionId !== null && linkedRegionId !== undefined) {
        var breadcrumbName = await util.getBreadcrumbRegionName(locale, linkedRegionId);
        if (breadcrumbName !== null && breadcrumbName !== undefined) {
            var bcHdr = $('#breadcrumbHeader');
            bcHdr.text(breadcrumbName);
        }
    }

    $('#electricity_source').text(util.formatDisplayText(healthFacilityResultSet.get('electricity_source')));

    $('#grid_availability').text(util.formatDisplayText(
        healthFacilityResultSet.get('grid_power_availability')) + ' ' +
        odkCommon.localizeText(locale, "hours_per_day"));

    $('#fuel_availability').text(util.formatDisplayText(healthFacilityResultSet.get('fuel_availability')));

    // The latitude and longitude are stored in a single column as GeoPoint.
    // We need to extract the lat/lon from the GeoPoint.
    var lat = healthFacilityResultSet.get('Location.latitude');
    var lon = healthFacilityResultSet.get('Location.longitude');
    $('#lat').text(lat);
    $('#lon').text(lon);

    $('#distance_to_supply').text(healthFacilityResultSet.get('distance_to_supply') + ' ' +
        odkCommon.localizeText(locale, "km"));

    $('#supply_interval').text(healthFacilityResultSet.get('vaccine_supply_interval')  + ' ' +
        odkCommon.localizeText(locale, "weeks"));

    $('#supply_mode').text(util.formatDisplayText(
        healthFacilityResultSet.get('vaccine_supply_mode')));
		
	var access = healthFacilityResultSet.get('_effective_access');

    if (access.indexOf('w') !== -1) {
        var editButton = $('#editFacilityBtn');
        editButton.removeClass('hideButton');
    }

    if (access.indexOf('d') !== -1) {
        var deleteButton = $('#delFacilityBtn');
        deleteButton.removeClass('hideButton');
    }

    var refrigeratorCountPromise = new Promise(function(resolve, reject) {
        var frigCntQuery = 'SELECT COUNT(*) AS refrigerator_cnt FROM refrigerators ' +
            'WHERE refrigerators.facility_row_id = ? AND refrigerators._sync_state != ?';
        var frigCntParams = [healthFacilityResultSet.get('_id'), util.deletedSyncState];
        odkData.arbitraryQuery('refrigerators', frigCntQuery, frigCntParams, null, null, resolve, reject);
    });

    var coldRoomCountPromise = new Promise(function(resolve, reject) {
        var crCntQuery = 'SELECT COUNT(*) AS cold_room_cnt FROM cold_rooms ' +
            'WHERE cold_rooms.facility_row_id = ? AND cold_rooms._sync_state != ?';
        var crCntParams = [healthFacilityResultSet.get('_id'), util.deletedSyncState];
        odkData.arbitraryQuery('cold_rooms', crCntQuery, crCntParams, null, null, resolve, reject);
    });


    Promise.all([refrigeratorCountPromise, coldRoomCountPromise]).then(function (resultArray) {
        refrigeratorsCBSuccess(resultArray[0], resultArray[1]);
    }, function(err) {
        console.log('promises failed with error: ' + err);
    });


}

function cbFailure(error) {

    console.log('health_facilities_detail getViewData CB error : ' + error);
}

function display() {
    var locale = odkCommon.getPreferredLocale();
    $('#basic-facility-information').text(odkCommon.localizeText(locale, "basic_facility_information"));
    $('#health-fac-id').text(odkCommon.localizeText(locale, "health_facility_id"));
    $('#fac-type').text(odkCommon.localizeText(locale, "facility_type"));
    $('#con-name').text(odkCommon.localizeText(locale, "contact_name"));
    $('#con-ph-num').text(odkCommon.localizeText(locale, "contact_phone_number"));
    $('#catch-pop').text(odkCommon.localizeText(locale, "catchment_population"));
    $('#ownership').text(odkCommon.localizeText(locale, "ownership"));
    $('#admin-reg').text(odkCommon.localizeText(locale, "admin_region"));

    $('#power-information').text(odkCommon.localizeText(locale, "power_information"));
    $('#elec-source').text(odkCommon.localizeText(locale, "electricity_source"));
    $('#grid-avail').text(odkCommon.localizeText(locale, "grid_availability"));
    $('#fuel-avail').text(odkCommon.localizeText(locale, "gas_cylinder_availability"));

    $('#loc-info').text(odkCommon.localizeText(locale, "location_information"));
    $('#lat-gps').text(odkCommon.localizeText(locale, "latitude_gps"));
    $('#long-gps').text(odkCommon.localizeText(locale, "longitude_gps"));

    $('#stk-info').text(odkCommon.localizeText(locale, "stock_information"));
    $('#dist-to-sup-pt').text(odkCommon.localizeText(locale, "distance_to_supply_point"));
    $('#vac-sup-interval').text(odkCommon.localizeText(locale, "vaccine_supply_interval"));
    $('#vac-sup-mode').text(odkCommon.localizeText(locale, "vaccine_supply_mode"));

    // var facId = util.getQueryParameter(util.facilityRowId);
	//console.log(facId);
    //odkData.query('health_facilities', '_id = ?', [facId], null, null, null, null, null, null, true,
     //   cbSuccess, cbFailure);
    odkData.getViewData(cbSuccess, cbFailure);
}

async function refrigeratorsCBSuccess(frigCntResultSet, crCntResultSet) {

    $('#TITLE').text(healthFacilityResultSet.get('facility_name'));

    // Get the breadcrumb
    var linkedRegionId = healthFacilityResultSet.get('admin_region_id');
    if (linkedRegionId !== null && linkedRegionId !== undefined) {
        var locale = odkCommon.getPreferredLocale();
        var breadcrumbName = await util.getBreadcrumbRegionName(locale, linkedRegionId);
        if (breadcrumbName !== null && breadcrumbName !== undefined) {
            var bcHdr = $('#breadcrumbHeader');
            bcHdr.text(breadcrumbName);
        }
    }

    if (frigCntResultSet.getCount() > 0) {
        $('#fridge_list').text(frigCntResultSet.getData(0, 'refrigerator_cnt'));
    }

    if (crCntResultSet.getCount() > 0) {
        $('#cold_room_list').text(crCntResultSet.getData(0, 'cold_room_cnt'));
    }

}