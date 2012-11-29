//Dont use usestrict or the evaluator will break
/**
 * Common functions accessible to the user's Javascript eval environment (for use within their formulas).
 */
 //TODO: These functions need unit testing.
define(['database', 'underscore'],
function(database,   _) {
    return {
        //calculates will be set by the builder
        calculates: {},
        localize: function(textOrLangMap, locale) {
            if(_.isUndefined(textOrLangMap)) {
                return 'undefined';
            }
            if(_.isString(textOrLangMap)) {
                return textOrLangMap;
            }
            if( locale in textOrLangMap ) {
                return textOrLangMap[locale];
            } else if( 'default' in textOrLangMap ) {
                return textOrLangMap['default'];
            } else {
                alert("Could not localize object. See console:");
                console.error("Non localizable object:");
                console.error(textOrLangMap);
                return 'invalidOjbect';
            }
        },
        selected: function(promptValue, qValue) {
            if(!promptValue) {
                return false;
            }
            var parsedPromptValue;
            try {
                //TODO: This parsing might change if the model stores JSON
                parsedPromptValue = JSON.parse(promptValue);
            } catch(e) {
                //Treat promptValue as a string
                parsedPromptValue = promptValue;
            }
            if(_.isArray(parsedPromptValue)) {
                return _.include(_.pluck(parsedPromptValue, 'value'), qValue);
            }
            //Using double equals here because I suspect the type coercion will prevent more
            //user errors that it will cause when comparing numbers and strings.
            return parsedPromptValue == qValue;
        },
        countSelected: function(promptValue){
            if(!promptValue) {
                return 0;
            }
            if(_.isString(promptValue)) {
                promptValue = JSON.parse(promptValue);
            }
            if(!_.isArray(promptValue)) {
                alert("Selected function expects an array. See console for details.");
                console.error(promptValue);
                console.error(qValue);
                return false;
            }
            return promptValue.length;
        },
        //Check if the prompts have equivalent values.
        equivalent: function() {
            var parsedArgs = arguments;
            if(_.all(parsedArgs, _.isArray)) {
                //We are probably dealing with a select. values is an array of the selected values.
                var values = _.map(parsedArgs, function(arguement) {
                    return _.pluck(arguement, 'value');
                });
                return _.all(values.slice(1), function(value) {
                    return _.union(_.difference(value, values[0]), _.difference(values[0], value)).length == 0;
                });
            } else {
                var arg0 = parsedArgs[0];
                return _.all(parsedArgs, function(arguement) {
                    return _.isEqual(arg0, arguement);
                });
            }
        },
        not: function(conditional) {
            return !conditional;
        },
        now: function() {
            return new Date();
        },
        //data gets a value by name.
        data: function(valueName) {
            var datavalue = database.getDataValue(valueName);
            return datavalue;
        },
        evaluator: function(code){
            with(this){
                return eval(code);
            }
        }
    }
});