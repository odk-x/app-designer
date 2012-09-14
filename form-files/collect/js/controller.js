'use strict';
// depends upon: --
// NOTE: builder.js sets controller.prompts property.
define(['screenManager'], function(ScreenManager) {
return {
    screenManager : null,
    previousScreenNames : [],
    start: function($container){
        this.screenManager = new ScreenManager(this);
        if ( location.hash != null && location.hash.length != 0 ) {
            this.odkHashChangeHandler();
        } else {
            this.setPrompt(this.prompts[0]);
        }
    },
    gotoPreviousScreen: function(){
        var that = this;
        var screenManager = this.screenManager;
        screenManager.validate(true, {
            success: function() {
                if (!that.hasPromptHistory()) {
                    alert("I've forgotten what the previous page was!");
                    console.log("gotoPreviousPrompt: noPreviousPage ms: " + (+new Date()) + " page: " + screenManager.getName());
                    return;
                } else {
                    console.log("gotoPreviousPrompt: poppreviousScreenNames ms: " + (+new Date()) + " page: " + screenManager.getName());
                    that.setPrompt(that.getPromptByName(that.previousScreenNames.pop()), {reverse:true});
                }
            },
            failure: function(missingValue) {
                console.log("gotoPreviousPrompt: validationFailed ms: " + (+new Date()) + " page: " + screenManager.getName());
                if ( missingValue ) {
                    screenManager.requiredFieldMissingAction();
                } else {
                    screenManager.validationFailedAction();
                }
                return;
            }
        });
    },
    gotoNextScreen: function(){
        var that = this;
        var screenManager = this.screenManager;
        screenManager.validate(false, {
            success: function(){
                screenManager.computeNextPrompt(function(nextPrompt){
                    if(nextPrompt){
                        console.log("gotoNextPrompt: nextPrompt ms: " + (+new Date()) + " page: " + screenManager.getName());
                        that.gotoPrompt(nextPrompt);
                    } else {
                        alert(screenManager.noNextPageMessage);
                        console.log("gotoNextPrompt: noNextPage ms: " + (+new Date()) + " page: " + screenManager.getName());
                    }
                });
            },
            failure: function(){
                screenManager.validationFailedAction();
                console.log("gotoNextPrompt: validationFailed ms: " + (+new Date()) + " page: " + screenManager.getName());
                return;
            }
        });
    },
    getPromptByName: function(name){
        var prompts = this.prompts;
        for(var i = 0; i < prompts.length; i++){
            var promptName = prompts[i].name;
            if(promptName == name){
                return prompts[i];
            }
        }
        alert("Unable to find screen: " + name);
        return null;
    },
    getLabel: function(name){
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
    setPrompt: function(prompt, jqmAttrs){
        console.log('setPrompt');
        console.log(prompt);
        this.screenManager.setPrompt(prompt, jqmAttrs);
    },
    hasPromptHistory: function() {
        return (this.previousScreenNames.length !== 0);
    },
    clearPromptHistory: function() {
        this.previousScreenNames.length = 0;
    },
    gotoPrompt: function(prompt, termList, omitPushOnReturnStack){
        var that = this;
        that.screenManager.beforeMove(function(){
            if (!omitPushOnReturnStack) {
                // push this prompt onto the return stack only if it has a name...
                var name = that.screenManager.getName();
                if ( name != null ) {
                    that.previousScreenNames.push(name);
                }
            }
            that.setPrompt(prompt);
        });
    },
    gotoLabel: function(name){
        this.gotoPrompt(this.getLabel(name), null, true);
    },
    gotoPromptName: function(name, termList, omitPushOnReturnStack){
        var prompt = this.getPromptByName(name);
        if ( prompt == null ) {
            this.gotoPrompt(this.prompts[0], null, omitPushOnReturnStack);
        } else {
            this.gotoPrompt(prompt, termList, omitPushOnReturnStack);
        }
    },/*
    gotoPromptIdx: function(idx, omitPushOnReturnStack){
        if(idx >= 0 && idx < this.prompts.length){
            this.gotoPrompt(this.prompts[idx], [], omitPushOnReturnStack);
        }
    },*/       
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
    /*
     * location.hash is an underscore-separated concatenation of ids.
     * If the leading character is an underscore, it is interpreted as 
     * part of the leading id in the list. I.e., '#_opening_foo' is 
     * interpreted as ['_opening', 'foo'] while '#page1_bar' is 
     * interpreted as ['page1', 'bar'].
    */
    odkHashChangeHandler:function(e) {
        var hash = location.hash.replace(/^#/,'');
        var hlist = hash.split('_');
        var hleading = hlist[0];
        if ( hlist.length > 1 && hleading == '' ) {
            // this is one of the system screens - they begin with '_'.
            hlist.shift(); // the empty string
            hleading = '_' + hlist.shift();
        }
        if ( this.screenManager == null || this.screenManager.getName() != hleading ) {
            this.gotoPromptName(hleading, hlist, false);
        }
    }
}
});