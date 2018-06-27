'use strict';

import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser'
import multer from 'multer'
import _ from 'lodash';
import XLSX from 'xlsx'

import XLSXConverter from './js/XLSXConverter2'

const app = express();
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

router.route('/xlsx')
    .post(upload.single('xlsx'), (req, res) => {
        let workbook = XLSX.read(req.file.buffer.toString('binary'), {type: 'binary'});

        function to_json(workbook) {
            let result = {};
            _.each(workbook.SheetNames, function(sheetName) {
                let rObjArr = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName], {raw: true});

                function removeEmptyStrings(rObjArr) {
                    const outArr = [];
                    _.each(rObjArr, function (row) {
                        const outRow = Object.create(row.__proto__);
                        _.each(row, function (value, key) {
                            if (_.isString(value) && value.trim() === "") {
                                return;
                            }
                            outRow[key] = value;
                        });
                        if (_.keys(outRow).length > 0) {
                            outArr.push(outRow);
                        }
                    });
                    return outArr;
                }

                rObjArr = removeEmptyStrings(rObjArr);
                if(rObjArr.length > 0){
                    result[sheetName] =  rObjArr;
                }
            });
            return result;
        }

        let workbook_js = to_json(workbook);

        let processed = XLSXConverter.processJSONWb(workbook_js);
        processed.warnings = XLSXConverter.getWarnings() || [];
        res.send(processed);
    });

app.use('/', router);
app.listen(3000, () => console.log('XLSXConverterApi listening on port 3000.'));
