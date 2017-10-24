'use strict';

var display = function() {
    console.log('rending authorization detail view');
	var displayPromise = new Promise( function(resolve, reject) {
	    odkData.getViewData(resolve, reject);
    }).then( function(result) {
        var locale = odkCommon.getPreferredLocale();

        $('#title').text(odkCommon.localizeText(locale, "authorization_details"));

        util.populateDetailView(result, "field_list", locale, []);
    });

	displayPromise.catch( function(error) {
        console.log('display failure with error: ' + error);
    });

	return displayPromise;
};
