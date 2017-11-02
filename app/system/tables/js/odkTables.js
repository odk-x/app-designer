/**
 * This represents the OdkTables object handed to the android web view in the
 * Tables code.
 *
 * It should provide all the functions available to the javascript at this
 * version of the code. This does not currently have a dual Java injection.
 * All calls are mapped to odkCommon.doAction() interactions.
 */

(function() {
  'use strict';
  /* global odkCommon */

  window.odkTables = {

    /**
     * Returns true if a variable is an array.
     */
    isArray : function(varToTest) {
      if (Object.prototype.toString.call(varToTest) === '[object Array]') {
        return true;
      } else {
        return false;
      }
    },

    /**
     * Returns true if str is a string, else false.
     */
    isString: function(str) {
      return (typeof str === 'string');
    },

    /**
     * This is a helper method to DRY out the type checking for the open*
     * methods that take the tableId, sqlWhereClause, sqlSelectionArgs, and
     * relativePath parameters.
     */
    assertOpenTypes: function(fnName, tableId, where, args, path) {
      if (!this.isString(tableId)) {
        throw fnName + '--tableId not a string';
      }
      if (where !== null &&
          where !== undefined &&
          !this.isString(where)) {
        throw fnName + '--sqlWhereClause not a string';
      }
      if (args !== null &&
          args !== undefined &&
          !this.isArray(args)) {
        throw fnName + '--sqlSelectionArgs not an array';
      }
      if (path !== null &&
          path !== undefined &&
          !this.isString(path)) {
        throw fnName + '--relativePath not a string';
      }
    },

    openTable : function(dispatchStruct, tableId, sqlWhereClause, sqlSelectionArgs) {
      if (!this.isString(tableId)) {
        throw 'openTable()--tableId not a string';
      }
      // We're checking for null and undefined because it isn't specified
      // what the Android WebKit passes in to us in the event of null or
      // overloading objects.
      if (sqlWhereClause !== null &&
          sqlWhereClause !== undefined &&
          !this.isString(sqlWhereClause)) {
        throw 'openTable()--sqlWhereClause not a string';
      }
      if (sqlSelectionArgs !== null &&
          sqlSelectionArgs !== undefined &&
          !this.isArray(sqlSelectionArgs)) {
        throw 'openTable()--sqlSelectionArgs not an array';
      }
      if (arguments.length > 4) {
        throw 'openTable()--too many arguments';
      }
      console.log('called openTable(). Unclear where to navigate,' +
                  ' so opening list view.');

      // need to JSON.stringify bind parameters so we can pass integer, numeric and boolean parameters as-is.
      var sqlSelectionArgsJSON = (sqlSelectionArgs === null || sqlSelectionArgs === undefined) ? null :
        JSON.stringify(sqlSelectionArgs);
      var extrasBundle = { sqlWhereClause: sqlWhereClause,
        // pass as JSON string so we can bind integers, numerics and booleans
        sqlSelectionArgs: sqlSelectionArgsJSON,
        // sqlGroupByArgs:
        // sqlHavingClause:
        // sqlOrderByElementKey:
        // sqlOrderByDirection:
        // appName: // automatically supplied for org.opendatakit activities
        tableId: tableId,
        // tableDisplayViewType:
        queryType: 'SimpleQuery',
        // filename:
      };

      var intentArgs = {
        extras: extrasBundle,
        // uri:      // set the data field of intent to this
        // data:     // unless data is supplied -- that takes precedence
        // type:     // set the intent type to this value
        // package:  // set the intent package to this value
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.tables.activities.TableDisplayActivity",
                                 intentArgs );
    },

    openTableToListView : function(dispatchStruct, tableId, sqlWhereClause,
                                   sqlSelectionArgs, relativePath) {
      this.assertOpenTypes('openTableToListView()',
                           tableId,
                           sqlWhereClause,
                           sqlSelectionArgs,
                           relativePath);
      if (arguments.length > 5) {
        throw 'openTableToListView()--too many arguments';
      }

      // need to JSON.stringify bind parameters so we can pass integer, numeric and boolean parameters as-is.
      var sqlSelectionArgsJSON = (sqlSelectionArgs === null || sqlSelectionArgs === undefined) ? null :
        JSON.stringify(sqlSelectionArgs);
      var extrasBundle = { sqlWhereClause: sqlWhereClause,
        // pass as JSON string so we can bind integers, numerics and booleans
        sqlSelectionArgs: sqlSelectionArgsJSON,
        // sqlGroupByArgs:
        // sqlHavingClause:
        // sqlOrderByElementKey:
        // sqlOrderByDirection:
        // appName: // automatically supplied for org.opendatakit activities
        tableId: tableId,
        tableDisplayViewType: 'LIST',
        queryType: 'SimpleQuery',
        // filename:
      };

      if ( relativePath !== null && relativePath !== undefined ) {
        extrasBundle.filename = relativePath;
      }

      var intentArgs = {
        extras: extrasBundle,
        // uri:      // set the data field of intent to this
        // data:     // unless data is supplied -- that takes precedence
        // type:     // set the intent type to this value
        // package:  // set the intent package to this value
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.tables.activities.TableDisplayActivity",
                                 intentArgs );
    },

    openTableToListViewArbitraryQuery : function(dispatchStruct, tableId, sqlCommand,
                                   sqlSelectionArgs, relativePath) {
      this.assertOpenTypes('openTableToListViewArbitraryQuery()',
                           tableId,
                           sqlCommand,
                           sqlSelectionArgs,
                           relativePath);
      if (arguments.length > 5) {
        throw 'openTableToListViewArbitraryQuery()--too many arguments';
      }

      // need to JSON.stringify bind parameters so we can pass integer, numeric and boolean parameters as-is.
      var sqlSelectionArgsJSON = (sqlSelectionArgs === null || sqlSelectionArgs === undefined) ? null :
        JSON.stringify(sqlSelectionArgs);
      var extrasBundle = { sqlCommand: sqlCommand,
        // pass as JSON string so we can bind integers, numerics and booleans
        sqlSelectionArgs: sqlSelectionArgsJSON,
        // sqlGroupByArgs:
        // sqlHavingClause:
        // sqlOrderByElementKey:
        // sqlOrderByDirection:
        // appName: // automatically supplied for org.opendatakit activities
        tableId: tableId,
        tableDisplayViewType: 'LIST',
        queryType: 'ArbitraryQuery',
        // filename:
      };

      if ( relativePath !== null && relativePath !== undefined ) {
        extrasBundle.filename = relativePath;
      }

      var intentArgs = {
        extras: extrasBundle,
        // uri:      // set the data field of intent to this
        // data:     // unless data is supplied -- that takes precedence
        // type:     // set the intent type to this value
        // package:  // set the intent package to this value
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.tables.activities.TableDisplayActivity",
                                 intentArgs );
    },


    openTableToMapView : function(dispatchStruct, tableId, sqlWhereClause,
                                  sqlSelectionArgs, relativePath) {
      this.assertOpenTypes('openTableToMapView()',
                           tableId,
                           sqlWhereClause,
                           sqlSelectionArgs,
                           relativePath);
      if (arguments.length > 5) {
        throw 'openTableToMapView()--too many arguments';
      }

      // need to JSON.stringify bind parameters so we can pass integer, numeric and boolean parameters as-is.
      var sqlSelectionArgsJSON = (sqlSelectionArgs === null || sqlSelectionArgs === undefined) ? null :
        JSON.stringify(sqlSelectionArgs);
      var extrasBundle = { sqlWhereClause: sqlWhereClause,
        // pass as JSON string so we can bind integers, numerics and booleans
        sqlSelectionArgs: sqlSelectionArgsJSON,
        // sqlGroupByArgs:
        // sqlHavingClause:
        // sqlOrderByElementKey:
        // sqlOrderByDirection:
        // appName: // automatically supplied for org.opendatakit activities
        tableId: tableId,
        tableDisplayViewType: 'MAP',
        queryType: 'SimpleQuery',
        // filename:
      };

      if ( relativePath !== null && relativePath !== undefined ) {
        extrasBundle.filename = relativePath;
      }

      var intentArgs = {
        extras: extrasBundle,
        // uri:      // set the data field of intent to this
        // data:     // unless data is supplied -- that takes precedence
        // type:     // set the intent type to this value
        // package:  // set the intent package to this value
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.tables.activities.TableDisplayActivity",
                                 intentArgs );
    },

    openTableToMapViewArbitraryQuery : function(dispatchStruct, tableId, sqlCommand,
                                  sqlSelectionArgs, relativePath) {
      this.assertOpenTypes('openTableToMapViewArbitraryQuery()',
                           tableId,
                           sqlCommand,
                           sqlSelectionArgs,
                           relativePath);
      if (arguments.length > 5) {
        throw 'openTableToMapViewArbitraryQuery()--too many arguments';
      }

      // need to JSON.stringify bind parameters so we can pass integer, numeric and boolean parameters as-is.
      var sqlSelectionArgsJSON = (sqlSelectionArgs === null || sqlSelectionArgs === undefined) ? null :
        JSON.stringify(sqlSelectionArgs);
      var extrasBundle = { sqlCommand: sqlCommand,
        // pass as JSON string so we can bind integers, numerics and booleans
        sqlSelectionArgs: sqlSelectionArgsJSON,
        // sqlGroupByArgs:
        // sqlHavingClause:
        // sqlOrderByElementKey:
        // sqlOrderByDirection:
        // appName: // automatically supplied for org.opendatakit activities
        tableId: tableId,
        tableDisplayViewType: 'MAP',
        queryType: 'ArbitraryQuery',
        // filename:
      };

      if ( relativePath !== null && relativePath !== undefined ) {
        extrasBundle.filename = relativePath;
      }

      var intentArgs = {
        extras: extrasBundle,
        // uri:      // set the data field of intent to this
        // data:     // unless data is supplied -- that takes precedence
        // type:     // set the intent type to this value
        // package:  // set the intent package to this value
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.tables.activities.TableDisplayActivity",
                                 intentArgs );
    },

    openTableToNavigateView : function(dispatchStruct, tableId, sqlWhereClause,
                                       sqlSelectionArgs, defaultRowId) {
      if (arguments.length > 5) {
        throw 'openTableToNavigateView()--too many arguments';
      }

      // need to JSON.stringify bind parameters so we can pass integer, numeric and boolean parameters as-is.
      var sqlSelectionArgsJSON = (sqlSelectionArgs === null || sqlSelectionArgs === undefined) ? null :
        JSON.stringify(sqlSelectionArgs);
      var extrasBundle = { sqlWhereClause: sqlWhereClause,
        // pass as JSON string so we can bind integers, numerics and booleans
        sqlSelectionArgs: sqlSelectionArgsJSON,
        // sqlGroupByArgs:
        // sqlHavingClause:
        // sqlOrderByElementKey:
        // sqlOrderByDirection:
        // appName: // automatically supplied for org.opendatakit activities
        tableId: tableId,
        defaultRowId: defaultRowId,
        tableDisplayViewType: 'NAVIGATE',
        queryType: 'SimpleQuery',
        // filename:
      };

      var intentArgs = {
        extras: extrasBundle,
        // uri:      // set the data field of intent to this
        // data:     // unless data is supplied -- that takes precedence
        // type:     // set the intent type to this value
        // package:  // set the intent package to this value
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.tables.activities.TableDisplayActivity",
                                 intentArgs );
    },

    openTableToNavigateViewArbitraryQuery : function(dispatchStruct, tableId, sqlCommand,
                                  sqlSelectionArgs, defaultRowId) {
      if (arguments.length > 5) {
        throw 'openTableToNavigateViewArbitraryQuery()--too many arguments';
      }

      // need to JSON.stringify bind parameters so we can pass integer, numeric and boolean parameters as-is.
      var sqlSelectionArgsJSON = (sqlSelectionArgs === null || sqlSelectionArgs === undefined) ? null :
        JSON.stringify(sqlSelectionArgs);
      var extrasBundle = { sqlCommand: sqlCommand,
        // pass as JSON string so we can bind integers, numerics and booleans
        sqlSelectionArgs: sqlSelectionArgsJSON,
        // sqlGroupByArgs:
        // sqlHavingClause:
        // sqlOrderByElementKey:
        // sqlOrderByDirection:
        // appName: // automatically supplied for org.opendatakit activities
        tableId: tableId,
        defaultRowId: defaultRowId,
        tableDisplayViewType: 'NAVIGATE',
        queryType: 'ArbitraryQuery',
        // filename:
      };

      var intentArgs = {
        extras: extrasBundle,
        // uri:      // set the data field of intent to this
        // data:     // unless data is supplied -- that takes precedence
        // type:     // set the intent type to this value
        // package:  // set the intent package to this value
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.tables.activities.TableDisplayActivity",
                                 intentArgs );
    },

    openTableToSpreadsheetView : function(dispatchStruct, tableId, sqlWhereClause,
                                          sqlSelectionArgs) {
      // We're going to rely on the fact that the path can be nullable and
      // thus use the assertHelper, just passing in null.
      this.assertOpenTypes('openTableToSpreadsheetView()',
                           tableId,
                           sqlWhereClause,
                           sqlSelectionArgs,
                           null);
      if (arguments.length > 4 ) {
        throw 'openTableToSpreadsheetView()--too many arguments';
      }

      // need to JSON.stringify bind parameters so we can pass integer, numeric and boolean parameters as-is.
      var sqlSelectionArgsJSON = (sqlSelectionArgs === null || sqlSelectionArgs === undefined) ? null :
        JSON.stringify(sqlSelectionArgs);
      var extrasBundle = { sqlWhereClause: sqlWhereClause,
        // pass as JSON string so we can bind integers, numerics and booleans
        sqlSelectionArgs: sqlSelectionArgsJSON,
        // sqlGroupByArgs:
        // sqlHavingClause:
        // sqlOrderByElementKey:
        // sqlOrderByDirection:
        // appName: // automatically supplied for org.opendatakit activities
        tableId: tableId,
        tableDisplayViewType: 'SPREADSHEET',
        queryType: 'SimpleQuery',
        // filename:
      };

      var intentArgs = {
        extras: extrasBundle,
        // uri:      // set the data field of intent to this
        // data:     // unless data is supplied -- that takes precedence
        // type:     // set the intent type to this value
        // package:  // set the intent package to this value
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.tables.activities.TableDisplayActivity",
                                 intentArgs );
    },

    openDetailView : function(dispatchStruct, tableId, rowId, relativePath) {
      if (!this.isString(tableId)) {
        throw 'openDetailView()--tableId not a string';
      }
      if (!this.isString(rowId)) {
        throw 'openDetailView()--rowId not a string';
      }
      if (relativePath !== null &&
          relativePath !== undefined &&
          !this.isString(relativePath)) {
        throw 'openDetailView()--relativePath not a string';
      }

      var extrasBundle = {
        // appName: // automatically supplied for org.opendatakit activities
        tableId: tableId,
        instanceId: rowId,
        tableDisplayViewType: 'DETAIL',
        queryType: 'SimpleQuery',
        // filename:
      };

      if ( relativePath !== null && relativePath !== undefined ) {
        extrasBundle.filename = relativePath;
      }

      var intentArgs = {
        extras: extrasBundle,
        // uri:      // set the data field of intent to this
        // data:     // unless data is supplied -- that takes precedence
        // type:     // set the intent type to this value
        // package:  // set the intent package to this value
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.tables.activities.TableDisplayActivity",
                                 intentArgs );
    },

    openDetailViewArbitraryQuery : function(dispatchStruct, tableId, sqlCommand, sqlSelectionArgs, relativePath) {
      this.assertOpenTypes('openDetailViewArbitraryQuery()',
                           tableId,
                           sqlCommand,
                           sqlSelectionArgs,
                           relativePath);
      if (arguments.length > 5) {
        throw 'openDetailViewArbitraryQuery()--too many arguments';
      }

      // need to JSON.stringify bind parameters so we can pass integer, numeric and boolean parameters as-is.
      var sqlSelectionArgsJSON = (sqlSelectionArgs === null || sqlSelectionArgs === undefined) ? null :
        JSON.stringify(sqlSelectionArgs);
      var extrasBundle = { sqlCommand: sqlCommand,
        // pass as JSON string so we can bind integers, numerics and booleans
        sqlSelectionArgs: sqlSelectionArgsJSON,
        // sqlGroupByArgs:
        // sqlHavingClause:
        // sqlOrderByElementKey:
        // sqlOrderByDirection:
        // appName: // automatically supplied for org.opendatakit activities
        tableId: tableId,
        tableDisplayViewType: 'DETAIL',
        queryType: 'ArbitraryQuery',
        // filename:
      };

      if ( relativePath !== null && relativePath !== undefined ) {
        extrasBundle.filename = relativePath;
      }

      var intentArgs = {
        extras: extrasBundle,
        // uri:      // set the data field of intent to this
        // data:     // unless data is supplied -- that takes precedence
        // type:     // set the intent type to this value
        // package:  // set the intent package to this value
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.tables.activities.TableDisplayActivity",
                                 intentArgs );
    },


    openDetailWithListView : function(dispatchStruct, tableId, rowId, relativePath) {
      if (!this.isString(tableId)) {
        throw 'openDetailWithListView()--tableId not a string';
      }
      if (!this.isString(rowId)) {
        throw 'openDetailWithListView()--rowId not a string';
      }
      if (relativePath !== null && relativePath !== undefined &&
          !this.isString(relativePath)) {
        throw 'openDetailWithListView()--relativePath not a string';
      }
      var extrasBundle = {
        // appName: // automatically supplied for org.opendatakit activities
        tableId: tableId,
        instanceId: rowId,
        tableDisplayViewType: 'DETAIL_WITH_LIST',
        queryType: 'SimpleQuery',
        // filename:
      };

      if ( relativePath !== null && relativePath !== undefined ) {
        extrasBundle.filename = relativePath;
      }

      var intentArgs = {
        extras: extrasBundle,
        // uri:      // set the data field of intent to this
        // data:     // unless data is supplied -- that takes precedence
        // type:     // set the intent type to this value
        // package:  // set the intent package to this value
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.tables.activities.TableDisplayActivity",
                                 intentArgs );
    },

    openDetailWithListViewArbitraryQuery : function(dispatchStruct, tableId, sqlCommand, sqlSelectionArgs, relativePath) {
      this.assertOpenTypes('openDetailWithListViewArbitraryQuery()',
                           tableId,
                           sqlCommand,
                           sqlSelectionArgs,
                           relativePath);
      if (arguments.length > 5) {
        throw 'openDetailWithListViewArbitraryQuery()--too many arguments';
      }

      // need to JSON.stringify bind parameters so we can pass integer, numeric and boolean parameters as-is.
      var sqlSelectionArgsJSON = (sqlSelectionArgs === null || sqlSelectionArgs === undefined) ? null :
        JSON.stringify(sqlSelectionArgs);
      var extrasBundle = { sqlCommand: sqlCommand,
        // pass as JSON string so we can bind integers, numerics and booleans
        sqlSelectionArgs: sqlSelectionArgsJSON,
        // sqlGroupByArgs:
        // sqlHavingClause:
        // sqlOrderByElementKey:
        // sqlOrderByDirection:
        // appName: // automatically supplied for org.opendatakit activities
        tableId: tableId,
        tableDisplayViewType: 'DETAIL_WITH_LIST',
        queryType: 'ArbitraryQuery',
        // filename:
      };

      if ( relativePath !== null && relativePath !== undefined ) {
        extrasBundle.filename = relativePath;
      }

      var intentArgs = {
        extras: extrasBundle,
        // uri:      // set the data field of intent to this
        // data:     // unless data is supplied -- that takes precedence
        // type:     // set the intent type to this value
        // package:  // set the intent package to this value
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.tables.activities.TableDisplayActivity",
                                 intentArgs );
    },

    setSubListView : function(tableId, sqlWhereClause,
                              sqlSelectionArgs, relativePath) {
      this.assertOpenTypes('setSubListView()',
                           tableId,
                           sqlWhereClause,
                           sqlSelectionArgs,
                           relativePath);
      if (arguments.length > 4) {
        throw 'setSubListView()--too many arguments';
      }

      // need to JSON.stringify bind parameters so we can pass integer, numeric and boolean parameters as-is.
      var sqlSelectionArgsJSON = (sqlSelectionArgs === null || sqlSelectionArgs === undefined) ? null :
        JSON.stringify(sqlSelectionArgs);
      // JSON.stringify the sqlSelectionArgs so we can pass integer, numeric and boolean as-is
      odkTablesIf.setSubListView(tableId, sqlWhereClause, sqlSelectionArgsJSON, relativePath);

    },

    setSubListViewArbitraryQuery : function(tableId, sqlCommand, sqlSelectionArgs, relativePath) {
      this.assertOpenTypes('setSubListViewArbitraryQuery()',
                           tableId,
                           sqlCommand,
                           sqlSelectionArgs,
                           relativePath);
      if (arguments.length > 4) {
        throw 'setSubListViewArbitraryQuery()--too many arguments';
      }

      // need to JSON.stringify bind parameters so we can pass integer, numeric and boolean parameters as-is.
      var sqlSelectionArgsJSON = (sqlSelectionArgs === null || sqlSelectionArgs === undefined) ? null :
        JSON.stringify(sqlSelectionArgs);
      odkTablesIf.setSubListViewArbitraryQuery(tableId, sqlCommand, sqlSelectionArgsJSON, relativePath);
    },

    launchHTML : function(dispatchStruct, relativePath) {
      if ( relativePath === null || relativePath === undefined ) {
        throw 'launchHTML()--relativePath is null or not specified';
      }
      if (!this.isString(relativePath)) {
        throw 'launchHTML()--relativePath is not a string';
      }

      var extrasBundle = {
        // appName: // automatically supplied for org.opendatakit activities
        filename: relativePath
      };

      var intentArgs = {
        extras: extrasBundle,
        // uri:      // set the data field of intent to this
        // data:     // unless data is supplied -- that takes precedence
        // type:     // set the intent type to this value
        // package:  // set the intent package to this value
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.tables.activities.MainActivity",
                                 intentArgs );
    },

    editRowWithSurveyDefault : function(dispatchStruct, tableId, rowId) {
      if (!this.isString(tableId)) {
        throw 'editRowWithSurveyDefault()--tableId not a string';
      }
      if ((tableId === 'framework') && rowId !== null) {
        throw 'editRowWithSurveyDefault()--rowId must be null for framework form';
      }
      if ((tableId !== 'framework') && !this.isString(rowId)) {
        throw 'editRowWithSurveyDefault()--rowId not a string';
      }
      var platInfo = JSON.parse(odkCommon.getPlatformInfo());

      var uri = odkCommon.constructSurveyUri(tableId, null, rowId, null, null);

      var hashString = uri.substring(uri.indexOf('#'));

      var extrasBundle = { url: platInfo.baseUri + 'system/index.html' + hashString
      };

      var intentArgs = {
        // uri:      // set the data field of intent to this
        data: uri,   // unless data is supplied -- that takes precedence
        type: "vnd.android.cursor.item/vnd.opendatakit.form", // mime type
        // package:  // set the intent package to this value
        action: "android.intent.action.EDIT",
        category: "android.intent.category.DEFAULT",

        extras: extrasBundle
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.survey.activities.SplashScreenActivity",
                                 intentArgs );
    },

    editRowWithSurvey : function(dispatchStruct, tableId, rowId, formId, screenPath) {
      if (!this.isString(tableId)) {
        throw 'editRowWithSurvey()--tableId not a string';
      }
      if ((tableId === 'framework') && rowId !== null) {
        throw 'editRowWithSurvey()--rowId must be null for framework form';
      }
      if ((tableId !== 'framework') && !this.isString(rowId)) {
        throw 'editRowWithSurvey()--rowId not a string';
      }

      if ( formId === undefined ) {
        formId = null;
      }
      if ((tableId === 'framework') && !((formId === null) || (formId === 'framework'))) {
        throw 'editRowWithSurvey()--formId must be null or "framework" for framework form';
      }

      if ( screenPath === undefined ) {
        screenPath = null;
      }
      var platInfo = JSON.parse(odkCommon.getPlatformInfo());

      var uri = odkCommon.constructSurveyUri(tableId, formId, rowId, screenPath, null);

      var hashString = uri.substring(uri.indexOf('#'));

      var extrasBundle = { url: platInfo.baseUri + 'system/index.html' + hashString
      };

      var intentArgs = {
        // uri:      // set the data field of intent to this
        data: uri,   // unless data is supplied -- that takes precedence
        type: "vnd.android.cursor.item/vnd.opendatakit.form", // mime type
        // package:  // set the intent package to this value
        action: "android.intent.action.EDIT",
        category: "android.intent.category.DEFAULT",

        extras: extrasBundle
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.survey.activities.SplashScreenActivity",
                                 intentArgs );
    },

    addRowWithSurveyDefault : function(dispatchStruct, tableId) {
      if (!this.isString(tableId)) {
        throw 'addRowWithSurveyDefault()--tableId not a string';
      }
      var rowId = odkCommon.genUUID();

      var platInfo = JSON.parse(odkCommon.getPlatformInfo());

      var uri = odkCommon.constructSurveyUri(tableId, null, rowId, null, null);

      var hashString = uri.substring(uri.indexOf('#'));

      var extrasBundle = { url: platInfo.baseUri + 'system/index.html' + hashString
      };

      var intentArgs = {
        // uri:      // set the data field of intent to this
        data: uri,   // unless data is supplied -- that takes precedence
        type: "vnd.android.cursor.item/vnd.opendatakit.form", // mime type
        // package:  // set the intent package to this value
        action: "android.intent.action.EDIT",
        category: "android.intent.category.DEFAULT",

        extras: extrasBundle
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.survey.activities.SplashScreenActivity",
                                 intentArgs );
    },

    addRowWithSurvey : function(dispatchStruct, tableId, formId, screenPath, jsonMap) {
      if (!this.isString(tableId)) {
        throw 'addRowWithSurvey()--tableId not a string';
      }
      var rowId = odkCommon.genUUID();

      var platInfo = JSON.parse(odkCommon.getPlatformInfo());

      if ( formId === undefined ) {
        formId = null;
      }

      if ( screenPath === undefined ) {
        screenPath = null;
      }

      var uri = odkCommon.constructSurveyUri(tableId, formId, rowId, screenPath, jsonMap);

      var hashString = uri.substring(uri.indexOf('#'));

      var extrasBundle = { url: platInfo.baseUri + 'system/index.html' + hashString
      };

      var intentArgs = {
        // uri:      // set the data field of intent to this
        data: uri,   // unless data is supplied -- that takes precedence
        type: "vnd.android.cursor.item/vnd.opendatakit.form", // mime type
        // package:  // set the intent package to this value
        action: "android.intent.action.EDIT",
        category: "android.intent.category.DEFAULT",

        extras: extrasBundle
      };

      return odkCommon.doAction( dispatchStruct,
                                 "org.opendatakit.survey.activities.SplashScreenActivity",
                                 intentArgs );
    }
  };

})();
