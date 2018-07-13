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
var targetTable;
var options = [];

function display() {
    $('#launch').text(odkCommon.localizeText(locale, 'view'));

    var renderPromises = [];

    if (type === util.getMemberCustomFormId()) {

        baseTable = util.membersTable;
        customTable = util.getMemberCustomFormId();
        customForeignKey = 'custom_member_row_id';

        $('#title').text(odkCommon.localizeText(locale, 'search_members'));
        singularUnitLabel = odkCommon.localizeText(locale, 'member');
        pluralUnitLabel = odkCommon.localizeText(locale, 'members');
        renderPromises.push(getSearchOptions(type, false, []));
        renderPromises.push(getSearchOptions(util.membersTable, true, []));

    } else if (type === util.getBeneficiaryEntityCustomFormId()) {

        baseTable = util.beneficiaryEntityTable;
        customTable = util.getBeneficiaryEntityCustomFormId();
        customForeignKey = 'custom_beneficiary_entity_row_id';

        if (util.getRegistrationMode() === 'HOUSEHOLD') {
            $('#title').text(odkCommon.localizeText(locale, 'search_households'));
            singularUnitLabel = odkCommon.localizeText(locale, 'household');
            pluralUnitLabel = odkCommon.localizeText(locale, 'households');
        } else {
            $('#title').text(odkCommon.localizeText(locale, 'search_beneficiaries'));
            singularUnitLabel = odkCommon.localizeText(locale, 'beneficiary');
            pluralUnitLabel = odkCommon.localizeText(locale, 'beneficiaries');
        }

        renderPromises.push(getSearchOptions(type, false, []));
        renderPromises.push(getSearchOptions(util.beneficiaryEntityTable, true, []));
        options.push('Household Size');

    } else if (type === util.deliveryTable) {
        baseTable = util.deliveryTable;

        $('#title').text(odkCommon.localizeText(locale, 'search_deliveries'));

        if (util.getWorkflowMode() === util.workflow.none) {
            renderPromises.push(getSearchOptions(type, true, ['authorization_description', 'authorization_id',
             'authorization_type', 'custom_delivery_form_id', 'custom_delivery_row_id', 'entitlement_id', 'is_override',
              'item_pack_description', 'item_pack_id', 'item_pack_name', 'member_id']));
        } else {
            renderPromises.push(getSearchOptions(type, true, []));
        }

        singularUnitLabel = odkCommon.localizeText(locale, 'delivery');
        pluralUnitLabel = odkCommon.localizeText(locale, 'deliveries');
    }

    return Promise.all(renderPromises)
        .then(function(results) {
            options.sort(function(a, b){
                var alc = a.toLowerCase(), blc = b.toLowerCase();
                return alc > blc ? 1 : alc < blc ? -1 : 0;
            });
            options.forEach(addField);
        });
}

function getSearchOptions(tableId, isBaseTable, exclusionList) {
    return new Promise( function(resolve, reject) {
        odkData.query(tableId, null, null, null, null, null, null, null, null, null,
            resolve, reject);
    }).then( function(result) {
        var columns = result.getColumns().filter( function( el ) {
            return exclusionList.indexOf( el ) < 0;
        } );

        if (isBaseTable) {
            baseTableColumns = columns;
        } else {
            customTableColumns = columns;
        }
        options = options.concat(columns);
    });
}

function addField(item) {
    if (item.charAt(0) !== '_') {
        var displayText = odkCommon.localizeText(locale, item);
        if (displayText === undefined || displayText === null) {
            displayText = item;
        }
        $('#field').append($('<option/>').attr('value', item).text(displayText));
    }
}

function search() {

    key = document.getElementById('field').value;
    value = document.getElementById('value').value;

    if (baseTableColumns.includes(key)) {
        targetTable = baseTable;
        var activeQuery = 'SELECT * FROM ' + targetTable + ' WHERE ' + key + ' = ?';
    } else if (customTableColumns.includes(key)) {
        targetTable = customTable;
        activeQuery = 'SELECT * FROM ' + targetTable + ' WHERE ' + key + ' = ?';
    } else if (key === 'Household Size') {
        value = parseInt(value);
        targetTable = baseTable;
        activeQuery = 'SELECT * FROM ' + util.beneficiaryEntityTable + ' ben, '  + util.membersTable +
            ' mem WHERE ben._id = mem.beneficiary_entity_row_id ' +
            'GROUP BY ben._id ' +
            'HAVING count(*) = ?';
    } else {
        searchFailure(null);
        return;
    }
    odkData.arbitraryQuery(targetTable, activeQuery, [value],
        null, null, searchSuccess, searchFailure);
}

function searchSuccess(result) {
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

function searchFailure(error) {
    console.log(error);
    $('#search_results').text(odkCommon.localizeText(locale, 'invalid_search'));
    $('#launch').hide();
}

function launch() {
    if (type === util.getMemberCustomFormId() || type === util.getBeneficiaryEntityCustomFormId()) {
        var joinQuery;
        if (key == 'Household Size') {
            joinQuery = 'SELECT * FROM ' + util.beneficiaryEntityTable + ' base, '  + util.membersTable +
                ' mem INNER JOIN '  + customTable + ' custom ON base.' + customForeignKey +
                ' = custom._id WHERE base._id = mem.beneficiary_entity_row_id ' +
                'GROUP BY base._id ' +
                'HAVING count(*) = ?';
        } else {
            var whereClauseTableLabel;
            if (baseTableColumns.includes(key)) {
                whereClauseTableLabel = 'base';
            } else if (customTableColumns.includes(key)) {
                whereClauseTableLabel = 'custom';
            }

            joinQuery = 'SELECT * FROM ' + baseTable + ' base INNER JOIN ' + customTable +
                ' custom ON base.' + customForeignKey + ' = custom._id WHERE ' + whereClauseTableLabel + '.' + key + ' = ?';

        }

        var url = 'config/tables/' + baseTable + '/html/' + baseTable + '_list.html';
        if (type === util.getBeneficiaryEntityCustomFormId()) {
            url += '?type=delivery';
        } else {
            url += '?type=search';
        }

        odkTables.openTableToListViewArbitraryQuery(null, baseTable, joinQuery, [value], url);

    } else if (type === util.deliveryTable) {
        odkTables.openTableToListView(null, type, key + ' = ?',[value], 'config/tables/' +
                                  util.deliveryTable + '/html/' + util.deliveryTable  + '_list.html');
    }
}
