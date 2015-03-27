/**
 * The w3c WebSQL http://www.w3.org/TR/webdatabase/
 * database is the basis for the Chrome-based execution of ODK Survey
 * On the device, we need to share the database between the Java layer
 * and the WebKit. Beginning with KitKat, this is not possible because
 * the WebKit manages the location of the database directly and does 
 * not allow the setting of the database directory path on the device.
 * To circumvent this, we must implement our own version of this API
 * that invokes the database through an injected Java implementation
 * (dbshim). 
 * 
 * This interface wrapper abstracts away the alternative implementation
 * and provides the base w3c asynchronous database API to the WebKit.
 *
 * Non-conformance:
 *   version is not supported
 *   changeVersion is not supported
 *   pre-flight and post-flight actions are not supported
 *   parsing of the SQL happens at the time of execution.
 *   bind array is copied and saved until the time of execution.
 *   inserts do not return rowid of the inserted record.
 *   updates and deletes do not report the number of rows changed.
 *
 */
window.dbif = window.dbif || {
  // private data
  _generation: "-",
  // private data
  _dbshimDbMap: {},
  _replaceResultSetRows: function(resultSet) {
    // if there is a rows element, create an item(i) accessor on it.
    var rows = resultSet['rows'];
    if ( rows !== null && rows !== undefined ) {
        rows.item = function(i) {
            return rows[i];
        };
    }
    return resultSet;
  },
  dbshimCleanupCallback: function(generation) {
    // Everything but the indicated generation was cleaned up on 
    // the Java side; if we have any outstanding transactions for 
    // any generations not matching 'generation', then fire the 
    // error handler for them.
    if ( this._submissionDb && this._submissionDb._generation !== generation ) {
        this._submissionDb = false;
    }
    var genList = [];
    for ( var candidateGeneration in this._dbshimDbMap ) {
        if ( this._dbshimDbMap.hasOwnProperty(candidateGeneration) ) {
            if ( candidateGeneration !== generation ) {
                genList.push(this._dbshimDbMap[candidateGeneration]);
            }
        }
    }
    for ( var db in genList ) {
        delete this._dbshimDbMap[db._generation];
        for ( var transaction in db._transactionMap ) {
            if ( !db._transactionMap.hasOwnProperty(transaction) ) {
                continue;
            }
            transaction._error = { code: 0, message: 'aborted' };
            try {
                // call error handler
                if ( transaction._errorHandler !== null && transaction._errorHandler !== undefined ) {
                    (transaction._errorHandler)(transaction._error);
                }
            } catch (e) {
                shim.log('E',"exception during transaction error handler: " + String(e));
            }
        }
    }
  },
  dbshimTransactionCallback: function(generation, transactionGeneration, resultOutcome) {
    var that = this;
    var errList;
    var db = that._dbshimDbMap[generation];
    if ( db !== null && db !== undefined ) {
        var transaction = db._transactionMap[transactionGeneration];
        if ( transaction !== null && transaction !== undefined ) {
            // OK we have the callbacks that we should reply with
            var outcome = JSON.parse(resultOutcome);
            if ( outcome.error !== null && outcome.error !== undefined ) {
                if ( transaction._error !== null && transaction._error !== undefined ) {
                    errList = transaction._error.message + "\n" + outcome.error;
                    transaction._error = { code: 0, message: errList };
                } else {
                    transaction._error = { code: 0, message: outcome.error };
                }
            }
            
            try {
                if ( transaction._error ) {
                    try {
                        // call error handler
                        if ( transaction._errorHandler !== null && transaction._errorHandler !== undefined ) {
                            (transaction._errorHandler)(transaction._error);
                        }
                    } catch (e) {
                        shim.log('E',"exception during transaction error handler: " + String(e));
                        throw e;
                    } finally {
                        delete db._transactionMap[transactionGeneration];
                    }
                } else {
                    try {
                        // call success handler
                        if ( transaction._successHandler !== null && transaction._successHandler !== undefined ) {
                            (transaction._successHandler)();
                        }
                    } catch (e) {
                        shim.log('E',"exception during transaction success handler: " + String(e));
                        throw e;
                    } finally {
                        delete db._transactionMap[transactionGeneration];
                    }
                }
            } finally {
                // we are queuing transactions to execute sequentially
                // now that this transaction is complete, fire the next one.
                shim.log('I',"active trans gen " + db._activeTransactionGeneration + 
                            " prev gen: " + transactionGeneration );
                var curTransaction = null;
                if ( db._activeTransactionGeneration <= db._transactionGeneration ) {
                    do {
                        db._activeTransactionGeneration = db._activeTransactionGeneration + 1;
                        curTransaction = db._transactionMap[db._activeTransactionGeneration];
                    } while ( (curTransaction === undefined || curTransaction === null) && 
                              db._activeTransactionGeneration < db._transactionGeneration );
                }
                if ( curTransaction !== null && curTransaction !== undefined ) {
                    shim.log('I',"trans callback: active trans gen " + db._activeTransactionGeneration + " cur gen: " + 
                                    curTransaction._transactionGeneration );
                    shim.log('I',"dbif: trigger first action in transaction: " + 
                        db._activeTransactionGeneration + " after outcome handler" );
                    curTransaction._takeNextAction(0);
                }
            }
        }
    }
  },
  dbshimCallback: function(generation, transactionGeneration, actionIndex, resultOutcome ) {
    var that = this;
    var errList;
    var db = that._dbshimDbMap[generation];
    if ( db !== null && db !== undefined ) {
        var transaction = db._transactionMap[transactionGeneration];
        if ( transaction !== null && transaction !== undefined ) {
            var sqlStmt = transaction._actionArray[actionIndex];
            transaction._actionArray[actionIndex].done = true;
            // OK we have the callbacks that we should reply with
            var outcome = JSON.parse(resultOutcome);
            if ( outcome.error !== null && outcome.error !== undefined ) {
                try {
                    if ( sqlStmt.statementErrorHandler !== null && sqlStmt.statementErrorHandler !== undefined ) {
                        (sqlStmt.statementErrorHandler)( transaction, { code: outcome.errorCode,
                                                                        message: outcome.error } );
                    }
                } catch ( e ) {
                    if ( transaction._error ) {
                        errList = transaction._error.message + "\n" + String(e);
                        transaction._error = { code: 0, message: errList };
                    } else {
                        transaction._error = { code: 0, message: String(e) };
                    }
                    shim.log('E',"exception during error handler for " + sqlStmt.sqlStmt + " bindings: " + JSON.stringify(sqlStmt.sqlBinds));
                }
            } else {
                try {
                    outcome = that._replaceResultSetRows(outcome);
                    if ( sqlStmt.statementCallback !== null && sqlStmt.statementCallback !== undefined ) {
                        (sqlStmt.statementCallback)( transaction, outcome );
                    }
                } catch ( e ) {
                    if ( transaction._error ) {
                        errList = transaction._error.message + "\n" + String(e);
                        transaction._error = { code: 0, message: errList };
                    } else {
                        transaction._error = { code: 0, message: String(e) };
                    }
                    shim.log('E',"exception during statement callback for " + sqlStmt.sqlStmt + " bindings: " + JSON.stringify(sqlStmt.sqlBinds));
                }
            }
            // and either report a transaction error or process the next record...
            var nextIdx = actionIndex + 1;
            transaction._takeNextAction(nextIdx);
        }
    }
  },
  // private data
  _submissionDb:false,
  // private method to construct a wrapper to the error handler
  // that will call the close-database method on failure.
  _genErrorWrapper: function(errorHandler) {
        var that = this;
        return function(error) {
        try {
            if (errorHandler) {
                (errorHandler)(error);
            }
        } finally {
            that.w3cSqlCloseDatabase();
        }
    };
  },
  // public close-database method
  w3cSqlCloseDatabase: function() {
    if ( window.dbshim !== null && window.dbshim !== undefined ) {
        if ( this._submissionDb ) {
            delete this._dbshimDbMap[this._submissionDb._generation];
        }
    }
    this._submissionDb = false;
  },
  // public method to return whether or not the database is already open.
  w3cSqlIsOpen: function() { return !( !this._submissionDb ); },
  // public method to return whether or not the w3c WebSQL database
  // is supported in this environment.
  w3cSqlIsUnsupported: function() { return (!window.dbshim && !window.openDatabase); },
  // public method to initiate a transaction on the opened database
  w3cSqlTransaction: function(transactionBody, errorHandler, successHandler) {
    var that = this;
    var errorWrapper = that._genErrorWrapper(errorHandler);
    that._submissionDb.transaction(transactionBody, errorWrapper, successHandler);
  },
  // public method to open the database, execute the initializerTransactionBody
  // within a transaction on the database, and, if successful, 
  // execute the transactionBody within a new transaction on that database.
  w3cSqlOpenAndInitializeDatabase: function(shortName, version, displayName, maxSize, 
        initializerTransactionBody, transactionBody, errorHandler, successHandler) {
        var that = this;
        var w3cDatabase = null;
        // construct a UUID (from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript )
        that._generation = "uuid:" + 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = (c === 'x') ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        var thisGen = that._generation;
        if ( window.dbshim === null || window.dbshim === undefined ) {
            w3cDatabase = window.openDatabase(shortName, version, displayName, maxSize);
        } else {
            window.dbshim.confirmSettings(thisGen);
            w3cDatabase = {
                _generation: thisGen,
                _activeTransactionGeneration: 0,
                _transactionGeneration: 0,
                _transactionMap: {},
                transaction: function (transactionBody, errorHandler, successHandler) {
                    var that = this;
                    var transGen = that._transactionGeneration;
                    that._transactionGeneration = that._transactionGeneration + 1;
                    var activeTransaction = {
                        _generation: that._generation,
                        _transactionGeneration: transGen,
                        _errorHandler: errorHandler,
                        _successHandler: successHandler,
                        _actionArray: [],
                        _takeNextAction: function(nextIdx) {
                            var that = this;
                            // and either report a transaction error or process the next record...
                            if ( that._error !== null && that._error !== undefined ) {
                                // this calls back dbif.dbshimTransactionCallback(generation, transactionGeneration, resultOutcome )
                                window.dbshim.rollback(that._generation, that._transactionGeneration);
                            } else if ( nextIdx < that._actionArray.length ) {
                                // process the next statement...
                                var binds = that._actionArray[nextIdx].sqlBinds;
                                if ( binds === null || binds === undefined ) {
                                    binds = null;
                                } else {
                                    binds = JSON.stringify(binds);
                                }
                                // this calls back dbif.dbshimCallback(generation, transactionGeneration, actionIndex, resultOutcome )
                                window.dbshim.executeSqlStmt(that._generation, that._transactionGeneration, nextIdx, that._actionArray[nextIdx].sqlStmt, binds);
                            } else {
                                // this calls back dbif.dbshimTransactionCallback(generation, transactionGeneration, resultOutcome )
                                window.dbshim.commit(that._generation, that._transactionGeneration);
                            }
                        },
                        executeSql: function(sqlStmt, sqlBinds, statementCallback, statementErrorHandler) {
                            var that = this;
                            that._actionArray[that._actionArray.length] = {
                                sqlStmt: sqlStmt,
                                sqlBinds: sqlBinds.slice(0),
                                statementCallback: statementCallback,
                                statementErrorHandler: statementErrorHandler };
                        }
                    };
                    that._transactionMap[transGen] = activeTransaction;
                    try {
                        (transactionBody)(activeTransaction);
                    } catch ( e ) {
                        shim.log('E',"exception during execution of the transactionBody " + String(e));
                        if ( activeTransaction._error ) {
                            var errList = activeTransaction._error.message + "\n" + String(e);
                            activeTransaction._error = { code: 0, message: errList };
                        } else {
                            activeTransaction._error = { code: 0, message: String(e) };
                        }
                        // this calls back dbif.dbshimTransactionCallback(generation, transactionGeneration, resultOutcome )
                        window.dbshim.rollback(that._generation, activeTransaction._transactionGeneration);
                        return;
                    }
                    // defer actions if we are not the active transaction.
                    shim.log('I',"active trans gen " + that._activeTransactionGeneration + " cur gen: " + 
                                    activeTransaction._transactionGeneration );
                    if ( that._activeTransactionGeneration === activeTransaction._transactionGeneration ) {
                        // and now execute all the statements in a transaction...
                        activeTransaction._takeNextAction(0);
                    }
                },
                changeVersion: function() {
                    throw new Error("unsupported");
                }
            };
        }
        that._dbshimDbMap[thisGen] = w3cDatabase;
        var errorWrapper = that._genErrorWrapper(errorHandler);
        var successWrapper = function() {
            that._submissionDb = w3cDatabase;
            shim.log('I',"withDb.createDb.initializerTransacton.success");
            that.w3cSqlTransaction(transactionBody, errorWrapper, successHandler);
        };
        w3cDatabase.transaction(initializerTransactionBody, errorWrapper, successWrapper);
  }
};
