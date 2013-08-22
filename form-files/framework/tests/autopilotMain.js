/**
 * Simple boilerplate for defining the requirejs settings, 
 * to initialize parsequery dependencies, and to establish
 * the parsequery.hashChangeHandler for hash change events.
 *
 * Also sets up a timer polling for the completion of the
 * jquery mobile platform. After it is initialized, the
 * timer then triggers the processing of the hash of the 
 * initial page load (which triggers the parsing and 
 * interpretation of the formDef.json for the form).
 */
requirejs.config({
    baseUrl: '../',
    paths: {
        // third-party libraries we depend upon 
        jqmobile : 'libs/jquery.mobile-1.2.0/jquery.mobile-1.2.0',
        jquery : 'libs/jquery.1.8.2',
        backbone : 'libs/backbone.0.9.2',
        handlebars : 'libs/handlebars.1.0.0.beta.6',
        underscore : 'libs/underscore.1.4.2',
        //underscore : 'libs/underscore.1.3.3',
        text : 'libs/text.2.0.3',
        mobiscroll : 'libs/mobiscroll/js/mobiscroll-2.0.3.custom.min',
        // directory paths for resources
        img : 'img',
        templates : 'templates',
        // top-level objects
        mdl : 'js/mdl',
        promptTypes : 'js/promptTypes',
        // shim.js -- stub directly loaded
        // functionality
        prompts : 'js/prompts',
        database : 'js/database',
        controller : 'js/controller',
        builder : 'js/builder',
        screenManager : 'js/screenManager',
        parsequery : 'js/parsequery',
        opendatakit : 'js/opendatakit',
        jqmConfig : 'js/jqmConfig',
        handlebarsHelpers : 'js/handlebarsHelpers',
        formulaFunctions : 'js/formulaFunctions',
        'jquery-csv' : 'libs/jquery-csv/src/jquery.csv'
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
            deps: ['jquery', 'jqmConfig']
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
        },
        'jquery-csv' : {
            deps: ['jquery']
        }
    }
});

requirejs(['jquery', 'underscore', 'mdl','opendatakit', 'database','parsequery',
                        'jqmobile', 'builder', 'controller',
                        'prompts'], 
        function($, _, mdl,opendatakit,database,parsequery,m,builder,controller,prompts) {
            var ctxt = controller.newStartContext();

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
                    
                    if ( window.location.search != null && window.location.search.indexOf("purge") >= 0 ) {
                        ctxt.append('purging datastore');
                        database.purge($.extend({},ctxt,{success:function() {
                                parsequery.parseParameters(ctxt);
                            }}));
                    } else {
                        parsequery.parseParameters(ctxt);
                    }
                } else {
                    ctxt.append('startup.delay');
                    setTimeout(f, 200);
                }
            };
        
            f();
            
            //Autopilot code below here:
            //Currently it will just navigate to the end of the example form.

            var getElement = function(selector, context){
                context = $.extend({
                    success: function(){},
                    failure: function(){},
                    attempts: 10
                }, context);
                
                if(context.attempts === 0) {
                    context.error("could not get element: " + selector);
                    return;
                }
                var $el = $(selector);
                if($el.length > 0) {
                    context.success($el);
                } else {
                    setTimeout(function(){
                        context.attempts--;
                        getElement(selector, context);
                    },  800);
                }
            };
            var tryUntil = function(thingToTry, context){
                context = $.extend({
                    success: function(){},
                    failure: function(){},
                    attempts: 10
                }, context);
                if(context.attempts === 0) {
                    context.failure("Giving up");
                    return;
                }
                thingToTry(function(result){
                    context.success(result);
                    setTimeout(function(){
                        context.attempts--;
                        tryUntil(thingToTry, context);
                    },  800);
                });
            };
            var errorFun = function(err){
                alert(err);
            }
            var navigateToEnd = function(){
                getElement('.createInstance', {
                    success: function($el) {
                        $(document).on('pagechange', function(){
                            getElement('.odk-next-btn', {
                                success: function($el) {
                                    if($el.hasClass('ui-disabled')){
                                        alert("Done.");
                                        return;
                                    }
                                    $el.click();
                                },
                                error: errorFun
                            });
                        });
                        $el.click();
                    },
                    error: errorFun
                });
            };
            
            //We should change the Survey code to make
            //formPath should be relative to the html page
            //in this case autopilot.html
            window.location.hash = "formPath=../example/";
            setTimeout(function(){
                navigateToEnd();
            },  2000);
            
});
