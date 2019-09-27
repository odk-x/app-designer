/* global odkData*/
/**
 * Various functions for displaying health facility type
 */
'use strict';

var healthFacilityTypeUtil = {};

// Get values relevant for facility type
healthFacilityTypeUtil.appendHealthFacilityOptions = async function(typeSelectElement) {
    var locale = odkCommon.getPreferredLocale();

    var healthFacilityResult = await util.getOneFacilityRow();
    var healthFacilityTypeChoices = healthFacilityResult.getColumnChoicesList(util.facilityType);
    for (var i = 0; i < healthFacilityTypeChoices.length; i++) {
        var healthFacilityTypeVal = healthFacilityTypeChoices[i].data_value;
        var healthFacilityTypeName = odkCommon.localizeText(locale, healthFacilityTypeChoices[i].display.title);

        var typeOp = $('<option>');
        typeOp.attr('id', healthFacilityTypeVal);
        typeOp.attr('value', healthFacilityTypeVal);
        typeOp.text(healthFacilityTypeName);

        $(typeSelectElement).append(typeOp);
    }
}
