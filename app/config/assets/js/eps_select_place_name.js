'use strict';
/* global $, odkTables */
/* exported display */

/**
 * Responsible for rendering the home screen.
 */
var place_types = new Array();

//to display the places selected in the main menu hierarchically
var places_selected = {};
var LOGIN_DIALOG_KEY = "Dialog_Key";

function display() {
    loadConfig();
    var settingsButton = $('#settings');
    settingsButton.on(
        'click',
        function() {
            // if a setting is imported from csv, empty passwords are records as 'null'
            if(EpsConfig.getPassword() !== 'null' && EpsConfig.getPassword().length !== 0) {
                odkCommon.setSessionVariable(LOGIN_DIALOG_KEY, "yes");
                $("#loginModal").modal();
            } else {
                odkTables.launchHTML(null, 'config/assets/eps_config.html');
            }
        }
    );

    var loginButton = $('#login');
    loginButton.on(
        'click',
        function() {
            if(EpsConfig.getPassword() === sha256($('#password').val())) {
                $("#loginModal").modal('toggle');
                odkTables.launchHTML(null, 'config/assets/eps_config.html');
            } else {
                $('#msg').show();
            }
        }
    );

    getPlaceTypes();

    $('#loginModal').on('hide.bs.modal', function(e) {
        odkCommon.setSessionVariable(LOGIN_DIALOG_KEY, "no");
    });

    //maintain login dialog visibility during screen rotation
    var loginDialogShowing = odkCommon.getSessionVariable(LOGIN_DIALOG_KEY);
    if(loginDialogShowing !== null && loginDialogShowing !== undefined 
        && loginDialogShowing === "yes") {
        $("#loginModal").modal();
    }
}

function loadConfig() {
    EpsConfig.init(null, null);
}

function getPlaceTypes() {
    var successFn = function( result ) {
        for (var row = 0; row < result.getCount(); row++) {
            place_types.push(result.getData(row,"type"));
            places_selected[result.getData(row,"type")]="";
        }
        //if there are place names in the "place_name" table then create the controls
        if(result.getCount()) {
            for(var i=0; i<place_types.length; i++) {
                createHierarchy(i, place_types[i],i===0);
            }

            createSelectButton();
            populateFirstControl(place_types[0]);
        }
    }

    var failureFn = function( errorMsg) {
        console.log('Failed to read place_name table');
    }

    odkData.arbitraryQuery('place_name', "select distinct type from place_name", 
        null, null, null, successFn, failureFn);
}

function createHierarchy(level,labelName, visible) {

    var div = $('<div>');
    div.attr( {'id':'parent_'+level, class:'form-group'});

    var label = $('<label>');
    label.attr({
        'for':'pn_'+level,
        'class':'control-label'
    });

    label.text(labelName);

    var s = $('<select />');
    s.attr({
        'id':'pn_'+level,
        'class':'form-control selectpicker',
        'data-id':level
    });

    s.on('change', function() {
        var selected_control_level = parseInt(this.dataset.id) ;
        if(selected_control_level + 1 === place_types.length ) {
            $('#select_button').show();
        } else {
            controlVisibility(place_types[selected_control_level + 1], this.value, selected_control_level);
        }
        // this will save what is selected for each place types
        // e.g. places_selected['Region'] = 'Dre Dawa'
        places_selected[place_types[selected_control_level]]=this.options[this.selectedIndex].text;
        
        //put the selected value in the session variable to restore it during screen rotation
        odkCommon.setSessionVariable(this.id, this.value);
    });

    div.append(label);
    div.append(s);
    $('#place_name').append(div);
    if(visible == false) {
        div.hide();
    }
}

function createSelectButton() {
    var selectButton = $('<button>');
    var div = $('<div>');
    div.attr( {'id':'select_button', class:'round_background'});
    div.hide();
    
    selectButton.attr({
        'class':'btn btn-primary btn-block',
    });
    selectButton.text('Select');
    
    selectButton.on('click', function () {
        var last_combo = '#pn_' + (place_types.length -1);

        localStorage.setItem("place_name_selected", $(last_combo).val());
        localStorage.setItem("places_selected", JSON.stringify(places_selected));

        odkTables.launchHTML(null, 'config/assets/eps_main_menu.html');
    });
    div.append(selectButton)    
    $('#place_name').append(div);
}

function populateFirstControl(type) {
    
    var successFn = function( result ) {

        var option = $("<option>");
        option.val("");
        option.text("");
        $("#pn_0").append(option);

        for (var row = 0; row < result.getCount(); row++) {
            var option = $("<option>");
            option.val(result.getData(row,"code"));
            option.text(result.getData(row,"name"));
            $("#pn_0").append(option);
        }
        //check if this control has a value in the session variable, if so
        //restore it's value
        restoreValue('pn_0');
    }

    var failureFn = function( errorMsg) {
        console.log('Failed to read place_name table');
    }

    odkData.query('place_name', 'type=?', [type], null, null,
            null, null, null, null, null, successFn,
            failureFn);
}

function controlVisibility(type, filter, selected_control_index) {
    var next_combo_id = "#pn_" + (selected_control_index + 1);
    var parent_div = "#parent_" + (selected_control_index + 1);

    var successFn = function( result ) {
        var option = $("<option>");
        option.val("");
        option.text("");
        $(next_combo_id).append(option);

        for (var row = 0; row < result.getCount(); row++) {
            var option = $("<option>");
            option.val(result.getData(row,"code"));
            option.text(result.getData(row,"name"));
            $(next_combo_id).append(option);
        }
        $(parent_div).show();
        //check if this control has a value in the session variable, if so
        //restore it's value
        restoreValue($(next_combo_id).attr('id'));
    }

    var failureFn = function( errorMsg) {
        console.log('Failed to read place_name table');
    }

    clearControls(selected_control_index);
    if(filter.length != 0) {
        odkData.query('place_name', 'type=? and filter=?', [type, filter], null, null,
            null, null, null, null, null, successFn,
            failureFn);
    }
}

function restoreValue(id) {
    var val = odkCommon.getSessionVariable(id);
    if(val !== null && val !== undefined && val.length !==0) {
        $('#'+id).val(val).change();
    }
}

function clearControls(selected_control_index) {

    for (var i=selected_control_index + 1; i<place_types.length; i++) {
        var next_combo_id = "#pn_" + i;
        var parent_div = "#parent_" + i;
        $(next_combo_id).empty();
        $(parent_div).hide();
        $('#select_button').hide();
    }
}

$(document).ready(function() {
    display();

});
