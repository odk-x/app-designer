/*
 * Copyright (C) 2013 University of Washington
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */
/* jshint unused: vars */
/* global require */
/* global exports */
/* global XRegExp */
var XLSXConverter = {};
(function(XLSXConverter){

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

    var _ = root._;

    var reservedSheetNames = [
          "settings",
          "properties",   // only applicable for table_id === form_id forms
          "table_specific_properties",   // prohibit this just in case...
          "common_properties",           // prohibit this just in case...
          "translations", // prohibit this just in case...
		  "table_specific_translations", // tableId == formId != 'framework'
          "framework_translations",      // tableId (== formId) == 'framework'
          "common_translations",         // tableId (== formId) == 'framework'
          "choices",
		  "table_specific_choices",      // prohibit this just in case...
		  "common_choices",              // unused -- would need to be loaded into XLSXConverter2 dynamically
          "queries",      // must remain form-specific because it may contain session variable and field references
          "table_specific_queries",      // prohibit this just in case...
          "common_queries",              // prohibit this just in case...
          "calculates",   // must remain form-specific because it may contain session variable and field references
          "table_specific_calculates",   // prohibit this just in case...
          "common_calculates",           // prohibit this just in case...
          "column_types",
		  "table_specific_column_types", // prohibit this just in case...
		  "common_column_types",         // unused -- would need to be loaded into XLSXConverter2 dynamically
          "prompt_types",
		  "table_specific_prompt_types", // prohibit this just in case...
		  "common_prompt_types",         // unused -- would need to be loaded into XLSXConverter2 dynamically
          "model",                       // must remain form-specific because it contains session variable definitions
          "table_specific_model",        // prohibit this just in case...
          "common_model",                // prohibit this just in case...
      ];

    var reservedFieldNames = {
        /**
         * ODK processor reserved names
         *
         * For template substitution, we reserve 'calculates' so that
         * the {{#substitute}} directive can substitute values and
         * calculates into a display string.
         */
        calculates: true,
        /**
         * ODK Metadata reserved names
         */
        row_etag: true,
        sync_state: true,
        conflict_type: true,
        savepoint_timestamp: true,
        savepoint_creator: true,
        savepoint_type: true,
        form_id: true,
        locale: true,
		/*
		 * access filter columns
		 */
		default_access: true,
		row_owner: true,
		group_read_only: true,
		group_modify: true,
		group_privileged: true,

        /**
         * SQLite keywords ( http://www.sqlite.org/lang_keywords.html )
         */
        abort: true,
        action: true,
        add: true,
        after: true,
        all: true,
        alter: true,
        analyze: true,
        and: true,
        as: true,
        asc: true,
        attach: true,
        autoincrement: true,
        before: true,
        begin: true,
        between: true,
        by: true,
        cascade: true,
        'case': true,
        cast: true,
        check: true,
        collate: true,
        column: true,
        commit: true,
        conflict: true,
        constraint: true,
        create: true,
        cross: true,
        current_date: true,
        current_time: true,
        current_timestamp: true,
        database: true,
        'default': true,
        deferrable: true,
        deferred: true,
        'delete': true,
        desc: true,
        detach: true,
        distinct: true,
        drop: true,
        each: true,
        'else': true,
        end: true,
        escape: true,
        except: true,
        exclusive: true,
        exists: true,
        explain: true,
        fail: true,
        'for': true,
        foreign: true,
        from: true,
        full: true,
        glob: true,
        group: true,
        having: true,
        'if': true,
        ignore: true,
        immediate: true,
        'in': true,
        index: true,
        indexed: true,
        initially: true,
        inner: true,
        insert: true,
        instead: true,
        intersect: true,
        into: true,
        is: true,
        isnull: true,
        join: true,
        key: true,
        left: true,
        like: true,
        limit: true,
        match: true,
        natural: true,
        no: true,
        not: true,
        notnull: true,
        'null': true,
        of: true,
        offset: true,
        on: true,
        or: true,
        order: true,
        outer: true,
        plan: true,
        pragma: true,
        primary: true,
        query: true,
        raise: true,
        references: true,
        regexp: true,
        reindex: true,
        release: true,
        rename: true,
        replace: true,
        restrict: true,
        right: true,
        rollback: true,
        row: true,
        savepoint: true,
        select: true,
        set: true,
        table: true,
        temp: true,
        temporary: true,
        then: true,
        to: true,
        transaction: true,
        trigger: true,
        union: true,
        unique: true,
        update: true,
        using: true,
        vacuum: true,
        values: true,
        view: true,
        virtual: true,
        when: true,
        where: true
    };

    // Unicode extensions to standard RegExp...
    if (typeof exports !== 'undefined') {
        if(typeof require !== 'undefined') XRegExp = require('./XRegExp-All-3.0.0-pre-2014-12-24.js');
    }
    var pattern_valid_user_defined_name =
        XRegExp('^\\p{L}\\p{M}*(\\p{L}\\p{M}*|\\p{Nd}|_)*$', 'A');

    var default_initial = [
         { _row_num: 2,
             clause: "if // start",
             condition: "(opendatakit.getCurrentInstanceId() != null)",
         },
         { _row_num: 3,
             type: "opening",
             display: { text: "Edit form" }
         },
            { _row_num: 4,
                clause: "do section survey"
            },
         { _row_num: 5,
             type: "finalize",
             display: { text: "Save form" }
         },
         { _row_num: 6,
             clause: "else // start"
         },
         { _row_num: 7,
             type: "instances",
             display: { text: "Saved instances" }
         },
         { _row_num: 8,
             clause: "end if // start"
         }
    ];

    //The column type map is used to express whether a column needs special
    //interpretation or not. I.e., whether to wrap the text inside a function() {...}
    //and evaluate that.
    var columnTypeMap = {
            _screen_block: 'function',
            condition: 'formula',
            constraint: 'formula',
            required: 'formula',
            calculation: 'formula', // 'assign' prompt and on calculates sheet.
            newRowInitialElementKeyToValueMap: 'formula', // TODO: move to queries
            openRowInitialElementKeyToValueMap: 'formula', // TODO: move to queries
            selectionArgs: 'formula', // TODO: move to queries
            url: 'formula', // external_link prompt
            uri: 'formula', // queries
            callback: 'formula(context)', // queries
            choice_filter: 'formula(choice_item)', // expects "choice" context arg.
            templatePath: 'requirejs_path'
    };

    //The prompt type map is not kept in a separate JSON file because
    //origin policies might prevent it from being fetched when this script
    //is used from the local file system.
    var promptTypeMap = {
        "string" : {"type":"string"}, // database primitive
        "integer" : {"type":"integer"}, // database primitive
        "number" : {"type":"number"}, // database primitive
        "boolean" : {"type":"boolean"}, // database primitive
        "object" : {"type":"object"}, // database primitive
        "array" : {"type":"array"}, // database primitive
        "text" : {"type":"string"},
        "textarea" : {"type":"string"},
        "decimal" : {"type":"number"},
        "acknowledge" : {"type":"boolean"},
        "select_one" : {"type":"string"},
        "select_multiple": {
            "type": "array",
            "items" : {
                "type":"string"
            }
        },
        "select_one_with_other" : {"type":"string"},
        "select_one_grid" : {"type":"string"},
        "select_one_inline" : {"type":"string"},
        "select_one_dropdown" : {"type":"string"},
        "select_one_integer" : {"type":"integer"},
        "select_multiple_grid": {
            "type": "array",
            "items" : {
                "type":"string"
            }
        },
        "select_multiple_inline": {
            "type": "array",
            "items" : {
                "type":"string"
            }
        },
        "geopoint" : {
            "type": "object",
            "elementType": "geopoint",
            "properties": {
                "latitude": {
                    "type": "number"
                },
                "longitude": {
                    "type": "number"
                },
                "altitude": {
                    "type": "number"
                },
                "accuracy": {
                    "type": "number"
                }
            }
        },
        "barcode": {"type":"string"},
        "note": null,
        "_section" : null, // synthesized prompt inserted where 'do section' occurs
        "linked_table": null,
        "user_branch": null,
        "external_link": null,
        "opening": null,
        "instances": null,
        "finalize": null,
        "contents": null,
        "bargraph": null,
        "linegraph": null,
        "piechart": null,
        "scatterplot": null,
        "boxplot": null,
        "signature": {
            "type": "object",
            "elementType": "mimeUri",
            "properties": {
                "uriFragment": {
					"type": "string",
					"elementType": "rowpath"
                },
                "contentType": {
					"type": "string",
					"elementType": "mimeType",
                    "default": "image/*"
                }
            }
        },
        "read_only_image": {
            "type": "object",
            "elementType": "mimeUri",
            "properties": {
                "uriFragment": {
					"type": "string",
					"elementType": "rowpath"
                },
                "contentType": {
					"type": "string",
					"elementType": "mimeType",
                    "default": "image/*"
                }
            }
        },
        "image": {
            "type": "object",
            "elementType": "mimeUri",
            "properties": {
                "uriFragment": {
					"type": "string",
					"elementType": "rowpath"
                },
                "contentType": {
					"type": "string",
					"elementType": "mimeType",
                    "default": "image/*"
                }
            }
        },
        "audio": {
            "type": "object",
            "elementType": "mimeUri",
            "properties": {
                "uriFragment": {
					"type": "string",
					"elementType": "rowpath"
                },
                "contentType": {
					"type": "string",
					"elementType": "mimeType",
                    "default": "audio/*"
                }
            }
        },
        "video": {
            "type": "object",
            "elementType": "mimeUri",
            "properties": {
                "uriFragment": {
					"type": "string",
					"elementType": "rowpath"
                },
                "contentType": {
					"type": "string",
					"elementType": "mimeType",
                    "default": "video/*"
                }
            }
        },
        "json": {
            "type": "object",
            "elementType": "mimeUri",
            "properties": {
                "uriFragment": {
					"type": "string",
					"elementType": "rowpath"
                },
                "contentType": {
					"type": "string",
					"elementType": "mimeType",
                    "default": "application/json"
                }
            }
        },
        "date": {
			// odk time stamp -- UTC timestamp string with 00:00:00.000 time.
            "type": "string",
			"elementType": "date"
        },
		"birthdate": {
			// odk time stamp -- UTC timestamp string with 00:00:00.000 time.
            "type": "string",
			"elementType": "date"
        },
        "time": {
			// odk time -- LOCAL TIME ZONE hh:mm:ss.sss string
            "type": "string",
			"elementType": "time"
        },
        "datetime": {
			// odk time stamp -- UTC timestamp string
            "type": "string",
			"elementType": "dateTime"
        }
    };
    var warnings = {
        __warnings__: [],
        warn: function(message){
            this.__warnings__.push(message);
        },
        clear: function(){
            this.__warnings__ = [];
        },
        toArray: function(){
            return this.__warnings__;
        }
    };

    /**
     * Double quote strings if they contain 
     * a quote, carriage return, or line feed
     */
    var doubleQuoteString = function(str) {
        if (str !== null) {
            if (str.length === 0 ||
                str.indexOf("\r") !== -1 ||
                str.indexOf("\n") !== -1 ||
                str.indexOf("\"") !== -1 ) {
                
                str = str.replace(/"/g, "\"\"");
                str = "\"" + str + "\"";
                return str;
            } else {
                return str;
            }
        }
    };

    /**
     * This is not efficient, but the only deep-copy clone functionality
     * is in jQuery, and we don't want to introduce that dependency.
     */
    var deepCopyObject = function( o ) {
        if ( o === undefined || o === null || _.isFunction(o) || !_.isObject(o) ) {
            return o;
        }

        if ( _.isArray(o) ) {
            return _.map(o, function(v) { return deepCopyObject(v); });
        } else {
            var newo = _.clone(o);
            _.each(_.keys(newo), function(k) {
                newo[k] = deepCopyObject(newo[k]);
            });
            return newo;
        }
    };

    /**
     * _.extend is shallow. Sometimes we need a deeply recursive extend.
     *
     * deepExtendObject(o1,o2) --
     *
     * If either o1 or o2 are null, primitive types, strings,
     * arrays or functions, it returns a deep copy of o2.
     *
     * If
     *
     * Otherwise, both o1 and o2 are objects.
     *
     * For each non-colliding property, take the union of o1 and o2.
     * For each colliding property, if the property value 'key' in o1 is
     * a non-array, non-function, object, do:
     *    o1[key] = deepExtendObject(o1[key], o2[key]);
     *
     * I.e., if you have:
     *
     *   first = {bar: {a: true, c:false}};
     *   second = {bar: {c: true, d: false}, none: true};
     *
     *   Then
     *
     *   out = deepExtendObject(deepExtendObject({},first), second)
     *
     *   will return:
     *
     *   out = {bar: {a:true, c:true, d:false}, none:true};
     *
     *   and
     *
     *   out = deepExtendObject(deepExtendObject({},second), first)
     *
     *   will return:
     *
     *   out = {bar: {a:true, c:false, d:false}, none: true};
     */
    var deepExtendObject = function( o1, o2 ) {
        // stomp on o1 if o2 is not an object or array...
        if ( o2 === undefined || o2 === null || _.isFunction(o2) || !_.isObject(o2) ) {
            // don't need to deeply copy these non-array, non-objects.
            return o2;
        }
        // stomp on o1 if o1 is not an object or array...
        if ( o1 === undefined || o1 === null || _.isFunction(o1) || !_.isObject(o1) ) {
            // deep copy it...
            return deepCopyObject(o2);
        }
        // if o1 or o2 are arrays, stomp on o1 (don't merge arrays)...
        if ( _.isArray(o1) || _.isArray(o2) ) {
            // deep copy it...
            return deepCopyObject(o2);
        }

        // OK. they are both objects...
        _.each(_.keys(o2), function(key) {
            if ( key in o1 ) {
                o1[key] = deepExtendObject(o1[key], o2[key]);
            } else {
                o1[key] = deepCopyObject(o2[key]);
            }
        });

        // return the extended object
        return o1;
    };

    //Remove carriage returns, trim values in each cell of spreadsheet.
    var cleanValues = function(row){
        var outRow = Object.create(row.__proto__ || row.prototype);
        _.each(row, function(value, key){
            if(_.isString(value)){
                value = value.replace(/\r/g, "");
                value = value.trim();
            }
            outRow[key] = value;
        });
        return outRow;
    };

    /*
    [a,b,c] => {a:{b:c}}
    */
    var listToNestedDict = function(list){
        var outObj = {};
        if(list.length > 1){
            outObj[list[0]] = listToNestedDict(list.slice(1));
            return outObj;
        } else {
            return list[0];
        }
    };

    var saveValue = function(arr, idxs, value) {
        var idx = idxs.shift();
        while (arr.length <= idx ) {
            arr.push( (idxs.length !== 0) ? [] : null);
        }
        if ( idxs.length === 0 ) {
            if ( arr[idx] === undefined || arr[idx] === null ) {
                arr[idx] = value;
            } else {
                _.extend(arr[idx], value);
            }
        } else {
            saveValue( arr[idx], idxs, value);
        }
    };

    /*
    Extend the given object with any number of additional objects.
    If the objects have matching keys, the values of those keys will be
    recursively merged, either by extending each other if any are objects,
    or by being combined into an array if none are objects.
    */
    var recursiveExtend = function(obj) {
        _.each(Array.prototype.slice.call(arguments, 1), function(source) {
            if (source) {
                for (var prop in source) {
                    if (prop in obj) {
                        if (_.isObject(obj[prop]) || _.isObject(source[prop])) {
                            //If one of the values is not an object,
                            //put it in an object under the key "default"
                            //so it can be merged.
                            if(!_.isObject(obj[prop])){
                                obj[prop] = {"default" : obj[prop] };
                            }
                            if(!_.isObject(source[prop])){
                                source[prop] = {"default" : source[prop] };
                            }
                            obj[prop] = recursiveExtend(obj[prop], source[prop]);
                        } else {
                            //If neither value is an object put them in an array.
                            obj[prop] = [].concat(obj[prop]).concat(source[prop]);
                        }
                    } else {
                        // Handle array syntax...
                        var i = prop.indexOf('[');
                        if ( i !== -1 ) {
                            if ( prop.lastIndexOf("]") !== prop.length-1 ) {
                                throw Error("Invalid array subscript in column heading: " + prop);
                            }
                            var nm = prop.substring(0,i);
                            var rem = prop.substring(i+1,prop.length-1);
                            rem = rem.replace(/\s+/g,'');// remove extra spaces
                            var elements = rem.split("][");
                            var idxs = [];
                            var e;
                            for ( i = 0 ; i < elements.length ; ++i ) {
                                e = elements[i];
                                e = parseInt(e);
                                idxs.push(e);
                            }
                            if ( obj[nm] === undefined || obj[nm] === null ) {
                                obj[nm] = [];
                            }
                            saveValue(obj[nm], idxs, source[prop]);
                        } else {
                            obj[prop] = source[prop];
                        }
                    }
                }
            }
        });
        return obj;
    };

    /*
    Construct a JSON object from JSON paths in the headers.
    For now only dot notation is supported.
    For example:
    {"text.english": "hello", "text.french" : "bonjour"}
    becomes
    {"text": {"english": "hello", "french" : "bonjour"}.
    */
    var groupColumnHeaders = function(row) {
        var outRow = Object.create(row.__proto__ || row.prototype);
        _.each(row, function(value, columnHeader){
            var chComponents = columnHeader.split('.');
            outRow = recursiveExtend(outRow, listToNestedDict(chComponents.concat(value)));
        });
        return outRow;
    };

    var omitRowsWithMissingField = function (rows, requiredField) {
        var outRow = _.reject( rows, function(row) {
            return !(requiredField in row);
        });
        return outRow;
    };

    var errorIfFieldMissing = function(sheetName, rows, requiredField, nonEmpty ) {
        _.each(rows, function(row) {
            if (!(requiredField in row)) {
                throw Error("Missing cell value on sheet: " + sheetName +
                        " for column: " + requiredField + " on row: " + row._row_num);
            }
            var value = row[requiredField];
            if ( nonEmpty && (value !== 0) && (value === undefined || value === null || value == [] || value == {}) ) {
                throw Error("Cell value is unexpectedly empty on sheet: " + sheetName +
                        " for column: " + requiredField + " on row: " + row._row_num);
            }
        });
    };

    var errorIfFieldsMissingForQueryType = function(sheetName, rows, queryType, requiredField ) {
        _.each(rows, function(row) {
            if ((row.query_type ==  queryType) && !(requiredField in row)) {
                throw Error("Missing cell value on sheet: " + sheetName +
                        " for column: " + requiredField + " on row: " + row._row_num);
            }
        });
    };

    /*
     * Parse the 'clause' field and create independent records for branch labels.
     */
    var parseControlFlowSection = function(sheetName, sheet){

        /*
         * Step 1: Construct linear interleaved flow of:
         *    branch_label
         *    prompt
         *    begin_screen (_tag_name)
         *    end_screen (_tag_name)
         *    begin_if (_tag_name)
         *    else (_tag_name)
         *    end_if (_tag_name)
         *    goto_label (_branch_label)
         *    resume
         *    back_in_history
         *    do_section (_do_section_name)
         *    exit_section
         *    validate (_sweep_name)
         *    save_and_terminate
         *
         *    statements.
         */
        var flow = [];
        _.each(sheet, function(row) {
            if ( "branch_label" in row ) {
                var labelEntry = { _token_type: "branch_label", branch_label: row.branch_label, _row_num: row._row_num };
                flow.push(labelEntry);
            }
			
			var parts;
			var first;
			
            if ( "clause" in row ) {
                var clauseEntry = _.extend({}, row);
                delete clauseEntry.branch_label;

                clauseEntry._token_type = "clause";
                /*
                 * parse the clause, set _token_type and begin/end matching annotations
                 */
                var raw_clause_type = row.clause;
                raw_clause_type = raw_clause_type.replace(/\/\//g,' // ');// surround with spaces
                raw_clause_type = raw_clause_type.replace(/\s+/g,' ');// remove extra spaces
                raw_clause_type = raw_clause_type.trim();// remove BOL/EOL spaces
                parts = raw_clause_type.split(' ');

                first = parts[0];

                // Code to allow the user to comment out lines
                if (first.length >= 2)
                {
                    if (first.substring(0,2) == "//")
                        first = "comment";
                }

                if ("type" in row && first != "comment") {
                    throw Error("Exactly one of 'clause' and 'type' may be defined on any given row. Error on sheet: " +
                    sheetName + " on row: " + row._row_num);
                }

                switch (first ) {
                case "begin":
                    if ( parts.length < 2 || parts[1] !== "screen" || parts.length > 4 ||
                            (parts.length === 4 && parts[2] !== "//") ) {
                        throw Error("Expected 'begin screen [ // <tagname> ]' but found: " + row.clause +
                                " on sheet: " + sheetName + " on row: " + row._row_num);
                    }
                    if ("condition" in row) {
                        throw Error("'condition' expressions are not allowed on 'begin screen' clauses. Error on sheet: " +
                                sheetName + " on row: " + row._row_num);
                    }
                    clauseEntry._token_type = "begin_screen";
                    if ( parts.length === 4 ) {
                        clauseEntry._tag_name = parts[3];
                    }
                    break;
                case "end":
                    if ( parts.length < 2 || (parts[1] !== "screen" && parts[1] !== "if") ) {
                        throw Error("Expected 'end if' or 'end screen' but found: " + row.clause +
                                " on sheet: " + sheetName + " on row: " + row._row_num);
                    }
                    if ( parts.length > 4 || (parts.length === 4 && parts[2] !== "//") ) {
                        throw Error("Expected 'end " + parts[1] + " [ // <tagname> ]' but found: " + row.clause +
                                " on sheet: " + sheetName + " on row: " + row._row_num);
                    }
                    if ("condition" in row) {
                        throw Error("'condition' expressions are not allowed on 'end " + parts[1] +"' clauses. Error on sheet: " +
                                sheetName + " on row: " + row._row_num);
                    }
                    clauseEntry._token_type = "end_" + parts[1];
                    if ( parts.length === 4 ) {
                        clauseEntry._tag_name = parts[3];
                    }
                    break;
                case "if":
                    if ( parts.length > 3 || (parts.length >= 2 && parts[1] !== "//") ) {
                        throw Error("Expected 'if [ // <tagname> ]' but found: " + row.clause +
                                " on sheet: " + sheetName + " on row: " + row._row_num);
                    }
                    if (!("condition" in row)) {
                        throw Error("'condition' expression is required on 'if' clauses. Error on sheet: " +
                                sheetName + " on row: " + row._row_num);
                    }
                    clauseEntry._token_type = "begin_if";
                    if ( parts.length === 3 ) {
                        clauseEntry._tag_name = parts[2];
                    }
                    break;
                case "else":
                    if ( parts.length > 3 || (parts.length >= 2 && parts[1] !== "//") ) {
                        throw Error("Expected 'else [ // <tagname> ]' but found: " + row.clause +
                                " on sheet: " + sheetName + " on row: " + row._row_num);
                    }
                    if ("condition" in row) {
                        throw Error("'condition' expressions are not allowed on 'else' clauses. Error on sheet: " +
                                sheetName + " on row: " + row._row_num);
                    }
                    clauseEntry._token_type = "else";
                    if ( parts.length === 3 ) {
                        clauseEntry._tag_name = parts[2];
                    }
                    break;
                case "goto":
                    if ( parts.length !== 2 ) {
                        throw Error("Expected 'goto <branchlabel>' but found: " + row.clause +
                                " on sheet: " + sheetName + " on row: " + row._row_num);
                    }
                    clauseEntry._token_type = "goto_label";
                    clauseEntry._branch_label = parts[1];
                    break;
                case "back":
                    if ( parts.length !== 1 ) {
                        throw Error("Expected 'back' but found: " + row.clause +
                                " on sheet: " + sheetName + " on row: " + row._row_num);
                    }
                    if ("condition" in row) {
                        throw Error("'condition' expressions are not allowed on 'back' clauses. Error on sheet: " +
                                sheetName + " on row: " + row._row_num);
                    }
                    clauseEntry._token_type = "back_in_history";
                    break;
                case "resume":
                    if ( parts.length !== 1 ) {
                        throw Error("Expected 'resume' but found: " + row.clause +
                                " on sheet: " + sheetName + " on row: " + row._row_num);
                    }
                    if ("condition" in row) {
                        throw Error("'condition' expressions are not allowed on 'resume' clauses. Error on sheet: " +
                                sheetName + " on row: " + row._row_num);
                    }
                    clauseEntry._token_type = "resume";
                    break;
                case "do":
                    if ( parts.length !== 3 || parts[1] !== "section" ) {
                        throw Error("Expected 'do section <sectionname>' but found: " + row.clause +
                                " on sheet: " + sheetName + " on row: " + row._row_num);
                    }
                    if ("condition" in row) {
                        throw Error("'condition' expressions are not allowed on 'do section' clauses. Error on sheet: " +
                                sheetName + " on row: " + row._row_num);
                    }
                    clauseEntry._token_type = "do_section";
                    clauseEntry._do_section_name = parts[2];
                    break;
                case "exit":
                    if ( parts.length !== 2 || parts[1] !== "section" ) {
                        throw Error("Expected 'exit section' but found: " + row.clause +
                                " on sheet: " + sheetName + " on row: " + row._row_num);
                    }
                    if ("condition" in row) {
                        throw Error("'condition' expressions are not allowed on 'exit section' clauses. Error on sheet: " +
                                sheetName + " on row: " + row._row_num);
                    }
                    clauseEntry._token_type = "exit_section";
                    break;
                case "validate":
                    if ( parts.length > 2 ) {
                        throw Error("Expected 'validate' or 'validate <sweepname>' but found: " + row.clause +
                                " on sheet: " + sheetName + " on row: " + row._row_num);
                    }
                    if ("condition" in row) {
                        throw Error("'condition' expressions are not allowed on 'validate' clauses. Error on sheet: " +
                                sheetName + " on row: " + row._row_num);
                    }
                    clauseEntry._token_type = "validate";
                    if ( parts.length === 2 ) {
                        clauseEntry._sweep_name = parts[1];
                    } else {
                        clauseEntry._sweep_name = "finalize";
                    }
                    break;
                case "save":
                    if ( parts.length != 3 && parts[1] != 'and' && parts[2] != 'terminate' ) {
                        throw Error("Expected 'save and terminate' but found: " + row.clause +
                                " on sheet: " + sheetName + " on row: " + row._row_num);
                    }
                    if ( !("calculation" in row) ) {
                        clauseEntry.calculation = false;
                    }
                    clauseEntry._token_type = "save_and_terminate";
                    break;
                case "comment":
                    // Skip to the next clause entry
                    return;
                default:
                    throw Error("Unrecognized 'clause' expression: " + row.clause +
                            " on sheet: " + sheetName + " on row: " + row._row_num);
                }
                flow.push(clauseEntry);
            } else if ( "type" in row ) {
                var typeEntry = _.extend({}, row);
                delete typeEntry.branch_label;
                if ("condition" in row) {
                    throw Error("'condition' expressions are not allowed on prompts. Error on sheet: " +
                            sheetName + " on row: " + row._row_num);
                }
                /*
                 * distinguish between 'assign [promptType]' and 'promptType'
                 */
                var raw_prompt_type = row.type;
                raw_prompt_type = raw_prompt_type.replace(/\s+/g,' ');// remove extra spaces
                raw_prompt_type = raw_prompt_type.trim();// remove BOL/EOL spaces
                parts = raw_prompt_type.split(' ');
                first = parts[0];
                if ( first === "assign" ) {
                    typeEntry._token_type = "assign";
                    if ( parts.length >= 2 ) {
                        /* explicit type is specified */
                        typeEntry._data_type = parts[1];
                    }
                    if (!("name" in row)) {
                        throw Error("'assign' expressions must specify a field 'name' Error on sheet: " +
                                sheetName + " on row: " + row._row_num);
                    }
                    if (!("calculation" in row)) {
                        throw Error("'assign' expressions must specify a 'calculation' expression. Error on sheet: " +
                                sheetName + " on row: " + row._row_num);
                    }
                } else {
                       typeEntry._token_type = "prompt";
                       /*
                        *  Change: prompt type is only one string, which must match a prompt_type name.
                        *  Extra parameters are not allowed. Makes parsing and extension easier.
                        */
//                       if ( parts.length >= 2 ) {
//                           typeEntry._param = parts[1];
//                       }
//                       typeEntry._type = parts[0];
                       typeEntry._type = raw_prompt_type;
                }
                flow.push(typeEntry);
            }
            /* otherwise it is a comment row */
        });
        return flow;
    };

    var parseScreenIfBlock = function(sheetName, flow, idx ) {
        var i = idx+1;
        var tag = flow[idx]._tag_name;
		var end_tag;
        var thenFlow = true;
        var blockFlow = [];
        while (i < flow.length) {
            var clause = flow[i];
            switch (clause._token_type) {
            case "assign":
            case "prompt":
                blockFlow.push(clause);
                ++i;
                break;
            case "branch_label":
            case "goto_label":
            case "resume":
            case "back_in_history":
            case "do_section":
            case "exit_section":
            case "validate":
            case "save_and_terminate":
            case "begin_screen":
            case "end_screen":
                throw Error("Disallowed clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
                        sheetName + " within '" + flow[idx].clause + "' beginning at row " + flow[idx]._row_num);
                // break;
            case "begin_if":
                var psi = parseScreenIfBlock(sheetName, flow, i);
                blockFlow.push(psi.clause);
                i = psi.idx;
                break;
            case "else":
                end_tag = flow[i]._tag_name;
                if ( tag != end_tag ) {
                    throw Error("Mismatched tag on '" + flow[i].clause + "' at row " + flow[i]._row_num +
                            ". Should match tag on '" + flow[idx].clause + "' at row " + flow[idx]._row_num + " on sheet: " +
                            sheetName);
                }
                if ( !thenFlow ) {
                    throw Error("Extraneous else clause: '" + flow[i].clause + "' at row " + flow[i]._row_num +
                            " for '" + flow[idx].clause + "' at row " + flow[idx]._row_num + " on sheet: " +
                            sheetName);
                }
                flow[idx]._else_clause = clause;
                flow[idx]._then_block = blockFlow;
                blockFlow = [];
                thenFlow = false;
                ++i;
                break;
            case "end_if":
                end_tag = flow[i]._tag_name;
                if ( tag != end_tag ) {
                    throw Error("Mismatched tag on '" + flow[i].clause + "' at row " + flow[i]._row_num +
                            ". Should match tag on '" + flow[idx].clause + "' at row " + flow[idx]._row_num + " on sheet: " +
                            sheetName);
                }
                flow[idx]._end_if_clause = clause;
                if ( thenFlow ) {
                    flow[idx]._then_block = blockFlow;
                } else {
                    flow[idx]._else_block = blockFlow;
                }
                return { clause: flow[idx], idx: i+1 };
            default:
                throw Error("Unrecognized clause: '" + clause.clause + "' on sheet: " +
                        sheetName + " at row " + clause._row_num);
            }
        }
        if ( tag !== undefined && tag !== null ) {
            throw Error("No matching 'end if // " + tag + "' on sheet: " +
                    sheetName + " for '" + flow[idx].clause + "' at row " + flow[idx]._row_num);
        } else {
            throw Error("No matching 'end if' on sheet: " +
                    sheetName + " for '" + flow[idx].clause + "' at row " + flow[idx]._row_num);
        }
    };

    var parseScreenBlock = function(sheetName, flow, idx ) {
        var i = idx+1;
        var tag = flow[idx]._tag_name;
        var blockFlow = [];
        while (i < flow.length) {
            var clause = flow[i];
            switch (clause._token_type) {
            case "assign":
            case "prompt":
                blockFlow.push(clause);
                ++i;
                break;
            case "branch_label":
            case "goto_label":
            case "resume":
            case "back_in_history":
            case "do_section":
            case "exit_section":
            case "validate":
            case "save_and_terminate":
            case "begin_screen":
                throw Error("Disallowed clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
                        sheetName + " within '" + flow[idx].clause + "' beginning at row " + flow[idx]._row_num);
                // break;
            case "else":
                throw Error("'else' without preceding 'if' clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
                        sheetName + " within '" + flow[idx].clause + "' beginning at row " + flow[idx]._row_num);
                // break;
            case "end_if":
                throw Error("'end if' without preceding 'if' clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
                        sheetName + " within '" + flow[idx].clause + "' beginning at row " + flow[idx]._row_num);
                // break;
            case "begin_if":
                var psi = parseScreenIfBlock(sheetName, flow, i);
                blockFlow.push(psi.clause);
                i = psi.idx;
                break;
            case "end_screen":
                var end_tag = flow[i]._tag_name;
                if ( tag != end_tag ) {
                    throw Error("Mismatched tags on '" + flow[idx].clause + "' at row " + flow[idx]._row_num +
                            " and '" + flow[i].clause + "' at row " + flow[i]._row_num + " on sheet: " +
                            sheetName);
                }
                flow[idx]._end_screen_clause = clause;
                flow[idx]._screen_block = blockFlow;
                return { clause: flow[idx], idx: i+1 };
            default:
                throw Error("Unrecognized clause: '" + clause.clause + "' on sheet: " +
                        sheetName + " at row " + clause._row_num);
            }
        }
        if ( tag !== undefined && tag !== null ) {
            throw Error("No matching 'end screen // " + tag + "' on sheet: " +
                    sheetName + " for '" + flow[idx].clause + "' at row " + flow[idx]._row_num);
        } else {
            throw Error("No matching 'end screen' on sheet: " +
                    sheetName + " for '" + flow[idx].clause + "' at row " + flow[idx]._row_num);
        }
    };

    var parseTopLevelIfBlock = function(sheetName, flow, idx ) {
        var i = idx+1;
        var tag = flow[idx]._tag_name;
		var end_tag;
		var psi;
        var thenFlow = true;
        var blockFlow = [];
        while (i < flow.length) {
            var clause = flow[i];
            switch (clause._token_type) {
            case "branch_label":
            case "assign":
            case "prompt":
            case "goto_label":
            case "resume":
            case "back_in_history":
            case "do_section":
            case "exit_section":
            case "validate":
            case "save_and_terminate":
                blockFlow.push(clause);
                ++i;
                break;
            case "begin_screen":
                psi = parseScreenBlock(sheetName, flow, i);
                blockFlow.push(psi.clause);
                i = psi.idx;
                break;
            case "end_screen":
                throw Error("'end screen' without preceding 'begin screen' clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
                        sheetName + " within '" + flow[idx].clause + "' beginning at row " + flow[idx]._row_num);
                // break;
            case "begin_if":
                psi = parseTopLevelIfBlock(sheetName, flow, i);
                blockFlow.push(psi.clause);
                i = psi.idx;
                break;
            case "else":
                end_tag = flow[i]._tag_name;
                if ( tag != end_tag ) {
                    throw Error("Mismatched tag on '" + flow[i].clause + "' at row " + flow[i]._row_num +
                            ". Should match tag on '" + flow[idx].clause + "' at row " + flow[idx]._row_num + " on sheet: " +
                            sheetName);
                }
                if ( !thenFlow ) {
                    throw Error("Extraneous else clause: '" + flow[i].clause + "' at row " + flow[i]._row_num +
                            " for '" + flow[idx].clause + "' at row " + flow[idx]._row_num + " on sheet: " +
                            sheetName);
                }
                flow[idx]._else_clause = clause;
                flow[idx]._then_block = blockFlow;
                blockFlow = [];
                thenFlow = false;
                ++i;
                break;
            case "end_if":
                end_tag = flow[i]._tag_name;
                if ( tag != end_tag ) {
                    throw Error("Mismatched tag on '" + flow[i].clause + "' at row " + flow[i]._row_num +
                            ". Should match tag on '" + flow[idx].clause + "' at row " + flow[idx]._row_num + " on sheet: " +
                            sheetName);
                }
                flow[idx]._end_if_clause = clause;
                if ( thenFlow ) {
                    flow[idx]._then_block = blockFlow;
                } else {
                    flow[idx]._else_block = blockFlow;
                }
                return { clause: flow[idx], idx: i+1 };
            default:
                throw Error("Unrecognized clause: '" + clause.clause + "' on sheet: " +
                        sheetName + " at row " + clause._row_num);
            }
        }
        if ( tag !== undefined && tag !== null ) {
            throw Error("No matching 'end if // " + tag + "' on sheet: " +
                    sheetName + " for '" + flow[idx].clause + "' at row " + flow[idx]._row_num);
        } else {
            throw Error("No matching 'end if' on sheet: " +
                    sheetName + " for '" + flow[idx].clause + "' at row " + flow[idx]._row_num);
        }
    };


    var parseTopLevelBlock = function(sheetName, flow ) {
        var i = 0;
        var hasContents = false;
        var blockFlow = [];
        while (i < flow.length) {
            var clause = flow[i];
			var psi;
            switch (clause._token_type) {
            case "branch_label":
                if ( clause.branch_label === '_contents' ) {
                    hasContents = true;
                }
                blockFlow.push(clause);
                ++i;
                break;
            case "assign":
            case "prompt":
            case "goto_label":
            case "resume":
            case "back_in_history":
            case "do_section":
            case "exit_section":
            case "validate":
            case "save_and_terminate":
                blockFlow.push(clause);
                ++i;
                break;
            case "begin_screen":
                psi = parseScreenBlock(sheetName, flow, i);
                blockFlow.push(psi.clause);
                i = psi.idx;
                break;
            case "end_screen":
                throw Error("'end screen' without preceding 'begin screen' clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
                        sheetName);
                // break;
            case "begin_if":
                psi = parseTopLevelIfBlock(sheetName, flow, i);
                blockFlow.push(psi.clause);
                i = psi.idx;
                break;
            case "else":
                throw Error("'else' without preceding 'if' clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
                        sheetName);
                // break;
            case "end_if":
                throw Error("'end if' without preceding 'if' clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
                        sheetName);
                // break;
            default:
                throw Error("Unrecognized clause: '" + clause.clause + "' on sheet: " +
                        sheetName + " at row " + clause._row_num);
            }
        }
        /** ensure the section ends with an exit_section command */
        var rowNum;
        if ( flow.length === 0 ) {
            rowNum = 2;
        } else {
            rowNum = flow[flow.length-1]._row_num+1;
        }
        var exitEnding = { _token_type: "exit_section",
                           clause: "exit section",
                           _row_num: rowNum };
        blockFlow.push(exitEnding);

        if ( !hasContents ) {
            /** emit the _contents branch label (for the contents prompt) */
            blockFlow.push({ _token_type: "branch_label", branch_label: "_contents", _row_num: rowNum });
            blockFlow.push({ _token_type: "prompt", type: "contents", _type: "contents", _row_num: rowNum, screen: { hideInBackHistory: true } });
            // this should never be reached....
            blockFlow.push({ _token_type: "resume", clause: "resume", _row_num: rowNum });
        }

        if ( sheetName == 'initial' ) {
            blockFlow.push({ _token_type: "branch_label", branch_label: "_finalize", _row_num: rowNum });
            blockFlow.push({ _token_type: "validate", clause: "validate finalize", _sweep_name: "finalize", _row_num: rowNum, screen: { hideInBackHistory: true } });
            blockFlow.push({ _token_type: "save_and_terminate", clause: "save and terminate", calculation: true, _row_num: rowNum, screen: { hideInBackHistory: true } });
            // this should never be reached....
            blockFlow.push({ _token_type: "resume", clause: "resume", _row_num: rowNum });
        }
        return blockFlow;
    };

    /**
     * Split out the tags in validation_tags.
     * Map the
     */
    var updateValidationTagMap = function( validationTagMap, promptIdx, clause ) {
        // we need to add this to the validationTagMap
        var tags = "";
        if ( "validation_tags" in clause ) {
            tags = clause.validation_tags;
        }
        tags = tags.replace(/\s+/g,' ');// remove extra spaces
        tags = tags.trim();
        var parts = tags.split(" ");
        if ( tags === "" || parts.length === 0 || (parts.length === 1 && parts[0] === "") ) {
            if ( "required" in clause || "constraint" in clause ) {
                validationTagMap._finalize.push(promptIdx);
            }
        } else {
            var j;
            for ( j = 0 ; j < parts.length ; ++j ) {
                if ( !( parts[j] in validationTagMap ) ) {
                    validationTagMap[parts[j]] = [];
                }
                validationTagMap[parts[j]].push(promptIdx);
            }
        }
    };

    var constructScreenDefn = function(sheetName, prompts, validationTagMap, blockFlow, idx, enclosingScreenLabel, enclosing_row_num) {
        if ( enclosingScreenLabel === undefined || enclosingScreenLabel === null ) {
            throw Error("Internal error. No enclosing screen label defined on sheet: " +
            sheetName + " at row " + enclosing_row_num);
        }
        var defn = "";
        var i = idx;
        while ( i < blockFlow.length ) {
            var clause = blockFlow[i];
            switch (clause._token_type) {
            case "assign":
                // assign(valueName,value) will save the value into data(valueName)
                // and return the value for use in any enclosing expression.
                // (in this case, there is none).  It is exposed via formulaFunctions.
                // The actual write to the database occurs later in processing.
                defn += "assign('" + clause.name + "', " + clause.calculation + ");\n";
                ++i;
                break;
            case "prompt":
                var promptIdx = prompts.length;
                clause._branch_label_enclosing_screen = sheetName + '/' + enclosingScreenLabel;
                clause.promptIdx = promptIdx;
                prompts.push(clause);
                updateValidationTagMap( validationTagMap, promptIdx, clause);
                if ( 'screen' in clause ) {
                    throw Error("Error in clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
                        sheetName + " Prompts nested within begin/end screen directives cannot set 'screen' parameters ");
                }
                defn += "activePromptIndicies.push(" + promptIdx + ");\n";
                ++i;
                break;
            case "begin_if":
                var thenBlock = clause._then_block;
                var elseBlock = clause._else_block;

                defn += "if (" + clause.condition + ") {\n";
                defn +=    constructScreenDefn(sheetName, prompts, validationTagMap, thenBlock, 0, enclosingScreenLabel, enclosing_row_num);
                defn += "}\n";
                if ( elseBlock !== undefined && elseBlock !== null && elseBlock.length > 0 ) {
                    defn += "else {\n";
                    defn +=    constructScreenDefn(sheetName, prompts, validationTagMap, elseBlock, 0, enclosingScreenLabel, enclosing_row_num);
                    defn += "}\n";
                }
                ++i;
                break;
            case "end_screen":
            case "else":
            case "end_if":
            case "branch_label":
            case "goto_label":
            case "resume":
            case "back_in_history":
            case "do_section":
            case "exit_section":
            case "validate":
            case "save_and_terminate":
                throw Error("Internal error. clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
                        sheetName);
                // break;
            default:
                throw Error("Unrecognized clause: '" + clause.clause + "' on sheet: " +
                        sheetName + " at row " + clause._row_num);
            }
        }
        return defn;
    };

    /*
     * Replace if constructs with labels and conditional branches.
     * Move prompts into prompts list and extract the validation tag map.
     */
    var flattenBlocks = function(sheetName, prompts, validationTagMap, flattened, blockFlow, idx, specSettings) {
        var i = idx;
        while ( i < blockFlow.length ) {
            var clause = blockFlow[i];
			var newScreenLabel;
			var labelEntry;
			var defn;
            switch (clause._token_type) {
            case "branch_label":
            case "assign":
            case "goto_label":
            case "resume":
            case "back_in_history":
            case "exit_section":
            case "validate":
            case "save_and_terminate":
                flattened.push(clause);
                ++i;
                break;
            case "do_section":
                // create a psuedo-prompt in this section that has a
                // _branch_label_enclosing_screen that references the
                // first prompt within the subsection.  This is used
                // by the contents menu item to navigate to the first
                // prompt of that section.
                var psuedoPrompt = _.extend({}, clause,
                    { _token_type: "prompt",
                      _type: "_section",
                      promptIdx: prompts.length,
                      display: specSettings[clause._do_section_name].display,
                      _branch_label_enclosing_screen: clause._do_section_name + '/0' } );
                prompts.push(psuedoPrompt);
                flattened.push(clause);
                ++i;
                break;
            case "prompt":
                newScreenLabel = "_screen"+clause._row_num;
                labelEntry = { _token_type: "branch_label",
                        branch_label: newScreenLabel, _row_num: clause._row_num };
                flattened.push(labelEntry);
                // inform the prompt of the tag for the enclosing screen...
                var promptIdx = prompts.length;
                clause._branch_label_enclosing_screen = sheetName + '/' + newScreenLabel;
                clause.promptIdx = promptIdx;
                prompts.push(clause);
                updateValidationTagMap( validationTagMap, promptIdx, clause);

                defn = "activePromptIndicies.push(" + promptIdx + ");\n";
                defn = "function() {var activePromptIndicies = [];\n"+defn+"\nreturn activePromptIndicies;\n}\n";

                var bsb = { clause: clause.clause,
                    _row_num: clause._row_num,
                    _token_type: "begin_screen",
                    _screen_block: defn };
                if ( 'screen' in clause ) {
                    // copy the 'screen' settings into the clause
                    bsb.screen = clause.screen;
                    delete clause.screen;
                }
                flattened.push(bsb);
                ++i;
                break;
            case "begin_screen":
                newScreenLabel = "_screen"+clause._row_num;
                labelEntry = { _token_type: "branch_label",
                        branch_label: newScreenLabel, _row_num: clause._row_num };
                flattened.push(labelEntry);
                // process the screen definition
                defn = constructScreenDefn(sheetName, prompts, validationTagMap, clause._screen_block, 0, newScreenLabel, clause._row_num);
                defn = "function() {var activePromptIndicies = [];\n"+defn+"\nreturn activePromptIndicies;\n}\n";
                clause._screen_block = defn;
                flattened.push(clause);
                ++i;
                break;
            case "begin_if":
                var endIfClause = clause._end_if_clause;
                var elseClause = (clause._else_clause !== undefined && clause._else_clause !== null) ? clause._else_clause : endIfClause;
                var thenBlock = clause._then_block;
                var elseBlock = clause._else_block;
                var thenLabel = "_then" + clause._row_num;
                var endifLabel = "_endif" + endIfClause._row_num;
                var elseLabel = "_else" + elseClause._row_num;
                /*
                 * transform clause into a simple goto...
                 * Preserve the ordering of the then and else blocks
                 * (so that prompts remain in-order)
                 */
                delete clause._else_clause;
                delete clause._end_if_clause;
                delete clause._then_block;
                delete clause._else_block;
                clause._token_type = "goto_label";
                clause._branch_label = thenLabel;
                flattened.push(clause); // goto Then conditionally

                var goelse = { clause: elseClause.clause,
                        _token_type: "goto_label",
                        _branch_label: elseLabel,
                        _row_num: elseClause._row_num
                };

                flattened.push(goelse); // goto Else unconditionally

                labelEntry = { _token_type: "branch_label",
                        branch_label: thenLabel, _row_num: clause._row_num };

                flattened.push(labelEntry); // Then label
                // then block...
                flattenBlocks(sheetName, prompts, validationTagMap, flattened, thenBlock, 0, specSettings);

                var goendif = { clause: endIfClause.clause,
                        _token_type: "goto_label",
                        _branch_label: endifLabel,
                        _row_num: endIfClause._row_num
                };

                flattened.push(goendif); // goto EndIf unconditionally

                labelEntry = { _token_type: "branch_label",
                        branch_label: elseLabel, _row_num: elseClause._row_num };

                flattened.push(labelEntry); // Else label

                // else block...
                if ( elseBlock !== undefined && elseBlock !== null ) {
                    flattenBlocks(sheetName, prompts, validationTagMap, flattened, elseBlock, 0, specSettings);
                }

                labelEntry = { _token_type: "branch_label",
                        branch_label: endifLabel, _row_num: endIfClause._row_num };

                flattened.push(labelEntry); // EndIf label
                ++i;
                break;
            case "end_screen":
            case "else":
            case "end_if":
                throw Error("Internal error. clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
                        sheetName);
                // break;
            default:
                throw Error("Unrecognized clause: '" + clause.clause + "' on sheet: " +
                        sheetName + " at row " + clause._row_num);
            }
        }
    };

    /**
     * Move branch labels into branchLabelMap leaving just the operations in the operations list.
     */
    var extractBranchLabels = function( sheetName, operations, branchLabelMap, flattened, idx) {
        var i = idx;
        while ( i < flattened.length ) {
            var clause = flattened[i];
            switch (clause._token_type) {
            case "branch_label":
                branchLabelMap[clause.branch_label] = operations.length;
                ++i;
                break;
            case "assign":
            case "render":
            case "goto_label":
            case "resume":
            case "back_in_history":
            case "do_section":
            case "exit_section":
            case "validate":
            case "save_and_terminate":
            case "begin_screen":
                clause.operationIdx = operations.length;
                operations.push(clause);
                ++i;
                break;
            case "prompt":
            case "begin_if":
            case "end_screen":
            case "else":
            case "end_if":
                throw Error("Internal error. clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
                        sheetName);
                // break;
            default:
                throw Error("Unrecognized clause: '" + clause.clause + "' on sheet: " +
                        sheetName + " at row " + clause._row_num);
            }
        }
    };

    /**
     * Verify that all goto_label constructs have a reachable branch label.
     */
    var verifyReachableLabels = function( sheetName, operations, branchLabelMap, idx, inscreen) {
        var i = idx;
        while ( i < operations.length ) {
            var clause = operations[i];
            switch (clause._token_type) {
            case "goto_label":
                if ( !(clause._branch_label in branchLabelMap) ) {
                    if ( inscreen ) {
                        throw Error("Branch label is not defined or not reachable. Labels defined outside a screen cannot be referenced from within a screen. Clause: '" + clause.clause + "' at row " +
                                clause._row_num + " on sheet: " + sheetName);
                    } else {
                        throw Error("Branch label is not defined or not reachable. Labels cannot be referenced outside of their enclosing sheet. Clause: '" + clause.clause + "' at row " +
                                clause._row_num + " on sheet: " + sheetName);
                    }
                }
                ++i;
                break;
            case "assign":
            case "resume":
            case "back_in_history":
            case "do_section":
            case "exit_section":
            case "validate":
            case "save_and_terminate":
            case "begin_screen":
                ++i;
                break;
            case "branch_label":
            case "render":
            case "prompt":
            case "begin_if":
            case "end_screen":
            case "else":
            case "end_if":
                throw Error("Internal error. clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
                        sheetName);
                // break;
            default:
                throw Error("Unrecognized clause: '" + clause.clause + "' on sheet: " +
                        sheetName + " at row " + clause._row_num);
            }
        }
    };

    /**
     * Gather all the section names referenced by do_section.
     */
    var gatherNestedSections = function( sheetName, operations, nestedSections, idx) {
        var i = idx;
        while ( i < operations.length ) {
            var clause = operations[i];
            switch (clause._token_type) {
            case "do_section":
                nestedSections[clause._do_section_name] = true;
                ++i;
                break;
            case "assign":
            case "goto_label":
            case "resume":
            case "back_in_history":
            case "exit_section":
            case "validate":
            case "save_and_terminate":
            case "begin_screen":
                ++i;
                break;
            case "branch_label":
            case "render":
            case "prompt":
            case "begin_if":
            case "end_screen":
            case "else":
            case "end_if":
                throw Error("Internal error. clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
                        sheetName);
                // break;
            default:
                throw Error("Unrecognized clause: '" + clause.clause + "' on sheet: " +
                        sheetName + " at row " + clause._row_num);
            }
        }
    };
    var evalAsFunction = function(wrappedFn, field, worksheet, rowNum, columnPath) {
        try {
            var obj = {};
            with (obj) {
                eval(wrappedFn);
            }
        } catch (e) {
            throw new Error("Error: " + e.message + " interpretting formula: " + field + " on sheet: " +
                    worksheet + " row: " + rowNum + " column: " + columnPath);
        }
    };

    /**
     * Verify that the given field looks good w.r.t. the given columnType
     */
    var sanityCheckOneField = function( field, columnType, worksheet, rowNum, columnPath ) {
        if ( _.isArray(columnType) ) {
            throw Error("Unable to handle array-valued column_types enforcement: ", columnPath);
        }
        if ( _.isObject(columnType) ) {

            _.each(_.keys(field), function(k) {
                if ( k in columnType ) {
                    sanityCheckOneField( field[k], columnType[k], worksheet, rowNum, columnPath + '.' + k );
                }
            });
            return;
        }

        // OK. We have a specific columnType.
        var formulaArgs = 'formula(';
        if ( columnType === 'formula' || columnType.substring(0,formulaArgs.length) == formulaArgs ) {
            var iArg = columnType.indexOf('(');
            var argList = "()";
            if ( iArg !== -1 ) {
                argList = columnType.substring(iArg);
            }

            var fn = "function" + argList + "{\nreturn (" + field + ");\n}";
            evalAsFunction('('+fn+')', field, worksheet, rowNum, columnPath);
        } else if ( columnType === 'function' ) {
            // see if we can eval it...
            evalAsFunction('('+field+')', field, worksheet, rowNum, columnPath);
        } else if ( columnType === 'requirejs_path') {
            // nothing to test
        }
    };

    /**
     * The rowObject represents a single processed row in the workbook, excluding the
     * column_types, prompt_types and model sheets.
     *
     * The specColumnTypes declares what the field types should be for this object.
     *
     * Throw an exception if the field types are not appropriate or well-formed.
     */
    var sanityCheckFieldTypes = function(rowObject, worksheet, specColumnTypes) {
        _.each(_.keys(rowObject), function(k) {
            if ( k in specColumnTypes && k !== '_row_num' && k !== '__rowNum') {
                sanityCheckOneField( rowObject[k], specColumnTypes[k], worksheet, rowObject._row_num, k );
            }
        });
    };


    var parseSection = function(sheetName, sheet, specSettings, specColumnTypes){

        /*
         * Ensure that all the evaluated field types are well-formed
         */
        var i = 0;
        for ( i = 0 ; i < sheet.length ; ++i ) {
            sanityCheckFieldTypes(sheet[i], sheetName, specColumnTypes);
        }

        /*
         * parse the 'clause' field
         */
        var flow = parseControlFlowSection(sheetName, sheet);

        /*
         * reconstruct and validate begin/end blocks
         */
        var blockFlow = parseTopLevelBlock(sheetName, flow);

        /*
         * Move prompts into separate prompts[] array.
         *
         * Replace prompt entries in control flow with 'render' actions
         * that specify the index into the prompts[] array, where the
         * prompts were moved.
         *
         * Flatten into user-defined and synthetic labels
         * and conditional gotos at the top-level and
         * within-screen levels.
         *
         * Extract validationTags into the validationTagMap.
         */
        var validationTagMap = { _finalize: [] };
        var prompts = [];
        var flattened = [];
        flattenBlocks(sheetName, prompts, validationTagMap, flattened, blockFlow, 0, specSettings);
        /*
         *
         * OK:
         * (1) Blocks are flattened with synthetic labels and conditional gotos.
         * (2) Prompts are pulled out to the prompts[] array.
         * (3) Every render (action to render a prompt) is wrapped by a begin_screen,
         * (4) there is a label immediately before each begin_screen,
         * (5) all prompts know the label of the enclosing begin_screen for their render.
         * (6) the validation tags for a prompt are split out into validationTagMap
         *
         * Extract branch labels into a separate labels map,
         * Create the operations[] list of (just) actions.
         *
         * Branch-label map is at two levels --
         * top-level labels and within-screen labels.
         */

        var branchLabelMap = {};
        var operations = [];
        extractBranchLabels( sheetName, operations, branchLabelMap, flattened, 0);

        /*
         * Verify that gotos at one level do not reference another.
         * I.e., within a screen you cannot jump out of the screen,
         * at the top level, you cannot jump into the middle of a
         * screen.
         */
        verifyReachableLabels( sheetName, operations, branchLabelMap, 0, false);

        /*
         * Assemble a map of the sections this section calls into.
         */
        var nestedSections = {};
        gatherNestedSections( sheetName, operations, nestedSections, 0);

        return {
            section_name: sheetName,
            nested_sections: nestedSections,
            reachable_sections: _.extend({}, nestedSections),
            prompts: prompts,
            validation_tag_map: validationTagMap,
            operations: operations,
            branch_label_map: branchLabelMap,
        };
    };

    var parseSections = function(sectionNames, sections, specSettings, specColumnTypes) {
        /* Step 1: restructure each section.
         *
         */
        var newSections = {};
        _.each(sections, function(section, sectionName){
            var sectionObject = parseSection(sectionName, section, specSettings, specColumnTypes);
            newSections[sectionName] = sectionObject;
        });

        /*
         * Verify sections are not co-routines or cyclical.
         *
         * for each section
         *    for each reachable section
         *       accummulate the nested sections of the reachable sections.
         *    construct reached-by list
         *
         * for each section
         *    for each reac
         */
        var i = 0;
        var len = 0;
        for ( i in newSections ) {
            len++;
        }
        var base = 1;
        while ( base <= len ) {
            base = 2*base;
        }
        for ( i = 1 ; i <= base ; i = 2*i ) {
            _.each(newSections, function(section) {
                var newReachable = {};
                _.each(section.reachable_sections, function(reached, sectionName) {
                    newReachable[sectionName] = true;
                    if (newSections[sectionName]) {
                        _.each(newSections[sectionName].reachable_sections, function(rreached, depthOne) {
                            newReachable[depthOne] = true;
                        });
                    } else {
                        throw new Error("Cannot convert section " + sectionName +". Section may be blank or missing.");
                    }
                });
                section.reachable_sections = newReachable;
            });
        }
        // detect problems...
        _.each(newSections, function(section) {
            if ( section.nested_sections.initial ) {
                throw Error("Section '" + section.section_name + "' improperly references the top-level section 'initial' in a 'do section' statement");
            }
            if ( section.reachable_sections[section.section_name] ) {
                throw Error("Section '" + section.section_name + "' participates in a nested series of 'do section' statements that may call back into '" + section.section_name + "'!");
            }
        });

        var keys = {};
        _.each(newSections, function(section) {
            _.each(section.validation_tag_map, function(value, key) {
                keys[key] = "true";
            });
        });
        var key_length = 0;
        for ( var akey in keys ) {
            key_length++;
        }

        if ( key_length === 1 && "_finalize" in keys ) {
            // not using validation tags -- rename _finalize to finalize.
            _.each(newSections, function(section) {
                section.validation_tag_map.finalize = section.validation_tag_map._finalize;
                delete section.validation_tag_map._finalize;
            });
        } else {
            // remove the _finalize validation tag -- explicit tags are being used.
            _.each(newSections, function(section) {
                delete section.validation_tag_map._finalize;
            });
        }
        return newSections;
    };

    /*
     * Remove the '_row_num', '__rowNum__', 'name' and 'comments' fields, if present.
     * We want to ignore any differences in those values...
     */
    var removeIgnorableModelFields = function( defn ) {
        delete defn.name;
        delete defn.comments;
        delete defn._row_num;
        delete defn.__rowNum__;
    };

    /**
     * Merge the definition of a field datatype across multiple prompts.
     * The merge should be order-independent. i.e., each prompt should be
     * referring to the same storage type. They may each add additional
     * fields, but should not add fields that are not identical.
     *
     */
    var updateModel = function( section, promptOrAction, model, schema ) {
        var mdef = {};
        if ( "model" in promptOrAction ) {
            // merge the model fields into the model...
            // these override the schema values
            mdef = promptOrAction.model;
        }

        var name = promptOrAction.name;

        // if a displayName has not already been defined and if
        // display.title.text is present, then display.title becomes the displayName for the model.
        // otherwise, use the element name.
        if ( !("displayName" in mdef) ) {
            if ( "display" in promptOrAction && 
			     "title" in promptOrAction.display &&
				 "text" in promptOrAction.display.title	) {
                mdef.displayName = promptOrAction.display.title;
            }
        }

        // if the prompt has a value_list, propagate that into the model
        // for entry as metadata for the displayChoices value in the KVS.
        //
        if ( "values_list" in promptOrAction ) {
            mdef.valuesList = promptOrAction.values_list;
        }
        
		var defn;
        if ( name in model ) {
            defn = model[name];
            var amodb = deepExtendObject( deepExtendObject(
                            deepExtendObject({},defn), schema), mdef );
            var bmoda = deepExtendObject( deepExtendObject(
                            deepExtendObject({},schema), mdef), defn );
            removeIgnorableModelFields(amodb);
            removeIgnorableModelFields(bmoda);
            delete amodb._defn;
            delete bmoda._defn;

            if ( !_.isEqual(amodb, bmoda) ) {
                var formatted = "";
                _.each( defn._defn, function( def) {
                    formatted = formatted + ", at row: " + def._row_num + " on sheet: " + def.section_name;
                });
                throw Error(promptOrAction._token_type + " 'name' is defined more than once with different data types. Clause: '" + promptOrAction.type + "' at row " +
                        promptOrAction._row_num + " on sheet: " + section.section_name + " and " + formatted.substring(2) );
            }
            defn._defn.push({_row_num: promptOrAction._row_num, section_name: section.section_name});
            var dt = defn._defn;
            delete defn._defn;
            deepExtendObject( deepExtendObject( defn, schema ), mdef );
            defn._defn = dt;
        } else {
            model[name] = deepExtendObject( deepExtendObject(
                    {_defn: [{ _row_num : promptOrAction._row_num, section_name: section.section_name }]}, schema), mdef);
            defn = model[name];
        }
        removeIgnorableModelFields(defn);
    };

    var assertValidUserDefinedName = function(errorPrefix, name) {
        if ( name === undefined || name === null ) {
            throw Error(errorPrefix + " is not defined.");
        }
        if ( !pattern_valid_user_defined_name.test(name) ) {
            throw Error(errorPrefix + " must begin with a letter and contain only letters, digits and '_'");
        }
        // leave 3 characters for our own use (leading double underscore + 1 character suffix).
        if ( name.length > 59 ) {
            throw Error(errorPrefix + " cannot be longer than 59 characters. It is " + name.length + " characters long.");
        }
        var lowercase = name.toLowerCase();
        if (lowercase in reservedFieldNames) {
            throw Error(errorPrefix + " is one of a long list of reserved words. To work around these, consider using a concatenation of two words (e.g., 'firstname').");
        }
    };

    /**
     * Helper function to ensure that all fieldNames are short enough once
     * all recursively expanded elementPaths are considered.
     */
    var assertValidElementKey = function(elementPath, elementKey, fullSetOfElementKeys) {
        var isSimple = false;
        if ( elementPath === undefined || elementPath === null ) {
            throw Error("Field is not defined.");
        } else if ( elementPath.indexOf('.') === -1) {
            // simple name
            isSimple = true;
            assertValidUserDefinedName("Field '" + elementPath + "' ", elementKey);
        } else {
            try {
                assertValidUserDefinedName("Fully qualified element path ", elementKey);
            } catch (e) {
                var ex1name = elementPath.substring(0,elementPath.indexOf('.'));
                throw Error(e.message + " Full elementPath: " + elementPath + " Consider shortening the field name '" + ex1name + "'.");
            }
        }

        if ( fullSetOfElementKeys !== undefined && fullSetOfElementKeys !== null ) {
            if ( elementKey in fullSetOfElementKeys ) {
                var path = fullSetOfElementKeys[elementKey];

                if ( isSimple ) {
                    var ex2name = path.indexOf('.') === -1 ? path : path.substring(0,path.indexOf('.'));
                    throw Error("The framework's identifier for field '" + elementPath +
                            "' collides with the identifier for the full elementPath: '" + path +
                            "'. Please change one of the field names ('" + elementPath + "' or '" + ex2name + "').");
                } else {
                    var refname = path.indexOf('.') === -1 ? path : path.substring(0,path.indexOf('.'));
                    var ex3name = elementPath.substring(0,elementPath.indexOf('.'));
                    throw Error("The framework's identifier for the full elementPath: '" + elementPath +
                            "' collides with the identifier for the full elementPath: '" + path +
                            "'. Please change one of the field names ('" + ex3name + "' or '" + refname + "').");
                }
            } else {
                fullSetOfElementKeys[elementKey] = elementPath;
            }
        }

    };

    var assignItemsElementKey = function( elementPathPrefix, elementKeyPrefix, fullSetOfElementKeys, enclosingElement ) {
        if ( !('items' in enclosingElement) ) {
            enclosingElement.items = {"type": "object"};
        }

        var elementPath = elementPathPrefix + '.items';
        var key = elementKeyPrefix + '_items';
        if ( ('elementKey' in enclosingElement.items) && enclosingElement.items.elementKey != key ) {
            throw Error("elementKey is user-defined for '" + elementPath +
                    "' (the array-element type declaration) but does not match computed key: " + key);
        }
        assertValidElementKey(elementPath, key, fullSetOfElementKeys);
        enclosingElement.items.elementKey = key;
    };

    /**
     * Helper function for constructing and assigning the elementKey in the model
     */
    var recursiveAssignPropertiesElementKey = function( elementPathPrefix, elementKeyPrefix, fullSetOfElementKeys, properties ) {
        if ( properties === undefined || properties === null ) {
            return;
        }

        _.each( _.keys(properties), function(name) {
            var entry = properties[name];
            var elementPath = elementPathPrefix + '.' + name;
            var key = elementKeyPrefix + '_' + name;
            if ( ('elementKey' in entry) && entry.elementKey != key ) {
                throw Error("elementKey is user-defined for " + elementPath + " but does not match computed key: " + key);
            }
            assertValidElementKey(elementPath, key, fullSetOfElementKeys);
            entry.elementKey = key;
            if ( entry.type === "object" ) {
                // we have properties...
                recursiveAssignPropertiesElementKey( elementPath, key, fullSetOfElementKeys, entry.properties );
            } else if ( entry.type === "array" ) {
                assignItemsElementKey( elementPath, key, fullSetOfElementKeys, entry );
            }
        });
    };

    /**
     * Descend into 'term' expanding the 'type' field with the promptType storage
     * definition found in the 'prompt_types' sheet; override that definition with
     * whatever is provided in the model sheet (excluding the original 'type' field).
     */
    var recursivelyResolveTypeInDataModel = function( term, promptTypes ) {
        if ( 'properties' in term ) {
            _.each( _.keys(term.properties), function(name) {
                var defn = term.properties[name];
                if ( 'type' in defn ) {
                    // blend in the default definition for this prompt type
                    var type = defn.type;
                    if ( type in promptTypes ) {
                        var schema = promptTypes[type];
                        if(schema) {
                            // deep copy of schema because we are going to add properties recursively
                            schema = deepCopyObject(schema);
                            // override the promptTypes 'type' with info supplied by the prompt_type sheet.
                            delete defn.type;
                            term.properties[name] = deepExtendObject( schema, defn );
                        }
                    }
                }
                recursivelyResolveTypeInDataModel(term.properties[name], promptTypes);
            });
        }
        if ( 'items' in term ) {
            var defn = term.items;
            if ( 'type' in defn ) {
                // blend in the default definition for this prompt type
                var type = defn.type;
                if ( type in promptTypes ) {
                    var schema = promptTypes[type];
                    if(schema) {
                        // deep copy of schema because we are going to add properties recursively
                        schema = deepCopyObject(schema);
                        // override the promptTypes 'type' with info supplied by the prompt_type sheet.
                        delete defn.type;
                        term.items = deepExtendObject( schema, defn );
                    }
                }
            }
            recursivelyResolveTypeInDataModel(term.items, promptTypes);
        }
    };

    var developDataModel = function( specification, promptTypes ) {
        /**
         * The user understands prompt 'type'
         * Go through the model and replace the 'type' value found with the expansion of
         * the storage for that prompt 'type' with the actual datastore representation.
         */

        _.each( _.keys(specification.model), function(name) {
            var defn = specification.model[name];
            if ( 'type' in defn ) {
                // blend in the default definition for this prompt type
                var type = defn.type;
                if ( type in promptTypes ) {
                    var schema = promptTypes[type];
                    if(schema) {
                        // deep copy of schema because we are going to add properties recursively
                        schema = deepCopyObject(schema);
                        // override the promptTypes 'type' with info supplied by the prompt_type sheet.
                        delete defn.type;
                        specification.model[name] = deepExtendObject( schema, defn );
                    }
                }
            }
            recursivelyResolveTypeInDataModel(specification.model[name], promptTypes);
        });

        var assigns = [];
        var model = {};
        _.each(specification.sections, function(section){
            _.each(section.prompts, function(prompt){
                var schema;
                if(prompt._type in promptTypes) {
                    schema = promptTypes[prompt._type];
                    if(schema){
                        if("name" in prompt) {
                            var name = prompt.name;
                            try {
                                assertValidElementKey(name, name);
                            } catch (e) {
                                throw Error(e.message + " Prompt: '" + prompt.type + "' at row " +
                                    prompt._row_num + " on sheet: " + section.section_name);
                            }
                            // deep copy of schema because we are going to add properties recursively
                            schema = deepCopyObject(schema);
                            recursivelyResolveTypeInDataModel(schema, promptTypes);
                            updateModel( section, prompt, model, schema );
                        } else {
                            throw Error("Expected 'name' but none defined for prompt. Prompt: '" + prompt.type + "' at row " +
                                    prompt._row_num + " on sheet: " + section.section_name);
                        }
                    } else if ( schema === undefined ) {
                        throw Error("Unrecognized prompt type. Prompt: '" + prompt.type + "' at row " +
                                prompt._row_num + " on sheet: " + section.section_name);
                    } /* otherwise, it is a non-storage-type prompt */
                } else {
                    throw Error("Unrecognized prompt type. Prompt: '" + prompt.type + "' at row " +
                            prompt._row_num + " on sheet: " + section.section_name);
                }
            });

            /*
             * Process the 'assign' statements.
             * Two flavors of these statements:
             *   assign  | name | calculation   -- no prompt_type info
             *   assign integer | name | calculation  -- prompt_type info supplied in 'type' column.
             *
             *   The initial parsing has
             *   _token_type = "assign"
             *   _data_type = null or "integer", respectively, for above.
             */
            _.each(section.operations, function(operation) {
                if ( operation._token_type === "assign" ) {
                    if("name" in operation) {
                        var name = operation.name;
                        try {
                            assertValidElementKey(name, name);
                        } catch (e) {
                            throw Error(e.message + " Assign clause: '" + operation.type + "' at row " +
                                    operation._row_num + " on sheet: " + section.section_name);
                        }
                        if (operation._data_type === undefined || operation._data_type === null) {
                            // no explicit type -- hope that the field gets a value somewhere else...
                            // record name to verify that is the case.
                            updateModel( section, operation, model, {} );
                            assigns.push({ operation: operation, section: section });
                        } else if(operation._data_type in promptTypes) {
                            var schema = promptTypes[operation._data_type];
                            if(schema){
                                // deep copy of schema because we are going to add properties recursively
                                schema = deepCopyObject(schema);
                                recursivelyResolveTypeInDataModel(schema, promptTypes);
                                updateModel( section, operation, model, schema );
                            } else if ( schema === undefined ) {
                                throw Error("Unrecognized assign type: " + operation._data_type + ". Clause: '" + operation.type + "' at row " +
                                        operation._row_num + " on sheet: " + section.section_name);
                            } else {
                                throw Error("Invalid assign type: " + operation._data_type + ". Clause: '" + operation.type + "' at row " +
                                        operation._row_num + " on sheet: " + section.section_name);
                            }
                        } else {
                            throw Error("Unrecognized assign type: " + operation._data_type + ". Clause: '" + operation.type + "' at row " +
                                    operation._row_num + " on sheet: " + section.section_name);
                        }
                    } else {
                        throw Error("Expected 'name' but none defined for assign. Assign: '" + operation.type + "' at row " +
                                operation._row_num + " on sheet: " + section.section_name);
                    }
                }
            });
        });

        // The model tab takes precedence over whatever was defined at the prompt layer.

        // Look for fields defined by the model tab that are also defined by prompts. If the
        // prompts declare a different data type, then warn the user. Regardless, treat the
        // model tab as the authority, overriding any inconsistency from the prompt definitions.
        // NOTE: Warnings can be suppressed by defining model.xxx overrides on each prompt.
        _.each( _.keys(specification.model), function(name) {
            if ( name in model ) {
                // defined in both
                var defn = model[name];
                var mdef = specification.model[name];
                var amodb = deepExtendObject( deepExtendObject( {}, defn), mdef);
                var bmoda = deepExtendObject( deepExtendObject( {}, mdef), defn);
                removeIgnorableModelFields(amodb);
                removeIgnorableModelFields(bmoda);
                delete amodb._defn;
                delete bmoda._defn;

                if ( !_.isEqual(amodb, bmoda) ) {
                    // the model and prompts field definitions are incompatible.
                    // Issue a warning to the user...
                    var formatted = "";
                    _.each( defn._defn, function( def) {
                        formatted = formatted + ", at row: " + def._row_num + " on sheet: " + def.section_name;
                    });
                    warnings.warn(name + " has different definitions at row " +
                            mdef._defn[0]._row_num + " on " + mdef._defn[0].section_name +
                            " sheet than " + formatted.substring(2) + " " + mdef._defn[0].section_name +
                            " sheet takes precedence." );
                }
                // merge the definition from the survey with the model
                // such that the model takes precedence.
                defn._defn.push(mdef._defn[0]);
                var dt = defn._defn;
                delete defn._defn;
                deepExtendObject(defn, mdef);
                defn._defn = dt;
                // update model...
                specification.model[name] = defn;
            }
        });
        // copy over the fields in the prompt model that were not defined in the model tab...
        _.each( _.keys(model), function(name) {
            if ( !(name in specification.model) ) {
                specification.model[name] = model[name];
            }
        });

        // ensure that all the untyped assigns have types via either a model entry, an assign or a prompt...
        for ( var i = 0 ; i < assigns.length ; ++i ) {
            var section = assigns[i].section;
            var operation = assigns[i].operation;
            if ( !(operation.name in model) ) {
                throw Error("Field name '" + operation.name + "' does not have a defined storage type. Clause: '" + operation.type + "' at row " +
                        operation._row_num + " on sheet: " + section.section_name + ". Declare the type on the model sheet or in a model.type column.");
            }
        }

        var fullSetOfElementKeys = {};

        // ensure that all the model entries are not reserved words or too long
        _.each( _.keys(specification.model), function(name) {
            var entry = specification.model[name];
            if ( ('elementKey' in entry) && entry.elementKey != name ) {
                throw Error("elementKey is user-defined for " + name + " but does not match computed key: " + name);
            }
            // this is already known to be true for prompts and assigns within the form.
            // test again to catch any fields that are defined only via the model.
            assertValidElementKey(name, name, fullSetOfElementKeys);
            entry.elementKey = name;
            if ( entry.type === "object" ) {
                // we have properties...
                recursiveAssignPropertiesElementKey( name, name, fullSetOfElementKeys, entry.properties );
            } else if ( entry.type === "array" ) {
                assignItemsElementKey( name, name, fullSetOfElementKeys, entry );
            }
        });
    };

    ///////////////////////////////////////////////////////////////////////////
    // Now, create the model from the json.
    // this code is shared between survey and XLSXConverter
    
    /**
     * Mark all of the session variables for XLSXConverter
     */
    var _setSessionVariableFlag = function( dbKeyMap, listChildElementKeys) {
        //var that = this;
        var i;
        if ( listChildElementKeys !== undefined && listChildElementKeys !== null ) {
            for ( i = 0 ; i < listChildElementKeys.length ; ++i ) {
                var f = listChildElementKeys[i];
                var jsonType = dbKeyMap[f];
                jsonType.isSessionVariable = true;
                if ( jsonType.type === 'array' ) {
                    _setSessionVariableFlag(dbKeyMap, jsonType.listChildElementKeys);
                } else if ( jsonType.type === 'object' ) {
                    _setSessionVariableFlag(dbKeyMap, jsonType.listChildElementKeys);
                }
            }
        }
    };

    /**
     * Invert a formDef.json for XLSXConverter
     */
    var flattenElementPath = function( dbKeyMap, elementPathPrefix, elementName, elementKeyPrefix, jsonType ) {
        //var that = this;
        var elementKey;

        // remember the element name...
        jsonType.elementName = elementName;
        // and the set is 'data' because it comes from the data model...
        jsonType.elementSet = 'data';
        
        // update element path prefix for recursive elements
        elementPathPrefix = ( elementPathPrefix === undefined || elementPathPrefix === null ) ? elementName : (elementPathPrefix + '.' + elementName);
        // and our own element path is exactly just this prefix
        jsonType.elementPath = elementPathPrefix;

        // use the user's elementKey if specified
        elementKey = jsonType.elementKey;

        if ( elementKey === undefined || elementKey === null ) {
            elementKey = elementPathPrefix.replace(/\./g,'_');
            jsonType.elementKey = elementKey;
        }

        if ( elementKey === undefined || elementKey === null ) {
            throw new Error("elementKey is not defined for '" + jsonType.elementPath + "'.");
        }

        // simple error tests...
        // throw an error if the elementkey is longer than 62 characters
        // or if it is already being used and not by myself...
        if ( elementKey.length > 62 ) {
            throw new Error("supplied elementKey is longer than 62 characters");
        }
        if ( dbKeyMap[elementKey] !== undefined && dbKeyMap[elementKey] !== null && dbKeyMap[elementKey] != jsonType ) {
            throw new Error("supplied elementKey is already used (autogenerated?) for another model element");
        }
        if ( elementKey.charAt(0) === '_' ) {
            throw new Error("supplied elementKey starts with underscore");
        }

        // remember the elementKey we have chosen...
        dbKeyMap[elementKey] = jsonType;

        // handle the recursive structures...
		var f;
        if ( jsonType.type === 'array' ) {
            // explode with subordinate elements
            f = flattenElementPath( dbKeyMap, elementPathPrefix, 'items', elementKey, jsonType.items );
            jsonType.listChildElementKeys = [ f.elementKey ];
        } else if ( jsonType.type === 'object' ) {
            // object...
            var e;
            var listChildElementKeys = [];
            for ( e in jsonType.properties ) {
                f = flattenElementPath( dbKeyMap, elementPathPrefix, e, elementKey, jsonType.properties[e] );
                listChildElementKeys.push(f.elementKey);
            }
			// the children need to be in alphabetical order in order to be repeatably comparable.
			listChildElementKeys.sort();
            jsonType.listChildElementKeys = listChildElementKeys;
        }

        if ( jsonType.isSessionVariable && (jsonType.listChildElementKeys !== undefined) && (jsonType.listChildElementKeys !== null)) {
            // we have some sort of structure that is a sessionVariable
            // Set the isSessionVariable tags on all its nested elements.
            _setSessionVariableFlag(dbKeyMap, jsonType.listChildElementKeys);
        }
        return jsonType;
    };

	var getPrimitiveTypeOfElementType = function(elementType) {
		var idxColon = elementType.indexOf(":");
		var idxParen = elementType.indexOf("(");
		if ( idxParen !== -1 && idxColon > idxParen ) {
			idxColon = -1;
		}
		if ( idxColon === -1 ) {
			if ( idxParen !== -1 ) {
				return elementType.substring(0,idxParen);
			} else {
				return elementType;
			}
		} else {
			if ( idxParen !== -1 ) {
				return elementType.substring(idxColon+1,idxParen);
			} else {
				return elementType.substring(idxColon+1);
			}
		}
	};
    /**
     * Mark the elements of an inverted formDef.json
     * that will be retained in the database for XLSXConverter
     */
    var markUnitOfRetention = function(dataTableModel) {
        // for all arrays, mark all descendants of the array as not-retained
        // because they are all folded up into the json representation of the array
        var startKey;
        var jsonDefn;
		var elementTypePrimitive;
        var key;
        var jsonSubDefn;
            
        for ( startKey in dataTableModel ) {
            jsonDefn = dataTableModel[startKey];
            if ( jsonDefn.notUnitOfRetention ) {
                // this has already been processed
                continue;
            }
            elementTypePrimitive = (jsonDefn.elementType === undefined || jsonDefn.elementType === null ? jsonDefn.type : getPrimitiveTypeOfElementType(jsonDefn.elementType));
            if ( elementTypePrimitive === "array" ) {
                var descendantsOfArray = ((jsonDefn.listChildElementKeys === undefined || jsonDefn.listChildElementKeys === null) ? [] : jsonDefn.listChildElementKeys);
                var scratchArray = [];
                while ( descendantsOfArray.length !== 0 ) {
                    var i;
                    for ( i = 0 ; i < descendantsOfArray.length ; ++i ) {
                        key = descendantsOfArray[i];
                        jsonSubDefn = dataTableModel[key];
                        if ( jsonSubDefn !== null && jsonSubDefn !== undefined ) {
                            if ( jsonSubDefn.notUnitOfRetention ) {
                                // this has already been processed
                                continue;
                            }
                            jsonSubDefn.notUnitOfRetention = true;
                            var listChildren = ((jsonSubDefn.listChildElementKeys === undefined || jsonSubDefn.listChildElementKeys === null) ? [] : jsonSubDefn.listChildElementKeys);
                            scratchArray = scratchArray.concat(listChildren);
                        }
                    }
                    descendantsOfArray = scratchArray;
					scratchArray = [];
                }
            }
        }
        // and mark any non-arrays with multiple fields as not retained
        for ( startKey in dataTableModel ) {
            jsonDefn = dataTableModel[startKey];
            if ( jsonDefn.notUnitOfRetention ) {
                // this has already been processed
                continue;
            }
            elementTypePrimitive = (jsonDefn.elementType === undefined || jsonDefn.elementType === null ? jsonDefn.type : getPrimitiveTypeOfElementType(jsonDefn.elementType));
            if ( elementTypePrimitive !== "array" ) {
                if (jsonDefn.listChildElementKeys !== undefined &&
                    jsonDefn.listChildElementKeys !== null &&
                    jsonDefn.listChildElementKeys.length !== 0 ) {
                    jsonDefn.notUnitOfRetention = true;
                }
            }
        }
    };

    /**
     * Invert the specification in the formDef.json for properties processing
     */
    var getDataTableModelFromSpecification = function(specification) {

        // dataTableModel holds an inversion of the specification.model
        //
        // elementKey : jsonSchemaType
        //
        // with the addition of:
        //    isSessionVariable : true if this is not retained across sessions
        //    elementPath : pathToElement
        //    elementSet : 'data' or 'instanceMetadata' for metadata columns
        //    listChildElementKeys : ['key1', 'key2' ...]
        //    notUnitOfRetention: true if this declares a complex type that 
        //         does not get stored (either in session variables or in database columns)
        //
        // within the jsonSchemaType to be used to transform to/from
        // the model contents and data table representation.
        //    
        
        var dataTableModel = {};
        
        var f;
        for ( f in specification.model ) {
            dataTableModel[f] = deepCopyObject(specification.model[f]);
        }
        
        // go through the supplied protoModel.formDef model
        // and invert it into the dataTableModel
        var jsonDefn;
        for ( f in dataTableModel ) {
            jsonDefn = flattenElementPath( dataTableModel, null, f, null, dataTableModel[f] );
        }

        // traverse the dataTableModel marking which elements are 
        // not units of retention.
        markUnitOfRetention(dataTableModel);

        // the framework form has no metadata...        
        if ( specification.settings.table_id.value !== "framework" ) {
            // add in the metadata columns...
            // the only ones of these that are settable outside of the data layer are
            //    _form_id
            //    _locale
            // 
            // the values for all other metadata are managed within the data layer.
            //
            dataTableModel._id = { type: 'string', isNotNullable: true, elementKey: "_id", elementName: "_id", elementSet: 'instanceMetadata', elementPath: "_id" };
            dataTableModel._row_etag = { type: 'string', isNotNullable: false, elementKey: "_row_etag", elementName: "_row_etag", elementSet: 'instanceMetadata', elementPath: "_row_etag" };
            dataTableModel._sync_state = { type: 'string', isNotNullable: true, elementKey: "_sync_state", elementName: "_sync_state", elementSet: 'instanceMetadata', elementPath: "_sync_state" };
            dataTableModel._conflict_type = { type: 'integer', isNotNullable: false, elementKey: "_conflict_type", elementName: "_conflict_type", elementSet: 'instanceMetadata', elementPath: "_conflict_type" };
            dataTableModel._default_access = { type: 'string', isNotNullable: false, elementKey: "_default_access", elementName: "_default_access", elementSet: 'instanceMetadata', elementPath: "_default_access" };
            dataTableModel._form_id = { type: 'string', isNotNullable: false, elementKey: "_form_id", elementName: "_form_id", elementSet: 'instanceMetadata', elementPath: "_form_id" };
            dataTableModel._group_modify = { type: 'string', isNotNullable: false, elementKey: "_group_modify", elementName: "_group_modify", elementSet: 'instanceMetadata', elementPath: "_group_modify" };
            dataTableModel._group_privileged = { type: 'string', isNotNullable: false, elementKey: "_group_privileged", elementName: "_group_privileged", elementSet: 'instanceMetadata', elementPath: "_group_privileged" };
            dataTableModel._group_read_only = { type: 'string', isNotNullable: false, elementKey: "_group_read_only", elementName: "_group_read_only", elementSet: 'instanceMetadata', elementPath: "_group_read_only" };
            dataTableModel._locale = { type: 'string', isNotNullable: false, elementKey: "_locale", elementName: "_locale", elementSet: 'instanceMetadata', elementPath: "_locale" };
            dataTableModel._row_owner = { type: 'string', isNotNullable: false, elementKey: "_row_owner", elementName: "_row_owner", elementSet: 'instanceMetadata', elementPath: "_row_owner" };            
            dataTableModel._savepoint_type = { type: 'string', isNotNullable: false, elementKey: "_savepoint_type", elementName: "_savepoint_type", elementSet: 'instanceMetadata', elementPath: "_savepoint_type" };
            dataTableModel._savepoint_timestamp = { type: 'string', isNotNullable: true, elementKey: "_savepoint_timestamp", elementName: "_savepoint_timestamp", elementSet: 'instanceMetadata', elementPath: "_savepoint_timestamp" };
            dataTableModel._savepoint_creator = { type: 'string', isNotNullable: false, elementKey: "_savepoint_creator", elementName: "_savepoint_creator", elementSet: 'instanceMetadata', elementPath: "_savepoint_creator" };
        }

        return dataTableModel;
    };

    ///////////////////////////////////////////////////////////////////////////
    
    var processJSONWb = function(wbJson){
        warnings.clear();

        // Need to add this in when node is being used to run this 
        if (typeof exports !== 'undefined') {
            if(typeof require !== 'undefined') _ = require('./underscore.js');
        }
        
        _.each(wbJson, function(sheet, sheetName){
            _.each(sheet, function(row, rowIdx){
                var rowObject = groupColumnHeaders(cleanValues(row));
                var idx = rowObject.__rowNum__;
                rowObject._row_num = idx + 1; /* excel uses 1-based index */
                sheet[rowIdx] = rowObject;
            });
        });

        // we have done the standard conversions on all the sheets.

        var specification = {};

        // COLUMN_TYPES
        var processedColumnTypes = columnTypeMap;
        if("column_types" in wbJson) {
            var userDefColumnTypes = wbJson.column_types;
            if (userDefColumnTypes.length !== 1) {
                throw Error("Expected only one row in the 'column_types' sheet");
            }
            // NOTE: we allow override of default data type definitions...
            processedColumnTypes = _.extend({}, columnTypeMap, userDefColumnTypes[0]);
        }
        specification.column_types = processedColumnTypes;

        // Compute Processed intermediaries

        // SETTINGS
        var processedSettings = {};
        if ('settings' in wbJson) {
            var cleanSettingsSet = wbJson.settings;
            cleanSettingsSet = omitRowsWithMissingField(cleanSettingsSet, 'setting_name');
            processedSettings = _.groupBy(cleanSettingsSet, 'setting_name');
            _.each(processedSettings, function(value, name) {
                if(_.isArray(value)){
                    if (value.length !== 1) {
                        throw Error("Duplicate definitions of '" + name + "' on 'settings' sheet");
                    }
                    processedSettings[name] = value[0];
                } else {
                    throw Error("Unexpected non-array for '" + name + "' on 'settings' sheet");
                }
            });
        }
        if ( !('table_id' in processedSettings) ) {
            throw Error("Please define a 'table_id' setting_name on the settings sheet and specify the unique table id");
        }
        // and form_id is just the table_id if it is missing
        if ( !('form_id' in processedSettings) ) {
            var entry = _.extend({},processedSettings.table_id);
            entry.setting_name = "form_id";
            processedSettings.form_id = entry;
        }

        // restrict the table_id and form_id to be no more than 50 characters long.
        // This allows for versioning on the server and for auxillary shadow status tables.
        
        if ( processedSettings.form_id.value.length > 50 ) {
            throw Error("The value of the 'form_id' setting_name on the settings sheet cannot be more than 50 characters long");
        }

        if ( processedSettings.table_id.value.length > 50 ) {
            throw Error("The value of the 'table_id' setting_name on the settings sheet cannot be more than 50 characters long");
        }

        assertValidUserDefinedName("The value of the 'form_id' setting_name on the settings sheet",
                                    processedSettings.form_id.value);

        assertValidUserDefinedName("The value of the 'table_id' setting_name on the settings sheet",
                                    processedSettings.table_id.value);
        
        if ( !('survey' in processedSettings) ) {
            throw Error("Please define a 'survey' setting_name on the settings sheet and specify the survey title under display.title");
        }
        if ( !('display' in processedSettings.survey) ) {
            throw Error("Please specify the survey title under the display.title column for the 'survey' setting_name on the settings sheet");
        }
        if ( _.isEmpty(processedSettings.survey.display) ||
                ((processedSettings.survey.display.title === null || processedSettings.survey.display.title === undefined) && 
				 (processedSettings.survey.display.text !== null && processedSettings.survey.display.text !== undefined)) ) {
            throw Error("Please specify the survey title under the display.title column for the 'survey' setting_name on the settings sheet");
        }

        // construct the list of all available form locales and the default locale.
        // Relies upon the title translations of the 'survey' sheet.
        // If
        //   settings.survey.display.title.text = { 'en' : 'Joy of life', 'fr' : 'Joi de vivre'}
        // and if
        //   settings.en.display.locale.text = {'en' : 'English', 'fr' : 'Anglais'}
        //   settings.fr.display.locale.text = {'en' : 'French', 'fr', 'Francais' }
        // then we compose
        //
        //   settings._locales = [ { name: 'en', locale: { text: { 'en' : 'English' , 'fr': 'Anglais' }}},
        //                         { name: 'fr', locale: { text: { 'en' : 'French', 'fr': 'Francais' }}} ]
        //
        // If the localizations for the language tags are missing (e.g., no settings.en, settings.fr)
        // then we just use the tag as the display string for that translation:
        //
        //   settings._locales = [ { name: 'en', locale: { text: 'en'} },
        //                         { name: 'fr', locale: { text: 'fr'} } ]
        //
        // The default locale is the first locale in the settings sheet.
        // i.e., if you have two languages, settings.en and settings.fr,
        // if (settings.en._row_num < settings.fr._row_num) then
        // en is the default locale.
        // If the languages are not defined in the settings sheet but
        // are simply referenced in the survey title, then the default
        // is the first in javascript attribute-iteration order.
        //

        {
            var locales = [];
            var defaultLocale = null;

            // assume all the locales are specified by the title text...
			var form_title_text;
			try {
				form_title_text = processedSettings.survey.display.title.text;
			} catch (e) {
			}
            if ( _.isUndefined(form_title_text) || _.isString(form_title_text) ) {
                // no internationalization -- just default choice
                locales.push({  display: {
									locale: {text: 'default'}
								},
								name: 'default'});
                defaultLocale = 'default';
            } else {
                // we have localization -- find all the tags
                var firstTranslation = null;
				var hasDefaultMapping = false;

                for ( var f in form_title_text ) {
					if ( f === "default" ) {
						hasDefaultMapping = true;
					}
                    // If the tag value is defined in the settings page, use its
                    // display value as the display string for the language.
                    // Otherwise, use the tag itself as the name for that language.
                    var translations = processedSettings[f];
                    if ( translations === null ||  translations === undefined || 
						 translations.display === null || translations.display === undefined ) {
                        locales.push( { display: {
											locale: {text: f}
										},
                                        name: f } );
                        if ( defaultLocale === null || defaultLocale === undefined ) {
                            defaultLocale = f;
                        }
                    } else {
                        locales.push( { display: translations.display,
                                        _row_num: translations._row_num,
                                        name: f } );
                        if ( firstTranslation === null || firstTranslation === undefined ||
                             firstTranslation > translations._row_num) {
                            defaultLocale = f;
                            firstTranslation = translations._row_num;
                        }
                    }
                }
				
				if ( !hasDefaultMapping ) {
					// use the defaultLocale label as the default mapping for the title.
					form_title_text["default"] = form_title_text[defaultLocale];
					// this ensures that a default value is available for the title.
				}

                // Order by _row_num, if not null...
                // If some are defined and some are not,
                // place the defined ones first.
                locales = locales.sort( function(a,b) {
                    if ( '_row_num' in b ) {
                        if ( '_row_num' in a ) {
                            return a._row_num - b._row_num;
                        } else {
                            return 1;
                        }
                    } else if ( '_row_num' in a ) {
                        return -1;
                    } else if ( a.name > b.name ) {
                        return 1;
                    } else if ( a.name == b.name ) {
                        return 0;
                    } else {
                        return -1;
                    }
                });
            }
			
			// ensure that all the locales have a default translation
			// which will be a copy of the defaultLocale label if one is missing.
			for ( var i = 0 ; i < locales.length ; ++i ) {
				var localeField = locales[i].display.locale;
				if ( !(_.isString(localeField)) ) {
					var textField = localeField.text;
					if ( !(_.isString(textField)) ) {
						if ( !('default' in textField) ) {
							textField["default"] = textField[defaultLocale];
						}
					}
				}
			}

            var localeEntry = { setting_name: "_locales",
                          _row_num: processedSettings.survey._row_num,
                          value: locales };
            processedSettings._locales = localeEntry;

            var defaultLocaleEntry = { setting_name: "_default_locale",
                          _row_num: processedSettings.survey._row_num,
                          value: defaultLocale };
            processedSettings._default_locale = defaultLocaleEntry;
        }

        if ( !('initial' in processedSettings) ) {
            processedSettings.initial = processedSettings.survey;
        }

        specification.settings = processedSettings;

        // CHOICES
        var processedChoices = {};
        if ('choices' in wbJson) {
            var cleanChoicesSet = wbJson.choices;
            cleanChoicesSet = omitRowsWithMissingField(cleanChoicesSet, 'choice_list_name');
            errorIfFieldMissing('choices',cleanChoicesSet,'data_value', true);
            errorIfFieldMissing('choices',cleanChoicesSet, 'display', true);
            processedChoices = _.groupBy(cleanChoicesSet, 'choice_list_name');
        }
        specification.choices = processedChoices;

        // TRANSLATIONS --
        // three different possible sheets:
		//    framework_translations -- only applicable in "framework"
		//    common_translations -- only applicable in "framework"
		//    table_specific_translations -- only applicable in tableId = formId forms
		if ( 'translations' in wbJson ) {
			throw Error("The sheet name 'translations' is reserved and cannot be used.");
		}
		
		if ( specification.settings.table_id.value === 'framework' ) {
			if ( 'table_specific_translations' in wbJson ) {
				throw Error("The sheet name 'table_specific_translations' is not allowed in the framework form.");
			}
			// framework_translations
			{
				var processedFmkTranslations = {};
				if ('framework_translations' in wbJson) {
					var cleanFmkTranslationsSet = wbJson.framework_translations;
					cleanFmkTranslationsSet = omitRowsWithMissingField(cleanFmkTranslationsSet, 'string_token');
					processedFmkTranslations = _.groupBy(cleanFmkTranslationsSet, 'string_token');
					_.each(processedFmkTranslations, function(value, name) {
						if(_.isArray(value)){
							if (value.length !== 1) {
								throw Error("Duplicate definitions of '" + name + "' on 'framework_translations' sheet");
							}
							processedFmkTranslations[name] = value[0];
						} else {
							throw Error("Unexpected non-array for '" + name + "' on 'framework_translations' sheet");
						}
					});
				}
				specification.framework_definitions = {};
				specification.framework_definitions._tokens = processedFmkTranslations;
			}
			{
				var processedCmnTranslations = {};
				if ('common_translations' in wbJson) {
					var cleanCmnTranslationsSet = wbJson.common_translations;
					cleanCmnTranslationsSet = omitRowsWithMissingField(cleanCmnTranslationsSet, 'string_token');
					processedCmnTranslations = _.groupBy(cleanCmnTranslationsSet, 'string_token');
					_.each(processedCmnTranslations, function(value, name) {
						if(_.isArray(value)){
							if (value.length !== 1) {
								throw Error("Duplicate definitions of '" + name + "' on 'common_translations' sheet");
							}
							processedCmnTranslations[name] = value[0];
						} else {
							throw Error("Unexpected non-array for '" + name + "' on 'common_translations' sheet");
						}
					});
				}
				specification.common_definitions = {};
				specification.common_definitions._tokens = processedCmnTranslations;
				specification.common_definitions._locales = specification.settings._locales;
				specification.common_definitions._default_locale = specification.settings._default_locale;
			}
		} else if ( specification.settings.form_id.value !== specification.settings.table_id.value ) {
			if ( 'framework_translations' in wbJson ) {
				throw Error("The sheet name 'framework_translations' is only allowed in the framework form.");
			}
			if ( 'common_translations' in wbJson ) {
				throw Error("The sheet name 'common_translations' is only allowed in the framework form.");
			}
			if ( 'table_specific_translations' in wbJson ) {
				throw Error("The sheet name 'table_specific_translations' is only allowed when form_id === table_id.");
			}
		} else {
			if ( 'framework_translations' in wbJson ) {
				throw Error("The sheet name 'framework_translations' is only allowed in the framework form.");
			}
			if ( 'common_translations' in wbJson ) {
				throw Error("The sheet name 'common_translations' is only allowed in the framework form.");
			}
			var processedTSTranslations = {};
			if ('table_specific_translations' in wbJson) {
				var cleanTSTranslationsSet = wbJson.table_specific_translations;
				cleanTSTranslationsSet = omitRowsWithMissingField(cleanTSTranslationsSet, 'string_token');
				processedTSTranslations = _.groupBy(cleanTSTranslationsSet, 'string_token');
				_.each(processedTSTranslations, function(value, name) {
					if(_.isArray(value)){
						if (value.length !== 1) {
							throw Error("Duplicate definitions of '" + name + "' on 'table_specific_translations' sheet");
						}
						processedTSTranslations[name] = value[0];
					} else {
						throw Error("Unexpected non-array for '" + name + "' on 'table_specific_translations' sheet");
					}
				});
			}
			specification.table_specific_definitions = {};
			specification.table_specific_definitions._tokens = processedTSTranslations;
		}

        // QUERIES
        var processedQueries = {};
        if ('queries' in wbJson) {
            var cleanQueriesSet = wbJson.queries;
            cleanQueriesSet = omitRowsWithMissingField(cleanQueriesSet, 'query_name');
            errorIfFieldMissing('queries',cleanQueriesSet,'query_type', true);
            errorIfFieldsMissingForQueryType('queries',cleanQueriesSet,'csv', 'uri');
            errorIfFieldsMissingForQueryType('queries',cleanQueriesSet,'csv', 'callback');
            errorIfFieldsMissingForQueryType('queries',cleanQueriesSet,'ajax', 'uri');
            errorIfFieldsMissingForQueryType('queries',cleanQueriesSet,'ajax', 'callback');
            errorIfFieldsMissingForQueryType('queries',cleanQueriesSet,'linked_table', 'linked_form_id');
            errorIfFieldsMissingForQueryType('queries',cleanQueriesSet,'linked_table', 'selection');
            errorIfFieldsMissingForQueryType('queries',cleanQueriesSet,'linked_table', 'selectionArgs');
            errorIfFieldsMissingForQueryType('queries',cleanQueriesSet,'linked_table', 'newRowInitialElementKeyToValueMap');
            errorIfFieldsMissingForQueryType('queries',cleanQueriesSet,'linked_table', 'openRowInitialElementKeyToValueMap');
            processedQueries = _.groupBy(cleanQueriesSet, 'query_name');
            _.each(processedQueries, function(value, name) {
                if(_.isArray(value)){
                    if (value.length !== 1) {
                        throw Error("Duplicate definitions of '" + name + "' on 'queries' sheet");
                    }
                    processedQueries[name] = value[0];
                } else {
                    throw Error("Unexpected non-array for '" + name + "' on 'queries' sheet");
                }
            });
        }
        specification.queries = processedQueries;

        // verify that queries and choices don't share the same names
        for (var key in processedQueries ) {
            if ( key in processedChoices ) {
                throw Error("Reuse of the name '" + key + "'. The 'choice_list_name' on 'choices' sheet and 'query_name' on 'queries' sheet cannot be identical.");
            }
        }

        // CALCULATES
        var processedCalculates = {};
        if ('calculates' in wbJson) {
            var cleanCalculatesSet = wbJson.calculates;
            cleanCalculatesSet = omitRowsWithMissingField(cleanCalculatesSet, 'calculation_name');
            errorIfFieldMissing('calculates',cleanCalculatesSet,'calculation', true);
            processedCalculates = _.groupBy(cleanCalculatesSet, 'calculation_name');
            _.each(processedCalculates, function(value, name) {
                if(_.isArray(value)){
                    if (value.length !== 1) {
                        throw Error("Duplicate definitions of '" + name + "' on 'calculates' sheet");
                    }
                    processedCalculates[name] = value[0];
                } else {
                    throw Error("Unexpected non-array for '" + name + "' on 'calculates' sheet");
                }
            });
        }
        specification.calculates = processedCalculates;

        // PROMPT_TYPES
        // NOTE: does NOT have any column_type processing
        var processedPromptTypes = promptTypeMap;
        if("prompt_types" in wbJson) {
            var cleanPromptTypesSet = wbJson.prompt_types;
            cleanPromptTypesSet = omitRowsWithMissingField(cleanPromptTypesSet, 'prompt_type_name');
            errorIfFieldMissing('prompt_types',cleanPromptTypesSet,'type', true);
            var userDefPrompts = {};
            userDefPrompts = _.groupBy(cleanPromptTypesSet, "prompt_type_name");
            _.each(userDefPrompts, function(value, key){
                if(_.isArray(value)){
                    if (value.length !== 1) {
                        throw Error("Duplicate definitions of '" + key + "' on 'prompt_types' sheet");
                    }
                    var schema = value[0];
                    if ( schema.type === "null" ) {
                        // to enable 'note' prompt types that don't have any backing data value
                        userDefPrompts[key] = null;
                    } else {
                        userDefPrompts[key] = schema; // TODO: ???
                    }
                }
            });
            // NOTE: we allow override of default data type definitions...
            processedPromptTypes = _.extend({}, promptTypeMap, userDefPrompts);
        }

        // MODEL
        // NOTE: does NOT have any column_type processing
        var processedModel = {};
        if("model" in wbJson){
            var cleanModelSet = wbJson.model;
            cleanModelSet = omitRowsWithMissingField(cleanModelSet, 'name');
            errorIfFieldMissing('model',cleanModelSet,'type', true);
            processedModel = _.groupBy(cleanModelSet, "name");
            _.each(processedModel, function(value, key){
                if(_.isArray(value)){
                    if (value.length !== 1) {
                        throw Error("Duplicate definitions of '" + key + "' on 'model' sheet");
                    }
                    processedModel[key] = _.extend({_defn: [{ _row_num : value[0]._row_num, section_name: 'model' }] }, value[0] );
                    removeIgnorableModelFields(processedModel[key]);
                }
            });
        }
        specification.model = processedModel;

        // Find the sheets that are survey sheets
        // (not one of the reserved names and not beginning with '-')
        var sections = {};
        var sectionNames = [];
        _.each(wbJson, function(sheet, sheetName){
            if ( sheetName.indexOf('.') !== -1 ) {
                throw Error("Dots are not allowed in sheet names.");
            }
            if ( sheetName.indexOf('_') === 0 ) {
                throw Error("Sheet names cannot begin with '_'.");
            }
            if ( sheetName.indexOf('-') !== 0 && ! _.contains(reservedSheetNames, sheetName) ) {
                sections[sheetName] = sheet;
                sectionNames.push(sheetName);
            }
        });
        if ( !("initial" in sections) ) {
            sections.initial = default_initial;
            sectionNames.push("initial");
        }

        sectionNames.sort();

        if(!('survey' in sections)){
            throw Error("Missing survey sheet");
        }

        // if a section of the survey does not have a settings entry, add it.
        // and if its settings entry does not have a display entry, use the
        // values in the 'survey' settings.

        _.each(sectionNames, function(name) {
            if (! (name in specification.settings) ) {
                specification.settings[name] = {};
            }
            if (! ('display' in specification.settings[name]) ) {
                specification.settings[name].display = specification.settings.survey.display;
            }
        });

        _.each(specification.settings, function(value, name) {
            sanityCheckFieldTypes(value, 'settings', specification.column_types);
        });
        _.each(specification.choices, function(value, name) {
            sanityCheckFieldTypes(value, 'choices', specification.column_types);
        });
        _.each(specification.queries, function(value, name) {
            sanityCheckFieldTypes(value, 'queries', specification.column_types);
        });
        _.each(specification.calculates, function(value, name) {
            sanityCheckFieldTypes(value, 'calculates', specification.column_types);
        });
        _.each(specification.queries, function(value, name) {
            sanityCheckFieldTypes(value, 'queries', specification.column_types);
        });

        // construct the json sheet for the interpreter
        var parsedSections = parseSections(sectionNames, sections, specification.settings, specification.column_types);

        specification.section_names = sectionNames; // in alphabetical order

        specification.sections = parsedSections;

        // flesh out model based upon prompts and assign statements
        developDataModel(specification, processedPromptTypes);

        // ensure that all values_list names have a backing choices or queries definition
        _.each(specification.sections, function(section){
            _.each(section.prompts, function(prompt){
                if ("values_list" in prompt) {
                    var name = prompt.values_list;
                    if ( !((name in specification.choices) || (name in specification.queries)) ) {
                        throw Error("Unrecognized 'values_list' name: '" + name + "'. Prompt: '" + prompt.type + "' at row " +
                                prompt._row_num + " on sheet: " + section.section_name);
                    }
                }
            });
        });

        // TODO: deal with column_types
        // column types are applied to ALL sheets.
        // specification.column_types

        // DATA TABLE MODEL

        // flatten the data model (removing the nested structures)
        // This yields the raw content of the columnDefinitions table 
        // plus all the session variables that are in use.
        specification.dataTableModel = getDataTableModelFromSpecification(specification);

        // PROPERTIES
        if ( specification.settings.form_id.value !== specification.settings.table_id.value ) {
            if ('properties' in wbJson) {
                throw Error("The 'properties' sheet is only allowed in the worksheet of the '" + specification.settings.table_id.value + "' form_id.");
            }
        } else {
            // process the properties sheet if we have it...
            var processedProperties = [];
            var foundTableDefaultViewType = false;
            var foundTableFormTypeSpec = false;
            var foundTableFormTypeSurveySpec = false;
            
            if ('properties' in wbJson) {
                var cleanPropertiesSet = wbJson.properties;
                cleanPropertiesSet = omitRowsWithMissingField(cleanPropertiesSet, 'partition');
                cleanPropertiesSet = omitRowsWithMissingField(cleanPropertiesSet, 'aspect');
                cleanPropertiesSet = omitRowsWithMissingField(cleanPropertiesSet, 'key');
                cleanPropertiesSet = omitRowsWithMissingField(cleanPropertiesSet, 'type');
                cleanPropertiesSet = omitRowsWithMissingField(cleanPropertiesSet, 'value');
                _.each(cleanPropertiesSet, function(row) {
                    if ( !_.isString(row.partition) ) {
                        throw Error("The 'partition' column on the 'properties' sheet must be a string. Error at row: " + row._row_num);
                    }
                    if ( !_.isString(row.aspect) ) {
                        throw Error("The 'aspect' column on the 'properties' sheet must be a string. Error at row: " + row._row_num);
                    }
                    if ( !_.isString(row.key) ) {
                        throw Error("The 'key' column on the 'properties' sheet must be a string. Error at row: " + row._row_num);
                    }
                    if ( !_.isString(row.type) ) {
                        throw Error("The 'type' column on the 'properties' sheet must be a string. Error at row: " + row._row_num);
                    }
                    if ( !_.isString(row.value) ) {
                        throw Error("The 'value' column on the 'properties' sheet must be a string. Error at row: " + row._row_num);
                    }
                    if ( row.partition === "Column" && row.key === "displayName" ) {
                        throw Error("Column property 'displayName' cannot be specified on the 'properties' sheet. This is auto-generated from the model. Error at row: " + row._row_num);
                    }
                    if ( row.partition === "Column" && row.key === "displayFormat" ) {
                        throw Error("Column property 'displayFormat' cannot be specified on the 'properties' sheet. This is auto-generated from the model. Error at row: " + row._row_num);
                    }
                    if ( row.partition === "Column" && row.key === "displayChoicesList" ) {
                        throw Error("Column property 'displayChoicesList' cannot be specified on the 'properties' sheet. This is auto-generated from the model. Error at row: " + row._row_num);
                    }
                    
                    if ( row.partition === "Table" && row.aspect === "default" && row.key === "displayName" ) {
                        throw Error("Table property 'displayName' cannot be specified on the 'properties' sheet. This is auto-generated from the settings. Error at row: " + row._row_num);
                    }
                    
                    if ( row.partition === "Table" && row.aspect === "default" && row.key === "defaultViewType" ) {
                        foundTableDefaultViewType = true;
                    }
                            
                    if ( row.partition === "FormType" && row.aspect === "default" && row.key === "FormType.formType" ) {
                        foundTableFormTypeSpec = true;
                    }
                    
                    if ( row.partition === "SurveyUtil" && row.aspect === "default" && row.key === "SurveyUtil.formId" ) {
                        foundTableFormTypeSurveySpec = true;
                    }

                    processedProperties.push({
                        _partition: row.partition,
                        _aspect: row.aspect,
                        _key: row.key,
                        _type: row.type,
                        _value: row.value
                    });

                });
            }

            // and now traverse the specification.dataTableModel making sure all the
            // elementSet: 'data' values have columnDefinitions entries drawn
            // from the model
            for ( var dbColumnName in specification.dataTableModel ) {
                // the XLSXconverter already handles expanding complex types
                // such as geopoint into their underlying storage representation.
                var jsonDefn = specification.dataTableModel[dbColumnName];
                
                if ( jsonDefn.elementSet === 'data' && !jsonDefn.isSessionVariable ) {
                    // var surveyElementName = jsonDefn.elementName;
                    
                    if (jsonDefn.displayName !== undefined && jsonDefn.displayName !== null) {
                        processedProperties.push( {
                            _partition: "Column",
                            _aspect: dbColumnName,
                            _key: "displayName",
                            _type: "object",
                            _value: JSON.stringify(jsonDefn.displayName) // this is potentially an object...
                        });
                    }

                    if ( jsonDefn.valuesList !== undefined && jsonDefn.valuesList !== null ) {
                        var ref = specification.choices[jsonDefn.valuesList];
                        if ( ref !== undefined && ref !== null ) {
                            processedProperties.push( {
                                _partition: "Column",
                                _aspect: dbColumnName,
                                _key: "displayChoicesList",
                                _type: "object",
                                _value: JSON.stringify(ref)
                            });
                        }
                    }

                    if (jsonDefn.displayFormat !== undefined && jsonDefn.displayFormat !== null) {
                        processedProperties.push( {
                            _partition: "Column",
                            _aspect: dbColumnName,
                            _key: "displayFormat",
                            _type: "string",
                            _value: jsonDefn.displayFormat
                        });
                    }
                }
            }

            if ( !(foundTableFormTypeSpec || foundTableFormTypeSurveySpec) ) {
                var formId = specification.settings.form_id.value;
                // set this form as the default form to open when editting or adding a row...
                processedProperties.push( {_partition: "FormType", _aspect: "default", _key: 'FormType.formType', _type: 'string', _value: 'SURVEY'});
                processedProperties.push( {_partition: "SurveyUtil", _aspect: "default", _key: 'SurveyUtil.formId', _type: 'string', _value: formId } );
            }
            
            if ( !foundTableDefaultViewType ) {
                // set the spreadsheet view as the default view...
                processedProperties.push( {_partition: "Table", _aspect: "default", _key: "defaultViewType", _type: "string", _value: "SPREADSHEET" } );
            }

            var formTitle = specification.settings.survey.display.title;
            processedProperties.push( {_partition: "Table", _aspect: "default", _key: "displayName", _type: "object", 
                              _value: JSON.stringify(formTitle)} );

            // Now sort the _key_value_store_active
            processedProperties = _.chain(processedProperties)
            .sortBy(function(o) {
                return o._key;
            }).sortBy(function(p) {
                return p._aspect;
            }).sortBy(function(q) {
                return q._partition;
            }).value();

            // These are all the properties that will be written into the properties.csv file.
            
            // TODO: remove these from this file.
            specification.properties = processedProperties;
        }

        /*
         * // INCOMING:
         * specification = {
         *
         *    settings: { setting_name : ... }
         *    choices: { choice_list_name : ... }
         *    queries: { query_name : ... }
         *    calculates: { calculation_name : ... }
         *
         *    section_names : [ alphabetical list of sections ]
         *
         *    sections : { sectionName : {
         *                        section_name: sheetName,
         *                        nested_sections: { sectionNameA : true, ... },
         *                        reachable_sections: { sectionNameA : true, ... },
         *                        prompts: [ { extend promptDefinition with _branch_label_enclosing_screen }, ... ],
         *                        validation_tag_map: { tagA : [ promptidx1, promptidx2, ... ], tagB : [...], ... },
         *                        operations: [ opA, opB, ... ],
         *                        branch_label_map: { branchLabelA: opidx1, branchLabelB: opidx2, ... }
         *                    },
         *                    ... }
         *
         *  // TODO: flesh out
         *    model: model tab pivoted by name, merged with prompts data info. (partial)
         *
         *  };
         */

        return { xlsx: wbJson, specification: specification };
    };

    root.XLSXConverter = {
        processJSONWorkbook : processJSONWb,
        //Returns the warnings from the last workbook processed.
        getWarnings: function(){
            return warnings.toArray();
        }
    };

if (typeof exports !== 'undefined') {
    exports.processJSONWb = processJSONWb;
}
XLSXConverter.processJSONWb = processJSONWb;
})(typeof exports !== 'undefined' ? exports : XLSXConverter);


