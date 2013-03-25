/*
This shim  object is just a facade for browser testing.
It defines the interface that ODK Survey or other container apps 
must implement to work with the javascript library.
It will be replaced by one injected by Android Java code.
*/
window.shim = window.shim || {
    instanceId: null,
	pageRef: null,
	previousScreenIndices: [],
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
    setInstanceId: function(instanceId) {
        // report the new instanceId to ODK Survey...
        // needed so that callbacks, etc. can properly track the instanceId 
        // currently being worked on.
        this.instanceId = instanceId;
    },
    setPageRef: function(pageRef) {
        // report the new pageRef to ODK Survey...
        // needed so that the WebKit can be restored to the same state upon
		// orientation change and after intent completions.
        this.pageRef = pageRef;
    },
    hasPromptHistory: function() {
        return (this.previousScreenIndices.length !== 0);
    },
    clearPromptHistory: function() {
        this.previousScreenIndices.length = 0;
    },
	popPromptHistory: function() {
		return this.previousScreenIndices.pop();
	},
	pushPromptHistory: function(idx) {
        this.previousScreenIndices.push(idx);
	},
	/*
	 * severity - one of 'E' (error), 'W' (warn), 'S' (success), 'I' (info), 'D' (debug), 'T' (trace)
	 * msg -- message to log
	 */
    log: function(severity, msg) {
        if ( window.location.search != null && window.location.search.indexOf("log") >= 0 ) {
            console.log(severity + '/' + msg);
        }
    },
    doAction: function( promptPath, internalPromptContext, action, jsonObj ) {
        if ( action == 'org.opendatakit.survey.android.activities.MediaCaptureImageActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/thumbs/bkaovAYt-320.jpg",' + 
                                                    '"contentType": "image/jpg" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.survey.android.activities.MediaCaptureVideoActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/videos/bkaovAYt-52qL9xLP.mp4",' + 
                                                    '"contentType": "video/mp4" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.survey.android.activities.MediaCaptureAudioActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/videos/bkaovAYt-zWfluNSa.mp3",' + 
                                                    '"contentType": "audio/mp3" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.survey.android.activities.MediaChooseImageActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/thumbs/bkaovAYt-320.jpg",' + 
                                                    '"contentType": "image/jpg" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.survey.android.activities.MediaChooseVideoActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/videos/bkaovAYt-52qL9xLP.mp4",' + 
                                                    '"contentType": "video/mp4" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.survey.android.activities.MediaChooseAudioActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "http://content.bitsontherun.com/videos/bkaovAYt-zWfluNSa.mp3",' + 
                                                    '"contentType": "audio/mp3" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.sensors.PULSEOX' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "pulse": 100, "ox": ' + prompt("Enter ox:") + ' } }' );
            }, 1000);
            return "OK";
        }
        if ( action == 'change.uw.android.BREATHCOUNT' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "value": ' + prompt("Enter breath count:") + ' } }' );
            }, 1000);
            return "OK";
        }
        if ( action == 'com.google.zxing.client.android.SCAN' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "SCAN_RESULT": "' + prompt("Enter barcode:") + '" } }' );
            }, 1000);
            return "OK";
        }
        if ( action == 'org.opendatakit.survey.android.activities.GeoPointMapActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
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
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "latitude": ' + prompt("Enter latitude:") + 
                                                ', "longitude": ' + prompt("Enter longitude:") +
                                                ', "altitude": ' + prompt("Enter altitude:") +
                                                ', "accuracy": ' + prompt("Enter accuracy:") +
                                                ' } }' );
            }, 1000);
            return "OK";
        }
    },
    saveAllChangesCompleted: function( form_id, instanceId, asComplete ) {
        alert("notify container OK save " + (asComplete ? 'COMPLETE' : 'INCOMPLETE') + '.');
    },
    saveAllChangesFailed: function( form_id, instanceId ) {
        alert("notify container FAILED save " + (asComplete ? 'COMPLETE' : 'INCOMPLETE') + '.');
    },
    ignoreAllChangesCompleted: function( form_id, instanceId ) {
        alert("notify container OK ignore all changes.");
    },
    ignoreAllChangesFailed: function( form_id, instanceId ) {
        alert("notify container FAILED ignore all changes.");
    }
};
