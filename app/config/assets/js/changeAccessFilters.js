/**
 * This is the file that will be creating the list view.
 */
/* global $, odkData, odkCommon */
/*exported display, handleClick, getResults, showTableData, updateDefaultAccess, updateRowOwner, applyChanges */
'use strict';

function rolesSuccess(result) {
    $("#roles-wrapper").empty();
    var roles = result.getRoles();
    var ul;
    var item;
    var ritem;
    var i;
    var role;
    if ( roles === null || roles === undefined || roles.length === 0 ) {
        item = document.createTextNode("--none--");
        $("#roles-wrapper").append(item);
    } else {
        ul = document.createElement('ul');
        for ( i = 0 ; i < roles.length ; ++i ) {
            role = roles[i];
            item = document.createElement('li');
            ritem = document.createTextNode(role);
            item.appendChild(ritem);
            ul.appendChild(item);
        }
        $("#roles-wrapper").append(ul);
    }
}

function rolesFailure(error) {
    console.log('getRoles: failed with error: ' + error);
}

function allTableIdsSuccess(result) {
    var tableId;
    var tableIds = result.getAllTableIds();
    $("#table-chooser").empty();
    var item;
    // valid values cannot contain spaces
    // use values with spaces for special treatments
    item = document.createElement('option');
    item.setAttribute("value", "not specified");
    item.appendChild(document.createTextNode("not specified"));
    $("#table-chooser").append(item);
    var i;
    for ( i = 0 ; i < tableIds.length ; ++i ) {
        tableId = tableIds[i];
        item = document.createElement('option');
        item.setAttribute("value", tableId);
        item.appendChild(document.createTextNode(tableId));
        $("#table-chooser").append(item);
    }
}

function allTableIdsFailure(error) {
    console.log('getAllTableIds: failed with error: ' + error);
}

function usersSuccess(result) {
    var users = result.getUsers();
    
    var admins = [];
    var superUsers = [];
    var plainUsers = [];
    var anonymous = [];
    
    // NOTE: there is also ROLE_SYNCHRONIZE_TABLES
    // which is the ability to sync data with the server.
    // this is more restrictive than ROLE_USER.
    // You could exclude ODK 1.x users from this list by
    // filtering on that value instead of ROLE_USER.
    var i;
    var user;
    for ( i = 0 ; i < users.length ; ++i ) {
        user = users[i];
        if ( user.roles !== null && user.roles !== undefined && user.roles.length !== 0 ) {
            if ( user.user_id === "anonymous" ) {
                anonymous.push(user);
            } else if ( $.inArray("ROLE_ADMINISTER_TABLES", user.roles) !== -1 ) {
                admins.push(user);
            } else if ( $.inArray("ROLE_SUPER_USER_TABLES", user.roles) !== -1 ) {
                superUsers.push(user);
            } else if ( $.inArray("ROLE_USER", user.roles) !== -1 ) {
                plainUsers.push(user);
            }
        }
    }

    $("#user-chooser").empty();
    var item;
    var group;
    // valid values cannot contain spaces
    // use values with spaces for special treatments
    item = document.createElement('option');
    item.setAttribute("value", "not specified");
    item.appendChild(document.createTextNode("not specified"));
    $("#user-chooser").append(item);
    item = document.createElement('option');
    item.setAttribute("value", "is null");
    item.appendChild(document.createTextNode("Null"));
    $("#user-chooser").append(item);
    // tables administrators
    if ( admins.length !== 0 ) {
        group = document.createElement('optgroup');
        group.setAttribute("label", "Tables Administrators");
        for ( i = 0 ; i < admins.length ; ++i ) {
            user = admins[i];
            item = document.createElement('option');
            item.setAttribute("value", user.user_id);
            item.appendChild(document.createTextNode(user.full_name));
            group.appendChild(item);
        }
        $("#user-chooser").append(group);
    }
    // super-users
    if ( superUsers.length !== 0 ) {
        group = document.createElement('optgroup');
        group.setAttribute("label", "Super-users");
        for ( i = 0 ; i < superUsers.length ; ++i ) {
            user = superUsers[i];
            item = document.createElement('option');
            item.setAttribute("value", user.user_id);
            item.appendChild(document.createTextNode(user.full_name));
            group.appendChild(item);
        }
        $("#user-chooser").append(group);
    }
    // users
    if ( plainUsers.length !== 0 ) {
        group = document.createElement('optgroup');
        group.setAttribute("label", "Ordinary Users");
        for ( i = 0 ; i < plainUsers.length ; ++i ) {
            user = plainUsers[i];
            item = document.createElement('option');
            item.setAttribute("value", user.user_id);
            item.appendChild(document.createTextNode(user.full_name));
            group.appendChild(item);
        }
        $("#user-chooser").append(group);
    }
    // anonymous
    if ( anonymous.length !== 0 ) {
        group = document.createElement('optgroup');
        group.setAttribute("label", "Anonymous User");
        for ( i = 0 ; i < anonymous.length ; ++i ) {
            user = anonymous[i];
            item = document.createElement('option');
            item.setAttribute("value", user.user_id);
            item.appendChild(document.createTextNode(user.full_name));
            group.appendChild(item);
        }
        $("#user-chooser").append(group);
    }
}

function usersFailure(error) {
    console.log('getUsers: failed with error: ' + error);
}

///////////////////////////////////////////////////////////////////////////////////////
// populating the user's data table

var chosenTable = {};

function showTableSuccess(result) {
    chosenTable = result;

    var lt = document.createElement('table');
    var tr = document.createElement('tr');

    var orderedColumns = chosenTable.getColumns();
    var td;

    // placeholder column for selection checkboxes  
    td = document.createElement('th');
    tr.appendChild(td);

    var oc;
    var i;
    for ( i = 0 ; i < orderedColumns.length ; i++ ) {
        oc = orderedColumns[i];
        td = document.createElement('th');
        td.appendChild(document.createTextNode(oc));
        tr.appendChild(td);
    }
    lt.appendChild(tr);

    var row;
    var cb;
    var val;
    for ( row = 0; row < chosenTable.getCount(); row++) {

        tr = document.createElement('tr');
        
        // construct checkbox column
        td = document.createElement('th');
        cb = document.createElement('input');
        cb.setAttribute('type','checkbox');
        cb.setAttribute('name','chosen');
        // use the rowid (instance Id) as the value
        cb.setAttribute('value',chosenTable.getData(row, '_id'));
        cb.setAttribute('background',chosenTable.getStatusBackgroundColor(row));
        td.appendChild(cb);
        tr.appendChild(td);
        
        for ( i = 0 ; i < orderedColumns.length ; i++) {
            oc = orderedColumns[i];
            val = chosenTable.getData(row, oc);
            td = document.createElement('td');
            td.appendChild(document.createTextNode(val));
            tr.appendChild(td);
        }
        lt.appendChild(tr);
    }
    $("#table-content-wrapper").append(lt);
}

function showTableFailure(error) {
    console.log('showTableData: failed with error: ' + error);
}

function showTableData() {
    var chosenTableId = $('#table-chooser').val();
    $('#table-content-wrapper').empty();
    if ( chosenTableId === "not specified" ) {
        return;
    }
    var limit = null;
    var offset = null;
    odkData.query(chosenTableId, null, null, null, null, 
        "_savepoint_timestamp", "asc", limit, offset, true, 
        showTableSuccess, showTableFailure);
}

function updateDefaultAccess() {
    var chosenDefaultAccess = $('#default-access-chooser').val();
    $('#default-access-chooser').blur();
}

function updateRowOwner() {
    var chosenRowOwner = $('#user-chooser').val();
    $('#user-chooser').blur();
}

function display() {

    var fileUri = odkCommon.getFileAsUrl(
            'config/assets/img/20160902_sky.jpg');

    //$('#appImage').attr('src', fileUri);
    $('body').css('background-image', 'url(' + fileUri + ')');

    // Clear the table content if there is any
    $('#table-content-wrapper').empty();

    // Reset the default access 
    $('#default-access-chooser').prop('selectedIndex',0);

    // Make the tab highlighted as active.
    odkData.getRoles(rolesSuccess, rolesFailure);
    odkData.getAllTableIds(allTableIdsSuccess, allTableIdsFailure);
    odkData.getUsers(usersSuccess, usersFailure);
}

function applyChangesHelper(tableId, defaultAccess, rowOwner, rowIds) {
    if ( rowIds.length === 0 ) {
        $('body').waitMe('hide');
        // refresh the display
        display();
        return;
    }
    var rowId = rowIds.shift();
	
	odkData.changeAccessFilterOfRow(tableId, defaultAccess, rowOwner, null, null, null, rowId,
		function(result) {
			console.log('changeAccessFilterOfRow: succeeded for rowId: ' + rowId);
			applyChangesHelper(tableId, defaultAccess, rowOwner, rowIds);
		}, function(error) {
			console.log('changeAccessFilterOfRow: failed with error: ' + error);
			applyChangesHelper(tableId, defaultAccess, rowOwner, rowIds);
		});
}

function applyChanges() {
    var chosenDefaultAccess = $('#default-access-chooser').val();
    var chosenRowOwner = $('#user-chooser').val();
    var chosenTableId = $('#table-chooser').val();
    var chosenRowIds = $('#table-content-wrapper input[name="chosen"]:checked').map(function() {
        return this.value;
    }).get();
    
    if (( chosenTableId === null || chosenTableId === undefined || chosenTableId === "not specified" ) ||
       ( chosenRowIds === null || chosenRowIds === undefined || chosenRowIds.length === 0) ||
       ( chosenDefaultAccess === null || chosenDefaultAccess === undefined || chosenDefaultAccess === "not specified" ) ||
       ( chosenRowOwner === null || chosenRowOwner === undefined || chosenRowOwner === "not specified" )) {
        alert ("You must select a valid table id, row, default access, AND row owner.")
        return;
    }
	// handle the null value.
	if ( chosenRowOwner === "is null" ) {
		chosenRowOwner = null;
	}
    
    $('body').waitMe({
        effect: 'roundBounce',
        text: 'Applying changes ...',
        bg: 'rgba(255,255,255,0.7)',
        color:'#000',
        sizeW:'',
        sizeH:''
    });

	setTimeout(function() {
		applyChangesHelper(chosenTableId, chosenDefaultAccess, chosenRowOwner, chosenRowIds);
	}, 100);
}
