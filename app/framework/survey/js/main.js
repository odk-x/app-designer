/**
 * Simple boilerplate for defining the requirejs settings, 
 * to initialize parsequery dependencies, and to invoke
 * the parsequery.changeUrlHash to interpret the 
 * window.location.hash value.
 *
 * Also sets up a timer polling for the completion of the
 * jquery mobile platform. After it is initialized, the
 * timer then triggers the processing of the hash of the 
 * initial page load (which triggers the parsing and 
 * interpretation of the formDef.json for the form).
 */
requirejs.config({
    baseUrl: shim.getBaseUrl(),
    waitSeconds: 45,
    paths: {
        // third-party libraries we depend upon 
        jqmobile : 'libs/jquery.mobile-1.4.2/jquery.mobile-1.4.2',
        jquery : 'libs/jquery.1.10.2',
        backbone : 'libs/backbone.1.0.0',
        handlebars : 'libs/handlebars.1.0.0.rc.4',
        underscore : 'libs/underscore.1.4.4',
        text : 'libs/text.2.0.10',
        mobiscroll : 'libs/mobiscroll-2.5.4/js/combined.min',
        // directory paths for resources
        img : 'img',
        templates : 'survey/templates',
        translations : 'translations',
        // top-level objects
        mdl : 'survey/js/mdl',
        screenTypes : 'survey/js/screenTypes',
        promptTypes : 'survey/js/promptTypes',
        // shim.js -- stub directly loaded
        // functionality
        screens : 'survey/js/screens',
        prompts : 'survey/js/prompts',
        database : 'survey/js/database',
        databaseUtils : 'survey/js/databaseUtils',
        databaseSchema : 'survey/js/databaseSchema',
        controller : 'survey/js/controller',
        builder : 'survey/js/builder',
        screenManager : 'survey/js/screenManager',
        parsequery : 'survey/js/parsequery',
        opendatakit : 'survey/js/opendatakit',
        jqmConfig : 'survey/js/jqmConfig',
        handlebarsHelpers : 'survey/js/handlebarsHelpers',
        formulaFunctions : 'survey/js/formulaFunctions',
        'jquery-csv' : 'libs/jquery-csv/src/jquery.csv',
        XRegExp : 'libs/XRegExp-All-3.0.0-pre-2013-08-27'
    },
    shim: {
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
            deps: ['jquery','jqmobile'],
			exports: '$.mobiscroll',
        },
        'jquery-csv' : {
            deps: ['jquery']
        }
    }
});

/**
 * This function is called by the Application Designer environment to trigger a 
 * re-draw of the current screen when returning from a linked table (sub-form).
 */
function redrawHook() {
	require('controller').redrawHook();
}
/**
 * Test to confirm that all required dependencies have
 * been loaded. If there is a circular dependency, it will
 * be null. If so, log the error.
 */
function verifyLoad( prefix, alist, args ) {
    var i;
    for ( i = 0 ; i < args.length ; ++i ) {
        if ( args[i] === undefined || args[i] === null ) {
            shim.log('E',prefix + ' cyclic dependency prevented initialization of ' + alist[i]);
        }
    }
}

require(['jquery'], 
    function($) {
        verifyLoad('main.require.jquery',
            ['jquery'],
            [$]);

    shim.log('I','main.require.jquery.loaded establish mobileinit action');
    window.$(document).on("mobileinit", function () {
    
        window.$.mobile.ajaxEnabled = false;
        window.$.mobile.allowCrossDomainPages = false;
        window.$.mobile.linkBindingEnabled = false;
        window.$.mobile.hashListeningEnabled = false;
        window.$.mobile.pushStateEnabled = false;

        // unwind require then launch the framework...
        setTimeout( function() {
                
            // and launch the framework...
            require(['mdl','opendatakit', 'database','parsequery',
                            'builder', 'controller'], 
            function(   mdl,  opendatakit,   database,  parsequery,
                             builder,   controller) {
                verifyLoad('main.require.framework.loaded',
                    ['mdl','opendatakit', 'database','parsequery',
                            'builder', 'controller'],
                    [ mdl,  opendatakit,   database,  parsequery,
                             builder,   controller]);

                
                // define a function that waits until jquery mobile is initialized
                // then calls changeUrlHash() to trigger loading and processing of
                // the requested form.
                    
                parsequery.initialize(controller,builder);

                var ref = window.location.href;
                var hashIdx = ref.indexOf("#");
                var searchIdx = ref.indexOf("?");
                var search = window.location.search;
                var newRef = ref;

                var ctxt = controller.newStartContext();

                var isAndroid = (opendatakit.getPlatformInfo().container === "Android");
                var testAndroidParsing = false;
                var remapUrl = !isAndroid;
                // TODO: figure out why jqMobile+Chrome adds an empty '?' search
                // string to window.location.href   Code deals with that here.
                // The ? catastrophically breaks Android 2.x
                if ( remapUrl ) {
                    if ( !(testAndroidParsing || isAndroid) ) {
                        if ( searchIdx < 0 || (hashIdx > 0 && searchIdx > hashIdx) ) {
                            // add it if it is missing
                            if ( hashIdx < 0 ) {
                                        newRef = ref + '?';
                            } else if ( hashIdx > 0 ) {
                                        newRef = ref.substring(0,hashIdx) + '?' + ref.substring(hashIdx,ref.length);
                            }
                            shim.log('W','jqmConfig.addSearchTerm.reloadpage ref: ' + ref + ' newRef: ' + newRef);
                            window.location.assign(newRef);
                        } else if ( search !== undefined && search !== null && search.indexOf("purge") >= 0 ) {
                            // remove the search string (?purge) and replace with ?
                            if ( hashIdx < 0 ) {
                                newRef = ref + '?';
                            } else if ( hashIdx > 0 ) {
                                newRef = ref.substring(0,hashIdx) + '?' + ref.substring(hashIdx,ref.length);
                            }
                            ctxt.log('W',"jqmConfig.purge ref: " + ref + ' newRef: ' + newRef);
                            database.purge($.extend({},ctxt,{success:function() {
                                // we loose the ctxt action (page load restarts everything...)
                                ctxt.log('W','jqmConfig.purge.reloadpage newRef: ' + newRef);
                                window.location.assign(newRef);
                            }}));
                        } else {
                            ctxt.log('D','jqmConfig.changeUrlHash ref: ' + ref);
                            parsequery.changeUrlHash(ctxt);
                        }
                    } else if ( searchIdx > 0 && (hashIdx < 0 || hashIdx > searchIdx) ) {
                        // we have a '?' on the URL. Forcibly remove it.
                        hashIdx = (hashIdx > 0) ? hashIdx : ref.length;
                        newRef = ref.substring(0,searchIdx) + ref.substring(hashIdx,ref.length);
                        shim.log('W','jqmConfig.removeUrlSearchTerm.reloadpage ref: ' + ref + ' newRef: ' + newRef );
                        window.location.assign(newRef);
                    } else {
                        // no search term -- pass through
                        ctxt.log('D','jqmConfig.changeUrlHash ref: ' + ref);
                        parsequery.changeUrlHash(ctxt);
                    }
                } else {
                    // don't care -- do whatever...
                    ctxt.log('D','jqmConfig.simple.changeUrlHash ref: ' + ref);
                    parsequery.changeUrlHash(ctxt);
                }
            }, function(err) {
                shim.log('E','main.require.framework.errback: ' + err.requireType + ' modules: ' + err.requireModules.toString());
            });
        }, 0);

        });

    
    require(['jqmobile'], 
      function(_jqmobile) {
        verifyLoad('main.require.jqmobile.loaded',
            ['jqmobile'],
            [_jqmobile]);
    }, function(err) {
        shim.log('E','main.require.jqmobile.errback: ' + err.requireType + ' modules: ' + err.requireModules.toString());
    });
        

}, function(err) {
    shim.log('E','main.require.jquery.errback: ' + err.requireType + ' modules: ' + err.requireModules.toString());
});
                         