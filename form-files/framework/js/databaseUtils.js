'use strict';
/**
 * This file contains utilities that operate on the data as represented in the JSON
 * and as serialized into and out of the database or session storage.
 */
define(['mdl','opendatakit','XRegExp'], function(mdl,opendatakit,XRegExp) {
verifyLoad('databaseUtils',
    ['mdl','opendatakit','XRegExp'],
    [mdl,opendatakit,XRegExp]);
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
        if ( path == null ) {
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
    _fromDatabaseToElementType: function( jsonType, value ) {
        var that = this;
        // date conversion elements...
        var yyyy, mm, dd, hh, min, sec, msec, zsign, zhh, zmm;

        if ( value === undefined || value === null ) {
            if ( jsonType.isNotNullable ) {
                throw new Error("unexpected null value for non-nullable field");
            }
            return null;
        }
        
        if ( jsonType.type === 'array' ) {
            value = JSON.parse(value);
            // TODO: ensure object spec conformance on read?
            return value;
        } else if ( jsonType.type === 'object' ) {
            if ( jsonType.elementType === 'date' ||
                 jsonType.elementType === 'dateTime' ) {
                // convert an iso8601 date yyyymmddTHH:MM:SS.ssszzzzz 
                // to a Date object...
                // TODO: FIX FRAGILE: loss of timezone info
                yyyy = Number(value.substr(0,4));
                mm = Number(value.substr(4,2))-1;// months are 0-11
                dd = Number(value.substr(6,2));
                hh = Number(value.substr(9,2));
                min = Number(value.substr(12,2));
                sec = Number(value.substr(15,2));
                msec = Number(value.substr(18,3));
                zsign = value.substr(21,1);
                zhh = Number(value.substr(22,2));
                zmm = Number(value.substr(24,2));
                value = new Date(Date.UTC(yyyy,mm,dd,hh,min,sec,msec));
                return value;
            } else if ( jsonType.elementType === 'time' ) {
                // convert an iso8601 time HH:MM:SS.ssszzzzz to a Date object...
                // TODO: FIX FRAGILE: loss of timezone info
                var idx = value.indexOf(':');
                hh = Number(value.substring(0,idx));
                min = Number(value.substr(idx+1,2));
                sec = Number(value.substr(idx+4,2));
                msec = Number(value.substr(idx+7,3));
                value = new Date();
                value.setHours(hh,min,sec,msec);
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
        } else {
            throw new Error("unrecognized JSON schema type");
        }
    },
    _padWithLeadingZeros: function( value, places ) {
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
    },
toDatabaseFromElementType: function( jsonType, value ) {
        var that = this;
        var refined;
        var itemType;
        var item;
        var itemValue;
        // date conversion elements...
        var yyyy, mm, dd, hh, min, sec, msec, zsign, zhh, zmm;

        if ( value === undefined || value === null ) {
            if ( jsontype.isNotNullable ) {
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
                        itemValue = that.toDatabaseFromElementType( itemType, value[item] );
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

                yyyy = value.getUTCFullYear();
                mm = value.getUTCMonth() + 1; // months are 0-11
                dd = value.getUTCDate();
                hh = value.getUTCHours();
                min = value.getUTCMinutes();
                sec = value.getUTCSeconds();
                msec = value.getUTCMilliseconds();
                zsign = 'Z';
                zhh = '';
                zmm = '';
                value = that._padWithLeadingZeros(yyyy,4) + 
                        that._padWithLeadingZeros(mm,2) +
                        that._padWithLeadingZeros(dd,2) + 'T' +
                        that._padWithLeadingZeros(hh,2) + ':' +
                        that._padWithLeadingZeros(min,2) + ':' +
                        that._padWithLeadingZeros(sec,2) + '.' +
                        that._padWithLeadingZeros(msec,3) + 'Z';
                return value;
            } else if ( jsonType.elementType === 'time' ) {
                // strip off the time-of-day and drop the rest...
                hh = value.getHours();
                min = value.getMinutes();
                sec = value.getSeconds();
                msec = value.getMilliseconds();
                var n = value.getTimezoneOffset();
                var sign = false;
                if ( n < 0) {
                    n = -n;
                    sign = true;
                }
                zhh = Math.floor(n/60);
                zmm = n - zhh*60;
                zsign = (sign ? '+' : '-');
                value = that._padWithLeadingZeros(hh,2) + ':' +
                        that._padWithLeadingZeros(min,2) + ':' +
                        that._padWithLeadingZeros(sec,2) + '.' +
                        that._padWithLeadingZeros(msec,3) + zsign +
                        that._padWithLeadingZeros(zhh,2) +
                        that._padWithLeadingZeros(zmm,2);
                return value;
            } else if ( !jsonType.properties ) {
                // this is an opaque BLOB w.r.t. database layer
                return JSON.stringify(value);
            } else {
                // otherwise, enforce spec conformance...
                // Only values in the properties list, and those
                // must match the type definitions recursively.
                refined = {};
                for ( item in jsonType.properties ) {
                    if ( value[item] != null ) {
                        itemType = jsonType.properties[item];
                        itemValue = that.toDatabaseFromElementType(itemType, value[item]);
                        if ( itemValue != null ) {
                            refined[item] = itemValue;
                        }
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
        } else {
            throw new Error("unrecognized JSON schema type");
        }
    },
reconstructElementPath: function(elementPath, jsonType, dbValue, topLevelObject) {
        var that = this;
        var value = that._fromDatabaseToElementType( jsonType, dbValue );
        var path = elementPath.split('.');
        var e = topLevelObject;
        var term;
        for (var j = 0 ; j < path.length-1 ; ++j) {
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
reconstructModelDataFromElementPathValueUpdates: function(mdl, updates) {
	var that = this;
	for (var dbKey in updates) {
		var elementPathValue = updates[dbKey];
		var de = mdl.dataTableModel[dbKey];
		if (de.isUnitOfRetention) {
			var elementPath = de.elementPath || elementPathValue.elementPath;
			if ( de.elementSet === 'instanceMetadata' ) {
				that.reconstructElementPath(elementPath || dbKey, de, elementPathValue.value, mdl.metadata );
			} else {
				that.reconstructElementPath(elementPath, de, elementPathValue.value, mdl.data );
			}
		}
	}
},
getElementPathPairFromKvMap: function(kvMap, elementPath) {
    var path = elementPath.split('.');
    var e = kvMap;
    var i, j, term, value, pathChain;
    // work from most specific to least specific searching for a value match
    for (j = path.length-1 ; j >= 0 ; --j) {
        pathChain = '';
        for (i = 0 ; i <= j ; ++i) {
            pathChain = '.' + path[i] + pathChain;
        }
        pathChain = pathChain.substring(1);
        if ( kvMap[pathChain] != null ) {
            // found a definition...
            term = kvMap[pathChain];
            value = term.value;
            // now find the definition for this element
            // within the composite value
            for ( i = j+1 ; i <= path.length-1 ; ++i ) {
                value = value[path[i]];
                if ( value === undefined || value === null ) break;
            }
            var e = {};
            var f;
            for ( f in term ) {
                if ( f !== "value" ) {
                    e[f] = term[f];
                }
            }
            e['value'] = value;
            return {element: e, elementPath: pathChain};
        }
    }
    return null;
},
/**
 * Process instanceMetadataKeyValueMap and add entries to kvMap.
 * Common code to construct the update kvMap for arguments passed
 * in on the command line.
 */
processPassedInKeyValueMap: function(dataTablePredefinedColumns, kvMap, instanceMetadataKeyValueMap) {
    var that = this;
    var propList = '';
    var propertyCount = 0;
    for ( var f in instanceMetadataKeyValueMap ) {
        propList = propList + ' ' + f;
        ++propertyCount;
        // determine if f is metadata or not...
        var metaField, isMetadata;
        var found = false;
        for ( var g in dataTablePredefinedColumns ) {
            var eDefn = dataTablePredefinedColumns[g];
            var eName = g;
            if ( 'elementPath' in eDefn ) {
                eName = eDefn.elementPath;
            }
            if ( f === eName ) {
                found = true;
                metaField = g;
                isMetadata = (eDefn.elementSet === 'instanceMetadata');
                break;
            }
        }
        
        if ( found ) {
            kvMap[metaField] = { value: instanceMetadataKeyValueMap[f], 
                                 isInstanceMetadata: isMetadata };
        } else {
            // TODO: convert f from elementPath into elementKey
            kvMap[f] = { value: instanceMetadataKeyValueMap[f], 
                                 isInstanceMetadata: false };
        }
    }
    
    if ( propertyCount !== 0 ) {
        shim.log('I',"Extra arguments found in instanceMetadataKeyValueMap" + propList);
    }
},
_clearUnitOfRetentionFlag: function( dbKeyMap, listChildElementKeys) {
    var that = this;
    var i;
    var f;
    if ( listChildElementKeys != null ) {
        for ( i = 0 ; i < listChildElementKeys.length ; ++i ) {
            var f = listChildElementKeys[i];
            var jsonType = dbKeyMap[f];
            jsonType.isUnitOfRetention = false;
            if ( jsonType.type === 'array' ) {
                that._clearUnitOfRetentionFlag(dbKeyMap, jsonType.listChildElementKeys);
            } else if ( jsonType.type === 'object' ) {
                that._clearUnitOfRetentionFlag(dbKeyMap, jsonType.listChildElementKeys);
            }
        }
    }
},
flattenElementPath: function( dbKeyMap, elementPathPrefix, elementName, elementKeyPrefix, jsonType ) {
    var that = this;
    var fullPath;
    var elementKey;
    var i = 0;

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

    // assume the primitive types are units-of-retention.
    // this will be updated if there is an outer array or object
    // that is itself a unit-of-retention (below).
    if ( jsonType.type === 'string' || 
            jsonType.type === 'number' || 
            jsonType.type === 'integer' ||
            jsonType.type === 'boolean' ) {
        // these should be retained
		// as their own column values...
        jsonType.isUnitOfRetention = true;
    }

    // remember the elementKey we have chosen...
    dbKeyMap[elementKey] = jsonType;

    // handle the recursive structures...
    if ( jsonType.type === 'array' ) {
        // explode with subordinate elements
        f = that.flattenElementPath( dbKeyMap, elementPathPrefix, 'items', elementKey, jsonType.items );
        jsonType.listChildElementKeys = [ f.elementKey ];
        jsonType.isUnitOfRetention = true;
    } else if ( jsonType.type === 'object' ) {
        // object...
        var hasProperties = false;
        var e;
        var f;
        var listChildElementKeys = [];
        for ( e in jsonType.properties ) {
            hasProperties = true;
            f = that.flattenElementPath( dbKeyMap, elementPathPrefix, e, elementKey, jsonType.properties[e] );
            listChildElementKeys.push(f.elementKey);
        }
        jsonType.listChildElementKeys = listChildElementKeys;
        if ( !hasProperties ) {
            jsonType.isUnitOfRetention = true;
        }
    }

    if ( jsonType.isUnitOfRetention && (jsonType.listChildElementKeys != null)) {
        // we have some sort of structure that is written out as 
		// a JSON serialization. Clear the isUnitOfRetention tags
		// on the nested elements
        that._clearUnitOfRetentionFlag(dbKeyMap, jsonType.listChildElementKeys);
    }
    return jsonType;
},
getElementPathValue:function(data,pathName) {
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
convertSelectionString: function(linkedMdl, selection) {
	// must be space separated. Must be persisted primitive elementName -- Cannot be elementPath
    var that = this;
    if ( selection == null || selection.length === 0 ) {
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
            for (f in linkedMdl.dataTableModel) {
                var defElement = linkedMdl.dataTableModel[f];
                var elementPath = defElement['elementPath'];
                if ( elementPath == null ) elementPath = f;
                if ( elementPath == e ) {
                    remapped = remapped + ' "' + f + '"';
                    found = true;
                    break;
                }
            }
            if ( found == false ) {
                alert('database.convertSelectionString: unrecognized elementPath: ' + e );
                shim.log('E',"database.convertSelectionString: unrecognized elementPath: " + e);
                return null;
            }
        }
    }
    return remapped;
},
convertOrderByString: function(linkedMdl, order_by) {
	// must be space separated. Must be persisted primitive elementName -- Cannot be elementPath
    var that = this;
    if ( order_by == null || order_by.length === 0 ) {
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
            for (f in linkedMdl.dataTableModel) {
                var defElement = dataTableModel[f];
                var elementPath = defElement['elementPath'];
                if ( elementPath == null ) elementPath = f;
                if ( elementPath == e ) {
                    remapped = remapped + ' "' + f + '"';
                    found = true;
                    break;
                }
            }
            if ( found == false ) {
                alert('database.convertOrderByString: unrecognized elementPath: ' + e );
                shim.log('E',"database.convertOrderByString: unrecognized elementPath: " + e );
                return null;
            }
        }
    }
    return remapped;
}
};
});
