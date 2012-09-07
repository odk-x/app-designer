'use strict';

var Screen = Backbone.View.extend({
    el: "body",
    className: "current",
    instance_id:123,

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
    },
    gotoNextScreen: function(){
        console.log("gotoNextScreen");
        console.log(this);
        var that = this;
        if(this.prompts.length === 0){
            //If there are no prompts just go to th next screen.
            app.navigate(this.instance_id+"/"+this.nextPromptName,
                {trigger: true});
            return;
        }
        var valid = _.all(this.prompts, function(prompt){
            console.log(prompt);
            return prompt.validate();
        });
        if(!valid){
            alert('Invalid');
            return;
        }
        this.savePrompts(function(){
            app.navigate(that.instance_id+"/"+that.nextPromptName, {trigger: true});
        });
    },
    gotoPreviousScreen: function(){
        window.history.back();
    },
    events: {
        "click .next-btn": "gotoNextScreen",
        "click .prev-btn": "gotoPreviousScreen"
    },
    render: function() {
        var that = this;
        require(["text!templates/screen.html"],
            function(screen) {
                var template = that.template = _.template(screen);
                
                that.$el.html(template(that));
                var $contentArea = that.$('.scroll');
                $.each(that.prompts, function(idx, prompt){
                    var $promptEl = $('<div>');
                    $contentArea.append($promptEl);
                    prompt.setElement($promptEl.get(0));
                    prompt.onView();
                    prompt.render();
                });
            }
        );
        return this;
    }
});

var promptTypes = {};
promptTypes.base = Backbone.View.extend({
    className: "current",
    
    type: "base",
    required: false,
    initialize: function() {
        this.initializePropertyTypes();
        this.afterInitialize();
    },
    afterInitialize: function(){
    },
    onView: function(){},
    initializePropertyTypes: function() {
        var that = this;
        //functions for parsing the various property types.
        var propertyParsers = {
            formula: function(content) {
                var variablesRefrenced = [];
                var variableRegex = /\{\{.+?\}\}/g

                function replaceCallback(match) {
                    var variableName = match.slice(2, -2);
                    variablesRefrenced.push(variableName);
                    return variableName;
                }
                content = content.replace(variableRegex, replaceCallback);

                var result = 'if(' + content + '){that.baseValidate(context);} else {context.failure()}';
                result = 'console.log("test");' + result;
                $.each(variablesRefrenced, function(idx, variable) {
                    result = 'controller.getPromptByName("' + variable + '").getValue(function(' + variable + '){' + result + '});';
                });

                //How best to refrence current value?
                result = '(function(context){var that = this; ' + result + '})';
                console.log(result);
                return eval(result);
            }
        };
        $.each(this, function(key, property) {
            var propertyType, propertyContent;
            if (key in that) { //that.hasOwnProperty(key)) {
                if (typeof property === 'function') {
                    return;
                }
                if ($.isPlainObject(property) && ('cell_type' in property)) {
                    propertyType = property.cell_type;
                    propertyContent = property['default'];
                }
                else if ($.isArray(property)) {
                    //This probably just happens for nested prompts
                    //so we don't want to do anything here.
                    return;
                }
                else {
                    if (key in that.form.column_types) {
                        propertyType = that.form.column_types[key];
                        propertyContent = property;
                    }
                    else {
                        //Leave the type as a string/int/bool
                        return;
                    }
                }
                if (propertyType in propertyParsers) {
                    var propertyParser = propertyParsers[propertyType];
                    console.log('Parsing:');
                    console.log(property);
                    that[key] = propertyParser(propertyContent)
                }
                else {
                    console.log('Unknown property type: ' + propertyType);
                }
            }
        });
    },
    render: function() {
		this.$el = $('<div>').text('override me');
        return this;
    },
    validate: function(){
        if (this.required) {
            if(!this.model.has('value')){
                return false;
            }
        }
        return true;
    }
});
promptTypes.opening = promptTypes.base.extend({
    type: "opening",
    render: function() {
        promptTypes.opening.applyTemplate(this,{
            baseDir: collect.baseDir,
            headerImg: 'img/form_logo.png',
            backupImg: 'img/backup.png',
            advanceImg: 'img/advance.png'
        });
        return this;
    }
    /*
    render: function() {
        var $container = this.$el;
        //There are a couple other ways to import the template:
        //1. Use require.js throughout the app and make it so all the template text is a dependency for prompts.js
        //2. Perform an initialization require call with a callback that adds that adds a template member to the object and calls render again.
        require(["text!templates/opening.html"],
            function(opening) {
                var template = _.template(opening);
                $container.html(template({
                    baseDir: collect.baseDir,
                    headerImg: 'img/form_logo.png',
                    backupImg: 'img/backup.png',
                    advanceImg: 'img/advance.png'
                }));
            }
        );
        return this;
    }
    */
},
{
	/**
	 * Class method so that the compile of template is only performed once.
	 */
	applyTemplate: function(that, templateArg) {
		if ( promptTypes.opening.template != null ) {
			that.$el.html(promptTypes.opening.template(templateArg));
		} else {
			requirejs(['text!templates/opening.html'],function(source) {
				promptTypes.opening.template = Handlebars.compile(source);
				that.$el.html(promptTypes.opening.template(templateArg));
			});
		}
	}
}
);

promptTypes.select = promptTypes.base.extend({
    type: "select",
    template: Handlebars.templates.select,
    events: {
        "change input": "modification"
    },
    modification: function(evt){
        console.log("select modification");
        this.model.set('value', this.$('form').serializeArray());
        this.render();
    },
    render: function() {
        var that = this;
        var value = this.model.get('value');
        var selectedChoices = _.pluck(_.filter(value, function(item){
                return item.name === that.name;
            }),
            'value');
        var context = {
            name: this.name,
            label: this.label,
            selectOne:false,
            choices:_.map(this.choices, function(choice){
                if(_.isString(choice)){
                    choice = {label:choice, value:choice};
                } else {
                    if(!('label' in choice)){
                        choice.label = choice.name;
                    }
                }
                choice.value = choice.name;
                return $.extend({
                    selected: _.include(selectedChoices, choice.name)
                }, choice);
            }),
        };
        this.$el.html(this.template(context));
        return this;
    }
});
promptTypes.dropdownSelect = promptTypes.base.extend({
    type: "dropdownSelect",
    template: Handlebars.templates.dropdownSelect,
    events: {
        "change select": "modification"
    },
    modification: function(evt) {
        console.log("select modification");
        this.model.set('value', this.$('select').val());
        this.render();
    },
    render: function() {
        var that = this;
        var value = this.model.get('value');
        console.log(value);
        var context = {
            name: this.name,
            label: this.label,
            choices:_.map(this.choices, function(choice){
                if(_.isString(choice)){
                    choice = {label:choice, value:choice};
                } else {
                    if(!('label' in choice)){
                        choice.label = choice.name;
                    }
                }
                choice.value = choice.name;
                return $.extend({
                    selected: (choice.value === value)
                }, choice);
            }),
        };
        this.$el.html(this.template(context));
        return this;
    }
});

promptTypes.text = promptTypes.base.extend({
    type: "text",
    inputBox: null,
    events: {
        "keyup input": "modification"
    },
    modification: function(evt){
        this.model.set('value', this.$('input').val());
        //currentScreen.render();
    },
    disabled: function(){
        return false;
    },
    render: function() {
        var $container = this.$el;
        var that = this;
        require(["text!templates/text.html"],
            function(text) {
                
                var template = _.template(text);
                
                (function(value){
                    $container.html(template({
                        value: value,
                        label: that.label,
                        disabled: that.disabled()
                    }));
                    //console.log(that);
                    //that.delegateEvents();
                })(that.model.get('value'));
                
            }
        );
        return this;
    }
});
promptTypes.group = promptTypes.base.extend({
    type: "group",
    prompts: [],
    initialize: function() {
        this.prompts = initializePrompts(this.form, this.prompts, this);
        this.initializePropertyTypes();
    }
});
promptTypes.calculate = promptTypes.base.extend({
    type: "calculate",
    evaluate: function(){
        this.model.set('value', this.formula());
    }
});