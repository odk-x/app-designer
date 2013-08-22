'use strict';
/**
* circular dependency: 
*
* Responsibilities:
*    Performs the actions necessary to make a prompt visible on the screen (setScreen).
*    Receives click and swipe events for navigating across pages.
*    Displays pop-up dialogs and toasts.
*    Displays the options dialog for changing languages and navigations.
*/
define(['screenTypes','opendatakit','backbone','jquery','handlebars','jqmobile'], 
function(screenTypes,  opendatakit,  Backbone,  $,       Handlebars) {
screenTypes.waiting = Backbone.View.extend({
    type: "waiting",
    templatePath: "templates/waiting.handlebars",
    //renderContext is static data for the dynamic _renderContext object 
    // that is passed into the render function.
    renderContext: {showHierarchy: false, dataTheme: "d"},
    //Template context is an user specified object that overrides the render context.
    templateContext: {},
    baseInputAttributes: {},
    //inputAttributes overrides baseInputAttributes
    inputAttributes: {},
    // _section_name...
    // _row_num...
    activePrompts: [],
    initialize: function(args) {
        var that = this;
        $.extend(this, args);
        this.afterInitialize();
    },
    getActivePrompts: function(context) {
        return activePrompts;
    },
    getScreenPath: function() {
        return this._section_name + '/' + this._op.operationIdx;
    },
    getJqmScreen: function() {
        return this.$el.find(".odk-screen");
    },
    whenTemplateIsReady: function(ctxt){
        var that = this;
        if(this.template) {
            ctxt.success();
        } else if(this.templatePath) {
            requirejs(['text!'+this.templatePath], function(source) {
                try {
                    that.template = Handlebars.compile(source);
                    ctxt.success();
                } catch (e) {
                    ctxt.append("screens."+that.type+
                        ".whenTemplateIsReady.exception", e);
                    console.error("screens."+that.type+
                        ".whenTemplateIsReady.exception " + String(e) +
                        " px: " + that.promptIdx);
                    ctxt.failure({message: "Error compiling handlebars template."});
                }
            }, function(err) {
                ctxt.append("screens."+that.type+
                    ".whenTemplateIsReady.requirejs.failure", err);
                console.error("screens."+that.type+
                    ".whenTemplateIsReady.requirejs.failure " + String(err) +
                    " px: " + that.promptIdx);
                ctxt.failure({message: "Error loading handlebars template."});
            });
        } else {
            ctxt.append("screens." + that.type +
                ".whenTemplateIsReady.noTemplate", "px: " + that.promptIdx);
            console.error("screens."+that.type+
                ".whenTemplateIsReady.noTemplate px: " + that.promptIdx);
            ctxt.failure({message: "Configuration error: No handlebars template found!"});
        }
    },
    /*
     * afterInitializeRenderContext
     * can be redefined by the user.
     */
    afterInitializeRenderContext: function(ctxt) {
        ctxt.success();
    },
    initializeRenderContext: function(ctxt) {
        //Object.create is used because we don't want to modify the class's render context.
        this._renderContext = Object.create(this.renderContext);
        this._renderContext.inputAttributes = 
                $.extend({}, this.baseInputAttributes, this.inputAttributes);
        $.extend(this._renderContext, this.templateContext);
        this.afterInitializeRenderContext(ctxt);
    },
    /**
     * afterInitialize is user defined
     **/
    afterInitialize: function() {},
    onActivate: function(ctxt) {
        var that = this;
        // this once held the code to invoke with_next and with_next_validate actions
        that.whenTemplateIsReady($.extend({}, ctxt, {
            success:function() {
                that.initializeRenderContext(ctxt);
            }}));
    },
    /**
     * stopPropagation is used in the events map to disable swiping on various elements
     **/
    stopPropagation: function(evt){
        var ctxt = controller.newContext(evt);
        ctxt.append("screens." + this.type + ".stopPropagation", "px: " + this.promptIdx);
        shim.log("D","screens." + this.type + ".stopPropagation px: " + this.promptIdx + "evt: " + evt);
        evt.stopImmediatePropagation();
        ctxt.success();
    },
    reRender: function(ctxt) {
        var that = this;
        that.onActivate($.extend({},ctxt,{success:function() {
            ctxt.newScreen = false;
            that.render($.extend({},ctxt,{success:function() {
                that.$el.trigger('create');
                that.afterRender(ctxt);
            }}));
        }}));
    },
    afterRender: function(ctxt) {
        ctxt.success();
    },
    render: function(ctxt) {
        var that = this;
        // TODO: understand what Nathan was trying to do here with a virtual element.
        try {
            var tmplt = that.template(that._renderContext);
            that.$el.html(tmplt);
            that.$el.attr('data-theme', that._renderContext.dataTheme);
            that.$el.attr('data-content-theme', that._renderContext.dataTheme);
            that.$el.attr('data-role','page');
        } catch(e) {
            console.error("screens." + that.type + ".render.exception: " +
                            String(e) + ' px: ' + that.promptIdx);
            console.error(that);
            alert("Error in template.");
        }
        that.delegateEvents();
        ctxt.success();
    },
    /**
     * Give the prompts a chance to save their state to the database.
     * Also, enable the screen to enforce its own criteria for when it
     * is allowable to move off the screen. E.g., after saving or 
     * rolling back all changes.
     */
    beforeMove: function(ctxt, advancing) {
        ctxt.success();
    }
});
screenTypes.screen = Backbone.View.extend({
    type: "screen",
    templatePath: "templates/navbar.handlebars",
    //renderContext is static data for the dynamic _renderContext object 
    // that is passed into the render function.
    renderContext: {showHierarchy: true, dataTheme: "d"},
    //Template context is an user specified object that overrides the render context.
    templateContext: {},
    baseInputAttributes: {},
    //inputAttributes overrides baseInputAttributes
    inputAttributes: {},
    // _section_name...
    // _row_num...
    activePrompts: [],
    initialize: function(args) {
        var that = this;
        $.extend(this, args);
        this.afterInitialize();
    },
    getActivePrompts: function(context) {
        return activePrompts;
    },
    getScreenPath: function() {
        return this._section_name + '/' + this._op.operationIdx;
    },
    getJqmScreen: function() {
        return this.$(".odk-screen");
    },
    whenTemplateIsReady: function(ctxt){
        var that = this;
        if(this.template) {
            ctxt.success();
        } else if(this.templatePath) {
            requirejs(['text!'+this.templatePath], function(source) {
                try {
                    that.template = Handlebars.compile(source);
                    ctxt.success();
                } catch (e) {
                    ctxt.append("screens."+that.type+
                        ".whenTemplateIsReady.exception", e);
                    console.error("screens."+that.type+
                        ".whenTemplateIsReady.exception " + String(e) +
                        " px: " + that.promptIdx);
                    ctxt.failure({message: "Error compiling handlebars template."});
                }
            }, function(err) {
                ctxt.append("screens."+that.type+
                    ".whenTemplateIsReady.requirejs.failure", err);
                console.error("screens."+that.type+
                    ".whenTemplateIsReady.requirejs.failure " + String(err) +
                    " px: " + that.promptIdx);
                ctxt.failure({message: "Error loading handlebars template."});
            });
        } else {
            ctxt.append("screens." + that.type +
                ".whenTemplateIsReady.noTemplate", "px: " + that.promptIdx);
            console.error("screens."+that.type+
                ".whenTemplateIsReady.noTemplate px: " + that.promptIdx);
            ctxt.failure({message: "Configuration error: No handlebars template found!"});
        }
    },
    /*
     * afterInitializeRenderContext
     * can be redefined by the user.
     */
    afterInitializeRenderContext: function(ctxt) {
        ctxt.success();
    },
    initializeRenderContext: function(ctxt) {
        //Object.create is used because we don't want to modify the class's render context.
        this._renderContext = Object.create(this.renderContext);
        if ( this.display == null ) {
            var section = opendatakit.getSettingObject(opendatakit.getCurrentFormDef(), this._section_name);
            this._renderContext.display = section.display;
        } else {
            this._renderContext.display = this.display;
        }
        var locales = opendatakit.getFormLocalesValue();
        this._renderContext.disabled = this.disabled;
        this._renderContext.hide = this.hide;
        this._renderContext.form_title = controller.getSectionTitle();
        this._renderContext.locales = locales;
        this._renderContext.hasTranslations = (locales.length > 1);
        this._renderContext.showHeader = true;
        this._renderContext.showFooter = false;
        this._renderContext.showHierarchy = controller.getSectionShowHierarchy();
        this._renderContext.enableForwardNavigation = true;
        this._renderContext.enableBackNavigation = true;
        this._renderContext.enableNavigation = true;

        //It's probably not good to get data like this in initialize
        //Maybe it would be better to use handlebars helpers to get metadata?
        this._renderContext.form_version = opendatakit.getSettingValue('form_version');
        this._renderContext.inputAttributes = 
                $.extend({}, this.baseInputAttributes, this.inputAttributes);
        $.extend(this._renderContext, this.templateContext);
        this.afterInitializeRenderContext(ctxt);
    },
    /**
     * afterInitialize is user defined
     **/
    afterInitialize: function() {},
    preActivate: function(ctxt) {
        var that = this;
        // this once held the code to invoke with_next and with_next_validate actions
        that.whenTemplateIsReady($.extend({}, ctxt, {
            success:function() {
                // determine the active prompts
                that.activePrompts = []; // clear all prompts...
                var activePromptIndices = that._operation._parsed_screen_block();
                var sectionPrompts = controller.getCurrentSectionPrompts();
                var ap = [];
                var i;
                for ( i = 0 ; i < activePromptIndices.length ; ++i ) {
                    var prompt = sectionPrompts[activePromptIndices[i]];
                    if ( prompt == null ) {
                        ctxt.append("Error! unable to resolve prompt!");
                        ctxt.failure({message: "bad prompt index!"});
                        return;
                    }
                    prompt._screen = that;
                    ap.push(prompt);
                }
                that.activePrompts = ap;
                // we now know what we are going to render.
                // work with the controller to ensure that all
                // intermediate state has been written to the 
                // database before commencing the rendering
                controller.commitChanges($.extend({},ctxt,
                    {success:function() {
                        that.initializeRenderContext(ctxt);
                    }}));
            }}));
    },
    postActivate: function(ctxt) {
        var that = this;
        // We do not support dependent default values within screen groups.
        // If we are to do so, we will need to add code here to ensure
        // their on activate functions are called in the right order.
        var subPromptsReady = _.after(that.activePrompts.length, function () {
            ctxt.success();
        });
        _.each(that.activePrompts, function(prompt){
            prompt.onActivate($.extend({}, ctxt, {
                success:function() {
                    subPromptsReady(ctxt);
                }
            }));
        });
    },
    onActivate: function(ctxt) {
        var that = this;
        this.preActivate($.extend({}, ctxt, {
            success: function() {
                that.postActivate(ctxt);
            }
        }));
    },
    /**
     * stopPropagation is used in the events map to disable swiping on various elements
     **/
    stopPropagation: function(evt){
        var ctxt = controller.newContext(evt);
        ctxt.append("screens." + this.type + ".stopPropagation", "px: " + this.promptIdx);
        shim.log("D","screens." + this.type + ".stopPropagation px: " + this.promptIdx + "evt: " + evt);
        evt.stopImmediatePropagation();
        ctxt.success();
    },
    reRender: function(ctxt) {
        var that = this;
        that._screenManager.refreshScreen(ctxt);
        return;
        that.onActivate($.extend({},ctxt,{success:function() {
            ctxt.newScreen = false;
            that.render($.extend({},ctxt,{success:function() {
                that.$el.trigger('create');
                that.afterRender($.extend({},ctxt,{success:function() {
                    $.mobile.changePage(that.$el, {
                            changeHash: false,
                            allowSamePageTransition: true,
                            transition: 'none'
                        });
                }}));
            }}));
        }}));
    },
    afterRender: function(ctxt) {
        var that = this;
        $.each(that.activePrompts, function(idx, prompt){
            prompt.afterRender();
        });
        ctxt.success();
    },
    render: function(ctxt) {
        var that = this;
        // TODO: understand what Nathan was trying to do here with a virtual element.
        try {
            var tmplt = that.template(that._renderContext);
            that.$el.html(tmplt);
            that.$el.attr('data-theme', that._renderContext.dataTheme);
            that.$el.attr('data-content-theme', that._renderContext.dataTheme);
            that.$el.attr('data-role','page');
        } catch(e) {
            console.error("screens." + that.type + ".render.exception: " +
                            String(e) + ' px: ' + that.promptIdx);
            console.error(that);
            alert("Error in template.");
        }
        var $container = that.$('.odk-container');
        $.each(that.activePrompts, function(idx, prompt){
            prompt.render();
            if(!prompt.$el){
                console.error("render px: " + that.promptIdx + 
                    " Prompts must have synchronous render functions. " +
                    "Don't debounce them or launch async calls before el is set.");
                console.error(prompt);
                alert("Sub-prompt has not been rendered. See console for details.");
            }
            $container.append(prompt.$el);
            prompt.delegateEvents();
        });
        that.delegateEvents();
        ctxt.success();
    },
    /**
     * allowMove
     *   advancing == true if the user is not going 'back'
     *
     * Return { outcome: true/false, message: 'failure message' }
     * to caller to indicate whether or not the screen allows the
     * user to move off of it.
     */
    allowMove: function(advancing) {
        return { outcome: true };
    },
    /**
     * Give the prompts a chance to save their state to the database.
     * Also, enable the screen to enforce its own criteria for when it
     * is allowable to move off the screen. E.g., after saving or 
     * rolling back all changes.
     */
    beforeMove: function(ctxt, advancing) {
        var that = this;
        var allowMoveHandler = function(advancing) {
            var allowed = that.allowMove(advancing);
            if ( allowed.outcome ) {
                ctxt.success();
            } else {
                ctxt.failure({message: allowed.message});
            }
        };

        var validationPromptCtxt = $.extend({},ctxt,{
            success: _.after(that.activePrompts.length, function() {
                    allowMoveHandler(advancing);
                }),
            failure: _.once(ctxt.failure)
        });

        var subPromptCtxt = $.extend({},ctxt,{
            success: _.after(that.activePrompts.length, function() {
                if ( advancing ) {
                    $.each(that.activePrompts, function(idx, prompt){
                        prompt.validate(validationPromptCtxt);
                    });
                } else {
                    allowMoveHandler(advancing);
                }
            }),
            failure: _.once(ctxt.failure)
        });
        $.each(that.activePrompts, function(idx, prompt){
            prompt.beforeMove(subPromptCtxt);
        });
    },
    __test__: function(evt){
        //This is a utility function for checking to make sure event maps are working.
        console.log(evt);
    }
    /*
    registerChangeHandlers: function() {
        // TODO: code that is executed after all page prompts are inserted into the DOM.
        // This code would, e.g., handle value-change events to propagate changes across
        // a page (e.g., update calculated fields).
    },
    //TODO: I can't find any refrences to these, so we should probably remove them.
    validationFailedAction: function(isMoveBackward) {
        alert(this.validationFailedMessage);
    },
    requiredFieldMissingAction: function(isMovingBackward) {
        alert(this.requiredFieldMissingMessage);
    }
    */
});
});
