/* global control */
'use strict';

function display() {
    var beginTime = util.getQueryParameter(util.timeKey);
    var date = util.getQueryParameter(util.dateKey);
    var focalChimpId = util.getQueryParameter(util.focalChimpKey);
    
    var writeFood = function(
        food,
        foodPart,   
        startTimeFood,
        endTimeFood, followDate, focalChimpId) {
    
        var foodData = util.getFoodDataForDatePoint(
            date,
            focalChimpId);
        var rowId = createFoodRowIdCache();
        if(food == null || food == undefined) {
            food = foodData.getData(rowId, 'FB_FL_local_food_name');

        }
        if (foodPart == null || foodPart == undefined) {
             foodPart = foodData.getData(rowId, 'FB_FPL_local_food_part');
        }
       
        if (startTimeFood == "") {
            startTimeFood = foodData.getData(rowId, 'FB_begin_feed_time');
        }
    
        var struct = {};
        struct['FB_FOL_B_AnimID'] = focalChimpId;
        struct['FB_FOL_date'] = followDate;
        struct['FB_FL_local_food_name'] = food;
        struct['FB_FPL_local_food_part'] = foodPart;
        struct['FB_begin_feed_time'] = startTimeFood;
        struct['FB_end_feed_time'] = endTimeFood;

        // Now we'll stringify the object and write it into the database.
        var stringified = JSON.stringify(struct);
        if(endTimeFood != "") {
            var updateSuccessfully = control.updateRow(
                    'food_bout',
                    stringified,
                    rowId);
            console.log('updated food successfully: ' + updateSuccessfully);
        } else {
            control.addRow('food_bout', stringified);
        }
    };

    // CAL: Adding the logic for saving a food
    $('#saving_food').on('click', function() {
        // First retrieve the information from the form.
        var followDate = date;
        var food = $('#foods').val();
        var foodPart = $('#food-part').val();
        if(foodPart != null) {
            foodPart = foodPart.toLowerCase();
        }
        var startTime = $('#start_time_food').val();
        var endTime = $('#end_time_food').val();
        
        // Update the database.
        writeFood(food,foodPart,startTime,endTime, followDate, focalChimpId);

        //We are done writing to data Base so that we can go back to the followScreen
        goBackToFollowScreen();

    });
    var createFoodRowIdCache = function() {
        var foodData = util.getFoodDataForDatePoint(
                date,
                focalChimpId);
        //var result = {};
        //var rowId;
        //for (var i = 0; i < foodData.getCount(); i++) {
            //rowId = foodData.getRowId(i);
        //}
        //return rowId;
        return foodData.getCount() - 1;
    };

     $('#go_back').on('click', function() {
        // Now we'll launch the follow screen. The follow screen needs to know
        // what date we're on, as well as the time it should be using.
        goBackToFollowScreen();
    });

    var goBackToFollowScreen = function(){
        var queryString = util.getKeysToAppendToURL(
            date,
            beginTime,
            focalChimpId);
        var url = control.getFileAsUrl(
                'assets/followScreen.html' + queryString);
        window.location.href = url;

    }
}
