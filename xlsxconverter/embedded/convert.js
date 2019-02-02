'use strict';

import _ from 'lodash';
import XLSX from 'xlsx';

import { processJSONWb, getWarnings } from './lib/XLSXConverter2';
import {
    removeEmptyStrings,
    shouldWriteOutDefinitionAndPropertiesCsv as shouldWriteDefAndPropCsv,
    shouldWriteOutDefinitionsJs as shouldWriteDefJs,
    createDefinitionCsvFromDataTableModel as createDefCsv,
    createPropertiesCsvFromDataTableModel as createPropCsv,
    createDefinitionsJsFromDataTableModel as createDefJs,
    getTableIdFromFormDef,
    getFormIdFromFormDef
} from './lib/devenv-util';

export function convert(xlsxBase64) {
    let xlsx = XLSX.read(xlsxBase64, {type: 'base64'});
    let xlsxJson = to_json(xlsx);

    let formDef = processJSONWb(xlsxJson);
    let warnings = getWarnings() || [];

    let dtm = formDef.specification.dataTableModel;
    let tableId = getTableIdFromFormDef(formDef);
    let formId = getFormIdFromFormDef(formDef);
    let shouldWriteCsv = shouldWriteDefAndPropCsv(formDef);

    return {
        'formDef.json': JSON.stringify(formDef),
        'warnings': warnings,
        'tableId': tableId,
        'formId': formId,
        'definition.csv': shouldWriteCsv ? createDefCsv(dtm) : null,
        'properties.csv': shouldWriteCsv ? createPropCsv(dtm, formDef) : null,
        'tableSpecificDefinitions.js': shouldWriteDefJs(formDef) ? createDefJs(tableId, formDef) : null
    }
}

function to_json(workbook) {
    let result = {};

    _.each(workbook.SheetNames, function(sheetName) {
        let rObjArr = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName], {raw: true});

        rObjArr = removeEmptyStrings(rObjArr);
        if(rObjArr.length > 0){
            result[sheetName] = rObjArr;
        }
    });

    return result;
}
