'use strict';
/**
 * Main entry point: buildSurvey
 * 
 * Given a form definition (formDef.json), constructs the calculations and prompts lists that are then 
 * injected into the controller.
 *
 * Major task is to construct function()s for the calculates, constraints and other equations.
 *
 */
define(['controller', 'opendatakit', 'database', 'jquery', 'promptTypes', 'formulaFunctions', 'underscore'],
function(controller,   opendatakit,   database,   $,        promptTypes,   formulaFunctions,   _) {
    /**
     * formula is a function for creating JavaScript functions from user defined formulas.
     * TODO: Link/copy formula documentation.
     * TODO: How do exceptions work?
     **/
    function formula(content) {
        // If context.allowExceptions is true call is responsible for catching
        // and handling exceptions.
        // The 'context' passed in may or may not be defined. 
        // It may or may not be the calling context object.
        var result = '(function(context){\n'+
            'return ('+ content + ');\n' +
            '})';
        try {
            var parsedFunction = formulaFunctions.evaluator(result);
            return function(context){
                try {
                    return parsedFunction.call(this, context);
                } catch (e) {
                    console.error("builder.formula: " + result + " exception: " + String(e));
                    alert("Could not call formula.\nSee console for details.");
                    throw new Error("Exception in user formula.");
                    // controller.fatalError();
                }
            };
        } catch (e) {
            console.error("builder.formula: " + result + " exception evaluating formula: " + String(e));
            alert("Could not evaluate formula: " + result + '\nSee console for details.');
            throw new Error("Could not evaluate formula: " + result + '\nSee console for details.');
            // return function(){};
        }
    }
    /**
     * formula_with_context does the same thing as formula but checks to make
     * sure a context arguement is provided when the generated function is called.
     **/
    function formula_with_context(content){
        var myFormula = formula(content);
        return function(context){
            if(context){
                return myFormula.call(this, context);
            } else {
                console.error('builder.formula_with_context: formula: ' + myFormula.toString(2) + ' is missing a context argument');
                alert("Formula requires context arg.\nSee console for details.");
                throw new Error("Exception in user formula. Formula requires context arg.");
                // controller.fatalError();
            }
        };
    }
    var currentPromptTypes;
    var calculates = {};
    //column_types maps each column to a property parser to use on its values.
    var column_types = {
        condition: 'formula',
        constraint: 'formula',
        required: 'formula',
        validate: 'formula_with_context', // expects calling context arg.
        calculation: 'formula',
        'default': 'formula',
        assign: 'formula',
        //TODO: Choice filter has some syntax issues to consider.
        //      It would be nice to have a "choice" variable we can refer to directly.
        //      One idea is to define variables in a context object that gets passed into the generated function.
        //      The generated function would then add the object's keys to the namespace.
        choice_filter: 'formula_with_context', // expects "choice" context arg.
        templatePath: 'requirejs_path',
        image: 'app_path_localized',
        audio: 'app_path_localized',
        video: 'app_path_localized'
    };
    //propertyParsers are functions for transforming property values into
    //useful formats.
    //For example, transformings all the constraint/condition/etc. 
    //formula strings into JS functions.
    var propertyParsers = {
        formula: formula,
        formula_with_context: formula_with_context,
        requirejs_path : function(content) {
            return opendatakit.getCurrentFormPath() + content;
        },
        app_path_localized : function(content) {
            var fd = opendatakit.getCurrentFormPath();
            if ( content == null ) {
                return content;
            } else if ( $.isPlainObject(content) ) {
                var newcontent = {};
                for ( var key in content ) {
                    var val = content[key];
                    if ( val.indexOf('/') == 0 || val.indexOf('http:') == 0 || val.indexOf('https:') == 0 ) {
                        newcontent[key] = val;
                    } else {
                        newcontent[key] = fd + val;
                    }
                }
                return newcontent;
            } else {
                if ( content.indexOf('/') == 0 || content.indexOf('http:') == 0 || content.indexOf('https:') == 0 ) {
                    return content;
                } else {
                    return fd + content;
                }
            }
        }
    };
    return {
    /**
     * Go through an object (usually representing a row in a spreadsheet) 
     * and parse all its properties
     **/
    initializeProperties: function(prompt, promptIdx) {
		var that = this;
        $.each(prompt, function(key, property) {
            var propertyType, propertyContent;
            if (key in prompt) {
                if (typeof property === 'function') {
                    //Generally all properties will be plain JSON,
                    //but being able to pass in function directly can be useful
                    //for debugging.
                    return;
                }
                if ($.isArray(property)) {
                    if(key === "prompts"){
                        prompt.prompts = that.initializePrompts(property);
                    }
                    return;
                }
                if ($.isPlainObject(property) && ('cell_type' in property)) {
                    propertyType = property.cell_type;
                    propertyContent = property['default'];
                } 
				else {
                    if (key in column_types) {
                        propertyType = column_types[key];
                        propertyContent = property;
                    } else {
                        //Leave the type as a string/int/bool
                        return;
                    }
                }
                if (propertyType in propertyParsers) {
                    var propertyParser = propertyParsers[propertyType];
                    console.log('Parsing:');
                    console.log(property);
                    prompt[key] = propertyParser(propertyContent);
                }
                else {
                    console.error('builder.initializeProperties: Could not parse property of type ' + propertyType + ' px: ' + promptIdx);
                    alert("Could not parse property of type " + propertyType + ". See console for details.");
                    throw new Error("Could not parse property of type " + propertyType + ". Prompt Index: " + promptIdx);
                }
            }
        });
        return prompt;
    },
    /**
     * Iterate over the given partial prompt objects and initialize them as
     * instances of the prompt types defined in prompts.js
     * (or as one of the user specified prompt types).
     **/
    initializePrompts: function(prompts) {
        var that = this;
        //withNext type prompts can use this to set a function that gets
        //called inside the next prompt's onActivate.
        var additionalActivateFunctions = [];
        var initializedPrompts = [];
        
        _.each(prompts, function(prompt) {
            var PromptType, ExtendedPromptType, PromptInstance;
            if (!('type' in prompt)) {
                shim.log('W', 'builder.initializePrompts: no type specified');
                console.log('no type specified');
                console.log(prompt);
                return;
            }
            if (prompt.type in currentPromptTypes) {
                PromptType = currentPromptTypes[prompt.type];
            } else {
                shim.log('W', 'builder.initializePrompts: unknown type -- using text');
                console.log('unknown type -- using text');
                console.log(prompt);
                PromptType = currentPromptTypes['text'];
            }
            ExtendedPromptType = PromptType.extend($.extend({
                form: that.form,
                promptIdx: initializedPrompts.length,
                additionalActivateFunctions: additionalActivateFunctions
            }, that.initializeProperties(prompt, initializedPrompts.length)));
            PromptInstance = new ExtendedPromptType();

            if (prompt.type === 'with_next' ) {
                additionalActivateFunctions.push(function(ctxt) {
                    PromptInstance.assignToValue(ctxt);
                });
            } else if (prompt.type === 'with_next_validate' ) {
                additionalActivateFunctions.push(function(ctxt) {
                    PromptInstance.triggerValidation(ctxt);
                });
            } else {
                initializedPrompts.push(PromptInstance);
                additionalActivateFunctions = [];
            }
        });
        return initializedPrompts;
    },
    buildSurvey: function(surveyJson, continuation) {
        // if we have no survey object, we are bootstrapping
        // just run the continuation (which will register a
        // hash change processor).
        if (surveyJson == null) {
            continuation();
            return;
        }
        
        var that = this;
        
        //currentPromptTypes set to a promptTypes subtype so user defined prompts
        //don't clobber the base prompt types for other surveys.
        currentPromptTypes = Object.create(promptTypes);

        that.form = {
            choices: surveyJson.choices,
            settings: surveyJson.settings
        };

        var prompts = ([{
            "type": "goto",
            "condition": function() {
                return (opendatakit.getCurrentInstanceId() != null);
            },
            "param": "_begin"
        }, {
            type: "instances",
            name: "_instances",
            label: "Saved Instances"
        }, {
            "type": "label",
            "param": "_output"
        }, {
            type: "json",
            name: "_json",
            label: "JSON formatted survey answers"
        }, {
            "type": "label",
            "param": "_begin"
        }, {
            type: "opening",
            name: "_opening",
            label: "opening page"
        }]).concat(surveyJson.survey).concat([{
            type: "finalize",
            name: "_finalize",
            label: "Save Form"
        }, {
            type: "hierarchy",
            name: "_hierarchy",
            label: "Hierarchy View"
        }, {
            type: "stop_survey",
            name: "_stop_survey",
            label: "Fatal Error"
        }]);

        console.log('builder.buildSurvey: initializing');
        //Transform the calculate sheet into an object with format {calculation_name:function}
        calculates = _.object(_.map(surveyJson.calculates, function(calculate){
            return [calculate.name, propertyParsers.formula(calculate.calculation)];
        }));
        formulaFunctions.calculates = calculates;
        
        that.form.queries = _.object(_.map(surveyJson.queries, function(query) {
            return [
            query.name, {
                "uri" : propertyParsers.formula(query.uri),
                "callback" : propertyParsers.formula(query.callback)
            }];
        }));
        var afterCustomPromptsLoadAttempt = function(){
            that.form.prompts = that.initializePrompts(prompts);
            controller.prompts = that.form.prompts;
            console.log('builder.buildSurvey: starting form processing continuation');
            continuation(that.form);
        };
        //This tries to load any user defined prompt types provided in customPromptTypes.js.
        //TODO: The approach to getting the current form path might need to change.
        require([opendatakit.getCurrentFormPath() + 'customPromptTypes.js'], function (customPromptTypes) {
            console.log("builder.buildSurvey: customPromptTypes found");
            //Ensure all custom prompt type names are lowercase.
            _.each(_.keys(customPromptTypes), function(promptTypeName){
                if(promptTypeName !== promptTypeName.toLowerCase()) {
                    console.error('builder.buildSurvey: Invalid prompt type name: ' + promptTypeName);
                    alert("Invalid prompt type name: " + promptTypeName);
                }
            });
            $.extend(currentPromptTypes, customPromptTypes);
            afterCustomPromptsLoadAttempt();
        }, function (err) {
            console.error('builder.buildSurvey: error loading ' +
                        opendatakit.getCurrentFormPath() + 'customPromptTypes.js');
            //The errback, error callback
            if(err.requireModules) {
                //The error has a list of modules that failed
                _.each(err.requireModules, function(failedId){
                    shim.log('W', 'builder.buildSurvey: failed requirejs load: ' + failedId);
                    //I'm using undef to clear internal knowledge of the given module.
                    //I'm not sure if it is necessiary.
                    window.requirejs.undef(failedId);
                });
            }
            afterCustomPromptsLoadAttempt();
        });
        //This resets the custom css styles to the customStyles.css file in the
        //current form's directory (or nothing if customStyles.css doesn't exist).
        $('#custom-styles').attr('href', opendatakit.getCurrentFormPath() + 'customStyles.css');
        
        //Do an ajax request to see if there is a custom theme packaged with the form:
        var customTheme = opendatakit.getCurrentFormPath() + 'customTheme.css';
        $.ajax({
            url: customTheme,
            success: function() {
                $('#theme').attr('href', customTheme);
            },
            error: function() {
                console.log("No custom theme.");
                //Set the jQm theme to the defualt theme, or if there is a 
                //predefined theme specified in the settings sheet, use that.
                $('#theme').attr('href', requirejs.toUrl('libs/jquery.mobile-1.2.0/themes/' +
                        (opendatakit.getSettingValue("theme") || 'default' ) + '.css'));
            }
        });
        
        $('body').css("font-size", opendatakit.getSettingValue("font-size"));
    }
};
});
