/**
 * Render the registration detail page
 */

'use strict';

var customBeneficiaryEntityResultSet = {};
var type = util.getQueryParameter('type');
var rootRowId = util.getQueryParameter('rootRowId');
var locale = odkCommon.getPreferredLocale();

function display() {
    var displayPromise = new Promise( function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    }).then( function(result) {
        customBeneficiaryEntityResultSet = result;


        //TODO: add translations entry for each column of all tables
        var exclusionList = [];
        util.populateDetailView(customBeneficiaryEntityResultSet, "field_list", locale, exclusionList);
        return new Promise(function (resolve, reject) {
            odkData.query(util.beneficiaryEntityTable, '_id = ?', [rootRowId],
                null, null, null, null, null, null, true, resolve, reject);
        });
    }).then( function(result) {
        $('#title').text(odkCommon.localizeText(locale, 'beneficiary_entity_id') + ": " + result.get('beneficiary_entity_id'));
        util.populateDetailView(result, "field_list", locale, ["beneficiary_entity_id"]);
        if (type == 'enable' || type == 'disable') {
            var action = $('#followup');
            if (type == 'enable') {
                action.text(odkCommon.localizeText(locale, "enable_beneficiary"));
            } else {
                action.text(odkCommon.localizeText(locale, "disable_beneficiary"));
            }
            action.on('click', function() {
                var struct = {};
                if (type == 'enable') {
                    struct.status = 'ENABLED';
                } else {
                    struct.status = 'DISABLED';
                }
                new Promise( function(resolve, reject) {
                    odkData.updateRow(util.beneficiaryEntityTable, struct, rootRowId,
                        resolve, reject);
                }).then( function(result) {
                    $("#followup").prop("disabled",true);
                    if (type == 'enable') {
                        $('#message').text('Successfully Enabled!');
                    } else {
                        $('#message').text('Successfully Disabled!');
                    }
                }).catch( function(reason) {
                    console.log('Update failure: ' + reason);
                });
            });
            action.show();

        } else if (result.get('status') === 'DISABLED') {

        } else if (util.getRegistrationMode() === "INDIVIDUAL") {
            if (result.get('status') === 'DISABLED') {
                // do nothing, this should be called as a detail view without sublist
            } else {
                console.log("entered individual path");
                $('#toggle_workflow').hide();
                initEntitlementToggle();
                setToDeliveryView(false);
            }
        } else if (util.getRegistrationMode() === "HOUSEHOLD") {
            if (result.get('status') === 'DISABLED') {
                $('#toggle_workflow').hide();
                setToHouseholdView();
            } else {
                console.log("entered household path");
                initEntitlementToggle();
                if (type === "registration") {
                    setToHouseholdView();
                } else if (type === "delivery") {
                    setToDeliveryView(true);
                }
            }
        }
    });

    displayPromise.catch( function(reason) {
        console.log('getViewData failed with message: ' + reason);
    });
    return displayPromise;
}

function initEntitlementToggle() {
    $('#entitlements_title').text('Entitlements Listed'); // TODO: localize this

    $('#pending_txt').text('Pending'); // TODO: Localize this
    $('#entitlements_pending').click(function() {
        setSublistToPendingEntitlements();
    });

    $('#delivered_txt').text('Delivered'); // TODO: Localize this
    $('#entitlements_delivered').click(function() {
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
    $('#entitlements_switch').hide();
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
    $('#entitlements_switch').show();
    if ($('#entitlements_pending').is(':checked')) {
        setSublistToPendingEntitlements();
    } else {
        setSublistToDeliveredEntitlements();
    }
}

function setSublistToPendingEntitlements() {
    console.log("setting to pending");

    var groupModify = customBeneficiaryEntityResultSet.get('_group_modify');

    //TODO figure this out
    var joinQuery = 'SELECT * FROM ' + util.entitlementTable + ' JOIN ' + util.deliveryTable + ' ON ' + util.deliveryTable + '.entitlement_id = ' + util.entitlementTable + '._id';
}

function setSublistToDeliveredEntitlements() {
    console.log("setting to delivered");

    var groupModify = customBeneficiaryEntityResultSet.get('_group_modify');

}

function setSublistToHousehold() {
    console.log("setting to household");
    odkTables.setSubListView(util.individualTable, 'beneficiary_entity_row_id = ?',
        [rootRowId],
        'config/tables/' + util.individualTable + '/html/individuals_list.html');
}



