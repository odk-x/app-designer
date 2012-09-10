'use strict';
// Cdependency upon: opendatakit, database 
define(['opendatakit','database'],function(opendatakit,database) {
return {

    parseQueryHelper:function(dataKeyValueList, key, value) {
        if ( key == 'instanceId' ) return;
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
    
    parseQueryParameterContinuation:function(datafields, instanceId, continuation) {
        return function() {
            database.getMetaData('instanceName', function(value) {
                if (value == null) {
                    // construct a friendly name for this new form...
                    var date = new Date();
                    var dateStr = date.toISOString();
                    var fnvalue = opendatakit.getFormName() + "_" + dateStr; // .replace(/\W/g, "_")
                    database.putMetaData('instanceName', 'string', fnvalue, function() {
                        var qpl = '?instanceId=' + escape(instanceId);
                        if ( qpl != window.location.search ) {
                            // apply the change to the URL...
                            window.location.search = qpl;
                            // page reload happens...
                        } else {
                            // pull everything for synchronous read access
                            database.getAllMetaData(function(tlo) {
							    if ( tlo == null ) {
								    tlo = {};
								}
								// these values come from the current webpage
								tlo.formId = opendatakit.getFormId();
								tlo.formVersion = opendatakit.getFormVersion();
								tlo.formLocale = opendatakit.getFormLocale();
								tlo.formName = opendatakit.getFormName();
								tlo.instanceId = opendatakit.getInstanceId();
								// update qp
                                opendatakit.queryParameters = tlo;
								database.initializeTables(datafields, continuation);
                            });
                        }
                    });
                } else {
                    var qpl = '?instanceId=' + escape(instanceId);
                    if ( qpl != window.location.search ) {
                        // apply the change to the URL...
                        window.location.search = qpl;
                        // page reload happens...
                    } else {
                        // pull everything for synchronous read access
                        database.getAllMetaData(function(tlo) {
							if ( tlo == null ) {
								tlo = {};
							}
							// these values come from the current webpage
							tlo.formId = opendatakit.getFormId();
							tlo.formVersion = opendatakit.getFormVersion();
							tlo.formLocale = opendatakit.getFormLocale();
							tlo.formName = opendatakit.getFormName();
							tlo.instanceId = opendatakit.getInstanceId();
							// update qp
                            opendatakit.queryParameters = tlo;
							database.initializeTables(datafields, continuation);
                        });
                    }
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
    parseQueryParameters:function(formDef, continuation ) {
        var that = this;
        var result = {};
		
		var formId = this.findParam(formDef, 'formId').param;
		var formVersion = this.findParam(formDef, 'formVersion').param;
		var formLocale = this.findParam(formDef, 'formLocale').param;
		var formName = this.findParam(formDef, 'formName').param[formLocale];
        
        // only these values plus instanceId are immediate -- everything else is in metadata table.
        result.formId = formId;
        result.formVersion = formVersion;
        result.formLocale = formLocale;
        result.formName = formName;
        
        // update the queryParameters value within opendatakit object...
        opendatakit.queryParameters = result;
        
        var instanceId = null;
        var dataKeyValueList = [];
        if (window.location.search)
        {
            // split up the query string and store in an associative array
            var params = window.location.search.slice(1).split("&");
            for (var i = 0; i < params.length; i++)
            {
                var tmp = params[i].split("=");
                var key = tmp[0];
                var value = unescape(tmp[1]);
                if ( key == 'instanceId' ) {
                    instanceId = value;
                } else {
                    that.parseQueryHelper(dataKeyValueList, key, value);
                }
            }
        }

        that.parseQueryHelper(dataKeyValueList, 'formId', formId );
        that.parseQueryHelper(dataKeyValueList, 'formVersion', formVersion );
        that.parseQueryHelper(dataKeyValueList, 'formLocale', formLocale );
        that.parseQueryHelper(dataKeyValueList, 'formName', formName );

        if ( instanceId == null || instanceId == "" ) {
            console.log("ALERT! defining a UUID  because one wasn't specified");
            instanceId = opendatakit.genUUID();
            // save in immediate query parameter...
            result.instanceId = instanceId;
        } else {
            // save in immediate query parameter...
            result.instanceId = instanceId;
        }
        
        // there are always 4 entries (formId, formName, formVersion, formLocale)
        // we don't need to save them if there are no other parameters to save.
        if ( dataKeyValueList.length > 4 ) {
            // save all query parameters to metaData queue
            database.putMetaDataKeyTypeValueMap(dataKeyValueList, 
                that.parseQueryParameterContinuation(formDef.datafields, instanceId, continuation));
        } else {
            (that.parseQueryParameterContinuation(formDef.datafields, instanceId, continuation))();
        }
    }
};
});
