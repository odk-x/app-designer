/**
 * The SQLite WebAssembly project (https://sqlite.org/wasm/doc/trunk/api-index.md) provides a javascript accessible
 * database which is the basis for the app-designer implementation of ODK-X Survey.
 * On the device, we use the odkDataIf abstraction.
 * Detect whether we are on chrome or not and either fail or pass to the mock implementation.
 *
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
const log = console.log;
const warn = console.warn;
const error = console.error;
const ensureArray = (value) => {
  if (!Array.isArray(value)) 
      return [value];  
  return value;
}

define([], function() {
/* global odkCommon */
'use strict';
return {  
  _db:null,

  // public close-database method
  closeDatabase: function() {
    this._db?.close();
    this._db = null;
  },

  // public method to return whether or not the database is already open.
  isDbOpen: function() {
    return this._db && this._db.isOpen()
  },

  // public method to initiate a transaction on the opened database
  // transactionBody: A string or an array of string representing the sql statements to execute
  execTransaction: function(transactionBody, errorHandler, successHandler) {
    var that = this;
    transactionBody = ensureArray(transactionBody);

    // Create a wrapper object that sort of acts like the transaction object used by web sql
    const fnLegacyTransactionObject = function(db) {
      return {
        executeSql: function(sqlStmt, bindVar, fnCallback) {
          var res = db.exec({
            sql : sqlStmt,
            bind : bindVar,
            rowMode: 'object', // 'object' or 'array'
            returnValue: 'resultRows'
          });
          fnCallback(this, legacyRowsWrapper(res));
        }
      }
    }

    const legacyRowsWrapper = function(res) {
      return {
        _raw:res,
        rows: {
          item: (index)=>legacyItemWrapper(res[index]),
          length: res.length
        }
      }
    }

    const legacyItemWrapper = function(obj) {
      var x = {...obj};
      x.hasOwnProperty = prop => Object.prototype.hasOwnProperty.call(obj, prop);
      return x;
    }

    try {      
      that._db.transaction((db) => {

        // If this throws, transaction will be rolled back
        transactionBody.forEach(element => {
          if (typeof element === 'function') {
            element(fnLegacyTransactionObject(db));
          } else { // assume it is a simple string type sql statement
            db.exec(element);
          }
        });
      });
      successHandler();
    } catch(e) {
      console.error("Transaction rolled back due to exception:", e);
      if (e instanceof sqlite3.SQLite3Error) {
        errorHandler(e);
      } else {
        throw e;
      }
    }
  },

  // public method to open the database, execute the initializerTransactionBody
  // within a transaction on the database, and, if successful, 
  // execute the transactionBody within a new transaction on that database.
  initializeDatabase: function(initializerTransactionBody, transactionBody, errorHandler, successHandler) {
    const that = this;
    log("Loading and initializing sqlite3 module...");
    if(globalThis.window!==globalThis) {
      let sqlite3Js = 'sqlite3.js';
      const urlParams = new URL(globalThis.location.href).searchParams;
      if(urlParams.has('sqlite3.dir')){
        sqlite3Js = urlParams.get('sqlite3.dir') + '/' + sqlite3Js;
      }
      importScripts(sqlite3Js);
    }

    globalThis.sqlite3InitModule({    
      print: log,
      printErr: error
    }).then(function(sqlite3){
      globalThis.sqlite3 = sqlite3;
      const capi = sqlite3.capi; /*C-style API*/
      const oo = sqlite3.oo1; /*high-level OO API*/;
      
      log(`sqlite3 version: ${capi.sqlite3_libversion()}`);
      
      let db;

      try {
        db = new oo.DB(':localStorage:','ct'); //:localStorage: is a special string, that causes the db file to live in localstorage. 'ct' is (c)reatemode + (t)race sql (ref: https://sqlite.org/wasm/doc/trunk/api-oo1.md#db)
        that._db = db;
        log(`Opened/Created db: ${db.filename}`);
      } catch (e) {
        error("Exception while creating/opening db:",e.message);
        throw e;
      }
      
      try {
        var initSuccessHandler = function() {
            odkCommon.log('I',"withDb.createDb.initializerTransacton.success");
            that.execTransaction(transactionBody, errorHandler, successHandler);
        };

        that.execTransaction(initializerTransactionBody, errorHandler, initSuccessHandler);
      } catch(e){
        console.error("Exception while executing transaction:",e);
        db?.close;
      } finally {
        // Leaving it up to caller to explicitly call 'closeDatabase' (failing to do so will cause a memory leak!)
      }
    })
        
  }
};
});
