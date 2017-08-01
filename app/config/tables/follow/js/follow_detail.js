/**
 * The file for displaying a detail view.
 */
/* global $, odkData */
'use strict';

var crumbResultSet = {}; 

function updateContent() {
    // Perform your modification of the HTML page here and call display() in
    // the body of your .html file.
    $('#chimp_id').text(crumbResultSet.get('FOL_B_AnimID'));
    $('#follow_date').text(crumbResultSet.get('FOL_date'));
    $('#comm_id').text(crumbResultSet.get('FOL_CL_community_id'));
    $('#time_begin').text(crumbResultSet.get('FOL_time_begin'));
    $('#time_end').text(crumbResultSet.get('FOL_time_end'));
    $('#begin_in_nest').text(crumbResultSet.get('FOL_flag_begin_in_nest'));
    $('#end_in_nest').text(crumbResultSet.get('FOL_flag_end_in_nest'));
    $('#follow_duration').text(crumbResultSet.get('FOL_duration'));
    $('#dist_traveled').text(crumbResultSet.get('FOL_distance_traveled'));
    $('#am_obs1').text(crumbResultSet.get('FOL_am_observer1'));
    $('#am_obs2').text(crumbResultSet.get('FOL_am_observer2'));
    $('#pm_obs1').text(crumbResultSet.get('FOL_pm_observer1'));
    $('#pm_obs2').text(crumbResultSet.get('FOL_pm_observer2'));
    $('#study_code1').text(crumbResultSet.get('FOL_study_code1'));
    $('#study_code2').text(crumbResultSet.get('FOL_study_code2'));

    /*var addrUriRelative = crumbResultSet.get('address_image_0.uriFragment');
    var addrSrc = '';
    if (addrUriRelative !== null && addrUriRelative !== "") {
        var addrUriAbsolute = odkCommon.getRowFileAsUrl(data.getTableId(), data.getRowId(0), addrUriRelative);
        addrSrc = addrUriAbsolute;
    }

    var addrThumbnail = $('<img>');
    addrThumbnail.attr('src', addrSrc);
    addrThumbnail.attr('class', 'thumbnail');
    addrThumbnail.attr('id', 'address_image_0');
    $('#homeAddress').append(addrThumbnail);

    var stayUriRelative = crumbResultSet.get('stay_image_0.uriFragment');
    var staySrc = '';
    if (stayUriRelative !== null && stayUriRelative !== "") {
        var stayUriAbsolute = odkCommon.getRowFileAsUrl(data.getTableId(), data.getRowId(0), stayUriRelative);
        staySrc = stayUriAbsolute;
    }

    var stayThumbnail = $('<img>');
    stayThumbnail.attr('src', staySrc);
    stayThumbnail.attr('class', 'thumbnail');
    stayThumbnail.attr('id', 'stay_image_0');
    $('#lengthOfStay').append(stayThumbnail);


    var commentsUriRelative = crumbResultSet.get('comments_image_0.uriFragment');
    var commentsSrc = '';
    if (commentsUriRelative !== null && commentsUriRelative !== "") {
        var commentsUriAbsolute = odkCommon.getRowFileAsUrl(data.getTableId(), data.getRowId(0), commentsUriRelative);
        commentsSrc = commentsUriAbsolute;
    }

    var commentsThumbnail = $('<img>');
    commentsThumbnail.attr('src', commentsSrc);
    commentsThumbnail.attr('class', 'thumbnail');
    commentsThumbnail.attr('id', 'comments_image_0');
    $('#handComments').append(commentsThumbnail);*/
}

function cbSuccess(result) {

    crumbResultSet = result;
	// and update the document with the values for this tea house
	updateContent();
}

function cbFailure(error) {

	// a real application would perhaps clear the document fiels if there were an error
    console.log('follow_detail getViewData CB error : ' + error);
}

var display = function() {
	
    odkData.getViewData(cbSuccess, cbFailure);
};

