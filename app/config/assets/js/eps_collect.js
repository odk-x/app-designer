'use strict';
/* global $, odkTables */
/* exported display */

var collectButton = $('#collect');
var latitude = 0;
var longitude = 0;
var altitude = 0;
var accuracy = 0;
var watchID=null;

var geolocationSuccess = function(position) {
    if(position && position.coords) {
        showLocationFound(position.coords);
    }
}

var geolocationError = function(error) {
    console.log(error)
    if(error.code == 1) {
        locationProvidersDisabled();
    } else {
        $('#gps_accuracy_spinner').addClass('red_spinner');
    }
}

function showLocationFound(coords) {
    latitude = coords.latitude;
    longitude = coords.longitude;
    altitude = coords.altitude;
    accuracy = Math.floor(coords.accuracy);

    $('#gps_accuracy_spinner').removeClass('green_spinner')
                      .removeClass('orange_spinner')
                      .removeClass('red_spinner')
                      .removeClass('black_spinner');

    if(accuracy >0 && accuracy<=EpsConfig.getGoodGpsAccuracyThresholds()) {
        $('#gps_accuracy_spinner').addClass('green_spinner');
    } else if(accuracy >EpsConfig.getGoodGpsAccuracyThresholds() && accuracy<=EpsConfig.getModerateGpsAccuracyThresholds()) {
        $('#gps_accuracy_spinner').addClass('orange_spinner');
    } else { 
        $('#gps_accuracy_spinner').addClass('red_spinner');
    }

    $('#gps_accuracy_number').text(accuracy+'m');
}

function locationProvidersDisabled() {
    latitude = null;
    longitude = null;
    altitude = null;
    accuracy = null;
    $('#gps_accuracy_spinner').removeClass('green_spinner')
                      .removeClass('orange_spinner')
                      .removeClass('red_spinner')
                      .removeClass('black_spinner');

    $('#gps_accuracy_spinner').addClass('black_spinner');
    $('#gps_accuracy_number').text('0m');
} 
            
function setupLocation(){
    if(navigator.geolocation){
       getLocation();
    } else{
       locationProvidersDisabled();
    }
}

function getLocation() {
    // timeout at 60000 milliseconds (60 seconds)
    var options = {timeout:60000};
    options.maximumAge = 0; // Force current locations only
    options.enableHighAccuracy = true;
    options.desiredAccuracy=1000;
    watchID = navigator.geolocation.watchPosition(geolocationSuccess, geolocationError, options);
}

Backbone.Model.prototype.idAttribute = '_id';

//Backbone Model

var Census = Backbone.Model.extend({
    defaults: {
        place_name: localStorage.getItem("place_name_selected"),
        house_number: '',
        head_name: '',
        comment: '',
        exclude: '',
        valid:'',
        sample_frame: 0,
        data_selected:'',
        random_number: 0,
        selected: 0,
        location_accuracy: '',
        location_altitude: '',
        location_latitude: '',
        location_longitude: '',
        questionnaire_status: ''
    }
});

//Backbone Collection

var Censuses = Backbone.Collection.extend({
    url: '',
    parse : function( response ){
        this.trigger("collection:updated", { 
            count : response.count, 
            total : response.total, 
            startAt : response.startAt } );
        return response.records;
    }
});

var censuses = new Censuses();


Backbone.sync = function(method, model, options) {
    if (method === "read") {
        syncRead(method, model, options);
    } else if(method === "update") {
        syncUpdate(method, model, options);
    } else if(method === "create"){
        syncCreate(method, model, options);
    }
};

function syncRead(method,  model, options) {
    var total = 0;

    var successFnData = function( result ) {
        var records = [];
        for (var row = 0; row < result.getCount(); row++) {
            var census = {};
            census['_id']= result.getData(row,"_id");
            census['place_name']= result.getData(row, "place_name");
            census['house_number']= result.getData(row,"house_number");
            census['head_name']= result.getData(row,"head_name");
            census['comment']= result.getData(row,"comment");
            census['exclude']=result.getData(row,"exclude");
            census['valid']=result.getData(row,"valid");
            census['sample_frame']=result.getData(row,"sample_frame");
            census['date_selected']=result.getData(row,"date_selected");
            census['random_number']= result.getData(row,"random_number");
            census['selected']= result.getData(row,"selected");
            census['location_accuracy']= result.getData(row,"location_accuracy");
            census['location_altitude']= result.getData(row,"location_altitude");
            census['location_latitude']= result.getData(row,"location_latitude");
            census['location_longitude']= result.getData(row,"location_longitude");
            census['questionnaire_status']= result.getData(row,"questionnaire_status");
            records.push(census);
        }

        var data = {
            'count' : options.data.count,
            'total' : total,
            'startAt' : options.data.startAt,
            'records':records
        }

        if(options.async === false) {
            options.success(data, 'success', null);
        } else {
            // simulate a normal async network call
            setTimeout(function(){
                options.success(data, 'success', null);
            }, 0);
        } 
    }

    var failureFn = function( errorMsg) {
        console.log(errorMsg);
        if(options.async === false) {
            options.error(null, 'Failed', null);
        } else {
            // simulate a normal async network call
            setTimeout(function(){
                options.error(null, 'Failed', null);
            }, 0);
        } 
    }

    var successFnCount = function( result ) {
        if (result.getCount()>0) {
            total = parseInt(result.getData(0,"total"));
            odkData.query('census', 'place_name=?', [localStorage.getItem("place_name_selected")], null, null,
                '_savepoint_timestamp', 'DESC', options.data.count, options.data.startAt, null, successFnData, failureFn);
        }
    }

    odkData.arbitraryQuery('census', 'SELECT count(_id) AS total FROM census WHERE place_name=?', [localStorage.getItem("place_name_selected")], null, null, successFnCount, failureFn);
}

function syncUpdate(method,  model, options) {
    var data = {};
    data['place_name']= model.attributes.place_name;
    data['house_number']= model.attributes.house_number;
    data['head_name']= model.attributes.head_name;
    data['comment']= model.attributes.comment;
    data['exclude']= model.attributes.exclude;
    
    if($('#replace_gps').prop('checked')) {
        data['valid']= model.attributes.valid;
        data['location_accuracy']= model.attributes.location_accuracy;
        data['location_altitude']= model.attributes.location_altitude;
        data['location_latitude']= model.attributes.location_latitude;
        data['location_longitude']= model.attributes.location_longitude;
    }
           
    var successFnUpdate = function( result ) {
        if(options.async === false) {
            options.success(null, 'success', null);
        } else {
            // simulate a normal async network call
            setTimeout(function(){
                options.success(null, 'success', null);
            }, 0);
        } 
    }

    var failureFnUpdate = function( errorMsg) {
        console.log(errorMsg);
        if(options.async === false) {
            options.error(null, 'Failed', null);
        } else {
            // simulate a normal async network call
            setTimeout(function(){
                options.error(null, 'Failed', null);
            }, 0);
        } 
    }

    odkData.updateRow('census', data, model.attributes._id, successFnUpdate, 
        failureFnUpdate);
}

function syncCreate(method,  model, options) {
    var data = {};
    data['place_name']= model.attributes.place_name;
    data['house_number']= model.attributes.house_number;
    data['head_name']= model.attributes.head_name;
    data['comment']= model.attributes.comment;
    data['exclude']= model.attributes.exclude;
    data['selected']= model.attributes.selected;
    data['sample_frame']= model.attributes.sample_frame;
    data['random_number']= model.attributes.random_number;
    data['valid']= model.attributes.valid;
    data['location_accuracy']= model.attributes.location_accuracy;
    data['location_altitude']= model.attributes.location_altitude;
    data['location_latitude']= model.attributes.location_latitude;
    data['location_longitude']= model.attributes.location_longitude;
           
    var successFnCreate = function( result ) {
        if(options.async === false) {
            options.success(null, 'success', null);
        } else {
            // simulate a normal async network call
            setTimeout(function(){
                options.success(null, 'success', null);
            }, 0);
        } 
    }

    var failureFnCreate = function( errorMsg) {
        console.log(errorMsg);
        if(options.async === false) {
            options.error(null, 'Failed', null);
        } else {
            // simulate a normal async network call
            setTimeout(function(){
                options.error(null, 'Failed', null);
            }, 0);
        } 
    }

    odkData.addRow('census', data, util.genUUID(), successFnCreate, 
        failureFnCreate);
}

var rowBeingUpdated=null;
//Backbone View for one census
var CensusView = Backbone.View.extend({
    model: new Census(),
    tagName: 'tr',
    initialize: function() {
        this.template = _.template($('.census-list-template').html());
    },
    events: {
        'click .edit-census': 'edit'
        /*'click #update-census': 'update',
        'click #cancel': 'cancel'*/
    },
    edit: function() {
        rowBeingUpdated = this;
        $('.edit-census').hide();
        $('#save').hide();
        $('#update-census').show();
        $('#cancel').show();
        $('#replace_gps_div').show();
        
        $('#headName').val(this.$(".head_name").html());
        $('#houseNum').val(this.$(".house_number").html());
        $('#comment').val(this.$(".comment").val());
        
        if(this.$(".exclude").val() === "1") {
            $('#exclude').prop('checked', true);
        } else {
            $('#exclude').prop('checked', false);
        }

        $('#replace_gps').prop('checked', false);
        $(window).scrollTop(0);
    },
    update: function() {
        if (validateData($('#replace_gps').prop('checked'))) {
            this.model.set('house_number', $('#houseNum').val());
            this.model.set('head_name', $('#headName').val());
            this.model.set('comment', $('#comment').val());
            var exclude = $('#exclude').prop('checked') === true ? 1 : 0;
            this.model.set('exclude', exclude);
            
            if($('#replace_gps').prop('checked')) {
                var valid = ((accuracy > 0 && accuracy <= EpsConfig.getGoodGpsAccuracyThresholds()) ? 1:0);
                this.model.set('valid', valid);
                this.model.set('location_accuracy', accuracy);
                this.model.set('location_altitude', altitude);
                this.model.set('location_latitude', latitude);
                this.model.set('location_longitude', longitude);
            } 
            
            // in addition to making changes to our model, this method send a PUT request to our server.
            this.model.save(null, {
                success: function(response) {
                    console.log('Successfully UPDATED census with _id: ' + response.toJSON()._id);
                    alert("Census updated.");
                    prepScreenForNewCensus();
                },
                error: function(response) {
                    console.log('Failed to update census!');
                    alert("Unable to update census.");
                    prepScreenForNewCensus();
                }
            });
        }
    },
    cancel: function() {
        censusesView.render();
        prepScreenForNewCensus();
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        // mark each record as either valid, invalid or excluded
        if(this.model.attributes.exclude ===1) {
            this.$('.badge').html('E');
        } else if(this.model.attributes.valid ===1) {
            this.$('.badge').html('V');
        } else {
            this.$('.badge').html('I');
        }
        return this;
    }
});

function prepScreenForNewCensus() {
    refreshScreenAfterCancel();
    clearControlValues();
    lastPlusOne();
}

function refreshScreenAfterUpdate() {
    $('.edit-census').show();
    $('#save').show();
    $('#update-census').hide();
    $('#cancel').hide();
    $('#replace_gps_div').hide();
    $('#exclude').prop('checked', false);
    $('#replace_gps').prop('checked', false);
}

function refreshScreenAfterCancel() {
    $('#save').show();
    $('#update-census').hide();
    $('#cancel').hide();
    $('#replace_gps_div').hide();
    $('#exclude').prop('checked', false);
    $('#replace_gps').prop('checked', false);
}

// The pagination object holds information about the current 
// state of the page.
var pagination = {
    items_per_page : 5, // how many items per page
    current_page : 1, // page to start at, first page is 1, not 0
    display_max: 2, // max number of pages to show in the pagination element
    total: 0
}

function updatePagination( details ) {
    // Calculate pagination attributes
    var start = details.startAt + 1,
        end = details.startAt + details.count,
        total_pages = Math.ceil( details.total / pagination.items_per_page ),
        current_page = details.startAt / details.count + 1;
    
    //track the number of total census in the database for pagination
    pagination.total = details.total;
    // Display a "Page 1 of 5" type message on the page
    $(".pagination-info").text("Records " + start + " - " + Math.min(details.total, end) + " of " + details.total );
 
    // Remove the pagination binding so they don't get called
    // multiple times after they're redrawn.
    $(".pagination-boxes").unbind();
 
    // Redraw the jquery pagination boxes
    $(".pagination-boxes").pagination({
          total_pages: total_pages,
          display_max: pagination.display_max,
          current_page: current_page,
          callback: function(event, page) {
            if ( page ){
                //if the pagination buttons are clicked, then load data from the database
                pagination.current_page = page;
                readCensusFromDb();
            }
        }
    }); 
}

//fetch data from ODK database.
function readCensusFromDb() {
    var data = {
        startAt : ( pagination.current_page - 1) *  pagination.items_per_page,
        count : pagination.items_per_page 
    };

    censuses.fetch({
        data : data,
        success : function(response) {
            /*_.each(response.toJSON(), function(item) {
                console.log('Successfully GOT census with _id: ' + item._id);
            });*/
        }, 
        error: function() {
            console.log("Failed to get census!");
        }
    });
}

//Backbone View for all censuses
// The model for this view will be the collection i created above in this file
// The el is the tbody I created in the index.html
// When ever a new census is added to the model i.e. the collection, render function of this view gets executed
var CensusesView = Backbone.View.extend({
    model:censuses,
    el:$('.census-list'),
    initialize: function() {
        var self = this;
        this.model.on('add', this.render, this);
        this.model.on('change', function() {
            setTimeout(function() {
                self.render();
            }, 30);
        }, this);
        this.model.on('remove', this.render, this);
    },
    render: function() {
        var self = this;
        var valid=0, invalid =0, exclude=0;
        this.$el.html('');// clear the el
        _.each(this.model.toArray(), function(census) {
            self.$el.append((new CensusView({model: census})).render().el);
        });
        getNumOfValidCensus();
        getNumOfInvalidCensus();
        getNumOfExcludedCensus();
        
        return this;
    }
});

var censusesView = new CensusesView();

function validateData(checkGPS) {
    if($('#houseNum').val().trim().length === 0) {
        alert('Error: Missing required field [House Number]. Data is not saved.');
        return false;
    } else if($('#headName').val().trim().length === 0){
        alert('Error: Missing required field [Head Name]. Data is not saved.');
        return false;
    } else if(checkGPS===true && (accuracy===0 || accuracy > EpsConfig.getGoodGpsAccuracyThresholds())) {
        if(confirm("Data from GPS is not valid. Continue saving? Accuracy " + accuracy + " m.")) {
            return true;
        } else {
            return false;
        }
    } 
    return true;
}

function save() {
    var exclude = $('#exclude').prop('checked') === true ? 1 : 0;
    var valid = ((accuracy > 0 && accuracy <= EpsConfig.getGoodGpsAccuracyThresholds()) ? 1:0);
    var census = new Census({
        place_name: localStorage.getItem("place_name_selected"),
        house_number: $('#houseNum').val(),
        head_name: $('#headName').val(),
        comment: $('#comment').val().trim().length > 0 ? $('#comment').val().trim():null,
        exclude: exclude,
        valid: valid,
        sample_frame: 0,
        random_number: 0,
        selected: 0,
        location_accuracy: accuracy,
        location_altitude: altitude,
        location_latitude: latitude,
        location_longitude: longitude
    });
    
    census.save(null, {

        success: function(response) {
            console.log('Successfully UPDATED census with _id: ' + response.toJSON()._id);
            alert("Census saved.");
            lastPlusOne();

            if(pagination.current_page !== 1) {
                //move the pagination to the first page
                pagination.current_page = 1;
                readCensusFromDb(); // read census from db
            } else {
                if(censuses.length >= pagination.items_per_page) {
                    censuses.pop();
                }
                censuses.unshift(census);
                censuses.trigger("collection:updated", { 
                    count : pagination.items_per_page, 
                    total : pagination.total + 1, 
                    startAt : 0 } );
            }
        },
        error: function(response) {
            console.log('Failed to update census!');
            alert("Unable to save census.");
            lastPlusOne();
        }
        
    });
}

function clearControlValues() {
    $('#headName').val("");
    $('#comment').val("");
}

function getNumOfValidCensus() {
    var successFn = function( result ) {
        if(result.getCount()>0) {
            $('#num_valid').html(result.getData(0,"num"));
        } else {
            $('#num_valid').html('0');
        }
    }

    var failureFn = function( errorMsg) {
        console.log('Failed to read census table');
        $('#num_valid').html('e');
    }

    odkData.arbitraryQuery('census', "SELECT count(_id) AS num FROM census WHERE place_name=? AND valid=? and exclude=?", 
        [localStorage.getItem("place_name_selected"),'1','0'], null, null, successFn, failureFn);
}

function getNumOfInvalidCensus() {
    var successFn = function( result ) {
        if(result.getCount()>0) {
            $('#num_invalid').html(result.getData(0,"num")); 
        } else {
            $('#num_invalid').html('0');
        }
    }

    var failureFn = function( errorMsg) {
        console.log('Failed to read census table');
        $('#num_invalid').html('e');
    }

    odkData.arbitraryQuery('census', "SELECT count(_id) AS num FROM census WHERE place_name=? AND valid=? and exclude=?", 
        [localStorage.getItem("place_name_selected"),'0','0'], null, null, successFn, failureFn);
}

function getNumOfExcludedCensus() {
    var successFn = function( result ) {
        if(result.getCount()>0) {
            $('#num_excluded').html(result.getData(0,"num")); 
        } else {
            $('#num_excluded').html('0');
        }
    }

    var failureFn = function( errorMsg) {
        console.log('Failed to read census table');
        $('#num_excluded').html('e');
    }

    odkData.arbitraryQuery('census', "SELECT count(_id) AS num FROM census WHERE place_name=? AND exclude=?", 
        [localStorage.getItem("place_name_selected"),'1'], null, null, successFn, failureFn);
}

function generateLastIDPlus1() {

    var successFnPlus1 = function( result ) {
        // if you find the max house number, then add one on it and update the screen
        if(result.getCount()>0) {
            if(result.getData(0,"house_number") !== null) {
                $("#houseNum").val(parseInt(result.getData(0,"house_number")) + 1);
            } else {
                $("#houseNum").val('1');
            }
        } else {
            // if there is no record, put one in the house number textbox
            $("#houseNum").val('1');
        }
    }

    var failureFnPlus1 = function( errorMsg) {
        console.log('Failed to read census table');
        $("#houseNum").val('1');
    }

    odkData.arbitraryQuery('census', "select max(house_number) as house_number from census where place_name=?", 
        [localStorage.getItem("place_name_selected")], null, null, successFnPlus1, failureFnPlus1);
}

function lastPlusOne() {
    refreshScreenAfterCancel();
    clearControlValues();
    $('.edit-census').show();
    generateLastIDPlus1();
}

$(document).ready(function() {
    setupLocation();
    
    $('#save').on('click', function() {
        if(validateData(true)) {
            save();
        }
    });

    $('#update-census').on('click', function() {
        rowBeingUpdated.update();
    });

    $('#cancel').on('click', function() {
        rowBeingUpdated.cancel();
    });
    $('#plus1').on('click', function() {
        // if the screen is in the update mode, cancel it.
        lastPlusOne()
    });

    readCensusFromDb();

    censuses.on('collection:updated', function(details) {
            updatePagination( details );
        }, null);
});

$(window).on('beforeunload', function(){
    console.log("beforeUnload event!");
    if(watchID !== null) {
        navigator.geolocation.clearWatch(watchID);
    }
});