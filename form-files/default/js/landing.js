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
window.landing = {
    changeUrlHash: null,
    controller: null,
    promptRef: null,
    pathRef: null,
    actionRef: null,
    jsonString: null,
    opendatakitChangeUrlHash: function(hash) {
        if ( this.controller == null ) {
            shim.log('I', "landing.opendatakitChangeUrlHash.changeUrlHash (queued)");
            this.changeUrlHash = hash;
            this.promptRef = null;
            this.pathRef = null;
            this.actionRef = null;
            this.jsonString = null;
        } else {
            this.changeUrlHash = null;
            this.promptRef = null;
            this.pathRef = null;
            this.actionRef = null;
            this.jsonString = null;
            var ctxt = this.controller.newCallbackContext();
            shim.log('I', "landing.opendatakitChangeUrlHash.changeUrlHash (immediate) seq: " + ctxt.seq);
            ctxt.append("landing.opendatakitChangeUrlHash.changeUrlHash", hash);
            this.controller.changeUrlHash(hash,ctxt);
        }
    },
    opendatakitCallback: function( promptWaitingForData, pathWaitingForData, actionWaitingForData, jsonObject ) {
        if ( this.controller == null ) {
            shim.log('I', "landing.opendatakitCallback.actionCallback (queued)");
            if ( this.promptRef != null ) {
                console.error("Data loss: existing doAction callback data has been lost");
            }
            this.promptRef = promptWaitingForData;
            this.pathRef = pathWaitingForData;
            this.actionRef = actionWaitingForData;
            this.jsonString = jsonObject;
        } else {
            this.promptRef = null;
            this.pathRef = null;
            this.actionRef = null;
            this.jsonString = null;
            var ctxt = this.controller.newCallbackContext();
            shim.log('I', "landing.opendatakitCallback.actionCallback (immediate) seq: " + ctxt.seq);
            ctxt.append("landing.opendatakitCallback.actionCallback", actionWaitingForData);
            this.controller.actionCallback( ctxt, promptWaitingForData, pathWaitingForData, actionWaitingForData, jsonObject );
        }
    },
    setController: function(controller) {
        var that = this;
        this.controller = controller;
		
		// save member values into local scope...
		var hash = this.changeUrlHash;
		var ref = this.promptRef;
		var path = this.pathRef;
		var action = this.actionRef;
		var json = this.jsonString;
		
		// clear member values
		this.changeUrlHash = null;
		this.promptRef = null;
		this.pathRef = null;
		this.actionRef = null;
		this.jsonString = null;
		
        if ( controller == null ) {
            shim.log('I', "landing.setController (null)");
        } else if ( this.changeUrlHash != null ) {
            var ctxt = this.controller.newCallbackContext();
            shim.log('I', "landing.setController.changeUrlHash seq: " + ctxt.seq);
            ctxt.append("landing.setController.changeUrlHash", hash);
            this.controller.changeUrlHash(hash,$.extend({},ctxt,{ success: function() {
				// and process any action callback...
				if ( ref != null ) {
					shim.log('I', "landing.setController.changeUrlHash actionCallback! seq: " + ctxt.seq);
					ctxt.append("landing.setController.changeUrlHash actionCallback!", action);
					this.controller.actionCallback( ctxt, ref, path, action, json );
				} else {
					ctxt.append("landing.setController.changeUrlHash done!", hash);
					ctxt.success();
				}
			}}));
        } else if ( this.promptRef != null ) {
            var ctxt = this.controller.newCallbackContext();
            shim.log('I', "landing.setController.actionCallback seq: " + ctxt.seq);
            ctxt.append("landing.setController.actionCallback", action);
            this.controller.actionCallback( ctxt, ref, path, action, json );
        }
    }
};
