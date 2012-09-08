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
});

requirejs(['opendatakit', 'database','parsequery'], function(opendatakit, database, parsequery) {
	parsequery.parseQueryParameters('lgform', null, 
		'en_us', 'Simple Test Form', function() {
		
requirejs(['zepto','builder', 'controller','prompts'/* mix-in additional prompts and support libs here */],
function($,builder,controller,prompts) {
	console.log('scripts loaded');
	// build the survey and place it in the controller...
builder.buildSurvey(/* json start delimiter */
{
    "settings": [{
		formId : 'lgform', // must match arg to parseQueryParameters
		formVersion : null, // must match arg to parseQueryParameters
		formLocale : 'en_us', // must match arg to parseQueryParameters
		formName : 'Simple Test Form' // must match arg to parseQueryParameters
	}],
    "survey": [
        {
            "type": "goto", 
            "param": "test"
        },
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
                    "type": "int", 
                    "name": "age", 
                    "param": null, 
                    "label": {
                        "en_us": "Enter your age:"
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
            "type": "label", 
            "param": "test"
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
}
/* json end delimiter */, function() {
	// we have saved all query parameters into the metaData table
	// and re-normalized the query string to remove them.
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

