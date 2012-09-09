'use strict';
// depends upon: controller, zepto, promptTypes
define(['controller', 'zepto', 'promptTypes'], function(controller, $, promptTypes) {
    return {
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
                }, item));
            initializedPrompts.push(new PromptClass());
            });
		return initializedPrompts;
    },
	buildSurvey:function(surveyJson, continuation){
            var that = this;
            var settings = {};
            if ('settings' in surveyJson) {
                $.extend(settings, surveyJson.settings[0]);
            }
            var widgets = {};

            //Load scripts specified in settings somewhere after this point
            if ('widgets' in surveyJson) {
                //Transform and initialize widgets?
                $.extend(widgets, surveyJson.widgets);
            }
            var column_types = {
                validate: 'formula'
            };
            //Load scripts specified in settings somewhere after this point
            if ('column_types' in surveyJson) {
                $.extend(column_types, surveyJson.column_types);
            }
            that.form = {
                choices: surveyJson.choices,
                settings: settings,
                widgets: widgets,
                column_types: column_types
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
