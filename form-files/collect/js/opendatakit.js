'use strict';
// depends upon: --
define({
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

    // From: http://geekswithblogs.net/PhubarBaz/archive/2011/11/21/getting-query-parameters-in-javascript.aspx
    queryParameters:{
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

    openNewInstanceId:function(id, friendlyName) {
        console.log("ALERT! setNewInstanceId - setting new UUID");
        if (id == null) {
            this.queryParameters.instanceId = this.genUUID();
        } else {
            this.queryParameters.instanceId = id;
        }
        var qpl = '?instanceId=' + escape(this.queryParameters.instanceId) +
            ((friendlyName != null) ? '&instanceName=' + escape(friendlyName) : '');
        // apply the change to the URL...
        window.location.search = qpl;
    },

    getInstanceId:function() {
        return this.queryParameters.instanceId;
    },

    getFormId:function() {
        return this.queryParameters.formId;
    },

    getFormVersion:function() {
        return this.queryParameters.formVersion;
    },

    getFormLocale:function() {
        return this.queryParameters.formLocale;
    },

    getFormName:function() {
        return this.queryParameters.formName;
    },
});
