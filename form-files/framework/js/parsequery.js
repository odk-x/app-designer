'use strict';
/**
 circular dependency upon: controller, builder (set via initialize)
 
 2 public APIs:
 
 initialize(controller, builder) -- initialize to avoid circular load dependency.
 changeUrlHash(ctxt) -- handle changes to the window.location.hash
 
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
        if ( key == 'screenPath' ) {
            return;
        }
        if ( key == 'refId' ) {
            return;
        }
        instanceMetadataKeyValueMap[key] = value;
    },
    _prepAndSwitchUI:function( ctxt, qpl, instanceId, screenPath, refId, sameInstance, instanceMetadataKeyValueMap ) {
        var that = this;
        // ensure initial empty record is written
        // cacheAllData
        database.initializeInstance($.extend({},ctxt,{success:function() {
            // fire the controller to render the first page.
            ctxt.append("parsequery._effectChange.gotoScreenPath." + (sameInstance ? "sameForm" : "differentForm"),
                        "gotoScreenPath("+screenPath+") refId: " + refId + " ms: " + (+new Date()));
            // set the refId. From this point onward,
            // changes will be applied within the shim
            opendatakit.setRefId(refId);
            if ( instanceId == null ) {
                opendatakit.clearCurrentInstanceId();
            } else {
                opendatakit.setCurrentInstanceId(instanceId);
            }
            that.controller.gotoScreenPath(ctxt, screenPath);
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
    _parseQueryParameterContinuation:function(ctxt, formDef, formPath, instanceId, screenPath, refId, instanceMetadataKeyValueMap) {
        var that = this;
        
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
        
        var fidObject = opendatakit.getSettingObject(formDef, 'form_id');
        if ( fidObject == null || !('value' in fidObject) ) {
            ctxt.append("parsequery._effectChange.missingFormId");
            alert("Unexpected missing value for form_id setting when changing forms");
            ctxt.failure({message: "Form definition has no form_id."});
            return;
        }
        var form_id = fidObject.value;
        
        // defined by form definition's settings:
        var tidObject = opendatakit.getSettingObject(formDef, 'table_id');
        var table_id;
        if ( tidObject == null || !('value' in tidObject) ) {
            ctxt.append("parsequery._effectChange.missingTableId");
            alert("No table_id specified in Form Definition!");
            ctxt.failure({message: "No table_id specified in form definition."});
            return;
        } else {
            table_id = tidObject.value;
        }

        // Seems like we would only need to create the KV entries for table_id, and otherwise not need to do anything?
        // E.g., to support multiple forms used within one table.
        
        // we cannot write the instanceMetadata or the tableMetadata yet because the underlying tables may not yet exist.

        // on first starting, the database would not have any table_id, form_id or instanceId set...
        var sameTable = (opendatakit.getCurrentTableId() == table_id);
        var sameForm = sameTable && (opendatakit.getSettingValue('form_id') == form_id) && (opendatakit.getCurrentFormPath() == formPath);
        var sameInstance = sameForm && (opendatakit.getCurrentInstanceId() == instanceId) && (instanceId != null);
        var qpl = opendatakit.getHashString(formPath, instanceId, screenPath);

        if ( !sameTable ) {
            opendatakit.clearLocalInfo("table"); // tableId, formPath, instanceId, screenPath, refId
            // reset controller to pristine state...
            that.controller.reset($.extend({},ctxt, {success:function() {
                // build table for table_id...
                // create data table and/or configure the Tables metadata...
                database.initializeTables($.extend({},ctxt,{success:function() {
                        // build the survey and place it in the controller...
                        that.builder.buildSurvey($.extend({}, ctxt, {success:function() {
                                opendatakit.setCurrentFormDef(formDef);
                                opendatakit.setCurrentFormPath(formPath);
                                // currentInstanceId == null
                                // currentInstanceId == null
                                // TODO: load instance...
                                that._prepAndSwitchUI( ctxt, qpl, instanceId, screenPath, refId, sameInstance, instanceMetadataKeyValueMap, formDef );
                            }}), formDef, formPath);
                    }}), formDef, table_id, formPath);
            }}), sameForm);
        } else if (!sameForm) {
            opendatakit.clearLocalInfo("form"); // formPath, instanceId, screenPath, refId
            // reset controller to pristine state...
            that.controller.reset($.extend({},ctxt, {success:function() {
                // build the survey and place it in the controller...
                that.builder.buildSurvey($.extend({}, ctxt, {success: function() {
                            // data table already exists (since table_id is unchanged)
                            // preserve values from the Tables metadata but override form info...
                            opendatakit.setCurrentFormDef(formDef);
                            opendatakit.setCurrentFormPath(formPath);
                            // currentInstanceId == null
                            // TODO: load instance...
                            that._prepAndSwitchUI( ctxt, qpl, instanceId, screenPath, refId, sameInstance, instanceMetadataKeyValueMap, formDef );
                }}), formDef, formPath);
            }}), sameForm);
        } else  if (!sameInstance) {
            opendatakit.clearLocalInfo("instance"); // instanceId, screenPath, refId
            // reset controller to pristine state...
            that.controller.reset($.extend({},ctxt, {success:function() {
                // currentInstanceId == null
                // data table already exists (since table_id is unchanged)
                // form definitions already processed (since formPath and form_id unchanged)

                // currentInstanceId == null
                // TODO: load instance...
                that._prepAndSwitchUI( ctxt, qpl, instanceId, screenPath, refId, sameInstance, instanceMetadataKeyValueMap, formDef );
            }}), sameForm);
        } else {
            opendatakit.clearLocalInfo("screen"); // screenPath, refId
            // currentInstanceId == valid value
            // data table already exists (since table_id is unchanged)
            // form definitions already processed (since formPath and form_id unchanged)
            // same instance -- so just render the UI...
            
            // TODO: change screenPath (presumably)
            that._prepAndSwitchUI( ctxt, qpl, instanceId, screenPath, refId, sameInstance, instanceMetadataKeyValueMap, formDef );
        }
    },
    /**
     * Invoked whenever a URL change alters the window.location.hash
     */
    _parseParameters:function(ctxt) {
        ctxt.append("parsequery._parseParameters");
        var that = this;
        
        var formPath = null;
        var instanceId = null;
        var screenPath = null;
        var refId = null;
        
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
                } else if ( key == 'screenPath' ) {
                    screenPath = value;
                } else if ( key == 'refId' ) {
                    refId = value;
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
            screenPath = null;
        }
        
        if ( refId == null ) {
            ctxt.append('parsequery._parseParameters.shim.refId is null -- generating unique value');
            refId = opendatakit.genUUID();
        }
        
        // This may fail when embedded
        try {
            shim.refId = refId;
        } catch(e) {
            ctxt.append('parsequery._parseParameters.shim.refId assignment failed');
        }
        ctxt.append('parsequery._parseParameters.shim.refId AFTER ASSIGNMENT ', 'refId: ' + refId);
        shim.log('D', 'parsequery._parseParameters.shim.refId AFTER ASSIGNMENT refId: ' + refId);
        
        var formDef = opendatakit.getCurrentFormDef();
        var sameForm = (opendatakit.getCurrentFormPath() == formPath) && (formDef != null);
        var sameInstance = sameForm && (opendatakit.getCurrentInstanceId() == instanceId) && (instanceId != null);
        
        // fetch the form definition (defered processing)
        var filename = formPath + 'formDef.json';
        
        if ( !sameForm ) {
            // force a 'Please wait...' to display before we try to read the formDef file...
            that.controller.reset($.extend({},ctxt, {success:function() {
                that._parseFormDefFile(ctxt, formPath, instanceId, screenPath, refId, instanceMetadataKeyValueMap, filename);
            }}), false );
        } else {
            try {
                that._parseQueryParameterContinuation(ctxt, formDef, formPath, 
                                        instanceId, screenPath, refId, instanceMetadataKeyValueMap);
            } catch (ex) {
                console.error('parsequery._parseParameters.continuationException' + String(ex));
                ctxt.append('parsequery._parseParameters.continuationException',  'unknown error: ' + ex);
                ctxt.failure({message: "Exception while processing form definition."});
            }
        }
    },
    
    /**
     * What actually reads in and loads the formDef file (and then parses the query parameters against it).
     */
    _parseFormDefFile: function(ctxt, formPath, instanceId, screenPath, refId, instanceMetadataKeyValueMap, filename) {
        var that = this;
        var newCtxt = $.extend({},ctxt, {success:function(formDef) {
                that._parseQueryParameterContinuation(ctxt, formDef, formPath, 
                    instanceId, screenPath, refId, instanceMetadataKeyValueMap);
            }});
        opendatakit.readFormDefFile(newCtxt, filename);
    },
    /**
     *
     * window.location.hash is an ampersand-separated list of 
     * key=value pairs. The key and value are escaped.
     * The main values are:
     *    formPath=relative path from the default/index.html to 
     *             the form definition directory (formPath/formDef.json).
     *
     *    instanceId=unique id for this filled-in form instance. May be omitted.
     *
     *    screenPath=slash-delimited concatenation of sectionName/screenIdx.
     *             If omitted, go to initial screen.
     */
    changeUrlHash:function(ctxt) {
        var that = this;
        var qpl;

        var hash = window.location.hash;
        ctxt.append('parsequery.changeUrlHash', "window.location.hash="+hash);

        if ( hash == '#' ) {
            // this is bogus transition due to jquery mobile widgets
            ctxt.append('parsequery.changeUrlHash.emptyHash');
            alert('Hash is invalid!');
            qpl = opendatakit.getHashString(opendatakit.getCurrentFormPath(), opendatakit.getCurrentInstanceId(), that.controller.getCurrentScreenPath());
            ctxt.append('parsequery.changeUrlHash.emptyHash.reset', qpl);
            window.location.hash = qpl;
            ctxt.failure({message: "Internal error: invalid hash (restoring)"});
            return false;
        }
        
        var ctxtNext = $.extend({}, ctxt, {success: function() {
            // and flush any pending doAction callback
            landing.setController(ctxt, that.controller);
          }, failure: function(m) {
            ctxt.append('parsequery.changeUrlHash unable to transition to ' + hash, m);
            if ( hash == "#formPath=" ) {
                ctxt.failure(m);
            } else {
                window.location.hash = "#formPath=";
                that.changeUrlHash($.extend({},ctxt,{success:function() { ctxt.failure(m); }}));
            }
          }});

        that._parseParameters($.extend({},ctxtNext,{success:function() {
                // and update the hash to refer to this page...
                var screenPath = controller.getCurrentScreenPath();
                var newhash = opendatakit.getHashString(opendatakit.getCurrentFormPath(), opendatakit.getCurrentInstanceId(), screenPath);
                if ( newhash != window.location.hash ) {
                    window.location.hash = newhash;
                }
                ctxtNext.success();
        }}));
    }
};
});
