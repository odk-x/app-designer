/*
This shim  object is just a facade for browser testing.
It defines the interface that ODK Survey or other container apps 
must implement to work with the javascript library.
It will be replaced by one injected by Android Java code.
*/
window.shim = window.shim || {
    refId: null,
    instanceId: null,
	sectionStateScreenHistory: [],
    screenPath: null,
    previousScreenIndices: [],
    previousSections: [],
    controllerState: null,
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
	pushSectionScreenState: function( refId) {
        if (refId != this.refId) return;

		if ( this.sectionStateScreenHistory.length == 0 ) {
			return;
		}
		
		var lastSection = this.sectionStateScreenHistory[this.sectionStateScreenHistory.length-1];
		if ( lastSection.screen != null ) {
			lastSection.screenHistory.push( { screen: lastSection.screen, state: lastSection.state } );
		}
	},
	setSectionScreenState: function( refId, screenPath, state) {
        if (refId != this.refId) return;

		var splits = screenPath.split('/');
		var sectionName = splits[0];
		if (this.sectionStateScreenHistory.length == 0) {
			this.sectionStateScreenHistory.push( { sectionName: sectionName, screenHistory: [], screen: screenPath, state: state } );
		} else {
			var lastSection = this.sectionStateScreenHistory[this.sectionStateScreenHistory.length-1];
			if ( lastSection.sectionName == sectionName ) {
				lastSection.screen = screenPath;
				lastSection.state = state;
			} else {
				this.sectionStateScreenHistory.push( { sectionName: sectionName, screenHistory: [], screen: screenPath, state: state } );
			}
		}
	},
	clearSectionScreenState: function( refId ) {
        if (refId != this.refId) return;

		//  { sectionName: 'initial', screenHistory: [ { screen: 'initial/0', state: null } ] 
		this.sectionStateScreenHistory = [];
	},
	getControllerState: function( refId ) {
		if (refId != this.refId) return null;
		
		if ( this.sectionStateScreenHistory.length == 0 ) {
			return null;
		}
		var lastSection = this.sectionStateScreenHistory[this.sectionStateScreenHistory.length-1];
		return lastSection.state;
	},
	getScreenPath: function(refId) {
        if (refId != this.refId) return null;
		
		if ( this.sectionStateScreenHistory.length == 0 ) {
			return null;
		}
		var lastSection = this.sectionStateScreenHistory[this.sectionStateScreenHistory.length-1];
		return lastSection.screen;
	},
    hasScreenHistory: function( refId ) {
        if (refId != this.refId) return false;
		var i;
		for ( i = 0 ; i < this.sectionStateScreenHistory.length ; ++i ) {
			var thisSection = this.sectionStateScreenHistory[i];
			if ( thisSection.screenHistory.length !== 0 ) {
				return true;
			}
		}
		return false;
	},
	popScreenHistory: function( refId ) {
        if (refId != this.refId) return null;
		while ( this.sectionStateScreenHistory.length !== 0 ) {
			var lastSection = this.sectionStateScreenHistory[this.sectionStateScreenHistory.length-1];
			if ( lastSection.screenHistory.length !== 0 ) {
				var lastHistory = lastSection.screenHistory.pop();
				lastSection.screen = lastHistory.screen;
				lastSection.state = lastHistory.state;
				return lastSection.screen;
			}
			this.sectionStateScreenHistory.pop();
		}
		return null;
	},
	popScreenHistoryUntilState: function(refId, state) {
        if (refId != this.refId) return null;
		
		for(;;) {
			var screenPath = this.popScreenHistory(refId);
			if ( screenPath == null ) return null;
			var lastSection = this.sectionStateScreenHistory[this.sectionStateScreenHistory.length-1];
			if ( lastSection.state == state ) {
				return screenPath;
			}
		}
	},
    /**
     * Section stack -- maintains the stack of sections from which you can exit.
     */
    hasSectionStack: function( refId ) {
        if (refId != this.refId) return false;
		return this.sectionStateScreenHistory.length !== 0;
	},
	popSectionStack: function( refId ) {
        if (refId != this.refId) return null;
		
		if ( this.sectionStateScreenHistory.length != 0 ) {
			this.sectionStateScreenHistory.pop();
		}
		
		while ( this.sectionStateScreenHistory.length != 0 ) {
			var lastSection = this.sectionStateScreenHistory[this.sectionStateScreenHistory.length-1];
			if ( lastSection.screenHistory.length != 0 ) {
				var lastHistory = lastSection.screenHistory.pop();
				lastSection.screen = lastHistory.screen;
				lastSection.state = lastHistory.state;
				return lastSection.screen;
			}
			this.sectionStateScreenHistory.pop();
		}
		return null;
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
