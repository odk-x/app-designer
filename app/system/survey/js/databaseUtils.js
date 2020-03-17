/**
 * This file contains utilities that operate on the data as represented in the JSON
 * and as serialized into and out of the database or session storage.
 */
define(['XRegExp','jquery'], function(XRegExp,$) {
/* globals odkCommon */
'use strict';
verifyLoad('databaseUtils',
    ['XRegExp','jquery'],
    [ XRegExp,  $]);
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
    // Unicode extensions to standard RegExp...
    _pattern_valid_user_defined_name:
        XRegExp('^\\p{L}\\p{M}*(\\p{L}\\p{M}*|\\p{Nd}|_)*$', 'A'),
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
            if ( !that._pattern_valid_user_defined_name.test(name) ) {
                return false;
            }
            var lowercase = name.toLowerCase();
            if (lowercase in that._reservedFieldNames) {
                return false;
            }
        }
        return true;
    },
    isUnitOfRetention: function(jsonDefn) {
        var that = this;
        if (jsonDefn.notUnitOfRetention) {
            return false;
        }
        return true;
    },
    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////
    //   Conversion to/from session variable storage
    /**
     * Storage format for persisting data in a session variable
     * is a cleaned-up JSON serialization of the data.
     *
     * The primary cleaned-up conversion is that of JS Date()
     * objects used for date, datetime and time data types
     * These are converted into a type-appropriate string.
     *
     * A secondary cleaned-up conversion is the clean-up of
     * boolean, integer and numeric types, ensuring that those
     * values are represented as their primitive types.
     *
     * Arrays and objects are recursively traversed to ensure
     * that all needed object conversions are performed.
     *
     * After all conversions are performed, the result is
     * JSON.stringify()'d and returned.
     *
     * Thus, on de-serialization, if the incoming value is
     * null, we return undefined, as that is not a valid
     * JSON.stringify().
     *
     * De-serialization operates in reverse -- first calling
     * JSON.parse() then traversing the data structure and
     * restoring the Date() objects within it. The boolean,
     * integer and numeric fields are assumed to already be
     * in their primitive data types (by virtue of the
     * original serialization action).
     */
    /**
     * Serialize to ODK Survey session variable string from ODK Survey representation value
     */
    toSerializationFromElementType: function( jsonType, value, topLevel ) {
        var that = this;
        var refined;
        var itemType;
        var item;
        var itemValue;

        if ( topLevel ) {
            if ( value === undefined ) {
                return null;
            }
            // otherwise, convert it as if it were nested...
            value = that.toSerializationFromElementType(jsonType, value, false);
            // and stringify it...
            return JSON.stringify(value);
        }

        if ( value === undefined || value === null ) {
            if ( jsonType.isNotNullable ) {
                throw new Error("unexpected null value for non-nullable field");
            }
            return null;
        }

        if ( jsonType.type === 'array' ) {
            // ensure that it is an array of the appropriate type...
            if ( $.isArray(value) ) {
                refined = [];
                itemType = jsonType.items;
                if (itemType === undefined || itemType === null ) {
                    // leave as-is -- assume user did the correct conversions
                    return value;
                } else {
                    for ( item = 0 ; item < value.length ; ++item ) {
                        itemValue = that.toSerializationFromElementType( itemType, value[item], false );
                        refined.push(itemValue);
                    }
                    return refined;
                }
            } else {
                throw new Error("unexpected non-array value");
            }
        } else if ( jsonType.type === 'object' ) {
            if ( !jsonType.properties ) {
                // this is an opaque BLOB w.r.t. database layer
                return value;
            } else {
                // otherwise, enforce spec conformance...
                // Only values in the properties list, and those
                // must match the type definitions recursively.
                refined = {};
                for ( item in jsonType.properties ) {
                    if ( value[item] !== null && value[item] !== undefined ) {
                        itemType = jsonType.properties[item];
                        itemValue = that.toSerializationFromElementType( itemType, value[item], false );
                        refined[item] = itemValue;
                    }
                }
                return refined;
            }
        } else if ( jsonType.type === 'boolean' ) {
            return value ? true : false; // make it a real boolean
        } else if ( jsonType.type === 'integer' ) {
            return Math.round(value);
        } else if ( jsonType.type === 'number' ) {
            return Number(value);
        } else if ( jsonType.type === 'string' ) {
            if ( jsonType.elementType === 'dateTime' ||
                 jsonType.elementType === 'date' ) {
                if ( value instanceof Date ) {
                    // convert to a nanosecond-extended iso8601-style UTC date yyyy-mm-ddTHH:MM:SS.sssssssss
                    return odkCommon.toOdkTimeStampFromDate(value);
                }
            } else if ( jsonType.elementType === 'time' ) {
                if ( value instanceof Date ) {
                    // extract time of the local day.
                    // convert to a nanosecond-extended iso8601-style LOCAL TIME ZONE time HH:MM:SS.sssssssss
                    return odkCommon.toOdkTimeFromDate(value);
                }
            }
            return '' + value;
        } else {
            odkCommon.log('W',"unrecognized JSON schema type: " + jsonType.type + " treated as string");
            return value;
        }
    },
    /**
     * Serialize to ODK Survey representation value from ODK Survey session variable string
     */
    fromSerializationToElementType: function( jsonType, value, topLevel ) {
        var that = this;
        var refined;
        var itemType;
        var item;
        var itemValue;

        if ( topLevel ) {
            if ( value === undefined || value === null ) {
                return undefined;
            }

            // Do not allow empty strings.
            // Strings are either NULL or non-zero-length.
            //
            if ( value === "" ) {
                throw new Error("unexpected empty (zero-length string) value for field");
            }

            // de-stringify the value...
            value = JSON.parse(value);
        }

        if ( value === undefined || value === null ) {
            if ( jsonType.isNotNullable ) {
                throw new Error("unexpected null value for non-nullable field");
            }
            return null;
        }

        if ( value === "" ) {
            throw new Error("unexpected empty (zero-length string) value for field");
        }

        if ( jsonType.type === 'array' ) {
            // TODO: ensure object spec conformance on read?
            if ( $.isArray(value) ) {
                refined = [];
                itemType = jsonType.items;
                if (itemType === undefined || itemType === null ) {
                    return value;
                } else {
                    for ( item = 0 ; item < value.length ; ++item ) {
                        itemValue = that.fromSerializationToElementType( itemType, value[item], false );
                        refined.push(itemValue);
                    }
                    return refined;
                }
            } else {
                throw new Error("unexpected non-array value");
            }
        } else if ( jsonType.type === 'object' ) {
            if ( jsonType.properties ) {
                // otherwise, enforce spec conformance...
                // Only values in the properties list, and those
                // must match the type definitions recursively.
                refined = {};
                for ( item in jsonType.properties ) {
                    if ( value[item] !== null && value[item] !== undefined ) {
                        itemType = jsonType.properties[item];
                        itemValue = that.fromSerializationToElementType( itemType, value[item], false );
                        refined[item] = itemValue;
                    }
                }
                return refined;
            } else {
                // opaque
                return value;
            }
        } else if ( jsonType.type === 'boolean' ) {
            return value;
        } else if ( jsonType.type === 'integer' ) {
            return value;
        } else if ( jsonType.type === 'number' ) {
            return value;
        } else if ( jsonType.type === 'string' ) {
            if ( jsonType.elementType === 'date' ||
                 jsonType.elementType === 'dateTime' ) {
                // convert from a nanosecond-extended iso8601-style UTC date yyyy-mm-ddTHH:MM:SS.sssssssss
                // this does not preserve the nanosecond field...
                return odkCommon.toDateFromOdkTimeStamp(value);
            } else if ( jsonType.elementType === 'time' ) {
                // retrieve hh:mm:ss.sss from the local day.
                // convert from a nanosecond-extended iso8601-style LOCAL TIME ZONE time HH:MM:SS.sssssssss
                return odkCommon.toDateFromOdkTime(new Date(), value);
            } else {
                return value;
            }
        } else {
            odkCommon.log('W',"unrecognized JSON schema type: " + jsonType.type + " treated as string");
            return value;
        }
    },
    //               end conversion to/from session variable storage
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////
    //   Conversion to/from odkData API representation
    /**
     * The odkData API representation is a clean-up of our
     * ODK Survey data representation. The primary clean-up
     * is the conversion of the complex hierarchical data
     * model into a set of disjoint unit-of-retention
     * storage values. That is done outside of these routines.
     *
     * These routines then process the storage value prior
     * to passing it into the odkData API.
     *
     * If the column does not allow null values, and a null is
     * passed in, an Error is thrown (this is a bad situation).
     *
     * The primary cleaned-up conversion is the conversion of JS Date()
     * objects used for date, datetime and time data types
     * These are converted into a type-appropriate formatted strings.
     * Date() does not have a JSON serialization, so this conversion
     * needs to be applied recursively throughout the value (when the
     * value is an array or object).
     *
     * A secondary cleaned-up conversion is the clean-up of
     * boolean, integer and numeric types, ensuring that those
     * values are represented as their primitive types. e.g.,
     * that a boolean field that holds a numeric 1 has that value
     * properly converted to the Javascript true value (rather
     * than being passed through as a numeric 1). Similarly, integers
     * are forced to integer values, numeric values are converted
     * to Number type, and string values are forced to be strings.
     *
     * Arrays and objects are recursively traversed to ensure
     * that all needed object conversions are performed.
     *
     * Because the traversal is driven by the jsonType
     * information, this clean-up enforces data types prior to
     * invoking the odkData API.
     *
     * After all these clean-up conversions are performed:
     *
     * If the value is null or undefined:
     *   return null.
     *
     * If the data value is an object or array, then:
     *   return the JSON.stringify() of that data value.
     *
     * Otherwise:
     *   return the value.
     *
     * De-serialization also relies on the data type of the data column
     * to determine what action to take. When de-serializing, the
     * date, dateTime and time datatypes are converted into Date() objects.
     *
     * Note that time is represented as local time, and date/dateTime is UTC.
     */
    /**
     * Serialize from odkData API representation to ODK Survey representation value
     */
    fromOdkDataInterfaceToElementType: function( jsonType, value, topLevel ) {
        var that = this;
        var refined;
        var itemType;
        var item;
        var itemValue;

        if ( topLevel ) {

            if ( value === undefined || value === null ) {
                if ( jsonType.isNotNullable ) {
                    throw new Error("unexpected null value for non-nullable field");
                }
                return null;
            }

            if ( jsonType.type === 'array' || jsonType.type === 'object' ) {
                // parse it if it is a non-null array or object...
                value = JSON.parse(value);
            }

            // convert it as if it were nested...
            value = that.fromOdkDataInterfaceToElementType(jsonType, value, false);

            return value;
        }


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
            // TODO: ensure object spec conformance on read?
            if ( $.isArray(value) ) {
                refined = [];
                itemType = jsonType.items;
                if (itemType === undefined || itemType === null ) {
                    return value;
                } else {
                    for ( item = 0 ; item < value.length ; ++item ) {
                        itemValue = that.fromOdkDataInterfaceToElementType( itemType, value[item], false );
                        refined.push(itemValue);
                    }
                    return refined;
                }
            } else {
                throw new Error("unexpected non-array value");
            }
        } else if ( jsonType.type === 'object' ) {
            if ( jsonType.properties ) {
                // otherwise, enforce spec conformance...
                // Only values in the properties list, and those
                // must match the type definitions recursively.
                refined = {};
                for ( item in jsonType.properties ) {
                    if ( value[item] !== null && value[item] !== undefined ) {
                        itemType = jsonType.properties[item];
                        itemValue = that.fromOdkDataInterfaceToElementType(itemType, value[item], false);
                        refined[item] = itemValue;
                    }
                }
                return refined;
            } else {
                // opaque
                return value;
            }
        } else if ( jsonType.type === 'boolean' ) {
            return value; // should already be a boolean
        } else if ( jsonType.type === 'integer' ) {
            value = Number(value);
            if ( Math.round(value) != value ) {
                throw new Error("non-integer value for integer type");
            }
            return value;
        } else if ( jsonType.type === 'number' ) {
            return Number(value);
        } else if ( jsonType.type === 'string' ) {
            if ( jsonType.elementType === 'date_no_time' ) {
                return moment(value);
            } else if ( jsonType.elementType === 'date' ||
                 jsonType.elementType === 'dateTime' ) {
                // convert from a nanosecond-extended iso8601-style UTC date yyyy-mm-ddTHH:MM:SS.sssssssss
                // this does not preserve the nanosecond field...
                return odkCommon.toDateFromOdkTimeStamp(value);
            } else if ( jsonType.elementType === 'time' ) {
                // convert from a nanosecond-extended iso8601-style LOCAL TIME ZONE time HH:MM:SS.sssssssss
                // this does not preserve the nanosecond field...
                return odkCommon.toDateFromOdkTime(new Date(), value);
            } else {
                return value;
            }
        } else {
            odkCommon.log('W',"unrecognized JSON schema type: " + jsonType.type + " treated as string");
            return value;
        }
    },
    toOdkDataInterfaceFromElementType: function( jsonType, value, topLevel ) {
        var that = this;
        var refined;
        var itemType;
        var item;
        var itemValue;

        if ( topLevel ) {
            // convert it as if it were nested...
            value = that.toOdkDataInterfaceFromElementType(jsonType, value, false);

            // null is always null...
            if ( value === null ) {
                return value;
            }

            if ( jsonType.type === 'array' || jsonType.type === 'object' ) {
                // and stringify it if it is a non-null array or object...
                return JSON.stringify(value);
            } else {
                return value;
            }
        }

        if ( value === undefined || value === null ) {
            if ( jsonType.isNotNullable ) {
                throw new Error("unexpected null value for non-nullable field");
            }
            return null;
        }

        if ( jsonType.type === 'array' ) {
            // ensure that it is an array of the appropriate type...
            if ( $.isArray(value) ) {
                refined = [];
                itemType = jsonType.items;
                if (itemType === undefined || itemType === null ) {
                    // unspecified array.
                    // This might screw up embedded datetimes, etc.
                    return value;
                } else {
                    // make sure the items are converted
                    for ( item = 0 ; item < value.length ; ++item ) {
                        itemValue = that.toOdkDataInterfaceFromElementType( itemType, value[item], false );
                        refined.push(itemValue);
                    }
                    return refined;
                }
            } else {
                throw new Error("unexpected non-array value");
            }
        } else if ( jsonType.type === 'object' ) {
            if ( !jsonType.properties ) {
                // this is an opaque BLOB w.r.t. database layer
                // leave it as-is.
                return value;
            } else {
                // otherwise, enforce spec conformance...
                // Only values in the properties list, and those
                // must match the type definitions recursively.
                refined = {};
                for ( item in jsonType.properties ) {
                    if ( value[item] !== null && value[item] !== undefined ) {
                        itemType = jsonType.properties[item];
                        itemValue = that.toOdkDataInterfaceFromElementType( itemType, value[item], false );
                        refined[item] = itemValue;
                    }
                }
                return refined;
            }
        } else if ( jsonType.type === 'boolean' ) {
            return value ? true : false; // force it to boolean
        } else if ( jsonType.type === 'integer' ) {
            return Math.round(value);
        } else if ( jsonType.type === 'number' ) {
            return value;
        } else if ( jsonType.type === 'string' ) {
            if ( jsonType.elementType === 'dateTime' ||
                 jsonType.elementType === 'date' ) {
                // already a string? -- assume it is nanosecond-extended iso8601-style UTC date yyyy-mm-ddTHH:MM:SS.sssssssss
                if ( value instanceof Date ) {
                    // convert to a nanosecond-extended iso8601-style UTC date yyyy-mm-ddTHH:MM:SS.sssssssss
                    return odkCommon.toOdkTimeStampFromDate(value);
                }
            } else if ( jsonType.elementType === 'time' ) {
                // already a string? -- assume it is nanosecond-extended iso8601-style UTC time HH:MM:SS.sssssssss
                if ( value instanceof Date ) {
                    // convert to a nanosecond-extended iso8601-style UTC time HH:MM:SS.sssssssss
                    return odkCommon.toOdkTimeFromDate(value);
                }
            }
            return '' + value;
        } else {
            odkCommon.log('W',"unrecognized JSON schema type: " + jsonType.type + " treated as string");
            return '' + value;
        }
    },
    //               end conversion to/from odkData API representation
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////
    //   Conversion to/from odkData API key-value-store representation
    /**
     * This takes the '_type' column of the KVS entry and the '_value' column
     *
     * It produces the converted value for the column.
     *
     * type:  one of array, object, string, boolean, number, integer, ...
     *
     * The incoming value is null or a string.
     *
     * The conversion is parsing the strings. The only tricky one is
     * for boolean. That tests for either 'true' or a non-zero number
     * as true.
     */
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
            if ( value.toLowerCase() === 'true' ) {
                return true;
            }
            value = Number(value);
            return ( value !== 0 && !value.isNaN() );
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
            odkCommon.log('W',"fromKVStoreToElementType: unrecognized JSON schema type: " + type + " treated as string (typo or user-defined type?)");
            return '' + value;
        }
    },
    //               end conversion to/from odkData API key-value-store representation
    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////


    _reconstructElementPathValueUpdate: function(elementPath, jsonType, value, topLevelObject) {
        var that = this;
        var path = elementPath.split('.');
        var e = topLevelObject;
        var term;
        var j;
        for (j = 0 ; j < path.length-1 ; ++j) {
            term = path[j];
            if ( term === undefined || term === null || term === "" ) {
                throw new Error("unexpected empty string in dot-separated variable name");
            }
            if ( e[term] === undefined || e[term] === null ) {
                e[term] = {};
            }
            e = e[term];
        }
        term = path[path.length-1];
        if ( term === undefined || term === null || term === "" ) {
            throw new Error("unexpected empty string in dot-separated variable name");
        }
        e[term] = value;
    },
    reconstructModelDataFromElementPathValueUpdates: function(model, updates) {
        var that = this;
        var dbKey;
        var elementPath;
        var elementPathValue;
        var de;
        for (dbKey in updates) {
			if ( updates.hasOwnProperty(dbKey) ) {
				elementPathValue = updates[dbKey];
				de = model.dataTableModel[dbKey];
				if (that.isUnitOfRetention(de)) {
					elementPath = de.elementPath || elementPathValue.elementPath;
					if ( de.elementSet === 'instanceMetadata' ) {
						that._reconstructElementPathValueUpdate(elementPath || dbKey, de, elementPathValue.value, model.instanceMetadata );
					} else {
						that._reconstructElementPathValueUpdate(elementPath, de, elementPathValue.value, model.data );
					}
				}
			}
        }
    },

	// similar to above, but do not make the change, just check to see whether a change would be made.
    _reconstructElementPathDetectValueRequiringUpdate: function(elementPath, jsonType, value, topLevelObject) {
        var that = this;
        var path = elementPath.split('.');
        var e = topLevelObject;
        var term;
        var j;
        for (j = 0 ; j < path.length-1 ; ++j) {
            term = path[j];
            if ( term === undefined || term === null || term === "" ) {
                throw new Error("unexpected empty string in dot-separated variable name");
            }
            if ( e[term] === undefined || e[term] === null ) {
                e[term] = {};
            }
            e = e[term];
        }
        term = path[path.length-1];
        if ( term === undefined || term === null || term === "" ) {
            throw new Error("unexpected empty string in dot-separated variable name");
        }
		if ( e[term] === value ) {
			return false;
		} else {
			return true;
		}
    },
    _reconstructModelDataFromElementPathDetectActualValueRequiringUpdate: function(model, dbKey, elementPathValue) {
        var that = this;
        var elementPath;
        var de;
		var hasUpdates = false;
		de = model.dataTableModel[dbKey];
		if (that.isUnitOfRetention(de)) {
			elementPath = de.elementPath || elementPathValue.elementPath;
			if ( de.elementSet === 'instanceMetadata' ) {
				if ( that._reconstructElementPathDetectValueRequiringUpdate(elementPath || dbKey, de, elementPathValue.value, model.instanceMetadata ) ) {
					hasUpdates = true;
				}
			} else {
				if ( that._reconstructElementPathDetectValueRequiringUpdate(elementPath, de, elementPathValue.value, model.data ) ) {
					hasUpdates = true;
				}
			}
		}
		return hasUpdates;
    },
    _getElementPathPairFromKvMap: function(kvMap, elementPath) {
        var that = this;
        var path = elementPath.split('.');
        var i, j, term, value, pathChain;
        var e, f;
        // work from most specific to least specific searching for a value match
        for (j = path.length-1 ; j >= 0 ; --j) {
            pathChain = '';
            for (i = j ; i >= 0 ; --i) {
                pathChain = '.' + path[i] + pathChain;
            }
            pathChain = pathChain.substring(1);
            if ( kvMap[pathChain] !== null && kvMap[pathChain] !== undefined ) {
                // found a definition...
                term = kvMap[pathChain];
                value = term.value;
                // now find the definition for this element
                // within the composite value
                for ( i = j+1 ; i <= path.length-1 ; ++i ) {
                    value = value[path[i]];
                    if ( value === undefined || value === null ) {
                        break;
                    }
                }
                e = {};
                for ( f in term ) {
                    if ( f !== "value" ) {
                        e[f] = term[f];
                    }
                }
                e.value = value;
                return {element: e, elementPath: pathChain};
            }
            // try again with underscore substitution
            pathChain = '';
            for (i = j ; i >= 0 ; --i) {
                pathChain = '_' + path[i] + pathChain;
            }
            pathChain = pathChain.substring(1);
            if ( kvMap[pathChain] !== null && kvMap[pathChain] !== undefined ) {
                // found a definition...
                term = kvMap[pathChain];
                value = term.value;
                // now find the definition for this element
                // within the composite value
                for ( i = j+1 ; i <= path.length-1 ; ++i ) {
                    value = value[path[i]];
                    if ( value === undefined || value === null ) {
                        break;
                    }
                }
                e = {};
                for ( f in term ) {
                    if ( f !== "value" ) {
                        e[f] = term[f];
                    }
                }
                e.value = value;
                return {element: e, elementPath: pathChain};
            }
        }
        return null;
    },
    getElementPathValue:function(data,pathName) {
        var that = this;
        var path = pathName.split('.');
        var v = data;
        for ( var i = 0 ; i < path.length ; ++i ) {
            v = v[path[i]];
            if ( v === undefined || v === null ) {
                return null;
            }
        }
        return v;
    },
    convertSelectionString: function(linkedModel, selection) {
        // must be space separated. Must be persisted primitive elementName -- Cannot be elementPath
        var that = this;
        if ( selection === null || selection === undefined || selection.length === 0 ) {
            return null;
        }
        var parts = selection.split(' ');
        var remapped = '';
        var i;

        for ( i = 0 ; i < parts.length ; ++i ) {
            var e = parts[i];
            if ( e.length === 0 || !that._isValidElementPath(e) ) {
                remapped = remapped + ' ' + e;
            } else {
                // map e back to elementKey
                var found = false;
                var f;
                for (f in linkedModel.dataTableModel) {
					if ( linkedModel.dataTableModel.hasOwnProperty(f) ) {
						var defElement = linkedModel.dataTableModel[f];
						var elementPath = defElement.elementPath;
						if ( elementPath === null || elementPath === undefined ) {
							elementPath = f;
						}
						if ( elementPath === e ) {
							remapped = remapped + ' "' + f + '"';
							found = true;
							break;
						}
					}
                }
                if ( found === false ) {
                    alert('databaseUtils.convertSelectionString: unrecognized elementPath: ' + e );
                    odkCommon.log('E',"databaseUtils.convertSelectionString: unrecognized elementPath: " + e);
                    return null;
                }
            }
        }
        return remapped;
    },
    convertOrderByString: function(linkedModel, order_by) {
        // must be space separated. Must be persisted primitive elementName -- Cannot be elementPath
        var that = this;
        if ( order_by === null || order_by === undefined || order_by.length === 0 ) {
            return null;
        }
        var parts = order_by.split(' ');
        var remapped = '';
        var i;
        for ( i = 0 ; i < parts.length ; ++i ) {
            var e = parts[i];
            if ( e.length === 0 || !that._isValidElementPath(e) ) {
                remapped = remapped + ' ' + e;
            } else {
                // map e back to elementKey
                var found = false;
                var f;
                for (f in linkedModel.dataTableModel) {
					if ( linkedModel.dataTableModel.hasOwnProperty(f) ) {
						var defElement = linkedModel.dataTableModel[f];
						var elementPath = defElement.elementPath;
						if ( elementPath === null || elementPath === undefined ) {
							elementPath = f;
						}
						if ( elementPath === e ) {
							remapped = remapped + ' "' + f + '"';
							found = true;
							break;
						}
					}
                }
                if ( found === false ) {
                    alert('databaseUtils.convertOrderByString: unrecognized elementPath: ' + e );
                    odkCommon.log('E',"databaseUtils.convertOrderByString: unrecognized elementPath: " + e );
                    return null;
                }
            }
        }
        return remapped;
    },
    /**
     * take a kvMap and either immediately effect the change if it is to a
     * session variable or add it to the set of accumulated changes to be applied
     * when the data record is next updated.
     *
     * This does not update the metadata fields of the record.
     *
     * kvMap : { 'fieldName' : { value: "foo name", isInstanceMetadata: false } ...}
     *
     * The 'fieldName' will be re-mapped to its retention units if it is a composite data value.
     *
     * Requires: No global dependencies
     */
    _accumulateUnitOfRetentionUpdates:function(model, formId, instanceId, kvMap, accumulatedChanges, forceUpdate) {
        var that = this;
        var dbTableName = model.table_id;
        var dataTableModel = model.dataTableModel;

        // track the values we have assigned. Useful for catching typos in the elementKey (field) names.
        var processSet = {};

        var f, defElement, elementPathPair, kvElement, v;
        var changeElement;
        var sessionVariableChanges = {};

        for (f in dataTableModel) {
			if ( dataTableModel.hasOwnProperty(f) ) {
				defElement = dataTableModel[f];
				if ( that.isUnitOfRetention(defElement) ) {
					var elementPath = defElement.elementPath;
					// don't allow working with elementKey primitives if not manipulating metadata
					if (( elementPath === undefined || elementPath === null ) &&
						  defElement.elementSet === 'instanceMetadata') {
						elementPath = f;
					}
					// TODO: get kvElement for this elementPath
					elementPathPair = that._getElementPathPairFromKvMap(kvMap, elementPath);
					if ( elementPathPair !== null && elementPathPair !== undefined ) {
						kvElement = elementPathPair.element;
						// track that we matched the keyname...
						processSet[elementPathPair.elementPath] = true;
						// ensure that undefined are treated as null...
						if (kvElement.value === undefined || kvElement.value === null) {
							kvElement.value = null;
						}
						changeElement = {"elementPath": elementPath, "value": kvElement.value};
						// the odkData layer works directly on the value
						// but session variables need the storage value...
						if ( !defElement.isSessionVariable ) {
							if ( instanceId !== null && instanceId !== undefined ) {
								// force the change or only add it if it would actually change the value
								if ( forceUpdate || accumulatedChanges[f] !== undefined ||
									 that._reconstructModelDataFromElementPathDetectActualValueRequiringUpdate(model, f, changeElement) ) {
									accumulatedChanges[f] = changeElement;
								}
							}
						} else {
							v = that.toSerializationFromElementType(defElement, kvElement.value, true);
							odkCommon.setSessionVariable(elementPath, v);
							sessionVariableChanges[f] = changeElement;
						}
					}
				} else {
					// we will be traversing into the retained 
					// elements within these composite elements
					// and processing those. 
					// Flag the composite as processed.
					processSet[defElement.elementPath] = true;
				}
			}
		}

		// apply the session variable changes immediately to the model.
		that.reconstructModelDataFromElementPathValueUpdates(model, sessionVariableChanges);

		for ( f in kvMap ) {
			if ( processSet[f] !== true ) {
				console.error("_accumulateUnitOfRetentionUpdates: kvMap contains unrecognized database column " + dbTableName + "." + f );
			}
		}
    },
    /**
     * Does not depend upon any global values.
     *
     * updates the model and records the field changes in
     * this.pendingChanges
     */
    setModelDataValueDeferredChange:function( model, formId, instanceId, name, value, accumulatedChanges, forceUpdate ) {
        var that = this;
        var justChange = {};
        justChange[name] = {value: value, isInstanceMetadata: false };
        // apply the change immediately...
        that._accumulateUnitOfRetentionUpdates(model, formId, instanceId, justChange, accumulatedChanges, forceUpdate );
    }
};
});
