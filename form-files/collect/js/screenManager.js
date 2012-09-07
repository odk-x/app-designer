define(['opendatakit','controller','zepto','handlebars','templates/compiledTemplates','text'], function(opendatakit, controller, $, Handlebars) {
return Backbone.View.extend({
    el: "body",
    className: "current",
    instance_id:123,
    template: function(){
        var that = this;
        setTimeout(function(){that.render();}, 1000);
        return Handlebars.compile("please wait...");
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
            showFooter: true
        };
        this.prompt.onActivate(function(renderContext){
            if(renderContext){
                $.extend(that.renderContext, renderContext);
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
    gotoNextScreen: function(){
        console.log("gotoNextScreen");
        this.controller.gotoNextScreen();
    },
    gotoPreviousScreen: function(){
        this.controller.gotoPreviousScreen();
    },
    events: {
        "click .next-btn": "gotoNextScreen",
        "click .prev-btn": "gotoPreviousScreen",
		"swipeLeft .current": "gotoNextScreen",
		"swipeRight .current": "gotoPreviousScreen"
    },
    render: function() {
        this.$el.html(this.template(this.renderContext));
		var $contentArea = this.$('.scroll');
        var $promptEl = $('<div>');
		$contentArea.append($promptEl);
		this.prompt.setElement($promptEl.get(0));
		this.prompt.render();
        return this;
    },
    validate: function(flag, context){
        console.log(context);
        context.success();
    },
    computeNextPrompt: function(continuation){
        this.prompt.computeNextPrompt(continuation);
    },
    computePreviousPrompt: function(continuation){
        continuation();
    },
    beforeMove: function(continuation) {
        continuation();
    }
});
});