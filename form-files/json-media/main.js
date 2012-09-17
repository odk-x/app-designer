requirejs.config({
    //baseUrl: '../collect/js',
    paths: {
        collect : '../collect',
        mdl : '../collect/js/mdl',
        database : '../collect/js/database',
        opendatakit : '../collect/js/opendatakit',
        parsequery : '../collect/js/parsequery',
        jquery : '../collect/js/jquery',
        jqmobile : '../collect/libs/jquery.mobile-1.1.1/jquery.mobile-1.1.1',
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
        'jquery': {
            // Slimmer drop-in replacement for jquery
            //These script dependencies should be loaded before loading
            //zepto.js
            deps: [],
            //Once loaded, use the global '$' as the
            //module value.
            exports: '$'
        },
        'jqmobile': {
            // Slimmer drop-in replacement for jquery
            //These script dependencies should be loaded before loading
            //jqmobile.js
            deps: ['jquery']
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
            deps: ['underscore', 'jquery'],
            //Once loaded, use the global 'Backbone' as the
            //module value.
            exports: 'Backbone'
        },
        'handlebars': {
            //These script dependencies should be loaded before loading
            //handlebars.js
            deps: ['jquery'],
            //Once loaded, use the global 'Handlebars' as the
            //module value.
            exports: 'Handlebars'
        },
        'templates/compiledTemplates': {
            deps: ['handlebars']
        }
    }
});

requirejs(['opendatakit', 'database','parsequery'], function(opendatakit, database, parsequery) {
var formDef = /* json start delimiter */{
    "settings": [
        {
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
            param: 'Simple Test Form'
        },
        {
            name: "formLogo",
            param: "img/form_logo.png"
        }
    ],
    "survey": [
        {
            "type": "acknowledge",
            "name": "continue",
            "label": "Do you want to continue?"
        },
        {
            "prompts": [
                {
                    "type": "text", 
                    //"disabled": true,
                    "name": "name", 
                    "image": "img/test.gif",
                    "audio": "http://upload.wikimedia.org/wikipedia/commons/b/ba/Ru-audio_template-Wikipedia.ogg",
                    //"video": "http://upload.wikimedia.org/wikipedia/commons/2/27/Lasercutting-video.ogg",
                    "param": null, 
                    "label": {
                        "en_us": "Enter your name {{name.value}}:"
                    },
                    "hint": "hi"
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
                    "type": "number", 
                    "name": "bmi", 
                    "param": null, 
                    "label": {
                        "en_us": "Enter your bmi:"
                    },
                    "templateContext" : {
                        "type": "range",
                        "min": 0,
                        "max": 60
                    }
                },
                {
                    "type": "select_one", 
                    "name": "gender", 
                    "param": "gender", 
                    "label": {
                        "en_us": "Enter your gender:"
                    }
                }
            ], 
            "type": "screen", 
            "name": "testScreen",
            "label":  {
                "en_us": "Screen Group"
            }
        }, 
        {
            "type": "goto_if",
            "param": "test2",
            "condition": "{{name}}"
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
            "type": "label", 
            "param": "test2"
        },
        {
            "type": "audio", 
            "name": "audio_test", 
            "param": null, 
            "label": {
                "en_us": "Audio test"
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
            "name": "specialTemplateTest", 
            "label": {
                "en_us": "Custom template test:"
            }, 
            "type": "text", 
            "param": null, 
            "templatePath": "test.handlebars"
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
            "type": "number", 
            "name": "bmi", 
            "param": null, 
            "label": {
                "en_us": "Enter your bmi:"
            }
        }, 
        {
            "type": "select", 
            "name": "sel",
            "label": "Select all genders:",
            "param": "gender"
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
        "sel": {
            "type": "multiselect"
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
}/* json end delimiter */;
    parsequery.parseQueryParameters(formDef, function() {
    // we have saved all query parameters into the metaData table
    // created the data table and its table descriptors
    // re-normalized the query string to just have the instanceId
    // read all the form data and metaData into value caches
    // under mdl.data and mdl.qp (respectively).
        
requirejs(['jquery', 'jqmobile', 'builder', 'controller','prompts'/* mix-in additional prompts and support libs here */],
function($,m,builder,controller,prompts) {
    console.log('scripts loaded');
    // build the survey and place it in the controller...
builder.buildSurvey(formDef, function() {
    //
    // register to handle manual #hash changes
    $(window).bind('hashchange', function(evt) {
        controller.odkHashChangeHandler();
    });

    // fire the controller to render the first page.
    controller.start();
}
);

});

});

});

