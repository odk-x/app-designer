/**
 * Handlebars helper functions for use within handlebars templates.
 *
 * These are invoked via {{helperFunction arg1}} or {{helperFunction arg1 arg2}}
 * within the handelbars templates.
 */
define(['database','opendatakit','handlebars','formulaFunctions', 'text!templates/labelHint.handlebars'],
function(database,  opendatakit,  Handlebars,  formulaFunctions,   labelHintPartial) {

Handlebars.registerHelper('localize', function(textOrLangMap, options) {
    var locale = database.getInstanceMetaDataValue('locale');
    if ( locale == null ) {
        locale = opendatakit.getDefaultFormLocaleValue();
    }
    var str = formulaFunctions.localize(textOrLangMap,locale);
    return new Handlebars.SafeString(str);
});

Handlebars.registerHelper('metadata', function(value, options) {
    var val = database.getInstanceMetaDataValue( options ? options : value );
    return new Handlebars.SafeString( (val != null) ? val : "" );
});

Handlebars.registerHelper('setting', function(value, options) {
    var val = database.getSettingValue( options ? options : value );
    return new Handlebars.SafeString( (val != null) ? val : "" );
});

Handlebars.registerHelper('toFixed', function(value, options) {
    return new Handlebars.SafeString( (value != null) ? (+value).toFixed(options) : "" );
});
    
Handlebars.registerHelper('toExponential', function(value, options) {
    return new Handlebars.SafeString( (value != null) ? (+value).toExponential(options) : "" );
});
    
Handlebars.registerHelper('toPrecision', function(value, options) {
    return new Handlebars.SafeString( (value != null) ? (+value).toPrecision(options) : "" );
});
    
Handlebars.registerHelper('toString', function(value, options) {
    return new Handlebars.SafeString( (value != null) ? (+value).toString(options) : "" );
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

Handlebars.registerHelper('promptLink', function(value, options) {
    return new Handlebars.SafeString( opendatakit.getHashString( opendatakit.getCurrentFormPath(), opendatakit.getCurrentInstanceId(), value ));
});


});