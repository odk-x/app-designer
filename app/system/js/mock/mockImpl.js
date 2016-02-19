define(['mockSchema', 'mockDbif', 'jquery'],function(mockSchema, mockDbif, $) {
'use strict';
verifyLoad('mockImpl',
    ['mockSchema', 'mockDbif', 'jquery'],
    [ mockSchema,   mockDbif,   $]);
return {
  pendingChanges: {},
  withDb:function(ctxt, transactionBody) {
    var inContinuation = false;
    ctxt.log('D','mockImpl.withDb');
    ctxt.sqlStatement = null;
    var that = this;
    try {
        if ( mockDbif.w3cSqlIsOpen() ) {
            mockDbif.w3cSqlTransaction(transactionBody, function(error) {
                    if ( ctxt.sqlStatement !== null && ctxt.sqlStatement !== undefined ) {
                        ctxt.log('E',"withDb.transaction.error.sqlStmt", ctxt.sqlStatement.stmt);
                        ctxt.log('E',"withDb.transaction.error.sqlBinds", ctxt.sqlStatement.bind);
                    }
                    ctxt.log('E',"withDb.transaction.error", error.message);
                    ctxt.log('E',"withDb.transaction.error.transactionBody", transactionBody.toString());
                    inContinuation = true;
                    ctxt.failure({message: "Error while accessing or saving values to the database."});
                    }, function() {
                        ctxt.log('D',"withDb.transaction.success");
                        inContinuation = true;
                        ctxt.success();
                    });
        } else if(mockDbif.w3cSqlIsUnsupported() ) {
            ctxt.log('E','mockImpl.withDb.notSupported w3c SQL interface is not supported');
            inContinuation = true;
            ctxt.failure({message: "Web client does not support the W3C SQL database standard."});
        } else {
            var settings = {shortName: "odk", version: "1", displayName: "ODK Instance Database", maxSize: 65536};
            mockDbif.w3cSqlOpenAndInitializeDatabase(
                settings.shortName, settings.version, settings.displayName, settings.maxSize,
                // initialize the database...
                function(transaction) {
                    var td;
                    td = mockSchema.createTableStmt('_column_definitions', 
                                                mockSchema.columnDefinitionsPredefinedColumns,
                                                mockSchema.columnDefinitionsTableConstraint );
                    ctxt.sqlStatement = td;
                    transaction.executeSql(td.stmt, td.bind);
                    td = mockSchema.createTableStmt('_key_value_store_active', 
                                                mockSchema.keyValueStoreActivePredefinedColumns,
                                                mockSchema.keyValueStoreActiveTableConstraint );
                    ctxt.sqlStatement = td;
                    transaction.executeSql(td.stmt, td.bind);
                    td = mockSchema.createTableStmt('_table_definitions', 
                                                mockSchema.tableDefinitionsPredefinedColumns);
                    ctxt.sqlStatement = td;
                    transaction.executeSql(td.stmt, td.bind);
                    ctxt.sqlStatement = null;
                }, 
                // transaction to invoke...
                transactionBody,
                function(error) {
                    if ( ctxt.sqlStatement !== null && ctxt.sqlStatement !== undefined ) {
                        ctxt.log('E',"withDb.createDb.transaction.error.sqlStmt", ctxt.sqlStatement.stmt);
                        ctxt.log('E',"withDb.createDb.transaction.error.sqlBinds", ctxt.sqlStatement.bind);
                    }
                    ctxt.log('E',"withDb.createDb.transaction.error", error.message);
                    ctxt.log('E',"withDb.createDb.transaction.error.transactionBody", "initializing database tables");
                    inContinuation = true;
                    ctxt.failure({message: "Error while initializing database tables."});
                }, function() {
                    ctxt.log('D',"withDb.afterCreateDb.transaction.success");
                    inContinuation = true;
                    ctxt.success();
                });
        }
    } catch(e) {
        mockDbif.w3cSqlCloseDatabase();
        // Error handling code goes here.
        if ( ctxt.sqlStatement !== null && ctxt.sqlStatement !== undefined ) {
            ctxt.log('E',"withDb.exception.sqlStmt", ctxt.sqlStatement.stmt);
        }
        if(e.INVALID_STATE_ERR) {
            // Version number mismatch.
            ctxt.log('E','withDb.exception', 'invalid database version');
        } else {
            ctxt.log('E','withDb.exception', 'unknown error: ' + e.message + " e: " + String(e));
        }
        if ( !inContinuation ) {
            try {
                ctxt.failure({message: "Exception while accessing or saving values to the database."});
            } catch(e) {
                ctxt.log('E','withDb.ctxt.failure.exception caught while executing ctxt.failure(msg)', 'unknown error: ' + e.message + " e: " + String(e));
                alert('Fatal error while accessing or saving values to database');
            }
        } else {
            ctxt.log('E',"withDb: Unrecoverable Internal Error: Exception during success/failure continuation");
            alert('Fatal error while accessing or saving values to database');
        }
        return;
    }
},
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
/// APIs replicated from opendatakit to allow data table creation
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
purge:function(ctxt) {
    throw new Error("this is never called -- see app-designer/devEnv/tab1.html -- that is the purge button (needs impl on appDesigner)");
    
    var that = this;
    ctxt.log('I','mockImpl.purge.initiated');
    var tableSets = [];
    that.withDb( $.extend({},ctxt,{success:function() {
            // OK we have tableSets[] constructed.
            // Now drop all those tables and delete contents from metadata tables
            that.withDb( ctxt, function(transaction) {
                var i, sql, tableEntry;
                for ( i = 0 ; i < tableSets.length ; ++i ) {
                    tableEntry = tableSets[i];
                    sql = mockSchema.dropTableStmt(tableEntry.table_id);
                    ctxt.sqlStatement = sql;
                    transaction.executeSql(sql.stmt, sql.bind);
                }
                sql = mockSchema.deleteEntireTableContentsTableStmt('key_value_store_active');
                ctxt.sqlStatement = sql;
                transaction.executeSql(sql.stmt, sql.bind);
                
                sql = mockSchema.deleteEntireTableContentsTableStmt('_column_definitions');
                ctxt.sqlStatement = sql;
                transaction.executeSql(sql.stmt, sql.bind);

                sql = mockSchema.deleteEntireTableContentsTableStmt('_table_definitions');
                ctxt.sqlStatement = sql;
                transaction.executeSql(sql.stmt, sql.bind);
            });
        }}), function(transaction) {
        var is = mockSchema.selectAllTableDbNamesAndIdsDataStmt();
        ctxt.sqlStatement = is;
        transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
            var len = result.rows.length;
            var i, row, tableEntry;
            for ( i = 0 ; i < len ; ++i ) {
                row = result.rows.item(i);
                tableEntry = { table_id: row._table_id };
                tableSets.push(tableEntry);
            }
        });
    });
}
};
});
