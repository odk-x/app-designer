define(['mdl','database','opendatakit','handlebars','formulaFunctions', 'text!templates/labelHint.handlebars'],
function(mdl,  database,   opendatakit, Handlebars,  formulaFunctions,   labelHintPartial) {

Handlebars.registerHelper('localize', function(textOrLangMap, options) {
    var locale = database.getMetaDataValue('formLocale');
    var str = formulaFunctions.localize(textOrLangMap,locale);
    return new Handlebars.SafeString(str);
});

Handlebars.registerHelper('metadata', function(value, options) {
    var val = database.getMetaDataValue( options ? options : value );
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
    return opendatakit.getCurrentFormDirectory();
});

Handlebars.registerHelper('eachProperty', function(context, options) {
    var output = "";
    if($.isPlainObject(context)){
        $.each(context, function(property, value){
            output += options.fn({property:property,value:value});
        });
    }
    return output;
});

Handlebars.registerPartial('labelHint', labelHintPartial);

/**
 * Helper function for replacing variable refrences
 **/
Handlebars.registerHelper('substitute', function(options) {
    var template = Handlebars.compile(options.fn(this));
    return template(database.mdl.data);
});

Handlebars.registerHelper('selected', function(prompt, value, options) {    
    if(formulaFunctions.selected(prompt, value)) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

});