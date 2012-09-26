'use strict';
// depends upon -- opendatakit, Backbone, $, Handlebars, jQueryMobile, text (a requirejs plugin).
//
// also depends upon: 'controller' -- to avoid a circular dependency, 'controller' is passed 
// in during initialize() and stored in a member variable.
//
define(['opendatakit','backbone','jquery','handlebars','jqmobile','text'], 
function(opendatakit, Backbone, $, Handlebars) {

return Backbone.View.extend({
    el: "body",
    className: "current",
    instance_id:123,
    template: null,
    swipeEnabled: true,//Swipe can be disabled to prevent double swipe bug
    noPreviousPage: function(continuation) {
        alert("I've forgotten what the previous page was!");
        continuation();
    },
    noNextPage: function(continuation) {
        alert("No next page!");
        continuation();
    },
    unexpectedError: function(action, ex) {
        try {
            alert("Unexpected error: " + action + " Reason: " + ex );
        } catch (e) {
        }
    },
    renderContext:{},
    initialize: function(){
        this.controller = this.options.controller;
        this.currentPageEl = $('[data-role=page]');
        var that = this;
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
    },
    cleanUpScreenManager: function(){
        this.undelegateEvents();
        this.swipeEnabled = false;
        var $e;
        $e = $('.current');
        $e.html('<span>Please wait...</span>');
        $e = $('.odk-toolbar');
        $e.html('');
        $e = $('.odk-nav');
        $e.html('');
    },
    setPrompt: function(prompt, jqmAttrs){
        if(!jqmAttrs){
            jqmAttrs = {};
        }
        var that = this;
        // TODO: tell existing prompt it is inactive (e.g,. semaphore)...
        this.prompt = prompt;
        this.undelegateEvents();
        this.swipeEnabled = false;
        this.renderContext = {
            showHeader: true,
            showFooter: true,
            enableForwardNavigation: true,
            enableBackNavigation: true,
            enableNavigation: true
            // enableNavigation -- defaults to true; false to disable everything...
            // enableForwardNavigation -- forward swipe and button
            // enableBackNavigation -- backward swipe and button
            //
            // the absence of page history disabled backward swipe and button.
        };
        var that = this;
        var f = function() {
            if ( that.template && prompt.isInitializeComplete() ) {
                //A better way to do this might be to pass a controller interface object to 
                //onActivate that can trigger screen refreshes, as well as goto other prompts.
                //(We would not allow prompts to access the controller directly).
                //When the prompt changes, we could disconnect the interface to prevent the old
                //prompts from messing with the current screen.
                that.prompt.onActivate(function(renderContext){
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
                            that.controller.hasPromptHistory();
                    }
                    */
                    that.previousPageEl = that.currentPageEl;
                    that.currentPageEl = that.renderPage(prompt);
                    that.$el.append(that.currentPageEl);
                    that.delegateEvents();
                    $.mobile.changePage(that.currentPageEl, $.extend({changeHash:false, transition: transition}, jqmAttrs));
                });
            } else {
                that.cleanUpScreenManager();
                setTimeout( f, 100);
            }
        };
        f();
    },
    gotoNextScreen: _.debounce(function(evt){
        /*
        This debounce is a total hack.
        The bug it is trying to solve is the issue
        where the first page of the survey is skipped. 
        The problem stems from swipe events being registered twice.
        Only the opening prompt has problems because it does some unique things
        in it's beforeMove function.
        */
        console.log('next');
        evt.stopPropagation();
        if(!this.swipeEnabled) return;
        this.controller.gotoNextScreen(); 
    }, 100),
    gotoPreviousScreen: function(evt){
        evt.stopPropagation();
        if(!this.swipeEnabled) return;
        this.controller.gotoPreviousScreen();
    },
    handlePagechange: function(evt){
        console.log('Page change');
        this.prompt.delegateEvents();
        this.swipeEnabled = true;
        if(this.previousPageEl){
            this.previousPageEl.remove();
        }
    },
    events: {
        "click .odk-next-btn": "gotoNextScreen",
        "click .odk-prev-btn": "gotoPreviousScreen",
        "swipeleft .swipeForwardEnabled": "gotoNextScreen",
        "swiperight .swipeBackEnabled": "gotoPreviousScreen",
        "pagechange": "handlePagechange"
    },
    renderPage: function(prompt){
        var $page = $('<div>');
        $page.attr('data-role', 'page');
        $page.attr('data-theme', "d");
        $page.attr('data-content-theme', "d");
        $page.html(this.template(this.renderContext));
        var $contentArea = $page.find('.odk-container');
        prompt.render();
        $contentArea.append(prompt.$el);
        return $page;
    }
});
});