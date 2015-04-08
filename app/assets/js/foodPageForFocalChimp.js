/* global control */
'use strict';

function display() {
    var beginTime = util.getQueryParameter(util.timeKey);
    var date = util.getQueryParameter(util.dateKey);
    var focalChimpId = util.getQueryParameter(util.focalChimpKey);
    var beginEating = util.getQueryParameter(util.beginToEat);
    var foodEaten = util.getQueryParameter(util.eatenFood);
    var foodPartEaten = util.getQueryParameter(util.eatenFoodPart);
    console.log("I am the foodPart: " + foodPartEaten);
    
    if((beginEating == null || beginEating == undefined || beginEating.length == 0) &&
        (foodEaten == null || foodEaten == undefined || foodEaten.length == 0) &&
        (foodPartEaten == null || foodPartEaten == undefined || foodPartEaten.length == 0)) {
        $("#foods").val(0);
        $("#food-part").val(0);
        $('#start_time_food').attr('placeholder', 'Start Time');
    } else {
        $("#foods").val(foodEaten);
        $("#food-part").val(foodPartEaten);

        $('#start_time_food').attr('placeholder', beginEating);
        console.log("time is " + beginEating);
        console.log("food part is  is " + foodPartEaten);
    }

    var createFoodRowIdCache = function() {
        var foodData = util.getFoodDataForDatePoint(
                date,
                focalChimpId);
        //var result = {};
        var rowId;
        for (var i = 0; i < foodData.getCount(); i++) {
            rowId = foodData.getRowId(i);
        }
        return rowId;
    };
    
    var writeFood = function(
        food,
        foodPart,   
        startTimeFood,
        endTimeFood, followDate, focalChimpId, foodPart2) {
    
        var foodData = util.getFoodDataForDatePoint(
            date,
            focalChimpId);
        //var rowId = createFoodRowIdCache();

        var rowId = null;
        if (foodData.getCount() > 0) {
            console.log("foodData count is " + foodData.getCount());
            //rowId = foodData.getRowId(0);
            console.log("foodData rowId is " + foodData.getRowId(0));
            console.log("rowId is " + rowId);

            for(var i = 0; i < foodData.getCount(); i++) {
                var x = foodData.getData(i, 'FB_FL_local_food_name').trim();
                var y = foodData.getData(i, 'FB_FPL_local_food_part').trim();
                var z = foodData.getData(i, 'FB_begin_feed_time').trim();
                if (food == foodData.getData(i, 'FB_FL_local_food_name').trim()
                    && foodPart == foodData.getData(i, 'FB_FPL_local_food_part').trim()
                    && startTimeFood == foodData.getData(i, 'FB_begin_feed_time').trim()){

                    //rowId = i;
                    rowId = foodData.getRowId(i);
                    break;
                }
            }  
        }
        console.log("rowId is " + rowId); 

        if (rowId != null || rowId != undefined) {
            if(food == null || food == undefined || food.length === 0) {
                food = foodData.getData(rowId, 'FB_FL_local_food_name');

            }
            if (foodPart == null || foodPart == undefined || foodPart.length === 0) {
                foodPart = foodData.getData(rowId, 'FB_FPL_local_food_part');
            }
       
            if (startTimeFood == null || startTimeFood == undefined || startTimeFood.length === 0) {
                startTimeFood = foodData.getData(rowId, 'FB_begin_feed_time');
            }
        }
    
        var struct = {};
        struct['FB_FOL_B_AnimID'] = focalChimpId;
        struct['FB_FOL_date'] = followDate;
        struct['FB_FL_local_food_name'] = food;
        struct['FB_FPL_local_food_part'] = foodPart;
        struct['FB_begin_feed_time'] = startTimeFood;
        struct['FB_end_feed_time'] = endTimeFood;
        if (typeof foodPart == 'string' && typeof foodPart2 == 'string') {
            struct['FB_FPL_local_food_part2'] = foodPart2;
            console.log("I am here in the foodPart and we need check the start time " + startTimeFood);
            console.log("I am here in the foodPart and we need check the food " + food);
            console.log("I am here in the foodPart and we need check the start time " + foodPart2);
            
            if (endTimeFood == undefined || endTimeFood == null || endTimeFood.length == 0) {
                var stringified = JSON.stringify(struct);
                var updateSuccessfully = control.updateRow(
                    'food_bout',
                    stringified,
                    rowId);
                console.log('updated food successfully with foodPart2: ' + updateSuccessfully);
                return;
            }
        }

        // Now we'll stringify the object and write it into the database.
        var stringified = JSON.stringify(struct);
        if(endTimeFood != undefined ||  endTimeFood != null) {
            //var rowId = createFoodRowIdCache();
            var updateSuccessfully = control.updateRow(
                    'food_bout',
                    stringified,
                    rowId);
            console.log('updated food successfully: ' + updateSuccessfully);

        //} else if ((endTimeFood == undefined ||  endTimeFood == null) && ) {

        } else {
            control.addRow('food_bout', stringified);    
        }
    };


    // CAL: Adding the logic for saving a food
    $('#saving_food').on('click', function() {
        // First retrieve the information from the form.
        var forFoodVal = $('#foods').val();
        var forFoodPartVal = $('#food-part').val();
        var forStartTime =  $('#start_time_food').val();

        var followDate = date;
        var food = $('#foods option:selected').text();
        var foodPart = $('#food-part option:selected').text();
        if(foodPart != null) {
            foodPart = foodPart.toLowerCase();
        }
        /*$(".chosen-select").chosen({

            disable_search_threshold: 10

        }).change(function(event){

            if(event.target == this) {
                  //alert($(this).val());
                  
                  //console.log("Hello I dont know how to get the text " + $(this).val());
                  foodPart = $(this).val();
            }
            console.log("hello I am test " + foodPart);
        });
        var test = foodPart.split(",");
        console.log("First one " + test[0]);
        console.log("First second " + test[1]);
        Console.log();*/
        var startTime = $('#start_time_food').val();
        var endTime = $('#end_time_food').val();
        if (endTime == null || endTime == undefined || endTime.length === 0) {
            if (forStartTime == "" && (typeof foodPart == 'string' && typeof foodPartEaten == 'string') && foodPart != foodPartEaten) {
                forStartTime =  document.getElementById('start_time_food').placeholder;
                console.log("Am I still undefined " + forStartTime);
            }
            // at this time user tries to input another food part which is eaten by the
            // chimp at the same time so that the end time is still null or undefined or endTime.length === 0 
            if ((foodPart != null || foodPart != undefined || foodPart.length != 0) && foodPart != foodPartEaten
                && food == foodEaten && forStartTime == beginEating) {
                console.log("foodPartEaten " + foodPartEaten);
                console.log("foodPart " + foodPart);
                writeFood(food,foodPartEaten,forStartTime,null, followDate, focalChimpId, foodPart);
            } else {
                writeFood(food,foodPart,forStartTime,null, followDate, focalChimpId, null);
            }

        } else {
            // Update the database.
            writeFood(foodEaten,foodPartEaten, beginEating,endTime, followDate, focalChimpId, null);
            
        }
        goBackToFollowScreen();

    });


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
