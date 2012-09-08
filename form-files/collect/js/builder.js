'use strict';
// depends upon: controller, zepto, promptTypes
define(['controller','zepto','promptTypes'],function(controller, $, promptTypes) {
return {
    initializePrompts: function(form, prompts) {
        function findObjectWithPair(objectArray, searchKey, searchValue) {
            for (obby in objectArray) {
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
            var widget = findObjectWithPair(form.widgets, 'type', item.type);
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
                form: form,
                promptIdx: idx
            }, item));
            
            initializedPrompts.push(new PromptClass({
                model: {}//TODO: Do we want to keep track of the model on the prompts?
            }));
            
        });
        return initializedPrompts;
    },
	buildSurvey:function(surveyJson){
		var that = this;
		var settings = {
		};
		if('settings' in surveyJson){
			$.extend(settings, surveyJson.settings[0]);
		}
		var widgets = {};
		
		//Load scripts specified in settings somewhere after this point
		if('widgets' in surveyJson){
			//Transform and initialize widgets?
			$.extend(widgets, surveyJson.widgets);
		}
		var column_types = {
			validate: 'formula'
		};
		//Load scripts specified in settings somewhere after this point
		if('column_types' in surveyJson){
			$.extend(column_types, surveyJson.column_types);
		}
		var form = {
			initialize: function(){
				this.prompts = that.initializePrompts(this, this.prompts);
			},
			prompts: surveyJson.survey,
			settings: settings,
			widgets: widgets,
			column_types: column_types
		};
        form.prompts = ([
            {
                "type": "goto", 
                "param": "begin"
            },
			{type:"instances", name:"_instances", label:"Saved Instances"},
			{type:"json", name:"_json", label:"JSON formatted survey answers"},
            {
                "type": "label", 
                "param": "begin"
            },
            {type:"opening", name:"_opening", label:"opening page"}
        ]).concat(form.prompts);
        form.prompts.push({
            "type": "hierarchy",
            name: "_hierarchy"
        });
        
		console.log('initializing');
		form.initialize();
		console.log('starting');
		controller.prompts = form.prompts;
		return form;
	}
};
});
