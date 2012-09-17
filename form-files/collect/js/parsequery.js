'use strict';
// Cdependency upon: opendatakit, database 
define(['mdl','opendatakit','database'],function(mdl,opendatakit,database) {
return {

    parseQueryHelper:function(dataKeyValueList, key, value) {
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
    
    parseQueryParameterContinuation:function(formDef, formId, instanceId, pageRef, formName, continuation) {
		var that = this;
        return function() {
            database.getCrossTableMetaData(formId, instanceId, 'instanceName', function(value) {
                if (value == null) {
                    // construct a friendly name for this new form...
                    var date = new Date();
                    var dateStr = date.toISOString();
                    var fnvalue = formName + "_" + dateStr; // .replace(/\W/g, "_")
                    database.putCrossTableMetaData(formId, instanceId, 'instanceName', 'string', fnvalue, function() {
						var result = {};
					    // only these values plus instanceId are immediate -- everything else is in metadata table.
						var formLocale = that.findParam(formDef, 'formLocale').param;
						var formName = that.findParam(formDef, 'formName').param[formLocale];

						result.formId = { "type" : "string", "value": formId };
						result.instanceId = { "type" : "string", "value": instanceId };
						result.formVersion = { "type" : "string", "value": that.findParam(formDef, 'formVersion').param };
						result.formLocale = { "type" : "string", "value": formLocale };
						result.formName = { "type" : "string", "value": formName };
						mdl.qp = result;
						continuation(formDef, formId, instanceId, pageRef);
                    });
                } else {
					var result = {};
					// only these values plus instanceId are immediate -- everything else is in metadata table.
					var formLocale = that.findParam(formDef, 'formLocale').param;
					var formName = that.findParam(formDef, 'formName').param[formLocale];

					result.formId = { "type" : "string", "value": formId };
					result.instanceId = { "type" : "string", "value": instanceId };
					result.formVersion = { "type" : "string", "value": that.findParam(formDef, 'formVersion').param };
					result.formLocale = { "type" : "string", "value": formLocale };
					result.formName = { "type" : "string", "value": formName };
					mdl.qp = result;
					// pull everything for synchronous read access
					continuation(formDef, formId, instanceId, pageRef);
                }
            });
        };
    },
    findParam:function(formDef, key) {
        for (var i = 0 ; i < formDef.settings.length ; ++i ) {
            var e = formDef.settings[i];
            if ( e.name == key ) {
                return e;
            }
        }
        return null;
    },
    parseQueryParameters:function( continuation ) {
        var that = this;
        
		var formId = null;
        var instanceId = null;
		var pageRef = null;
		
        var dataKeyValueList = [];
        if (window.location.hash)
        {
            // split up the query string and store in an associative array
            var params = window.location.hash.slice(1).split("&");
            for (var i = 0; i < params.length; i++)
            {
                var tmp = params[i].split("=");
                var key = tmp[0];
                var value = unescape(tmp[1]);
				if ( key == 'formId' ) {
					formId = value;
				} else if ( key == 'instanceId' ) {
                    instanceId = value;
                } else if ( key == 'pageRef' ) {
					pageRef = value;
				} else {
                    that.parseQueryHelper(dataKeyValueList, key, value);
                }
            }
        }

        if ( instanceId == null || instanceId == "" ) {
            console.log("ALERT! defining a UUID  because one wasn't specified");
            instanceId = opendatakit.genUUID();
        }

		var formDef = {
    "settings": [
        {
            name: "formId",
            param: "placeholder"
        },
        {
            name: "formVersion",
            param: "20120901"
        },
        {
            name: "formLocale",
            param: "en_us"
        },
        {
            name: "formName",
            param: {
                "en_us": 'Placeholder Form'
                }
        },
        {
            name: "formLogo",
            param: "img/form_logo.png"
        }
    ],
    "survey": [
        {
            "name": "none", 
            "validate": true,
            "type": "text", 
            "param": null, 
            "label": {
                "en_us": "Choose a form:"
            }
        }, 
    ], 
    "datafields": {
        "none": {
            "type": "string"
        }, 
    }, 
};
		if ( formId != null ) {
			requirejs(['../' + formId + '/formDef.js'], function(formDef) {
				that.fetchContinueParsing(formDef, formId, instanceId, pageRef, dataKeyValueList, continuation);
			});
		} else {
			this.fetchContinueParsing(formDef, formId, instanceId, pageRef, dataKeyValueList, continuation);
		}
	},
	fetchContinueParsing: function(formDef, formId, instanceId, pageRef, dataKeyValueList, continuation) {
		var that = this;
		var settings = formDef.settings;
		
		var formLocale = this.findParam(formDef, 'formLocale').param;
		var formName = this.findParam(formDef, 'formName').param[formLocale];
		
        var result = {};
        
        that.parseQueryHelper(dataKeyValueList, 'formId', formId );
        that.parseQueryHelper(dataKeyValueList, 'formVersion', this.findParam(formDef, 'formVersion').param );
        that.parseQueryHelper(dataKeyValueList, 'formLocale', formLocale );
        that.parseQueryHelper(dataKeyValueList, 'formName', formName );
        
        // there are always 4 entries (formId, formName, formVersion, formLocale)
        // we don't need to save them if there are no other parameters to save.
        if ( dataKeyValueList.length > 4 ) {
            // save all query parameters to metaData queue
            database.putCrossTableMetaDataKeyTypeValueMap(formId, instanceId, dataKeyValueList, 
                that.parseQueryParameterContinuation(formDef, formId, instanceId, pageRef, formName, continuation));
        } else {
            (that.parseQueryParameterContinuation(formDef, formId, instanceId, pageRef, formName, continuation))();
        }
    }
};
});
