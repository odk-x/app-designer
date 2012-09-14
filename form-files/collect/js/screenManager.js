'use strict';
// depends upon -- opendatakit, Backbone, $, Handlebars
//
// plus all compiled templates being loaded (which requires 'text' module in requirejs)
//
// plus 'controller' -- to avoid a circular dependency, 'controller' is passed 
// in during initialize() and stored in a member variable.
//
define(['opendatakit','backbone','jquery','handlebars','templates/compiledTemplates','text'], 
function(opendatakit, Backbone, $, Handlebars, jqm) {

$(document).bind("mobileinit", function () {
    $.mobile.ajaxEnabled = false;
    $.mobile.linkBindingEnabled = false;
    $.mobile.hashListeningEnabled = false;
    $.mobile.pushStateEnabled = false;
});

return Backbone.View.extend({
    el: "body",
    className: "current",
    instance_id:123,
    template: Handlebars.templates.screen,
    renderContext:{},
    initialize: function(controller){
        this.controller = controller;
    },
    getName: function(){
        if ( this.prompt !== null ) {
            return this.prompt.name;
        } else {
            console.log("no prompt showing on this screen!");
        }
    },
    setPrompt: function(prompt, jqmAttrs){
        if(!jqmAttrs){
            jqmAttrs = {};
        }
        var that = this;
        this.previousPrompt = this.prompt;
        this.prompt = prompt;
        this.renderContext = {
            showHeader: true,
            showFooter: true
            // enableNavigation -- defaults to true; false to disable everything...
            // enableForwardNavigation -- forward swipe and button
            // enableBackNavigation -- backward swipe and button
            //
            // the absence of page history disabled backward swipe and button.
        };
        this.prompt.onActivate(function(renderContext){
            if(renderContext){
                $.extend(that.renderContext, renderContext);
            }
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
            var newPage = that.renderPage(prompt);
            that.$el.append(newPage);
            $.mobile.changePage(newPage, $.extend({changeHash:false, transition: 'slide'}, jqmAttrs));
        });
    },
    gotoNextScreen: function(e){
        console.log("gotoNextScreen");
        console.log(e);
        this.controller.gotoNextScreen();
    },
    gotoPreviousScreen: function(){
        this.controller.gotoPreviousScreen();
    },
    handlePagechange: function(evt){
        console.log(evt);
        console.log('Page change');
        if(this.previousPrompt){
            this.previousPrompt.$el.remove();
        }
    },
    events: {
        "click .odk-next-btn": "gotoNextScreen",
        "click .odk-prev-btn": "gotoPreviousScreen",
        "swipeleft .swipeForwardEnabled": "gotoNextScreen",
        "swiperight .swipeBackEnabled": "gotoPreviousScreen",
        "pagechange" : "handlePagechange"
    },
    renderPage: function(prompt){
        var $page = $('<div>');
        $page.attr('data-role', 'page');
        $page.attr('data-theme', "d");
        $page.attr('data-content-theme', "d");
        $page.html(this.template(this.renderContext));
        if('prompt' in this){
            var $contentArea = $page.find('.odk-container');
            $contentArea.append(prompt.$el);
            prompt.render();
        }
        return $page;
    },
    /*
    //Rerendering jqm stuff seems difficult
    render: function() {
        //this.$el.empty();
        var newPage = this.renderPage(this.prompt);
        this.$el.append(newPage);
        return this;
    },
    */
    validate: function(flag, context){
        console.log(context);
        context.success();
    },
    computeNextPrompt: function(continuation){
        this.prompt.computeNextPrompt(continuation);
    },
    beforeMove: function(continuation) {
        continuation();
    }
});
});