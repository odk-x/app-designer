/**
 * The odkCommonIf injected interface will be used in conjunction with this class to 
 * create closures for callback functions to be invoked once a response is available
 * from the Java side.
 */
'use strict';
/* jshint unused: vars */
window.odkCommon = {
    _listener: null,
    /**
     * The Java side can asynchronously inform the JS side of state
     * changing actions. The two actions currently supported are:
     *  (1) results of a doAction() request.
     *
     *  (2) Java-initiated actions (as #-prefixed strings).
     *
     * Because these can occur at any time, the JS code should 
     * register a listener that will be invoked when an action is 
     * available. i.e., the Java code can direct a change in 
     * the JS code without it being initiated by the JS side.
     *
     * Actions are queued and resilient to failure.
     * they are fetched via 
     *      odkCommon.viewFirstQueuedAction().
     * And they are removed from the queue via
     *      odkCommon.removeFirstQueuedAction();
     *
     *
     * Users of odkCommon should register their own handler by 
     * calling:
     *
     * odkCommon.registerListener(
     *            function() { 
     *               var action = odkCommon.viewFirstQueuedAction();
     *               if ( action !== null ) {
     *                   // process action -- be idempotent!
     *                   // if processing fails, the action will still
     *                   // be on the queue.
     *                   odkCommon.removeFirstQueuedAction();
     *               }
     *            });
     */
    registerListener: function(listener) {
        var that = this;
        that._listener = listener;
        // whenever a listener is registered, we queue to fire a trigger.
        // This ensures that the listener will process any queued up actions.
        setTimeout(function() { that.signalQueuedActionAvailable(); }, 0);
    },
    /**
     * callback from Java side to notify of data available.
     */
    signalQueuedActionAvailable: function() {
        // forward for now...
        if ( this._listener !== null && this._listener !== undefined ) {
            // invoke the handler
            (this._listener)();
        }
    },
    /**
     * Return the platform info as a stringified json object. This is an object
     * containing the keys: container, version, appName, baseUri, logLevel.
     *
     * @return a stringified json object with the above keys
     */
    getPlatformInfo: function() {
      return odkCommonIf.getPlatformInfo();
    },

    /**
     * Take the path of a file relative to the app folder and return a url by
     * which it can be accessed.
     *
     * @param relativePath
     * @return an absolute URI to the file
     */
    getFileAsUrl: function(relativePath) {
      return odkCommonIf.getFileAsUrl(relativePath);
    },

   /**
    * Convert the rowpath value for a media attachment (e.g., uriFragment) field
    * into a url by which it can be accessed.
    *
    * @param tableId
    * @param rowId
    * @param rowPathUri
    * @return
    */
   getRowFileAsUrl: function(tableId, rowId, rowPathUri) {
      return odkCommonIf.getRowFileAsUrl(tableId, rowId, rowPathUri);
   },

   /**
    * Log messages using WebLogger.
    *
    *
    * @param level - levels are A, D, E, I, S, V, W
    * @param loggingString - actual message to log
    * @return
    */
   log: function(level, loggingString) {
      odkCommonIf.log(level, loggingString);
   },

   /**
    * Get active user
    *
    * @return
    */
   getActiveUser: function() {
      return odkCommonIf.getActiveUser();
   },

   /**
    * Get device properties
    *
    * @param propertyId
    * @return
    */
   getProperty: function(propertyId) {
      return odkCommonIf.getProperty(propertyId);
   },

   /**
    * Get the base url
    *
    * @return
    */
   getBaseUrl: function() {
      return odkCommonIf.getBaseUrl();
   },

   /**
    * Store a persistent key-value. This lasts for the duration of this screen and is
    * retained under screen rotations. Useful if browser cookies don't work.
    *
    * @param elementPath
    * @param jsonValue
    */
   setSessionVariable: function(elementPath, jsonValue) {
      odkCommonIf.setSessionVariable(elementPath, jsonValue);
   },

   /**
    * Retrieve a persistent key-value. This lasts for the duration of this screen and is
    * retained under screen rotations. Useful if browser cookies don't work.
    *
    * @param elementPath
    */
   getSessionVariable: function(elementPath) {
      return odkCommonIf.getSessionVariable(elementPath);
   },

   /**
    * Execute an action (intent call).
    *
    * @param dispatchString  Can be anything -- holds reconstructive state for JS
    *
    * @param action    The intent. e.g.,
    *                   org.opendatakit.survey.android.activities.MediaCaptureImageActivity
    *
    * @param jsonMap  JSON.stringify of Map of the following structure:
    *                   {
    *                         "uri" : intent.setData(value)
    *                         "data" : intent.setData(value)  (preferred over "uri")
    *                         "package" : intent.setPackage(value)
    *                         "type" : intent.setType(value)
    *                         "extras" : { key-value map describing extras bundle }
    *                   }
    *
    *                  Within the extras, if a value is of the form:
    *                     opendatakit-macro(name)
    *                  then substitute this with the result of getProperty(name)
    *
    *                  If the action begins with "org.opendatakit." then we also
    *                  add an "appName" property into the intent extras if it was
    *                  not specified.
    *
    * @return one of:
    *          "IGNORE"                -- there is already a pending action
    *          "JSONException: " + ex.toString()
    *          "OK"                    -- request issued
    *          "Application not found" -- could not find app to handle intent
    *
    * If the request has been issued, the javascript will be notified of the availability
    * of a result via the
    */
   doAction: function(dispatchString, action, jsonMap) {
      return odkCommonIf.doAction(dispatchString, action, jsonMap);
   },

   /**
    * @return the oldest queued action outcome.
    *   or Url change. Return null if there are none.
    *   The action remains queued until removeFirstQueuedAction
    *   is called.
    *
    *   The return value is either a JSON serialization of:
    *
    *   {  dispatchString: dispatchString,
    *      action: refAction,
    *      jsonValue: {
    *        status: resultCodeOfAction, // 0 === success
    *        result: JSON representation of Extras bundle from result intent
    *      }
    *   }
    *
    *   or, a JSON serialized string value beginning with #
    *
    *   "#urlhash"   // if the Java code wants the Javascript to take some action without a reload
    */
   viewFirstQueuedAction: function() {
      return odkCommonIf.viewFirstQueuedAction();
   },
   /**
    * Remove the first queued action.
    */
   removeFirstQueuedAction: function() {
      return odkCommonIf.removeFirstQueuedAction();
   }
};

if ( window.odkCommonIf === undefined || window.odkCommonIf === null ) {
	window.odkCommonIf = {
        _sessionVariables: {},
        _queuedActions: [],
        _logLevel: 'D',
        getPlatformInfo : function() {
            var that = this;
            // 9000 b/c that's what grunt is running on. Perhaps should configure
            // this
            var platformInfo = {
                container: 'Chrome',
                version: '31.0.1650.63',
                appName: 'testing',
                baseUri: that._computeBaseUri(),
                formsUri: "content://org.opendatakit.common.android.provider.forms/",
                activeUser: 'username:badger',
                logLevel: this._logLevel
            };
            // Because the phone returns a String, we too are going to return a
            // string here.
            var result = JSON.stringify(platformInfo);
            return result;
        },

        getFileAsUrl: function(relativePath) {
            var that = this;
            // strip off backslashes
            var cleanedStr = relativePath.replace(/\\/g, '');
            var baseUri = that._computeBaseUri();
            var result = baseUri + cleanedStr;
            return result;
        },
        getRowFileAsUrl: function(tableId, rowId, relativePath) {
            var that = this;
            if ( tableId === null || tableId === undefined ) {return null;}
            if ( rowId === null || rowId === undefined ) {return null;}
            if ( relativePath === null || relativePath === undefined ) {return null;}

            if ( relativePath.charAt(0) === '/' ) {
                relativePath = relativePath.substring(1);
            }
            var baseUri = that._computeBaseUri();

            var result = null;

			if ( !window.XRegExp ) {
				throw new Error('XRegExp has not been loaded prior to first call to getRowFileAsUrl()');
			}
			
            if ( that._forbiddenInstanceDirCharsPattern === null ||
                 that._forbiddenInstanceDirCharsPattern === undefined ) {
                // defer loading this until we try to use it
                that._forbiddenInstanceDirCharsPattern = window.XRegExp('(\\p{P}|\\p{Z})', 'A');
            }

            var iDirName = window.XRegExp.replace(rowId, 
                            that._forbiddenInstanceDirCharsPattern, '_', 'all');

            var prefix = 'tables/' + tableId + '/instances/' + iDirName + '/';
            if ( relativePath.length > prefix.length && relativePath.substring(0,prefix.length) === prefix ) {
                console.error('getRowFileAsUrl - detected filepath in rowpath data');
                result = baseUri + relativePath;
            } else {
                result = baseUri + prefix + relativePath;
            }
            
            return result;
        },
        log: function(severity, msg) {
            var logIt = false;
            var ll = this._logLevel;
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
            console.log();
        },

        getActiveUser: function() {
            this.log('D','odkCommon: DO: getProperty(activeUser)');
            return 'active-user-property(mailto:eaddr or username:uname)';
        },
        
        getProperty: function(propertyId) {
            this.log('D','odkCommon: DO: getProperty(' + propertyId + ')');
            return 'property-of(' + propertyId + ')';
        },

        getBaseUrl: function() {
            return '../system';
        },
        setSessionVariable: function(elementPath, value) {
            var that = this;
            var parts = elementPath.split('.');
            var i;
            var pterm = that._sessionVariables;
            var term = that._sessionVariables;
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
        getSessionVariable: function(elementPath) {
            var that = this;
            var parts = elementPath.split('.');
            var i;
            var term = that._sessionVariables;
            for ( i = 0 ; i < parts.length ; ++i ) {
                if ( parts[i] in term ) {
                    term = term[parts[i]];
                } else {
                    return null;
                }
            }
            return term;
        },
        doAction: function(dispatchString, action, jsonObj ) {
            var that = this;
			var lat, lng, alt, acc;

            var value;
            that.log("D","shim: DO: doAction(" + dispatchString + ", " + action + ", ...)");
            if ( action === 'org.opendatakit.survey.android.activities.MediaCaptureImageActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { uriFragment: "system/survey/test/venice.jpg", 
                                                       contentType: "image/jpg" } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 100);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.MediaCaptureVideoActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { uriFragment: "system/survey/test/bali.3gp", 
                                                       contentType: "video/3gp" } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 100);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.MediaCaptureAudioActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { uriFragment: "system/survey/test/raven.wav",
                                                       contentType: "audio/wav" } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 100);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.MediaChooseImageActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { uriFragment: "system/survey/test/venice.jpg",
                                                       contentType: "image/jpg" } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 100);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.MediaChooseVideoActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { uriFragment: "system/survey/test/bali.3gp",
                                                       contentType: "video/3gp" } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 100);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.MediaChooseAudioActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { uriFragment: "system/survey/test/raven.wav",
                                                       contentType: "audio/wav" } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 100);
                return "OK";
            }
            if ( action === 'org.opendatakit.sensors.PULSEOX' ) {
                var oxValue = prompt("Enter ox:");
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { pulse: 100,
                                                       ox: oxValue } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
            if ( action === 'change.uw.android.BREATHCOUNT' ) {
                var breathCount = prompt("Enter breath count:");
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: {  value: breathCount } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
            if ( action === 'com.google.zxing.client.android.SCAN' ) {
                var barcode = prompt("Enter barcode:");
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: {  SCAN_RESULT: barcode } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.GeoPointMapActivity' ) {
                lat = prompt("Enter latitude:");
                lng = prompt("Enter longitude:");
                alt = prompt("Enter altitude:");
                acc = prompt("Enter accuracy:");
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { latitude: lat,
                                                       longitude: lng,
                                                       altitude: alt,
                                                       accuracy: acc } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.GeoPointActivity' ) {
                lat = prompt("Enter latitude:");
                lng = prompt("Enter longitude:");
                alt = prompt("Enter altitude:");
                acc = prompt("Enter accuracy:");
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1, result: { latitude: lat,
                                                       longitude: lng,
                                                       altitude: alt,
                                                       accuracy: acc } } }));
                setTimeout(function() {
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.MainMenuActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1 } }));
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
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
            if ( action === 'org.opendatakit.survey.android.activities.SplashScreenActivity' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1 } }));
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
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
            if ( action === 'android.content.Intent.ACTION_VIEW' ) {
                that._queuedActions.push(
                  JSON.stringify({ dispatchString: dispatchString, action: action, 
                    jsonValue: { status: -1 } }));
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
                    odkCommon.signalQueuedActionAvailable();
                }, 1000);
                return "OK";
            }
        },
        /**
         * Return the first queued action without removing it.
         */
        viewFirstQueuedAction: function() {
            if ( this._queuedActions.length !== 0 ) {
                var result = this._queuedActions[0];
                return result;
            }
            return null;
        },
        /**
         * Remove the first queued action.
         */
        removeFirstQueuedAction: function() {
            if ( this._queuedActions.length !== 0 ) {
                this._queuedActions.shift();
            }
        },
        /**
         * Return the location of the currently executing file.
         */
        _getCurrentFileLocation: function () {
          // We need to get the location of the currently
          // executing file. This is not readily exposed, and it is not as simple as
          // finding the current script tag, since callers might be loading the file
          // using RequireJS or some other loading library. We're going to instead
          // pull the file location out of a stack trace.
          var error = new Error();
          var stack = error.stack;
          
          // We expect the stack to look something like:
          // TypeError: undefined is not a function
          //     at Object.window.odkCommon.getPlatformInfo
          //     (http://homes.cs.washington.edu/~sudars/odk/survey-js-adaptr/app/system/js/odkCommon.js:45:29)
          //     blah blah blah
          // So now we'll extract the file location. We'll do this by assuming that
          // the location occurs in the first parentheses.
          var openParen = stack.indexOf('(');
          var closedParen = stack.indexOf(')');

          var fileLocation = stack.substring(openParen + 1, closedParen);

          return fileLocation;
        },
        /**
         * Compute and return the base URI for this machine. This will allow the code
         * to function independently of the host name.
         * 
         * Returns a string representing the base uri in the format:
         * http://DOMAIN/DIRS/. Note the trailing slash.
         */
        _computeBaseUri: function () {
          // To compute this we are going to rely on the location of the containing
          // file relative to the location we are serving as are root. If this is
          // changed, this file must be updated appropriately.
          // Since we are expecting this file to live in app/system/tables/js/, we
          // can look for the first occurrence and take everything before it.

          var expectedFileLocation = 'system/js/odkCommon.js';

          var fileLocation = this._getCurrentFileLocation();

          var indexToFile = fileLocation.indexOf(expectedFileLocation);

          var result = fileLocation.substring(0, indexToFile);

          return result;

        }
    };
}


