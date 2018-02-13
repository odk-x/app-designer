/**
 * Common functions accessible from the user's Javascript eval environment
 * (for use within their formulas).
 */
 //TODO: These functions need unit testing.
define(['opendatakit','database','jquery','underscore'],
function(opendatakit,  database,  $,       _) {
    /* global odkCommon */
    verifyLoad('formulaFunctions',
        ['opendatakit','database','jquery','underscore'],
        [opendatakit,  database,   $,      _]);
    return {
        //calculates will be set by the builder
        calculates: {},
        opendatakit: opendatakit,
		getCurrentLocale: function() {
            'use strict';

            var locale = database.getInstanceMetaDataValue('_locale') || opendatakit.getCachedLocale();

            if (!locale) {
                locale = opendatakit.getDefaultFormLocaleValue();
                opendatakit.setCachedLocale(locale);
            }

            return locale;
		},
		expandFormDirRelativeUrlPath: function(content) {
            'use strict';
			if (!_.isString(content)) {
				throw Error("formulaFunctions.expandFormDirRelativeUrlPath(content) -- content is not a string: " + JSON.stringify(content));
			}
			var formPath = opendatakit.getCurrentFormPath();
			// if the Url is not prefixed by slash or http prefix, then prefix with form path
			if ( content.indexOf('/') === 0 || content.indexOf('http:') === 0 || content.indexOf('https:') === 0 ) {
				return content;
			} else {
				return formPath + content;
			}
		},
        localize: function(locale, displayProperty) {
            'use strict';
			return window.odkCommon.localizeText(locale, displayProperty);
        },
        selected: function(promptValue, qValue) {
            'use strict';
            if(!promptValue) {
                return false;
            }
            // it is a select_multiple...
            if(_.isArray(promptValue)) {
                return _.include(promptValue, qValue);
            }
            // it is a select_one...
            //Using double equals here because I suspect the type coercion will prevent more
            //user errors that it will cause when comparing numbers and strings.
            return promptValue == qValue;
        },
        countSelected: function(promptValue){
            'use strict';
            // select_multiple promptValue is an array
            if(!promptValue) {
                return 0;
            }
            if(!_.isArray(promptValue)) {
                odkCommon.log('E','countSelected() expects an array. Received: ' + promptValue );
                throw new Error("countSelected() expects an array.  Received: '" + promptValue + "'");
            }
            return promptValue.length;
        },
        //Check if the prompts have equivalent values.
        equivalent: function() {
            'use strict';
            var parsedArgs = arguments;
            if(_.all(parsedArgs, _.isArray)) {
                //We are probably dealing with a select. values is an array of the selected values.
                var values = parsedArgs;
                return _.all(values.slice(1), function(value) {
                    return _.union(_.difference(value, values[0]), _.difference(values[0], value)).length === 0;
                });
            } else {
                var arg0 = parsedArgs[0];
                return _.all(parsedArgs, function(argument) {
                    return _.isEqual(arg0, argument);
                });
            }
        },
        not: function(conditional) {
            'use strict';
            return !conditional;
        },
        now: function() {
            'use strict';
            return new Date();
        },
        isFinalized: function() {
            'use strict';
            var datavalue = database.getInstanceMetaDataValue('_savepoint_type');
            return ( 'COMPLETE' === datavalue );
        },
        //data gets a value by name.
        data: function(valueName) {
            'use strict';
            var datavalue = database.getDataValue(valueName);
            return datavalue;
        },
        //data gets a value by name.
        metadata: function(valueName) {
            'use strict';
            var datavalue = database.getInstanceMetaDataValue(valueName);
            return datavalue;
        },
        /**
         * assignment operator that returns the value that was assigned.
         * i.e., assign('a', 3) will store the value 3 in data('a') and
         * return the value 3 (for use in the remainder of the expression).
         */
        assign: function(valueName, value) {
            'use strict';
            database.setValueDeferredChange(valueName, value);
            return value;
        },
        /**
         * evaluator takes a string of code and evaluates in an environment with
         * all the formula functions.
         * This is used for evaluating user specified constraints/calculates/etc.
         * from formDef.json
         **/
        evaluator: function(code){
            //Both `with` and `eval` are cautioned against.
            //The justification for using eval is that we need some way to evaluate
            //user provided code. We are presuming that the survey creator is trusted
            //by the survey user. If not, bundled templates and promptTypes
            //are also security problems.
            //`with` is used to avoid having to repeatedly define every formula function.
            //formulaFuctions need to be available as module for use in our code
            //and in the top level environment for user provided code.
            //Be sure to NOT use strict in this module or `with` won't work.
            with(this){
                return eval(code);
            }
        },
        width: function(string) {
            'use strict';
            var f = '30px sans-serif', // TODO: Use document's actual font
            testDiv = $('<div>' + string + '</div>')
            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
            .appendTo($('body')),

            width = testDiv.width();
            testDiv.remove();
            return width;
        }
    };
});
