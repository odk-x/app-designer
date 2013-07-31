/*
This shim  object is just a facade for browser testing.
It defines the interface that ODK Survey or other container apps 
must implement to work with the javascript library.
It will be replaced by one injected by Android Java code.
*/
window.shim = window.shim || {
    refId: null,
    instanceId: null,
    screenPath: null,
    previousScreenIndices: [],
    previousSections: [],
    auxillaryHash: null,
    getBaseUrl: function() {
        return '../default';
    },
    getPlatformInfo: function() {
        // container identifies the WebKit or browser context.
        // version should identify the capabilities of that context.
        return '{"container":"Chrome","version":"21.0.1180.83 m"}';
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
        /* if ( window.location.search != null && window.location.search.indexOf("log") >= 0 ) */ {
            console.log(severity + '/' + msg);
        }
    },
    clearInstanceId: function( refId ) {
        if (refId != this.refId) return;
        this.instanceId = null;
    },
    setInstanceId: function( refId, instanceId ) {
        if (refId != this.refId) return;
        // report the new instanceId to ODK Survey...
        // needed so that callbacks, etc. can properly track the instanceId 
        // currently being worked on.
        this.instanceId = instanceId;
    },
    setScreenPath: function( refId, screenPath ) {
        if (refId != this.refId) return;
        // report the new screenPath to ODK Survey...
        // needed so that the WebKit can be restored to the same state upon
        // orientation change and after intent completions.
        this.screenPath = screenPath;
    },
    getScreenPath: function( refId ) {
        if (refId != this.refId) return null;
        return this.screenPath;
    },
    hasScreenHistory: function( refId ) {
        if (refId != this.refId) return false;
        return (this.previousScreenIndices.length !== 0);
    },
    clearScreenHistory: function( refId ) {
        if (refId != this.refId) return;
        this.previousScreenIndices.length = 0;
    },
    popScreenHistory: function( refId ) {
        if (refId != this.refId) return null;
        return this.previousScreenIndices.pop();
    },
    pushScreenHistory: function(refId, idx) {
        if (refId != this.refId) return;
        this.previousScreenIndices.push(idx);
    },
    /**
     * Section stack -- maintains the stack of sections from which you can exit.
     */
    hasSectionStack: function( refId ) {
        if (refId != this.refId) return false;
        return (this.previousSections.length !== 0);
    },
    clearSectionStack: function( refId ) {
        if (refId != this.refId) return;
        this.previousSections.length = 0;
    },
    popSectionStack: function( refId ) {
        if (refId != this.refId) return null;
        return this.previousSections.pop();
    },
    pushSectionStack: function( refId, section_name) {
        if (refId != this.refId) return;
        this.previousSections.push(section_name);
    },
    doAction: function( refId, promptPath, internalPromptContext, action, jsonObj ) {
        if (refId != this.refId) return "IGNORE";
        if ( action == 'org.opendatakit.survey.android.activities.MediaCaptureImageActivity' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/thumbs/bkaovAYt-320.jpg",' + 
                                                    '"contentType": "image/jpg" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.survey.android.activities.MediaCaptureVideoActivity' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/videos/bkaovAYt-52qL9xLP.mp4",' + 
                                                    '"contentType": "video/mp4" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.survey.android.activities.MediaCaptureAudioActivity' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/videos/bkaovAYt-zWfluNSa.mp3",' + 
                                                    '"contentType": "audio/mp3" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.survey.android.activities.MediaChooseImageActivity' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/thumbs/bkaovAYt-320.jpg",' + 
                                                    '"contentType": "image/jpg" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.survey.android.activities.MediaChooseVideoActivity' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/videos/bkaovAYt-52qL9xLP.mp4",' + 
                                                    '"contentType": "video/mp4" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.survey.android.activities.MediaChooseAudioActivity' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/videos/bkaovAYt-zWfluNSa.mp3",' + 
                                                    '"contentType": "audio/mp3" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.sensors.PULSEOX' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "pulse": 100, "ox": ' + prompt("Enter ox:") + ' } }' );
            }, 1000);
            return "OK";
        }
        if ( action == 'change.uw.android.BREATHCOUNT' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "value": ' + prompt("Enter breath count:") + ' } }' );
            }, 1000);
            return "OK";
        }
        if ( action == 'com.google.zxing.client.android.SCAN' ) {
            setTimeout(function() {
                landing.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "SCAN_RESULT": "' + prompt("Enter barcode:") + '" } }' );
            }, 1000);
            return "OK";
        }
        if ( action == 'org.opendatakit.survey.android.activities.GeoPointMapActivity' ) {
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
        if ( action == 'org.opendatakit.survey.android.activities.GeoPointActivity' ) {
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
    },
    saveAllChangesCompleted: function( refId, instanceId, asComplete ) {
        if (refId != this.refId) return;
        alert("notify container OK save " + (asComplete ? 'COMPLETE' : 'INCOMPLETE') + '.');
    },
    saveAllChangesFailed: function( refId, instanceId ) {
        if (refId != this.refId) return;
        alert("notify container FAILED save " + (asComplete ? 'COMPLETE' : 'INCOMPLETE') + '.');
    },
    ignoreAllChangesCompleted: function( refId, instanceId ) {
        if (refId != this.refId) return;
        alert("notify container OK ignore all changes.");
    },
    ignoreAllChangesFailed: function( refId, instanceId ) {
        if (refId != this.refId) return;
        alert("notify container FAILED ignore all changes.");
    }
};
