'use strict';
/**
 circular dependency upon: controller, builder (set via initialize)
 
 3 public APIs:
 
 initialize(controller, builder) -- initialize to avoid circular load dependency.
 hashChangeHandler(evt) -- handle 'hashChange' events.
 parseParameters() -- interpret the window.location.hash parameters on start-up.
 
*/
define(['opendatakit','database'],
function(opendatakit,  database) {
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
    _parseQueryHelper:function(instanceMetadataKeyValueMap, key, value) {
        if ( key == 'formPath' ) {
            return;
        }
        if ( key == 'instanceId' ) {
            return;
        }
        if ( key == 'pageRef' ) {
            return;
        }
        instanceMetadataKeyValueMap[key] = value;
    },
    _prepAndSwitchUI:function( ctxt, qpl, instanceId, pageRef, sameInstance, instanceMetadataKeyValueMap ) {
        var that = this;
        // ensure initial empty record is written
        // cacheAllData
        database.initializeInstance($.extend({},ctxt,{success:function() {
                if ( qpl != window.location.hash ) {
                        // apply the change to the URL...
                        ctxt.append("parsequery._effectChange.prehashchange." + (sameInstance ? "sameForm" : "differentForm"),
                                    "window.location.hash="+qpl+" ms: " + (+new Date()));
                        window.location.hash = qpl;
                        ctxt.success();
                        // triggers hash-change listener...
                } else {
                        shim.setPageRef(pageRef);
                        // fire the controller to render the first page.
                        ctxt.append("parsequery._effectChange.gotoRef." + (sameInstance ? "sameForm" : "differentForm"),
                                    "gotoRef("+pageRef+") ms: " + (+new Date()));
                        that.controller.gotoRef(ctxt, pageRef);
                }
        }}), instanceId, instanceMetadataKeyValueMap);
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
    _parseQueryParameterContinuation:function(ctxt, formDef, formPath, instanceId, pageRef, instanceMetadataKeyValueMap) {
        var that = this;
        var settings = formDef.settings;
        
        // IMPLEMENTATION NOTE: formDef is only used in the case where sameForm is false.
        // THIS IS AN ASSUMPTION OF THE CALLING FUNCTION!!!!
        
        if ( formPath == null ) {
            ctxt.append("parsequery._effectChange.nullFormPath");
            alert("Unexpected null formPath");
            ctxt.failure({message: "No form specified."});
            return;
        }
        
        if ( formDef == null ) {
            ctxt.append("parsequery._effectChange.nullFormDef");
            alert("Unexpected null formDef when changing forms");
            ctxt.failure({message: "Form definition is empty."});
            return;
        }
        
        // defined by form definition's settings:
        var table_id = opendatakit.getSetting(formDef, 'table_id');
        var form_id = opendatakit.getSetting(formDef, 'form_id');
        if ( table_id == null ) {
            // fallback if there is no table_id defined
            table_id = form_id;
        }
        
        if ( table_id == null ) {
            alert("no table_id specified in Form Definition!");
            ctxt.failure({message: "No table_id specified in form definition."});
            return;
        }

        // Seems like we would only need to create the KV entries for table_id, and otherwise not need to do anything?
        // E.g., to support multiple forms used within one table.
        
        // we cannot write the instanceMetadata or the tableMetadata yet because the underlying tables may not yet exist.

        // on first starting, the database would not have any table_id, form_id or instanceId set...
        var sameTable = (opendatakit.getCurrentTableId() == table_id);
        var sameForm = sameTable && (opendatakit.getSettingValue('form_id') == form_id) && (opendatakit.getCurrentFormPath() == formPath);
        var sameInstance = sameForm && (opendatakit.getCurrentInstanceId() == instanceId) && (instanceId != null);
        var qpl = opendatakit.getHashString(formPath, instanceId, pageRef);

        if ( !sameTable ) {
            opendatakit.setCurrentTableId(null);
            opendatakit.setCurrentFormPath(null);
            opendatakit.setCurrentInstanceId(null);
            shim.setPageRef(null);
            // reset controller to pristine state...
            that.controller.reset($.extend({},ctxt, {success:function() {
                // build table for table_id...
                database.initializeTables($.extend({},ctxt,{success:function() {
                        // data table already exists
                        // build the survey and place it in the controller...
                        that.builder.buildSurvey(formDef, function() {
                                // currentInstanceId == null
                                // TODO: load instance...
                                that._prepAndSwitchUI( ctxt, qpl, instanceId, pageRef, sameInstance, instanceMetadataKeyValueMap, formDef );
                            });
                    }}), formDef, table_id, formPath);
            }}), sameForm);
        } else if (!sameForm) {
            opendatakit.setCurrentFormPath(null);
            opendatakit.setCurrentInstanceId(null);
            // reset controller to pristine state...
            that.controller.reset($.extend({},ctxt, {success:function() {
                // preserve values from the Tables metadata but override form info...
                opendatakit.setCurrentFormDef(formDef);
                opendatakit.setCurrentFormPath(formPath);
                // currentInstanceId == null
                // data table already exists (since table_id is unchanged)
                // TODO: parse new form...
                // TODO: verify instance table exists
                // TODO: load instance...
                
                // build the survey and place it in the controller...
                that.builder.buildSurvey(formDef, function() {
                            // currentInstanceId == null
                            // TODO: load instance...
                            that._prepAndSwitchUI( ctxt, qpl, instanceId, pageRef, sameInstance, instanceMetadataKeyValueMap, formDef );
                });
            }}), sameForm);
        } else  if (!sameInstance) {
            opendatakit.setCurrentInstanceId(null);
            // reset controller to pristine state...
            that.controller.reset($.extend({},ctxt, {success:function() {
                // currentInstanceId == null
                // data table already exists (since table_id is unchanged)
                // form definitions already processed (since formPath and form_id unchanged)

                // currentInstanceId == null
                // TODO: load instance...
                that._prepAndSwitchUI( ctxt, qpl, instanceId, pageRef, sameInstance, instanceMetadataKeyValueMap, formDef );
            }}), sameForm);
        } else {
            // currentInstanceId == valid value
            // data table already exists (since table_id is unchanged)
            // form definitions already processed (since formPath and form_id unchanged)
            // same instance -- so just render the UI...
            
            // TODO: change pageRef (presumably)
            that._prepAndSwitchUI( ctxt, qpl, instanceId, pageRef, sameInstance, instanceMetadataKeyValueMap, formDef );
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
        
        var instanceMetadataKeyValueMap = {};
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
                    that._parseQueryHelper(instanceMetadataKeyValueMap, key, value);
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
        
        var formDef = opendatakit.getCurrentFormDef();
        var sameForm = (opendatakit.getCurrentFormPath() == formPath) && (formDef != null);
        var sameInstance = sameForm && (opendatakit.getCurrentInstanceId() == instanceId) && (instanceId != null);
        
        // fetch the form definition (defered processing)
        var filename = formPath + 'formDef.json';
        
        if ( !sameForm ) {
            // force a 'Please wait...' to display before we try to read the formDef file...
            that.controller.reset($.extend({},ctxt, {success:function() {
                that._parseFormDefFile(ctxt, formPath, instanceId, pageRef, instanceMetadataKeyValueMap, filename);
            }}), false );
        } else {
            try {
                that._parseQueryParameterContinuation(ctxt, formDef, formPath, 
                                        instanceId, pageRef, instanceMetadataKeyValueMap);
            } catch (ex) {
                console.error('parsequery.parseParameters.continuationException' + String(ex));
                ctxt.append('parsequery.parseParameters.continuationException',  'unknown error: ' + ex);
                ctxt.failure({message: "Exception while processing form definition."});
            }
        }
    },
    /**
     * What actually reads in and loads the formDef file (and then parses the query parameters against it).
     */
    _parseFormDefFile: function(ctxt, formPath, instanceId, pageRef, instanceMetadataKeyValueMap, filename) {
        var that = this;
        requirejs(['text!' + filename], 
            function(formDefTxt) {
                if ( formDefTxt == null || formDefTxt.length == 0 ) {
                    alert('Unable to find file: ' + filename);
                    ctxt.failure({message: "Form definition is empty."});
                } else {
                    var formDef;
                    try {
                        formDef = JSON.parse(formDefTxt);
                    } catch (ex) {
                        console.error('parsequery.parseParameters.requirejs.JSONexception' + String(ex));
                        ctxt.append('parsequery.parseParameters.requirejs.JSONexception',  'JSON parsing error: ' + ex);
                        ctxt.failure({message: "Exception while processing form definition."});
                        return;
                    }
                    try {
                        that._parseQueryParameterContinuation(ctxt, formDef, formPath, 
                                                instanceId, pageRef, instanceMetadataKeyValueMap);
                    } catch (ex) {
                        console.error('parsequery.parseParameters.requirejs.continuationException' + String(ex));
                        ctxt.append('parsequery.parseParameters.requirejs.continuationException',  'formDef interpetation or database setup error: ' + ex);
                        ctxt.failure({message: "Exception while processing form definition."});
                    }
                }
            }, function(err) {
                ctxt.append("parsequery.parseParameters.requirejs.failure", err.toString());
                ctxt.failure({message: "Failure while reading form definition."});
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
        var qpl;
        var ctxt = that.controller.newContext(evt);
        ctxt.append('parsequery.hashChangeHandler');
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        
        if ( window.location.hash == '#' ) {
            // this is bogus transition due to jquery mobile widgets
            ctxt.append('parsequery.hashChangeHandler.emptyHash');
            alert('Hash is invalid!');
            qpl = opendatakit.getHashString(opendatakit.getCurrentFormPath(), opendatakit.getCurrentInstanceId(), that.controller.currentPromptIdx);
            ctxt.append('parsequery.hashChangeHandler.emptyHash.reset', qpl);
            window.location.hash = qpl;
            ctxt.failure({message: "Internal error: invalid hash (restoring)"});
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
            shim.setPageRef(pageRef);
            ctxt.append('parsequery.hashChangeHandler.gotoRef', "window.location.hash="+window.location.hash);
            that.controller.gotoRef(ctxt, pageRef);
        } else {
            ctxt.append('parsequery.hashChangeHandler.noPageRef.reset');
            qpl = opendatakit.getHashString(opendatakit.getCurrentFormPath(), opendatakit.getCurrentInstanceId(), that.controller.currentPromptIdx);
            window.location.hash = qpl;
            ctxt.failure({message: "Internal error: invalid hash (restoring)"});
        }
        return false;
    }

};
});
