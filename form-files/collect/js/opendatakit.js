'use strict';
// depends upon: --
define(['mdl'],function(mdl) {
return {
    baseDir: '../collect/',
    databaseSettings: null,
    platformInfo: null,
    
    logInitDone:function(pagename) {
        console.log("logInitDone: doneInit ms: " + (+new Date()) + " page: " + pagename);
    },

    getPlatformInfo:function() {
        // fetch these settings from ODK Collect if running under that context
        if ( this.platformInfo == null ) {
            var jsonString = collect.getPlatformInfo();
            console.log('getPlatformInfo: ' + jsonString);
            this.platformInfo = JSON.parse(jsonString);
        }
        return this.platformInfo;
    },
    
    getDatabaseSettings:function() {
        // fetch these settings from ODK Collect if running under that context
        if ( this.databaseSettings == null ) {
            var jsonString = collect.getDatabaseSettings();
            console.log('getDatabaseSettings: ' + jsonString);
            this.databaseSettings = JSON.parse(jsonString);
        }
        return this.databaseSettings;
    },

    asUri:function(mediaPath,widget,attribute) {
        var info = this.getPlatformInfo();
        if ( info.container != 'Android' ) return mediaPath;
        
        if ( mediaPath[0] == '.' ) {
            mediaPath = info.appPath + mediaPath;
        }
        if ( widget != 'img' ) {
            if ( attribute == 'poster' ) {
                
                return "file://127.0.0.1" + mediaPath;
            }
        }
        return "file://127.0.0.1" + mediaPath;
    },
    
    checkInteger:function(value, isRequired, alertMessage) {
        if(value && value.length != 0) {
            var n = Number(value);
            if(isNaN(n) || Math.round(n) != n) {
                if(alertMessage) {
                    alert(alertMessage);
                } else {
                    alert("Integer expected!");
                }
                return false;
            }
        } else if(isRequired) {
            alert("Required value! Please enter an integer value.");
            return false;
        }
        return true;
    },

    checkNumeric:function(value, isRequired, alertMessage) {
        if(value && value.length != 0) {
            var n = Number(value);
            if(isNaN(n)) {
                if(alertMessage) {
                    alert(alertMessage);
                } else {
                    alert("Numeric value expected!");
                }
                return false;
            }
        } else if(isRequired) {
            alert("Required value! Please enter a numeric value.");
            return false;
        }
        return true;
    },

    genUUID:function() {
        // construct a UUID (from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript )
        var id = "uuid:" + 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        return id;
    },
	
	getHashString:function(formId, formVersion, instanceId, pageRef) {
        var qpl =
		    '#formId=' + escape(formId) +
			((formVersion == null) ? '' : ('&formVersion=' + escape(formVersion))) +
			((instanceId == null) ? '' : ('&instanceId=' + escape(instanceId))) +
			'&pageRef=' + escape((pageRef == null) ? '0' : pageRef);
		return qpl;
	},

	getCurrentFormDirectory:function(formId, formVersion) {
		if ( formId == null ) {
			formId = mdl.qp.formId.value;
		}
		if ( formVersion == null ) {
			formVersion = (mdl.qp.formVersion != null) ? mdl.qp.formVersion.value : null;
		}
		return "../../" + formId + ((formVersion == null) ? '' : ('-' + formVersion)) + '/';
	},
	
    openNewInstanceId:function(id, friendlyName) {
        console.log("ALERT! setNewInstanceId - setting new UUID");
        if (id == null) {
			mdl.qp.instanceId.type = "string";
            mdl.qp.instanceId.value = this.genUUID();
        } else {
			mdl.qp.instanceId.type = "string";
            mdl.qp.instanceId.value = id;
        }
		// NOTE: reference mdl directly to avoid circular reference to 'database'
        var qpl = this.getHashString(mdl.qp.formId.value, 
						mdl.qp.formVersion.value,
						mdl.qp.instanceId.value,
						'_opening') +
            ((friendlyName != null) ? '&instanceName=' + escape(friendlyName) : '');
        // apply the change to the URL...
        window.location.hash = qpl;
    },
};
});
