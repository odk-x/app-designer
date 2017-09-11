/**
 * This represents the odkSurvey actions that can be performed from, e.g., odkTables
 * webviews if, e.g., you want to capture a barcode, etc.
 *
 * It should provide all the functions available to the javascript at this
 * version of the code. This does not currently have a dual Java injection. 
 * All calls are mapped to odkCommon.doAction() interactions.
 */
    
(function() {
'use strict';
/* global odkCommon */
window.odkSurvey = {
    initialScreenPath: "initial/0",

    /**
     * Returns true if a variable is an array.
     */
    isArray : function(varToTest) {
        if (Object.prototype.toString.call(varToTest) === '[object Array]') {
            return true;
        } else {
            return false;
        }
    },

    /**
     * Returns true if str is a string, else false.
     */
    isString: function(str) {
        return (typeof str === 'string');
    },
	
    getHashString:function(tableId, formId, instanceId, screenPath, elementKeyToValueMap) {
		var that = this;
		
		if ( tableId === null || tableId === undefined || !that.isString(tableId) ) {
			throw new Error("tableId must be a string");
		}
		if ( formId === null || formId === undefined ) {
			formId = tableId;
		}
		if ( !that.isString(formId) ) {
			throw new Error("formId must be a string");
		}
		if ( instanceId === undefined ) {
			instanceId = null;
		}
		if ( instanceId !== null && !that.isString(instanceId) ) {
			throw new Error("instanceId must be either a null or a string");
		}
		if ( screenPath === null || screenPath === undefined ) {
			screenPath = this.initialScreenPath;
		}
		if ( !that.isString(screenPath) ) {
			throw new Error("screenPath must be a 'screen/prompt' designation");
		}
		if ( elementKeyToValueMap === undefined ) {
			elementKeyToValueMap = null;
		}
		var uri = odkCommon.constructSurveyUri(tableId, formId, instanceId, screenPath, elementKeyToValueMap );

		// strip off the hash portion
		var hashString = uri.substring(uri.indexOf('#')+1);

		if ( hashString !== '' ) {
			hashString = '&' + hashString;
		}
		
		// and add a formPath=... to the front of the hash
		if ( tableId === 'framework' ) {
			return "#formPath=" + encodeURIComponent( that.getFormPath(tableId, tableId)) + hashString;
		} else {
			return "#formPath=" + encodeURIComponent( that.getFormPath(tableId, formId)) + hashString;
		}
    },
	
	
	
    getFormsProviderUri: function(platInfo, tableId, formId ) {

        var uri = platInfo.formsUri + platInfo.appName + '/' + tableId + '/' + formId;
        return uri;
    },
	
    convertHashStringToSurveyUri: function(hashString) {
		var that = this;

        // assume we have a hashString:
        // #formPath=...&instanceId=...&...
        // reformat it into a URI suitable for invoking ODK Survey
        odkCommon.log("D","convertHashStringToSurveyUri: hash " + hashString);
        if ( !hashString.match(/^(\??#).*/) ) {
            throw new Error('parsing of hashString failed - not a relative path (does not begin with ?# or #');
        }

        // we expect it to start with ?# or #
        if ( hashString.charAt(0) === '?' ) {
            hashString = hashString.substring(1);
        }
        if ( hashString.charAt(0) === '#' ) {
            hashString = hashString.substring(1);
        }
        var keyValues = hashString.split("&");
        var reconstitutedKeyValues = "";
        var formPath = null;
        var instanceId = null;
        var i;
        var parts;
        for ( i = 0 ; i < keyValues.length ; ++i ) {
            parts = keyValues[i].split('=');
            if ( parts.length > 2 ) {
                throw new Error('parsing of hashString failed - incorrect &key=value sequence');
            }
            var key = parts[0];
            if ( key === 'formPath' ) {
                formPath = parts[1];
            } else if ( key === 'instanceId' ) {
                instanceId = decodeURIComponent(parts[1]);
            } else {
                reconstitutedKeyValues = reconstitutedKeyValues +
                    "&" + keyValues[i];
            }
        }
        if ( instanceId !== null ) {
            reconstitutedKeyValues =
                "&instanceId=" + encodeURIComponent(instanceId) +
                reconstitutedKeyValues;
        }
        if ( formPath === null ) {
            throw new Error('parsing of hashString failed - no formPath found');
        }
        parts = decodeURIComponent(formPath).split("/");
        // the formPath ends in a slash, so we want the entry before the last one...
        var formId = parts[parts.length-2];

        var tableId = parts[parts.length-4];

		var platInfo = JSON.parse(odkCommon.getPlatformInfo());

        var uri = that.getFormsProviderUri(platInfo, tableId, formId) +
            "/#" + reconstitutedKeyValues.substring(1);

        odkCommon.log("D","convertHashStringToSurveyUri: as Uri " + uri);
        return uri;
    },
	
    getFormPath: function(tableId, formId) {

        if ( tableId === "framework" ) {
            return '../config/assets/framework/forms/framework/';
        } else {
            return '../config/tables/' + tableId + '/forms/' + formId + '/';
        }
    },

	openInstance: function(dispatchStruct, tableId, formId, instanceId, initialValuesElementKeyToValueMap) {
		var that = this;
		var platInfo = JSON.parse(odkCommon.getPlatformInfo());

		var uri = odkCommon.constructSurveyUri(tableId, formId, instanceId, that.initialScreenPath, initialValuesElementKeyToValueMap );

		var hashString = uri.substring(uri.indexOf('#')+1);

		if ( hashString !== '' ) {
			hashString = '&' + hashString;
		}
		
		var extrasBundle = { url: platInfo.baseUri + 'system/index.html' + "#formPath=" + encodeURIComponent( that.getFormPath(tableId, formId)) + hashString
		};
		
		var intentArgs = {
			// uri:      // set the data field of intent to this
			uri: uri,
			// data:     // unless data is supplied -- that takes precedence
			type: "vnd.android.cursor.item/vnd.opendatakit.form", // mime type
			// package:  // set the intent package to this value
			action: "android.intent.action.EDIT",
			category: "android.intent.category.DEFAULT",
			
			extras: extrasBundle
		};

        return odkCommon.doAction(dispatchStruct, 
			'org.opendatakit.survey.activities.MainMenuActivity', 
			intentArgs );
	},
	
	addInstance: function(dispatchStruct, tableId, formId, initialValuesElementKeyToValueMap) {
		var that = this;

		// start a new instanceId
        var instanceId = odkCommon.genUUID();
		return that.openInstance(dispatchStruct, tableId, formId, instanceId, initialValuesElementKeyToValueMap);
	},
	
	openLink: function(dispatchStruct, relativeOrFullUrl ) {
        var that = this;

        var expandedUrl;
		var launchAction;
		
        if ( relativeOrFullUrl.match(/^(\/|\.|[a-zA-Z]+:).*/) ) {
			// begins with slash (/) or dot (.) or schema (e.g., http:)
            expandedUrl = relativeOrFullUrl;
			launchAction = 'android.content.Intent.ACTION_VIEW';
        } else {
			var platInfo = JSON.parse(odkCommon.getPlatformInfo());
	
            // relative URL. Assume this stays within Survey
            expandedUrl = platInfo.baseUri + 'system/index.html' + relativeOrFullUrl;
            relativeOrFullUrl = that.convertHashStringToSurveyUri(relativeOrFullUrl);
            // implicit intents are not working?
            // launchAction = 'android.content.Intent.ACTION_EDIT';
            launchAction = 'org.opendatakit.survey.activities.SplashScreenActivity';
        }
		
		var extrasBundle = { url: expandedUrl
		};
		
		var intentArgs = {
			uri: relativeOrFullUrl,
			extras: extrasBundle,
			// uri:      // set the data field of intent to this
			// data:     // unless data is supplied -- that takes precedence
			// type:     // set the intent type to this value
			// package:  // set the intent package to this value
		};

        return odkCommon.doAction(dispatchStruct, 
			launchAction, 
			intentArgs );
	},
	
	fileAttachmentAction: function(dispatchStruct, intentAction, tableId, instanceId, existingFileAttachmentFieldContent) {

		var extrasBundle = {
                tableId: tableId,
                instanceId: instanceId,
                uriFragmentNewFileBase: "opendatakit-macro(uriFragmentNewInstanceFile)" };
			
		if ( existingFileAttachmentFieldContent !== undefined && existingFileAttachmentFieldContent !== null ) {
			if ( existingFileAttachmentFieldContent.contentType !== undefined &&
                 existingFileAttachmentFieldContent.contentType !== null &&
			     existingFileAttachmentFieldContent.uriFragment !== undefined &&
				 existingFileAttachmentFieldContent.uriFragment !== null ) {
				extrasBundle.currentContentType = existingFileAttachmentFieldContent.contentType;
				extrasBundle.currentUriFragment = existingFileAttachmentFieldContent.uriFragment;
			}
		}
		
        return odkCommon.doAction( dispatchStruct, intentAction, { extras: extrasBundle });
	},
	
	captureImage: function(dispatchStruct, tableId, instanceId, existingFileAttachmentFieldContent) {
		var that = this;
		
		return that.fileAttachmentAction(dispatchStruct, 
			'org.opendatakit.survey.activities.MediaCaptureImageActivity', 
			tableId, instanceId, existingFileAttachmentFieldContent);
	},
	captureSignature: function(dispatchStruct, tableId, instanceId, existingFileAttachmentFieldContent) {
		var that = this;
		
		return that.fileAttachmentAction(dispatchStruct, 
			'org.opendatakit.survey.activities.SignatureActivity', 
			tableId, instanceId, existingFileAttachmentFieldContent);
	},
	captureAudio: function(dispatchStruct, tableId, instanceId, existingFileAttachmentFieldContent) {
		var that = this;
		
		return that.fileAttachmentAction(dispatchStruct, 
			'org.opendatakit.survey.activities.MediaCaptureAudioActivity', 
			tableId, instanceId, existingFileAttachmentFieldContent);
	},
	captureVideo: function(dispatchStruct, tableId, instanceId, existingFileAttachmentFieldContent) {
		var that = this;
		
		return that.fileAttachmentAction(dispatchStruct, 
			'org.opendatakit.survey.activities.MediaCaptureVideoActivity', 
			tableId, instanceId, existingFileAttachmentFieldContent);
	},
	chooseImage: function(dispatchStruct, tableId, instanceId, existingFileAttachmentFieldContent) {
		var that = this;
		
		return that.fileAttachmentAction(dispatchStruct, 
			'org.opendatakit.survey.activities.MediaChooseImageActivity', 
			tableId, instanceId, existingFileAttachmentFieldContent);
	},
	chooseAudio: function(dispatchStruct, tableId, instanceId, existingFileAttachmentFieldContent) {
		var that = this;
		
		return that.fileAttachmentAction(dispatchStruct, 
			'org.opendatakit.survey.activities.MediaChooseAudioActivity', 
			tableId, instanceId, existingFileAttachmentFieldContent);
	},
	chooseVideo: function(dispatchStruct, tableId, instanceId, existingFileAttachmentFieldContent) {
		var that = this;
		
		return that.fileAttachmentAction(dispatchStruct, 
			'org.opendatakit.survey.activities.MediaChooseVideoActivity', 
			tableId, instanceId, existingFileAttachmentFieldContent);
	},

	scanBarcode: function(dispatchStruct) {
		
		var intentArgs = {
			// extras: extrasBundle,
			// uri:      // set the data field of intent to this
			// data:     // unless data is supplied -- that takes precedence
			// type:     // set the intent type to this value
			// package:  // set the intent package to this value
		};

        return odkCommon.doAction(dispatchStruct, 
			'com.google.zxing.client.android.SCAN', 
			intentArgs );
	},

	captureGeopoint: function(dispatchStruct) {
		
		var intentArgs = {
			// extras: extrasBundle,
			// uri:      // set the data field of intent to this
			// data:     // unless data is supplied -- that takes precedence
			// type:     // set the intent type to this value
			// package:  // set the intent package to this value
		};

        return odkCommon.doAction(dispatchStruct, 
			'org.opendatakit.survey.activities.GeoPointActivity', 
			intentArgs );
	},

	captureGeopointUsingMap: function(dispatchStruct) {
		
		var intentArgs = {
			// extras: extrasBundle,
			// uri:      // set the data field of intent to this
			// data:     // unless data is supplied -- that takes precedence
			// type:     // set the intent type to this value
			// package:  // set the intent package to this value
		};

        return odkCommon.doAction(dispatchStruct, 
			'org.opendatakit.survey.activities.GeoPointMapActivity', 
			intentArgs );
	}
};
})();
