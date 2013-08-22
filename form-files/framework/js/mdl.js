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
define({data: {},  // dataTable instance data values
		metadata: {}, // dataTable instance Metadata: (instanceName, locale)
		tableMetadata: {}, // table_definitions and key_value_store_active("table","global") values: table_id, tableKey, dbTableName
		columnMetadata: {},// column_definitions and key_value_store_active("column",elementKey) values: none...
		dataTableModel: {},// inverted and extended formDef.model for representing data store
		formDef: null, 
		formPath: null, 
		instanceId: null, 
		table_id: null
		});