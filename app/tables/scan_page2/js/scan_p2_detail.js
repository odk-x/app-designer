/**
 * The file for displaying a detail view.
 */
/* global $, control, d3, data */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/scan_p2_data.json'),
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
    $('#next_vac').text(data.get('nextvaccination'));
    $('#opv_date').text(data.get('opv0'));
    $('#opv_init').text(data.get('opv_initials'));
    $('#opv_note').text(data.get('opv_notes'));
    $('#hepb_date').text(data.get('hepb0'));
    $('#hepb_init').text(data.get('hepb_initials'));
    $('#hepb_note').text(data.get('hepb_notes'));
    $('#vac1').text(data.get('vaccine1'));
    $('#vac1_date').text(data.get('vaccine1date'));
    $('#vac1_init').text(data.get('vaccination1_initials'));
    $('#vac1_note').text(data.get('vaccination1_notes'));
    $('#vac2').text(data.get('vaccine2'));
    $('#vac2_date').text(data.get('vaccine2date'));
    $('#vac2_init').text(data.get('vaccination2_initials'));
    $('#vac2_note').text(data.get('vaccination2_notes'));
    $('#patient_code').text(data.get('qr_patientcode'));

    //picture for next vaccination date
    var nvMimeUri = data.get('nextvaccination_image_0');
    var nvSrc = '';
    if (nvMimeUri !== null && nvMimeUri !== "") {
        var nvMimeUriObject = JSON.parse(nvMimeUri);
        var nvUriRelative = nvMimeUriObject.uriFragment;
        var nvUriAbsolute = control.getFileAsUrl(nvUriRelative);
        nvSrc = nvUriAbsolute;
    }

    var nvThumbnail = $('<img>');
    nvThumbnail.attr('src', nvSrc);
    nvThumbnail.attr('class', 'thumbnail');
    nvThumbnail.attr('id', 'nextvaccination_image_0');
    $('#nextvac_pic').append(nvThumbnail);


    //picture for OPV 0 date
    var odMimeUri = data.get('opv0_image_0');
    var odSrc = '';
    if (odMimeUri !== null && odMimeUri !== "") {
        var odMimeUriObject = JSON.parse(odMimeUri);
        var odUriRelative = odMimeUriObject.uriFragment;
        var odUriAbsolute = control.getFileAsUrl(odUriRelative);
        odSrc = odUriAbsolute;
    }

    var odThumbnail = $('<img>');
    odThumbnail.attr('src', odSrc);
    odThumbnail.attr('class', 'thumbnail');
    odThumbnail.attr('id', 'opv0_image_0');
    $('#opvdate_pic').append(odThumbnail);


    //opv 0 initials picture
    var oiMimeUri = data.get('opv_initials_image_0');
    var oiSrc = '';
    if (oiMimeUri !== null && oiMimeUri !== "") {
        var oiMimeUriObject = JSON.parse(oiMimeUri);
        var oiUriRelative = oiMimeUriObject.uriFragment;
        var oiUriAbsolute = control.getFileAsUrl(oiUriRelative);
        oiSrc = oiUriAbsolute;
    }

    var oiThumbnail = $('<img>');
    oiThumbnail.attr('src', oiSrc);
    oiThumbnail.attr('class', 'thumbnail');
    oiThumbnail.attr('id', 'opv_initials_image_0');
    $('#opvinitials_pic').append(oiThumbnail);

    //picture for opv notes
    var onMimeUri = data.get('opv_notes_image_0');
    var onSrc = '';
    if (onMimeUri !== null && onMimeUri !== "") {
        var onMimeUriObject = JSON.parse(onMimeUri);
        var onUriRelative = onMimeUriObject.uriFragment;
        var onUriAbsolute = control.getFileAsUrl(onUriRelative);
        onSrc = onUriAbsolute;
    }

    var onThumbnail = $('<img>');
    onThumbnail.attr('src', onSrc);
    onThumbnail.attr('class', 'thumbnail');
    onThumbnail.attr('id', 'opv_notes_image_0');
    $('#opvnote_pic').append(onThumbnail);


    //picture for hepb 0 date
    var hdMimeUri = data.get('hepb0_image_0');
    var hdSrc = '';
    if (hdMimeUri !== null && hdMimeUri !== "") {
        var hdMimeUriObject = JSON.parse(hdMimeUri);
        var hdUriRelative = hdMimeUriObject.uriFragment;
        var hdUriAbsolute = control.getFileAsUrl(hdUriRelative);
        hdSrc = hdUriAbsolute;
    }

    var hdThumbnail = $('<img>');
    hdThumbnail.attr('src', hdSrc);
    hdThumbnail.attr('class', 'thumbnail');
    hdThumbnail.attr('id', 'hepb0_image_0');
    $('#hepbdate_pic').append(hdThumbnail);

    //picture for hepb 0 initials
    var hiMimeUri = data.get('hepb_initials_image_0');
    var hiSrc = '';
    if (hiMimeUri !== null && hiMimeUri !== "") {
        var hiMimeUriObject = JSON.parse(hiMimeUri);
        var hiUriRelative = hiMimeUriObject.uriFragment;
        var hiUriAbsolute = control.getFileAsUrl(hiUriRelative);
        hiSrc = hiUriAbsolute;
    }

    var hiThumbnail = $('<img>');
    hiThumbnail.attr('src', hiSrc);
    hiThumbnail.attr('class', 'thumbnail');
    hiThumbnail.attr('id', 'hepb_initials_image_0');
    $('#hepbinitials_pic').append(hiThumbnail);

    //picture for hepb 0 notes
    var hnMimeUri = data.get('hepb_notes_image_0');
    var hnSrc = '';
    if (hnMimeUri !== null && hnMimeUri !== "") {
        var hnMimeUriObject = JSON.parse(hnMimeUri);
        var hnUriRelative = hnMimeUriObject.uriFragment;
        var hnUriAbsolute = control.getFileAsUrl(hnUriRelative);
        hnSrc = hnUriAbsolute;
    }

    var hnThumbnail = $('<img>');
    hnThumbnail.attr('src', hnSrc);
    hnThumbnail.attr('class', 'thumbnail');
    hnThumbnail.attr('id', 'hepb_notes_image_0');
    $('#hepbnote_pic').append(oiThumbnail);

    //picture for vaccine1
    var v1MimeUri = data.get('vaccine1_image_0');
    var v1Src = '';
    if (v1MimeUri !== null && v1MimeUri !== "") {
        var v1MimeUriObject = JSON.parse(v1MimeUri);
        var v1UriRelative = v1MimeUriObject.uriFragment;
        var v1UriAbsolute = control.getFileAsUrl(v1UriRelative);
        v1Src = v1UriAbsolute;
    }

    var v1Thumbnail = $('<img>');
    v1Thumbnail.attr('src', v1Src);
    v1Thumbnail.attr('class', 'thumbnail');
    v1Thumbnail.attr('id', 'vaccine1_image_0');
    $('#vac1_pic').append(v1Thumbnail);

    //picture for vaccine 1 date
    var v1dMimeUri = data.get('vaccine1date_image_0');
    var v1dSrc = '';
    if (v1dMimeUri !== null && v1dMimeUri !== "") {
        var v1dMimeUriObject = JSON.parse(v1dMimeUri);
        var v1dUriRelative = v1dMimeUriObject.uriFragment;
        var v1dUriAbsolute = control.getFileAsUrl(v1dUriRelative);
        v1dSrc = v1dUriAbsolute;
    }

    var v1dThumbnail = $('<img>');
    v1dThumbnail.attr('src', v1dSrc);
    v1dThumbnail.attr('class', 'thumbnail');
    v1dThumbnail.attr('id', 'vaccine1date_image_0');
    $('#vac1date_pic').append(v1dThumbnail);

    //picture for vaccine 1 initials
    var v1iMimeUri = data.get('vaccination1_initials_image_0');
    var v1iSrc = '';
    if (v1iMimeUri !== null && v1iMimeUri !== "") {
        var v1iMimeUriObject = JSON.parse(v1iMimeUri);
        var v1iUriRelative = v1iMimeUriObject.uriFragment;
        var v1iUriAbsolute = control.getFileAsUrl(v1iUriRelative);
        v1iSrc = v1iUriAbsolute;
    }

    var v1iThumbnail = $('<img>');
    v1iThumbnail.attr('src', v1iSrc);
    v1iThumbnail.attr('class', 'thumbnail');
    v1iThumbnail.attr('id', 'vaccination1_initials_image_0');
    $('#vac1init_pic').append(v1iThumbnail);

    //picture for vaccine 1 notes
    var v1nMimeUri = data.get('vaccination1_notes_image_0');
    var v1nSrc = '';
    if (v1nMimeUri !== null && v1nMimeUri !== "") {
        var v1nMimeUriObject = JSON.parse(v1nMimeUri);
        var v1nUriRelative = v1nMimeUriObject.uriFragment;
        var v1nUriAbsolute = control.getFileAsUrl(v1nUriRelative);
        v1nSrc = v1nUriAbsolute;
    }

    var v1nThumbnail = $('<img>');
    v1nThumbnail.attr('src', v1nSrc);
    v1nThumbnail.attr('class', 'thumbnail');
    v1nThumbnail.attr('id', 'vaccination1_notes_image_0');
    $('#vac1note_pic').append(v1nThumbnail);

    //picture for vaccine 2
    var v2MimeUri = data.get('vaccine2_image_0');
    var v2Src = '';
    if (v2MimeUri !== null && v2MimeUri !== "") {
        var v2MimeUriObject = JSON.parse(v2MimeUri);
        var v2UriRelative = v2MimeUriObject.uriFragment;
        var v2UriAbsolute = control.getFileAsUrl(v2UriRelative);
        v2Src = v2UriAbsolute;
    }

    var v2Thumbnail = $('<img>');
    v2Thumbnail.attr('src', v2Src);
    v2Thumbnail.attr('class', 'thumbnail');
    v2Thumbnail.attr('id', 'vaccine2_image_0');
    $('#vac2_pic').append(v2Thumbnail);

    //picture for vaccine 2 date
    var v2dMimeUri = data.get('vaccine2date_image_0');
    var v2dSrc = '';
    if (v2dMimeUri !== null && v2dMimeUri !== "") {
        var v2dMimeUriObject = JSON.parse(v2dMimeUri);
        var v2dUriRelative = v2dMimeUriObject.uriFragment;
        var v2dUriAbsolute = control.getFileAsUrl(v2dUriRelative);
        v2dSrc = v2dUriAbsolute;
    }

    var v2dThumbnail = $('<img>');
    v2dThumbnail.attr('src', v2dSrc);
    v2dThumbnail.attr('class', 'thumbnail');
    v2dThumbnail.attr('id', 'vaccine2date_image_0');
    $('#vac2date_pic').append(v2dThumbnail);

    //picture for vaccine 2 initials
    var v2iMimeUri = data.get('vaccination2_initials_image_0');
    var v2iSrc = '';
    if (v2iMimeUri !== null && v2iMimeUri !== "") {
        var v2iMimeUriObject = JSON.parse(v2iMimeUri);
        var v2iUriRelative = v2iMimeUriObject.uriFragment;
        var v2iUriAbsolute = control.getFileAsUrl(v2iUriRelative);
        v2iSrc = v2iUriAbsolute;
    }

    var v2iThumbnail = $('<img>');
    v2iThumbnail.attr('src', v2iSrc);
    v2iThumbnail.attr('class', 'thumbnail');
    v2iThumbnail.attr('id', 'vaccination2_initials_image_0');
    $('#vac2init_pic').append(v2iThumbnail);

    //picture for vaccine 2 notes
    var v2nMimeUri = data.get('vaccination2_notes_image_0');
    var v2nSrc = '';
    if (v2nMimeUri !== null && v2nMimeUri !== "") {
        var v2nMimeUriObject = JSON.parse(v2nMimeUri);
        var v2nUriRelative = v2nMimeUriObject.uriFragment;
        var v2nUriAbsolute = control.getFileAsUrl(v2nUriRelative);
        v2nSrc = v2nUriAbsolute;
    }

    var v2nThumbnail = $('<img>');
    v2nThumbnail.attr('src', v2nSrc);
    v2nThumbnail.attr('class', 'thumbnail');
    v2nThumbnail.attr('id', 'vaccination2_notes_image_0');
    $('#vac2note_pic').append(v2nThumbnail);

    //picture for qr patient code
    var pcMimeUri = data.get('qr_patientcode_image_0');
    var pcSrc = '';
    if (pcMimeUri !== null && pcMimeUri !== "") {
        var pcMimeUriObject = JSON.parse(pcMimeUri);
        var pcUriRelative = pcMimeUriObject.uriFragment;
        var pcUriAbsolute = control.getFileAsUrl(pcUriRelative);
        pcSrc = pcUriAbsolute;
    }

    var pcThumbnail = $('<img>');
    pcThumbnail.attr('src', pcSrc);
    pcThumbnail.attr('class', 'thumbnail');
    pcThumbnail.attr('id', 'qr_patientcode_image_0');
    $('#patientcode_pic').append(pcThumbnail);
}

