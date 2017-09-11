/**
 circular dependency upon: controller, builder (set via initialize)

 2 public APIs:

 initialize(controller, builder) -- initialize to avoid circular load dependency.
 changeUrlHash(ctxt) -- handle changes to the window.location.hash

*/
define(['opendatakit','database','jquery'],
function(opendatakit,  database,  $) {
/* globals odkCommon, odkSurveyStateManagement */
'use strict';
verifyLoad('parsequery',
    ['opendatakit','database','jquery'],
    [opendatakit,  database,   $]);
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
        if ( key === 'formPath' ) {
            return;
        }
        if ( key === 'instanceId' ) {
            return;
        }
        if ( key === 'screenPath' ) {
            return;
        }
        if ( key === 'refId' ) {
            return;
        }
        instanceMetadataKeyValueMap[key] = value;
    },
    _prepAndSwitchUI:function( ctxt, qpl, instanceId, screenPath, refId, sameInstance, instanceMetadataKeyValueMap ) {
        var that = this;
        // ensure initial empty record is written
        // cacheAllData
        var model = opendatakit.getCurrentModel();
        var formId = opendatakit.getSettingValue('form_id');
        database.initializeInstance($.extend({},ctxt,{success:function() {
            // this will clear the auxillary key-value pairs in the URI.
            // at this point, these initial values will have been applied to the
            // instance's initial values.
            odkSurveyStateManagement.clearAuxillaryHash();
            // fire the controller to render the first page.
            ctxt.log('D',"parsequery._effectChange.startAtScreenPath. " + (sameInstance ? "sameInstance" : "differentForm and/or differentInstance"),
                        "startAtScreenPath("+screenPath+") refId: " + refId + " ms: " + (+new Date()));
            // set the refId. From this point onward,
            // changes will be applied within the odkSurveyStateManagement
            opendatakit.setRefId(refId);
            if ( instanceId === null || instanceId === undefined ) {
                opendatakit.clearCurrentInstanceId();
            } else {
                opendatakit.setCurrentInstanceId(instanceId);
            }
            // if we are not starting fresh, we will have
            // something on the stack -- retain it, otherwise
            // reset the stack to the default content.
            if ( !odkSurveyStateManagement.hasSectionStack(refId) ) {
                odkSurveyStateManagement.clearSectionScreenState(refId);
            }
            that.controller.startAtScreenPath(ctxt, screenPath);
        }}), model, formId, instanceId, sameInstance, instanceMetadataKeyValueMap);
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
     * Otherwise, read the data row for this instanceId directly from the database.
     *
     * Immediate: _effectChange
    */
    _parseQueryParameterContinuation:function(ctxt, formDef, formPath, instanceId, screenPath, refId, instanceMetadataKeyValueMap) {
        var that = this;

        // IMPLEMENTATION NOTE: formDef is only used in the case where sameForm is false.
        // THIS IS AN ASSUMPTION OF THE CALLING FUNCTION!!!!

        if ( formPath === null || formPath === undefined ) {
            ctxt.log('E',"parsequery._parseQueryParameterContinuation.nullFormPath");
            alert("Unexpected null formPath");
            ctxt.failure({message: "No form specified."});
            return;
        }

        if ( formDef === null || formDef === undefined ) {
            ctxt.log('E',"parsequery._parseQueryParameterContinuation.nullFormDef");
            alert("Unexpected null formDef when changing forms");
            ctxt.failure({message: "Form definition is empty."});
            return;
        }

        var fidObject = opendatakit.getSettingObject(formDef, 'form_id');
        if ( fidObject === null || fidObject === undefined || !('value' in fidObject) ) {
            ctxt.log('E',"parsequery._parseQueryParameterContinuation.missingFormId");
            alert("Unexpected missing value for form_id setting when changing forms");
            ctxt.failure({message: "Form definition has no form_id."});
            return;
        }
        var form_id = fidObject.value;

        // defined by form definition's settings:
        var tidObject = opendatakit.getSettingObject(formDef, 'table_id');
        var table_id;
        if ( tidObject === null || tidObject === undefined || !('value' in tidObject) ) {
            ctxt.log('E',"parsequery._parseQueryParameterContinuation.missingTableId");
            alert("No table_id specified in Form Definition!");
            ctxt.failure({message: "No table_id specified in form definition."});
            return;
        } else {
            table_id = tidObject.value;
        }

        // Seems like we would only need to create the KV entries for table_id, and otherwise not need to do anything?
        // E.g., to support multiple forms used within one table.

        // we cannot write the instanceMetadata or the metadata yet because the underlying tables may not yet exist.

        // on first starting, the database would not have any table_id, form_id or instanceId set...
        var sameTable = (opendatakit.getCurrentTableId() === table_id);
        var sameForm = sameTable && (opendatakit.getSettingValue('form_id') === form_id) && (opendatakit.getCurrentFormPath() === formPath);
        var sameInstance = sameForm && (opendatakit.getCurrentInstanceId() === instanceId) && (instanceId !== null) && (instanceId !== undefined);
        var qpl = opendatakit.getSameRefIdHashString(formPath, instanceId, screenPath);

        if ( !sameTable ) {
            ctxt.log('D',"parsequery._parseQueryParameterContinuation.differentTable");
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
            ctxt.log('D',"parsequery._parseQueryParameterContinuation.differentForm");
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
            ctxt.log('D',"parsequery._parseQueryParameterContinuation.differentInstance");
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
            ctxt.log('D',"parsequery._parseQueryParameterContinuation.differentScreen");
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
        ctxt.log('D',"parsequery._parseParameters");
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
                var value = decodeURIComponent(tmp[1]);
                if ( key === 'formPath' ) {
                    formPath = value;
                } else if ( key === 'instanceId' ) {
                    instanceId = value;
                } else if ( key === 'screenPath' ) {
                    screenPath = value;
                } else if ( key === 'refId' ) {
                    refId = value;
                } else {
                    that._parseQueryHelper(instanceMetadataKeyValueMap, key, value);
                }
            }

            if ( formPath !== null &&  formPath !== undefined &&
                 formPath.length > 0 && formPath[formPath.length-1] !== '/' ) {
                formPath = formPath + '/';
            }
        }

        if ( formPath === null || formPath === undefined ) {
            // do the user-configured framework form...
            formPath = '../config/assets/framework/forms/framework/';
            instanceId = null;
            screenPath = null;
        }

        if ( refId === null || refId === undefined ) {
            ctxt.log('I','parsequery._parseParameters.odkSurveyStateManagement.refId is null -- generating unique value');
            refId = opendatakit.genUUID();
        }

        // This may fail when embedded
        try {
			if ( '_setRefId' in odkSurveyStateManagement ) {
			  odkSurveyStateManagement._setRefId(refId);
			}
        } catch(e) {
            ctxt.log('W','parsequery._parseParameters.odkSurveyStateManagement.refId assignment failed (ok if embedded)');
        }
        ctxt.log('D','parsequery._parseParameters.odkSurveyStateManagement.refId AFTER ASSIGNMENT ', 'refId: ' + refId);

        if ( formPath === '../config/assets/framework/forms/framework/' ) {
            // instanceId is always specified and invariant on the framework form.
            instanceId = 'invariant:0';
            odkSurveyStateManagement.setInstanceId(refId, instanceId);
        }

        var formDef = opendatakit.getCurrentFormDef();
        var sameForm = (opendatakit.getCurrentFormPath() === formPath) && (formDef !== null) && (formDef !== undefined);

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
                ctxt.log('E','parsequery._parseParameters.continuationException',  'unknown error: ' + ex.message);
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
     * key=value pairs. The key and value are encodeURIComponent()'d.
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
        ctxt.log('D','parsequery.changeUrlHash', "window.location.hash="+hash);

        if ( hash === '#' ) {
            // this is bogus transition due to jquery mobile widgets
            ctxt.log('W','parsequery.changeUrlHash.emptyHash - bad jqueryMobile interaction!!');
            qpl = opendatakit.getSameRefIdHashString(opendatakit.getCurrentFormPath(), opendatakit.getCurrentInstanceId(), that.controller.getCurrentScreenPath());
            ctxt.log('D','parsequery.changeUrlHash.emptyHash.reset', qpl);
            window.location.hash = qpl;
            ctxt.failure({message: "Internal error: invalid hash (restoring)"});
            return;
        }

        var ctxtNext = $.extend({}, ctxt, {success: function() {
            // and flush any pending doAction callback
            that.controller.registerQueuedActionAvailableListener(ctxt, opendatakit.getRefId());
          }, failure: function(m) {
            // loading the form failed -- transition to loading the framework form, which will display a 'Please wait...' screen
            // on the device. Then, if that is what we are showing, display a pop-up on that with "Failed to load page"
            ctxt.log('E','parsequery.changeUrlHash unable to transition to ' + hash, m);
            if ( hash === '#formPath=' + encodeURIComponent(odkSurvey.getFormPath('framework', 'framework')) ) {
                that.controller.registerQueuedActionAvailableListener(ctxt, opendatakit.getRefId(),
                                                                        m || { message: 'failed to load page'});
            } else {
                window.location.hash = '#formPath=' + encodeURIComponent(odkSurvey.getFormPath('framework', 'framework'));
                that.changeUrlHash($.extend({},ctxt,{success:function() { ctxt.failure(m); }}));
            }
          }});

        that._parseParameters($.extend({},ctxtNext,{success:function() {
                // and update the hash to refer to this page...
                var screenPath = that.controller.getCurrentScreenPath();
                var newhash = opendatakit.getSameRefIdHashString(opendatakit.getCurrentFormPath(), opendatakit.getCurrentInstanceId(), screenPath);
                if ( newhash != window.location.hash ) {
                    window.location.hash = newhash;
                }
                ctxtNext.success();
        }}));
    }
};
});
