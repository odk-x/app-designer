/**
 * The file for displaying a detail view.
 */
/* global $, odkData, odkCommon */
'use strict';

 
var resultSet = {};

function updateContent() {
    // Perform your modification of the HTML page here and call display() in
    // the body of your .html file.
    $('#NAME').text(resultSet.get('name'));
    $('#qrcode').text(resultSet.get('qrcode'));
    $('#roomNum').text(resultSet.get('roomNum'));
    $('#stay').text(resultSet.get('stay'));
    $('#address').text(resultSet.get('address'));
    $('#mon_chores').text(resultSet.get('mon_chores'));
    $('#tues_chores').text(resultSet.get('tues_chores'));
    $('#wed_chores').text(resultSet.get('wed_chores'));
    $('#thurs_chores').text(resultSet.get('thurs_chores'));
    $('#fri_chores').text(resultSet.get('fri_chores'));
    $('#sat_chores').text(resultSet.get('sat_chores'));
    $('#sun_chores').text(resultSet.get('sun_chores'));
    $('#comments').text(resultSet.get('comments'));

    var addrUriRelative = resultSet.get('address_image0.uriFragment');
    var addrSrc = '';
    if (addrUriRelative !== null && addrUriRelative !== "") {
        var addrUriAbsolute = odkCommon.getRowFileAsUrl(resultSet.getTableId(), resultSet.getRowId(0), addrUriRelative);
        addrSrc = addrUriAbsolute;
    }

    var addrThumbnail = $('<img>');
    addrThumbnail.attr('src', addrSrc);
    addrThumbnail.attr('class', 'thumbnail');
    addrThumbnail.attr('id', 'address_image0');
    $('#homeAddress').append(addrThumbnail);

    var stayUriRelative = resultSet.get('stay_image0.uriFragment');
    var staySrc = '';
    if (stayUriRelative !== null && stayUriRelative !== "") {
        var stayUriAbsolute = odkCommon.getRowFileAsUrl(resultSet.getTableId(), resultSet.getRowId(0), stayUriRelative);
        staySrc = stayUriAbsolute;
    }

    var stayThumbnail = $('<img>');
    stayThumbnail.attr('src', staySrc);
    stayThumbnail.attr('class', 'thumbnail');
    stayThumbnail.attr('id', 'stay_image0');
    $('#lengthOfStay').append(stayThumbnail);


    var commentsUriRelative = resultSet.get('comments_image0.uriFragment');
    var commentsSrc = '';
    if (commentsUriRelative !== null && commentsUriRelative !== "") {
        var commentsUriAbsolute = odkCommon.getRowFileAsUrl(resultSet.getTableId(), resultSet.getRowId(0), commentsUriRelative);
        commentsSrc = commentsUriAbsolute;
    }

    var commentsThumbnail = $('<img>');
    commentsThumbnail.attr('src', commentsSrc);
    commentsThumbnail.attr('class', 'thumbnail');
    commentsThumbnail.attr('id', 'comments_image0');
    $('#handComments').append(commentsThumbnail);
}

function cbSuccess(result) {

    resultSet = result;
	// and update the document with the values for this plot
	updateContent();
}

function cbFailure(error) {

	// a real application would perhaps clear the document fiels if there were an error
    console.log('Tea_houses_detail getViewData CB error : ' + error);
}

var display = function() {
	
    odkData.getViewData(cbSuccess, cbFailure);
};

