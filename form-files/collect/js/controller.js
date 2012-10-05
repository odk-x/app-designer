'use strict';
// depends upon: --
// NOTE: builder.js sets controller.prompts property.
define(['screenManager','opendatakit','database'],
function(ScreenManager,  opendatakit,  database) {
return {
    screenManager : null,
    currentPromptIdx : -1,
    prompts : [],
    calcs: [],
    previousScreenIndices : [],
    beforeMove: function(context){
        var that = this;
        var prompt = null;
        if ( this.currentPromptIdx != -1 ) {
            prompt = this.prompts[this.currentPromptIdx];
        }
        try {
            if ( prompt ) {
                prompt.beforeMove(context);
            } else {
                context.success();
            }
        } catch(ex) {
            context.failure(function() {
                if ( that.screenManager != null ) {
                    that.screenManager.unexpectedError("beforeMove", ex);
                }
            });
        }
    },
    /*
    validate: function(isMoveBackward, context){
        var that = this;
        var prompt = null;
        if ( this.currentPromptIdx != -1 ) {
            prompt = this.prompts[this.currentPromptIdx];
        }
        try {
            if ( prompt ) {
                prompt.baseValidate(isMoveBackward, context);
            } else {
                context.success();
            }
        } catch(ex) {
            context.failure(function() {
                if ( that.screenManager != null ) {
                    console.error(prompt);
                    that.screenManager.unexpectedError("validate", ex);
                }
            });
        }
    },
    */
    validate: function(context){
        var that = this;
        var prompt;
        if ( this.currentPromptIdx != -1 ) {
            prompt = this.prompts[this.currentPromptIdx];
        }
        try {
            if ( prompt ) {
                prompt.validate(context);
            } else {
                context.success();
            }
        } catch(ex) {
            context.failure(function() {
                if ( that.screenManager != null ) {
                    console.error(prompt);
                    that.screenManager.unexpectedError("validate", ex);
                }
            });
        }
    },
    gotoPreviousScreen: function(){
        var that = this;
        that.beforeMove({
            success: function() {
                console.log("gotoPreviousScreen: beforeMove success ms: " + (+new Date()) + 
                            " page: " + that.currentPromptIdx);

                while (that.hasPromptHistory()) {
                    console.log("gotoPreviousScreen: poppreviousScreenNames ms: " + (+new Date()) + 
                                " page: " + that.currentPromptIdx);
                    var prmpt = that.getPromptByName(that.previousScreenIndices.pop(), {reverse:true});
                    var t = prmpt.type;
                    if ( t == "goto_if" || t == "goto" || t == "label" || t == "calculate" ) {
                        console.error("Invalid previous prompt type");
                        console.log(prmpt);
                    }
                    // todo -- change to use hash?
                    that.setPrompt(prmpt, {omitPushOnReturnStack:true, reverse:true});
                    return;
                }
                console.log("gotoPreviousScreen: noPreviousPage ms: " + (+new Date()) + 
                            " page: " + that.currentPromptIdx);            
                /*
                // we are ready for move -- validate...
                that.validate(true, {
                    success: function() {
                        console.log("gotoPreviousScreen: validate success ms: " + (+new Date()) + 
                            " page: " + that.currentPromptIdx);

                        while (that.hasPromptHistory()) {
                            console.log("gotoPreviousScreen: poppreviousScreenNames ms: " + (+new Date()) + 
                                        " page: " + that.currentPromptIdx);
                            var prmpt = that.getPromptByName(that.previousScreenIndices.pop(), {reverse:true});
                            var t = prmpt.type;
                            if ( t == "goto_if" || t == "goto" || t == "label" || t == "calculate" ) {
                                console.error("Invalid previous prompt type");
                                console.log(prmpt);
                            }
                            // todo -- change to use hash?
                            that.setPrompt(prmpt, {omitPushOnReturnStack:true, reverse:true});
                            return;
                        }
                        console.log("gotoPreviousScreen: noPreviousPage ms: " + (+new Date()) + 
                                    " page: " + that.currentPromptIdx);
                        that.screenManager.noPreviousPage(function() {
                            that.gotoRef("0");
                        });
                    },
                    failure: function(validationFailAction) {
                        console.log("gotoPreviousScreen: validate failure ms: " + (+new Date()) + 
                            " page: " + that.currentPromptIdx);
                        if ( validationFailAction != null ) {
                            validationFailAction();
                        }
                    }
                });
                */
            },
            failure: function(stayAction) {
                console.log("gotoPreviousScreen: beforeMove failure ms: " + (+new Date()) + 
                            " page: " + that.currentPromptIdx);
                // should stay on this screen...
                if ( stayAction != null ) {
                    stayAction();
                }
            }
        });
    },
    /**
     * If 'prompt' is a label, goto or goto_if, advance through the 
     * business logic until it is resolved to a renderable screen prompt.
     *
     * return that renderable screen prompt.
     */
    /*
    advanceToScreenPrompt: function(prompt) {
        var that = this;
        var oldprompt = null;
        do {
            oldprompt = prompt;
            
            //Skip prompts that have a condition that evals to false.
            if('condition' in prompt) {
                if ( !prompt.condition() ) {
                    prompt = that.getPromptByName(prompt.promptIdx + 1);
                    continue;
                }
            }
            
            if ( prompt.type == "label" ) {
                prompt = that.getPromptByName(prompt.promptIdx + 1);
            } else if ( prompt.type == "calculate" ) {
                prompt.evaluate();
                prompt = that.getPromptByName(prompt.promptIdx + 1);
            } else if ( prompt.type == "goto" ) {
                prompt = that.getPromptByLabel(prompt.param);
            } else if ( prompt.type == "goto_if" ) {
                try {
                    if ( prompt.condition() ) {
                        prompt = that.getPromptByLabel(prompt.param);
                    } else {
                        prompt = that.getPromptByName(prompt.promptIdx + 1);
                    }
                } catch (ex) {
                    prompt = that.getPromptByName(prompt.promptIdx + 1);
                }
            }
        } while ( prompt && oldprompt != prompt );
        return prompt;
    },
    */
    advanceToScreenPrompt: function(prompt, callback) {
        var nextPrompt;
        var that = this;

        if ( prompt.type == "label" ) {
            nextPrompt = that.getPromptByName(prompt.promptIdx + 1);
        } else if('condition' in prompt && !prompt.condition()) {
            nextPrompt = that.getPromptByName(prompt.promptIdx + 1);
        } else if ( prompt.type == "goto" || prompt.type == "goto_if" ) {
            nextPrompt = that.getPromptByLabel(prompt.param);
        }
        
        if(nextPrompt) {
            that.advanceToScreenPrompt(nextPrompt, callback);
        } else {
            callback(prompt);
        }
    },
    gotoNextScreen: function(options){
        var that = this;
        that.beforeMove({
            success: function() {
                console.log("gotoNextScreen: beforeMove success ms: " + (+new Date()) + 
                            " page: " + that.currentPromptIdx);
                // we are ready for move -- validate...
                that.validate({
                    success: function() {
                        // navigate through all gotos, goto_ifs and labels.
                        var prompt = null;
                        if ( that.currentPromptIdx >= 0 ) {
                            prompt = that.getPromptByName(that.currentPromptIdx + 1);
                        } else {
                            prompt = that.prompts[0];
                        }

                        // abort and display error if we don't have any prompts...
                        if ( prompt == null ) {
                            that.screenManager.noNextPage(function() {
                                that.gotoRef("0");
                            });
                            return;
                        }
                        
                        that.advanceToScreenPrompt(prompt, function(prompt){
                            if(prompt) {
                                console.log("gotoNextScreen: nextPrompt: " + prompt.promptIdx + " ms: " + (+new Date()) + 
                                " page: " +    that.currentPromptIdx);
                                // todo -- change to use hash?
                                that.setPrompt(prompt, options);
                            } else {
                                console.log("gotoNextScreen: noNextPage ms: " + (+new Date()) +
                                " page: " + that.currentPromptIdx);
                                that.screenManager.noNextPage(function() {
                                    that.gotoRef("0");
                                });
                            }
                        });
                    },
                    failure: function(validationFailAction) {
                        console.log("gotoNextScreen: validate failure ms: " + (+new Date()) + 
                            " page: " + that.currentPromptIdx);
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
                        if ( validationFailAction != null ) {
                            validationFailAction();
                        }
                    }
                });
            },
            failure: function(stayAction) {
                console.log("gotoNextScreen: beforeMove failure ms: " + (+new Date()) + 
                            " page: " + that.currentPromptIdx);
                // should stay on this screen...
                if ( stayAction != null ) {
                    stayAction();
                }
            }
        });
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
    setPrompt: function(prompt, passedInOptions){
        if ( this.currentPromptIdx == prompt.promptIdx ) {
            console.log('setPrompt: ignored: ' + prompt.promptIdx);
            return;
        }
        console.log('setPrompt: ' + prompt.promptIdx);

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
        this.screenManager.setPrompt(prompt, options);
        // the prompt should never be changed at this point!!!
        if ( this.currentPromptIdx != prompt.promptIdx ) {
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
        var selpage = this.getPromptByName(page);
        if ( selpage == null ) {
            console.log("opendatakitCallback: ERROR - PAGE NOT FOUND! " + page + " path: " + path + " action: " + action );
            return;
        }
        var handler = selpage.getCallback(path, action);
        if ( handler != null ) {
            handler( path, action, jsonString );
        } else {
            console.log("opendatakitCallback: ERROR - NO HANDLER ON PAGE! " + page + " path: " + path + " action: " + action );
            return;
        }
    },
    gotoRef:function(pageRef) {
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

        var prmpt; 
        if ( hleading != null ) {
            prmpt = this.getPromptByName(hleading);
            if ( prmpt == null ) {
                prmpt = this.prompts[0];
                hlist = [];
            }
        } else {
            prmpt = this.prompts[0];
            hlist = [];
        }
        
        if ( prmpt == null ) {
            alert("controller.gotoRef: null prompt after resolution!");
            return;
        }
        
        this.advanceToScreenPrompt(prmpt, function(prompt){
            if ( prompt == null ) {
                alert("controller.gotoRef: null prompt after advanceToScreenPrompt!");
                return;
            }
    
            that.setPrompt(prompt, { hlist : hlist });    
        });
        
    },
    hasPromptHistory: function() {
        return (this.previousScreenIndices.length !== 0);
    },
    clearPromptHistory: function() {
        this.previousScreenIndices.length = 0;
    },
    reset: function(sameForm) {
        console.log("Controller Reset");
        this.clearPromptHistory();
        if ( this.screenManager != null ) {
            this.screenManager.cleanUpScreenManager();
        } else {
            this.screenManager = new ScreenManager({controller: this});
        }
        this.currentPromptIdx = -1;
        if ( !sameForm ) {
            this.prompts = [];
            this.calcs = [];
        }
    }
}
});