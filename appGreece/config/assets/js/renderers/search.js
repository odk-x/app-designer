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

function start() {
    if (type == 'registrationMember') {
        $('#title').text(odkCommon.localizeText(locale, "search_beneficiaries"));
    } else if (type == 'registration') {
        $('#title').text('household placeholder search title');
    } else {
        $('#title').text(odkCommon.localizeText(locale, "search_deliveries"));
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
    sqlWhereClause = document.getElementById('field').value +' = ?';
    sqlSelectionArgs = document.getElementById('value').value;
    odkData.query(type, sqlWhereClause, [sqlSelectionArgs],
                  null, null, null, null, null, null, null,
                  successCallbackFn, failureCallbackFn);
}

function successCallbackFn(result) {
    var count = result.getCount();
    var label;
    if (type == 'registrationMember') {
        if (count == 1) {
            label = odkCommon.localizeText(locale, "beneficiary");
        } else {
            label = odkCommon.localizeText(locale, "beneficiaries");
        }
    } else if (type == 'registration') {
        if (count == 1) {
            label = 'household placeholder text';
        } else {
            label = 'households placeholder text';
        }
    } else {
        if (count == 1) {
            label = odkCommon.localizeText(locale, "delivery");
        } else {
            label = odkCommon.localizeText(locale, "deliveries");
        }
    }
    $('#search_results').text(count + ' ' + label + ' ' + odkCommon.localizeText(locale, 'found'));
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
    odkTables.openTableToListView(null, type, sqlWhereClause,[sqlSelectionArgs], 'config/tables/' +
                                  type + '/html/' + type + '_list.html');
}

$(window).resize(function() {
    helper('search', search_font, 'font-size');
    windowHeight = $(window).innerHeight();

});

function helper(name, value, attribute) {
    var viewportHeight = $(window).innerHeight();
    if (viewportHeight < windowHeight) {
        console.log('set ' + name + '\'s ' + attribute + ' to ' + value);
        if (attribute == 'height') {
            $('#' + name).css({'height':value});
        } else {
            $('#' + name).css({'font-size':value});
        }
    }
}
