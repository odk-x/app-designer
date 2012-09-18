requirejs.config({
    baseUrl: '../collect',
    paths: {
        mdl : 'js/mdl',
        database : 'js/database',
        opendatakit : 'js/opendatakit',
        parsequery : 'js/parsequery',
        jquery : 'js/jquery',
        jqmobile : 'libs/jquery.mobile-1.1.1/jquery.mobile-1.1.1',
        underscore : 'js/underscore',
        backbone : 'js/backbone',
        prompts : 'js/prompts',
        controller : 'js/controller',
        builder : 'js/builder',
        handlebars : 'js/handlebars',
        promptTypes : 'js/promptTypes',
        text : 'js/text',
        screenManager : 'js/screenManager',
		img : 'img',
        templates : 'templates',
		app : '..'
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
			
			window.updateScreen = function(formDef, formPath, instanceId, pageRef, sameForm, sameInstance) {
					// we have saved all query parameters into the metaData table
					// created the data table and its table descriptors
					// re-normalized the query string to just have the instanceId
					// read all the form data and metaData into value caches
					// under mdl.data and mdl.qp (respectively).
					console.log('scripts loaded');
					if ( formPath == null ) {
						alert("Unexpected null formPath");
						return;
					}
					
					var qpl = opendatakit.getHashString(formPath, instanceId, pageRef);
					
					// pull metadata for synchronous read access
					database.cacheAllMetaData(function() {
							// metadata is OK...
							database.initializeTables(formDef, function() {
									// instance data is OK...
									if ( !sameForm ) {
											controller.clearPromptHistory();
											controller.prompts = null;
											controller.destroyScreenManager();
											// new form -- no 'back' history
											collect.setInstanceId(instanceId);
											
											// build the survey and place it in the controller...
											builder.buildSurvey(formDef, function() {
													// controller OK
													//
													// register to handle manual #hash changes
													$(window).bind('hashchange', function(evt) {
															controller.odkHashChangeHandler(evt);
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
												controller.clearPromptHistory();
												controller.destroyScreenManager();
												// switching instance -- no 'back' history...
												collect.setInstanceId(instanceId);
											}
											//
											// register to handle manual #hash changes
											$(window).bind('hashchange', function(evt) {
													controller.odkHashChangeHandler(evt);
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
