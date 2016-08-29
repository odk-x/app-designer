'use strict';

var idxStart = -1;
var distributionsResultSet = {};

var distributionsCBSuccess = function(result) {
    distributionsResultSet = result;

    return (function() {
        displayGroup(idxStart);
    }());
};

var distributionsCBFailure = function(error) {

    console.log('dist_ben_list distributionsCBFailure: ' + error);
}; 

var setJSONMap = function(JSONMap, key, value) {
    if (value !== null && value !== undefined) {
        distributionsResultSet.get(key);
        JSONMap[key] = JSON.stringify(value);
    }
}

var getJSONMapValues = function() {
  var jsonMap = {};

  setJSONMap(jsonMap, 'beneficiary_code', distributionsResultSet.get('beneficiary_code'));
  setJSONMap(jsonMap, 'distribution_id', distributionsResultSet.get('distribution_id'));
  setJSONMap(jsonMap, 'authorization_id', distributionsResultSet.get('authorization_id'));
  setJSONMap(jsonMap, 'authorization_name', distributionsResultSet.get('authorization_name'));
  setJSONMap(jsonMap, 'item_pack_id', distributionsResultSet.get('item_pack_id'));
  setJSONMap(jsonMap, 'item_pack_name', distributionsResultSet.get('item_pack_name'));
  setJSONMap(jsonMap, 'is_override', distributionsResultSet.get('is_override'));
    
    // Writing out number values needs more investigation
  setJSONMap(jsonMap, 'min_range', distributionsResultSet.get('min_range'));
 
  setJSONMap(jsonMap, 'max_range', distributionsResultSet.get('max_range'));

    jsonMap = JSON.stringify(jsonMap);

    
    return jsonMap;
};

var resumeFn = function(fIdxStart) {  
    odkData.getViewData(distributionsCBSuccess, distributionsCBFailure);

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
            /*var jsonMap = {};
            jsonMap.beneficiary_code = distributionsResultSet.get('beneficiary_code');
            jsonMap.distribution_id = encodeURI(distributionsResultSet.get('distribution_id'));
            jsonMap.authorization_id = encodeURI(distributionsResultSet.get('authorization_id'));
            jsonMap.authorization_name = distributionsResultSet.get('authorization_name');
            jsonMap.item_pack_id = encodeURI(distributionsResultSet.get('item_pack_id'));
            jsonMap.item_pack_name = distributionsResultSet.get('item_pack_name');
            jsonMap.min_range = distributionsResultSet.get('min_range');
            jsonMap.max_range = distributionsResultSet.get('max_range');



            jsonMap = JSON.stringify(jsonMap);*/
            // make sure we retrieved the rowId
            var jsonMapVals = getJSONMapValues();
            if (rowId !== null && rowId !== undefined) {
                // we'll pass null as the relative path to use the default file
                /*odkTables.addRowWithSurvey(
                  'deployment',
                  'deploy_to_specific',
                  null,
                  jsonMapVals);*/
                  odkTables.openDetailView('distribution', rowId, 'config/tables/distribution/html/dist_ben_detail.html');
            }
        });
    }
};

var displayGroup = function(idxStart) {
    console.log('displayGroup called. idxStart: ' + idxStart);
    /* Number of rows displayed per 'chunk' - can modify this value */
    var chunk = 50;
    for (var i = idxStart; i < idxStart + chunk; i++) {
      if (i >= distributionsResultSet.getCount()) {
        break;
      }

      var item = $('<li>');
      item.attr('rowId', distributionsResultSet.getRowId(i));
      item.attr('class', 'item_space');
      var auth_name = distributionsResultSet.getData(i, 'authorization_name');
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
    if (i < distributionsResultSet.getCount()) {
        setTimeout(resumeFn, 0, i);
    }
};