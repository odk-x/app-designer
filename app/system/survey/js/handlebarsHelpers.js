/**
 * Handlebars helper functions for use within handlebars templates.
 *
 * These are invoked via {{helperFunction arg1}} or {{helperFunction arg1 arg2}}
 * within the handelbars templates.
 */
define(['database','opendatakit','handlebars','formulaFunctions', 'text!templates/labelHint.handlebars','jquery'],
function(database,  opendatakit,  Handlebars,  formulaFunctions,   labelHintPartial,                     $) {
/* global odkCommon */
'use strict';
verifyLoad('handlebarsHelpers',
    ['database','opendatakit','handlebars','formulaFunctions', 'text!templates/labelHint.handlebars','jquery'],
    [database,  opendatakit,  Handlebars,  formulaFunctions,   labelHintPartial,                      $]);

var hasLocalization = function() {
	return function(displayObjectField, options) {
		var locale = formulaFunctions.getCurrentLocale();
		var hasLocalization = odkCommon.hasLocalization(locale, displayObjectField);
		if ( hasLocalization ) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	};
};

var hasFieldLocalization = function(fieldName) {
	return function(displayObjectField, options) {
		var locale = formulaFunctions.getCurrentLocale();
		var hasLocalization = odkCommon.hasFieldLocalization(locale, displayObjectField, fieldName);
		if ( hasLocalization ) {
			return options.fn(this);
		} else {
			return options.inverse(this);
		}
	};
};

var localizeTextField = function(fieldName) {
	return function(displayObjectField) {
		var locale = formulaFunctions.getCurrentLocale();
		var str =  odkCommon.localizeTokenField(locale, displayObjectField, fieldName);
		if ( str === undefined ) {
			return "";
		}
		var context = this;
		if (str != null && (typeof(str) != "string" || typeof(str) != "Program")) {
			// Fixes select one integer, the localized value may be 2017 but handlebars NEEDS "2017"
			str = str.toString();
		}
		var template = Handlebars.compile(str);
		return template(context);
	};
};

var localizeUrlField = function(fieldName) {
	return function(displayObjectField) {
		var locale = formulaFunctions.getCurrentLocale();
		var url = odkCommon.localizeUrl(locale, displayObjectField, fieldName, opendatakit.getCurrentFormPath());
		if ( url === undefined ) {
			return "";
		}
		var context = this;
		var template = Handlebars.compile(url);
		return template(context);
	};
};

Handlebars.registerHelper('ifHasLocalization', hasLocalization());

Handlebars.registerHelper('ifHasTextLocalization', hasFieldLocalization('text'));

Handlebars.registerHelper('localizeText', localizeTextField('text'));

Handlebars.registerHelper('ifHasImageLocalization', hasFieldLocalization('image'));

Handlebars.registerHelper('localizeImage', localizeUrlField('image'));

Handlebars.registerHelper('ifHasAudioLocalization', hasFieldLocalization('audio'));

Handlebars.registerHelper('localizeAudio', localizeUrlField('audio'));

Handlebars.registerHelper('ifHasVideoLocalization', hasFieldLocalization('video'));

Handlebars.registerHelper('localizeVideo', localizeUrlField('video'));

Handlebars.registerHelper('expandFormDirRelativeUrlPath', function(content) {
	return formulaFunctions.expandFormDirRelativeUrlPath(content);
});

Handlebars.registerHelper('metadata', function(fieldName) {
    var val = database.getInstanceMetaDataValue( fieldName );
    return new Handlebars.SafeString( (val !== undefined && val !== null) ? val : "" );
});

Handlebars.registerHelper('evaluate', function(calcFunction) {
    var val = (calcFunction)();
    return new Handlebars.SafeString( (val !== undefined && val !== null) ? val : "" );
});

Handlebars.registerHelper('setting', function(settingName) {
    var val = opendatakit.getSettingValue( settingName );
    return new Handlebars.SafeString( (val !== undefined && val !== null) ? val : "" );
});

Handlebars.registerHelper('toFixed', function(value, options) {
    return new Handlebars.SafeString( (value !== undefined && value !== null) ? (+value).toFixed(options) : "" );
});
    
Handlebars.registerHelper('toExponential', function(value, options) {
    return new Handlebars.SafeString( (value !== undefined && value !== null) ? (+value).toExponential(options) : "" );
});
    
Handlebars.registerHelper('toPrecision', function(value, options) {
    return new Handlebars.SafeString( (value !== undefined && value !== null) ? (+value).toPrecision(options) : "" );
});
    
Handlebars.registerHelper('toString', function(value, options) {
    return new Handlebars.SafeString( (value !== undefined && value !== null) ? (+value).toString(options) : "" );
});
    
Handlebars.registerHelper('stringify', function(value, options) {
    return new Handlebars.SafeString( JSON.stringify(value,null,options) );
});

Handlebars.registerHelper('eachProperty', function(context, options) {
    var output = "";
    if($.isPlainObject(context)){
        $.each(context, function(property, value){
            output += options.fn({property:property,value:value});
        });
        return output;
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerPartial('labelHint', labelHintPartial);

/**
 * Helper function for replacing variable refrences
 **/
Handlebars.registerHelper('substitute', function(options) {
    var template = Handlebars.compile(options.fn(this));
    var context = database.getAllDataValues();
    context.calculates = formulaFunctions.calculates;
    return template(context);
});

Handlebars.registerHelper('selected', function(prompt, value, options) {
    if(formulaFunctions.selected(prompt, value)) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('ifEqual', function(item, value, options) {
    if(item === value) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});


return "handlebarsHelpers were successfully registered";
});
