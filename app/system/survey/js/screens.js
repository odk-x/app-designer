/**
* circular dependency:
*
* Responsibilities:
*    Performs the actions necessary to make a prompt visible on the screen (setScreen).
*    Receives click and swipe events for navigating across pages.
*    Displays pop-up dialogs and toasts.
*    Displays the options dialog for changing languages and navigations.
*/
define(['screenTypes','opendatakit','controller','backbone','jquery','underscore','handlebars','handlebarsHelpers'],
function(screenTypes,  opendatakit,  controller,  Backbone,  $,       _,           Handlebars, _hh) {
/* global odkCommon */
'use strict';
verifyLoad('screens',
    ['screenTypes','opendatakit','controller','backbone','jquery','underscore','handlebars','handlebarsHelpers'],
    [screenTypes,   opendatakit,  controller,  Backbone,  $,       _,           Handlebars,  _hh]);

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
    horizontalFocusScrollPos: null,
    /**
     * DOM class for the pane holding horizonally-scrollable content
     */
    screenOverflowClass: null,
    pendingCtxt: [],
    initialize: function(args) {
        var that = this;
        $.extend(this, args);
    },
    getActivePrompts: function(context) {
        return this.activePrompts;
    },
    getScreenPath: function() {
        return this._section_name + '/' + this._op.operationIdx;
    },
    havePromptsOnScreenChanged: function(pIdx) {
        if (this._operation && this._operation._screen_block) {
            var toBeRenderedActivePromptsIdxs = [];
            // If assign is used, then the screen has to be rerendered
            // this is because the renderContext of the prompt within the assign
            // will not reflect the new value - so we need to rerender 
            var screenBlockString = String(this._operation._screen_block_orig);
            if (screenBlockString.indexOf('assign') !== -1) {
                return true;
            }
            toBeRenderedActivePromptsIdxs = this._operation._screen_block();

            if (this.activePrompts.length !== toBeRenderedActivePromptsIdxs.length) {
                return true;
            } else {
                var toBeRenderedActivePrompts = []
                var i = 0;
                for (i = 0; i < toBeRenderedActivePromptsIdxs.length; i++) {
                    if (this.activePrompts[i].promptIdx !== toBeRenderedActivePromptsIdxs[i]) {
                        // If prompt indices are out of order, redraw
                        return true;
                    } else {
                        // Now we need to check if other prompts on the screen
                        // need to rerender - if so then do a screen redraw
                        if (this.activePrompts[i].promptIdx !== pIdx) {

                            // current el of active prompt  
                            var currEl = this.activePrompts[i].$el
                            // Get the innerHTML if we can 
                            var currElString = null;
                            if (currEl.length > 0) {
                                currElString = currEl[0].innerHTML;
                            }

                            // what the el of the prompt will be 
                            var toBeDrawnEl = this.activePrompts[i].template(this.activePrompts[i].renderContext);

                            // Remove all spaces from both what is and what will be to get a valid comparison
                            var currElStringNoSpaces = (currElString !== null && currElString !== undefined) ? currElString.replace(/\s/g, '') : null;
                            var tbdString = (toBeDrawnEl !== null && toBeDrawnEl !== undefined) ? toBeDrawnEl.replace(/\s/g, '') : null;
                            
                            // If they are not equal redraw
                            if (currElStringNoSpaces !== tbdString) {
                                return true;
                            }
                        }
                    }
                }
                return false;        
            }
        } else {
            return true;
        }
        
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
        odkCommon.log("D","screens.reRender: called");
        that.debouncedReRender();
     },
    debouncedReRender: _.debounce(function() {
        var that = this;
        that.focusScrollPos = null;
        that.horizontalFocusScrollPos = null;
        that.$focusPromptTest = null;
        var ctxt = null;

        that.focusScrollPos = $(window).scrollTop();
        if ( that.screenOverflowClass ) {
            that.horizontalFocusScrollPos = $(that.screenOverflowClass).scrollLeft();
        }
        odkCommon.log("D","screens.reRender.debouncedReRender: focusScrollPos = " + that.focusScrollPos);
        odkCommon.log("D","screens.reRender.debouncedReRender: horizontalFocusScrollPos = " + that.horizontalFocusScrollPos);

        // Find the element in focus
        that.$focusPromptTest = $(':focus');
        if (that.$focusPromptTest.length === 0) {
            that.$focusPromptTest = null;
        }

        odkCommon.log("D","screens.reRender.debouncedReRender: pendingCtxtLength: " + that.pendingCtxt.length);
        if (that.pendingCtxt.length > 0) {
            // we should at least have one on the queue.
            // process the first queued action first
            ctxt = that.pendingCtxt.shift();
        } else {
            odkCommon.log("W","screens.reRender.debouncedReRender: no pendingCtxts!!!");
            return;
        }

        // and we want to then process all subsequent reRender requests that aren't the same as the one we already have...
        var nextCtxt;
        while (that.pendingCtxt.length > 0) {
            nextCtxt = that.pendingCtxt.shift();
            if ( nextCtxt !== ctxt ) {
                odkCommon.log("W","screens.reRender.debouncedReRender: chaining an extra pendingCtxt!!!");
                ctxt.setTerminalContext(nextCtxt);
            }
        }

        // and process the first reRender first...
        that._screenManager.refreshScreen(ctxt);
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
        if ( that.activePrompts.length === 0 ) {
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
                    if ( prompt === null || prompt === undefined ) {
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
            if ( beforeMoveError !== null && beforeMoveError !== undefined ) {
                break;
            }
        }

        if ( beforeMoveError === null || beforeMoveError === undefined )
        {
            if ( validateValues ) {
                var validateError;
                for ( i = 0; i < that.activePrompts.length; i++ )
                {
                    validateError = that.activePrompts[i]._isValid(isStrict);
                    if ( validateError !== null && validateError !== undefined ) {
                        break;
                    }
                }
                if ( validateError === null || validateError === undefined ) {
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
                if (success === null || success === undefined) {
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
            //that.$el.attr('data-theme', that._renderContext.dataTheme);
            //that.$el.attr('data-content-theme', that._renderContext.dataTheme);
            //that.$el.attr('data-role','page');
            that.$el.attr('class','odk-page');
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
            //that.$el.attr('data-theme', that._renderContext.dataTheme);
            //that.$el.attr('data-content-theme', that._renderContext.dataTheme);
            //that.$el.attr('data-role','page');
            that.$el.attr('class','odk-page');
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

        if ( that.screenOverflowClass ) {
            var screenOverflow = that.$(that.screenOverflowClass);
            if (screenOverflow.length > 0) {
                screenOverflow.css("overflow-x", "scroll");
            }
        }

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
            that.$el.attr('class','odk-page');
        } catch(e) {
            console.error("screens." + that.type + ".render.exception: " +
                            String(e) + ' px: ' + that.promptIdx);
            console.error(that);
            alert("Error in template.");
        }
        var $container = that.$('.odk-container');

        // Create columns
        var grid = $('<div class="row">');
        var col_a = $('<div class="col-xs-6">');
        var col_b = $('<div class="col-xs-6">');

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

        if ( that.screenOverflowClass ) {
            var screenOverflow = that.$(that.screenOverflowClass);
            if (screenOverflow.length > 0) {
                screenOverflow.css("overflow-x", "scroll");
            }
        }

        ctxt.success();
    }
});

screenTypes.custom = screenTypes.base.extend({
    type: "custom",
    screenOverflowClass: ".screen-overflow",
    templatePath: "templates/custom_screen.handlebars",
    current: 0,
    step: 100,
    maximum: 0,
    render: function(ctxt) {

        var that = this;

        try {
            var tmplt = that.template(that._renderContext);
            that.$el.html(tmplt);
            that.$el.attr('data-theme', that._renderContext.dataTheme);
            that.$el.attr('data-content-theme', that._renderContext.dataTheme);
            that.$el.attr('data-role','page');
            that.$el.attr('class','odk-page');
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
                if (prompt.name === text) {
                    if (prompt.$el) {
                        $(t).html((prompt.$el).wrap("<div></div>"));
                    }
                    break;
                }
            }

         });

        var screenOverflow = that.$(that.screenOverflowClass);
        if (screenOverflow.length > 0) {
            screenOverflow.css("overflow-x", "scroll");
        }

        ctxt.success();
    },
    afterRender: function() {
        var that = this;
        var setFocus = false;

        $.each(that.activePrompts, function(idx, prompt){
            prompt.afterRender();
        });

        if (that.$focusPromptTest !== null && that.$focusPromptTest !== undefined)
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

            if (setFocus === true) {
                odkCommon.log("D","screens.afterRender: focusElementString = " + focusElementString);
                $(focusElementString).focus();
            }
        }

        if (that.focusScrollPos !== null && that.focusScrollPos !== undefined) {
            $(window).scrollTop(that.focusScrollPos);
        }
        if (that.horizontalFocusScrollPos !== null && that.horizontalFocusScrollPos !== undefined) {
            that.$(that.screenOverflowClass).scrollLeft(that.horizontalFocusScrollPos);
        }
    },
    configureRenderContext: function(ctxt) {
        var that = this;
        if ( that.activePrompts.length === 0 ) {
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
