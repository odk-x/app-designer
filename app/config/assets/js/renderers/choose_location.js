/**
 * Render the choose method page
 */
'use strict';

var registrationTitleToken = 'registration_title';
var locale = odkCommon.getPreferredLocale();
var pamUri = odkCommon.getBaseUrl() + 'config/assets/pam.csv';
var defaultPAMChoice = 'Select PAM';
var defaultDeptChoice = 'Select Department';
var continueToken = 'continue';
var localLocationTable = 'L_location_pam';

function display() {

    $('#continue').text(odkCommon.localizeText(locale, continueToken));
    $('#continue').prop('disabled', true).addClass('disabled');
    $('#continue').on('click', function() {

        var selectDept = $('#choose_dept').val();
        var selectPAM = $('#choose_pam').val();

        return new Promise(function(resolve, reject) {
            // Delete all other rows
            odkData.deleteLocalOnlyRows(localLocationTable, null, null, resolve, reject);
        }).then(function(result) {
            // Insert data for current selections
            var nameValueMap = {};
            util.setJSONMap(nameValueMap, util.departmentParam, selectDept);
            util.setJSONMap(nameValueMap, util.pamParam, selectPAM);
            return new Promise(function(resolve, reject) {
                odkData.insertLocalOnlyRow(localLocationTable, nameValueMap, resolve, reject);
            });
        }).then(function(result) {
            // Finally launch next screen
            odkTables.launchHTML(null,
                'config/assets/html/choose_method.html?title='
                + encodeURIComponent(odkCommon.localizeText(locale, registrationTitleToken))
                + '&type=registration'
                + '&' + util.departmentParam + '=' + encodeURIComponent(selectDept)
                + '&' + util.pamParam + '=' + encodeURIComponent(selectPAM));
        }).catch(function(reason) {
            var errTxt = 'Error while storing department and pam : ' + reason;
            util.displayError(errTxt);
            console.log(errTxt);
        });
    });

    $('#title').text(util.getQueryParameter('title'));

    $('#choose_dept').on('change', function() {
        populatePAMDropdown();
    });

    $('#choose_pam').on('change', function() {
        verifyDeptPAM();
    });

    checkLocalTableForLocationValues();
}

function initialize() {
    // Add default options
    addOption('#choose_dept', defaultDeptChoice);
    addOption('#choose_pam', defaultPAMChoice);

    verifyDeptPAM();

    populateDeptDropdown();
}

function initializeWithValues(deptVal, pamVal) {

    if (isValidDeptPam(deptVal, pamVal) === false) {
        initialize();
        return;
    }

    // Add default options
    addOption('#choose_dept', defaultDeptChoice);
    addOption('#choose_pam', defaultPAMChoice);

    return new Promise(function (resolve, reject) {
        populateDeptDropdown(deptVal, resolve, reject);
    }).then(function (result) {
        return new Promise(function (resolve, reject) {
            populatePAMDropdown(pamVal, resolve, reject);
        });
    }).catch(function(error) {
        var errTxt = 'Error while initializing : ' + reason;
        util.displayError(errTxt);
        console.log(errTxt);
    });
}

function addOption(id, item) {
    $(id).append($('<option/>').attr('value', item).text(item));
}

function populateDeptDropdown(defaultDeptOption, resolve, reject) {
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
                if (uniqueDepts[i] === defaultDeptOption) {
                    $('#choose_dept').val(defaultDeptOption)
                }
            }

            if (resolve !== null && resolve !== undefined && typeof resolve === 'function') {
                resolve(result);
            }
        },
        error: function(error) {
            dropdownPopulationError(error);
            if (reject !== null && reject !== undefined && typeof reject === 'function') {
                reject(error);
            }
        },
        async: true
    };
    $.ajax(ajaxOptions);
}

function populatePAMDropdown(defaultPamOption, resolve, reject) {
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
                if (filteredPams[i].pam === defaultPamOption) {
                    $('#choose_pam').val(defaultPamOption);
                }
            }

            verifyDeptPAM();
            if (resolve !== null && resolve !== undefined && typeof resolve === 'function') {
                resolve(result);
            }
        },
        error: function(error) {
            dropdownPopulationError(error);
            if (reject !== null && reject !== undefined && typeof reject === 'function') {
                reject(error);
            }
        },
        async: true
    };
    $.ajax(ajaxOptions);
}

function verifyDeptPAM() {
    var selectDept = $('#choose_dept').val();
    var selectPAM = $('#choose_pam').val();

    if (isValidDeptPam(selectDept, selectPAM) === true) {
        $('#continue').prop('disabled', false).removeClass('disabled');
    } else {
        $('#continue').prop('disabled', true).addClass('disabled');
    }
}

function isValidDeptPam(deptToVerify, pamToVerify) {
    if ((deptToVerify !== null && deptToVerify !== undefined) &&
        (pamToVerify !== null && pamToVerify !== undefined) &&
        (deptToVerify !== defaultDeptChoice && pamToVerify !== defaultPAMChoice)) {
        return true;
    }

    return false;
}

function dropdownPopulationError(e) {
    var fetchErr = 'Error fetching choices'
    console.log(fetchErr + '\n');
    if (e.statusText) {
        console.log(e.statusText);
    }
}

function checkLocalTableForLocationValues() {

    var createLocalTablePromise = new Promise(function(resolve, reject) {
        var colTypeMap = [];

        var eKey = 'elementKey';
        var eName = 'elementName';
        var eType = 'elementType';
        var listCE = 'listChildElementKeys';

        var col1 = {};
        col1[eKey] = util.departmentParam;
        col1[eName] = util.departmentParam;
        col1[eType] = 'string';
        col1[listCE] = '[]';
        colTypeMap.push(col1);

        var col2 = {};
        col2[eKey] = util.pamParam;
        col2[eName] = util.pamParam;
        col2[eType] = 'string';
        col2[listCE] = '[]';
        colTypeMap.push(col2);

        odkData.createLocalOnlyTableWithColumns(localLocationTable, colTypeMap, resolve, reject);
    });

    createLocalTablePromise.then(function(result){
        // Get the location info if it is available
        return new Promise(function(resolve, reject) {
            odkData.simpleQueryLocalOnlyTables(localLocationTable, null, null, null,
                null, null, null, null, null, resolve, reject);
        });
    }).then(function(result){
        if (result === null || result === undefined) {
            return;
        }

        if (result.getCount() <= 0) {
            // No value in the table - initialize
            console.log('Querying ' + localLocationTable + ' getCount = ' + result.getCount());
            initialize();
        } else if (result.getCount() === 1) {
            // Value found - use that value if valid
            var persistedDept = result.get(util.departmentParam);
            var persistedPam = result.get(util.pamParam);

            initializeWithValues(persistedDept, persistedPam);

        } else if (result.getCount() > 1 ) {
            // More than one value - delete table, re-create table, then initialize
            console.log('More than 1 department and pam found on device ');

            return new Promise(function (resolve, reject) {
                odkData.deleteLocalOnlyRows(localLocationTable, null, null, resolve, reject);
            }).then(function (result) {
                initialize();
            })
        }

    }).catch(function (reason) {
        var errTxt = 'Error while retrieving department and pam from : ' + reason;
        util.displayError(errTxt);
        console.log(errTxt);
    });
}
