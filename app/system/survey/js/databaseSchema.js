'use strict';
// TODO: Instance level: locale (used), at Table level: locales (available), formPath, 
define(['databaseUtils','opendatakit'], function(databaseUtils,opendatakit) {
verifyLoad('databaseSchema',
    ['databaseUtils','opendatakit'],
    [ databaseUtils,  opendatakit]);
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
accumulateUnitOfRetentionUpdates:function(dbTableName, dataTableModel, formId, instanceId, kvMap, accumulatedChanges) {
    var that = this;

    var processSet = {};
    
    var f, defElement, elementPathPair, kvElement, v;

    for (f in dataTableModel) {
        defElement = dataTableModel[f];
        if ( databaseUtils.isUnitOfRetention(defElement) ) {
            var elementPath = defElement['elementPath'];
            // don't allow working with elementKey primitives if not manipulating metadata
            if (( elementPath === undefined || elementPath === null ) && 
                  defElement.elementSet === 'instanceMetadata') {
                elementPath = f;
            }
            // TODO: get kvElement for this elementPath
            elementPathPair = databaseUtils.getElementPathPairFromKvMap(kvMap, elementPath);
            if ( elementPathPair !== null && elementPathPair !== undefined ) {
                kvElement = elementPathPair.element;
                // track that we matched the keyname...
                processSet[elementPathPair.elementPath] = true;
                if (kvElement.value === undefined || kvElement.value === null) {
                    if ( !defElement.isSessionVariable ) {
                        if ( instanceId !== null && instanceId !== undefined ) {
                            accumulatedChanges[f] = {"elementPath" : elementPath, "value": null};
                        }
                    } else {
                        odkCommon.setSessionVariable(elementPath, JSON.stringify(null));
                    }
                } else {
                    // the odkData layer works directly on the value
                    // but session variables need the storage value...
                    if ( !defElement.isSessionVariable ) {
                        if ( instanceId !== null && instanceId !== undefined ) {
                            accumulatedChanges[f] = {"elementPath" : elementPath, "value": kvElement.value};
                        }
                    } else {
                        v = databaseUtils.toSerializationFromElementType(defElement, kvElement.value, true);
                        odkCommon.setSessionVariable(elementPath, v);
                    }
                }
            }
        }
    }
    
    for ( f in kvMap ) {
        if ( processSet[f] !== true ) {
            console.error("accumulateUnitOfRetentionUpdates: kvMap contains unrecognized database column " + dbTableName + "." + f );
        }
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
    var args = ['deleted','deleted'];
    if ( selection === null || selection === undefined ) {
        return {
                stmt : 'select * from "' + dbTableName + '" as T where (_sync_state is null or _sync_state != ?) and ' + 
                    'T._savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + dbTableName +
                           '" as V where V._id=T._id and (V._sync_state is null or V._sync_state != ?))' +
                        ((orderBy === undefined || orderBy === null) ? '' : ' order by ' + orderBy),
                bind : ['deleted','deleted']    
            };
    } else {
        if (selectionArgs !== null && selectionArgs !== undefined ) {
            args = args.concat(selectionArgs);
        }
        return {
                stmt :  'select * from (select * from "' + dbTableName + '" as T where (_sync_state is null or _sync_state != ?) and ' + 
                    'T._savepoint_timestamp=(select max(V._savepoint_timestamp) from "' + dbTableName + 
                        '" as V where V._id=T._id and (V._sync_state is null or V._sync_state != ?))) where ' + selection +
                        ((orderBy === undefined || orderBy === null) ? '' : ' order by ' + orderBy),
                bind : args
            };
    }
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
        jsonDefn = databaseUtils.flattenElementPath( dataTableModel, null, f, null, protoModel.formDef.specification.model[f] );
    }

    // traverse the dataTableModel marking which elements are 
    // not units of retention.
    databaseUtils.markUnitOfRetention(dataTableModel);
    
    protoModel.dataTableModel = dataTableModel;
}
};
});
