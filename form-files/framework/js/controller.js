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

        if ( intIndex == null ) {
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

        if ( intIndex == null ) {
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

        if ( intIndex == null ) {
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

        if ( intIndex == null ) {
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
    gotoPreviousScreen: function(ctxt){
        var that = this;
        ctxt.append('controller:gotPreviousScreen');
        var opPath = that.getCurrentScreenPath();
        that.beforeMove($.extend({}, ctxt,{
            success: function() {
                ctxt.append("gotoPreviousScreen.beforeMove.success", "px: " +  opPath);
                if (shim.hasScreenHistory(opendatakit.getRefId())) {
                    ctxt.append("gotoPreviousScreen.beforeMove.success.hasScreenHistory", "px: " +  opPath);
                    var operationPath = shim.popScreenHistory(opendatakit.getRefId());
                    var controllerState = shim.getControllerState(opendatakit.getRefId());
                    if ( controllerState == 'a' ) {
                        ctxt.append("gotoPreviousScreen.beforeMove.success.unexpectedControllerState", "px: " +  operationPath);
                        console.error("ERROR! unexpectedControllerState px: " +  operationPath);
                        alert("ERROR! unexpectedControllerState px: " +  operationPath);
                    }
                    that.gotoScreenPath(ctxt, operationPath, {omitPushOnReturnStack:true});
                } else {
                    ctxt.append("gotoPreviousScreen.beforeMove.success.noPreviousPage", "px: " +  opPath);
                    // transition to the start of the form.
                    // pop ctxt
                    that.gotoScreenPath($.extend({},ctxt,{
                        success:function() {
                            ctxt.failure({message: "Returning to start of form."});
                        }}),opendatakit.initialScreenPath);
                }
            },
            failure: function(m) {
                ctxt.append("gotoPreviousScreen.beforeMove.failure", "px: " +  opPath);
                // should stay on this screen...
                that.screenManager.showScreenPopup(m); 
                ctxt.failure(m);
            }
        }), false);
    },
    /**
     * Get 'op' at 'path'. If it is anything but a 'begin_screen', we 
     * step through and process it, until we land on a 'begin_screen'
     * operation.
     *
     * pass the 'begin_screen' operation into the ctxt success callback.
     */
    _gotoScreenPathHelper: function(ctxt, path, state) {
        var that = this;
        var op = that.getOperation(path);
        if ( op != null ) {
            try {
                // ***The order of the else-if statements below is very important.***
                // i.e., First test if the '_parsed_condition' (function constructed 
                // from closure of the 'condition' column) is false, and skip to the next 
                // question if it is; if the '_parsed_condition' is true or not
                // present, then execute the 'goto'
                switch ( op._token_type ) {
                case "goto_label":
                    // jump to a label. This may be conditional...
                    if('_parsed_condition' in op && !op._parsed_condition()) {
                        var path = that.getNextOperationPath(op._section_name + "/" + op.operationIdx);
                        if ( path != null ) {
                                that._gotoScreenPathHelper(ctxt, path);
                    } else {
                            ctxt.failure(that.moveFailureMessage);
                        }
                    } else {
                        var path = that.getOperationPath(op._section_name + "/" + op._branch_label);
                        if ( path != null ) {
                                that._gotoScreenPathHelper(ctxt, path);
                        } else {
                            ctxt.failure(that.moveFailureMessage);
                        }
                    }
                    break;
                case "assign":
                    // do an assignment statement.
                    // defer the database update until we reach a screen.
                    database.setValueDeferredChange(op.name, op._parsed_value());
                    var path = that.getNextOperationPath(op._section_name + "/" + op.operationIdx);
                    if ( path != null ) {
                            that._gotoScreenPathHelper(ctxt, path);
                    } else {
                        ctxt.failure(that.moveFailureMessage);
                    }
                    break;
                case "back_in_history":
                    // pop the history stack, and render that screen.
                    var processOps = false;
                    var priorPageState = null;
                    var priorPagePath;
                    if (shim.hasScreenHistory(opendatakit.getRefId())) {
                        priorPagePath = shim.popScreenHistory(opendatakit.getRefId());
                        priorPageState = shim.getControllerState(opendatakit.getRefId());
                    } else {
                        processOps = true;
                        priorPagePath = opendatakit.initialScreenPath;
                    }
                    var backop = that.getOperation(priorPagePath);
                    if ( backop != null ) {
                            if ( processOps ) {
                            that._gotoScreenPathHelper(ctxt, backop._section_name + "/" + backop.operationIdx, priorPageState);
                            } else {
                                // normal case...
                            ctxt.success(backop, {omitPushOnReturnStack:true});
                            }
                    } else {
                        ctxt.failure(that.moveFailureMessage);
                    }
                    break;
                case "do_section":
                    // state is 'a' if we are returning from an exit_section
                    if ( state == 'a' ) {
                        var path = that.getNextOperationPath(op._section_name + "/" + op.operationIdx);
                        if ( path != null ) {
                                that._gotoScreenPathHelper(ctxt, path);
                        } else {
                            ctxt.failure(that.moveFailureMessage); 
                        }
                    } else {
                        // push the prior rendered screen onto the stack before we mark the 'do_section' callout
                        shim.pushSectionScreenState(opendatakit.getRefId());
                        // save our op with note to advance immediately on return...
                        shim.setSectionScreenState(opendatakit.getRefId(), op._section_name + "/" + op.operationIdx, 'a');
                        // start at operation 0 in the new section
                        that._gotoScreenPathHelper(ctxt, op._do_section_name + "/0");
                    }
                    break;
                case "exit_section":
                    if ( shim.hasSectionStack(opendatakit.getRefId()) ) {
                        var stackPath = shim.popSectionStack(opendatakit.getRefId());
                        var controllerState = shim.getControllerState(opendatakit.getRefId());
                        if ( stackPath == null ) {
                            // we have popped everything off -- reset to initial page
                            shim.clearSectionScreenState(opendatakit.getRefId());
                            stackPath = shim.getScreenPath(opendatakit.getRefId());
                            controllerState = shim.getControllerState(opendatakit.getRefId());
                        }
                        that._gotoScreenPathHelper(ctxt, stackPath, controllerState);
                    } else {
                        that.reset($.extend({},ctxt,{success:function() {
                                that._gotoScreenPathHelper(ctxt, opendatakit.initialScreenPath);
                            }}),true);
                    }
                    break;
                case "validate":
                    database.applyDeferredChanges($.extend({},ctxt,{
                        success:function() {
                            if ( shim.getControllerState( opendatakit.getRefId()) != 'v' ) {
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
                                            that._gotoScreenPathHelper(ctxt,next);
                                    } else {
                                        ctxt.failure(that.moveFailureMessage);
                                    }
                                }}), op._sweep_name);
                        }, failure:function(m) {
                            mdl.loaded = false;
                            database.cacheAllData($.extend({},ctxt,{success:function() {
                                ctxt.failure(m);
                            }, failure:function(m2) {
                                ctxt.failure(m);
                            }}), opendatakit.getCurrentInstanceId());
                        }}));
                    // on success, call advance. 
                    // on failure, we are done.
                    break;
                case "begin_screen":
                    ctxt.success(op);
                    break;
                }
            } catch (e) {
                console.error("controller._gotoScreenPathHelper.exception.strict px: " +
                                that.operationIdx + ' exception: ' + String(e));
                ctxt.failure({message: "Error in condition expression. See console log."});
                return;
            }
        } else {
            ctxt.failure(that.moveFailureMessage);
        }
    },
    gotoScreenPath:function(ctxt, path, options) {
        var that = this;
        if ( path == null ) {
            path = opendatakit.initialScreenPath;
        }
        if ( options == null ) {
            options = {};
        }
        try {
            var newctxt = $.extend({},ctxt,{
            success:function(operation, addedOptions) {
                database.applyDeferredChanges($.extend({},ctxt,{
                    success:function() {
                        if(operation) {
                            ctxt.append("controller.gotoScreenPath._gotoScreenPathHelper.success", "px: " + that.getCurrentScreenPath() + " nextPx: " + operation.operationIdx);
                            // todo -- change to use hash?
                            that.setScreen(ctxt, operation, $.extend({}, options, addedOptions));
                        } else {
                            ctxt.append("controller.gotoScreenPath._gotoScreenPathHelper.success", "px: " + that.getCurrentScreenPath() + " nextPx: no screen!");
                            that.gotoScreenPath(ctxt, opendatakit.initialScreenPath, addedOptions);
                        }
                    }, failure:function(m) {
                        mdl.loaded = false;
                        database.cacheAllData($.extend({},ctxt,{success:function() {
                            ctxt.append("controller.gotoScreenPath.failure", "px: " +  that.getCurrentScreenPath());
                            that.screenManager.showScreenPopup(m); 
                            ctxt.failure(m);
                        }, failure:function(m2) {
                            ctxt.append("controller.gotoScreenPath.failure", "px: " +  that.getCurrentScreenPath());
                            that.screenManager.showScreenPopup(m); 
                            ctxt.failure(m);
                        }}), opendatakit.getCurrentInstanceId());
                    }}));
            },
            failure:function(m) {
                mdl.loaded = false;
                database.cacheAllData($.extend({},ctxt,{success:function() {
                    ctxt.append("controller.gotoScreenPath.failure", "px: " +  that.getCurrentScreenPath());
                    that.screenManager.showScreenPopup(m); 
                    ctxt.failure(m);
                }, failure:function(m2) {
                    ctxt.append("controller.gotoScreenPath.failure", "px: " +  that.getCurrentScreenPath());
                    that.screenManager.showScreenPopup(m); 
                    ctxt.failure(m);
                }}), opendatakit.getCurrentInstanceId());
            }});
            that._gotoScreenPathHelper( newctxt, path);
        } catch (e) {
            console.error("controller.gotoScreenPath.exception: " + String(e));
            ctxt.failure({message: "Possible goto loop."});
        }
    },
    /**
     * Internal routine: called only from validateAllQuestions()
     */
    _validateQuestionHelper: function(ctxt, promptCandidate, promptList, nextPromptIdx) {
        var that = this;
        return function() {
            try {
                // pass in 'render':false to indicate that rendering will not occur.
                // call onActivate() to ensure that we have values (assignTo) initialized for validate()
                promptCandidate.onActivate( $.extend({render: false}, ctxt, {
                    success: function(renderContext) {
                        promptCandidate.validate( $.extend({}, ctxt, {
                            success: function() {
                                if ( promptList.length == nextPromptIdx ) {
                                    ctxt.append("_validateQuestionHelper.success.endOfValidationList");
                                    ctxt.success();
                                } else {
                                    var promptCandidate = that.getPrompt(promptList[nextPromptIdx]);
                                    if ( promptCandidate != null ) {
                                        var fn = that._validateQuestionHelper(ctxt,promptCandidate,promptList,nextPromptIdx+1);
                                        (fn)();
                                    } else {
                                        ctxt.failure(that.moveFailureMessage);
                                    }
                                }
                            },
                            failure: function(msg) {
                                ctxt.append("_validateQuestionHelper.validate.failure", "px: " + promptCandidate.promptIdx);
                                var nextOp = that.getOperation(promptCandidate._branch_label_enclosing_screen);
                                if ( nextOp != null ) {
                                    ctxt.failedOperation = nextOp;
                                    ctxt.failure(msg);
                                } else {
                                    ctxt.failure(that.moveFailureMessage);
                                }
                            }}));
                    }}) );
            } catch(e) {
                ctxt.append("_validateQuestionHelper.validate.exception", "px: " + promptCandidate.promptIdx + " exception: " + e);
                ctxt.failedPrompt = promptCandidate;
                ctxt.failure({message: "Exception during validation: " + e});
            }
        };
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
        if ( promptList.length == 0 ) {
            ctxt.success();
            return;
        }
        
        var promptCandidate = that.getPrompt(promptList[0]);
        if ( promptCandidate == null ) {
            // this is an error in the generation of the formDef.json. 
            // we treat it as 'success' for expedience, but display 
            // an ugly dialog to the user whenever this happens.
            shim.log('E', "Internal Error: null value in promptList[]");
            alert("Internal Error! Please regenerate your formDef.json");
            ctxt.success();
            return;
        }

        ctxt.failedOperation = null;
        
        // set the 'strict' attribute on the context to report all 
        // formula exceptions and errors.
        var oldvalue = ctxt.strict;
        ctxt.strict = true;
        // ensure we drop the spinner overlay when we complete...
        var newctxt = $.extend({},ctxt,{
            success: function() {
                ctxt.append("validateAllQuestions.success.noPrompt", "px: " + promptCandidate.promptIdx + " nextPx: no prompt!");
                that.screenManager.hideSpinnerOverlay();
                ctxt.strict = oldvalue;
                ctxt.success();
            },
            failure: function(m) {
                ctxt.failedOperation = this.failedOperation;
                if ( ctxt.failedOperation == null ) {
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
        that.screenManager.showSpinnerOverlay({text:"Validating..."});

        var fn = that._validateQuestionHelper(newctxt,promptCandidate,promptList,1);
        (fn)();
    },
    gotoNextScreen: function(ctxt, options){
        var that = this;
        var failurePop = function(m) {
            ctxt.append("gotoNextScreen.failure", "px: " +  that.getCurrentScreenPath());
            that.screenManager.showScreenPopup(m); 
            ctxt.failure(m);
        };
        that.beforeMove($.extend({}, ctxt, {
            success: function() {
                ctxt.append("gotoNextScreen.beforeMove.success", "px: " +  that.getCurrentScreenPath());
                var state = shim.getControllerState(opendatakit.getRefId());
                if ( state == 'p' ) {
                    if ( shim.hasScreenHistory(opendatakit.getRefId()) ) {
                        var stackPath = shim.popScreenHistory(opendatakit.getRefId());
                        // TODO: this is not rendering -- should it be the helper, with the ctxt 
                        // extended to match something like what is done in advanceToNextScreen?
                        that.gotoScreenPath(ctxt, stackPath, options );
                    } else {
                        that.reset($.extend({},ctxt,{success:function() {
                                that.gotoScreenPath(ctxt, opendatakit.initialScreenPath, options);
                            }}),true);
                    }
                } else {
                    // all prompt values have been saved Prompt validation has been run if we 
                    // are advancing and the screen.allowMove(advancing) test has passed.
                    // Now step through operations until we reach a begin_screen action.
                    var path = that.getNextOperationPath(that.getCurrentScreenPath());
                    if ( path != null ) {
                            // if the next operation is not a screen, gotoScreenPath will
                            // perform all operations until it comes to a screen.
                            that.gotoScreenPath(ctxt, path, options);
                    } else {
                        failurePop(that.moveFailureMessage);
                    }
                }
            },
            failure: failurePop
        }), true);
    },
    gotoContentsScreen: function(ctxt, options){
        var that = this;
        var failurePop = function(m) {
            ctxt.append("gotoContentsScreen.failure", "px: " +  that.getCurrentScreenPath());
            that.screenManager.showScreenPopup(m); 
            ctxt.failure(m);
        };
        that.beforeMove($.extend({}, ctxt, {
            success: function() {
                ctxt.append("gotoContentsScreen.beforeMove.success", "px: " +  that.getCurrentScreenPath());
                // all prompt values have been saved Prompt validation has been run if we 
                // are advancing and the screen.allowMove(advancing) test has passed.
                // Now step through operations until we reach a begin_screen action.
                var path = that.getOperationPath( that.getCurrentContentsScreenPath() );
                if ( path != null ) {
                        // if the next operation is not a screen, gotoScreenPath will
                        // perform all operations until it comes to a screen.
                        that.gotoScreenPath(ctxt, path, options);
                } else {
                    failurePop(that.moveFailureMessage);
                }
            },
            failure: failurePop
        }), false);
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
                    if ( shim.getControllerState( opendatakit.getRefId()) != 'v' ) {
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
            // this resets the RefId...
            // that.changeUrlHash(ctxt,qpl + kvList);
        }}),true);
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
