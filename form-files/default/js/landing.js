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

This allows the container to hand data off to the script 
without worrying about the state of the script and its 
ability to handle the information at that moment of execution.
*/
window.landing = {
    controller: null,
    promptRef: null,
    pathRef: null,
    actionRef: null,
    jsonString: null,
    opendatakitCallback: function( promptWaitingForData, pathWaitingForData, actionWaitingForData, jsonObject ) {
        if ( this.controller == null ) {
            if ( this.promptRef != null ) {
                console.error("Data loss: existing doAction callback data has been lost");
            }
            this.promptRef = promptWaitingForData;
            this.pathRef = pathWaitingForData;
            this.actionRef = actionWaitingForData;
            this.jsonString = jsonObject;
        } else {
            this.controller.opendatakitCallback( promptWaitingForData, pathWaitingForData, actionWaitingForData, jsonObject );
        }
    },
    setController: function(controller) {
        this.controller = controller;
        if ( this.promptRef != null ) {
            var ref = this.promptRef;
            var path = this.pathRef;
            var action = this.actionRef;
            var json = this.jsonString;
            this.promptRef = null;
            this.pathRef = null;
            this.actionRef = null;
            this.jsonString = null;
            this.controller.opendatakitCallback( ref, path, action, json );
        }
    }
};
