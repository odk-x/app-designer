'use strict';
/**
 * NOTE: builder.js sets controller.prompts property.
 *
 * Manages the execution state and page history of the overall survey, 
 * including form validation, saving and marking the form as 'complete'.
 *
 * Delegates the display of individual prompts to the screenManager. 
 * Delegates the evaluation of individual constraints, etc. to the prompts.
 *
 */
define(['screenManager','opendatakit','database', 'jquery'],
function(ScreenManager,  opendatakit,  database,   $) {
window.controller = {
    eventCount: 0,
    screenManager : null,
    currentPromptIdx : -1,
    prompts : [],
    calcs: [],
    beforeMove: function(ctxt){
        ctxt.append('controller.beforeMove');
        var that = this;
        var prompt = null;
        if ( this.currentPromptIdx != -1 ) {
            prompt = this.prompts[this.currentPromptIdx];
        }
        try {
            if ( prompt != null ) {
                prompt.beforeMove(ctxt);
            } else {
                ctxt.success();
            }
        } catch(ex) {
            var e = (ex != null) ? ex.message + " stack: " + ex.stack : "undef";
            console.error("controller.beforeMove: Exception: " + e);
            ctxt.append('controller.beforeMove.exception', e );
            ctxt.failure({message: "Exception while advancing to next prompt."});
        }
    },
    validate: function(ctxt){
        ctxt.append('controller.validate');
        var that = this;
        var prompt;
        if ( this.currentPromptIdx != -1 ) {
            prompt = this.prompts[this.currentPromptIdx];
        }
        try {
            if ( prompt ) {
                prompt.validate(ctxt);
            } else {
                ctxt.success();
            }
        } catch(ex) {
            var e = (ex != null) ? ex.message  + " stack: " + ex.stack : "undef";
            console.error("controller.validate: Exception: " + e + " px: " + this.currentPromptIdx);
            ctxt.append('controller.validate.exception', e + " px: " + this.currentPromptIdx );
            ctxt.failure({message: "Exception occurred while evaluating constraints"});
        }
    },
    gotoPreviousScreen: function(ctxt){
        var that = this;
        ctxt.append('controller:gotPreviousScreen');
        that.beforeMove($.extend({}, ctxt,{
            success: function() {
                ctxt.append("gotoPreviousScreen.beforeMove.success", "px: " +  that.currentPromptIdx);
                while (that.hasPromptHistory()) {
                    ctxt.append("gotoPreviousScreen.beforeMove.success.hasPromptHistory", "px: " +  that.currentPromptIdx);
                    var prmpt = that.getPromptByName(that.popPromptHistory(), {reverse:true});
                    var t = prmpt.type;
                    if ( t == "goto_if" || t == "goto" || t == "label" || t == "calculate" ) {
                        ctxt.append("gotoPreviousScreen.beforeMove.success.hasPromptHistory.invalid", "px: " +  prmpt.currentPromptIdx);
                        console.error("Invalid previous prompt type px: " +  prmpt.currentPromptIdx);
                        continue; // attempt to recover...
                    }
                    // todo -- change to use hash?
                    that.setPrompt(ctxt, prmpt, {omitPushOnReturnStack:true, reverse:true});
                    return;
                }
                ctxt.append("gotoPreviousScreen.beforeMove.success.noPreviousPage");
                // display the 'no previous prompt' screen message.
                // then transition to the start of the form.
                that.screenManager.noPreviousPage($.extend({}, ctxt,{
                                        success: function() {
                                            // pop ctxt
                                            ctxt.append("gotoPreviousScreen.noPrompts");
                                            that.gotoRef($.extend({},ctxt,{
                                                success:function() {
                                                    ctxt.failure({message: "Returning to start of form."});
                                                }}),"0");
                                        }}));
            },
            failure: function(m) {
                ctxt.append("gotoPreviousScreen.beforeMove.failure", "px: " +  that.currentPromptIdx);
                // should stay on this screen...
                if ( that.screenManager != null ) {
                    that.screenManager.unexpectedError($.extend({},ctxt,{
                        success:function() {
                            ctxt.failure(m); 
                        }}), "beforeMove");
                } else {
                    ctxt.failure(m);
                }
            }
        }));
    },
    /**
     * If 'prompt' is a label or goto, advance through the 
     * business logic until it is resolved to a renderable screen prompt.
     *
     * return that renderable screen prompt.
     */
    advanceToScreenPromptHelper: function(ctxt, prompt) {
        var nextPrompt = null;
        var that = this;
        try {
            // ***The order of the else-if statements below is very important.***
            // i.e., First test if the 'condition' is false, and skip to the next 
            // question if it is; if the 'condition' is true or not present, then 
            // execute the 'goto'
            if ( prompt.type == "label" ) {
                nextPrompt = that.getPromptByName(prompt.promptIdx + 1);
            } else if('condition' in prompt && !prompt.condition()) {
                nextPrompt = that.getPromptByName(prompt.promptIdx + 1);
            } else if ( prompt.type == "goto" ) {
                nextPrompt = that.getPromptByLabel(prompt.param);
            } else if( prompt.type == "error" ) {
                if('condition' in prompt && prompt.condition()) {
                    alert("Error prompt triggered.");
                    that.fatalError(ctxt);
                    return; // this directs the user to the _stop_survey page.
                }
            }
        } catch (e) {
            console.error("controller.advanceToScreenPromptHelper.exception.strict px: " +
                            that.promptIdx + ' exception: ' + String(e));
            ctxt.failure({message: "Error in condition expression. See console log."});
            return;
            /*
            if ( ctxt.strict ) {
                console.error("controller.advanceToScreenPromptHelper.exception.strict px: " +
                                that.promptIdx + ' exception: ' + String(e));
                ctxt.failure({message: "Exception while evaluating condition() expression. See console log."});
                return;
            } else {
                console.log("controller.advanceToScreenPromptHelper.exception.ignored px: " +
                                that.promptIdx + ' exception: ' + String(e));
                ctxt.append("controller.advanceToScreenPromptHelper.exception.ignored", String(e));
                nextPrompt = that.getPromptByName(prompt.promptIdx + 1);
            }
            */
        }
        
        if(nextPrompt) {
            that.advanceToScreenPromptHelper(ctxt, nextPrompt);
        } else {
            ctxt.success(prompt);
        }
    },
    advanceToScreenPrompt: function(ctxt, prompt) {
        try {
            return this.advanceToScreenPromptHelper(ctxt, prompt);
        } catch (e) {
            console.error("controller.advanceToScreenPrompt.exception: " + String(e));
            ctxt.failure({
                message: "Possible goto loop."
            });
        }
    },
    validateQuestionHelper: function(ctxt, promptCandidate, stopAtPromptIdx) {
        var that = this;
        return function() {
            try {
                // pass in 'render':false to indicate that rendering will not occur.
                // call onActivate() to ensure that we have values (assignTo) initialized for validate()
                promptCandidate.onActivate( $.extend({render: false}, ctxt, {
                    success: function(renderContext) {
                        promptCandidate.validate( $.extend({}, ctxt, {
                            success: function() {
                                if ( promptCandidate.type == 'finalize' ) {
                                    ctxt.append("validateQuestionHelper.advanceToScreenPrompt.success.atFinalize", "px: " + promptCandidate.promptIdx + " nextPx: no prompt!");
                                    ctxt.success();
                                } else {
                                    var nextPrompt = that.getPromptByName(promptCandidate.promptIdx + 1);
                                    that.advanceToScreenPrompt($.extend({}, ctxt, {
                                        success: function(prompt){
                                            if(prompt && (prompt.promptIdx != stopAtPromptIdx)) {
                                                ctxt.append("validateQuestionHelper.advanceToScreenPrompt.success", "px: " + promptCandidate.promptIdx + " nextPx: " + prompt.promptIdx);
                                                var fn = that.validateQuestionHelper(ctxt,prompt,stopAtPromptIdx);
                                                (fn)();
                                            } else {
                                                if ( !prompt ) {
                                                    ctxt.append("validateQuestionHelper.advanceToScreenPrompt.success.noPrompt", "px: " + promptCandidate.promptIdx + " nextPx: no prompt!");
                                                }
                                                ctxt.success();
                                            }
                                        },
                                        failure: function(m) {
                                            ctxt.append("validateQuestionHelper.advanceToScreenPrompt.failure", "px: " + promptCandidate.promptIdx);
                                            that.setPrompt( $.extend({}, ctxt, {
                                                success: function() {
                                                    setTimeout(function() {
                                                        ctxt.append("validateQuestionHelper.advanceToScreenPrompt.failure.setPrompt.setTimeout", "px: " + that.currentPromptIdx);
                                                        ctxt.failure(m);
                                                        }, 500);
                                                }}), nextPrompt);
                                        }}), nextPrompt);
                                }
                            },
                            failure: function(msg) {
                                ctxt.append("validateQuestionHelper.validate.failure", "px: " + promptCandidate.promptIdx);
                                that.setPrompt( $.extend({}, ctxt, {
                                    success: function() {
                                        var simpleCtxt = $.extend({}, ctxt, {
                                            success: function() {
                                                // should never get here...
                                                ctxt.append("validateQuestionHelper.validate.failure.setPrompt.validate", "px: " + promptCandidate.promptIdx);
                                                ctxt.failure({message: "Internal error - Unexpected execution path."});
                                            }});
                                        setTimeout(function() {
                                            simpleCtxt.append("validateQuestionHelper.validate.failure.setPrompt.setTimeout", "px: " + that.currentPromptIdx);
                                            that.validate( simpleCtxt );
                                            }, 500);
                                    }}), promptCandidate);
                            }}));
                    }}) );
            } catch(e) {
                ctxt.append("validateQuestionHelper.validate.exception", "px: " + promptCandidate.promptIdx + " exception: " + e);
                that.setPrompt( $.extend({}, ctxt, {
                    success: function() {
                        var simpleCtxt = $.extend({}, ctxt, {
                            success: function() {
                                // should never get here...
                                ctxt.append("validateQuestionHelper.validate.exception.setPrompt.validate", "px: " + promptCandidate.promptIdx);
                                ctxt.failure({message: "Internal error - Unexpected execution path."});
                            }});
                        setTimeout(function() {
                            simpleCtxt.append("validateQuestionHelper.validate.failure.setPrompt.setTimeout", "px: " + that.currentPromptIdx);
                            that.validate( simpleCtxt );
                            }, 500);
                    }}), promptCandidate);
            }
        };
    },
    validateAllQuestions: function(ctxt, stopAtPromptIdx){
        var that = this;
        var promptCandidate = that.prompts[0];
        // set the 'strict' attribute on the context to report all 
        // formula exceptions and errors.
        var oldvalue = ctxt.strict;
        ctxt.strict = true;
        // ensure we drop the spinner overlay when we complete...
        var newctxt = $.extend({},ctxt,{
            success: function() {
                ctxt.append("validateQuestionHelper.advanceToScreenPrompt.success.noPrompt", "px: " + promptCandidate.promptIdx + " nextPx: no prompt!");
                that.screenManager.hideSpinnerOverlay();
                ctxt.strict = oldvalue;
                ctxt.success();
            },
            failure: function(m) {
                that.screenManager.hideSpinnerOverlay();
                if ( m && m.message ) {
                    that.screenManager.showScreenPopup(m);
                }
                ctxt.strict = oldvalue;
                ctxt.failure(m);
            }});
        that.screenManager.showSpinnerOverlay({text:"Validating..."});
        
        // call advanceToScreenPrompt, since prompt[0] is always a goto_if...
        that.advanceToScreenPrompt($.extend({},newctxt, {
            success: function(prompt) {
                if(prompt && (prompt.promptIdx != stopAtPromptIdx)) {
                    newctxt.append("validateAllQuestions.advanceToScreenPrompt.success", "px: " + promptCandidate.promptIdx + " nextPx: " + prompt.promptIdx);
                    var fn = that.validateQuestionHelper(newctxt,prompt,stopAtPromptIdx);
                    (fn)();
                } else {
                    if ( !prompt ) {
                        newctxt.append("validateAllQuestions.advanceToScreenPrompt.success.noPrompt", "px: " + promptCandidate.promptIdx + " nextPx: no prompt!");
                    }
                    newctxt.success();
                }
            },
            failure: function(m) {
                newctxt.append("validateAllQuestions.advanceToScreenPrompt.failure", "px: " + promptCandidate.promptIdx);
                that.setPrompt( $.extend({}, newctxt, {
                    success: function() {
                        setTimeout(function() {
                            newctxt.append("validateAllQuestions.advanceToScreenPrompt.failure.setPrompt.setTimeout", "px: " + that.currentPromptIdx);
                            newctxt.failure(m);
                            }, 500);
                    }}), promptCandidate);
            }}), promptCandidate);
    },
    gotoNextScreen: function(ctxt, options){
        var that = this;
        that.beforeMove($.extend({}, ctxt,
            { success: function() {
                ctxt.append("gotoNextScreen.beforeMove.success", "px: " +  that.currentPromptIdx);
                // we are ready for move -- validate...
                that.validate( $.extend({}, ctxt, {
                    success: function() {
                        ctxt.append("gotoNextScreen.validate.success", "px: " +  that.currentPromptIdx);
                        // navigate through all gotos, goto_ifs and labels.
                        var promptCandidate = null;
                        if ( that.currentPromptIdx >= 0 ) {
                            promptCandidate = that.getPromptByName(that.currentPromptIdx + 1);
                        } else {
                            promptCandidate = that.prompts[0];
                        }

                        // abort and display error if we don't have any prompts...
                        if ( promptCandidate == null ) {
                            that.screenManager.noNextPage($.extend({}, ctxt,{
                                        success: function() {
                                            ctxt.append("gotoNextScreen.noPrompts");
                                            that.gotoRef($.extend({},ctxt,{
                                                success:function(){
                                                    ctxt.failure({message: "Returning to start of form."});
                                                }}),"0");
                                        }}));
                            return;
                        }
                        
                        that.advanceToScreenPrompt($.extend({}, ctxt, {
                            success: function(prompt){
                                if(prompt) {
                                    ctxt.append("gotoNextScreen.advanceToScreenPrompt.success", "px: " + that.currentPromptIdx + " nextPx: " + prompt.promptIdx);
                                    // todo -- change to use hash?
                                    that.setPrompt(ctxt, prompt, options);
                                } else {
                                    ctxt.append("gotoNextScreen.advanceToScreenPrompt.success", "px: " + that.currentPromptIdx + " nextPx: no prompt!");
                                    that.screenManager.noNextPage($.extend({}, ctxt,{
                                            success: function() {
                                                ctxt.append("gotoNextScreen.noPrompts");
                                                that.gotoRef(ctxt,"0");
                                            }}));
                                }
                        },
                        failure: function(m) {
                            ctxt.append("gotoNextScreen.advanceToScreenPrompt.failure", "px: " +  that.currentPromptIdx);
                            that.screenManager.showScreenPopup(m); 
                            ctxt.failure(m);
                        }}), promptCandidate);
                    },
                    failure: function(m) {
                        ctxt.append("gotoNextScreen.validate.failure", "px: " +  that.currentPromptIdx);
                        that.screenManager.showScreenPopup(m); 
                        ctxt.failure(m);
                    }
                }));
            },
            failure: function(m) {
                ctxt.append("gotoNextScreen.beforeMove.failure", "px: " +  that.currentPromptIdx);
                if ( that.screenManager != null ) {
                    that.screenManager.unexpectedError($.extend({},ctxt,{
                        success:function() {
                            ctxt.failure(m); 
                        }}), "beforeMove");
                } else {
                    ctxt.failure(m);
                }
            }
        }));
    },
    getPromptByName: function(name){
        if ( name == null ) {
            return null;
        }
        if ( ('' + name).match(/^\d+$/g) ) {
            var idx = Number(name);
            if(idx >= 0 && idx < this.prompts.length){
                return this.prompts[idx];
            }
        }
        for(var i = 0; i < this.prompts.length; i++){
            var promptName = this.prompts[i].name;
            if(promptName == name){
                return this.prompts[i];
            }
        }
        alert("Unable to find screen: " + name);
        return null;
    },
    getPromptByLabel: function(name){
        var prompts = this.prompts;
        for(var i = 0; i < prompts.length; i++){
            if(prompts[i].type !== 'label') {
                continue;
            }
            if(prompts[i].param === name){
                return prompts[i];
            }
        }
        alert("Unable to find label: " + name);
        return null;
    },
    setPrompt: function(ctxt, prompt, passedInOptions){
        var that = this;
        var options;
        ctxt.append('controller.setPrompt', "nextPx: " + prompt.promptIdx);

        if ( this.currentPromptIdx == prompt.promptIdx ) {
            if ( passedInOptions == null || !passedInOptions.changeLocale) {
                ctxt.append('controller.setPrompt:ignored', "nextPx: " + prompt.promptIdx);
                ctxt.success();
                return;
            } else {
                options = {
                    omitPushOnReturnStack : true
                };
            }
        } else {
            options = {
                omitPushOnReturnStack : false
            };
        }
        
        if(passedInOptions){
            $.extend(options, passedInOptions);
        }
        if (!options.omitPushOnReturnStack) {
            if ( this.currentPromptIdx >= 0 && this.currentPromptIdx < this.prompts.length ) {
                this.pushPromptHistory(this.currentPromptIdx);
            }
        }
        this.currentPromptIdx = prompt.promptIdx;
        this.screenManager.setPrompt($.extend({},ctxt,{
            success: function() {
                ctxt.success();
                // and flush any pending doAction callback
                landing.setController(that);
            }}), prompt, options);
        // the prompt should never be changed at this point!!!
        if ( this.currentPromptIdx != prompt.promptIdx ) {
            console.error("controller.setPrompt: prompt index changed -- assumption violation!!!");
            ctxt.failure({message: "Internal error - unexpected change in prompt index!"});
            return;
        }
        var idx = this.currentPromptIdx;
        var newhash = opendatakit.getHashString(opendatakit.getCurrentFormPath(), opendatakit.getCurrentInstanceId(), ''+idx);
        if ( newhash != window.location.hash ) {
            window.location.hash = newhash;
        }
    },
    /*
     * Callback interface from ODK Survey (or other container apps) into javascript.
     * Handles all dispatching back into javascript from external intents
    */
    opendatakitCallback:function(promptPath, internalPromptContext, action, jsonString) {
        var ctxt = this.newCallbackContext();
        ctxt.append('controller.opendatakitCallback', ((this.currentPromptIdx != null) ? ("px: " + this.currentPromptIdx) : "no current prompt"));
        
        // promptPath is a dot-separated list. The first element of 
        // which is the index of the prompt in the global prompts list.
        var promptPathParts = promptPath.split('.');
        var selpage = this.getPromptByName(promptPathParts[0]);
        if ( selpage == null ) {
            ctxt.append('controller.opendatakitCallback.noMatchingPrompt', promptPath);
            console.error("opendatakitCallback: ERROR - PAGE NOT FOUND! " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action );
            ctxt.failure({message: "Internal error. Unable to locate matching prompt for callback."});
            return;
        }
        
        try {
            // ask this page to then get the appropriate handler
            var handler = selpage.getCallback(promptPath, internalPromptContext, action);
            if ( handler != null ) {
                handler( ctxt, internalPromptContext, action, jsonString );
            } else {
                ctxt.append('controller.opendatakitCallback.noHandler', promptPath);
                console.error("opendatakitCallback: ERROR - NO HANDLER ON PAGE! " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action );
                ctxt.failure({message: "Internal error. No matching handler for callback."});
                return;
            }
        } catch (e) {
            ctxt.append('controller.opendatakitCallback.exception', promptPath, e);
            console.error("opendatakitCallback: EXCEPTION ON PAGE! " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action + " exception: " + e);
            ctxt.failure({message: "Internal error. Exception while handling callback."});
            return;
        }
    },
    opendatakitGotoPreviousScreen:function() {
        var ctxt = controller.newCallbackContext();
        ctxt.append("controller.opendatakitGotoPreviousScreen", this.currentPromptIdx);
        this.screenManager.gotoPreviousScreenAction(ctxt);
    },
    opendatakitIgnoreAllChanges:function() {
        var ctxt = controller.newCallbackContext();
        ctxt.append("controller.opendatakitIgnoreAllChanges", this.currentPromptIdx);
        if ( opendatakit.getCurrentInstanceId() == null ) {
            shim.ignoreAllChangesFailed( opendatakit.getSettingValue('form_id'), null );
            ctxt.failure({message: "No instance selected."});
        } else {
            this.ignoreAllChanges($.extend({},ctxt,{success:function() {
                                shim.ignoreAllChangesCompleted( opendatakit.getSettingValue('form_id'), opendatakit.getCurrentInstanceId());
                                ctxt.success();
                            }, failure:function(m) {
                                shim.ignoreAllChangesFailed( opendatakit.getSettingValue('form_id'), opendatakit.getCurrentInstanceId());
                                ctxt.failure(m);
                            }}));
        }
    },
    ignoreAllChanges:function(ctxt) {
        database.ignore_all_changes(ctxt);
    },
    opendatakitSaveAllChanges:function(asComplete) {
        var that = this;
        var ctxt = controller.newCallbackContext();
        ctxt.append("controller.opendatakitSaveAllChanges", this.currentPromptIdx);
        if ( opendatakit.getCurrentInstanceId() == null ) {
            shim.saveAllChangesFailed( opendatakit.getSettingValue('form_id'), null );
            ctxt.failure({message: "No instance selected."});
        } else {
            this.saveAllChanges(ctxt, asComplete);
        }
    },
   saveAllChanges:function(ctxt, asComplete) {
        var that = this;
        // NOTE: only success is reported up to shim here.
        // if there are any failures, the failure callback is only invoked if the save request
        // was initiated from within shim (via controller.opendatakitSaveAllChanges(), above).
        if ( asComplete ) {
            database.save_all_changes($.extend({},ctxt,{
                success:function(){
                    that.validateAllQuestions($.extend({},ctxt,{
                        success:function(){
                            database.save_all_changes($.extend({},ctxt,{
                                success:function() {
                                    shim.saveAllChangesCompleted( opendatakit.getSettingValue('form_id'), opendatakit.getCurrentInstanceId(), true);
                                    ctxt.success();
                                },
                                failure:function(m) {
                                    shim.saveAllChangesFailed( opendatakit.getSettingValue('form_id'), opendatakit.getCurrentInstanceId(), true);
                                    ctxt.failure(m);
                                }}), true);
                        }}));
                }}), false);
        } else {
            database.save_all_changes($.extend({},ctxt,{
                success:function() {
                    shim.saveAllChangesCompleted( opendatakit.getSettingValue('form_id'), opendatakit.getCurrentInstanceId(), false);
                    ctxt.success();
                }}), false);
        }
    },
    // return to the main screen (showing the available instances) for this form.
    leaveInstance:function(ctxt) {
        var newhash = opendatakit.getHashString(opendatakit.getCurrentFormPath(), null, null);
        window.location.hash = newhash;
        ctxt.success();
    },
    gotoRef:function(ctxt, pageRef) {
        var that = this;
        if ( this.prompts.length == 0 ) {
            console.error("controller.gotoRef: No prompts registered in controller!");
            ctxt.failure({message: "Internal error. No prompts registered in controller!"});
            return;
        }
        if ( pageRef == null ) {
            pageRef = '0';
        }
        // process the pageRef... -- each part is separated by slashes
        var hlist = pageRef.split('/');
        var hleading = hlist[0];

        var promptCandidate; 
        if ( hleading != null ) {
            promptCandidate = this.getPromptByName(hleading);
            if ( promptCandidate == null ) {
                promptCandidate = this.prompts[0];
                hlist = [];
            }
        } else {
            promptCandidate = this.prompts[0];
            hlist = [];
        }
        
        if ( promptCandidate == null ) {
            ctxt.failure({message: "Requested prompt not found."});
            return;
        }
        
        this.advanceToScreenPrompt($.extend({}, ctxt, {
            success:function(prompt){
                if ( prompt == null ) {
                    ctxt.append('controller.gotoRef', "no prompt after advance");
                    ctxt.failure({message: "No next prompt."});
                    return;
                }
                that.setPrompt(ctxt, prompt, { hlist : hlist });
            }}), promptCandidate);
        
    },
    hasPromptHistory: function() {
        return shim.hasPromptHistory();
    },
    clearPromptHistory: function() {
		shim.clearPromptHistory();
    },
	popPromptHistory: function() {
		return shim.popPromptHistory();
	},
	pushPromptHistory: function(idx) {
		shim.pushPromptHistory(idx);
	},
    reset: function(ctxt,sameForm) {
        // NOTE: the ctxt calls here are synchronous actions
        // ctxt is only passed in for logging purposes.
        ctxt.append('controller.reset');
        this.clearPromptHistory();
        this.currentPromptIdx = -1;
        if ( !sameForm ) {
            this.prompts = [];
            this.calcs = [];
        }
        if ( this.screenManager != null ) {
            // this asynchronously calls ctxt.success()...
            this.screenManager.cleanUpScreenManager(ctxt);
        } else {
            ctxt.append('controller.reset.newScreenManager');
            this.screenManager = new ScreenManager({controller: this});
            // and execute an async callback to continue the reset
            // this maintains the same async sequencing as the 
            // more common non-null case above.
            setTimeout(function() {
                ctxt.success();
                }, 100);
        }
    },
    // fatalError -- it is OK for the ctxt argument to be undefined
    fatalError: function(ctxt) {
        if ( ctxt ) {
            ctxt._log('E','controller.fatalError: Aborting existing context');
        }
        var that = this;
        // create a new context...
        ctxt = controller.newFatalContext();
        //Stop the survey.
        var promptCandidate = that.getPromptByName("_stop_survey");
        that.setPrompt( $.extend({}, ctxt, {failure: function(msg) {
                //There might be better ways to do it than this.
                ctxt.failure();
                alert('Unable to present Fatal Error screen');
            }}), promptCandidate, {
                    omitPushOnReturnStack : true,
                    transition: 'none' });
    },
    setLocale: function(ctxt, locale) {
        var that = this;
        database.setInstanceMetaData($.extend({}, ctxt, {
            success: function() {
                var prompt = that.getPromptByName(that.currentPromptIdx);
                that.setPrompt(ctxt, prompt, {changeLocale: true} );
            }
        }), 'locale', locale);
    },
    getFormLocales: function() {
        return opendatakit.getFormLocalesValue();
    },
  
    ///////////////////////////////////////////////////////
    // Logging context
    baseContext : {
        contextChain: [],
        
        append : function( method, detail ) {
			var now = new Date().getTime();
			this.contextChain.push( {method: method, timestamp: now, detail: detail } );
			// SpeedTracer Logging API
  		    var logger = window.console;
		    if (logger && logger.markTimeline) {
  			  logger.markTimeline(method);
		    }
        },
        
        success: function(){
            this._log('S', 'success!');
        },
        
        failure: function(m) {
            this._log('E', 'failure! ' + (( m != null && m.message != null) ? m.message : ""));
        },
        
        _log: function( severity, contextMsg ) {
            var flattened = "seqAtEnd: " + window.controller.eventCount;
            $.each( this.contextChain, function(index,value) {
                flattened += "\nmethod: " + value.method + " timestamp: " +
					value.timestamp + ((value.detail != null) ? " detail: " + value.detail : "");
            });
            shim.log(severity, contextMsg + " execution_chain: " + flattened);
        }
    },
    
    newCallbackContext : function( actionHandlers ) {
        this.eventCount = 1 + this.eventCount;
        var count = this.eventCount;
        var now = new Date().getTime();
        var detail =  "seq: " + count + " timestamp: " + now;
        var ctxt = $.extend({}, this.baseContext, {contextChain: []}, actionHandlers );
        ctxt.append('callback', detail);
        return ctxt;
    },
    newFatalContext : function( actionHandlers ) {
        this.eventCount = 1 + this.eventCount;
        var count = this.eventCount;
        var now = new Date().getTime();
        var detail =  "seq: " + count + " timestamp: " + now;
        var ctxt = $.extend({}, this.baseContext, {contextChain: []}, actionHandlers );
        ctxt.append('fatal_error', detail);
        return ctxt;
    },
    newStartContext: function( actionHandlers ) {
        this.eventCount = 1 + this.eventCount;
        var count = this.eventCount;
        var now = new Date().getTime();
        var detail =  "seq: " + count + " timestamp: " + now;
        var ctxt = $.extend({}, this.baseContext, {contextChain: []}, actionHandlers );
        ctxt.append('startup', detail);
        return ctxt;
    },
    newContext: function( evt, actionHandlers ) {
        this.eventCount = 1 + this.eventCount;
        var count = this.eventCount;
        var detail =  "seq: " + count + " timestamp: " + evt.timeStamp + " guid: " + evt.handleObj.guid;
        var evtActual;
        var evtTarget;
        if ( 'currentTarget' in evt ) {
            detail += ' curTgt: ';
            evtActual = evt.currentTarget;
        } else {
            detail += ' tgt: ';
            evtActual = evt.target;
        }
        
        if ( evtActual == window) {
            detail += 'Window';
        } else {
            evtTarget = ('innerHTML' in evtActual) ? evtActual.innerHTML : evtActual.activeElement.innerHTML;
            detail += evtTarget.replace(/\s+/g, ' ').substring(0,80);
        }
        
        var ctxt = $.extend({}, this.baseContext, {contextChain: []}, actionHandlers );
        ctxt.append( evt.type, detail);
        return ctxt;
    }
};
return window.controller;
});