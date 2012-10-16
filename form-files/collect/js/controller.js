'use strict';
// depends upon: --
// NOTE: builder.js sets controller.prompts property.
define(['screenManager','opendatakit','database', 'jquery'],
function(ScreenManager,  opendatakit,  database, $) {
return {
    screenManager : null,
    currentPromptIdx : -1,
    prompts : [],
    calcs: [],
    previousScreenIndices : [],
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
            ctxt.failure();
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
            console.error("controller.validate: Exception: " + e );
            ctxt.append('controller.validate.exception', e );
            ctxt.failure();
        }
    },
    gotoPreviousScreen: function(ctxt){
        var that = this;
        ctxt.append('controller:gotPreviousScreen');
        that.beforeMove($.extend({}, ctxt,{
            success: function() {
                ctxt.append("gotoPreviousScreen.beforeMove.success", "px: " +  that.currentPromptIdx);
                while (that.hasPromptHistory(ctxt)) {
                    console.log("gotoPreviousScreen: poppreviousScreenNames ms: " + (+new Date()) + 
                                " page: " + that.currentPromptIdx);
                    var prmpt = that.getPromptByName(that.previousScreenIndices.pop(), {reverse:true});
                    var t = prmpt.type;
                    if ( t == "goto_if" || t == "goto" || t == "label" || t == "calculate" ) {
                        console.error("Invalid previous prompt type");
                        console.log(prmpt);
                    }
                    // todo -- change to use hash?
                    that.setPrompt(ctxt, prmpt, {omitPushOnReturnStack:true, reverse:true});
                    return;
                }
                ctxt.append("gotoPreviousScreen.beforeMove.success.noPreviousPage");
                that.screenManager.noPreviousPage($.extend({}, ctxt,{
                                        success: function() {
                                            // pop ctxt
                                            ctxt.append("gotoPreviousScreen.noPrompts");
                                            that.gotoRef($.extend({},ctxt,{success:function() { ctxt.failure();}}),"0");
                                        }}));
            },
            failure: function() {
                ctxt.append("gotoPreviousScreen.beforeMove.failure", "px: " +  that.currentPromptIdx);
                // should stay on this screen...
                if ( that.screenManager != null ) {
                    that.screenManager.unexpectedError($.extend({},ctxt,{success:function() { ctxt.failure(); }}), "beforeMove");
                } else {
                    ctxt.failure();
                }
            }
        }));
    },
    /**
     * If 'prompt' is a label, goto or goto_if, advance through the 
     * business logic until it is resolved to a renderable screen prompt.
     *
     * return that renderable screen prompt.
     */
    advanceToScreenPrompt: function(ctxt, prompt) {
        var nextPrompt = null;
        var that = this;

        // ***NOTE: goto_if is implemented as a 'condition' on the goto***
        // ***The order of the else-if statements below is very important.***
        // i.e., First test if the 'condition' is false, and skip to the next 
        // question if it is; if the 'condition' is true or not present, then 
        // execute the 'goto' I.e., the goto_if is equivalent to a goto with
        // a condition.
        if ( prompt.type == "label" ) {
            nextPrompt = that.getPromptByName(prompt.promptIdx + 1);
        } else if('condition' in prompt && !prompt.condition()) {
            nextPrompt = that.getPromptByName(prompt.promptIdx + 1);
        } else if ( prompt.type == "goto" || prompt.type == "goto_if" ) {
            nextPrompt = that.getPromptByLabel(prompt.param);
        }
        
        if(nextPrompt != null) {
            that.advanceToScreenPrompt(ctxt, nextPrompt);
        } else {
            ctxt.success(prompt);
        }
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
                                            that.gotoRef($.extend({},ctxt,{success:function(){ctxt.failure();}}),"0");
                                        }}));
                            return;
                        }
                        
                        that.advanceToScreenPrompt($.extend({}, ctxt, {
                            success: function(prompt){
                                if(prompt) {
                                    ctxt.append("gotoNextScreen.advanceToScreenPrompt.success", "px: " + that.currentPromptIdx + "nextPx: " + prompt.promptIdx);
                                    // todo -- change to use hash?
                                    that.setPrompt(ctxt, prompt, options);
                                } else {
                                    ctxt.append("gotoNextScreen.advanceToScreenPrompt.success", "px: " + that.currentPromptIdx + "nextPx: no prompt!");
                                    that.screenManager.noNextPage($.extend({}, ctxt,{
                                            success: function() {
                                                ctxt.append("gotoNextScreen.noPrompts");
                                                that.gotoRef(ctxt,"0");
                                            }}));
                                }
                        }}), promptCandidate);
                    },
                    failure: function() {
                        ctxt.append("gotoNextScreen.validate.failure", "px: " +  that.currentPromptIdx);

                        /*
                        //Crude implementation of validation toasts.
                        //The prompt needs more control over this so the constraint_message is only shown
                        //for constraint violations, and other messages are used for required fields etc.
                        $.mobile.loading( 'show' , {
                            text: that.getPromptByName(that.currentPromptIdx).constraint_message,
                            textVisible: true,
                            textonly: true,
                            theme: 'a'
                        });
                        //Fading might be a bad idea. I don't know how it will perform in general.
                        $('.ui-loader').fadeIn(200, function(){
                            $('.ui-loader').delay(500).fadeOut(200, function(){
                                $.mobile.loading( 'hide' );
                            });
                        });
                        */
                        ctxt.failure();
                    }
                }));
            },
            failure: function() {
                ctxt.append("gotoNextScreen.beforeMove.failure", "px: " +  that.currentPromptIdx);
                if ( that.screenManager != null ) {
                    that.screenManager.unexpectedError($.extend({},ctxt,{success:function() { ctxt.failure(); }}), "beforeMove");
                } else {
                    ctxt.failure();
                }
            }
        }));
    },
    getPromptByName: function(name){
        if ( name == null ) return null;
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
            if(prompts[i].type !== 'label') continue;
            if(prompts[i].param === name){
                return prompts[i];
            }
        }
        alert("Unable to find label: " + name);
        return null;
    },
    setPrompt: function(ctxt, prompt, passedInOptions){
        if ( this.currentPromptIdx == prompt.promptIdx ) {
            ctxt.append('controller.setPrompt:ignored', "nextPx: " + prompt.promptIdx);
            return;
        }
        ctxt.append('controller.setPrompt', "nextPx: " + prompt.promptIdx);

        var options = {
            omitPushOnReturnStack : false
        };
        
        if(passedInOptions){
            $.extend(options, passedInOptions);
        }
        if (!options.omitPushOnReturnStack) {
            if ( this.currentPromptIdx >= 0 && this.currentPromptIdx < this.prompts.length ) {
                this.previousScreenIndices.push(this.currentPromptIdx);
            }
        }
        this.currentPromptIdx = prompt.promptIdx;
        this.screenManager.setPrompt(ctxt, prompt, options);
        // the prompt should never be changed at this point!!!
        if ( this.currentPromptIdx != prompt.promptIdx ) {
            ctxt.log('assumption violation');
            console.error("controller.setPrompt: prompt index changed -- assumption violation!!!");
            alert("controller.setPrompt: should never get here");
        }
        var idx = this.currentPromptIdx;
        var newhash = opendatakit.getHashString(database.getMetaDataValue('formPath'),
                    database.getMetaDataValue('instanceId'), ''+idx);
        if ( newhash != window.location.hash ) {
            window.location.hash = newhash;
        }
    },
    /*
     * Callback interface from ODK Collect into javascript.
     * Handles all dispatching back into javascript from external intents
    */
    opendatakitCallback:function(page, path, action, jsonString) {
        var ctxt = this.newCallbackContext();
        ctxt.append('controller.opendatakitCallback', ((this.prompt != null) ? ("px: " + this.prompt.promptIdx) : "no current prompt"));
        
        var selpage = this.getPromptByName(page);
        if ( selpage == null ) {
            ctxt.append('controller.opendatakitCallback.noMatchingPrompt', page);
            console.log("opendatakitCallback: ERROR - PAGE NOT FOUND! " + page + " path: " + path + " action: " + action );
            return;
        }
        
        var handler = selpage.getCallback(ctxt, path, action);
        if ( handler != null ) {
            handler( ctxt, path, action, jsonString );
        } else {
            ctxt.append('controller.opendatakitCallback.noHandler', page);
            console.log("opendatakitCallback: ERROR - NO HANDLER ON PAGE! " + page + " path: " + path + " action: " + action );
            return;
        }
    },
    gotoRef:function(ctxt, pageRef) {
        var that = this;
        if ( this.prompts.length == 0 ) {
            console.error("controller.gotoRef: No prompts registered in controller!");
            alert("controller.gotoRef: No prompts registered in controller!");
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
            alert("controller.gotoRef: null prompt after resolution!");
            return;
        }
        
        this.advanceToScreenPrompt($.extend({}, ctxt, {success:function(prompt){
            if ( prompt == null ) {
                ctxt.append('controller.gotoRef', "no prompt after advance");
                alert("controller.gotoRef: null prompt after advanceToScreenPrompt!");
                ctxt.failure();
                return;
            }
    
            that.setPrompt(ctxt, prompt, { hlist : hlist });
        }}), promptCandidate);
        
    },
    hasPromptHistory: function(ctxt) {
        return (this.previousScreenIndices.length !== 0);
    },
    clearPromptHistory: function(ctxt) {
        this.previousScreenIndices.length = 0;
    },
    reset: function(ctxt,sameForm) {
        ctxt.append('controller.reset');
        this.clearPromptHistory(ctxt);
        if ( this.screenManager != null ) {
            this.screenManager.cleanUpScreenManager(ctxt);
        } else {
            ctxt.append('controller.reset.newScreenManager');
            this.screenManager = new ScreenManager({controller: this});
        }
        this.currentPromptIdx = -1;
        if ( !sameForm ) {
            this.prompts = [];
            this.calcs = [];
        }
    },
    
    baseContext : {
        contextChain: [],
        
        append : function( method, detail ) {
            this.contextChain.push( {method: method, detail: detail} );
        },
        
        success: function(){
            this.log('success!');
        },
        
        failure: function() {
            this.log('failure!');
        },
        
        log: function( contextMsg ) {
            var flattened;
            $.each( this.contextChain, function(index,value) {
                flattened += "\nmethod: " + value.method + ((value.detail != null) ? " detail: " + value.detail : "");
            });
            console.log(contextMsg + " execution_chain: " + flattened);
        }
    },
    
    newCallbackContext : function( actionHandlers ) {
        var ctxt = $.extend({}, this.baseContext, {contextChain: []}, actionHandlers );
        ctxt.append('callback');
        return ctxt;
    },
    
    newContext : function(evt, actionHandlers ) {
        var detail =  "timestamp: " + evt.timeStamp + " guid: " + evt.handleObj.guid +
                      (('currentTarget' in evt) ? ((evt.currentTarget === window) ? ("curTgt: Window") 
                                                : (" curTgt: " + (('innerHTML' in evt.currentTarget) ?
                                                        evt.currentTarget.innerHTML :
                                                        evt.currentTarget.activeElement.innerHTML )).replace(/\s+/g, ' ').substring(0,80)) 
                      : ((evt.target === window) ? ("tgt: Window") 
                                                : (" tgt: " + (('innerHTML' in evt.target) ?
                                                        evt.target.innerHTML :
                                                        evt.target.activeElement.innerHTML )).replace(/\s+/g, ' ').substring(0,80)));
        var ctxt = $.extend({}, this.baseContext, {contextChain: []}, actionHandlers );
        ctxt.append( evt.type, detail);
        return ctxt;
    }
}
});