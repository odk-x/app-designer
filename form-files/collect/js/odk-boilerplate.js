'use strict';

var jQT;
var formId;
var version;
var instanceId;
var opendatakit;
var submissionDb = false;

// db error handler - prevents the rest of the transaction going ahead on failure
function errorHandler(transaction, error) {
	console.log("database error: " + error.message);
	// returns true to rollback the transaction
	return true;
}

// null db data handler
function nullDataHandler(transaction, results) {
}

function transactionErrorHandler(error) {
	console.log("database error: " + error.message);
}

function withDb(continuation, completionAction) {
	try {
		console.log("withDb: " + document.domain);
		if ( submissionDb ) {
			submissionDb.transaction(continuation, transactionErrorHandler, completionAction);
		} else if(!window.openDatabase) {
			alert('not supported');
		} else {
			var shortName = 'odk';
			var version = '1.0';
			var displayName = 'ODK Instances Database';
			var maxSize = 65536;
			// in bytes
			var database = openDatabase(shortName, version, displayName, maxSize);
			  // create the database...
			database.transaction(function(transaction) {
					transaction.executeSql('CREATE TABLE IF NOT EXISTS attr_values(id INTEGER NOT NULL PRIMARY KEY, form_id TEXT NOT NULL, version TEXT NULL, instance_id TEXT NOT NULL, name TEXT NOT NULL, val TEXT NULL);', []);
					transaction.executeSql('CREATE TABLE IF NOT EXISTS instance_info(id INTEGER NOT NULL PRIMARY KEY, form_id TEXT NOT NULL, version TEXT NULL, instance_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NULL, detail TEXT NULL);', []);
					submissionDb = database;
					continuation(transaction);
					},
					transactionErrorHandler,
					completionAction);
		}
	} catch(e) {
		// Error handling code goes here.
		if(e.INVALID_STATE_ERR) {
			// Version number mismatch.
			alert("Invalid database version.");
		} else {
			alert("Unknown error " + e + ".");
		}
		return;
	}
}


function selectStmt(name) {
	if ( version == null ) {
		return {
			stmt : 'select val from attr_values where form_id=? and version is null and instance_id=? and name=?;',
			bind : [formId, instanceId, name]	
		};
	} else {
		return {
			stmt : 'select val from attr_values where form_id=? and version=? and instance_id=? and name=?;',
			bind : [formId, version, instanceId, name]	
		};
	}
}

function insertStmt(name, value) {
	if ( version == null ) {
		if (value == null) {
			return {
				stmt : 'insert into attr_values (form_id,version,instance_id,name,val) VALUES (?,null,?,?,null);',
				bind : [formId, instanceId, name]
			};
		} else {
			return {
				stmt : 'insert into attr_values (form_id,version,instance_id,name,val) VALUES (?,null,?,?,?);',
				bind : [formId, instanceId, name, value]
			};
		}
	} else {
		if ( value == null) {
			return {
				stmt : 'insert into attr_values (form_id,version,instance_id,name,val) VALUES (?,?,?,?,null);',
				bind : [formId, version, instanceId, name]
			};
		} else {
			return {
				stmt : 'insert into attr_values (form_id,version,instance_id,name,val) VALUES (?,?,?,?,?);',
				bind : [formId, version, instanceId, name, value]
			};
		}
	}
}

function updateStmt(name, value) {
	if ( version == null ) {
		if ( value == null ) {
			return {
				stmt : 'update attr_values set val=null where form_id=? and version is null and instance_id=? and name=?;',
				bind : [formId, instanceId, name]
			};
		} else {
			return {
				stmt : 'update attr_values set val=? where form_id=? and version is null and instance_id=? and name=?;',
				bind : [value, formId, instanceId, name]
			};
		}
	} else {
		if ( value == null ) {
			return {
				stmt : 'update attr_values set val=null where form_id=? and version=? and instance_id=? and name=?;',
				bind : [formId, version, instanceId, name]
			};
		} else {
			return {
				stmt : 'update attr_values set val=? where form_id=? and version=? and instance_id=? and name=?;',
				bind : [value, formId, version, instanceId, name]
			};
		}
	}
}

function deleteStmt(name) {
	if ( version == null ) {
		return {
			stmt : 'delete from attr_values where form_id=? and version is null and instance_id=? and name=?;',
			bind : [formId, instanceId, name]
		};
	} else {
		return {
			stmt : 'delete from attr_values where form_id=? and version=? and instance_id=? and name=?;',
			bind : [formId, version, instanceId, name]
		};
	}
}

function putData(name, value, onSuccessfulSave) {
//	if ( opendatakit != null ) {
//	  opendatakit.assertValue( formId, version, instanceId, name, value );
//	  onSuccessfulSave();
//	} else {
	{
	  console.log("putData: Using native SQLite");
	  withDb( function(transaction) {
			var ss = selectStmt(name);
			transaction.executeSql(ss.stmt, ss.bind, function(transaction, result) {
				if(result.rows.length == 0) {
					var is = insertStmt(name, value);
					transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
						console.log("successful insert: " + name);
					});
				} else {
					if ( result.rows.length > 1 ) {
						console.log("deleting existing records (multiple): " + name);
						var ds = deleteStmt(name);
						transaction.executeSql(ds.stmt, ds.bind, function(transaction, result) {
							var is = insertStmt(name, value);
							transaction.executeSql(is.stmt, is.bind, function(transaction, result) {
								console.log("successful insert: " + name);
							});
						});
					} else {
						var us = updateStmt(name, value);
						transaction.executeSql(us.stmt, us.bind, function(transaction, result) {
							console.log("successful update: " + name);
						});
					}
				}
			});
		}, onSuccessfulSave );
	}
}

function getData(name, action) {
//	if ( opendatakit != null ) {
//	  var value = opendatakit.getValue( formId, version, instanceId, name );
//	  action(value);
//	} else 
    {
  	  console.log("getData: Using native SQLite");
	  var dbValue;
	  withDb( function(transaction) {
		var ss = selectStmt(name);
		transaction.executeSql(ss.stmt, ss.bind, 
			function(transaction, result) {
				if (result.rows.length == 0 ) {
					dbValue = null;	                    	
				} else {
					if(result.rows.length != 1) {
						console.log("getData: multiple rows! " + result.rows.length);
					}
					var row = result.rows.item(0);
					dbValue = row['val'];
				}
			}, function(transaction, error) {
				console.log("stmt " + ss.stmt + " args: " + ss.bind + " database error: " + error.message);
				return true;
			});
		}, function() {
			action(dbValue);
		});
	}
}

function getMetadata(name, action) {
	if ( opendatakit != null ) {
	  var value = opendatakit.getMetadataValue( formId, version, instanceId, name );
	  action(value);
	} else {
  	  console.log("getMetadata: Falling back to formId");
	  if ( name == 'display_name' ) {
		action(formId);
	  } else {
		action(null);
	  }
	}
}

function jq(name) {
	return '#' + name.replace(/(["!#$%&'()*+,\.\-\/:;<=>?@\[\]^`{|}~])/g, '\\$1');
}

function checkInteger(name, isRequired, alertMessage) {
	var value = $(jq(name))[0].value;
	if(value && value.length != 0) {
		var n = Number(value);
		if(isNaN(n) || Math.round(n) != n) {
			if(alertMessage) {
				alert(alertMessage);
			} else {
				alert("Integer expected!");
			}
			return false;
		}
	} else if(isRequired) {
		alert("Required value! Please enter an integer value.");
		return false;
	}
	return true;
}

function checkNumeric(name, isRequired, alertMessage) {
	var value = $(jq(name))[0].value;
	if(value && value.length != 0) {
		var n = Number(value);
		if(isNaN(n)) {
			if(alertMessage) {
				alert(alertMessage);
			} else {
				alert("Numeric value expected!");
			}
			return false;
		}
	} else if(isRequired) {
		alert("Required value! Please enter a numeric value.");
		return false;
	}
	return true;
}

function updateDisplayValue(name, value) {
	if ( value == null || value.length == 0 || value.length > 65535 ) {
		$(jq(name))[0].value = null;
	} else {
		console.log(name + " is " + value);
		$(jq(name))[0].value = value;
   }
}

function isValidPage( aPage, pageOrderedList ) {
	for ( var i = 0 ; i < pageOrderedList.length ; ++i ) {
		if ( aPage == pageOrderedList[i] ) {
			return true;
		}
	}
	return false;
}

function prevPage( aPage, pageOrderedList ) {
	for ( var i = 1 ; i < pageOrderedList.length ; ++i ) {
		if ( aPage = pageOrderedList[i] ) {
			return pageOrderedList[i-1];
		}
	}
	return pageOrderedList[0];
}

function nextPage( aPage, pageOrderedList ) {
	for ( var i = 0 ; i < pageOrderedList.length-1 ; ++i ) {
		if ( aPage == pageOrderedList[i] ) {
			return pageOrderedList[i+1];
		}
	}
	return pageOrderedList[-1];
}

function isAdvancingPage( fromPage, toPage, pageOrderedList ) {
	var fromFound = false;
	for ( var i = 0 ; i < pageOrderedList.length ; ++i ) {
		if ( fromPage == pageOrderedList[i] ) {
			fromFound = true;
		}
		if ( toPage == pageOrderedList[i] ) {
			return fromFound;
		}
	}
	return false;
}

function swipeLeftOutcall( selpage ) {
    return function(evt, data) {
	  setTimeout(function() {
		console.log("swipeLeftOutcall: eventthreadstart ms: " + (+new Date()) + " ForAdvanceUrlOn: " + selpage);
		var advanceUrl = $(selpage).data("ODK_advanceUrl");
		if ( advanceUrl != null ) {
			console.log("swipeLeftOutcall: checkAndSaveValues... " + selpage);
			var checkAndSaveValues = $(selpage).data("ODK_checkAndSaveValues");
			var onSuccessfulSave = function() {
				var url = advanceUrl();
				if ( url != null ) {
					$(selpage).data("ODK_invokeCheckAndSaveValues", false);
					console.log("swipeLeftOutcall: b4gotoLink ms: " + (+new Date()) + " changePage: " + url);
					gotoLink(true,url);
				}
			}
			if ( checkAndSaveValues == null ) {
				onSuccessfulSave();
			} else {
				checkAndSaveValues(true, onSuccessfulSave)
			}
		} else {
			console.log("swipeLeftOutcall: undefinedDest ms: " + (+new Date()) + " advanceUrlUndefinedOn: " + selpage);
		}
	  }, 0);
	};
}

function swipeRightOutcall( selpage ) {
    return function(evt, data) {
	  setTimeout(function() {
		console.log("swipeRightOutcall: eventthreadstart ms: " + (+new Date()) + " ForBackwardUrlOn: " + selpage);
		var backwardUrl = $(selpage).data("ODK_backwardUrl");
		if ( backwardUrl != null ) {
			console.log("swipeRightOutcall: checkAndSaveValues... " + selpage);
			var checkAndSaveValues = $(selpage).data("ODK_checkAndSaveValues");
			var onSuccessfulSave = function() {
				var url = backwardUrl();
				if ( url != null ) {
					$(selpage).data("ODK_invokeCheckAndSaveValues", false);
					console.log("swipeRightOutcall: b4gotoLink ms: " + (+new Date()) + " changePage: " + url);
					gotoLink(false,url);
				}
			}
			if ( checkAndSaveValues == null ) {
				onSuccessfulSave();
			} else {
				checkAndSaveValues(false, onSuccessfulSave)
			}
		} else {
			console.log("swipeRightOutcall: undefinedDest ms: " + (+new Date()) + " backwardUrlUndefinedOn " + selpage);
		}
	  }, 0);
    };
}

// From: http://geekswithblogs.net/PhubarBaz/archive/2011/11/21/getting-query-parameters-in-javascript.aspx
var queryParameters = (function()
{
    var result = {};

    if (window.location.search)
    {
        // split up the query string and store in an associative array
        var params = window.location.search.slice(1).split("&");
        for (var i = 0; i < params.length; i++)
        {
            var tmp = params[i].split("=");
            result[tmp[0]] = unescape(tmp[1]);
        }
    }

    return result;
}());

function getInstanceId() {
	var id = queryParameters.instanceId;
	if ( id == null ) {
		console.log("ALERT! defining a UUID  because one wasn't specified");
		// construct a UUID (from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript )
		id = "uuid:" + 
		'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
		// add it to the parameter list
		queryParameters.instanceId = id;
	}
	return id;
}

function genParamList() {
	var s = ''
	for ( var f in queryParameters ) {
		s += '&' + f + '=' + escape(queryParameters[f])
	}
	return '?' + s.substring(1)
}

function gotoLink( isForward, url ) {
    /*
    var pageRef = null;
    if ( url.indexOf('#') != -1 ) {
		pageRef=url.substring(url.indexOf('#'));
		url=url.substring(0,url.indexOf('#'));
	}
	if ( url.length > 0 ) {
	    console.log("gotoLink: window.location ms: " + (+new Date()) + " page: " + pageRef);
		window.location = url + genParamList() + pageRef
	} else if ( isForward ) {
	    console.log("gotoLink: b4jQTgoTo ms: " + (+new Date()) + " page: " + pageRef);
		jQT.goTo(pageRef, "slideleft");
	} else if ( jQT.history != null && jQT.history.length > 1 ) {
	    console.log("gotoLink: b4jQTgoBack ms: " + (+new Date()) + " page: " + pageRef);
		jQT.goBack();
	} else {
	    console.log("gotoLink: noHistoryB4jQTgoTo ms: " + (+new Date()) + " page: " + pageRef);
		jQT.goTo(pageRef, "slideright");
	}
    */
}

function pageAnimationEndOutcall(selpage) {
	return function(settings) {
		if ( settings.data.direction == "in" ) {
			console.log("pageAnimationEnd IN: " + selpage);
			var ifn = $(selpage).data("ODK_initializeValues");
			if ( ifn != null ) {
				ifn();
			}
			$(selpage).data("ODK_invokeCheckAndSaveValues", true);
		} else {
			console.log("pageAnimationEnd OUT: " + selpage);
		}
	};
};

function initialPageLoadOutcall(selpage) {
	// action performed once jQt has loaded and set this page as the initial view
	return function() {
		console.log("initialPageLoadOutcall: " + selpage)
		var ifn = $(selpage).data("ODK_initializeValues");
		if ( ifn != null ) {
			ifn();
		} else {
			logInitDone(selpage)
		}
	};
}

function logInitDone(pagename) {
	console.log("logInitDone: doneInit ms: " + (+new Date()) + " page: " + pagename);
};

function installEventListeners(pagename) {
	var selpage = "#"+pagename;
	// $(selpage).unbind("pageAnimationEnd");
	$(selpage).bind("pageAnimationEnd", pageAnimationEndOutcall(selpage));
	// $(selpage).unbind("swipeLeft");
	$(selpage).bind('swipeLeft', swipeLeftOutcall(selpage));
	// $(selpage).unbind("swipeRight");
	$(selpage).bind('swipeRight', swipeRightOutcall(selpage));
	// trigger to populate values when explicitly navigating to a page
	$(selpage).bind('initialPageLoad', initialPageLoadOutcall(selpage));
	console.log("installEventListeners: done ms: " + (+new Date()) + " page: " + pagename);
}

function save_all_changes(asComplete) {
	// TODO: save the changes on the current page...
	// TODO: evaluate all the constraints on all the pages if asComplete is true...
	// TODO: show error boxes for any violated constraints...
	opendatakit.saveCompleted(formId, version, instanceId, null, asComplete );
	// or:
	// opendatakit.saveFailed(formId, version, instanceid);
}

function opendatakitCallback(page, path, action, jsonObject) {
	console.log("opendatakitCallback: " + page + " path: " + path + " action: " + action + " status: " + jsonObject.status );
	var selpage = "#"+page;
	var handler = $(selpage).data(action+":"+path);
	if ( handler != null ) {
		handler( path, action, jsonObject );
	}
}
/*
window.onpopstate = function(event) {
	var page = $('#jqt > .current')
	var selpage = page.selector;
	var docheck = $(selpage).data("ODK_invokeCheckAndSaveValues");
	if ( docheck ) {
		var swe = swipeRightOutcall(selpage);
		swe(null, null);
		event.preventDefault();
		return;
	}
}
*/