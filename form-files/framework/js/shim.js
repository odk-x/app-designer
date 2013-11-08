/*
This shim  object is just a facade for browser testing.
It defines the interface that ODK Survey or other container apps 
must implement to work with the javascript library.
It will be replaced by one injected by Android Java code.
*/
window.shim = window.shim || {
    showAlerts: false,
    refId: null,
    enforceRefIdMatch: true,
    instanceId: null,
    sectionStateScreenHistory: [],
    sessionVariables: {},
    getBaseUrl: function() {
        return '../framework';
    },
    getPlatformInfo: function() {
        // container identifies the WebKit or browser context.
        // version should identify the capabilities of that context.
        return '{"container":"Chrome","version":"21.0.1180.83 m","appName":"testing"}';
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
        if ( severity === 'E' || severity === 'W' ) {
            console.error(severity + '/' + msg);
        } else {
            console.log(severity + '/' + msg);
        }
    },
    clearInstanceId: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: clearInstanceId(" + refId + ")");
            return;
        }
        this.log("D","shim: DO: clearInstanceId(" + refId + ")");
        this.instanceId = null;
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
        this.instanceId = instanceId;
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
        return this.instanceId;
    },
    _dumpScreenStateHistory : function() {
        this.log("D","shim -------------*start* dumpScreenStateHistory--------------------");
        if ( this.sectionStateScreenHistory.length === 0 ) {
            this.log("D","shim sectionScreenStateHistory EMPTY");
        } else {
            var i;
            for ( i = this.sectionStateScreenHistory.length-1 ; i >= 0 ; --i ) {
                var thisSection = this.sectionStateScreenHistory[i];
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

        if ( this.sectionStateScreenHistory.length === 0 ) {
            return;
        }
        
        var lastSection = this.sectionStateScreenHistory[this.sectionStateScreenHistory.length-1];
        lastSection.history.push( { screen: lastSection.screen, state: lastSection.state } );
    },
    setSectionScreenState: function( refId, screenPath, state) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: setSectionScreenState(" + refId + ", " + screenPath + ", " + state + ")");
            return;
        }

        this.log("D","shim: DO: setSectionScreenState(" + refId + ", " + screenPath + ", " + state + ")");
        if ( screenPath === undefined || screenPath === null ) {
            alert("setSectionScreenState received a null screen path!");
            this.log("E","setSectionScreenState received a null screen path!");
            return;
        } else {
            var splits = screenPath.split('/');
            var sectionName = splits[0] + "/";
            if (this.sectionStateScreenHistory.length === 0) {
                this.sectionStateScreenHistory.push( { history: [], screen: screenPath, state: state } );
            } else {
                var lastSection = this.sectionStateScreenHistory[this.sectionStateScreenHistory.length-1];
                if ( lastSection.screen.substring(0,sectionName.length) === sectionName ) {
                    lastSection.screen = screenPath;
                    lastSection.state = state;
                } else {
                    this.sectionStateScreenHistory.push( { history: [], screen: screenPath, state: state } );
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
        this.sectionStateScreenHistory = [ { history: [], screen: 'initial/0', state: null } ];
    },
    getControllerState: function( refId ) {
        if (this.enforceRefIdMatch && refId != this.refId) {
            this.log("D","shim: IGNORED: getControllerState(" + refId + ")");
            return null;
        }
        this.log("D","shim: DO: getControllerState(" + refId + ")");
        
        if ( this.sectionStateScreenHistory.length === 0 ) {
            this.log("D","shim: getControllerState: NULL!");
            return null;
        }
        var lastSection = this.sectionStateScreenHistory[this.sectionStateScreenHistory.length-1];
        return lastSection.state;
    },
    getScreenPath: function(refId) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: getScreenPath(" + refId + ")");
            return null;
        }
        this.log("D","shim: DO: getScreenPath(" + refId + ")");
        this._dumpScreenStateHistory();
        
        if ( this.sectionStateScreenHistory.length === 0 ) {
            this.log("D","shim: getScreenPath: NULL!");
            return null;
        }
        var lastSection = this.sectionStateScreenHistory[this.sectionStateScreenHistory.length-1];
        return lastSection.screen;
    },
    hasScreenHistory: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: hasScreenHistory(" + refId + ")");
            return false;
        }
        this.log("D","shim: DO: hasScreenHistory(" + refId + ")");
        // two or more sections -- there must be history!
        if ( this.sectionStateScreenHistory.length > 1 ) {
            return true;
        }
        // nothing at all -- no history
        if ( this.sectionStateScreenHistory.length === 0 ) {
            return false;
        }
        // just one section -- is there any screen history within it?
        var thisSection = this.sectionStateScreenHistory[0];
        return ( thisSection.history.length !== 0 );
    },
    popScreenHistory: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: popScreenHistory(" + refId + ")");
            return null;
        }
        this.log("D","shim: DO: popScreenHistory(" + refId + ")");
		
        if ( this.sectionStateScreenHistory.length === 0 ) {
            return null;
        }
        
        var lastSection;
		
		lastSection	= this.sectionStateScreenHistory[this.sectionStateScreenHistory.length-1];
        if ( lastSection.history.length !== 0 ) {
            // pop history from within this section
            var lastHistory = lastSection.history.pop();
            lastSection.screen = lastHistory.screen;
            lastSection.state = lastHistory.state;
            return lastSection.screen;
        }

        // pop to an enclosing section
        this.sectionStateScreenHistory.pop();
        if ( this.sectionStateScreenHistory.length === 0 ) {
            return null;
        }
		
        // return the screen from that last section... (do not pop the history)
        lastSection = this.sectionStateScreenHistory[this.sectionStateScreenHistory.length-1];
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
        return this.sectionStateScreenHistory.length !== 0;
    },
    popSectionStack: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            this.log("D","shim: IGNORED: popSectionStack(" + refId + ")");
            return null;
        }
        this.log("D","shim: DO: popSectionStack(" + refId + ")");
        if ( this.sectionStateScreenHistory.length !== 0 ) {
            this.sectionStateScreenHistory.pop();
        }
        
        if ( this.sectionStateScreenHistory.length !== 0 ) {
            var lastSection = this.sectionStateScreenHistory[this.sectionStateScreenHistory.length-1];
            return lastSection.screen;
        }

        return null;
    },
    setSessionVariable: function(refId, elementPath, value) {
        var that = this;
        if (that.enforceRefIdMatch && refId !== this.refId) {
            that.log("D","shim: IGNORED: setSessionVariable(" + refId + ", " + elementPath + 
                ", " + value + ")");
            return "IGNORE";
        }
        var parts = elementPath.split('.');
        var i;
        var pterm = that.sessionVariables;
        var term = that.sessionVariables;
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
        var parts = elementPath.split('.');
        var i;
        var term = that.sessionVariables;
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
        if (that.enforceRefIdMatch && refId !== this.refId) {
            that.log("D","shim: IGNORED: doAction(" + refId + ", " + promptPath + 
                ", " + internalPromptContext + ", " + action + ", ...)");
            return "IGNORE";
        }
        that.log("D","shim: DO: doAction(" + refId + ", " + promptPath + 
            ", " + internalPromptContext + ", " + action + ", ...)");
        if ( action === 'org.opendatakit.survey.android.activities.MediaCaptureImageActivity' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/thumbs/bkaovAYt-320.jpg",' + 
                                                    '"contentType": "image/jpg" } }' );
            }, 100);
            return "OK";
        }
        if ( action === 'org.opendatakit.survey.android.activities.MediaCaptureVideoActivity' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/videos/bkaovAYt-52qL9xLP.mp4",' + 
                                                    '"contentType": "video/mp4" } }' );
            }, 100);
            return "OK";
        }
        if ( action === 'org.opendatakit.survey.android.activities.MediaCaptureAudioActivity' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/videos/bkaovAYt-zWfluNSa.mp3",' + 
                                                    '"contentType": "audio/mp3" } }' );
            }, 100);
            return "OK";
        }
        if ( action === 'org.opendatakit.survey.android.activities.MediaChooseImageActivity' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/thumbs/bkaovAYt-320.jpg",' + 
                                                    '"contentType": "image/jpg" } }' );
            }, 100);
            return "OK";
        }
        if ( action === 'org.opendatakit.survey.android.activities.MediaChooseVideoActivity' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/videos/bkaovAYt-52qL9xLP.mp4",' + 
                                                    '"contentType": "video/mp4" } }' );
            }, 100);
            return "OK";
        }
        if ( action === 'org.opendatakit.survey.android.activities.MediaChooseAudioActivity' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/videos/bkaovAYt-zWfluNSa.mp3",' + 
                                                    '"contentType": "audio/mp3" } }' );
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
            var value = JSON.parse(jsonObj);
            window.open(value.extras.url,'_blank', null, false);
            setTimeout(function() {
                that.log("D","Opened new browser window for Survey content. Close to continue");
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { } }' );
            }, 1000);
            return "OK";
        }
        if ( action === 'android.content.Intent.ACTION_VIEW' ) {
            var value = JSON.parse(jsonObj);
            window.open(value.uri,'_blank', null, false);
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
        window.close();
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
        window.close();
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
