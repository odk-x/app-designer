/**
 * The shim object is something we use to mock out some functionality for
 * testing in the browser. See the `window.shim` definition below for more
 * information.
 */

/**
 * Compute and return the base URI for this machine. This will allow the code
 * to function independently of the host name.
 * 
 * Returns a string representing the base uri in the format:
 * http://DOMAIN/DIRS/. Note the trailing slash.
 */
function computeBaseUri() {
  // To compute this we are going to rely on the location of the containing
  // file relative to the location we are serving as are root. If this is
  // changed, this file must be updated appropriately.
  // Since we are expecting this file to live in app/framework/survey/js/, we
  // can look for the first occurrence and take everything before it.

  var expectedFileLocation = 'framework/survey/js/shim.js';

  var fileLocation = getCurrentFileLocation();

  var indexToFile = fileLocation.indexOf(expectedFileLocation);

  var result = fileLocation.substring(0, indexToFile);

  return result;

}

/**
 * Return the location of the currently executing file.
 */
function getCurrentFileLocation() {
  // We need to get the location of the currently
  // executing file. This is not readily exposed, and it is not as simple as
  // finding the current script tag, since callers might be loading the file
  // using RequireJS or some other loading library. We're going to instead
  // pull the file location out of a stack trace.
  var error = new Error();
  var stack = error.stack;
  
  // We expect the stack to look something like:
  // TypeError: undefined is not a function
  //     at Object.window.shim.window.shim.getPlatformInfo
  //     (http://homes.cs.washington.edu/~sudars/odk/survey-js-adaptr/app/framework/survey/js/shim.js:45:29)
  //     blah blah blah
  // So now we'll extract the file location. We'll do this by assuming that
  // the location occurs in the first parentheses.
  var openParen = stack.indexOf('(');
  var closedParen = stack.indexOf(')');

  var fileLocation = stack.substring(openParen + 1, closedParen);

  return fileLocation;
}


/*
This shim  object is just a facade for browser testing.
It defines the interface that ODK Survey or other container apps 
must implement to work with the javascript library.
It will be replaced by one injected by Android Java code.
*/
window.shim = window.shim || {
    showAlerts: false,
    logLevel: 'D',
    refId: null,
    enforceRefIdMatch: true,
    /**
     * The shim now remembers an entire history of refId values.
     * 
     * The manipulators below access the values for their respective refId
     * via refIdMap[refId]. The values tracked per refId are:
     *   instanceId
     *   sectionStateScreenHistory
     *   sessionVariables
     */
    refIdMap: {}, // map indexed by refId
    lookupRefIdData: function(refId) {
        var settings = this.refIdMap[refId];
        if ( settings === undefined || settings === null ) {
            settings = {
                instanceId: null,
                sectionStateScreenHistory: [],
                sessionVariables: {}
            };
            this.refIdMap[refId] = settings;
        }
        return settings;
    },
    getBaseUrl: function() {
        return '../framework';
    },
    getPlatformInfo: function() {
        // container identifies the WebKit or browser context.
        // version should identify the capabilities of that context.
        
        var baseUri = computeBaseUri();
        console.log('computed base uri: ' + baseUri);
        return '{"container":"Chrome","version":"21.0.1180.83 m","activeUser":"username:badger","baseUri":"' + baseUri + '","formsUri":"content://org.opendatakit.common.android.provider.forms/","appName":"testing","logLevel":"' + this.logLevel + '"}';
    },
    getDatabaseSettings: function() {
        // version identifies the database schema that the database layer should use.
        // maxSize is in bytes
        return '{"shortName":"odk","version":"1","displayName":"ODK Instances Database","maxSize":65536}';
    },
    /*
     * severity - one of 'E' (error), 'W' (warn), 'S' (success), 'I' (info), 'D' (debug), 'T' (trace), 'A' (assert)
     * msg -- message to log
     */
    log: function(severity, msg) {
        var logIt = false;
        var ll = this.logLevel;
        switch(severity) {
        default:
        case 'S':
        case 'F':
        case 'E':
            logIt = true;
            break;
        case 'W':
            if ( ll !== 'E' ) {
                logIt = true;
            }
            break;
        case 'I':
            if ( ll !== 'E' && ll !== 'W' ) {
                logIt = true;
            }
            break;
        case 'D':
            if ( ll !== 'E' && ll !== 'W' && ll !== 'I' ) {
                logIt = true;
            }
            break;
        case 'T':
            if ( ll !== 'E' && ll !== 'W' && ll !== 'I' && ll !== 'D' ) {
                logIt = true;
            }
            break;
        }

        if ( logIt ) {
            if ( severity === 'E' || severity === 'W' ) {
                console.error(severity + '/' + msg);
            } else {
                console.log(severity + '/' + msg);
            }
        }
    },
    getProperty: function( propertyId ) {
        this.log("D","shim: DO: getProperty(" + propertyId + ")");
        return "property-of(" + propertyId + ")";
    },
    clearInstanceId: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: clearInstanceId(" + refId + ")");
            return;
        }
        this.log("D","shim: DO: clearInstanceId(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        settings.instanceId = null;
    },
    setInstanceId: function( refId, instanceId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: setInstanceId(" + refId + ", " + instanceId + ")");
            return;
        }
        // report the new instanceId to ODK Survey...
        // needed so that callbacks, etc. can properly track the instanceId 
        // currently being worked on.
        this.log("D","shim: DO: setInstanceId(" + refId + ", " + instanceId + ")");
        var settings = this.lookupRefIdData(refId);
        settings.instanceId = instanceId;
    },
    getInstanceId: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: getInstanceId(" + refId + ")");
            return null;
        }
        // report the new instanceId to ODK Survey...
        // needed so that callbacks, etc. can properly track the instanceId 
        // currently being worked on.
        this.log("D","shim: DO: getInstanceId(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        return settings.instanceId;
    },
    _dumpScreenStateHistory : function(settings) {
        this.log("D","shim -------------*start* dumpScreenStateHistory--------------------");
        if ( settings.sectionStateScreenHistory.length === 0 ) {
            this.log("D","shim sectionScreenStateHistory EMPTY");
        } else {
            var i;
            for ( i = settings.sectionStateScreenHistory.length-1 ; i >= 0 ; --i ) {
                var thisSection = settings.sectionStateScreenHistory[i];
                this.log("D","shim [" + i + "] screenPath: " + thisSection.screen );
                this.log("D","shim [" + i + "] state:      " + thisSection.state );
                if ( thisSection.history.length === 0 ) {
                    this.log("D","shim [" + i + "] history[] EMPTY" );
                } else {
                    var j;
                    for ( j = thisSection.history.length-1 ; j >= 0 ; --j ) {
                        var ss = thisSection.history[j];
                        this.log("D","shim [" + i + "] history[" + j + "] screenPath: " + ss.screen );
                        this.log("D","shim [" + i + "] history[" + j + "] state:      " + ss.state );
                    }
                }
            }
        }
        this.log("D","shim ------------- *end*  dumpScreenStateHistory--------------------");
    },
    pushSectionScreenState: function( refId) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: pushSectionScreenState(" + refId + ")");
            return;
        }

        this.log("D","shim: DO: pushSectionScreenState(" + refId + ")");
        var settings = this.lookupRefIdData(refId);

        if ( settings.sectionStateScreenHistory.length === 0 ) {
            return;
        }
        
        var lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
        lastSection.history.push( { screen: lastSection.screen, state: lastSection.state } );
    },
    setSectionScreenState: function( refId, screenPath, state) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: setSectionScreenState(" + refId + ", " + screenPath + ", " + state + ")");
            return;
        }

        this.log("D","shim: DO: setSectionScreenState(" + refId + ", " + screenPath + ", " + state + ")");
        var settings = this.lookupRefIdData(refId);
        if ( screenPath === undefined || screenPath === null ) {
            alert("setSectionScreenState received a null screen path!");
            this.log("E","setSectionScreenState received a null screen path!");
            return;
        } else {
            var splits = screenPath.split('/');
            var sectionName = splits[0] + "/";
            if (settings.sectionStateScreenHistory.length === 0) {
                settings.sectionStateScreenHistory.push( { history: [], screen: screenPath, state: state } );
            } else {
                var lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
                if ( lastSection.screen.substring(0,sectionName.length) === sectionName ) {
                    lastSection.screen = screenPath;
                    lastSection.state = state;
                } else {
                    settings.sectionStateScreenHistory.push( { history: [], screen: screenPath, state: state } );
                }
            }
        }
    },
    clearSectionScreenState: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: clearSectionScreenState(" + refId + ")");
            return;
        }

        this.log("D","shim: DO: clearSectionScreenState(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        settings.sectionStateScreenHistory = [ { history: [], screen: 'initial/0', state: null } ];
    },
    getControllerState: function( refId ) {
        if (this.enforceRefIdMatch && refId != this.refId) {
            this.log("D","shim: IGNORED: getControllerState(" + refId + ")");
            return null;
        }
        this.log("D","shim: DO: getControllerState(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        
        if ( settings.sectionStateScreenHistory.length === 0 ) {
            this.log("D","shim: getControllerState: NULL!");
            return null;
        }
        var lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
        return lastSection.state;
    },
    getScreenPath: function(refId) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: getScreenPath(" + refId + ")");
            return null;
        }
        this.log("D","shim: DO: getScreenPath(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        this._dumpScreenStateHistory(settings);
        
        if ( settings.sectionStateScreenHistory.length === 0 ) {
            this.log("D","shim: getScreenPath: NULL!");
            return null;
        }
        var lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
        return lastSection.screen;
    },
    hasScreenHistory: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: hasScreenHistory(" + refId + ")");
            return false;
        }
        this.log("D","shim: DO: hasScreenHistory(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        // two or more sections -- there must be history!
        if ( settings.sectionStateScreenHistory.length > 1 ) {
            return true;
        }
        // nothing at all -- no history
        if ( settings.sectionStateScreenHistory.length === 0 ) {
            return false;
        }
        // just one section -- is there any screen history within it?
        var thisSection = settings.sectionStateScreenHistory[0];
        return ( thisSection.history.length !== 0 );
    },
    popScreenHistory: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: popScreenHistory(" + refId + ")");
            return null;
        }
        this.log("D","shim: DO: popScreenHistory(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        
        if ( settings.sectionStateScreenHistory.length === 0 ) {
            return null;
        }
        
        var lastSection;
        
        lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
        if ( lastSection.history.length !== 0 ) {
            // pop history from within this section
            var lastHistory = lastSection.history.pop();
            lastSection.screen = lastHistory.screen;
            lastSection.state = lastHistory.state;
            return lastSection.screen;
        }

        // pop to an enclosing section
        settings.sectionStateScreenHistory.pop();
        if ( settings.sectionStateScreenHistory.length === 0 ) {
            return null;
        }
        
        // return the screen from that last section... (do not pop the history)
        lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
        return lastSection.screen;
    },
    /**
     * Section stack -- maintains the stack of sections from which you can exit.
     */
    hasSectionStack: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: hasSectionStack(" + refId + ")");
            return false;
        }
        this.log("D","shim: DO: hasSectionStack(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        return settings.sectionStateScreenHistory.length !== 0;
    },
    popSectionStack: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: popSectionStack(" + refId + ")");
            return null;
        }
        this.log("D","shim: DO: popSectionStack(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        if ( settings.sectionStateScreenHistory.length !== 0 ) {
            settings.sectionStateScreenHistory.pop();
        }
        
        if ( settings.sectionStateScreenHistory.length !== 0 ) {
            var lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
            return lastSection.screen;
        }

        return null;
    },
    setSessionVariable: function(refId, elementPath, value) {
        var that = this;
        if (that.enforceRefIdMatch && refId !== this.refId) {
            that.log("D","shim: IGNORED: setSessionVariable(" + refId + ", " + elementPath + 
                ", " + value + ")");
            return;
        }
        var settings = this.lookupRefIdData(refId);
        var parts = elementPath.split('.');
        var i;
        var pterm = settings.sessionVariables;
        var term = settings.sessionVariables;
        for ( i = 0 ; i < parts.length ; ++i ) {
            if ( parts[i] in term ) {
                pterm = term;
                term = term[parts[i]];
            } else {
                pterm = term;
                term[parts[i]] = {};
                term = term[parts[i]];
            }
        }
        pterm[parts[parts.length-1]] = value;
    },
    getSessionVariable: function(refId, elementPath) {
        var that = this;
        if (that.enforceRefIdMatch && refId !== this.refId) {
            that.log("D","shim: IGNORED: getSessionVariable(" + refId + ", " + elementPath + 
                ")");
            return undefined;
        }
        var settings = this.lookupRefIdData(refId);
        var parts = elementPath.split('.');
        var i;
        var term = settings.sessionVariables;
        for ( i = 0 ; i < parts.length ; ++i ) {
            if ( parts[i] in term ) {
                term = term[parts[i]];
            } else {
                return null;
            }
        }
        return term;
    },
    doAction: function( refId, promptPath, internalPromptContext, action, jsonObj ) {
        var that = this;
        var value;
        if (that.enforceRefIdMatch && refId !== this.refId) {
            that.log("D","shim: IGNORED: doAction(" + refId + ", " + promptPath + 
                ", " + internalPromptContext + ", " + action + ", ...)");
            return "IGNORE";
        }
        that.log("D","shim: DO: doAction(" + refId + ", " + promptPath + 
            ", " + internalPromptContext + ", " + action + ", ...)");
        if ( action === 'org.opendatakit.survey.android.activities.MediaCaptureImageActivity' ) {
		    /* this is a hack -- please don't rely on relative paths anywhere else! */
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uriFragment": "../../../../framework/survey/test/venice.jpg",' + 
                                                    '"contentType": "image/jpg" } }' );
            }, 100);
            return "OK";
        }
        if ( action === 'org.opendatakit.survey.android.activities.MediaCaptureVideoActivity' ) {
		    /* this is a hack -- please don't rely on relative paths anywhere else! */
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uriFragment": "../../../../framework/survey/test/bali.3gp",' + 
                                                    '"contentType": "video/3gp" } }' );
            }, 100);
            return "OK";
        }
        if ( action === 'org.opendatakit.survey.android.activities.MediaCaptureAudioActivity' ) {
		    /* this is a hack -- please don't rely on relative paths anywhere else! */
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uriFragment": "../../../../framework/survey/test/raven.wav",' + 
                                                    '"contentType": "audio/wav" } }' );
            }, 100);
            return "OK";
        }
        if ( action === 'org.opendatakit.survey.android.activities.MediaChooseImageActivity' ) {
		    /* this is a hack -- please don't rely on relative paths anywhere else! */
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uriFragment": "../../../../framework/survey/test/venice.jpg",' + 
                                                    '"contentType": "image/jpg" } }' );
            }, 100);
            return "OK";
        }
        if ( action === 'org.opendatakit.survey.android.activities.MediaChooseVideoActivity' ) {
		    /* this is a hack -- please don't rely on relative paths anywhere else! */
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uriFragment": "../../../../framework/survey/test/bali.3gp",' + 
                                                    '"contentType": "video/3gp" } }' );
            }, 100);
            return "OK";
        }
        if ( action === 'org.opendatakit.survey.android.activities.MediaChooseAudioActivity' ) {
		    /* this is a hack -- please don't rely on relative paths anywhere else! */
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uriFragment": "../../../../framework/survey/test/raven.wav",' + 
                                                    '"contentType": "audio/wav" } }' );
            }, 100);
            return "OK";
        }
        if ( action === 'org.opendatakit.sensors.PULSEOX' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "pulse": 100, "ox": ' + prompt("Enter ox:") + ' } }' );
            }, 1000);
            return "OK";
        }
        if ( action === 'change.uw.android.BREATHCOUNT' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "value": ' + prompt("Enter breath count:") + ' } }' );
            }, 1000);
            return "OK";
        }
        if ( action === 'com.google.zxing.client.android.SCAN' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "SCAN_RESULT": "' + prompt("Enter barcode:") + '" } }' );
            }, 1000);
            return "OK";
        }
        if ( action === 'org.opendatakit.survey.android.activities.GeoPointMapActivity' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "latitude": ' + prompt("Enter latitude:") + 
                                                ', "longitude": ' + prompt("Enter longitude:") +
                                                ', "altitude": ' + prompt("Enter altitude:") +
                                                ', "accuracy": ' + prompt("Enter accuracy:") +
                                                ' } }' );
            }, 1000);
            return "OK";
        }
        if ( action === 'org.opendatakit.survey.android.activities.GeoPointActivity' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "latitude": ' + prompt("Enter latitude:") + 
                                                ', "longitude": ' + prompt("Enter longitude:") +
                                                ', "altitude": ' + prompt("Enter altitude:") +
                                                ', "accuracy": ' + prompt("Enter accuracy:") +
                                                ' } }' );
            }, 1000);
            return "OK";
        }
        if ( action === 'org.opendatakit.survey.android.activities.MainMenuActivity' ) {
            value = JSON.parse(jsonObj);
            if ( window.parent === window ) {
                // naked
                window.open(value.extras.url,'_blank', null, false);
            } else {
                // inside tab1
                window.parent.pushPageAndOpen(value.extras.url);
            }
            setTimeout(function() {
                that.log("D","Opened new browser window for Survey content. Close to continue");
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { } }' );
            }, 1000);
            return "OK";
        }
        if ( action === 'org.opendatakit.survey.android.activities.SplashScreenActivity' ) {
            value = JSON.parse(jsonObj);
            if ( window.parent === window ) {
                // naked
                window.open(value.extras.url,'_blank', null, false);
            } else {
                // inside tab1
                window.parent.pushPageAndOpen(value.extras.url);
            }
            setTimeout(function() {
                that.log("D","Opened new browser window for link to another ODK Survey page. Close to continue");
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { } }' );
            }, 1000);
            return "OK";
        }
        if ( action === 'android.content.Intent.ACTION_VIEW' ) {
            value = JSON.parse(jsonObj);
            if ( window.parent === window ) {
                // naked
                window.open(value.extras.url,'_blank', null, false);
            } else {
                // inside tab1
                window.parent.pushPageAndOpen(value.extras.url);
            }
            setTimeout(function() {
                that.log("D","Opened new browser window for 3rd party content. Close to continue");
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { } }' );
            }, 1000);
            return "OK";
        }
    },
    frameworkHasLoaded: function(refId, outcome) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: frameworkHasLoaded(" + refId + ", " + outcome + ")");
            return;
        }
        this.log("E","shim: DO: frameworkHasLoaded(" + refId + ", " + outcome + ")");
        if ( this.showAlerts ) alert("notify container frameworkHasLoaded " + (outcome ? "SUCCESS" : "FAILURE"));
    },
    saveAllChangesCompleted: function( refId, instanceId, asComplete ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: saveAllChangesCompleted(" + refId + ", " + instanceId + ", " + asComplete + ")");
            return;
        }
        this.log("D","shim: DO: saveAllChangesCompleted(" + refId + ", " + instanceId + ", " + asComplete + ")");
        if ( this.showAlerts ) alert("notify container OK save " + (asComplete ? 'COMPLETE' : 'INCOMPLETE') + '.');
        if ( window.parent === window ) {
            window.close();
        } else {
            window.parent.closeAndPopPage();
        }
    },
    saveAllChangesFailed: function( refId, instanceId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: saveAllChangesFailed(" + refId + ", " + instanceId + ")");
            return;
        }
        this.log("D","shim: DO: saveAllChangesFailed(" + refId + ", " + instanceId + ")");
        if ( this.showAlerts ) alert("notify container FAILED save " + (asComplete ? 'COMPLETE' : 'INCOMPLETE') + '.');
    },
    ignoreAllChangesCompleted: function( refId, instanceId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: ignoreAllChangesCompleted(" + refId + ", " + instanceId + ")");
            return;
        }
        this.log("D","shim: DO: ignoreAllChangesCompleted(" + refId + ", " + instanceId + ")");
        if ( this.showAlerts ) alert("notify container OK ignore all changes.");
        if ( window.parent === window ) {
            window.close();
        } else {
            window.parent.closeAndPopPage();
        }
    },
    ignoreAllChangesFailed: function( refId, instanceId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: ignoreAllChangesFailed(" + refId + ", " + instanceId + ")");
            return;
        }
        this.log("D","shim: DO: ignoreAllChangesFailed(" + refId + ", " + instanceId + ")");
        if ( this.showAlerts ) alert("notify container FAILED ignore all changes.");
    }
};
