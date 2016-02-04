'use strict';
/**
 * This file contains utilities that operate on the data as represented in the JSON
 * and as serialized into and out of the database or session storage.
 */
define(['XRegExp'],
function(XRegExp) {
verifyLoad('mockUtils',
    ['XRegExp'],
    [XRegExp]);
return {
    _reservedFieldNames: {
        /**
         * ODK processor reserved names
         *
         * For template substitution, we reserve 'calculates' so that
         * the {{#substitute}} directive can substitute values and
         * calculates into a display string.
         */
        calculates: true,
        /**
         * ODK Metadata reserved names
         */
        savepoint_timestamp: true,
        savepoint_type: true,
        form_id: true,
        locale: true,

        /**
         * SQLite keywords ( http://www.sqlite.org/lang_keywords.html )
         */
        abort: true,
        action: true,
        add: true,
        after: true,
        all: true,
        alter: true,
        analyze: true,
        and: true,
        as: true,
        asc: true,
        attach: true,
        autoincrement: true,
        before: true,
        begin: true,
        between: true,
        by: true,
        cascade: true,
        'case': true,
        cast: true,
        check: true,
        collate: true,
        column: true,
        commit: true,
        conflict: true,
        constraint: true,
        create: true,
        cross: true,
        current_date: true,
        current_time: true,
        current_timestamp: true,
        database: true,
        'default': true,
        deferrable: true,
        deferred: true,
        'delete': true,
        desc: true,
        detach: true,
        distinct: true,
        drop: true,
        each: true,
        'else': true,
        end: true,
        escape: true,
        except: true,
        exclusive: true,
        exists: true,
        explain: true,
        fail: true,
        'for': true,
        foreign: true,
        from: true,
        full: true,
        glob: true,
        group: true,
        having: true,
        'if': true,
        ignore: true,
        immediate: true,
        'in': true,
        index: true,
        indexed: true,
        initially: true,
        inner: true,
        insert: true,
        instead: true,
        intersect: true,
        into: true,
        is: true,
        isnull: true,
        join: true,
        key: true,
        left: true,
        like: true,
        limit: true,
        match: true,
        natural: true,
        no: true,
        not: true,
        notnull: true,
        'null': true,
        of: true,
        offset: true,
        on: true,
        or: true,
        order: true,
        outer: true,
        plan: true,
        pragma: true,
        primary: true,
        query: true,
        raise: true,
        references: true,
        regexp: true,
        reindex: true,
        release: true,
        rename: true,
        replace: true,
        restrict: true,
        right: true,
        rollback: true,
        row: true,
        savepoint: true,
        select: true,
        set: true,
        table: true,
        temp: true,
        temporary: true,
        then: true,
        to: true,
        transaction: true,
        trigger: true,
        union: true,
        unique: true,
        update: true,
        using: true,
        vacuum: true,
        values: true,
        view: true,
        virtual: true,
        when: true,
        where: true
    },
    _pattern_valid_user_defined_name: null,
    // Unicode extensions to standard RegExp...
    _getValidUserDefinedNamePattern: function() {
        if ( !this._pattern_valid_user_defined_name ) {
            this._pattern_valid_user_defined_name =
                XRegExp('^\\p{L}\\p{M}*(\\p{L}\\p{M}*|\\p{Nd}|_)*$', 'A');
        }
        return this._pattern_valid_user_defined_name;
    },
    _isValidElementPath: function(path) {
        var that = this;
        if ( path === null || path === undefined ) {
            return false;
        }
        if ( path.length > 62 ) {
            return false;
        }
        var parts = path.split('.');
        var i;
        for ( i = 0 ; i < parts.length ; ++i ) {
            var name = parts[i];
            if ( !that._getValidUserDefinedNamePattern().test(name) ) {
                return false;
            }
            var lowercase = name.toLowerCase();
            if (lowercase in that._reservedFieldNames) {
                return false;
            }
        }
        return true;
    },
    markUnitOfRetention: function(dataTableModel) {
        // for all arrays, mark all descendants of the array as not-retained
        // because they are all folded up into the json representation of the array
        var startKey;
        var jsonDefn;
        var elementType;
        var key;
        var jsonSubDefn;

        for ( startKey in dataTableModel ) {
            jsonDefn = dataTableModel[startKey];
            if ( jsonDefn.notUnitOfRetention ) {
                // this has already been processed
                continue;
            }
            elementType = (jsonDefn.elementType === undefined || jsonDefn.elementType === null ? jsonDefn.type : jsonDefn.elementType);
            if ( elementType === "array" ) {
                var descendantsOfArray = ((jsonDefn.listChildElementKeys === undefined || jsonDefn.listChildElementKeys === null) ? [] : jsonDefn.listChildElementKeys);
                var scratchArray = [];
                while ( descendantsOfArray.length !== 0 ) {
                    var i;
                    for ( i = 0 ; i < descendantsOfArray.length ; ++i ) {
                        key = descendantsOfArray[i];
                        jsonSubDefn = dataTableModel[key];
                        if ( jsonSubDefn !== null && jsonSubDefn !== undefined ) {
                            if ( jsonSubDefn.notUnitOfRetention ) {
                                // this has already been processed
                                continue;
                            }
                            jsonSubDefn.notUnitOfRetention = true;
                            var listChildren = ((jsonSubDefn.listChildElementKeys === undefined || jsonSubDefn.listChildElementKeys === null) ? [] : jsonSubDefn.listChildElementKeys);
                            scratchArray = scratchArray.concat(listChildren);
                        }
                    }
                    descendantsOfArray = scratchArray;
                }
            }
        }
        // and mark any non-arrays with multiple fields as not retained
        for ( startKey in dataTableModel ) {
            jsonDefn = dataTableModel[startKey];
            if ( jsonDefn.notUnitOfRetention ) {
                // this has already been processed
                continue;
            }
            elementType = (jsonDefn.elementType === undefined || jsonDefn.elementType === null ? jsonDefn.type : jsonDefn.elementType);
            if ( elementType !== "array" ) {
                if (jsonDefn.listChildElementKeys !== undefined &&
                    jsonDefn.listChildElementKeys !== null &&
                    jsonDefn.listChildElementKeys.length !== 0 ) {
                    jsonDefn.notUnitOfRetention = true;
                }
            }
        }
    },
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
    _fromDatabaseToOdkDataInterfaceElementType: function( jsonType, value ) {
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
            value = JSON.parse(value);
            // TODO: ensure object spec conformance on read?
            return value;
        } else if ( jsonType.type === 'object' ) {
            if ( jsonType.elementType === 'date' ||
                 jsonType.elementType === 'dateTime' ) {
                // DO NOTHING -- this conversion occurs on the odkData client side.
                // database stores a nanosecond-extended iso8601-style UTC date yyyy-mm-ddTHH:MM:SS.sssssssss
                return value;
            } else if ( jsonType.elementType === 'time' ) {
                // DO NOTHING -- this conversion occurs on the odkData client side.
                // database stores a nanosecond-extended iso8601-style UTC time HH:MM:SS.sssssssss
                return value;
            } else {
                value = JSON.parse(value);
                return value;
            }
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
        } else if ( jsonType.type === 'rowpath' ) {
            return '' + value;
        } else if ( jsonType.type === 'configpath' ) {
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
                       ((typeof value === 'number') ? (Number(value) !== 0) : (value.toLowerCase() === 'true')); // '0' is false.
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
        } else {
            odkCommon.log('W',"unrecognized JSON schema type: " + type + " treated as string");
            return '' + value;
        }
    },
    toDatabaseFromOdkDataInterfaceElementType: function( jsonType, value ) {
        var that = this;
        var refined;
        var itemType;
        var item;
        var itemValue;

        if ( value === undefined || value === null ) {
            if ( jsonType.isNotNullable ) {
                throw new Error("unexpected null value for non-nullable field");
            }
            return null;
        }

        if ( jsonType.type === 'array' ) {
            // ensure that it is an array of the appropriate type...
            if ( value instanceof Array ) {
                refined = [];
                itemType = jsonType.items;
                if (itemType === undefined || itemType === null ) {
                    value = JSON.stringify(value);
                } else {
                    for ( item = 0 ; item < value.length ; ++item ) {
                        itemValue = that.toDatabaseFromOdkDataInterfaceElementType( itemType, value[item] );
                        refined.push(itemValue);
                    }
                    value = JSON.stringify(refined);
                }
            } else {
                throw new Error("unexpected non-array value");
            }
            return value;
        } else if ( jsonType.type === 'object' ) {
            if ( jsonType.elementType === 'dateTime' ||
                 jsonType.elementType === 'date' ) {
                // these are string values (they should have been converted
                // to a nanosecond-extended iso8601-style UTC date yyyy-mm-ddTHH:MM:SS.sssssssss
                // prior to the call to odkData...
                return ''+value;
            } else if ( jsonType.elementType === 'time' ) {
                // these are string values (they should have been converted
                // to a nanosecond-extended iso8601-style UTC time HH:MM:SS.sssssssss
                // with the time-of-day stripped off and drop the rest...
                return ''+value;
            } else if ( !jsonType.properties ) {
                // this is an opaque BLOB w.r.t. database layer
                return JSON.stringify(value);
            } else {
                // otherwise, enforce spec conformance...
                // Only values in the properties list, and those
                // must match the type definitions recursively.
                refined = {};
                for ( item in jsonType.properties ) {
                    if ( value[item] !== null && value[item] !== undefined ) {
                        itemType = jsonType.properties[item];
                        itemValue = that.toDatabaseFromOdkDataInterfaceElementType(itemType, value[item]);
                        refined[item] = itemValue;
                    }
                }
                value = JSON.stringify(refined);
                return value;
            }
        } else if ( jsonType.type === 'boolean' ) {
            return (value ? '1' : '0'); // make it a boolean
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
    },
    _setSessionVariableFlag: function( dbKeyMap, listChildElementKeys) {
        var that = this;
        var i;
        if ( listChildElementKeys !== null && listChildElementKeys !== undefined ) {
            for ( i = 0 ; i < listChildElementKeys.length ; ++i ) {
                var f = listChildElementKeys[i];
                var jsonType = dbKeyMap[f];
                jsonType.isSessionVariable = true;
                if ( jsonType.type === 'array' ) {
                    that._setSessionVariableFlag(dbKeyMap, jsonType.listChildElementKeys);
                } else if ( jsonType.type === 'object' ) {
                    that._setSessionVariableFlag(dbKeyMap, jsonType.listChildElementKeys);
                }
            }
        }
    },
    flattenElementPath: function( dbKeyMap, elementPathPrefix, elementName, elementKeyPrefix, jsonType ) {
        var that = this;
        var elementKey;
		var e;
		var f;

        // remember the element name...
        jsonType.elementName = elementName;
        // and the set is 'data' because it comes from the data model...
        jsonType.elementSet = 'data';

        // update element path prefix for recursive elements
        elementPathPrefix = ( elementPathPrefix === undefined || elementPathPrefix === null ) ? elementName : (elementPathPrefix + '.' + elementName);
        // and our own element path is exactly just this prefix
        jsonType.elementPath = elementPathPrefix;

        // use the user's elementKey if specified
        elementKey = jsonType.elementKey;

        if ( elementKey === undefined || elementKey === null ) {
            throw new Error("elementKey is not defined for '" + jsonType.elementPath + "'.");
        }

        // simple error tests...
        // throw an error if the elementkey is longer than 62 characters
        // or if it is already being used and not by myself...
        if ( elementKey.length > 62 ) {
            throw new Error("supplied elementKey is longer than 62 characters");
        }
        if ( dbKeyMap[elementKey] !== undefined && dbKeyMap[elementKey] !== null && dbKeyMap[elementKey] != jsonType ) {
            throw new Error("supplied elementKey is already used (autogenerated?) for another model element");
        }
        if ( elementKey.charAt(0) === '_' ) {
            throw new Error("supplied elementKey starts with underscore");
        }

        // remember the elementKey we have chosen...
        dbKeyMap[elementKey] = jsonType;

        // handle the recursive structures...
        if ( jsonType.type === 'array' ) {
            // explode with subordinate elements
            f = that.flattenElementPath( dbKeyMap, elementPathPrefix, 'items', elementKey, jsonType.items );
            jsonType.listChildElementKeys = [ f.elementKey ];
        } else if ( jsonType.type === 'object' ) {
            // object...
            var listChildElementKeys = [];
            for ( e in jsonType.properties ) {
                f = that.flattenElementPath( dbKeyMap, elementPathPrefix, e, elementKey, jsonType.properties[e] );
                listChildElementKeys.push(f.elementKey);
            }
            jsonType.listChildElementKeys = listChildElementKeys;
        }

        if ( jsonType.isSessionVariable && (jsonType.listChildElementKeys !== null) && (jsonType.listChildElementKeys !== undefined)) {
            // we have some sort of structure that is a sessionVariable
            // Set the isSessionVariable tags on all its nested elements.
            that._setSessionVariableFlag(dbKeyMap, jsonType.listChildElementKeys);
        }
        return jsonType;
    },
    /**
     * Converts a Date to nanos. If no date supplied, uses the current time.
     */
    convertDateTimeToNanos: function(dateTime) {
        var that = this;
        // convert to a nanosecond-extended iso8601-style UTC date yyyy-mm-ddTHH:MM:SS.sssssssss
        // yyyy-mm-ddTHH:MM:SS.sssssssss
        // 01234567890123456789012345678
        if ( dateTime === undefined || dateTime === null ) {
            dateTime = new Date();
        }
        var yyyy,mm,dd,hh,min,sec,msec;
        yyyy = dateTime.getUTCFullYear();
        mm = dateTime.getUTCMonth() + 1; // months are 0-11
        dd = dateTime.getUTCDate();
        hh = dateTime.getUTCHours();
        min = dateTime.getUTCMinutes();
        sec = dateTime.getUTCSeconds();
        msec = dateTime.getUTCMilliseconds();
        var value;
        value = that.padWithLeadingZeros(yyyy,4) + '-' +
                that.padWithLeadingZeros(mm,2) + '-' +
                that.padWithLeadingZeros(dd,2) + 'T' +
                that.padWithLeadingZeros(hh,2) + ':' +
                that.padWithLeadingZeros(min,2) + ':' +
                that.padWithLeadingZeros(sec,2) + '.' +
                that.padWithLeadingZeros(msec,3) + '000000';
        return value;
    },
    padWithLeadingZeros: function( value, places ) {
        var digits = [];
        var d, i, s;
        var sign = (value >= 0);
        value = Math.abs(value);
        while ( value !== 0 ) {
            d = (value % 10);
            digits.push(d);
            value = Math.floor(value/10);
        }
        while ( digits.length < places ) {
            digits.push(0);
        }
        digits.reverse();
        s = '';
        for ( i = 0 ; i < digits.length ; ++i ) {
            d = digits[i];
            s += d;
        }
        return (sign ? '' : '-') + s;
    }

};
});

