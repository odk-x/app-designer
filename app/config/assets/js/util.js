/* global */
/**
 * Various functions that we might need across screens.
 */
'use strict';


/**
 * util function object provides utility functions which do not interface with data tables
 */
var util = {};

/**
 * util constants
 */

util.workflow = {};
util.workflow.none = 'NO_REGISTRATION';
util.workflow.optional = 'OPTIONAL_REGISTRATION';
util.workflow.required = 'REQUIRED_REGISTRATION';



/************************** General Util functions *********************************/

/**
 * Get the query parameter from the url. Note that this is kind of a hacky/lazy
 * implementation that will fail if the key string appears more than once, etc.
 */
util.getQueryParameter = function(key) {
    var href = document.location.search;
    var startIndex = href.search(key);
    if (startIndex < 0) {
        console.log('requested query parameter not found: ' + key);
        return null;
    }
    // Then we want the substring beginning after "key=".
    var indexOfValue = startIndex + key.length + 1;  // 1 for '='
    // And now it's possible that we have more than a single url parameter, so
    // only take as many characters as we need. We'll stop at the first &,
    // which is what specifies more keys.
    var fromValueOnwards = href.substring(indexOfValue);
    var stopAt = fromValueOnwards.search('&');
    if (stopAt < 0) {
        return decodeURIComponent(fromValueOnwards);
    } else {
        return decodeURIComponent(fromValueOnwards.substring(0, stopAt));
    }
};

util.genUUID = function() {
    // construct a UUID (from http://sta ckoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript )
    var id = 'uuid:' +
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = (c === 'x') ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    return id;
};


util.setJSONMap = function(JSONMap, key, value) {
    if (value !== null && value !== undefined) {
        JSONMap[key] = value;
    }
};

util.getCurrentOdkTimestamp = function() {
    return odkCommon.toOdkTimeStampFromDate(new Date());
};

util.populateDetailView = function(resultSet, parentDiv, locale, exclusionList) {
    if (resultSet.getCount() > 0) {
        var columns = resultSet.getColumns();
        var fieldListDiv = $('#' + parentDiv);
        for (var i = 0; i < columns.length; i++) {
            if (!exclusionList.includes(columns[i]) && !columns[i].startsWith("_")) {
                var line = $('<p>').attr('id', columns[i]).appendTo(fieldListDiv);
                if (columns[i] === 'date_created') {
                    var dateObj = odkCommon.toDateFromOdkTimeStamp(resultSet.get(columns[i]));
                    if (dateObj !== null && dateObj !== undefined && dateObj !== "") {
                        var min = dateObj.getMinutes() < 10 ? '0' : '' + dateObj.getMinutes();
                        var val = dateObj.getFullYear() + '-' + dateObj.getMonth() + '-' + dateObj.getDate();
                        val += ' ' + dateObj.getHours() + ":" + min;
                        $('<span>').attr('id', 'inner_' + columns[i]).text(val).appendTo(line);
                    }
                }
                else {
                    $('<span>').attr('id', 'inner_' + columns[i]).text(resultSet.get(columns[i])).appendTo(line);
                }
                line.prepend(odkCommon.localizeText(locale, columns[i]) + ": ");
            }

        }
    }
};

// populates detail view with just one key value pair
util.populateDetailViewKeyValue = function(key, value, parentDiv, locale) {
    var line = $('<p>').attr('id', key).appendTo($('#' + parentDiv));
    $('<span>').attr('id', 'inner_' + key).text(value).appendTo(line);
    line.prepend(odkCommon.localizeText(locale, key) + ": ");
};

// resultSets: array of odk result sets
// kvPairs: json of key value pairs
// parentDiv: html element to add to
// locale: locale for translations
util.populateDetailViewArbitrary = function(resultSets, kvPairs, parentDiv, locale, exclusionList) {
    var mergeResult = {};

    resultSets.forEach(function(rs) {
        rs.getColumns().forEach(function(column) {
            mergeResult[column] = rs.get(column);
        });
    });

    if (kvPairs !== undefined && kvPairs != null) {
        $.extend(mergeResult, kvPairs);
    }

    var keys = Object.keys(mergeResult).sort();

    var fieldListDiv = $('#' + parentDiv);
    keys.forEach(function(key) {
        if (!key.startsWith("_") && !exclusionList.includes(key)) {
            var line = $('<p>').attr('id', key).appendTo(fieldListDiv);

            if (key === 'date_created') {
                var dateObj = odkCommon.toDateFromOdkTimeStamp(mergeResult[key]);
                if (dateObj !== null && dateObj !== undefined && dateObj !== "") {
                    var min = dateObj.getMinutes() < 10 ? '0' : '' + dateObj.getMinutes();
                    var val = dateObj.getFullYear() + '-' + dateObj.getMonth() + '-' + dateObj.getDate();
                    val += ' ' + dateObj.getHours() + ":" + min;
                    $('<span>').attr('id', 'inner_' + key).text(val).appendTo(line);
                }
            }
            else {
                $('<span>').attr('id', 'inner_' + key).text(mergeResult[key]).appendTo(line);
            }

            line.prepend(odkCommon.localizeText(locale, key) + ": ");
        }
    });
};


util.displayError = function(text) {
    alert(text);
};


function custom_alert( message, title ) {
    if ( !title )
        title = 'Alert';

    if ( !message )
        message = 'No Message to Display.';

    $('<div></div>').html( message ).dialog({
        title: title,
        resizable: false,
        modal: true,
        buttons: {
            'Ok': function()  {
                $( this ).dialog( 'close' );
            }
        }
    });
}


/************************** Red Cross Constants *********************************/

util.beneficiaryEntityTable = 'beneficiary_entities';
util.membersTable = 'members';
util.authorizationTable = 'authorizations';
util.entitlementTable = 'entitlements';
util.deliveryTable = 'deliveries';
util.distributionReportTable = 'distribution_reports';
util.savepointSuccess = "COMPLETE";
util.configPath = odkCommon.getBaseUrl() + 'config/assets/config.json';
util.actionTypeKey = 'actionTypeKey';

util.rootRowIdKey = 'rootRowId';
util.customFormIdKey = 'customFormId';
util.additionalCustomFormsObj = {};
util.additionalCustomFormsObj.dispatchKey = "additionalCustomForms";
util.additionalCustomFormsObj.formIdKey = "formId";
util.additionalCustomFormsObj.foreignReferenceKey = "foreignReferenceKey";
util.additionalCustomFormsObj.valueKey = "value";


/************************** Red cross config getters *********************************/

var configSingleton;

async: false

$.ajax({
    url: util.configPath,
    success: function( json ) {
        configSingleton = JSON.parse(json);
        util.getRegistrationMode = function() {
            return configSingleton['REGISTRATION_MODE'];
        };

        util.getWorkflowMode = function() {
            return configSingleton['WORKFLOW_MODE'];
        };

        util.getBeneficiaryEntityCustomFormId = function() {
            return configSingleton['BENEFICIARY_ENTITY_CUSTOM_FORM_ID'];
        };

        util.getMemberCustomFormId = function() {
            return configSingleton['MEMBER_CUSTOM_FORM_ID'];
        };

        util.getTokenAuthorizationFormId = function() {
            return 'authorizations';
        };

        util.getCustomBeneficiaryRowIdColumn = function() {
            return configSingleton['CUSTOM_BENEFICIARY_ROW_ID_COLUMN'];
        };
    },
    async: false
});

/************************** UI Rendering Util Functions *********************************/

util.renderPage = function(renderFunction) {
    document.body.style.display = "none";
    renderFunction();
    util.setVirtualButtonAttributes();
    document.body.style.display = "block";
};

util.renderPageAsPromise = function(renderFunction) {
    document.body.style.display = "none";
    renderFunction().then( function() {
        util.setVirtualButtonAttributes();
        document.body.style.display = "block";
    });
};

util.setVirtualButtonAttributes = function() {
    var buttons = $(':button');
    buttons.css({'height' : window.innerHeight * .15 + "px"});
    buttons.css({'font-size' : Math.min(window.innerHeight, window.innerWidth) * .07 + "px"});
    buttons.css({'margin-bottom' : window.innerHeight * .06 + "px"});
};







/**
 * dataUtil function object provides utility functions which interface with data tables
 */
var dataUtil = {};

dataUtil.getHouseholdSize = function(foreignRowId) {
    if (util.getRegistrationMode() != 'HOUSEHOLD') {
        return null;
    }
    return new Promise(function(resolve, reject) {
        odkData.arbitraryQuery(util.membersTable, 'SELECT count(*) AS size from ' +
        util.membersTable + ' where beneficiary_entity_row_id = ?',
            [foreignRowId], null, null, resolve, reject);
    }).then(function(result) {
        return result.getData(0, 'size');
    });
};

dataUtil.getViewData = function() {
    return new Promise(function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    });
};

dataUtil.getRow = function(tableId, rowId) {
    return new Promise(function(resolve, reject) {
        odkData.query(tableId, '_id = ?', [rowId],
            null, null, null, null, null, null, true, resolve, reject);
    });
};

dataUtil.deleteRow = function(tableId, rowId) {
    return new Promise(function(resolve, reject) {
        odkData.deleteRow(tableId, null, rowId, resolve, reject);
    });
};

dataUtil.entitlementIsDelivered = function(entitlement_id) {
    return new Promise(function(resolve, reject) {
        odkData.query(util.deliveryTable, 'entitlement_id = ?',
            [entitlement_id], null, null, null, null, null,
            null, true, resolve, reject);
    }).then(function(result) {
        return result.getCount() !== 0;
    }).catch( function(reason) {
        odkCommon.log('E', 'Failed to check if entitlement is delivered: ' + reason);
        return false;
    });
};

/**
 * if there is no delivery form, then launch to simple delivery html page
 * else create the base delivery row and create and launch survey for custom delivery row
 */
dataUtil.triggerEntitlementDelivery = function(entitlementId, actionTypeValue) {
    var entitlementRow;
    dataUtil.getRow(util.entitlementTable, entitlementId).then( function(result) {
        entitlementRow = result;
        if (entitlementRow === undefined || entitlementRow.getCount === 0) {
            return Promise.reject('Failed to retrieve entitlement.');
        }
        return dataUtil.getRow(util.authorizationTable, entitlementRow.get('authorization_id'));
    }).then(function(authorizationRow) {
        if (authorizationRow !== undefined && authorizationRow !== null && authorizationRow.getCount() !== 0) {
            if (dataUtil.isCustomDeliveryAuthorization(authorizationRow)) {
                dataUtil.tableExists(authorizationRow.getData(0, 'custom_delivery_form_id'))
                    .then(function (result) {
                        if (!result) {
                            util.displayError('Specified delivery form cannot be found. Unable to deliver.');
                            return;
                        }

                        var customDeliveryRowId = util.genUUID();
                        var jsonMap = {};
                        var assigned_code = entitlementRow.get('assigned_item_pack_code');
                        if (assigned_code !== undefined && assigned_code !== null && assigned_code !== "") {
                            util.setJSONMap(jsonMap, 'assigned_item_pack_code', assigned_code);
                        }
                        dataUtil.addDeliveryRowByEntitlement(entitlementRow, authorizationRow.get("custom_delivery_form_id"), customDeliveryRowId)
                            .then(function (rootDeliveryRow) {
                                dataUtil.createCustomRowFromBaseEntry(rootDeliveryRow, "custom_delivery_form_id", "custom_delivery_row_id", actionTypeValue, null, "_group_read_only", jsonMap);
                            }).catch(function (reason) {
                            console.log('Failed to perform custom entitlement delivery: ' + reason);
                        });
                    });
            } else {
                console.log('Performing simple delivery');
                odkTables.launchHTML(null, 'config/assets/html/deliver.html?entitlement_id=' +  encodeURIComponent(entitlementRow.getRowId(0)));
            }
        } else {
            util.displayError("Authorization missing from phone, please contact administrator");
        }

    });
};

dataUtil.tableExists = function(tableId) {
    return new Promise( function(resolve, reject) {
        odkData.getAllTableIds(resolve, reject);
    }).then( function(result) {
        return Promise.resolve(result.getAllTableIds().includes(tableId));
    });
};

/**
 * Generic method to create and launch survey for a custom row based off of a root row
 * @param baseEntry is the base table row
 * @param customTableNameKey is the column name in the base table to find the custom form id
 * @param customFormForeignKey is the column in the base table to find what the custom row id should be set to
 * @param actionTypeValue is the actionType to set to the dispatchStruct actionTypeKey for clients to customize handlers for returning from Survey
 * @param dispatchStruct is an optional parameter which can be used to prepopulate the dispatchStruct with additonal custom values (useful for leveraging the additionalCustomForms schema)
 * @param visibilityColumn is the column of the group permission we are setting
 * @param is an optionally pre-populated map of kv pairs to populate the new row with
 */

dataUtil.createCustomRowFromBaseEntry = function(baseEntry, customTableNameKey, customFormForeignKey, actionTypeValue, dispatchStruct, visibilityColumn, jsonMap) {
    var rootDeliveryRowId = baseEntry.get('_id');
    var customFormId = baseEntry.get(customTableNameKey);
    var customDeliveryRowId = baseEntry.get(customFormForeignKey);
    if (!baseEntry || baseEntry.getCount === 0) {
        throw ('Base table entry is invalid');
    }
    if (jsonMap === null) {
        jsonMap = {};
    }

    // We also need to add group permission fields
    util.setJSONMap(jsonMap, visibilityColumn, baseEntry.get(visibilityColumn));

    util.setJSONMap(jsonMap, '_row_owner', odkCommon.getActiveUser());

    util.setJSONMap(jsonMap, '_default_access', baseEntry.get('_default_access'));

    return new Promise( function(resolve, reject) {
        odkData.addRow(customFormId, jsonMap, customDeliveryRowId, resolve, reject);
    }).then( function(result) {
        if (dispatchStruct === undefined || dispatchStruct === null) {
            dispatchStruct = {};
        }
        util.setJSONMap(dispatchStruct, util.actionTypeKey, actionTypeValue);
        util.setJSONMap(dispatchStruct, util.rootRowIdKey, rootDeliveryRowId);
        util.setJSONMap(dispatchStruct, util.customFormIdKey, customFormId);
        odkTables.editRowWithSurvey(JSON.stringify(dispatchStruct), customFormId, customDeliveryRowId, customFormId, null);
    });
};

// extracts and validates whether a given authorization row has a valid customDeliveryFormId
dataUtil.isCustomDeliveryAuthorization = function(authorizationRow) {
    if (authorizationRow.getCount() === 0) {
        return false;
    } else {
        var customDeliveryFormId = authorizationRow.getData(0, 'custom_delivery_form_id');
        //TODO: verify that customDeliveryFormExists
        return customDeliveryFormId !== undefined && customDeliveryFormId !== null && customDeliveryFormId !== "" && customDeliveryFormId !== util.deliveryTable;
    }
};


//TODO: add date created attribute
dataUtil.addDeliveryRowByEntitlement = function(entitlementRow, customDeliveryFormId, customDeliveryRowId) {
    var jsonMap = {};
    util.setJSONMap(jsonMap, 'beneficiary_entity_id', entitlementRow.get('beneficiary_entity_id'));
    util.setJSONMap(jsonMap, 'member_id', entitlementRow.get('member_id'));
    util.setJSONMap(jsonMap, 'entitlement_id', entitlementRow.get('_id'));
    util.setJSONMap(jsonMap, 'authorization_id', entitlementRow.get('authorization_id'));
    util.setJSONMap(jsonMap, 'authorization_name', entitlementRow.get('authorization_name'));
    util.setJSONMap(jsonMap, 'authorization_type', entitlementRow.get('authorization_type'));
    util.setJSONMap(jsonMap, 'authorization_description', entitlementRow.get('authorization_description'));
    util.setJSONMap(jsonMap, 'item_pack_id', entitlementRow.get('item_pack_id'));
    util.setJSONMap(jsonMap, 'item_pack_name', entitlementRow.get('item_pack_name'));
    util.setJSONMap(jsonMap, 'item_pack_description', entitlementRow.get('item_pack_description'));
    util.setJSONMap(jsonMap, 'is_override', entitlementRow.get('is_override'));
    util.setJSONMap(jsonMap, 'custom_delivery_form_id', customDeliveryFormId);
    util.setJSONMap(jsonMap, 'custom_delivery_row_id', customDeliveryRowId);
    util.setJSONMap(jsonMap, '_row_owner', odkCommon.getActiveUser());
    util.setJSONMap(jsonMap, 'date_created', util.getCurrentOdkTimestamp());
    util.setJSONMap(jsonMap, '_default_access', entitlementRow.get('_default_access'));
    util.setJSONMap(jsonMap, 'assigned_item_pack_code', entitlementRow.get('assigned_item_pack_code'));
    util.setJSONMap(jsonMap, '_group_read_only', entitlementRow.get('_group_read_only'));

    return new Promise(function(resolve, reject) {
        odkData.addRow(util.deliveryTable, jsonMap, util.genUUID(), resolve, reject);
    });
};

dataUtil.addDeliveryRowWithoutEntitlement = function(beneficiaryEntityId, authorizationRow, customDeliveryRowId) {
    var jsonMap = {};
    util.setJSONMap(jsonMap, 'beneficiary_entity_id', beneficiaryEntityId);
    util.setJSONMap(jsonMap, 'authorization_id', authorizationRow.get('_id'));
    util.setJSONMap(jsonMap, 'authorization_name', authorizationRow.get('name'));
    util.setJSONMap(jsonMap, 'authorization_type', authorizationRow.get('type'));
    util.setJSONMap(jsonMap, 'authorization_description', authorizationRow.get('description'));
    util.setJSONMap(jsonMap, 'item_pack_id', authorizationRow.get('item_pack_id'));
    util.setJSONMap(jsonMap, 'item_pack_name', authorizationRow.get('item_pack_name'));
    util.setJSONMap(jsonMap, 'item_description', authorizationRow.get('item_description'));
    util.setJSONMap(jsonMap, 'custom_delivery_form_id', authorizationRow.get('custom_delivery_table'));
    util.setJSONMap(jsonMap, 'custom_delivery_row_id', customDeliveryRowId);
    util.setJSONMap(jsonMap, '_row_owner', odkCommon.getActiveUser());
    util.setJSONMap(jsonMap, 'date_created', util.getCurrentOdkTimestamp());
    util.setJSONMap(jsonMap, 'is_override', 'FALSE');


    return new Promise(function(resolve, reject) {
        odkData.addRow(util.deliveryTable, jsonMap, util.genUUID(), resolve, reject);
    });

};


// returns true if the row was successfully added, otherwise cleans up dangling rows and returns false
dataUtil.validateCustomTableEntry = function(action, dispatchStr, label, rootFormId) {

    var result = action.jsonValue.result;

    console.log("Finishing custom " + label);

    var rootRowId = dispatchStr[util.rootRowIdKey];
    if (rootRowId === null || rootRowId === undefined) {
        console.log("Error: no root" + label + "id");
        return Promise.resolve(false);
    }

    if (result === null || result === undefined) {
        console.log("Error: no result object on " + label);
        dataUtil.deleteRow(rootFormId, rootRowId);
        return Promise.resolve(false);
    }

    var customRowId = result.instanceId;
    if (customRowId === null || customRowId === undefined) {
        console.log("Error: no instance ID on " + label);
        dataUtil.deleteRow(rootFormId, rootRowId);
        return Promise.resolve(false);
    }

    var customFormId = dispatchStr[util.customFormIdKey];
    if (customFormId === null || customFormId === undefined) {
        console.log("Error: no " + label + " table name");
        dataUtil.deleteRow(rootFormId, rootRowId);
        return Promise.resolve(false);
    }

    var savepointType = action.jsonValue.result.savepoint_type;

    if (savepointType === util.savepointSuccess) {
        console.log(label + " succeeded");
        return Promise.resolve(true);
    } else {
        console.log(label + " is false; delete rows");
        var dbActions = [];
        dbActions.push(dataUtil.deleteRow(rootFormId, rootRowId));
        dbActions.push(dataUtil.deleteRow(customFormId, customRowId));

        var additionalCustomFormsArr = dispatchStr[util.additionalCustomFormsObj.dispatchKey];
        if (additionalCustomFormsArr !== null && additionalCustomFormsArr !== undefined) {
            for (var i = 0; i < additionalCustomFormsArr.length; i++) {
                var tuple = additionalCustomFormsArr[i];
                var targetFormId = tuple[util.additionalCustomFormsObj.formIdKey];
                var targetForeignKey = tuple[util.additionalCustomFormsObj.foreignReferenceKey];
                var targetValue = tuple[util.additionalCustomFormsObj.valueKey];
                console.log(targetFormId + ' - ' + targetForeignKey + ' - ' + targetValue);
                dbActions.push(new Promise( function(resolve, reject) {
                    odkData.query(targetFormId, targetForeignKey + ' = ?', [targetValue],
                        null, null, null, null, null, null, false, resolve, reject);
                }).then( function(result) {
                    for (var j = 0; j < result.getCount(); j++) {
                        dataUtil.deleteRow(targetFormId, result.getRowId(j));
                    }
                }));
            }
        }

        return Promise.all(dbActions).then( function(resultArr) {
            console.log('Cleaned up invalid + ' + label + ' rows');
            return false;
        });
    }
};

dataUtil.reconcileTokenAuthorizations = function() {
    return dataUtil.getCurrentTokenAuthorizations().then( function(result) {
        var deactivateActions = [];
        if (result.getCount() > 1) {
            var maxIndex = -1;
            var maxTimestamp = new Date(-8640000000000000);
            for (var i = 0; i < result.getCount(); i++) {
                var currTimestamp = odkCommon.toDateFromOdkTimeStamp(result.getData(i, "_savepoint_timestamp"));
                if (currTimestamp > maxTimestamp) {
                    currTimestamp = maxTimestamp;
                    maxIndex = i;
                }
            }
            for (var i = 0; i < result.getCount(); i++) {
                if (i != maxIndex) {
                    deactivateActions.push(new Promise( function(resolve, reject) {
                        odkData.updateRow(util.authorizationTable, {"status" : "INACTIVE"}, result.getRowId(i), resolve, reject);
                    }));
                }
            }
        }
        return Promise.all(deactivateActions);
    });
};

dataUtil.getCurrentTokenAuthorizations = function() {
    return new Promise( function(resolve, reject) {
        odkData.query(util.authorizationTable, 'status = ? AND type = ?', ['ACTIVE', util.workflow.none], null, null,
            null, null, null, null, true, resolve,
            reject);
    });
};

// Promise resolves to true if the database was changed through healing
dataUtil.selfHealMembers = function(beneficiaryEntityBaseRowId, beneficiaryEntityCustomRowId) {

    var rowActions = [];

    // get all custom member rows from this beneficiary entity which do not have a corresponding base member row
    var danglingCustomMembers = new Promise( function(resolve, reject) {
        var getDanglingCustomMembers = "SELECT * FROM " + util.getMemberCustomFormId()
            + " LEFT JOIN " + util.membersTable +
            " ON " + util.membersTable + ".custom_member_row_id = " + util.getMemberCustomFormId() + "._id" +
            " WHERE " + util.getMemberCustomFormId() + ".custom_beneficiary_entity_row_id = ? " +
            "AND " + util.membersTable + ".custom_member_row_id IS NULL";
        odkData.arbitraryQuery(util.getMemberCustomFormId(), getDanglingCustomMembers, [beneficiaryEntityCustomRowId], null, null, resolve, reject);
    });

    // get all base member rows from this beneficiary entity which do not have a corresponding custom member row
    var danglingBaseMembers = new Promise( function(resolve, reject) {
        var getDanglingBaseMembers = "SELECT * FROM " + util.membersTable
            + " LEFT JOIN " + util.getMemberCustomFormId() +
            " ON " + util.membersTable + ".custom_member_row_id = " + util.getMemberCustomFormId() +  "._id" +
            " WHERE " + util.membersTable + ".beneficiary_entity_row_id = ? " +
            "AND "+ util.getMemberCustomFormId() + "._id IS NULL";
        odkData.arbitraryQuery(util.getMemberCustomFormId(), getDanglingBaseMembers, [beneficiaryEntityBaseRowId], null, null, resolve, reject);
    });


    return Promise.all([danglingCustomMembers, danglingBaseMembers])
    .then( function(resultArr) {

        // add base rows
        var customMemberRows = resultArr[0];
        console.log("adding base rows: " + customMemberRows.getCount());
        for (var i = 0; i < customMemberRows.getCount(); i++) {
            let jsonMap = {};
            util.setJSONMap(jsonMap, '_row_owner', customMemberRows.getData(i, '_row_owner'));
            util.setJSONMap(jsonMap, 'beneficiary_entity_row_id', beneficiaryEntityBaseRowId);
            util.setJSONMap(jsonMap, 'date_created', util.getCurrentOdkTimestamp());
            util.setJSONMap(jsonMap, 'custom_member_form_id', util.getMemberCustomFormId());
            util.setJSONMap(jsonMap, 'custom_member_row_id', customMemberRows.getRowId(i));
            util.setJSONMap(jsonMap, 'status', 'ENABLED');
            util.setJSONMap(jsonMap, '_group_modify', customMemberRows.getData(i, '_group_modify'));
            util.setJSONMap(jsonMap, '_default_access', customMemberRows.getData(i, '_default_access'));

            rowActions.push(new Promise( function(resolve, reject) {
                odkData.addRow(util.membersTable, jsonMap, util.genUUID(), resolve, reject);
            }));
        }


        // delete base rows
        var baseMemberRows = resultArr[1];
        console.log("remove dangling base rows: " + baseMemberRows.getCount());
        for (var i = 0; i < baseMemberRows.getCount(); i++) {
            rowActions.push(new Promise( function(resolve, reject) {
                odkData.deleteRow(util.membersTable, null, baseMemberRows.getRowId(i), resolve, reject);
            }));
        }
        return Promise.all(rowActions);
    }).then( function(result) {
        if (rowActions.length === 0) {
            return Promise.resolve(false);
        } else {
            return Promise.resolve(true);
        }
    });
};

/*dataUtil.getGroupedEntitlements = function(beneficiaryEntityId) {


    odkData.arbitraryQuery(util.entitlementTable, 'SELECT * FROM ' + util.entitlementTable + ' INNER JOIN ' + util.deliveryTable + ' ON ' + util.entitlementTable + '._id=' + util.deliveryTable + '.entitlement_id'
        [beneficiaryEntityId], null, null, resolve, reject);


    var originalEntitlementSet;
    new Promise( function(resolve, reject) {
        odkData.query(util.entitlementTable, 'beneficiary_entity_id = ?',
            [beneficiaryEntityId], null, null, null, null, null,
            null, true, resolve, reject);
    }).then( function(result) {
        console.log(result);
        originalEntitlementSet = result;
        var entitlementStatusChecks = [];
        for (var i = 0; i < result.getCount(); i++) {
            var entitlementId = result.getRowId(i);
            entitlementStatusChecks.push(new Promise( function(resolve, reject) {
                odkData.query(util.deliveryTable, '_id = ?',
                    [entitlementId], null, null, null, null, null,
                    null, true, resolve, reject);
            }));
        }
        return entitlementStatusChecks;
    }).then( function(result) {
        console.log(result);
        return Promise.all(result);
    }).then( function(result) {
        console.log(result);
        var pendingEntitlements = [];
        var deliveredEntitlements = [];
        for (var i = 0; i < originalEntitlementSet.getCount(); i++) {
            if (result.getRowIds().includes(originalEntitlementSet.getRowId(i))) {
                deliveredEntitlements.push(originalEntitlementSet.get(i));
            } else {
                deliveredEntitlements.push(originalEntitlementSet.get(i));
            }
        }
        return {"pending" : pendingEntitlements, "delivered" : deliveredEntitlements};
    });
}*/




