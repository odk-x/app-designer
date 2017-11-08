'use strict';

import 'babel-polyfill';
import 'whatwg-fetch';

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

async function convert(requestId) {
    let xlsxFiles = await (await fetch(`/xlsx/${requestId}`)).json();

    let uploadPromises = xlsxFiles.map(async f => {
        let base64Xlsx = await fetch(`/xlsx/${requestId}/${encodeURIComponent(f)}`);

        let jsonXlsx = to_json(XLSX.read(await base64Xlsx.text(), {type: 'base64'}));
        let formDef = processJSONWb(jsonXlsx);
        formDef.warning = getWarnings() || [];

        let dtm = formDef.specification.dataTableModel;
        let tableId = getTableIdFromFormDef(formDef);
        let formId = getFormIdFromFormDef(formDef);
        let shouldWriteCsv = shouldWriteDefAndPropCsv(formDef);

        let form = new FormData();
        form.append('formDef.json', JSON.stringify(formDef));
        form.append('definition.csv', shouldWriteCsv ? createDefCsv(dtm) : "");
        form.append('properties.csv', shouldWriteCsv ? createPropCsv(dtm, formDef) : "");
        form.append('tableSpecificDefinitions.js', shouldWriteDefJs(formDef) ? createDefJs(tableId, formDef) : "");

        return fetch(`/xlsx/${requestId}/${encodeURIComponent(f)}/${encodeURIComponent(tableId)}/${encodeURIComponent(formId)}`, {
            method: 'POST',
            body: form
        });
    });

    await Promise.all(uploadPromises);
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

convert(window.location.hash.substring(1));
