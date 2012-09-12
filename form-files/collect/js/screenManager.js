// depends upon -- opendatakit, Backbone, $, Handlebars
//
// plus all compiled templates being loaded (which requires 'text' module in requirejs)
//
// plus 'controller' -- to avoid a circular dependency, 'controller' is passed 
// in during initialize() and stored in a member variable.
//
define(['opendatakit','backbone','zepto','handlebars','templates/compiledTemplates','text'], 
function(opendatakit, Backbone, $, Handlebars) {
return Backbone.View.extend({
    el: "body",
    className: "current",
    instance_id:123,
    incompleteTemplate: function(){
        var that = this;
        setTimeout(function(){that.render();}, 100);
        return Handlebars.compile('<div class="current hvmiddle"><div class="hvcenter">Please wait...</div></div>');
    },    
    renderContext:{},
    initialize: function(controller){
        this.controller = controller;
        var that = this;
        requirejs(['text!templates/screen.handlebars'],function(source) {
            that.template = Handlebars.compile(source);
        });
    },
    getName: function(){
        if ( this.prompt != null ) {
            return this.prompt.name;
        } else {
            console.log("no prompt showing on this screen!");
        }
    },
    setPrompt: function(prompt){
        var that = this;
        this.prompt = prompt;
        this.renderContext = {
            showHeader: true,
            showFooter: true,
            // enableNavigation -- defaults to true; false to disable everything...
            // enableForwardNavigation -- forward swipe and button
            // enableBackNavigation -- backward swipe and button
            //
            // the absence of page history disabled backward swipe and button.
        };
        this.prompt.onActivate(function(renderContext){
            if(renderContext){
                $.extend(that.renderContext, renderContext);
            }
            // work through setting the forward/backward enable flags
            if ( that.renderContext.enableNavigation === undefined ) {
                that.renderContext.enableNavigation = true;
            }
            if ( that.renderContext.enableForwardNavigation === undefined ) {
                that.renderContext.enableForwardNavigation = 
                    that.renderContext.enableNavigation;
            }
            if ( that.renderContext.enableBackNavigation === undefined ) {
                that.renderContext.enableBackNavigation = 
                    that.renderContext.enableNavigation &&
                    that.controller.hasPromptHistory();
            }
            that.render();
        });
    },
    /*
    savePrompts: function(callback){
        var that = this;
        var counter = this.prompts.length;
        $.each(this.prompts, function(idx, prompt){
            prompt.model.save({}, {
                error:function(){console.log('error');},
                success:function(){
                    console.log('saved prompt');
                    counter--;
                    if(counter === 0){
                        callback();
                    }
                }
            });
        });
    },*/
    gotoNextScreen: function(e){
        console.log("gotoNextScreen");
        console.log(e);
        this.controller.gotoNextScreen();
    },
    gotoPreviousScreen: function(){
        this.controller.gotoPreviousScreen();
    },
    events: {
        "click .odk-next-btn": "gotoNextScreen",
        "click .odk-prev-btn": "gotoPreviousScreen",
        "swipeLeft .swipeForwardEnabled": "gotoNextScreen",
        "swipeRight .swipeBackEnabled": "gotoPreviousScreen"
    },
    render: function() {
        if ( this.prompt.isInitializeComplete() && this.template != null ) {
            this.$el.html(this.template(this.renderContext));
            var $contentArea = this.$('.odk-scroll');
            var $promptEl = $('<div>');
            $contentArea.append($promptEl);
            this.prompt.setElement($promptEl.get(0));
            this.prompt.render();
            return this;
        } else {
            this.$el.html(this.incompleteTemplate(this.renderContext));
        }
    },
    validate: function(flag, context){
        console.log(context);
        context.success();
    },
    computeNextPrompt: function(continuation){
        this.prompt.computeNextPrompt(continuation);
    },
    beforeMove: function(continuation) {
        continuation();
    }
});
});