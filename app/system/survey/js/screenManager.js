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
/* jshint unused: vars */
define(['opendatakit','backbone','jquery', 'spinner', 'handlebars','screenTypes','text!templates/screenPopup.handlebars', 'text!templates/confirmationPopup.handlebars',
    'text!templates/optionsPopup.handlebars', 'text!templates/languagePopup.handlebars', 'handlebarsHelpers', 'text!templates/confirmExitPopup.handlebars', 'hammer',
        'jqueryHammer'],
function(opendatakit,  Backbone,  $,        spinner,   Handlebars,  screenTypes,  screenPopup, confirmationPopup,
     optionsPopup,                             languagePopup, _hh, confirmExitPopup, hammer, jqueryHammer) {
/* global odkCommon */
'use strict';
verifyLoad('screenManager',
    ['opendatakit','backbone','jquery','spinner','handlebars','screenTypes','text!templates/screenPopup.handlebars', 'text!templates/confirmationPopup.handlebars',
    'text!templates/optionsPopup.handlebars', 'text!templates/languagePopup.handlebars' , 'handlebarsHelpers', 'text!templates/confirmExitPopup.handlebars', 'hammer',
        'jqueryHammer'],
    [opendatakit,  Backbone,  $,        spinner,  Handlebars,  screenTypes,  screenPopup, confirmationPopup,
     optionsPopup,                             languagePopup, _hh, confirmExitPopup, hammer, jqueryHammer]);

return Backbone.View.extend({
    el: "body",
    unknownScreenError: {message:"Internal Error: Unable to determine current screen."},
    screenTemplate: Handlebars.compile(screenPopup),
    confirmationTemplate: Handlebars.compile(confirmationPopup),
    optionsTemplate: Handlebars.compile(optionsPopup),
    languageTemplate: Handlebars.compile(languagePopup),
    confirmExitTemplate: Handlebars.compile(confirmExitPopup),
    eventTimeStamp: -1,
    pageChangeActionLockout: false, // to control double-swiping...
    renderContext:{},
    promptIndex: -1,
    events: {
        "click .odk-next-btn": "gotoNextScreen",
        "click .odk-prev-btn": "gotoPreviousScreen",
        "click .odk-options-btn": "openOptions",
        "click .languageMenu": "openLanguagePopup",
        "click .language": "setLanguage",
        "click .ignore-changes-and-exit": "confirmExitPopup",
        "click .save-incomplete-and-exit": "saveChanges",
        "click .finalize-and-exit": "finalizeChanges",
        "click .show-contents": "showContents",
        "dragstart img": "disableImageDrag",
        "click #exit": "ignoreChanges",
        "click #cancel": "closeConfirmExitPopup",
        "click #ok-btn": "closeScreenPopup",
        "click #yes-btn": "handleConfirmation",
        "click #no-btn": "closeConfirmationPopup",
        "swipeleft body": "gotoNextScreen",
        "swiperight body": "gotoPreviousScreen"
    },
    initialize: function(options){
        this.controller = options.controller;
        this.$el = $('body');
        this.$el.hammer();
    },
    cleanUpScreenManager: function(ctxt){
        this.pageChangeActionLockout = false;
        this.displayWaiting(ctxt);
    },
    enableSwipeNavigation: function() {
        var that = this;
        var needToDelete = false;
        var swipeLeftEvent = "swipeleft";
        var swipeRightEvent = "swiperight";

        if (!that.events.hasOwnProperty(swipeLeftEvent)) {
            that.events[swipeLeftEvent] = "gotoNextScreen";
            needToDelete = true;
        }

        if (!that.events.hasOwnProperty(swipeRightEvent)) {
            that.events[swipeRightEvent] = "gotoPreviousScreen";
            needToDelete = true;
        }

        if (needToDelete) {
            for (var propName in that.events){
                odkCommon.log('D',"screenManager.enableSwipeNavigation - propName=" +  propName + " event value=" + that.events[propName]);
            }

            // Need to redelegate the swipe events here
            that.delegateEvents();
        }
    },
    disableSwipeNavigation: function() {
        var that = this;
        var needToDelete = false;

        var swipeLeftEvent = "swipeleft";
        var swipeRightEvent = "swiperight";

        if (that.events.hasOwnProperty(swipeLeftEvent)) {
            delete that.events[swipeLeftEvent];
            needToDelete = true;
        }

        if (that.events.hasOwnProperty(swipeRightEvent)) {
            delete that.events[swipeRightEvent];
            needToDelete = true;
        }
        if (needToDelete) {
            for (var propName in that.events){
                odkCommon.log('D',"screenManager.disableSwipeNavigation - propName=" +  propName + " event value=" + that.events[propName]);
            }
            // Need to redelegate the swipe events here
            that.delegateEvents();
        }
    },
    displayWaiting: function(ctxt){
        var that = this;
        ctxt.log('D',"screenManager.displayWaiting",
            (that.activeScreen === null || that.activeScreen === undefined) ? "activeScreenIdx: null" : ("activeScreenIdx: " + that.activeScreen.promptIdx));
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
    beforeMove: function(isStrict, advancing, validateValues) {
        if ( this.activeScreen ) {
            return this.activeScreen.beforeMove(isStrict, advancing, validateValues);
        } else {
            return null;
        }
    },
    refreshScreen: function(ctxt) {
        var that = this;
        that.commonDrawScreen($.extend({},ctxt,{
			failure: function(m) {
				// add a terminal context to display the pop-up message
				// If the error caused a rolling-back of data values, as indicated
				// by m.rolledBack === true, then refresh the screen (to update
				// values to those from database) before displaying the pop-up message.
				var opPath = that.controller.getCurrentScreenPath();
				if ( m !== undefined && m !== null && m.rolledBack ) {
					// unwind and re-draw the current screen to restore the database values on it; then display error message
					var refreshCtxt = that.controller.newCallbackContext("screenManager:refreshScreen,rolledBack");
					ctxt.setTerminalContext($.extend({}, refreshCtxt, {
						success: function() {
							that.refreshScreen($.extend({}, refreshCtxt, {
								success: function() {
									refreshCtxt.setTerminalContext(that.controller._synthesizePopupContext(opPath, m));
									refreshCtxt.success();
								}, 
								failure: function(m2) {
									refreshCtxt.setTerminalContext(that.controller._synthesizePopupContext(opPath, m));
									refreshCtxt.failure(m2);
							}}));
						}, 
						failure: function(m2) {
							that.refreshScreen($.extend({}, refreshCtxt, {
								success: function() {
									refreshCtxt.setTerminalContext(that.controller._synthesizePopupContext(opPath, m));
									refreshCtxt.failure(m2);
								}, 
								failure: function(m3) {
									refreshCtxt.setTerminalContext(that.controller._synthesizePopupContext(opPath, m));
									// drop cause of m3
									refreshCtxt.failure(m2);
							}}));
						}}));
					ctxt.failure(m);
				} else {
					ctxt.setTerminalContext(that.controller._synthesizePopupContext(opPath, m));
					ctxt.failure(m);
				}
			}}));
     },
    setScreen: function(ctxt, screen, popScreenOnExit){
        var that = this;

        // remember this parameter to support refreshScreen...
        that.popScreenOnExit = popScreenOnExit ? true : false;

        // TODO: support sliding left and right transitions.
        // This requires additional info from controller as to what
        // direction we are going (forward or backward).
        var transition = 'none'; // 'slide' with data-direction="reverse" or not...;

        if (screen.type != "waiting") {
            if (opendatakit.getSettingValue('disableSwipeNavigation')) {
                that.disableSwipeNavigation();
            } else {
                that.enableSwipeNavigation();
            }
        }

        that.commonDrawScreen(ctxt, screen, transition);
    },
    commonDrawScreen: function(ctxt, screen, transition) {
        var that = this;
        var redraw = false;
        if ( screen === null || screen === undefined ) {
            screen = that.activeScreen;
            redraw = true;
            transition = 'none'; // redrawing!
            if ( that.activeScreen === null || that.activeScreen === undefined ) {
                ctxt.failure(that.unknownScreenError);
                return;
            }
        }
        var locales = opendatakit.getFormLocalesValue();
        // useful defaults...
        that.renderContext = {
            form_version: opendatakit.getSettingValue('form_version'),
            form_title: opendatakit.getCurrentSectionTitle(screen._section_name),
            locales: locales,
            dataTheme: "a",
            hasTranslations: (locales.length > 1),
            showHeader: true,
            showFooter: (opendatakit.getSettingValue('showFooter') ? opendatakit.getSettingValue('showFooter') : false),
            showContents: (!that.popScreenOnExit && opendatakit.getCurrentSectionShowContents(screen._section_name)),
            enableForwardNavigation: true,
            enableBackNavigation: true,
            showAsContinueButton: that.popScreenOnExit,
            enableNavigation: true,
            disableSwipeNavigation: (opendatakit.getSettingValue('disableSwipeNavigation') ? opendatakit.getSettingValue('disableSwipeNavigation') : false),
            hideNavigationButtonText: (opendatakit.getSettingValue('hideNavigationButtonText') ? opendatakit.getSettingValue('hideNavigationButtonText') : false)
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

        var cleanupCtxt = $.extend({}, ctxt, {success: function() {
                ctxt.log('D', "screenManager.commonDrawScreen.ultimate.success (via terminalContext)");
                if ( that.activeScreen ) {
                    // TODO: unclear what proper action should be for a failure
                    // during afterRender(). For now, the display ends up in an
                    // inconsistent state.
                    that.activeScreen.afterRender();
                    that.activeScreen.recursiveDelegateEvents();
                }
                window.clearTimeout(activateTimeout);
                that.hideSpinnerOverlay();
                that.pageChangeActionLockout = false;
                ctxt.success();
            }, failure: function(m) {
                ctxt.log('D', "screenManager.commonDrawScreen.ultimate.failure (via terminalContext)");
                window.clearTimeout(activateTimeout);
				that.hideSpinnerOverlay();
				that.pageChangeActionLockout = false;
				ctxt.failure(m);
            }});

        //A better way to do this might be to pass a controller interface object to
        //buildRenderContext that can trigger screen refreshes, as well as goto other screens.
        //(We would not allow screens to access the controller directly).
        //When the screen changes, we could disconnect the interface to prevent the old
        //screens from messing with the current screen.
        //
        // pass in 'render': true to indicate that we will be rendering upon successful
        // completion.
        var bcBase = that.controller.newCallbackContext("screenManager:commonDrawScreen - buildRenderContext");

        bcBase.setTerminalContext(cleanupCtxt);

        // In case there was a modal popup active before
        // the drawing this screen get rid of the modal-backdrop
        that.removeBootstrapModalBackdrop();

        screen.buildRenderContext($.extend({render:true},bcBase,{success:function(){

                bcBase.log('D', "screenManager.commonDrawScreen.screen.buildRenderContext.success");
                // patch up navigation settings for the screen...
                // if neither forward or backward navigation is enabled, disable all navigations.
                if ( !screen._renderContext.enableNavigation ) {
                    screen._renderContext.enableBackNavigation = false;
                    screen._renderContext.enableForwardNavigation = false;
                    screen._renderContext.enableNavigation = false;
                }

                if( !screen._renderContext.enableBackNavigation &&
                    !screen._renderContext.enableForwardNavigation ) {
                    //If we try to render a jqm nav without buttons we get an error
                    //so this flag automatically disables nav in that case.
                    screen._renderContext.enableNavigation = false;
                }

                // render screen
                bcBase.log('D', "screenManager.commonDrawScreen.screen.before.render");
                screen.render($.extend({},bcBase,{success: function() {

                    bcBase.log('D', "screenManager.commonDrawScreen.screen.render.success");
                    // find the previous screen...
                    var oldCurrentEl = that.$el.find(".odk-page");
                    // make the new screen the active screen (...no-op if redraw).
                    that.activeScreen = screen;
                    that.currentPageEl = screen.$el;
                    if ( oldCurrentEl[0] === that.currentPageEl[0] ) {
                        bcBase.log('D', "screenManager -- replaceWith()");
                        oldCurrentEl.replaceWith(that.currentPageEl);
                    } else {
                        bcBase.log('D', "screenManager -- after()");
                        oldCurrentEl.remove();
                        that.$el.find("#block-ui").after(that.currentPageEl);
                    }

                    bcBase.success();
                }}));
            }}));
    },
    gotoNextScreen: function(evt) {
        var that = this;
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        if (that.eventTimeStamp == evt.timeStamp) {
            odkCommon.log('I','screenManager.gotoNextScreen.duplicateEvent');
            evt.preventDefault();
            return;
        }
        that.eventTimeStamp = evt.timeStamp;
        var ctxt = that.controller.newContext(evt, "screenManager.gotoNextScreen");
        that.controller.enqueueTriggeringContext($.extend({},ctxt,{success:function() {
            ctxt.log('D','screenManager.gotoNextScreen',
                ((that.activeScreen !== null && that.activeScreen !== undefined) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
            that.gotoNextScreenAction(ctxt);
        }, failure: function(m) {
            ctxt.log('D','screenManager.gotoNextScreen -- prior event terminated with an error -- aborting!',
                ((that.activeScreen !== null && that.activeScreen !== undefined) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
            ctxt.failure(m);
        }}));
        evt.preventDefault();
    },
    gotoNextScreenAction: function(ctxt) {
        this.currentPageEl.css('opacity', '.5').fadeTo("fast", 1.0);
        var that = this;
        if(that.pageChangeActionLockout) {
            ctxt.log('D','screenManager.gotoNextScreen.ignoreDisabled');
            ctxt.success();
            return;
        }
        that.pageChangeActionLockout = true;
        that.controller.gotoNextScreen($.extend({},ctxt,{success:function(){
                    that.pageChangeActionLockout = false;
                    ctxt.success();
                },failure:function(m){
                    that.pageChangeActionLockout = false;
                    ctxt.failure(m);
                }}));
    },
    gotoPreviousScreen: function(evt) {
        var that = this;
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        if (that.eventTimeStamp == evt.timeStamp) {
            odkCommon.log('I','screenManager.gotoPreviousScreen.duplicateEvent');
            evt.preventDefault();
            return;
        }
        that.eventTimeStamp = evt.timeStamp;
        var ctxt = that.controller.newContext(evt, "screenManager.gotoPreviousScreen");
        that.controller.enqueueTriggeringContext($.extend({},ctxt,{success:function() {
            ctxt.log('D','screenManager.gotoPreviousScreen',
                ((that.activeScreen !== null && that.activeScreen !== undefined) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
            that.gotoPreviousScreenAction(ctxt);
        }, failure: function(m) {
            ctxt.log('D','screenManager.gotoPreviousScreen -- prior event terminated with an error -- aborting!',
                ((that.activeScreen !== null && that.activeScreen !== undefined) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
            ctxt.failure(m);
        }}));
        evt.preventDefault();
    },
    gotoPreviousScreenAction: function(ctxt) {
        this.currentPageEl.css('opacity', '.5').fadeTo("fast", 1.0);
        var that = this;
        if(that.pageChangeActionLockout) {
            ctxt.log('D','screenManager.gotoPreviousScreen.ignoreDisabled');
            ctxt.success();
            return;
        }
        that.pageChangeActionLockout = true;
        that.controller.gotoPreviousScreen($.extend({},ctxt,{success:function(){
                    that.pageChangeActionLockout = false;
                    ctxt.success();
                },failure:function(m){
                    that.pageChangeActionLockout = false;
                    ctxt.failure(m);
                }}));
    },
    showContents: function(evt) {
        $( "#optionsPopup" ).modal( "hide" );
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        var that = this;
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        if (that.eventTimeStamp == evt.timeStamp) {
            odkCommon.log('I','screenManager.showContents.duplicateEvent');
            evt.preventDefault();
            return;
        }
        that.eventTimeStamp = evt.timeStamp;
        that.currentPageEl.css('opacity', '.5').fadeTo("fast", 1.0);

        if(that.pageChangeActionLockout) {
            odkCommon.log('D','screenManager.showContents.pageChangeActionLockout active');
            evt.preventDefault();
            return;
        }

        that.pageChangeActionLockout = true;

        var ctxt = that.controller.newContext(evt, "screenManager.showContents");
        that.controller.enqueueTriggeringContext($.extend({},ctxt,{success:function() {
            ctxt.log('D','screenManager.showContents',
                ((that.activeScreen !== null && that.activeScreen !== undefined) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));

            that.controller.gotoContentsScreen($.extend({},ctxt,{success:function(){
                        that.pageChangeActionLockout = false;
                        ctxt.success();
                    },failure:function(m){
                        that.pageChangeActionLockout = false;
                        ctxt.failure(m);
                    }}));
        }, failure: function(m) {
            ctxt.log('D','screenManager.showContents -- prior event terminated with an error -- aborting!',
                ((that.activeScreen !== null && that.activeScreen !== undefined) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
			that.pageChangeActionLockout = false;
            ctxt.failure(m);
        }}));

        evt.preventDefault();
    },
    confirmExitPopup: function(evt) {
        var that = this;
        $( "#optionsPopup" ).modal( "hide" );
        var $contentArea = $('#confirmExitPopup');
        $contentArea.empty().remove();
        if ( that.activeScreen === null || that.activeScreen === undefined ) {
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            return;
        }
        var rc = (that.activeScreen && that.activeScreen._renderContext) ?
            that.activeScreen._renderContext : that.renderContext;
            that.activeScreen.$el.append(that.confirmExitTemplate(rc)).trigger('pagecreate');
        $( "#confirmExitPopup" ).modal();
    },
    closeConfirmExitPopup: function(evt) {
        $( "#confirmExitPopup" ).modal( "hide" );
    },
    ignoreChanges: function(evt) {
        $( "#confirmExitPopup").modal( "hide" );
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        var that = this;
        var ctxt = that.controller.newContext(evt, "screenManager.ignoreChanges");
        that.controller.enqueueTriggeringContext($.extend({},ctxt,{success:function() {
            ctxt.log('D','screenManager.ignoreChanges',
                ((that.activeScreen !== null && that.activeScreen !== undefined) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
            that.controller.ignoreAllChanges($.extend({},ctxt,{success: function() {
                    that.controller.leaveInstance(ctxt);
                }}));
        }, failure: function(m) {
            ctxt.log('D','screenManager.ignoreChanges -- prior event terminated with an error -- aborting!',
                ((that.activeScreen !== null && that.activeScreen !== undefined) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
            ctxt.failure(m);
        }}));
    },
    saveChanges: function(evt) {
        $( "#optionsPopup" ).modal( "hide" );
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        var that = this;
        var ctxt = that.controller.newContext(evt, "screenManager.saveChanges");
        that.controller.enqueueTriggeringContext($.extend({},ctxt,{success:function() {
            ctxt.log('D','screenManager.saveChanges',
                ((that.activeScreen !== null && that.activeScreen !== undefined) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
            that.controller.saveIncomplete($.extend({},ctxt,{success: function() {
                    that.controller.leaveInstance(ctxt);
                }}), false);
        }, failure: function(m) {
            ctxt.log('D','screenManager.saveChanges -- prior event terminated with an error -- aborting!',
                ((that.activeScreen !== null && that.activeScreen !== undefined) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
            ctxt.failure(m);
        }}));
    },
    finalizeChanges: function(evt) {
        $( "#optionsPopup" ).modal( "hide" );
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        var that = this;
        var ctxt = that.controller.newContext(evt, "screenManager.finalizeChanges");
        that.controller.enqueueTriggeringContext($.extend({},ctxt,{success:function() {
            ctxt.log('D','screenManager.finalizeChanges',
                ((that.activeScreen !== null && that.activeScreen !== undefined) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
            that.controller.gotoFinalizeAndTerminateAction(ctxt);
        }, failure: function(m) {
            ctxt.log('D','screenManager.finalizeChanges -- prior event terminated with an error -- aborting!',
                ((that.activeScreen !== null && that.activeScreen !== undefined) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
            ctxt.failure(m);
        }}));
    },
    openOptions: function(evt) {
        var that = this;
        var $contentArea = $('#optionsPopup');
        $contentArea.empty().remove();
        if ( that.activeScreen === null || that.activeScreen === undefined ) {
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            return;
        }
        var rc = (that.activeScreen && that.activeScreen._renderContext) ?
            that.activeScreen._renderContext : that.renderContext;
        that.activeScreen.$el.append(that.optionsTemplate(rc)).trigger('pagecreate');
        //$('#optionsPopup').enhanceWithin().popup();
        //$( "#optionsPopup" ).popup( "open" );
        $( "#optionsPopup" ).modal();
    },
    openLanguagePopup: function(evt) {
        var that = this;
        $( "#optionsPopup" ).modal( "hide" );
        var $contentArea = $('#languagePopup');
        $contentArea.empty().remove();
        if ( that.activeScreen === null || that.activeScreen === undefined ) {
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            return;
        }
        var rc = (that.activeScreen && that.activeScreen._renderContext) ?
            that.activeScreen._renderContext : that.renderContext;
        that.activeScreen.$el.append(that.languageTemplate(rc)).trigger('pagecreate');
        //$('#languagePopup').enhanceWithin().popup();
        //$( "#languagePopup" ).popup( "open" );
        $( "#languagePopup" ).modal();
    },
    setLanguage: function(evt) {
        var that = this;
        //Closing popups is important,
        //they will not open in the future if one is not closed.
        $( "#languagePopup" ).modal( "hide" );
        var ctxt = that.controller.newContext(evt, "screenManager.setLanguage");
        that.controller.enqueueTriggeringContext($.extend({},ctxt,{success:function() {
            ctxt.log('D','screenManager.setLanguage',
                ((that.activeScreen !== null && that.activeScreen !== undefined) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
            that.controller.setLocale(ctxt, $(evt.target).attr("id"));
        }, failure: function(m) {
            ctxt.log('D','screenManager.setLanguage -- prior event terminated with an error -- aborting!',
                ((that.activeScreen !== null && that.activeScreen !== undefined) ? ("px: " + that.activeScreen.promptIdx) : "no current activeScreen"));
            ctxt.failure(m);
        }}));
    },
    showScreenPopup: function(msg) {
        var that = this;
        var $contentArea = $('#screenPopup');
        $contentArea.empty().remove();
        if ( that.activeScreen === null || that.activeScreen === undefined ) {
            // we don't have an active screen!!!
            return;
        }
        var rc = (that.activeScreen && that.activeScreen._renderContext) ?
            that.activeScreen._renderContext : that.renderContext;
        var rcWithMsg = $.extend({ message: { text: msg.message} }, rc);
        that.activeScreen.$el.append(that.screenTemplate(rcWithMsg)).trigger('pagecreate');
        //var $screenPopup = $( "#screenPopup" );
        //$('#screenPopup').enhanceWithin().popup();  // calling the popup plugin
        //$screenPopup.popup( "open" );       // opening the popup
        $('#screenPopup').modal();
    },
    closeScreenPopup: function() {
        $( "#screenPopup" ).modal( "hide" );   // closing the popup
    },
    showConfirmationPopup: function(msg) {
        var that = this;
        that.promptIndex = msg.promptIndex;
        var $contentArea = $('#confirmationPopup');
        $contentArea.empty().remove();
        if ( that.activeScreen === null || that.activeScreen === undefined ) {
            // we don't have an active screen!!!
            return;
        }
        var rc = (that.activeScreen && that.activeScreen._renderContext) ?
            that.activeScreen._renderContext : that.renderContext;
        var rcWithMsg = $.extend({message: msg.message}, rc);
        that.activeScreen.$el.append(that.confirmationTemplate(rcWithMsg)).trigger('pagecreate');
        var $confirmationPopup = $( "#confirmationPopup" );
        //$('#confirmationPopup').enhanceWithin().popup();
        //$confirmationPopup.popup( "open" );
        $confirmationPopup.modal();
    },
    handleConfirmation: function() {
        var that = this;
        if ( that.activeScreen !== null && that.activeScreen !== undefined ) {
            that.activeScreen.handleConfirmation(that.promptIndex);
        }
        $( "#confirmationPopup" ).modal( "hide" );
    },
    closeConfirmationPopup: function() {
        $( "#confirmationPopup" ).modal( "hide" );
    },
    showSpinnerOverlay: function(msg) {
        // window.$.mobile.loading( 'show', {
            // text: msg.text,
            // textVisible: true
        // });
        $('body').waitMe({
            effect: 'roundBounce',
            text: 'Loading ...',
            bg: 'rgba(255,255,255,0.7)',
            color:'#000',
            sizeW:'',
            sizeH:''
        });
    },
    hideSpinnerOverlay: function() {
        //window.$.mobile.loading( 'hide' );
        $('body').waitMe('hide');
    },
    removeBootstrapModalBackdrop: function() {
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
    },
    disableImageDrag: function(evt){
        evt.preventDefault();
    }
});
});
