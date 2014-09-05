/**
 * The file for displaying a detail view.
 */
/* global $, control, d3, data */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/scan_HIV_Patient_Record_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            if (dataObj === undefined || dataObj === null) {
                console.log('Could not load data json for table: scan_HIV_Patient_Record');
            }
            window.data.setBackingObject(dataObj);
        }
    });
}

var rowId;
 
function display() {
    // Perform your modification of the HTML page here and call display() in
    // the body of your .html file.
    $('#patient_name').text(data.get('Patient_name'));
    $('#patient_sex').text(data.get('Patient_sex'));
    $('#registration_date').text(data.get('Date_of_registration'));
    $('#patient_id').text(data.get('Patient_ID'));
    $('#patient_birthday').text(data.get('Patient_DOB'));
    $('#home_village').text(data.get('Home_village'));
    $('#patient_gsm').text(data.get('GSM_number'));
    $('#reffered_from').text(data.get('Referred_from'));
    $('#reffered_from_other').text(data.get('Referred_from_other'));
    $('#transfer_from').text(data.get('Transf_from_HU'));
    $('#tb_screen').text(data.get('TB_screen'));
    $('#stis_screen').text(data.get('STI_screen'));
    $('#clinical_service').text(data.get('Clinical_serv_ref_for'));
    $('#clinical_service_toher').text(data.get('Other_clinical_serv'));
    $('#community_service').text(data.get('Comm_serv_referred_for'));
    $('#community_service_other').text(data.get('Other_comm_serv'));

    //image for child name
    var nameMimeUri = data.get('Patient_name_image0');
    var nameSrc = '';
    if (nameMimeUri !== null && nameMimeUri !== "") {
        var nameMimeUriObject = JSON.parse(nameMimeUri);
        var nameUriRelative = nameMimeUriObject.uriFragment;
        var nameUriAbsolute = control.getFileAsUrl(nameUriRelative);
        nameSrc = nameUriAbsolute;
    }

    var nameThumbnail = $('<img>');
    nameThumbnail.attr('src', nameSrc);
    nameThumbnail.attr('class', 'thumbnail');
    nameThumbnail.attr('id', 'Patient_name_image0');
    $('#name_pic').append(nameThumbnail);

    //image for child sex
    var seMimeUri = data.get('Patient_sex_image0');
    var seSrc = '';
    if (seMimeUri !== null && seMimeUri !== "") {
        var seMimeUriObject = JSON.parse(seMimeUri);
        var seUriRelative = seMimeUriObject.uriFragment;
        var seUriAbsolute = control.getFileAsUrl(seUriRelative);
        seSrc = seUriAbsolute;
    }

    var seThumbnail = $('<img>');
    seThumbnail.attr('src', seSrc);
    seThumbnail.attr('class', 'thumbnail');
    seThumbnail.attr('id', 'Patient_sex_image0');
    $('#sex_pic').append(seThumbnail);

    //image for child registration date
    var regMimeUri = data.get('Date_of_registration_image0');
    var regSrc = '';
    if (regMimeUri !== null && regMimeUri !== "") {
        var regMimeUriObject = JSON.parse(regMimeUri);
        var regUriRelative = regMimeUriObject.uriFragment;
        var regUriAbsolute = control.getFileAsUrl(regUriRelative);
        regSrc = regUriAbsolute;
    }

    var regThumbnail = $('<img>');
    regThumbnail.attr('src', regSrc);
    regThumbnail.attr('class', 'thumbnail');
    regThumbnail.attr('id', 'Date_of_registration_image0');
    $('#registration_pic').append(regThumbnail);

    //image for child id
    var idMimeUri = data.get('Patient_ID_image0');
    var idSrc = '';
    if (idMimeUri !== null && idMimeUri !== "") {
        var idMimeUriObject = JSON.parse(idMimeUri);
        var idUriRelative = idMimeUriObject.uriFragment;
        var idUriAbsolute = control.getFileAsUrl(idUriRelative);
        idSrc = idUriAbsolute;
    }

    var idThumbnail = $('<img>');
    idThumbnail.attr('src', idSrc);
    idThumbnail.attr('class', 'thumbnail');
    idThumbnail.attr('id', 'Patient_ID_image0');
    $('#patientid_pic').append(idThumbnail);

    //image for child registration date
    var birthMimeUri = data.get('Patient_DOB_image0');
    var birthSrc = '';
    if (birthMimeUri !== null && birthMimeUri !== "") {
        var birthMimeUriObject = JSON.parse(birthMimeUri);
        var birthUriRelative = birthMimeUriObject.uriFragment;
        var birthUriAbsolute = control.getFileAsUrl(birthUriRelative);
        birthSrc = birthUriAbsolute;
    }

    var birthThumbnail = $('<img>');
    birthThumbnail.attr('src', birthSrc);
    birthThumbnail.attr('class', 'thumbnail');
    birthThumbnail.attr('id', 'Patient_DOB_image0');
    $('#birthdate_pic').append(birthThumbnail);

    //image for village/settlement
    var viMimeUri = data.get('Home_village_image0');
    var viSrc = '';
    if (viMimeUri !== null && viMimeUri !== "") {
        var viMimeUriObject = JSON.parse(viMimeUri);
        var viUriRelative = viMimeUriObject.uriFragment;
        var viUriAbsolute = control.getFileAsUrl(viUriRelative);
        viSrc = viUriAbsolute;
    }

    var viThumbnail = $('<img>');
    viThumbnail.attr('src', viSrc);
    viThumbnail.attr('class', 'thumbnail');
    viThumbnail.attr('id', 'Home_village_image0');
    $('#village_pic').append(viThumbnail);

    //image for patient's gsm
    var msmMimeUri = data.get('GSM_number_image0');
    var msmSrc = '';
    if (msmMimeUri !== null && msmMimeUri !== "") {
        var msmMimeUriObject = JSON.parse(msmMimeUri);
        var msmUriRelative = msmMimeUriObject.uriFragment;
        var msmUriAbsolute = control.getFileAsUrl(msmUriRelative);
        msmSrc = msmUriAbsolute;
    }

    var msmThumbnail = $('<img>');
    msmThumbnail.attr('src', msmSrc);
    msmThumbnail.attr('class', 'thumbnail');
    msmThumbnail.attr('id', 'GSM_number_image0');
    $('#patient_gsm_pic').append(msmThumbnail);
    
    //image for refference from
    var refMimeUri = data.get('Referred_from_image0');
    var refSrc = '';
    if (refMimeUri !== null && refMimeUri !== "") {
        var refMimeUriObject = JSON.parse(refMimeUri);
        var refUriRelative = refMimeUriObject.uriFragment;
        var refUriAbsolute = control.getFileAsUrl(refUriRelative);
        refSrc = refUriAbsolute;
    }

    var refThumbnail = $('<img>');
    refThumbnail.attr('src', refSrc);
    refThumbnail.attr('class', 'thumbnail');
    refThumbnail.attr('id', 'Referred_from_image0');
    $('#reffered_from_pic').append(refThumbnail);

    //image for refference from other
    var orefMimeUri = data.get('Referred_from_other_image0');
    var orefSrc = '';
    if (orefMimeUri !== null && orefMimeUri !== "") {
        var orefMimeUriObject = JSON.parse(orefMimeUri);
        var orefUriRelative = orefMimeUriObject.uriFragment;
        var orefUriAbsolute = control.getFileAsUrl(orefUriRelative);
        orefSrc = orefUriAbsolute;
    }

    var orefThumbnail = $('<img>');
    orefThumbnail.attr('src', orefSrc);
    orefThumbnail.attr('class', 'thumbnail');
    orefThumbnail.attr('id', 'Referred_from_other_image0');
    $('#reffered_from_other_pic').append(orefThumbnail);

    //image for transfer from
    var trMimeUri = data.get('Transf_from_HU_image0');
    var trSrc = '';
    if (trMimeUri !== null && trMimeUri !== "") {
        var trMimeUriObject = JSON.parse(trMimeUri);
        var trUriRelative = trMimeUriObject.uriFragment;
        var trUriAbsolute = control.getFileAsUrl(trUriRelative);
        trSrc = trUriAbsolute;
    }

    var trThumbnail = $('<img>');
    trThumbnail.attr('src', trSrc);
    trThumbnail.attr('class', 'thumbnail');
    trThumbnail.attr('id', 'Transf_from_HU_image0');
    $('#transfer_from_pic').append(trThumbnail);

    

    //image screened for TB
    var tbMimeUri = data.get('TB_screen_image0');
    var tbSrc = '';
    if (tbMimeUri !== null && tbMimeUri !== "") {
        var tbMimeUriObject = JSON.parse(tbMimeUri);
        var tbUriRelative = tbMimeUriObject.uriFragment;
        var tbUriAbsolute = control.getFileAsUrl(tbUriRelative);
        tbSrc = tbUriAbsolute;
    }

    var tbThumbnail = $('<img>');
    tbThumbnail.attr('src', tbSrc);
    tbThumbnail.attr('class', 'thumbnail');
    tbThumbnail.attr('id', 'TB_screen_image0');
    $('#tb_screen_pic').append(tbThumbnail);

    //image for screening of STIs
    var stMimeUri = data.get('STI_screen_image0');
    var stSrc = '';
    if (stMimeUri !== null && stMimeUri !== "") {
        var stMimeUriObject = JSON.parse(stMimeUri);
        var stUriRelative = stMimeUriObject.uriFragment;
        var stUriAbsolute = control.getFileAsUrl(stUriRelative);
        stSrc = stUriAbsolute;
    }

    var stThumbnail = $('<img>');
    stThumbnail.attr('src', stSrc);
    stThumbnail.attr('class', 'thumbnail');
    stThumbnail.attr('id', 'STI_screen_image0');
    $('#stis_screen_pic').append(stThumbnail);

    //image for service refferd for clinic
    var sclMimeUri = data.get('Clinical_serv_ref_for_image0');
    var sclSrc = '';
    if (sclMimeUri !== null && sclMimeUri !== "") {
        var sclMimeUriObject = JSON.parse(sclMimeUri);
        var sclUriRelative = sclMimeUriObject.uriFragment;
        var sclUriAbsolute = control.getFileAsUrl(sclUriRelative);
        sclSrc = sclUriAbsolute;
    }

    var sclThumbnail = $('<img>');
    sclThumbnail.attr('src', sclSrc);
    sclThumbnail.attr('class', 'thumbnail');
    sclThumbnail.attr('id', 'Clinical_serv_ref_for_image0');
    $('#clinical_service_pic').append(sclThumbnail);

    //image for service reffered for clonical other
    var osclMimeUri = data.get('Other_clinical_serv_image0');
    var osclSrc = '';
    if (osclMimeUri !== null && osclMimeUri !== "") {
        var osclMimeUriObject = JSON.parse(osclMimeUri);
        var osclUriRelative = osclMimeUriObject.uriFragment;
        var osclUriAbsolute = control.getFileAsUrl(osclUriRelative);
        osclSrc = osclUriAbsolute;
    }

    var osclThumbnail = $('<img>');
    osclThumbnail.attr('src', osclSrc);
    osclThumbnail.attr('class', 'thumbnail');
    osclThumbnail.attr('id', 'Other_clinical_serv_image0');
    $('#clinical_service__other_pic').append(osclThumbnail);



    //image for service reffered for community
    var scomMimeUri = data.get('Comm_serv_referred_for_image0');
    var scomSrc = '';
    if (scomMimeUri !== null && scomMimeUri !== "") {
        var scomMimeUriObject = JSON.parse(scomMimeUri);
        var scomUriRelative = scomMimeUriObject.uriFragment;
        var scomUriAbsolute = control.getFileAsUrl(scomUriRelative);
        scomSrc = scomUriAbsolute;
    }

    var scomThumbnail = $('<img>');
    scomThumbnail.attr('src', scomSrc);
    scomThumbnail.attr('class', 'thumbnail');
    scomThumbnail.attr('id', 'Comm_serv_referred_for_image0');
    $('#community_service_pic').append(scomThumbnail);

    

    //image for service reffered for community other
    var oscomMimeUri = data.get('Other_comm_serv_image0');
    var oscomSrc = '';
    if (oscomMimeUri !== null && oscomMimeUri !== "") {
        var oscomMimeUriObject = JSON.parse(oscomMimeUri);
        var oscomUriRelative = oscomMimeUriObject.uriFragment;
        var oscomUriAbsolute = control.getFileAsUrl(oscomUriRelative);
        oscomSrc = oscomUriAbsolute;
    }

    var oscomThumbnail = $('<img>');
    oscomThumbnail.attr('src', oscomSrc);
    oscomThumbnail.attr('class', 'thumbnail');
    oscomThumbnail.attr('id', 'Other_comm_serv_image0');
    $('#community_service_other_pic').append(oscomThumbnail);


    var btn = document.createElement("input");
    btn.type = 'button';
    btn.value = 'View Patient Data';
    document.body.appendChild(btn);
    btn.onclick = function() {
        console.log("I am here");
        var pid = data.get('Patient_ID');
        var queryString = hiv_scanQueries.getKeysToAppendToURL(pid);
        var url = control.getFileAsUrl(
                'assets/hivPatientDisplayRecord.html' + queryString);
        window.location.href = url;
    };

}

