/**
 * The file for displaying a detail view.
 */
/* global $, control, d3, data */
'use strict';

// Handle the case where we are debugging in chrome.
if (JSON.parse(control.getPlatformInfo()).container === 'Chrome') {
    console.log('Welcome to Tables debugging in Chrome!');
    $.ajax({
        url: control.getFileAsUrl('output/debug/scan_register_patient_row_data.json'),
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
    $('#NAME').text(data.get('Name'));
    addImageToDiv('#Name_image', 'Name_image0');

    $('#Age').text(data.get('Age'));
    addImageToDiv('#Age_image', 'Age_image0');

    $('#sex').text(data.get('sex'));
    addImageToDiv('#sex_image', 'sex_image0');

    $('#albendazole').text(data.get('albendazole'));
    addImageToDiv('#albendazole_image', 'albendazole_image0');

    $('#septrin_tablets').text(data.get('septrin_tablets'));
    addImageToDiv('#septrin_tablets_image', 'septrin_tablets_image0');

    $('#septrin_syrup').text(data.get('septrin_syrup'));
    addImageToDiv('#septrin_syrup_image', 'septrin_syrup_image0');

    $('#benzyl_benzoate').text(data.get('benzyl_benzoate'));
    addImageToDiv('#benzyl_benzoate_image', 'benzyl_benzoate_image0');

    $('#iron_folicacid').text(data.get('iron_folicacid'));
    addImageToDiv('#iron_folicacid_image', 'iron_folicacid_image0');

    $('#multivitamin').text(data.get('multivitamin'));
    addImageToDiv('#multivitamin_image', 'multivitamin_image0');

    $('#MMT').text(data.get('MMT'));
    addImageToDiv('#MMT_image', 'MMT_image0');

    $('#ORS').text(data.get('ORS'));
    addImageToDiv('#ORS_image', 'ORS_image0');

    $('#paracet_tablets').text(data.get('paracet_tablets'));
    addImageToDiv('#paracet_tablets_image', 'paracet_tablets_image0');

    $('#paracet_syrup').text(data.get('paracet_syrup'));
    addImageToDiv('#paracet_syrup_image', 'paracet_syrup_image0');

    $('#ACT_pack12').text(data.get('ACT_pack12'));
    addImageToDiv('#ACT_pack12_image', 'ACT_pack12_image0');

    $('#ACT_pack6').text(data.get('ACT_pack6'));
    addImageToDiv('#ACT_pack6_image', 'ACT_pack6_image0');

    $('#referral_symptoms').text(data.get('referral_symptoms'));
    addImageToDiv('#referral_symptoms_image', 'referral_symptoms_image0');
}

function addImageToDiv(nameOfDivToAddImageTo, nameOfImage)
{
    var uriRelative = data.get(nameOfImage + '.uriFragment');
    var uriSrc = '';
    if (uriRelative !== null && uriRelative !== "") {
        var uriAbsolute = control.getRowFileAsUrl(data.getTableId(), data.getRowId(0), uriRelative);
        uriSrc = uriAbsolute;
    }
    var uriThumbnail = $('<img>');
    uriThumbnail.attr('src', uriSrc);
    uriThumbnail.attr('class', 'thumbnail');
    uriThumbnail.attr('id', nameOfImage);
    $(nameOfDivToAddImageTo).append(uriThumbnail);

}

