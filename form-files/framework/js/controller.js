'use strict';
/**
 * Manages the execution state and screen history of the overall survey, 
 * including form validation, saving and marking the form as 'complete'.
 *
 * Delegates the display of individual screens to the screenManager. 
 * On page advance, asks the screen manager whether advancing off the
 * screen is allowed. 
 *
 * Delegates the evaluation of individual constraints, etc. to the 
 * screens and thereby to the prompts within those screens.
 *
 */
define(['screenManager','opendatakit','database', 'mdl', 'parsequery', 'jquery' ],
function(ScreenManager,  opendatakit,  database,   mdl,   parsequery,  $ ) {
verifyLoad('controller',
    ['screenManager','opendatakit','database', 'mdl', 'parsequery', 'jquery' ],
    [ScreenManager,  opendatakit,  database,   mdl,   parsequery,  $]);
return {
    eventCount: 0,
    moveFailureMessage: { message: "Internal Error: Unable to determine next prompt." },
    screenManager : null,
    getCurrentScreenPath: function() {
        return shim.getScreenPath(opendatakit.getRefId());
    },
    getCurrentContentsScreenPath: function() {
        var currentPath = this.getCurrentScreenPath();
        if ( currentPath == null ) {
            shim.log('E',"controller.getCurrentContentsScreenPath: null currentScreenPath!");
            return;
        }
        var parts = currentPath.split("/");
        if ( parts.length < 2 ) {
            shim.log('E',"controller.getCurrentContentsScreenPath: invalid currentScreenPath: " + currentPath);
            return;
        }
 
        return parts[0] + '/_contents';
    },
    // NOTE: this is only here to avoid having screen depend upon database.
    commitChanges: function(ctxt) {
        database.applyDeferredChanges(ctxt);
    },
    getOperationPath: function(opPath) {
        
        if ( opPath == null ) {
            shim.log('E',"invalid opPath: null");
            return;
        }
        
        var parts = opPath.split("/");
        if ( parts.length < 2 ) {
            shim.log('E',"controller.getOperationPath: invalid opPath: " + opPath);
            return;
        }
        
        var formDef = opendatakit.getCurrentFormDef();
        var section = formDef.specification.sections[parts[0]];
        if ( section == null ) {
            shim.log('E',"controller.getOperationPath: no section matching opPath: " + opPath);
            return;
        }

        var intRegex = /^\d+$/;
        var intIndex;
        if(intRegex.test(parts[1])) {
            intIndex = parseInt(parts[1]);
        } else {
            intIndex = section.branch_label_map[parts[1]];
        }

        if ( intIndex === undefined || intIndex === null ) {
            shim.log('E',"controller.getOperationPath: no branch label matching opPath: " + opPath);
            return;
        }

        if ( intIndex >= section.operations.length ) {
            shim.log('E',"controller.getOperationPath: invalid opPath (beyond end of operations array): " + opPath);
            return;
        }
        
        var newPath = parts[0] + '/' + intIndex;
        return newPath;
    },
    getNextOperationPath: function(opPath) {
        
        if ( opPath == null ) {
            shim.log('E',"invalid opPath: null");
            return;
        }
        
        var parts = opPath.split("/");
        if ( parts.length < 2 ) {
            shim.log('E',"controller.getNextOperationPath: invalid opPath: " + opPath);
            return;
        }
        
        var formDef = opendatakit.getCurrentFormDef();
        var section = formDef.specification.sections[parts[0]];
        if ( section == null ) {
            shim.log('E',"controller.getNextOperationPath: no section matching opPath: " + opPath);
            return;
        }

        var intRegex = /^\d+$/;
        var intIndex;
        if(intRegex.test(parts[1])) {
            intIndex = parseInt(parts[1]);
        } else {
            intIndex = section.branch_label_map[parts[1]];
        }

        if ( intIndex === undefined || intIndex === null ) {
            shim.log('E',"controller.getNextOperationPath: no branch label matching opPath: " + opPath);
            return;
        }

        if ( intIndex >= section.operations.length ) {
            shim.log('E',"controller.getNextOperationPath: invalid opPath (beyond end of operations array): " + opPath);
            return;
        }
        
        intIndex++;
        var newPath = parts[0] + '/' + intIndex;

        if ( intIndex >= section.operations.length ) {
            shim.log('E',"controller.getNextOperationPath: advancing beyond end of operations array: " + newPath);
            return;
        }
        
        return newPath;
    },
    getOperation: function(opPath) {
        if ( opPath == null ) {
            shim.log('E',"invalid opPath: null");
            return;
        }
        
        var parts = opPath.split("/");
        if ( parts.length < 2 ) {
            shim.log('E',"controller.getOperation: invalid opPath: " + opPath);
            return;
        }
        
        var formDef = opendatakit.getCurrentFormDef();
        var section = formDef.specification.sections[parts[0]];
        if ( section == null ) {
            shim.log('E',"controller.getOperation: no section matching opPath: " + opPath);
            return;
        }
        var intRegex = /^\d+$/;
        var intIndex;
        if(intRegex.test(parts[1])) {
            intIndex = parseInt(parts[1]);
        } else {
            intIndex = section.branch_label_map[parts[1]];
        }

        if ( intIndex === undefined || intIndex === null ) {
            shim.log('E',"controller.getOperation: no branch label matching opPath: " + opPath);
            return;
        }

        if ( intIndex >= section.operations.length ) {
            shim.log('E',"controller.getOperation: invalid opPath (beyond end of operations array): " + opPath);
            return;
        }
        var op = section.operations[intIndex];
        return op;
    },
    getCurrentSectionPrompts: function() {
        var opPath = this.getCurrentScreenPath();
        
        if ( opPath == null ) {
            return [];
        }
        
        var parts = opPath.split("/");
        if ( parts.length < 2 ) {
            return [];
        }
        
        var formDef = opendatakit.getCurrentFormDef();
        var section = formDef.specification.sections[parts[0]];
        if ( section == null ) {
            return [];
        }
        
        return section.parsed_prompts;
    },
    getPrompt: function(promptPath) {
        if ( promptPath == null ) {
            shim.log('E',"invalid promptPath: null");
            return;
        }
        
        var parts = promptPath.split("/");
        if ( parts.length < 2 ) {
            shim.log('E',"controller.getPrompt: invalid promptPath: " + promptPath);
            return;
        }
        
        var formDef = opendatakit.getCurrentFormDef();
        var section = formDef.specification.sections[parts[0]];
        if ( section == null ) {
            shim.log('E',"controller.getPrompt: no section matching promptPath: " + promptPath);
            return;
        }
        var intRegex = /^\d+$/;
        var intIndex;
        if(intRegex.test(parts[1])) {
            intIndex = parseInt(parts[1]);
        }

        if ( intIndex === undefined || intIndex === null ) {
            shim.log('E',"controller.getPrompt: no branch label matching promptPath: " + promptPath);
            return;
        }

        if ( intIndex >= section.parsed_prompts.length ) {
            shim.log('E',"controller.getPrompt: invalid promptPath (beyond end of operations array): " + promptPath);
            return;
        }
        var prompt = section.parsed_prompts[intIndex];
        return prompt;
    },
    beforeMove: function(ctxt, advancing){
        ctxt.append('controller.beforeMove');
        var that = this;
        if ( that.screenManager ) {
            try {
                that.screenManager.beforeMove(ctxt, advancing);
            } catch(ex) {
                var e = (ex != null) ? ex.message + " stack: " + ex.stack : "undef";
                var opPath = that.getCurrentScreenPath();
                console.error("controller.beforeMove: Exception: " + e + " px: " + opPath);
                ctxt.append('controller.beforeMove.exception', e  + " px: " + opPath);
                ctxt.failure({message: "Exception while advancing to next screen."});
            }
        } else {
            ctxt.success();
        }
    },
    /**
     * Get 'op' at 'path'. If it is anything but a 'begin_screen', we 
     * step through and process it, until we land on a 'begin_screen'
     * operation.
     *
     * pass the 'begin_screen' operation into the ctxt success callback.
     */
    _doActionAtLoop: function(ctxt, op, action, options) {
        var that = this;
        var state = '';
        if ( options == null ) {
            options = {};
        }
        if ( action == null ) {
            action = op._token_type;
        }
        for (;;) {
            var path = op._section_name + "/" + op.operationIdx;
            try {
                switch ( action ) {
                case "goto_label":
                    // jump to a label. This may be conditional...
                    // i.e., First test if the '_parsed_condition' (function constructed 
                    // from closure of the 'condition' column) is false, and skip to the next 
                    // question if it is; if the '_parsed_condition' is true or not
                    // present, then execute the 'goto'
                    if('_parsed_condition' in op && !op._parsed_condition()) {
                        path = that.getNextOperationPath(path);
                    } else {
                        path = that.getOperationPath(op._section_name + "/" + op._branch_label);
                    }
                    break;
                case "assign":
                    // do an assignment statement.
                    // defer the database update until we reach a screen.
                    database.setValueDeferredChange(op.name, op._parsed_calculation());
                    // advance to the next operation.
                    path = that.getNextOperationPath(path);
                    break;
                case "advance":
                    state = shim.getControllerState(opendatakit.getRefId());
                    if ( state !== 'p' ) {
                        path = that.getNextOperationPath(path);
                        break;
                    }
                    // drop through...
                case "back_in_history":
                    // pop the history stack, and render that screen.
                    if (shim.hasScreenHistory(opendatakit.getRefId())) {
                        path = shim.popScreenHistory(opendatakit.getRefId());
                        
                        // TODO: should this be the case?
                        options.omitPushOnReturnStack = true;
                        
                        state = shim.getControllerState(opendatakit.getRefId());
                        if ( state === 'a' ) {
                            ctxt.append("controller._doActionAtLoop.back_in_history.unexpectedControllerState", "px: " + path);
                            shim.log('E',"controller._doActionAtLoop.back_in_history.unexpectedControllerState(a) px: " + path);
                            ctxt.failure(that.moveFailureMessage);
                            return;
                        }
                        // TODO:
                        // process state to options list...
                    } else {
                        path = opendatakit.initialScreenPath;
                        // TODO: should this be the case?
                        options.omitPushOnReturnStack = true;
                    }
                    break;
                case "do_section":
                    // state is 'a' if we are returning from an exit_section
                    state = shim.getControllerState(opendatakit.getRefId());
                    if ( state === 'a' ) {
                        path = that.getNextOperationPath(path);
                    } else {
                        // push the prior rendered screen onto the stack before we mark the 'do_section' callout
                        shim.pushSectionScreenState(opendatakit.getRefId());
                        // save our op with note to advance immediately on return...
                        shim.setSectionScreenState(opendatakit.getRefId(), path, 'a');
                        // start at operation 0 in the new section
                        path = op._do_section_name + "/0";
                    }
                    break;
                case "exit_section":
                    path = shim.popSectionStack(opendatakit.getRefId());
                    if ( path == null ) {
                        path = opendatakit.initialScreenPath;
                        // TODO: should this be the case?
                        options.omitPushOnReturnStack = true;
                    }
                    state = shim.getControllerState(opendatakit.getRefId());
                    //
                    // TODO: map state into options
                    break;
                case "validate":
                    database.applyDeferredChanges($.extend({},ctxt,{
                        success:function() {
                            if ( shim.getControllerState( opendatakit.getRefId()) !== 'v' ) {
                                // push the prompt we are leaving...
                                shim.pushSectionScreenState( opendatakit.getRefId());
                            }
                            // tag ourself as a 'v' node. Push onto stack.
                            shim.setSectionScreenState( opendatakit.getRefId(), op._section_name + "/" + op.operationIdx, 'v');
                            shim.pushSectionScreenState( opendatakit.getRefId());
                            that.validateAllQuestions($.extend({},ctxt,{
                                success:function() {
                                    // DONE: pop ourselves off.
                                    var refPath = shim.popScreenHistory( opendatakit.getRefId());
                                    if ( refPath != op._section_name + "/" + op.operationIdx ) {
                                        ctxt.append("unexpected mis-match of screen history states");
                                        ctxt.failure();
                                        return;
                                    }
                                    shim.setSectionScreenState( opendatakit.getRefId(), refPath, 'a');
                                    var next = that.getNextOperationPath(op._section_name + "/" + op.operationIdx);
                                    if ( next != null ) {
                                        op = that.getOperation(next);
                                        that._doActionAtLoop(ctxt, op, op._token_type, options );
                                    } else {
                                        ctxt.failure(that.moveFailureMessage);
                                    }
                                }}), op._sweep_name);
                        }}));
                    return;
                case "begin_screen":
                    ctxt.success(op, options);
                    return;
                }
                
                //
                // advance to the 'op' specified by the path.
                if ( path != null ) {
                    op = that.getOperation(path);
                    action = op._token_type;
                } else {
                    ctxt.failure(that.moveFailureMessage);
                    return;
                }
                
            } catch (e) {
                console.error("controller._doActionAtLoop.exception px: " +
                                path + ' exception: ' + String(e));
                ctxt.failure(that.moveFailureMessage);
                return;
            }
        }
    },
    doActionAt:function(ctxt, op, action, options) {
        var that = this;
        if ( op == null ) {
            ctxt.failure(that.moveFailureMessage);
        }
        
        try {
            // any deferred database updates will be written via the setScreen call.
            var newctxt = $.extend({},ctxt,{
                success:function(operation, modifiedOptions) {
                    if(operation) {
                        ctxt.append("controller.doActionAt._doActionAtLoop.success", "px: " + that.getCurrentScreenPath() + " nextPx: " + operation.operationIdx);
                        // todo -- change to use hash?
                        that.setScreen(ctxt, operation, modifiedOptions);
                    } else {
                        ctxt.append("controller.doActionAt._doActionAtLoop.success", "px: " + that.getCurrentScreenPath() + " nextPx: no screen!");
                        // do nothing -- the action already is showing the appropriate screen.
                    }
                }, failure:function(m) {
                    ctxt.append("controller.doActionAt.failure", "px: " +  that.getCurrentScreenPath());
                    that.screenManager.showScreenPopup(m); 
                    ctxt.failure(m);
            }});
            that._doActionAtLoop( newctxt, op, action, options);
        } catch (e) {
            console.error("controller.doActionAt.exception: " + String(e));
            ctxt.failure({message: "Possible goto loop."});
        }
    },
    /**
     * Upon exit:
     *   ctxt.success() -- for every prompt associated with this validationTag, 
     *                     if required() evaluates to true, then the field has a value
     *                     and if constraint() is defined, it also evaluates to true.
     *
     *   ctxt.failure(m) -- if there is a failed prompt, then:
     *                     setScreen(prompt, {popHistoryOnExit: true, omitPushOnReturnStack: true })
     *                      and always:
     *                     chainedCtxt to display showScreenPopup(m) after a 500ms delay.
     */
    validateAllQuestions: function(ctxt, validationTag){
        var that = this;
        var formDef = opendatakit.getCurrentFormDef();
        var section_names = formDef.specification.section_names;
        var i, j;
        var promptList = [];
        for ( i = 0 ; i < section_names.length ; ++i ) {
            var sectionName = section_names[i];
            var section = formDef.specification.sections[sectionName];
            var tagList = section.validation_tag_map[validationTag];
            if ( tagList != null ) {
                for ( j = 0 ; j < tagList.length ; ++j ) {
                    promptList.push(sectionName + "/" + tagList[j]);
                }
            }
        }
        if ( promptList.length === 0 ) {
            ctxt.success();
            return;
        }
        ctxt.failedOperation = null;
        
        // set the 'strict' attribute on the context to report all 
        // formula exceptions and errors.
        var oldvalue = ctxt.strict;
        ctxt.strict = true;
        
        var newctxt = $.extend({},ctxt,{
            success: function() {
                ctxt.append("validateAllQuestions.success", "px: " + that.getCurrentScreenPath());
                that.screenManager.hideSpinnerOverlay();
                ctxt.strict = oldvalue;
                ctxt.success();
            },
            failure: function(m) {
                ctxt.failedOperation = this.failedOperation;
                if ( ctxt.failedOperation == null ) {
                    that.screenManager.hideSpinnerOverlay();
                    that.screenManager.showScreenPopup(m);
                    ctxt.strict = oldvalue;
                    ctxt.failure(m);
                    return;
                }
                // set up chainedCtxt...
                var opShowing = (ctxt.failedOperation == null) ? that.getCurrentScreenPath() : ctxt.failedOperation.operationIdx;
                var popupbasectxt = that.newCallbackContext();
                var popupctxt = $.extend({}, popupbasectxt, {
                    success: function() {
                        popupbasectxt.append("validateAllQuestions.failure.setScreen.showScreenPopup", "px: " + opShowing);
                        setTimeout(function() {
                            popupbasectxt.append("validateAllQuestions.failure.setScreen.setTimeout", "px: " + that.getCurrentScreenPath());
                            if ( m && m.message ) {
                                that.screenManager.showScreenPopup(m);
                            }
                            popupbasectxt.success();
                        }, 500);
                    },
                    failure: function(m2) {
                        popupbasectxt.append("validateAllQuestions.failure.setScreen.showScreenPopup", "px: " + opShowing);
                        setTimeout(function() {
                            popupbasectxt.append("validateAllQuestions.failure.setScreen.setTimeout", "px: " + that.getCurrentScreenPath());
                            if ( m && m.message ) {
                                that.screenManager.showScreenPopup(m);
                            }
                            popupbasectxt.success();
                        }, 500);
                }});
                that.setScreen( $.extend({}, ctxt, {
                    success: function() {
                        that.screenManager.hideSpinnerOverlay();
                        ctxt.setChainedContext(popupctxt);
                        ctxt.strict = oldvalue;
                        ctxt.failure(m);
                    }, 
                    failure: function(m3) {
                        that.screenManager.hideSpinnerOverlay();
                        ctxt.setChainedContext(popupctxt);
                        ctxt.strict = oldvalue;
                        ctxt.failure(m);
                    }}), ctxt.failedOperation, 
                        { popHistoryOnExit: true, omitPushOnReturnStack: true } );
            }});
    	
    	// start our work -- display the 'validating...' spinner
        that.screenManager.showSpinnerOverlay({text:"Validating..."});
      
        var buildRenderDoneCtxt = $.extend({render: false}, newctxt, {
            success: _.after(promptList.length, function() {
                // all render contexts have been refreshed
                var currPrompt;
                var validateError;
                for ( var i = 0; i < promptList.length; i++ ) {
                    currPrompt = that.getPrompt(promptList[i]);
                    validateError = currPrompt._isValid(ctxt.strict);
                    if ( validateError != null ) {
                        break;
                    }
                }
                if ( validateError == null ) {
                    newctxt.append("validateQuestionHelper.success.endOfValidationList");
                    newctxt.success();
                } else {
                    newctxt.append("_validateQuestionHelper.validate.failure", "px: " + currPrompt.promptIdx);
                    var nextOp = that.getOperation(currPrompt._branch_label_enclosing_screen);
					if ( nextOp != null ) {
                        newctxt.failedOperation = nextOp;
                        newctxt.failure(validateError);
                    } else {
                        newctxt.failure(that.moveFailureMessage);
                    }
                }
            }),
            failure: _.once(function(m) {
                newctxt.failure(m);
            })
        });

        // refresh all render contexts (they may have constraint values
        // that could have changed -- e.g., filtered choice lists).
        $.each( promptList, function(idx, promptCandidatePath) {
        	var promptCandidate = that.getPrompt(promptCandidatePath);
        	promptCandidate.buildRenderContext(buildRenderDoneCtxt);
        });		
    },
    setScreen: function(ctxt, operation, passedInOptions){
        var that = this;
        var options;
        ctxt.append('controller.setScreen', "nextPx: " + operation.operationIdx);
        /**
         * Valid options:
         *  changeLocale: true/false
         *  omitPushOnReturnStack: true/false
         *  popHistoryOnExit: true/false
         */
        var newPath = that.getOperationPath(operation._section_name + "/" + operation.operationIdx);
        
        if ( newPath != null ) {
            var stateString = null;
            var oldPath = that.getCurrentScreenPath();
            if ( oldPath == newPath ) {
                // this is now necessary if we are redrawing this screen
                options = {
                    omitPushOnReturnStack : true
                };
                
                if(passedInOptions){
                    $.extend(options, passedInOptions);
                }
                
                stateString = shim.getControllerState(opendatakit.getRefId());
                
                if ( options.popHistoryOnExit ) {
                    stateString = 'p';
                }
            } else {
                options = {
                    omitPushOnReturnStack : false
                };
                if(passedInOptions){
                    $.extend(options, passedInOptions);
                }
                
                if ( options.popHistoryOnExit ) {
                    stateString = 'p';
                }
            }

            if (!options.omitPushOnReturnStack && oldPath != null) {
                shim.pushSectionScreenState( opendatakit.getRefId());
            }

            shim.setSectionScreenState( opendatakit.getRefId(), newPath, stateString);
            // Build a new Screen object so that jQuery Mobile is always happy...
            //
            var formDef = opendatakit.getCurrentFormDef();
            var screen_attrs = operation.screen;
            var screen_type = 'screen';
            var ScreenType, ExtendedScreenType, ScreenInstance;
            if (screen_attrs != null && ('screen_type' in screen_attrs)) {
                screen_type = screen_attrs.screen_type;
            }
            
            if (!(screen_type in formDef.specification.currentScreenTypes)) {
                ctxt.append('controller.setScreen.unrecognizedScreenType', screen_type);
                ctxt.failure({message: 'unknown screen_type'});
                return;
            }
            
            ScreenType = formDef.specification.currentScreenTypes[screen_type];
            ExtendedScreenType = ScreenType.extend(screen_attrs);
            ScreenInstance = new ExtendedScreenType({ _section_name: operation._section_name, _operation: operation });

            that.screenManager.setScreen($.extend({},ctxt,{
                success: function() {
                    var qpl = opendatakit.getHashString(opendatakit.getCurrentFormPath(), 
                                opendatakit.getCurrentInstanceId(), that.getCurrentScreenPath());
                    window.location.hash = qpl;
                    ctxt.success();
                }, failure: function(m) {
                    // undo screen change on failure...
                    ctxt.append('controller.setScreen.failureRecovery', 'hash: ' + window.location.hash);
                    if (!options.omitPushOnReturnStack && oldPath != null) {
                        shim.popScreenHistory( opendatakit.getRefId());
                    }
                    if ( oldPath == newPath ) {
                        ctxt.failure(m);
                    } else {
                        // set the screen back to what it was, then report this failure
                        var op = that.getOperation(oldPath);
                        if ( op != null ) {
                            that.setScreen($.extend({},ctxt,{success:function() {
                                // report the failure.
                                ctxt.failure(m);
                            }, failure: function(m2) {
                                // report the failure.
                                ctxt.failure(m);
                            }}), op);
                        } else {
                            ctxt.failure(m);
                        }
                    }
                }}), ScreenInstance, options.popHistoryOnExit || false );
        } else {
            ctxt.failure(that.moveFailureMessage);
        }
    },
    gotoPreviousScreen: function(ctxt, options){
        var that = this;
        ctxt.append('controller.gotoPreviousScreen');
        var opPath = that.getCurrentScreenPath();
        that.beforeMove($.extend({}, ctxt,{
            success: function() {
                ctxt.append("gotoPreviousScreen.beforeMove.success", "px: " +  opPath);
                var op = that.getOperation(opPath);
                that.doActionAt(ctxt, op, 'back_in_history', options);
            }, failure: function(m) {
                ctxt.append("gotoPreviousScreen.beforeMove.failure", "px: " +  opPath);
                that.screenManager.showScreenPopup(m); 
                ctxt.failure(m);
        }}), false);
    },
    gotoNextScreen: function(ctxt, options){
        var that = this;
        ctxt.append('controller.gotoNextScreen');
        var opPath = that.getCurrentScreenPath();
        that.beforeMove($.extend({}, ctxt, {
            success: function() {
                ctxt.append("gotoNextScreen.beforeMove.success", "px: " +  opPath);
                var op = that.getOperation(opPath);
                that.doActionAt(ctxt, op, 'advance', options);
            }, failure: function(m) {
                ctxt.append("gotoNextScreen.beforeMove.failure", "px: " +  opPath);
                that.screenManager.showScreenPopup(m); 
                ctxt.failure(m);
            }}), true);
    },
    gotoContentsScreen: function(ctxt, options){
        var that = this;
        ctxt.append('controller.gotoContentsScreen');
        var opPath = that.getCurrentScreenPath();
        that.beforeMove($.extend({}, ctxt, {
            success: function() {
                ctxt.append("gotoContentsScreen.beforeMove.success", "px: " +  opPath);
                var op = that.getOperation( that.getCurrentContentsScreenPath() );
                that.doActionAt(ctxt, op, op._token_type, options);
            }, failure: function(m) {
                ctxt.append("gotoContentsScreen.beforeMove.failure", "px: " +  opPath);
                that.screenManager.showScreenPopup(m); 
                ctxt.failure(m);
            }}), false);
    },
    gotoScreenPath:function(ctxt, path, options) {
        var that = this;
        if ( path == null ) {
            path = opendatakit.initialScreenPath;
        }
        var op = that.getOperation(path);
        if ( op == null ) {
            ctxt.failure(that.moveFailureMessage);
            return;
        }
        that.doActionAt(ctxt, op, op._token_type, options);
    },
    /*
     * Callback interface from ODK Survey (or other container apps) into javascript.
     * Handles all dispatching back into javascript from external intents
    */
    actionCallback:function(ctxt, promptPath, internalPromptContext, action, jsonString) {
        var that = this;
        var screenPath = that.getCurrentScreenPath();
        ctxt.append('controller.actionCallback', ((screenPath != null) ? ("px: " + screenPath) : "no current prompt"));
        
        // promptPath is the path to the prompt issuing the doAction.
        // prompts know their enclosing screen, so we don't need to 
        // worry about that...
        var prompt = that.getPrompt(promptPath);
        if ( prompt != null ) {
            try {
                // ask this page to then get the appropriate handler
                var handler = prompt.getCallback(promptPath, internalPromptContext, action);
                if ( handler != null ) {
                    handler( ctxt, internalPromptContext, action, jsonString );
                } else {
                    ctxt.append('controller.actionCallback.noHandler', promptPath);
                    console.error("actionCallback: ERROR - NO HANDLER ON PROMPT! " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action );
                    ctxt.failure({message: "Internal error. No matching handler for callback."});
                    return;
                }
            } catch (e) {
                ctxt.append('controller.actionCallback.exception', promptPath, e);
                console.error("actionCallback: EXCEPTION ON PROMPT! " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action + " exception: " + e);
                ctxt.failure({message: "Internal error. Exception while handling callback."});
                return;
            }
        } else {
            ctxt.append('controller.actionCallback.noMatchingPrompt', promptPath);
            console.error("actionCallback: ERROR - PROMPT NOT FOUND! " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action );
            ctxt.failure({message: "Internal error. Unable to locate matching prompt for callback."});
        }
    },
    ignoreAllChanges:function(ctxt) {
        database.ignore_all_changes(ctxt);
    },
    saveAllChanges:function(ctxt, asComplete) {
        var that = this;
        // NOTE: only success is reported up to shim here.
        // if there are any failures, the failure callback is only invoked if the save request
        // was initiated from within shim (via controller.opendatakitSaveAllChanges(), above).
        if ( asComplete ) {
            database.save_all_changes($.extend({},ctxt,{
                success:function(){
                    // push self for retry after validation failure...
                    var path = that.getCurrentScreenPath();
                    if ( path == null ) {
                        ctxt.append("unexpected null current screen path");
                        shim.saveAllChangesFailed( opendatakit.getRefId(), opendatakit.getCurrentInstanceId());
                        ctxt.failure();
                        return;
                    }
                    if ( shim.getControllerState( opendatakit.getRefId()) !== 'v' ) {
                        // push the prompt we are leaving...
                        shim.pushSectionScreenState( opendatakit.getRefId());
                    }
                    // tag ourself as a 'v' node. Push onto stack.
                    shim.setSectionScreenState( opendatakit.getRefId(), path, 'v');
                    shim.pushSectionScreenState( opendatakit.getRefId());
                    that.validateAllQuestions($.extend({},ctxt,{
                        success:function() {
                            // DONE: pop ourselves off.
                            var refPath = shim.popScreenHistory( opendatakit.getRefId());
                            if ( refPath != path ) {
                                ctxt.append("unexpected mis-match of screen history states");
                                shim.saveAllChangesFailed( opendatakit.getRefId(), opendatakit.getCurrentInstanceId());
                                ctxt.failure();
                                return;
                            }
                            shim.setSectionScreenState( opendatakit.getRefId(), path, 'a');
                            // everything validated... now mark the record as COMPLETE...
                            database.save_all_changes($.extend({},ctxt,{success:function(){
                                    // and advance to the next action...
                                    shim.saveAllChangesCompleted( opendatakit.getRefId(), opendatakit.getCurrentInstanceId(), true);
                                    ctxt.success();
                                },
                                failure:function(m) {
                                    shim.saveAllChangesFailed( opendatakit.getRefId(), opendatakit.getCurrentInstanceId());
                                    ctxt.failure(m);
                                }}), true);
                        }}), "finalize");
                }}), false);
        } else {
            database.save_all_changes($.extend({},ctxt,{success:function() {
                    shim.saveAllChangesCompleted( opendatakit.getRefId(), opendatakit.getCurrentInstanceId(), false);
                    ctxt.success();
                },
                failure:function(m) {
                    shim.saveAllChangesFailed( opendatakit.getRefId(), opendatakit.getCurrentInstanceId());
                    ctxt.failure(m);
                }}), false);
        }
    },
    changeUrlHash: function(ctxt,url){
        ctxt.append("controller.changeUrlHash", url);
        window.location.hash = url;
        parsequery.changeUrlHash(ctxt);
    },
    // return to the main screen (showing the available instances) for this form.
    leaveInstance:function(ctxt) {
        this.openInstance(ctxt, null);
    },
    createInstance: function(ctxt){
        var id = opendatakit.genUUID();
        this.openInstance(ctxt, id);
    },
    openInstance: function(ctxt, id, instanceMetadataKeyValueMap) {
        var that = this;
        database.applyDeferredChanges($.extend({},ctxt,{success:function() {
            that.reset($.extend({},ctxt,{success:function() {
                if ( id == null ) {
                    opendatakit.clearCurrentInstanceId();
                } else {
                    opendatakit.setCurrentInstanceId(id);
                }
                var kvList = "";
                if ( instanceMetadataKeyValueMap != null ) {
                    for ( var f in instanceMetadataKeyValueMap ) {
                        var v = instanceMetadataKeyValueMap[f];
                        kvList = kvList + "&" + f + "=" + escape(v);
                    }
                }
                var qpl = opendatakit.getHashString(opendatakit.getCurrentFormPath(), 
                            id, opendatakit.initialScreenPath);
                // this does not reset the RefId...
                parsequery._prepAndSwitchUI( ctxt, qpl, 
                            id, opendatakit.initialScreenPath,
                            opendatakit.getRefId(), false,
                            instanceMetadataKeyValueMap );
            }}),true);
        }}));
    },
    reset: function(ctxt,sameForm) {
        ctxt.append('controller.reset');
        shim.clearSectionScreenState(opendatakit.getRefId());
        opendatakit.clearCurrentInstanceId();
        if ( this.screenManager != null ) {
            // this asynchronously calls ctxt.success()...
            this.screenManager.cleanUpScreenManager(ctxt);
        } else {
            ctxt.append('controller.reset.newScreenManager');
            this.screenManager = new ScreenManager({controller: this});
            this.screenManager.cleanUpScreenManager(ctxt);
        }
    },
    setLocale: function(ctxt, locale) {
        var that = this;
        database.setInstanceMetaData($.extend({}, ctxt, {success: function() {
            var op = that.getOperation(that.getCurrentScreenPath());
            if ( op != null ) {
                        that.setScreen(ctxt, op, {changeLocale: true});
            } else {
                ctxt.failure(that.moveFailureMessage);
            }
        }}), '_locale', locale);
    },
    getSectionTitle: function() {
        var that = this;
        var opPath = that.getCurrentScreenPath();
        if ( opPath == null ) {
            return "";
        }
        
        var parts = opPath.split("/");
        if ( parts.length < 2 ) {
            return "";
        }
        
        var formDef = opendatakit.getCurrentFormDef();
        var sectionSettings = opendatakit.getSettingObject(formDef,parts[0]);
        if ( sectionSettings == null ) {
            return "";
        }
        
        return sectionSettings.display.title;
    },
    getSectionShowContents: function() {
        var that = this;
        var opPath = that.getCurrentScreenPath();
        if ( opPath == null ) {
            return false;
        }
        
        var parts = opPath.split("/");
        if ( parts.length < 2 ) {
            return false;
        }
        
        var formDef = opendatakit.getCurrentFormDef();
        var sectionSettings = opendatakit.getSettingObject(formDef,parts[0]);
        if ( sectionSettings == null ) {
            return false;
        }
        
        if ( 'showContents' in sectionSettings ) {
            return sectionSettings.showContents;
        }
        return true;
    },
    ///////////////////////////////////////////////////////
    // Logging context
    baseContext : {
        loggingContextChain: [],
        chainedCtxt: null,
        
        append : function( method, detail ) {
            var now = new Date().getTime();
            var log_obj = {method: method, timestamp: now, detail: detail };
            this.loggingContextChain.push( log_obj );
            // SpeedTracer Logging API
            var logger = window.console;
            if (logger && logger.timeStamp ) {
                logger.timeStamp(method);
            }
            var dlog =  method + " (seq: " + this.seq + " timestamp: " + now + ((detail == null) ? ")" : ") detail: " + detail);
            shim.log('D', dlog);
 
        },
        success: function(){
            this._log('S', 'success!');
            if ( this.chainedCtxt != null ) {
                this.chainedCtxt.success();
            }
        },
        
        failure: function(m) {
            this._log('E', 'failure! ' + (( m != null && m.message != null) ? m.message : ""));
            if ( this.chainedCtxt != null ) {
                this.chainedCtxt.failure();
            }
        },
        
        setChainedContext: function(ctxt) {
            var cur = this;
            while ( cur.chainedCtxt != null ) {
                cur = cur.chainedCtxt;
            }
            cur.chainedCtxt = ctxt;
        },

        _log: function( severity, contextMsg ) {
            var value = this.loggingContextChain[0];
            var flattened =    contextMsg + " contextType: " + value.method + " (" +
                value.detail + ") seqAtEnd: " + this.getCurrentSeqNo();
            shim.log(severity, flattened);
        }
    },
    
    newCallbackContext : function( actionHandlers ) {
        var that = this;
        that.eventCount = 1 + that.eventCount;
        var count = that.eventCount;
        var now = new Date().getTime();
        var detail =  "seq: " + count + " timestamp: " + now;
        var ctxt = $.extend({getCurrentSeqNo:function() { return that.eventCount;}},
            that.baseContext, {seq: count, loggingContextChain: []}, actionHandlers );
        ctxt.append('callback', detail);
        return ctxt;
    },
    newFatalContext : function( actionHandlers ) {
        var that = this;
        that.eventCount = 1 + that.eventCount;
        var count = that.eventCount;
        var now = new Date().getTime();
        var detail =  "seq: " + count + " timestamp: " + now;
        var ctxt = $.extend({getCurrentSeqNo:function() { return that.eventCount;}}, 
            that.baseContext, {seq: count, loggingContextChain: []}, actionHandlers );
        ctxt.append('fatal_error', detail);
        return ctxt;
    },
    newStartContext: function( actionHandlers ) {
        var that = this;
        that.eventCount = 1 + that.eventCount;
        var count = that.eventCount;
        var now = new Date().getTime();
        var detail =  "seq: " + count + " timestamp: " + now;
        var ctxt = $.extend({getCurrentSeqNo:function() { return that.eventCount;}}, 
            that.baseContext, {seq: count, loggingContextChain: []}, actionHandlers );
        ctxt.append('startup', detail);
        return ctxt;
    },
    newContext: function( evt, actionHandlers ) {
        var that = this;
        that.eventCount = 1 + that.eventCount;
        var count = that.eventCount;
        var detail =  "seq: " + count + " timestamp: " + evt.timeStamp + " guid: " + evt.handleObj.guid;
        var evtActual;
        var evtTarget;
        if ( 'currentTarget' in evt ) {
            detail += ' curTgt: ';
            evtActual = evt.currentTarget;
        } else {
            detail += ' tgt: ';
            evtActual = evt.target;
        }
        
        if ( evtActual == window) {
            detail += 'Window';
        } else {
            evtTarget = ('innerHTML' in evtActual) ? evtActual.innerHTML : evtActual.activeElement.innerHTML;
            detail += evtTarget.replace(/\s+/g, ' ').substring(0,80);
        }
        
        var ctxt = $.extend({getCurrentSeqNo:function() { return that.eventCount;}}, 
            that.baseContext, {seq: count, loggingContextChain: []}, actionHandlers );
        ctxt.append( evt.type, detail);
        return ctxt;
    }

};
});
