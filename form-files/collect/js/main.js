requirejs.config({
    //baseUrl: '../collect/js',
    paths: {
        collect : '',
        mdl : 'mdl',
        database : 'database',
        opendatakit : 'opendatakit',
        parsequery : 'parsequery',
        jquery : 'jquery',
        jqmobile : '../libs/jquery.mobile-1.1.1/jquery.mobile-1.1.1',
        underscore : 'underscore',
        backbone : 'backbone',
        prompts : 'prompts',
        controller : 'controller',
        builder : 'builder',
        handlebars : 'handlebars',
        promptTypes : 'promptTypes',
        text : 'text',
        screenManager : 'screenManager',
        templates : '../templates'
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
			
			window.updateScreen = function(formDef, formId, formVersion, instanceId, pageRef, sameForm, sameInstance) {
					// we have saved all query parameters into the metaData table
					// created the data table and its table descriptors
					// re-normalized the query string to just have the instanceId
					// read all the form data and metaData into value caches
					// under mdl.data and mdl.qp (respectively).
					console.log('scripts loaded');
					
					var qpl = opendatakit.getHashString(formId, formVersion, instanceId, pageRef);
					
					// pull metadata for synchronous read access
					database.cacheAllMetaData(function() {
							// metadata is OK...
							database.initializeTables(formDef, function() {
									// instance data is OK...
									if ( !sameForm ) {
											// build the survey and place it in the controller...
											builder.buildSurvey(formDef, function() {
													// controller OK
													// new form -- no 'back' history
													controller.clearPromptHistory();
													//
													// register to handle manual #hash changes
													$(window).bind('hashchange', function(evt) {
															controller.odkHashChangeHandler();
													});

													if ( qpl != window.location.hash ) {
															// apply the change to the URL...
															window.location.hash = qpl;
															// triggers hash-change listener...
													} else {
															// fire the controller to render the first page.
															controller.gotoRef(pageRef);
													}
											});
									} else {
											// controller prompts OK
											if ( !sameInstance ) {
													// switching instance -- no 'back' history...
													controller.clearPromptHistory();
											}
											//
											// register to handle manual #hash changes
											$(window).bind('hashchange', function(evt) {
													controller.odkHashChangeHandler();
											});

											if ( qpl != window.location.hash ) {
													// apply the change to the URL...
													window.location.hash = qpl;
													// triggers hash-change listener...
											} else {
													// fire the controller to render the first page.
													controller.gotoRef(pageRef);
											}
									}
							}
							);
					});
			};

		var f = function() {
			if ( $.mobile != null && !$.mobile.hashListeningEnabled ) {
				parsequery.parseQueryParameters( window.updateScreen );
			} else {
				setTimeout(f, 200);
			}
		};
		
		f();
		
	});
});
