/**
 * Render the registration detail page
 */

'use strict';


var locale = odkCommon.getPreferredLocale();
var beneficiaryEntitiesResultSet;
var beneficiaryEntityId;
var type;

function display() {

    type = util.getQueryParameter('type');
    if (type === 'unregistered_voucher') {
        // If we have an unregistered voucher, there is no view data to show
        beneficiaryEntityId = util.getQueryParameter('beneficiary_entity_id');
        $('#title').text(odkCommon.localizeText(locale, 'beneficiary_entity_id') + ": " + beneficiaryEntityId);
        $('#toggle_workflow').hide();
        initEntitlementToggle();
        setToDeliveryView(true);

        return Promise.resolve(null);
    }

    var displayPromise = new Promise( function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    }).then( function(result) {
        beneficiaryEntitiesResultSet = result;
        beneficiaryEntityId = beneficiaryEntitiesResultSet.get('beneficiary_entity_id');
        $('#title').text(odkCommon.localizeText(locale, 'beneficiary_entity_id') + ": " + beneficiaryEntityId);
        let exclusionList = ['beneficiary_entity_id'];
        if (type === 'override_beneficiary_entity_status') {
            $('#toggle_workflow').hide();
            initBeneficiaryStatusToggle(beneficiaryEntitiesResultSet.getData(0, "status"));
            exclusionList.push('status');
        }  else if (type === 'override_ent_status') {
            $('#toggle_workflow').hide();
            setSublistToAllPendingEntitlements('change_status');


        } else if (util.getRegistrationMode() === "INDIVIDUAL") {
            if (beneficiaryEntitiesResultSet.get('status') === 'DISABLED') {
                // do nothing, this should be called as a detail view without sublist
            } else {
                console.log("entered individual path");
                $('#toggle_workflow').hide();
                initEntitlementToggle();
                setToDeliveryView(false);
            }
        } else if (util.getRegistrationMode() === "HOUSEHOLD") {
            if (beneficiaryEntitiesResultSet.get('status') === 'DISABLED') {
                $('#toggle_workflow').hide();
                setToHouseholdView();
            } else {
                initEntitlementToggle();
                if (type === "registration") {
                    setToHouseholdView();
                } else if (type === "delivery") {
                    setToDeliveryView(true);
                }
            }
        }
        util.populateDetailView(beneficiaryEntitiesResultSet, "field_list", locale, exclusionList);

        if (util.getRegistrationMode() === 'HOUSEHOLD') {
            return new Promise( function(resolve, reject) {
                odkData.query(util.getBeneficiaryEntityCustomFormId(), "_id = ?", [beneficiaryEntitiesResultSet.getData(0, 'custom_beneficiary_entity_row_id')],
                    null, null,null, null, null, null, true, resolve, reject);
            }).then( function(result) {
                var customExclusionList = ['consent_signature', 'location_accuracy',
                    'location_altitude', 'location_latitude', 'location_longitude',
                    'consent_signature_contentType', 'consent_signature_uriFragment'];
                util.populateDetailView(result, "field_list", locale, customExclusionList);
            });
        } else {
            return Promise.resolve(null);
        }
    });

    displayPromise.catch( function(reason) {
        console.log('getViewData failed with message: ' + reason);
    });
    return displayPromise;
}

 function initBeneficiaryStatusToggle(status) {
     $('#switch-title-id').text('Beneficiary Entity Status'); // TODO: localize this

     if (status === 'ENABLED') {
         $('#left').prop('checked', true);
     } else {
         $('#right').prop('checked', true);
     }

     $('#left_txt').text('Enabled'); // TODO: Localize this
     $('#left').click(function() {
        changeStatusPromise('ENABLED');
     });

     $('#right_txt').text('Disabled'); // TODO: Localize this
     $('#right').click(function() {
         changeStatusPromise('DISABLED');
     });

     $('#switch-id').show();
 }

 function changeStatusPromise(status) {
     return new Promise( function(resolve, reject) {
         odkData.updateRow(util.beneficiaryEntityTable, {'status' : status}, beneficiaryEntitiesResultSet.getData(0, "_id"),
             resolve, reject);
     }).then( function(result) {
         console.log('Update success: ' + result);
     }).catch( function(reason) {
         console.log('Update failure: ' + reason);
     });
 }


function initEntitlementToggle() {
    $('#switch-title-id').text('Entitlements Listed'); // TODO: localize this

    $('#left_txt').text('Pending'); // TODO: Localize this
    $('#left').prop('checked', true);
    $('#left').click(function() {
        setSublistToEnabledPendingEntitlements('deliver');
    });

    $('#right_txt').text('Delivered'); // TODO: Localize this
    $('#right').click(function() {
        setSublistToDeliveredEntitlements();
    });
}

// TODO: abstract a default individual foreign key value to populate the registration detail view with

function setToHouseholdView() {
    var toggleWorkflowButton = $('#toggle_workflow');
    toggleWorkflowButton.find(".sr-only").text("Entitlements");

    toggleWorkflowButton.off('click').on('click', function(e) {
        e.preventDefault();
        console.log("setting to delivery view");
        setToDeliveryView(true);
    });
    $('#switch-id').hide();
    setSublistToHousehold();
}

function setToDeliveryView(includeWorkflowButton) {
    if (includeWorkflowButton) {
        var toggleWorkflowButton = $('#toggle_workflow');
        toggleWorkflowButton.find(".sr-only").text("Household");
        toggleWorkflowButton.off('click').on('click', function(e) {
            console.log("preventing default");
            e.preventDefault();
            console.log("setting to registration view");
            setToHouseholdView();
        });
    }
    $('#switch-id').show();
    if ($('#left').is(':checked')) {
        setSublistToEnabledPendingEntitlements('deliver');
    } else {
        setSublistToDeliveredEntitlements();
    }
}

//TODO: join on authorization table so that we do not allow a delivery to an authorization that doesn't exist

function setSublistToEnabledPendingEntitlements(action) {
    console.log("setting to pending");

    var joinQuery = 'SELECT * FROM ' + util.entitlementTable + ' ent LEFT JOIN ' +  util.deliveryTable +
        ' del ON del.entitlement_id = ent._id INNER JOIN '  + util.authorizationTable + ' auth ON ent.authorization_id = auth._id' +
        ' WHERE del._id IS NULL AND ent.beneficiary_entity_id = ? AND ent.status = ?';

    odkTables.setSubListViewArbitraryQuery(util.entitlementTable, joinQuery, [beneficiaryEntityId, 'ENABLED'],
        'config/tables/' + util.entitlementTable + '/html/' + util.entitlementTable + '_list.html?action=' + encodeURIComponent(action));
}

function setSublistToAllPendingEntitlements(action) {
    console.log("setting to pending");

    var joinQuery = 'SELECT * FROM ' + util.entitlementTable + ' ent LEFT JOIN ' +  util.deliveryTable +
        ' del ON del.entitlement_id = ent._id INNER JOIN '  + util.authorizationTable + ' auth ON ent.authorization_id = auth._id' +
        ' WHERE del._id IS NULL AND ent.beneficiary_entity_id = ?';

    odkTables.setSubListViewArbitraryQuery(util.entitlementTable, joinQuery, [beneficiaryEntityId],
        'config/tables/' + util.entitlementTable + '/html/' + util.entitlementTable + '_list.html?action=' + encodeURIComponent(action));
}

function setSublistToDeliveredEntitlements() {
    console.log("setting to delivered");

    var joinQuery = 'SELECT * FROM ' + util.entitlementTable + ' ent INNER JOIN ' + util.deliveryTable + ' t2 ON t2.entitlement_id = ent._id' +
        ' WHERE ent.beneficiary_entity_id = ?';

    odkTables.setSubListViewArbitraryQuery(util.entitlementTable, joinQuery, [beneficiaryEntityId],
        'config/tables/' + util.entitlementTable + '/html/' + util.entitlementTable + '_list.html?action=' + encodeURIComponent('detail'));

}

function setSublistToHousehold() {
    console.log("setting to household");
    odkTables.setSubListView(util.individualTable, 'beneficiary_entity_row_id = ?',
        [beneficiaryEntitiesResultSet.getRowId(0)],
        'config/tables/' + util.individualTable + '/html/' + util.individualTable +'_list.html');
}



