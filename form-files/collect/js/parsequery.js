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
	
	parseQueryParameterContinuation:function(instanceId, continuation) {
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
							continuation();
						}
					});
				} else {
					var qpl = '?instanceId=' + escape(instanceId);
					if ( qpl != window.location.search ) {
						// apply the change to the URL...
						window.location.search = qpl;
						// page reload happens...
					} else {
						continuation();
					}
				}
			});
		};
	},
	parseQueryParameters:function(formId, formVersion, formLocale, formName, continuation ) {
		var that = this;
		var result = {};
		
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
				that.parseQueryParameterContinuation(instanceId, continuation));
		} else {
			(that.parseQueryParameterContinuation(instanceId, continuation))();
		}
	}
};
});
