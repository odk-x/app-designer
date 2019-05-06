'use strict';

import * as _ from 'lodash';
import * as XLSX from 'xlsx';

import * as XLSXConverter from './lib/XLSXConverter2';
import * as devenv from './lib/devenv-util';

export async function convert(xlsx) {
    let parsedXlsx = XLSX.read(xlsx, { type: 'array' });
    let xlsxJson = to_json(parsedXlsx);

    let formDef = XLSXConverter.processJSONWb(xlsxJson);
    let warnings = XLSXConverter.getWarnings() || [];

    let dtm = formDef.specification.dataTableModel;
    let tableId = devenv.getTableIdFromFormDef(formDef);
    let formId = devenv.getFormIdFromFormDef(formDef);
    let shouldWriteCsv = devenv.shouldWriteOutDefinitionAndPropertiesCsv(formDef);

    return {
        'formDef': JSON.stringify(formDef),
        'warnings': warnings,
        'tableId': tableId,
        'formId': formId,
        'definition': shouldWriteCsv ?
          devenv.createDefinitionCsvFromDataTableModel(dtm) : null,
        'properties': shouldWriteCsv ?
          devenv.createPropertiesCsvFromDataTableModel(dtm, formDef) : null,
        'tableSpecificDefinitions': devenv.shouldWriteOutDefinitionsJs(formDef) ?
          devenv.createDefinitionsJsFromDataTableModel(tableId, formDef) : null
    }
}

function to_json(workbook) {
    let result = {};

    _.each(workbook.SheetNames, function(sheetName) {
        let rObjArr = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {raw: true});

        let outArr = [];
        _.each(rObjArr, function(row) {
            let outRow = Object.create({__rowNum__: row.__rowNum__});

            _.each(row, function(value, key) {
                if(_.isString(value) && value.trim() === "") {
                    return;
                }
                outRow[key] = value;
            });

            if(_.keys(outRow).length > 0) {
                outArr.push(outRow);
            }
        });

        if(outArr.length > 0){
            result[sheetName] = outArr;
        }
    });

    return result;
}
