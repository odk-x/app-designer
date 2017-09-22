/* global */
/**
 * Various functions that we might need across screens.
 */
'use strict';

var util = {};

/**
 * Red Cross Constants
 */

util.beneficiaryEntityTable = 'beneficiary_entities';
util.individualTable = 'individuals';
util.authorizationTable = 'authorizations';
util.entitlementTable = 'entitlements';
util.deliveryTable = 'deliveries';

/**
 * Get the query parameter from the url. Note that this is kind of a hacky/lazy
 * implementation that will fail if the key string appears more than once, etc.
 */
util.getQueryParameter = function(key) {
    var href = document.location.search;
    var startIndex = href.search(key);
    if (startIndex < 0) {
        console.log('requested query parameter not found: ' + key);
        return null;
    }
    // Then we want the substring beginning after "key=".
    var indexOfValue = startIndex + key.length + 1;  // 1 for '='
    // And now it's possible that we have more than a single url parameter, so
    // only take as many characters as we need. We'll stop at the first &,
    // which is what specifies more keys.
    var fromValueOnwards = href.substring(indexOfValue);
    var stopAt = fromValueOnwards.search('&');
    if (stopAt < 0) {
        return decodeURIComponent(fromValueOnwards);
    } else {
        return decodeURIComponent(fromValueOnwards.substring(0, stopAt));
    }
};

/**
 * Get a string to append to a url that will contain information the date and
 * time. The values can then be retrieved using getQueryParameter.
 */
util.getKeysToAppendToURL = function(date, time, focalChimp) {
    var result =
        '?' +
        util.dateKey +
        '=' +
        encodeURIComponent(date) +
        '&' +
        util.timeKey +
        '=' +
        encodeURIComponent(time) +
        '&' +
        util.focalChimpKey +
        '=' +
        encodeURIComponent(focalChimp);
    return result;
};

util.genUUID = function() {
    // construct a UUID (from http://sta ckoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript )
    var id = 'uuid:' + 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = (c === 'x') ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    return id;
};

util.renderPage = function(renderFunction) {
    console.log(renderFunction);
    renderFunction();
    $(':button').css({'height' : window.innerHeight * .15 + "px"});
    $(':button').css({'font-size' : Math.min(window.innerHeight, window.innerWidth) * .07 + "px"});
    $(':button').css({'margin-bottom' : window.innerHeight * .06 + "px"});
    document.body.style.display = "block";
}

util.setJSONMap = function(JSONMap, key, value) {
    if (value !== null && value !== undefined) {
        JSONMap[key] = value;
    }
}

/**
 * Red cross config getters
 */

util.configPath = '../json/config.json';

util.getRegistrationMode = function() {
    return 'HOUSEHOLD';
}

util.getWorkflowMode = function() {
    return 'REGISTRATION_REQUIRED';
}

util.getBeneficiaryEntityCustomFormId = function() {
    return 'custom_beneficiary_entities';
}

util.getIndividualCustomFormId = function() {
    return 'custom_individuals';
}





