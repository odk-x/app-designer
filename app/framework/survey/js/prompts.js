/*jslint eqeq: true, evil: true, plusplus: true, todo: true, vars: true, white: true, devel: true */
'use strict';
/**
 * All  the standard prompts available to a form designer.
 */
define(['database','opendatakit','controller','backbone','formulaFunctions','handlebars','promptTypes','jquery','underscore','translations','handlebarsHelpers','datetimepicker'],
function(database,  opendatakit,  controller,  Backbone,  formulaFunctions,  Handlebars,  promptTypes,  $,       _,           translations,   _hh) {
verifyLoad('prompts',
    ['database','opendatakit','controller','backbone','formulaFunctions','handlebars','promptTypes','jquery','underscore','translations', 'handlebarsHelpers','datetimepicker'],
    [ database,  opendatakit,  controller,  Backbone,  formulaFunctions,  Handlebars,  promptTypes,  $,       _,           translations,   _hh,           $.fn.datetimepicker]);

promptTypes.base = Backbone.View.extend({
    className: "odk-base",
    // type should match the 'xxxx' of the promptTypes.xxxx assignment
    type: "base",
    database: database,
    controller: controller,
    // user-defined inputAttributes overrides _baseInputAttributes
    _baseInputAttributes: {},
    // the handlebars template to render
    template: null,
    //renderContext is a dynamic object to be passed into the render function.
    renderContext: {},
    /**
     * User-overridable data and methods. These can be overridden in 
     * the Excel worksheet.
     */
    constraint_message: "Constraint violated.",
    invalid_value_message: "Invalid value.",
    required_message: "Required value not provided.",
    // the path to the handlebars template that is compiled and stored in 'template'
    templatePath: null,
    // inputAttributes are a user-specified object that overrides _baseInputAttributes.
    inputAttributes: {},
    
    reRender: function(ctxt) {
        this._screen.reRender(ctxt);
    },
    /**
     * Generic methods -- probably should not be overridden
     */
    
    /**
     * initialize
     * called via Backbone when a new instance of this
     * prototype is constructed.
     */
    initialize: function(args) {
        $.extend(this, args);
    },
    /**
     * getPromptPath
     * retrieve the path to this prompt. This is used ONLY by the 
     * shim.doAction(...) method and the corresponding 
     * landing.opendatakitCallback(...) method to ensure that
     * the results of an intent execution (doAction) are routed
     * back to the prompt that initiated that action.
     */
    getPromptPath: function() {
        return this._section_name + '/' + this.promptIdx;
    },
    getPromptId: function() {
        return 'i' + this.getPromptPath().replace(/[^a-zA-Z0-9]/,'');
    },
    /**
     * buildRenderContext
     * Called before a prompt is rendered.
     */
    buildRenderContext: function(ctxt) {
        var that = this;
        that._initializeRenderContext();
        
        that._whenTemplateIsReady($.extend({}, ctxt, {success: function() {
            that.configureRenderContext(ctxt);
        }}));
    },
    /**
     * _whenTemplateIsReady
     * Ensure that the template is loaded and compiled before 
     * proceeding (via ctxt.success()).
     * 
     * Part of the preliminaries to rendering a page.
     */
    _whenTemplateIsReady: function(ctxt){
        var that = this;
        if(that.template) {
            ctxt.success();
        } else if(that.templatePath) {
            try {
                require(['text!'+that.templatePath], function(source) {
                    try {
                        that.template = Handlebars.compile(source);
                        ctxt.log('D',"prompts."+that.type+"._whenTemplateIsReady.success", 
                            " px: " + that.promptIdx);
                        // ensure that require is unwound
                        setTimeout(function() { 
                                ctxt.log('I',"prompts."+that.type+"._whenTemplateIsReady.success.setTimeout", 
                                            " px: " + that.promptIdx);
                                ctxt.success(); 
                            }, 
                            0 );
                    } catch (e) {
                        ctxt.log('E',"prompts."+that.type+"._whenTemplateIsReady.exception", 
                            " px: " + that.promptIdx + " exception: " + e.message + " e: " + String(e));
                        ctxt.failure({message: "Error compiling handlebars template."});
                    }
                }, function(err) {
                    ctxt.log('E',"prompts."+that.type+"._whenTemplateIsReady.require.failure " + err.requireType + ' modules: ',
                        err.requireModules.toString() + " px: " + that.promptIdx);
                    ctxt.failure({message: "Error loading handlebars template."});
                });
            } catch (e) {
                ctxt.log('E',"prompts."+that.type+"._whenTemplateIsReady.require.exception", 
                    " px: " + that.promptIdx + " exception: " + e.message + " e: " + String(e));
                ctxt.failure({message: "Error reading handlebars template."});
            }
        } else {
            ctxt.log('E',"prompts." + that.type + "._whenTemplateIsReady.noTemplate", "px: " + that.promptIdx);
            ctxt.failure({message: "Configuration error: No handlebars template found!"});
        }
    },
    /**
     * _initializeRenderContext
     * construct the renderContext for this prompt. This is an entirely new
     * object every time the screen is redrawn.
     */
    _initializeRenderContext: function() {
        //Object.create is used because we don't want to modify the class's render context.
        this.renderContext = Object.create(this.renderContext);
        this.renderContext.display = this.display;
        this.renderContext.promptId = this.getPromptId();
        this.renderContext.name = this.name;
        this.renderContext.disabled = this.disabled;
        this.renderContext.image = this.image;
        this.renderContext.audio = this.audio;
        this.renderContext.video = this.video;
        this.renderContext.hint = this.hint;
        this.renderContext.required = this.required;
        this.renderContext.appearance = this.appearance;
        this.renderContext.withOther = this.withOther;
        //It's probably not good to get data like this in initialize
        //Maybe it would be better to use handlebars helpers to get metadata?
        this.renderContext.form_title = opendatakit.getCurrentSectionTitle(this._section_name);
        this.renderContext.form_version = opendatakit.getSettingValue('form_version');
        // set whether we are pre-4.x Android OS (legacy compatibility)
        var platinfo = opendatakit.getPlatformInfo();
        if ( platinfo.container !== 'Android' ) {
            this.renderContext.pre4Android = false;
        } else {
            this.renderContext.pre4Android = ( platinfo.version.substring(0,1) < "4" );
        }
        this.renderContext.inputAttributes = $.extend({}, this._baseInputAttributes, this.inputAttributes);
    },
    /**
     * configureRenderContext
     * User-overridable action to perform additional actions prior to the call to render.
     */
    configureRenderContext: function(ctxt){
        ctxt.success();
    },
    /**
     * stopPropagation is used in the events map to disable swiping on various elements
     **/
    stopPropagation: function(evt){
        var ctxt = this.controller.newContext(evt);
        ctxt.log('D',"prompts." + this.type + ".stopPropagation", "px: " + this.promptIdx + " evt: " + evt);
        evt.stopImmediatePropagation();
        ctxt.success();
    },
    afterRender: function() {},
    _render: function() {
        var that = this;
        try {
            that.$el.html(this.template(this.renderContext));
        } catch(e) {
            console.error("prompts." + that.type + "._render.exception: " + String(e) + ' px: ' + that.promptIdx);
            console.error(that);
            alert("Error in template.");
        }
        return;
    },
    /**
     * _isValid isn't meant to be overidden.
     * It does validation that will be common to most prompts.
     **/
    _isValid: function(isStrict) {
        var that = this;
        var isRequired = false;
        try {
            isRequired = that.required ? that.required() : false;
        } catch (e) {
            if ( isStrict ) {
                shim.log('E',"prompts."+that.type+"._isValid.required.exception.strict px: " +
                    that.promptIdx + " exception: " + e.message + " e: " + String(e));
                return { message: "Exception while evaluating required() expression. See console log." };
            } else {
                shim.log("W","prompts."+that.type+"._isValid.required.exception.ignored px: " +
                    that.promptIdx + " exception: " + e.message + " e: " + String(e));
                isRequired = false;
            }
        }
        that.valid = true;
        if ( !('name' in that) ) {
            // no data validation if no persistence...
            return null;
        } 
        
        // compute the field display name...
        var locale = database.getInstanceMetaDataValue('_locale');
        if ( locale === undefined || locale === null ) {
            locale = opendatakit.getDefaultFormLocaleValue();
        }
        var fieldDisplayName;
        if (that.renderContext.display) {
            var textOrMap = (that.renderContext.display.title ? 
                that.renderContext.display.title : that.renderContext.display.text);
            fieldDisplayName = formulaFunctions.localize(textOrMap,locale);
        } else {
            fieldDisplayName = '';
        }
        
        var value = that.getValue();
        if ( value === undefined || value === null || value === "" ) {
            if ( isRequired ) {
                that.valid = false;
                var localizeRequiredMessage = formulaFunctions.localize(that.required_message,locale);
                return { message: localizeRequiredMessage + " " + fieldDisplayName };
            }
        } else if ( 'validateValue' in that ) {
            if ( !that.validateValue() ) {
                that.valid = false;
                var localizeInvalidValueMessage = formulaFunctions.localize(that.invalid_value_message,locale);
                return { message: localizeInvalidValueMessage + " " + fieldDisplayName };
            }
        } 
        if ( 'constraint' in that ) {
            var outcome = false;
            try {
                outcome = that.constraint({"allowExceptions":true});
                if ( !outcome ) {
                    that.valid = false;
                    var localizeConstraintMessage = formulaFunctions.localize(that.constraint_message,locale);
                    return { message: localizeConstraintMessage + " " + fieldDisplayName };
                }
            } catch (e) {
                shim.log('E',"prompts."+that.type+".baseValidate.constraint.exception px: " +
                    that.promptIdx + " exception: " + e.message + " e: " + String(e));
                outcome = false;
                that.valid = false;
                return { message: "Exception while evaluating constraint() expression. See console log." };
            }
        }
        return null;
    },
    formattedValueForContentsDisplay: function() {
        if ( !this.name ) {
            return '';
        } else {
            return this.getValue();
        }
    },
    getValue: function() {
        if (!this.name) {
            console.error("prompts."+this.type+
                ".getValue: Cannot get value of prompt with no name. px: " + this.promptIdx);
            throw new Error("Cannot get value of prompt with no name.");
        }
        return database.getDataValue(this.name);
    },
    setValueDeferredChange: function(value) {
        // NOTE: data IS NOT updated synchronously. Use callback!
        var that = this;
        database.setValueDeferredChange(that.name, value);
    },
    beforeMove: function() {
        shim.log('D',"prompts." + this.type + " px: " + this.promptIdx);
        return null;
    },
    getCallback: function(promptPath, internalPromptContext, action) {
        throw new Error("prompts." + this.type, "px: " + this.promptIdx + " unimplemented promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
    },
    /**
     * Useful routines to convert a selection string and an order by string
     * into a proper database query string. These strings are cached after
     * the conversion.  Used by the instances and linked_type prompts
     */
    _cachedSelection: null,
    convertSelection: function(model) {
        var that = this;
        var queryDefn = opendatakit.getQueriesDefinition(that.values_list);
        if ( queryDefn.selection == null || queryDefn.selection.length === 0 ) {
            return null;
        }
        if ( that._cachedSelection != null ) {
            return that._cachedSelection;
        }
        that._cachedSelection = database.convertSelectionString(model, queryDefn.selection);
        return that._cachedSelection;
    },
    _cachedOrderBy : null,
    convertOrderBy: function(model) {
        var that = this;
        var queryDefn = opendatakit.getQueriesDefinition(that.values_list);
        if ( queryDefn.order_by == null || queryDefn.order_by.length === 0 ) {
            return null;
        }
        if ( that._cachedOrderBy != null ) {
            return that._cachedOrderBy;
        }
        that._cachedOrderBy = database.convertOrderByString(model, queryDefn.order_by);
        return that._cachedOrderBy;
    },
    populateChoicesViaQueryUsingAjax : function(query, newctxt){
        var that = this;
        var queryUri = query.uri();
        if(queryUri.search('//') < 0){
            //If the uri is not a content provider or web resource,
            //assume the path  is relative to the form directory.
            queryUri = opendatakit.getCurrentFormPath() + queryUri;
        }

        var ajaxOptions = {
            "type": 'GET',
            "url": queryUri,
            "dataType": 'json',
            "data": {},
            "success": function(result){
                that.renderContext.choices = query.callback(result);
                newctxt.success("success");
            },
            "error": function(e) {
                //This is a passive error because there could just be a problem
                //with the content provider/network/remote service rather than with
                //the form.
                newctxt.log('W',"prompts." + this.type + ".configureRenderContext.error", 
                            "px: " + this.promptIdx + " Error fetching choices " + e);
                that.renderContext.passiveError = "Error fetching choices.\n";
                if(e.statusText) {
                    that.renderContext.passiveError += e.statusText;
                }
                // TODO: verify how this error should be handled...
                newctxt.failure({message: "Error fetching choices via ajax."});
            }
        };

        //TODO: It might also be desireable to make it so queries can reference
        //datasheets in the XLSX file.
        var queryUriExt = queryUri.split('.').pop();
        if(queryUriExt === 'csv') {
            ajaxOptions.dataType = 'text';
            ajaxOptions.success = function(result) {
                try {
                    //require(['jquery-csv'], function(){
                        that.renderContext.choices = query.callback($.csv.toObjects(result));
                        newctxt.success("success");
                    //},
                    //function (err) {
                    //    newctxt.log('E',"prompts."+that.type+".require.failure " + err.requireType + ' modules: ',
                    //        err.requireModules.toString() + " px: " + that.promptIdx);
                    //    newctxt.failure({message: "Error fetching choices from csv data."});
                    //});
                } catch (e) {
                    newctxt.log('E',"promptType." + that.type, "exception: " + e.message + " e: " + e.toString());
                    newctxt.failure({message: "Error reading choices from csv data."});
                }
            };
        }
        $.ajax(ajaxOptions);
    },
    __test__: function(evt){
        //This is a utility function for checking to make sure event maps are working.
        shim.log('T',evt);
    }
});
promptTypes.opening = promptTypes.base.extend({
    type: "opening",
    hideInContents: true,
    templatePath: "templates/opening.handlebars",
    configureRenderContext: function(ctxt) {
        var that = this;
        var formLogo = false;//TODO: Need way to access form settings.
        if(formLogo){
            this.renderContext.headerImg = formLogo;
        }
        var lastSave = database.getInstanceMetaDataValue('_savepoint_timestamp');
        var ts = that.renderContext.last_save_date = opendatakit.convertNanosToDateTime(lastSave);
        
        var displayElementName = opendatakit.getSettingValue('instance_name');
        if ( displayElementName != null ) {
            that.renderContext.display_field = database.getDataValue(displayElementName);
        } else {
            // Now we are always going to display instance id
            // unless this decision changes ...
            that.renderContext.display_field = ts.toISOString();
        }
        if ( that._screen && that._screen._renderContext ) {
            that._screen._renderContext.enableBackNavigation = false;
        }
        ctxt.success();
    },
    renderContext: {
        headerImg: requirejs.toUrl('../assets/img/form_logo.png'),
        backupImg: requirejs.toUrl('../assets/img/backup.png'),
        advanceImg: requirejs.toUrl('../assets/img/advance.png')
    },
    //Events copied from input_type, should probably refactor.
    events: {
        "swipeleft .input-container": "stopPropagation",
        "swiperight .input-container": "stopPropagation"
    }
});
promptTypes.finalize = promptTypes.base.extend({
    type:"finalize",
    hideInContents: true,
    valid: true,
    templatePath: "templates/finalize.handlebars",
    events: {
        "click .incomplete": "saveIncomplete",
        "click .finalize": "saveFinal"
    },
    renderContext: {
        headerImg: requirejs.toUrl('../assets/img/form_logo.png')
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        var formLogo = false;//TODO: Need way to access form settings.
        if(formLogo){
            this.renderContext.headerImg = formLogo;
        }
        var lastSave = database.getInstanceMetaDataValue('_savepoint_timestamp');
        var ts = opendatakit.convertNanosToDateTime(lastSave);
        
        var displayElementName = opendatakit.getSettingValue('instance_name');
        if ( displayElementName != null ) {
            that.renderContext.display_field = database.getDataValue(displayElementName);
        } else {
            // Now we are always going to display instance id
            // unless this decision changes ...
            that.renderContext.display_field = ts.toISOString();
        }
        if ( that._screen && that._screen._renderContext ) {
            that._screen._renderContext.enableForwardNavigation = false;
        }
        ctxt.success();
    },
    saveIncomplete: function(evt) {
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.log('D',"prompts." + this.type + ".saveIncomplete", "px: " + this.promptIdx);

        that.controller.saveIncomplete($.extend({},ctxt,{success:function() {
                that.controller.leaveInstance(ctxt);
            }}));
    },
    saveFinal: function(evt) {
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.log('D',"prompts." + this.type + ".saveFinal", "px: " + this.promptIdx);
        that.controller.gotoFinalizeAndTerminateAction(ctxt);
    }
});
promptTypes.json = promptTypes.base.extend({
    type:"json",
    hideInContents: true,
    valid: true,
    templatePath: "templates/json.handlebars",
    configureRenderContext: function(ctxt) {
        var that = this;
        if ( JSON != null ) {
            that.renderContext.value = JSON.stringify(database.getAllDataValues(),null,2);
        } else {
            that.renderContext.value = "JSON Unavailable";
        }
        if ( that._screen && that._screen._renderContext ) {
            that._screen._renderContext.enableNavigation = false;
        }
        ctxt.success();
    }
});
promptTypes.instances = promptTypes.base.extend({
    type:"instances",
    hideInContents: true,
    valid: true,
    savepoint_type_finalized_text: 'Finalized',
    savepoint_type_incomplete_text: 'Incomplete',
    savepoint_type_checkpoint_text: 'Checkpoint',
    templatePath: "templates/instances.handlebars",
    events: {
        "click .openInstance": "openInstance",
        "click .deleteInstance": "deleteInstance",
        "click .createInstance": "createInstance"
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        ctxt.log('D',"prompts." + that.type + ".configureRenderContext", "px: " + that.promptIdx);
        
        // see if we are supposed to apply a query filter to this...
        var model = opendatakit.getCurrentModel();
        var displayElementName = opendatakit.getSettingValue('instance_name');
        var selection = null;
        var selectionArgs = null;
        var orderBy = null;
        if ( that.values_list !== undefined && that.values_list !== null ) {
            var queryDefn = null;
            queryDefn = opendatakit.getQueriesDefinition(that.values_list);
            if ( queryDefn === undefined || queryDefn === null ) {
                ctxt.failure({message: "Error displaying instances: could not retrieve query definition"});
                return;
            } else 
            if ( queryDefn.linked_table_id !== opendatakit.getCurrentTableId() ) {
                ctxt.failure({message: "Error displaying instances: tableId of value_list query does not match current tableId"});
                return;
            }
            selection = that.convertSelection(model);
            selectionArgs = queryDefn.selectionArgs();
            orderBy = that.convertOrderBy(model);
        }

        // in this case, we are our own 'linked' table.
        database.get_linked_instances($.extend({},ctxt,{success:function(instanceList) {
                that.renderContext.instances = _.map(instanceList, function(term) {
                    var savepoint_type = term.savepoint_type;
                    if ( savepoint_type === opendatakit.savepoint_type_complete ) {
                        term.savepoint_type_text = that.savepoint_type_finalized_text;
                    } else if ( savepoint_type === opendatakit.savepoint_type_incomplete ) {
                        term.savepoint_type_text = that.savepoint_type_incomplete_text;
                    } else {
                        term.savepoint_type_text = that.savepoint_type_checkpoint_text;
                    }
                    return term;
                });
                
                $.extend(that.renderContext, {
                    headerImg: requirejs.toUrl('../assets/img/form_logo.png')
                });
                if ( that._screen && that._screen._renderContext ) {
                    that._screen._renderContext.showHeader = false;
                    that._screen._renderContext.enableNavigation = false;
                    that._screen._renderContext.showFooter = false;
                }
                ctxt.success();
            }
        }), model.table_id, selection, selectionArgs, displayElementName, orderBy);
    },
    createInstance: function(evt){
      var ctxt = this.controller.newContext(evt);
      evt.stopPropagation(true);
      evt.stopImmediatePropagation();
      ctxt.log('D',"prompts." + this.type + ".createInstance", "px: " + this.promptIdx);
      this.controller.createInstance(ctxt);
    },
    openInstance: function(evt) {
      var ctxt = this.controller.newContext(evt);
      evt.stopPropagation(true);
      evt.stopImmediatePropagation();
      ctxt.log('D',"prompts." + this.type + ".openInstance", "px: " + this.promptIdx);
      this.controller.openInstance(ctxt, $(evt.currentTarget).attr('id'));
    },
    deleteInstance: function(evt){
        var that = this;
        var ctxt = that.controller.newContext(evt);
        var model = opendatakit.getCurrentModel();
        ctxt.log('D',"prompts." + that.type + ".deleteInstance", "px: " + that.promptIdx);

        // in this case, we are our own 'linked' table.
        database.delete_linked_instance_all($.extend({}, ctxt, {success: function() {
                that.reRender(ctxt);
            }}),
        model.table_id, $(evt.currentTarget).attr('id'));
    }
});
promptTypes.contents = promptTypes.base.extend({
    type:"contents",
    hideInContents: true,
    valid: true,
    templatePath: 'templates/contents.handlebars',
    events: {
        "click .select-contents-item": "selectContentsItem"
    },
    selectContentsItem: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.log('D',"prompts." + that.type + ".selectContentsItem: click detected: " + evt.target);
        var $target = $(evt.target).closest('.select-contents-item');
        $target.attr("label", function(index, oldPropertyValue){
            ctxt.log('D',"prompts." + that.type + ".selectContentsItem: click near label: " + oldPropertyValue,
                "px: " + that.promptIdx);
            // TODO: allow user to specify whether or not this is an 'advancing' operation
            that.controller.gotoScreenPath(ctxt, oldPropertyValue, true);
        });
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        that.renderContext.prompts = that.controller.getCurrentSectionPrompts();
        if ( that._screen && that._screen._renderContext ) {
            that._screen._renderContext.showHeader = true;
            that._screen._renderContext.showFooter = false;
        }
        ctxt.success();
    }
});
promptTypes._linked_type = promptTypes.base.extend({
    type: "_linked_type",
    getLinkedTableId: function() {
        var queryDefn = opendatakit.getQueriesDefinition(this.values_list);
        if ( queryDefn != null )
        {
            if ( queryDefn.linked_table_id == null ) {
                return queryDefn.linked_form_id;
            } else {
                return queryDefn.linked_table_id;
            }
        } else {
            shim.log('E',"query definiton is null for " + this.type + " in getLinkedTableId");
            return null;
        }
    },
    getLinkedFormId: function() {
        var queryDefn = opendatakit.getQueriesDefinition(this.values_list);
        if ( queryDefn != null )
        {
            return queryDefn.linked_form_id;
        } else {
            shim.log('E',"query definiton is null for " + this.type + " in getLinkedFormId");
            return null;
        }
    },
    getFormPath: function() {
        if ( this.getLinkedFormId() === "framework" ) {
            return '../assets/framework/forms/framework/'; 
        } else {
            return '../tables/' + this.getLinkedTableId() + '/forms/' + this.getLinkedFormId() + '/'; 
        }
    },
    _linkedCachedModel: null,
    _linkedCachedInstanceName: null,
    getLinkedInstanceName: function() {
        return this._linkedCachedInstanceName;
    },
    getlinkedModel: function(ctxt) {
        var that = this;
        if ( that._linkedCachedModel != null ) {
            ctxt.success(that._linkedCachedModel);
            return;
        }
        var filePath = that.getFormPath() + 'formDef.json';
        opendatakit.readFormDefFile($.extend({},ctxt,{success:function(formDef) {
             var ino = opendatakit.getSettingObject(formDef, 'instance_name');
             if ( ino !== null ) {
                that._linkedCachedInstanceName = ino.value;
            } else {
                that._linkedCachedInstanceName = null;
            }
            database.readTableDefinition($.extend({}, ctxt, {success:function(tlo) {
                ctxt.log('D',"prompts." + that.type + 
                    'getlinkedModel.readTableDefinition.success', "px: " + that.promptIdx );
                that._linkedCachedModel = tlo;
                ctxt.success(tlo);
            }}), formDef, that.getLinkedTableId(), filePath);
        }}), filePath );
    },
    getCallback: function(promptPath, byinternalPromptContext, byaction) {
        var that = this;
        if ( that.getPromptPath() != promptPath ) {
            throw new Error("Promptpath does not match: " + promptPath + " vs. " + that.getPromptPath());
        }
        return function(ctxt, internalPromptContext, action, jsonString) {
            ctxt.log('D',"prompts." + that.type + 'getCallback.actionFn', "px: " + that.promptIdx +
                " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
            var jsonObject = JSON.parse(jsonString);
            if (jsonObject.status === -1 /* Activity.RESULT_OK */ ) {
                ctxt.log('D',"prompts." + that.type + 'getCallback.actionFn.resultOK', "px: " + that.promptIdx +
                    " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                that.enableButtons();
                that.reRender(ctxt);
            }
            else {
                ctxt.log('W',"prompts." + that.type + 'getCallback.actionFn.failureOutcome failure returned from intent', 
                    "px: " + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " + 
                    internalPromptContext + " action: " + action + " jsonString: " + jsonString);
                that.enableButtons();
                that.reRender($.extend({}, ctxt, {success: function() { ctxt.failure({message: "Action canceled."});},
                    failure: function(j) { ctxt.failure({message: "Action canceled."});}}));
            }
        };
    }
});
promptTypes.linked_table = promptTypes._linked_type.extend({
    type: "linked_table",
    valid: true,
    _cachedEvent: null,
    templatePath: 'templates/linked_table.handlebars',
    launchAction: 'org.opendatakit.survey.android.activities.MainMenuActivity',

    events: {
        "click .openInstance": "openInstance",
        "click .deleteInstance": "confirmDeleteInstance",
        "click .addInstance": "addInstance"
    },
    disableButtons: function() {
        var that = this;
        that.$('.openInstance').attr('disabled','true');
        that.$('.deleteInstance').attr('disabled','true');
        that.$('.addInstance').attr('disabled','true');
    },
    enableButtons: function() {
        var that = this;
        that.$('.openInstance').removeAttr('disabled');
        that.$('.deleteInstance').removeAttr('disabled');
        that.$('.addInstance').removeAttr('disabled');
    },
    choice_filter: function(){ return true; },
    configureRenderContext: function(ctxt) {
        var that = this;
        var queryDefn = opendatakit.getQueriesDefinition(this.values_list);
        ctxt.log('D',"prompts." + that.type + ".configureRenderContext", "px: " + that.promptIdx);
        that.renderContext.new_instance_text = ((that.display.new_instance_text != null) ? that.display.new_instance_text : "New");
        that.getlinkedModel($.extend({},ctxt,{success:function(linkedModel) {
            var dbTableName = linkedModel.table_id;
            var selString = that.convertSelection(linkedModel);
            var selArgs = queryDefn.selectionArgs();
            var ordBy = that.convertOrderBy(linkedModel);
            var displayElementName = that.getLinkedInstanceName();
            ctxt.log('D',"prompts." + that.type + ".configureRenderContext.before.get_linked_instances", "px: " + that.promptIdx);
            database.get_linked_instances($.extend({},ctxt,{success:function(instanceList) {
                ctxt.log('D',"prompts." + that.type + ".configureRenderContext.success.get_linked_instances", "px: " + that.promptIdx);
                var filteredInstanceList = _.filter(instanceList, function(instance) {
                    return that.choice_filter(instance);
                });
                instanceList = filteredInstanceList;
                // set the image icon
                for (var i = 0; i < instanceList.length ; i++){
                    // sets the savepoint_type to incomplete if the formId doesn't match the current form
                    if (instanceList[i]["form_id"] != that.getLinkedFormId()) {
                        instanceList[i].savepoint_type = opendatakit.savepoint_type_incomplete;
                    }
                    
                    if (instanceList[i]["savepoint_type"] == "COMPLETE"){
                        instanceList[i]["icon_class"] = "glyphicon-ok";
                    }  
                    else{
                        instanceList[i]["icon_class"] = "glyphicon-warning-sign";
                    }
                    //make the date more readable
                    instanceList[i]["savepoint_timestamp"] = opendatakit.getShortDateFormat(instanceList[i]["savepoint_timestamp"]);          
                }

                that.renderContext.instances = instanceList;

                that.renderContext.columns = [
                    { title : "Last Saved"},
                    { title : "Name"},
                    { title : "Finalized"},
                    { title : ""}
                ];
                    
             

                ctxt.log('D',"prompts." + that.type + ".configureRenderContext.success.get_linked_instances.success", "px: " + that.promptIdx + " instanceList: " + instanceList.length);
                ctxt.success();
            }}), dbTableName, selString, selArgs, displayElementName, ordBy);
        }}));
    },
    openInstance: function(evt) {
        var instanceId = undefined;
        var openButton = $(evt.target).closest(".openInstance");

        if (openButton != undefined) {
            instanceId = openButton.attr("instance-id");
        }
        else {
            shim.log('E',"In linked_table.openInstance instanceId is undefined");
            return;
        }

        var that = this;
        var ctxt = that.controller.newContext(evt);
        that.disableButtons();
        var platInfo = opendatakit.getPlatformInfo();
        // TODO: is this the right sequence?
        var uri = platInfo.formsUri + platInfo.appName + '/' + that.getLinkedFormId();
        var expandedUrl = platInfo.baseUri + 'framework/index.html' + opendatakit.getHashString(that.getFormPath(),instanceId, opendatakit.initialScreenPath);
        var outcome = shim.doAction( opendatakit.getRefId(), that.getPromptPath(), 
            'launchSurvey', that.launchAction, 
            JSON.stringify({ uri: uri + opendatakit.getHashString(that.getFormPath(),instanceId, opendatakit.initialScreenPath),
                             extras: { url: expandedUrl }}));
        ctxt.log('D','linked_table.openInstance', platInfo.container + " outcome is " + outcome);
        if (outcome === null || outcome !== "OK") {
            ctxt.log('W','linked_table.openInstance',"Should be OK got >" + outcome + "<");
            that.enableButtons();
            ctxt.failure({message: "Action canceled."});
        } else {
            ctxt.success();
        }
    },
    confirmDeleteInstance: function(evt) {
        var that = this;
        var instanceId = undefined;
        var instanceName = undefined;
        var deleteButton = $(evt.target).closest(".deleteInstance");
        
        if (deleteButton != undefined) {
            instanceId  = deleteButton.attr("instance-id"); 
            instanceName = deleteButton.attr("instance-name");
        }
        else {
            shim.log('E',"In linked_table.confirmDeleteInstance instanceId is undefined"); 
            return;
        }

        that._cachedEvent = evt;
        that._screen._screenManager.showConfirmationPopup({message:"Delete " + instanceName + "?", 
                                                           promptIndex:that.promptIdx});
    },
    handleConfirmation: function() {
        var that = this;

        if (that._cachedEvent == null) {
            shim.log('E',"In linked_table.handleConfirmation _cachedEvent is null"); 
            return ({message:"In linked_table.deleteInstance _cachedEvent is null"});
        }
        var instanceId = undefined;
        var deleteButton = $(that._cachedEvent.target).closest(".deleteInstance");
        
        if (deleteButton != undefined) {
            instanceId  = deleteButton.attr("instance-id"); 
        }
        else {
            shim.log('W',"In linked_table.handleConfirmation instanceId is undefined"); 
            return null;
        }

        var ctxt = that.controller.newContext(that._cachedEvent);
        var tableRow = $(that._cachedEvent.target).closest(".linkedTable tr");
        if (tableRow != undefined)
            tableRow.remove();

        that.disableButtons();
        that.getlinkedModel($.extend({},ctxt,{success:function(linkedModel) {
            var dbTableName = linkedModel.table_id;
            database.delete_linked_instance_all($.extend({},ctxt,{success:function() {
                    that.enableButtons();
                    that.reRender(ctxt);
                },
                failure:function(m) {
                    that.enableButtons();
                    ctxt.failure(m);
                }}), dbTableName, instanceId);
        }}));
        that._cachedEvent = null;
        return null;
    },
    addInstance: function(evt) {
        var queryDefn = opendatakit.getQueriesDefinition(this.values_list);
        var instanceId = opendatakit.genUUID();
        var that = this;
        var ctxt = that.controller.newContext(evt);
        that.disableButtons();
        var platInfo = opendatakit.getPlatformInfo();
        // TODO: is this the right sequence?
        var uri = platInfo.formsUri + platInfo.appName + '/' + that.getLinkedFormId();
        var auxHash = '';
        if ( queryDefn.auxillaryHash ) {
            auxHash = queryDefn.auxillaryHash();
            if ( auxHash && auxHash !== '' && auxHash.charAt(0) !== '&' ) {
                auxHash = '&' + auxHash;
            }
        }
        var expandedUrl = platInfo.baseUri + 'framework/index.html' + opendatakit.getHashString(that.getFormPath(),instanceId, opendatakit.initialScreenPath) + auxHash;
        var outcome = shim.doAction( opendatakit.getRefId(), that.getPromptPath(), 
            'launchSurvey', that.launchAction, 
            JSON.stringify({ uri: uri + opendatakit.getHashString(that.getFormPath(),instanceId, opendatakit.initialScreenPath) + auxHash,
                             extras: { url: expandedUrl }}));
        ctxt.log('D','linked_table.addInstance', platInfo.container + " outcome is " + outcome);
        if (outcome === null || outcome !== "OK") {
            ctxt.log('W','linked_table.addInstance',"Should be OK got >" + outcome + "<");
            that.enableButtons();
            ctxt.failure({message: "Action canceled."});
        } else {
            ctxt.success();
        }
    }
});
promptTypes.external_link = promptTypes.base.extend({
    type: "external_link",
    valid: true,
    templatePath: 'templates/external_link.handlebars',
    launchAction: 'android.content.Intent.ACTION_VIEW',
    url: null,
    renderContext: {
    },
    events: {
        "click .openLink": "openLink"
    },
    disableButtons: function() {
        var that = this;
        that.$('.openLink').attr('disabled','true');
    },
    enableButtons: function() {
        var that = this;
        that.$('.openLink').removeAttr('disabled');
    },
    openLink: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        var fullUrl = that.url();
        var launchAction = that.launchAction;
        var expandedUrl;
        if ( fullUrl.match(/^(\/|\.|[a-zA-Z]+:).*/) ) {
            expandedUrl = fullUrl;
        } else {
            // relative URL. Assume this stays within Survey
            expandedUrl = opendatakit.getPlatformInfo().baseUri + 'framework/index.html' + fullUrl;
            fullUrl = opendatakit.convertHashStringToSurveyUri(fullUrl);
            // implicit intents are not working?
            // launchAction = 'android.content.Intent.ACTION_EDIT';
            launchAction = 'org.opendatakit.survey.android.activities.SplashScreenActivity';
        }
        that.disableButtons();
        var platInfo = opendatakit.getPlatformInfo();
        // TODO: is this the right sequence?
        var outcome = shim.doAction( opendatakit.getRefId(), that.getPromptPath(), 
            'openLink', launchAction, 
            JSON.stringify({ uri: fullUrl,
                extras: { url: expandedUrl }}));
        ctxt.log('D','external_link.openLink', platInfo.container + " outcome is " + outcome);
        if (outcome === null || outcome !== "OK") {
            ctxt.log('W','external_link.openLink',"Should be OK got >" + outcome + "<");
            that.enableButtons();
            ctxt.failure({message: "Action canceled."});
        } else {
            ctxt.success();
        }
    },
    getCallback: function(promptPath, byinternalPromptContext, byaction) {
        var that = this;
        if ( that.getPromptPath() != promptPath ) {
            throw new Error("Promptpath does not match: " + promptPath + " vs. " + that.getPromptPath());
        }
        return function(ctxt, internalPromptContext, action, jsonString) {
            ctxt.log('D',"prompts." + that.type + 'getCallback.actionFn', "px: " + that.promptIdx +
                " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
            var jsonObject = JSON.parse(jsonString);
            if (jsonObject.status === -1 /* Activity.RESULT_OK */ ) {
                ctxt.log('D',"prompts." + that.type + 'getCallback.actionFn.resultOK', "px: " + that.promptIdx +
                    " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                that.enableButtons();
                that.reRender(ctxt);
            }
            else {
                ctxt.log('W',"prompts." + that.type + 'getCallback.actionFn.failureOutcome failure returned from intent:',
                    "px: " + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " + 
                    internalPromptContext + " action: " + action + " jsonString: " + jsonString);
                that.enableButtons();
                that.reRender($.extend({}, ctxt, {success: function() { ctxt.failure({message: "Action canceled."});},
                    failure: function(j) { ctxt.failure({message: "Action canceled."});}}));
            }
        };
    }
});
promptTypes.user_branch = promptTypes.base.extend({
    type: "user_branch",
    templatePath: "templates/user_branch.handlebars",
    renderContext: {
    },
    events: {
        "click .branch-select-item": "selectBranchItem"
    },
    selectBranchItem: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.log('D',"prompts." + that.type + ".selectBranchItem: click detected: " + evt.target);
        var $target = $(evt.target).closest('.branch-select-item');
        $target.attr("label", function(index, oldPropertyValue) {
            ctxt.log('D',"prompts." + that.type + ".selectBranchItem: click near label: " + oldPropertyValue);
            var currentPath = that.controller.getCurrentScreenPath();
            var parts = currentPath.split("/");
            if ( parts.length < 2 ) {
                ctxt.log('E',"prompts." + that.type + ".selectBranchItem: invalid currentPath: " + currentPath);
                ctxt.failure({message: "invalid currentPath: " + currentPath});
                return;
            }
            var newPath = parts[0] + "/" + oldPropertyValue;
            ctxt.log('D',"prompts." + that.type + ".click", "px: " + that.promptIdx);
            // TODO: allow user to specify whether or not this is an 'advancing' operation
            that.controller.gotoScreenPath(ctxt,newPath,true);
        });
    },
    choice_filter: function(){ return true; },
    configureRenderContext: function(ctxt) {
        var that = this;
        var newctxt = $.extend({}, ctxt, {success: function(outcome) {
            ctxt.log('D',"prompts." + that.type + ".configureRenderContext." + outcome,
                        "px: " + that.promptIdx);
            ctxt.success();
        }});
        
        that.renderContext.passiveError = null;
        var queryDefn = opendatakit.getQueriesDefinition(that.values_list);
        var choiceListDefn = opendatakit.getChoicesDefinition(that.values_list);
        if(queryDefn != null) {
            that.populateChoicesViaQueryUsingAjax(queryDefn, newctxt);
        } else if (choiceListDefn != null) {
            //Very important.
            //We need to clone the choices so their values are unique to the prompt.
            that.renderContext.choices = _.map(choiceListDefn, _.clone);
            newctxt.success("choiceList.success");
        } else {
            newctxt.failure({message: "Error fetching choices -- no ajax query or choices defined"});
        }
    }
});
promptTypes.select = promptTypes._linked_type.extend({
    type: "select",
    templatePath: "templates/select.handlebars",
    events: {
        "change input": "modification",
        "change select": "modification",
        //Only needed for child views
        "click .deselect": "deselect",
        "click .grid-select-item": "selectGridItem",
        "taphold .ui-radio": "deselect"
    },
    selectGridItem: function(evt) {
        var $target = $(evt.target).closest('.grid-select-item');
        var $input = $target.find('input');
        $input.prop("checked", function(index, oldPropertyValue) {
            if( oldPropertyValue ) {
                $input.prop("checked", false);
                $input.change();
            } else {
                $input.prop("checked", true);
                $input.change();
            }
        });
    },
    choice_filter: function(){ return true; },
    updateRenderValue: function(formValue) {
        var that = this;
        //that.renderContext.value = formValue;
        var filteredChoices = _.filter(that.renderContext.choices, function(choice) {
            return that.choice_filter(choice);
        });

        if ( !formValue ) {
            that.renderContext.choices = _.map(filteredChoices, function(choice) {
                choice.checked = false;
                return choice;
            });
            if(this.withOther) {
                that.renderContext.other = null;
            }
            return;
        }
        //Check appropriate choices based on formValue
        that.renderContext.choices = _.map(filteredChoices, function(choice) {
            choice.checked = _.any(formValue, function(valueObject) {
                return choice.data_value === valueObject.value;
            });
            return choice;
        });
        if(this.withOther) {
            var otherObject = _.find(formValue, function(valueObject) {
                return ('otherValue' === valueObject.name);
            });
            that.renderContext.other = {
                value: otherObject ? otherObject.value : '',
                checked: _.any(formValue, function(valueObject) {
                    return ('other' === valueObject.value);
                })
            };
        }
    },
    generateSaveValue: function(jsonFormSerialization) {
        var that = this;
        var selectedValues;
        if(jsonFormSerialization){
            selectedValues = _.map(jsonFormSerialization, function(valueObject) {
                if ( valueObject.name === that.name ) {
                    return valueObject.value;
                }
            });
            if(selectedValues && that.withOther) {
                var otherValue = _find(selectedValues, function(value) {
                        return ('other' === value);
                    });
                if (otherValue) {
                    var otherObject = _.find(jsonFormSerialization, function(valueObject) {
                        return ('otherValue' === valueObject.name);
                        });
                    selectedValues.push(otherObject.value);
                }
            }
            return selectedValues;
        }
        return null;
    },
    parseSaveValue: function(savedValue) {
        //Note that this function expects to run after this.renderContext.choices
        //has been initilized.
        var that = this;
        var otherChoices = [];
        var matchedChoice = null;
        var choiceList = [];
        var newChoice = null;
     
        if (savedValue == null)
            return choiceList;

        for (var i = 0; i < savedValue.length; i++)
        {
            matchedChoice = _.find(that.renderContext.choices, function(choiceObject) {
                return (savedValue[i] === choiceObject.data_value);
            });

            if ( matchedChoice != null ) {
                newChoice = { "name": that.name, "value": savedValue[i] };
                choiceList.push(newChoice);
            } else {
                otherChoices.push(savedValue[i]);
            }
        }

        if (that.withOther && otherChoices.length === 1 ) {
            // emit the other choice list and the value for it...
            choiceList.push({
                "name": that.name,
                "value": "other"
            });
            choiceList.push({
                "name": "otherValue",
                "value": otherChoices[0]
            });
        } else if ( otherChoices.length > 0 ) {
            shim.log('W',"prompts." + this.type + " px: " + this.promptIdx + " invalid choices are in choices list");
        }
        
        return choiceList;
    },
    modification: function(evt) {
        var ctxt = this.controller.newContext(evt);
        ctxt.log('D',"prompts." + this.type + ".modification", "px: " + this.promptIdx + " val: " + $(evt.target).attr('value'));
        var that = this;
        if(this.withOther) {
            //This hack is needed to prevent rerendering
            //causing the other input to loose focus when clicked.
            if( $(evt.target).val() === 'other' &&
                $(evt.target).prop('checked') &&
                //The next two lines determine if the checkbox was already checked.
                this.renderContext.other &&
                this.renderContext.other.checked) {
                ctxt.log('D',"prompts." + this.type + ".modification.withOther.hack", "px: " + this.promptIdx);
                ctxt.success();
                return;
            }
        }
        if(this.appearance === 'grid') {
            //Make selection more reponsive by providing visual feedback before
            //the template is re-rendered.
            this.$('.grid-select-item.ui-bar-e').removeClass('ui-bar-e').addClass('ui-bar-c');
            this.$('input:checked').closest('.grid-select-item').addClass('ui-bar-e');
        }
        var formValue = (this.$('form').serializeArray());
        that.setValueDeferredChange(that.generateSaveValue(formValue));
        that.updateRenderValue(formValue);
        that.reRender(ctxt);
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        var newctxt = $.extend({}, ctxt, {success: function(outcome) {
            ctxt.log('D',"prompts." + that.type + ".configureRenderContext." + outcome,
                        "px: " + that.promptIdx);
            that.updateRenderValue(that.parseSaveValue(that.getValue()));
            ctxt.success();
        },
        failure:function(m) {
            ctxt.failure(m);
        }});

         var populateChoicesViaQueryUsingLinkedTable = function(query, newctxt){
            newctxt.log('D',"prompts." + that.type + ".configureRenderContext", "px: " + that.promptIdx);
            that.getlinkedModel($.extend({},newctxt,{success:function(linkedModel) {
                var dbTableName = linkedModel.table_id;
                var selString = that.convertSelection(linkedModel);
                var selArgs = query.selectionArgs();
                var ordBy = that.convertOrderBy(linkedModel);
                var displayElementName = that.getLinkedInstanceName();
                database.get_linked_instances($.extend({},newctxt,{success:function(instanceList) {
                    that.renderContext.choices = _.map(instanceList, function(instance) {
                        instance.display = {text:instance.display_field};
                        instance.data_value = instance.instance_id;
                        return instance;
                    });
                    newctxt.success();
                }}), dbTableName, selString, selArgs, displayElementName, ordBy);
            }}));
        };

        var populateChoicesViaQuery = function(query, newctxt){
            if (query.query_type == 'csv' || query.query_type == 'ajax')
            {
                that.populateChoicesViaQueryUsingAjax(query, newctxt);
            }
            else if (query.query_type == 'linked_table')
            {
                populateChoicesViaQueryUsingLinkedTable(query, newctxt);
            }
            else
            {
                newctxt.failure({message: "Error: undefined query type - a query in the queries sheet must have a query_type"});
            }
        };
        
        that.renderContext.passiveError = null;
        var queryDefn = opendatakit.getQueriesDefinition(that.values_list);
        var choiceListDefn = opendatakit.getChoicesDefinition(that.values_list);
        if(queryDefn != null) {
            populateChoicesViaQuery(queryDefn, newctxt);
        } else if (choiceListDefn != null) {
            //Very important.
            //We need to clone the choices so their values are unique to the prompt.
            that.renderContext.choices = _.map(choiceListDefn, _.clone);
            newctxt.success("choiceList.success");
        } else {
            newctxt.failure({message: "Error fetching choices -- no ajax query or choices defined"});
        }
    },
    deselect: function(evt) {
        shim.log('D',"prompts." + this.type + ".deselect px: " + this.promptIdx);
        this.$('input:checked').prop('checked', false).change();
    }
});
promptTypes.select_one = promptTypes.select.extend({
    renderContext: {
        "select_one": true,
        "deselect" : translations.deselect
    },
    generateSaveValue: function(jsonFormSerialization) {
        var selectedValue, otherValue;
        var promptName = this.name;
        if(jsonFormSerialization) {
            selectedValue = _.find(jsonFormSerialization, function(valueObject) {
                return (promptName === valueObject.name);
            });
            if(selectedValue) {
                if(this.withOther) {
                    if(selectedValue.value === 'other') {
                        otherValue = _.find(jsonFormSerialization, function(valueObject) {
                            return ('otherValue' === valueObject.name);
                        });
                        return (otherValue ? otherValue.value : '');
                    }
                }
                return selectedValue.value;
            }
        }
        return null;
    },
    /**
     * Parse a saved string value into the format
     * returned by jQuery's serializeArray function.
     */
    parseSaveValue: function(savedValue){
        //Note that this function expects to run after renderContext.choices
        //has been initilized.
        var valInChoices = false;
        if(!_.isString(savedValue)) {
            return null;
        }
        if(this.renderContext.choices) {
            valInChoices = _.any(this.renderContext.choices, function(choice){
                return (choice.data_value === savedValue);
            });
        }
        if (valInChoices) {
            return [{
                "name": this.name,
                "value": savedValue
            }];
        }
        else {
            return [{
                "name": this.name,
                "value": "other"
            }, {
                "name": "otherValue",
                "value": savedValue
            }];
        }
    }
});
promptTypes.select_one_integer = promptTypes.select_one.extend({
    modification: function(evt) {
        var ctxt = this.controller.newContext(evt);
        ctxt.log('D',"prompts." + this.type + ".modification", "px: " + this.promptIdx + " val: " + $(evt.target).attr('value'));
        var that = this;
        if(this.withOther) {
            //This hack is needed to prevent rerendering
            //causing the other input to loose focus when clicked.
            if( $(evt.target).val() === 'other' &&
                $(evt.target).prop('checked') &&
                //The next two lines determine if the checkbox was already checked.
                this.renderContext.other &&
                this.renderContext.other.checked) {
                ctxt.log('D',"prompts." + this.type + ".modification.withOther.hack", "px: " + this.promptIdx);
                ctxt.success();
                return;
            }
        }
        if(this.appearance === 'grid') {
            //Make selection more reponsive by providing visual feedback before
            //the template is re-rendered.
            this.$('.grid-select-item.ui-bar-e').removeClass('ui-bar-e').addClass('ui-bar-c');
            this.$('input:checked').closest('.grid-select-item').addClass('ui-bar-e');
        }
        var formValue = (this.$('form').serializeArray()); 
        // cast all values in formValue to ints
        for (var i = 0; i < formValue.length; i++) {
            formValue[i].value = parseInt(formValue[i].value);
        }
        that.setValueDeferredChange(that.generateSaveValue(formValue));
        that.updateRenderValue(formValue);
        that.reRender(ctxt);
    },
    /**
     * Parse a saved string value into the format
     * returned by jQuery's serializeArray function.
     */
    parseSaveValue: function(savedValue){
        //Note that this function expects to run after renderContext.choices
        //has been initilized.
        var valInChoices = false;
        if(!_.isNumber(savedValue)) {
            return null;
        }
        if(this.renderContext.choices) {
            valInChoices = _.any(this.renderContext.choices, function(choice){
                return (choice.data_value === savedValue);
            });
        }
        if (valInChoices) {
            return [{
                "name": this.name,
                "value": savedValue
            }];
        }
        else {
            return [{
                "name": this.name,
                "value": "other"
            }, {
                "name": "otherValue",
                "value": savedValue
            }];
        }
    }
});
//TODO:
//Since multiple choices are possible should it be possible
//to add arbitrary many other values to a select_with_other?
promptTypes.select_with_other = promptTypes.select.extend({
    withOther: true
});
promptTypes.select_multiple = promptTypes.select.extend({
});
promptTypes.select_one_with_other = promptTypes.select_one.extend({
    withOther: true
});
promptTypes.select_one_grid = promptTypes.select_one.extend({
    templatePath: "templates/select_grid.handlebars",
    updateRenderValue: function(formValue) {
        var that = this;
        //that.renderContext.value = formValue;
        var filteredChoices = _.filter(that.renderContext.choices, function(choice) {
            return that.choice_filter(choice);
        });

        filteredChoices = _.map(filteredChoices, function(choice, idx) {
            var columns = 3;
            choice.colLetter = String.fromCharCode(97 + (idx % columns));
            choice.isFirstInRow = false;
            choice.isLastInRow = false;
            if (idx % 3 === 0) {
                choice.isFirstInRow = true;
            }
            if (idx % 3 === 2) {
                choice.isLastInRow = true;
            }
            return choice;
        });

        if ( !formValue ) {
            that.renderContext.choices = _.map(filteredChoices, function(choice) {
                choice.checked = false;
                return choice;
            });
            if(this.withOther) {
                that.renderContext.other = null;
            }
            return;
        }
        //Check appropriate choices based on formValue
        that.renderContext.choices = _.map(filteredChoices, function(choice) {
            choice.checked = _.any(formValue, function(valueObject) {
                return choice.data_value === valueObject.value;
            });
            return choice;
        });
        if(this.withOther) {
            var otherObject = _.find(formValue, function(valueObject) {
                return ('otherValue' === valueObject.name);
            });
            that.renderContext.other = {
                value: otherObject ? otherObject.value : '',
                checked: _.any(formValue, function(valueObject) {
                    return ('other' === valueObject.value);
                })
            };
        }
    }
});
promptTypes.select_one_inline = promptTypes.select_one.extend({
    templatePath: "templates/select_inline.handlebars"
});
promptTypes.select_one_dropdown = promptTypes.select_one.extend({
    templatePath: "templates/select_dropdown.handlebars"
});
promptTypes.select_multiple_grid = promptTypes.select_multiple.extend({
    templatePath: "templates/select_grid.handlebars",
    updateRenderValue: function(formValue) {
        var that = this;
        //that.renderContext.value = formValue;
        var filteredChoices = _.filter(that.renderContext.choices, function(choice) {
            return that.choice_filter(choice);
        });

        filteredChoices = _.map(filteredChoices, function(choice, idx) {
            var columns = 3;
            choice.colLetter = String.fromCharCode(97 + (idx % columns));
            choice.isFirstInRow = false;
            choice.isLastInRow = false;
            if (idx % 3 === 0) {
                choice.isFirstInRow = true;
            }
            if (idx % 3 === 2) {
                choice.isLastInRow = true;
            }
            return choice;
        });

        if ( !formValue ) {
            that.renderContext.choices = _.map(filteredChoices, function(choice) {
                choice.checked = false;
                return choice;
            });
            if(this.withOther) {
                that.renderContext.other = null;
            }
            return;
        }
        //Check appropriate choices based on formValue
        that.renderContext.choices = _.map(filteredChoices, function(choice) {
            choice.checked = _.any(formValue, function(valueObject) {
                return choice.data_value === valueObject.value;
            });
            return choice;
        });
        if(this.withOther) {
            var otherObject = _.find(formValue, function(valueObject) {
                return ('otherValue' === valueObject.name);
            });
            that.renderContext.other = {
                value: otherObject ? otherObject.value : '',
                checked: _.any(formValue, function(valueObject) {
                    return ('other' === valueObject.value);
                })
            };
        }
    }
});
promptTypes.select_multiple_inline = promptTypes.select_multiple.extend({
    templatePath: "templates/select_inline.handlebars"
});
promptTypes.input_type = promptTypes.base.extend({
    type: "input_type",
    templatePath: "templates/input_type.handlebars",
    inputAttributes: {
        'placeholder':'not specified'
    },
    displayed: false,
    modified: false,
    renderContext: {
        "type": "input_type"
    },
    events: {
        "change input": "modification",
        "swipeleft .input-container": "stopPropagation",
        "swiperight .input-container": "stopPropagation",
        "focusout .input-container": "loseFocus",
        "focusin .input-container": "gainFocus"
    },
    loseFocus: function(evt) {
        var that = this;
        shim.log('D',"prompts." + that.type + ".focusout px: " + that.promptIdx);
                
        if (that.modified === true) {
            var ctxt = that.controller.newContext(evt);
            that.reRender(ctxt);
        }
    },
    gainFocus: function(evt) {
        var that = this;
        shim.log('D',"prompts." + that.type + ".focusin px: " + that.promptIdx);
    },
    modification: function(evt) {
        var value = $(evt.target).val();
        var that = this;
        that.modified = false;
        if ( that.lastEventTimestamp == evt.timeStamp ) {
            shim.log("D","prompts." + that.type + ".modification duplicate event ignored");
            return;
        }
        that.lastEventTimestamp = evt.timeStamp;
        shim.log("D","prompts." + that.type + ".modification event being processed");
        var renderContext = that.renderContext;
        // track original value
        renderContext.invalid = that.setValueAndValidate(value);
        that.modified = true;
        renderContext.value = value;
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        var renderContext = that.renderContext;
        var value = that.getValue();
        renderContext.value = value;
        if (ctxt.render == true) {
            that.displayed = true;
        }
        ctxt.success();
    },
    beforeMove: function() {
        var that = this;
        var isInvalid = that.setValueAndValidate(this.$('input').val());
        if ( isInvalid ) {
            return { message: that.invalid_value_message };
        } else {
            return null;
        }
    },
    setValueAndValidate: function(value) {
        var that = this;
        var originalValue = that.getValue();
        that.setValueDeferredChange((value.length === 0 ? null : value));
        var invalid = !that.validateValue();
        if ( invalid ) {
            value = originalValue;
            // restore it...
            that.setValueDeferredChange(originalValue);
        }
        return invalid;
    },
    validateValue: function() {
        return true;
    }
});
promptTypes.textarea = promptTypes.input_type.extend({
    type: "textarea",
    templatePath: "templates/textarea.handlebars",
    renderContext: {
        "type": "textarea"
    },
    beforeMove: function() {
        var that = this;
        var isInvalid = that.setValueAndValidate(this.$('textarea').val());
        if ( isInvalid ) {
            return { message: that.invalid_value_message };
        } else {
            return null;
        }
    }
});
promptTypes.string = promptTypes.input_type.extend({
    type: "string",
    renderContext: {
        "type": "string"
    }
});
promptTypes.text = promptTypes.input_type.extend({
    type: "text",
    renderContext: {
        "type": "text"
    }
});
promptTypes.integer = promptTypes.input_type.extend({
    type: "integer",
    _baseInputAttributes: {
        'type':'number'
    },
    invalid_value_message: "Integer value expected",
    validateValue: function() {
        var value = this.getValue();
        if ( value === null) {
            // Null values are now respected
            return true;
        } else {
            return !isNaN(parseInt(value, 10));
        }
    }
});
promptTypes.decimal = promptTypes.input_type.extend({
    type: "decimal",
    //TODO: This doesn't seem to be working.
    _baseInputAttributes: {
        'type':'number'
    },
    invalid_value_message: "Numeric value expected",
    validateValue: function() {
        var value = this.getValue();
        if (value === null) {
            // Null values are now respected 
            return true;
        } else {
        return !isNaN(parseFloat(this.getValue()));
        }
    }
});
promptTypes.datetime = promptTypes.input_type.extend({
    type: "datetime",
    templatePath: "templates/datetimepicker.handlebars", 
    usePicker: true,
    insideAfterRender: false,
    timeFormat: "MM/DD/YYYY h:mm A",
    showDate: true,
    showTime: true,
    dtp: null,
    events: {
        "dp.hide": "modification",
        "swipeleft input": "stopPropagation",
        "swiperight input": "stopPropagation"
    },
    detectNativeDatePicker: function (){
        //For now never use the native datepicker because the samsung note's
        //native datepicker causes the webkit to freeze in some cases.
        return false;
        /*
        //It may be best to user modernizr for this type of functionality.
        var input = document.createElement('input');
        input.setAttribute('type', this.type);
        //See if the date/time type is allowed.
        if(input.type === this.type){
            //See if the input can hold non-date/time values.
            input.value = 'test';
            if (input.value !== 'test') {
                return true;
            }
        }
        return false;
        */
    },
    sameValue: function(ref, value) {
        if (ref.valueOf() != value.valueOf()) {
            return false;
        } else {
            return true;
        }
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        var renderContext = that.renderContext;
        if(this.detectNativeDatePicker()){
            renderContext.inputAttributes.type = that.type;
            that.usePicker = false;
            ctxt.success();
        } else {
            var dateValue = that.getValue();
            var userTimeFormat  = renderContext.inputAttributes.timeFormat;
            if (userTimeFormat !== null && userTimeFormat !== undefined) {
                that.timeFormat = userTimeFormat;
            }
            if (dateValue !== undefined && dateValue !== null) {
                renderContext.value = moment(dateValue).format(that.timeFormat);
            }
            ctxt.success();
        }
    },
    modification: function(evt) {
        var that = this;
        if ( !that.insideAfterRender ) {
            var date_value = that.$('input').data('DateTimePicker').getDate()
            var value = (date_value === undefined || date_value === null) ? null : date_value.toDate();
            var formattedDateValue = moment(value).format(that.timeFormat);
            var ref = that.getValue();  

            var rerender = ((ref == null || value == null) && (ref != value )) ||
                (ref != null && value != null && !that.sameValue(ref, value));

            var ctxt = that.controller.newContext(evt);
            ctxt.log('D',"prompts." + that.type + ".modification", "px: " + that.promptIdx);

            var renderContext = that.renderContext;
            if ( value === undefined || value === null ) {
                renderContext.value = '';
            } else {
                renderContext.value = formattedDateValue; 
            }

            // track original value
            var originalValue = that.getValue();
            that.setValueDeferredChange(value);
            renderContext.invalid = !that.validateValue();
            if ( renderContext.invalid ) {
                value = originalValue;
                formattedDateValue = moment(value).format(that.timeFormat);
                // restore it...
                that.setValueDeferredChange(originalValue);
                rerender = true;
            }
 
           renderContext.value = formattedDateValue;
            if ( rerender ) {
                that.reRender(ctxt);
            } else {
                ctxt.success();
            }
        }
    },
    afterRender: function() {
        var that = this;
        if(this.usePicker){
            that.insideAfterRender = true;

            if (that.dtp !== null && that.dtp !== undefined) {
                that.dtp.destroy();
            }

            if (that.showDate && !that.showTime) {
                that.$('input').datetimepicker({pickTime: false, format: this.timeFormat});
            } else if (!that.showDate && that.showTime) {
                that.$('input').datetimepicker({pickDate: false, format: this.timeFormat});
            } else {
                that.$('input').datetimepicker({format: this.timeFormat});
            }
            var inputElement = that.$('input');
            that.dtp = inputElement.data('DateTimePicker');
      
            that.insideAfterRender = false;
        }
    },
    beforeMove: function() {
        // the spinner will have already saved the value
        // destroy the datetimepicker if it is still present
        var that = this;

        if (that.dtp) {
            that.dtp.destroy();
        }
        return null;
    }
});
promptTypes.date = promptTypes.datetime.extend({
    type: "date",
    showTime: false,
    timeFormat: "MM/DD/YYYY"
});
promptTypes.time = promptTypes.datetime.extend({
    type: "time",
    showDate: false,
    timeFormat: "h:mm A",
    sameValue: function(ref, value) {
        // these are milliseconds relative to Jan 1 1970...
        var ref_tod = (ref.valueOf() % 86400000);
        var value_tod = (value.valueOf() % 86400000);
        return (ref_tod === value_tod);
    }
});
/**
 * Media is an abstract object used as a base for image/audio/video
 */
promptTypes.media = promptTypes.base.extend({
    type: "media",
    captureAction: null, // overridden by derived classes -- the intent to fire
    chooseAction: null, // overridden by derived classes -- the intent to fire
    events: {
        "click .captureAction:enabled": "capture",
        "click .chooseAction:enabled": "choose"
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        that.updateRenderContext();
        ctxt.success();
    },
    disableButtons: function() {
        var that = this;
        that.$('.captureAction').attr('disabled','true');
        that.$('.chooseAction').attr('disabled','true');
    },
    enableButtons: function() {
        var that = this;
        that.$('.captureAction').removeAttr('disabled');
        that.$('.chooseAction').removeAttr('disabled');
    },
    capture: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        that.disableButtons();
        var platInfo = opendatakit.getPlatformInfo();
        // TODO: is this the right sequence?
        var outcome = shim.doAction( opendatakit.getRefId(), that.getPromptPath(), 
            'capture', that.captureAction, JSON.stringify({ extras: { 
                appName: opendatakit.getPlatformInfo().appName, 
                uriFragmentNewFileBase: "opendatakit-macro(uriFragmentNewInstanceFile)" }}));
        ctxt.log('D','media.capture', platInfo.container + " outcome is " + outcome);
        if (outcome === null || outcome !== "OK") {
            ctxt.log("W",'media.capture',platInfo.container + " Should be OK got >" + outcome + "<");
            that.enableButtons();
            ctxt.failure({message: "Action canceled."});
        } else {
            ctxt.success();
        }
    },
    choose: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        that.disableButtons();
        var platInfo = opendatakit.getPlatformInfo();
        // TODO: is this the right sequence?
        var outcome = shim.doAction( opendatakit.getRefId(), that.getPromptPath(), 
            'choose', that.chooseAction,  JSON.stringify({ extras: { 
                appName: opendatakit.getPlatformInfo().appName, 
                uriFragmentNewFileBase: "opendatakit-macro(uriFragmentNewInstanceFile)" }}));
        ctxt.log('D','media.capture', platInfo.container + " outcome is " + outcome);
        if (outcome === null || outcome !== "OK") {
            ctxt.log("W",'media.capture', platInfo.container + " Should be OK got >" + outcome + "<");
            that.enableButtons();
            ctxt.failure({message: "Action canceled."});
        } else {
            ctxt.success();
        }
    },
    getCallback: function(promptPath, byinternalPromptContext, byaction) {
        var that = this;
        if ( that.getPromptPath() != promptPath ) {
            throw new Error("Promptpath does not match: " + promptPath + " vs. " + that.getPromptPath());
        }
        return function(ctxt, internalPromptContext, action, jsonString) {
            ctxt.log('D',"prompts." + that.type + 'getCallback.actionFn', "px: " + that.promptIdx +
                " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
            var jsonObject = JSON.parse(jsonString);
            if (jsonObject.status === -1 /* Activity.RESULT_OK */ ) {
                ctxt.log('D',"prompts." + that.type + 'getCallback.actionFn.resultOK', "px: " + that.promptIdx +
                    " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                var uriFragment = (jsonObject.result != null) ? jsonObject.result.uriFragment : null;
                var contentType = (jsonObject.result != null) ? jsonObject.result.contentType : null;
                if (uriFragment != null && contentType != null) {
                    var oldMediaStruct = that.getValue();
                    var newPath = opendatakit.getRowpathFromUriFragment(uriFragment);
                    // TODO: delete old??? Or leave until marked as finalized?
                    that.setValueDeferredChange({ uriFragment : newPath, contentType: contentType });
                }
                // TODO: should null returns indicate a clearing of this value?
                that.enableButtons();
                that.updateRenderContext();
                that.reRender(ctxt);
            }
            else {
                ctxt.log('W',"prompts." + that.type + 'getCallback.actionFn.failureOutcome',
                    "px: " + that.promptIdx +
                    " failure returned from intent: " + jsonString + 
                    " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                that.enableButtons();
                that.updateRenderContext();
                that.reRender($.extend({}, ctxt, {success: function() {
                    ctxt.failure({message: "Action canceled."});
                }, failure: function(j) { ctxt.failure({message: "Action canceled."});}}));
            }
        };
    },
    baseUpdateRenderContext: function() {
        var that = this;
        var mediaUri = that.getValue();
        var uriFragment = (mediaUri != null && mediaUri.uriFragment != null) ? mediaUri.uriFragment : null;
        var uri = (uriFragment == null) ? null : opendatakit.getUriFromRowpath(uriFragment);
        var contentType = (mediaUri != null && mediaUri.contentType != null) ? mediaUri.contentType : null;
        var safeIdentity = 'T'+opendatakit.genUUID().replace(/[-:]/gi,'');
        var platinfo = opendatakit.getPlatformInfo();
        if ( platinfo.container !== 'Android' ) {
            that.renderContext.pre4Android = false;
        } else {
            that.renderContext.pre4Android = ( platinfo.version.substring(0,1) < "4" );
        }
        that.renderContext.mediaPath = uri;
        that.renderContext.uriFragmentValue = uriFragment;
        that.renderContext.safeIdentity = safeIdentity;
        that.renderContext.contentType = contentType;
    },
    updateRenderContext: function() {
        this.baseUpdateRenderContext();
    },
    formattedValueForContentsDisplay: function() {
        if ( !this.name ) {
            return '';
        } else {
            var displayObject = this.getValue();
            if (displayObject != null && displayObject.uriFragment != null) {
                return displayObject.uriFragment;
            }
            else {
                return '';
            }          
        }
    }
});
promptTypes.read_only_image = promptTypes.media.extend({
    type: "read_only_image",
    extension: "jpg",
    contentType: "image/*",
    templatePath: "templates/read_only_image.handlebars",
});
promptTypes.image = promptTypes.media.extend({
    type: "image",
    extension: "jpg",
    contentType: "image/*",
    buttonLabel: 'Take your photo:',
    templatePath: "templates/image.handlebars",
    captureAction: 'org.opendatakit.survey.android.activities.MediaCaptureImageActivity',
    chooseAction: 'org.opendatakit.survey.android.activities.MediaChooseImageActivity'
});
promptTypes.video = promptTypes.media.extend({
    type: "video",
    contentType: "video/*",
    buttonLabel: 'Take your video:',
    templatePath: "templates/video.handlebars",
    captureAction: 'org.opendatakit.survey.android.activities.MediaCaptureVideoActivity',
    chooseAction: 'org.opendatakit.survey.android.activities.MediaChooseVideoActivity'
});
promptTypes.audio = promptTypes.media.extend({
    type: "audio",
    contentType: "audio/*",
    buttonLabel: 'Take your audio:',
    templatePath: "templates/audio.handlebars",
    captureAction: 'org.opendatakit.survey.android.activities.MediaCaptureAudioActivity',
    chooseAction: 'org.opendatakit.survey.android.activities.MediaChooseAudioActivity'
});
/**
 * launch_intent is an abstract prompt type used as a base for single intent launching (e.g. barcodes)
 * Ideally just the templates and intentStrings will need to be customized.
 */
promptTypes.launch_intent = promptTypes.base.extend({
    type: "launch_intent",
    buttonLabel: 'Launch intent',
    templatePath: "templates/launch_intent.handlebars",
    intentString: "",
    intentParameters: null,//TODO: Allow this arguement to be an object {} -- note that we JSON.stringify this...,
    events: {
        "click .launch": "launch"
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        var value = that.getValue();
        that.renderContext.value = value;
        that.renderContext.buttonLabel = that.buttonLabel;
        ctxt.success();
    },
    launch: function(evt) {
        var ctxt = this.controller.newContext(evt);
        var platInfo = opendatakit.getPlatformInfo();
        $('#block-ui').show().on('swipeleft swiperight click', function(evt) {
            evt.stopPropagation();
        });
        //We assume that the webkit could go away when an intent is launched,
        //so this prompt's "address" is passed along with the intent.
        var outcome = shim.doAction( opendatakit.getRefId(), this.getPromptPath(), 
            'launch', this.intentString,
            ((this.intentParameters == null) ? null : JSON.stringify(this.intentParameters)));
        ctxt.log('D',"prompts." + this.type + ".launch " + this.intentString, platInfo.container + " outcome is " + outcome);
        if (outcome && outcome === "OK") {
            ctxt.success();
        } else {
            ctxt.log("W","prompts." + this.type + " Should be OK got >" + outcome + "<");
            $('#block-ui').hide().off();
            ctxt.failure({message: "Action canceled."});
        }
    },
    /**
     * When the intent returns a result this factory function creates a callback to process it.
     * The callback can't use any state set before the intent was launched because the page might have been reloaded.
     */
    getCallback: function(promptPath, byinternalPromptContext, byaction) {
        var that = this;
        $('#block-ui').hide().off();
        if ( that.getPromptPath() != promptPath ) {
            throw new Error("Promptpath does not match: " + promptPath + " vs. " + that.getPromptPath());
        }
        return function(ctxt, internalPromptContext, action, jsonString) {
            var jsonObject;
            ctxt.log('D',"prompts." + that.type + 'getCallback.actionFn', 
                "px: " + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " +
                internalPromptContext + " action: " + action);
            try {
                jsonObject = JSON.parse(jsonString);
            } catch (e) {
                ctxt.log('E',"prompts." + that.type + 'getCallback.actionFn.JSONparse.exception', 
                    "px: " + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " +
                    internalPromptContext + " action: " + action + ' exception ' + e.message + " e: " + String(e));
                ctxt.failure({message: "Action response could not be parsed."});
            }
            if (jsonObject.status === -1 ) { // Activity.RESULT_OK
                ctxt.log('D',"prompts." + that.type + 'getCallback.actionFn.resultOK',
                    "px: " + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " +
                    internalPromptContext + " action: " + action);
                if (jsonObject.result != null) {
                    that.setValueDeferredChange(that.extractDataValue(jsonObject));
                    that.renderContext.value = that.getValue();
                    that.reRender(ctxt);
                }
            } else {
                ctxt.log('E',"prompts." + that.type + 'getCallback.actionFn.failureOutcome', 
                    "px: " + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " +
                    internalPromptContext + " action: " + action);
                ctxt.failure({message: "Action canceled."});
            }
        };
    },
    extractDataValue: function(jsonObject) {
        return jsonObject.result;
    }
});
/* Save only the SCAN_RESULT */
promptTypes.barcode = promptTypes.launch_intent.extend({
    type: "barcode",
    buttonLabel: 'Get Barcode',
    intentString: 'com.google.zxing.client.android.SCAN',
     extractDataValue: function(jsonObject) {
        return jsonObject.result.SCAN_RESULT;
    }
});
promptTypes.geopoint = promptTypes.launch_intent.extend({
    type: "geopoint",
    buttonLabel: 'Record Location',
    templatePath: "templates/geopoint.handlebars",
    intentString: 'org.opendatakit.survey.android.activities.GeoPointActivity',
    extractDataValue: function(jsonObject) {
        return {
            latitude: jsonObject.result.latitude,
            longitude: jsonObject.result.longitude,
            altitude: jsonObject.result.altitude,
            accuracy: jsonObject.result.accuracy
        };
    },
    formattedValueForContentsDisplay: function() {
        if ( !this.name ) {
            return '';
        } else {
            var displayObject = this.getValue();
            if (displayObject === null || displayObject === undefined ) {
                return null;
            }
            if (displayObject.latitude != null && displayObject.longitude != null) {
                return "lat: " + displayObject.latitude + " long: " + displayObject.longitude;
            }
            else {
                return null;
            }
        }
    }
});
promptTypes.geopointmap = promptTypes.launch_intent.extend({
    type: "geopointmap",
    intentString: 'org.opendatakit.survey.android.activities.GeoPointMapActivity',
    extractDataValue: function(jsonObject) {
        return {
            latitude: jsonObject.result.latitude,
            longitude: jsonObject.result.longitude,
            altitude: jsonObject.result.altitude,
            accuracy: jsonObject.result.accuracy
        };
    },
    formattedValueForContentsDisplay: function() {
        if ( !this.name ) {
            return '';
        } else {
            var displayObject = this.getValue();
            if (displayObject === null || displayObject === undefined ) {
                return null;
            }
            if (displayObject.latitude != null && displayObject.longitude != null) {
                return "lat: " + displayObject.latitude + " long: " + displayObject.longitude;
            }
            else {
                return null;
            }
        }
    }
});
promptTypes.note = promptTypes.base.extend({
    type: "note",
    templatePath: "templates/note.handlebars"
});

promptTypes.bargraph = promptTypes.base.extend({
    type: "bargraph",
    vHeight: 0,
    vWidth: 0,
    events: {
        "click .y_up": "scale_y_up",
        "click .y_down": "scale_y_down",
        "click .x_up": "scale_x_up",
        "click .x_down": "scale_x_down"
    },
    templatePath: "templates/graph.handlebars",
    scale_y_up: function(evt){
        var that = this;
        that.vHeight = that.vHeight + (that.vHeight * .2);
        var ctxt = that.controller.newContext(evt);
        that.reRender(ctxt);
    },
    scale_y_down: function(evt){
        var that = this;
        that.vHeight = that.vHeight - (that.vHeight * .2);
        var ctxt = that.controller.newContext(evt);
        that.reRender(ctxt);
    },
    scale_x_up: function(evt){
        var that = this;
        that.vWidth = that.vWidth + (that.vWidth * .2);
        var ctxt = that.controller.newContext(evt);
        that.reRender(ctxt);
    },
    scale_x_down: function(evt){
        var that = this;
        that.vWidth = that.vWidth - (that.vWidth * .2);
        var ctxt = that.controller.newContext(evt);    
        that.reRender(ctxt);
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        var newctxt = $.extend({}, ctxt, {success: function(outcome) {
            ctxt.log('D',"prompts." + that.type + ".configureRenderContext." + outcome,
                        "px: " + that.promptIdx);
            ctxt.success();
        },
        failure:function(m) {
            ctxt.failure(m);
        }});
        
        that.renderContext.passiveError = null;
        that.renderContext.graphType = that.type;
        var queryDefn = opendatakit.getQueriesDefinition(that.values_list);
        if(queryDefn != null) {
            that.populateChoicesViaQueryUsingAjax(queryDefn, newctxt);
        } else {
            newctxt.failure({message: "Error fetching choices -- no ajax query or choices defined"});
        }
    },
    afterRender: function() {
        var that = this;

        var paramWidth = 400;
        var paramHeight = 450;
        
        // In configureRenderContext getting data via the CSV
        // fetched data should now be in the renderContext.choices array
        if (that.renderContext.choices.length == 0)
        {
            shim.log("E","prompts." + that.type + ".afterRender - no data to graph");
            return; 
        } 
        var dataJ = _.map(that.renderContext.choices, function(choice){
            return choice;
        });

        var margin = {top: 50, right: 20, bottom: 50, left: 50},
            width = paramWidth - margin.left - margin.right,
            height = paramHeight - margin.top - margin.bottom;

        var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);

        var y = d3.scale.linear().range([height, 0]);

        var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

        var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSubdivide(true)
        dataJ.forEach(function(d) {
                d.y = +d.y;
            });

        x.domain(dataJ.map(function(d) { return d.x; }));
        y.domain([0, d3.max(dataJ, function(d) { return d.y; })]);
        if (that.vWidth == 0) {
            that.vWidth = width;
        }
        if (that.vHeight == 0) {
            that.vHeight = height;
        }

        var downx = 0;
        var downy = Math.NaN;
        var isClicked = 0;
        var downscalex;
        var downscaley;
        var clickX;
        var clickY;
        var lMarg = 0;
        var tMarg = 0;

        var tempHeight = that.vHeight + 0;
        x.rangeRoundBands([0, that.vWidth + 0], .2);
        y.range([tempHeight, 0]);
        yAxis.ticks(tempHeight/30);

        that.$("#plot").bind('pinch', function(){
            that.scale_y_down();
        });

        var svg = d3.select(that.$("#plot").get(0)).append("svg")
            .attr("id", "svgElement")
            .attr("class", "wholeBody")
            .attr("z-index", 1)
            .attr("width", that.vWidth + margin.left + margin.right + 0)
            .attr("height", that.vHeight + margin.top + margin.bottom + 0)
            .append("g")
            .attr("transform", "translate(" + (margin.left + lMarg) + "," + (margin.top + tMarg) + ")");

            svg.append("g")
            .attr("class", "x-axis")
            .attr("z-index", 4)
            .attr("transform", "translate(0," + tempHeight + ")")
            .call(xAxis)
            .append("text")
            .attr("x", that.vWidth/2-50)
            .attr("y", 35)
            .attr("dx", ".71em")
            .attr("pointer-events", "all")
            .style("font-size", "1.5em")
            .style("text-anchor", "start")
            .text("x-axis");

            svg.append("g")
            .attr("class", "y_axis")
            .attr("z-index", 4)
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -35)
            .attr("x", -1 * tempHeight/2)
            .style("font-size", "1.5em")
            .style("text-anchor", "end")
            .text("y-axis");
             var lines = svg.selectAll(".bar")
              .data(dataJ);

          lines.enter()
            .append("rect")
              .attr("class", "bar")
              .attr("width", x.rangeBand())
              .attr("fill", function(d) {
                return 'red';// change this using d.y with 'if' statements to hard code color values
                });
          lines
              .attr("x", function(d) { return x(d.x); })
              .attr("y", function(d) { return y(d.y); })
              .attr("height", function(d) { return tempHeight - y(d.y); });
 
        return;
    }
});

promptTypes.linegraph = promptTypes.base.extend({
    type: "linegraph",
    vHeight: 0,
    vWidth: 0,
    events: {
        "click .y_up": "scale_y_up",
        "click .y_down": "scale_y_down",
        "click .x_up": "scale_x_up",
        "click .x_down": "scale_x_down"
    },
    templatePath: "templates/graph.handlebars",
    scale_y_up: function(evt){
        var that = this;
        that.vHeight = that.vHeight + (that.vHeight * .2);
        var ctxt = that.controller.newContext(evt);
        that.reRender(ctxt);
    },
    scale_y_down: function(evt){
        var that = this;
        that.vHeight = that.vHeight - (that.vHeight * .2);
        var ctxt = that.controller.newContext(evt);
        that.reRender(ctxt);
    },
    scale_x_up: function(evt){
        var that = this;
        that.vWidth = that.vWidth + (that.vWidth * .2);
        var ctxt = that.controller.newContext(evt);
        that.reRender(ctxt);
    },
    scale_x_down: function(evt){
        var that = this;
        that.vWidth = that.vWidth - (that.vWidth * .2);
        var ctxt = that.controller.newContext(evt);    
        that.reRender(ctxt);
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        var newctxt = $.extend({}, ctxt, {success: function(outcome) {
            ctxt.log('D',"prompts." + that.type + ".configureRenderContext." + outcome,
                        "px: " + that.promptIdx);
            ctxt.success();
        },
        failure:function(m) {
            ctxt.failure(m);
        }});
        
        that.renderContext.passiveError = null;
        that.renderContext.graphType = that.type;
        var queryDefn = opendatakit.getQueriesDefinition(that.values_list);
        if(queryDefn != null) {
            that.populateChoicesViaQueryUsingAjax(queryDefn, newctxt);
        } else {
            newctxt.failure({message: "Error fetching choices -- no ajax query or choices defined"});
        }
    },
    afterRender: function() {
        var that = this;
        var xString = "x-axis";
        var yString = "y-axis";
        var legendString = "y-value"

        var paramWidth = 450;
        var paramHeight = 400;
        
        // In configureRenderContext getting data via the CSV
        // fetched data should now be in the renderContext.choices array
        if (that.renderContext.choices.length == 0)
        {
            shim.log("E","prompts." + that.type + ".afterRender - no data to graph");
            return; 
        } 

        if (that.x_axis_label) {
            xString = that.x_axis_label;
        }

        if (that.y_axis_label) {
            yString = that.y_axis_label;
        }

        if (that.legend_text) {
            legendString = that.legend_text;
        }

        var dataJ = _.map(that.renderContext.choices, function(choice){
            return choice;
        });

        var margin = {top: 50, right: 20, bottom: 40, left: 50},
            width = paramWidth - margin.left - margin.right,
            height = paramHeight - margin.top - margin.bottom;

        var x = d3.scale.linear().range([0, width]);

        var y = d3.scale.linear().range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSubdivide(true);

         var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickSubdivide(true);

        dataJ.forEach(function(d) {
            d.y = +d.y;
            d.x = +d.x;
        });

        /* When dataMin and dataMax gets implemented
        dataMin.forEach(function(d) {
            d.y = +d.y;
            d.x = +d.x;
        });
    
        dataMax.forEach(function(d) {
            d.y = +d.y;
            d.x = +d.x;
        });
        */

        
        var line = d3.svg.line()
            .x(function(d) { return x(d.x); })
            .y(function(d) { return y(d.y); });

        // Don't have a dataMax of dataMin yet
        // Also setting this to a fixed range and domain for now
        // These will probably need to be settings 
        x.domain([0, d3.max(dataJ, function(d) { return d.x; })]);
        y.domain([d3.min(dataJ, function(d) { return d.y; }), d3.max(dataJ, function(d) { return d.y; })]);

        if (that.vWidth == 0) {
            that.vWidth = width;
        }
        if (that.vHeight == 0) {
            that.vHeight = height;
        }

        var downx = 0;
        var downy = Math.NaN;
        var isClicked = 0;
        var downscalex;
        var downscaley;
        var clickX;
        var clickY;
        var lMarg = 0;
        var tMarg = 0;

        var tempHeight = that.vHeight + 0;
        //x.rangeRoundBands([0, that.vWidth + 0], .2);
        x.range([0, that.vWidth]);
        y.range([tempHeight, 0]);
        yAxis.ticks(tempHeight/30);

        var svg = d3.select(that.$("#plot").get(0)).append("svg")
            .attr("id", "svgElement")
            .attr("class", "wholeBody")
            .attr("z-index", 1)
            .attr("width", that.vWidth + margin.left + margin.right + 0)
            .attr("height", that.vHeight + margin.top + margin.bottom + 0)
            .append("g")
            .attr("transform", "translate(" + (margin.left + lMarg) + "," + (margin.top + tMarg) + ")");

        svg.append("g")
            .attr("class", "x-axis")
            .attr("z-index", 4)
            .attr("transform", "translate(0," + tempHeight + ")")
            .call(xAxis)
            .append("text")
            .attr("x", that.vWidth/2-50)
            .attr("y", 35)
            .attr("dx", ".71em")
            .attr("pointer-events", "all")
            .style("font-size", "1.5em")
            .style("text-anchor", "start")
            .text(xString);  // This should be customizable

        svg.append("g")
            .attr("class", "y_axis")
            .attr("z-index", 4)
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -35)
            .attr("x", -1 * tempHeight/2)
            .style("font-size", "1.5em")
            .style("text-anchor", "end")
            .text(yString);  // This should be customizable

        svg.append("path")
            .datum(dataJ)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("d", line);

        // add legend   
        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("height", 50)
            .attr("width", 100);
    
        legend
            .append("rect")
            .attr("x", -10 )
            .attr("y", -30)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", 'blue');
      
        legend
        .append("text")
        .attr("x", 10)
        .attr("y", -20)
        .text(legendString);

        if (that.x_value && that.y_value) {
            var x_val = database.getDataValue(that.x_value);
            var y_val = database.getDataValue(that.y_value);
            svg.append("circle")
                .attr("class", "dot")
                .attr("r", 8)
                .attr("fill", "none")
                .attr("stroke", "#0a0")
                .attr("stroke-width", "1.5px")
                .attr("cx", function(d) { return x(x_val); })
                .attr("cy", function(d) { return y(y_val); });
    }

 
        return;
    }
});

promptTypes.piechart = promptTypes.base.extend({
    type: "piechart",
    vHeight: 0,
    vWidth: 0,
    vRadius: 0,
    events: {
        "click .scale_up": "scale_up",
        "click .scale_down": "scale_down",
    },
    templatePath: "templates/graph.handlebars",
    scale_up: function(evt){
        var that = this;
        that.vHeight = that.vHeight + (that.vHeight * .1);
        that.vWidth = that.vWidth + (that.vWidth * .1);
        that.vRadius = that.vRadius * 1.1;
        var ctxt = that.controller.newContext(evt);
        that.reRender(ctxt);
    },
    scale_down: function(evt){
        var that = this;
        that.vHeight = that.vHeight - (that.vHeight * .1);
        that.vWidth = that.vWidth - (that.vWidth * .1);
        that.vRadius = that.vRadius * 0.9;
        var ctxt = that.controller.newContext(evt);
        that.reRender(ctxt);
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        var newctxt = $.extend({}, ctxt, {success: function(outcome) {
            ctxt.log('D',"prompts." + that.type + ".configureRenderContext." + outcome,
                        "px: " + that.promptIdx);
            ctxt.success();
        },
        failure:function(m) {
            ctxt.failure(m);
        }});
        
        that.renderContext.passiveError = null;
        that.renderContext.graphType = that.type;
        var queryDefn = opendatakit.getQueriesDefinition(that.values_list);
        if(queryDefn != null) {
            that.populateChoicesViaQueryUsingAjax(queryDefn, newctxt);
        } else {
            newctxt.failure({message: "Error fetching choices -- no ajax query or choices defined"});
        }
    },
    afterRender: function() {
        var that = this;

        var paramWidth = 500;
        var paramHeight = 500;

        var margin = {top: 20, right: 20, bottom: 40, left: 80},
            width = paramWidth - margin.left - margin.right,
            height = paramHeight - margin.top - margin.bottom,
            radius = Math.min(width, height) / 2;
        
        // In configureRenderContext getting data via the CSV
        // fetched data should now be in the renderContext.choices array
        if (that.renderContext.choices.length == 0)
        {
            shim.log("E","prompts." + that.type + ".afterRender - no data to graph");
            return; 
        } 
        var dataJ = _.map(that.renderContext.choices, function(choice){
            return choice;
        });

        if (that.vWidth == 0) {
            that.vWidth = width;
        }
        if (that.vHeight == 0) {
            that.vHeight = height;
        }
        if (that.vRadius == 0) {
            that.vRadius = radius;
        }

        dataJ.forEach(function(d) {
            d.y = +d.y;
        });


        var arc = d3.svg.arc()
            .outerRadius(that.vRadius - 10)
            .innerRadius(0);

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) { return d.y; });

        var svg = d3.select(that.$("#plot").get(0)).append("svg")
            .attr("class", "wholeBody")
            .data([dataJ])
            .attr("width", that.vWidth)
            .attr("height", that.vHeight)
            .append("g")
            .attr("transform", "translate(" + that.vWidth / 2 + "," + that.vHeight / 2 + ")");

        var g = svg.selectAll(".arc")
            .data(pie(dataJ))
            .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .style("fill", function(d, i) {
                // Switch to a case statement 
                // Maybe these colors should be available in a library or something
                if(i == 0) {
                    return "green";
                } else if(i == 1) {
                    return "yellow";
                } else if(i == 2){
                    return "blue";
                } else if(i == 3){
                    return "red";
                } else if(i == 4){
                    return "orange";
                } else if(i == 5){
                    return "purple";
                } else if(i == 6){
                    return "pink";
                } else if(i == 7){
                    return "teal";
                }
            });

        g.append("text")
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
            .attr("dy", "2em")
            .style("text-anchor", "middle")
            .text(function(d, i) { return dataJ[i].x; });        
    }
});

promptTypes.scatterplot = promptTypes.base.extend({
    type: "scatterplot",
    vHeight: 0,
    vWidth: 0,
    events: {
        "click .y_up": "scale_y_up",
        "click .y_down": "scale_y_down",
        "click .x_up": "scale_x_up",
        "click .x_down": "scale_x_down"
    },
    templatePath: "templates/graph.handlebars",
    scale_y_up: function(evt){
        var that = this;
        that.vHeight = that.vHeight + (that.vHeight * .2);
        var ctxt = that.controller.newContext(evt);
        that.reRender(ctxt);
    },
    scale_y_down: function(evt){
        var that = this;
        that.vHeight = that.vHeight - (that.vHeight * .2);
        var ctxt = that.controller.newContext(evt);
        that.reRender(ctxt);
    },
    scale_x_up: function(evt){
        var that = this;
        that.vWidth = that.vWidth + (that.vWidth * .2);
        var ctxt = that.controller.newContext(evt);
        that.reRender(ctxt);
    },
    scale_x_down: function(evt){
        var that = this;
        that.vWidth = that.vWidth - (that.vWidth * .2);
        var ctxt = that.controller.newContext(evt);    
        that.reRender(ctxt);
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        var newctxt = $.extend({}, ctxt, {success: function(outcome) {
            ctxt.log('D',"prompts." + that.type + ".configureRenderContext." + outcome,
                        "px: " + that.promptIdx);
            ctxt.success();
        },
        failure:function(m) {
            ctxt.failure(m);
        }});
        
        that.renderContext.passiveError = null;
        that.renderContext.graphType = that.type;
        var queryDefn = opendatakit.getQueriesDefinition(that.values_list);
        if(queryDefn != null) {
            that.populateChoicesViaQueryUsingAjax(queryDefn, newctxt);
        } else {
            newctxt.failure({message: "Error fetching choices -- no ajax query or choices defined"});
        }
    },
    afterRender: function() {
        var that = this;

        var paramWidth = 450;
        var paramHeight = 400;

        var margin = {top: 20, right: 20, bottom: 40, left: 50},
            width = paramWidth - margin.left - margin.right,
            height = paramHeight - margin.top - margin.bottom,
            padding = 30;

        if (that.vWidth == 0) {
            that.vWidth = width;
        }
        if (that.vHeight == 0) {
            that.vHeight = height;
        }
        
        // In configureRenderContext getting data via the CSV
        // fetched data should now be in the renderContext.choices array
        if (that.renderContext.choices.length == 0)
        {
            shim.log("E","prompts." + that.type + ".afterRender - no data to graph");
            return; 
        } 

        var dataJ = _.map(that.renderContext.choices, function(choice){
            return choice;
        });

        dataJ.forEach(function(d) {
            d.x = +d.x;
            d.y = +d.y;
            d.r = +d.r;
        });

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, that.vWidth], .1);

        var y = d3.scale.linear()
            .range([that.vHeight, 0]);

        x.domain([0, d3.max(dataJ, function(d) { return d.x; })]);
        y.domain([0, d3.max(dataJ, function(d) { return d.y; })]);

        //    Create scale functions
        var xScale = d3.scale.linear()
            .domain([0, d3.max(dataJ, function(d) { return d.x; })])
            .range([padding, that.vWidth - padding * 2]);

        var yScale = d3.scale.linear()
            .domain([0, d3.max(dataJ, function(d) { return d.y; })])
            .range([that.vHeight - padding, padding]);

        var rScale = d3.scale.linear()
            .domain([0, d3.max(dataJ, function(d) { return d.y; })])
            .range([2, 5]);

        // Define X axis
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(5);

        // Define Y axis
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(5);

    
        // Drawing
        d3.selectAll(".wholeBody").remove();
        
        //    Create SVG element
        var svg = d3.select(that.$("#plot").get(0))
            .append("svg")
            .attr("class", "wholeBody")
            .attr("width", that.vWidth + margin.left + margin.right)
            .attr("height", that.vHeight + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");
        
        x.rangeRoundBands([0, that.vWidth], .1);
        y.range([that.vHeight, 0]);
        
        yScale.range([that.vHeight - padding, padding]);
        xScale.range([padding, that.vWidth - padding * 2]);

        // For now hardcode these values for colors
        var rString = "x";
        var getForegroundColor = function(value) {
            var len = 0;
            if (value !== null && value !== undefined) {
                len = parseInt(value) / 10;
            }
            console.log('getForegroundColor() called');
            // we need to return a string, so we'll just bring back a dummy value
            var colors = ['blue','red','yellow','orange','green'];
            return colors[parseInt(len) % colors.length];
        };
        
        //        Create circles
        svg.selectAll("circle")
            .data(dataJ)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return xScale(d.x);
            })
            .attr("cy", function(d) {
                return yScale(d.y);
            })
            .attr("r", function(d) {
                return rScale(4);
            })
            .attr("fill", function(d) {
                if(rString != "No Scaling") {
                    return getForegroundColor(d.r);
                } else {
                    return "black";
                }
            });

        //        Create X axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (that.vHeight - padding) + ")")
            .call(xAxis)
            .append("text")
            .attr("x", that.vWidth/2-50)
            .attr("y", 35)
            .style("font-size", "1.5em")
            .style("text-anchor", "start")
            .text("x-axis");  // Need to be able to pass a string in

        //        Create Y axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -35)
            .attr("x", -1 * that.vHeight/2)
            .style("font-size", "1.5em")
            .style("text-anchor", "end")
            .text("y-axis");  // Need to be able to pass a string in
        }
});

// psuedo-prompt emitted by do_section so that sections appear in contents list
promptTypes._section = promptTypes.base.extend({
    type: "_section",
    templatePath: "templates/_section.handlebars"
});
promptTypes.acknowledge = promptTypes.select.extend({
    type: "acknowledge",
    autoAdvance: false,
    acknLabel: translations.acknLabel,
    modification: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.log('D','acknowledge.modification', that.promptIdx);
        var oldValue = that.getValue();
        var acknowledged = (oldValue !== undefined && oldValue !== null) ? !oldValue : true;
        that.setValueDeferredChange(acknowledged);
        that.renderContext.choices = [{
            name: "acknowledge",
            display: { text: that.acknLabel },
            checked: acknowledged
        }];
        if (acknowledged && that.autoAdvance) {
            that.controller.gotoNextScreen(ctxt);
        } else {
            that.reRender(ctxt);
        }
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        var acknowledged;
        try{
            acknowledged = that.getValue();
            if ( acknowledged === undefined || acknowledged === null ) {
                acknowledged = false;
            }
        } catch(e) {
            acknowledged = false;
        }
        that.renderContext.choices = [{
            name: "acknowledge",
            display: { text: that.acknLabel },
            checked: acknowledged
        }];
        ctxt.success();
    }
});

return promptTypes;
});
