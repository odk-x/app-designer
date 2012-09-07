'use strict';
var controller = {
    currentPrompt : null,
    previousPrompts : [],
    start: function($container){
        this.$container = $container;
        this.$currentPage = $('<div class="current-page">');
        $container.append(this.$currentPage);
        return this.setPrompt(this.prompts[0]);
    },
    goBack: function(){
        console.log(this.previousPrompts);
        if(this.previousPrompts.length === 0){
            alert('no previous prompts');
            return;
        }
        return this.setPrompt(this.previousPrompts.pop());
    },
    getPromptByName: function(name){
        var prompts = this.prompts;
        for(var i = 0; i <= prompts.length; i++){
            if(prompts[i].name === name){
                return prompts[i];
            }
        }
    },
    setPrompt: function(prompt){
        console.log(prompt);
        this.currentPrompt = prompt;
        var $promptEl = prompt.render();
        $promptEl.addClass('current-page');
        $promptEl.addClass('current');//TODO: How to handle this in transitions?
        this.$currentPage.replaceWith($promptEl);//TODO .detach() and store elements for going back
        this.$currentPage = $promptEl;
        $promptEl.trigger("create");
        return this.currentPrompt;
    },
    gotoPrompt: function(prompt){
        this.previousPrompts.push(this.currentPrompt);
        return this.setPrompt(prompt);
    },
    gotoPromptName: function(name){
        return this.gotoPrompt(this.getPromtByName(name));
    },
    gotoPromptIdx: function(idx){
        if(idx > this.prompts.length){
            return false;
        } else {
            return this.gotoPrompt(this.prompts[idx]);
        }
    }
};