/**
 * The control object has some functionality (launching Collect and Survey and
 * launching tables) that we can't easily test in Mocha. This script should
 * append links that we then click through by hand to get it working.
 */
/* global $, control, data */
'use strict';

var getAnchor = function() {
    var anchor = $('<a>');
    anchor.attr('href', '#');
    return anchor;
};

/**
 * Adds an element to the links div and adds a <br> to keep them on individual
 * lines.
 */
var appendElement = function(href) {
    var linksDiv = $('#links');
    linksDiv.append(href);
    linksDiv.append($('<br>'));
};

var htmlTitle = $('<h1>');
htmlTitle.text('Html Methods');
appendElement(htmlTitle);

// open table to list view default
var listViewDefault = getAnchor();
listViewDefault.text('Open Tea_inventory with default');
listViewDefault.click(function() {
    control.openTableToListView('Tea_inventory', null, null, null);
});
appendElement(listViewDefault);

var listViewCustom = getAnchor();
listViewCustom.text('Open Tea_inventory LIST with specific file');
listViewCustom.click(function() {
    control.openTableToListView(
        'Tea_inventory',
        null,
        null,
        'framework/tables/test/html/Tea_inventory_list.html');
});
appendElement(listViewCustom);

// Open a file that is actually a detail view just to show that we can open
// arbitrary files.
var listViewMismatch = getAnchor();
listViewMismatch.text('Open Tea_houses DETAIL USING LIST method');
listViewMismatch.click(function() {
    control.openTableToListView(
        'Tea_houses_editable',
        null,
        null,
        'framework/tables/test/html/Tea_houses_detail.html');
});
appendElement(listViewMismatch);

// Open a file that is actually a list view with detail view to show that
// we can open arbitrary files.
var detailViewMismatch = getAnchor();
detailViewMismatch.text('Open Tea_houses LIST USING DETAIL method');
detailViewMismatch.click(function() {
    control.openDetailView(
        'Tea_houses_editable',
        data.getRowId(0),
        'framework/tables/test/html/Tea_houses_list.html');
});
appendElement(detailViewMismatch);

// These are the links that will test the functionality of the collect methods.

var collectTitle = $('<h1>');
collectTitle.text('Collect Methods');
appendElement(collectTitle);

var addCollectDefault = getAnchor();
addCollectDefault.text('ADD ROW COLLECT DEFAULT: State = alpha');
addCollectDefault.click(function() {
    control.addRowWithCollectDefault('Tea_houses_editable');
});
appendElement(addCollectDefault);

var addCollectCustom = getAnchor();
addCollectCustom.text('ADD ROW COLLECT CUSTOM: State = beta');
addCollectCustom.click(function() {
    control.addRowWithCollect(
        'Tea_houses_editable',
        'Tea_houses_editable_form',
        null,
        null,
        null);
});
appendElement(addCollectCustom);

// Tests that we can add some prepopulated values.
// With the default form.
var addCollectValues = getAnchor();
addCollectValues.text('ADD ROW COLLECT VALUES: save');
addCollectValues.click(function() {
    // The test is that Name = collectNameDefault and Customers = 987,
    // so prepopulate those values.
    var values = {};
    values.Name = 'collectNameDefault';
    values.Customers = '987';
    var valuesStr = JSON.stringify(values);
    control.addRowWithCollect(
        'Tea_houses_editable',
        null,
        null,
        null,
        valuesStr);
});
appendElement(addCollectValues);

// With a custom form.
var addCollectValuesCustom = getAnchor();
addCollectValuesCustom.text('ADD ROW CUSTOM COLLECT VALUES: save');
addCollectValuesCustom.click(function() {
    // The test is that Name = collectName and Customers = 333, so prepopulate
    // those values.
    var values = {};
    values.Name = 'collectName';
    values.Customers = '333';
    var valuesStr = JSON.stringify(values);
    control.addRowWithCollect(
        'Tea_houses_editable',
        'Tea_houses_editable_form',
        null,
        'Tea_houses_editable_form',
        valuesStr);
});
appendElement(addCollectValuesCustom);

var addCollectUnicode = getAnchor();
addCollectUnicode.text('ADD ROW COLLECT UNICODE: save');
addCollectUnicode.click(function() {
    // the test is that:
    // Testing Collect «ταБЬℓσ»: 1<2 & 4+1>3, now" 20% off!
    // is saved in the Name column.
    var values = {};
    values.Name = 'Testing Collect «ταБЬℓσ»: 1<2 & 4+1>3, now" 20% off!';
    var valuesStr = JSON.stringify(values);
    control.addRowWithCollect(
        'Tea_houses_editable',
        'Tea_houses_editable_form',
        null,
        'Tea_houses_editable_form',
        valuesStr);
});
appendElement(addCollectUnicode);

var editCollectDefault = getAnchor();
editCollectDefault.text('EDIT FIRST ROW COLLECT: State = gamma');
editCollectDefault.click(function() {
    var rowId = data.getRowId(0);
    control.editRowWithCollectDefault('Tea_houses_editable', rowId);
});
appendElement(editCollectDefault);

var editCollectCustom = getAnchor();
editCollectCustom.text('EDIT SECOND ROW COLLECT CUSTOM State = delta');
editCollectCustom.click(function() {
    var rowId = data.getRowId(1);
    control.editRowWithCollect(
        'Tea_houses_editable',
        rowId,
        'Tea_houses_editable_form',
        null,
        'Tea_houses_editable_form');
});
appendElement(editCollectCustom);

// These are the methods for Survey testing. We are going to test more of these
// methods in depth, because these are not deprecated and we are hoping that
// this will be the API people use going forward.

var surveyTitle = $('<h1>');
surveyTitle.text('Survey Methods');
appendElement(surveyTitle);


var addSurveyDefault = getAnchor();
addSurveyDefault.text('ADD SURVEY DEFAULT: State = epsilon');
addSurveyDefault.click(function() {
    control.addRowWithSurveyDefault('Tea_houses_editable');
});
appendElement(addSurveyDefault);

var addSurveyCustom = getAnchor();
addSurveyCustom.text('ADD SURVEY CUSTOM: State = zeta');
addSurveyCustom.click(function() {
    control.addRowWithSurvey(
        'Tea_houses_editable',
        'Tea_houses_editable_form',
        null,
        null);
});
appendElement(addSurveyCustom);

var addSurveyValues = getAnchor();
addSurveyValues.text('ADD SURVEY VALUES: save');
addSurveyValues.click(function() {
    // The test is that Name = surveyName and Customers = 111, so prepopulate
    // those values.
    var values = {};
    values.Name = 'surveyName';
    values.Customers = 111;
    var valuesStr = JSON.stringify(values);
    control.addRowWithSurvey(
        'Tea_houses_editable',
        null,
        null,
        valuesStr);
});
appendElement(addSurveyValues);

var addSurveyCustomValues = getAnchor();
addSurveyCustomValues.text('ADD SURVEY CUSTOM VALUES: save');
addSurveyCustomValues.click(function() {
    // The test is that Name = surveyName2 and Customers = 222, so prepopulate
    // those values.
    var values = {};
    values.Name = 'surveyName2';
    values.Customers = 222;
    var valuesStr = JSON.stringify(values);
    control.addRowWithSurvey(
        'Tea_houses_editable',
        'Tea_houses_editable_form',
        null,
        valuesStr);
});
appendElement(addSurveyCustomValues);

var addSurveyUnicode = getAnchor();
addSurveyUnicode.text('ADD SURVEY VALUES UNICODE: save');
addSurveyUnicode.click(function() {
    // The test is that Name =
    // Testing Survey «ταБЬℓσ»: 1<2 & 4+1>3, now 20% off! 
    var values = {};
    values.Name = 'Testing Survey «ταБЬℓσ»: 1<2 & 4+1>3, now" 20% off!';
    var valuesStr = JSON.stringify(values);
    control.addRowWithSurvey(
        'Tea_houses_editable',
        'Tea_houses_editable_form',
        null,
        valuesStr);
});
appendElement(addSurveyUnicode);

// Tests that you can launch the form and it goes to the right screenpath.
var addSurveyCustomValuesScreenpath = getAnchor();
addSurveyCustomValuesScreenpath.text(
        'ADD SURVEY VALUES SCREENPATH: save--should open to State');
addSurveyCustomValuesScreenpath.click(function() {
    // The test is that State = screenpath, prepopulate those values.
    var values = {};
    values.State = 'screenPath';
    var valuesStr = JSON.stringify(values);
    control.addRowWithSurvey(
        'Tea_houses_editable',
        'Tea_houses_editable_form',
        'survey/location',  // assumes that the State has been there.
        valuesStr);
});
appendElement(addSurveyCustomValuesScreenpath);

var editSurveyDefault = getAnchor();
editSurveyDefault.text('EDIT SURVEY DEFAULT: State = eta');
editSurveyDefault.click(function() {
    var rowId = data.getRowId(0);
    control.editRowWithSurveyDefault('Tea_houses_editable', rowId);
});
appendElement(editSurveyDefault);

var editSurveyCustom = getAnchor();
editSurveyCustom.text('EDIT SURVEY CUSTOM: State = theta');
editSurveyCustom.click(function() {
    var rowId = data.getRowId(1);
    control.editRowWithSurvey(
        'Tea_houses_editable',
        rowId,
        'Tea_houses_editable_form',
        null);
});
appendElement(editSurveyCustom);

var editSurveyCustomScreenPath = getAnchor();
editSurveyCustomScreenPath.text(
        'EDIT SURVEY CUSTOM SCREENPATH: State = iota--open to State');
editSurveyCustomScreenPath.click(function() {
    var rowId = data.getRowId(2);
    control.editRowWithSurvey(
        'Tea_houses_editable',
        rowId,
        'Tea_houses_editable_form',
        'survey/location');
});
appendElement(editSurveyCustomScreenPath);



