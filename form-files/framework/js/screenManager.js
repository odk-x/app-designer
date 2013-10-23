'use strict';
/**
* circular dependency: 'controller' -- to avoid a circular dependency, 'controller' is passed 
* in during initialize() and stored in a member variable.
*
* Responsibilities:
*    Performs the actions necessary to make a screen visible on the screen (setScreen).
*    Receives click and swipe events for navigating across pages.
*    Displays pop-up dialogs and toasts.
*    Displays the options dialog for changing languages and navigations.
*/
define(['opendatakit','backbone','jquery','handlebars','screenTypes','text!templates/screenPopup.handlebars', 
    'text!templates/optionsPopup.handlebars', 'text!templates/languagePopup.handlebars' ,'jqmobile', 'handlebarsHelpers', 'translations'], 
function(opendatakit,  Backbone,  $,       Handlebars,  screenTypes,  screenPopup, 
     optionsPopup,                             languagePopup, jqmobile, _hh, translations) {
verifyLoad('screenManager',
    ['opendatakit','backbone','jquery','handlebars','screenTypes','text!templates/screenPopup.handlebars', 
    'text!templates/optionsPopup.handlebars', 'text!templates/languagePopup.handlebars' ,'jqmobile', 'handlebarsHelpers', 'translations'],
    [opendatakit,  Backbone,  $,       Handlebars,  screenTypes,  screenPopup, 
     optionsPopup,                             languagePopup, jqmobile, _hh, translations]);

return Backbone.View.extend({
    el: "body",
    screenTemplate: Handlebars.compile(screenPopup),
    optionsTemplate: Handlebars.compile(optionsPopup),
    languageTemplate: Handlebars.compile(languagePopup),
    eventTimeStamp: -1,
    pageChangeActionLockout: false, // to control double-swiping...
    renderContext:{},
    events: {
        "click .odk-next-btn": "gotoNextScreen",
        "click .odk-prev-btn": "gotoPreviousScreen",
        "click .odk-options-btn": "openOptions",
        "click .languageMenu": "openLanguagePopup",
        "click .language": "setLanguage",
        "click .ignore-changes-and-exit": "ignoreChanges",
        "click .save-incomplete-and-exit": "saveChanges",
        "click .show-contents": "showContents",
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
        this.$el = $('body');
    },
    cleanUpScreenManager: function(ctxt){
        this.pageChangeActionLockout = false;
        this.savedCtxt = null;
        this.displayWaiting(ctxt);
    },
    displayWaiting: function(ctxt){
        var that = this;
        ctxt.append("screenManager.displayWaiting", 
            (that.activeScreen == null) ? "activeScreenIdx: null" : ("activeScreenIdx: " + that.activeScreen.promptIdx));
        var ScreenType = screenTypes['waiting'];
        var ExtendedScreenType = ScreenType.extend({});
        var ScreenInstance = new ExtendedScreenType({});
        that.setScreen(ctxt, ScreenInstance);
    },
    firstRender: true,
    getMobileAction: function() {
        if ( this.firstRender ) {
            this.firstRender = false;
            return 'create';
        } else {
            return 'refresh';
        }
    },
    beforeMove: function(ctxt, advancing) {
        if ( this.activeScreen ) {
            this.activeScreen.beforeMove(ctxt, advancing);
        } else {
            ctxt.success();
        }
    },
    refreshScreen: function(ctxt) {
        var that = this;
        that.commonDrawScreen(ctxt);
     },
    setScreen: function(ctxt, screen, popScreenOnExit){
        var that = this;
        
        // remember this parameter to support refreshScreen...
        that.popScreenOnExit = popScreenOnExit ? true : false;

        // TODO: support sliding left and right transitions.
        // This requires additional info from controller as to what
        // direction we are going (forward or backward).
        var transition = 'none'; // 'slide' with data-direction="reverse" or not...;
        
        that.commonDrawScreen(ctxt, screen, transition);
    },
    commonDrawScreen: function(ctxt, screen, transition) {
        var that = this;
        var redraw = false;
        if ( screen == null ) {
            screen = that.activeScreen;
            redraw = true;
            transition = 'none'; // redrawing!
        }
        var locales = opendatakit.getFormLocalesValue();
        // useful defaults...
        that.renderContext = {
            form_title: that.controller.getSectionTitle(),
            locales: locales,
            hasTranslations: (locales.length > 1),
            showHeader: true,
            showFooter: false,
            showContents: that.controller.getSectionShowContents(),
            enableForwardNavigation: true,
            enableBackNavigation: ! that.popScreenOnExit,
            showAsContinueButton: that.popScreenOnExit,
            enableNavigation: true
            // enableNavigation -- defaults to true; false to disable everything...
            // enableForwardNavigation -- forward swipe and button
            // enableBackNavigation -- backward swipe and button
        };
        
        that.pageChangeActionLockout = true;

        // disable events on the outgoing screen
        if (that.activeScreen) {
            that.activeScreen.recursiveUndelegateEvents();
        }
        
        //If the screen is slow to activate display a loading dialog.
        //This is going to be useful if the screen gets data from a remote source.
        var activateTimeout = window.setTimeout(function(){
            that.showSpinnerOverlay("Loading...");
        }, 400);

        // make sure screen knows about this screen manager
        screen._screenManager = that;

        //A better way to do this might be to pass a controller interface object to 
        //onActivate that can trigger screen refreshes, as well as goto other screens.
        //(We would not allow screens to access the controller directly).
        //When the screen changes, we could disconnect the interface to prevent the old
        //screens from messing with the current screen.
        // 
        // pass in 'render': true to indicate that we will be rendering upon successful
        // completion.
        screen.onActivate($.extend({render:true},ctxt,{success:function(renderContext){
                if(renderContext){
                    $.extend(that.renderContext, renderContext);
                }
                // if neither forward or backward navigation is enabled, disable all navigations.
                if( !that.renderContext.enableBackNavigation &&
                    !that.renderContext.enableForwardNavigation ) {
                    //If we try to render a jqm nav without buttons we get an error
                    //so this flag automatically disables nav in that case.
                    that.renderContext.enableNavigation = false;
                }

                // make the new screen the active screen (...no-op if redraw).
                that.activeScreen = screen;

                // render screen
                screen.render($.extend({},ctxt,{success: function() {
                    
                    if ( that.currentPageEl == screen.$el ) {
                        // overwrites the old $el in the DOM at this point...
                        that.currentPageEl.replaceWith(screen.$el);
                    } else {
                        // record previous screen so we can delete it after moving on...
                        that.previousPageEl = that.currentPageEl;
                        that.currentPageEl = screen.$el;
                        window.$.mobile.pageContainer.append(that.currentPageEl);
                    }
                    
                    // this might double-reset the pageChangeActionLockout flag, but it does ensure it is reset
                    that.savedCtxt = $.extend({}, ctxt, {success: function() {
                            window.clearTimeout(activateTimeout);
                            that.hideSpinnerOverlay();
                            that.pageChangeActionLockout = false;
                            ctxt.success();
                        }});
                    // turn first child into a page...
                    //append it to the page container
                    // maybe need to drop spinner for jqMobile?: window.clearTimeout(activateTimeout);
                    window.$.mobile.changePage(that.currentPageEl, {
                        changeHash: false,
                        transition: transition,
                        allowSamePageTransition: true
                    });
                }}));
            }, failure: function(m) {
                that.savedCtxt = null;
                window.clearTimeout(activateTimeout);
                that.hideSpinnerOverlay();
                that.pageChangeActionLockout = false;
                ctxt.failure(m);
            }
        }));
    },
    gotoNextScreen: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append('screenManager.gotoNextScreen', 
            ((that.activeScreen != null) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        if (that.eventTimeStamp == evt.timeStamp) {
            ctxt.append('screenManager.gotoNextScreen.duplicateEvent');
            ctxt.success();
            return false;
        }
        that.eventTimeStamp = evt.timeStamp;
        return that.gotoNextScreenAction(ctxt);
    },
    gotoNextScreenAction: function(ctxt) {
        this.currentPageEl.css('opacity', '.5').fadeTo("fast", 1.0);
        var that = this;
        if(that.pageChangeActionLockout) {
            ctxt.append('screenManager.gotoNextScreen.ignoreDisabled');
            ctxt.success();
            return false;
        }
        that.pageChangeActionLockout = true;
        that.controller.gotoNextScreen($.extend({},ctxt,{success:function(){
                    that.pageChangeActionLockout = false; 
                    ctxt.success();
                },failure:function(m){
                    that.pageChangeActionLockout = false; 
                    ctxt.failure(m);
                }}));
        return false;
    },
    gotoPreviousScreen: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append('screenManager.gotoPreviousScreen', 
            ((that.activeScreen != null) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        if (that.eventTimeStamp == evt.timeStamp) {
            ctxt.append('screenManager.gotoPreviousScreen.duplicateEvent');
            ctxt.success();
            return false;
        }
        that.eventTimeStamp = evt.timeStamp;
        return that.gotoPreviousScreenAction(ctxt);
    },
    gotoPreviousScreenAction: function(ctxt) {
        this.currentPageEl.css('opacity', '.5').fadeTo("fast", 1.0);
        var that = this;
        if(that.pageChangeActionLockout) {
            ctxt.append('screenManager.gotoPreviousScreen.ignoreDisabled');
            ctxt.success();
            return false;
        }
        that.pageChangeActionLockout = true;
        that.controller.gotoPreviousScreen($.extend({},ctxt,{success:function(){ 
                    that.pageChangeActionLockout = false; 
                    ctxt.success();
                },failure:function(m){
                    that.pageChangeActionLockout = false; 
                    ctxt.failure(m);
                }}));
        return false;
    },
    showContents: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append('screenManager.showContents', 
            ((that.activeScreen != null) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        if (that.eventTimeStamp == evt.timeStamp) {
            ctxt.append('screenManager.showContents.duplicateEvent');
            ctxt.success();
            return false;
        }
        that.eventTimeStamp = evt.timeStamp;
        this.currentPageEl.css('opacity', '.5').fadeTo("fast", 1.0);
        var that = this;
        if(that.pageChangeActionLockout) {
            ctxt.append('screenManager.showContents.ignoreDisabled');
            ctxt.success();
            return false;
        }
        that.pageChangeActionLockout = true;
        that.controller.gotoContentsScreen($.extend({},ctxt,{success:function(){
                    that.pageChangeActionLockout = false; 
                    ctxt.success();
                },failure:function(m){
                    that.pageChangeActionLockout = false; 
                    ctxt.failure(m);
                }}));
        return false;
    },
    ignoreChanges: function(evt) {
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append('screenManager.ignoreChanges', 
            ((that.activeScreen != null) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
        that.controller.ignoreAllChanges($.extend({},ctxt,{success: function() {
                that.controller.leaveInstance(ctxt);
            }}));
    },
    saveChanges: function(evt) {
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append('screenManager.saveChanges', 
            ((that.activeScreen != null) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
        that.controller.saveAllChanges($.extend({},ctxt,{success: function() {
                that.controller.leaveInstance(ctxt);
            }}), false);
    },
    openOptions: function(evt) {
        var that = this;
        var $contentArea = $('#optionsPopup');
        $contentArea.empty().remove();
        var locales = opendatakit.getFormLocalesValue();
        // useful defaults...
        that.renderContext = {
            form_title: that.controller.getSectionTitle(),
            locales: locales,
            hasTranslations: (locales.length > 1),
            showContents: that.controller.getSectionShowContents()
        };
        that.activeScreen.$el.append(that.optionsTemplate(that.renderContext)).trigger('pagecreate');
        $( "#optionsPopup" ).popup( "open" );
    },
    openLanguagePopup: function(evt) {
        var that = this;
        $( "#optionsPopup" ).popup( "close" );
        var $contentArea = $('#languagePopup');
        $contentArea.empty().remove();
        var locales = opendatakit.getFormLocalesValue();
        // useful defaults...
        that.renderContext = {
            form_title: that.controller.getSectionTitle(),
            locales: locales,
            hasTranslations: (locales.length > 1),
            showContents: that.controller.getSectionShowContents()
        };
        that.activeScreen.$el.append(that.languageTemplate(that.renderContext)).trigger('pagecreate');
        $( "#languagePopup" ).popup( "open" );
    },
    setLanguage: function(evt) {
        var that = this;
        var ctxt = that.controller.newContext(evt);
        ctxt.append('screenManager.setLanguage', 
            ((that.activeScreen != null) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
        //Closing popups is important,
        //they will not open in the future if one is not closed.
        $( "#languagePopup" ).popup( "close" );
        this.controller.setLocale(ctxt, $(evt.target).attr("id"));
    },
    showScreenPopup: function(msg) {
        var that = this;
        var $contentArea = $('#screenPopup');
        $contentArea.empty().remove();
        var locales = opendatakit.getFormLocalesValue();
        // useful defaults...
        that.renderContext = {
            form_title: that.controller.getSectionTitle(),
            locales: locales,
            hasTranslations: (locales.length > 1),
            showContents: that.controller.getSectionShowContents(),
            message: msg.message
        };
        that.activeScreen.$el.append(that.screenTemplate(that.renderContext)).trigger('pagecreate');
        var $screenPopup = $( "#screenPopup" );
        $screenPopup.popup( "open" );
    },
    closeScreenPopup: function() {
        $( "#screenPopup" ).popup( "close" );
    },
    showSpinnerOverlay: function(msg) {
        window.$.mobile.loading( 'show', {
            text: msg.text,
            textVisible: true
        });
    },
    hideSpinnerOverlay: function() {
        window.$.mobile.loading( 'hide' );
    },
    removePreviousPageEl: function() {
        if( this.previousPageEl){
            var pg = this.previousPageEl;
            this.previousPageEl = null;
            pg.empty().remove();
        }
    },
    handlePagechange: function(evt){
        var that = this;
        var ctxt = that.savedCtxt;
        that.savedCtxt = null;
        
        if ( ctxt != null ) {
            ctxt.append('screenManager.handlePageChange.linked');
            if ( that.activeScreen ) {
                // TODO: unclear what proper action should be for a failure
                // during afterRender(). For now, the display ends up in an 
                // inconsistent state.
                that.activeScreen.afterRender($.extend({}, ctxt, {success: function() {
                    that.activeScreen.recursiveDelegateEvents();
                    that.removePreviousPageEl();
                    ctxt.success();
                }}));
            } else {
                that.removePreviousPageEl();
                ctxt.success();
            }
        } else {
            ctxt = this.controller.newContext(evt);
            shim.log('E','screenManager.handlePageChange.error');
            this.pageChangeActionLockout = false;
            ctxt.failure({message: "Internal error. Unexpected triggering of page change event."});
        }
    },
    disableImageDrag: function(evt){
        evt.preventDefault();
    }
});
});
