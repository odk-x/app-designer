
// Displays homescreen
/*function display() {
    odkData.query('authorizations', 'is_active = ?', ['true'],  
        null, null, null, null, null, null, true, activateAuthSuccess, activateAuthFailure);
}

function activateAuthSuccess(result) {
    if (result.getCount() == 0) {
        var struct = {};
        struct.is_active = 'true';
        struct.is_simple = 'true';
        odkData.addRow('authorizations', struct, 0, renderSuccess, renderFailure);
    } else {
        renderSuccess(null);
    }
}

function activateAuthFailure(error) {
    console.log('activeAuth failure with error:' + error);
}*/
var tokenIndex = {};

tokenIndex.display = function() {
    $('#title').text(odkCommon.localizeText(locale, titleToken));

    var deliver = document.createElement("button");
    deliver.setAttribute("id", "deliver");
    deliver.setAttribute('type', 'reg');
    deliver.innerHTML = "Deliver";
    deliver.onclick = function() {
        odkTables.launchHTML(null, 'config/assets/token_mode/delivery_options.html');
    }
    document.getElementById("wrapper").appendChild(deliver);

    var del = document.createElement('button');
    del.setAttribute('id', 'view-deliveries');
    del.setAttribute('type', 'reg');
    del.innerHTML = 'View Deliveries';
    del.onclick = function() {
        odkTables.launchHTML(null, 'config/assets/token_mode/view_start.html');
    }
    document.getElementById('wrapper').appendChild(del);

    // Reset entitlements if user is a tables superuser
    
    odkData.getRoles(tokenIndex.rolesCBSuccess, tokenIndex.rolesCBFailure);
}

/*function renderFailure(error) {
    console.log('renderFailure with error' + error);
}*/

tokenIndex.rolesCBSuccess = function(result) {
    var roles = result.getRoles();
    if ($.inArray('ROLE_SUPER_USER_TABLES', roles) > -1) {
        var override = document.createElement("button");
        override.setAttribute("id", "override");
        override.setAttribute('type', 'reg');
        override.innerHTML = "Administrator Reset";
        override.onclick = function() {
            var followThrough = confirm("Are you sure you want to perform an Administrator Reset? \n" + 
                "All barcodes will be entitled to a distribution if confirmed");
            if (followThrough) {
                odkData.query('authorizations', 'status = ?', ['active'],
                null, null, null, null, null, null, true, tokenIndex.resetSuccess, tokenIndex.resetFailure);
            }
        }
        document.getElementById("wrapper").appendChild(override);
    }
}

tokenIndex.rolesCBFailure = function(error) {
    console.log('roles failed with error: ' + error);
}

tokenIndex.resetSuccess = function(result) {
    for (var i = 0; i < result.getCount(); i++) {
        var struct = {};
        struct.status = 'disabled';
        odkData.updateRow('authorizations', struct, result.getRowId(i), tokenIndex.disableSuccess, tokenIndex.disableFailure);
    }
    var struct = {};
    struct.status = 'active';
    struct.type = 'TOKEN';
    odkData.addRow('authorizations', struct, util.genUUID(), tokenIndex.updateSuccess, tokenIndex.updateFailure);
}

tokenIndex.resetFailure = function(error) {
    console.log('reset failure with error: ' + error);
}

tokenIndex.disableSuccess = function(result) {
    console.log('disable success');
}

tokenIndex.disableFailure = function(error) {
    console.log('disable failure with error:' + error);
}

tokenIndex.updateSuccess = function(result) {
    console.log('Update = callback success');
}

tokenIndex.updateFailure = function(error) {
    console.log('update failure with error: ' + error);
}
