/**
 * Render the search page
 */
'use strict';

var sqlWhereClause = null;
var sqlSelectionArgs = null;
var windowHeight = $(window).innerHeight();
var search_font;
var type = util.getQueryParameter('type');
var locale = odkCommon.getPreferredLocale();
var singularUnitLabel;
var pluralUnitLabel;

function display() {
    $('#launch').text(odkCommon.localizeText(locale, "view"));
    if (type == util.getIndividualCustomFormId()) {
        $('#title').text(odkCommon.localizeText(locale, "search_individuals"));
        singularUnitLabel = odkCommon.localizeText(locale, "beneficiary");
        pluralUnitLabel = odkCommon.localizeText(locale, "beneficiaries");
    } else if (type == util.getBeneficiaryEntityCustomFormId()) {
        if (util.getRegistrationMode() == 'HOUSEHOLD') {
            $('#title').text(odkCommon.localizeText(locale, "search_households"));
            singularUnitLabel = odkCommon.localizeText(locale, "household");
            pluralUnitLabel = odkCommon.localizeText(locale, 'households');
        } else {
            $('#title').text(odkCommon.localizeText(locale, "search_beneficiaries"));
            singularUnitLabel = odkCommon.localizeText(locale, "individual");
            pluralUnitLabel = odkCommon.localizeText(locale, 'individuals');
        }
    } else if (type == util.deliveryTable) {
        $('#title').text(odkCommon.localizeText(locale, "search_deliveries"));
        singularUnitLabel = odkCommon.localizeText(locale, "delivery");
        pluralUnitLabel = odkCommon.localizeText(locale, "deliveries");
    }
    odkData.query(type, null, null, null, null, null, null, null, null, null,
                  populateSuccess, populateFailure);
    search_font = $('#search').css('font-size');
}

function populateSuccess(result) {
    var columns = result.getColumns();
    columns.forEach(addField);
}

function populateFailure(error) {
    console.log('populateFailure with error: ' + error);
}

function addField(item, index) {
    if (item.charAt(0) != '_') {
        $('#field').append($("<option/>").attr("value", item).text(item));
    }
}

function search() {
    sqlWhereClause = document.getElementById('field').value + ' = ?';
    sqlSelectionArgs = document.getElementById('value').value;
    odkData.query(type, sqlWhereClause, [sqlSelectionArgs],
                  null, null, null, null, null, null, null,
                  successCallbackFn, failureCallbackFn);
}

function successCallbackFn(result) {
    var count = result.getCount();

    if (count == 1) {
         $('#search_results').text(count + ' ' + singularUnitLabel + ' ' + odkCommon.localizeText(locale, 'found'));
    } else {
         $('#search_results').text(count + ' ' + pluralUnitLabel + ' ' + odkCommon.localizeText(locale, 'found'));
    }
    if (count > 0) {
        $('#launch').show();
    } else {
        $('#launch').hide();
    }
}

function failureCallbackFn(error) {
    $('#search_results').text(odkCommon.localizeText(locale, "invalid_search"));
    $('#launch').hide();
}


// TODO: figure out what's going on with all these different list views
function launch() {
    if (type === 'registration') {
        odkTables.openTableToListView(null, type, sqlWhereClause,[sqlSelectionArgs], 'config/tables/' +
                                  util.beneficiaryEntityTable + '/html/' + util.beneficiaryEntityTable + '_list.html');
    } else {
        odkTables.openTableToListView(null, type, sqlWhereClause,[sqlSelectionArgs], 'config/tables/' +
                                  util.deliveryTable + '/html/' + util.deliveryTable  + '_list.html');
    }
}
