'use strict';
/* global odkTables, odkCommon, odkData, util */

function addMenuButton(key, value) {
    var button = $('<button>');
    button.attr('class', 'button');
    button.text(value);
    if (key === util.leafRegion) {
        button.on('click', function () {
            var queryParams = util.getKeyToAppendToColdChainURL(key, value);
            odkTables.launchHTML(null,'config/assets/leafRegion.html' + queryParams);
        });
    } else {
        button.on('click', function () {
            var queryParams = util.getKeyToAppendToColdChainURL(key, value);
            odkTables.launchHTML(null,'config/assets/index.html' + queryParams);
        });
    }
    
    $('#buttonsDiv').append(button);
}

function successCB(result) {
    for (var i = 0; i < result.getCount(); i++) {
        var district = result.getData(i, 'admin_region');
        addMenuButton(util.leafRegion, district);
    }
}

function failCB(error) {
    console.log('util.getDistrictsByAdminLevel2 failed with message: ' + error);
}

function showSubregionButtonsAndTitle(jsonRegion) {
    // There are subregions so show them
    var header = $('#header1');

    if (jsonRegion.hasOwnProperty('subRegions')) {
        var subRegions = jsonRegion.subRegions;
        for (var subRegCtr = 0; subRegCtr < subRegions.length; subRegCtr++) {
            var subRegion = subRegions[subRegCtr];
            var subRegionLabel = subRegion.label;
            addMenuButton(util.region, subRegionLabel);
        }
        header.text(jsonRegion.label);

    // We got the entire array of regions so show first level
    } else if (Array.isArray(jsonRegion)) {
        // We are an admin so show all the regions
        for (var regCtr = 0; regCtr < jsonRegion.length; regCtr++) {
            var reg = jsonRegion[regCtr];
            var regLabel = reg.label;
            addMenuButton(util.region, regLabel);
        }
    // There are no more subregions so now we need to get the districts
    } else {
        header.text(jsonRegion.label);
        util.getDistrictsByAdminLevel2(jsonRegion.label, successCB, failCB);
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
    loginButton.on('click', function() {
        odkCommon.doAction(null, 
            'org.opendatakit.services.sync.actions.activities.SyncActivity', 
            {'extras': {'showLogin': 'true'}, 
                'componentPackage': 'org.opendatakit.services', 
                'componentActivity': 'org.opendatakit.services.sync.actions.activities.SyncActivity'});
    });
}

function updateStaticDisplay() {
    var headerDiv = $('#header');

    // Cold Chain Demo
    var fileUri = odkCommon.getFileAsUrl('config/assets/img/hallway.jpg');
    var header = $('<h1>');
    header.attr('id', 'header1');
    header.text('Cold Chain Management');
    headerDiv.append(header);

    $('body').css('background-image', 'url(' + fileUri + ')');
}

function checkDefaultGroupForMenuOptions() {
    // The default group determines what menu to jump to
    odkData.getDefaultGroup(function(r) {
        r = r.getDefaultGroup();
        var regionJSON = null;

        if (r === null) {
            // No default group - login
            showLogin('No Default Group For This User.  Please Log In With A Different User', 'Log In');

        // default group given
        } else if (r.indexOf('GROUP_REGION_') === 0) {
            var region = r.replace('GROUP_REGION_', '');
            // replace all occurrences
            var regionAsRole = region.replace(/_/g, ' ');
            
            // Get menu options from default group
            regionJSON = util.getMenuOptions(regionAsRole);
            
            // default group matches JSON map of admin hierarchy
            if (regionJSON !== null) {
                showSubregionButtonsAndTitle(regionJSON);

            // We don't recognize this region
            } else {
                showLogin('User Default Group Not Recognized. Please Log In', 'Log In');
            }
        
        // We have an admin - we would show everything
        } else if (r.indexOf('ROLE_ADMINISTER_TABLES') === 0) {
            regionJSON = util.getMenuOptions(null);
            showSubregionButtonsAndTitle(regionJSON);
        } else {
            showLogin('User Is Not Authorized. Please Log In', 'Log In');
        }
    });
}

function display() { 
    updateStaticDisplay();
    
    var reg = util.getQueryParameter(util.region);
    if (reg === null) {
        checkDefaultGroupForMenuOptions();
    } else {
        var regJSON = util.getMenuOptions(reg); 
        showSubregionButtonsAndTitle(regJSON);  
    }
}