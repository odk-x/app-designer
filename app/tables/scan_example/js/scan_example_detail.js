/**
 * The file for displaying a detail view.
 */
/* global $, control, d3, data */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/scan_example_data.json'),
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
    $('#NAME').text(data.get('name'));
    $('#qrcode').text(data.get('qrcode'));
    $('#roomNum').text(data.get('roomNum'));
    $('#stay').text(data.get('stay'));
    $('#address').text(data.get('address'));
    $('#mon_chores').text(data.get('mon_chores'));
    $('#tues_chores').text(data.get('tues_chores'));
    $('#wed_chores').text(data.get('wed_chores'));
    $('#thurs_chores').text(data.get('thurs_chores'));
    $('#fri_chores').text(data.get('fri_chores'));
    $('#sat_chores').text(data.get('sat_chores'));
    $('#sun_chores').text(data.get('sun_chores'));
    $('#comments').text(data.get('comments'));

    var addrMimeUri = data.get('address_image_0');
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
    $('#handComments').append(commentsThumbnail);
}

