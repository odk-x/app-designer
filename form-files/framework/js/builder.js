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
     * evalFn takes a 'function(...) {}' definition ('fn') and evaluates it in the
	 * FormulaFunctions context so that it has access to all other functions and 
	 * does not otherwise pollute the global namespace.
	 * 
	 * TODO: Link/copy formula documentation.
     * TODO: How do exceptions work?
     **/
    function evalFn(fn, fieldSource, worksheet, rowNum, columnPath) {
        try {
            var parsedFunction = formulaFunctions.evaluator('('+fn+')');
            return function(/*...*/){
                try {
                    return parsedFunction.apply(formulaFunctions, arguments);
                } catch (e) {
					var msg = "Exception: " + e.message + " in user-defined expression: " + fieldSource +
						" on " + worksheet + " row " + rowNum + " column: " + columnPath;
					shim.log('E', msg);
                    throw new Error(msg);
                }
            };
        } catch (e) {
			var msg = "Exception: " + e.message + " when evaluating user-defined expression: " + fieldSource +
				" on " + worksheet + " row " + rowNum + " column: " + columnPath;
			shim.log('E', "builder.evalFn " + msg);
            alert(msg + '\nSee console for details.');
            throw new Error(msg + '\nSee console for details.');
        }
    };

    //propertyParsers are functions for transforming property values into
    //useful formats.
    //For example, transformings all the constraint/condition/etc. 
    //formula strings into JS functions.
    var propertyParsers = {
		'function': evalFn,
        requirejs_path : function(content) {
            alert("Internal Error: this should already be substituted");
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

    /**
     * Resolve the contents of one field w.r.t. column_types map.
	 * Returns the adjusted 'field' contents.
     */
    var resolveOneField = function( field, parentObject, parentKey, columnType, worksheet, rowNum, columnPath, propertyParsers ) {
    	if ( _.isArray(columnType) ) {
    		throw Error("Unable to handle array-valued column_types enforcement: ", columnPath);
    	}
    	if ( _.isObject(columnType) ) {

        	_.each(_.keys(field), function(k) {
        		if ( k in columnType ) {
        			resolveOneField( field[k], field, k, columnType[k], worksheet, rowNum, columnPath + '.' + k, propertyParsers );
        		}
        	});
			return;
    	}

    	// OK. We have a specific columnType.
		var property = field;
		var propertySource = field;
		var evalAs = columnType;

		var formulaArgs = 'formula(';
		if ( columnType === 'formula' || columnType.substring(0,formulaArgs.length) == formulaArgs ) {
			var iArg = columnType.indexOf('(');
			var argList = "()";
			if ( iArg !== -1 ) {
				argList = columnType.substring(iArg);
			}
			property = "function " + argList + "{\nreturn (" + property + ");\n}";
			evalAs = 'function';
		}
		
		if (evalAs in propertyParsers) {
			var propertyParser = propertyParsers[evalAs];
			shim.log("I",'Parsing: ' + property);
			parentObject[parentKey] = propertyParser(property, propertySource, worksheet, rowNum, columnPath);
			return;
		}
		else {
			var msg = "Could not parse property of type: " + columnType + " for user-defined expression: " + fieldSource +
				" on " + worksheet + " row " + rowNum + " column: " + columnPath;
			shim.log('E', "builder.evalFn " + msg);
            alert(msg + '\nSee console for details.');
            throw new Error(msg + '\nSee console for details.');
		}
    };

    return {
    buildSurvey: function(ctxt, surveyJson, formPath) {
        if (surveyJson === undefined || surveyJson === null) {
            ctxt.append('builder.buildSurvey', 'no formDef!');
            ctxt.failure();
            return;
        }
        
        var that = this;

        //currentPromptTypes set to a promptTypes subtype so user defined prompts
        //don't clobber the base prompt types for other surveys.
        var currentPromptTypes = Object.create(promptTypes);
        // ditto
        var currentScreenTypes = Object.create(screenTypes);

        ctxt.append('builder.buildSurvey: initializing');
        
        var afterCustomPromptsLoadAttempt = function(){
            // save the current prompts and screens in the specification
            surveyJson.specification.currentPromptTypes = currentPromptTypes;
            surveyJson.specification.currentScreenTypes = currentScreenTypes;
        
			// define the requirejs_path action on the property parser.
			// this is the only property parser that depends upon a 
			// current mdl value.
			propertyParsers.requirejs_path = function(content) {
				return formPath + content;
			};

			// process the calculates sheet for column_types
			_.each( _.keys(surveyJson.specification.calculates), function(key) {
				var rowObject = surveyJson.specification.calculates[key];
				_.each(_.keys(rowObject), function(k) {
					if ( k in surveyJson.specification.column_types && k !== '_row_num' && k !== '__rowNum') {
						resolveOneField( rowObject[k], rowObject, k,
							surveyJson.specification.column_types[k], 'calculates', rowObject._row_num,
							k, propertyParsers );
					}
				});
			});

			// copy the user-defined calculates into formulaFunctions
			formulaFunctions.calculates = {};
			_.each( _.keys(surveyJson.specification.calculates), function(key) {
				var rowObject = surveyJson.specification.calculates[key];
				formulaFunctions.calculates[key] = rowObject.calculation;
			});

			// process the settings sheet for column_types
			_.each( _.keys(surveyJson.specification.settings), function(key) {
				var rowObject = surveyJson.specification.settings[key];
				_.each(_.keys(rowObject), function(k) {
					if ( k in surveyJson.specification.column_types && k !== '_row_num' && k !== '__rowNum') {
						resolveOneField( rowObject[k], rowObject, k, 
							surveyJson.specification.column_types[k], 'settings', rowObject._row_num,
							k, propertyParsers );
					}
				});
			});

			// process the choices sheet for column_types
			_.each( _.keys(surveyJson.specification.choices), function(key) {
				var rowObject = surveyJson.specification.choices[key];
				_.each(_.keys(rowObject), function(k) {
					if ( k in surveyJson.specification.column_types && k !== '_row_num' && k !== '__rowNum') {
						resolveOneField( rowObject[k], rowObject, k, 
							surveyJson.specification.column_types[k], 'choices', rowObject._row_num,
							k, propertyParsers );
					}
				});
			});

			// process the queries sheet for column_types
			_.each( _.keys(surveyJson.specification.queries), function(key) {
				var rowObject = surveyJson.specification.queries[key];
				_.each(_.keys(rowObject), function(k) {
					if ( k in surveyJson.specification.column_types && k !== '_row_num' && k !== '__rowNum') {
						resolveOneField( rowObject[k], rowObject, k, 
							surveyJson.specification.column_types[k], 'queries', rowObject._row_num,
							k, propertyParsers );
					}
				});
			});

			// process the sections
			_.each( _.keys(surveyJson.specification.sections), function(key) {
				var sectionObject = surveyJson.specification.sections[key];
				var i;
				
				sectionObject.parsed_prompts = [];
				// process prompts
				for ( i = 0 ; i < sectionObject.prompts.length ; ++i ) {
					var rowObject = sectionObject.prompts[i];
					var PromptType, ExtendedPromptType, PromptInstance;
					
					// xlsxconverter should have defined an _type field in the prompt...
					if (!('_type' in rowObject)) {
						var msg = 'builder.initializePrompts: no _type specified for prompt in row ' +
									rowObject._row_num + ' section: ' + key;
						shim.log('E',msg);
						throw new Error(msg);
					}
					
					if (rowObject._type in currentPromptTypes) {
						PromptType = currentPromptTypes[rowObject._type];
					} else {
						shim.log('W', 'builder.initializePrompts: unknown _type ' + rowObject._type +
							' -- using text for prompt in row ' + rowObject._row_num + ' section: ' + key);
						PromptType = currentPromptTypes['text'];
					}
					// ensure that the section is saved...
					rowObject._section_name = key;
					
					// resolve column_types within the prompt fields coming from XLSX.
					// NOTE: we really should apply this to all of our code in 
					// currentPromptTypes plus all of the fields in rowObject.
					// HOWEVER, it is unclear how to do this using Backbone
					// due to the way inheritance is implemented.
					_.each(_.keys(rowObject), function(k) {
						if ( k in surveyJson.specification.column_types && k !== '_row_num' && k !== '__rowNum') {
							resolveOneField( rowObject[k], rowObject, k, 
								surveyJson.specification.column_types[k], key, rowObject._row_num,
								k, propertyParsers );
						}
					});
					
					ExtendedPromptType = PromptType.extend(rowObject);
					PromptInstance = new ExtendedPromptType();

					sectionObject.parsed_prompts.push(PromptInstance);
				}
				
				// process operations
				for ( i = 0 ; i < sectionObject.operations.length ; ++i ) {
					var rowObject = sectionObject.operations[i];
					rowObject._section_name = key;
					_.each(_.keys(rowObject), function(k) {
						if ( k in surveyJson.specification.column_types && k !== '_row_num' && k !== '__rowNum') {
							resolveOneField( rowObject[k], rowObject, k, 
								surveyJson.specification.column_types[k], key, rowObject._row_num,
								k, propertyParsers );
						}
					});
				}
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
