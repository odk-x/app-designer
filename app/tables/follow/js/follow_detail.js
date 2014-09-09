/**
 * The file for displaying a detail view.
 */
/* global $, control, d3, data */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/follow_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            if (dataObj === undefined || dataObj === null) {
                console.log('Could not load data json for table: plot');
            }
            window.data.setBackingObject(dataObj);
        }
    });
}
 
function display() {
    // Perform your modification of the HTML page here and call display() in
    // the body of your .html file.
    $('#chimp_id').text(data.get('FOL_B_AnimID'));
    $('#follow_date').text(data.get('FOL_date'));
    $('#comm_id').text(data.get('FOL_CL_community_id'));
    $('#time_begin').text(data.get('FOL_time_begin'));
    $('#time_end').text(data.get('FOL_time_end'));
    $('#begin_in_nest').text(data.get('FOL_flag_begin_in_nest'));
    $('#end_in_nest').text(data.get('FOL_flag_end_in_nest'));
    $('#follow_duration').text(data.get('FOL_duration'));
    $('#dist_traveled').text(data.get('FOL_distance_traveled'));
    $('#am_obs1').text(data.get('FOL_am_observer1'));
    $('#am_obs2').text(data.get('FOL_am_observer2'));
    $('#pm_obs1').text(data.get('FOL_pm_observer1'));
    $('#pm_obs2').text(data.get('FOL_pm_observer2'));
    $('#study_code1').text(data.get('FOL_study_code1'));
    $('#study_code2').text(data.get('FOL_study_code2'));

    /*var addrMimeUri = data.get('address_image_0');
    var addrSrc = '';
    if (addrMimeUri !== null && addrMimeUri !== "") {
        var addrMimeUriObject = JSON.parse(addrMimeUri);
        var addrUriRelative = addrMimeUriObject.uriFragment;
        var addrUriAbsolute = control.getFileAsUrl(addrUriRelative);
        addrSrc = addrUriAbsolute;
    }

    var addrThumbnail = $('<img>');
    addrThumbnail.attr('src', addrSrc);
    addrThumbnail.attr('class', 'thumbnail');
    addrThumbnail.attr('id', 'address_image_0');
    $('#homeAddress').append(addrThumbnail);

    var stayMimeUri = data.get('stay_image_0');
    var staySrc = '';
    if (stayMimeUri !== null && stayMimeUri !== "") {
        var stayMimeUriObject = JSON.parse(stayMimeUri);
        var stayUriRelative = stayMimeUriObject.uriFragment;
        var stayUriAbsolute = control.getFileAsUrl(stayUriRelative);
        staySrc = stayUriAbsolute;
    }

    var stayThumbnail = $('<img>');
    stayThumbnail.attr('src', staySrc);
    stayThumbnail.attr('class', 'thumbnail');
    stayThumbnail.attr('id', 'stay_image_0');
    $('#lengthOfStay').append(stayThumbnail);


    var commentsMimeUri = data.get('comments_image_0');
    var commentsSrc = '';
    if (commentsMimeUri !== null && commentsMimeUri !== "") {
        var commentsMimeUriObject = JSON.parse(commentsMimeUri);
        var commentsUriRelative = commentsMimeUriObject.uriFragment;
        var commentsUriAbsolute = control.getFileAsUrl(commentsUriRelative);
        commentsSrc = commentsUriAbsolute;
    }

    var commentsThumbnail = $('<img>');
    commentsThumbnail.attr('src', commentsSrc);
    commentsThumbnail.attr('class', 'thumbnail');
    commentsThumbnail.attr('id', 'comments_image_0');
    $('#handComments').append(commentsThumbnail);*/
}

