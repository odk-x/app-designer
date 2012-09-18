'use strict';
// Cdependency upon: opendatakit, database 
define(['mdl','opendatakit','database'],function(mdl,opendatakit,database) {
return {

    parseQueryHelper:function(dataKeyValueList, key, value) {
        if ( key == 'formPath' ) return;
        if ( key == 'instanceId' ) return;
		if ( key == 'pageRef' ) return;
        for (var i = 0 ; i < dataKeyValueList.length ; ++i ) {
            var e = dataKeyValueList[i];
            if ( e.key == key ) {
                // update value...
                e.value = value;
                return;
            }
        }
        dataKeyValueList[dataKeyValueList.length] = { key: key, type: 'string', value: value };
    },
    
    parseQueryParameterContinuation:function(formDef, formPath, 
				formId, formVersion, formLocale, formName, instanceId, pageRef, continuation) {
		var that = this;
        return function() {
			var result = {};
			// set up the minimal qp keys...
			result.formPath = { "type" : "string", "value": formPath };
			result.formId = { "type" : "string", "value": formId };
			result.formVersion = { "type" : "string", "value": formVersion };
			result.formLocale = { "type" : "string", "value": formLocale };
			result.formName = { "type" : "string", "value": formName };
			result.instanceId = { "type" : "string", "value": instanceId };

			var sameForm = (database.getMetaDataValue('formId') == formId);
			var sameInstance = sameForm && (database.getMetaDataValue('instanceId') == instanceId);

			if ( instanceId == null ) {
				mdl.qp = result;
				continuation(formDef, formPath, instanceId, pageRef, sameForm, sameInstance);
				return;
			}
            database.getCrossTableMetaData(formId, instanceId, 'instanceName', function(value) {
                if (value == null) {
                    // construct a friendly name for this new form...
                    var date = new Date();
                    var dateStr = date.toISOString();
					var localizedFormName = opendatakit.localize(formName,formLocale);
                    var fnvalue = localizedFormName + "_" + dateStr; // .replace(/\W/g, "_")
                    database.putCrossTableMetaData(formId, instanceId, 'instanceName', 'string', fnvalue, function() {
						mdl.qp = result;
						// pull everything for synchronous read access
						continuation(formDef, formPath, instanceId, pageRef, sameForm, sameInstance);
                    });
                } else {
					mdl.qp = result;
					// pull everything for synchronous read access
					continuation(formDef, formPath, instanceId, pageRef, sameForm, sameInstance);
                }
            });
        };
    },
    getSetting:function(formDef, key) {
        for (var i = 0 ; i < formDef.settings.length ; ++i ) {
            var e = formDef.settings[i];
            if ( e.setting == key ) {
                return e.value;
            }
        }
        return null;
    },
    parseQueryParameters:function( continuation ) {
        var that = this;
        
		var formPath = null;
        var instanceId = null;
		var pageRef = null;
		
        var dataKeyValueList = [];
        if (window.location.hash) {
            // split up the query string and store in an associative array
            var params = window.location.hash.slice(1).split("&");
            for (var i = 0; i < params.length; i++)
            {
                var tmp = params[i].split("=");
                var key = tmp[0];
                var value = unescape(tmp[1]);
				if ( key == 'formPath' ) {
					formPath = value;
				} else if ( key == 'instanceId' ) {
                    instanceId = value;
                } else if ( key == 'pageRef' ) {
					pageRef = value;
				} else {
                    that.parseQueryHelper(dataKeyValueList, key, value);
                }
            }
			
			if ( formPath != null && formPath[formPath.length-1] != '/' ) {
				formPath[formPath.length] = '/';
			}
        }

		if ( formPath == null ) {
			// do the prompts and widget warmup form...
			formPath = "collect/";
			instanceId = null;
			pageRef = null;
		}

		// path is one deeper because requirejs base is in the js directory...
		var filename = '../' + opendatakit.getCurrentFormDirectory(formPath) + 'formDef.json';
		requirejs(['text!' + filename], 
			function(formDefTxt) {
				if ( formDefTxt == null || formDefTxt.length == 0 ) {
					alert('Unable to find file: ' + filename);
				} else {
					var formDef = JSON.parse(formDefTxt);
					that.fetchContinueParsing(formDef, formPath, 
												instanceId, pageRef, dataKeyValueList, continuation);
				}
			}
		);
	},
	fetchContinueParsing: function(formDef, formPath, instanceId, pageRef, dataKeyValueList, continuation) {
		var that = this;
		var settings = formDef.settings;
		
		var formId = this.getSetting(formDef, 'formId');
		var formVersion = this.getSetting(formDef, 'formVersion');
		var formLocale = this.getSetting(formDef, 'formLocale');
		var formName = this.getSetting(formDef, 'formName');
        
        that.parseQueryHelper(dataKeyValueList, 'formId', formId );
        that.parseQueryHelper(dataKeyValueList, 'formVersion', formVersion );
        that.parseQueryHelper(dataKeyValueList, 'formLocale', formLocale );
        that.parseQueryHelper(dataKeyValueList, 'formName', formName );
        
        // there are always 4 entries (formId, formVersion, formName, formLocale)
        // we don't need to save them if there are no other parameters to save.
        if ( instanceId != null && dataKeyValueList.length > 4 ) {
            // save all query parameters to metaData queue
            database.putCrossTableMetaDataKeyTypeValueMap(formId, instanceId, dataKeyValueList, 
                that.parseQueryParameterContinuation(formDef, formPath, formId, formVersion, formLocale, formName, instanceId, pageRef, continuation));
        } else {
            (that.parseQueryParameterContinuation(formDef, formPath, formId, formVersion, formLocale, formName, instanceId, pageRef, continuation))();
        }
    }
};
});
