'use strict';
/* global odkTables, odkCommon, odkData, util */

var adminType = 'admin';
var adminValue = 'Administrator Options';
var locale = null;
var supervisorGroup = 'GROUP_SUPERVISOR';
var workerGroup = 'GROUP_WORKER';
var administratorGroup = 'ROLE_ADMINISTER_TABLES';
var adminGroup = 'GROUP_ADMIN';
var GROUP_REGION_ = 'GROUP_REGION_';
var maxLevelValue;
var VIEW_HEALTH_FACILITIES_REFRIGERATORS = 'View Health Facilities/Refrigerators';
var nextLevel = null;
var currAdminRegion = null;
var currAdminRegionId = null;

function addMenuButton(type, label, divToAddButtonTo, currAdminRegion, currAdminRegionId, nextLevel) {
    var button = $('<button>');
    button.attr('class', 'button');
    button.text(label);
    if (type === util.linkedAdminRegion) {
        button.on('click', function () {
            var urlParams = util.getKeysToAppendToColdChainMenuURL(maxLevelValue, currAdminRegion,
                currAdminRegionId);
            odkTables.launchHTML(null, 'config/assets/linkedAdminRegion.html' + urlParams);
        });
    } else if (type === util.adminRegion) {
        button.on('click', function () {
            var urlParams = util.getKeysToAppendToColdChainMenuURL(maxLevelValue, currAdminRegion,
                currAdminRegionId, nextLevel);
            odkTables.launchHTML(null, 'config/assets/index.html' + urlParams);
        });
    } else {
        // Admin options
        button.on('click', function () {
            odkTables.launchHTML(null, 'config/assets/coldchaindemo.html');
        });
    }

    $(divToAddButtonTo).append(button);
}

async function showRegionButtonsAndTitle(jsonRegions) {
    // There are subregions so show them
    for (var i = 0; i < jsonRegions.length; i++) {
        var jsonRegion = jsonRegions[i];
        var levelVal = jsonRegion['levelNumber'];
        var regionLevelVal = util.regionLevel + levelVal;

        if (levelVal >= maxLevelValue) {
            addMenuButton(util.linkedAdminRegion, jsonRegion[regionLevelVal], '#buttonsDiv',
                jsonRegion[regionLevelVal], jsonRegion['_id']);
        } else {
            var nLevelVal = parseInt(levelVal) + 1;
            addMenuButton(util.adminRegion, jsonRegion[regionLevelVal], '#buttonsDiv',
                jsonRegion[regionLevelVal], jsonRegion['_id'], nLevelVal);
        }
    }

    if (currAdminRegion !== null && currAdminRegion !== undefined) {
        var hdrRegLab = currAdminRegion;
        var hdrRegToken = currAdminRegion.toString().toLowerCase().replace(' ', '_');
        var localizeHdrRegLab = odkCommon.localizeText(locale, hdrRegToken);
        if (localizeHdrRegLab !== null && localizeHdrRegLab !== undefined) {
            hdrRegLab = localizeHdrRegLab;
        }

        var header = $('#header1');
        header.text(hdrRegLab);

        if (currAdminRegionId !== null && currAdminRegionId !== undefined) {
            var currAdminRegionName = await util.getGeographicRegionName(currAdminRegionId);
            if (currAdminRegionName !== null && currAdminRegionName !== undefined) {
                var translatedRegionName = util.translateAdminRegionName(locale, currAdminRegionName);
                if (translatedRegionName !== null && translatedRegionName !== undefined &&
                    translatedRegionName !== currAdminRegion && translatedRegionName.indexOf(util.separator) !== -1) {
                    var breadcrumbHeader = $('#breadcrumbHeader');
                    breadcrumbHeader.text(util.translateAdminRegionName(locale, currAdminRegionName));
                }
            }
        }
    }
}

function showLogin(descTextToDisplay, buttonTextToDisplay) {
    var par = $('<p>');
    par.text(descTextToDisplay);
    par.attr('class', 'descStyle');

    $('#description').append(par);
    var loginButton = $('<button>');
    loginButton.text(buttonTextToDisplay);
    loginButton.attr('class', 'button');
    $('#buttonsDiv').append(loginButton);
    loginButton.on('click', function () {
        odkCommon.doAction(null,
            'org.opendatakit.services.sync.actions.activities.SyncActivity',
            {
                'extras': {'showLogin': 'true'},
                'componentPackage': 'org.opendatakit.services',
                'componentActivity': 'org.opendatakit.services.sync.actions.activities.SyncActivity'
            });
    });
}

function updateStaticDisplay() {
    var headerDiv = $('#navHeader');

    // Cold Chain Demo
    var fileUri = odkCommon.getFileAsUrl('config/assets/img/hallway.jpg');
    var header = $('<h1>');
    header.attr('id', 'header1');
    var headerTxt = odkCommon.localizeText(locale, "cold_chain_management");
    header.text(headerTxt);
    headerDiv.append(header);

    var breadcrumbHeader = $('<h4>');
    breadcrumbHeader.attr('id', 'breadcrumbHeader');
    headerDiv.append(breadcrumbHeader);

    $('body').css('background-image', 'url(' + fileUri + ')');
}

async function checkDefaultGroupForMenuOptions() {
    // The default group determines what menu to jump to
    var getDefaultGroupPromise = new Promise(function (resolve, reject) {
        return odkData.getDefaultGroup(resolve, reject);
    });

    var r = await getDefaultGroupPromise;
    r = r.getDefaultGroup();
    var regionJSON = null;

    if (r === null) {
        // No default group - login
        showLogin('No Default Group For This User.  Please Log In With A Different User', 'Log In');

        // default group given
        // Special case if we want to go off of regions
    } else if (r.indexOf(GROUP_REGION_) === 0) {
        var region = r.replace(GROUP_REGION_, '');
        // replace all occurrences
        var regionAsRole = region.replace(/_/g, ' ');

        // Find region
        var levelNum = await util.findAdminRegionLevel(regionAsRole);
        // Increment the level to get the subregions for this region
        levelNum++;

        // Get menu options from default group
        regionJSON = await util.getMenuOptions(levelNum, regionAsRole);

        // default group matches JSON map of admin hierarchy
        if (regionJSON !== null) {
            showRegionButtonsAndTitle(regionJSON);

            // We don't recognize this region
        } else {
            showLogin('User Default Group Not Recognized. Please Log In', 'Log In');
        }

        // We have an admin - we would show everything
        // Or we have a supervisor or worker - show everything but admin options
    } else if (r.indexOf(administratorGroup) === 0 || r.indexOf(adminGroup) === 0 ||
        r.indexOf(supervisorGroup) === 0 || r.indexOf(workerGroup) === 0) {
        // Start at the beginning
        regionJSON = await util.getMenuOptions(util.firstLevelNumber);
        showRegionButtonsAndTitle(regionJSON);

        if (r.indexOf(administratorGroup) === 0 || r.indexOf(adminGroup) === 0) {
            var adminTxt = adminValue;
            var localizeAdminTxt = odkCommon.localizeText(locale, "administrator_options");
            if (localizeAdminTxt !== null && localizeAdminTxt !== undefined) {
                adminTxt = localizeAdminTxt;
            }
            addMenuButton(adminType, adminTxt, '#buttonsDiv');
        }
    } else {
        showLogin('User Is Not Authorized. Please Log In', 'Log In');
    }
}

async function display() {
    locale = odkCommon.getPreferredLocale();
    updateStaticDisplay();

    var tempMaxLevel = util.getQueryParameter(util.maxLevelNumber);
    if (tempMaxLevel !== null && tempMaxLevel !== undefined) {
        maxLevelValue = tempMaxLevel;
    } else {
        tempMaxLevel = await util.getMaxLevel();
        if (tempMaxLevel !== null && tempMaxLevel !== undefined) {
            maxLevelValue = tempMaxLevel;
        } else {
            maxLevelValue = util.maxLevelAppDepth;
        }
    }

    nextLevel = util.getQueryParameter(util.nextRegionLevelNumber);
    currAdminRegion = util.getQueryParameter(util.adminRegion);
    currAdminRegionId = util.getQueryParameter(util.adminRegionId);

    if (nextLevel > maxLevelValue) { nextLevel = null; }

    if (nextLevel == null) {
        checkDefaultGroupForMenuOptions();
    } else {
        var regJSON = await util.getMenuOptions(nextLevel, currAdminRegion, maxLevelValue);
        showRegionButtonsAndTitle(regJSON);
    }

    // Add in the leafRegion button if there are health facilities associated at this level
    var facilityCnt = await util.getFacilityCountByAdminRegion(currAdminRegionId);
    if (facilityCnt > 0) {
        addMenuButton(util.linkedAdminRegion, VIEW_HEALTH_FACILITIES_REFRIGERATORS, '#buttonsDiv', currAdminRegion,
            currAdminRegionId);
    }
}
