'use strict';
/**
* circular dependency: 'controller' -- to avoid a circular dependency, 'controller' is passed 
* in during initialize() and stored in a member variable.
*
* Responsibilities:
*    Performs the actions necessary to make a prompt visible on the screen (setPrompt).
*    Receives click and swipe events for navigating across pages.
*    Displays pop-up dialogs and toasts.
*    Displays the options dialog for changing languages and navigations.
*/
define(['opendatakit','backbone','jquery','handlebars','text!templates/screen.handlebars' ,'jqmobile'], 
function(opendatakit, Backbone, $, Handlebars, screenTemplate) {

return Backbone.View.extend({
    el: "body",
    className: "current",
    instance_id:123,
    template: Handlebars.compile(screenTemplate),
    swipeTimeStamp: -1,
    swipeEnabled: true,//Swipe can be disabled to prevent double swipe bug
    renderContext:{},
    events: {
        "click .odk-next-btn": "gotoNextScreen",
        "click .odk-prev-btn": "gotoPreviousScreen",
        "click .odk-options-btn": "openOptions",
        "click .languageMenu": "openLanguagePopup",
        "click .language": "setLanguage",
        "swipeleft .swipeForwardEnabled": "gotoNextScreen",
        "swiperight .swipeBackEnabled": "gotoPreviousScreen",
        "pagechange": "handlePagechange",
        "dragstart img": "disableImageDrag"
    },
    noPreviousPage: function(ctxt) {
        ctxt.append("screenManager.noPreviousPage");
        alert("I've forgotten what the previous page was!");
        ctxt.success();
    },
    noNextPage: function(ctxt) {
        ctxt.append("screenManager.noNextPage");
        alert("No next page!");
        ctxt.success();
    },
    unexpectedError: function(ctxt, action, ex) {
        try {
            alert("Unexpected error: " + action + " Reason: " + ex );
        } catch (e) {
        }
        ctxt.success();
    },
    initialize: function(ctxt){
        this.controller = this.options.controller;
        this.currentPageEl = $('[data-role=page]');
        console.assert(this.currentPageEl.length === 1);
        var that = this;
        /*
        var f = function() {
            requirejs(['text!templates/screen.handlebars'], function(source) {
                    that.template = Handlebars.compile(source);
            }, function(err) {
                if ( err.requireType == "timeout" ) {
                    setTimeout( f, 100);
                }
            });
        };
        f();
        */
    },
    cleanUpScreenManager: function(ctxt){
        this.swipeEnabled = true;
        this.savedCtxt = null;
        this.displayWaiting(ctxt);
    },
    displayWaiting: function(ctxt){
        ctxt.append("screenManager.displayWaiting", (this.prompt == null) ? "promptIdx: null" : ("promptIdx: " + this.prompt.promptIdx));
        var $e;
        $e = $('.current');
        $e.html('<span>Please wait...</span>');
        $e = $('.odk-toolbar');
        $e.html('');
        $e = $('.odk-nav');
        $e.html('');
    },
    setPrompt: function(ctxt, prompt, jqmAttrs){
        if(!jqmAttrs){
            jqmAttrs = {};
        }
        var that = this;
        that.renderContext = {
            formTitle: prompt.database.getTableMetaDataValue('formTitle'),
            instanceName: prompt.database.getInstanceMetaDataValue('instanceName'),
            locales: that.controller.getFormLocales(),
            showHeader: true,
            showFooter: false,
            enableForwardNavigation: true,
            enableBackNavigation: true,
            enableNavigation: true
            // enableNavigation -- defaults to true; false to disable everything...
            // enableForwardNavigation -- forward swipe and button
            // enableBackNavigation -- backward swipe and button
            //
            // the absence of page history disabled backward swipe and button.
        };

        //A better way to do this might be to pass a controller interface object to 
        //onActivate that can trigger screen refreshes, as well as goto other prompts.
        //(We would not allow prompts to access the controller directly).
        //When the prompt changes, we could disconnect the interface to prevent the old
        //prompts from messing with the current screen.
        // 
        // pass in 'render': true to indicate that we will be rendering upon successful
        // completion.
        prompt.onActivate($.extend({render:true},ctxt,{
            success:function(renderContext){
                var isFirstPrompt = !('previousPageEl' in that);
                var transition = 'none'; // isFirstPrompt ? 'fade' : 'slide';
                if(renderContext){
                    $.extend(that.renderContext, renderContext);
                }
                if( !that.renderContext.enableBackNavigation &&
                !that.renderContext.enableForwardNavigation ){
                    //If we try to render a jqm nav without buttons we get an error
                    //so this flag automatically disables nav in that case.
                    that.renderContext.enableNavigation = false;
                }
                /*
                console.log(that.renderContext);
                // work through setting the forward/backward enable flags
                if ( that.renderContext.enableNavigation === undefined ) {
                    that.renderContext.enableNavigation = true;
                }
                if ( that.renderContext.enableForwardNavigation === undefined ) {
                    that.renderContext.enableForwardNavigation = 
                        that.renderContext.enableNavigation;
                }
                if ( that.renderContext.enableBackNavigation === undefined ) {
                    that.renderContext.enableBackNavigation = 
                        that.renderContext.enableNavigation &&
                        that.controller.hasPromptHistory(ctxt);
                }
                */
                // TODO: tell existing prompt it is inactive (e.g,. semaphore)...
                if(that.prompt) {
                    that.prompt.undelegateEvents();
                }
                that.swipeEnabled = false;
                // swap the prompts:
                that.prompt = prompt;
                that.previousPageEl = that.currentPageEl;
                that.currentPageEl = that.renderPage(prompt);
                that.$el.append(that.currentPageEl);
                // this might double-reset the swipeEnabled flag, but it does ensure it is reset
                that.savedCtxt = $.extend({}, ctxt, {
                    success: function() {
                        that.swipeEnabled = true;
                        ctxt.success();
                    },
                    failure: function() {
                        alert('Failure in screenManager.setPrompt');
                        that.swipeEnabled = true;
                        ctxt.failure();
                    }
                });
                $.mobile.changePage(that.currentPageEl, $.extend({
                    changeHash: false,
                    transition: transition
                }, jqmAttrs));
            }
        }));
    },
    gotoNextScreen: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append('screenManager.gotoNextScreen', ((that.prompt != null) ? ("px: " + that.prompt.promptIdx) : "no current prompt"));
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        if (that.swipeTimeStamp == evt.timeStamp) {
            ctxt.append('screenManager.gotoNextScreen.duplicateEvent');
            ctxt.success();
            return false;
        } else if(!that.swipeEnabled) {
            ctxt.append('screenManager.gotoNextScreen.ignoreDisabled');
            ctxt.success();
            return false;
        }
        that.swipeTimeStamp = evt.timeStamp;
        that.swipeEnabled = false;
        that.controller.gotoNextScreen($.extend({},ctxt,{
                success:function(){
                    that.swipeEnabled = true; ctxt.success();
                },failure:function(){
                    that.swipeEnabled = true; ctxt.failure();
                }}));
        return false;
    },
    gotoPreviousScreen: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append('screenManager.gotoPreviousScreen', ((that.prompt != null) ? ("px: " + that.prompt.promptIdx) : "no current prompt"));
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        if (that.swipeTimeStamp == evt.timeStamp) {
            ctxt.append('screenManager.gotoPreviousScreen.duplicateEvent');
            ctxt.success();
            return false;
        }
        that.swipeTimeStamp = evt.timeStamp;
        return that.gotoPreviousScreenAction(ctxt);
    },
    gotoPreviousScreenAction: function(ctxt) {
        var that = this;
        if(!that.swipeEnabled) {
            ctxt.append('screenManager.gotoPreviousScreen.ignoreDisabled');
            ctxt.success();
            return false;
        }
        that.swipeEnabled = false;
        that.controller.gotoPreviousScreen($.extend({},ctxt,{
                success:function(){ 
                    that.swipeEnabled = true; ctxt.success();
                },failure:function(){
                    that.swipeEnabled = true; ctxt.failure();
                }}));
        return false;
    },
    openOptions: function(evt) {
        $( "#optionsPopup" ).popup( "open" );
    },
    openLanguagePopup: function(evt) {
        $( "#optionsPopup" ).popup( "close" );
        $( "#languagePopup" ).popup( "open" );
    },
    setLanguage: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append('screenManager.setLanguage', ((that.prompt != null) ? ("px: " + that.prompt.promptIdx) : "no current prompt"));
        //Closing popups is important,
        //they will not open in the future if one is not closed.
        $( "#languagePopup" ).popup( "close" );
        this.controller.setLocale(ctxt, $(evt.target).attr("id"));
    },
    showScreenPopup: function(msg) {
        var messageHtml = Handlebars.compile("{{#substitute}}{{localize message}}{{/substitute}}")(msg);
        $( "#screenPopup" ).find('.message').html(messageHtml);
        $( "#screenPopup" ).popup( "open" );
    },
    showSpinnerOverlay: function(msg) {
        $.mobile.loading( 'show', {
            text: msg.text,
            textVisible: true
        });
    },
    hideSpinnerOverlay: function() {
        $.mobile.loading( 'hide' );
    },
    handlePagechange: function(evt){
        var ctxt = this.savedCtxt;
        this.savedCtxt = null;
        
        if ( ctxt != null ) {
            ctxt.append('screenManager.handlePageChange.linked');
            this.prompt.delegateEvents();
            if(this.previousPageEl){
                var pg = this.previousPageEl;
                this.previousPageEl = null;
                pg.remove();
            }
            ctxt.success();
        } else {
            ctxt = that.controller.newContext(evt);
            ctxt.append('screenManager.handlePageChange.error');
            this.swipeEnabled = true;
            ctxt.failure();
        }
    },
    disableImageDrag: function(evt){
        evt.preventDefault();
    },
    renderPage: function(prompt){
        var $page = $('<div>');
        $page.attr('data-role', 'page');
        $page.attr('data-theme', "d");
        $page.attr('data-content-theme', "d");
        if(this.renderContext.enableNavigation){
            if(this.renderContext.enableForwardNavigation){
                $page.addClass('swipeForwardEnabled');
            }
            if(this.renderContext.enableBackNavigation){
                $page.addClass('swipeBackEnabled');
            }
        }
        $page.html(this.template(this.renderContext));
        var $contentArea = $page.find('.odk-container');
        prompt.setElement($contentArea);
        prompt.render();
        prompt.undelegateEvents();
        //$contentArea.append(prompt.$el);
        return $page;
    }
});
});