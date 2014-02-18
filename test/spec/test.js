/* global describe, it */

/* global define, describe, it */
'use strict';
define(['../app/tables/test/scripts/model/control/control_0-0-0.js'],
    function(control) {
        console.log('in test, control: ' + control);

        describe('testing presence of control object', function() {
            
            it('trying to open table', function() {
                control.openTable();
            });

        });
    }
);
//(function () {
    //'use strict';

    //describe('Give it some context', function () {
        //describe('maybe a bit more context here', function () {
            //it('should run here few assertions', function () {

            //});
        //});
    //});
//})();
