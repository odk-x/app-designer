collect = {
	instanceId: null,
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
    doAction: function( page, path, action, jsonObj ) {
        if ( action == 'org.opendatakit.collect.android.activities.MediaCaptureImageActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( page, path, action, 
                    '{ "status": -1, "result": { "mediaPath": "file:///C:\\\\Users\\\\Administrator\\\\Pictures\\\\new_bubble.jpg" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.collect.android.activities.MediaCaptureVideoActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( page, path, action, 
                    '{ "status": -1, "result": { "mediaPath": "file:///C:\\\\Users\\\\Administrator\\\\Pictures\\\\new_bubble.3gpp" } }' );
            }, 100);
            return "OK";
        }
        if ( action == 'org.opendatakit.collect.android.activities.MediaCaptureAudioActivity' ) {
            setTimeout(function() {
                controller.opendatakitCallback( page, path, action, 
                    '{ "status": -1, "result": { "mediaPath": "file:///C:\\\\Users\\\\Administrator\\\\Pictures\\\\new_bubble.3gpp" } }' );
            }, 100);
            return "OK";
        }
    }
};
