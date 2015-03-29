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
    var nameUriRelative = data.get('Patient_name_image0.uriFragment');
    var nameSrc = '';
    if (nameUriRelative !== null && nameUriRelative !== "") {
        var nameUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), nameUriRelative);
        nameSrc = nameUriAbsolute;
    }

    var nameThumbnail = $('<img>');
    nameThumbnail.attr('src', nameSrc);
    nameThumbnail.attr('class', 'thumbnail');
    nameThumbnail.attr('id', 'Patient_name_image0');
    $('#name_pic').append(nameThumbnail);

    //image for child sex
    var seUriRelative = data.get('Patient_sex_image0.uriFragment');
    var seSrc = '';
    if (seUriRelative !== null && seUriRelative !== "") {
        var seUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), seUriRelative);
        seSrc = seUriAbsolute;
    }

    var seThumbnail = $('<img>');
    seThumbnail.attr('src', seSrc);
    seThumbnail.attr('class', 'thumbnail');
    seThumbnail.attr('id', 'Patient_sex_image0');
    $('#sex_pic').append(seThumbnail);

    //image for child registration date
    var regUriRelative = data.get('Date_of_registration_image0.uriFragment');
    var regSrc = '';
    if (regUriRelative !== null && regUriRelative !== "") {
        var regUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), regUriRelative);
        regSrc = regUriAbsolute;
    }

    var regThumbnail = $('<img>');
    regThumbnail.attr('src', regSrc);
    regThumbnail.attr('class', 'thumbnail');
    regThumbnail.attr('id', 'Date_of_registration_image0');
    $('#registration_pic').append(regThumbnail);

    //image for child id
    var idUriRelative = data.get('Patient_ID_image0.uriFragment');
    var idSrc = '';
    if (idUriRelative !== null && idUriRelative !== "") {
        var idUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), idUriRelative);
        idSrc = idUriAbsolute;
    }

    var idThumbnail = $('<img>');
    idThumbnail.attr('src', idSrc);
    idThumbnail.attr('class', 'thumbnail');
    idThumbnail.attr('id', 'Patient_ID_image0');
    $('#patientid_pic').append(idThumbnail);

    //image for child registration date
    var birthUriRelative = data.get('Patient_DOB_image0.uriFragment');
    var birthSrc = '';
    if (birthUriRelative !== null && birthUriRelative !== "") {
        var birthUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), birthUriRelative);
        birthSrc = birthUriAbsolute;
    }

    var birthThumbnail = $('<img>');
    birthThumbnail.attr('src', birthSrc);
    birthThumbnail.attr('class', 'thumbnail');
    birthThumbnail.attr('id', 'Patient_DOB_image0');
    $('#birthdate_pic').append(birthThumbnail);

    //image for village/settlement
    var viUriRelative = data.get('Home_village_image0.uriFragment');
    var viSrc = '';
    if (viUriRelative !== null && viUriRelative !== "") {
        var viUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), viUriRelative);
        viSrc = viUriAbsolute;
    }

    var viThumbnail = $('<img>');
    viThumbnail.attr('src', viSrc);
    viThumbnail.attr('class', 'thumbnail');
    viThumbnail.attr('id', 'Home_village_image0');
    $('#village_pic').append(viThumbnail);

    //image for patient's gsm
    var msmUriRelative = data.get('GSM_number_image0.uriFragment');
    var msmSrc = '';
    if (msmUriRelative !== null && msmUriRelative !== "") {
        var msmUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), msmUriRelative);
        msmSrc = msmUriAbsolute;
    }

    var msmThumbnail = $('<img>');
    msmThumbnail.attr('src', msmSrc);
    msmThumbnail.attr('class', 'thumbnail');
    msmThumbnail.attr('id', 'GSM_number_image0');
    $('#patient_gsm_pic').append(msmThumbnail);
    
    //image for refference from
    var refUriRelative = data.get('Referred_from_image0.uriFragment');
    var refSrc = '';
    if (refUriRelative !== null && refUriRelative !== "") {
        var refUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), refUriRelative);
        refSrc = refUriAbsolute;
    }

    var refThumbnail = $('<img>');
    refThumbnail.attr('src', refSrc);
    refThumbnail.attr('class', 'thumbnail');
    refThumbnail.attr('id', 'Referred_from_image0');
    $('#reffered_from_pic').append(refThumbnail);

    //image for refference from other
    var orefUriRelative = data.get('Referred_from_other_image0.uriFragment');
    var orefSrc = '';
    if (orefUriRelative !== null && orefUriRelative !== "") {
        var orefUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), orefUriRelative);
        orefSrc = orefUriAbsolute;
    }

    var orefThumbnail = $('<img>');
    orefThumbnail.attr('src', orefSrc);
    orefThumbnail.attr('class', 'thumbnail');
    orefThumbnail.attr('id', 'Referred_from_other_image0');
    $('#reffered_from_other_pic').append(orefThumbnail);

    //image for transfer from
    var trUriRelative = data.get('Transf_from_HU_image0.uriFragment');
    var trSrc = '';
    if (trUriRelative !== null && trUriRelative !== "") {
        var trUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), trUriRelative);
        trSrc = trUriAbsolute;
    }

    var trThumbnail = $('<img>');
    trThumbnail.attr('src', trSrc);
    trThumbnail.attr('class', 'thumbnail');
    trThumbnail.attr('id', 'Transf_from_HU_image0');
    $('#transfer_from_pic').append(trThumbnail);

    

    //image screened for TB
    var tbUriRelative = data.get('TB_screen_image0.uriFragment');
    var tbSrc = '';
    if (tbUriRelative !== null && tbUriRelative !== "") {
        var tbUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), tbUriRelative);
        tbSrc = tbUriAbsolute;
    }

    var tbThumbnail = $('<img>');
    tbThumbnail.attr('src', tbSrc);
    tbThumbnail.attr('class', 'thumbnail');
    tbThumbnail.attr('id', 'TB_screen_image0');
    $('#tb_screen_pic').append(tbThumbnail);

    //image for screening of STIs
    var stUriRelative = data.get('STI_screen_image0.uriFragment');
    var stSrc = '';
    if (stUriRelative !== null && stUriRelative !== "") {
        var stUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), stUriRelative);
        stSrc = stUriAbsolute;
    }

    var stThumbnail = $('<img>');
    stThumbnail.attr('src', stSrc);
    stThumbnail.attr('class', 'thumbnail');
    stThumbnail.attr('id', 'STI_screen_image0');
    $('#stis_screen_pic').append(stThumbnail);

    //image for service refferd for clinic
    var sclUriRelative = data.get('Clinical_serv_ref_for_image0.uriFragment');
    var sclSrc = '';
    if (sclUriRelative !== null && sclUriRelative !== "") {
        var sclUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), sclUriRelative);
        sclSrc = sclUriAbsolute;
    }

    var sclThumbnail = $('<img>');
    sclThumbnail.attr('src', sclSrc);
    sclThumbnail.attr('class', 'thumbnail');
    sclThumbnail.attr('id', 'Clinical_serv_ref_for_image0');
    $('#clinical_service_pic').append(sclThumbnail);

    //image for service reffered for clonical other
    var osclUriRelative = data.get('Other_clinical_serv_image0.uriFragment');
    var osclSrc = '';
    if (osclUriRelative !== null && osclUriRelative !== "") {
        var osclUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), osclUriRelative);
        osclSrc = osclUriAbsolute;
    }

    var osclThumbnail = $('<img>');
    osclThumbnail.attr('src', osclSrc);
    osclThumbnail.attr('class', 'thumbnail');
    osclThumbnail.attr('id', 'Other_clinical_serv_image0');
    $('#clinical_service__other_pic').append(osclThumbnail);



    //image for service reffered for community
    var scomUriRelative = data.get('Comm_serv_referred_for_image0.uriFragment');
    var scomSrc = '';
    if (scomUriRelative !== null && scomUriRelative !== "") {
        var scomUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), scomUriRelative);
        scomSrc = scomUriAbsolute;
    }

    var scomThumbnail = $('<img>');
    scomThumbnail.attr('src', scomSrc);
    scomThumbnail.attr('class', 'thumbnail');
    scomThumbnail.attr('id', 'Comm_serv_referred_for_image0');
    $('#community_service_pic').append(scomThumbnail);

    

    //image for service reffered for community other
    var oscomUriRelative = data.get('Other_comm_serv_image0.uriFragment');
    var oscomSrc = '';
    if (oscomUriRelative !== null && oscomUriRelative !== "") {
        var oscomUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), oscomUriRelative);
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
    var div = document.getElementById("button");
    div.appendChild(btn);
    btn.onclick = function() {
        console.log("I am here");
        var pid = data.get('Patient_ID');
        var queryString = hiv_scanQueries.getKeysToAppendToURL(pid);
        var url = control.getFileAsUrl('config/assets/hivPatientDisplayRecord.html') + queryString;
        window.location.href = url;
    };

}

