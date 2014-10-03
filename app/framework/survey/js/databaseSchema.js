'use strict';
// TODO: Instance level: locale (used), at Table level: locales (available), formPath, 
define(['mdl','databaseUtils','opendatakit'], function(mdl, databaseUtils,opendatakit) {
verifyLoad('databaseSchema',
    ['mdl','databaseUtils','opendatakit'],
    [mdl,databaseUtils,opendatakit]);
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
tableDefinitionsPredefinedColumns: {
                    _table_id: { type: 'string', isNotNullable: true, dbColumnConstraint: 'PRIMARY KEY', elementPath: 'table_id', elementSet: 'tableMetadata' },
                    _schema_etag: { type: 'string', isNotNullable: false, elementSet: 'tableMetadata' },
                    _last_data_etag: { type: 'string', isNotNullable: false, elementSet: 'tableMetadata' },
                    _last_sync_time: { type: 'integer', isNotNullable: true, elementSet: 'tableMetadata' } },
columnDefinitionsTableConstraint: 'PRIMARY KEY ( "_table_id", "_element_key" )',
columnDefinitionsPredefinedColumns: {
                    _table_id: { type: 'string', isNotNullable: true, elementPath: 'table_id', elementSet: 'columnMetadata' },
                    _element_key: { type: 'string', isNotNullable: true, elementPath: 'elementKey', elementSet: 'columnMetadata' },
                    _element_name: { type: 'string', isNotNullable: true, elementPath: 'elementName', elementSet: 'columnMetadata' },
                    _element_type: { type: 'string', isNotNullable: false, elementPath: 'elementType', elementSet: 'columnMetadata' },
                    _list_child_element_keys: { type: 'array', items: { type: 'string' }, isNotNullable: false, elementPath: 'listChildElementKeys', elementSet: 'columnMetadata' } },
// key value stores are fairly straightforward...
keyValueStoreActiveTableConstraint: 'PRIMARY KEY ("_table_id", "_partition", "_aspect", "_key")',
keyValueStoreActivePredefinedColumns: {
                    _table_id: { type: 'string', isNotNullable: true },
                    _partition: { type: 'string', isNotNullable: true },
                    _aspect: { type: 'string', isNotNullable: true },
                    _key: { type: 'string', isNotNullable: true },
                    _type: { type: 'string', isNotNullable: false },
                    _value: { type: 'string', isNotNullable: false } },
_tableKeyValueStoreActiveAccessibleKeys: {
            // keys we are allowing the user to access from within Javascript
            // _partition: table
            // _aspect: default
            // mapped as psuedo-columns per PredefinedColumns objects, above.
            // propertyName is the value of the 'key' in the database.
    },
_columnKeyValueStoreActiveAccessibleKeys: {
            // keys we are allowing the user to access from within Javascript
            // _partition: column
            // _aspect: element_key
            // mapped as psuedo-columns per PredefinedColumns objects, above.
            // propertyName is the value of the 'key' in the database.
     },
getAccessibleTableKeyDefinition: function( key ) {
        var that = this;
        return that._tableKeyValueStoreActiveAccessibleKeys[key];
    },
getAccessibleColumnKeyDefinition: function( key ) {
        var that = this;
        return that._columnKeyValueStoreActiveAccessibleKeys[key];
    },
createTableStmt: function( dbTableName, kvMap, tableConstraint ) {
        var that = this;
        // TODO: verify that dbTableName is not already in use...
        var createTableCmd = 'CREATE TABLE IF NOT EXISTS "' + dbTableName + '"(';
        var comma = '';
        for ( var dbColumnName in kvMap ) {
            var f = kvMap[dbColumnName];
            if ( databaseUtils.isUnitOfRetention(f) && !f.isSessionVariable ) {
                createTableCmd += comma + dbColumnName + " ";
                comma = ',';
                if ( f.type === "string" ) {
                    createTableCmd += "TEXT" + (f.isNotNullable ? " NOT NULL" : " NULL");
                } else if ( f.type === "integer" ) {
                    createTableCmd += "INTEGER" + (f.isNotNullable ? " NOT NULL" : " NULL");
                } else if ( f.type === "number" ) {
                    createTableCmd += "REAL" + (f.isNotNullable ? " NOT NULL" : " NULL");
                } else if ( f.type === "boolean" ) {
                    createTableCmd += "INTEGER" + (f.isNotNullable ? " NOT NULL" : " NULL");
                } else if ( f.type === "object" ) {
                    createTableCmd += "TEXT" + (f.isNotNullable ? " NOT NULL" : " NULL");
                } else if ( f.type === "array" ) {
                    createTableCmd += "TEXT" + (f.isNotNullable ? " NOT NULL" : " NULL");
                } else {
                    throw new Error("unhandled type: " + f.type);
                }
            }
        }
        if ( tableConstraint != null ) {
            createTableCmd += comma + tableConstraint + " ";
        }
        createTableCmd += ');';
        return  {
            stmt : createTableCmd,
            bind : []
        };
    },
dropTableStmt: function(dbTableName) {
        return { stmt: 'drop table if exists "' + dbTableName + '"',
                bind: [] 
            };
    },
deleteEntireTableContentsTableStmt: function(dbTableName) {
        return { stmt: 'delete from "' + dbTableName + '"',
                bind: []
            };
    },
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//   DATA TABLE DATA
//   DATA TABLE DATA
//   DATA TABLE DATA
//   DATA TABLE DATA
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
// Records in the data table are always inserted.
// Metadata columns are indicated by a leading underscore in the name.
// 
// The _savepoint_type (metadata) column === "COMPLETE" if they are 'official' values.
// Otherwise, _savepoint_type === "INCOMPLETE" indicates a manual user savepoint and
// _savepoint_type IS NULL indicates an automatic (checkpoint) savepoint. 
// The _savepoint_timestamp indicates the time in NANOSECONDS at which the savepoint occured.

/**
 * insert a new automatic savepoint for the given record and change the 
 * database columns (including instance metadata columns) specified in the kvMap.
 * Also used to set a manual savepoint when the kvMap specifies the '_savepoint_type' 
 * instance metadata value (not accessible to external users).
 *
 * kvMap : { 'columnName' : { value: "foo name", isInstanceMetadata: false } ...}
 *
 * Assumes: all complex values are already reduced to their unit-of-retention column set.
 *
 * Requires: No global dependencies
 */
insertKeyValueMapDataTableStmt:function(dbTableName, dataTableModel, formId, instanceId, kvMap) {
    var that = this;
    var nowNano = opendatakit.convertDateTimeToNanos();
    var activeUser = opendatakit.getPlatformInfo().activeUser;

    var bindings = [];
    var processSet = {};
    
    var j, f, defElement, elementPathPair, kvElement, v;
    var comma = '';
    
    var stmt = 'insert into "' + dbTableName + '" (';
    for ( f in dataTableModel ) {
        defElement = dataTableModel[f];
        if ( databaseUtils.isUnitOfRetention(defElement) && !defElement.isSessionVariable ) {
            stmt += comma;
            comma = ', ';
            stmt += '"' + f + '"';
        }
    }
    stmt += ") select ";
    comma = '';
    var updates = {};
    for (f in dataTableModel) {
        defElement = dataTableModel[f];
        if ( databaseUtils.isUnitOfRetention(defElement) ) {
            if ( !defElement.isSessionVariable ) {
                stmt += comma;
                comma = ', ';
            }
            var elementPath = defElement['elementPath'];
            // don't allow working with elementKey primitives if not manipulating metadata
            if (( elementPath === undefined || elementPath === null ) && 
                  defElement.elementSet === 'instanceMetadata') {
                elementPath = f;
            }
            // TODO: get kvElement for this elementPath
            elementPathPair = databaseUtils.getElementPathPairFromKvMap(kvMap, elementPath);
            if ( elementPathPair != null ) {
                kvElement = elementPathPair.element;
                // track that we matched the keyname...
                processSet[elementPathPair.elementPath] = true;
                if (kvElement.value === undefined || kvElement.value === null) {
                    updates[f] = {"elementPath" : elementPath, "value": null};
                    if ( !defElement.isSessionVariable ) {
                        stmt += "null";
                    } else {
                        shim.setSessionVariable(opendatakit.getRefId(), elementPath, JSON.stringify(null));
                    }
                } else {
                    // remap kvElement.value into storage value...
                    v = databaseUtils.toDatabaseFromElementType(defElement, kvElement.value);
                    updates[f] = {"elementPath" : elementPath, "value": v};
                    if ( !defElement.isSessionVariable ) {
                        stmt += "?";
                        bindings.push(v);
                    } else {
                        shim.setSessionVariable(opendatakit.getRefId(), elementPath, JSON.stringify(v));
                    }
                }
            } else if (f === "_savepoint_timestamp") {
                stmt += "?";
                v = nowNano;
                bindings.push(v);
                updates[f] = {"elementPath" : elementPath, "value": v};
            } else if (f === "_savepoint_creator") {
                stmt += "?";
                v = activeUser;
                bindings.push(v);
                updates[f] = {"elementPath" : elementPath, "value": v};
            } else if ( f === "_form_id" ) {
                stmt += "?";
                v = formId;
                bindings.push(v);
                updates[f] = {"elementPath" : elementPath, "value": v};
            } else if ( f === "_savepoint_type" ) {
                stmt += "null";
            } else if ( f === "_sync_state" ) {
                stmt += "case when _sync_state='new_row' then 'new_row' else 'changed' end";
            } else {
                if ( !defElement.isSessionVariable ) {
                    stmt += '"' + f + '"';
                }
            }
        }
    }
    stmt += ' from "' + dbTableName + '" as T where _id=? and ' +
        'T._savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + dbTableName + '" as V where V._id=T._id)'; 
    bindings.push(instanceId);
    
    for ( f in kvMap ) {
        if ( processSet[f] != true ) {
            console.error("insertKeyValueMapDataTableStmt: kvMap contains unrecognized database column " + dbTableName + "." + f );
        }
    }
    return {
        stmt : stmt,
        bind : bindings,
        updates : updates
        };
},
/**
 * insert an entirely new savepoint for the given instanceId (not based upon 
 * the values in any existing record). Called when creating a new instance
 * or (TODO) sub-form instance.
 *
 * kvMap : { 'columnName' : { value: "foo name", isInstanceMetadata: false } ...}
 *
 * additionally, the dataTablePredefinedColumns and model are assumed to be enhanced
 * JSON schema maps. e.g.,
 * 
 * jsonSchemaMap : { 'columnName' : { type: 'elementType', 
 *                            'default': 'defaultValue',
 *                            isInstanceMetadata: false } ... }
 *
 * NON_CONFORMANCE NOTE: rather than express everything as a list of 
 * types ['elementType', 'null'] we assume that 'null' is implicitly 
 * allowed. Use isNotNullable: true to force a non-null database restriction.
 * Enforcement of this is primarily in support of metadata.
 *
 * If a kvMap entry is present, its 'value' field is used (and null if 'value' 
 * is undefined).If no kvMap entry is present, the ''default'' field, from 
 * the dataTableModel, if present,  is used as the initial
 * value for this column. If ''default'' is not present, null is used.
 *
 * Assumes: all complex values are already reduced to their unit-of-retention column set.
 *
 * Requires: No global context
 */
insertNewKeyValueMapDataTableStmt:function(dbTableName, dataTableModel, formId, kvMap) {
    var that = this;
    var nowNano = opendatakit.convertDateTimeToNanos();
    var activeUser = opendatakit.getPlatformInfo().activeUser;

    var bindings = [];
    var processSet = {};
    
    var j, f, defElement, elementPathPair, kvElement, v;
    var comma = '';
    
    var stmt = 'insert into "' + dbTableName + '" (';
    for ( f in dataTableModel ) {
        defElement = dataTableModel[f];
        if ( databaseUtils.isUnitOfRetention(defElement) && !defElement.isSessionVariable ) {
            stmt += comma;
            comma = ', ';
            stmt += '"' + f + '"';
        }
    }
    stmt += ") values (";
    comma = '';
    for (f in dataTableModel) {    
        defElement = dataTableModel[f];
        if ( databaseUtils.isUnitOfRetention(defElement) ) {
            if ( !defElement.isSessionVariable ) {
                stmt += comma;
                comma = ', ';
            }
            var elementPath = defElement['elementPath'];
            // don't allow working with elementKey primitives if not manipulating metadata
            if (( elementPath === undefined || elementPath === null ) && 
                  defElement.elementSet === 'instanceMetadata') {
                elementPath = f;
            }
            // TODO: get kvElement for this elementPath
            elementPathPair = databaseUtils.getElementPathPairFromKvMap(kvMap, elementPath);
            if ( elementPathPair != null ) {
                kvElement = elementPathPair.element;
                // track that we matched the keyname...
                processSet[elementPathPair.elementPath] = true;
                if (kvElement.value === undefined || kvElement.value === null) {
                    if ( !defElement.isSessionVariable ) {
                        stmt += "null";
                    } else {
                        shim.setSessionVariable(opendatakit.getRefId(), elementPath, JSON.stringify(null));
                    }
                } else {
                    v = databaseUtils.toDatabaseFromElementType(defElement, kvElement.value);
                    if ( !defElement.isSessionVariable ) {
                        stmt += "?";
                        bindings.push(v);
                    } else {
                        shim.setSessionVariable(opendatakit.getRefId(), elementPath, JSON.stringify(v));
                    }
                }
            } else if ( f === "_savepoint_timestamp" ) {
                stmt += "?";
                bindings.push(nowNano);
            } else if (f === "_savepoint_creator") {
                stmt += "?";
                bindings.push(activeUser);
            } else if ( f === "_form_id" ) {
                stmt += "?";
                bindings.push(formId);
            } else {
                // use default values from reference map...
                if ( defElement['default'] === undefined || defElement['default'] === null ) {
                    if ( !defElement.isSessionVariable ) {
                        stmt += "null";
                    } else {
                        shim.setSessionVariable(opendatakit.getRefId(), elementPath, JSON.stringify(null));
                    }
                } else {
                    v = databaseUtils.toDatabaseFromElementType(defElement, defElement['default']);
                    if ( !defElement.isSessionVariable ) {
                        stmt += "?";
                        bindings.push(v);
                    } else {
                        shim.setSessionVariable(opendatakit.getRefId(), elementPath, JSON.stringify(v));
                    }
                }
            }
        }
    }
    stmt += ');'; 
    
    for ( f in kvMap ) {
        if ( processSet[f] != true ) {
            console.error("insertNewKeyValueMapDataTableStmt: kvMap contains unrecognized database column " + dbTableName + "." + f );
        }
    }
    return {
        stmt : stmt,
        bind : bindings
        };
},

/**
 * get the contents of the active data table row for a given instanceId
 *
 * Requires: no globals
 */
selectAllFromDataTableStmt:function(dbTableName, instanceId) {
    var stmt = 'select * from "' + dbTableName + '" as T where _id=? and ' + 
            'T._savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + dbTableName + '" as V where V._id=T._id)'; 
    return {
        stmt : stmt,
        bind : [instanceId]
    };
},
/**
 * get the most recent 'COMPLETE' contents of the active data table row for a given instanceId
 * If the row is currently being edited, this will display the last 'COMPLETE' old value.
 *
 * If supplied, the selection filter is applied to the returned set of 'COMPLETE' entries.
 * This query is used for cascading select statements
 *
 * Requires: no globals
 */
selectAllCompleteFromDataTableStmt:function(dbTableName, selection, selectionArgs) {
    if ( selection != null ) {
        var args = ['COMPLETE'];
        if ( selectionArgs != null ) {
            args = args.concat(selectionArgs);
        }
        return {
                stmt : 'select * from (select * from "' + dbTableName + '" as T where _savepoint_type=? and ' + 
                        'T._savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + dbTableName + '" as V where V._id=T._id)) where ' +
                        selection,
                bind : args
            };
    } else {
        return {
                stmt : 'select * from "' + dbTableName + '" as T where _savepoint_type=? and ' + 
                   'T._savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + dbTableName + '" as V where V._id=T._id)',
                bind : ['COMPLETE']    
            };
    }
},
/**
 * get the contents of the active data table row for a given table
 * for related forms (with filters).
 *
 * dbTableName
 * selection  e.g., 'name=? and age=?'
 * selectionArgs e.g., ['Tom',33]
 * orderBy  e.g., 'name asc, age desc'
 *
 * Requires: no globals
 */
selectMostRecentFromDataTableStmt:function(dbTableName, selection, selectionArgs, orderBy) {
    if ( selectionArgs === undefined || selectionArgs === null ) {
        selectionArgs = [];
    }
    if ( selection === undefined || selection === null ) {
        return {
                stmt : 'select * from "' + dbTableName + '" as T where (_sync_state is null or _sync_state != ?) and ' + 
                    'T._savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + dbTableName + '" as V where V._id=T._id)' +
                        ((orderBy === undefined || orderBy === null) ? '' : ' order by ' + orderBy),
                bind : ['deleted']    
            };
    } else {
        var args = ['deleted'];
        args = args.concat(selectionArgs);
        return {
                stmt :  'select * from (select * from "' + dbTableName + '" as T where (_sync_state is null or _sync_state != ?) and ' + 
                    'T._savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + dbTableName + '" as V where V._id=T._id)) where ' + selection +
                        ((orderBy === undefined || orderBy === null) ? '' : ' order by ' + orderBy),
                bind : args
            };
    }
},
/**
 * compose query to get 'rowcount' value -- the number of records with the given instanceId in the dbTableName.
 *
 * Requires: no globals
 */
selectDataTableCountStmt:function(dbTableName, instanceId) {
    
    var stmt = 'select count(*) as rowcount from "' + dbTableName + '" where _id=?';
    return {
        stmt : stmt,
        bind : [instanceId]
    };
},
/**
 * Delete all but the last savepoint for this instanceId.
 *
 * NOTE: This can make a currently-visible row invisible in a concurrent ODK Tables if 
 * the current record is not a 'COMPLETE' record. We prevent this by only calling this 
 * within the save-as-complete transaction.
 *
 * Requires: no globals
 */
deletePriorChangesDataTableStmt:function(dbTableName, instanceId) {
    
    var stmt = 'delete from "' + dbTableName + '" where _id=? and ' + 
        '_savepoint_timestamp not in (select max(V._savepoint_timestamp) from "' + dbTableName + '" as V where V._id=?);';
    return {
        stmt : stmt,
        bind : [instanceId, instanceId]
    };
},
/**
 * Delete all automatic save points for a row. This leaves all the user's manual
 * 'INCOMPLETE' savepoints and any 'COMPLETE' savepoints.
 *
 * Requires: no globals
 */
deleteUnsavedChangesDataTableStmt:function(dbTableName, instanceId) {
    return {
        stmt : 'delete from "' + dbTableName + '" where _id=? and _savepoint_type is null;',
        bind : [instanceId]
    };
},
/**
 * Delete the instanceId entirely from the table (all savepoints) 
 * if its sync_state is 'new_row'
 *
 * Requires: no globals
 */
deleteNewRowDataTableStmt:function(dbTableName, instanceid) {
    return {
        stmt : 'delete from "' + dbTableName + '" where _id=? and _sync_state=?;',
        bind : [instanceid, 'new_row']
    };
},
/**
 * Mark the record as deleted if the _sync_state is not 'new_row'.
 *
 * Requires: no globals
 */
deleteMarkDeletedDataTableStmt:function(dbTableName, instanceid) {
    return {
        stmt : 'update "' + dbTableName + '" set _sync_state=? where _id=?;',
        bind : ['deleted', instanceid]
    };
},
/**
 * Retrieve the latest information on all instances in a given data table.
 * Ordered by most recent first, in reverse chronological order.
 *
 * Requires: no globals
 */
getAllInstancesDataTableStmt:function(dbTableName, displayElementName) {
    if ( displayElementName === undefined || displayElementName === null ) {
        displayElementName = '';
    } else {
        displayElementName = displayElementName + ', ';
    }
    return {
            stmt : 'select ' + displayElementName + ' _savepoint_timestamp, _savepoint_type, _locale, _id from "' +
                    dbTableName + '" as T where ' + 
                    'T._savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + dbTableName + 
                    '" as V where V._id=T._id) order by _savepoint_timestamp desc;',
            bind : []
            };
},
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//   TABLE META DATA
//   TABLE META DATA
//   TABLE META DATA
//   TABLE META DATA
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
selectTableDefinitionsDataStmt:function(table_id) {
    return {
            stmt : 'select * from _table_definitions where _table_id=?',
            bind : [table_id]    
        };
},
selectAllTableDbNamesAndIdsDataStmt: function() {
    return {
            stmt: 'select _table_id from _table_definitions',
            bind: []
        };
},
selectAllTableMetaDataStmt:function(table_id) {
    return {
            stmt : 'select _key, _type, _value from _key_value_store_active where _table_id=? and _partition=? and _aspect=?',
            bind : [table_id, "Table", "default"]    
        };
},
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
//   COLUMN META DATA
//   COLUMN META DATA
//   COLUMN META DATA
//   COLUMN META DATA
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
selectColumnDefinitionsDataStmt:function(table_id) {
    return {
            stmt : 'select * from _column_definitions where _table_id=?',
            bind : [table_id]    
        };
},
selectAllColumnMetaDataStmt:function(table_id) {
    return {
            stmt : 'select _aspect as _element_key, _key, _type, _value from _key_value_store_active where _table_id=? and _partition=?',
            bind : [table_id, "Column"]    
        };
},
/**
 * Flesh out the protoMdl with a dataTableModel constructed from its formDef
 * 
 * Return the set of database table inserts needed for saving this data table model to the database.
 * This returned set does not include sessionVariable fields.
 */
updateDataTableModelAndReturnDatabaseInsertLists:function(protoMdl, formTitle) {
    var that = this;
    var fullDef = {
        _table_definitions: [],
        _key_value_store_active: [],
        _column_definitions: []
        };

    shim.log('D','database._insertTableAndColumnProperties');
    var displayColumnOrder = [];
    
    // TODO: synthesize dbTableName from some other source...
    var dbTableName = protoMdl.table_id;
    // dataTableModel holds an inversion of the protoMdl.formDef.model
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
    
    // go through the supplied protoMdl.formDef model
    // and invert it into the dataTableModel
    var jsonDefn;
    for ( f in protoMdl.formDef.specification.model ) {
        jsonDefn = databaseUtils.flattenElementPath( dataTableModel, null, f, null, protoMdl.formDef.specification.model[f] );
    }

    // traverse the dataTableModel marking which elements are 
    // not units of retention.
    databaseUtils.markUnitOfRetention(dataTableModel);
    
    // and now traverse the dataTableModel making sure all the
    // elementSet: 'data' values have columnDefinitions entries.
    //
    for ( var dbColumnName in dataTableModel ) {
        // the XLSXconverter already handles expanding complex types
        // such as geopoint into their underlying storage representation.
        jsonDefn = dataTableModel[dbColumnName];
        
        if ( jsonDefn.elementSet === 'data' && !jsonDefn.isSessionVariable ) {
            var surveyElementName = jsonDefn.elementName;
            var surveyDisplayName = (jsonDefn.displayName === undefined || jsonDefn.displayName === null) ? surveyElementName : jsonDefn.displayName;
            
            fullDef._column_definitions.push( {
                _table_id: protoMdl.table_id,
                _element_key: dbColumnName,
                _element_name: jsonDefn.elementName,
                _element_type: (jsonDefn.elementType === undefined || jsonDefn.elementType === null ? jsonDefn.type : jsonDefn.elementType),
                _list_child_element_keys : ((jsonDefn.listChildElementKeys === undefined || jsonDefn.listChildElementKeys === null) ? JSON.stringify([]) : JSON.stringify(jsonDefn.listChildElementKeys))
            } );
            
            // displayed columns within Tables, at least for now, are just the unit-of-retention columns.
            if ( databaseUtils.isUnitOfRetention(jsonDefn) ) {
                displayColumnOrder.push(dbColumnName);
            }

            fullDef._key_value_store_active.push( {
                _table_id: protoMdl.table_id,
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "displayVisible",
                _type: "boolean",
                _value: true
            } );
            fullDef._key_value_store_active.push( {
                _table_id: protoMdl.table_id,
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "displayName",
                _type: "object",
                _value: JSON.stringify(surveyDisplayName) // this is a localizable string...
            } );
            var choicesJson;
            if ( jsonDefn.valuesList === undefined || jsonDefn.valuesList === null ) {
                choicesJson = "";
            } else {
                var ref = protoMdl.formDef.specification.choices[jsonDefn.valuesList];
                if ( ref === undefined || ref === null ) {
                    choicesJson = "";
                } else {
                    choicesJson = JSON.stringify(ref);
                }
            }
            fullDef._key_value_store_active.push( {
                _table_id: protoMdl.table_id,
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "displayChoicesList",
                _type: "object",
                _value: choicesJson
            } );
            fullDef._key_value_store_active.push( {
                _table_id: protoMdl.table_id,
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "displayFormat",
                _type: "string",
                _value: (jsonDefn.displayFormat === undefined || jsonDefn.displayFormat === null) ? "" : jsonDefn.displayFormat
            } );
            fullDef._key_value_store_active.push( {
                _table_id: protoMdl.table_id,
                _partition: "Column",
                _aspect: dbColumnName,
                _key: "joins",
                _type: "object",
                _value: ""
            } );
        }
    }

    fullDef._table_definitions.push( { 
        _table_id: protoMdl.table_id, 
        _schema_etag: null,
        _last_data_etag: null,
        _last_sync_time: -1 } );

    // construct the kvPairs to insert into kvstore
    fullDef._key_value_store_active.push( { _table_id: protoMdl.table_id, _partition: "Table", _aspect: "default", _key: 'colOrder', _type: 'object', _value: JSON.stringify(displayColumnOrder) } );
    fullDef._key_value_store_active.push( { _table_id: protoMdl.table_id, _partition: "Table", _aspect: "default", _key: 'defaultViewType', _type: 'string', _value: 'SPREADSHEET' } );
    fullDef._key_value_store_active.push( { _table_id: protoMdl.table_id, _partition: "Table", _aspect: "default", _key: 'displayName', _type: 'object', _value: JSON.stringify(formTitle) } );
    fullDef._key_value_store_active.push( { _table_id: protoMdl.table_id, _partition: "Table", _aspect: "default", _key: 'groupByCols', _type: 'object', _value: '[]' } );
    fullDef._key_value_store_active.push( { _table_id: protoMdl.table_id, _partition: "Table", _aspect: "default", _key: 'indexCol', _type: 'string', _value: '' } );
    fullDef._key_value_store_active.push( { _table_id: protoMdl.table_id, _partition: "Table", _aspect: "default", _key: 'sortCol', _type: 'string', _value: '' } );
    fullDef._key_value_store_active.push( { _table_id: protoMdl.table_id, _partition: "Table", _aspect: "default", _key: 'sortOrder', _type: 'string', _value: '' } );

    var settings = protoMdl.formDef.specification.settings;
    var formInstanceName = that.getSettingValue(settings, 'instance_name');
    var xmlInstanceName = that.getSettingValue(settings, 'xml_instance_name');
    if ( xmlInstanceName === undefined || xmlInstanceName === null ) {
        xmlInstanceName = formInstanceName;
    }
    var xmlRootElementName = that.getSettingValue(settings, 'xml_root_element_name');
    var xmlDeviceIdPropertyName = that.getSettingValue(settings, 'xml_device_id_property_name');
    var xmlUserIdPropertyName = that.getSettingValue(settings, 'xml_user_id_property_name');
    var xmlBase64RsaPublicKey = that.getSettingValue(settings, 'xml_base64_rsa_public_key');
    var xmlSubmissionUrl = that.getSettingValue(settings, 'xml_submission_url');

    if ( xmlInstanceName !== undefined && xmlInstanceName !== null ) {
        fullDef._key_value_store_active.push( { _table_id: protoMdl.table_id, _partition: "Table", _aspect: "default", _key: 'xmlInstanceName', _type: 'string', _value: xmlInstanceName } );
    }
    if ( xmlRootElementName !== undefined && xmlRootElementName !== null ) {
        fullDef._key_value_store_active.push( { _table_id: protoMdl.table_id, _partition: "Table", _aspect: "default", _key: 'xmlRootElementName', _type: 'string', _value: xmlRootElementName } );
    }
    if ( xmlDeviceIdPropertyName !== undefined && xmlDeviceIdPropertyName !== null ) {
        fullDef._key_value_store_active.push( { _table_id: protoMdl.table_id, _partition: "Table", _aspect: "default", _key: 'xmlDeviceIdPropertyName', _type: 'string', _value: xmlDeviceIdPropertyName } );
    }
    if ( xmlUserIdPropertyName !== undefined && xmlUserIdPropertyName !== null ) {
        fullDef._key_value_store_active.push( { _table_id: protoMdl.table_id, _partition: "Table", _aspect: "default", _key: 'xmlUserIdPropertyName', _type: 'string', _value: xmlUserIdPropertyName } );
    }
    if ( xmlBase64RsaPublicKey !== undefined && xmlBase64RsaPublicKey !== null ) {
        fullDef._key_value_store_active.push( { _table_id: protoMdl.table_id, _partition: "Table", _aspect: "default", _key: 'xmlBase64RsaPublicKey', _type: 'string', _value: xmlBase64RsaPublicKey } );
    }
    if ( xmlSubmissionUrl !== undefined && xmlSubmissionUrl !== null ) {
        fullDef._key_value_store_active.push( { _table_id: protoMdl.table_id, _partition: "Table", _aspect: "default", _key: 'xmlSubmissionUrl', _type: 'string', _value: xmlSubmissionUrl } );
    }
    
    protoMdl.dataTableModel = dataTableModel;
    return fullDef;
},
getSettingValue: function(settings, id) {
    var entry = settings[id];
    if ( entry !== undefined && entry !== null ) {
        var value = entry.value;
        if ( value === undefined ) {
            return null;
        }
        return value;
    } else {
        return null;
    }
}
};
});
