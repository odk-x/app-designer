/**
 * Configuration settings for jquery mobile to disable 
 * dynamic page transitions (loadings of pages via links),
 * disable page history and to disable all hashChange
 * detection or handling (do our own navigation handling).
 */
define(['jquery'], function($){
    $(document).bind("mobileinit", function () {
        $.mobile.ajaxEnabled = false;
        $.mobile.linkBindingEnabled = false;
        $.mobile.hashListeningEnabled = false;
        $.mobile.pushStateEnabled = false;
    });
});