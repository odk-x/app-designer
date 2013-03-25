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
define(['opendatakit','backbone','jquery','handlebars','text!templates/navbarAndPopups.handlebars' ,'jqmobile'], 
function(opendatakit,  Backbone,  $,       Handlebars,  navbarAndPopups) {

return Backbone.View.extend({
    el: "body",
    className: "current",
    instance_id:123,
    template: Handlebars.compile(navbarAndPopups),
    swipeTimeStamp: -1,
    swipeEnabled: true,//Swipe can be disabled to prevent double swipe bug
    renderContext:{},
    events: {
        "click .odk-next-btn": "gotoNextScreen",
        "click .odk-prev-btn": "gotoPreviousScreen",
        "click .odk-options-btn": "openOptions",
        "click .languageMenu": "openLanguagePopup",
        "click .language": "setLanguage",
        "click .ignore-changes-and-exit": "ignoreChanges",
        "click .save-incomplete-and-exit": "saveChanges",
        "swipeleft .swipeForwardEnabled": "gotoNextScreen",
        "swiperight .swipeBackEnabled": "gotoPreviousScreen",
        "pagechange": "handlePagechange",
        "dragstart img": "disableImageDrag",
        "click #ok-btn": "closeScreenPopup"
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
    initialize: function(){
        this.controller = this.options.controller;
        this.currentPageEl = $('[data-role=page]');
        console.assert(this.currentPageEl.length === 1);
        var that = this;
    },
    cleanUpScreenManager: function(ctxt){
        this.swipeEnabled = true;
        this.savedCtxt = null;
        this.displayWaiting(ctxt);
    },
    displayWaiting: function(ctxt){
        var that = this;
        ctxt.append("screenManager.displayWaiting", (this.prompt == null) ? "promptIdx: null" : ("promptIdx: " + this.prompt.promptIdx));
        // update to be like a simulated page change...
        var $page = $('<div>');
        $page.attr('data-role', 'page');
        $page.attr('data-theme', "d");
        $page.attr('data-content-theme', "d");
        $page.html('<div data-role="header" class="odk-toolbar"></div>' +
                    '<div data-role="content" class="odk-scroll">' + 
                      '<div class="current"><span>Please wait...</span></div>' + 
                    '</div><div data-role="footer" class="odk-nav"></div>');
        that.previousPageEl = that.currentPageEl;
        that.currentPageEl = $page;
        that.prompt = null;
        that.$el.append(that.currentPageEl);
        that.savedCtxt = ctxt;
        $.mobile.changePage(that.currentPageEl, $.extend({
            changeHash: false,
            transition: 'none'
        }));
    },
    setPrompt: function(ctxt, prompt, jqmAttrs){
        if(!jqmAttrs){
            jqmAttrs = {};
        }
        var that = this;
        var locales = that.controller.getFormLocales();
        that.renderContext = {
            form_title: opendatakit.getSettingValue('form_title'),
            instanceName: prompt.database.getInstanceMetaDataValue('instanceName'),
            locales: locales,
            hasTranslations: (locales.length > 1),
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

        //If the prompt is slow to activate display a loading dialog.
        //This is going to be useful if the prompt gets data from a remote source.
        var activateTimeout = window.setTimeout(function(){
            that.showSpinnerOverlay("Loading...");
        }, 400);
        
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
                    failure: function(m) {
                        alert('Failure in screenManager.setPrompt');
                        that.swipeEnabled = true;
                        ctxt.failure(m);
                    }
                });
                window.clearTimeout(activateTimeout);
                $.mobile.changePage(that.currentPageEl, $.extend({
                    changeHash: false,
                    transition: transition
                }, jqmAttrs));
            }, failure: function(m) {
                window.clearTimeout(activateTimeout);
                that.hideSpinnerOverlay();
                ctxt.failure(m);
            }
        }));
    },
    gotoNextScreen: function(evt) {
        this.currentPageEl.css('opacity', '.5').fadeTo("fast", 1.0);
        //var transitionStart = new Date();
        
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
                    that.swipeEnabled = true; 
                    ctxt.success();
                    /*
                    setTimeout(function(){
                        alert(new Date() - transitionStart);
                    }, 0);
                    */
                },failure:function(m){
                    that.swipeEnabled = true; 
                    ctxt.failure(m);
                }}));
        return false;
    },
    gotoPreviousScreen: function(evt) {
        this.currentPageEl.css('opacity', '.5').fadeTo("fast", 1.0);
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
                    that.swipeEnabled = true; 
                    ctxt.success();
                },failure:function(m){
                    that.swipeEnabled = true; 
                    ctxt.failure(m);
                }}));
        return false;
    },
    ignoreChanges: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append('screenManager.ignoreChanges', ((that.prompt != null) ? ("px: " + that.prompt.promptIdx) : "no current prompt"));
        that.controller.ignoreAllChanges($.extend({},ctxt,{success: function() {
                that.controller.leaveInstance(ctxt);
            }}));
    },
    saveChanges: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append('screenManager.saveChanges', ((that.prompt != null) ? ("px: " + that.prompt.promptIdx) : "no current prompt"));
        that.controller.saveAllChanges($.extend({},ctxt,{success: function() {
                that.controller.leaveInstance(ctxt);
            }}), false);
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
        var $screenPopup = $( "#screenPopup" );
        var messageHtml = Handlebars.compile("<h3>{{#substitute}}{{localize message}}{{/substitute}}</h3>")(msg);
        $screenPopup.find('.message').html(messageHtml);
        $screenPopup.popup( "open" );
    },
    closeScreenPopup: function() {
        $( "#screenPopup" ).popup( "close" );
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
            if ( this.prompt ) {
                this.prompt.delegateEvents();
            }
            if(this.previousPageEl){
                var pg = this.previousPageEl;
                this.previousPageEl = null;
                pg.remove();
            }
            ctxt.success();
        } else {
            ctxt = this.controller.newContext(evt);
            ctxt.append('screenManager.handlePageChange.error');
            this.swipeEnabled = true;
            ctxt.failure({message: "Internal error. Unexpected triggering of page change event."});
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