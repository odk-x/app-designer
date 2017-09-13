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
define(['screenManager','opendatakit','database', 'parsequery', 'jquery','underscore' ],
function(ScreenManager,  opendatakit,  database,   parsequery,  $,        _ ) {
/* global odkCommon, odkSurveyStateManagement */
'use strict';
verifyLoad('controller',
    ['screenManager','opendatakit','database', 'parsequery', 'jquery','underscore' ],
    [ScreenManager,  opendatakit,  database,    parsequery,  $,        _]);
return {
    eventCount: 0,
    moveFailureMessage: { message: "Internal Error: Unable to determine next prompt." },
    screenManager : null,
    viewFirstQueuedAction: function() {
        var action = odkCommon.viewFirstQueuedAction();
        if ( action === undefined ) return null;
        return action;
    },
    removeFirstQueuedAction: function() {
        odkCommon.removeFirstQueuedAction();
    },
    getCurrentScreenPath: function() {
        var path = odkSurveyStateManagement.getScreenPath(opendatakit.getRefId());
        if ( path === undefined ) return null;
        return path;
    },
    getCurrentContentsScreenPath: function() {
        var currentPath = this.getCurrentScreenPath();
        if ( currentPath === null ) {
            odkCommon.log('E',"controller.getCurrentContentsScreenPath: null currentScreenPath!");
            return null;
        }
        var parts = currentPath.split("/");
        if ( parts.length < 2 ) {
            odkCommon.log('E',"controller.getCurrentContentsScreenPath: invalid currentScreenPath: " + currentPath);
            return null;
        }

        return parts[0] + '/_contents';
    },
    getOperationPath: function(opPath) {

        if ( opPath === undefined || opPath === null ) {
            odkCommon.log('E',"invalid opPath: null");
            return null;
        }

        var parts = opPath.split("/");
        if ( parts.length < 2 ) {
            odkCommon.log('E',"controller.getOperationPath: invalid opPath: " + opPath);
            return null;
        }

        var formDef = opendatakit.getCurrentFormDef();
        var section = formDef.specification.sections[parts[0]];
        if ( section === undefined || section === null ) {
            odkCommon.log('E',"controller.getOperationPath: no section matching opPath: " + opPath);
            return null;
        }

        var intRegex = /^\d+$/;
        var intIndex;
        if(intRegex.test(parts[1])) {
            intIndex = parseInt(parts[1], 10);
        } else {
            intIndex = section.branch_label_map[parts[1]];
        }

        if ( intIndex === undefined || intIndex === null ) {
            odkCommon.log('E',"controller.getOperationPath: no branch label matching opPath: " + opPath);
            return null;
        }

        if ( intIndex >= section.operations.length ) {
            odkCommon.log('E',"controller.getOperationPath: invalid opPath (beyond end of operations array): " + opPath);
            return null;
        }

        var newPath = parts[0] + '/' + intIndex;
        return newPath;
    },
    getNextOperationPath: function(opPath) {

        if ( opPath === undefined || opPath === null ) {
            odkCommon.log('E',"invalid opPath: null");
            return null;
        }

        var parts = opPath.split("/");
        if ( parts.length < 2 ) {
            odkCommon.log('E',"controller.getNextOperationPath: invalid opPath: " + opPath);
            return null;
        }

        var formDef = opendatakit.getCurrentFormDef();
        var section = formDef.specification.sections[parts[0]];
        if ( section === undefined || section === null ) {
            odkCommon.log('E',"controller.getNextOperationPath: no section matching opPath: " + opPath);
            return null;
        }

        var intRegex = /^\d+$/;
        var intIndex;
        if(intRegex.test(parts[1])) {
            intIndex = parseInt(parts[1], 10);
        } else {
            intIndex = section.branch_label_map[parts[1]];
        }

        if ( intIndex === undefined || intIndex === null ) {
            odkCommon.log('E',"controller.getNextOperationPath: no branch label matching opPath: " + opPath);
            return null;
        }

        if ( intIndex >= section.operations.length ) {
            odkCommon.log('E',"controller.getNextOperationPath: invalid opPath (beyond end of operations array): " + opPath);
            return null;
        }

        intIndex++;
        var newPath = parts[0] + '/' + intIndex;

        if ( intIndex >= section.operations.length ) {
            odkCommon.log('E',"controller.getNextOperationPath: advancing beyond end of operations array: " + newPath);
            return null;
        }

        return newPath;
    },
    getOperation: function(opPath) {
        if ( opPath === undefined || opPath === null ) {
            odkCommon.log('E',"invalid opPath: null");
            return null;
        }

        var parts = opPath.split("/");
        if ( parts.length < 2 ) {
            odkCommon.log('E',"controller.getOperation: invalid opPath: " + opPath);
            return null;
        }

        var formDef = opendatakit.getCurrentFormDef();
        var section = formDef.specification.sections[parts[0]];
        if ( section === undefined || section === null ) {
            odkCommon.log('E',"controller.getOperation: no section matching opPath: " + opPath);
            return null;
        }
        var intRegex = /^\d+$/;
        var intIndex;
        if(intRegex.test(parts[1])) {
            intIndex = parseInt(parts[1], 10);
        } else {
            intIndex = section.branch_label_map[parts[1]];
        }

        if ( intIndex === undefined || intIndex === null ) {
            odkCommon.log('E',"controller.getOperation: no branch label matching opPath: " + opPath);
            return null;
        }

        if ( intIndex >= section.operations.length ) {
            odkCommon.log('E',"controller.getOperation: invalid opPath (beyond end of operations array): " + opPath);
            return null;
        }
        var op = section.operations[intIndex];
        if ( op === undefined ) return null;
        return op;
    },
    getCurrentSectionPrompts: function() {
        var opPath = this.getCurrentScreenPath();

        if ( opPath === null ) {
            return [];
        }

        var parts = opPath.split("/");
        if ( parts.length < 2 ) {
            return [];
        }

        var formDef = opendatakit.getCurrentFormDef();
        var section = formDef.specification.sections[parts[0]];
        if ( section === undefined || section === null ) {
            return [];
        }

        return section.parsed_prompts;
    },
    getPrompt: function(promptPath) {
        if ( promptPath === undefined || promptPath === null ) {
            odkCommon.log('E',"invalid promptPath: null");
            return null;
        }

        var parts = promptPath.split("/");
        if ( parts.length < 2 ) {
            odkCommon.log('E',"controller.getPrompt: invalid promptPath: " + promptPath);
            return null;
        }

        var formDef = opendatakit.getCurrentFormDef();
        var section = formDef.specification.sections[parts[0]];
        if ( section === undefined || section === null ) {
            odkCommon.log('E',"controller.getPrompt: no section matching promptPath: " + promptPath);
            return null;
        }
        var intRegex = /^\d+$/;
        var intIndex;
        if(intRegex.test(parts[1])) {
            intIndex = parseInt(parts[1], 10);
        }

        if ( intIndex === undefined || intIndex === null ) {
            odkCommon.log('E',"controller.getPrompt: no branch label matching promptPath: " + promptPath);
            return null;
        }

        if ( intIndex >= section.parsed_prompts.length ) {
            odkCommon.log('E',"controller.getPrompt: invalid promptPath (beyond end of operations array): " + promptPath);
            return null;
        }
        var prompt = section.parsed_prompts[intIndex];
        return prompt;
    },
    findPreviousScreenAndState: function(isResume) {
        var that = this;
        var path = null;
        var state = null;
        var repop = false;
        var clearState = true;
        var oldScreenPath = that.getCurrentScreenPath();
        while (odkSurveyStateManagement.hasScreenHistory(opendatakit.getRefId())) {
            clearState = false;
            path = odkSurveyStateManagement.popScreenHistory(opendatakit.getRefId());
            state = odkSurveyStateManagement.getControllerState(opendatakit.getRefId());
            // possible 'state' values:
            // advanceOnReturn
            // hideInBackHistory
            // popHistoryOnExit -- awkward
            // validateinProgress -- awkward
            //
            // the later two are possible if a validation constraint
            // shared a screen with a user-directed branch and the
            // user took the branch rather than fix the validation
            // failure.
            //
            // It is safe to back over the popHistoryOnExit, as
            // that is the screen that failed validation.
            //
            // It also makes sense to back over the validation
            // command (which will always have validateInProgress
            // state), as it doesn't have any UI on success.
            //
            if ( state === 'hideInBackHistory' ||
                 state === 'validateInProgress' ||
                 state === 'popHistoryOnExit' ) {
                // this is a hidden screen w.r.t. the back history
                // skip over it.
                continue;
            } else if ( state !== 'advanceOnReturn' ) {
                // this is not a do section action.
                // show it.
                break;
            } else {
                // this IS a do section action.
                // if we started in a different section than
                // the one we are in now, then we are backing out
                // of a subsection. In that case, we should show
                // the contents screen of the section we are
                // re-entering.
                var newScreenPath = that.getCurrentScreenPath();
                if ( oldScreenPath !== null &&  oldScreenPath !== undefined &&
                     newScreenPath !== null && newScreenPath !== undefined ) {
                    var oldParts = oldScreenPath.split("/");
                    var newParts = newScreenPath.split("/");
                    if ( oldParts[0] != newParts[0] ) {
                        // we are popping up.
                        // retain the do section clause in the
                        // history record (since we are backing
                        // up, this will not be done on the screen
                        // transition, so we must do that here).
                        // and show the contents screen.
                        // When we advance forward from
                        // the contents screen we will resume
                        // at the statement after the do section.
                        // If we go backward, we will silently
                        // clear this record out and move to the
                        // screen before the do section.
                        odkSurveyStateManagement.pushSectionScreenState(opendatakit.getRefId());
                        path = that.getCurrentContentsScreenPath();
                        state = '';
                        repop = true;
                        break;
                    }
                }
                // Otherwise, we are in the same section.
                // If isResume is true, then we want to stop
                // at this point. Otherwise, we want to move
                // back through to an earlier screen in this
                // same section.
                if ( isResume ) {
                    break;
                }
                // clear the state unless we can pop off...
                clearState = true;
            }
        }
        if ( clearState ) {
            state = '';
        }
        return { path: path, state: state, repop: repop};
    },
    beforeMove: function(isStrict, advancing){
        var that = this;
        if ( that.screenManager ) {
            try {
                var validateOnAdvance = ! opendatakit.getSettingValue('deferValidationUntilFinalize');
                return that.screenManager.beforeMove(isStrict, advancing, advancing && validateOnAdvance);
            } catch(ex) {
                var opPath = that.getCurrentScreenPath();
                odkCommon.log('E','controller.beforeMove.exception ' + ex.message + " stack: " + ex.stack  + " px: " + opPath);
                return {message: "Exception while advancing to next screen. " + ex.message};
            }
        } else {
            return null;
        }
    },
    /**
     *********************************************************************
     *********************************************************************
     *********************************************************************
     * Asynchronous interactions
     *********************************************************************
     *********************************************************************
     *********************************************************************
     */
    // NOTE: this is only here to avoid having screen depend upon database.
    commitChanges: function(ctxt) {
        ctxt.log('D','controller.commitChanges applying deferred changes');
        database.applyDeferredChanges(ctxt);
    },
    /**
     * Get 'op' at 'path'. If it is anything but a 'begin_screen', we
     * step through and process it, until we land on a 'begin_screen'
     * operation.
     *
     * pass the 'begin_screen' operation into the ctxt success callback.
     */
    _doActionAtLoop: function(ctxt, inOp, inAction) {
        var that = this;
        // NOTE: copy arguments into local variables
        // so that the Chrome debugger will show the
        // current values of these variables as the
        // loop below progresses.
        //
        var op = inOp;
        var action = inAction;
        var path = null;
        var state = '';
        var combo;
        if ( action === null || action === undefined ) {
            action = op._token_type;
        }
        for (;;) {
            path = op._section_name + "/" + op.operationIdx;
            ctxt.log('I','controller._doActionAtLoop: path: ' + path + ' action: ' + action);
            try {
                switch ( action ) {
                case "goto_label":
                    // jump to a label. This may be conditional...
                    // i.e., The 'condition' property is now a boolean predicate
                    // (it is compiled into one during the builder's processing
                    // of the form). If it evaluates to false, then skip to the
                    // next question; if it evaluates to true or is not present,
                    // then execute the 'goto'
                    if('condition' in op && !op.condition()) {
                        path = that.getNextOperationPath(path);
                    } else {
                        path = that.getOperationPath(op._section_name + "/" + op._branch_label);
                    }
                    break;
                case "assign":
                    // do an assignment statement.
                    // defer the database update until we reach a screen.
                    database.setValueDeferredChange(op.name, op.calculation());
                    // advance to the next operation.
                    path = that.getNextOperationPath(path);
                    break;
                case "advance":
                    state = odkSurveyStateManagement.getControllerState(opendatakit.getRefId());
                    if ( state !== 'popHistoryOnExit' ) {
                        path = that.getNextOperationPath(path);
                        break;
                    }
                    /* falls through */
                case "back_in_history":
                    // pop the history stack, and render that screen.
                    combo = that.findPreviousScreenAndState(false);
                    path = combo.path;
                    state = combo.state;

                    if ( path === null || path === undefined ) {
                        path = opendatakit.initialScreenPath;
                    }
                    // just for debugging...
                    odkSurveyStateManagement.getScreenPath(opendatakit.getRefId());
                    break;
                case "resume":
                    // pop the history stack, and render the next screen.
                    combo = that.findPreviousScreenAndState(true);
                    path = combo.path;
                    state = ''; // reset this, since we want to advance
                    if ( path === null || path === undefined ) {
                        path = opendatakit.initialScreenPath;
                    } else if ( !combo.repop ) {
                       path = that.getNextOperationPath(path);
                    }
                    // just for debugging...
                    odkSurveyStateManagement.getScreenPath(opendatakit.getRefId());
                    break;
                case "do_section":
                    // save our op...
                    odkSurveyStateManagement.setSectionScreenState(opendatakit.getRefId(), path, 'advanceOnReturn');
                    // start at operation 0 in the new section
                    path = op._do_section_name + "/0";
                    break;
                case "exit_section":
                    path = odkSurveyStateManagement.popSectionStack(opendatakit.getRefId());
                    if ( odkSurveyStateManagement.getControllerState(opendatakit.getRefId()) === 'advanceOnReturn' ) {
                        path = that.getNextOperationPath(path);
                    }
                    if ( path === null || path === undefined ) {
                        path = opendatakit.initialScreenPath;
                    }
                    break;
                case "save_and_terminate":
                    var complete = ('calculation' in op) ? op.calculation() : false;
                    var siformId = opendatakit.getSettingValue('form_id');
                    var simodel = opendatakit.getCurrentModel();
                    var siinstanceId = opendatakit.getCurrentInstanceId();
                    that._innerSaveAllChanges(ctxt, op, path, simodel, siformId, siinstanceId, complete);
                    return;
                case "validate":
                    var validationTag = op._sweep_name;

                    if ( odkSurveyStateManagement.getScreenPath(opendatakit.getRefId()) !== path ||
                         odkSurveyStateManagement.getControllerState(opendatakit.getRefId()) !== 'validateInProgress' ) {
                        // tag this op as a 'validateInProgress' node. Push onto stack.
                        odkSurveyStateManagement.setSectionScreenState( opendatakit.getRefId(), op._section_name + "/" + op.operationIdx, 'validateInProgress');
                        odkSurveyStateManagement.pushSectionScreenState( opendatakit.getRefId());
                    }

                    that._innerValidate(ctxt, op, validationTag);
                    return;
                case "begin_screen":
                    ctxt.success(op);
                    return;
                default:
                    ctxt.failure({message: "Unrecognized action in doAction loop: " + action });
                    return;
                }

                //
                // advance to the 'op' specified by the path.
                if ( path !== null &&  path !== undefined ) {
                    op = that.getOperation(path);
                    action = op._token_type;
                } else {
                    odkCommon.log('E',"controller._doActionAtLoop.failure px: " + path);
                    ctxt.failure(that.moveFailureMessage);
                    return;
                }

            } catch (e) {
                odkCommon.log('E', "controller._doActionAtLoop.exception px: " +
                                path + ' exception: ' + String(e));
                var mf = _.extend({}, that.moveFailureMessage);
                mf.message = mf.message + ' ' + e.message;
                ctxt.failure(mf);
                return;
            }
        }
    },
    /**
     * Pulled out of loop to prevent looping variable issues (jsHint)
     */
    _innerSaveAllChanges: function(ctxt, op, path, simodel, siformId, siinstanceId, complete) {
        var that = this;
        database.save_all_changes($.extend({},ctxt,{success:function() {
                that.screenManager.hideSpinnerOverlay();
                odkSurveyStateManagement.saveAllChangesCompleted( opendatakit.getRefId(), opendatakit.getCurrentInstanceId(), complete);
                // the odkSurvey should terminate the window... if not, at least leave the instance.
                that.leaveInstance(ctxt);
            },
            failure:function(m) {
                odkSurveyStateManagement.saveAllChangesFailed( opendatakit.getRefId(), opendatakit.getCurrentInstanceId());
                // advance to next operation if we fail...
                path = that.getNextOperationPath(path);
                op = that.getOperation(path);
                if ( op !== undefined && op !== null ) {
                    that._doActionAtLoop(ctxt, op, op._token_type );
                } else {
                    ctxt.failure(that.moveFailureMessage);
                }
            }}), simodel, siformId, siinstanceId, complete);
    },
    /**
     * Pulled out of loop to prevent looping variable issues (jsHint)
     */
    _innerValidate:function(ctxt, op, validationTag) {
        var that = this;
        database.applyDeferredChanges($.extend({},ctxt,{
        success:function() {
            var vctxt = $.extend({},ctxt,{
                success:function(operation, options, m) {
                    if ( operation === undefined || operation === null ) {
                        // validation is DONE: pop ourselves off return stack.
                        var refPath = odkSurveyStateManagement.popScreenHistory( opendatakit.getRefId());
                        if ( refPath != op._section_name + "/" + op.operationIdx ) {
                            ctxt.log('E',"unexpected mis-match of screen history states");
                            ctxt.failure(that.moveFailureMessage);
                            return;
                        }
                        that._doActionAtLoop(ctxt, op, 'advance' );
                    } else {
                        ctxt.success(operation, options, m);
                    }
                }});
            /**
             * Upon exit:
             *   ctxt.success() -- for every prompt associated with this validationTag,
             *                     if required() evaluates to true, then the field has a value
             *                     and if constraint() is defined, it also evaluates to true.
             *
             *   ctxt.failure(m) -- if there is a failed prompt, then:
             *                     setScreen(prompt, {popHistoryOnExit: true})
             *                      and always:
             *                     chainedCtxt to display showScreenPopup(m) after a 500ms delay.
             */
            var formDef = opendatakit.getCurrentFormDef();
            var section_names = formDef.specification.section_names;
            var i, j;
            var promptList = [];
            for ( i = 0 ; i < section_names.length ; ++i ) {
                var sectionName = section_names[i];
                var section = formDef.specification.sections[sectionName];
                var tagList = section.validation_tag_map[validationTag];
                if ( tagList !== undefined && tagList !== null ) {
                    for ( j = 0 ; j < tagList.length ; ++j ) {
                        promptList.push(sectionName + "/" + tagList[j]);
                    }
                }
            }
            if ( promptList.length === 0 ) {
                vctxt.log('D',"validateQuestionHelper.success.emptyValidationList");
                vctxt.success();
                return;
            }

            // start our work -- display the 'validating...' spinner
            that.screenManager.showSpinnerOverlay({text:"Validating..."});

            var buildRenderDoneCtxt = $.extend({render: false}, vctxt, {
                success: function() {
                    // all render contexts have been refreshed
                    var currPrompt;
                    var validateError;
                    for ( var i = 0; i < promptList.length; i++ ) {
                        currPrompt = that.getPrompt(promptList[i]);
                        validateError = currPrompt._isValid(true);
                        if ( validateError !== undefined && validateError !== null ) {
                            vctxt.log('I',"_validateQuestionHelper.validate.failure", "px: " + currPrompt.promptIdx);
                            var nextOp = that.getOperation(currPrompt._branch_label_enclosing_screen);
                            if ( nextOp === null ) {
                                vctxt.failure(that.moveFailureMessage);
                                return;
                            }
                            vctxt.success(nextOp, {popHistoryOnExit: true}, validateError);
                            return;
                        }
                    }
                    vctxt.log('D',"validateQuestionHelper.success.endOfValidationList");
                    vctxt.success();
                },
                failure: function(m) {
                    vctxt.failure(m);
                }
            });

            var buildRenderDoneOnceCtxt = $.extend({render: false}, buildRenderDoneCtxt, {
                success: _.after(promptList.length, function() {
                    buildRenderDoneCtxt.success();
                }),
                failure: _.once(function(m) {
                    buildRenderDoneCtxt.failure(m);
                })
            });

            if ( promptList.length === 0 ) {
                buildRenderDoneCtxt.success();
            } else {
                // refresh all render contexts (they may have constraint values
                // that could have changed -- e.g., filtered choice lists).
                $.each( promptList, function(idx, promptCandidatePath) {
                    var promptCandidate = that.getPrompt(promptCandidatePath);
                    promptCandidate.buildRenderContext(buildRenderDoneOnceCtxt);
                });
            }
        }}));

    },
    _synthesizePopupContext:function(opPath, m) {
        var that = this;
        var popupbasectxt = that.newCallbackContext("controller._synthesizePopupContext");
        var popupctxt = $.extend({}, popupbasectxt, {
            success: function() {
                popupbasectxt.log('D',"setScreenWithMessagePopup.popupSuccess.showScreenPopup", "px: " + opPath);
                if ( m && m.message ) {
                    popupbasectxt.log('D',"setScreenWithMessagePopup.popupSuccess.showScreenPopup.m", "px: " + opPath + " message: " + m.message);
                    // schedule a timer to show the message after the page has rendered
                    that.screenManager.showScreenPopup(m);
                    popupbasectxt.failure(m);
                } else {
                    popupbasectxt.success();
                }
            },
            failure: function(m2) {
                popupbasectxt.log('D',"setScreenWithMessagePopup.popupFailure.showScreenPopup", "px: " + opPath);
                // NOTE: if the setScreen() call failed, we should show the error from that...
                if ( m && m.message ) {
                    popupbasectxt.log('D',"setScreenWithMessagePopup.popupFailure.showScreenPopup.m", "px: " + opPath + " message: " + m.message);
                    // schedule a timer to show the message after the page has rendered
                    that.screenManager.showScreenPopup(m);
                    popupbasectxt.failure(m);
                } else if ( m2 && m2.message ) {
                    popupbasectxt.log('D',"setScreenWithMessagePopup.popupFailure.showScreenPopup.m2", "px: " + opPath + " message: " + m2.message);
                    // schedule a timer to show the mesage after the page has rendered
                    that.screenManager.showScreenPopup(m2);
                    popupbasectxt.failure(m2);
                } else {
                    popupbasectxt.success();
                }
        }});
        return popupctxt;
    },
    setScreenWithMessagePopup:function(ctxt, op, options, m) {
        var that = this;
        var opPath = op._section_name + "/" + op.operationIdx;
        /**
         * Display the requested screen.
         */
        if ( m === undefined || m === null || m.message === undefined || m.message === null ) {
            that.setScreen( ctxt, op, options );
        } else {
            that.setScreen( $.extend({}, ctxt, {
                success: function() {
                    // add a terminal context to display the pop-up message
                    // -- this will be added after the afterRendering
                    // actions have been taken when the screen is rendered (since the
                    // afterRendering step is invoking ctxt when it is complete.
                    ctxt.setTerminalContext(that._synthesizePopupContext(opPath, m));
                    ctxt.success();
                },
                failure: function(m2) {
                    // add a terminal context to display the pop-up message
                    // -- this will be added after the afterRendering
                    // actions have been taken when the screen is rendered (since the
                    // afterRendering step is invoking ctxt when it is complete.
                    ctxt.setTerminalContext(that._synthesizePopupContext(opPath, m));
                    ctxt.failure(m2);
            }}), op, options );
        }
    },
    _doActionAt:function(ctxt, op, action, popStateOnFailure) {
        var that = this;
        var currentScreenPath = that.getCurrentScreenPath();
        if ( op === null ) {
            throw Error("controller._doActionAt.nullOp unexpected condition -- caller should handle this!");
        }

        try {
            // any deferred database updates will be written via the setScreen call.
            var newctxt = $.extend({},ctxt,{
                success:function(operation, options, m) {
                    if(operation) {
                        ctxt.log('D',"controller._doActionAt._doActionAtLoop.success", "px: " + that.getCurrentScreenPath() + " nextPx: " + operation.operationIdx);
                        that.setScreenWithMessagePopup(ctxt, operation, options, m);
                    } else {
                        ctxt.log('D',"controller._doActionAt._doActionAtLoop.success", "px: " + that.getCurrentScreenPath() + " nextPx: no screen!");
                        // do nothing -- the action already is showing the appropriate screen.
                        ctxt.success();
                    }
                }, failure:function(m) {
                    if ( popStateOnFailure ) {
                        odkSurveyStateManagement.popScreenHistory(opendatakit.getRefId());
                    }
                    if ( that.getCurrentScreenPath() !== currentScreenPath ) {
                        ctxt.log('W',"controller._doActionAt._doActionAtLoop.failure", "px: " +
                            that.getCurrentScreenPath() + " does not match starting screen: " + currentScreenPath);
                    }
                    var op = that.getOperation(currentScreenPath);
                    if (op === null) {
                        ctxt.failure(that.moveFailureMessage);
                    } else {
                        that.setScreenWithMessagePopup( ctxt, op, null, m);
                    }
            }});
            that._doActionAtLoop( newctxt, op, action);
        } catch (e) {
            console.error("controller._doActionAt.exception: " + String(e));
            ctxt.failure({message: "Possible goto loop."});
        }
    },
    /**
     * used by Application Designer environment. see main.js redrawHook() function.
     */
    redrawHook: function() {
        var that = this;
        var ctxt = that.newCallbackContext("controller.redrawHook");
        var path = that.getCurrentScreenPath();
        var operation = that.getOperation(path);

        that.enqueueTriggeringContext($.extend({},ctxt,{success:function() {
                that.setScreen(ctxt, operation);
        }}));
    },
    setScreen: function(ctxt, operation, inOptions){
        var that = this;
        ctxt.log('D','controller.setScreen', "nextPx: " + operation.operationIdx);
        var options = (inOptions === undefined || inOptions === null) ? {} : inOptions;

        /**
         * Valid options:
         *  changeLocale: true/false
         *  popHistoryOnExit: true/false
         */
        var newPath = that.getOperationPath(operation._section_name + "/" + operation.operationIdx);
        if ( newPath === null ) {
            ctxt.failure(that.moveFailureMessage);
            return;
        }

        var stateString = null;

        var oldPath = that.getCurrentScreenPath();
        if ( oldPath === newPath ) {
            // redrawing -- take whatever was already there...
            stateString = odkSurveyStateManagement.getControllerState(opendatakit.getRefId());
            if ( stateString === undefined ) {
                ctxt.log('W',"undefined state returned from getControllerState!");
                stateString = null;
            }
        }

        if ( options.popHistoryOnExit ) {
            stateString = 'popHistoryOnExit';
        } else if ( operation.screen && operation.screen.hideInBackHistory ) {
            stateString = 'hideInBackHistory';
        }

        odkSurveyStateManagement.setSectionScreenState( opendatakit.getRefId(), newPath, stateString);
        // Build a new Screen object so that jQuery Mobile is always happy...
        var formDef = opendatakit.getCurrentFormDef();
        var screen_attrs = operation.screen;
        var screen_type = 'screen';
        var ScreenType, ExtendedScreenType, ScreenInstance;
        if (screen_attrs !== null && screen_attrs !== undefined && ('screen_type' in screen_attrs)) {
            screen_type = screen_attrs.screen_type;
        }

        if (!(screen_type in formDef.specification.currentScreenTypes)) {
            ctxt.log('E','controller.setScreen.unrecognizedScreenType', screen_type);
            ctxt.failure({message: 'unknown screen_type'});
            return;
        }

        ScreenType = formDef.specification.currentScreenTypes[screen_type];
        ExtendedScreenType = ScreenType.extend(screen_attrs);
        ScreenInstance = new ExtendedScreenType({ _section_name: operation._section_name, _operation: operation });

        that.screenManager.setScreen($.extend({},ctxt,{
            success: function() {
                var qpl = opendatakit.getSameRefIdHashString(opendatakit.getCurrentFormPath(),
                            opendatakit.getCurrentInstanceId(), that.getCurrentScreenPath());
                window.location.hash = qpl;
                ctxt.success();
            }, failure: function(m) {
            /////////////////////
            // TODO: reconcile this with _doActionAt failure --
            // one or the other should pop the stack.
            // How does this flow?
                // undo screen change on failure...
                ctxt.log('D','controller.setScreen.failureRecovery', 'hash: ' + window.location.hash);
                if ( oldPath == newPath ) {
                    ctxt.failure(m);
                } else {
                    // set the screen back to what it was, then report this failure
                    var op = that.getOperation(oldPath);
                    if ( op !== null ) {
                        that._doActionAt($.extend({},ctxt,{
                                success: function() {
                                    // add a terminal context to display the pop-up message
                                    // -- this will be added after the afterRendering
                                    // actions have been taken when the screen is rendered (since the
                                    // afterRendering step is invoking ctxt when it is complete.
                                    var opPath = that.getCurrentScreenPath();
                                    ctxt.setTerminalContext(that._synthesizePopupContext(opPath, m));
                                    ctxt.success();
                                },
                                failure: function(m2) {
                                    // add a terminal context to display the pop-up message
                                    // -- this will be added after the afterRendering
                                    // actions have been taken when the screen is rendered (since the
                                    // afterRendering step is invoking ctxt when it is complete.
                                    var opPath = that.getCurrentScreenPath();
                                    ctxt.setTerminalContext(that._synthesizePopupContext(opPath, m));
                                    ctxt.failure(m2);
                                }}), op, op._token_type, true);
                    } else {
                        ctxt.failure(m);
                    }
                }
            }}), ScreenInstance, options.popHistoryOnExit || false );
    },
    /**
     * Move to the previous event in the screenHistory.
     * This is generally the previous screen, but might
     * be an intermediate non-visible action node (e.g.,
     * do_section or validate) in which case we go back
     * to that node and either advance forward from it
     * (do_section) or re-execute it (validate).
     *
     * Success: we have successfully advanced to a new
     *   screen.
     * Failure: we were unable to advance. In general,
     *   this means we stay where we are.
     */
    gotoPreviousScreen: function(ctxt){
        var that = this;
        ctxt.log('D','controller.gotoPreviousScreen');
        var opPath = that.getCurrentScreenPath();

        var failureObject = that.beforeMove(true, false);
        if ( failureObject !== null && failureObject !== undefined ) {
            ctxt.log('I',"gotoPreviousScreen.beforeMove.failure", "px: " +  opPath);
            that.screenManager.showScreenPopup(failureObject);
            ctxt.failure(failureObject);
            return;
        }

        ctxt.log('D',"gotoPreviousScreen.beforeMove.success", "px: " +  opPath);
        var op = that.getOperation(opPath);
        if ( op === null ) {
            ctxt.failure(that.moveFailureMessage);
            return;
        }
        that._doActionAt(ctxt, op, 'back_in_history', false);
    },
    /*
     * Advance foward in the form from this position.
     *
     * Success: we have successfully advanced to a new
     *   screen.
     * Failure: we were unable to advance. In general,
     *   this means we stay where we are.
     */
    gotoNextScreen: function(ctxt){
        var that = this;
        ctxt.log('D','controller.gotoNextScreen');
        var opPath = that.getCurrentScreenPath();

        var failureObject = that.beforeMove(true, true);
        if ( failureObject !== null && failureObject !== undefined ) {
            ctxt.log('I',"gotoNextScreen.beforeMove.failure", "px: " +  opPath);
            that.screenManager.showScreenPopup(failureObject);
            ctxt.failure(failureObject);
            return;
        }

        ctxt.log('D',"gotoNextScreen.beforeMove.success", "px: " +  opPath);
        var op = that.getOperation(opPath);
        if ( op === null ) {
            ctxt.failure(that.moveFailureMessage);
            return;
        }
        var stateString = odkSurveyStateManagement.getControllerState(opendatakit.getRefId());
        var popHistoryOnExit = ( stateString === 'popHistoryOnExit' );
        // if the current screen is supposed to be popped from the stack
        // when we advance off of it, then do not push it onto the stack!
        if ( !popHistoryOnExit ) {
            odkSurveyStateManagement.pushSectionScreenState(opendatakit.getRefId());
        }
        that._doActionAt(ctxt, op, 'advance', !popHistoryOnExit);
    },
    /*
     * Display the contents screen.
     *
     * Success: we have successfully navigated to the
     *   contents screen.
     * Failure: we were unable to advance. In general,
     *   this means we stay where we are.
     */
    gotoContentsScreen: function(ctxt){
        var that = this;
        ctxt.log('D','controller.gotoContentsScreen');
        var opPath = that.getCurrentScreenPath();

        var failureObject = that.beforeMove(true, false);
        if ( failureObject !== null && failureObject !== undefined ) {
            ctxt.log('I',"gotoContentsScreen.beforeMove.failure", "px: " +  opPath);
            that.screenManager.showScreenPopup(failureObject);
            ctxt.failure(failureObject);
            return;
        }

        ctxt.log('D',"gotoContentsScreen.beforeMove.success", "px: " +  opPath);
        var op = that.getOperation( that.getCurrentContentsScreenPath() );
        if ( op === null ) {
            ctxt.failure(that.moveFailureMessage);
            return;
        }
        odkSurveyStateManagement.pushSectionScreenState(opendatakit.getRefId());
        that._doActionAt(ctxt, op, op._token_type, true);
    },
    /*
     * Begin the 'validate finalize' and 'save_and_terminate true'
     * actions.
     *
     * Success: we have successfully navigated to either
     *   a screen where there is a validation failure
     *   or we have executed the save_and_terminate action.
     *
     * Failure: we were unable to advance. In general,
     *   this means we stay where we are.
     */
    gotoFinalizeAndTerminateAction: function(ctxt){
        var that = this;
        ctxt.log('D','controller.gotoFinalizeAction');
        var opPath = that.getCurrentScreenPath();

        var failureObject = that.beforeMove(true, false);
        if ( failureObject !== null && failureObject !== undefined ) {
            ctxt.log('I',"gotoFinalizeAction.beforeMove.failure", "px: " +  opPath);
            that.screenManager.showScreenPopup(failureObject);
            ctxt.failure(failureObject);
            return;
        }

        ctxt.log('D',"gotoFinalizeAction.beforeMove.success", "px: " +  opPath);
        var op = that.getOperation( 'initial/_finalize' );
        if ( op === null ) {
            ctxt.failure(that.moveFailureMessage);
            return;
        }
        odkSurveyStateManagement.pushSectionScreenState(opendatakit.getRefId());
        that._doActionAt(ctxt, op, op._token_type, true);
    },
    /*
     * Execute instructions beginning at the specified path.
     *
     * Success: we have successfully navigated to a screen
     *   displayed to the user or we have executed the
     *   save_and_terminate action.
     *
     * Failure: we were unable to advance. In general,
     *   this means we stay where we are.
     */
    gotoScreenPath:function(ctxt, path, advancing) {
        var that = this;
        ctxt.log('D','controller.gotoScreenPath');
        var opPath = that.getCurrentScreenPath();
        var currentOp = that.getOperation(opPath);

        var failureObject = that.beforeMove(true, advancing);
        if ( failureObject !== null && failureObject !== undefined ) {
            ctxt.log('I',"gotoContentsScreen.beforeMove.failure", "px: " +  opPath);
            that.screenManager.showScreenPopup(failureObject);
            ctxt.failure(failureObject);
            return;
        }

        ctxt.log('D',"gotoScreenPath.beforeMove.success", "px: " +  opPath);
        var op = that.getOperation(path);
        if ( op === null ) {
            ctxt.failure(that.moveFailureMessage);
            return;
        }
        // special case: jumping across sections
        //
        // do not push the current screen if we are changing sections,
        // as all section jumps implicitly save where they came from.
        if ( currentOp !== null && currentOp !== undefined && op._section_name === currentOp._section_name && advancing ) {
            odkSurveyStateManagement.pushSectionScreenState(opendatakit.getRefId());
        }
        that._doActionAt(ctxt, op, op._token_type, advancing);
    },
    /*
     * NOTE: invoked only by the parsequery webpage
     * initialization code. This should not be called
     * from anywhere else.
     *
     * Execute instructions beginning at the specified path.
     *
     * Success: we have successfully navigated to a screen
     *   displayed to the user or we have executed the
     *   save_and_terminate action.
     *
     * Failure: we were unable to advance. In general,
     *   this means we stay where we are.
     */
    startAtScreenPath:function(ctxt, path) {
        var that = this;
        ctxt.log('D','controller.startAtScreenPath');

        if ( path === null || path === undefined ) {
            path = opendatakit.initialScreenPath;
        }
        var op = that.getOperation(path);
        if ( op === null || op === undefined ) {
            ctxt.failure(that.moveFailureMessage);
            return;
        }
        that._doActionAt(ctxt, op, op._token_type, false);
    },
    /*
     * Remove all database changes since the last user-initiated save.
     *
     * Success: we have successfully deleted all checkpoint
     *   records for this instance the database.
     *
     * NOTE: the odkSurveyStateManagement.ignoreAllChangesCompleted() call may terminate the webkit
     * before ctxt.success() is executed.
     *
     * Failure: we were unable to delete the records.
     */
    ignoreAllChanges:function(ctxt) {
         var model = opendatakit.getCurrentModel();
        var formId = opendatakit.getSettingValue('form_id');
        var instanceId = opendatakit.getCurrentInstanceId();
        database.ignore_all_changes($.extend({},ctxt,{success:function() {
                odkSurveyStateManagement.ignoreAllChangesCompleted( opendatakit.getRefId(), instanceId);
                ctxt.success();
            },
            failure:function(m) {
                odkSurveyStateManagement.ignoreAllChangesFailed( opendatakit.getRefId(), instanceId);
                ctxt.failure(m);
            }}), model, formId, instanceId);
    },
    /*
     * Execute a save-as-incomplete write of all database changes
     * since the last user-initiated save (all the checkpoint saves).
     *
     * Success: we have successfully saved-as-incomplete all checkpoint
     *   records for this instance the database.
     *
     * NOTE: the odkSurveyStateManagement.saveAllChangesCompleted() call may terminate
     * the webkit before ctxt.success() is executed.
     *
     * Failure: we were unable to save-as-incomplete the records.
     */
    saveIncomplete:function(ctxt) {
        var that = this;
        var model = opendatakit.getCurrentModel();
        var formId = opendatakit.getSettingValue('form_id');
        var instanceId = opendatakit.getCurrentInstanceId();
        database.save_all_changes($.extend({},ctxt,{success:function() {
                odkSurveyStateManagement.saveAllChangesCompleted( opendatakit.getRefId(), instanceId, false);
                ctxt.success();
            },
            failure:function(m) {
                odkSurveyStateManagement.saveAllChangesFailed( opendatakit.getRefId(), instanceId);
                ctxt.failure(m);
            }}), model, formId, instanceId, false);
    },
    /*
     * Callback interface from ODK Survey (or other container apps) into javascript.
     * Handles all dispatching back into javascript from external intents
    */
    actionCallback:function(ctxt, dispatchStruct, action, jsonObject) {
        var that = this;
        var promptPath = dispatchStruct.promptPath;
        var internalPromptContext = dispatchStruct.userAction;
        var screenPath = that.getCurrentScreenPath();
        ctxt.log('I','controller.actionCallback', ((screenPath !== null && screenPath !== undefined) ? ("px: " + screenPath) : "no current prompt"));

        // promptPath is the path to the prompt issuing the doAction.
        // prompts know their enclosing screen, so we don't need to
        // worry about that...
        var prompt = that.getPrompt(promptPath);
        if ( prompt !== null && prompt !== undefined ) {
            try {
                // ask this page to then get the appropriate handler
                var handler = prompt.getCallback(promptPath);
                if ( handler !== null && handler !== undefined ) {
                    handler( ctxt, internalPromptContext, action, jsonObject );
                } else {
                    ctxt.log('E','controller.actionCallback.noHandler: ERROR - NO HANDLER ON PROMPT!',
                        promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                    ctxt.failure({message: "Internal error. No matching handler for callback."});
                    return;
                }
            } catch (e) {
                ctxt.log('E','controller.actionCallback.exception: EXCEPTION ON PROMPT!',
                    promptPath,  + " internalPromptContext: " + internalPromptContext + " action: " +
                    action + " exception: " + e.message);
                ctxt.failure({message: "Internal error. Exception while handling callback."});
                return;
            }
        } else {
            ctxt.log('E','controller.actionCallback.noMatchingPrompt: ERROR - PROMPT NOT FOUND!',
                promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
            ctxt.failure({message: "Internal error. Unable to locate matching prompt for callback."});
        }
    },
    changeUrlHash: function(ctxt,url){
        ctxt.log('I',"controller.changeUrlHash", url);
        window.location.hash = url;
        parsequery.changeUrlHash(ctxt);
    },
    // dispatch actions coming from odkCommon (Java code).
    delay: 5,
    insideQueue: false,
    insideCallbackCtxt: false,
    registrationGeneration: 1,
    clearGeneration: 1,
    callbackGeneration: -1,
    queuedActionAvailableListener: function(ctxt, generation) {
        var that = this;
        if (generation !== that.registrationGeneration) {
            odkCommon.log('W','controller:queuedActionAvailableListener('+generation+') not current: ' + that.registrationGeneration);
            // somewhere in the workflow, something will register a listener
            // and trigger this function with the proper registration generation.
            // do nothing.
            ctxt.failure({message: 'registrationGeneration is out-of-date'});
            return;
        }

        if ( that.insideQueue || that.insideCallbackCtxt ) {
            // we should not get in here now that we are using the 
            // enqueueTriggeringContext() mechanism, which ensures that
            // only one active event (such as this callback) is actively
            // being processed at a time.
            odkCommon.log('E','queuedActionAvailableListener:nestedActiveInvokations');
            if ( that.callbackGeneration > generation ) {
                // we are obsolete -- die
                ctxt.failure({message: 'queuedActionAvailableListener: callbackGeneration is out-of-date'});
                return;
            } else if ( that.callbackGeneration === generation ) {
                // we seem to have two active calls for the same
                // generation. Since the other one is within the 
                // critical section, this one should die.
                ctxt.failure({message: 'queuedActionAvailableListener: redundant active request - suppress'});
                return;
            } else {
                // we are a newer generation and an older generation
                // processor is alive. Enqueue a new triggering context.
                var fn = that.createCallbackQueuedActionAvailableListener(generation);
                (fn)();
                ctxt.failure({message: 'queuedActionAvailableListener: newer generation handler - re-issued'});
                return;
            }
        }
        var action;
        
        // OK we are the proper generation -- process the action response
        try {
            that.insideQueue = true;
            that.callbackGeneration = generation;

            action = that.viewFirstQueuedAction();
            if ( action === null || action === undefined ) {
                ctxt.success();
                return;
            }
            that.insideCallbackCtxt = true;
            var baseCtxt = that.newCallbackContext("controller.queuedActionAvailableListener-terminalRetrigger");
            
            var terminateCtxt = $.extend({},baseCtxt,{success: function() {
                    if (generation === that.clearGeneration || generation === that.registrationGeneration) {
                        // if we are no longer the active registration generation
                        // then leave the action queued. Somewhere in the workflow
                        // the proper listener will be invoked and acted upon.
                        that.removeFirstQueuedAction();
                    }
                    that.insideCallbackCtxt = false;
                    if (generation === that.registrationGeneration) {
                        // only if we are the active registration generation
                        // create and enqueue a new triggering context until we have no more actions queued.
                        var fn = that.createCallbackQueuedActionAvailableListener(generation);
                        (fn)();
                    }
                    baseCtxt.success();
                }, failure: function(m) {
                    if (generation === that.clearGeneration || generation === that.registrationGeneration) {
                        // if we are no longer the active registration generation
                        // then leave the action queued. Somewhere in the workflow
                        // the proper listener will be invoked and acted upon.
                        that.removeFirstQueuedAction();
                    }
                    that.insideCallbackCtxt = false;
                    if (generation === that.registrationGeneration) {
                        // only if we are the active registration generation
                        // create and enqueue a new triggering context until we have no more actions queued.
                        var fn = that.createCallbackQueuedActionAvailableListener(generation);
                        (fn)();
                    }
                    baseCtxt.failure(m);
                }});

            ctxt.setTerminalContext(terminateCtxt);
        } finally {
            that.insideQueue = false;
        }
        
        // and now, directly process the action.
        // We have released our that.insideQueue flag, but 
        // have that.insideCallbackCtxt set to true. That
        // won't be released until the terminalCtxt attached
        // to this ctxt gets executed.
        if ( typeof action === 'string' || action instanceof String) {
            ctxt.log('I', "controller.queuedActionAvailableListener.changeUrlHash (immediate)", action);
            that.clearGeneration = generation;
            that.changeUrlHash(ctxt,action);
        } else {
            ctxt.log('I', "controller.queuedActionAvailableListener.actionCallback (immediate)", action.action);
            that.clearGeneration = -1;
            that.actionCallback( ctxt, action.dispatchStruct, action.action, action.jsonValue );
        }
    },
    // construct and return a function that will enqueue a context that will invoke the 
    // the queuedActionAvailableListener with an operable context.
    createCallbackQueuedActionAvailableListener: function(generation) {
        var that = this;
        return function() {
            var ctxt = that.newCallbackContext("controller.createCallbackQueuedActionAvailableListener.impl");

            that.enqueueTriggeringContext($.extend({},ctxt,{success:function() {
                that.queuedActionAvailableListener(ctxt, generation);
            }, failure:function(m) {
                that.queuedActionAvailableListener(ctxt, generation);
            }}));
        };
    },
    /**
     * This notifies the Java layer that the framework has been loaded and
     * will register a listener for all of the queued actions, if any.
     */
    registerQueuedActionAvailableListener: function(ctxt, refId, m) {
        var that = this;
        var generation = ++(that.registrationGeneration);
        // Declare a Terminal Context that:
        // (1) registers the activity listener
        //     (this will schedule one queuedActionAvailableListener() callback)
        // (2) and signal the Java side that we are ready to process callbacks.
        //     this can trigger any number of javascript:... callbacks.
        //
        // We invoke these as a terminal context to ensure that all chained
        // actions have been handled before handling information and actions
        // coming from the Java layer.
        var baseCtxt = that.newCallbackContext("controller.registerQueuedActionAvailableListener");
        var terminateCtxt = $.extend({},baseCtxt,{success: function() {
                baseCtxt.log('I', "controller.registerQueuedActionAvailableListener.terminateCtxt success");
                if (generation === that.registrationGeneration) {
                    var fn = that.createCallbackQueuedActionAvailableListener(generation);
                    odkCommon.registerListener(fn);
                    (fn)();
                }
                baseCtxt.success();
            }, failure: function(m) {
                baseCtxt.log('I', "controller.registerQueuedActionAvailableListener.terminateCtxt failure");
                if (generation === that.registrationGeneration) {
                    var fn = that.createCallbackQueuedActionAvailableListener(generation);
                    odkCommon.registerListener(fn);
                    (fn)();
                }
                baseCtxt.failure(m);
            }});
        ctxt.setTerminalContext(terminateCtxt);
        if ( m === undefined || m === null ) {
            ctxt.success();
        } else {
            ctxt.failure(m);
        }
    },

    // exit the page
    leaveInstance:function(ctxt) {
        ctxt.success();
        // this would reset to the main page.
        // this.openInstance(ctxt, null);
    },
    createInstance: function(ctxt){
        var id = opendatakit.genUUID();
        this.openInstance(ctxt, id);
    },
    openInstance: function(ctxt, id, instanceMetadataKeyValueMap) {
        var that = this;
        var opPath = that.getCurrentScreenPath();

        // NOTE: if the openInstance call failed, we should popup the error from that...
        database.applyDeferredChanges($.extend({},ctxt,{success:function() {
            that.reset($.extend({},ctxt,{success:function() {
                if ( id === null || id === undefined ) {
                    opendatakit.clearCurrentInstanceId();
                } else {
                    opendatakit.setCurrentInstanceId(id);
                }
                var kvList = "";
                if ( instanceMetadataKeyValueMap !== null && instanceMetadataKeyValueMap !== undefined ) {
                    for ( var f in instanceMetadataKeyValueMap ) {
                        if (instanceMetadataKeyValueMap.hasOwnProperty(f)) {
                            var v = instanceMetadataKeyValueMap[f];
                            kvList = kvList + "&" + f + "=" + encodeURIComponent(v);
                        }
                    }
                }
                var qpl = opendatakit.getSameRefIdHashString(opendatakit.getCurrentFormPath(),
                            id, opendatakit.initialScreenPath);



                // this does not reset the RefId...
                parsequery._prepAndSwitchUI( $.extend({},ctxt, {failure:function(m) {
                                ctxt.setTerminalContext(that._synthesizePopupContext(opPath, null));
                                ctxt.failure(m);
                            }}), qpl,
                            id, opendatakit.initialScreenPath,
                            opendatakit.getRefId(), false,
                            instanceMetadataKeyValueMap );
            }}),true);
        }}));
    },
    reset: function(ctxt,sameForm) {
        var that = this;
        ctxt.log('I','controller.reset');
        odkSurveyStateManagement.clearSectionScreenState(opendatakit.getRefId());
        opendatakit.clearCurrentInstanceId();
        if ( that.screenManager !== null && that.screenManager !== undefined) {
            // this asynchronously calls ctxt.success()...
            that.screenManager.cleanUpScreenManager(ctxt);
        } else {
            ctxt.log('I','controller.reset.newScreenManager');
            that.screenManager = new ScreenManager({controller: that});
            that.screenManager.cleanUpScreenManager(ctxt);
        }
    },
    setLocale: function(ctxt, locale) {
        var that = this;
        var tableId = opendatakit.getCurrentTableId();
        var instanceId = opendatakit.getCurrentInstanceId();
        if ( instanceId !== undefined && instanceId !== null && tableId !== "framework" ) {
            // we have an instance in which we can update the locale field with the change
            database.setInstanceMetaData($.extend({}, ctxt, {success: function() {
                opendatakit.setCachedLocale(locale);
                var op = that.getOperation(that.getCurrentScreenPath());
                if ( op !== null && op._token_type === 'begin_screen' ) {
                            that.setScreen(ctxt, op, {changeLocale: true});
                } else {
                    ctxt.failure(that.moveFailureMessage);
                }
            }}), '_locale', locale);
        } else {
            // no instance so we just store it in the cached locale value.
            opendatakit.setCachedLocale(locale);
            var op = that.getOperation(that.getCurrentScreenPath());
            if ( op !== null && op._token_type === 'begin_screen' ) {
                        that.setScreen(ctxt, op, {changeLocale: true});
            } else {
                ctxt.failure(that.moveFailureMessage);
            }
        }

    },
    ///////////////////////////////////////////////////////
    // Logging context
    baseContext : {
        loggingContextChain: [],

        log : function( severity, method, detail ) {
            var that = this;
            var now = new Date().getTime();
            var log_obj = {method: method, timestamp: now, detail: detail };
            if ( that.loggingContextChain.length === 0 ) {
                that.loggingContextChain.push( log_obj );
            }
            // SpeedTracer Logging API
            var logger = window.console;
            if (logger && logger.timeStamp ) {
                logger.timeStamp(method);
            }
            var dlog =  method + " (seq: " + that.seq + " [" + that.loggingLabel + "] timestamp: " + now + ((detail === null || detail === undefined) ? ")" : ") detail: " + detail);
            odkCommon.log(severity, dlog);
        },
        /**
         * we have ended processing on 'this'.
         *
         * Need to merge/resolve the chainedCtxt, terminalCtxt and inheritedTerminalCtxt chains.
         *
         * If we have no chainedCtxt, then:
         *   - terminalCtxt adds to the end of inheritedTerminalCtxt
         *   - move inheritedTerminalCtxt to chainedCtxt
         *
         */
        _spliceChains: function() {
            var that = this;

            var endOfInheritedTerminalCtxt;
            var cur;
            var next;
            // move terminalCtxt chain onto end of inheritedTerminalCtxt

            // 1. find end of inheritedTerminalCtxt
            endOfInheritedTerminalCtxt = that;
            while ( endOfInheritedTerminalCtxt.inheritedTerminalCtxt.ctxt !== null &&
                    endOfInheritedTerminalCtxt.inheritedTerminalCtxt.ctxt !== undefined ) {
                endOfInheritedTerminalCtxt = endOfInheritedTerminalCtxt.inheritedTerminalCtxt.ctxt;
            }

            // 2. chain down terminalCtxt, moving them one-at-a-time over to inheritedTerminalCtxt.
            cur = that.terminalCtxt.ctxt;
            while ( cur !== null && cur !== undefined ) {
                next = cur.terminalCtxt.ctxt;
                // add cur (terminalCtxt) to endOfInheritedTerminalCtxt
                endOfInheritedTerminalCtxt.inheritedTerminalCtxt.ctxt = cur;
                // clear its terminalCtxt value (the chain is being moved to inheritedTerminalCtxt)
                cur.terminalCtxt.ctxt = null;
                // advance down endOfInheritedTerminalCtxt until we are at the end
                // (just in case cur had a chain of inheritedTerminalCtxt).
                while ( endOfInheritedTerminalCtxt.inheritedTerminalCtxt.ctxt !== null &&
                        endOfInheritedTerminalCtxt.inheritedTerminalCtxt.ctxt !== undefined ) {
                    endOfInheritedTerminalCtxt = endOfInheritedTerminalCtxt.inheritedTerminalCtxt.ctxt;
                }
                // and move to the next terminalCtxt in the chain.
                cur = next;
            }
            that.terminalCtxt.ctxt = null;

            /**
             * at this point:
             *   terminalCtxt is empty
             *   inheritedTerminalCtxt may have a chain of ctxts.
             *   chainedCtxt may have a chain of ctxts.
             */
            var cctxt = that.chainedCtxt.ctxt;
            if ( cctxt === null || cctxt === undefined ) {
                /**
                 * no chainedCtxt; the next ctxt to execute is the first
                 * inheritedTerminalCtxt if it exists...
                 */
                that.chainedCtxt.ctxt = that.inheritedTerminalCtxt.ctxt;
                that.inheritedTerminalCtxt.ctxt = null;
                /**
                 * at this point,
                 * the chain of terminalCtxt's are moved to the end of the inheritedTerminalCtxt chain.
                 * (i.e., terminalCtxt chain is empty).
                 * the first inheritedTerminalCtxt is moved to the chainedCtxt chain.
                 * (i.e., inheritedTerminalCtxt chain is empty)
                 * The chainedCtxt chain may or may not be empty.
                 * If it is empty, the execution chain is finished.
                 * Otherwise, the caller should invoke success or failure on the chainedCtxt.
                 */
                return;
            }

            // we have a chainedCtxt.

            // prepend our inheritedTerminalCtxt chain onto the front of the
            // chain under the first chainedCtxt.

            // 1. find end of inheritedTerminalCtxt
            endOfInheritedTerminalCtxt = that;
            while ( endOfInheritedTerminalCtxt.inheritedTerminalCtxt.ctxt !== null &&
                    endOfInheritedTerminalCtxt.inheritedTerminalCtxt.ctxt !== undefined ) {
                endOfInheritedTerminalCtxt = endOfInheritedTerminalCtxt.inheritedTerminalCtxt.ctxt;
            }

            // 2. prepend to first chainedCtxt's inheritedTerminalCtxt
            endOfInheritedTerminalCtxt.inheritedTerminalCtxt.ctxt = cctxt.inheritedTerminalCtxt.ctxt;
            cctxt.inheritedTerminalCtxt.ctxt = that.inheritedTerminalCtxt.ctxt;
            that.inheritedTerminalCtxt.ctxt = null;

            /**
             * at this point,
             * the chain of terminalCtxt's were moved to the end of the inheritedTerminalCtxt chain.
             * (i.e., terminalCtxt chain is empty).
             * the inheritedTerminalCtxt chain is prepended to any inheritedTerminalCtxt of the
             * first ctxt in the chainedCtxt chain.
             * (i.e., inheritedTerminalCtxt chain is empty)
             * The chainedCtxt chain is not empty.
             * The caller should invoke success or failure on the chainedCtxt.
             */
        },

        success: function(){
            this.updateAndLogOutstandingContexts(this);
            this._log('S', 'success!');
            var pi = opendatakit.getPlatformInfo();
            var ll = (pi && pi.logLevel) ? pi.logLevel : 'D';
            var cctxt;
            if ( ll === 'T' ) {
                try {
                    throw Error("call stack details: ");
                } catch (e) {
                    this._log('T', e.stack);
                }
            }

            this._logChains("success[before] ", 0);
            this._spliceChains();
            this._logChains("success[after-] ", 0);

            if ( this.chainedCtxt.ctxt !== null && this.chainedCtxt.ctxt !== undefined ) {
                cctxt = this.chainedCtxt.ctxt;
                setTimeout(function() {
                    cctxt.success();
                    }, 5);
            } else {
                this.dequeueTriggeringContext(true, null);
            }
        },

        failure: function(m) {
            this.updateAndLogOutstandingContexts(this);
            this._log('E', 'failure! ' + (( m !== null && m !== undefined && m.message !== null && m.message !== undefined) ? m.message : ""));
            var pi = opendatakit.getPlatformInfo();
            var ll = (pi && pi.logLevel) ? pi.logLevel : 'D';
            var cctxt;
            if ( ll === 'T' ) {
                try {
                    throw Error("call stack details: ");
                } catch (e) {
                    this._log('T', e.stack);
                }
            }

            this._logChains("failure[before] ", 0);
            this._spliceChains();
            this._logChains("failure[after-] ", 0);

            if ( this.chainedCtxt.ctxt !== null && this.chainedCtxt.ctxt !== undefined ) {
                cctxt = this.chainedCtxt.ctxt;
                setTimeout(function() {
                    cctxt.failure(m);
                    }, 5);
            } else {
                this.dequeueTriggeringContext(false, m);
            }
        },

        setChainedContext: function(ctxt) {
            // append to our chainedCtxt chain.
            var cur = this;
            while ( cur.chainedCtxt.ctxt !== null && cur.chainedCtxt.ctxt !== undefined ) {
                cur = cur.chainedCtxt.ctxt;
            }
            cur.chainedCtxt.ctxt = ctxt;
        },

        setTerminalContext: function(ctxt) {
            // append to our terminalCtxt chain.
            var cur = this;
            while ( cur.terminalCtxt.ctxt !== null && cur.terminalCtxt.ctxt !== undefined ) {
                cur = cur.terminalCtxt.ctxt;
            }
            cur.terminalCtxt.ctxt = ctxt;
        },

        _logChains: function(depth) {
            var str = '----';
            var i;
            for ( i = 0 ; i < depth ; ++i ) {
                str += '--';
            }
            this._log('D',"_logChains " + str + " start chainedCtxt (" + depth + ")");
            if ( this.chainedCtxt.ctxt !== null && this.chainedCtxt.ctxt !== undefined ) {
                this.chainedCtxt.ctxt._logChains(depth+1);
            }
            this._log('D',"_logChains " + str + " start terminalCtxt (" + depth + ")");
            if ( this.terminalCtxt.ctxt !== null && this.terminalCtxt.ctxt !== undefined ) {
                this.terminalCtxt.ctxt._logChains(depth+1);
            }
            this._log('D',"_logChains " + str + " start inheritedTerminalCtxt (" + depth + ")");
            if ( this.inheritedTerminalCtxt.ctxt !== null && this.inheritedTerminalCtxt.ctxt !== undefined ) {
                this.inheritedTerminalCtxt.ctxt._logChains(depth+1);
            }
            this._log('D',"_logChains " + str + " end level (" + depth + ")");
        },

        _log: function( severity, contextMsg ) {
            var value = this.loggingContextChain[0];
            var flattened = contextMsg + " contextType: " + value.method + " (" +
                value.detail + ") seqAtEnd: " + this.getCurrentSeqNo();
            var pi = opendatakit.getPlatformInfo();
            var ll = (pi && pi.logLevel) ? pi.logLevel : 'D';
            switch(severity) {
            case 'S':
                odkCommon.log(severity, flattened);
                break;
            case 'F':
                odkCommon.log(severity, flattened);
                break;
            case 'E':
                odkCommon.log(severity, flattened);
                break;
            case 'W':
                if ( ll !== 'E' ) {
                    odkCommon.log(severity, flattened);
                }
                break;
            case 'I':
                if ( ll !== 'E' && ll !== 'W' ) {
                    odkCommon.log(severity, flattened);
                }
                break;
            case 'D':
                if ( ll !== 'E' && ll !== 'W' && ll !== 'I' ) {
                    odkCommon.log(severity, flattened);
                }
                break;
            case 'T':
                if ( ll !== 'E' && ll !== 'W' && ll !== 'I' && ll !== 'D' ) {
                    odkCommon.log(severity, flattened);
                }
                break;
            default:
                odkCommon.log(severity, flattened);
                break;
            }
        }
    },
    outstandingContexts: [],
    removeAndLogOutstandingContexts: function(ctxt) {
        var that = this;
        var i;
        for ( i = 0 ; i < that.outstandingContexts.length ; ++i ) {
            if ( that.outstandingContexts[i] === ctxt.seq ) {
                that.outstandingContexts.splice(i,1);
                break;
            }
        }
        if ( that.outstandingContexts.length === 0 ) {
                ctxt.log('D',"atEnd.outstandingContext nothingOutstanding!");
        } else {
            for ( i = 0 ; i < that.outstandingContexts.length ; ++i ) {
                ctxt.log('W',"atEnd.outstandingContext seqNo: " + that.outstandingContexts[i]);
            }
        }
    },
    // this is ordinarily a 1-length array of the currently-active
    // ctxt triggered by an event. If there are multiple events queued,
    // this array may contain multiple events. 
    outstandingTriggeringContexts: [],
    // enqueue an event-triggered action onto the outstandingTriggeringContext
    // queue. If the resulting queue is of length 1, then directly execute this
    // context. Otherwise, as each ctxt is processed to completion, the next
    // ctxt in this queue will be processed. 
    enqueueTriggeringContext: function(ctxt) {
        var that = this;
        that.outstandingTriggeringContexts.push(ctxt);
        if ( that.outstandingTriggeringContexts.length === 1 ) {
            // start this context
            setTimeout(function() {
                ctxt.success();
            }, that.delay);
        }
    },
    // invoked when a ctxt completes to trigger the next ctxt in the 
    // outstandingTriggeringContexts array.
    dequeueTriggeringContext: function(propagateSuccessState, m) {
        var that = this;
        var lowest;
        var lowestIdx;
        var ctxt;
        var i;
        if (that.outstandingTriggeringContexts.length !== 0) {
            lowest = -1;
            lowestIdx = null;
            for ( i = 0 ; i < that.outstandingTriggeringContexts.length ; ++i ) {
                ctxt = that.outstandingTriggeringContexts[i];
                if ( lowest === -1 || ctxt.seq < lowest ) {
                    lowest = ctxt.seq;
                    lowestIdx = i;
                }
            }
            that.outstandingTriggeringContexts.splice(lowestIdx,1);
        }

        if (that.outstandingTriggeringContexts.length !== 0) {
            lowest = -1;
            lowestIdx = null;
            for ( i = 0 ; i < that.outstandingTriggeringContexts.length ; ++i ) {
                ctxt = that.outstandingTriggeringContexts[i];
                if ( lowest === -1 || ctxt.seq < lowest ) {
                    lowest = ctxt.seq;
                    lowestIdx = i;
                }
            }
            // fire the next context
            ctxt = that.outstandingTriggeringContexts[lowestIdx];
            if ( propagateSuccessState ) {
                setTimeout(function() {
                    ctxt.success();
                }, that.delay);
            } else {
                setTimeout(function() {
                    ctxt.failure(m);
                }, that.delay);
            }
        }
    },
    newCallbackContext : function( loggingLabel ) {
        var that = this;
        that.eventCount = 1 + that.eventCount;
        var count = that.eventCount;
        that.outstandingContexts.push(count);
        var now = new Date().getTime();
        var ctxt = $.extend({}, that.baseContext,
            { seq: count,
              loggingLabel: (loggingLabel ? loggingLabel : "callbackCtxt"),
              loggingContextChain: [],
              getCurrentSeqNo:function() { return that.eventCount;},
              updateAndLogOutstandingContexts:function() { that.removeAndLogOutstandingContexts(this); },
              dequeueTriggeringContext: function(propagateSuccessState, m) { that.dequeueTriggeringContext(propagateSuccessState, m); },
              chainedCtxt: { ctxt: null },
              terminalCtxt: { ctxt: null },
              inheritedTerminalCtxt: { ctxt: null } });
        var detail =  "seq: " + ctxt.seq + "[" + ctxt.loggingLabel + "] timestamp: " + now;
        ctxt.log('D','callback', detail);
        return ctxt;
    },
    newStartContext: function() {
        var that = this;
        that.eventCount = 1 + that.eventCount;
        var count = that.eventCount;
        that.outstandingContexts.push(count);
        var now = new Date().getTime();
        var ctxt = $.extend({}, that.baseContext,
            { seq: count,
              loggingLabel: "controller.newStartContext",
              loggingContextChain: [],
              getCurrentSeqNo:function() { return that.eventCount;},
              updateAndLogOutstandingContexts:function() { that.removeAndLogOutstandingContexts(this); },
              dequeueTriggeringContext: function(propagateSuccessState, m) { that.dequeueTriggeringContext(propagateSuccessState, m); },
              chainedCtxt: { ctxt: null },
              terminalCtxt: { ctxt: null },
              inheritedTerminalCtxt: { ctxt: null } } );
        var detail =  "seq: " + ctxt.seq + "[" + ctxt.loggingLabel + "] timestamp: " + now;
        ctxt.log('D','startup', detail);
        return ctxt;
    },
    newContext: function( evt, loggingLabel ) {
        var that = this;
        that.eventCount = 1 + that.eventCount;
        var count = that.eventCount;
        that.outstandingContexts.push(count);
        var detail;
        var type;
        loggingLabel = (loggingLabel ? loggingLabel : "callbackCtxt");
        if ( evt === null || evt === undefined ) {
            try {
                throw new Error('dummy');
            } catch (e) {
                odkCommon.log('E',"no event passed into newContext call: " + e.stack);
            }
            detail =  "seq: " + count + "[" + loggingLabel + "] <no event>";
            type = "<no event>";
        } else {
            detail =  "seq: " + count + "[" + loggingLabel + "] timestamp: " + evt.timeStamp + " guid: " + evt.handleObj.guid;

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
            type = evt.type;
        }

        var ctxt = $.extend({}, that.baseContext,
            { seq: count,
              loggingLabel: loggingLabel,
              loggingContextChain: [],
              getCurrentSeqNo:function() { return that.eventCount;},
              updateAndLogOutstandingContexts:function() { that.removeAndLogOutstandingContexts(this); },
              dequeueTriggeringContext: function(propagateSuccessState, m) { that.dequeueTriggeringContext(propagateSuccessState, m); },
              chainedCtxt: { ctxt: null },
              terminalCtxt: { ctxt: null },
              inheritedTerminalCtxt: { ctxt: null } } );
        ctxt.log('D', type, detail);
        return ctxt;
    }

};
});
