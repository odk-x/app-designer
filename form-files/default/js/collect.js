/*
This collect object is just a facade for browser testing.
It will be replaced by one provided by Android.
*/
window.collect = window.collect || {
    instanceId: null,
    getBaseUrl: function() {
        return '../default';
    },
    getPlatformInfo: function() {
        // container identifies the WebKit or browser context.
        // version should identify the capabilities of that context.
        // appPath identifies root app path (path of the index.html file).
        return '{"container":"Chrome","version":"21.0.1180.83 m","appPath":""}';
    },
    getDatabaseSettings: function() {
        // version identifies the database schema that the database layer should use.
        // maxSize is in bytes
        return '{"shortName":"odk","version":"1","displayName":"ODK Instances Database","maxSize":65536}';
    },
    setInstanceId: function(instanceId) {
        // report the new instanceId to ODK Collect...
        // needed so that callbacks, etc. can properly track the instanceId 
        // currently being worked on.
        this.instanceId = instanceId;
    },
    doAction: function( promptPath, internalPromptContext, action, jsonObj ) {
        if ( action == 'org.opendatakit.collect.android.activities.MediaCaptureImageActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "file:///C:\\\\Users\\\\Administrator\\\\Pictures\\\\new_capture_bubble.jpg",' + 
                                                    '"contentType": "image/jpg" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.collect.android.activities.MediaCaptureVideoActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "file:///C:\\\\Users\\\\Administrator\\\\Pictures\\\\new_capture_bubble.3gpp",' + 
                                                    '"contentType": "video/3gpp" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.collect.android.activities.MediaCaptureAudioActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "file:///C:\\\\Users\\\\Administrator\\\\Pictures\\\\new_capture_bubble.3gpp",' + 
                                                    '"contentType": "audio/3gpp" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.collect.android.activities.MediaChooseImageActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "file:///C:\\\\Users\\\\Administrator\\\\Pictures\\\\new_choose_bubble.jpg",' + 
                                                    '"contentType": "image/jpg" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.collect.android.activities.MediaChooseVideoActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "file:///C:\\\\Users\\\\Administrator\\\\Pictures\\\\new_choose_bubble.3gpp",' + 
                                                    '"contentType": "video/3gpp" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.collect.android.activities.MediaChooseAudioActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( promptPath, internalPromptContext, action, 
                    '{ "status": -1, "result": { "uri": "file:///C:\\\\Users\\\\Administrator\\\\Pictures\\\\new_choose_bubble.3gpp",' + 
                                                    '"contentType": "audio/3gpp" } }' );
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
                    '{ "status": -1, "result": { "value": "' + prompt("Enter barcode:") + '" } }' );
            }, 1000);
            return "OK";
        }
        if ( action == 'org.opendatakit.collect.android.activities.GeoPointMapActivity' ) {
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
        if ( action == 'org.opendatakit.collect.android.activities.GeoPointActivity' ) {
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
    saveAllChangesCompleted: function( formId, instanceId, asComplete ) {
        alert("notify container OK save " + (asComplete ? 'COMPLETE' : 'INCOMPLETE') + '.');
    },
    saveAllChangesFailed: function( formId, instanceId ) {
        alert("notify container FAILED save " + (asComplete ? 'COMPLETE' : 'INCOMPLETE') + '.');
    },
    ignoreAllChangesCompleted: function( formId, instanceId ) {
        alert("notify container OK ignore all changes.");
    },
    ignoreAllChangesFailed: function( formId, instanceId ) {
        alert("notify container FAILED ignore all changes.");
    }
};
