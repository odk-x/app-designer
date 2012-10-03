'use strict';
// depends upon: controller, jquery, promptTypes
define(['controller', 'opendatakit', 'database', 'jquery', 'promptTypes'], function(controller, opendatakit, database, $, promptTypes) {
    var evalInEnvironment = (function() {
        //This closure will define a bunch of functions in our DSL for constraints/calculates/etc. 
        //It's still possible to really mess things up from here though because the
        //top-level environment is still accessable.
        function selected(promptValue, qValue){
            //TODO: Store parsed JSON?
            if(promptValue) {
                return _.include(_.pluck(JSON.parse(promptValue), 'value'), qValue);
            } else {
                return false;
            }
        }
        return function(code){
            return eval(code);
        };
    })();
    
    return {
    column_types: {
        condition: 'formula',
        required: 'formula',
        validate: 'formula',
        calculation: 'formula',
        templatePath: 'requirejs_path',
        image: 'app_path_localized',
        audio: 'app_path_localized',
        video: 'app_path_localized'
    },
    propertyParsers: {
        formula: function(content) {
            if ( content === true || content === false ) {
                return function() { return content; }
            }
            var variablesRefrenced = [];
            var variableRegex = /\{\{.+?\}\}/g
                function replaceCallback(match) {
                    var variableName = match.slice(2, - 2);
                    variablesRefrenced.push(variableName);
                    return "this.database.getDataValue('" + variableName + "')";
                }
            content = content.replace(variableRegex, replaceCallback);
            var result = '(function(context){return (' + content + ');})';
            console.log(result);
            return evalInEnvironment(result);
        },
        requirejs_path : function(content) {
            return opendatakit.getCurrentFormDirectory() + content;
        },
        app_path_localized : function(content) {
            var fd = opendatakit.getCurrentFormDirectory();
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
    },
    /**
     * 
     **/
    initializeProperties: function(prompt) {
        var that = this;
        $.each(prompt, function(key, property) {
            var propertyType, propertyContent;
            if (key in prompt) {
                if (typeof property === 'function') {
                    //Generally all properties will be plain JSON,
                    //but being able to pass in function directly can be useful for debugging.
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
                    if (key in that.column_types) {
                        propertyType = that.column_types[key];
                        propertyContent = property;
                    }
                    else {
                        //Leave the type as a string/int/bool
                        return;
                    }
                }
                if (propertyType in that.propertyParsers) {
                    var propertyParser = that.propertyParsers[propertyType];
                    console.log('Parsing:');
                    console.log(property);
                    prompt[key] = propertyParser(propertyContent);
                }
                else {
                    alert("Could not parse property of type " + propertyType + ". See console for details.");
                    console.error(propertyType);
                    console.error(prompt);
                }
            }
        });
        return prompt;
    },
    initializePrompts: function(prompts) {
        var that = this;
            function findObjectWithPair(objectArray, searchKey, searchValue) {
                for (var obby in objectArray) {
                    if (searchKey in obby) {
                        if (obby[searchKey] === searchValue) {
                            return obby;
                        }
                    }
                }
                return null;
            }
        var initializedPrompts = [];
        $.each(prompts, function(idx, item) {
                var PromptType;

                if (!('type' in item)) {
                    console.log('no type specified');
                    console.log(item);
                    return;
                }
                var widget = findObjectWithPair(that.form.widgets, 'type', item.type);
                if (widget) {
                    item = $.extend({}, widget, item);
                    item.type = widget.parentType;
                }
                if (item.type in promptTypes) {
                    PromptType = promptTypes[item.type];
                }
                else {
                    console.log('unknown type');
                    console.log(item);
                    PromptType = promptTypes['text'];
                }
                var PromptClass = PromptType.extend($.extend({
                    form: that.form,
                    promptIdx: idx
                }, that.initializeProperties(item)));
            initializedPrompts.push(new PromptClass());
            });
        return initializedPrompts;
    },
    buildSurvey:function(surveyJson, continuation){
            // if we have no survey object, we are bootstrapping
            // just run the continuation (which will register a
            // hash change processor).
            if (surveyJson == null) {
                continuation();
                return;
            }
            
            var that = this;

            var widgets = {};

            //Load scripts specified in settings somewhere after this point
            if ('widgets' in surveyJson) {
                //Transform and initialize widgets?
                $.extend(widgets, surveyJson.widgets);
            }
            //Load scripts specified in settings somewhere after this point
            if ('column_types' in surveyJson) {
                $.extend(this.column_types, surveyJson.column_types);
            }
            that.form = {
                choices: surveyJson.choices,
                settings: surveyJson.settings,
                widgets: widgets
            };
            /*
            var calcs = [];
            var navs = [];
            for ( var i = 0 ; i < surveyJson.survey.length ; ++i ) {
                var e = surveyJson.survey[i];
                if ( e.type == "calculate" ) {
                    calcs[calcs.length] = e;
                } else {
                    navs[navs.length] = e;
                }
            }
            */
            var prompts = ([{
                "type": "goto_if",
                "condition": function() {
                    return (database.getMetaDataValue('instanceId') != null);
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
            }]);

            console.log('initializing');
            that.form.prompts = this.initializePrompts(prompts);
            //that.form.calcs = this.initializePrompts(calcs);
            controller.prompts = that.form.prompts;
            controller.calcs = that.form.calcs;
            console.log('starting');
            continuation();
        }
    };
});
