/**
 * The file for displaying a detail view.
 */
/* global $, control, d3, data */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/scan_p1_data.json'),
        async: false,  // do it first
        success: function(dataObj) {
            if (dataObj === undefined || dataObj === null) {
                console.log('Could not load data json for table: scan_page1');
            }
            window.data.setBackingObject(dataObj);
        }
    });
}

var rowId;
 
function display() {
    // Perform your modification of the HTML page here and call display() in
    // the body of your .html file.
    $('#card_number').text(data.get('cardnum'));
    $('#emergency_contact').text(data.get('emergency'));
    $('#CHILD_NAME').text(data.get('name'));
    $('#CHILD_ID').text(data.get('childid'));
    $('#CHILD_BIRTHDATE').text(data.get('birthdate'));
    $('#child_weight').text(data.get('weight'));
    $('#child_sex').text(data.get('sex'));
    $('#house_number').text(data.get('housenum'));
    $('#village_settlement').text(data.get('village'));
    $('#town_city').text(data.get('city'));
    $('#ward_name').text(data.get('ward'));
    $('#lga_name').text(data.get('lga'));
    $('#state_name').text(data.get('state'));
    $('#mom_name').text(data.get('momname'));
    $('#mom_gsm').text(data.get('momgsm'));
    $('#dad_name').text(data.get('dadname'));
    $('#dad_gsm').text(data.get('dadgsm'));
    $('#birth_weight').text(data.get('lessthan2_5kg'));
    $('#has_twin').text(data.get('twin'));
    $('#bottle_fed').text(data.get('bottlefed'));
    $('#family_support').text(data.get('familysupport'));
    $('#sibbling_underweight').text(data.get('sibblingunderweight'));
    $('#other_reasons').text(data.get('specialcare'));
    $('#patient_code').text(data.get('patientcode'));

    //image for card number
    var cardMimeUri = data.get('cardnum_image_0');
    var cardSrc = '';
    if (cardMimeUri !== null && cardMimeUri !== "") {
        var cardMimeUriObject = JSON.parse(cardMimeUri);
        var cardUriRelative = cardMimeUriObject.uriFragment;
        var cardUriAbsolute = control.getFileAsUrl(cardUriRelative);
        cardSrc = cardUriAbsolute;
    }

    var cardThumbnail = $('<img>');
    cardThumbnail.attr('src', cardSrc);
    cardThumbnail.attr('class', 'thumbnail');
    cardThumbnail.attr('id', 'cardnum_image_0');
    $('#cardnum_pic').append(cardThumbnail);


    //image for emergency contact
    var emMimeUri = data.get('emergency_image_0');
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
    emThumbnail.attr('id', 'emergency_image_0');
    $('#emergency_pic').append(emThumbnail);


    //image for child name
    var nameMimeUri = data.get('name_image_0');
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
    nameThumbnail.attr('id', 'name_image_0');
    $('#name_pic').append(nameThumbnail);

    //image for child id
    var idMimeUri = data.get('childid_image_0');
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
    idThumbnail.attr('id', 'childid_image_0');
    $('#childid_pic').append(idThumbnail);

    //image for child birthdate
    var birthMimeUri = data.get('birthdate_image_0');
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
    birthThumbnail.attr('id', 'birthdate_image_0');
    $('#birthdate_pic').append(birthThumbnail);

    //image for child weight
    var weMimeUri = data.get('weight_image_0');
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
    weThumbnail.attr('id', 'weight_image_0');
    $('#weight_pic').append(weThumbnail);

    //image for child sex
    var seMimeUri = data.get('sex_image_0');
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
    seThumbnail.attr('id', 'sex_image_0');
    $('#sex_pic').append(seThumbnail);

    //image for house number
    var hnMimeUri = data.get('housenum_image_0');
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
    hnThumbnail.attr('id', 'housenum_image_0');
    $('#housenum_pic').append(hnThumbnail);

    //image for village/settlement
    var viMimeUri = data.get('village_image_0');
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
    viThumbnail.attr('id', 'village_image_0');
    $('#village_pic').append(viThumbnail);

    //image for town/city
    var tcMimeUri = data.get('city_image_0');
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
    tcThumbnail.attr('id', 'city_image_0');
    $('#city_pic').append(tcThumbnail);

    //image for ward
    var waMimeUri = data.get('ward_image_0');
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
    waThumbnail.attr('id', 'ward_image_0');
    $('#ward_pic').append(waThumbnail);

    //image for lga
    var lgMimeUri = data.get('lga_image_0');
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
    lgThumbnail.attr('id', 'lga_image_0');
    $('#lga_pic').append(lgThumbnail);

    //image for state
    var staMimeUri = data.get('state_image_0');
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
    staThumbnail.attr('id', 'state_image_0');
    $('#state_pic').append(staThumbnail);



    //image for mother name
    var momMimeUri = data.get('momname_image_0');
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
    momThumbnail.attr('id', 'momimage_0');
    $('#mother_name_pic').append(momThumbnail);

    //image for mother gsm
    var msmMimeUri = data.get('momgsm_image_0');
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
    msmThumbnail.attr('id', 'momgsm_image_0');
    $('#mother_gsm_pic').append(msmThumbnail);

    //image for father name
    var dadMimeUri = data.get('dadname_image_0');
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
    dadThumbnail.attr('id', 'dadname_image_0');
    $('#father_name_pic').append(dadThumbnail);

    //image for father gsm
    var dsmMimeUri = data.get('dadgsm_image_0');
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
    dsmThumbnail.attr('id', 'dadgsm_image_0');
    $('#father_gsm_pic').append(dsmThumbnail);

    //image for less than 2.5kg bubble
    var lessMimeUri = data.get('lessthan2_5kg_image_0');
    var lessSrc = '';
    if (lessMimeUri !== null && lessMimeUri !== "") {
        var lessMimeUriObject = JSON.parse(lessMimeUri);
        var lessUriRelative = lessMimeUriObject.uriFragment;
        var lessUriAbsolute = control.getFileAsUrl(lessUriRelative);
        lessSrc = lessUriAbsolute;
    }

    var lessThumbnail = $('<img>');
    lessThumbnail.attr('src', lessSrc);
    lessThumbnail.attr('class', 'thumbnail');
    lessThumbnail.attr('id', 'lessthan2_5kg_image_0');
    $('#lessthan2_5kg_pic').append(lessThumbnail);

    //image for twin bubble
    var twMimeUri = data.get('twin_image_0');
    var twSrc = '';
    if (twMimeUri !== null && twMimeUri !== "") {
        var twMimeUriObject = JSON.parse(twMimeUri);
        var twUriRelative = twMimeUriObject.uriFragment;
        var twUriAbsolute = control.getFileAsUrl(twUriRelative);
        twSrc = twUriAbsolute;
    }

    var twThumbnail = $('<img>');
    twThumbnail.attr('src', twSrc);
    twThumbnail.attr('class', 'thumbnail');
    twThumbnail.attr('id', 'twin_image_0');
    $('#twin_pic').append(twThumbnail);

    //image for bottle fed bubble
    var bfMimeUri = data.get('bottlefed_image_0');
    var bfSrc = '';
    if (bfMimeUri !== null && bfMimeUri !== "") {
        var bfMimeUriObject = JSON.parse(bfMimeUri);
        var bfUriRelative = bfMimeUriObject.uriFragment;
        var bfUriAbsolute = control.getFileAsUrl(bfUriRelative);
        bfSrc = bfUriAbsolute;
    }

    var bfThumbnail = $('<img>');
    bfThumbnail.attr('src', bfSrc);
    bfThumbnail.attr('class', 'thumbnail');
    bfThumbnail.attr('id', 'bottlefed_image_0');
    $('#bottlefed_pic').append(bfThumbnail);

    //image for family support
    var fsMimeUri = data.get('familysupport_image_0');
    var fsSrc = '';
    if (fsMimeUri !== null && fsMimeUri !== "") {
        var fsMimeUriObject = JSON.parse(fsMimeUri);
        var fsUriRelative = fsMimeUriObject.uriFragment;
        var fsUriAbsolute = control.getFileAsUrl(fsUriRelative);
        fsSrc = fsUriAbsolute;
    }

    var fsThumbnail = $('<img>');
    fsThumbnail.attr('src', fsSrc);
    fsThumbnail.attr('class', 'thumbnail');
    fsThumbnail.attr('id', 'familysupport_image_0');
    $('#familysupport_pic').append(fsThumbnail);

    //image for sibbling underweight
    var suMimeUri = data.get('sibblingunderweight_image_0');
    var suSrc = '';
    if (suMimeUri !== null && suMimeUri !== "") {
        var suMimeUriObject = JSON.parse(suMimeUri);
        var suUriRelative = suMimeUriObject.uriFragment;
        var suUriAbsolute = control.getFileAsUrl(suUriRelative);
        suSrc = suUriAbsolute;
    }

    var suThumbnail = $('<img>');
    suThumbnail.attr('src', suSrc);
    suThumbnail.attr('class', 'thumbnail');
    suThumbnail.attr('id', 'sibblingunderweight_image_0');
    $('#sibblingunderweight_pic').append(suThumbnail);

    //image for other reason bubble
    var orMimeUri = data.get('specialcare_image_0');
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
    orThumbnail.attr('id', 'specialcare_image_0');
    $('#otherreason_pic').append(orThumbnail);


    //image for patient code
    var patcMimeUri = data.get('patientcode_image_0');
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
    patcThumbnail.attr('id', 'patientcode_image_0');
    $('#patientcode_pic').append(patcThumbnail);

    //Prefetch the next page of the child's record
    /*var patientcode = data.get('patientcode');
    var whereClause = 'qr_patientcode = ?';
    var selectionArgs = [patientcode];
    var results = control.query(
            'scan_page2',
            whereClause,
            selectionArgs);

    console.log('patientcode ' + patientcode);

    if (results.getCount()==0) {
        console.log("No records found");
    }
    if (results.getCount()==1) {
        rowId = results.getRowId(0);
        console.log("rowId is " + rowId);
    }
    else {
        console.log("More than one record found");
    }*/

    $('#display-detail').on('click', function() {
        var pcode = data.get('patientcode');
        var pid = data.get('childid');
        var pname = data.get('name');
        var pbirthdate = data.get('birthdate');

        var queryString = scanQueries.getKeysToAppendToURL(pcode, pid, pname, pbirthdate);
        var url = control.getFileAsUrl(
                'assets/immunizationDisplayRecord.html' + queryString);
        window.location.href = url;
    });
}

