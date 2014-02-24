/**
 * These are mocha tests that ensure input functionality is correct using
 * Collect and Survey. It should be run along with inputTests.html and
 * links.js. Following the links and the instructions in the links should each
 * cause a new test to pass. All the links should result in all the tests 
 * passing.
 *
 * The csv Tea_houses_editable.csv should be imported with the tableId
 * Tea_houses_editable.
 */
/* global describe, it, chai, data */
'use strict';

describe('Collect Methods', function() {

    var assert = chai.assert;

    it('#add default: State contains alpha', function() {
        var columnStr = data.getColumnData('State');
        var column = JSON.parse(columnStr);
        assert.include(column, 'alpha', 'not present: ' + column);
    });

    it('#add custom: State contains beta', function() {
        var columnStr = data.getColumnData('State');
        var column = JSON.parse(columnStr);
        assert.include(column, 'beta', 'not present: ' + column);
    });

    it('#add values: Name contains collectNameDefault', function() {
        var columnStr = data.getColumnData('Name');
        var column = JSON.parse(columnStr);
        assert.include(column, 'collectNameDefault', 'not present: ' + column);
    });

    it('#add values: Customers contains 987', function() {
        var columnStr = data.getColumnData('Customers');
        var column = JSON.parse(columnStr);
        assert.include(column, '987', 'not present: ' + column);
    });


    it('#add values: Name contains collectName', function() {
        var columnStr = data.getColumnData('Name');
        var column = JSON.parse(columnStr);
        assert.include(column, 'collectName', 'not present: ' + column);
    });

    it('#add values: Customers contains 333', function() {
        var columnStr = data.getColumnData('Customers');
        var column = JSON.parse(columnStr);
        assert.include(column, '333', 'not present: ' + column);
    });

    it('#add unicode saves correctly', function() {
        var columnStr = data.getColumnData('Name');
        var column = JSON.parse(columnStr);
        var target = 'Testing Collect «ταБЬℓσ»: 1<2 & 4+1>3, now" 20% off!';
        assert.include(column, target, 'unicode not present: ' + column);
    });

    it('#edit default: State contains gamma', function() {
        var columnStr = data.getColumnData('State');
        var column = JSON.parse(columnStr);
        assert.include(column, 'gamma', 'not present: ' + column);
    });

    it('#edit custom: State contains delta', function() {
        var columnStr = data.getColumnData('State');
        var column = JSON.parse(columnStr);
        assert.include(column, 'delta', 'not present: ' + column);
    });

});

describe('Survey Methods', function() {
    
    var assert = chai.assert;

    it('#add default: State contains epsilon', function() {
        var columnStr = data.getColumnData('State');
        var column = JSON.parse(columnStr);
        assert.include(column, 'epsilon', 'not present: ' + column);
    });

    it('#add custom: State contains zeta', function() {
        var columnStr = data.getColumnData('State');
        var column = JSON.parse(columnStr);
        assert.include(column, 'zeta', 'not present: ' + column);
    });

    it('#add values: Name contains surveyName', function() {
        var columnStr = data.getColumnData('Name');
        var column = JSON.parse(columnStr);
        assert.include(column, 'surveyName', 'not present: ' + column);
    });

    it('#add values: Customers contains 111', function() {
        var columnStr = data.getColumnData('Customers');
        var column = JSON.parse(columnStr);
        assert.include(column, '111', 'not present: ' + column);
    });

    it('#add custom values: Name contains surveyName2', function() {
        var columnStr = data.getColumnData('Name');
        var column = JSON.parse(columnStr);
        assert.include(column, 'surveyName2', 'not present: ' + column);
    });

    it('#add customvalues: Customers contains 222', function() {
        var columnStr = data.getColumnData('Customers');
        var column = JSON.parse(columnStr);
        assert.include(column, '222', 'not present: ' + column);
    });

    it('#add custom unicode saved correctly', function() {
        var columnStr = data.getColumnData('Name');
        var column = JSON.parse(columnStr);
        var target = 'Testing Survey «ταБЬℓσ»: 1<2 & 4+1>3, now" 20% off!';
        assert.include(column, target, 'not present: ' + column);
    });

    it('#add custom screenPath: State contains screenPath', function() {
        var columnStr = data.getColumnData('State');
        var column = JSON.parse(columnStr);
        assert.include(column, 'screenPath', 'not present: ' + column);
    });

    it('#edit default: State contains eta', function() {
        var columnStr = data.getColumnData('State');
        var column = JSON.parse(columnStr);
        assert.include(column, 'eta', 'not present: ' + column);
    });

    it('#edit custom: State contains theta', function() {
        var columnStr = data.getColumnData('State');
        var column = JSON.parse(columnStr);
        assert.include(column, 'theta', 'not present: ' + column);
    });

    it('#edit custom screenpath: State contains iota', function() {
        var columnStr = data.getColumnData('State');
        var column = JSON.parse(columnStr);
        assert.include(column, 'iota', 'not present: ' + column);
    });


});
