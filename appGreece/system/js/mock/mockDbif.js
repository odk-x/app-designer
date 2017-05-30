/**
 * The w3c WebSQL http://www.w3.org/TR/webdatabase/
 * database is the basis for the Chrome-based execution of ODK Survey
 * On the device, we use the odkDataIf abstraction.
 * Detect whether we are on chrome or not and either fail or pass to the 
 * w3c implementation.
 *
 * This is a stop-gap until we rewrite the app-designer to use a 
 * custom webserver with a REST api implementing the functionality
 * in the Java odkDataIf.
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
define([], function() {
/* global odkCommon */
'use strict';
return {
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
    this._submissionDb = false;
  },
  // public method to return whether or not the database is already open.
  w3cSqlIsOpen: function() { return !( !this._submissionDb ); },
  // public method to return whether or not the w3c WebSQL database
  // is supported in this environment.
  w3cSqlIsUnsupported: function() { return (!window.openDatabase); },
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
        w3cDatabase = window.openDatabase(shortName, version, displayName, maxSize);
        var errorWrapper = that._genErrorWrapper(errorHandler);
        var successWrapper = function() {
            that._submissionDb = w3cDatabase;
            odkCommon.log('I',"withDb.createDb.initializerTransacton.success");
            that.w3cSqlTransaction(transactionBody, errorWrapper, successHandler);
        };
        w3cDatabase.transaction(initializerTransactionBody, errorWrapper, successWrapper);
  }
};
});
