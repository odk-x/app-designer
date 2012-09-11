'use strict';
// depends upon: controller, zepto, promptTypes
define(['controller', 'zepto', 'promptTypes'], function(controller, $, promptTypes) {
    return {
    column_types : {
        condition: 'formula'
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

            //var result = 'if(' + content + '){that.baseValidate(context);} else {context.failure()}';
            //result = 'console.log("test");' + result;

            //How best to refrence current value?
            var result = '(function(context){return ' + content + '})';
            console.log(result);
            return eval(result);
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
            var prompts = ([{
                "type": "goto",
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
            that.form.prompts = this.initializePrompts(prompts );
            controller.prompts = that.form.prompts;
            console.log('starting');
            continuation();
        }
    };
});
