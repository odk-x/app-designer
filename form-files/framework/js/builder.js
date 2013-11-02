//'use strict';
/**
 * Main entry point: buildSurvey
 * 
 * Given a form definition (formDef.json), constructs the calculations and prompts lists that are then 
 * injected into the controller.
 *
 * Major task is to construct function()s for the calculates, constraints and other equations.
 *
 */
define(['controller', 'opendatakit', 'database', 'jquery', 'screenTypes', 'promptTypes', 'formulaFunctions', 'underscore', 'screens', 'prompts'],
function(controller,   opendatakit,   database,   $,        screenTypes,   promptTypes,   formulaFunctions,   _, _screens, _prompts) {
verifyLoad('builder',
    ['controller', 'opendatakit', 'database', 'jquery', 'screenTypes', 'promptTypes', 'formulaFunctions', 'underscore', 'screens', 'prompts'],
    [controller,   opendatakit,   database,   $,        screenTypes,   promptTypes,   formulaFunctions,   _, _screens, _prompts]);

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
            }
        };
    }
    function genericFunction(defn) {
        try {
            var parsedFunction = formulaFunctions.evaluator("("+defn+")");
            return function(/*...*/){
                try {
                    return parsedFunction.apply(this, arguments);
                } catch (e) {
                    console.error("builder.genericFunction: " + defn + " exception: " + String(e));
                    alert("Could not invoke genericFunction.\nSee console for details.");
                    throw new Error("Exception in genericFunction.");
                }
            };
        } catch (e) {
            console.error("builder.genericFunction: " + defn + " exception evaluating function definition: " + String(e));
            alert("Could not evaluate genericFunction: " + defn + '\nSee console for details.');
            throw new Error("Could not evaluate genericFunction: " + defn + '\nSee console for details.');
        }
    }
    var currentPromptTypes;
    var currentScreenTypes;
    var calculates = {};
    //column_types maps each column to a property parser to use on its values.
    var column_types = {
        condition: 'formula',
        constraint: 'formula',
        required: 'formula',
        calculation: 'formula',
		auxillaryHash: 'formula',
		selectionArgs: 'formula',
		url: 'formula',
		callback: 'formula',
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
            alert("Internal Error: this should already be substituted");
            return this._formPath + content;
        },
        app_path_localized : function(content) {
            var fd = this.requirejs_path('');
            if ( content === undefined || content === null ) {
                return content;
            } else if ( $.isPlainObject(content) ) {
                var newcontent = {};
                for ( var key in content ) {
                    var val = content[key];
                    if ( val.indexOf('/') === 0 || val.indexOf('http:') === 0 || val.indexOf('https:') === 0 ) {
                        newcontent[key] = val;
                    } else {
                        newcontent[key] = fd + val;
                    }
                }
                return newcontent;
            } else {
                if ( content.indexOf('/') === 0 || content.indexOf('http:') === 0 || content.indexOf('https:') === 0 ) {
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
    initializeProperties: function(prompt) {
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
                    shim.log("I",'Parsing: ' + property);
                    prompt[key] = propertyParser(propertyContent);
                }
                else {
                    console.error('builder.initializeProperties: Could not parse property of type ' + propertyType + ' px: ' + prompt.promptIdx);
                    alert("Could not parse property of type " + propertyType + ". See console for details.");
                    throw new Error("Could not parse property of type " + propertyType + ". Prompt Index: " + prompt.promptIdx);
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
    initializePrompts: function(section) {
        var that = this;
        var initializedPrompts = [];
        
        _.each(section.prompts, function(prompt) {
            var PromptType, ExtendedPromptType, PromptInstance;
            if (!('_type' in prompt)) {
                shim.log('W', 'builder.initializePrompts: no _type specified ' + prompt);
                return;
            }
            if (prompt._type in currentPromptTypes) {
                PromptType = currentPromptTypes[prompt._type];
            } else {
                shim.log('W', 'builder.initializePrompts: unknown _type ' + prompt._type + ' -- using text ' + prompt);
                PromptType = currentPromptTypes['text'];
            }
            ExtendedPromptType = PromptType.extend(that.initializeProperties(prompt));
            PromptInstance = new ExtendedPromptType({ _section_name: section.section_name });
            initializedPrompts.push(PromptInstance);
        });
        return initializedPrompts;
    },
    initializeOperations: function(section) {
        var that = this;
        var i, op;
        var functionBody;
        var parsedFunction;
        for (i = 0 ; i < section.operations.length ; ++i ) {
            var op = section.operations[i];
            parsedFunction = null;
            op._section_name = section.section_name;
            if ( op._token_type === "goto_label" ) {
                // convert condition into predicate...
                if ( op.condition ) {
                    functionBody = "function() { return " + op.condition + ";}";
                    op._parsed_condition = genericFunction(functionBody);
                }
            } else if ( op._token_type === "assign" ) {
                // this is only done for the top-level assign expressions.
                // the ones within begin...end screen blocks are executed
                // in-line as part of the _parsed_screen_block.
                functionBody = "function() { return " + op.calculation + ";}";
                op._parsed_calculation = genericFunction(functionBody);
            } else if ( op._token_type === "begin_screen" ) {
                functionBody = op._screen_block;
                op._parsed_screen_block = genericFunction(functionBody);
            }
        }
    },
    buildSurvey: function(ctxt, surveyJson, formPath) {
        if (surveyJson === undefined || surveyJson === null) {
            ctxt.append('builder.buildSurvey', 'no formDef!');
            ctxt.failure();
            return;
        }
        
        var that = this;
        
        // define the requirejs_path action on the property parser.
        // this is the only property parser that depends upon a 
        // current mdl value.
        propertyParsers.requirejs_path = function(content) {
            return formPath + content;
        };

        //currentPromptTypes set to a promptTypes subtype so user defined prompts
        //don't clobber the base prompt types for other surveys.
        currentPromptTypes = Object.create(promptTypes);
        // ditto
        currentScreenTypes = Object.create(screenTypes);

        ctxt.append('builder.buildSurvey: initializing');
        //Transform the calculate sheet into an object with format {calculation_name:function}
        calculates = _.object(_.map(surveyJson.specification.calculates, function(calculate){
            return [calculate.calculation_name, propertyParsers.formula(calculate.calculation)];
        }));
        formulaFunctions.calculates = calculates;
        
        surveyJson.specification.parsed_queries = _.object(_.map(surveyJson.specification.queries, function(query) {
            return [
            query.query_name, {
                "uri" : propertyParsers.formula(query.uri),
                "callback" : propertyParsers.formula(query.callback)
            }];
        }));
        
        var afterCustomPromptsLoadAttempt = function(){
            // save the current prompts and screens in the specification
            surveyJson.specification.currentPromptTypes = currentPromptTypes;
            surveyJson.specification.currentScreenTypes = currentScreenTypes;
            
            // initialize the section.parsed_prompts 
            // initialize the section.parsed_screen_block
            _.each(surveyJson.specification.sections, function(section, sectionName) {
                section.parsed_prompts = that.initializePrompts(section);
                // operations are in-place expanded, as they have no inheritance
                that.initializeOperations(section);
            });
            
            //This resets the custom css styles to the customStyles.css file in the
            //current form's directory (or nothing if customStyles.css doesn't exist).
            $('#custom-styles').attr('href', formPath + 'customStyles.css');
            
            //Do an ajax request to see if there is a custom theme packaged with the form:
            var customTheme = formPath + 'customTheme.css';
            $.ajax({
                url: customTheme,
                success: function() {
                    $('#theme').attr('href', customTheme);
                    var fontSize = opendatakit.getSettingObject(surveyJson, "font-size");
                    if ( fontSize != null && fontSize.value != null) {
                        $('body').css("font-size", fontSize.value);
                    }
                    ctxt.append('builder.buildSurvey: completed load - starting form processing');
                    ctxt.success();
                },
                error: function() {
                    shim.log("W",'builder.buildSurvey: error loading ' +
                            formPath + 'customTheme.css');
                    //Set the jQm theme to the defualt theme, or if there is a 
                    //predefined theme specified in the settings sheet, use that.
                    var url = null;
                    var theme = opendatakit.getSettingObject(surveyJson, "theme");
                    if ( theme == null || theme.value == null ) {
                        var jqmVersion = window.$.mobile.version;
                        theme = 'jquery.mobile.theme-' + jqmVersion;
                        url = requirejs.toUrl('libs/jquery.mobile-' + jqmVersion + '/' + theme + '.css');
                    } else {
                        theme = theme.value;
                        url = requirejs.toUrl('css/' + theme + '.css');
                    }
                    $('#theme').attr('href', url);
                    var fontSize = opendatakit.getSettingObject(surveyJson, "font-size");
                    if ( fontSize != null && fontSize.value != null) {
                        $('body').css("font-size", fontSize.value);
                    }
                    ctxt.append('builder.buildSurvey: completed load - starting form processing');
                    ctxt.success();
                }
            });
        };
        
        var afterCustomScreensLoadAttempt = function(){
            //This tries to load any user defined prompt types provided in customPromptTypes.js.
            //TODO: The approach to getting the current form path might need to change.
            require([formPath + 'customPromptTypes.js'], function (customPromptTypes) {
                shim.log("I","builder.buildSurvey: customPromptTypes found");
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
                shim.log("W",'builder.buildSurvey: error loading ' +
                            formPath + 'customPromptTypes.js');
                //The errback, error callback
                if(err.requireModules) {
                    //The error has a list of modules that failed
                    _.each(err.requireModules, function(failedId){
                        shim.log('W', 'builder.buildSurvey: failed requirejs load: ' + failedId);
                        //I'm using undef to clear internal knowledge of the given module.
                        //I'm not sure if it is necessiary.
                        requirejs.undef(failedId);
                    });
                }
                afterCustomPromptsLoadAttempt();
            });
        };
        
        //This tries to load any user defined prompt types provided in customPromptTypes.js.
        //TODO: The approach to getting the current form path might need to change.
        require([formPath + 'customScreenTypes.js'], function (customScreenTypes) {
            shim.log("I","builder.buildSurvey: customScreenTypes found");
            //Ensure all custom prompt type names are lowercase.
            _.each(_.keys(customScreenTypes), function(screenTypeName){
                if(screenTypeName !== screenTypeName.toLowerCase()) {
                    console.error('builder.buildSurvey: Invalid screen type name: ' + screenTypeName);
                    alert("Invalid screen type name: " + screenTypeName);
                }
            });
            $.extend(currentScreenTypes, customScreenTypes);
            afterCustomScreensLoadAttempt();
        }, function (err) {
            shim.log("W",'builder.buildSurvey: error loading ' +
                        formPath + 'customScreenTypes.js');
            //The errback, error callback
            if(err.requireModules) {
                //The error has a list of modules that failed
                _.each(err.requireModules, function(failedId){
                    shim.log('W', 'builder.buildSurvey: failed requirejs load: ' + failedId);
                    //I'm using undef to clear internal knowledge of the given module.
                    //I'm not sure if it is necessiary.
                    requirejs.undef(failedId);
                });
            }
            afterCustomScreensLoadAttempt();
        });
    }
};
});
