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
            if( locale in textOrLangMap ){
                return textOrLangMap[locale];
            } else if( 'default' in textOrLangMap ){
                return textOrLangMap['default'];
            } else {
                alert("Could not localize object. See console:");
                console.error("Non localizable object:");
                console.error(textOrLangMap);
                return 'invalidOjbect';
            }
        },
        selected: function(promptValue, qValue) {
            //TODO: Store parsed JSON?
            if(!promptValue){
                return false;
            }
            if(_.isString(promptValue)){
                promptValue = JSON.parse(promptValue);
            }
            if(!_.isArray(promptValue)){
                alert("Selected function expects an array. See console for details.");
                console.error(promptValue);
                console.error(qValue);
                return false;
            }
            if(promptValue) {
                return _.include(_.pluck(promptValue, 'value'), qValue);
            } else {
                return false;
            }
        },
        //Check if the prompts have equivalent values.
        equivalent: function() {
            var parsedArgs = _.map(arguments, JSON.parse);
            if(_.all(parsedArgs, _.isArray)) {
                //We are probably dealing with a select. values is an array of the selected values.
                var values = _.map(parsedArgs, function(arguement){
                    return _.pluck(arguement, 'value');
                });
                return _.all(values.slice(1), function(value){
                    return _.union(_.difference(value, values[0]), _.difference(values[0], value)).length == 0;
                });
            } else {
                var arg0 = parsedArgs[0];
                return _.all(parsedArgs, function(arguement) {
                    return _.isEqual(arg0, arguement);
                });
            }
        },
        not: function(conditional){
            return !conditional;
        },
        //data gets a value by name and parses it.
        //TODO: When the model starts using objects we will need to get rid of the json parsing.
        data: function(valueName) {
            var datavalue = database.getDataValue(valueName);
            try {
                if(datavalue){
                    return JSON.parse(datavalue);
                }
            } catch(e) {
                return datavalue;
            }
            return datavalue;
        }
    }
});