/* global control, util, alert */
'use strict';

if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/follow_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            if (dataObj === undefined || dataObj === null) {
                console.log('Could not load data json for table: follow');
            }
            window.data.setBackingObject(dataObj);
        }
    });
}

// The duration of a single follow page. Should be 15 minutes before launch.
var INTERVAL_DURATION = 1000 * 60 * 1;

/**
 * Called when the end of the interval has been reached.
 */
function endOfInterval() {

  // We'll beep three times.
  window.setTimeout(beep, 1000);
  window.setTimeout(beep, 2000);
  window.setTimeout(beep, 3000);

  // update the UI to show time has expired
  var $nextButton = $('#next-button');
  $nextButton.removeClass('btn-primary');
  $nextButton.addClass('btn-danger');
  $nextButton.text('Time Up!');

}

function display() {
    // hiding the initial ui
    $('.time_point').css("visibility", 'hidden');
    //console.log("Am I messing things up " + $('.visible'));
    $('.5-meter').css ("visibility", 'hidden');
    $('.certainity').css ("visibility", 'hidden');
    $('.sexual_state').css ("visibility", 'hidden');
    $('.closeness').css ("visibility", 'hidden');

    $('#time').css ("visibility", 'hidden');

    $('#certainty').css ("visibility", 'hidden');
    $('#distance').css ("visibility", 'hidden');
    $('#state').css ("visibility", 'hidden');
    $('#close_focal').css ("visibility", 'hidden');
    //save_bottom_div
    $('#save_bottom_div').css ("visibility", 'hidden');


    // Kick off a call to complete in our interval.
    window.setTimeout(endOfInterval, INTERVAL_DURATION);

    // We're expecting the follow time to be present as a url parameter,
    // something along the lines of:
    // ?follow_time=07_15
    var followTime = util.getQueryParameter(util.timeKey);

    var followDate = util.getQueryParameter(util.dateKey);
    var focalChimpId = util.getQueryParameter(util.focalChimpKey);  

    /**
     * Update the row for the given chimp. As we start persisting more data
     * this function should grow.
     *
     * isUpdate is true if we are updating the database rather than writing a
     * new row. If true, rowId cannot be null. If false, rowId is ignored.
     *
     * If isWithin5 is null, no update is performed.
     */
    var writeRowForChimp = function(isUpdate, rowId, chimpId, time, certain, distance, sState, closest_to_focal) {
        var struct = {};
        struct['FA_FOL_date'] = followDate;
        struct['FA_FOL_B_focal_AnimID'] = focalChimpId;
        struct['FA_B_arr_AnimID'] = chimpId;
        struct['FA_time_start'] = followTime;

        if (time != undefined) {
            struct['FA_duration_of_obs'] = time;
        }
        if (sState != undefined) {
            struct['FA_type_of_cycle'] = sState;
        }
        
        if (certain != undefined) {
            struct['FA_type_of_certainty'] = certain;
        } 

        if (distance != undefined) {
            struct['FA_within_five_meters'] = distance;
        } 

        if (closest_to_focal != undefined) {
            struct['FA_closest_to_focal'] = closest_to_focal;
        } 
        
        var stringified = JSON.stringify(struct);
        if (isUpdate) {
            var updateSuccessfully =
                control.updateRow('follow_arrival', stringified, rowId);
            //console.log('updateSuccessfully: ' + updateSuccessfully);
        } else {
            var addedSuccessfully =
                control.addRow('follow_arrival', stringified);
            //console.log('added successfully: ' + addedSuccessfully);
        }
    };

    /* This method update the follow screen. It updates the follow screen while first it loads the
     *  page as well as when user updates the elements from the bottom div.
     */
    var updateUI = function(update, chimpId, time, certain, distance, sState, closest_to_focal) {
        console.log("chimpId " + chimpId);
        console.log("time " + time);
        console.log("certain " + certain);
        console.log("distance " + distance);
        console.log("sState " + sState);
        console.log("closest_to_focal " + closest_to_focal);
        if (time != null || time != undefined) {
            if (time == "15") {
                document.getElementById(chimpId+"_time_img").src = "./img/timeBottom.gif";
            }else if(time == "10") {
                document.getElementById(chimpId+"_time_img").src = "./img/timeMiddle.gif";
            } else if (time == "5") {
                document.getElementById(chimpId+"_time_img").src = "./img/timeTop.gif";
            } else if (time == "0") {
                document.getElementById(chimpId+"_time_img").src = "./img/timeEmpty.gif";
            } else if (time == "1") {
                document.getElementById(chimpId+"_time_img").src = "./img/timeFull.gif";

            }
        }
        if (certain != null || certain != undefined) {
            if (certain == "0") {
                document.getElementById(chimpId+"_cer").innerHTML = "0";
            } else if (certain == "1") {
                document.getElementById(chimpId+"_cer").innerHTML = "|";
            } else if (certain == "2") {
                document.getElementById(chimpId+"_cer").innerHTML = "&#x2717;";
            }
            if (update) {
                document.getElementById(chimpId+"_cer").style.backgroundColor = "#3399FF";
            }
            
        }

        if (distance != null || distance != undefined) {
            if (distance == "0") {
                document.getElementById(chimpId+"_five").innerHTML = "&#x2717;";
            } else if (distance == "1") {
                document.getElementById(chimpId+"_five").innerHTML = "&#x2713;";
            }
            if(update) {
               document.getElementById(chimpId+"_five").style.backgroundColor = "#3399FF"; 
            }    
        }

        if (sState != null || sState != undefined) {
            console.log("I am the stupid one messing with up " + sState);
            if (sState == "0") {
                document.getElementById(chimpId+"_sexState").innerHTML = "0";
            }else if(sState == "0.25") {
                document.getElementById(chimpId+"_sexState").innerHTML = "0.25";
            } else if (sState == "0.5") {
                document.getElementById(chimpId+"_sexState").innerHTML = "0.5";
            } else if (sState == "0.75") {
                document.getElementById(chimpId+"_sexState").innerHTML = "0.75";
            } 
            if (update) {
                document.getElementById(chimpId+"_sexState").style.backgroundColor = "#3399FF";
            }   
        }
        if (closest_to_focal != null || closest_to_focal != undefined) {
            if (closest_to_focal == "0") {
                document.getElementById(chimpId+"_close").innerHTML = "&#x2717;";
            } else if (closest_to_focal == "1") {
                document.getElementById(chimpId+"_close").innerHTML = "&#x2713;";
            }
            if (update) {
                 document.getElementById(chimpId+"_close").style.backgroundColor = "#3399FF";
            }    
        }    
    };

    /* Updates the bottom div when user selects any of the chimp. It updates the 
     * div according to that's chimp.
     */
    //var updateBottomDiv = function(time, certain, distance, sState, closest_to_focal) {
       /* $("input[name=time][value="+time+"]").attr('checked', true);
        $("input[name=certain][value="+certain+"]").attr('checked', true);
        $("input[name=distance][value="+distance+"]").attr('checked', true);
        $("input[name=sex_state][value="+sState+"]").attr('checked', true);
        $("input[name=close][value="+closest_to_focal+"]").attr('checked', true);*/
       /* console.log("Why are you messing up stupid " + certain + "your time " + (typeof certain));
        if (time == "0") {
            console.log("I am here uhuu");
            document.getElementById("time1").checked = true;
        } else if (time == "5") {
            document.getElementById("time2").checked = true;
        } else if (time == "10") {
            document.getElementById("time3").checked = true;
        } else if (time == "15") {
            document.getElementById("time4").checked = true;
        }
        if (certain == "0") {
             document.getElementById("certain1").checked = true;
        } else if (certain == "1") {
            document.getElementById("certain2").checked = true;
        } else if (certain == "2") {
            document.getElementById("certain3").checked = true;
        }
        if (distance == "0") {
             document.getElementById("distance1").checked = true;
        } else if (certain == "1") {
            document.getElementById("distance2").checked = true;
        }
         if (sState == "0") {
            document.getElementById("sex1").checked = true;
        } else if (sState == "0.25") {
            document.getElementById("sex2").checked = true;
        } else if (sState == "0.5") {
            document.getElementById("sex3").checked = true;
        } else if (sState == "0.75") {
           document.getElementById("sex4").checked = true;
        }
        if (closest_to_focal == "0") {
             document.getElementById("close1").checked = true;
        } else if (certain == "1") {
           document.getElementById("close2").checked = true;
        }
    };*/

    var followTimeUserFriendly;
    if (followTime === null) {
        // notify the user if we haven't specified a follow time. This will be
        // only useful for debugging purposes.
        alert('No follow time has been specified!');
        followTimeUserFriendly = 'N/A';
    } else {
        followTimeUserFriendly = followTime.replace('_', ':');
    }

    $('#time-label').eq(0).html(followTimeUserFriendly);




    /* It returns all the male chimps available.
    */
    var getMaleChimps = function() {
        // We've defined the male chimps by giving them the
        // class 'male-chimp'. Selectors use '.class', so we'll find them and
        // append three checkboxes to each.
        var result = $('.male-chimp');
        return result;
    };

    /* It returns all the female chimps available.
    */
    var getFemaleChimps = function() {
        var result = $('.female-chimp');
        return result;
    };
e
    /* It updates the ui while page is loading. If this new time point, then it 
    * updates the ui with default values, otherwise it retrieves the data from database and
    * updates the ui according to that. It also writes a each row for each chimp for
    * each new time point.
    */
    var chimpList = util.getTableDataForTimePoint(
            followDate, followTime,
            focalChimpId);
    if (chimpList == null || chimpList.getCount() == 0) {
        // all default values
        var defTime = "0"; 
        var defcer = "2";  
        var defDistance = "0";
        var def_sState = "0";
        var defClose = "0";
        var maleChimps = getMaleChimps();
        var femaleChimps = getFemaleChimps();
        var allChimps = maleChimps.toArray().concat(femaleChimps.toArray());
        for (var i = 0; i < allChimps.length; i++) {
            var chimpId = allChimps[i].id;
            writeRowForChimp(
                    false,
                    null,
                    chimpId,
                    defTime,
                    defcer,
                    defDistance,
                    def_sState,
                    defClose);
        }
       
    } else {
        // retrieve the data from the database and update the UI
        for(var i = 0; i < chimpList.getCount(); i++) {
                var chimpId = chimpList.getData(i, 'FA_B_arr_AnimID').trim();
                var time = chimpList.getData(i, 'FA_duration_of_obs').trim();
                var certain = chimpList.getData(i, 'FA_type_of_certainty').trim();
                var distance = chimpList.getData(i, 'FA_within_five_meters').trim();
                var sex_state = chimpList.getData(i, 'FA_type_of_cycle').trim(); 
                var closest_to_focal = chimpList.getData(i, 'FA_closest_to_focal').trim();
                updateUI(false, chimpId,
                        time,
                        certain,
                        distance,
                        sex_state,
                        closest_to_focal);           
        }
    }

    var incrementTime = function(time) {
        var interval = 15;
        var parts = time.split(':');
        var hours = parseInt(parts[0]);
        var mins = parseInt(parts[1]);
        var maybeTooLarge = mins + interval;

        if (maybeTooLarge > 59) {
            // then we've overflowed our time system.
            mins = maybeTooLarge % 60;
            // Don't worry about overflowing hours. Not going to worry about
            // late night chimp monitoring.
            hours = hours + 1;
        } else {
            mins = maybeTooLarge;
        }

        // Format these strings to be two digits.
        var hoursStr = convertToStringWithTwoZeros(hours);
        var minsStr = convertToStringWithTwoZeros(mins);
        var result = hoursStr + ':' + minsStr;
        return result;
    };

    var convertToStringWithTwoZeros = function(time) {
        var result;
        if (time < 10) {
            result = '0' + time;
        } else {
            result = time.toString();
        }
        return result;
    };    


    $('#next-button').on('click', function() {
        console.log('clicked next');        
        // //Check if we have a closest to focal checked
        // var closestId = $('.closest-chimp').prop('id');
        // var noClosestOk = false;
        // //If no closest to focal, give an alert. 
        // if (closestId == undefined) {
        //     noClosestOk = confirm("No nearest to focal. Are you sure?");
        // }
        // else {
        //     noClosestOk = true;
        // }

        // //Check if we have any chimps within 5m
        // var maleChimps = getMaleChimps();
        // var femaleChimps = getFemaleChimps();
        // var allChimps = maleChimps.toArray().concat(femaleChimps.toArray());
        
        // var noneWithin5ok = false;
        // for (var i = 0; i < allChimps.length; i++) {
        //     var chimpId = allChimps[i].id;
        //     var within5Checkbox = $('#' + chimpId + fiveMeterSuffix);
        //     if (within5Checkbox.prop('checked') == true) {
        //         noneWithin5ok = true;
        //     }
        // }
        // //If none within 5m of focal, give an alert. 
        // if (noneWithin5ok == false) {
        //     noneWithin5ok = confirm("No chimps within 5m. Are you sure?");
        // }

        // if ((noClosestOk == true) && (noneWithin5ok == true)) {
            // And now launch the next screen
            document.getElementById("loading").style.visibility = 'visible'; // shows loading screen        
            
            var nextTime = incrementTime(followTime);

            var queryString = util.getKeysToAppendToURL(
                followDate,
                nextTime,
                focalChimpId);
            var url =
                control.getFileAsUrl('assets/followScreen.html' + queryString);
            console.log('url: ' + url);
            window.location.href = url;
        // }
        
    });

    var getRowId = function(chimpId) {
    // returns rowId
        var chimpList = util.getTableDataForTimePoint(
        followDate, followTime,
        focalChimpId);
        var rowId = null;
        for(var i = 0; i < chimpList.getCount(); i++) {
            if (chimpList.getData(i, 'FA_B_arr_AnimID').trim() == chimpId.trim()) {
                rowId = chimpList.getRowId(i);
                break;
            }
        }
        return rowId;
    }
    
    // It helps the user to update ui and save the new information to
    // the database
    //var updateChimpInfo = function(){
        
        // removing event handeler from all other chimps right now since we want the
        // user to be able update one chimp at a time.
    $('.chimp').on('click', function() {//unbind("click", updateChimpInfo);
        $('#time').css ("visibility", 'visible'); // hidden div visible

        var chimpId = $(this).prop('id');
        console.log("in event handeler " + chimpId);
        document.getElementById(chimpId).style.backgroundColor = "green";
        var chimpList = util.getTableDataForTimePoint(
        followDate, followTime,
        focalChimpId);
        var rowId = null;
        for(var i = 0; i < chimpList.getCount(); i++) {
            if (chimpList.getData(i, 'FA_B_arr_AnimID').trim() == chimpId.trim()) {
                rowId = chimpList.getRowId(i);
                break;
            }
        }
        var curCertain = null;
        var curDist = null;
        var curS = null;
        var curClose = null;
        var curTime = null;
        if (rowId != null) {
            curTime = chimpList.getData(rowId, 'FA_duration_of_obs').trim();
            curCertain = chimpList.getData(rowId, 'FA_type_of_certainty').trim();
            curDist = chimpList.getData(rowId, 'FA_within_five_meters').trim();
            curS = chimpList.getData(rowId, 'FA_type_of_cycle').trim(); 
            curClose = chimpList.getData(rowId, 'FA_closest_to_focal').trim();
            //updateBottomDiv(curTime, curCertain, curDist, curS, curClose);
        } else {
             console.log("There is no Chimp with this name in the database!!!!");
             return;
        }
       
        // getting the information from the div and saving it to the database and
        // updates the ui
       /* var time = null;
        var certain = null;
        var distance = null;
        var sex_state = null;
        var close = null;
       $('.save_bottom_div').on('click', function() {
            time = $('input[name="time"]:checked').val();
            certain = $('input[name="certain"]:checked').val();
            distance = $('input[name="distance"]:checked').val();
            sex_state = $('input[name="sex_state"]:checked').val();
            close = $('input[name="close"]:checked').val();
            updateUI(true, chimpId,
            time,
            certain,
            distance,
            sex_state,
            close);

            if (rowId != null) {
                writeRowForChimp(
                    true,
                    rowId,
                    chimpId,
                    time,
                    certain,
                    distance,
                    sex_state,
                    close);
            } else {
                console.log("There is no Chimp with this name in the database!!!!");
                return;
            }
            // we are done with updating the current chimp. so we can re bind the
            // all the chimps to the event handeler
            //$('.chimp').bind("click", updateChimpInfo);
        });*/
        $('.time').on('click', function() {
            console.log("Am I the right one " + $(this).prop('id'));
            // writing the about the time in the database
            var time = $(this).prop('id');

            if (rowId != null) {
                writeRowForChimp(
                    true,
                    rowId,
                    chimpId,
                    time,
                    curCertain,
                    curDist,
                    curS,
                    curClose);
            } else {
                console.log("There is no Chimp with this name in the database!!!!");
                return;
            }

            $('#'+chimpId+'_time').css("visibility", 'visible');
            //console.log("Am I messing things up " + $('.visible'));

            $('#'+chimpId+'_cer').css ("visibility", 'visible');
            $('#'+chimpId+'_five').css ("visibility", 'visible');

            $('#'+chimpId+'_sexState').css ("visibility", 'visible');
            $('#' + chimpId + '_close').css ("visibility", 'visible');
            updateUI(true, chimpId, time, null, null, null, null);
            $('#time').css ("visibility", 'hidden');


        });
         
//console.log("Am I messing things up " + $('.visible'));

    });

        $('.certainity').on('click', function() {
           console.log("I am stupid and i am inside of .5-meter");
          // var id = 
            var id = $(this).prop('id');
           $('#certainty').css ("visibility", 'visible');
           $('#save_bottom_div').css ("visibility", 'visible');
           $('.save_bottom_div').on('click', function() {
               var certain = $('input[name="certain"]:checked').val();
              
               var ids = id.split("_");
               var chimpId = ids[0];
               var rowId = getRowId(chimpId);
               var curCertain = null;
               var curDist = null;
               var curS = null;
               var curClose = null;
               var curTime = null;
               var chimpList = util.getTableDataForTimePoint(
                followDate, followTime,
                focalChimpId);
               if (rowId != null) {
                    curTime = chimpList.getData(rowId, 'FA_duration_of_obs').trim();
                    curDist = chimpList.getData(rowId, 'FA_within_five_meters').trim();
                    curS = chimpList.getData(rowId, 'FA_type_of_cycle').trim(); 
                    curClose = chimpList.getData(rowId, 'FA_closest_to_focal').trim();
                //updateBottomDiv(curTime, curCertain, curDist, curS, curClose);
                } else {
                    console.log("There is no Chimp with this name in the database!!!!");
                    return;
                }
                if (rowId != null) {
                    writeRowForChimp(
                        true,
                        rowId,
                        chimpId,
                        curTime,
                        curCertain,
                        curDist,
                        curS,
                        curClose);
                } else {
                    console.log("There is no Chimp with this name in the database!!!!");
                    return;
                }
                updateUI(true, chimpId, null, certain, null, null, null);
                $('#certainty').css ("visibility", 'hidden');
                $('#save_bottom_div').css ("visibility", 'hidden');
            });
        });

        $('.5-meter').on('click', function() {
           console.log("I am stupid and i am inside of .5-meter");
            var chimpList = util.getTableDataForTimePoint(
            followDate, followTime,
            focalChimpId);
            var id = $(this).prop('id');
           $('#distance').css ("visibility", 'visible');
           $('#save_bottom_div').css ("visibility", 'visible');
           $('.save_bottom_div').on('click', function() {
               var curDist = $('input[name="distance"]:checked').val();
               
               var ids = id.split("_");
               var chimpId = ids[0];
               var rowId = getRowId(chimpId);
               var curCertain = null;
               var curS = null;
               var curClose = null;
               var curTime = null;
               if (rowId != null) {
                    curTime = chimpList.getData(rowId, 'FA_duration_of_obs').trim();
                    curS = chimpList.getData(rowId, 'FA_type_of_cycle').trim(); 
                    curClose = chimpList.getData(rowId, 'FA_closest_to_focal').trim();
                    curCertain = chimpList.getData(rowId, 'FA_type_of_certainty').trim();
                //updateBottomDiv(curTime, curCertain, curDist, curS, curClose);
                } else {
                    console.log("There is no Chimp with this name in the database!!!!");
                    return;
                }
                if (rowId != null) {
                    writeRowForChimp(
                        true,
                        rowId,
                        chimpId,
                        curTime,
                        curCertain,
                        curDist,
                        curS,
                        curClose);
                } else {
                    console.log("There is no Chimp with this name in the database!!!!");
                    return;
                }
                updateUI(true, chimpId, null, null, curDist, null, null);
                $('#distance').css ("visibility", 'hidden');
                $('#save_bottom_div').css ("visibility", 'hidden');
           });

        });

       
        $('.sexual_state').on('click', function() {
            var id = $(this).prop('id');
            $('#state').css ("visibility", 'visible');
            $('#save_bottom_div').css ("visibility", 'visible');
            $('.save_bottom_div').on('click', function() {
                var curS = $('input[name="sex_state"]:checked').val();
                
                var ids = id.split("_");
                var chimpId = ids[0];
                var rowId = getRowId(chimpId);
                var curTime = null;
                var curCertain = null;
                var curDist = null;
                var curCertain = null;
                var curClose = null;
                var chimpList = util.getTableDataForTimePoint(
                followDate, followTime,
                focalChimpId);
                if (rowId != null) {
                    curTime = chimpList.getData(rowId, 'FA_duration_of_obs').trim();
                    curDist = chimpList.getData(rowId, 'FA_within_five_meters').trim();
                    curCertain = chimpList.getData(rowId, 'FA_type_of_certainty').trim();
                    curClose = chimpList.getData(rowId, 'FA_closest_to_focal').trim();
                //updateBottomDiv(curTime, curCertain, curDist, curS, curClose);
                } else {
                    console.log("There is no Chimp with this name in the database!!!!");
                    return;
                }
                if (rowId != null) {
                    writeRowForChimp(
                        true,
                        rowId,
                        chimpId,
                        curTime,
                        curCertain,
                        curDist,
                        curS,
                        curClose);
                } else {
                    console.log("There is no Chimp with this name in the database!!!!");
                    return;
                }
                updateUI(true, chimpId, null, null, null, curS, null);
                $('#state').css ("visibility", 'visible');
                $('#save_bottom_div').css ("visibility", 'hidden');
            });
         });
        $('.closeness').on('click', function() {
            var id = $(this).prop('id');
            var chimpList = util.getTableDataForTimePoint(
            followDate, followTime,
            focalChimpId);
            $('#close_focal').css ("visibility", 'visible');
            $('#save_bottom_div').css ("visibility", 'visible');
            $('.save_bottom_div').on('click', function() {
                var curClose = $('input[name="close"]:checked').val();
                
                var ids = id.split("_");
                var chimpId = ids[0];
                var rowId = getRowId(chimpId);
                var curTime = null;
                var curCertain = null;
                var curDist = null;
                var curCertain = null;
                if (rowId != null) {
                    curTime = chimpList.getData(rowId, 'FA_duration_of_obs').trim();
                    curDist = chimpList.getData(rowId, 'FA_within_five_meters').trim();
                    curCertain = chimpList.getData(rowId, 'FA_type_of_certainty').trim();
                    curS = chimpList.getData(rowId, 'FA_type_of_cycle').trim(); 
                   
                //updateBottomDiv(curTime, curCertain, curDist, curS, curClose);
                } else {
                    console.log("There is no Chimp with this name in the database!!!!");
                    return;
                }
                if (rowId != null) {
                    writeRowForChimp(
                        true,
                        rowId,
                        chimpId,
                        curTime,
                        curCertain,
                        curDist,
                        curS,
                        curClose);
                } else {
                    console.log("There is no Chimp with this name in the database!!!!");
                    return;
                }
                updateUI(true, chimpId, null, null, null,null, curClose);
                $('#close_focal').css ("visibility", 'hidden');
                $('#save_bottom_div').css ("visibility", 'hidden');
            });
         });


   // };       
   // binding event handler to all the chimps
  // $('.chimp').bind("click", updateChimpInfo);
           
    
    // Updates the follow page according to the current information regarding foods
    var foodData = util.getFoodDataForDatePoint(
            followDate, focalChimpId);

    var tableLength = foodData.getCount();
    var ul = document.createElement('ul');
    ul.setAttribute('id','shown-food');
    ul.className = 'foodList';
    ul.className = 'list-group'; // for pretty purpose
    document.getElementById('buttons').appendChild(ul);
    var li = document.createElement('li');
    li.innerHTML = "FOOD: "
    ul.appendChild(li);

    
    for (var i = 0; i < tableLength; i++) {
        var test = foodData.getData(i, 'FB_end_feed_time');
        if (test == null  || test == undefined) {
            var followArray = followTime.split(":");
            var follow = new Date(99, 1, 1, parseInt(followArray[0]), parseInt(followArray[1]), 0, 0);
            var beginTimeEat = foodData.getData(i, 'FB_begin_feed_time');
            var beginTimeArray = beginTimeEat.split(":");
            
            var beginTime = new Date(99, 1, 1, parseInt(beginTimeArray[0]), parseInt(beginTimeArray[1]), 0, 0);
            
            if (follow <= beginTime){
                var li_1 = document.createElement('li');
                li_1.className = 'list-group-item';
                ul.appendChild(li_1);
                var a_tag = document.createElement('a');
                a_tag.setAttribute('id', foodData.getData(i, 'FB_FL_local_food_name').trim() + " " +foodData.getData(i, 'FB_FPL_local_food_part').trim()
                    + " " +foodData.getData(i, 'FB_begin_feed_time').trim());
                a_tag.className = "food food-remove";
                a_tag.setAttribute('href', "#"); // its not gonna go anywhere
                a_tag.innerHTML = foodData.getData(i, 'FB_FL_local_food_name');
                li_1.appendChild(a_tag);
            } 
        }
    }
    // by clicking on the food, user will go to the food page and iput the end time only and come
    // back to the follow page which make the food disappeared from th efolow page.
    $('.food-remove').on('click', function() {
        var foodId = $(this).prop('id');
        var foods = foodId.split(" ");
        var foodName = foods[0];
        var foodPartName = foods[1];
        var foodStartTime = foods[2];
        console.log("FoodName " + foodName);
        console.log("FoodPartName " + foodPartName);
        var queryString = util.getKeysToAppendToURL2(
           followDate,
           followTime,
           focalChimpId, foodStartTime, foodName, foodPartName);
        var url = control.getFileAsUrl(
                'assets/foodPageForFocalChimp.html' + queryString);
        window.location.href = url;

    });

    // Updates the follow page according to the current information regarding species
    var sul = document.createElement('ul');
    sul.setAttribute('id','shown-species');
    sul.className = 'list-group';
    var sli = document.createElement('li');
    sul.appendChild(sli);
    sli.innerHTML = "Species: "
    document.getElementById('buttons').appendChild(sul);
    var speciesData = util.getSpeciesDataForTimePoints(followDate, focalChimpId);
    var sTableLength = speciesData.getCount();
    console.log("table length right now: " + sTableLength);
    for (var i = 0; i < sTableLength; i++) {
        var test = speciesData.getData(i, 'OS_time_end');

        if (test == null  || test == undefined) {
            var sFollowArray = followTime.split(":");
            var sFollow = new Date(99, 1, 1, parseInt(sFollowArray[0]), parseInt(sFollowArray[1]), 0, 0);
            var sBeginTimeFollow = speciesData.getData(i, 'OS_time_begin');
            var sBeginTimeArray = sBeginTimeFollow.split(":");
            var sBeginTime = new Date(99, 1, 1, parseInt(sBeginTimeArray[0]), parseInt(sBeginTimeArray[1]), 0, 0);
            
            if (sFollow <= sBeginTime){
                var sli_1 = document.createElement('li');
                sli_1.className = 'list-group-item';
                sul.appendChild(sli_1);
                var sa_tag = document.createElement('a');
                sa_tag.setAttribute('id', speciesData.getData(i, 'OS_time_begin').trim() + " " + speciesData.getData(i, 'OS_local_species_name_written').trim()
                    + " " + speciesData.getData(i, 'OS_duration').trim());
                sa_tag.className = "species species-remove";
                sa_tag.setAttribute('href', "#"); // its not gonna go anywhere
                sa_tag.innerHTML = speciesData.getData(i, 'OS_local_species_name_written')
                sli_1.appendChild(sa_tag);
            }
        }
    }
    
    // by clicking on the species, user will go to the species page and iput the end time only and come
    // back to the follow page which make the species disappeared from th efolow page.
    $('.species-remove').on('click', function() {
        var removeId = $(this).prop('id');
        var species = removeId.split(" ");
        var timeOfPresence = species[0];
        var speciesName = species[1];
        var numOfSpecies = species[2];
        
        var queryString = util.getKeysToAppendToURL3(
           followDate,
           followTime,
           focalChimpId, timeOfPresence, speciesName, numOfSpecies);
        var url = control.getFileAsUrl(
                'assets/speciesPageForFocalChimp.html' + queryString);
        window.location.href = url;
    });

    // taking to the food page
    $('#button-food').on('click', function() {
        var queryString = util.getKeysToAppendToURL2(
           followDate,
           followTime,
           focalChimpId, "", "", "");
        var url = control.getFileAsUrl(
                'assets/foodPageForFocalChimp.html' + queryString);
        window.location.href = url;
    });

    // taking to the species page
    $('#button-species').on('click', function() {
        var queryString = util.getKeysToAppendToURL3(
           followDate,
           followTime,
           focalChimpId, "", "", "");
        var url = control.getFileAsUrl(
                'assets/speciesPageForFocalChimp.html' + queryString);
        window.location.href = url;
    });
}

/**
 * We'll call beep() to beep. Copied exactly from the helpful answer here:
 * http://stackoverflow.com/questions/879152/how-do-i-make-javascript-beep
 */
function beep() {
    var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
    snd.play();
}
