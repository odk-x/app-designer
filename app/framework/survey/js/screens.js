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
define(['screenTypes','opendatakit','controller','backbone','jquery','underscore','handlebars','jqmobile','handlebarsHelpers', 'translations'], 
function(screenTypes,  opendatakit,  controller,  Backbone,  $,       _,           Handlebars, _jqmobile, _hh, translations) {
verifyLoad('screens',
    ['screenTypes','opendatakit','controller','backbone','jquery','underscore','handlebars','jqmobile','handlebarsHelpers', 'translations'],
    [screenTypes,   opendatakit,  controller,  Backbone,  $,       _,           Handlebars,  _jqmobile, _hh, translations]);

screenTypes.base = Backbone.View.extend({
    /**
     * These values must be defined in concrete implementations:
     *   type
     *   templatePath
     */
    controller: controller,
    /**
     * These values are injected by screenManager:
     *   _section_name
     *   _row_num
     *   _screenManager.renderContext
     */
    activePrompts: [],
    $focusPromptTest: null,
    focusScrollPos: null,
    pendingCtxt: [],
    initialize: function(args) {
        var that = this;
        $.extend(this, args);
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
            try {
                require(['text!'+this.templatePath], function(source) {
                    try {
                        that.template = Handlebars.compile(source);
                        // ensure that require is unwound
                        setTimeout(function() { 
                            ctxt.log('I',"screens."+that.type+"._whenTemplateIsReady.success.setTimeout");
                            ctxt.success(); 
                        }, 0 );
                    } catch (e) {
                        ctxt.log('E',"screens."+that.type+
                            ".whenTemplateIsReady.exception", e.message +
                            " px: " + that.promptIdx);
                        ctxt.failure({message: "Error compiling handlebars template."});
                    }
                }, function(err) {
                    ctxt.log('E',"screens."+that.type+
                        ".whenTemplateIsReady.require.failure " + err.requireType + " modules: ", err.requireModules.toString());
                    ctxt.failure({message: "Error loading handlebars template (" + err.requireType + ")."});
                });
            } catch (e) {
                ctxt.log('E',"screens."+that.type+
                    ".whenTemplateIsReady.require.exception", e.message +
                    " px: " + that.promptIdx);
                ctxt.failure({message: "Error reading handlebars template."});
            }
        } else {
            ctxt.log('E',"screens." + that.type +
                ".whenTemplateIsReady.noTemplate", "px: " + that.promptIdx);
            ctxt.failure({message: "Configuration error: No handlebars template found!"});
        }
    },
    reRender: function(ctxt) {
        var that = this; 

        that.pendingCtxt.push(ctxt);
        shim.log("D","screens.reRender: called");
        that.debouncedReRender();
     },
    debouncedReRender: _.debounce(function() {
        var that = this;
        that.focusScrollPos = null;
        that.$focusPromptTest = null;
        var ctxt = null;

        that.focusScrollPos = $(window).scrollTop();
        shim.log("D","screens.reRender.debouncedReRender: focusScrollPos = " + that.focusScrollPos);

        // Find the element in focus
        that.$focusPromptTest = $(':focus');
        if (that.$focusPromptTest.length == 0) {
            that.$focusPromptTest = null;
        }

        shim.log("D","screens.reRender.debouncedReRender: pendingCtxtLength: " + that.pendingCtxt.length);
        if (that.pendingCtxt.length > 0) {
            ctxt = that.pendingCtxt.pop();   
        } else {
            shim.log("W","screens.reRender.debouncedReRender: no pendingCtxts");
        }

        while (that.pendingCtxt.length > 0) {
            ctxt.setChainedContext(that.pendingCtxt.pop());
        }
            
        if (ctxt !== null) {
            that._screenManager.refreshScreen(ctxt);
        }
    }, 500),
   /**
     * Use the render context from the screenManager, but mix in 
     * any values explicitly defined for this screen.  Screen can
     * only enable or disable navigation, but cannot enable or 
     * disable forward/backward functionality -- that is dictated
     * by the controller via the screenManager.
     */
    initializeRenderContext: function() {
        var that = this;
        // shallow copy because we don't want to modify the screenManager's render context.
        that._renderContext = $.extend({},that._screenManager.renderContext);
        if ( 'display' in that && _.isObject(that.display) ) {
            that._renderContext.display = that.display;
        } else {
            that._renderContext.display = { title: that._renderContext.form_title };
        }
        if ( 'showHeader' in that ) {
            that._renderContext.showHeader = that.showHeader;
        }
        if ( 'showFooter' in that ) {
            that._renderContext.showFooter = that.showFooter;
        }
        if ( 'showContents' in that ) {
            that._renderContext.showContents = that.showContents;
        }
        if ( 'enableNavigation' in that ) {
            that._renderContext.enableNavigation = that.enableNavigation;
        }
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        if ( that.activePrompts.length == 0 ) {
            ctxt.log('D','configureRenderContext.noActivePrompts.success');
            ctxt.success();
        } else {
            var onceCtxt = $.extend({}, ctxt, {
                success:_.after(that.activePrompts.length, function() {
                    ctxt.log('D','configureRenderContext.onceCtxt.success');
                    ctxt.success();
                }),
                failure: _.once(function(m) {
                    ctxt.log('D','configureRenderContext.onceCtxt.failure');
                    ctxt.failure(m);
                })
            });
            try {
                // We do not support dependent default values within screen groups.
                // If we are to do so, we will need to add code here to ensure
                // their on activate functions are called in the right order.
                _.each(that.activePrompts, function(prompt){
                    prompt.buildRenderContext(onceCtxt);
                });
            } catch (ex) {
                ctxt.log('E','screen.configureRenderContext.exception', 
                    "exception: " + ex.message + " stack: " + ex.stack );
                ctxt.failure({message: "Exception while initializing screen: " + ex.message});
            }
        }
    },
    buildRenderContext: function(ctxt) {
       var that = this;
        // this once held the code to invoke with_next and with_next_validate actions
        that.whenTemplateIsReady($.extend({}, ctxt, {success:function() {
            // determine the active prompts
            that.activePrompts = []; // clear all prompts...
            var activePromptIndices = [];
            if ( that._operation && that._operation._screen_block ) {
                activePromptIndices = that._operation._screen_block();
                var sectionPrompts = that.controller.getCurrentSectionPrompts();
                var ap = [];
                var i;
                for ( i = 0 ; i < activePromptIndices.length ; ++i ) {
                    var prompt = sectionPrompts[activePromptIndices[i]];
                    if ( prompt == null ) {
                        ctxt.log('E',"Error! unable to resolve prompt!");
                        ctxt.failure({message: "bad prompt index!"});
                        return;
                    }
                    prompt._screen = that;
                    ap.push(prompt);
                }
                that.activePrompts = ap;
            }
            // we now know what we are going to render.
            // work with the controller to ensure that all
            // intermediate state has been written to the 
            // database before commencing the rendering
            that.controller.commitChanges($.extend({},ctxt,{success:function() {
                ctxt.log('D','buildRenderContext.commitChanges.success');
                that.initializeRenderContext();
                that.configureRenderContext(ctxt);
            }}));
        }}));
    },
    afterRender: function() {
        var that = this;
        var setFocus = false;

        $.each(that.activePrompts, function(idx, prompt){
            prompt.afterRender();
        });

        if (that.$focusPromptTest != null) 
        {   
            var focusElementAttr = {'id' : that.$focusPromptTest.attr('id'),
                                    'value' : that.$focusPromptTest.attr('value'),
                                    'name' : that.$focusPromptTest.attr('name')};

            var focusElementString = (that.$focusPromptTest.get(0).tagName).toLowerCase();
            for (var key in focusElementAttr) {
                if (focusElementAttr[key]) {
                    focusElementString = focusElementString + "[" + key + "='" + focusElementAttr[key] + "']";
                    setFocus = true;
                }
            }

            if (setFocus == true) {
                shim.log("D","screens.afterRender: focusElementString = " + focusElementString);
                $(focusElementString).focus();
            }
        }        
            
        if (that.focusScrollPos != null) {
            $(window).scrollTop(that.focusScrollPos);
        }
    },
    recursiveUndelegateEvents: function() {
        var that = this;
        that.undelegateEvents();
        $.each(that.activePrompts, function(idx, prompt){
            prompt.undelegateEvents();
        });
    },
    recursiveDelegateEvents: function() {
        var that = this;
        $.each(that.activePrompts, function(idx, prompt){
            prompt.delegateEvents();
        });
        that.delegateEvents();
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
    beforeMove: function(isStrict, advancing, validateValues) {
        var that = this;
        var allowMoveHandler = function(advancing) {
            var allowed = that.allowMove(advancing);
            if ( allowed.outcome ) {
                return null;
            } else {
                return { message: allowed.message };
            }
        };
        
		var i;
        var beforeMoveError;
        for ( i = 0; i < that.activePrompts.length; i ++)
        {
            beforeMoveError = that.activePrompts[i].beforeMove();
            if ( beforeMoveError != null ) {
                break;
            }
        }
        
        if ( beforeMoveError == null )
        {
            if ( validateValues ) {
                var validateError;
                for ( i = 0; i < that.activePrompts.length; i++ )
                {
                    validateError = that.activePrompts[i]._isValid(isStrict);
                    if ( validateError != null ) { 
                        break; 
                    }
                }
                if ( validateError == null ) { 
                    return allowMoveHandler(advancing); 
                } else {
                    return validateError;
                }
            } 
            else {
                return allowMoveHandler(advancing);
            }
        } else {
            return beforeMoveError;
        }
    },
    handleConfirmation: function(promptIndex) {
        var that = this;
        for ( var i = 0; i < that.activePrompts.length; i ++)
        {
            if (that.activePrompts[i].promptIdx == promptIndex) {
                var success = that.activePrompts[i].handleConfirmation();
                if (success == null) {
                    break;
                }
                else {
                    console.error(success);
                }
            }
        }
    },
    __test__: function(evt){
        //This is a utility function for checking to make sure event maps are working.
        console.log(evt);
    }
});
screenTypes.waiting = screenTypes.base.extend({
    type: "waiting",
    templatePath: "templates/waiting.handlebars",
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
        ctxt.success();
    }
});

screenTypes.screen = screenTypes.base.extend({
    type: "screen",
    templatePath: "templates/navbar.handlebars",
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
            prompt._render();
            if(!prompt.$el){
                console.error("render px: " + that.promptIdx + 
                    " Prompts must have synchronous render functions. " +
                    "Don't debounce them or launch async calls before el is set.");
                console.error(prompt);
                alert("Sub-prompt has not been rendered. See console for details.");
            }
            $container.append(prompt.$el);
        });
        ctxt.success();
    }
});

screenTypes.columns_2 = screenTypes.base.extend({
    type: "columns_2",
    templatePath: "templates/navbar.handlebars",
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

        // Create columns
        var grid = $('<div class="ui-grid-a">');
        var col_a = $('<div class="ui-block-a">');
        var col_b = $('<div class="ui-block-b">');

        $.each(that.activePrompts, function(idx, prompt){
            prompt._render();
            if(!prompt.$el){
                console.error("render px: " + that.promptIdx + 
                    " Prompts must have synchronous render functions. " +
                    "Don't debounce them or launch async calls before el is set.");
                console.error(prompt);
                alert("Sub-prompt has not been rendered. See console for details.");
            }

            // Append element to appropriate column
            if (prompt.screen_column === 2) {
                col_b.append(prompt.$el);
            } 
            else {
                col_a.append(prompt.$el);
            }
        });
        
        grid.append(col_a);
        grid.append(col_b);
        $container.append(grid);

        ctxt.success();
    }
});

screenTypes.custom = screenTypes.base.extend({
    type: "custom",
    templatePath: "templates/custom_screen.handlebars",
    render: function(ctxt) {

        var that = this;

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

        $.each(that.activePrompts, function(idx, prompt){
            prompt._render();
            if(!prompt.$el){
                console.error("render px: " + that.promptIdx + 
                    " Prompts must have synchronous render functions. " +
                    "Don't debounce them or launch async calls before el is set.");
                console.error(prompt);
                alert("Sub-prompt has not been rendered. See console for details.");
            }

        });

        
        that.$('.odk-container').find("div").each(function() {
            var t = this;
            var text = $(t).attr('field-name');
            for (var i = 0; i < that.activePrompts.length; i++) {
                var prompt = that.activePrompts[i];
                if (prompt.name == text) {
                    if (prompt.$el) {
                        $(t).html((prompt.$el).wrap("<div></div>"));
                    }
                    break;
                }
            }
            
         });
         
        ctxt.success();
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        if ( that.activePrompts.length == 0 ) {
            ctxt.log('D','configureRenderContext.noActivePrompts.success');
            ctxt.success();
        } else {
            var onceCtxt = $.extend({}, ctxt, {
                success:_.after(that.activePrompts.length, function() {
                    ctxt.log('D','configureRenderContext.onceCtxt.success');
                    ctxt.success();
                }),
                failure: _.once(function(m) {
                    ctxt.log('D','configureRenderContext.onceCtxt.failure');
                    ctxt.failure(m);
                })
            });
            try {
                // We do not support dependent default values within screen groups.
                // If we are to do so, we will need to add code here to ensure
                // their on activate functions are called in the right order.
                _.each(that.activePrompts, function(prompt){
                    prompt.buildRenderContext(onceCtxt);
                });
                that._renderContext.prompts = that.activePrompts;
            } catch (ex) {
                ctxt.log('E','screen.configureRenderContext.exception', 
                    "exception: " + ex.message + " stack: " + ex.stack );
                ctxt.failure({message: "Exception while initializing screen: " + ex.message});
            }
        }
    }
});

return screenTypes;
});
