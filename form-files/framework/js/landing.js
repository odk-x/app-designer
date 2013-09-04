/*
The landing object is loaded very early in the page-load process
and is used by the container app to publish a doAction() response
back into the javascript application. 

If the javascript application has a controller registered, then 
the publishing is an immediate pass-through to the controller. 
Otherwise, the callback data sits here until the parsequery logic 
completes, and the page rendering settles, at which point the 
controller value is passed to this object and the callback information
is flushed to the controller.

Since the parsequery logic is now invoked explicitly, we 
do that via an opendatakitChangeUrlHash(...) method. The
semantics are that calling that method from Java, if the 
controller is not present, will ignore any previous call to
that method and will clear any pending opendatakitCallback(...)
actions.  Once the controller is defined, the changeUrlHash
is applied, followed by any pending opendatakitCallback(...)
action.

This allows the container to hand data off to the script 
without worrying about the state of the script and its 
ability to handle the information at that moment of execution.
*/
window.landing = window.landing || {
    /**
     * Array of { description: 'blah', evaluator: function() {...} }
     * The evaluator should be evaluated to obtain the contexts 
     * that should be executed.
     */
    _chainedContextEvaluators: [],
    /**
     * Work through the _chainedContextEvaluators, if any.
     * Upon the first failure, clear that array.
     */
    _getChainingContext: function() {
        var that = this;
        var ctxt = that.controller.newStartContext();
        var ref = $.extend({},ctxt,{success: function() {
            ctxt.append('setChaining.wrapper.success');
            if ( that._chainedContextEvaluators.length != 0 ) {
                var i;
                for ( i = 0 ; i < that._chainedContextEvaluators.length ; ++i ) {
                    ctxt.append('setChaining.wrapper.success.beforeChaining', 
                        '_chainedContextEvaluators[' + i + ']' +
                        that._chainedContextEvaluators[i].description );
                }
                var realChain = that._chainedContextEvaluators.shift();
                var chainCtxt = (realChain.evaluator)();
                ctxt.setChainedContext(chainCtxt);
            } else {
                ctxt.append('setChaining.wrapper.success - no pending actions');
            }
            ctxt.success();
        }, 
        failure: function(m) {
            ctxt.append('setChaining.wrapper.failure - flush action');
            that._chainedContextEvaluators = [];
            ctxt.failure(m);
        }});
        return ref;
    },
    /**
     * Called from the Java side. If the framework has not completed
     * loading, the controller will not be set. In that case, or if 
     * there are other actions queued, the url hash change will be 
     * added to that queue and performed once the framework has been
     * initialized and the preceding actions in the queue have executed.
     */
    opendatakitChangeUrlHash: function(hash) {
        var that = this;
        if ( that.controller == null || that._chainedContextEvaluators.length != 0 ) {
            // not initialized, or there are other queued requests
            shim.log('I', "landing.opendatakitChangeUrlHash.changeUrlHash (queued)");
            var now = new Date().getTime();
            var txt = "landing.opendatakitChangeUrlHash original timestamp: " + now;
            var fn = function() {
                var ctxt = that.controller.newCallbackContext();
                ctxt.append(txt);
                var ref = $.extend({},ctxt,{ success: function() {
                    ctxt.append("landing.opendatakitChangeUrlHash.changeUrlHash (executing queued request)", hash);
                    that.controller.changeUrlHash($.extend({}, ctxt,{success: function() {
                        ctxt.append("landing.setController.changeUrlHash done!", hash);
                        // attached chaining
                        ctxt.setChainedContext(that._getChainingContext());
                        ctxt.success();
                    }, failure: function(m) {
                        ctxt.append("landing.setController.changeUrlHash flushed all pending actions!", hash);
                        // attached chaining
                        ctxt.setChainedContext(that._getChainingContext());
                        ctxt.failure(m);
                    }}), hash);
                }, failure: function(m) {
                    ctxt.append("landing.setController.changeUrlHash flushed all pending actions!", hash);
                    // attached chaining
                    ctxt.setChainedContext(that._getChainingContext());
                    ctxt.failure(m);
                }});
                return ref;
            };
            that._chainedContextEvaluators.push({ description: 'changeUrlHash: ' + hash, evaluator: fn });
        } else {
            var ctxt = that.controller.newCallbackContext();
            shim.log('I', "landing.opendatakitChangeUrlHash.changeUrlHash (immediate) seq: " + ctxt.seq);
            ctxt.append("landing.opendatakitChangeUrlHash.changeUrlHash", hash);
            that.controller.changeUrlHash(ctxt,hash);
        }
    },
    /**
     * Called from the Java side. If the framework has not completed
     * loading, the controller will not be set. In that case, or if 
     * there are other actions queued, the action callback will be 
     * added to that queue and performed once the framework has been
     * initialized and the preceding actions in the queue have executed.
     */
    opendatakitCallback: function( promptWaitingForData, pathWaitingForData, actionWaitingForData, jsonObject ) {
        var that = this;
        if ( that.controller == null || that._chainedContextEvaluators.length != 0 ) {
            shim.log('I', "landing.opendatakitCallback.actionCallback (queued)");
            var now = new Date().getTime();
            var txt = "landing.opendatakitCallback original timestamp: " + now;
            var fn = function() {
                var ctxt = that.controller.newCallbackContext();
                ctxt.append(txt);
                var ref = $.extend({},ctxt,{ success: function() {
                    shim.log('I', "landing.opendatakitCallback.actionCallback seq: " + ctxt.seq);
                    ctxt.append("landing.opendatakitCallback.actionCallback (executing queued request)", action);
                    that.controller.actionCallback( $.extend({}, ctxt, { success: function() {
                        ctxt.append("landing.opendatakitCallback.actionCallback (executing queued request) success!", action);
                        // attached chaining
                        ctxt.setChainedContext(that._getChainingContext());
                        ctxt.success();
                    }, failure: function(m) {
                        ctxt.append("landing.opendatakitCallback.actionCallback (executing queued request) flushed all pending actions!", action);
                        // attached chaining
                        ctxt.setChainedContext(that._getChainingContext());
                        ctxt.failure(m);
                    }}), 
                        promptWaitingForData, pathWaitingForData, actionWaitingForData, jsonObject );
                }, failure: function(m) {
                    ctxt.append("landing.opendatakitCallback.actionCallback (executing queued request) flushed all pending actions!", action);
                    // attached chaining
                    ctxt.setChainedContext(that._getChainingContext());
                    ctxt.failure(m);
                }});
                return ref;
            };
            that._chainedContextEvaluators.push({ description: 'actionCallback: ' + action, evaluator: fn });
        } else {
            var ctxt = that.controller.newCallbackContext();
            shim.log('I', "landing.opendatakitCallback.actionCallback (immediate) seq: " + ctxt.seq);
            ctxt.append("landing.opendatakitCallback.actionCallback", actionWaitingForData);
            that.controller.actionCallback( ctxt, promptWaitingForData, pathWaitingForData, actionWaitingForData, jsonObject );
        }
    },
    /**
     * Invoked after all of the framework has been loaded.
     * This will kick off the executions of the queued
     * actions, if any.
     */
    setController: function(ctxt, controller, refId, m) {
        var that = this;
        that.controller = controller;
        shim.frameworkHasLoaded(refId, m == null );
        if ( m ) {
            that._chainedContextEvaluators = [];
            ctxt.failure(m);
        } else {
            ctxt.setChainedContext(that._getChainingContext());
            ctxt.success();
        }
    }
};
