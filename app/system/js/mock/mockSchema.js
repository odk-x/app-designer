define(['mockUtils'],function(mockUtils) {
/* global odkCommon */
'use strict';
verifyLoad('mockSchema',
    ['mockUtils'],
    [mockUtils]);
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
                     _default_access: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' },
                     _row_owner: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' },
                     _group_read_only: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' },
                     _group_modify: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' },
                     _group_privileged: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' },
                     _form_id: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' },
                     _locale: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' },
                     _savepoint_type: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' },
                     _savepoint_timestamp: { type: 'string', isNotNullable: true, elementSet: 'instanceMetadata' },
                     _savepoint_creator: { type: 'string', isNotNullable: false, elementSet: 'instanceMetadata' } },
tableDefinitionsPredefinedColumns: {
                    _table_id: { type: 'string', isNotNullable: true, dbColumnConstraint: 'PRIMARY KEY', elementPath: 'tableId', elementSet: 'tableMetadata' },
                    _schema_etag: { type: 'string', isNotNullable: false, elementPath: 'schemaETag', elementSet: 'tableMetadata' },
                    _last_data_etag: { type: 'string', isNotNullable: false, elementPath: 'lastDataETag', elementSet: 'tableMetadata' },
                    _last_sync_time: { type: 'integer', isNotNullable: true, elementPath: 'lastSyncTime', elementSet: 'tableMetadata' } },
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
createTableStmt: function( dbTableName, dataTableModel, tableConstraint ) {
        var that = this;
        // TODO: verify that dbTableName is not already in use...
        var createTableCmd = 'CREATE TABLE IF NOT EXISTS "' + dbTableName + '"(';
        var comma = '';
        for ( var dbColumnName in dataTableModel ) {
			if ( dataTableModel.hasOwnProperty(dbColumnName) ) {
				var f = dataTableModel[dbColumnName];
				if ( mockUtils.isUnitOfRetention(f) && !f.isSessionVariable ) {
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
        }
        if ( tableConstraint !== null &&  tableConstraint !== undefined ) {
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
 * add row for first time
 */
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
countRowTypeStmt:function(tableDef, rowId) {
    var dbTableName = tableDef.tableId;
    var stmt;
    var bindings = [];
    stmt = 'select count(*) c_all, count(_savepoint_type) c_checkpoint from "' + dbTableName + '" where _id = ?';
    bindings.push(rowId);
    return {
        stmt : stmt,
        bind : bindings
    };
},
addChangesDataTableStmt:function(tableDef, changes, rowId) {
    var dbTableName = tableDef.tableId;
    var dataTableModel = tableDef.dataTableModel;
    var formId = changes.formId;
    delete changes.formId;
    var that = this;
    var nowNano = odkCommon.toOdkTimeStampFromDate(new Date());
    var activeUser = odkCommon.getActiveUser();

    var bindings = [];
    var processSet = {};

    var f, defElement, elementPathPair, v;
    var comma = '';
    changes._id = rowId;
    var stmt = 'insert into "' + dbTableName + '" (';
    for ( f in dataTableModel ) {
		if ( dataTableModel.hasOwnProperty(f) ) {
			defElement = dataTableModel[f];
			if ( mockUtils.isUnitOfRetention(defElement) && !defElement.isSessionVariable ) {
				stmt += comma;
				comma = ', ';
				stmt += '"' + f + '"';
			}
		}
    }
    stmt += ") values (";
    comma = '';
    for (f in dataTableModel) {
		if ( dataTableModel.hasOwnProperty(f) ) {
			defElement = dataTableModel[f];
			if ( mockUtils.isUnitOfRetention(defElement) && !defElement.isSessionVariable ) {
				stmt += comma;
				comma = ', ';
				var elementPath = defElement.elementPath;
				// don't allow working with elementKey primitives if not manipulating metadata
				if (( elementPath === undefined || elementPath === null ) &&
					  defElement.elementSet === 'instanceMetadata') {
					elementPath = f;
				}
				// TODO: get kvElement for this elementPath
				elementPathPair = mockUtils.getElementPathPairFromChanges(changes, elementPath);
				if ( elementPathPair !== null && elementPathPair !== undefined ) {
					v = elementPathPair.value;
					// track that we matched the keyname...
					processSet[elementPathPair.elementPath] = true;
					if (v === undefined || v === null) {
						stmt += "null";
					} else {
						v = mockUtils.toDatabaseFromOdkDataInterfaceElementType(defElement, v);
						stmt += "?";
						bindings.push(v);
					}
				} else if ( f === "_savepoint_timestamp" ) {
					stmt += "?";
					bindings.push(nowNano);
				} else if (f === "_savepoint_creator") {
					stmt += "?";
					bindings.push(activeUser);
				} else if ( f === "_sync_state" ) {
					stmt += "?";
					bindings.push('new_row');
				} else if ( f === "_form_id" ) {
					stmt += "?";
					bindings.push(formId);
				} else {
					stmt += "null";
				}
			}
		}
    }
    stmt += ');';

    for ( f in changes ) {
		if ( changes.hasOwnProperty(f) ) {
			if ( processSet[f] !== true && f.charAt(0) !== '_') {
				console.error("insertNewKeyValueMapDataTableStmt: changes contains unrecognized database column " + dbTableName + "." + f );
			}
		}
    }
    console.log('addChangesDataTableStmt: ' + stmt  + '\n bindings: ' + JSON.stringify(bindings));
    return {
        stmt : stmt,
        bind : bindings
        };
},
updateChangesDataTableStmt:function(tableDef, changes, rowId) {
    var dbTableName = tableDef.tableId;
    var dataTableModel = tableDef.dataTableModel;
    var formId = changes.formId;
    delete changes.formId;
    var that = this;
    var nowNano = odkCommon.toOdkTimeStampFromDate(new Date());
    var activeUser = odkCommon.getActiveUser();

    var bindings = [];
    var processSet = {};

    var f, defElement, elementPathPair, v;
    var comma = '';

    var stmt = 'update "' + dbTableName + '" set ';
    for (f in dataTableModel) {
		if ( dataTableModel.hasOwnProperty(f) ) {
			defElement = dataTableModel[f];
			if ( mockUtils.isUnitOfRetention(defElement) && !defElement.isSessionVariable ) {
				// don't allow working with elementKey primitives if not manipulating metadata
				if (( elementPath === undefined || elementPath === null ) &&
					  defElement.elementSet === 'instanceMetadata') {
					elementPath = f;
				}
				stmt += comma;
				stmt += f + " = ";
				comma = ', ';
				var elementPath = defElement.elementPath;
				// TODO: get kvElement for this elementPath
				elementPathPair = mockUtils.getElementPathPairFromChanges(changes, elementPath);
				if ( elementPathPair !== null && elementPathPair !== undefined ) {
					v = elementPathPair.value;
					// track that we matched the keyname...
					processSet[elementPathPair.elementPath] = true;
					if (v === undefined || v === null) {
						stmt += "null";
					} else {
						v = mockUtils.toDatabaseFromOdkDataInterfaceElementType(defElement, v);
						stmt += "?";
						bindings.push(v);
					}
				} else if ( f === "_savepoint_timestamp" ) {
					stmt += "?";
					bindings.push(nowNano);
				} else if (f === "_savepoint_creator") {
					stmt += "?";
					bindings.push(activeUser);
				} else if ( f === "_sync_state" ) {
					stmt += "case when _sync_state='new_row' then 'new_row' else 'changed' end";
				} else if ( f === "_form_id" ) {
					stmt += "?";
					bindings.push(formId);
				}
			}
		}
    }
    stmt += ' where _id = ? and _savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + dbTableName + '" as V where V._id=? )';
    bindings.push(rowId);
    bindings.push(rowId);

    for ( f in changes ) {
        if ( processSet[f] !== true && f.charAt(0) !== '_' ) {
            console.error("insertNewKeyValueMapDataTableStmt: changes contains unrecognized database column " + dbTableName + "." + f );
        }
    }
    console.log('updateChangesDataTableStmt: ' + stmt  + '\n bindings: ' + JSON.stringify(bindings));
    return {
        stmt : stmt,
        bind : bindings
        };
},
insertCheckpointChangesDataTableStmt:function(tableDef, changes, rowId) {
    var dbTableName = tableDef.tableId;
    var dataTableModel = tableDef.dataTableModel;
    var formId = changes.formId;
    delete changes.formId;
    var that = this;
    var nowNano = odkCommon.toOdkTimeStampFromDate(new Date());
    var activeUser = odkCommon.getActiveUser();

    var bindings = [];
    var processSet = {};

    var f, defElement, elementPathPair, v;
    var comma = '';
    changes._id = rowId;
    var stmt = 'insert into "' + dbTableName + '" (';
    for ( f in dataTableModel ) {
		if ( dataTableModel.hasOwnProperty(f) ) {
			defElement = dataTableModel[f];
			if ( mockUtils.isUnitOfRetention(defElement) && !defElement.isSessionVariable ) {
				stmt += comma;
				comma = ', ';
				stmt += '"' + f + '"';
			}
		}
    }
    stmt += ") select ";
    comma = '';
    for (f in dataTableModel) {
		if ( dataTableModel.hasOwnProperty(f) ) {
			defElement = dataTableModel[f];
			if ( mockUtils.isUnitOfRetention(defElement) && !defElement.isSessionVariable ) {
				stmt += comma;
				comma = ', ';
				var elementPath = defElement.elementPath;
				// don't allow working with elementKey primitives if not manipulating metadata
				if (( elementPath === undefined || elementPath === null ) &&
					  defElement.elementSet === 'instanceMetadata') {
					elementPath = f;
				}
				// TODO: get kvElement for this elementPath
				elementPathPair = mockUtils.getElementPathPairFromChanges(changes, elementPath);
				if ( elementPathPair !== null && elementPathPair !== undefined ) {
					v = elementPathPair.value;
					// track that we matched the keyname...
					processSet[elementPathPair.elementPath] = true;
					if (v === undefined || v === null) {
						stmt += "null";
					} else {
						v = mockUtils.toDatabaseFromOdkDataInterfaceElementType(defElement, v);
						stmt += "?";
						bindings.push(v);
					}
				} else if (f === "_savepoint_timestamp") {
					stmt += "?";
					bindings.push(nowNano);
				} else if (f === "_savepoint_creator") {
					stmt += "?";
					bindings.push(activeUser);
				} else if ( f === "_form_id" ) {
					stmt += "?";
					bindings.push(formId);
				} else if ( f === "_savepoint_type" ) { // if not specified explicitly
					stmt += "null";
				} else if ( f === "_sync_state" ) {
					stmt += "case when _sync_state='new_row' then 'new_row' else 'changed' end";
				} else {
					stmt += '"' + f + '"';
				}
			}
		}
    }
    stmt += ' from "' + dbTableName + '" as T where _id=? and ' +
        'T._savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + dbTableName + '" as V where V._id=T._id)';
    bindings.push(rowId);

    for ( f in changes ) {
        if ( processSet[f] !== true && f.charAt(0) !== '_' ) {
            console.error("insertNewKeyValueMapDataTableStmt: changes contains unrecognized database column " + dbTableName + "." + f );
        }
    }
    console.log('insertCheckpointChangesDataTableStmt: ' + stmt + '\n bindings: ' + JSON.stringify(bindings));
    return {
        stmt : stmt,
        bind : bindings
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
selectAllTableDbNamesAndIdsDataStmt: function() {
    return {
            stmt: 'select _table_id from _table_definitions',
            bind: []
        };
}
};
});
