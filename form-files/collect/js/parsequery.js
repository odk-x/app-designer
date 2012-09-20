'use strict';
/**
 dependency upon: mdl, opendatakit, database 
 non-requirejs dependency: collect
 circular dependency upon: controller, builder
 
 3 public APIs:
 
 initialize(controller, builder) -- initialize to avoid circular load dependency.
 hashChangeHandler(evt) -- handle 'hashChange' events.
 parseParameters() -- interpret the window.location.hash parameters on start-up.
 
*/
define(['mdl','opendatakit','database'],function(mdl,opendatakit,database) {
return {

	controller: null,
	builder: null,
	/**
	 * Set the controller and builder during initialization.
	 * Avoids circular dependencies.
	 *
	 * Immediate.
	 */
	initialize:function(controller, builder) {
		this.controller = controller;
		this.builder = builder;
	},
	/**
	 * Insert or update a 'string'-valued key-value pair within the parameter list array.
	 * 
	 * Immediate.
	 */
    _parseQueryHelper:function(dataKeyValueList, key, value) {
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
	/**
	 * Effect a change in the window.location.hash
	 *
	 */
	_effectChange:function(formDef, formPath, instanceId, pageRef, sameForm, sameInstance) {
		// IMPLEMENTATION NOTE: formDef is only used in the case where sameForm is false.
		// THIS IS AN ASSUMPTION OF THE CALLING FUNCTION!!!!
		var that = this;
		
		if ( formPath == null ) {
			alert("Unexpected null formPath");
			return;
		}
		
		if ( !sameForm && formDef == null ) {
			alert("Unexpected null formDef when changing forms");
			return;
		}
		
		// 
		// At this point, we have saved all the form parameters to the database
		// and the MetaData holds the core (minimal) state of a form.
		// We now must 'bootstrap' into the requested form.
		// 
		// 0. if not same instance: 
		//     clear the web page and display 'Please wait...'
		//     collect.setInstanceId(null);
		// 1. cache the entire MetaData of the form (core + parameters).
		// 2. if form is the same:
		//    a. cache the Data for this instanceId (if not null).
		//    b. collect.setInstanceId(newInstanceId); (if not null)
		//    c. ensure hash-change handler is established and update hash
		// 3. if form is different:
		//    a1. create the database tables for this form (if needed).
		//    a2. cache the Data for this instanceId (if not null).
		//    a3. build the survey prompts using the formDef.
		//    b. collect.setInstanceId(newInstanceId); (if not null)
		//    c. ensure hash-change handler is established and update hash
		//
		console.log('parsequery._effectChange: scripts loaded');

		if ( !sameInstance ) {
			that.controller.clearPromptHistory();
			that.controller.destroyScreenManager();
			// switching instance -- no 'back' history...
			// signal that we have no instanceId...
			collect.setInstanceId(null);
		}
		
		var qpl = opendatakit.getHashString(formPath, instanceId, pageRef);
		
		// pull metadata for synchronous read access
		database.cacheAllMetaData(function() {
				// metadata is OK...
				if ( sameForm ) {
					database.cacheAllData(function() {
							// instance data is OK...
							// controller prompts OK
							if ( !sameInstance && instanceId != null) {
								collect.setInstanceId(instanceId);
							}

							if ( qpl != window.location.hash ) {
									// apply the change to the URL...
									console.log("parsequery._effectChange: sameForm window.location.hash="+qpl+" ms: " + (+new Date()));
									window.location.hash = qpl;
									// triggers hash-change listener...
							} else {
									// fire the controller to render the first page.
									console.log("parsequery._effectChange: sameForm gotoRef("+pageRef+") ms: " + (+new Date()));
									that.controller.gotoRef(pageRef);
							}
						});
				} else {
					database.initializeTables(formDef, function() {
							// build the survey and place it in the controller...
							that.builder.buildSurvey(formDef, function() {
									// controller OK
									// instance data is OK...
									if ( instanceId != null) {
										collect.setInstanceId(instanceId);
									}

									if ( qpl != window.location.hash ) {
											// apply the change to the URL...
											console.log("parsequery._effectChange: differentForm window.location.hash="+qpl+" ms: " + (+new Date()));
											window.location.hash = qpl;
											// triggers hash-change listener...
									} else {
											// fire the controller to render the first page.
											console.log("parsequery._effectChange: differentForm gotoRef("+pageRef+") ms: " + (+new Date()));
											that.controller.gotoRef(pageRef);
									}
								});
						});
				}
		});
	},
	/**
	 * Saves all passed-in parameter values into the MetaData table.
	 * The incoming formDef and instanceId may specify a different form and instance.
	 * Updates therefore MUST be cross-site.
	 * 
	 * Deferred: ... _parseQueryParameterContinuation ... _effectChange
	 */
	_fetchContinueParsing: function(formDef, formPath, instanceId, pageRef, dataKeyValueList) {
		var that = this;
		var settings = formDef.settings;
		
		var formId = opendatakit.getSetting(formDef, 'formId');
		var formVersion = opendatakit.getSetting(formDef, 'formVersion');
		var formLocale = opendatakit.getSetting(formDef, 'formLocale');
		var formName = opendatakit.getSetting(formDef, 'formName');
        
        that._parseQueryHelper(dataKeyValueList, 'formId', formId );
        that._parseQueryHelper(dataKeyValueList, 'formVersion', formVersion );
        that._parseQueryHelper(dataKeyValueList, 'formLocale', formLocale );
        that._parseQueryHelper(dataKeyValueList, 'formName', formName );
        
        // there are always 4 entries (formId, formVersion, formName, formLocale)
        // we don't need to save them if there are no other parameters to save.
        if ( instanceId != null && dataKeyValueList.length > 4 ) {
            // save all query parameters to metaData queue
            database.putCrossTableMetaDataKeyTypeValueMap(formId, instanceId, dataKeyValueList, 
                that._parseQueryParameterContinuation(formDef, formPath, formId, formVersion, formLocale, formName, instanceId, pageRef));
        } else {
            (that._parseQueryParameterContinuation(formDef, formPath, formId, formVersion, formLocale, formName, instanceId, pageRef))();
        }
    },
    /**
	 * Return a continuation to be invoked after passed-in parameters are saved in the 
	 * MetaData table. The returned continuation invokes _effectChange at the end of 
	 * its processing.
	 *
	 * If no instanceId is supplied, swap the in-process MetaData to the new form's core
	 * MetaData and invoke _effectChange.
	 *
	 * Otherwise, read the instanceName for this instanceId directly from the database. 
	 *
	 * If instanceName is null, construct and write a new candidate instanceName before 
	 * making the swap of the core MetaData and invoking _effectChange.
	 * If instanceName is not null, swap to the core Metadata and invoke _effectChange.
	 *
	 * Immediate (constructs continuation object to do actions)
	 */
    _parseQueryParameterContinuation:function(formDef, formPath, 
				formId, formVersion, formLocale, formName, instanceId, pageRef) {
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
				that._effectChange(formDef, formPath, instanceId, pageRef, sameForm, false);
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
						that._effectChange(formDef, formPath, instanceId, pageRef, sameForm, sameInstance);
                    });
                } else {
					mdl.qp = result;
					// pull everything for synchronous read access
					that._effectChange(formDef, formPath, instanceId, pageRef, sameForm, sameInstance);
                }
            });
        };
    },
	/**
	 * Invoked on initial page load and whenever a URL change alters the formPath or instanceId.
	 *
	 * Callers should ensure that this is ONLY called when the formPath or instanceId has changed.
	 */
    parseParameters:function() {
		console.log("parsequery.parseParameters: start ms: " + (+new Date()));
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
                    that._parseQueryHelper(dataKeyValueList, key, value);
                }
            }
			
			if ( formPath != null && formPath.length > 0 && formPath[formPath.length-1] ) {
				formPath[formPath.length] = '/';
			}
        }

		if ( formPath == null ) {
			// do the prompts and widget warmup form...
			formPath = "";
			instanceId = null;
			pageRef = null;
		}

		// fetch the form definition (defered processing)
		var filename = opendatakit.getCurrentFormDirectory(formPath) + 'formDef.json';
		requirejs(['text!' + filename], 
			function(formDefTxt) {
				if ( formDefTxt == null || formDefTxt.length == 0 ) {
					alert('Unable to find file: ' + filename);
				} else {
					var formDef = JSON.parse(formDefTxt);
					that._fetchContinueParsing(formDef, formPath, 
												instanceId, pageRef, dataKeyValueList);
				}
			}
		);
	},
	/**
	 * Bound to the 'hashchange' event.
	 *
     * window.location.hash is an ampersand-separated list of 
	 * key=value pairs. The key and value are escaped.
	 * The main values are:
	 *    formPath=relative path from the collect/index.html to 
	 *             the form definition directory (formPath/formDef.json).
	 *
	 *    instanceId=unique id for this filled-in form instance. May be omitted.
	 *
	 *    pathRef=concatenation of promptIdx (or name) and other data used
	 *            when rendering a screen. If omitted, go to initial screen.
     */
    hashChangeHandler:function(e) {
        var that = this;
		if ( window.location.hash == '#' ) {
			// this is bogus transition due to jquery mobile widgets
			e.stopPropagation(true);
			alert('Hash is invalid!');
			return;
		}
		
		var params = window.location.hash.slice(1).split("&");
		var formPath = null;
		var instanceId = null;
		var pageRef = null;
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
			}
		}
		
		if ( formPath != database.getMetaDataValue('formPath') || instanceId != database.getMetaDataValue('instanceId') ) {
			// this should trigger a hash-change action
			console.log("parsequery.hashChangeHandler: parseParameters window.location.hash="+window.location.hash+" start ms: " + (+new Date()));
			that.parseParameters();
			return;
		} else {
			console.log("parsequery.hashChangeHandler: gotoRef window.location.hash="+window.location.hash+" start ms: " + (+new Date()));
			that.controller.gotoRef(pageRef);
		}
	}

};
});
