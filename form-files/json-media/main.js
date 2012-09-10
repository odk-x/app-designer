requirejs.config({
    baseUrl: '../collect/js',
    paths: {
        templates : '../templates',
        },
    shim: {
        'zepto': {
            // Slimmer drop-in replacement for jquery
            //These script dependencies should be loaded before loading
            //zepto.js
            deps: [],
            //Once loaded, use the global '$' as the
            //module value.
            exports: '$'
        },
        'underscore': {
            //These script dependencies should be loaded before loading
            //underscore.js
            deps: [],
            //Once loaded, use the global '_' as the
            //module value.
            exports: '_'
        },
        'backbone': {
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['underscore', 'zepto'],
            //Once loaded, use the global 'Backbone' as the
            //module value.
            exports: 'Backbone'
        },
        'handlebars': {
            //These script dependencies should be loaded before loading
            //handlebars.js
            deps: ['zepto'],
            //Once loaded, use the global 'Handlebars' as the
            //module value.
            exports: 'Handlebars'
        },
        'templates/compiledTemplates': {
            deps: ['handlebars'],
        }
    }
});

requirejs(['opendatakit', 'database','parsequery'], function(opendatakit, database, parsequery) {
var formDef = /* json start delimiter */{
    "settings": [{
		name: "formId",
		param: "lgform"
		},
		{
		name: "formVersion",
		param: "20120901"
		},
		{
		name: "formLocale",
		param: "en_us"
		},
		{
		name: "formName",
		param: {
			"en_us": 'Simple Test Form'
			}
		}
    ],
    "survey": [
       {
            "prompts": [
                {
                    "name": "name", 
                    "validate": true, 
                    "type": "text", 
                    "param": null, 
                    "label": {
                        "en_us": "Enter your name:"
                    }
                }, 
                {
                    "type": "integer", 
                    "name": "age", 
                    "param": null, 
                    "label": {
                        "en_us": "Enter your age:"
                    }
                }, 
                {
                    "type": "decimal", 
                    "name": "bmi", 
                    "param": null, 
                    "label": {
                        "en_us": "Enter your bmi:"
                    }
                }, 
                {
                    "name": "gender",
                    "type": "text", 
                    "param": null, 
                    "label": {
                        "en_us": "Enter your gender:"
                    }
                }
            ], 
            "type": "screen", 
            "name": "testScreen",
            "label": "Screen group"
        }, 
        {
            "type": "goto", 
            "param": "test"
        },
        {
            "type": "label", 
            "param": "test"
        },
		{
			"name": "name", 
			"validate": true, 
			"type": "text", 
			"param": null, 
			"label": {
				"en_us": "Enter your name:"
			}
		}, 
		{
			"type": "integer", 
			"name": "age", 
			"param": null, 
			"label": {
				"en_us": "Enter your age:"
			}
		}, 
		{
			"type": "decimal", 
			"name": "bmi", 
			"param": null, 
			"label": {
				"en_us": "Enter your bmi:"
			}
		}, 
		{
			"name": "gender",
			"type": "text", 
			"param": null, 
			"label": {
				"en_us": "Enter your gender:"
			}
		},
        {
            "type": "select", 
            "name": "sel",
            "label": "Select genders:",
            "param": "gender"
        },
        {
            "name": "rep",
            "type": "repeat", 
            "param": "test", 
            "label": {
                "en_us": "Repeat"
            }
        },
        {
            "type": "audio", 
            "name": "aud", 
            "param": null
        }, 
        {
            "type": "video", 
            "name": "vid", 
            "param": null
        }, 
        {
            "type": "image", 
            "name": "img", 
            "param": null
        }
    ], 
    "datafields": {
        "gender": {
            "type": "string"
        }, 
        "img": {
            "type": "image/*"
        }, 
        "name": {
            "type": "string"
        }, 
        "age": {
            "type": "integer"
        }, 
        "bmi": {
            "type": "decimal"
        }, 
        "sel": {
            "type": "multiselect"
        }, 
        "vid": {
            "type": "video/*"
        }, 
        "aud": {
            "type": "audio/*"
        }
    }, 
    "choices": {
        "gender": [
            {
                "name": "male", 
                "label": "male"
            }, 
            {
                "name": "female", 
                "label": "female"
            }
        ]
    }
}/* json end delimiter */;
    parsequery.parseQueryParameters(formDef, function() {
    // we have saved all query parameters into the metaData table
	// created the data table and its table descriptors
    // re-normalized the query string to just have the instanceId
	// read all the form data and metaData into value caches
	// under database.model and opendatakit.queryParameters (respectively).
        
requirejs(['zepto','builder', 'controller','prompts'/* mix-in additional prompts and support libs here */],
function($,builder,controller,prompts) {
    console.log('scripts loaded');
    // build the survey and place it in the controller...
builder.buildSurvey(formDef, function() {
    //
    // register to handle manual #hash changes
    $(window).bind('hashchange', function(evt) {
        controller.odkHashChangeHandler();
    });

    // fire the controller to render the first page.
    controller.start($('#jqt'));
}
);

});

});

});

