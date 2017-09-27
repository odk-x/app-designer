/* global */
/**
 * Various functions that we might need across screens.
 */
'use strict';

var util = {};

/**
 * Red Cross Constants
 */

util.beneficiaryEntityTable = 'beneficiary_entities';
util.individualTable = 'individuals';
util.authorizationTable = 'authorizations';
util.entitlementTable = 'entitlements';
util.deliveryTable = 'deliveries';
util.authorizationReportTable = 'authorization_reports';
util.savepointSuccess = "COMPLETE";


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

/**
 * Get a string to append to a url that will contain information the date and
 * time. The values can then be retrieved using getQueryParameter.
 */
util.getKeysToAppendToURL = function(date, time, focalChimp) {
    var result =
        '?' +
        util.dateKey +
        '=' +
        encodeURIComponent(date) +
        '&' +
        util.timeKey +
        '=' +
        encodeURIComponent(time) +
        '&' +
        util.focalChimpKey +
        '=' +
        encodeURIComponent(focalChimp);
    return result;
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

util.renderPage = function(renderFunction) {
    document.body.style.display = "none";
    renderFunction();
    $(':button').css({'height' : window.innerHeight * .15 + "px"});
    $(':button').css({'font-size' : Math.min(window.innerHeight, window.innerWidth) * .07 + "px"});
    $(':button').css({'margin-bottom' : window.innerHeight * .06 + "px"});
    document.body.style.display = "block";
}

util.renderPageAsPromise = function(renderFunction) {
    document.body.style.display = "none";
    renderFunction().then( function() {
        $(':button').css({'height' : window.innerHeight * .15 + "px"});
        $(':button').css({'font-size' : Math.min(window.innerHeight, window.innerWidth) * .07 + "px"});
        $(':button').css({'margin-bottom' : window.innerHeight * .06 + "px"});
        document.body.style.display = "block";
    });
}

util.setJSONMap = function(JSONMap, key, value) {
    if (value !== null && value !== undefined) {
        JSONMap[key] = value;
    }
}

util.populateDetailView = function(resultSet, parentDiv, locale, exclusionList) {
    if (resultSet.getCount() > 0) {
        var columns = resultSet.getColumns();
        var fieldListDiv = $('#' + parentDiv);
        for (var i = 0; i < columns.length; i++) {
            if (!columns[i].startsWith("_") && !exclusionList.includes(columns[i])) {
                var line = $('<p>').attr('id', columns[i]).appendTo(fieldListDiv);
                $('<span>').attr('id', 'inner' + columns[i]).text(resultSet.get(columns[i])).appendTo(line);
                line.prepend(odkCommon.localizeText(locale, columns[i]) + ": ");
            }
        }
    }
}

/**
 * Red cross config getters
 */

util.configPath = '../json/config.json';

util.getRegistrationMode = function() {
    return 'HOUSEHOLD';
}

util.getWorkflowMode = function() {
    return 'REGISTRATION_REQUIRED';
}

util.getBeneficiaryEntityCustomFormId = function() {
    return 'custom_beneficiary_entities';
}

util.getIndividualCustomFormId = function() {
    return 'custom_individuals';
}

util.getAuthorizationReportCustomFormId = function() {
    return 'custom_authorization_reports';
}



var dataUtil = {}

dataUtil.getViewData = function() {
    return new Promise(function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    });
}

dataUtil.getEntitlementRow = function(entitlement_id) {
    return new Promise(function(resolve, reject) {
        odkData.getMostRecentRow(util.entitlementTable, entitlement_id, resolve, reject);
    });
}

dataUtil.getCustomDeliveryForm = function(auth_id) {
    return new Promise(function(resolve, reject) {
        odkData.arbitraryQuery(util.authorizationTable,
            'SELECT delivery_table, delivery_form, ranges'
            +' FROM authorizations WHERE _id = ?',
            [auth_id], null, null, resolve, reject);
    });
}

dataUtil.getRootDeliveryRow = function(delivery_id) {
    return new Promise(function(resolve, reject) {
        odkData.getMostRecentRow(util.deliveryTable, delivery_id, resolve, reject);
    });
}

dataUtil.getCustomDeliveryRow = function(custom_delivery_id, custom_delivery_table) {
    return new Promise(function(resolve, reject) {
        odkData.getMostRecentRow(custom_delivery_table, custom_delivery_id, resolve, reject);
    });
}


//TODO: branch on whether to include an individual_id
//TODO: add date created attribute
dataUtil.addDeliveryRow = function(entitlement_row, custom_delivery_table, custom_delivery_row_id) {
    var jsonMap = {};
    util.setJSONMap(jsonMap, 'beneficiary_entity_id', entitlement_row.get('beneficiary_entity_id'));
    util.setJSONMap(jsonMap, 'entitlement_id', entitlement_row.get('_id'));
    util.setJSONMap(jsonMap, 'authorization_id', entitlement_row.get('authorization_id'));
    util.setJSONMap(jsonMap, 'authorization_name', entitlement_row.get('authorization_name'));
    util.setJSONMap(jsonMap, 'authorization_type', entitlement_row.get('authorization_type'));
    util.setJSONMap(jsonMap, 'authorization_description', entitlement_row.get('authorization_description'));
    util.setJSONMap(jsonMap, 'item_pack_id', entitlement_row.get('item_pack_id'));
    util.setJSONMap(jsonMap, 'item_pack_name', entitlement_row.get('item_pack_name'));
    util.setJSONMap(jsonMap, 'item_description', entitlement_row.get('item_description'));
    util.setJSONMap(jsonMap, 'is_override', entitlement_row.get('is_override'));
    util.setJSONMap(jsonMap, 'custom_delivery_form_id', custom_delivery_table);
    util.setJSONMap(jsonMap, 'custom_delivery_row_id', custom_delivery_row_id);

    // Ori & Waylon will fix this
    //util.setJSONMap(jsonMap, 'assigned_code', entitlement_row.get('assigned_code'));
    util.setJSONMap(jsonMap, '_group_read_only', entitlement_row.get('_group_modify'));

    var user = odkCommon.getActiveUser();

    util.setJSONMap(jsonMap, '_row_owner', user);
    return new Promise(function(resolve, reject) {
        odkData.addRow(util.deliveryTable, jsonMap, util.genUUID(), resolve, reject);
    });
}


// returns true if clean up was necessary because it failed
//(action, dispatchStr, 'delivery', 'deliveryId', deliveryTableKey) params used for delivery call (to be implemented)
dataUtil.validateCustomTableEntry = function(action, dispatchStr, label, rootTableId, rootIdDispatchKey, customTableIdDispatchKey, logTag) {

    var result = action.jsonValue.result;

    odkCommon.log('I', logTag + "Finishing custom " + label);
    odkCommon.log('I', logTag +  "" + result);

    var rootRowId = dispatchStr[rootIdDispatchKey];
    if (rootRowId === null || rootRowId === undefined) {
        odkCommon.log('E', logTag + "Error: no root" + label + "id");
        return Promise.resolve(false);
    }

    if (result === null || result === undefined) {
        odkCommon.log('E', logTag + "Error: no result object on " + label);
        dataUtil.executeDeleteRowCleanup(rootRowId, label, rootTableId);
        // TODO change to generic function
        return Promise.resolve(false);
    }

    var customRowId = result.instanceId;
    if (customRowId === null || customRowId === undefined) {
        odkCommon.log('E', logTag + "Error: no instance ID on " + label);
        dataUtil.executeDeleteRowCleanup(rootRowId, label, rootTableId);
        return Promise.resolve(false);
    }

    odkCommon.log('I', dispatchStr);
    odkCommon.log('I', customTableIdDispatchKey);
    var customTableId = dispatchStr[customTableIdDispatchKey];
    if (customTableId === null || customTableId === undefined) {
        odkCommon.log('E', logTag + "Error: no " + label + " table name");
        dataUtil.executeDeleteRowCleanup(rootRowId, label, rootTableId);
        return Promise.resolve(false);
    }

    var savepointType = action.jsonValue.result.savepoint_type;

    if (savepointType === util.savepointSuccess) {
        odkCommon.log('I', logTag + label + " succeeded");
        //TODO: check to see if custom individual rows exist, because we will need to add in the root individual rows now

        var individualRowsPromise = new Promise( function(resolve, reject) {
            odkData.query(util.getIndividualCustomFormId(), 'custom_beneficiary_entity_row_id = ?', [customRowId],
                null, null, null, null, null, null, true, resolve, reject)
        });

        var rootBERowPromise = new Promise( function(resolve, reject) {
            odkData.query(util.beneficiaryEntityTable, '_id = ?', [rootRowId],
                null, null, null, null, null, null, true, resolve, reject)
        });
        console.log("about to execute two promises");
        var individualReturnPromise = Promise.all([individualRowsPromise, rootBERowPromise]).then( function(resultArr) {
            var customIndividualRows = resultArr[0];
            var rootBERow = resultArr[1];
            var addRowActions = [];
            console.log(customIndividualRows.getCount());
            for (var i = 0; i < customIndividualRows.getCount(); i++) {
                var jsonMap = {};
                util.setJSONMap(jsonMap, '_row_owner', odkCommon.getActiveUser());
                util.setJSONMap(jsonMap, 'beneficiary_entity_row_id', rootRowId);
                //util.setJSONMap(jsonMap, 'date_created', );
                util.setJSONMap(jsonMap, 'individual_id', rootBERow.get("beneficiary_entity_id"));
                util.setJSONMap(jsonMap, 'custom_individual_form_id', util.getIndividualCustomFormId());
                util.setJSONMap(jsonMap, 'custom_individual_row_id', customIndividualRows.getRowId(i));
                util.setJSONMap(jsonMap, 'status', 'ENABLED');

                addRowActions.push(new Promise( function(resolve, reject) {
                    odkData.addRow(util.individualTable, jsonMap, util.genUUID(), resolve, reject);
                }));
            }
            return Promise.all(addRowActions).then( function(result) {
                console.log("added base individual rows");
            });
        }).then( function(result) {
            return true;
        });
        individualReturnPromise.catch( function(error) {
            console.log(error);
        })
        return individualReturnPromise;
    } else {
        odkCommon.log('I', logTag + label + " is false; delete rows");
        var dbActions = [];
        dbActions.push(dataUtil.deleteRowPromise(rootTableId, rootRowId));
        dbActions.push(dataUtil.deleteRowPromise(customTableId, customRowId));

        return Promise.all(dbActions).then( function(resultArr) {
            odkCommon.log('I', logTag +  'Cleaned up invalid + ' + label + ' rows');
            return Promise.all(dbActions).then( function(resultArr) {
                odkCommon.log('I', logTag +  'Cleaned up invalid + ' + label + ' rows');

            });
        }).then( function(resultArr) {
            return false
        });
    }
}

// Convenience because we call this on any kind of error
dataUtil.executeDeleteRowCleanup = function(rowId, label, tableId) {
    dataUtil.deleteRowPromise(tableId, rowId).then( function(result) {
        odkCommon.log('I', LOG_TAG + 'Deleted root ' + label + ' row: ' + rowId);

        odkCommon.removeFirstQueuedAction();
    }).catch( function(reason) {
        odkCommon.log('E', LOG_TAG + 'Failed to delete root ' + label + ' row: ' + reason);

        odkCommon.removeFirstQueuedAction();
    });

}

dataUtil.deleteRowPromise = function(tableId, rowId) {
    console.log(tableId);
    console.log(rowId);
    return new Promise(function(resolve, reject) {
        odkData.deleteRow(tableId, null, rowId, resolve, reject);
    });
}

dataUtil.deleteRootDeliveryRow = function(delivery_id) {
    return new Promise(function(resolve, reject) {
        odkData.deleteRow(util.deliveryTable, null, delivery_id, resolve, reject);
    });
}

dataUtil.deleteCustomDeliveryRow = function(custom_delivery_id, custom_delivery_table) {
    return new Promise(function(resolve, reject) {
        odkData.deleteRow(custom_delivery_table, null, custom_delivery_id, resolve, reject);
    });
}

dataUtil.deleteRootBeneficiaryEntityRow = function(rowId) {
    return new Promise(function(resolve, reject) {
        odkData.deleteRow(util.beneficiaryEntityTable, null, rowId, resolve, reject);
    });
}

dataUtil.deleteCustomBeneficiaryEntityRow = function(custom_beneficiary_entity_id, custom_beneficiary_entity_table) {
    return new Promise(function(resolve, reject) {
        odkData.deleteRow(custom_beneficiary_entity_table, null, custom_beneficiary_entity_id, resolve, reject);
    });
}

dataUtil.entitlementIsDelivered = function(entitlement_id) {
    return new Promise(function(resolve, reject) {
        odkData.query(util.deliveryTable, 'entitlement_id = ?',
            [entitlement_id], null, null, null, null, null,
            null, true, resolve, reject);
    }).then(function(result) {
        if (result.getCount() == 0) {
            return false;
        } else {
            return true;
        }
    }).catch( function(reason) {
        odkCommon.log('E', 'Failed to check if entitlement is delivered: ' + reason);
        return false;
    });
}

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
            if (result.getRowIds().contains(originalEntitlementSet.getRowId(i))) {
                deliveredEntitlements.push(originalEntitlementSet.get(i));
            } else {
                deliveredEntitlements.push(originalEntitlementSet.get(i));
            }
        }
        return {"pending" : pendingEntitlements, "delivered" : deliveredEntitlements};
    });
}*/




