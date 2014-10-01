/**
 * The file for displaying a detail view.
 */
/* global $, control, d3, data */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/scan_childvacc_822_pg1_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            if (dataObj === undefined || dataObj === null) {
                console.log('Could not load data json for table: scan_childvacc_822_pg1');
            }
            window.data.setBackingObject(dataObj);
        }
    });
}

var rowId;
 
function display() {
    // Perform your modification of the HTML page here and call display() in
    // the body of your .html file.
    $('#emergency_contact').text(data.get('Emergency_contact'));
    $('#CHILD_NAME').text(data.get('Child_name'));
    $('#CHILD_ID').text(data.get('Child_patient_ID'));
    $('#CHILD_BIRTHDATE').text(data.get('Child_DOB'));
    //$('#child_weight').text(data.get('Birth_weight'));
    $('#child_sex').text(data.get('sex'));
    $('#house_number').text(data.get('housenum'));
    $('#village_settlement').text(data.get('village'));
    $('#town_city').text(data.get('city'));
    $('#ward_name').text(data.get('ward'));
    $('#lga_name').text(data.get('lga'));
    $('#state_name').text(data.get('state'));
    $('#mom_name').text(data.get('mothersname'));
    $('#mom_gsm').text(data.get('mom_gsm'));
    $('#dad_name').text(data.get('fathersname'));
    $('#dad_gsm').text(data.get('dad_gsm'));
    $('#birth_weight').text(data.get('Birth_weight'));
    $('#other_reasons').text(data.get('reasonsforcare'));
    $('#patient_code').text(data.get('patient_QRcode'));

    //image for emergency contact
    var emMimeUri = data.get('Emergency_contact_image0');
    var emSrc = '';
    if (emMimeUri !== null && emMimeUri !== "") {
        var emMimeUriObject = JSON.parse(emMimeUri);
        var emUriRelative = emMimeUriObject.uriFragment;
        var emUriAbsolute = control.getFileAsUrl(emUriRelative);
        emSrc = emUriAbsolute;
    }

    var emThumbnail = $('<img>');
    emThumbnail.attr('src', emSrc);
    emThumbnail.attr('class', 'thumbnail');
    emThumbnail.attr('id', 'Emergency_contact_image0');
    $('#emergency_pic').append(emThumbnail);


    //image for child name
    var nameMimeUri = data.get('Child_name_image0');
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
    nameThumbnail.attr('id', 'Child_name_image0');
    $('#name_pic').append(nameThumbnail);

    //image for child id
    var idMimeUri = data.get('Child_patient_ID_image0');
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
    idThumbnail.attr('id', 'Child_patient_ID_image0');
    $('#childid_pic').append(idThumbnail);

    //image for child birthdate
    var birthMimeUri = data.get('Child_DOB_image0');
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
    birthThumbnail.attr('id', 'Child_DOB_image0');
    $('#birthdate_pic').append(birthThumbnail);

    //image for child weight
    var weMimeUri = data.get('Birth_weight_image0');
    var weSrc = '';
    if (weMimeUri !== null && weMimeUri !== "") {
        var weMimeUriObject = JSON.parse(weMimeUri);
        var weUriRelative = weMimeUriObject.uriFragment;
        var weUriAbsolute = control.getFileAsUrl(weUriRelative);
        weSrc = weUriAbsolute;
    }

    var weThumbnail = $('<img>');
    weThumbnail.attr('src', weSrc);
    weThumbnail.attr('class', 'thumbnail');
    weThumbnail.attr('id', 'Birth_weight_image0');
    $('#birth_weight_pic').append(weThumbnail);

    //image for child sex
    var seMimeUri = data.get('sex_image0');
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
    seThumbnail.attr('id', 'sex_image0');
    $('#sex_pic').append(seThumbnail);

    //image for house number
    var hnMimeUri = data.get('housenum_image0');
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
    hnThumbnail.attr('id', 'housenum_image0');
    $('#housenum_pic').append(hnThumbnail);

    //image for village/settlement
    var viMimeUri = data.get('village_image0');
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
    viThumbnail.attr('id', 'village_image0');
    $('#village_pic').append(viThumbnail);

    //image for town/city
    var tcMimeUri = data.get('city_image0');
    var tcSrc = '';
    if (tcMimeUri !== null && tcMimeUri !== "") {
        var tcMimeUriObject = JSON.parse(tcMimeUri);
        var tcUriRelative = tcMimeUriObject.uriFragment;
        var tcUriAbsolute = control.getFileAsUrl(tcUriRelative);
        tcSrc = tcUriAbsolute;
    }

    var tcThumbnail = $('<img>');
    tcThumbnail.attr('src', tcSrc);
    tcThumbnail.attr('class', 'thumbnail');
    tcThumbnail.attr('id', 'city_image0');
    $('#city_pic').append(tcThumbnail);

    //image for ward
    var waMimeUri = data.get('ward_image0');
    var waSrc = '';
    if (waMimeUri !== null && waMimeUri !== "") {
        var waMimeUriObject = JSON.parse(waMimeUri);
        var waUriRelative = waMimeUriObject.uriFragment;
        var waUriAbsolute = control.getFileAsUrl(waUriRelative);
        waSrc = waUriAbsolute;
    }

    var waThumbnail = $('<img>');
    waThumbnail.attr('src', waSrc);
    waThumbnail.attr('class', 'thumbnail');
    waThumbnail.attr('id', 'ward_image0');
    $('#ward_pic').append(waThumbnail);

    //image for lga
    var lgMimeUri = data.get('lga_image0');
    var lgSrc = '';
    if (idMimeUri !== null && idMimeUri !== "") {
        var lgMimeUriObject = JSON.parse(lgMimeUri);
        var lgUriRelative = lgMimeUriObject.uriFragment;
        var lgUriAbsolute = control.getFileAsUrl(lgUriRelative);
        lgSrc = lgUriAbsolute;
    }

    var lgThumbnail = $('<img>');
    lgThumbnail.attr('src', lgSrc);
    lgThumbnail.attr('class', 'thumbnail');
    lgThumbnail.attr('id', 'lga_image0');
    $('#lga_pic').append(lgThumbnail);

    //image for state
    var staMimeUri = data.get('state_image0');
    var staSrc = '';
    if (staMimeUri !== null && staMimeUri !== "") {
        var staMimeUriObject = JSON.parse(staMimeUri);
        var staUriRelative = staMimeUriObject.uriFragment;
        var staUriAbsolute = control.getFileAsUrl(staUriRelative);
        staSrc = staUriAbsolute;
    }

    var staThumbnail = $('<img>');
    staThumbnail.attr('src', staSrc);
    staThumbnail.attr('class', 'thumbnail');
    staThumbnail.attr('id', 'state_image0');
    $('#state_pic').append(staThumbnail);



    //image for mother name
    var momMimeUri = data.get('mothersname_image0');
    var momSrc = '';
    if (momMimeUri !== null && momMimeUri !== "") {
        var momMimeUriObject = JSON.parse(momMimeUri);
        var momUriRelative = momMimeUriObject.uriFragment;
        var momUriAbsolute = control.getFileAsUrl(momUriRelative);
        momSrc = momUriAbsolute;
    }

    var momThumbnail = $('<img>');
    momThumbnail.attr('src', momSrc);
    momThumbnail.attr('class', 'thumbnail');
    momThumbnail.attr('id', 'mothersname_image0');
    $('#mother_name_pic').append(momThumbnail);

    //image for mother gsm
    var msmMimeUri = data.get('mom_gsm_image0');
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
    msmThumbnail.attr('id', 'mom_gsm_image0');
    $('#mother_gsm_pic').append(msmThumbnail);

    //image for father name
    var dadMimeUri = data.get('fathersname_image0');
    var dadSrc = '';
    if (dadMimeUri !== null && dadMimeUri !== "") {
        var dadMimeUriObject = JSON.parse(dadMimeUri);
        var dadUriRelative = dadMimeUriObject.uriFragment;
        var dadUriAbsolute = control.getFileAsUrl(dadUriRelative);
        dadSrc = dadUriAbsolute;
    }

    var dadThumbnail = $('<img>');
    dadThumbnail.attr('src', dadSrc);
    dadThumbnail.attr('class', 'thumbnail');
    dadThumbnail.attr('id', 'fathersname_image0');
    $('#father_name_pic').append(dadThumbnail);

    //image for father gsm
    var dsmMimeUri = data.get('dad_gsm_image0');
    var dsmSrc = '';
    if (dsmMimeUri !== null && dsmMimeUri !== "") {
        var dsmMimeUriObject = JSON.parse(dsmMimeUri);
        var dsmUriRelative = dsmMimeUriObject.uriFragment;
        var dsmUriAbsolute = control.getFileAsUrl(dsmUriRelative);
        dsmSrc = dsmUriAbsolute;
    }

    var dsmThumbnail = $('<img>');
    dsmThumbnail.attr('src', dsmSrc);
    dsmThumbnail.attr('class', 'thumbnail');
    dsmThumbnail.attr('id', 'dad_gsm_image0');
    $('#father_gsm_pic').append(dsmThumbnail);

    

    //image for other reason bubble
    var orMimeUri = data.get('reasonsforcare_image0');
    var orSrc = '';
    if (orMimeUri !== null && orMimeUri !== "") {
        var orMimeUriObject = JSON.parse(orMimeUri);
        var orUriRelative = orMimeUriObject.uriFragment;
        var orUriAbsolute = control.getFileAsUrl(orUriRelative);
        orSrc = orUriAbsolute;
    }

    var orThumbnail = $('<img>');
    orThumbnail.attr('src', orSrc);
    orThumbnail.attr('class', 'thumbnail');
    orThumbnail.attr('id', 'reasonsforcare_imag0');
    $('#otherreason_pic').append(orThumbnail);


    //image for patient code
    var patcMimeUri = data.get('patient_QRcode_image0');
    var patcSrc = '';
    if (patcMimeUri !== null && patcMimeUri !== "") {
        var patcMimeUriObject = JSON.parse(patcMimeUri);
        var patcUriRelative = patcMimeUriObject.uriFragment;
        var patcUriAbsolute = control.getFileAsUrl(patcUriRelative);
        patcSrc = patcUriAbsolute;
    }

    var patcThumbnail = $('<img>');
    patcThumbnail.attr('src', patcSrc);
    patcThumbnail.attr('class', 'thumbnail');
    patcThumbnail.attr('id', 'patient_QRcode_image0');
    $('#patientcode_pic').append(patcThumbnail);

    var btn = document.createElement("input");
    btn.type = 'button';
    btn.value = 'View vaccination history';
    document.body.appendChild(btn);
    btn.onclick = function() {
        console.log("I am here");
        var pcode = data.get('patient_QRcode');
        var pid = data.get('Child_patient_ID');
        var pname = data.get('Child_name');
        var pbirthdate = data.get('Child_DOB');

        var queryString = scanQueries.getKeysToAppendToURL(pcode, pid, pname, pbirthdate);
        var url = control.getFileAsUrl(
                'assets/immunizationDisplayRecord.html' + queryString);
        window.location.href = url;
    };
}

