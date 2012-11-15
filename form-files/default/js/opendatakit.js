'use strict';
/**
 * This is a random collection of methods that don't quite belong anywhere.
 *
 * A set of utilities, some of which wrap the Java interface (collect.js), and others
 * provide useful parsing or interpretation of localization details.
 *
 */
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
                
        if ( mediaPath.substr(0,7) == "file://" ) {
            mediaPath = mediaPath.substr(7);
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
        if ( formPath == null ) {
            formPath = collect.getBaseUrl();
            return '#formPath=' + escape(formPath);
        }
        var qpl =
            '#formPath=' + escape(formPath) +
            ((instanceId == null) ? '' : ('&instanceId=' + escape(instanceId))) +
            '&pageRef=' + escape((pageRef == null) ? '0' : pageRef);
        return qpl;
    },

    setCurrentFormPath:function(formPath) {
        mdl.formPath = formPath;
    },
    
    getCurrentFormPath:function() {
        return mdl.formPath;
    },
    
    setCurrentInstanceId:function(instanceId) {
        mdl.instanceId = instanceId;
    },
    
    getCurrentInstanceId:function() {
        return mdl.instanceId;
    },
    
    setCurrentTableId:function(tableId) {
        mdl.tableId = tableId;
    },
    
    getCurrentTableId:function() {
        return mdl.tableId;
    },
    
    /**
     * immediate return: undef
     * side effect: revise: window.location.hash
     */
    openNewInstanceId:function(ctxt, id) {
        if (id == null) {
            id = this.genUUID();
            ctxt.append("openNewInstanceId.genUUID", id);
        } else {
            ctxt.append("openNewInstanceId.useInstanceId", id);
        }
        
        // formPath is assumed to be unchanged...
        // Do not set instanceId here -- do that in the hashChange handler...
        var qpl = this.getHashString(this.getCurrentFormPath(), id, 0);
        // apply the change to the URL...
        window.location.hash = qpl;
        ctxt.success();
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
    },
    
    /**
     * use this if you know the formDef is valid within the mdl...
     */
    getSettingValue:function(key) {
        var formDef = mdl.qp.formDef.value;
        return this.getSetting(formDef, key);
    },
    /*
        Form locales are specified by the translations available on the 
        form title.  These translation names are then looked up in the 
        settings sheet to see if they have translations, and those are used
        as the label for that translation code. Otherwise, the translation
        name is used.  The returned list is of the form:
        
        [ { name: "en_us", label: { "en_us": "English", "fr": "Anglais"}},
           { name: "fr", label: {"en_us": "French", "fr": "Francais"}} ]
    */
    getFormLocales:function(formDef) {
        var locales = [];
        // assume all the locales are specified by the title...
        var formTitle = this.getSetting(formDef, 'formTitle');
        if ( _.isUndefined(formTitle) || _.isString(formTitle) ) {
            // no internationalization -- just default choice
            return [ 'default' ];
        }
        // we have localization -- find all the tags
        for ( var f in formTitle ) {
            var translations = this.getSetting(formDef, f );
            if ( translations == null ) {
                translations = f;
            }
            locales.push( { label: translations, name: f } );
        }
        return locales;
    },
    
    /*
        The default locale is specified by the 'defaultLocale' setting.
        If this is not present, the first locale in the formTitle array
        is used (this likely does not have any bearing to the order 
        of the translations in the XLSForm). Otherwise, if there are no
        formTitle translations, then 'default' is returned.
     */
    getDefaultFormLocale:function(formDef) {
        var locale = this.getSetting(formDef, 'defaultLocale');
        if ( locale != null ) return locale;
        var locales = this.getFormLocales(formDef);
        if ( locales.length > 0 ) {
            return locales[0].name;
        }
        return "default";
    },
    /**
     use this when the formDef is known to be stored in the mdl
     */
    getDefaultFormLocaleValue:function() {
        var formDef = mdl.qp.formDef.value;
        return this.getDefaultFormLocale(formDef);
    },
    
    getFormLocalesValue:function() {
        var formDef = mdl.qp.formDef.value;
        return this.getFormLocales(formDef);
    }
};
});
