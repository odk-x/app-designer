'use strict';

define(['database','opendatakit','collect','controller','backbone','handlebars','promptTypes','builder','zepto','underscore','text','templates/compiledTemplates'],
function(database, opendatakit, collect, controller, Backbone, Handlebars, promptTypes, builder, $, _) {

Handlebars.registerHelper('localize', function(textOrLangMap) {
    if(_.isUndefined(textOrLangMap)) {
        return 'undefined';
    }
    if(_.isString(textOrLangMap)) {
        return new Handlebars.SafeString(textOrLangMap);
    }
    var locale = opendatakit.getFormLocale();
    if( locale in textOrLangMap ){
        return new Handlebars.SafeString(textOrLangMap[locale]);
    } else if( 'default' in textOrLangMap ){
        return new Handlebars.SafeString(textOrLangMap['default']);
    } else {
        alert("Could not localize object. See console:");
        console.error("Non localizable object:");
        console.error(textOrLangMap);
    }
});

promptTypes.base = Backbone.View.extend({
    className: "current",
    type: "base",
    required: false,
    //renderContext is a dynamic object to be passed into the render function.
    renderContext: {},
    initialize: function() {
        this.initializePropertyTypes();
        this.initializeTemplate();
        this.initializeRenderContext();
        this.afterInitialize();
    },
    initializeTemplate: function() {
        var that = this;
        if(this.templatePath){
            requirejs(['text!'+this.templatePath], function(source) {
                that.template = Handlebars.compile(source);
            });
        }
    },
    initializeRenderContext: function() {
        //We don't want to modify the top level render context.
        this.renderContext = Object.create(this.renderContext);
        this.renderContext.label = this.label;
        this.renderContext.name = this.name;
    },
    afterInitialize: function() {},
    onActivate: function(readyToRenderCallback) {
        readyToRenderCallback();
    },
    //TODO: I think initialize property types should be done in the builder before
    //initialization. It should only affect property type overrides, and it will enable
    //overriding of initialization functions.
    initializePropertyTypes: function() {
        var that = this;
        //functions for parsing the various property types.
        var propertyParsers = {
            formula: function(content) {
                var variablesRefrenced = [];
                var variableRegex = /\{\{.+?\}\}/g

                    function replaceCallback(match) {
                        var variableName = match.slice(2, - 2);
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
                    that[key] = propertyParser(propertyContent);
                }
                else {
                    console.log('Unknown property type: ' + propertyType);
                }
            }
        });
    },
    template: Handlebars.templates.text, //Make "Override me" template
    render: function() {
        console.log(this.renderContext);
        this.$el.html(this.template(this.renderContext));
        return this;
    },
    //Stuff to be added
    baseValidate: function(isMoveBackward, context) {
        var that = this;
        var defaultContext = {
            success: function() {},
            failure: function() {}
        };
        context = $.extend(defaultContext, context);

        function callback(value) {
            if (that.required) {
                that.valid = value !== '';
            }
            else {
                that.valid = true;
            }
            if (that.valid) {
                context.success();
            }
            else {
                context.failure();
            }
        }
        if ('newValue' in context) {
            callback(context.newValue);
        }
        else {
            this.getValue(function(value) {
                callback(value);
            });
        }
    },
    validate: function(isMoveBackward, context) {
        this.baseValidate(isMoveBackward, context);
    },
    setValue: function(value, onSuccessfulSave) {
        var that = this;
        // TODO: should this validate? Or is validation called before setValue?
        database.putData(that.name, that.datatype, value, onSuccessfulSave);
    },
    getValue: function(callback) {
        database.getData(this.name, callback);
    },
    beforeMove: function(continuation) {
        continuation();
    },
    computePreviousPrompt: function(continuation) {
        continuation(null);
    },
    computeNextPrompt: function(continuation) { // TODO: do we need omitPushOnReturnStack flag here?
        //console.log("computeNextPrompt: beginning ms: " + (+new Date()) + " page: " + this.name);
        var that = this;
        if ('nextPromptName' in this) {
            continuation(controller.getPromptByName(that.nextPromptName));
        }
        else if (this.promptIdx + 1 < controller.prompts.length) {
            continuation(controller.prompts[this.promptIdx + 1]);
        }
        else {
            continuation(null);
        }
    },
    getCallback: function(actionPath) {
        alert('getCallback: Unimplemented: ' + actionPath);
    },
    /*
    registerChangeHandlers: function() {
        // TODO: code that is executed after all page prompts are inserted into the DOM.
        // This code would, e.g., handle value-change events to propagate changes across
        // a page (e.g., update calculated fields).
    },
    */
    validationFailedAction: function(isMoveBackward) {
        alert(this.validationFailedMessage);
    },
    requiredFieldMissingAction: function(isMovingBackward) {
        alert(this.requiredFieldMissingMessage);
    }

});
promptTypes.opening = promptTypes.base.extend({
    type: "opening",
    hideInHierarchy: true,
    template: Handlebars.templates.opening,
    events: {
        "click .editInstances": "editInstances"
    },
    editInstances: function(){
        controller.gotoPromptName('_instances', [], true);
    },
    renderContext: {
        baseDir: collect.baseDir,
        headerImg: 'img/form_logo.png',
        backupImg: 'img/backup.png',
        advanceImg: 'img/advance.png'
    }
});
promptTypes.json = promptTypes.base.extend({
    type:"json",
    hideInHierarchy: true,
	valid: true,
	render: function(){
		var that = this;
		database.getAllData(function(tlo) {
            var $container = $('<pre>JSON: </pre>');
            $container.append(JSON.stringify(tlo));
			that.$el.html($container);
		});
		return this;
	}
});
promptTypes.instances = promptTypes.base.extend({
	type:"instances",
    hideInHierarchy: true,
	valid: true,
    template: Handlebars.templates.instances,
    events: {
        "click .openInstance": "openInstance",
        "click .deleteInstance": "deleteInstance"
    },
    onActivate: function(readyToRenderCallback) {
        var that = this;
        database.withDb(function(transaction) {
            var ss = database.getAllFormInstancesStmt();
            transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
                that.renderContext.instances = [];
                console.log('test');
                for ( var i = 0 ; i < result.rows.length ; i+=1 ) {
                    that.renderContext.instances.push(result.rows.item(i));
                }
            });
        }, function(error) {
            console.log("populateInstanceList: failed");
        }, function() {
            readyToRenderCallback({showHeader: false});
        });
    },
    openInstance: function(evt) {
        opendatakit.openNewInstanceId($(evt.target).attr('id'));
    },
    deleteInstance: function(evt){
        var that = this;
		database.delete_all(opendatakit.getFormId(), $(evt.target).attr('id'), function() {
            that.onActivate(function(){that.render();});
		});
    }
});
promptTypes.hierarchy = promptTypes.base.extend({
    type:"hierarchy",
    hideInHierarchy: true,
	valid: true,
    template: Handlebars.templates.hierarchy,
    events: {
    },
    onActivate: function(readyToRenderCallback) {
        this.renderContext.prompts = controller.prompts;
        readyToRenderCallback({showHeader: false, showFooter: false});
    }
});
promptTypes.repeat = promptTypes.base.extend({
    type: "repeat",
    valid: true,
    template: Handlebars.templates.repeat,
    events: {
        "click .openInstance": "openInstance",
        "click .deleteInstance": "deleteInstance",
        "click .addInstance": "addInstance"
    },
    onActivate: function(readyToRenderCallback) {
        var that = this;
        var subsurveyType = this.param;
        database.withDb(function(transaction) {
            //TODO: Make statement to get all subsurveys with this survey as parent.
            var ss = database.getAllFormInstancesStmt();
            transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
                that.renderContext.instances = [];
                console.log('test');
                for ( var i = 0 ; i < result.rows.length ; i+=1 ) {
                    that.renderContext.instances.push(result.rows.item(i));
                }
            });
        }, function(error) {
            console.log("populateInstanceList: failed");
        }, function() {
            readyToRenderCallback();
        });
    },
    openInstance: function(evt) {
        var instanceId = $(evt.target).attr('id');
    },
    deleteInstance: function(evt) {
        var instanceId = $(evt.target).attr('id');
    },
    addInstance: function(evt) {
        //TODO: Launch new instance of collect
    }
});
promptTypes.select = promptTypes.base.extend({
    type: "select",
    template: Handlebars.templates.select,
    events: {
        "change input": "modification"
    },
    modification: function(evt) {
        console.log("select modification");
        console.log(this.$('form').serializeArray());
        var renderContext = this.renderContext;
        renderContext.value = this.$('form').serializeArray();
        renderContext.choices = _.map(renderContext.choices, function(choice) {
            var matchingValue = _.find(renderContext.value, function(value){
                return choice.name === value.name;
            });
            if(matchingValue){
                return _.extend(choice, matchingValue);
            }
            delete choice.value
            return choice;
        })
        this.render();
    },
    onActivate: function(readyToRenderCallback) {
        var renderContext = this.renderContext;
        if(this.param in this.form.choices){
            renderContext.choices = this.form.choices[this.param];
        }
        readyToRenderCallback();
        /*
        this.getValue(function(value) {
            renderContext.value = value;
            readyToRenderCallback();
        });
        */
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
        var value = this.model.get('value');
        console.log(value);
        var context = {
            name: this.name,
            label: this.label,
            choices: _.map(this.choices, function(choice) {
                if (_.isString(choice)) {
                    choice = {
                        label: choice,
                        value: choice
                    };
                }
                else {
                    if (!('label' in choice)) {
                        choice.label = choice.name;
                    }
                }
                choice.value = choice.name;
                return $.extend({
                    selected: (choice.value === value)
                }, choice);
            })
        };
        this.$el.html(this.template(context));
        return this;
    }
});
promptTypes.inputType = promptTypes.text = promptTypes.base.extend({
    type: "text",
    datatype: "text",
    template: Handlebars.templates.inputType,
    events: {
        "change input": "modification"
    },
    modification: function(evt) {
        var that = this;
        var renderContext = this.renderContext;
        var value = this.$('input').val();
        this.setValue(value, function() {
            renderContext.value = value;

            that.validate(false, {
                success: function() {
                    renderContext.invalid = !that.validateValue(value);
                    that.render();
                },
                failure: function() {
                    renderContext.invalid = true;
                    that.render();
                }
            });
        });
    },
    onActivate: function(readyToRenderCallback) {
        var renderContext = this.renderContext;
        this.getValue(function(value) {
            renderContext.value = value;
            readyToRenderCallback();
        });
    },
    beforeMove: function(continuation) {
        var that = this;
        that.setValue(this.$('input').val(), function() {
            continuation();
        });
    },
    validateValue: function(value) {
        return true;
    }
});
promptTypes.integer = promptTypes.inputType.extend({
    type: "integer",
    datatype: "integer",
    invalidMessage: "Integer value expected",
    validateValue: function(value) {
        return !isNaN(parseInt(value));
    }
});
promptTypes.decimal = promptTypes.inputType.extend({
    type: "decimal",
    datatype: "decimal",
    invalidMessage: "Decimal value expected",
    validateValue: function(value) {
        return !isNaN(parseFloat(value));
    }
});
/**
 * Media is an abstract object used as a base for image/audio/video
 */
promptTypes.media = promptTypes.base.extend({
    type: "media",
    events: {
        "click .whiteButton": "capture"
    },
    getCallback: function(bypath, byaction) {
        var that = this;
        return function(path, action, jsonString) {
            var jsonObject = JSON.parse(jsonString);
            if (jsonObject.status == -1 /* Activity.RESULT_OK */ ) {
                console.log("OK status returned");
                var mediaPath = (jsonObject.result !== null) ? jsonObject.result.mediaPath : null;
                if (mediaPath !== null) {
                    database.getData(that.name, function(value) {
                        console.log("found this path: " + value);
                        if (mediaPath != value) {
                            database.putData(that.name, "file", mediaPath, function() {
                                // TODO: delete old??? Or leave until marked as finalized?
                                // TODO: I'm not sure how the resuming works, but we'll need to make sure
                                // onActivate get's called AFTER this happens.
                            });
                        }
                    });
                }
            }
            else {
                console.log("failure returned");
                alert(jsonObject.result);
            }
        };
    }
});
promptTypes.image = promptTypes.media.extend({
    type: "image",
    datatype: "image",
    label: 'Take your photo:',
    template: Handlebars.templates.image,
    onActivate: function(readyToRenderCallback) {
        var that = this;
        this.getValue(function(value) {
            that.renderContext.mediaPath = value;
            that.renderContext.uriValue = opendatakit.asUri(value, 'img');
        });
        readyToRenderCallback();
    },
    capture: function() {

        if (collect.getPlatformInfo !== 'Android') {
            // TODO: is this the right sequence?
            var outcome = collect.doAction(this.name, 'takePicture', 'org.opendatakit.collect.android.activities.MediaCaptureImageActivity', null);
            console.log("button click outcome is " + outcome);
            if (outcome === null || outcome !== "OK") {
                alert("Should be OK got >" + outcome + "<");
            }
        }
        else {
            // TODO: enable file chooser???
            alert("Not running on Android -- disabled");
        }
    }
});
promptTypes.video = promptTypes.media.extend({
    type: "video",
    label: 'Take your video:',
    template: Handlebars.templates.video,
    onActivate: function(readyToRenderCallback) {
        var that = this;
        this.getValue(function(value) {
            if (value !== null && value.length !== 0) {
                that.renderContext.uriValue = opendatakit.asUri(value, 'video', 'src');
                that.renderContext.videoPoster = opendatakit.asUri(opendatakit.baseDir + "img/play.png", 'video', 'poster');
            }
            readyToRenderCallback();
        });
    },
    capture: function() {
        if (collect.getPlatformInfo !== 'Android') {
            // TODO: is this the right sequence?
            var outcome = collect.doAction(this.name, 'takeVideo', 'org.opendatakit.collect.android.activities.MediaCaptureVideoActivity', null);
            console.log("button click outcome is " + outcome);
            if (outcome === null || outcome !== "OK") {
                alert("Should be OK got >" + outcome + "<");
            }
        }
        else {
            // TODO: enable file chooser???
            alert("Not running on Android -- disabled");
        }
    }
});
promptTypes.audio = promptTypes.base.extend({
    type: "audio",
    datatype: "audio",
    template: Handlebars.templates.audio,
    label: 'Take your audio:',
    capture: function() {
        if (collect.getPlatformInfo !== 'Android') {
            // TODO: is this the right sequence?
            var outcome = collect.doAction(this.name, 'takeAudio', 'org.opendatakit.collect.android.activities.MediaCaptureAudioActivity', null);
            console.log("button click outcome is " + outcome);
            if (outcome === null || outcome !== "OK") {
                alert("Should be OK got >" + outcome + "<");
            }
        }
        else {
            // TODO: enable file chooser???
            alert("Not running on Android -- disabled");
        }
    }

});
promptTypes.group = promptTypes.base.extend({
    type: "group",
    prompts: [],
    initialize: function() {
        console.log('group test');
        //TODO: We should probably try to put this in some sort of object heiarchy.
        this.prompts = builder.initializePrompts(this.form, this.prompts, this);
        this.initializePropertyTypes();
        console.log('group test');
    },
    render: function(){
        this.$el.html('<div class="prompts"></div>');
        var $prompts = this.$('.prompts');
		$.each(this.prompts, function(idx, prompt){
			var $promptEl = $('<div>');
			$prompts.append($promptEl);
			prompt.setElement($promptEl.get(0));
			prompt.render();
		
		});
    }
});
promptTypes.calculate = promptTypes.base.extend({
    type: "calculate",
    hideInHierarchy: true,
    evaluate: function() {
        this.model.set('value', this.formula());
    }
});
promptTypes.label = promptTypes.base.extend({
    type: "label",
    onActivate: function(){
        controller.gotoNextScreen();
    }
});
promptTypes.goto = promptTypes.base.extend({
    type: "goto",
    hideInHierarchy: true,
    onActivate: function() {
        controller.gotoLabel(this.param);
    }
});
});
