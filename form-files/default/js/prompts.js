/*jslint eqeq: true, evil: true, plusplus: true, todo: true, vars: true, white: true, devel: true */
'use strict';
/**
 * All  the standard prompts available to a form designer.
 */
define(['mdl','database','opendatakit','controller','backbone','handlebars','promptTypes','jquery','underscore', 'translations', 'handlebarsHelpers'],
function(mdl,  database,  opendatakit,  controller,  Backbone,  Handlebars,  promptTypes,  $,       _,            translations) {

promptTypes.base = Backbone.View.extend({
    className: "current",
    type: "base",
    database: database,
    constraint_message: "Constraint violated.",
    invalid_value_message: "Invalid value.",
    required_message: "Required value not provided.",
    //renderContext is a dynamic object to be passed into the render function.
    renderContext: {},
    //Template context is an user specified object that overrides the render context.
    templateContext: {},
    baseInputAttributes: {},
    //inputAttributes overrides baseInputAttributes
    inputAttributes: {},
    initialize: function() {
        //this.initializeTemplate();
        this.initializeRenderContext();
        this.afterInitialize();
    },
    getPromptPath: function() {
        return '' + this.promptIdx;
    },
    whenTemplateIsReady: function(ctxt){
        var that = this;
        if(this.template) {
            ctxt.success();
        } else if(this.templatePath) {
            requirejs(['text!'+this.templatePath], function(source) {
                try {
                    that.template = Handlebars.compile(source);
                    ctxt.success();
                } catch (e) {
                    ctxt.append("prompts."+that.type+".whenTemplateIsReady.exception", e);
                    console.error("prompts."+that.type+".whenTemplateIsReady.exception " + String(e) + " px: " + that.promptIdx);
                    ctxt.failure({message: "Error compiling handlebars template."});
                }
            }, function(err) {
                ctxt.append("prompts."+that.type+".whenTemplateIsReady.requirejs.failure", err);
                console.error("prompts."+that.type+".whenTemplateIsReady.requirejs.failure " + String(err) + " px: " + that.promptIdx);
                ctxt.failure({message: "Error loading handlebars template."});
            });
        } else {
            ctxt.append("prompts." + that.type + ".whenTemplateIsReady.noTemplate", "px: " + that.promptIdx);
            console.error("prompts."+that.type+".whenTemplateIsReady.noTemplate px: " + that.promptIdx);
            ctxt.failure({message: "Configuration error: No handlebars template found!"});
        }
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
        this.renderContext.required = this.required;
        this.renderContext.appearance = this.appearance;
        this.renderContext.withOther = this.withOther;
        //It's probably not good to get data like this in initialize
        //Maybe it would be better to use handlebars helpers to get metadata?
        this.renderContext.form_title = opendatakit.getSettingValue('form_title');
        this.renderContext.form_version = opendatakit.getSettingValue('form_version');
        this.renderContext.inputAttributes = $.extend({}, this.baseInputAttributes, this.inputAttributes);
        $.extend(this.renderContext, this.templateContext);
    },
    /**
     * afterInitialize is user defined
     **/
    afterInitialize: function() {},
    preActivate: function(ctxt) {
        var that = this;
        function callFunctionsInSeries(functions){
            if (functions.length > 0) {
                functions[0]($.extend({}, ctxt, {
                    success: function() {
                        callFunctionsInSeries(functions.slice(1));
                    }
                }));
            } else {
                if(('default' in that) && that.getValue() === null) {
                    console.log(that['default']());
                    that.setValue($.extend({}, ctxt, {
                        success: function() {
                            that.whenTemplateIsReady(ctxt);
                        }
                    }), that['default']());
                } else {
                    that.whenTemplateIsReady(ctxt);
                }
            }
        }
        callFunctionsInSeries(that.additionalActivateFunctions);
    },
    postActivate: function(ctxt){
        ctxt.success();
    },
    onActivate: function(ctxt) {
        var that = this;
        this.preActivate($.extend({}, ctxt, {
            success: function() {
                that.postActivate(ctxt);
            }
        }));
    },
    /**
     * stopPropagation is used in the events map to disable swiping on various elements
     **/
    stopPropagation: function(evt){
        var ctxt = controller.newContext(evt);
        ctxt.append("prompts." + this.type + ".stopPropagation", "px: " + this.promptIdx);
        console.log('stopProp');
        console.log(evt);
        evt.stopImmediatePropagation();
        ctxt.success();
    },
    afterRender: function() {},
    render: function() {
        var that = this;
        //A virtual element is created so images can be loaded before the newly rendered screen is shown.
        //I think there is a better way to do this. meteor.js uses an approach were you add template markup to indicate
        //which elements should not be rerendered.
        //This is better because we don't have to wait for images to reload,
        //and it has the additional benefit of making it so we don't loose focus on input fields.
        var $virtualEl = $('<div>');
        var $imagesToLoad;
        var numImagesLoaded = 0;
        function imagesLoaded(){
            that.$el.empty();
            that.$el.append($virtualEl.children());
            that.$el.trigger('create');
        }
        try {
            $virtualEl.html(this.template(this.renderContext));
        } catch(e) {
            console.error("prompts." + that.type + ".render.exception: " + String(e) + ' px: ' + that.promptIdx);
            console.error(that);
            alert("Error in template.");
        }
        $imagesToLoad = $virtualEl.find('img');
        $imagesToLoad.load(function(){
            numImagesLoaded++;
            if(numImagesLoaded === $imagesToLoad.length) {
                imagesLoaded();
            }
        });
        if($imagesToLoad.length === 0) {
            imagesLoaded();
        }
        //If the images don't load after 1 second render the template anyways.
        setTimeout(function(){
            if(numImagesLoaded < $imagesToLoad.length) {
                imagesLoaded();
                //prevent imagesLoaded from being triggered by late images.
                numImagesLoaded = $imagesToLoad.length + 1;
            }
        },1000);
        this.afterRender();
        return this;
    },
    /**
     * baseValidate isn't meant to be overidden or called externally.
     * It does validation that will be common to most prompts.
     * Validate is meant be overridden and publicly called. 
     * It is validate's responsibility to call baseValidate.
     **/
    baseValidate: function(ctxt) {
        var that = this;
        var isRequired = false;
        try {
            isRequired = that.required ? that.required() : false;
        } catch (e) {
            if ( ctxt.strict ) {
                console.error("prompts."+that.type+".baseValidate.required.exception.strict px: " + that.promptIdx + " exception: " + String(e));
                ctxt.append("prompts."+that.type+".baseValidate.required.exception.strict", String(e));
                ctxt.failure({message: "Exception while evaluating required() expression. See console log."});
                return;
            } else {
                console.log("prompts."+that.type+".baseValidate.required.exception.ignored px: " + that.promptIdx + " exception: " + String(e));
                ctxt.append("prompts."+that.type+".baseValidate.required.exception.ignored", String(e));
                isRequired = false;
            }
        }
        that.valid = true;
        if ( !('name' in that) ) {
            // no data validation if no persistence...
            ctxt.success();
            return;
        } 
        var value = that.getValue();
        if ( value == null || value == "" ) {
            if ( isRequired ) {
                that.valid = false;
                ctxt.failure({ message: that.required_message });
                return;
            }
        } else if ( 'validateValue' in that ) {
            if ( !that.validateValue() ) {
                that.valid = false;
                ctxt.failure({ message: that.invalid_value_message });
                return;
            }
        } 
        if ( 'constraint' in that ) {
            var outcome = false;
            try {
                outcome = that.constraint({"allowExceptions":true});
                if ( !outcome ) {
                    that.valid = false;
                    ctxt.failure({ message: that.constraint_message });
                    return;
                }
            } catch (e) {
                ctxt.append("prompts."+that.type+"baseValidate.constraint.exception", e);
                outcome = false;
                that.valid = false;
                ctxt.failure({ message: "Exception in constraint." });
                return;
            }
        }
        ctxt.success();
    },
    validate: function(ctxt) {
        return this.baseValidate(ctxt);
    },
    getValue: function() {
        if (!this.name) {
            console.error("prompts."+that.type+
                ".getValue: Cannot get value of prompt with no name. px: " + this.promptIdx);
            throw new Error("Cannot get value of prompt with no name.");
        }
        return database.getDataValue(this.name);
    },
    setValue: function(ctxt, value) {
        // NOTE: data IS NOT updated synchronously. Use callback!
        var that = this;
        database.setData(ctxt, that.name, value);
    },
    beforeMove: function(ctxt) {
        ctxt.append("prompts." + this.type, "px: " + this.promptIdx);
        ctxt.success();
    },
    getCallback: function(promptPath, internalPromptContext, action) {
        throw new Error("prompts." + this.type, "px: " + this.promptIdx + " unimplemented promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
    },
    __test__: function(evt){
        //This is a utility function for checking to make sure event maps are working.
        console.log(evt);
    }
    /*
    registerChangeHandlers: function() {
        // TODO: code that is executed after all page prompts are inserted into the DOM.
        // This code would, e.g., handle value-change events to propagate changes across
        // a page (e.g., update calculated fields).
    },
    */
    /*
    //TODO: I can't find any refrences to these, so we should probably remove them.
    validationFailedAction: function(isMoveBackward) {
        alert(this.validationFailedMessage);
    },
    requiredFieldMissingAction: function(isMovingBackward) {
        alert(this.requiredFieldMissingMessage);
    }
    */
});
promptTypes.opening = promptTypes.base.extend({
    type: "opening",
    hideInHierarchy: true,
    templatePath: "templates/opening.handlebars",
    postActivate: function(ctxt) {
        var that = this;
        var formLogo = false;//TODO: Need way to access form settings.
        if(formLogo){
            this.renderContext.headerImg = formLogo;
        }
        var instanceName = database.getInstanceMetaDataValue('instanceName');
        if (instanceName == null) {
            // construct a friendly name for this form... use just the date, as the form name is well known
            var date = new Date();
            var dateStr = date.toISOString();
            instanceName = dateStr; // .replace(/\W/g, "_")
            that.renderContext.instanceName = instanceName;
            database.setInstanceMetaData($.extend({}, ctxt, {
                success: function() {
                    ctxt.success({
                        enableBackNavigation: false
                    });
                }
            }), 'instanceName', instanceName);
            return;
        }
        that.renderContext.instanceName = instanceName;
        ctxt.success({enableBackNavigation: false});
    },
    renderContext: {
        headerImg: requirejs.toUrl('img/form_logo.png'),
        backupImg: requirejs.toUrl('img/backup.png'),
        advanceImg: requirejs.toUrl('img/advance.png')
    },
    //Events copied from input_type, should probably refactor.
    events: {
        "change input": "modification",
        "swipeleft .input-container": "stopPropagation",
        "swiperight .input-container": "stopPropagation"
    },
    modification: function(evt) {
        var ctxt = controller.newContext(evt);
        ctxt.append("prompts." + this.type + ".modification", "px: " + this.promptIdx);
        database.setInstanceMetaData(ctxt, 'instanceName', this.$('input').val());
    },
    beforeMove: function(ctxt) {
        ctxt.append("prompts." + this.type + ".beforeMove", "px: " + this.promptIdx);
        database.setInstanceMetaData(ctxt, 'instanceName', this.$('input').val());
        // ctxt.success();
    }
});
promptTypes.finalize = promptTypes.base.extend({
    type:"finalize",
    hideInHierarchy: true,
    valid: true,
    templatePath: "templates/finalize.handlebars",
    events: {
        "click .incomplete": "saveIncomplete",
        "click .finalize": "saveFinal"
    },
    renderContext: {
        headerImg: requirejs.toUrl('img/form_logo.png')
    },
    postActivate: function(ctxt) {
        var formLogo = false;//TODO: Need way to access form settings.
        if(formLogo){
            this.renderContext.headerImg = formLogo;
        }
        this.renderContext.instanceName = database.getInstanceMetaDataValue('instanceName');
        ctxt.success({enableForwardNavigation: false});
    },
    saveIncomplete: function(evt) {
        var ctxt = controller.newContext(evt);
        ctxt.append("prompts." + this.type + ".saveIncomplete", "px: " + this.promptIdx);
        controller.saveAllChanges($.extend({},ctxt,{success:function() {
                controller.leaveInstance(ctxt);
            }}),false);
    },
    saveFinal: function(evt) {
         var ctxt = controller.newContext(evt);
        ctxt.append("prompts." + this.type + ".saveFinal", "px: " + this.promptIdx);
        controller.saveAllChanges($.extend({},ctxt,{success:function() {
                controller.leaveInstance(ctxt);
            }}),true);
    }
});
promptTypes.json = promptTypes.base.extend({
    type:"json",
    hideInHierarchy: true,
    valid: true,
    templatePath: "templates/json.handlebars",
    postActivate: function(ctxt) {
        var that = this;
        if ( JSON != null ) {
            that.renderContext.value = JSON.stringify(database.getAllDataValues(),null,2);
        } else {
            that.renderContext.value = "JSON Unavailable";
        }
        ctxt.success({enableNavigation: false});
    }
});
promptTypes.instances = promptTypes.base.extend({
    type:"instances",
    hideInHierarchy: true,
    valid: true,
    saved_finalized_text: 'finalized',
    saved_incomplete_text: 'incomplete',
    templatePath: "templates/instances.handlebars",
    events: {
        "click .openInstance": "openInstance",
        "click .deleteInstance": "deleteInstance",
        "click .createInstance": "createInstance"
    },
    postActivate: function(ctxt) {
        var that = this;
        ctxt.append("prompts." + this.type + ".postActivate", "px: " + this.promptIdx);
        database.get_all_instances($.extend({},ctxt,{
            success:function(instanceList) {
                that.renderContext.instances = _.map(instanceList, function(term) {
                    var saved = term.saved_status;
                    if ( saved == opendatakit.saved_complete ) {
                        term.saved_text = that.saved_finalized_text;
                    } else if ( saved == opendatakit.saved_incomplete ) {
                        term.saved_text = that.saved_incomplete_text;
                    }
                    return term;
                });
                
                $.extend(that.renderContext, {
                    form_title: opendatakit.getSettingValue('form_title'),
                    headerImg: requirejs.toUrl('img/form_logo.png')
                });
                ctxt.success({
                    showHeader: false,
                    enableNavigation:false,
                    showFooter:false
                });
            }
        }));
    },
    createInstance: function(evt){
        var ctxt = controller.newContext(evt);
        ctxt.append("prompts." + this.type + ".createInstance", "px: " + this.promptIdx);
        evt.stopPropagation(true);
        opendatakit.openNewInstanceId(ctxt, null);
    },
    openInstance: function(evt) {
        var ctxt = controller.newContext(evt);
        ctxt.append("prompts." + this.type + ".openInstance", "px: " + this.promptIdx);
        evt.stopPropagation(true);
        opendatakit.openNewInstanceId(ctxt, $(evt.target).attr('id'));
    },
    deleteInstance: function(evt){
        var ctxt = controller.newContext(evt);
        ctxt.append("prompts." + this.type + ".deleteInstance", "px: " + this.promptIdx);
        var that = this;
        database.delete_all($.extend({}, ctxt, {
            success: function() {
                that.onActivate($.extend({}, ctxt, {
                    success: function() {
                        that.render();
                        ctxt.success();
                    }
                }));
            }
        }),
        $(evt.target).attr('id'));
    }
});
promptTypes.hierarchy = promptTypes.base.extend({
    type:"hierarchy",
    hideInHierarchy: true,
    valid: true,
    templatePath: 'templates/hierarchy.handlebars',
    events: {
    },
    postActivate: function(ctxt) {
        this.renderContext.prompts = controller.prompts;
        ctxt.success({showHeader: true, showFooter: false});
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
    postActivate: function(ctxt) {
        var that = this;
        var subsurveyType = this.param;
        ctxt.append("prompts." + this.type + ".postActivate", "px: " + this.promptIdx);
        database.get_all_instances($.extend({},ctxt,{
            success:function(instanceList) {
                that.renderContext.instances = instanceList;
                ctxt.success({
                    showHeader: false,
                    enableNavigation:false,
                    showFooter:false
                });
        }}), subsurveyType);
    },
    openInstance: function(evt) {
        var instanceId = $(evt.target).attr('id');
    },
    deleteInstance: function(evt) {
        var instanceId = $(evt.target).attr('id');
    },
    addInstance: function(evt) {
        //TODO: Notify collect of change of form? Or fire intent to launch new instance of collect?
    }
});
promptTypes.select = promptTypes.select_multiple = promptTypes.base.extend({
    type: "select",
    templatePath: "templates/select.handlebars",
    events: {
        "change input": "modification",
        "change select": "modification",
        //Only needed for child views
        "click .deselect": "deselect",
        "click .grid-select-item": "selectGridItem",
        "taphold .ui-radio": "deselect"
    },
    selectGridItem: function(evt) {
        var $target = $(evt.target).closest('.grid-select-item');
        var $input = $target.find('input');
        $input.prop("checked", function(index, oldPropertyValue) {
            if( oldPropertyValue ) {
                $input.prop("checked", false);
                $input.change();
            } else {
                $input.prop("checked", true);
                $input.change();
            }
        });
    },
    choice_filter: function(){ return true; },
    updateRenderValue: function(formValue) {
        var that = this;
        //that.renderContext.value = formValue;
        var filteredChoices = _.filter(that.renderContext.choices, function(choice) {
            return that.choice_filter(choice);
        });
        if(this.appearance === "grid") {
            filteredChoices = _.map(filteredChoices, function(choice, idx) {
                var columns = 3;
                choice.colLetter = String.fromCharCode(97 + (idx % columns));
                return choice;
            });
        }
        if ( !formValue ) {
            that.renderContext.choices = _.map(filteredChoices, function(choice) {
                choice.checked = false;
                return choice;
            });
            if(this.withOther) {
                that.renderContext.other = null;
            }
            return;
        }
        //Check appropriate choices based on formValue
        that.renderContext.choices = _.map(filteredChoices, function(choice) {
            choice.checked = _.any(formValue, function(valueObject) {
                return choice.name === valueObject.value;
            });
            return choice;
        });
        if(this.withOther) {
            var otherObject = _.find(formValue, function(valueObject) {
                return ('otherValue' === valueObject.name);
            });
            that.renderContext.other = {
                value: otherObject ? otherObject.value : '',
                checked: _.any(formValue, function(valueObject) {
                    return ('other' === valueObject.value);
                })
            };
        }
    },
    generateSaveValue: function(jsonFormSerialization) {
        var that = this;
        var selectedValues;
        if(jsonFormSerialization){
            selectedValues = _.map(jsonFormSerialization, function(valueObject) {
                if ( valueObject.name === that.name ) {
                    return valueObject.value;
                }
            });
            if(selectedValues && that.withOther) {
                var otherValue = _find(selectedValues, function(value) {
                        return ('other' === value);
                    });
                if (otherValue) {
                    var otherObject = _.find(jsonFormSerialization, function(valueObject) {
                        return ('otherValue' === valueObject.name);
                        });
                    selectedValues.push(otherObject.value);
                }
            }
            return selectedValues;
        }
        return null;
    },
    parseSaveValue: function(savedValue) {
        //Note that this function expects to run after this.renderContext.choices
        //has been initilized.
        var that = this;
        var otherChoices = [];
        var matchedChoice = null;
        var choiceList = _.map(savedValue, function(valueObject) {
            matchedChoice = _.find(that.renderContext.choices, function(choiceObject) {
                            return (valueObject === choiceObject.name);
                });
            if ( matchedChoice != null ) {
                return { "name": that.name,
                         "value": valueObject };
            } else {
                otherChoices.push(valueObject);
            }
        });
        if (that.withOther && otherChoices.length == 1 ) {
            // emit the other choice list and the value for it...
            choiceList.push({
                "name": that.name,
                "value": "other"
            });
            choiceList.push({
                "name": "otherValue",
                "value": otherChoices[0]
            });
        } else if ( otherChoices.length > 0 ) {
            shim.log('W',"invalid choices are in choices list");
            console.log("invalid choices are in choices list");
            // do not log choices in production code...
        }
        return choiceList;
    },
    modification: function(evt) {
        var ctxt = controller.newContext(evt);
        ctxt.append("prompts." + this.type + ".modification", "px: " + this.promptIdx);
        var that = this;
        if(this.withOther) {
            //This hack is needed to prevent rerendering
            //causing the other input to loose focus when clicked.
            if( $(evt.target).val() === 'other' &&
                $(evt.target).prop('checked') &&
                //The next two lines determine if the checkbox was already checked.
                this.renderContext.other &&
                this.renderContext.other.checked) {
                return;
            }
        }
        if(this.appearance === 'grid') {
            //Make selection more reponsive by providing visual feedback before
            //the template is re-rendered.
            this.$('.grid-select-item.ui-bar-e').removeClass('ui-bar-e').addClass('ui-bar-c');
            this.$('input:checked').closest('.grid-select-item').addClass('ui-bar-e');
        }
        var formValue = (this.$('form').serializeArray());
        this.setValue($.extend({}, ctxt, {
            success: function() {
                that.updateRenderValue(formValue);
                that.render();
                ctxt.success();
            }
        }), this.generateSaveValue(formValue));
    },
    postActivate: function(ctxt) {
        var that = this;
		var newctxt = $.extend({}, ctxt, {success: function(outcome) {
			ctxt.append("prompts." + that.type + ".postActivate." + outcome,
						"px: " + that.promptIdx);
			that.updateRenderValue(that.parseSaveValue(that.getValue()));
			ctxt.success();
		}});
        var populateChoicesViaQuery = function(query, newctxt){
            var queryUri = query.uri();
            if(queryUri.search('//') < 0){
                //If the uri is not a content provider or web resource,
                //assume the path  is relative to the form directory.
                queryUri = opendatakit.getCurrentFormPath() + queryUri;
            }
            
            var ajaxOptions = {
                "type": 'GET',
                "url": queryUri,
                "dataType": 'json',
                "data": {},
                "success": function(result){
                    that.renderContext.choices = query.callback(result);
                    newctxt.success("success");
                },
                "error": function(e) {
                    newctxt.append("prompts." + this.type + ".postActivate.error", 
								"px: " + this.promptIdx + " Error fetching choices");
                    //This is a passive error because there could just be a problem
                    //with the content provider/network/remote service rather than with
                    //the form.
                    console.log(e);
                    that.renderContext.passiveError = "Error fetching choices.\n";
                    if(e.statusText) {
                        that.renderContext.passiveError += e.statusText;
                    }
					// TODO: verify how this error should be handled...
					newctxt.failure({message: "Error fetching choices via ajax."});
                }
            };
 
			//TODO: It might also be desireable to make it so queries can refrence
            //datasheets in the XLSX file.
            var queryUriExt = queryUri.split('.').pop();
            if(queryUriExt === 'csv') {
                ajaxOptions.dataType = 'text';
                ajaxOptions.success = function(result) {
                    requirejs(['jquery-csv'], function(){
                        that.renderContext.choices = query.callback($.csv.toObjects(result));
                        newctxt.success("success");
                    },
					function (err) {
						newctxt.append("promptType.select.requirejs.failure", err.toString());
						newctxt.failure({message: "Error fetching choices from csv data."});
					});
                };
            }
            
            $.ajax(ajaxOptions);
		};
		
        that.renderContext.passiveError = null;
        if(that.param in that.form.queries) {
            populateChoicesViaQuery(that.form.queries[that.param], newctxt);
        } else if (that.param in that.form.choices) {
            //Very important.
            //We need to clone the choices so their values are unique to the prompt.
            that.renderContext.choices = _.map(that.form.choices[that.param], _.clone);
            newctxt.success("choiceList.success");
        } else {
            newctxt.failure({message: "Error fetching choices -- no ajax query or choices defined"});
        }
    },
    deselect: function(evt) {
        var ctxt = controller.newContext(evt);
        ctxt.append("prompts." + this.type + ".deselect", "px: " + this.promptIdx);
        this.$('input:checked').prop('checked', false).change();
    }
});
promptTypes.select_one = promptTypes.select.extend({
    renderContext: {
        "select_one": true,
        "deselect" : translations.deselect
    },
    generateSaveValue: function(jsonFormSerialization) {
        var selectedValue, otherValue;
        var promptName = this.name;
        if(jsonFormSerialization) {
            selectedValue = _.find(jsonFormSerialization, function(valueObject) {
                return (promptName === valueObject.name);
            });
            if(selectedValue) {
                if(this.withOther) {
                    if(selectedValue.value === 'other') {
                        otherValue = _.find(jsonFormSerialization, function(valueObject) {
                            return ('otherValue' === valueObject.name);
                        });
                        return (otherValue ? otherValue.value : '');
                    }
                }
                return selectedValue.value;
            }
        }
        return null;
    },
    /**
     * Parse a saved string value into the format
     * returned by jQuery's serializeArray function.
     */
    parseSaveValue: function(savedValue){
        //Note that this function expects to run after renderContext.choices
        //has been initilized.
        var valInChoices = false;
        if(!_.isString(savedValue)) {
            return null;
        }
        if(this.renderContext.choices) {
            valInChoices = _.any(this.renderContext.choices, function(choice){
                return (choice.name === savedValue);
            });
        }
        if (valInChoices) {
            return [{
                "name": this.name,
                "value": savedValue
            }];
        }
        else {
            return [{
                "name": this.name,
                "value": "other"
            }, {
                "name": "otherValue",
                "value": savedValue
            }];
        }
    }
});
promptTypes.select_one_with_other = promptTypes.select_one.extend({
    withOther: true
});
//TODO:
//Since multiple choices are possible should it be possible
//to add arbitrary many other values to a select_with_other?
promptTypes.select_with_other = promptTypes.select.extend({
    withOther: true
});
promptTypes.input_type = promptTypes.text = promptTypes.base.extend({
    type: "text",
    templatePath: "templates/input_type.handlebars",
    renderContext: {
        "type": "text"
    },
    events: {
        "change input": "modification",
        "swipeleft .input-container": "stopPropagation",
        "swiperight .input-container": "stopPropagation"
    },
    //DebouncedRender throttles rerendering so that sliders work.
    debouncedRender: _.debounce(function() {
        this.render();
    }, 500),
    modification: function(evt) {
        var value = $(evt.target).val();
        var that = this;
        if ( that.insideMutex ) {
            console.log("event received while inside mutex");
            return;
        }
        if ( that.lastEventTimestamp == evt.timeStamp ) {
            console.log("duplicate event ignored");
            return;
        }
        that.lastEventTimestamp = evt.timeStamp;
        console.log("event being processed");
        that.insideMutex = true;
        var ctxt = controller.newContext(evt);
        ctxt.append("prompts." + that.type + ".modification", "px: " + that.promptIdx);
        var renderContext = that.renderContext;
        that.setValue($.extend({}, ctxt, {
            success: function() {
                renderContext.value = value;
                renderContext.invalid = !that.validateValue();
                that.insideMutex = false;
                that.debouncedRender();
                ctxt.success();
            },
            failure: function(m) {
                renderContext.value = value;
                renderContext.invalid = true;
                that.insideMutex = false;
                that.debouncedRender();
                ctxt.failure(m);
            }
        }), (value.length === 0 ? null : value));
    },
    postActivate: function(ctxt) {
        var renderContext = this.renderContext;
        var value = this.getValue();
        renderContext.value = value;
        ctxt.success();
    },
    beforeMove: function(ctxt) {
        var that = this;
        that.setValue(ctxt, this.$('input').val());
    },
    validateValue: function() {
        return true;
    }
});
promptTypes.integer = promptTypes.input_type.extend({
    type: "integer",
    baseInputAttributes: {
        'type':'number'
    },
    invalidMessage: "Integer value expected",
    validateValue: function() {
        return !isNaN(parseInt(this.getValue(), 10));
    }
});
promptTypes.decimal = promptTypes.input_type.extend({
    type: "decimal",
    //TODO: This doesn't seem to be working.
    baseInputAttributes: {
        'type':'number'
    },
    invalidMessage: "Numeric value expected",
    validateValue: function() {
        return !isNaN(parseFloat(this.getValue()));
    }
});
promptTypes.datetime = promptTypes.input_type.extend({
    type: "datetime",
    useMobiscroll: true,
    scrollerAttributes: {
        preset: 'datetime',
        theme: 'jqm',
        display: 'modal'
        //Avoiding inline display because there
        //can be some debouncing issues.
        //Warning: mixed/clickpick mode doesn't work on galaxy nexus.
        //mode: 'scroll'
    },
    events: {
        "change input": "modification",
        "swipeleft input": "stopPropagation",
        "swiperight input": "stopPropagation"
    },
    detectNativeDatePicker: function (){
        //For now never use the native datepicker because the samsung note's
        //native datepicker causes the webkit to freeze in some cases.
        return false;
        /*
        //It may be best to user modernizr for this type of functionality.
        var input = document.createElement('input');
        input.setAttribute('type', this.type);
        //See if the date/time type is allowed.
        if(input.type === this.type){
            //See if the input can hold non-date/time values.
            input.value = 'test';
            if (input.value !== 'test') {
                return true;
            }
        }
        return false;
        */
    },
    postActivate: function(ctxt) {
        var that = this;
        var renderContext = this.renderContext;
        if(this.detectNativeDatePicker()){
            renderContext.inputAttributes.type = this.type;
            this.useMobiscroll = false;
            ctxt.success();
        } else {
            require(["mobiscroll"], function() {
                $.scroller.themes.jqm.defaults = {
                    jqmBody: 'd',
                    jqmHeader:'d',
                    jqmWheel: 'd',
                    jqmClickPick: 'd',
                    jqmSet: 'd',
                    jqmCancel: 'd'
                };
                //This is a monkey patch to disable hiding the datepicker when clicking outside of it.
                //This is a problem because users may click twice while they wait for the date
                //picker to open inadvertantly causing it to close.
                var originalJqmInit = $.scroller.themes.jqm.init;
                $.scroller.themes.jqm.init = function(elm, inst) {
                    originalJqmInit(elm, inst);
                    $('.dwo', elm).off('click');
                    $('.dwo').css("background-color", "white");
                    $('.dwo').css("opacity", ".5");
                };
                ctxt.success();
            });
        }
    },
    modification: function(evt) {
        var that = this;
        var value = that.$('input').scroller('getDate');
        var ref = that.getValue();
        var rerender = ((ref == null || value == null) && (ref != value )) ||
                (ref != null && value != null && ref.valueOf() != value.valueOf());
        var ctxt = controller.newContext(evt);
        ctxt.append("prompts." + that.type + ".modification", "px: " + that.promptIdx);
        var renderContext = that.renderContext;
        if ( value == null ) {
            renderContext.value = '';
        } else {
            renderContext.value = that.$('input').val();
        }
        that.setValue($.extend({}, ctxt, {
            success: function() {
                renderContext.invalid = !that.validateValue();
                if ( rerender ) {
                    that.render();
                }
                ctxt.success();
            },
            failure: function(m) {
                renderContext.invalid = true;
                if ( rerender ) {
                    that.render();
                }
                ctxt.failure(m);
            }
        }), value);
    },
    
    afterRender: function() {
        var that = this;
        /*
        //TODO: This will have problems with image labels.
        that.$el.html(that.template(that.renderContext));
        //Triggering create seems to prevent some issues where jQm styles are not applied.
        that.$el.trigger('create');
        */
        if(this.useMobiscroll){
            that.$('input').scroller(that.scrollerAttributes);
            var value = that.getValue();
            if ( value == null ) {
                that.$('input').scroller('setDate',new Date(),false);
            } else {
                that.$('input').scroller('setDate',value, true);
            }
            return this;
        }
    },
    beforeMove: function(ctxt) {
        // the spinner will have already saved the value
        ctxt.success();
    }
});
promptTypes.date = promptTypes.datetime.extend({
    type: "date",
    scrollerAttributes: {
        preset: 'date',
        theme: 'jqm',
        display: 'modal'
    }
});
promptTypes.time = promptTypes.datetime.extend({
    type: "time",
    scrollerAttributes: {
        preset: 'time',
        theme: 'jqm',
        display: 'modal'
    },
    sameTime: function(ref, value) {
        // these are milliseconds relative to Jan 1 1970...
        var ref_tod = (ref.valueOf() % 86400000);
        var value_tod = (value.valueOf() % 86400000);
        return (ref_tod != value_tod);
    },
    modification: function(evt) {
        var that = this;
        var value = that.$('input').scroller('getDate');
        var ref = that.getValue();
        var rerender = ((ref == null || value == null) && (ref != value )) ||
                (ref != null && value != null && that.sameTime(ref,value));
        var ctxt = controller.newContext(evt);
        ctxt.append("prompts." + that.type + ".modification", "px: " + that.promptIdx);
        var renderContext = that.renderContext;
        if ( value == null ) {
            renderContext.value = '';
        } else {
            renderContext.value = that.$('input').val();
        }
        that.setValue($.extend({}, ctxt, {
            success: function() {
                renderContext.invalid = !that.validateValue();
                if ( rerender ) {
                    that.render();
                }
                ctxt.success();
            },
            failure: function(m) {
                renderContext.invalid = true;
                if ( rerender ) {
                    that.render();
                }
                ctxt.failure(m);
            }
        }), value);
    },
    //TODO: This will have problems with image labels.
    render: function() {
        var that = this;
        that.$el.html(that.template(that.renderContext));
        //Triggering create seems to prevent some issues where jQm styles are not applied.
        that.$el.trigger('create');
        that.$('input').scroller(that.scrollerAttributes);
        var value = that.getValue();
        if ( value == null ) {
            that.$('input').val
            that.$('input').scroller('setDate',new Date(),false);
        } else {
            that.$('input').scroller('setDate',value, true);
        }
        return this;
    },
    beforeMove: function(ctxt) {
        // the spinner will have already saved the value
        ctxt.success();
    }
});
/**
 * Media is an abstract object used as a base for image/audio/video
 */
promptTypes.media = promptTypes.base.extend({
    type: "media",
    captureAction: null, // overridden by derived classes -- the intent to fire
    chooseAction: null, // overridden by derived classes -- the intent to fire
    events: {
        "click .captureAction:enabled": "capture",
        "click .chooseAction:enabled": "choose"
    },
    postActivate: function(ctxt) {
        var that = this;
        that.updateRenderContext();
        ctxt.success();
    },
    disableButtons: function() {
        var that = this;
        that.$('.captureAction').attr('disabled','true');
        that.$('.chooseAction').attr('disabled','true');
    },
    enableButtons: function() {
        var that = this;
        that.$('.captureAction').removeAttr('disabled');
        that.$('.chooseAction').removeAttr('disabled');
    },
    capture: function(evt) {
        var that = this;
        var ctxt = controller.newContext(evt);
        that.disableButtons();
        var platInfo = opendatakit.getPlatformInfo();
        // TODO: is this the right sequence?
        var outcome = shim.doAction(that.getPromptPath(), 'capture', that.captureAction, JSON.stringify({ newFile: "opendatakit-macro(newFile)" }));
        ctxt.append('media.capture', platInfo.container + " outcome is " + outcome);
        if (outcome === null || outcome !== "OK") {
            alert("Should be OK got >" + outcome + "<");
            that.enableButtons();
            ctxt.failure({message: "Action canceled."});
        } else {
            ctxt.success();
        }
    },
    choose: function(evt) {
        var that = this;
        var ctxt = controller.newContext(evt);
        that.disableButtons();
        var platInfo = opendatakit.getPlatformInfo();
        // TODO: is this the right sequence?
        var outcome = shim.doAction(that.getPromptPath(), 'choose', that.chooseAction,  JSON.stringify({ newFile: "opendatakit-macro(newFile)" }));
        ctxt.append('media.capture', platInfo.container + " outcome is " + outcome);
        if (outcome === null || outcome !== "OK") {
            alert("Should be OK got >" + outcome + "<");
            that.enableButtons();
            ctxt.failure({message: "Action canceled."});
        } else {
            ctxt.success();
        }
    },
    getCallback: function(promptPath, byinternalPromptContext, byaction) {
        var that = this;
        if ( that.getPromptPath() != promptPath ) {
            throw new Error("Promptpath does not match: " + promptPath + " vs. " + that.getPromptPath());
        }
        return function(ctxt, internalPromptContext, action, jsonString) {
            ctxt.append("prompts." + that.type + 'getCallback.actionFn', "px: " + that.promptIdx +
                " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
            var jsonObject = JSON.parse(jsonString);
            if (jsonObject.status == -1 /* Activity.RESULT_OK */ ) {
                ctxt.append("prompts." + that.type + 'getCallback.actionFn.resultOK', "px: " + that.promptIdx +
                    " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                var uri = (jsonObject.result != null) ? jsonObject.result.uri : null;
                var contentType = (jsonObject.result != null) ? jsonObject.result.contentType : null;
                if (uri != null && contentType != null) {
                    var oldPath = that.getValue();
                    if ( uri != oldPath) {
                        // TODO: delete old??? Or leave until marked as finalized?
                        // TODO: I'm not sure how the resuming works, but we'll need to make sure
                        // onActivate get's called AFTER this happens.
                        database.setData( $.extend({},ctxt,{success:function() {
                                that.enableButtons();
                                that.updateRenderContext();
                                that.render();
                                ctxt.success();
                            },
                            failure:function(m) {
                                that.enableButtons();
                                that.updateRenderContext();
                                that.render();
                                ctxt.failure(m);
                            }}), that.name, { uri : uri, contentType: contentType } );
                    }
                }
            }
            else {
                ctxt.append("prompts." + that.type + 'getCallback.actionFn.failureOutcome', "px: " + that.promptIdx +
                    " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                console.log("failure returned from intent");
                alert(jsonObject.result);
                that.enableButtons();
                that.updateRenderContext();
                that.render();
                ctxt.failure({message: "Action canceled."});
            }
        };
    },
    baseUpdateRenderContext: function() {
        var that = this;
        var mediaUri = that.getValue();
        var uri = (mediaUri != null && mediaUri.uri != null) ? mediaUri.uri : null;
        var contentType = (mediaUri != null && mediaUri.contentType != null) ? mediaUri.contentType : null;
        var safeIdentity = 'T'+opendatakit.genUUID().replace(/[-:]/gi,'');
        var platinfo = opendatakit.getPlatformInfo();
        if ( platinfo.container != 'Android' ) {
            that.renderContext.pre4Android = false;
        } else {
            that.renderContext.pre4Android = ( platinfo.version.substring(0,1) < "4" );
        }
        that.renderContext.mediaPath = uri;
        that.renderContext.uriValue = uri;
        that.renderContext.safeIdentity = safeIdentity;
        that.renderContext.contentType = contentType;
    },
    updateRenderContext: function() {
        this.baseUpdateRenderContext();
    }
});
promptTypes.image = promptTypes.media.extend({
    type: "image",
    extension: "jpg",
    contentType: "image/*",
    buttonLabel: 'Take your photo:',
    templatePath: "templates/image.handlebars",
    captureAction: 'org.opendatakit.survey.android.activities.MediaCaptureImageActivity',
    chooseAction: 'org.opendatakit.survey.android.activities.MediaChooseImageActivity'
});
promptTypes.video = promptTypes.media.extend({
    type: "video",
    contentType: "video/*",
    buttonLabel: 'Take your video:',
    templatePath: "templates/video.handlebars",
    captureAction: 'org.opendatakit.survey.android.activities.MediaCaptureVideoActivity',
    chooseAction: 'org.opendatakit.survey.android.activities.MediaChooseVideoActivity',
    updateRenderContext: function() {
        this.baseUpdateRenderContext();
        // this.renderContext.videoPoster = this.renderContext.uriValue;
    }
});
promptTypes.audio = promptTypes.media.extend({
    type: "audio",
    contentType: "audio/*",
    buttonLabel: 'Take your audio:',
    templatePath: "templates/audio.handlebars",
    captureAction: 'org.opendatakit.survey.android.activities.MediaCaptureAudioActivity',
    chooseAction: 'org.opendatakit.survey.android.activities.MediaChooseAudioActivity'
});
/**
 * launch_intent is an abstract prompt type used as a base for single intent launching (e.g. barcodes)
 * Ideally just the templates and intentStrings will need to be customized.
 */
promptTypes.launch_intent = promptTypes.base.extend({
    type: "launch_intent",
    buttonLabel: 'Launch intent',
    templatePath: "templates/launch_intent.handlebars",
    intentString: "",
    intentParameters: null,//TODO: Allow this arguement to be an object {} -- note that we JSON.stringify this...,
    events: {
        "click .launch": "launch"
    },
    postActivate: function(ctxt) {
        var that = this;
        var value = that.getValue();
        that.renderContext.value = value;
        that.renderContext.buttonLabel = that.buttonLabel;
        ctxt.success();
    },
    launch: function(evt) {
        var ctxt = controller.newContext(evt);
        var platInfo = opendatakit.getPlatformInfo();
        $('#block-ui').show().on('swipeleft swiperight click', function(evt) {
            evt.stopPropagation();
        });
        //We assume that the webkit could go away when an intent is launched,
        //so this prompt's "address" is passed along with the intent.
        var outcome = shim.doAction(this.getPromptPath(), 'launch', this.intentString,
                            ((this.intentParameters == null) ? null : JSON.stringify(this.intentParameters)));
        ctxt.append(this.intentString, platInfo.container + " outcome is " + outcome);
        if (outcome && outcome === "OK") {
            ctxt.success();
        } else {
            alert("Should be OK got >" + outcome + "<");
            $('#block-ui').hide().off();
            ctxt.failure({message: "Action canceled."});
        }
        //Removing this because I want to simulate intents
        //when not on android.
    },
    /**
     * When the intent returns a result this factory function creates a callback to process it.
     * The callback can't use any state set before the intent was launched because the page might have been reloaded.
     */
    getCallback: function(promptPath, byinternalPromptContext, byaction) {
        var that = this;
        $('#block-ui').hide().off();
        if ( that.getPromptPath() != promptPath ) {
            throw new Error("Promptpath does not match: " + promptPath + " vs. " + that.getPromptPath());
        }
        return function(ctxt, internalPromptContext, action, jsonString) {
            var jsonObject;
            ctxt.append("prompts." + that.type + 'getCallback.actionFn', "px: " + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
            try {
                jsonObject = JSON.parse(jsonString);
            } catch (e) {
                ctxt.append("prompts." + that.type + 'getCallback.actionFn.JSONparse.exception', "px: " + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action + ' exception ' + String(e));
                console.error("prompts." + that.type + 'getCallback.actionFn.JSONparse.exception px: ' + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action + ' exception ' + String(e));
                ctxt.failure({message: "Action response could not be parsed."});
            }
            if (jsonObject.status == -1 ) { // Activity.RESULT_OK
                ctxt.append("prompts." + that.type + 'getCallback.actionFn.resultOK', "px: " + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                if (jsonObject.result != null) {
                    that.setValue($.extend({}, ctxt, {
                        success: function() {
                            that.renderContext.value = that.getValue();
                            that.render();
                            ctxt.success();
                        }
                    }), that.extractDataValue(jsonObject));
                }
            } else {
                ctxt.append("prompts." + that.type + 'getCallback.actionFn.failureOutcome', "px: " + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                console.error("prompts." + that.type + 'getCallback.actionFn.failureOutcome px: ' + that.promptIdx + " promptPath: " + promptPath + " internalPromptContext: " + internalPromptContext + " action: " + action);
                ctxt.failure({message: "Action canceled."});
            }
        };
    },
    extractDataValue: function(jsonObject) {
        return jsonObject.result;
    }
});
/* Save only the SCAN_RESULT */
promptTypes.barcode = promptTypes.launch_intent.extend({
    type: "barcode",
    intentString: 'com.google.zxing.client.android.SCAN',
     extractDataValue: function(jsonObject) {
        return jsonObject.result.SCAN_RESULT;
    }
});
promptTypes.geopoint = promptTypes.launch_intent.extend({
    type: "geopoint",
    templatePath: "templates/geopoint.handlebars",
    intentString: 'org.opendatakit.survey.android.activities.GeoPointActivity',
    extractDataValue: function(jsonObject) {
        return {
            latitude: jsonObject.result.latitude,
            longitude: jsonObject.result.longitude,
            altitude: jsonObject.result.altitude,
            accuracy: jsonObject.result.accuracy
        };
    }
});
promptTypes.geopointmap = promptTypes.launch_intent.extend({
    type: "geopointmap",
    intentString: 'org.opendatakit.survey.android.activities.GeoPointMapActivity',
     extractDataValue: function(jsonObject) {
        return { latitude: jsonObject.result.latitude, 
                 longitude: jsonObject.result.longitude, 
                 altitude: jsonObject.result.altitude, 
                 accuracy: jsonObject.result.accuracy };
    }
});
/*
//HTML5 geopoints seem to work in the browser but not in the app.
promptTypes.geopoint = promptTypes.input_type.extend({
    type: "geopoint",
    label: 'Capture geopoint:',
    templatePath: "templates/geopoint.handlebars",
    events: {
        "click .captureAction": "capture"
    },
    capture: function(evt){
        var that = this;
        that.$('.status').text("Capturing...");
        that.$('.captureAction').addClass('ui-disabled');
        function success(position) {
            that.setValue($.extend({}, controller.newContext(evt), {
                success: function() {
                    that.renderContext.value = position;
                    that.render();
                }
            }), position);
        }
        function error(msg) {
            that.$('.status').text((typeof msg == 'string') ? msg : "failed");
            console.log(arguments);
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, error, {
                "enableHighAccuracy": true
            });
        } else {
            error('not supported');
        }
    },
    postActivate: function(ctxt) {
        var that = this;
        var value = that.getValue();
        that.renderContext.value = value;
        ctxt.success();
    }
});
*/
promptTypes.screen = promptTypes.base.extend({
    type: "screen",
    prompts: [],
    initialize: function() {
        var that = this;
        var curPath = that.getPromptPath();
        //Wire up the prompts so that if any of them rerender the screen rerenders.
        //TODO: Think about whether there is a better way of doing this.
        //Maybe bind this or subprompts to database change events instead?
        _.each(this.prompts, function(prompt){
            prompt._screenRender = prompt.render;
            var curPromptPath = curPath + '.' + prompt.promptIdx;
            prompt.render = function(){
                that.render();
            };
            prompt.getPromptPath = function() {
                return curPromptPath;
            };
        });
        //this.initializeTemplate();
        this.initializeRenderContext();
        this.afterInitialize();
    },
    getActivePrompts: function(context) {
        var that = this;
        var subPrompts;
        subPrompts = _.filter(that.prompts, function(prompt) {
            try {
                if('condition' in prompt) {
                    return prompt.condition();
                }
            } catch (e) {
                if ( context ) {
                    context.append('prompts.screen.getActivePrompts.condition.exception', String(e));
                } else {
                    console.error('prompts.screen.getActivePrompts.condition.exception: ' + String(e));
                }
                return false;
            }
            return true;
        });
        return subPrompts;
    },
    beforeMove: function(context) {
        var that = this;
        var subPrompts, subPromptContext;
        subPrompts = that.getActivePrompts(context);
        subPromptContext = $.extend({},context,{
            success: _.after(subPrompts.length, context.success),
            failure: _.once(context.failure)
        });
        $.each(subPrompts, function(idx, prompt){
            prompt.beforeMove(subPromptContext);
        });
    },
    validate: function(context) {
        var that = this;
        var subPrompts, subPromptContext;
        subPrompts = that.getActivePrompts(context);
        subPromptContext = $.extend({},context,{
            success: _.after(subPrompts.length, context.success),
            failure: _.once(context.failure)
        });
        $.each(subPrompts, function(idx, prompt){
            prompt.validate(subPromptContext);
        });
    },
    postActivate: function(ctxt) {
        // We do not support dependent default values within screen groups.
        // If we are to do so, we will need to add code here to ensure
        // their on activate functions are called in the right order.
        var subPromptsReady = _.after(this.prompts.length, function () {
            ctxt.success();
        });
        _.each(this.prompts, function(prompt){
            prompt.onActivate($.extend({}, ctxt, {
                success:function() {
                    subPromptsReady(ctxt);
                }
            }));
        });
    },
    render: function() {
        var that = this;
        var subPrompts = that.getActivePrompts();
        this.$el.html('<div class="odk odk-prompts">');
        var $prompts = this.$('.odk-prompts');
        $.each(subPrompts, function(idx, prompt){
            //prompt.render();
            prompt._screenRender();
            if(!prompt.$el){
                console.error("render px: " + this.promptIdx + " Prompts must have synchronous render functions. Don't debounce them or launch async calls before el is set.");
                console.error(prompt);
                alert("Sub-prompt has not been rendered. See console for details.");
            }
            $prompts.append(prompt.$el);
            prompt.delegateEvents();
        });
        this.$el.trigger('create');
        this.afterRender();
        return this;
    },
    whenTemplateIsReady: function(ctxt){
        //This stub is here because screens have no template so the default 
        //whenTemplateIsReady would otherwise cause an error in preActivate
        ctxt.success();
    },
    /**
     * When the intent returns a result this factory function creates a callback to process it.
     * The callback can't use any state set before the intent was launched because the page might have been reloaded.
     */
    getCallback: function(promptPath, internalPromptContext, action) {
        var pageParts = promptPath.split('.');
        if ( pageParts.length != 2 ) {
            throw new Error("prompts." + this.type, "px: " + this.promptIdx + " no nested promptIdx supplied: " + " page: " + page + " internalPromptContext: " + internalPromptContext + " action: " + action);
        }
        var idx = +pageParts[1];
        if ( this.prompts.length <= idx ) {
            throw new Error("prompts." + this.type, "px: " + this.promptIdx + " promptIdx not in screen: " + " page: " + page + " internalPromptContext: " + internalPromptContext + " action: " + action);
        }
        var p = this.prompts[idx];
        return p.getCallback(promptPath, internalPromptContext, action);
     }
});
promptTypes.label = promptTypes.base.extend({
    type: "label",
    hideInHierarchy: true,
    onActivate: function(ctxt) {
        alert("label.onActivate: Should never be called!");
        ctxt.failure({message: "Internal error."});
    }
});
promptTypes.goto = promptTypes.base.extend({
    type: "goto",
    hideInHierarchy: true,
    onActivate: function(ctxt) {
        alert("goto.onActivate: Should never be called!");
        ctxt.failure({message: "Internal error."});
    }
});
promptTypes.note = promptTypes.base.extend({
    type: "note",
    hideInHierarchy: true,
    templatePath: "templates/note.handlebars"
});
promptTypes.acknowledge = promptTypes.select.extend({
    type: "acknowledge",
    autoAdvance: false,
    acknLabel: translations.acknLabel,
    modification: function(evt) {
        var ctxt = controller.newContext(evt);
        ctxt.append('acknowledge.modification', this.promptIdx);
        var that = this;
        var acknowledged = this.$('#acknowledge').is(':checked');
        this.setValue($.extend({}, ctxt, {
            success: function() {
                that.renderContext.choices = [{
                    "name": "acknowledge",
                    "label": that.acknLabel,
                    "checked": acknowledged
                }];
                if (acknowledged && that.autoAdvance) {
                    controller.gotoNextScreen(ctxt);
                }
                else {
                    ctxt.success();
                }
            }
        }), acknowledged);
    },
    postActivate: function(ctxt) {
        var that = this;
        var acknowledged;
        try{
            acknowledged = JSON.parse(that.getValue());
        } catch(e) {
            acknowledged = false;
        }
        that.renderContext.choices = [{
            "name": "acknowledge",
            "label": that.acknLabel,
            "checked": acknowledged
        }];
        ctxt.success(ctxt);
    }
});
// Do not allow survey to proceed, either moving backward or forward...
promptTypes.stop_survey = promptTypes.base.extend({
    type: "stop_survey",
    templatePath: "templates/stop_survey.handlebars",
    hideInHierarchy: true,
    validate: true,
    postActivate: function(ctxt) {
        var formLogo = false;//TODO: Need way to access form settings.
        if(formLogo){
            this.renderContext.headerImg = formLogo;
        }
        this.renderContext.instanceName = database.getInstanceMetaDataValue('instanceName');
        ctxt.success({enableForwardNavigation: false, enableBackNavigation: false});
    },
    beforeMove: function(ctxt) {
        ctxt.append("prompts." + this.type, "px: " + this.promptIdx);
        ctxt.failure();
    }
});
promptTypes.with_next = promptTypes.base.extend({
    type: "with_next",
    hideInHierarchy: true,
    assignToValue: function(ctxt){
        var that = this;
        var value;
        try {
            value = that.assign();
        } catch (e) {
            ctxt.append('prompts.'+that.type+'.assignToValue.assign.exception', e);
            ctxt.failure({message: "Error computing with_next expression."});
            return;
        }
        that.setValue(ctxt, value);
    }
});
// with_next_validate runs the validation check before rendering the next screen(like with_next)
promptTypes.with_next_validate = promptTypes.base.extend({
    type: "with_next_validate",
    hideInHierarchy: true,
    triggerValidation: function(ctxt){
        // guard to prevent infinite recursion...
        if ( !ctxt.with_next_validate ) {
            ctxt.with_next_validate = true;
            controller.validateAllQuestions(ctxt, this.promptIdx);
        }
    }
});
promptTypes.error = promptTypes.base;

return promptTypes;
});
