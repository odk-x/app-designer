/*
The landing object is loaded very early in the page-load process
and is used by the container app to signal when doAction() 
responses are available, or when the java application wants 
to change the Url hash.

If the javascript application has a controller registered, then 
the signalling triggers a fetch of the data from the Java side and
immediately passes-through to the controller. 

Otherwise, the callback action information sits on the Java side
until the parsequery logic completes, and the page rendering 
settles, at which point the controller value is passed to this
object and the callback information is flushed to the controller.

This allows the container to hand data off to the script 
without worrying about the state of the script and its 
ability to handle the information at that moment of execution.
*/
window.landing = window.landing || {
    delay: 400,
    insideQueue: false,
    insideCallbackCtxt: false,
    signalQueuedActionAvailable: function() {
        var that = this;
        if ( this.insideQueue || this.insideCallbackCtxt ) return;
        try {
            this.insideQueue = true;
            if ( that.controller !== undefined && that.controller !== null ) {
                // TODO: 
                // need to guard against multiple running requests...
                var value = that.controller.getFirstQueuedAction();
                if ( value === null || value === undefined ) {
                    return;
                }
                var action = JSON.parse(value);
                that.insideCallbackCtxt = true;
                var baseCtxt = that.controller.newCallbackContext();
                var terminateCtxt = $.extend({},baseCtxt,{success: function() {
                        that.insideCallbackCtxt = false;
                        baseCtxt.success();
                        setTimeout(function() {
                            that.signalQueuedActionAvailable();
                            }, that.delay);
                    }, failure: function() {
                        that.insideCallbackCtxt = false;
                        baseCtxt.failure();
                        setTimeout(function() {
                            that.signalQueuedActionAvailable();
                            }, that.delay);
                    }});
                if ( typeof action === 'string' || action instanceof String) {
                    var ctxt = that.controller.newCallbackContext();
                    ctxt.setTerminalContext(terminateCtxt);
                    ctxt.log('I', "landing.opendatakitChangeUrlHash.changeUrlHash (immediate)", action);
                    that.controller.changeUrlHash(ctxt,action);
                } else {
                    var ctxt = that.controller.newCallbackContext();
                    ctxt.setTerminalContext(terminateCtxt);
                    ctxt.log('I', "landing.opendatakitCallback.actionCallback (immediate)", action.action);
                    that.controller.actionCallback( ctxt, action.page, action.path, action.action, action.jsonValue );
                }
            }
        } finally {
            this.insideQueue = false;
        }
    },
    /**
     * Invoked after all of the framework has been loaded.
     * This will kick off the executions of the queued
     * actions, if any.
     */
    setController: function(ctxt, controller, refId, m) {
        var that = this;
        that.insideCallbackCtxt = true;
        that.controller = controller;
        var baseCtxt = that.controller.newCallbackContext();
        var terminateCtxt = $.extend({},baseCtxt,{success: function() {
                that.insideCallbackCtxt = false;
                baseCtxt.success();
                setTimeout(function() {
                    that.signalQueuedActionAvailable();
                    }, that.delay);
            }, failure: function() {
                that.insideCallbackCtxt = false;
                baseCtxt.failure();
                setTimeout(function() {
                    that.signalQueuedActionAvailable();
                    }, that.delay);
            }});
        ctxt.setTerminalContext(terminateCtxt);
        if ( m === undefined || m === null ) {
            shim.frameworkHasLoaded(refId, true );
            ctxt.success();
        } else {
            shim.frameworkHasLoaded(refId, false );
            ctxt.failure(m);
        }
    }
};
