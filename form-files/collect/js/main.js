requirejs.config({
    baseUrl: '../collect',
    paths: {
		// third-party libraries we depend upon 
        jqmobile : 'libs/jquery.mobile-1.1.1/jquery.mobile-1.1.1',
        jquery : 'libs/jquery.1.8.1',
        backbone : 'libs/backbone.0.9.2',
        handlebars : 'libs/handlebars.1.0.0.beta.6',
        underscore : 'libs/underscore.1.3.3',
        text : 'libs/text.2.0.3',
        mobiscroll : 'libs/mobiscroll/js/mobiscroll-2.0.3.custom.min',
		// directory paths for resources
		img : 'img',
        templates : 'templates',
		// top-level objects
        mdl : 'js/mdl',
        promptTypes : 'js/promptTypes',
		// collect.js -- stub directly loaded
		// functionality
        prompts : 'js/prompts',
        database : 'js/database',
        controller : 'js/controller',
        builder : 'js/builder',
        screenManager : 'js/screenManager',
        parsequery : 'js/parsequery',
        opendatakit : 'js/opendatakit',
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
        'mobiscroll': {
            deps: ['jquery']
        }
    }
});

requirejs(['jquery'], function($) {

$(document).bind("mobileinit", function () {
	$.mobile.ajaxEnabled = false;
	$.mobile.linkBindingEnabled = false;
	$.mobile.hashListeningEnabled = false;
	$.mobile.pushStateEnabled = false;
});

requirejs(['mdl','opendatakit', 'database','parsequery',
                        'jqmobile', 'builder', 'controller',
                        'prompts'/* mix-in additional prompts and support libs here */], 
        function(mdl,opendatakit,database,parsequery,m,builder,controller,prompts) {
			parsequery.initialize(controller,builder);

			//
			// register to handle manual #hash changes
			$(window).bind('hashchange', function(evt) {
					parsequery.hashChangeHandler(evt);
			});
			
			//
			// define a function that waits until jquery mobile is initialized
			// then calls parseParameters() to trigger loading and processing of
			// the requested form.
			var f = function() {
				if ( $.mobile != null && !$.mobile.hashListeningEnabled ) {
					parsequery.parseParameters();
				} else {
					setTimeout(f, 200);
				}
			};
		
			f();
		
		});
});
