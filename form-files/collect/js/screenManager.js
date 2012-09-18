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
    template: null,
    swipeEnabled: true,//Swipe can be disabled to prevent double swipe bug
    renderContext:{},
    initialize: function(controller){
        this.controller = controller;
        this.currentPageEl = $('.init-page');
        var that = this;
        requirejs(['text!templates/screen.handlebars'],function(source) {
            that.template = Handlebars.compile(source);
        });
    },
    getName: function(){
        if ( this.prompt != null ) {
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
        this.prompt = prompt;
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
			if ( that.template ) {
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
					$.mobile.changePage(that.currentPageEl, $.extend({changeHash:false, transition: transition}, jqmAttrs));
				});
			} else {
				setTimeout( f, 100);
			}
		};
		f();
    },
    gotoNextScreen: function(evt){
		evt.stopPropagation();
        if(!this.swipeEnabled) return;
        this.controller.gotoNextScreen(); 
    },
    gotoPreviousScreen: function(evt){
		evt.stopPropagation();
        if(!this.swipeEnabled) return;
        this.controller.gotoPreviousScreen();
    },
    handlePagechange: function(evt){
        console.log('Page change');
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
        prompt.delegateEvents();
        return $page;
    },
    /*
    //We need to render the next screen in advance so this approach won't work.
    render: function() {
        //this.$el.empty();
        var newPage = this.renderPage(this.prompt);
        this.$el.append(newPage);
        return this;
    },
    */
    validate: function(isMoveBackward, context){
		context.success();
		/*
		if ( this.prompt ) {
			this.prompt.validate(isMoveBackward, context);
		} else {
			context.success();
		}
		*/
    },
    computeNextPrompt: function(continuation){
        this.prompt.computeNextPrompt(continuation);
    },
    beforeMove: function(continuation){
		if ( this.prompt ) {
			this.prompt.beforeMove(continuation);
		} else {
			continuation();
		}
    }
});
});