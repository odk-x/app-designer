'use strict';
// depends upon: --
define(['mdl'],function(mdl) {
return {
    baseDir: '',
    databaseSettings: null,
    platformInfo: null,
    
    logInitDone:function(pagename) {
        console.log("logInitDone: doneInit ms: " + (+new Date()) + " page: " + pagename);
    },

    /**
     * immediate return: platformInfo structure from ODK
     */
    getPlatformInfo:function(ctxt) {
        // fetch these settings from ODK Collect if running under that context
        if ( this.platformInfo == null ) {
            var jsonString = collect.getPlatformInfo();
            ctxt.append('opendatakit.getPlatformInfo', jsonString);
            this.platformInfo = JSON.parse(jsonString);
        }
        return this.platformInfo;
    },
    
    /**
     * immediate return: databaseSettings structure from ODK
     */
    getDatabaseSettings:function(ctxt) {
        // fetch these settings from ODK Collect if running under that context
        if ( this.databaseSettings == null ) {
            var jsonString = collect.getDatabaseSettings();
            ctxt.append('opendatakit.getDatabaseSettings', jsonString);
            this.databaseSettings = JSON.parse(jsonString);
        }
        return this.databaseSettings;
    },

    /**
     * immediate return: URI for this media file
     */
    asUri:function(ctxt,mediaPath,widget,attribute) {
        if ( mediaPath == null ) return null;
        
        var info = this.getPlatformInfo(ctxt);
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

    genUUID:function() {
        // construct a UUID (from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript )
        var id = "uuid:" + 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        return id;
    },
    
    getHashString:function(formPath, instanceId, pageRef) {
        if ( formPath == null ) return '#formPath=' + escape('collect/');
        var qpl =
            '#formPath=' + escape(formPath) +
            ((instanceId == null) ? '' : ('&instanceId=' + escape(instanceId))) +
            '&pageRef=' + escape((pageRef == null) ? '0' : pageRef);
        return qpl;
    },

    getCurrentFormDirectory:function(formPath) {
        if ( formPath == null ) {
            formPath = mdl.qp.formPath.value;
        }
        return formPath;
    },
    
    /**
     * immediate return: undef
     * side effect: revise: window.location.hash
     */
    openNewInstanceId:function(ctxt, id, friendlyName) {
        console.log("ALERT! setNewInstanceId - setting new UUID");
        if (id == null) {
            id = this.genUUID();
        }
        
        // NOTE: reference mdl directly to avoid circular reference to 'database'
        var qpl = this.getHashString(mdl.qp.formPath.value, id, 0) +
            ((friendlyName != null) ? '&instanceName=' + escape(friendlyName) : '');
        // apply the change to the URL...
        window.location.hash = qpl;
    },

    localize:function(textOrLangMap, locale) {
        if(_.isUndefined(textOrLangMap)) {
            return 'undefined';
        }
        if(_.isString(textOrLangMap)) {
            return textOrLangMap;
        }
        if( locale in textOrLangMap ){
            return textOrLangMap[locale];
        } else if( 'default' in textOrLangMap ){
            return textOrLangMap['default'];
        } else {
            alert("Could not localize object. See console:");
            console.error("Non localizable object:");
            console.error(textOrLangMap);
            return 'invalidOjbect';
        }
    },
    
    /**
     * Retrieve the value of a setting from the form definition file.
     * 
     * Immediate.
      */
    getSetting:function(formDef, key) {
        for (var i = 0 ; i < formDef.settings.length ; ++i ) {
            var e = formDef.settings[i];
            if ( e.setting == key ) {
                return e.value;
            }
        }
        return null;
    }
};
});
