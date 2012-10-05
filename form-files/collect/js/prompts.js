'use strict';

define(['mdl','database','opendatakit','controller','backbone','handlebars','promptTypes','builder','jquery','underscore', 'text!templates/labelHint.handlebars'],
function(mdl, database, opendatakit, controller, Backbone, Handlebars, promptTypes, builder, $, _, labelHintPartial) {

Handlebars.registerHelper('localize', function(textOrLangMap, options) {
    var locale = database.getMetaDataValue('formLocale');
    var str = opendatakit.localize(textOrLangMap,locale);
    return new Handlebars.SafeString(str);
});

Handlebars.registerHelper('metadata', function(value, options) {
    var val = database.getMetaDataValue( options ? options : value );
    return new Handlebars.SafeString( (val != null) ? val : "" );
});

Handlebars.registerHelper('setting', function(value, options) {
    var val = database.getSettingValue( options ? options : value );
    return new Handlebars.SafeString( (val != null) ? val : "" );
});

Handlebars.registerHelper('toFixed', function(value, options) {
    return new Handlebars.SafeString( (value != null) ? (+value).toFixed(options) : "" );
});
    
Handlebars.registerHelper('toExponential', function(value, options) {
    return new Handlebars.SafeString( (value != null) ? (+value).toExponential(options) : "" );
});
    
Handlebars.registerHelper('toPrecision', function(value, options) {
    return new Handlebars.SafeString( (value != null) ? (+value).toPrecision(options) : "" );
});
    
Handlebars.registerHelper('toString', function(value, options) {
    return new Handlebars.SafeString( (value != null) ? (+value).toString(options) : "" );
});
    
Handlebars.registerHelper('stringify', function(value, options) {
    return new Handlebars.SafeString( JSON.stringify(value,null,options) );
});

Handlebars.registerHelper('formDirectory', function(options) {
    return opendatakit.getCurrentFormDirectory();
});

Handlebars.registerHelper('eachProperty', function(context, options) {
    var output = "";
    if($.isPlainObject(context)){
        $.each(context, function(property, value){
            output += options.fn({property:property,value:value});
        });
    }
    return output;
});

Handlebars.registerPartial('labelHint', labelHintPartial);

/**
 * Helper function for replacing variable refrences
 **/
Handlebars.registerHelper('substitute', function(options) {
    var template = Handlebars.compile(options.fn(this));
    return template(database.mdl.data);
});

promptTypes.base = Backbone.View.extend({
    className: "current",
    type: "base",
    database: database,
    mdl: mdl,
    // track how many times we've tried to retrieve and compile the 
    // handlebars template for this prompt.
    initializeTemplateMaxTryCount: 4,
    initializeTemplateTryCount: 0,
    initializeTemplateFailed: false,
    //renderContext is a dynamic object to be passed into the render function.
    //renderContext is meant to be private.
    renderContext: {},
    //Template context is an user specified object that overrides the render context.
    templateContext: {},
    //base html attributes shouldn't be overridden by the user.
    //they should use htmlAttributes for that.
    baseHtmlAttributes: {},
    initialize: function() {
        this.initializeTemplate();
        this.initializeRenderContext();
        this.afterInitialize();
    },
    initializeTemplate: function() {
        //if (this.template != null) return;
        var that = this;
        var f = function() {
            if(that.templatePath){
                that.initializeTemplateTryCount++;
                requirejs(['text!'+that.templatePath], function(source) {
                    that.template = Handlebars.compile(source);
                }, function(err) {
                    if ( err.requireType == "timeout" ) {
                        if ( that.initializeTemplateTryCount >
                                that.initializeTemplateMaxTryCount ) {
                            that.initializeTemplateFailed = true;
                        } else {
                            setTimeout( f, 100);
                        }
                    } else {
                        that.initializeTemplateFailed = true;
                    }
                });
            }
        };
        f();
    },
    isInitializeComplete: function() {
        return (this.templatePath == null || this.template != null);
    },
    initializeRenderContext: function() {
        //Object.create is used because we don't want to modify the class's render context.
        this.renderContext = Object.create(this.renderContext);
        this.renderContext.label = this.label;
        this.renderContext.name = this.name;
        this.renderContext.disabled = this.disabled;
        this.renderContext.image = this.image;
        this.renderContext.audio = this.audio;
        this.renderContext.video = this.video;
        this.renderContext.hide = this.hide;
        this.renderContext.hint = this.hint;
        //It's probably not good to get data like this in initialize
        this.renderContext.formName = database.getMetaDataValue('formName');
        this.renderContext.htmlAttributes = $.extend(Object.create(this.baseHtmlAttributes), this.htmlAttributes);
        $.extend(this.renderContext, this.templateContext);
    },
    afterInitialize: function() {},
    onActivate: function(readyToRenderCallback) {
        readyToRenderCallback();
    },
    /**
     * stopPropagation is used in the events map to disable swiping on various elements
     **/
    stopPropagation: function(evt){
        console.log('stopProp');
        console.log(evt);
        evt.stopImmediatePropagation();
    },
    render: function() {
        this.$el.html(this.template(this.renderContext));
        //Triggering create seems to prevent some issues where jQm styles are not applied.
        this.$el.trigger('create');
        return this;
    },
    //Stuff to be added
    /*
    baseValidate: function(isMoveBackward, context) {
        var that = this;
        var defaultContext = {
            success: function() {},
            failure: function() {}
        };
        context = $.extend(defaultContext, context);
        
        if ( !('name' in that) ) {
            // no data validation if no persistence...
            that.valid = true;
        } else {
            var isRequired;
            if ( that.required ) {
                isRequired = that.required();
            } else {
                isRequired = false;
            }
            
            if ( isRequired && (that.getValue() == null) ) {
                that.valid = false;
            } else if ( that.getValue() == null || that.getValue().length == 0) {
                that.valid = true;
            } else if ( that.validateValue || that.validate ) {
                if ( that.validateValue ) {
                    that.valid = that.validateValue();
                } else {
                    that.valid = true;
                }
                if ( that.valid && that.validate ) {
                    that.valid = that.validate();
                }
            } else {
                that.valid = true;
            }
        }
            
        if (that.valid) {
            context.success();
        } else {
            context.failure();
        }
    },
    */
    //baseValidate isn't meant to be overidden or called externally.
    //It does validation that will be common to most prompts.
    //Validate is menat be overridden and publicly called. 
    //It is validate's responsibility to call baseValidate.
    baseValidate: function(context) {
        var that = this;
        var isRequired = ('required' in that) ? that.required() : false;
        var defaultContext = {
            success: function() {},
            failure: function() {}
        };
        context = $.extend(defaultContext, context);
        that.valid = true;
        if ( !('name' in that) ) {
            // no data validation if no persistence...
            context.success();
            return;
        } 
        if ( that.getValue() == null || that.getValue().length == 0 ) {
            if ( isRequired ) {
                that.valid = false;
                context.failure();
                return;
            }
        } else if ( 'validateValue' in that ) {
            if ( !that.validateValue() ) {
                that.valid = false;
                context.failure();
                return;
            }
        } 
        if ( 'constraint' in that ) {
            console.log(that.constraint)
            if ( !that.constraint() ) {
                that.valid = false;
                $( "#screenPopup" ).find('.message').text(that.constraint_message);
                $( "#screenPopup" ).popup( "open" );
                context.failure();
                return;
            }
        }
        context.success();
    },
    validate: function(context) {
        return this.baseValidate(context);
    },
    getValue: function() {
        if(!this.name) {
            console.error(this);
            throw "Cannot get value of prompt with no name.";
        }
        return database.getDataValue(this.name);
    },
    setValue: function(value, onSuccessfulSave, onFailure) {
        // NOTE: data IS NOT updated synchronously. Use callback!
        var that = this;
        database.setData(that.name, that.datatype, value, onSuccessfulSave, onFailure);
    },
    beforeMove: function(context) {
        context.success();
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
    templatePath: "templates/opening.handlebars",
    onActivate: function(readyToRenderCallback) {
        var formLogo = false;//TODO: Need way to access form settings.
        if(formLogo){
            this.renderContext.headerImg = formLogo;
        }
        var instanceName = database.getMetaDataValue('instanceName');
        if ( instanceName == null ) {
            // construct a friendly name for this new form...
            var date = new Date();
            var dateStr = date.toISOString();
            var locale = database.getMetaDataValue('formLocale');
            var formName = opendatakit.localize(database.getMetaDataValue('formName'),locale);
            instanceName = formName + "_" + dateStr; // .replace(/\W/g, "_")
            database.setMetaData('instanceName', 'string', instanceName, function(){});
        }
        this.renderContext.instanceName = instanceName;
        readyToRenderCallback({enableBackwardNavigation: false});
    },
    renderContext: {
        headerImg: opendatakit.baseDir + 'img/form_logo.png',
        backupImg: opendatakit.baseDir + 'img/backup.png',
        advanceImg: opendatakit.baseDir + 'img/advance.png'
    },
    //Events copied from inputType, should probably refactor.
    events: {
        "change input": "modification",
        "swipeleft input": "stopPropagation",
        "swiperight input": "stopPropagation"
    },
    modification: function(evt) {
        database.setMetaData('instanceName', 'string', this.$('input').val(), function(){});
    },
    beforeMove: function(context) {
        database.setMetaData('instanceName', 'string', this.$('input').val(),
            context.success,
            context.failure);
    }
});
promptTypes.finalize = promptTypes.base.extend({
    type:"finalize",
    hideInHierarchy: true,
    valid: true,
    templatePath: "templates/finalize.handlebars",
    events: {
        "click .save-btn": "saveIncomplete",
        "click .final-btn": "saveFinal"
    },
    renderContext: {
        headerImg: opendatakit.baseDir + 'img/form_logo.png'
    },
    onActivate: function(readyToRenderCallback) {
        var formLogo = false;//TODO: Need way to access form settings.
        if(formLogo){
            this.renderContext.headerImg = formLogo;
        }
        this.renderContext.instanceName = database.getMetaDataValue('instanceName');
        readyToRenderCallback({enableForwardNavigation: false});
        /*
        database.getAllData(function(tlo) {
            readyToRenderCallback({enableForwardNavigation: false});
        });
        */
    },
    saveIncomplete: function(evt) {
        database.save_all_changes(false, function() {
            // TODO: call up to Collect to report completion
        });
    },
    saveFinal: function(evt) {
        database.save_all_changes(true, function() {
            // TODO: call up to Collect to report completion
        });
        
    }
});
promptTypes.json = promptTypes.base.extend({
    type:"json",
    hideInHierarchy: true,
    valid: true,
    templatePath: "templates/json.handlebars",
    onActivate: function(readyToRenderCallback) {
        var that = this;
        database.getAllData(function(tlo) {
            if ( JSON != null ) {
                that.renderContext.value = JSON.stringify(tlo,null,2);
            } else {
                that.renderContext.value = "JSON Unavailable";
            }
            readyToRenderCallback({enableNavigation: false});
        });
    }
});
promptTypes.instances = promptTypes.base.extend({
    type:"instances",
    hideInHierarchy: true,
    valid: true,
    templatePath: "templates/instances.handlebars",
    events: {
        "click .openInstance": "openInstance",
        "click .deleteInstance": "deleteInstance",
        "click .createInstance": "createInstance"
    },
    onActivate: function(readyToRenderCallback) {
        var that = this;
        database.withDb(function(transaction) {
            var ss = database.getAllFormInstancesStmt();
            transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
                that.renderContext.instances = [];
                console.log('test');
                for ( var i = 0 ; i < result.rows.length ; i+=1 ) {
                    var instance = result.rows.item(i);
                    that.renderContext.instances.push({
                        instanceName: instance.instanceName,
                        instance_id: instance.instance_id,
                        last_saved_timestamp: new Date(instance.last_saved_timestamp),
                        saved_status: instance.saved_status
                    });
                }
            });
        }, function(error) {
            console.log("populateInstanceList: failed");
        }, function() {
            $.extend(that.renderContext, {
                formName: database.getMetaDataValue('formName'),
                headerImg: opendatakit.baseDir + 'img/form_logo.png'
            });
            readyToRenderCallback({
                showHeader: false,
                enableNavigation:false
            });
        });
    },
    createInstance: function(evt){
        evt.stopPropagation(true);
        opendatakit.openNewInstanceId(null);
    },
    openInstance: function(evt) {
        evt.stopPropagation(true);
        opendatakit.openNewInstanceId($(evt.target).attr('id'));
    },
    deleteInstance: function(evt){
        var that = this;
        database.delete_all(database.getMetaDataValue('formId'), $(evt.target).attr('id'), function() {
            that.onActivate(function(){that.render();});
        });
    }
});
promptTypes.hierarchy = promptTypes.base.extend({
    type:"hierarchy",
    hideInHierarchy: true,
    valid: true,
    templatePath: 'templates/hierarchy.handlebars',
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
    templatePath: 'templates/repeat.handlebars',
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
promptTypes.select = promptTypes.select_multiple = promptTypes.base.extend({
    type: "select",
    datatype: "text",
    templatePath: "templates/select.handlebars",
    events: {
        "change input": "modification"
    },
    updateRenderValue: function(formValue) {
        console.error(formValue);
        var that = this;
        that.renderContext.value = formValue;
        that.renderContext.choices = _.map(that.renderContext.choices, function(choice) {
            if ( formValue != null ) {
                choice.checked = _.any(formValue, function(valueObject) {
                    return choice.name === valueObject.value;
                });
            } else {
                choice.checked = false;
            }
            return choice;
        });
        that.render();
    },
    // TODO: choices should be cloned and allow calculations in the choices
    // perhaps a null 'name' would drop the value from the list of choices...
    // could also allow calculations in the 'checked' and 'value' fields.
    modification: function(evt) {
        var that = this;
        console.log("select modification");
        console.log(this.$('form').serializeArray());
        var formValue = (this.$('form').serializeArray());
        var saveValue = formValue ? JSON.stringify(formValue) : null;
        this.setValue(saveValue, function() {
            that.updateRenderValue(formValue);
        });
    },
    onActivate: function(readyToRenderCallback) {
        var that = this;
        if(this.param in this.form.choices) {
            //Very important.
            //We need to clone the choices so their values are unique to the prompt.
            that.renderContext.choices = _.map(this.form.choices[this.param], _.clone);
        }
        var saveValue = that.getValue();
        that.updateRenderValue(saveValue ? JSON.parse(saveValue) : null);
        /*
        that.renderContext.value = (saveValue == null) ? null : JSON.parse(saveValue);
        that.renderContext.choices = _.map(that.renderContext.choices, function(choice) {
            if ( that.renderContext.value != null ) {
                choice.checked = _.any(that.renderContext.value, function(valueObject){
                    return choice.name === valueObject.value;
                });
            } else {
                choice.checked = false;
            }
            return choice;
        });
        */
        readyToRenderCallback();
    }
});
promptTypes.select_one = promptTypes.select.extend({
    renderContext: {
        select_one: true
    },
    events: {
        "change input": "modification",
        "click .deselect": "deselect"
    },
    deselect: function(evt) {
        var that = this;
        this.setValue(null, function() {
            that.updateRenderValue(null);
        });
    }
});
promptTypes.select_one_or_other = promptTypes.select_one.extend({
    renderContext: {
        select_one: true,
        or_other: true
    }
});
promptTypes.select_or_other = promptTypes.select.extend({
    renderContext: {
        or_other: true
    }
});
/*
promptTypes.dropdownSelect = promptTypes.base.extend({
    type: "dropdownSelect",
    templatePath: "templates/dropdownSelect.handlebars",
    events: {
        "change select": "modification"
    },
    modification: function(evt) {
        console.log("select modification");
        var that = this;
        database.putData(this.name, "string", that.$('select').val(), function() {
            that.render();
        });
    },
    render: function() {
        var value = this.getValue();
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
    }
});
*/
promptTypes.inputType = promptTypes.text = promptTypes.base.extend({
    type: "text",
    datatype: "text",
    templatePath: "templates/inputType.handlebars",
    renderContext: {
        "type": "text"
    },
    events: {
        "change input": "modification",
        "swipeleft .input-container": "stopPropagation",
        "swiperight .input-container": "stopPropagation"
    },
    debouncedModification: _.debounce(function(that, evt) {
        //a debounced function will postpone execution until after wait (parameter 2)
        //milliseconds have elapsed since the last time it was invoked.
        //Useful for sliders.
        //It might be better to listen for the jQm event for when a slider is released.
        //This could cause problems since the debounced function could fire after a page change.
        var renderContext = this.renderContext;
        var value = this.$('input').val();
        this.setValue((value.length == 0 ? null : value), function() {
            renderContext.value = value;
            renderContext.invalid = !that.validateValue();
            that.render();
        });
    }, 600),
    modification: function(evt) {
        this.debouncedModification(this, evt);
    },
    onActivate: function(readyToRenderCallback) {
        var renderContext = this.renderContext;
        var value = this.getValue();
        renderContext.value = value;
        readyToRenderCallback();
    },
    beforeMove: function(context) {
        var that = this;
        that.setValue(this.$('input').val(), context.success, context.failure );
    },
    validateValue: function() {
        return true;
    }
});
promptTypes.integer = promptTypes.inputType.extend({
    type: "integer",
    datatype: "integer",
    baseHtmlAttributes: {
        'type':'number'
    },
    invalidMessage: "Integer value expected",
    validateValue: function() {
        return !isNaN(parseInt(this.getValue()));
    }
});
promptTypes.number = promptTypes.inputType.extend({
    type: "number",
    datatype: "number",
    baseHtmlAttributes: {
        'type':'number'
    },
    invalidMessage: "Numeric value expected",
    validateValue: function() {
        return !isNaN(parseFloat(this.getValue()));
    }
});
promptTypes.datetime = promptTypes.inputType.extend({
    type: "date",
    datatype: "string",
    baseHtmlAttributes: {
        'type':'date'
    },
    scrollerAttributes: {
        preset: 'datetime',
        theme: 'jqm'
        //Avoiding inline because there
        //can be some debouncing issues
        //display: 'inline',
        //Warning: mixed/clickpick mode doesn't work on galaxy nexus
        //mode: 'scroll'
    },
    events: {
        "change input": "modification",
        "swipeleft input": "stopPropagation",
        "swiperight input": "stopPropagation"
    },
    render: _.debounce(function() {
        var that = this;
        require(["mobiscroll"], function() {
            $.scroller.themes.jqm.defaults = {
                jqmBody: 'd',
                jqmHeader:'d',
                jqmWheel: 'd',
                jqmClickPick: 'd',
                jqmSet: 'd',
                jqmCancel: 'd'
            };
            that.$el.html(that.template(that.renderContext));
            //Triggering create seems to prevent some issues where jQm styles are not applied.
            that.$el.trigger('create');
            that.$('input').scroller(that.scrollerAttributes);
        });
        return this;
    }, 100)
});
promptTypes.date = promptTypes.datetime.extend({
    type: "time",
    baseHtmlAttributes: {
        'type':'date'
    },
    scrollerAttributes: {
        preset: 'date',
        theme: 'jqm'
    }
});
promptTypes.time = promptTypes.datetime.extend({
    type: "string",
    baseHtmlAttributes: {
        'type':'time'
    },
    scrollerAttributes: {
        preset: 'time',
        theme: 'jqm'
    }
});
/**
 * Media is an abstract object used as a base for image/audio/video
 */
promptTypes.media = promptTypes.base.extend({
    type: "media",
    events: {
        "click .captureAction": "capture"
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
    templatePath: "templates/image.handlebars",
    onActivate: function(readyToRenderCallback) {
        var that = this;
        var value = that.getValue();
        that.renderContext.mediaPath = value;
        that.renderContext.uriValue = opendatakit.asUri(value, 'img');
        readyToRenderCallback();
    },
    capture: function() {
        var platInfo = opendatakit.getPlatformInfo();
        if (platInfo.container == 'Android') {
            // TODO: is this the right sequence?
            var outcome = collect.doAction('' + this.promptIdx, 'takePicture', 'org.opendatakit.collect.android.activities.MediaCaptureImageActivity', null);
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
    templatePath: "templates/video.handlebars",
    onActivate: function(readyToRenderCallback) {
        var that = this;
        var value = that.getValue();
        if (value != null && value.length != 0) {
            that.renderContext.uriValue = opendatakit.asUri(value, 'video', 'src');
            that.renderContext.videoPoster = opendatakit.asUri(opendatakit.baseDir + "img/play.png", 'video', 'poster');
        }
        readyToRenderCallback();
    },
    capture: function() {
        var platInfo = opendatakit.getPlatformInfo();
        if (platInfo.container == 'Android') {
            // TODO: is this the right sequence?
            var outcome = collect.doAction('' + this.promptIdx, 'takeVideo', 'org.opendatakit.collect.android.activities.MediaCaptureVideoActivity', null);
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
promptTypes.audio = promptTypes.media.extend({
    type: "audio",
    datatype: "audio",
    templatePath: "templates/audio.handlebars",
    label: 'Take your audio:',
    capture: function() {
        var platInfo = opendatakit.getPlatformInfo();
        if (platInfo.container == 'Android') {
            // TODO: is this the right sequence?
            var outcome = collect.doAction('' + this.promptIdx, 'takeAudio', 'org.opendatakit.collect.android.activities.MediaCaptureAudioActivity', null);
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
promptTypes.screen = promptTypes.base.extend({
    type: "screen",
    prompts: [],
    initialize: function() {
        var prompts = this.prompts;
        this.prompts = builder.initializePrompts(prompts);
        this.initializeTemplate();
        this.initializeRenderContext();
        this.afterInitialize();
    },
    isInitializeComplete: function() {
        var i;
        for ( i = 0 ; i < this.prompts.length; ++i ) {
            var p = this.prompts[i];
            if ( !p.isInitializeComplete() ) return false;
        }
        return true;
    },
    validate: function(context) {
        var that = this;
        var subPrompts, subPromptContext;
        subPrompts = _.filter(this.prompts, function(prompt) {
            if('condition' in prompt) {
                return prompt.condition();
            }
            return true;
        });
        subPromptContext = {
            success: _.after(subPrompts.length, context.success),
            failure: _.once(context.failure)
        }
        $.each(subPrompts, function(idx, prompt){
            prompt.validate(subPromptContext);
        });
    },
    onActivateHelper: function(idx, readyToRenderCallback) {
        var that = this;
        return function() {
            if ( that.prompts.length > idx ) {
                var prompt = that.prompts[idx];
                prompt.onActivate(that.onActivateHelper(idx+1,readyToRenderCallback));
            } else {
                readyToRenderCallback();
            }
        }
    },
    //TODO: Think about how to handle condition functions in onActivate
    onActivate: function(readyToRenderCallback) {
        if ( this.prompts.length == 0 ) {
            readyToRenderCallback();
        } else {
            var prompt = this.prompts[0];
            prompt.onActivate(this.onActivateHelper(1, readyToRenderCallback));
        }
    },
    render: function(){
        var subPrompts = _.filter(this.prompts, function(prompt) {
            if('condition' in prompt) {
                return prompt.condition();
            }
            return true;
        });
        this.$el.html('<div class="odk odk-prompts">');
        var $prompts = this.$('.odk-prompts');
        $.each(subPrompts, function(idx, prompt){
            $prompts.append(prompt.render().$el);
            prompt.delegateEvents();
        });
    }
});
/*
// Calculates are evaluated as they are encountered in the survey control flow.
// If you think of a survey as a procedural program, they are essentially variable assignment.
promptTypes.calculate = promptTypes.base.extend({
    type: "calculate",
    hideInHierarchy: true,
    isInitializeComplete: function() {
        return true;
    },
    onActivate: function(readyToRenderCallback){
        alert("calculate.onActivate: Should never be called!");
    },
    calculation: function() {
    },
    evaluate: function(callback) {
        this.setValue(this.calculation(), callback);
    }
});
*/
promptTypes.label = promptTypes.base.extend({
    type: "label",
    isInitializeComplete: function() {
        return true;
    },
    onActivate: function(readyToRenderCallback){
        alert("label.onActivate: Should never be called!");
    }
});
promptTypes.goto = promptTypes.base.extend({
    type: "goto",
    hideInHierarchy: true,
    isInitializeComplete: function() {
        return true;
    },
    onActivate: function(readyToRenderCallback) {
        alert("goto.onActivate: Should never be called!");
    }
});
promptTypes.goto_if = promptTypes.base.extend({
    type: "goto_if",
    hideInHierarchy: true,
    isInitializeComplete: function() {
        return true;
    },
    condition: function(){
        return false;
    },
    onActivate: function(readyToRenderCallback) {
        alert("goto_if.onActivate: Should never be called!");
    }
});
promptTypes.note = promptTypes.base.extend({
    type: "note",
    templatePath: "templates/note.handlebars"
});
promptTypes.acknowledge = promptTypes.select.extend({
    type: "acknowledge",
    autoAdvance: false,
    modification: function(evt) {
        var that = this;
        var acknowledged = $('#acknowledge').is(':checked');
        this.setValue(acknowledged, function() {
            that.renderContext.choices = [{
                "name": "acknowledge",
                "label": "Acknowledge",
                "checked": acknowledged
            }];
            if(acknowledged && that.autoAdvance) {
                controller.gotoNextScreen();
            }
        });
    },
    onActivate: function(readyToRenderCallback) {
        var that = this;
        var acknowledged;
        try{
            acknowledged = JSON.parse(that.getValue());
        } catch(e) {
            acknowledged = false;
        }
        
        that.renderContext.choices = [{
            "name": "acknowledge",
            "label": "Acknowledge",
            "checked": acknowledged
        }];
        readyToRenderCallback();
    }
});
});
