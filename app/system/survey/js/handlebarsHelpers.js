/**
 * Handlebars helper functions for use within handlebars templates.
 *
 * These are invoked via {{helperFunction arg1}} or {{helperFunction arg1 arg2}}
 * within the handelbars templates.
 */
define(['database','opendatakit','handlebars','formulaFunctions', 'text!templates/labelHint.handlebars','jquery'],
function(database,  opendatakit,  Handlebars,  formulaFunctions,   labelHintPartial,                     $) {
verifyLoad('handlebarsHelpers',
    ['database','opendatakit','handlebars','formulaFunctions', 'text!templates/labelHint.handlebars','jquery'],
    [database,  opendatakit,  Handlebars,  formulaFunctions,   labelHintPartial,                      $]);

Handlebars.registerHelper('localize', function(textOrLangMap) {
    var locale = database.getInstanceMetaDataValue('_locale');
    if ( locale === undefined || locale === null ) {
        locale = opendatakit.getDefaultFormLocaleValue();
    }
    var str = formulaFunctions.localize(textOrLangMap,locale);
    var context = this;
    var template = Handlebars.compile(str);
    context.data = database.getAllDataValues();
    context.calculates = formulaFunctions.calculates;
    return template(context);
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

//Where does this get used?
Handlebars.registerHelper('formDirectory', function(options) {
    return opendatakit.getCurrentFormPath();
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