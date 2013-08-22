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
(function(){

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

    var _ = root._;

    var reservedSheetNames = [
          "settings",
          "choices",
          "queries",
          "calculates",
          "prompt_types",
          "model"
      ];

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

    //The prompt type map is not kept in a separate JSON file because
    //origin policies might prevent it from being fetched when this script
    //is used from the local file system.
    var promptTypeMap = {
        "text" : {"type":"string"},
        "string" : {"type":"string"},
        "integer" : {"type":"integer"},
        "decimal" : {"type":"number"},
        "acknowledge" : {"type":"boolean"},
        "select_one" : {"type":"string"},
        "select_multiple": {
            "type": "array",
            "isPersisted": true,
            "items" : {
                "type":"string"
            }
        },
        "select_one_with_other" : {"type":"string"},
        "geopoint" : {
            "name": "geopoint",
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
        "with_next": {"type":"string"},
        "goto": null,
        "label": null,
        "screen": null,
        "note": null,
        "linked_table": null,
        "user_branch": null,
        "error" : null,
        "opening": null,
        "instances": null,
        "finalize": null,
        "hierarchy": null,
        "repeat_subform": null,
        "image": {
            "type": "object",
            "elementType": "mimeUri",
            "isPersisted": true,
            "properties": {
                "uri": {
                    "type": "string"
                },
                "contentType": {
                    "type": "string",
                    "default": "image/*"
                }
            }
        },
        "audio": {
            "type": "object",
            "elementType": "mimeUri",
            "isPersisted": true,
            "properties": {
                "uri": {
                    "type": "string"
                },
                "contentType": {
                    "type": "string",
                    "default": "audio/*"
                }
            }
        },
        "video": {
            "type": "object",
            "elementType": "mimeUri",
            "isPersisted": true,
            "properties": {
                "uri": {
                    "type": "string"
                },
                "contentType": {
                    "type": "string",
                    "default": "video/*"
                }
            }
        },
        "date": {
            "type": "object",
            "elementType": "date"
        },
        "time": {
            "type": "object",
            "elementType": "time"
        },
        "datetime": {
            "type": "object",
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
    		arr.push( (idxs.length != 0) ? [] : null);
    	}
    	if ( idxs.length == 0 ) {
    		if ( arr[idx] == null ) {
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
                    	if ( i != -1 ) {
                    		if ( prop.lastIndexOf("]") != prop.length-1 ) {
                    			throw Error("Invalid array subscript in column heading: " + prop);
                    		};
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
                        	if ( obj[nm] == null ) {
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
    		if ( nonEmpty && (value == null || value == [] || value == {}) ) {
    			throw Error("Cell value is unexpectedly empty on sheet: " + sheetName +
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
    	 *    back_in_history
    	 *    do_section (_do_section_name)
    	 *    exit_section
    	 *    validate (_sweep_name)
    	 *
    	 *    statements.
    	 */
    	var flow = [];
    	_.each(sheet, function(row) {
    		if ( "branch_label" in row ) {
    			var labelEntry = { _token_type: "branch_label", branch_label: row.branch_label, _row_num: row._row_num };
    			flow.push(labelEntry);
    		}

    		if ( "clause" in row ) {
    			var clauseEntry = _.extend({}, row);
    			delete clauseEntry.branch_label;
        		if ("type" in row) {
        			throw Error("Exactly one of 'clause' and 'type' may be defined on any given row. Error on sheet: " +
        					sheetName + " on row: " + row._row_num);
        		}
    			clauseEntry._token_type = "clause";
    			/*
    			 * parse the clause, set _token_type and begin/end matching annotations
    			 */
    			var raw_clause_type = row.clause;
    			raw_clause_type = raw_clause_type.replace(/\/\//g,' // ');// surround with spaces
    			raw_clause_type = raw_clause_type.replace(/\s+/g,' ');// remove extra spaces
    			raw_clause_type = raw_clause_type.trim();// remove BOL/EOL spaces
    			var parts = raw_clause_type.split(' ');

    			var first = parts[0];
    			switch (first ) {
    			case "begin":
    				if ( parts.length < 2 || parts[1] != "screen" || parts.length > 4 ||
    						(parts.length == 4 && parts[2] != "//") ) {
    					throw Error("Expected 'begin screen [ // <tagname> ]' but found: " + row.clause +
        						" on sheet: " + sheetName + " on row: " + row._row_num);
    				}
            		if ("condition" in row) {
            			throw Error("'condition' expressions are not allowed on 'begin screen' clauses. Error on sheet: " +
            					sheetName + " on row: " + row._row_num);
            		}
    				clauseEntry._token_type = "begin_screen";
    				if ( parts.length == 4 ) {
    					clauseEntry._tag_name = parts[3];
    				}
    				break;
    			case "end":
    				if ( parts.length < 2 || (parts[1] != "screen" && parts[1] != "if") ) {
    					throw Error("Expected 'end if' or 'end screen' but found: " + row.clause +
        						" on sheet: " + sheetName + " on row: " + row._row_num);
    				}
    				if ( parts.length > 4 || (parts.length == 4 && parts[2] != "//") ) {
    					throw Error("Expected 'end " + parts[1] + " [ // <tagname> ]' but found: " + row.clause +
        						" on sheet: " + sheetName + " on row: " + row._row_num);
    				}
            		if ("condition" in row) {
            			throw Error("'condition' expressions are not allowed on 'end " + parts[1] +"' clauses. Error on sheet: " +
            					sheetName + " on row: " + row._row_num);
            		}
    				clauseEntry._token_type = "end_" + parts[1];
    				if ( parts.length == 4 ) {
    					clauseEntry._tag_name = parts[3];
    				}
    				break;
    			case "if":
    				if ( parts.length > 3 || (parts.length >= 2 && parts[1] != "//") ) {
    					throw Error("Expected 'if [ // <tagname> ]' but found: " + row.clause +
        						" on sheet: " + sheetName + " on row: " + row._row_num);
    				}
            		if (!("condition" in row)) {
            			throw Error("'condition' expression is required on 'if' clauses. Error on sheet: " +
            					sheetName + " on row: " + row._row_num);
            		}
    				clauseEntry._token_type = "begin_if";
    				if ( parts.length == 3 ) {
    					clauseEntry._tag_name = parts[2];
    				}
    				break;
    			case "else":
    				if ( parts.length > 3 || (parts.length >= 2 && parts[1] != "//") ) {
    					throw Error("Expected 'else [ // <tagname> ]' but found: " + row.clause +
        						" on sheet: " + sheetName + " on row: " + row._row_num);
    				}
            		if ("condition" in row) {
            			throw Error("'condition' expressions are not allowed on 'else' clauses. Error on sheet: " +
            					sheetName + " on row: " + row._row_num);
            		}
    				clauseEntry._token_type = "else";
    				if ( parts.length == 3 ) {
    					clauseEntry._tag_name = parts[2];
    				}
    				break;
    			case "goto":
    				if ( parts.length != 2 ) {
    					throw Error("Expected 'goto <branchlabel>' but found: " + row.clause +
        						" on sheet: " + sheetName + " on row: " + row._row_num);
    				}
    				clauseEntry._token_type = "goto_label";
    				clauseEntry._branch_label = parts[1];
    				break;
    			case "back":
    				if ( parts.length != 1 ) {
    					throw Error("Expected 'back' but found: " + row.clause +
        						" on sheet: " + sheetName + " on row: " + row._row_num);
    				}
            		if ("condition" in row) {
            			throw Error("'condition' expressions are not allowed on 'back' clauses. Error on sheet: " +
            					sheetName + " on row: " + row._row_num);
            		}
    				clauseEntry._token_type = "back_in_history";
    				break;
    			case "do":
    				if ( parts.length != 3 || parts[1] != "section" ) {
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
    				if ( parts.length != 2 || parts[1] != "section" ) {
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
    				if ( parts.length == 2 ) {
        				clauseEntry._sweep_name = parts[1];
    				} else {
        				clauseEntry._sweep_name = "finalize";
    				}
    				break;
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
    			var parts = raw_prompt_type.split(' ');
    			var first = parts[0];
    			if ( first == "assign" ) {
    				typeEntry._token_type = "assign";
    				if ( parts.length >= 2 ) {
    					/* explicit type is specified */
    					typeEntry._data_type = parts[1];
    				}
    				if (!("name" in row)) {
            			throw Error("'assign' expressions must specify a field 'name' Error on sheet: " +
            					sheetName + " on row: " + row._row_num);
    				}
    				if (!("value" in row)) {
            			throw Error("'assign' expressions must specify a 'value' expression. Error on sheet: " +
            					sheetName + " on row: " + row._row_num);
    				}
    			} else {
           			typeEntry._token_type = "prompt";
           			/*
           			 *  Change: prompt type is only one string, which must match a prompt_type name.
           			 *  Extra parameters are not allowed. Makes parsing and extension easier.
           			 */
//           			if ( parts.length >= 2 ) {
//           				typeEntry._param = parts[1];
//           			}
//           			typeEntry._type = parts[0];
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
    		case "back_in_history":
    		case "do_section":
    		case "exit_section":
    		case "validate":
    		case "begin_screen":
    		case "end_screen":
    			throw Error("Disallowed clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
    					sheetName + " within '" + flow[idx].clause + "' beginning at row " + flow[idx]._row_num);
    			break;
    		case "begin_if":
    			var psi = parseScreenIfBlock(sheetName, flow, i);
    			blockFlow.push(psi.clause);
    			i = psi.idx;
    			break;
    		case "else":
    	    	var end_tag = flow[i]._tag_name;
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
    	    	var end_tag = flow[i]._tag_name;
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
    	if ( tag != null ) {
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
    		case "back_in_history":
    		case "do_section":
    		case "exit_section":
    		case "validate":
    		case "begin_screen":
    			throw Error("Disallowed clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
    					sheetName + " within '" + flow[idx].clause + "' beginning at row " + flow[idx]._row_num);
    			break;
    		case "else":
    			throw Error("'else' without preceding 'if' clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
    					sheetName + " within '" + flow[idx].clause + "' beginning at row " + flow[idx]._row_num);
    			break;
    		case "end_if":
    			throw Error("'end if' without preceding 'if' clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
    					sheetName + " within '" + flow[idx].clause + "' beginning at row " + flow[idx]._row_num);
    			break;
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
    	if ( tag != null ) {
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
    	var thenFlow = true;
    	var blockFlow = [];
    	while (i < flow.length) {
    		var clause = flow[i];
    		switch (clause._token_type) {
    		case "branch_label":
    		case "assign":
    		case "prompt":
    		case "goto_label":
    		case "back_in_history":
    		case "do_section":
    		case "exit_section":
    		case "validate":
    			blockFlow.push(clause);
    			++i;
    			break;
    		case "begin_screen":
    			var psi = parseScreenBlock(sheetName, flow, i);
    			blockFlow.push(psi.clause);
    			i = psi.idx;
    			break;
    		case "end_screen":
    			throw Error("'end screen' without preceding 'begin screen' clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
    					sheetName + " within '" + flow[idx].clause + "' beginning at row " + flow[idx]._row_num);
    			break;
    		case "begin_if":
    			var psi = parseTopLevelIfBlock(sheetName, flow, i);
    			blockFlow.push(psi.clause);
    			i = psi.idx;
    			break;
    		case "else":
    	    	var end_tag = flow[i]._tag_name;
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
    	    	var end_tag = flow[i]._tag_name;
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
    	if ( tag != null ) {
    		throw Error("No matching 'end if // " + tag + "' on sheet: " +
    				sheetName + " for '" + flow[idx].clause + "' at row " + flow[idx]._row_num);
    	} else {
    		throw Error("No matching 'end if' on sheet: " +
    				sheetName + " for '" + flow[idx].clause + "' at row " + flow[idx]._row_num);
    	}
    };


    var parseTopLevelBlock = function(sheetName, flow ) {
    	var i = 0;
    	var blockFlow = [];
    	while (i < flow.length) {
    		var clause = flow[i];
    		switch (clause._token_type) {
    		case "branch_label":
    		case "assign":
    		case "prompt":
    		case "goto_label":
    		case "back_in_history":
    		case "do_section":
    		case "exit_section":
    		case "validate":
    			blockFlow.push(clause);
    			++i;
    			break;
    		case "begin_screen":
    			var psi = parseScreenBlock(sheetName, flow, i);
    			blockFlow.push(psi.clause);
    			i = psi.idx;
    			break;
    		case "end_screen":
    			throw Error("'end screen' without preceding 'begin screen' clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
    					sheetName);
    			break;
    		case "begin_if":
    			var psi = parseTopLevelIfBlock(sheetName, flow, i);
    			blockFlow.push(psi.clause);
    			i = psi.idx;
    			break;
    		case "else":
    			throw Error("'else' without preceding 'if' clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
    					sheetName);
    			break;
    		case "end_if":
    			throw Error("'end if' without preceding 'if' clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
    					sheetName);
    			break;
			default:
				throw Error("Unrecognized clause: '" + clause.clause + "' on sheet: " +
						sheetName + " at row " + clause._row_num);
    		}
    	}
    	/** ensure the section ends with an exit_section command */
    	var rowNum;
    	if ( flow.length == 0 ) {
    		rowNum = 2;
    	} else {
    		rowNum = flow[flow.length-1]._row_num+1;
    	}
    	var exitEnding = { _token_type: "exit_section",
    					   clause: "exit section",
    					   _row_num: rowNum };
    	blockFlow.push(exitEnding);

    	/** if there is no hierarchy branch label, emit one */
    	var found = false;
    	i = 0;
    	while ( !found && i < blockFlow.length ) {
    		var clause = blockFlow[i];
    		switch (clause._token_type) {
    		case "branch_label":
    			if (clause.branch_label == "hierarchy") {
    				found = true;
    			}
    			break;
    		}
    		++i;
    	}
    	if ( !found ) {
    		/** emit a hierarchy branch label, prompt and back-action */
    		blockFlow.push({ _token_type: "branch_label", branch_label: "hierarchy", _row_num: rowNum });
    		blockFlow.push({ _token_type: "prompt", type: "hierarchy", _type: "hierarchy", _row_num: rowNum });
    		blockFlow.push({ _token_type: "back_in_history", _row_num: rowNum });
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
		if ( tags == "" || parts.length == 0 || (parts.length == 1 && parts[0] == "") ) {
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

    var constructScreenDefn = function(sheetName, prompts, validationTagMap, blockFlow, idx, enclosingScreenLabel) {
		if ( enclosingScreenLabel == null ) {
			throw Error("Internal error. No enclosing screen label defined on sheet: " +
			sheetName + " at row " + clause._row_num);
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
    			defn += "assign('" + clause.name + "', " + clause.value + ");\n";
    			++i;
    			break;
    		case "prompt":
    			var promptIdx = prompts.length;
    			clause._branch_label_enclosing_screen = enclosingScreenLabel;
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
    			defn +=	constructScreenDefn(sheetName, prompts, validationTagMap, thenBlock, 0, enclosingScreenLabel);
    			defn += "}\n";
    			if ( elseBlock != null && elseBlock.length > 0 ) {
    				defn += "else {\n";
        			defn +=	constructScreenDefn(sheetName, prompts, validationTagMap, elseBlock, 0, enclosingScreenLabel);
        			defn += "}\n";
    			}
    			++i;
    			break;
    		case "end_screen":
    		case "else":
    		case "end_if":
    		case "branch_label":
    		case "goto_label":
    		case "back_in_history":
    		case "do_section":
    		case "exit_section":
    		case "validate":
    			throw Error("Internal error. clause: '" + clause.clause + "' at row " + clause._row_num + " on sheet: " +
    					sheetName);
    			break;
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
    var flattenBlocks = function(sheetName, prompts, validationTagMap, flattened, blockFlow, idx) {
    	var i = idx;
    	while ( i < blockFlow.length ) {
    		var clause = blockFlow[i];
    		switch (clause._token_type) {
    		case "branch_label":
    		case "assign":
    		case "goto_label":
    		case "back_in_history":
    		case "do_section":
    		case "exit_section":
    		case "validate":
    			flattened.push(clause);
    			++i;
    			break;
    		case "prompt":
				var newScreenLabel = "screen"+clause._row_num;
    			var labelEntry = { _token_type: "branch_label",
						branch_label: newScreenLabel, _row_num: clause._row_num };
    			flattened.push(labelEntry);
    			// inform the prompt of the tag for the enclosing screen...
    			var promptIdx = prompts.length;
    			clause._branch_label_enclosing_screen = newScreenLabel;
    			clause.promptIdx = promptIdx;
    			prompts.push(clause);
    			updateValidationTagMap( validationTagMap, promptIdx, clause);

    			var defn = "activePromptIndicies.push(" + promptIdx + ");\n";
    			defn = "function() {var activePromptIndicies = [];\n"+defn+"\nreturn activePromptIndicies;\n}\n";

    			var bsb = { clause: clause.clause,
    				_row_num: clause._row_num,
    				_token_type: "begin_screen",
    				_screen_block: defn };
    			if ( 'screen' in clause ) {
    				// copy the 'screen' settings into the clause
    				_.extend(bsb, clause.screen );
    				delete clause.screen;
    			}
    			flattened.push(bsb);
    			++i;
    			break;
    		case "begin_screen":
				var newScreenLabel = "screen"+clause._row_num;
    			var labelEntry = { _token_type: "branch_label",
						branch_label: newScreenLabel, _row_num: clause._row_num };
    			flattened.push(labelEntry);
    			// process the screen definition
    			var defn = constructScreenDefn(sheetName, prompts, validationTagMap, clause._screen_block, 0, newScreenLabel);
    			defn = "function() {var activePromptIndicies = [];\n"+defn+"\nreturn activePromptIndicies;\n}\n";
    			clause._screen_block = defn;
        		flattened.push(clause);
    			++i;
    			break;
    		case "begin_if":
    			var endIfClause = clause._end_if_clause;
    			var elseClause = (clause._else_clause != null) ? clause._else_clause : endIfClause;
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

    			var labelEntry = { _token_type: "branch_label",
						branch_label: thenLabel, _row_num: clause._row_num };

				flattened.push(labelEntry); // Then label
				// then block...
				flattenBlocks(sheetName, prompts, validationTagMap, flattened, thenBlock, 0);

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
				if ( elseBlock != null ) {
					flattenBlocks(sheetName, prompts, validationTagMap, flattened, elseBlock, 0);
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
    			break;
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
    		case "back_in_history":
    		case "do_section":
    		case "exit_section":
    		case "validate":
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
    			break;
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
    		case "back_in_history":
    		case "do_section":
    		case "exit_section":
    		case "validate":
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
    			break;
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
    		case "back_in_history":
    		case "exit_section":
    		case "validate":
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
    			break;
			default:
				throw Error("Unrecognized clause: '" + clause.clause + "' on sheet: " +
						sheetName + " at row " + clause._row_num);
    		}
    	}
    };

    var parseSection = function(sheetName, sheet){

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
    	flattenBlocks(sheetName, prompts, validationTagMap, flattened, blockFlow, 0);
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

    var parseSections = function(sectionNames, sections) {
    	/* Step 1: restructure each section.
    	 *
    	 */
    	var newSections = {};
        _.each(sections, function(section, sectionName){
        	var sectionObject = parseSection(sectionName, section);
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
	        		_.each(newSections[sectionName].reachable_sections, function(rreached, depthOne) {
	        			newReachable[depthOne] = true;
	        		});
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
        for ( key in keys ) {
        	key_length++;
        }

        if ( key_length == 1 && "_finalize" in keys ) {
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
        if ( name in model ) {
        	var defn = model[name];
        	var amodb = _.extend({}, defn, schema, mdef);
        	var bmoda = _.extend({}, schema, mdef, defn);
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
        	_.extend(defn, schema, mdef);
        	defn._defn = dt;
        } else {
            model[name] = _.extend({_defn: [{ _row_num : promptOrAction._row_num, section_name: section.section_name }]}, schema, mdef);
            defn = model[name];
        }
        removeIgnorableModelFields(defn);
    };

    var developDataModel = function( logic_flow, promptTypes ) {
    	var assigns = [];
        var model = {};
    	_.each(logic_flow.sections, function(section){
            _.each(section.prompts, function(prompt){
                var schema;
                if(prompt._type in promptTypes) {
                    schema = promptTypes[prompt._type];
                    if(schema){
                        if("name" in prompt) {
                        	var name = prompt.name.trim();
                            if(name.indexOf(' ') != -1 || prompt.name != name) {
                                throw Error("Prompt names cannot contain spaces. Prompt: '" + prompt.type + "' at row " +
                            			prompt._row_num + " on sheet: " + section.section_name);
                            }
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
             *   assign  | name | value   -- no prompt_type info
             *   assign integer | name | value  -- prompt_type info supplied in 'type' column.
             *
             *   The initial parsing has
             *   _token_type = "assign"
             *   _data_type = null or "integer", respectively, for above.
             */
            _.each(section.operations, function(operation) {
            	if ( operation._token_type == "assign" ) {
                    if("name" in operation) {
                    	var name = operation.name.trim();
                        if(name.indexOf(' ') != -1 || operation.name != name) {
                            throw Error("Assign names cannot contain spaces. Clause: '" + operation.type + "' at row " +
                            		operation._row_num + " on sheet: " + section.section_name);
                        }

                		if (operation._data_type == null ) {
                			// no explicit type -- hope that the field gets a value somewhere else...
                			// record name to verify that is the case.
                			assigns.push(operation);
                		} else if(operation._data_type in promptTypes) {
                            var schema;
                            schema = promptTypes[operation._data_type];
                            if(schema){
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
    	_.each( _.keys(logic_flow.model), function(name) {
    		if ( name in model ) {
    			// defined in both
            	var defn = model[name];
            	var mdef = logic_flow.model[name];
            	var amodb = _.extend({}, defn, mdef);
            	var bmoda = _.extend({}, mdef, defn);
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
                    warning.warn(name + " has different definitions at row " +
                    		mdef._defn[0]._row_num + " on " + mdef._defn[0].section_name +
                    		" sheet than " + formatted.substring(2) + " " + mdef._defn[0].section_name +
                    		" sheet takes precedence." );
            	}
            	// merge the definition from the survey with the model
            	// such that the model takes precedence.
            	defn._defn.push(mdef._defn[0]);
            	var dt = defn._defn;
            	delete defn._defn;
            	_.extend(defn, mdef);
            	defn._defn = dt;
            	// update model...
            	logic_flow.model[name] = defn;
    		}
    	});
    	// copy over the fields in the prompt model that were not defined in the model tab...
    	_.each( _.keys(model), function(name) {
    		if ( !(name in logic_flow.model) ) {
    			logic_flow.model[name] = model[name];
    		}
    	});

    	// ensure that all the untyped assigns have types via either a model entry, an assign or a prompt...
    	for ( var i = 0 ; i < assigns.length ; ++i ) {
    		var op = assigns[i];
    		if ( !(op.name in model) ) {
            	throw Error("Assign 'name' does not have a defined storage type. Clause: '" + operation.type + "' at row " +
            			operation._row_num + " on sheet: " + section.section_name);
    		}
    	}
    };

    root.XLSXConverter = {
        processJSONWorkbook : function(wbJson){
            warnings.clear();
            _.each(wbJson, function(sheet, sheetName){
                _.each(sheet, function(row, rowIdx){
                	var rowObject = groupColumnHeaders(cleanValues(row));
                	var idx = rowObject.__rowNum__;
                	rowObject._row_num = idx + 1; /* excel uses 1-based index */
                    sheet[rowIdx] = rowObject;
                });
            });

            // we have done the standard conversions on all the sheets.

            var logic_flow = {};
            // Compute Processed intermediaries

            // SETTINGS
            var processedSettings = {};
            if ('settings' in wbJson) {
            	var cleanSet = wbJson['settings'];
            	cleanSet = omitRowsWithMissingField(cleanSet, 'setting_name');
            	processedSettings = _.groupBy(cleanSet, 'setting_name');
            	_.each(processedSettings, function(value, name) {
                    if(_.isArray(value)){
                    	if (value.length != 1) {
                        	throw Error("Duplicate definitions of '" + name + "' on 'settings' sheet");
                    	}
                    	processedSettings[name] = value[0];
                    } else {
                    	throw Error("Unexpected non-array for '" + name + "' on 'settings' sheet");
                    }
            	});
            }
            if ( !('form_id' in processedSettings) ) {
            	throw Error("Please define a 'form_id' setting_name on the settings sheet and specify the unique form id for the form");
            }
            if ( !('table_id' in processedSettings) ) {
            	var entry = _.extend({},processedSettings['form_id']);
            	entry.setting_name = "table_id";
            	processedSettings['table_id'] = entry;
            }
            if ( !('survey' in processedSettings) ) {
            	throw Error("Please define a 'survey' setting_name on the settings sheet and specify the survey title under display.title");
            }
            if ( !('display' in processedSettings.survey) ) {
            	throw Error("Please specify the survey title under the display.title column for the 'survey' setting_name on the settings sheet");
            }
            if ( _.isEmpty(processedSettings.survey.display) ||
            		(processedSettings.survey.display.title == null && processedSettings.survey.display.text != null) ) {
            	throw Error("Please specify the survey title under the display.title column for the 'survey' setting_name on the settings sheet");
            }

            // construct the list of all available form locales and the default locale.
            // Relies upon the title translations of the 'survey' sheet.
            // If
            //   settings.survey.display.title = { 'en' : 'Joy of life', 'fr' : 'Joi de vivre'}
            // and if
            //   settings.en.display = { text: {'en' : 'English', 'fr' : 'Anglais'} }
            //   settings.fr.display = { text: {'en' : 'French', 'fr', 'Francais' } }
            // then we compose
            //
            //   settings._locales = [ { name: 'en', display: { text: { 'en' : 'English' , 'fr': 'Anglais' }}},
            //                         { name: 'fr', display: { text: { 'en' : 'French', 'fr': 'Francais' }}} ]
            //
            // If the localizations for the language tags are missing (e.g., no settings.en, settings.fr)
            // then we just use the tag as the display string for that translation:
            //
            //   settings._locales = [ { name: 'en', display: { text: 'en'} },
            //                         { name: 'fr', display: { text: 'fr'} } ]
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

                // assume all the locales are specified by the title...
                var form_title = processedSettings.survey.display.title;
                if ( _.isUndefined(form_title) || _.isString(form_title) ) {
                    // no internationalization -- just default choice
                    locales.push({display: {text: 'default'}, name: 'default'});
                    defaultLocale = 'default';
                } else {
                    // we have localization -- find all the tags
                	var firstTranslation = null;

                    for ( var f in form_title ) {
                        // If the tag value is defined in the settings page, use its
                    	// display value as the display string for the language.
                    	// Otherwise, use the tag itself as the name for that language.
                        var translations = processedSettings[f];
                        if ( translations == null || translations.display == null ) {
                            locales.push( { display: {text: f},
                            				name: f } );
                            if ( defaultLocale == null ) {
                            	defaultLocale = f;
                            }
                        } else {
                            locales.push( { display: translations.display,
                            				_row_num: translations._row_num,
                            				name: f } );
                            if ( firstTranslation == null ||
                            	 firstTranslation > translations._row_num) {
                            	defaultLocale = f;
                            	firstTranslation = translations._row_num;
                            }
                        }
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

                var entry = { setting_name: "_locales",
                			  _row_num: processedSettings.survey._row_num,
                			  value: locales };
                processedSettings['_locales'] = entry;

                var entry = { setting_name: "_default_locale",
                			  _row_num: processedSettings.survey._row_num,
                			  value: defaultLocale };
                processedSettings['_default_locale'] = entry;
            }

            if ( !('initial' in processedSettings) ) {
            	processedSettings.initial = processedSettings.survey;
            }

            logic_flow.settings = processedSettings;

            // CHOICES
            var processedChoices = {};
            if ('choices' in wbJson) {
            	var cleanSet = wbJson['choices'];
            	cleanSet = omitRowsWithMissingField(cleanSet, 'choice_list_name');
            	errorIfFieldMissing('choices',cleanSet,'data_value', true);
            	errorIfFieldMissing('choices',cleanSet, 'display', true);
            	processedChoices = _.groupBy(cleanSet, 'choice_list_name');
            }
            logic_flow.choices = processedChoices;

            // QUERIES
            var processedQueries = {};
            if ('queries' in wbJson) {
            	var cleanSet = wbJson['queries'];
            	cleanSet = omitRowsWithMissingField(cleanSet, 'query_name');
            	errorIfFieldMissing('queries',cleanSet,'uri', true);
            	errorIfFieldMissing('queries',cleanSet, 'callback', true);
            	processedQueries = _.groupBy(cleanSet, 'query_name');
            	_.each(processedQueries, function(value, name) {
                    if(_.isArray(value)){
                    	if (value.length != 1) {
                        	throw Error("Duplicate definitions of '" + name + "' on 'queries' sheet");
                    	}
                    	processedQueries[name] = value[0];
                    } else {
                    	throw Error("Unexpected non-array for '" + name + "' on 'queries' sheet");
                    }
            	});
            }
            logic_flow.queries = processedQueries;

            // verify that queries and choices don't share the same names
            for (var key in processedQueries ) {
            	if ( key in processedChoices ) {
                	throw Error("Reuse of the name '" + key + "'. The 'choice_list_name' on 'choices' sheet and 'query_name' on 'queries' sheet cannot be identical.");
            	}
            }

            // CALCULATES
            var processedCalculates = {};
            if ('calculates' in wbJson) {
            	var cleanSet = wbJson['calculates'];
            	cleanSet = omitRowsWithMissingField(cleanSet, 'calculation_name');
            	errorIfFieldMissing('calculates',cleanSet,'calculation', true);
            	processedCalculates = _.groupBy(cleanSet, 'calculation_name');
            	_.each(processedCalculates, function(value, name) {
                    if(_.isArray(value)){
                    	if (value.length != 1) {
                        	throw Error("Duplicate definitions of '" + name + "' on 'calculates' sheet");
                    	}
                    	processedCalculates[name] = value[0];
                    } else {
                    	throw Error("Unexpected non-array for '" + name + "' on 'calculates' sheet");
                    }
            	});
            }
            logic_flow.calculates = processedCalculates;

            // PROMPT_TYPES
            var processedPromptTypes = promptTypeMap;
            if("prompt_types" in wbJson) {
            	var cleanSet = wbJson['prompt_types'];
            	cleanSet = omitRowsWithMissingField(cleanSet, 'prompt_type_name');
            	errorIfFieldMissing('prompt_types',cleanSet,'type', true);
                var userDefPrompts = {};
                userDefPrompts = _.groupBy(cleanSet, "prompt_type_name");
                _.each(userDefPrompts, function(value, key){
                    if(_.isArray(value)){
                    	if (value.length != 1) {
                        	throw Error("Duplicate definitions of '" + key + "' on 'prompt_types' sheet");
                    	}
                    	var schema = value[0];
                    	if ( schema.type == "null" ) {
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
            var processedModel = {};
            if("model" in wbJson){
            	var cleanSet = wbJson['model'];
            	cleanSet = omitRowsWithMissingField(cleanSet, 'name');
            	errorIfFieldMissing('model',cleanSet,'type', true);
            	processedModel = _.groupBy(cleanSet, "name");
                _.each(processedModel, function(value, key){
                    if(_.isArray(value)){
                    	if (value.length != 1) {
                        	throw Error("Duplicate definitions of '" + key + "' on 'model' sheet");
                    	}
                    	processedModel[key] = _.extend({_defn: [{ _row_num : value[0]._row_num, section_name: 'model' }] }, value[0] );
                    	removeIgnorableModelFields(processedModel[key]);
                    }
                });
            }
            logic_flow.model = processedModel;

            // Find the sheets that are survey sheets
            // (not one of the reserved names and not beginning with '-')
            var sections = {};
            var sectionNames = [];
            _.each(wbJson, function(sheet, sheetName){
            	if ( sheetName.indexOf('.') != -1 ) {
                    throw Error("Dots are not allowed in sheet names.");
            	}
            	if ( sheetName.indexOf('_') == 0 ) {
            		throw Error("Sheet names cannot begin with '_'.");
            	}
            	if ( sheetName.indexOf('-') != 0 && ! _.contains(reservedSheetNames, sheetName) ) {
            		sections[sheetName] = sheet;
            		sectionNames.push(sheetName);
            	}
            });
            if ( !("initial" in sections) ) {
            	sections["initial"] = default_initial;
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
            	if (! (name in logic_flow.settings) ) {
            		logic_flow.settings[name] = {};
            	}
            	if (! ('display' in logic_flow.settings[name]) ) {
            		logic_flow.settings[name].display = logic_flow.settings.survey.display;
            	}
            });

            // construct the json sheet for the interpreter
            var parsedSections = parseSections(sectionNames, sections);

            logic_flow.section_names = sectionNames; // in alphabetical order

            logic_flow.sections = parsedSections;

            // flesh out model based upon prompts and assign statements
            developDataModel(logic_flow, processedPromptTypes);

        	// ensure that all values_list names have a backing choices or queries definition
        	_.each(logic_flow.sections, function(section){
                _.each(section.prompts, function(prompt){
                    if ("values_list" in prompt) {
                    	var name = prompt.values_list;
                    	if ( !((name in logic_flow.choices) || (name in logic_flow.queries)) ) {
                        	throw Error("Unrecognized 'values_list' name: '" + name + "'. Prompt: '" + prompt.type + "' at row " +
                        			prompt._row_num + " on sheet: " + section.section_name);
                    	}
                    }
                });
        	});

        	/*
        	 * // INCOMING:
        	 * logic_flow = {
        	 *
        	 *    settings: { setting_name : ... }
        	 *    choices: { choice_list_name : ... }
        	 *    queries: { query_name : ... }
        	 *    calculates: { calculation_name : ... }
        	 *
        	 *    section_names : [ alphabetical list of sections ]
        	 *
        	 *    sections : { sectionName : {
        	 *    		    		section_name: sheetName,
        	 *    		    		nested_sections: { sectionNameA : true, ... },
        	 *    		    		reachable_sections: { sectionNameA : true, ... },
        	 *    					prompts: [ { extend promptDefinition with _branch_label_enclosing_screen }, ... ],
        	 *    		    		validation_tag_map: { tagA : [ promptidx1, promptidx2, ... ], tagB : [...], ... },
        	 *    		    		operations: [ opA, opB, ... ],
        	 *    					branch_label_map: { branchLabelA: opidx1, branchLabelB: opidx2, ... }
        	 *    				},
        	 *    				... }
        	 *
        	 *  // TODO: flesh out
        	 *    model: model tab pivoted by name, merged with prompts data info. (partial)
        	 *
        	 *  };
        	 */

            return { xlsx: wbJson, logic_flow: logic_flow };
        },
        //Returns the warnings from the last workbook processed.
        getWarnings: function(){
            return warnings.toArray();
        }
    };
}).call(this);
