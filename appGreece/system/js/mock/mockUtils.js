/**
 * This file contains utilities that operate on the data as represented in the JSON
 * and as serialized into and out of the database or session storage.
 */
define([],
function() {
/* global odkCommon */
'use strict';
return {
    isUnitOfRetention: function(jsonDefn) {
        if (jsonDefn.notUnitOfRetention) {
            return false;
        }
        return true;
    },
    // jsonType == { isNotNullable:
    //                    true/false,
    //               type:
    //                    one of array, object, string, boolean, number, integer, ...
    fromDatabaseToOdkDataInterfaceElementType: function( jsonType, value ) {
        var that = this;

        if ( value === undefined || value === null ) {
            if ( jsonType.isNotNullable ) {
                throw new Error("unexpected null value for non-nullable field");
            }
            return null;
        }

        // Do not allow empty strings.
        // Strings are either NULL or non-zero-length.
        //
        if ( value === "" ) {
            throw new Error("unexpected empty (zero-length string) value for field");
        }

        if ( jsonType.type === 'array' ) {
            // the interface gets this back as a string
            return '' + value;
        } else if ( jsonType.type === 'object' ) {
            // the interface gets this back as a string
            return '' + value;
        } else if ( jsonType.type === 'boolean' ) {
            return (value === undefined || value === null) ? null : (Number(value) !== 0); // '0' is false.
        } else if ( jsonType.type === 'integer' ) {
            value = Number(value);
            if ( Math.round(value) != value ) {
                throw new Error("non-integer value for integer type");
            }
            return value;
        } else if ( jsonType.type === 'number' ) {
            return Number(value);
        } else if ( jsonType.type === 'string' ) {
            return '' + value;
        } else {
            odkCommon.log('W',"unrecognized JSON schema type: " + jsonType.type + " treated as string");
            return '' + value;
        }
    },
    //  type:  one of array, object, string, boolean, number, integer, ...
    fromKVStoreToElementType: function( type, value ) {
        var that = this;

        if ( value === undefined || value === null ) {
            return null;
        }

        // Do not allow empty strings.
        // Strings are either NULL or non-zero-length.
        //
        if ( value === "" ) {
            return null;
        }

        if ( type === 'array' ) {
            return '' + value;
        } else if ( type === 'object' ) {
            return '' + value;
        } else if ( type === 'boolean' ) {
            return (value === undefined || value === null) ? null :
                       ((typeof value === "number" || value instanceof Number) ? (Number(value) !== 0) : (value.toLowerCase() === 'true')); // '0' is false.
        } else if ( type === 'integer' ) {
            value = Number(value);
            if ( Math.round(value) != value ) {
                throw new Error("non-integer value for integer type");
            }
            return value;
        } else if ( type === 'number' ) {
            return Number(value);
        } else if ( type === 'string' ) {
            return '' + value;
        } else if ( type === 'rowpath' ) {
            return '' + value;
        } else if ( type === 'configpath' ) {
            return '' + value;
        } else if ( type === 'mimeType' ) {
            return '' + value;
        } else if ( type === 'date' ) {
            return '' + value;
        } else if ( type === 'dateTime' ) {
            return '' + value;
        } else if ( type === 'time' ) {
            return '' + value;
        } else if ( type === 'timeInterval' ) {
            return '' + value;
        } else {
            odkCommon.log('W',"unrecognized JSON schema type: " + type + " treated as string");
            return '' + value;
        }
    },
    toDatabaseFromOdkDataInterfaceElementType: function( jsonType, value ) {
        var that = this;

        if ( value === undefined || value === null ) {
            if ( jsonType.isNotNullable ) {
                throw new Error("unexpected null value for non-nullable field");
            }
            return null;
        }

        if ( jsonType.type === 'array' ) {
            // ensure that this came in as a String...
            if ( typeof value === 'string' || value instanceof String) {
                return value;
            } else {
                throw new Error("unexpected non-string for array value");
            }
            return value;
        } else if ( jsonType.type === 'object' ) {
            // ensure that this came in as a String...
            if ( typeof value === 'string' || value instanceof String) {
                return value;
            } else {
                throw new Error("unexpected non-string for object value");
            }
            return value;
        } else if ( jsonType.type === 'boolean' ) {
            // booleans are persisted as numeric 0/1
            return (value ? '1' : '0');
        } else if ( jsonType.type === 'integer' ) {
            value = '' + Math.round(value);
            return value;
        } else if ( jsonType.type === 'number' ) {
            return '' + value;
        } else if ( jsonType.type === 'string' ) {
            return '' + value;
        } else if ( jsonType.type === 'rowpath' ) {
            return '' + value;
        } else if ( jsonType.type === 'configpath' ) {
            return '' + value;
        } else {
            odkCommon.log('W',"unrecognized JSON schema type: " + jsonType.type + " treated as string");
            return '' + value;
        }
    },
    getElementPathPairFromChanges: function(changes, elementPath) {
        var path = elementPath.split('.');
        var i, j, value, pathChain;
        // work from most specific to least specific searching for a value match
        for (j = path.length-1 ; j >= 0 ; --j) {
            pathChain = '';
            for (i = j ; i >= 0 ; --i) {
                pathChain = '.' + path[i] + pathChain;
            }
            pathChain = pathChain.substring(1);
            if ( changes[pathChain] !== null && changes[pathChain] !== undefined ) {
                // found a definition...
                value = changes[pathChain];
                // now find the definition for this element
                // within the composite value
                for ( i = j+1 ; i <= path.length-1 ; ++i ) {
                    value = value[path[i]];
                    if ( value === undefined || value === null ) {
                        break;
                    }
                }
                return {value: value, elementPath: pathChain};
            }
            // try again with underscore substitution
            pathChain = '';
            for (i = j ; i >= 0 ; --i) {
                pathChain = '_' + path[i] + pathChain;
            }
            pathChain = pathChain.substring(1);
            if ( changes[pathChain] !== null && changes[pathChain] !== undefined ) {
                // found a definition...
                value = changes[pathChain];
                // now find the definition for this element
                // within the composite value
                for ( i = j+1 ; i <= path.length-1 ; ++i ) {
                    value = value[path[i]];
                    if ( value === undefined || value === null ) {
                        break;
                    }
                }
                return {value: value, elementPath: pathChain};
            }
        }
        return null;
    }
};
});

