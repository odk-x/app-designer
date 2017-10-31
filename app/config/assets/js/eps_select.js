'use strict';

/**
 * Responsible for rendering the select module.
 */

var MAIN_POINT = 1000;
var ADDITIONAL_POINT = 100;
var ALTERNATE_POINT = 10;
var NOT_SELECTED = 0;

function display() {
    init();
    showShortInfo();
    $('#select').on( 'click',
        function() {
            EpsConfig.mainPoints = $.isNumeric($('#mainPoints').val()) ? parseInt($('#mainPoints').val()) : 0;
            EpsConfig.additionalPoints = $.isNumeric($('#additionalPoints').val()) ? parseInt($('#additionalPoints').val()) : 0;
            EpsConfig.alternatePoints = $.isNumeric($('#alternatePoints').val()) ? parseInt($('#alternatePoints').val()) : 0;
            var totalPointsToSelect = EpsConfig.mainPoints + EpsConfig.additionalPoints + EpsConfig.alternatePoints;
            if(totalPointsToSelect <=0 ) {
                alert("You must enter the number of sample points you want to select.");
            } else if(parseInt($("#num_valid").html()) <  totalPointsToSelect) {
                alert("You must enter a valid number of points to select.");
            } else {
                selectPoints();
            }
        }
    );
}

function init() {
    EpsConfig.mainPoints = $.isNumeric( EpsConfig.getMainPoints() ) ? parseInt(EpsConfig.getMainPoints()) : 0;
    EpsConfig.additionalPoints = $.isNumeric( EpsConfig.getAdditionalPoints() ) ? parseInt(EpsConfig.getAdditionalPoints()) : 0;
    EpsConfig.alternatePoints = $.isNumeric( EpsConfig.getAlternatePoints() ) ? parseInt(EpsConfig.getAlternatePoints()) : 0;

    $('#mainPoints').val(EpsConfig.mainPoints);
    $('#additionalPoints').val(EpsConfig.additionalPoints);
    $('#alternatePoints').val(EpsConfig.alternatePoints);

    var totalPointsToSelect = EpsConfig.mainPoints + EpsConfig.additionalPoints + EpsConfig.alternatePoints;
    if( totalPointsToSelect >0 ) {
        $("#mainPoints").attr('disabled', 'disabled');
        $("#additionalPoints").attr('disabled', 'disabled');
        $("#alternatePoints").attr('disabled', 'disabled');
    }
}

function showShortInfo() {

    var successFn = function( result ) {
        $("#num_total").html(result.getCount());
        var num_valid = 0;
        for(var row=0; row<result.getCount(); row++) {
            if(result.getData(row,"valid") === 1 && 
                result.getData(row,"exclude") === 0) {
                num_valid ++;
            } 
        } 
        $("#num_valid").html(num_valid);
    }

    var failureFn = function( errorMsg) {
        console.log('Failed to read census table');
    }

    odkData.arbitraryQuery('census', "select valid, exclude from census where place_name=?", 
        [localStorage.getItem("place_name_selected")], null, null, successFn, failureFn);
}

function selectPoints() {
    $('#pleaseWait').modal('show');
    async.waterfall([
        prepData,
        shufflePoints,
        generateRandomNumbers,
        sortDescUsingRandomValues,
        markSelected,
        saveResults
    ], function (error) {
        if (error) {
            console.log(error);
            $('#pleaseWait').modal('hide');
            alert("Failed to select points.");
        } else {
            $('#pleaseWait').modal('hide');
            alert("Points Selected Successfully!");
        }
    });
}

// This function will read data and assign random number for each valid points.
function prepData(callback) {
    var successFn = function( result ) {
        var dateSelected = new Date().toJSON().slice(0,10).replace(/-/g,'/');
        var data = [];
        for(var row=0; row<result.getCount(); row++) {
            var d={};
            d['_id'] = result.getData(row,"_id");
            d['valid']= result.getData(row,"valid");
            d['exclude']= result.getData(row,"exclude");
            d['random_number'] = 0;
            d['selected'] = NOT_SELECTED;
            d['sample_frame']= parseInt($("#num_valid").html());
            d['date_selected'] = dateSelected;
            data.push(d);
        } 
        callback(null, data);
    }

    var failureFn = function(errorMsg) {
        console.log(errorMsg);
        callback(errorMsg)
    }

    odkData.arbitraryQuery('census', "select _id, valid, exclude from census where place_name=?", 
        [localStorage.getItem("place_name_selected")], null, null, successFn, failureFn);
}

function shufflePoints (data, callback) {
    var i = 0, j = 0, temp = null;

    for (i = data.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = data[i];
        data[i] = data[j];
        data[j] = temp;
    }
    callback(null, data);
}

function generateRandomNumbers(data, callback) {
    for(var row=0; row < data.length; row++) {
        if(data[row].valid === 1 && data[row].exclude === 0) {
            data[row].random_number = Math.random();
        }  
    }
    callback(null, data);
}

function sortDescUsingRandomValues(data, callback) {
    data.sort(function(point1, point2) {
        return point2.random_number - point1.random_number;
    });
    callback(null, data);
}

function markSelected(data, callback) {
    var totalPointsToSelect = EpsConfig.mainPoints + EpsConfig.additionalPoints + EpsConfig.alternatePoints;
    for(var row=0; row<totalPointsToSelect; row++) {
        if(row< EpsConfig.mainPoints) {
            data[row].selected = MAIN_POINT;
        } else if(row>= EpsConfig.mainPoints && row< (EpsConfig.mainPoints + EpsConfig.additionalPoints)) {
            data[row].selected = ADDITIONAL_POINT;
        } else {
            data[row].selected = ALTERNATE_POINT;
        }
    }
    callback(null, data);
}

function saveResults(data, callback) {
    var row = 0;
    var successFn = function( result ) {
        row++;
        if(row < data.length) {
            var id = data[row]._id;
            delete data[row]._id;
            odkData.updateRow('census', data[row], id, successFn, failureFn);
        } else {
            callback(null, data);
        }
    }

    var failureFn = function( errorMsg) {
        console.log(errorMsg);
        callback(errorMsg);
    }

    var id = data[row]._id;
    delete data[row]._id;
    odkData.updateRow('census', data[row], id, successFn, failureFn);
}

$(document).ready(function() {
    display();
});
