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
define(['screenManager','opendatakit','database', 'mdl', 'jquery', 'parsequery'],
function(ScreenManager,  opendatakit,  database,   mdl,   $, parsequery) {
window.controller = {
    eventCount: 0,
    screenManager : null,
    getCurrentScreenPath: function() {
        return shim.getScreenPath(opendatakit.getRefId());
    },
    // NOTE: this is only here to avoid having screen depend upon database.
    commitChanges: function(ctxt) {
        database.applyDeferredChanges(ctxt);
    },
    getOperationPath: function(ctxt, opPath) {
        
        if ( opPath == null ) {
            ctxt.failure({message: "invalid opPath: null"});
            return;
        }
        
        var parts = opPath.split("/");
        if ( parts.length < 2 ) {
            ctxt.append("controller.getOperationPath: invalid opPath: " + opPath);
            ctxt.failure({message: "invalid opPath: " + opPath});
            return;
        }
        
        var formDef = opendatakit.getCurrentFormDef();
        var section = formDef.logic_flow.sections[parts[0]];
        if ( section == null ) {
            ctxt.append("controller.getOperation: no section matching opPath: " + opPath);
            ctxt.failure({message: "invalid opPath: " + opPath});
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
            ctxt.append("controller.getOperationPath: no branch label matching opPath: " + opPath);
            ctxt.failure({message: "invalid opPath: " + opPath});
            return;
        }

        if ( intIndex >= section.operations.length ) {
            ctxt.append("controller.getOperationPath: invalid opPath (beyond end of operations array): " + opPath);
            ctxt.failure({message: "invalid opPath: " + opPath});
            return;
        }
        
        var newPath = parts[0] + '/' + intIndex;
        ctxt.success(newPath);
    },
    getNextOperationPath: function(ctxt, opPath) {
        
        if ( opPath == null ) {
            ctxt.failure({message: "invalid opPath: null"});
            return;
        }
        
        var parts = opPath.split("/");
        if ( parts.length < 2 ) {
            ctxt.append("controller.getNextOperationPath: invalid opPath: " + opPath);
            ctxt.failure({message: "invalid opPath: " + opPath});
            return;
        }
        
        var formDef = opendatakit.getCurrentFormDef();
        var section = formDef.logic_flow.sections[parts[0]];
        if ( section == null ) {
            ctxt.append("controller.getOperation: no section matching opPath: " + opPath);
            ctxt.failure({message: "invalid opPath: " + opPath});
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
            ctxt.append("controller.getNextOperationPath: no branch label matching opPath: " + opPath);
            ctxt.failure({message: "invalid opPath: " + opPath});
            return;
        }

        if ( intIndex >= section.operations.length ) {
            ctxt.append("controller.getNextOperationPath: invalid opPath (beyond end of operations array): " + opPath);
            ctxt.failure({message: "invalid opPath: " + opPath});
            return;
        }
        
        intIndex++;
        var newPath = parts[0] + '/' + intIndex;

        if ( intIndex >= section.operations.length ) {
            ctxt.append("controller.getNextOperationPath: advancing beyond end of operations array: " + newPath);
            ctxt.failure({message: "invalid opPath: " + newPath});
            return;
        }
        
        ctxt.success(newPath);
    },
    getOperation: function(ctxt, opPath) {
        if ( opPath == null ) {
            ctxt.failure({message: "invalid opPath: null"});
            return;
        }
        
        var parts = opPath.split("/");
        if ( parts.length < 2 ) {
            ctxt.append("controller.getOperation: invalid opPath: " + opPath);
            ctxt.failure({message: "invalid opPath: " + opPath});
            return;
        }
        
        var formDef = opendatakit.getCurrentFormDef();
        var section = formDef.logic_flow.sections[parts[0]];
        if ( section == null ) {
            ctxt.append("controller.getOperation: no section matching opPath: " + opPath);
            ctxt.failure({message: "invalid opPath: " + opPath});
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
            ctxt.append("controller.getOperation: no branch label matching opPath: " + opPath);
            ctxt.failure({message: "invalid opPath: " + opPath});
            return;
        }

        if ( intIndex >= section.operations.length ) {
            ctxt.append("controller.getOperation: invalid opPath (beyond end of operations array): " + opPath);
            ctxt.failure({message: "invalid opPath: " + opPath});
            return;
        }
        var op = section.operations[intIndex];
        ctxt.success(op);
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
        var section = formDef.logic_flow.sections[parts[0]];
        if ( section == null ) {
            return [];
        }
        
        return section.parsed_prompts;
    },
    getPrompt: function(ctxt, promptPath) {
        if ( promptPath == null ) {
            ctxt.failure({message: "invalid promptPath: null"});
            return;
        }
        
        var parts = promptPath.split("/");
        if ( parts.length < 2 ) {
            ctxt.append("controller.getPrompt: invalid promptPath: " + promptPath);
            ctxt.failure({message: "invalid promptPath: " + promptPath});
            return;
        }
        
        var formDef = opendatakit.getCurrentFormDef();
        var section = formDef.logic_flow.sections[parts[0]];
        if ( section == null ) {
            ctxt.append("controller.getPrompt: no section matching promptPath: " + promptPath);
            ctxt.failure({message: "invalid promptPath: " + promptPath});
            return;
        }
        var intRegex = /^\d+$/;
        var intIndex;
        if(intRegex.test(parts[1])) {
            intIndex = parseInt(parts[1]);
        }

        if ( intIndex == null ) {
            ctxt.append("controller.getPrompt: no branch label matching promptPath: " + promptPath);
            ctxt.failure({message: "invalid promptPath: " + promptPath});
            return;
        }

        if ( intIndex >= section.parsed_prompts.length ) {
            ctxt.append("controller.getPrompt: invalid promptPath (beyond end of operations array): " + promptPath);
            ctxt.failure({message: "invalid promptPath: " + promptPath});
            return;
        }
        var prompt = section.parsed_prompts[intIndex];
        ctxt.success(prompt);
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
                if (that.hasScreenHistory()) {
                    ctxt.append("gotoPreviousScreen.beforeMove.success.hasScreenHistory", "px: " +  opPath);
                    var operationPath = that.popScreenHistory();
                    that.gotoScreenPath(ctxt, operationPath, {omitPushOnReturnStack:true, reverse:true});
                } else {
                    ctxt.append("gotoPreviousScreen.beforeMove.success.noPreviousPage");
                    // display the 'no previous screen' screen message.
                    // then transition to the start of the form.
                    that.screenManager.noPreviousPage($.extend({}, ctxt,{
                        success: function() {
                            // pop ctxt
                            ctxt.append("gotoPreviousScreen.noScreens");
                            that.gotoScreenPath($.extend({},ctxt,{
                                success:function() {
                                    ctxt.failure({message: "Returning to start of form."});
                                }}),opendatakit.initialScreenPath);
                        }}));
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
    advanceToNextScreenHelper: function(ctxt, path) {
        var that = this;
        that.getOperation($.extend({},ctxt,{success:function(op) {
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
                        that.getNextOperationPath($.extend({},ctxt,{success:function(path){
                                that.advanceToNextScreenHelper(ctxt, path);
                            }, failure:function(m) {
                                ctxt.failure(m); 
                            }}), op._section_name + "/" + op.operationIdx);
                    } else {
                        that.getOperationPath($.extend({},ctxt,{success:function(path){
                                that.advanceToNextScreenHelper(ctxt, path);
                            }, failure:function(m) {
                                ctxt.failure(m); 
                            }}), op._section_name + "/" + op._branch_label);
                    }
                    break;
                case "assign":
                    // do an assignment statement.
                    // defer the database update until we reach a screen.
					database.setValueDeferredChange(op.name, op._parsed_value());
                    that.getNextOperationPath($.extend({},ctxt,{success:function(path){
                            that.advanceToNextScreenHelper(ctxt, path);
                        }, failure:function(m) {
                            ctxt.failure(m); 
                        }}), op._section_name + "/" + op.operationIdx);
                    break;
                case "back_in_history":
                    // pop the history stack, and render that screen.
                    var processOps = false;
                    var priorPagePath;
                    if (that.hasScreenHistory()) {
                        priorPagePath = that.popScreenHistory();
                    } else {
                        processOps = true;
                        priorPagePath = opendatakit.initialScreenPath;
                    }
                    that.getOperation($.extend({},ctxt,{success:function(op) {
                            if ( processOps ) {
                                that.advanceToNextScreenHelper(ctxt, op._section_name + "/" + op.operationIdx);
                            } else {
                                // normal case...
                                ctxt.success(op, {omitPushOnReturnStack:true, reverse:true});
                            }
                        }, failure:function(m) {
                            ctxt.failure(m); 
                        }}), priorPagePath);
                    break;
                case "do_section":
                    // push the section stack (TBD)
                    // start at operation 0 in the new section
                    that.getNextOperationPath($.extend({},ctxt,{success:function(path){
                            that.pushSectionStack(path);
                            that.advanceToNextScreenHelper(ctxt, op._do_section_name + "/0");
                        }, failure:function(m) {
                            ctxt.failure(m); 
                        }}), op._section_name + "/" + op.operationIdx);
                    break;
                case "exit_section":
                    if ( that.hasSectionStack() ) {
                        var stackPath = that.popSectionStack();
                        that.advanceToNextScreenHelper(ctxt, stackPath);
                    } else {
                        that.reset($.extend({},ctxt,{success:function() {
                                that.advanceToNextScreenHelper(ctxt, opendatakit.initialScreenPath);
                            }}),true);
                    }
                    break;
                case "validate":
                    that.getNextOperationPath($.extend({},ctxt,{
                        success:function(path){
							database.applyDeferredChanges($.extend({},ctxt,{
                                success:function() {
                                    // push self for retry after validation failure...
                                    that.pushSectionStack(op._section_name + "/" + op.operationIdx);
                                    that.validateAllQuestions($.extend({},ctxt,{
                                        just_report_failure: true,
                                        success:function() {
                                            // pop self upon success.
                                            that.popSectionStack();
                                            // and advance to the next action...
                                            that.advanceToNextScreenHelper(ctxt, path);
                                        },
                                        failure:function(m) {
                                            if ( this.failedOperation != null ) {
                                                // a validation failed
                                                // we should show this screen and this error toast.
                                                ctxt.success(this.failedOperation, { toast: m, pop_section_on_exit: true });
                                            } else {
                                                // other failure -- just show toast.
                                                ctxt.failure(m);
                                            }
                                        }    
                                    }), op._sweep_name);
                                }, failure:function(m) {
                                    mdl.loaded = false;
                                    database.cacheAllData($.extend({},ctxt,{success:function() {
                                        ctxt.failure(m);
                                    }, failure:function(m2) {
                                        ctxt.failure(m);
                                    }}), opendatakit.getCurrentInstanceId());
                                }}));
                        }, failure:function(m) {
                            ctxt.failure(m); 
                        }}), op._section_name + "/" + op.operationIdx);
                    // on success, call advance. 
                    // on failure, we are done.
                    break;
                case "begin_screen":
                    ctxt.success(op);
                    break;
                }
            } catch (e) {
                console.error("controller.advanceToNextScreenHelper.exception.strict px: " +
                                that.operationIdx + ' exception: ' + String(e));
                ctxt.failure({message: "Error in condition expression. See console log."});
                return;
            }
        }, failure:function(m) {
            ctxt.failure(m); 
        }}), path);
    },
    advanceToNextScreen: function(ctxt, path) {
        var that = this;
        try {
            var newctxt = $.extend({},ctxt,{
            success:function(screen, options) {
				database.applyDeferredChanges($.extend({},ctxt,{
                    success:function() {
                        ctxt.success(screen, options);
                    }, failure:function(m) {
                        mdl.loaded = false;
                        database.cacheAllData($.extend({},ctxt,{success:function() {
                            ctxt.failure(m);
                        }, failure:function(m2) {
                            ctxt.failure(m);
                        }}), opendatakit.getCurrentInstanceId());
                    }}));
            },
            failure:function(m) {
                mdl.loaded = false;
                database.cacheAllData($.extend({},ctxt,{success:function() {
                    ctxt.failure(m);
                }, failure:function(m) {
                    ctxt.failure(m);
                }}), opendatakit.getCurrentInstanceId());
            }});
            that.advanceToNextScreenHelper( newctxt, path);
        } catch (e) {
            console.error("controller.advanceToNextScreen.exception: " + String(e));
            ctxt.failure({
                message: "Possible goto loop."
            });
        }
    },
    validateQuestionHelper: function(ctxt, promptCandidate, promptList, nextPromptIdx) {
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
                                    ctxt.append("validateQuestionHelper.success.endOfValidationList", "px: " + promptCandidate.promptIdx + " nextPx: no prompt!");
                                    ctxt.success();
                                } else {
                                    that.getPrompt($.extend({},ctxt,{success:function(promptCandidate){
                                        var fn = that.validateQuestionHelper(ctxt,promptCandidate,promptList,nextPromptIdx+1);
                                        (fn)();
                                    }}), promptList[nextPromptIdx]);
                                }
                            },
                            failure: function(msg) {
                                ctxt.append("validateQuestionHelper.validate.failure", "px: " + promptCandidate.promptIdx);
                                that.getOperation($.extend({},ctxt,{success:function(op){
                                    ctxt.failedOperation = op;
                                    ctxt.failure(msg);
                                    }}), promptCandidate._section_name + "/" + promptCandidate._branch_label_enclosing_screen);
                            }}));
                    }}) );
            } catch(e) {
                ctxt.append("validateQuestionHelper.validate.exception", "px: " + promptCandidate.promptIdx + " exception: " + e);
                ctxt.failedPrompt = promptCandidate;
                ctxt.failure({message: "Exception during validation: " + e});
            }
        };
    },
    validateAllQuestions: function(ctxt, validationTag){
        var that = this;
        var formDef = opendatakit.getCurrentFormDef();
        var section_names = formDef.logic_flow.section_names;
        var i, j;
        var promptList = [];
        for ( i = 0 ; i < section_names.length ; ++i ) {
            var sectionName = section_names[i];
            var section = formDef.logic_flow.sections[sectionName];
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
        
        ctxt.failedOperation = null;
        
        that.getPrompt($.extend({},ctxt,{success:function(promptCandidate){
            // set the 'strict' attribute on the context to report all 
            // formula exceptions and errors.
            var oldvalue = ctxt.strict;
            ctxt.strict = true;
            // ensure we drop the spinner overlay when we complete...
            var newctxt = $.extend({},ctxt,{
                success: function() {
                    ctxt.append("validateQuestionHelper.success.noPrompt", "px: " + promptCandidate.promptIdx + " nextPx: no prompt!");
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
                    if ( ctxt.just_report_failure ) {
                        ctxt.failure(m);
                        return;
                    } else {
                        that.setScreen( $.extend({}, ctxt, {
                            success: function() {
                                setTimeout(function() {
                                    ctxt.append("validateQuestionHelper.failure.setScreen.setTimeout", "px: " + that.getCurrentScreenPath());
                                    that.screenManager.hideSpinnerOverlay();
                                    if ( m && m.message ) {
                                        that.screenManager.showScreenPopup(m);
                                    }
                                    ctxt.strict = oldvalue;
                                    ctxt.failure(m);
                                    }, 500);
                            }}), ctxt.failedOperation);
                    }
                }});
            that.screenManager.showSpinnerOverlay({text:"Validating..."});

            var fn = that.validateQuestionHelper(newctxt,promptCandidate,promptList,1);
            (fn)();
        }}), promptList[0]);
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
                // all prompt values have been saved Prompt validation has been run if we 
                // are advancing and the screen.allowMove(advancing) test has passed.
                // Now step through operations until we reach a begin_screen action.
                that.getNextOperationPath($.extend({}, ctxt, {
                    success: function(path) {
                        // if the next operation is not a screen, gotoScreenPath will
                        // perform all operations until it comes to a screen.
                        that.gotoScreenPath(ctxt, path, options);
                    },
                    failure: failurePop
                }), that.getCurrentScreenPath());
            },
            failure: failurePop
        }), true);
    },
    setScreen: function(ctxt, operation, passedInOptions){
        var that = this;
        var options;
        ctxt.append('controller.setScreen', "nextPx: " + operation.operationIdx);

        this.getOperationPath($.extend({},ctxt,{success:function(newPath) {
            if ( that.getCurrentScreenPath() == newPath ) {
                // this was redundant when we were using a hashChangeHandler
                // it is now necessary.    we are redrawing this screen
                options = {
                    omitPushOnReturnStack : true
                };
            } else {
                options = {
                    omitPushOnReturnStack : false
                };
            }
            
            if(passedInOptions){
                $.extend(options, passedInOptions);
            }

            var oldPath = that.getCurrentScreenPath();
            if (!options.omitPushOnReturnStack) {
                if ( oldPath != null ) {
                    that.pushScreenHistory(oldPath);
                }
            }
            shim.setScreenPath(opendatakit.getRefId(), newPath);
            // Build a new Screen object so that jQuery Mobile is always happy...
            //
            var formDef = opendatakit.getCurrentFormDef();
            var screen_attrs = operation.screen;
            var screen_type = 'screen';
            var ScreenType, ExtendedScreenType, ScreenInstance;
            if (screen_attrs != null && ('screen_type' in screen_attrs)) {
                screen_type = screen_attrs.screen_type;
            }
            
            if (!(screen_type in formDef.logic_flow.currentScreenTypes)) {
                ctxt.append('controller.setScreen.unrecognizedScreenType', screen_type);
                ctxt.failure({message: 'unknown screen_type'});
                return;
            }
            
            ScreenType = formDef.logic_flow.currentScreenTypes[screen_type];
            ExtendedScreenType = ScreenType.extend(screen_attrs);
            ScreenInstance = new ExtendedScreenType({ _section_name: operation._section_name, _operation: operation });

            that.screenManager.setScreen($.extend({},ctxt,{
                success: function() {
                    ctxt.success();
                    // queue to update the URL...
                    setTimeout(function() {
                        var qpl = opendatakit.getHashString(opendatakit.getCurrentFormPath(), 
                                    opendatakit.getCurrentInstanceId(), that.getCurrentScreenPath());
                        window.location.hash = qpl;
                    }, 0);
                }, failure: function(m) {
                    ctxt.failure(m);
                    setTimeout(function() {
                        var qpl = opendatakit.getHashString(opendatakit.getCurrentFormPath(), 
                                    opendatakit.getCurrentInstanceId(), oldPath);
                        window.location.hash = qpl;
                    }, 0);
                }}), ScreenInstance, options);
        }}), operation._section_name + "/" + operation.operationIdx );
    },
    /*
     * Callback interface from ODK Survey (or other container apps) into javascript.
     * Handles all dispatching back into javascript from external intents
    */
    actionCallback:function(ctxt, promptPath, internalPromptContext, action, jsonString) {
        var screenPath = this.getCurrentScreenPath();
        ctxt.append('controller.actionCallback', ((screenPath != null) ? ("px: " + screenPath) : "no current prompt"));
        
        // promptPath is the path to the prompt issuing the doAction.
        // prompts know their enclosing screen, so we don't need to 
        // worry about that...
        this.getPrompt($.extend({},ctxt,{success:function(prompt) {
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
        }, failure:function(m) {
            ctxt.append('controller.actionCallback.noMatchingPrompt', promptPath);
            console.error("actionCallback: ERROR - PROMPT NOT FOUND! " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action );
            ctxt.failure({message: "Internal error. Unable to locate matching prompt for callback."});
        }}), promptPath);
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
                    that.validateAllQuestions($.extend({},ctxt,{
                        success:function(){
                            database.save_all_changes($.extend({},ctxt,{
                                success:function() {
                                    shim.saveAllChangesCompleted( opendatakit.getRefId(), opendatakit.getCurrentInstanceId(), true);
                                    ctxt.success();
                                },
                                failure:function(m) {
                                    shim.saveAllChangesFailed( opendatakit.getRefId(), opendatakit.getCurrentInstanceId(), true);
                                    ctxt.failure(m);
                                }}), true);
                        }}), "finalize");
                }}), false);
        } else {
            database.save_all_changes($.extend({},ctxt,{
                success:function() {
                    shim.saveAllChangesCompleted( opendatakit.getRefId(), opendatakit.getCurrentInstanceId(), false);
                    ctxt.success();
                }}), false);
        }
    },
    // return to the main screen (showing the available instances) for this form.
    leaveInstance:function(event,ctxt) {
      var newhash = opendatakit.getHashString(opendatakit.getCurrentFormPath(), null, null);
      event.stopPropagation();
      event.stopImmediatePropagation();
      this.changeUrlHash(newhash, ctxt);
    },
    gotoScreenPath:function(ctxt, path, options) {
        var that = this;
        if ( path == null ) {
            path = opendatakit.initialScreenPath;
        }
        if ( options == null ) {
            options = {};
        }
        // navigate through all gotos, goto_ifs and labels.
        that.advanceToNextScreen($.extend({}, ctxt, {
            success: function(operation, addedOptions){
                if(operation) {
                    ctxt.append("controller.gotoScreenPath.advanceToNextScreen.success", "px: " + that.getCurrentScreenPath() + " nextPx: " + operation.operationIdx);
                    // todo -- change to use hash?
                    that.setScreen(ctxt, operation, $.extend({}, options, addedOptions));
                } else {
                    ctxt.append("controller.gotoScreenPath.advanceToNextScreen.success", "px: " + that.getCurrentScreenPath() + " nextPx: no screen!");
                    that.screenManager.noNextPage($.extend({}, ctxt,{
                        success: function() {
                            ctxt.append("controller.gotoScreenPath.noSreens");
                            that.gotoScreenPath(ctxt, opendatakit.initialScreenPath);
                    }}));
                }
            },
            failure: function(m) {
                ctxt.append("controller.gotoScreenPath.failure", "px: " +  that.getCurrentScreenPath());
                that.screenManager.showScreenPopup(m); 
                ctxt.failure(m);
            }
        }), path);
    },
    /**
     * Manage the swipe-back stack of where we have been.
     */
    hasScreenHistory: function() {
        return shim.hasScreenHistory(opendatakit.getRefId());
    },
    clearScreenHistory: function() {
        shim.clearScreenHistory(opendatakit.getRefId());
    },
    popScreenHistory: function() {
        return shim.popScreenHistory(opendatakit.getRefId());
    },
    pushScreenHistory: function(idx) {
        shim.pushScreenHistory(opendatakit.getRefId(), idx );
    },
    /**
     * Manage the stack of sections in which we are operating.
     */
    hasSectionStack: function() {
        return shim.hasSectionStack(opendatakit.getRefId());
    },
    clearSectionStack: function() {
        shim.clearSectionStack(opendatakit.getRefId());
    },
    popSectionStack: function() {
        return shim.popSectionStack(opendatakit.getRefId());
    },
    pushSectionStack: function(section_name) {
        shim.pushSectionStack( opendatakit.getRefId(), section_name );
    },
    reset: function(ctxt,sameForm) {
        // NOTE: the ctxt calls here are synchronous actions
        // ctxt is only passed in for logging purposes.
        ctxt.append('controller.reset');
        this.clearScreenHistory();
        this.clearSectionStack();
        shim.setScreenPath(opendatakit.getRefId(), null);
        shim.clearInstanceId(opendatakit.getRefId());
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
        database.setInstanceMetaData($.extend({}, ctxt, {
            success: function() {
                that.getOperation($.extend({}, ctxt, { success: function(op) {
                        that.setScreen(ctxt, op, {changeLocale: true});
                    }}), that.getCurrentScreenPath());
            }
        }), 'locale', locale);
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
    getSectionShowHierarchy: function() {
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
        
        if ( 'showHierarchy' in sectionSettings ) {
            return sectionSettings.showHierarchy;
        }
        return true;
    },
    ///////////////////////////////////////////////////////
    // Logging context
    baseContext : {
        contextChain: [],
        
        append : function( method, detail ) {
            var now = new Date().getTime();
            this.contextChain.push( {method: method, timestamp: now, detail: detail } );
            // SpeedTracer Logging API
              var logger = window.console;
            if (logger && logger.markTimeline) {
                logger.markTimeline(method);
            }
        },
        
        success: function(){
            this._log('S', 'success!');
        },
        
        failure: function(m) {
            this._log('E', 'failure! ' + (( m != null && m.message != null) ? m.message : ""));
        },
        
        _log: function( severity, contextMsg ) {
            var flattened = "seqAtEnd: " + window.controller.eventCount;
            $.each( this.contextChain, function(index,value) {
                flattened += "\nmethod: " + value.method + " timestamp: " +
                    value.timestamp + ((value.detail != null) ? " detail: " + value.detail : "");
            });
            shim.log(severity, contextMsg + " execution_chain: " + flattened);
        }
    },
    
    newCallbackContext : function( actionHandlers ) {
        this.eventCount = 1 + this.eventCount;
        var count = this.eventCount;
        var now = new Date().getTime();
        var detail =  "seq: " + count + " timestamp: " + now;
        var ctxt = $.extend({}, this.baseContext, {seq: count, contextChain: []}, actionHandlers );
        ctxt.append('callback', detail);
        return ctxt;
    },
    newFatalContext : function( actionHandlers ) {
        this.eventCount = 1 + this.eventCount;
        var count = this.eventCount;
        var now = new Date().getTime();
        var detail =  "seq: " + count + " timestamp: " + now;
        var ctxt = $.extend({}, this.baseContext, {seq: count, contextChain: []}, actionHandlers );
        ctxt.append('fatal_error', detail);
        return ctxt;
    },
    newStartContext: function( actionHandlers ) {
        this.eventCount = 1 + this.eventCount;
        var count = this.eventCount;
        var now = new Date().getTime();
        var detail =  "seq: " + count + " timestamp: " + now;
        var ctxt = $.extend({}, this.baseContext, {seq: count, contextChain: []}, actionHandlers );
        ctxt.append('startup', detail);
        return ctxt;
    },
    newContext: function( evt, actionHandlers ) {
        this.eventCount = 1 + this.eventCount;
        var count = this.eventCount;
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
        
        var ctxt = $.extend({}, this.baseContext, {seq: count, contextChain: []}, actionHandlers );
        ctxt.append( evt.type, detail);
        return ctxt;
    },
    
    createInstance: function(evt){
      var that = this;
      var ctxt = controller.newContext(evt);
      evt.stopPropagation(true);
      evt.stopImmediatePropagation();
      ctxt.append("prompts." + this.type + ".createInstance", "px: " + this.promptIdx);
      opendatakit.openNewInstanceId($.extend({},ctxt,{
        success: function(){
          var url = arguments[0];
          that.changeUrlHash(url,ctxt)
       }}), null);
    },

    openInstance: function(evt) {
      var that = this;
      var ctxt = controller.newContext(evt);
      evt.stopPropagation(true);
      evt.stopImmediatePropagation();
      ctxt.append("prompts." + this.type + ".openInstance", "px: " + this.promptIdx);
      opendatakit.openNewInstanceId($.extend({},ctxt,{
        success: function(){
          var url = arguments[0];
          that.changeUrlHash(url,ctxt)
       }}), $(evt.target).attr('id'));
    },

    changeUrlHash : function(url,context){
      window.location.hash = url;
      parsequery.hashChangeHandler(url,context);
    }

};
return window.controller;
});
