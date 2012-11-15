'use strict';
/**
 non-requirejs dependency: collect
 circular dependency upon: controller, builder (set via initialize)
 
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
    _parseQueryHelper:function(ctxt, dataKeyValueList, key, value) {
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
    _prepAndSwitchUI:function( ctxt, qpl, instanceId, pageRef, sameInstance, instanceMetadataKeyValueList ) {
        var that = this;
        // ensure initial empty record is written
        // cacheAllData
        database.initializeInstance($.extend({},ctxt,{success:function() {
                if ( qpl != window.location.hash ) {
                        // apply the change to the URL...
                        ctxt.append("parsequery._effectChange." + (sameInstance ? "sameForm" : "differentForm"),
                                    "window.location.hash="+qpl+" ms: " + (+new Date()));
                        ctxt.log("prehashchange");
                        window.location.hash = qpl;
                        ctxt.success();
                        // triggers hash-change listener...
                } else {
                        // fire the controller to render the first page.
                        ctxt.append("parsequery._effectChange." + (sameInstance ? "sameForm" : "differentForm"),
                                    "gotoRef("+pageRef+") ms: " + (+new Date()));
                        that.controller.gotoRef(ctxt, pageRef);
                }
        }}), instanceId, instanceMetadataKeyValueList);
    },
    /**
     * Saves all passed-in parameter values into the MetaData table.
     * The incoming formDef and instanceId may specify a different form and instance.
     * Updates therefore MUST be cross-site.
     * 
     * Invoked after passed-in parameters are saved in the 
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
     * Immediate: _effectChange
    */
    _parseQueryParameterContinuation:function(ctxt, formDef, formPath, instanceId, pageRef, instanceMetadataKeyValueList) {
        var that = this;
        var protoTableMetadata = {};
        var settings = formDef.settings;
        
        // IMPLEMENTATION NOTE: formDef is only used in the case where sameForm is false.
        // THIS IS AN ASSUMPTION OF THE CALLING FUNCTION!!!!
        
        if ( formPath == null ) {
            ctxt.append("parsequery._effectChange.nullFormPath");
            alert("Unexpected null formPath");
            ctxt.failure();
            return;
        }
        
        if ( formDef == null ) {
            ctxt.append("parsequery._effectChange.nullFormDef");
            alert("Unexpected null formDef when changing forms");
            ctxt.failure();
            return;
        }
        
        // defined by form definition's settings:
        var tableId = opendatakit.getSetting(formDef, 'formId');//TODO: opendatakit.getSetting(formDef, 'tableId');
        var formId = opendatakit.getSetting(formDef, 'formId');
        var formVersion = opendatakit.getSetting(formDef, 'formVersion');
        var formLocales = opendatakit.getFormLocales(formDef);
        var formTitle = opendatakit.getSetting(formDef, 'formTitle');
        
        if ( tableId == null ) {
            alert("no tableId specified in Form Definition!");
            ctxt.failure();
            return;
        }
        
        // TODO: does any of this need to be persisted to the table KV store???

        // Seems like we would only need to create the KV entries for tableId, and otherwise not need to do anything?
        // E.g., to support multiple forms used within one table.
        
        
        // we cannot write the instanceMetadata or the tableMetadata yet because the underlying tables may not yet exist.

        // set up the minimal qp keys...
        protoTableMetadata.formDef = { "type" : "object", "value": formDef };
        protoTableMetadata.formId = { "type" : "string", "value": formId };
        protoTableMetadata.formVersion = { "type" : "string", "value": formVersion };
        protoTableMetadata.formLocales = { "type" : "string", "value": formLocales };
        protoTableMetadata.formTitle = { "type" : "string", "value": formTitle };
        
        // TODO: locale of this form instance...

        // on first starting, the database would not have any tableId, formId or instanceId set...
        var sameTable = (opendatakit.getCurrentTableId() == tableId);
        var sameForm = sameTable && (database.getTableMetaDataValue('formId') == formId) && (opendatakit.getCurrentFormPath() == formPath);
        var sameInstance = sameForm && (opendatakit.getCurrentInstanceId() == instanceId) && (instanceId != null);
        var qpl = opendatakit.getHashString(formPath, instanceId, pageRef);

        if ( !sameTable ) {
            opendatakit.setCurrentTableId(null);
            opendatakit.setCurrentFormPath(null);
            opendatakit.setCurrentInstanceId(null);
            // reset controller to pristine state...
            that.controller.reset(ctxt, sameForm);
            
            // build table for tableId...
            database.initializeTables($.extend({},ctxt,{success:function() {
                    // data table already exists
                    // build the survey and place it in the controller...
                    that.builder.buildSurvey(formDef, function() {
                            // currentInstanceId == null
                            // TODO: load instance...
                            that._prepAndSwitchUI( ctxt, qpl, instanceId, pageRef, sameInstance, instanceMetadataKeyValueList, formDef );
                        });
                }}), formDef, tableId, protoTableMetadata, formPath);
        } else if (!sameForm) {
            opendatakit.setCurrentFormPath(null);
            opendatakit.setCurrentInstanceId(null);
            // reset controller to pristine state...
            that.controller.reset(ctxt, sameForm);

            // preserve values from the Tables metadata but override form info...
            mdl.qp = $.extend(mdl.qp, protoTableMetadata);
            
            opendatakit.setCurrentFormPath(formPath);
            // currentInstanceId == null
            // data table already exists (since tableId is unchanged)
            // TODO: parse new form...
            // TODO: verify instance table exists
            // TODO: load instance...
            
            // build the survey and place it in the controller...
            that.builder.buildSurvey(formDef, function() {
                        // currentInstanceId == null
                        // TODO: load instance...
                        that._prepAndSwitchUI( ctxt, qpl, instanceId, pageRef, sameInstance, instanceMetadataKeyValueList, formDef );
            });
        } else  if (!sameInstance) {
            opendatakit.setCurrentInstanceId(null);
            // reset controller to pristine state...
            that.controller.reset(ctxt, sameForm);

            // currentInstanceId == null
            // data table already exists (since tableId is unchanged)
            // form definitions already processed (since formPath and formId unchanged)

            // currentInstanceId == null
            // TODO: load instance...
            that._prepAndSwitchUI( ctxt, qpl, instanceId, pageRef, sameInstance, instanceMetadataKeyValueList, formDef );
        } else {
            // currentInstanceId == valid value
            // data table already exists (since tableId is unchanged)
            // form definitions already processed (since formPath and formId unchanged)
            
            // TODO: change pageRef (presumably)
            that._prepAndSwitchUI( ctxt, qpl, instanceId, pageRef, sameInstance, instanceMetadataKeyValueList, formDef );
        }
    },
    /**
     * Invoked on initial page load and whenever a URL change alters the formPath or instanceId.
     *
     * Callers should ensure that this is ONLY called when the formPath or instanceId has changed.
     */
    parseParameters:function(ctxt) {
        ctxt.append("parsequery.parseParameters");
        var that = this;
        
        var formPath = null;
        var instanceId = null;
        var pageRef = null;
        
        var instanceMetadataKeyValueList = [];
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
                    that._parseQueryHelper(ctxt, instanceMetadataKeyValueList, key, value);
                }
            }
            
            if ( formPath != null && formPath.length > 0 && formPath[formPath.length-1] != '/' ) {
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
        var filename = formPath + 'formDef.json';
        requirejs(['text!' + filename], 
            function(formDefTxt) {
                if ( formDefTxt == null || formDefTxt.length == 0 ) {
                    alert('Unable to find file: ' + filename);
                    ctxt.failure();
                } else {
                    try {
                        var formDef = JSON.parse(formDefTxt);
                        that._parseQueryParameterContinuation(ctxt, formDef, formPath, 
                                                instanceId, pageRef, instanceMetadataKeyValueList);
                    } catch (ex) {
                        ctxt.append('parsequery.parseParameters.exception',  'unknown error: ' + ex);
                        ctxt.failure();
                    }
                }
            }, function(err) {
                ctxt.append("parsequery.parseParameters.requirejs.failure", err.toString());
                ctxt.failure();
            }
        );
    },
    /**
     * Bound to the 'hashchange' event.
     *
     * window.location.hash is an ampersand-separated list of 
     * key=value pairs. The key and value are escaped.
     * The main values are:
     *    formPath=relative path from the default/index.html to 
     *             the form definition directory (formPath/formDef.json).
     *
     *    instanceId=unique id for this filled-in form instance. May be omitted.
     *
     *    pathRef=concatenation of promptIdx (or name) and other data used
     *            when rendering a screen. If omitted, go to initial screen.
     */
    hashChangeHandler:function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append('parsequery.hashChangeHandler');
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        
        if ( window.location.hash == '#' ) {
            // this is bogus transition due to jquery mobile widgets
            ctxt.append('parsequery.hashChangeHandler.emptyHash');
            alert('Hash is invalid!');
            var qpl = opendatakit.getHashString(opendatakit.getCurrentFormPath(), opendatakit.getCurrentInstanceId(), that.controller.currentPromptIdx);
            ctxt.append('parsequery.hashChangeHandler.emptyHash.reset', qpl);
            window.location.hash = qpl;
            ctxt.failure();
            return false;
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
        
        if ( formPath != opendatakit.getCurrentFormPath() || instanceId != opendatakit.getCurrentInstanceId() ) {
            // this should trigger a hash-change action
            ctxt.append('parsequery.hashChangeHandler', "window.location.hash="+window.location.hash);
            that.parseParameters(ctxt);
        } else if ( pageRef != null && pageRef != "") {
            ctxt.append('parsequery.hashChangeHandler.gotoRef', "window.location.hash="+window.location.hash);
            that.controller.gotoRef(ctxt, pageRef);
        } else {
            ctxt.append('parsequery.hashChangeHandler.noPageRef.reset');
            var qpl = opendatakit.getHashString(opendatakit.getCurrentFormPath(), opendatakit.getCurrentInstanceId(), that.controller.currentPromptIdx);
            window.location.hash = qpl;
            ctxt.failure();
        }
        return false;
    }

};
});
