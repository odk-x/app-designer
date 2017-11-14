/**
 * Render the search page
 */
'use strict';

var baseTableColumns;
var customTableColumns;
var baseTable;
var customTable;
var customForeignKey;
var key = null;
var value = null;
var type = util.getQueryParameter('type');
var locale = odkCommon.getPreferredLocale();
var singularUnitLabel;
var pluralUnitLabel;

function display() {
    $('#launch').text(odkCommon.localizeText(locale, "view"));

    let renderPromises = [];

    if (type == util.getMemberCustomFormId()) {

        baseTable = util.membersTable;
        customTable = util.getMemberCustomFormId();
        customForeignKey = 'custom_member_row_id';

        $('#title').text(odkCommon.localizeText(locale, "search_individuals"));
        singularUnitLabel = odkCommon.localizeText(locale, "beneficiary");
        pluralUnitLabel = odkCommon.localizeText(locale, "beneficiaries");
        renderPromises.push(populateSearchItems(type, false));
        renderPromises.push(populateSearchItems(util.membersTable, true));

    } else if (type == util.getBeneficiaryEntityCustomFormId()) {

        baseTable = util.beneficiaryEntityTable;
        customTable = util.getBeneficiaryEntityCustomFormId();
        customForeignKey = 'custom_beneficiary_entity_row_id';

        if (util.getRegistrationMode() == 'HOUSEHOLD') {
            $('#title').text(odkCommon.localizeText(locale, "search_households"));
            singularUnitLabel = odkCommon.localizeText(locale, "household");
            pluralUnitLabel = odkCommon.localizeText(locale, 'households');
        } else {
            $('#title').text(odkCommon.localizeText(locale, "search_beneficiaries"));
            singularUnitLabel = odkCommon.localizeText(locale, "individual");
            pluralUnitLabel = odkCommon.localizeText(locale, 'individuals');
        }

        renderPromises.push(populateSearchItems(type, false));
        renderPromises.push(populateSearchItems(util.beneficiaryEntityTable, true));

    } else if (type == util.deliveryTable) {
        baseTable = util.deliveryTable;

        $('#title').text(odkCommon.localizeText(locale, "search_deliveries"));

        renderPromises.push(populateSearchItems(type, true));

        singularUnitLabel = odkCommon.localizeText(locale, "delivery");
        pluralUnitLabel = odkCommon.localizeText(locale, "deliveries");
    }

    return Promise.all(renderPromises);
}

function populateSearchItems(tableId, isBaseTable) {
    return new Promise( function(resolve, reject) {
        odkData.query(tableId, null, null, null, null, null, null, null, null, null,
            resolve, reject);
    }).then( function(result) {
        var columns = result.getColumns();
        if (isBaseTable) {
            baseTableColumns = columns;
        } else {
            customTableColumns = columns;
        }
        columns.forEach(addField);
    });
}

function addField(item, index) {
    if (item.charAt(0) !== '_') {
        $('#field').append($("<option/>").attr("value", item).text(item));
    }
}

function search() {

    key = document.getElementById('field').value;
    value = document.getElementById('value').value;

    let targetTable;
    if (baseTableColumns.includes(key)) {
        targetTable = baseTable;
    } else if (customTableColumns.includes(key)) {
        targetTable = customTable;
    } else {
        failureCallbackFn(null);
        return;
    }

    odkData.query(targetTable, key + ' = ?', [value],
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


function launch() {
    if (type === util.getMemberCustomFormId() || type === util.getBeneficiaryEntityCustomFormId()) {
        let whereClauseTableLabel;
        if (baseTableColumns.includes(key)) {
            whereClauseTableLabel = 'base';
        } else if (customTableColumns.includes(key)) {
            whereClauseTableLabel = 'custom';
        }

        let joinQuery = 'SELECT * FROM ' + baseTable + ' base INNER JOIN ' + customTable +
            ' custom ON base.' + customForeignKey + ' = custom._id WHERE ' + whereClauseTableLabel + '.' + key + ' = ?';

        let url = 'config/tables/' + baseTable + '/html/' + baseTable + '_list.html';
        if (type === util.getBeneficiaryEntityCustomFormId()) {
            url += '?type=delivery';
        }

        odkTables.openTableToListViewArbitraryQuery(null, baseTable, joinQuery, [value], url);

    } else if (type === util.deliveryTable) {
        odkTables.openTableToListView(null, type, key + ' = ?',[value], 'config/tables/' +
                                  util.deliveryTable + '/html/' + util.deliveryTable  + '_list.html');
    }
}
