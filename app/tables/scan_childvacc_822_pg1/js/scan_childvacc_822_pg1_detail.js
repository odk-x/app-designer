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
    var emUriRelative = data.get('Emergency_contact_image0.uriFragment');
    var emSrc = '';
    if (emUriRelative !== null && emUriRelative !== "") {
        var emUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), emUriRelative);
        emSrc = emUriAbsolute;
    }

    var emThumbnail = $('<img>');
    emThumbnail.attr('src', emSrc);
    emThumbnail.attr('class', 'thumbnail');
    emThumbnail.attr('id', 'Emergency_contact_image0');
    $('#emergency_pic').append(emThumbnail);


    //image for child name
    var nameUriRelative = data.get('Child_name_image0.uriFragment');
    var nameSrc = '';
    if (nameUriRelative !== null && nameUriRelative !== "") {
        var nameUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), nameUriRelative);
        nameSrc = nameUriAbsolute;
    }

    var nameThumbnail = $('<img>');
    nameThumbnail.attr('src', nameSrc);
    nameThumbnail.attr('class', 'thumbnail');
    nameThumbnail.attr('id', 'Child_name_image0');
    $('#name_pic').append(nameThumbnail);

    //image for child id
    var idUriRelative = data.get('Child_patient_ID_image0.uriFragment');
    var idSrc = '';
    if (idUriRelative !== null && idUriRelative !== "") {
        var idUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), idUriRelative);
        idSrc = idUriAbsolute;
    }

    var idThumbnail = $('<img>');
    idThumbnail.attr('src', idSrc);
    idThumbnail.attr('class', 'thumbnail');
    idThumbnail.attr('id', 'Child_patient_ID_image0');
    $('#childid_pic').append(idThumbnail);

    //image for child birthdate
    var birthUriRelative = data.get('Child_DOB_image0.uriFragment');
    var birthSrc = '';
    if (birthUriRelative !== null && birthUriRelative !== "") {
        var birthUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), birthUriRelative);
        birthSrc = birthUriAbsolute;
    }

    var birthThumbnail = $('<img>');
    birthThumbnail.attr('src', birthSrc);
    birthThumbnail.attr('class', 'thumbnail');
    birthThumbnail.attr('id', 'Child_DOB_image0');
    $('#birthdate_pic').append(birthThumbnail);

    //image for child weight
    var weUriRelative = data.get('Birth_weight_image0.uriFragment');
    var weSrc = '';
    if (weUriRelative !== null && weUriRelative !== "") {
        var weUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), weUriRelative);
        weSrc = weUriAbsolute;
    }

    var weThumbnail = $('<img>');
    weThumbnail.attr('src', weSrc);
    weThumbnail.attr('class', 'thumbnail');
    weThumbnail.attr('id', 'Birth_weight_image0');
    $('#birth_weight_pic').append(weThumbnail);

    //image for child sex
    var seUriRelative = data.get('sex_image0.uriFragment');
    var seSrc = '';
    if (seUriRelative !== null && seUriRelative !== "") {
        var seUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), seUriRelative);
        seSrc = seUriAbsolute;
    }

    var seThumbnail = $('<img>');
    seThumbnail.attr('src', seSrc);
    seThumbnail.attr('class', 'thumbnail');
    seThumbnail.attr('id', 'sex_image0');
    $('#sex_pic').append(seThumbnail);

    //image for house number
    var hnUriRelative = data.get('housenum_image0.uriFragment');
    var hnSrc = '';
    if (hnUriRelative !== null && hnUriRelative !== "") {
        var hnUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), hnUriRelative);
        hnSrc = hnUriAbsolute;
    }

    var hnThumbnail = $('<img>');
    hnThumbnail.attr('src', hnSrc);
    hnThumbnail.attr('class', 'thumbnail');
    hnThumbnail.attr('id', 'housenum_image0');
    $('#housenum_pic').append(hnThumbnail);

    //image for village/settlement
    var viUriRelative = data.get('village_image0.uriFragment');
    var viSrc = '';
    if (viUriRelative !== null && viUriRelative !== "") {
        var viUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), viUriRelative);
        viSrc = viUriAbsolute;
    }

    var viThumbnail = $('<img>');
    viThumbnail.attr('src', viSrc);
    viThumbnail.attr('class', 'thumbnail');
    viThumbnail.attr('id', 'village_image0');
    $('#village_pic').append(viThumbnail);

    //image for town/city
    var tcUriRelative = data.get('city_image0.uriFragment');
    var tcSrc = '';
    if (tcUriRelative !== null && tcUriRelative !== "") {
        var tcUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), tcUriRelative);
        tcSrc = tcUriAbsolute;
    }

    var tcThumbnail = $('<img>');
    tcThumbnail.attr('src', tcSrc);
    tcThumbnail.attr('class', 'thumbnail');
    tcThumbnail.attr('id', 'city_image0');
    $('#city_pic').append(tcThumbnail);

    //image for ward
    var waUriRelative = data.get('ward_image0.uriFragment');
    var waSrc = '';
    if (waUriRelative !== null && waUriRelative !== "") {
        var waUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), waUriRelative);
        waSrc = waUriAbsolute;
    }

    var waThumbnail = $('<img>');
    waThumbnail.attr('src', waSrc);
    waThumbnail.attr('class', 'thumbnail');
    waThumbnail.attr('id', 'ward_image0');
    $('#ward_pic').append(waThumbnail);

    //image for lga
    var lgUriRelative = data.get('lga_image0.uriFragment');
    var lgSrc = '';
    if (lgUriRelative !== null && lgUriRelative !== "") {
        var lgUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), lgUriRelative);
        lgSrc = lgUriAbsolute;
    }

    var lgThumbnail = $('<img>');
    lgThumbnail.attr('src', lgSrc);
    lgThumbnail.attr('class', 'thumbnail');
    lgThumbnail.attr('id', 'lga_image0');
    $('#lga_pic').append(lgThumbnail);

    //image for state
    var staUriRelative = data.get('state_image0.uriFragment');
    var staSrc = '';
    if (staUriRelative !== null && staUriRelative !== "") {
        var staUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), staUriRelative);
        staSrc = staUriAbsolute;
    }

    var staThumbnail = $('<img>');
    staThumbnail.attr('src', staSrc);
    staThumbnail.attr('class', 'thumbnail');
    staThumbnail.attr('id', 'state_image0');
    $('#state_pic').append(staThumbnail);



    //image for mother name
    var momUriRelative = data.get('mothersname_image0.uriFragment');
    var momSrc = '';
    if (momUriRelative !== null && momUriRelative !== "") {
        var momUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), momUriRelative);
        momSrc = momUriAbsolute;
    }

    var momThumbnail = $('<img>');
    momThumbnail.attr('src', momSrc);
    momThumbnail.attr('class', 'thumbnail');
    momThumbnail.attr('id', 'mothersname_image0');
    $('#mother_name_pic').append(momThumbnail);

    //image for mother gsm
    var msmUriRelative = data.get('mom_gsm_image0.uriFragment');
    var msmSrc = '';
    if (msmUriRelative !== null && msmUriRelative !== "") {
        var msmUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), msmUriRelative);
        msmSrc = msmUriAbsolute;
    }

    var msmThumbnail = $('<img>');
    msmThumbnail.attr('src', msmSrc);
    msmThumbnail.attr('class', 'thumbnail');
    msmThumbnail.attr('id', 'mom_gsm_image0');
    $('#mother_gsm_pic').append(msmThumbnail);

    //image for father name
    var dadUriRelative = data.get('fathersname_image0.uriFragment');
    var dadSrc = '';
    if (dadUriRelative !== null && dadUriRelative !== "") {
        var dadUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), dadUriRelative);
        dadSrc = dadUriAbsolute;
    }

    var dadThumbnail = $('<img>');
    dadThumbnail.attr('src', dadSrc);
    dadThumbnail.attr('class', 'thumbnail');
    dadThumbnail.attr('id', 'fathersname_image0');
    $('#father_name_pic').append(dadThumbnail);

    //image for father gsm
    var dsmUriRelative = data.get('dad_gsm_image0.uriFragment');
    var dsmSrc = '';
    if (dsmUriRelative !== null && dsmUriRelative !== "") {
        var dsmUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), dsmUriRelative);
        dsmSrc = dsmUriAbsolute;
    }

    var dsmThumbnail = $('<img>');
    dsmThumbnail.attr('src', dsmSrc);
    dsmThumbnail.attr('class', 'thumbnail');
    dsmThumbnail.attr('id', 'dad_gsm_image0');
    $('#father_gsm_pic').append(dsmThumbnail);

    

    //image for other reason bubble
    var orUriRelative = data.get('reasonsforcare_image0.uriFragment');
    var orSrc = '';
    if (orUriRelative !== null && orUriRelative !== "") {
        var orUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), orUriRelative);
        orSrc = orUriAbsolute;
    }

    var orThumbnail = $('<img>');
    orThumbnail.attr('src', orSrc);
    orThumbnail.attr('class', 'thumbnail');
    orThumbnail.attr('id', 'reasonsforcare_imag0');
    $('#otherreason_pic').append(orThumbnail);


    //image for patient code
    var patcUriRelative = data.get('patient_QRcode_image0.uriFragment');
    var patcSrc = '';
    if (patcUriRelative !== null && patcUriRelative !== "") {
        var patcUriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), patcUriRelative);
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
    var div = document.getElementById("button");
    //document.body.appendChild(btn);
    div.appendChild(btn);
    btn.onclick = function() {
        console.log("I am here");
        var pcode = data.get('patient_QRcode');
        var pid = data.get('Child_patient_ID');
        var pname = data.get('Child_name');
        var pbirthdate = data.get('Child_DOB');

        var queryString = scanQueries.getKeysToAppendToURL(pcode, pid, pname, pbirthdate);
        var url = control.getFileAsUrl('assets/immunizationDisplayRecord.html') + queryString;
        window.location.href = url;
    };
}

