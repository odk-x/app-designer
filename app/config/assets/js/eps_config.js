'use strict';

$(document).ready(function() {
    var saveButton = $('#save');
    saveButton.on(
        'click',
        function() {
            save();
        }
    );

    populateChooseFormControl();
    init();
    
});

function populateChooseFormControl() {
    
    var successFn = function( result ) {
        var option = $("<option>");
        $("#choose_form").append(option);

        var tableIds = result.getAllTableIds();
        for (var row = 0; row < tableIds.length; row++) {
            option = $("<option>");
            option.val(tableIds[row]);
            option.text(result.getTableDisplayName(tableIds[row]));
            if(EpsConfig.getFormName() === tableIds[row]) {
                option.attr('selected','selected');
            }
            $("#choose_form").append(option);
        }
    }

    var failureFn = function( errorMsg) {
        console.log('Failed to get table ids');
    }

    odkData.getAllTableIds( successFn, failureFn);
}

function init() {
    if(EpsConfig.getShowCollectModule()===1) {
        $('#show_collect_module').prop('checked', true);
    } else {
        $('#show_collect_module').prop('checked', false);
    }

    if(EpsConfig.getShowSelectModule()===1) {
        $('#show_select_module').prop('checked', true);
    } else {
        $('#show_select_module').prop('checked', false);
    }

    if(EpsConfig.getShowNavigateModule()===1) {
        $('#show_navigate_module').prop('checked', true);
    } else {
        $('#show_navigate_module').prop('checked', false);
    }

    $('#good_gps_accuracy_thresholds').val(EpsConfig.getGoodGpsAccuracyThresholds());
    $('#moderate_gps_accuracy_thresholds').val(EpsConfig.getModerateGpsAccuracyThresholds());
    $('#main_points').val(EpsConfig.getMainPoints());
    $('#additional_points').val(EpsConfig.getAdditionalPoints());
    $('#alternate_points').val(EpsConfig.getAlternatePoints());
    $('#choose_form').val(EpsConfig.getFormName());
}

var successSave = function() {
    alert("Config saved successfully!");
}

var failedSave= function(errorMsg) {
    console.log(errorMsg);
    alert("Failed to save config.");
}

function save() {
    if($('#password').val() != undefined && $('#password').val() != null && $('#password').val().length > 0) {
        if($('#password').val() !== $('#re_password').val()) {
            alert("Sorry, passwords do not match.");
            return;
        } else {
            EpsConfig.password = $('#password').val();
        }
    }
    if($('#show_collect_module').prop('checked')) {
        EpsConfig.showCollectModule = 1;
    } else {
        EpsConfig.showCollectModule=0;
    }

    if($('#show_select_module').prop('checked')) {
        EpsConfig.showSelectModule = 1;
    } else {
        EpsConfig.showSelectModule = 0;
    }

    if($('#show_navigate_module').prop('checked')) {
        EpsConfig.showNavigateModule = 1;
    } else {
        EpsConfig.showNavigateModule = 0;
    }

    EpsConfig.goodGpsAccuracyThresholds = $('#good_gps_accuracy_thresholds').val();
    EpsConfig.moderateGpsAccuracyThresholds = $('#moderate_gps_accuracy_thresholds').val();
    EpsConfig.mainPoints = $('#main_points').val();
    EpsConfig.additionalPoints = $('#additional_points').val();
    EpsConfig.alternatePoints = $('#alternate_points').val();
    EpsConfig.formName = $('#choose_form').val();
    
    if(EpsConfig.getID().length > 0) {
        EpsConfig.updateConfig(successSave, failedSave);
    } else {
        EpsConfig.insertConfig(successSave, failedSave);
    }
}

