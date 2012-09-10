requirejs.config({
    //baseUrl: '../collect/js',
    paths: {
        collect : '../collect',
        database : '../collect/js/database',
        opendatakit : '../collect/js/opendatakit',
        parsequery : '../collect/js/parsequery',
        zepto : '../collect/js/zepto',
        underscore : '../collect/js/underscore',
        backbone : '../collect/js/backbone',
        prompts : '../collect/js/prompts',
        controller : '../collect/js/controller',
        builder : '../collect/js/builder',
        handlebars : '../collect/js/handlebars',
        promptTypes : '../collect/js/promptTypes',
        text : '../collect/js/text',
        screenManager : '../collect/js/screenManager',
        templates : '../collect/templates'
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
    parsequery.parseQueryParameters('lgform', null, 
        'en_us', 'Simple Test Form', function() {
        
requirejs(['zepto','builder', 'controller','prompts'/* mix-in additional prompts and support libs here */],
function($,builder,controller,prompts) {
    console.log('scripts loaded');
    // build the survey and place it in the controller...
builder.buildSurvey(/* json start delimiter */
{
    "settings": [
        {
            "setting": "formId", 
            "value": "testForm"
        }, 
        {
            "setting": "formVersion", 
            "value": 1
        }, 
        {
            "setting": "formLocale", 
            "value": "en_us"
        }, 
        {
            "setting": "formName", 
            "value": "Test Form"
        }
    ], 
    "survey": [
        {
            "type": "goto", 
            "param": "test"
        },
        {
            "type": "label", 
            "param": "test"
        }, 
        {
            "prompts": [
                {
                    "type": "text", 
                    "name": "name", 
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
                    "type": "select", 
                    "name": "gender", 
                    "param": "gender", 
                    "label": {
                        "en_us": "Enter your gender:"
                    }
                }
            ], 
            "type": "screen", 
            "name": "asdf"
        }, 
        {
            "type": "audio", 
            "name": "audio_test", 
            "param": null, 
            "label": {
                "english": "Audio test"
            }
        }, 
        {
            "type": "video", 
            "name": "video_test", 
            "param": null, 
            "label": {
                "en_us": "Video test"
            }
        }, 
        {
            "type": "image", 
            "name": "image_test", 
            "param": null, 
            "label": {
                "en_us": "Image test"
            }
        }, 
        {
            "qp": {
                "param": "foo"
            }, 
            "type": "repeat", 
            "param": "subform.html"
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
            "name": "specialTemplateTest", 
            "label": {
                "en_us": "Custom template test:"
            }, 
            "type": "text", 
            "param": null, 
            "templatePath": "test.handlebars"
        }
    ], 
    "datafields": {
        "name": {
            "type": "string"
        }, 
        "specialTemplateTest": {
            "type": "string"
        }, 
        "age": {
            "type": "integer"
        }, 
        "bmi": {
            "type": "number"
        }, 
        "image_test": {
            "type": "image/*"
        }, 
        "audio_test": {
            "type": "audio/*"
        }, 
        "video_test": {
            "type": "video/*"
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
}/* json end delimiter */, function() {
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

