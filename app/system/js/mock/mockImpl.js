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
        if ( mockDbif.isDbOpen() ) {
            mockDbif.execTransaction(transactionBody, function(error) {
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
        } else {            
            mockDbif.initializeDatabase(
                // initialize statements
                [
                    mockSchema.createTableStmt('_column_definitions', mockSchema.columnDefinitionsPredefinedColumns, mockSchema.columnDefinitionsTableConstraint ),
                    mockSchema.createTableStmt('_key_value_store_active', mockSchema.keyValueStoreActivePredefinedColumns, mockSchema.keyValueStoreActiveTableConstraint ),
                    mockSchema.createTableStmt('_table_definitions', mockSchema.tableDefinitionsPredefinedColumns)
                ], 
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
        mockDbif.closeDatabase();
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
};
});
