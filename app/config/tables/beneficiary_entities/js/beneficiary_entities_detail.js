/**
 * Render the registration detail page
 */

'use strict';

var beneficiaryEntityResultSet = {};
var type = util.getQueryParameter('type');
var locale = odkCommon.getPreferredLocale();
var toggleWorkflowButton = $('#toggle_workflow');
var entitlementSwitchButton = $('#entitlements_switch');

function display() {
    var displayPromise = new Promise( function(resolve, reject) {
        odkData.getViewData(resolve, reject);
    }).then( function(result) {
        beneficiaryEntityResultSet = result;
        $('#title').text(beneficiaryEntityResultSet.get('beneficiary_code'));
        $('#title').prepend(odkCommon.localizeText(locale, 'beneficiary_code') + ": ");

        //TODO: add translations entry for each column of all tables
        var exclusionList = ["beneficiary_entity_id"];
        util.populateDetailView(beneficiaryEntityResultSet, "field_list", locale, exclusionList);

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
                    odkData.updateRow(util.beneficiaryEntityTable, struct, beneficiaryEntityResultSet.getRowId(0),
                        resolve, reject);
                }).then( function(result) {
                    $("#followup").prop("disabled",true);
                    if (type == 'activate') {
                        $('#message').text('Successfully Enabled!');
                    } else {
                        $('#message').text('Successfully Disabled!');
                    }
                }).catch( function(reason) {
                    console.log('Update failure: ' + reason);
                });
            });
            action.show();

        } else if (beneficiaryEntityResultSet.get('status') === 'DISABLED') {
            $('#inner_reject').text(odkCommon.localizeText(locale, 'disabled_beneficiary_notification'));
        } else if (util.getRegistrationMode() === "INDIVIDUAL") {
            console.log("entered individual path");
            toggleWorkflowButton.hide();
            initEntitlementToggle();
            setToDeliveryView(false);
        } else if (util.getRegistrationMode() === "HOUSEHOLD") {
            console.log("entered household path");
            initEntitlementToggle();
            if (type === "registration") {
                console.log("type is registration");
                setToHouseholdView();
            } else if (type === "delivery") {
                console.log("type is delivery");
                setToDeliveryView(true);
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
function headCBSuccess(result) {
    $('#head_of_household').prepend("Head of Household: ");
    $('#head_id').prepend("Head of Household ID: ");
    $('#hh_size').prepend("Household Size: ");
    $('#caravan_code').prepend("Caravan Code: ");
    $('#inner_head_of_household').text(result.get('first_last_name'));
    $('#inner_head_id').text(result.get('id_number'));
    $('#inner_hh_size').text(beneficiaryEntityResultSet.get('hh_size'));
    $('#inner_caravan_code').text(beneficiaryEntityResultSet.get('tent_caravan'));
 }

function headCBFailure(error) {
    console.log('headCBFailure with error: ' + error);
}

function setToHouseholdView() {
    toggleWorkflowButton.find(".sr-only").text("Entitlements");
    console.log("found button. registering click");

    // TODO: CLICK NOT WORKING
    toggleWorkflowButton.click(function(e) {
        console.log("preventing default");
        e.preventDefault();
        console.log("setting to delivery view");
        setToDeliveryView(true);
    });
    setSublistToHousehold();
    entitlementSwitchButton.hide();
}

function setToDeliveryView(includeWorkflowButton) {
    //TODO: set sublist to pending entitlements
    if (includeWorkflowButton) {
        toggleWorkflowButton.find(".sr-only").text("Household");
        toggleWorkflowButton.click(function(e) {
            console.log("preventing default");
            e.preventDefault();
            console.log("setting to registration view");
            setToHouseholdView();
        });
    }

    if ($('#entitlements_pending').is(':checked')) {
        setSublistToPendingEntitlements();
    } else {
        setSublistToDeliveredEntitlements();
    }

    entitlementSwitchButton.show();
}

function setSublistToPendingEntitlements() {

    var groupModify = beneficiaryEntityResultSet.get('_group_modify');

    //TODO figure this out
    var joinQuery = 'SELECT * FROM ' + util.entitlementTable + ' JOIN ' + util.deliveryTable + ' ON ' + util.deliveryTable + '.entitlement_id = ' + util.entitlementTable + '._id';
    odkTables.setSubListView(util.entitlementTable,
        'beneficiary_entity_id = ? and (is_delivered = ? or is_delivered = ?)',
        [beneficiaryEntityResultSet.get('beneficiary_code'), showDelivered, showDeliveredCase],
        'config/tables/entitlements/html/entitlements_list.html?groupModify=' + encodeURIComponent(groupModify));
}

function setSublistToDeliveredEntitlements() {
    var groupModify = beneficiaryEntityResultSet.get('_group_modify');

}

function setSublistToHousehold() {
    odkTables.setSubListView(util.entitlementTable, 'beneficiary_entity_id = ?',
        [beneficiaryEntityResultSet.get('beneficiary_code')],
        'config/tables/' + util.individualTable + '/html/individuals_list.html');
}



