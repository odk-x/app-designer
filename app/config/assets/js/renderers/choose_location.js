/**
 * Render the choose method page
 */
'use strict';

var registrationTitleToken = 'registration_title';
var locale = odkCommon.getPreferredLocale();
var deptKey = 'department';
var pamKey = 'pam';
var pamUri = odkCommon.getBaseUrl() + 'config/assets/pam.csv';
var defaultPAMChoice = 'Select PAM';
var defaultDeptChoice = 'Select Department';
var continueToken = 'continue';

function display() {

    $('#continue').text(odkCommon.localizeText(locale, continueToken));
    $('#continue').prop('disabled', true).addClass('disabled');
    $('#continue').on('click', function() {

        var selectDept = $('#choose_dept').val();
        var selectPAM = $('#choose_pam').val();
        odkTables.launchHTML(null,
            'config/assets/html/choose_method.html?title='
            + encodeURIComponent(odkCommon.localizeText(locale, registrationTitleToken))
            + '&type=registration&pam=' + encodeURIComponent(selectPAM) + '&dept=' + encodeURIComponent(selectDept));
    });

    $('#title').text(util.getQueryParameter('title'));

    // Add default options
    addOption('#choose_dept', defaultDeptChoice);
    addOption('#choose_pam', defaultPAMChoice);

    verifyDeptPAM();

    // TODO: Persist dept and PAM if they exist

    $('#choose_dept').on('change', function() {
        var dept = $('#choose_dept').val();
        odkCommon.setSessionVariable(deptKey, dept);
        populatePAMDropdown();
    });

    $('#choose_pam').on('change', function() {
        var pam = $('#choose_pam').val();
        odkCommon.setSessionVariable(pamKey, pam);
        verifyDeptPAM();
    });

    populateDeptDropdown();
}

function addOption(id, item) {
    $(id).append($('<option/>').attr('value', item).text(item));
}

function populateDeptDropdown() {
    var ajaxOptions = {
        type: 'GET',
        url: pamUri,
        success: function (result) {
            var depts = $.csv.toObjects(result);
            var uniqueDepts = _.chain(depts).pluck('department').uniq().value();

            $('#choose_dept').empty();

            // Add default option
            addOption('#choose_dept', defaultDeptChoice);
            for (var i = 0; i < uniqueDepts.length; i++) {
                addOption('#choose_dept', uniqueDepts[i]);
            }
        },
        error: dropdownPopulationError,
        async: true
    };
    $.ajax(ajaxOptions);
}

function populatePAMDropdown() {
    var selectDept = $('#choose_dept').val();

    // No need to fetch options for PAM if dept is not valid
    if (selectDept === null || selectDept === undefined || selectDept === defaultDeptChoice ) { return; }

    var ajaxOptions = {
        type: 'GET',
        url: pamUri,
        success: function (result) {
            var pams = $.csv.toObjects(result);
            var filteredPams = _.filter(pams, function(pam) {
                return pam.department === selectDept;
            });

            $('#choose_pam').empty();

            // Add default option
            addOption('#choose_pam', defaultPAMChoice);
            for (var i = 0; i < filteredPams.length; i++) {
                addOption('#choose_pam', filteredPams[i].pam);
            }

            verifyDeptPAM();
        },
        error: dropdownPopulationError,
        async: true
    };
    $.ajax(ajaxOptions);
}

function verifyDeptPAM() {
    var selectDept = $('#choose_dept').val();
    var selectPAM = $('#choose_pam').val();

    if ((selectDept !== null && selectDept !== undefined) &&
        (selectPAM !== null && selectPAM !== undefined) &&
        (selectDept !== defaultDeptChoice && selectPAM !== defaultPAMChoice)) {
        $('#continue').prop('disabled', false).removeClass('disabled');
    } else {
        $('#continue').prop('disabled', true).addClass('disabled');
    }
}

function dropdownPopulationError(e) {
    console.log('Error fetching choices.\n');
    if (e.statusText) {
        console.log(e.statusText);
    }
}
