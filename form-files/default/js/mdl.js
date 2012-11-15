/**
 * Global object that is the container for 
 * - formDef
 * - model structure metadata
 * - instance metadata
 * - survey instance data
 *
 * The data is accessed via the database.js utilities.
 * Those utilities are responsible for write-through
 * update of the database.  Data is cached here to 
 * simplify Javascript user-defined expression coding.
 * 
 * The W3C SQLite database has an asynchronous 
 * interaction model.
 * 
 */
define({"data":{}, "qp":{}});