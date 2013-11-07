/*jslint eqeq: true, evil: true, plusplus: true, todo: true, vars: true, white: true, devel: true */
'use strict';
/**
 * All  the standard prompts available to a form designer.
 */
define(['mdl','database','opendatakit','controller','backbone','formulaFunctions','handlebars','promptTypes','jquery','underscore', 'translations', 'handlebarsHelpers'],
function(mdl,  database,  opendatakit,  controller,  Backbone,  formulaFunctions,  Handlebars,  promptTypes,  $,       _,            translations, _hh) {
verifyLoad('database',
    ['mdl','database','opendatakit','controller','backbone','formulaFunctions','handlebars','promptTypes','jquery','underscore', 'translations', 'handlebarsHelpers'],
    [mdl,  database,  opendatakit,  controller,  Backbone,  formulaFunctions,   Handlebars,  promptTypes,  $,       _,            translations, _hh]);

promptTypes.base = Backbone.View.extend({
    className: "odk-base",
    // type should match the 'xxxx' of the promptTypes.xxxx assignment
    type: "base",
    database: database,
    controller: controller,
    // user-defined inputAttributes overrides baseInputAttributes
    baseInputAttributes: {},
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
    // inputAttributes are a user-specified object that overrides baseInputAttributes.
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
                        // ensure that require is unwound
                        setTimeout(function() { ctxt.success(); }, 0 );
                    } catch (e) {
                        ctxt.append("prompts."+that.type+"._whenTemplateIsReady.exception", e);
                        shim.log('E',"prompts."+that.type+"._whenTemplateIsReady.exception " + String(e) + " px: " + that.promptIdx);
                        ctxt.failure({message: "Error compiling handlebars template."});
                    }
                }, function(err) {
                    ctxt.append("prompts."+that.type+"._whenTemplateIsReady.require.failure " + err.requireType + ' modules: ', err.requireModules);
                    shim.log('E',"prompts."+that.type+"._whenTemplateIsReady.require.failure " + err.requireType + ' modules: ', err.requireModules.toString() + " px: " + that.promptIdx);
                    ctxt.failure({message: "Error loading handlebars template."});
                });
            } catch (e) {
                ctxt.append("prompts."+that.type+"._whenTemplateIsReady.require.exception", e);
                shim.log('E',"prompts."+that.type+"._whenTemplateIsReady.require.exception " + String(e) + " px: " + that.promptIdx);
                ctxt.failure({message: "Error reading handlebars template."});
            }
        } else {
            ctxt.append("prompts." + that.type + "._whenTemplateIsReady.noTemplate", "px: " + that.promptIdx);
            shim.log('E',"prompts."+that.type+"._whenTemplateIsReady.noTemplate px: " + that.promptIdx);
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
        this.renderContext.inputAttributes = $.extend({}, this.baseInputAttributes, this.inputAttributes);
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
        ctxt.append("prompts." + this.type + ".stopPropagation", "px: " + this.promptIdx);
        shim.log("D","prompts." + this.type + ".stopPropagation", "px: " + this.promptIdx + " evt: " + evt);
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
                console.error("prompts."+that.type+"._isValid.required.exception.strict px: " + that.promptIdx + " exception: " + String(e));
                shim.log('E',"prompts."+that.type+"._isValid.required.exception.strict", String(e));
                return { message: "Exception while evaluating required() expression. See console log." };
            } else {
                shim.log("I","prompts."+that.type+"._isValid.required.exception.ignored px: " + that.promptIdx + " exception: " + String(e));
                isRequired = false;
            }
        }
        that.valid = true;
        if ( !('name' in that) ) {
            // no data validation if no persistence...
            return null;
        } 
        var value = that.getValue();
        if ( value === undefined || value === null || value === "" ) {
            if ( isRequired ) {
                that.valid = false;
                return { message: that.required_message };
            }
        } else if ( 'validateValue' in that ) {
            if ( !that.validateValue() ) {
                that.valid = false;
                return { message: that.invalid_value_message };
            }
        } 
        if ( 'constraint' in that ) {
            var outcome = false;
            try {
                outcome = that.constraint({"allowExceptions":true});
                if ( !outcome ) {
                    that.valid = false;
                    return { message: that.constraint_message };
                }
            } catch (e) {
                shim.log('E',"prompts."+that.type+".baseValidate.constraint.exception px: " + that.promptIdx + " exception: " + String(e));
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
        shim.log("prompts." + this.type, "px: " + this.promptIdx);
        return null;
    },
    getCallback: function(promptPath, internalPromptContext, action) {
        throw new Error("prompts." + this.type, "px: " + this.promptIdx + " unimplemented promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
    },
    __test__: function(evt){
        //This is a utility function for checking to make sure event maps are working.
        shim.log('T',evt);
    }
    /*
    registerChangeHandlers: function() {
        // TODO: code that is executed after all page prompts are inserted into the DOM.
        // This code would, e.g., handle value-change events to propagate changes across
        // a page (e.g., update calculated fields).
    },
    */
    /*
    //TODO: I can't find any refrences to these, so we should probably remove them.
    validationFailedAction: function(isMoveBackward) {
        alert(this.validationFailedMessage);
    },
    requiredFieldMissingAction: function(isMovingBackward) {
        alert(this.requiredFieldMissingMessage);
    }
    */
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
        if ( lastSave != null ) {
            var date = new Date(lastSave);
            var dateStr = date.toISOString();
            that.renderContext.last_save_date = dateStr;
        } else {
            that.renderContext.last_save_date = null;
        }
        
        var displayElementName = opendatakit.getSettingValue('instance_name');
        var displayName = (displayElementName === undefined || displayElementName === null) ? null : database.getDataValue(displayElementName);
        if ( displayElementName != null ) {
            that.renderContext.display_field = displayName;
        } else {
            that.renderContext.display_field = null;
        }
        that._screen._renderContext.enableBackNavigation = false;
        ctxt.success();
    },
    renderContext: {
        headerImg: requirejs.toUrl('img/form_logo.png'),
        backupImg: requirejs.toUrl('img/backup.png'),
        advanceImg: requirejs.toUrl('img/advance.png')
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
        headerImg: requirejs.toUrl('img/form_logo.png')
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        var formLogo = false;//TODO: Need way to access form settings.
        if(formLogo){
            this.renderContext.headerImg = formLogo;
        }
        
        var displayElementName = opendatakit.getSettingValue('instance_name');
        var displayName = (displayElementName == null) ? null : database.getDataValue(displayElementName);
        if ( displayElementName != null ) {
            that.renderContext.display_field = displayName;
        } else {
            that.renderContext.display_field = null;
        }
        this._screen._renderContext.enableForwardNavigation = false;
        ctxt.success();
    },
    saveIncomplete: function(evt) {
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append("prompts." + this.type + ".saveIncomplete", "px: " + this.promptIdx);

        that.controller.saveIncomplete($.extend({},ctxt,{success:function() {
                that.controller.leaveInstance(ctxt);
            }}));
    },
    saveFinal: function(evt) {
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append("prompts." + this.type + ".saveFinal", "px: " + this.promptIdx);
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
        that._screen._renderContext.enableNavigation = false;
        ctxt.success();
    }
});
promptTypes.instances = promptTypes.base.extend({
    type:"instances",
    hideInContents: true,
    valid: true,
    savepoint_type_finalized_text: 'finalized',
    savepoint_type_incomplete_text: 'incomplete',
    savepoint_type_checkpoint_text: 'checkpoint',
    templatePath: "templates/instances.handlebars",
    events: {
        "click .openInstance": "openInstance",
        "click .deleteInstance": "deleteInstance",
        "click .createInstance": "createInstance"
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        ctxt.append("prompts." + that.type + ".configureRenderContext", "px: " + that.promptIdx);
        database.get_all_instances($.extend({},ctxt,{success:function(instanceList) {
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
                    form_title: opendatakit.getCurrentSectionTitle(that._section_name),
                    headerImg: requirejs.toUrl('img/form_logo.png')
                });
                that._screen._renderContext.showHeader = false;
                that._screen._renderContext.enableNavigation = false;
                that._screen._renderContext.showFooter = false;
                ctxt.success();
            }
        }));
    },
    createInstance: function(evt){
      var ctxt = this.controller.newContext(evt);
      evt.stopPropagation(true);
      evt.stopImmediatePropagation();
      ctxt.append("prompts." + this.type + ".createInstance", "px: " + this.promptIdx);
      this.controller.createInstance(ctxt);
    },
    openInstance: function(evt) {
      var ctxt = this.controller.newContext(evt);
      evt.stopPropagation(true);
      evt.stopImmediatePropagation();
      ctxt.append("prompts." + this.type + ".openInstance", "px: " + this.promptIdx);
      this.controller.openInstance(ctxt, $(evt.target).attr('id'));
    },
    deleteInstance: function(evt){
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append("prompts." + that.type + ".deleteInstance", "px: " + that.promptIdx);
        database.delete_all($.extend({}, ctxt, {success: function() {
                that.buildRenderContext($.extend({}, ctxt, {success: function() {
                        that.reRender(ctxt);
                    }
                }));
            }
        }),
        $(evt.target).attr('id'));
    }
});
promptTypes.contents = promptTypes.base.extend({
    type:"contents",
    hideInContents: true,
    valid: true,
    templatePath: 'templates/contents.handlebars',
    events: {
        "click .select-contents-item-btn": "selectContentsItem"
    },
    selectContentsItem: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append("prompts." + that.type + ".selectContentsItem: click detected: " + evt.target);
        var $target = $(evt.target).closest('.select-contents-item');
        $target.attr("label", function(index, oldPropertyValue){
            ctxt.append("prompts." + that.type + ".selectContentsItem: click near label: " + oldPropertyValue,
                "px: " + that.promptIdx);
            // TODO: allow user to specify whether or not this is an 'advancing' operation
            that.controller.gotoScreenPath(ctxt, oldPropertyValue, true);
        });
    },
    configureRenderContext: function(ctxt) {
        this.renderContext.prompts = this.controller.getCurrentSectionPrompts();
        this._screen._renderContext.enableForwardNavigation = false;
        this._screen._renderContext.showHeader = true;
        this._screen._renderContext.showFooter = false;
        ctxt.success();
    }
});
promptTypes.linked_table = promptTypes.base.extend({
    type: "linked_table",
    valid: true,
    templatePath: 'templates/linked_table.handlebars',
    launchAction: 'org.opendatakit.survey.android.activities.MainMenuActivity',
    linked_form_id: null,
    linked_table_id: null,
    selection: null, // must be space separated. Must be persisted primitive elementName -- Cannot be elementPath
    selectionArgs: function() {return null;},
    order_by: null, // must be: (elementName [asc|desc] )+  -- same restriction as selection -- cannot be elementPath
    events: {
        "click .openInstance": "openInstance",
        "click .deleteInstance": "deleteInstance",
        "click .addInstance": "addInstance"
    },
    getLinkedTableId: function() {
        if ( this.linked_table_id == null ) {
            return this.linked_form_id;
        } else {
            return this.linked_table_id;
        }
    },
    getFormPath: function() {
        return '../tables/' + this.getLinkedTableId() + '/forms/' + this.linked_form_id + '/';
    },
    _linkedCachedMdl: null,
    _linkedCachedInstanceName: null,
    getLinkedInstanceName: function() {
        return this._linkedCachedInstanceName;
    },
    getLinkedMdl: function(ctxt) {
        var that = this;
        if ( that._linkedCachedMdl != null ) {
            ctxt.success(that._linkedCachedMdl);
        }
        var filePath = that.getFormPath() + 'formDef.json';
        opendatakit.readFormDefFile($.extend({},ctxt,{success:function(formDef) {
             var ino = opendatakit.getSettingObject(formDef, 'instance_name');
             if ( ino != null ) {
                that._linkedCachedInstanceName = ino.value;
            } else {
                that._linkedCachedInstanceName = null;
            }
            database.readTableDefinition($.extend({}, ctxt, {success:function(tlo) {
                that._linkedCachedMdl = tlo;
                ctxt.success(tlo);
            }}), formDef, that.getLinkedTableId(), filePath);
        }}), filePath );
    },
    _cachedSelection: null,
    convertSelection: function(linkedMdl) {
        var that = this;
        if ( that.selection == null || that.selection.length === 0 ) {
            return null;
        }
        if ( that._cachedSelection != null ) {
            return that._cachedSelection;
        }
        var parts = that.selection.split(' ');
        var remapped = '';
        var i;
        
        for ( i = 0 ; i < parts.length ; ++i ) {
            var e = parts[i];
            if ( e.length === 0 || !database.isValidElementPath(e) ) {
                remapped = remapped + ' ' + e;
            } else {
                // map e back to elementKey
                var found = false;
                var f;
                for (f in linkedMdl.dataTableModel) {
                    var defElement = linkedMdl.dataTableModel[f];
                    var elementPath = defElement['elementPath'];
                    if ( elementPath == null ) elementPath = f;
                    if ( elementPath == e ) {
                        remapped = remapped + ' "' + f + '"';
                        found = true;
                        break;
                    }
                }
                if ( found == false ) {
                    alert('selection: unrecognized elementPath: ' + e );
                    shim.log('E','convertSelection: unrecognized elementPath: ' + e );
                    return null;
                }
            }
        }
        that._cachedSelection = remapped;
        return that._cachedSelection;
    },
    _cachedOrderBy: null,
    convertOrderBy: function(linkedMdl) {
        var that = this;
        if ( that.order_by == null || that.order_by.length === 0 ) {
            return null;
        }
        if ( that._cachedOrderBy != null ) {
            return that._cachedOrderBy;
        }
        var parts = that.order_by.split(' ');
        var remapped = '';
        var i;
        for ( i = 0 ; i < parts.length ; ++i ) {
            var e = parts[i];
            if ( e.length === 0 || !database.isValidElementPath(e) ) {
                remapped = remapped + ' ' + e;
            } else {
                // map e back to elementKey
                var found = false;
                var f;
                for (f in linkedMdl.dataTableModel) {
                    var defElement = dataTableModel[f];
                    var elementPath = defElement['elementPath'];
                    if ( elementPath == null ) elementPath = f;
                    if ( elementPath == e ) {
                        remapped = remapped + ' "' + f + '"';
                        found = true;
                        break;
                    }
                }
                if ( found == false ) {
                    alert('order_by: unrecognized elementPath: ' + e );
                    shim.log('E','convertOrderBy: unrecognized elementPath: ' + e );
                    return null;
                }
            }
        }
        that._cachedOrderBy = remapped;
        return that._cachedOrderBy;
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
    configureRenderContext: function(ctxt) {
        var that = this;
        ctxt.append("prompts." + that.type + ".configureRenderContext", "px: " + that.promptIdx);
        that.renderContext.add_instance_label = ((that.display != null) ? that.display.new_instance_text : null) || "Add Instance";
        that.getLinkedMdl($.extend({},ctxt,{success:function(linkedMdl) {
            var dbTableName = linkedMdl.tableMetadata.dbTableName;
            var selString = that.convertSelection(linkedMdl);
            var selArgs = that.selectionArgs();
            var ordBy = that.convertOrderBy(linkedMdl);
            var displayElementName = that.getLinkedInstanceName();
            database.get_linked_instances($.extend({},ctxt,{success:function(instanceList) {
                    that.renderContext.instances = instanceList;
                    // change this to incomplete if it wasn't saved via the specific form
                    for (var i = 0; i < instanceList.length; i++) {
                        if (instanceList[i].form_id != that.linked_form_id) {
                            instanceList[i].savepoint_type = "incomplete";
                        }
                    }
                    ctxt.success();
            }}), dbTableName, selString, selArgs, displayElementName, ordBy);
        }}));
    },
    openInstance: function(evt) {
        var instanceId = $(evt.target).attr('id');
        var that = this;
        var ctxt = that.controller.newContext(evt);
        that.disableButtons();
        var platInfo = opendatakit.getPlatformInfo();
        // TODO: is this the right sequence?
        var uri = 'content://org.opendatakit.survey.android.provider.forms/' + platInfo.appName + '/' + that.linked_form_id;
        var outcome = shim.doAction( opendatakit.getRefId(), that.getPromptPath(), 
            'launchSurvey', that.launchAction, 
            JSON.stringify({ uri: uri + opendatakit.getHashString(that.getFormPath(),instanceId, opendatakit.initialScreenPath),
                             extras: { url: shim.getBaseUrl() + opendatakit.getHashString(that.getFormPath(),instanceId, opendatakit.initialScreenPath) }}));
        ctxt.append('linked_table.openInstance', platInfo.container + " outcome is " + outcome);
        if (outcome === null || outcome !== "OK") {
            shim.log("W","Should be OK got >" + outcome + "<");
            that.enableButtons();
            ctxt.failure({message: "Action canceled."});
        } else {
            ctxt.success();
        }
    },
    deleteInstance: function(evt) {
        var instanceId = $(evt.target).attr('id');
        var that = this;
        var ctxt = that.controller.newContext(evt);
        that.disableButtons();
        that.getLinkedMdl($.extend({},ctxt,{success:function(linkedMdl) {
            var dbTableName = linkedMdl.tableMetadata.dbTableName;
            database.delete_linked_instance_all($.extend({},ctxt,{success:function() {
                    that.enableButtons();
                },
                failure:function(m) {
                    that.enableButtons();
                    ctxt.failure(m);
                }}), dbTableName, instanceId);
        }}));
    },
    addInstance: function(evt) {
        var instanceId = opendatakit.genUUID();
        var that = this;
        var ctxt = that.controller.newContext(evt);
        that.disableButtons();
        var platInfo = opendatakit.getPlatformInfo();
        // TODO: is this the right sequence?
        var uri = 'content://org.opendatakit.survey.android.provider.forms/' + platInfo.appName + '/' + that.linked_form_id;
        var auxHash = '';
        if ( that.auxillaryHash ) {
            auxHash = that.auxillaryHash();
            if ( auxHash && auxHash !== '' && auxHash.charAt(0) !== '&' ) {
                auxHash = '&' + auxHash;
            }
        }
        var fullUrl = shim.getBaseUrl() + opendatakit.getHashString(that.getFormPath(),instanceId, opendatakit.initialScreenPath) + auxHash;
        var outcome = shim.doAction( opendatakit.getRefId(), that.getPromptPath(), 
            'launchSurvey', that.launchAction, 
            JSON.stringify({ uri: uri + opendatakit.getHashString(that.getFormPath(),instanceId, opendatakit.initialScreenPath) + auxHash,
                             extras: { url: fullUrl }}));
        ctxt.append('linked_table.addInstance', platInfo.container + " outcome is " + outcome);
        if (outcome === null || outcome !== "OK") {
            shim.log("W","Should be OK got >" + outcome + "<");
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
            ctxt.append("prompts." + that.type + 'getCallback.actionFn', "px: " + that.promptIdx +
                " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
            var jsonObject = JSON.parse(jsonString);
            if (jsonObject.status === -1 /* Activity.RESULT_OK */ ) {
                ctxt.append("prompts." + that.type + 'getCallback.actionFn.resultOK', "px: " + that.promptIdx +
                    " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                that.enableButtons();
                that.reRender(ctxt);
            }
            else {
                ctxt.append("prompts." + that.type + 'getCallback.actionFn.failureOutcome', "px: " + that.promptIdx +
                    " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                shim.log("W","failure returned from intent: " + jsonString);
                that.enableButtons();
                that.reRender($.extend({}, ctxt, {success: function() { ctxt.failure({message: "Action canceled."});},
                    failure: function(j) { ctxt.failure({message: "Action canceled."});}}));
            }
        };
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
        that.disableButtons();
        var platInfo = opendatakit.getPlatformInfo();
        // TODO: is this the right sequence?
        var outcome = shim.doAction( opendatakit.getRefId(), that.getPromptPath(), 
            'openLink', that.launchAction, 
            JSON.stringify({ uri: fullUrl }));
        ctxt.append('external_link.openLink', platInfo.container + " outcome is " + outcome);
        if (outcome === null || outcome !== "OK") {
            shim.log("W","Should be OK got >" + outcome + "<");
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
            ctxt.append("prompts." + that.type + 'getCallback.actionFn', "px: " + that.promptIdx +
                " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
            var jsonObject = JSON.parse(jsonString);
            if (jsonObject.status === -1 /* Activity.RESULT_OK */ ) {
                ctxt.append("prompts." + that.type + 'getCallback.actionFn.resultOK', "px: " + that.promptIdx +
                    " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                that.enableButtons();
                that.reRender(ctxt);
            }
            else {
                ctxt.append("prompts." + that.type + 'getCallback.actionFn.failureOutcome', "px: " + that.promptIdx +
                    " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                shim.log("W","failure returned from intent: " + jsonString);
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
        "click .branch-select-item": "selectBranchItem",
    },
    selectBranchItem: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append("prompts." + that.type + ".selectBranchItem: click detected: " + evt.target);
        var $target = $(evt.target).closest('.branch-select-item');
        $target.attr("label", function(index, oldPropertyValue) {
            ctxt.append("prompts." + that.type + ".selectBranchItem: click near label: " + oldPropertyValue);
            var currentPath = that.controller.getCurrentScreenPath();
            var parts = currentPath.split("/");
            if ( parts.length < 2 ) {
                ctxt.append("prompts." + that.type + ".selectBranchItem: invalid currentPath: " + currentPath);
                ctxt.failure({message: "invalid currentPath: " + currentPath});
                return;
            }
            var newPath = parts[0] + "/" + oldPropertyValue;
            ctxt.append("prompts." + that.type + ".click", "px: " + that.promptIdx);
            // TODO: allow user to specify whether or not this is an 'advancing' operation
            that.controller.gotoScreenPath(ctxt,newPath,true);
        });
    },
    choice_filter: function(){ return true; },
    configureRenderContext: function(ctxt) {
        var that = this;
        var newctxt = $.extend({}, ctxt, {success: function(outcome) {
            ctxt.append("prompts." + that.type + ".configureRenderContext." + outcome,
                        "px: " + that.promptIdx);
            ctxt.success();
        }});
        var populateChoicesViaQuery = function(query, newctxt){
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
                    newctxt.append("prompts." + this.type + ".configureRenderContext.error", 
                                "px: " + this.promptIdx + " Error fetching choices");
                    //This is a passive error because there could just be a problem
                    //with the content provider/network/remote service rather than with
                    //the form.
                    shim.log("prompts." + this.type + ".configureRenderContext.error px: " +
                             this.promptIdx + " Error fetching choices: " + e);
                    that.renderContext.passiveError = "Error fetching choices.\n";
                    if(e.statusText) {
                        that.renderContext.passiveError += e.statusText;
                    }
                    // TODO: verify how this error should be handled...
                    newctxt.failure({message: "Error fetching choices via ajax."});
                }
            };
 
            //TODO: It might also be desireable to make it so queries can refrence
            //datasheets in the XLSX file.
            var queryUriExt = queryUri.split('.').pop();
            if(queryUriExt === 'csv') {
                ajaxOptions.dataType = 'text';
                ajaxOptions.success = function(result) {
                    try {
                        require(['jquery-csv'], function(){
                            that.renderContext.choices = query.callback($.csv.toObjects(result));
                            newctxt.success("success");
                        },
                        function (err) {
                            newctxt.append("prompts."+that.type+".require.failure " + err.requireType + ' modules: ', err.requireModules);
                            shim.log('E',"prompts."+that.type+".require.failure " + err.requireType + ' modules: ', err.requireModules.toString() + " px: " + that.promptIdx);
                            newctxt.failure({message: "Error fetching choices from csv data."});
                        });
                    } catch (e) {
                        newctxt.append("promptType.select.require.exception", e.toString());
                        newctxt.failure({message: "Error reading choices from csv data."});
                    }
                };
            }
            
            $.ajax(ajaxOptions);
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
    }
});
promptTypes.select = promptTypes.select_multiple = promptTypes.base.extend({
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
        if(this.appearance === "grid") {
            filteredChoices = _.map(filteredChoices, function(choice, idx) {
                var columns = 3;
                choice.colLetter = String.fromCharCode(97 + (idx % columns));
                return choice;
            });
        }
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
        var choiceList = _.map(savedValue, function(valueObject) {
            matchedChoice = _.find(that.renderContext.choices, function(choiceObject) {
                            return (valueObject === choiceObject.data_value);
                });
            if ( matchedChoice != null ) {
                return { "name": that.name,
                         "value": valueObject };
            } else {
                otherChoices.push(valueObject);
            }
        });
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
            shim.log('W',"invalid choices are in choices list");
        }
        return choiceList;
    },
    modification: function(evt) {
        var ctxt = this.controller.newContext(evt);
        ctxt.append("prompts." + this.type + ".modification", "px: " + this.promptIdx);
        var that = this;
        if(this.withOther) {
            //This hack is needed to prevent rerendering
            //causing the other input to loose focus when clicked.
            if( $(evt.target).val() === 'other' &&
                $(evt.target).prop('checked') &&
                //The next two lines determine if the checkbox was already checked.
                this.renderContext.other &&
                this.renderContext.other.checked) {
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
            ctxt.append("prompts." + that.type + ".configureRenderContext." + outcome,
                        "px: " + that.promptIdx);
            that.updateRenderValue(that.parseSaveValue(that.getValue()));
            ctxt.success();
        }});
        var populateChoicesViaQuery = function(query, newctxt){
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
                    newctxt.append("prompts." + this.type + ".configureRenderContext.error", 
                                "px: " + this.promptIdx + " Error fetching choices");
                    //This is a passive error because there could just be a problem
                    //with the content provider/network/remote service rather than with
                    //the form.
                    shim.log("D","prompts." + this.type + ".configureRenderContext.error px: " + 
                                this.promptIdx + " Error fetching choices: " + e);
                    that.renderContext.passiveError = "Error fetching choices.\n";
                    if(e.statusText) {
                        that.renderContext.passiveError += e.statusText;
                    }
                    // TODO: verify how this error should be handled...
                    newctxt.failure({message: "Error fetching choices via ajax."});
                }
            };
 
            //TODO: It might also be desireable to make it so queries can refrence
            //datasheets in the XLSX file.
            var queryUriExt = queryUri.split('.').pop();
            if(queryUriExt === 'csv') {
                ajaxOptions.dataType = 'text';
                ajaxOptions.success = function(result) {
                    try {
                        require(['jquery-csv'], function(){
                            that.renderContext.choices = query.callback($.csv.toObjects(result));
                            newctxt.success("success");
                        },
                        function (err) {
                            newctxt.append("prompts."+that.type+".require.failure " + err.requireType + ' modules: ', err.requireModules);
                            shim.log('E',"prompts."+that.type+".require.failure " + err.requireType + ' modules: ', err.requireModules.toString() + " px: " + that.promptIdx);
                            newctxt.failure({message: "Error fetching choices from csv data."});
                        });
                    } catch (e) {
                        newctxt.append("promptType.select.require.exception", e.toString());
                        newctxt.failure({message: "Error reading choices from csv data."});
                    }
                    };
            }
            
            $.ajax(ajaxOptions);
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
        var ctxt = this.controller.newContext(evt);
        ctxt.append("prompts." + this.type + ".deselect", "px: " + this.promptIdx);
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
promptTypes.select_one_with_other = promptTypes.select_one.extend({
    withOther: true
});
//TODO:
//Since multiple choices are possible should it be possible
//to add arbitrary many other values to a select_with_other?
promptTypes.select_with_other = promptTypes.select.extend({
    withOther: true
});
promptTypes.input_type = promptTypes.base.extend({
    type: "input_type",
    templatePath: "templates/input_type.handlebars",
    renderContext: {
        "type": "input_type"
    },
    events: {
        "change input": "modification",
        "swipeleft .input-container": "stopPropagation",
        "swiperight .input-container": "stopPropagation"
    },
    //DebouncedRender throttles rerendering so that sliders work.
    debouncedRender: _.debounce(function(ctxt) {
        this.reRender(ctxt);
    }, 500, true),
    modification: function(evt) {
        var value = $(evt.target).val();
        var that = this;
        if ( that.insideMutex ) {
            shim.log("D","event received while inside mutex");
            return;
        }
        if ( that.lastEventTimestamp == evt.timeStamp ) {
            shim.log("D","duplicate event ignored");
            return;
        }
        that.lastEventTimestamp = evt.timeStamp;
        shim.log("D","event being processed");
        that.insideMutex = true;
        var ctxt = that.controller.newContext(evt);
        ctxt.append("prompts." + that.type + ".modification", "px: " + that.promptIdx);
        var renderContext = that.renderContext;
        // track original value
        var originalValue = that.getValue();
        that.setValueDeferredChange((value.length === 0 ? null : value));
        renderContext.invalid = !that.validateValue();
        if ( renderContext.invalid ) {
            value = originalValue;
            // restore it...
            that.setValueDeferredChange(originalValue);
        }
        renderContext.value = value;
        that.insideMutex = false;
        that.debouncedRender(ctxt);
    },
    configureRenderContext: function(ctxt) {
        var renderContext = this.renderContext;
        var value = this.getValue();
        renderContext.value = value;
        ctxt.success();
    },
    beforeMove: function() {
        var that = this;
        // track original value
        var originalValue = that.getValue();
        that.setValueDeferredChange(this.$('input').val());
        var isInvalid = !that.validateValue();
        if ( isInvalid ) {
            value = originalValue;
            // restore it...
            that.setValueDeferredChange(originalValue);
            return { message: that.invalid_value_message };
        } else {
            return null;
        }
    },
    validateValue: function() {
        return true;
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
    baseInputAttributes: {
        'type':'number'
    },
    invalidMessage: "Integer value expected",
    validateValue: function() {
        return !isNaN(parseInt(this.getValue(), 10));
    }
});
promptTypes.decimal = promptTypes.input_type.extend({
    type: "decimal",
    //TODO: This doesn't seem to be working.
    baseInputAttributes: {
        'type':'number'
    },
    invalidMessage: "Numeric value expected",
    validateValue: function() {
        return !isNaN(parseFloat(this.getValue()));
    }
});
promptTypes.datetime = promptTypes.input_type.extend({
    type: "datetime",
    useMobiscroll: true,
    scrollerAttributes: {
        preset: 'datetime',
        theme: 'jqm',
        display: 'modal'
        //Avoiding inline display because there
        //can be some debouncing issues.
        //Warning: mixed/clickpick mode doesn't work on galaxy nexus.
        //mode: 'scroll'
    },
    events: {
        "change input": "modification",
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
    configureRenderContext: function(ctxt) {
        var that = this;
        var renderContext = this.renderContext;
        if(this.detectNativeDatePicker()){
            renderContext.inputAttributes.type = this.type;
            this.useMobiscroll = false;
            ctxt.success();
        } else {
            require(["mobiscroll"], function() {
                $.mobiscroll.themes.jqm.defaults = {
                    jqmBody: 'd',
                    jqmHeader:'d',
                    jqmWheel: 'd',
                    jqmClickPick: 'd',
                    jqmSet: 'd',
                    jqmCancel: 'd'
                };
                //This is a monkey patch to disable hiding the datepicker when clicking outside of it.
                //This is a problem because users may click twice while they wait for the date
                //picker to open inadvertantly causing it to close.
/*                var originalJqmInit = $.mobiscroll.themes.jqm.init;
                $.mobiscroll.themes.jqm.init = function(elm, inst) {
                    originalJqmInit(elm, inst);
                    $('.dwo', elm).off('click');
                    $('.dwo').css("background-color", "white");
                    $('.dwo').css("opacity", ".5");
                }; */
                ctxt.success();
            });
        }
    },
    modification: function(evt) {
        var that = this;
        var value = that.$('input').mobiscroll('getDate');
        var ref = that.getValue();
        var rerender = ((ref == null || value == null) && (ref != value )) ||
                (ref != null && value != null && ref.valueOf() != value.valueOf());
        var ctxt = that.controller.newContext(evt);
        ctxt.append("prompts." + that.type + ".modification", "px: " + that.promptIdx);
        var renderContext = that.renderContext;
        if ( value === undefined || value === null ) {
            renderContext.value = '';
        } else {
            renderContext.value = that.$('input').val();
        }
        // track original value
        var originalValue = that.getValue();
        that.setValueDeferredChange(value);
        renderContext.invalid = !that.validateValue();
        if ( renderContext.invalid ) {
            value = originalValue;
            // restore it...
            that.setValueDeferredChange(originalValue);
            rerender = true;
        }
        renderContext.value = value;
        if ( rerender ) {
            that.reRender(ctxt);
        } else {
            ctxt.success();
        }
    },
    
    afterRender: function() {
        var that = this;
        if(this.useMobiscroll){
            that.$('input').mobiscroll()[that.scrollerAttributes.preset](that.scrollerAttributes);
            var value = that.getValue();
            if ( value === undefined || value === null ) {
                that.$('input').mobiscroll('setDate',new Date(),false);
            } else {
                that.$('input').mobiscroll('setDate',value, true);
            }
        }
    },
    beforeMove: function() {
        // the spinner will have already saved the value
        return null;
    }
});
promptTypes.date = promptTypes.datetime.extend({
    type: "date",
    scrollerAttributes: {
        preset: 'date',
        theme: 'jqm',
        display: 'modal'
    }
});
promptTypes.time = promptTypes.datetime.extend({
    type: "time",
    scrollerAttributes: {
        preset: 'time',
        theme: 'jqm',
        display: 'modal'
    },
    sameTime: function(ref, value) {
        // these are milliseconds relative to Jan 1 1970...
        var ref_tod = (ref.valueOf() % 86400000);
        var value_tod = (value.valueOf() % 86400000);
        return (ref_tod != value_tod);
    },
    modification: function(evt) {
        var that = this;
        var value = that.$('input').mobiscroll('getDate');
        var ref = that.getValue();
        var rerender = ((ref === undefined || ref === null || value === undefined || value === null) && (ref != value )) ||
                (ref != null && value != null && that.sameTime(ref,value));
        var ctxt = that.controller.newContext(evt);
        ctxt.append("prompts." + that.type + ".modification", "px: " + that.promptIdx);
        var renderContext = that.renderContext;
        if ( value === undefined || value === null ) {
            renderContext.value = '';
        } else {
            renderContext.value = that.$('input').val();
        }
        // track original value
        var originalValue = that.getValue();
        that.setValueDeferredChange(value);
        renderContext.invalid = !that.validateValue();
        if ( renderContext.invalid ) {
            value = originalValue;
            // restore it...
            that.setValueDeferredChange(originalValue);
            rerender = true;
        }
        renderContext.value = value;
        if ( rerender ) {
            that.reRender(ctxt);
        } else {
            ctxt.success();
        }
    },
    afterRender: function() {
        var that = this;
        if(this.useMobiscroll){
            that.$('input').mobiscroll()[that.scrollerAttributes.preset](that.scrollerAttributes);
            var value = that.getValue();
            if ( value === undefined || value === null ) {
                that.$('input').mobiscroll('setDate',new Date(),false);
            } else {
                that.$('input').mobiscroll('setDate',value, true);
            }
        }
    },
    beforeMove: function() {
        // the spinner will have already saved the value
        return null;
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
            'capture', that.captureAction, JSON.stringify({ extras: { newFile: "opendatakit-macro(newFile)" }}));
        ctxt.append('media.capture', platInfo.container + " outcome is " + outcome);
        if (outcome === null || outcome !== "OK") {
            shim.log("W","Should be OK got >" + outcome + "<");
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
            'choose', that.chooseAction,  JSON.stringify({ extras: { newFile: "opendatakit-macro(newFile)" }}));
        ctxt.append('media.capture', platInfo.container + " outcome is " + outcome);
        if (outcome === null || outcome !== "OK") {
            shim.log("W","Should be OK got >" + outcome + "<");
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
            ctxt.append("prompts." + that.type + 'getCallback.actionFn', "px: " + that.promptIdx +
                " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
            var jsonObject = JSON.parse(jsonString);
            if (jsonObject.status === -1 /* Activity.RESULT_OK */ ) {
                ctxt.append("prompts." + that.type + 'getCallback.actionFn.resultOK', "px: " + that.promptIdx +
                    " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                var uri = (jsonObject.result != null) ? jsonObject.result.uri : null;
                var contentType = (jsonObject.result != null) ? jsonObject.result.contentType : null;
                if (uri != null && contentType != null) {
                    var oldPath = that.getValue();
                    if ( uri != oldPath) {
                        // TODO: delete old??? Or leave until marked as finalized?
                        that.setValueDeferredChange({ uri : uri, contentType: contentType });
                        that.enableButtons();
                        that.updateRenderContext();
                        that.reRender(ctxt);
                    }
                }
            }
            else {
                ctxt.append("prompts." + that.type + 'getCallback.actionFn.failureOutcome', "px: " + that.promptIdx +
                    " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                shim.log("W","failure returned from intent: " + jsonString);
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
        var uri = (mediaUri != null && mediaUri.uri != null) ? mediaUri.uri : null;
        var contentType = (mediaUri != null && mediaUri.contentType != null) ? mediaUri.contentType : null;
        var safeIdentity = 'T'+opendatakit.genUUID().replace(/[-:]/gi,'');
        var platinfo = opendatakit.getPlatformInfo();
        if ( platinfo.container !== 'Android' ) {
            that.renderContext.pre4Android = false;
        } else {
            that.renderContext.pre4Android = ( platinfo.version.substring(0,1) < "4" );
        }
        that.renderContext.mediaPath = uri;
        that.renderContext.uriValue = uri;
        that.renderContext.safeIdentity = safeIdentity;
        that.renderContext.contentType = contentType;
    },
    updateRenderContext: function() {
        this.baseUpdateRenderContext();
    }
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
    chooseAction: 'org.opendatakit.survey.android.activities.MediaChooseVideoActivity',
    updateRenderContext: function() {
        this.baseUpdateRenderContext();
        // this.renderContext.videoPoster = this.renderContext.uriValue;
    }
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
        ctxt.append(this.intentString, platInfo.container + " outcome is " + outcome);
        if (outcome && outcome === "OK") {
            ctxt.success();
        } else {
            shim.log("W","Should be OK got >" + outcome + "<");
            $('#block-ui').hide().off();
            ctxt.failure({message: "Action canceled."});
        }
        //Removing this because I want to simulate intents
        //when not on android.
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
            ctxt.append("prompts." + that.type + 'getCallback.actionFn', "px: " + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
            try {
                jsonObject = JSON.parse(jsonString);
            } catch (e) {
                ctxt.append("prompts." + that.type + 'getCallback.actionFn.JSONparse.exception', "px: " + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action + ' exception ' + String(e));
                console.error("prompts." + that.type + 'getCallback.actionFn.JSONparse.exception px: ' + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action + ' exception ' + String(e));
                ctxt.failure({message: "Action response could not be parsed."});
            }
            if (jsonObject.status === -1 ) { // Activity.RESULT_OK
                ctxt.append("prompts." + that.type + 'getCallback.actionFn.resultOK', "px: " + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                if (jsonObject.result != null) {
                    that.setValueDeferredChange(that.extractDataValue(jsonObject));
                    that.renderContext.value = that.getValue();
                    that.reRender(ctxt);
                }
            } else {
                ctxt.append("prompts." + that.type + 'getCallback.actionFn.failureOutcome', "px: " + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                console.error("prompts." + that.type + 'getCallback.actionFn.failureOutcome px: ' + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
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
    intentString: 'com.google.zxing.client.android.SCAN',
     extractDataValue: function(jsonObject) {
        return jsonObject.result.SCAN_RESULT;
    }
});
promptTypes.geopoint = promptTypes.launch_intent.extend({
    type: "geopoint",
    templatePath: "templates/geopoint.handlebars",
    intentString: 'org.opendatakit.survey.android.activities.GeoPointActivity',
    extractDataValue: function(jsonObject) {
        return {
            latitude: jsonObject.result.latitude,
            longitude: jsonObject.result.longitude,
            altitude: jsonObject.result.altitude,
            accuracy: jsonObject.result.accuracy
        };
    }
});
promptTypes.geopointmap = promptTypes.launch_intent.extend({
    type: "geopointmap",
    intentString: 'org.opendatakit.survey.android.activities.GeoPointMapActivity',
     extractDataValue: function(jsonObject) {
        return { latitude: jsonObject.result.latitude, 
                 longitude: jsonObject.result.longitude, 
                 altitude: jsonObject.result.altitude, 
                 accuracy: jsonObject.result.accuracy };
    }
});
promptTypes.note = promptTypes.base.extend({
    type: "note",
    templatePath: "templates/note.handlebars"
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
        ctxt.append('acknowledge.modification', that.promptIdx);
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
