'use strict';
require.config({
    shim: {
        mocha: {
            exports: 'mocha'
        }
    },
    paths: {
        chai: 'bower_components/chai/chai',
        mocha: 'bower_components/mocha/mocha',
        jquery: 'bower_components/jquery/jquery',
        util: 'scripts/test-util',
        require: 'bower_components/require/require'
    }
});

require(['require', 'mocha', 'jquery'], function(require, mocha, $) {

    mocha.setup('bdd');

    // Now we also need to set the backing object we are going to use. We
    // assume it is in the output/debug directory.
	if ( window.control.setBackingObject !== undefined ) {
		$.ajax({
			url: getUrl('output/debug/control.json'),
			success: function(data) {
				var controlObject = data;
				window.control.setBackingObject(controlObject);
			},
			async: false
		});
	}

    require([
        'scripts/model/control',
        'scripts/model/data'
    ], function(require) {
        // Note that this call isn't actually working, but relies on calls in
        // the js files themselves. I think this might be because of the fact
        // that ajax calls are being used to load the scripts and not just
        // requirejs itself. Note that we only call it in control.js in order
        // to only run the tests once. However, this means that we also can
        // encounter race conditions where occasionally not all the tests run.
        // Eventually, it would be nice if we loaded the scripts correctly
        // and just called it here to avoid the race conditions.
        //mocha.run();
    });

});
