'use strict';

var idxStart = -1;
var authorizationsResultSet = {};
var locale;

var authorizationsCBSuccess = function(result) {
    authorizationsResultSet = result;
    locale = odkCommon.getPreferredLocale();
    if (authorizationsResultSet.getCount() == 0) {
      $('#title').text(odkCommon.localizeText(locale, 'no_authorizations'));
      return null;
    } else {
      $('#title').text(odkCommon.localizeText(locale, 'choose_authorization'));
      return (function() {
        displayGroup(idxStart);
      }());
    }
};

var authorizationsCBFailure = function(error) {

    console.log('authorizations_list authorizationsCBFailure: ' + error);
};

var firstLoad = function() {
  resumeFn(0);
};

var resumeFn = function(fIdxStart) {
  odkData.query('authorizations', null, null, null, null,
            null, null, null, null, true, authorizationsCBSuccess,
            authorizationsCBFailure);
  
  

    idxStart = fIdxStart;
    console.log('resumeFn called. idxStart: ' + idxStart);
    // The first time through we're going to make a map of typeId to
    // typeName so that we can display the name of each shop's specialty.
    if (idxStart === 0) {
        // We're also going to add a click listener on the wrapper ul that will
        // handle all of the clicks on its children.
        $('#list').click(function(e) {
            // We set the rowId while as the li id. However, we may have
            // clicked on the li or anything in the li. Thus we need to get
            // the original li, which we'll do with jQuery's closest()
            // method. First, however, we need to wrap up the target
            // element in a jquery object.
            // wrap up the object so we can call closest()
            var jqueryObject = $(e.target);
            // we want the closest thing with class item_space, which we
            // have set up to have the row id
            var containingDiv = jqueryObject.closest('.item_space');
            var rowId = containingDiv.attr('rowId');
            console.log('clicked with rowId: ' + rowId);
            // make sure we retrieved the rowId
            if (rowId !== null && rowId !== undefined) {
                // we'll pass null as the relative path to use the default file
                var type = util.getQueryParameter('type');
                if (type == 'override') {
                  odkTables.launchHTML(null,
                  'config/assets/choose_method.html?title='
                  + encodeURIComponent(odkCommon.localizeText(locale, 'choose_method'))
                  + '&secondary_manual_title='
                  + encodeURIComponent(odkCommon.localizeText(locale, 'enter_beneficiary_code'))
                  + '&type=ent_override&authorization_id=' + rowId);
                } else {
                  odkTables.addRowWithSurvey(null, 'distribution_reports',
                      'distribution_reports', null, 
                      {'authorization_id' : rowId});
                }

                
            }
        });
    }
};

var displayGroup = function(idxStart) {
    console.log('displayGroup called. idxStart: ' + idxStart);

    /* If the list comes back empty, inform the user */
    if (authorizationsResultSet.getCount() === 0) {
        var errorText = $('#error');
        errorText.show();
        errorText.text('No authorizations found'); // TODO: Translate this
    }

    /* Number of rows displayed per 'chunk' - can modify this value */
    var chunk = 50;
    for (var i = idxStart; i < idxStart + chunk; i++) {
      if (i >= authorizationsResultSet.getCount()) {
        break;
      }

      var item = $('<li>');
      item.attr('rowId', authorizationsResultSet.getRowId(i));
      item.attr('class', 'item_space');
      var auth_name = authorizationsResultSet.getData(i, 'authorization_name');
      item.text(auth_name);

      /* Creates arrow icon (Nothing to edit here) */
      var chevron = $('<img>');
      chevron.attr('src', odkCommon.getFileAsUrl('config/assets/img/little_arrow.png'));
      chevron.attr('class', 'chevron');
      item.append(chevron);

      $('#list').append(item);

      // don't append the last one to avoid the fencepost problem
      var borderDiv = $('<div>');
      borderDiv.addClass('divider');
      $('#list').append(borderDiv);

    }
    if (i < authorizationsResultSet.getCount()) {
        setTimeout(resumeFn, 0, i);
    }
};
