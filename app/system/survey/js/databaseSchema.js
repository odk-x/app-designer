'use strict';
// TODO: Instance level: locale (used), at Table level: locales (available), formPath, 
define([], function() {
verifyLoad('databaseSchema',
    [],
    []);
return {
    // maps of:
    //   dbColumnName : { 
    //      type: databaseType, 
    //      isNotNullable: false/true, 
    //      isSessionVariable: false/true,
    //      'default': defaultValue,
    //      elementPath: exposedName }
    // 
    // elementPath is the inversion of the property name and model's value name.
    // if elementPath is null, then the entry is not exposed above the database layer.
    // i.e., it is not settable/gettable via Javascript used in prompts.
    // This is used for bookkeeping columns (e.g., server sync, save status).
    //
	dataTablePredefinedColumns: { 
                     // these have leading underscores because they are hidden from the user and not directly manipulable
                     _id: {type: 'string', isNotNullable: true, elementSet: 'instanceMetadata' },
                     _row_etag: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' },
                     _sync_state: { type: 'string', isNotNullable: true, 'default': 'new_row', elementSet: 'instanceMetadata' },
                     _conflict_type: { type: 'integer', isNotNullable: false, elementSet: 'instanceMetadata' },
                     _filter_type: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' },
                     _filter_value: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' },
                     _form_id: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' },
                     _locale: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' },
                     _savepoint_type: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' },
                     _savepoint_timestamp: { type: 'string', isNotNullable: true, elementSet: 'instanceMetadata' },
                     _savepoint_creator: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' } },
	/**
	 * get the contents of the active data table row for a given table
	 * for related forms (with filters).
	 *
	 * NOTE: If the last update's _sync_state is 'deleted', then we do not return anything.
	 *
	 * dbTableName
	 * selection  e.g., 'name=? and age=?'
	 * selectionArgs e.g., ['Tom',33]
	 * orderBy  e.g., 'name asc, age desc'
	 *
	 * Requires: no globals
	 */
	selectMostRecentFromDataTableStmt:function(dbTableName, selection, selectionArgs, orderBy) {
		var args = ['deleted'];
		if ( selection === null || selection === undefined ) {
			return {
					stmt : 'select * from "' + dbTableName + '" as T where (T._sync_state is null or T._sync_state != ?) and ' + 
						'T._savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + dbTableName +
							   '" as V where V._id=T._id)' +
							((orderBy === undefined || orderBy === null) ? '' : ' order by ' + orderBy),
					bind : args  
				};
		} else {
			if (selectionArgs !== null && selectionArgs !== undefined ) {
				args = args.concat(selectionArgs);
			}
			return {
					stmt :  'select * from (select * from "' + dbTableName + '" as T where (T._sync_state is null or T._sync_state != ?) and ' + 
						'T._savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + dbTableName + 
							'" as V where V._id=T._id)) where ' + selection +
							((orderBy === undefined || orderBy === null) ? '' : ' order by ' + orderBy),
					bind : args
				};
		}
	},
    /**
	 * Internal routine to add 'notUnitOfRetention' attributes to the JSON schema 
	 * produced by XLSXConverter. Ideally, this attribute should be provided by
	 * XLSXConverter and not adorned here (later).
	 */
    _markUnitOfRetention: function(dataTableModel) {
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
    /**
     * Internal routine to mark all elementKeys in a list as being session variables.
     * if the referenced elements are themselves complex arrays or objects, it recurses
     * to mark all of the component elementKeys as being session variables.
     */
    _setSessionVariableFlag: function( dataTableModel, listChildElementKeys) {
        var that = this;
        var i;
        if ( listChildElementKeys !== null && listChildElementKeys !== undefined ) {
            for ( i = 0 ; i < listChildElementKeys.length ; ++i ) {
                var f = listChildElementKeys[i];
                var jsonType = dataTableModel[f];
                jsonType.isSessionVariable = true;
                if ( jsonType.type === 'array' ) {
                    that._setSessionVariableFlag(dataTableModel, jsonType.listChildElementKeys);
                } else if ( jsonType.type === 'object' ) {
                    that._setSessionVariableFlag(dataTableModel, jsonType.listChildElementKeys);
                }
            }
        }
    },
	/**
	 * Internal routine to recursively add elementKeys to the dataTableModel.
	 * This recurses into arrays and objects to set these elementKeys into the
	 * model.
	 */
    _flattenElementPath: function( dataTableModel, elementPathPrefix, elementName, elementKeyPrefix, jsonType ) {
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
        if ( dataTableModel[elementKey] !== undefined && dataTableModel[elementKey] !== null && dataTableModel[elementKey] != jsonType ) {
            throw new Error("supplied elementKey is already used (autogenerated?) for another model element");
        }
        if ( elementKey.charAt(0) === '_' ) {
            throw new Error("supplied elementKey starts with underscore");
        }

        // remember the elementKey we have chosen...
        dataTableModel[elementKey] = jsonType;

        // handle the recursive structures...
        if ( jsonType.type === 'array' ) {
            // explode with subordinate elements
            f = that._flattenElementPath( dataTableModel, elementPathPrefix, 'items', elementKey, jsonType.items );
            jsonType.listChildElementKeys = [ f.elementKey ];
        } else if ( jsonType.type === 'object' ) {
            // object...
            var listChildElementKeys = [];
            for ( e in jsonType.properties ) {
                f = that._flattenElementPath( dataTableModel, elementPathPrefix, e, elementKey, jsonType.properties[e] );
                listChildElementKeys.push(f.elementKey);
            }
            jsonType.listChildElementKeys = listChildElementKeys;
        }

        if ( jsonType.isSessionVariable && (jsonType.listChildElementKeys !== null) && (jsonType.listChildElementKeys !== undefined)) {
            // we have some sort of structure that is a sessionVariable
            // Set the isSessionVariable tags on all its nested elements.
            that._setSessionVariableFlag(dataTableModel, jsonType.listChildElementKeys);
        }
        return jsonType;
    },
	/**
	 * Flesh out the protoModel with a dataTableModel constructed from its formDef
	 * 
	 * Return the set of database table inserts needed for saving this data table model to the database.
	 * This returned set does not include sessionVariable fields.
	 */
	constructDataTableModel:function(protoModel) {
		var that = this;
		odkCommon.log('D','databaseSchema.constructDataTableModel');
		
		// dataTableModel holds an inversion of the protoModel.formDef.model
		//
		//  elementKey : jsonSchemaType
		//
		// with the addition of:
		//    isSessionVariable : true if this is not retained across sessions
		//    elementPath : pathToElement
		//    elementSet : 'data'
		//    listChildElementKeys : ['key1', 'key2' ...]
		//
		// within the jsonSchemaType to be used to transform to/from
		// the model contents and data table representation.
		//    
		var dataTableModel = {};
		var f;
		for ( f in that.dataTablePredefinedColumns ) {
			dataTableModel[f] = that.dataTablePredefinedColumns[f];
		}
		
		// go through the supplied protoModel.formDef model
		// and invert it into the dataTableModel
		var jsonDefn;
		for ( f in protoModel.formDef.specification.model ) {
			jsonDefn = that._flattenElementPath( dataTableModel, null, f, null, protoModel.formDef.specification.model[f] );
		}

		// traverse the dataTableModel marking which elements are 
		// not units of retention.
		that._markUnitOfRetention(dataTableModel);
		
		protoModel.dataTableModel = dataTableModel;
	}
};
});
