'use strict';
/**
 * This is a random collection of methods that don't quite belong anywhere.
 *
 * A set of utilities, some of which wrap the Java interface (shim.js), and others
 * provide useful parsing or interpretation of localization details.
 *
 */
define(['mdl'],function(mdl) {
return {
    initialScreenPath: "initial/0",
    saved_complete: 'COMPLETE',
    saved_incomplete: 'INCOMPLETE',
    baseDir: '',
    databaseSettings: null,
    platformInfo: null,
    
    logInitDone:function(pagename) {
        shim.log("I","logInitDone: doneInit ms: " + (+new Date()) + " page: " + pagename);
    },

    /**
     * immediate return: platformInfo structure from ODK
     */
    getPlatformInfo:function() {
        // fetch these settings from ODK Survey (the container app)
        if ( this.platformInfo == null ) {
            var jsonString = shim.getPlatformInfo();
            this.platformInfo = JSON.parse(jsonString);
        }
        return this.platformInfo;
    },
    
    /**
     * immediate return: databaseSettings structure from ODK
     */
    getDatabaseSettings:function() {
        // fetch these settings from ODK Survey (the container app)
        if ( this.databaseSettings == null ) {
            var jsonString = shim.getDatabaseSettings();
            shim.log("I",'opendatakit.getDatabaseSettings: ' + jsonString);
            this.databaseSettings = JSON.parse(jsonString);
        }
        return this.databaseSettings;
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
    
    getHashString:function(formPath, instanceId, screenPath) {
        var refId = this.getRefId();
        if ( formPath == null ) {
            formPath = shim.getBaseUrl() + "/";
        }
        var qpl =
            '#formPath=' + escape(formPath) +
            ((instanceId == null) ? '' : ('&instanceId=' + escape(instanceId))) +
            '&screenPath=' + escape((screenPath == null) ? this.initialScreenPath : screenPath) +
            ((refId == null) ? '' : ('&refId=' + escape(refId)));
        return qpl;
    },

    setCurrentFormDef:function(formDef) {
        mdl.formDef = formDef;
    },
    
    getCurrentFormDef:function() {
        return mdl.formDef;
    },
    
    getQueriesDefinition: function(query_name) {
        return mdl.formDef.logic_flow.parsed_queries[query_name];
    },
    
    getChoicesDefinition: function(choice_list_name) {
        return mdl.formDef.logic_flow.choices[choice_list_name];
    },
    
    setCurrentFormPath:function(formPath) {
        mdl.formPath = formPath;
    },
    
    getCurrentFormPath:function() {
        return mdl.formPath;
    },
    
    setRefId:function(refId) {
        mdl.ref_id = refId;
    },
    
    getRefId:function() {
        return mdl.ref_id;
    },
    
    clearLocalInfo:function(type) {
        // wipe the ref_id --
        // this prevents saves into the shim from succeeding...
        mdl.ref_id = this.genUUID();
        if ( type == "table" ) {
            mdl.table_id = null;
            mdl.formPath = null;
            mdl.instanceId = null;
        } else if ( type == "form" ) {
            mdl.formPath = null;
            mdl.instanceId = null;
        } else if ( type == "instance" ) {
            mdl.instanceId = null;
        } // screen -- just wipe the ref_id
    },
    
    clearCurrentInstanceId:function() {
        mdl.instanceId = null;
        // Update container so that it can save media and auxillary data
        // under different directories...
        shim.clearInstanceId(this.getRefId());
    },
    
    setCurrentInstanceId:function(instanceId) {
        mdl.instanceId = instanceId;
        // Update container so that it can save media and auxillary data
        // under different directories...
        shim.setInstanceId( this.getRefId(), instanceId);
    },
    
    getCurrentInstanceId:function() {
        return mdl.instanceId;
    },
    
    setCurrentTableId:function(table_id) {
        mdl.table_id = table_id;
    },
    
    getCurrentTableId:function() {
        return mdl.table_id;
    },
    
    getSectionTitle:function(formDef, sectionName) {
        var ref = this.getSettingObject(formDef, sectionName);
        if ( ref == null ) {
            ref = this.getSettingObject(formDef, 'survey'); // fallback
        }
        if ( ref == null || !("display" in ref) ) {
            return "<no title>";
        } else {
            var display = ref.display;
            if ( "title" in display ) {
                return display.title;
            } else {
                return "<no title>";
            }
        }
    },
    getCurrentSectionTitle:function(sectionName) {
        return this.getSectionTitle(this.getCurrentFormDef(),sectionName);
    },
    /**
     * immediate return: undef
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
        var qpl = this.getHashString(this.getCurrentFormPath(), id, this.initialScreenPath);
        ctxt.success(qpl);
    },

    localize:function(textOrLangMap, locale) {
        if(_.isUndefined(textOrLangMap)) {
            return 'text_undefined';
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
            return 'no_suitable_language_mapping_defined';
        }
    },
    
    /**
     * Retrieve the value of a setting from the form definition file.
     * NOTE: in Survey XLSX syntax, the settings are row-by-row, like choices.
     * The returned object is therefore a map of keys to values for that row.
     * 
     * Immediate.
      */
    getSettingObject:function(formDef, key) {
        if (formDef == null) return null;
        return formDef.logic_flow.settings[key];
    },
    
    /**
     * use this if you know the formDef is valid within the mdl...
     */
    getSettingValue:function(key) {
        var obj = this.getSettingObject(this.getCurrentFormDef(), key);
        if ( obj == null ) return null;
        return obj.value;
    },
    /**
        The list of locales should have been constructed by the XLSXConverter.
        It will be saved under settings._locales.value as a list:
        
        [ { name: "en_us", display: { text: { "en_us": "English", "fr": "Anglais"}}},
           { name: "fr", display: { text: {"en_us": "French", "fr": "Francais"}}} ]
    */
    getFormLocales:function(formDef) {
        if ( formDef != null ) {
            var locales = this.getSettingObject(formDef, '_locales' );
            if ( locales != null && locales.value != null ) {
                return locales.value;
            }
            alert("_locales not present in form! See console:");
            console.error("The synthesized _locales field is not present in the form!");
        }
        return [ { display: { text: 'default' }, name: 'default' } ];
    },
    
    /**
        The default locale is a synthesized value. It is specified by 
        the value of the '_default_locale' setting.
        
        This is generally the first locale in the _locales list, above.
     */
    getDefaultFormLocale:function(formDef) {
        if ( formDef != null ) {
            var localeObject = this.getSettingObject(formDef, '_default_locale');
            if ( localeObject != null && localeObject.value != null ) {
                return localeObject.value;
            }
            alert("_default_locales not present in form! See console:");
            console.error("The synthesized _default_locales field is not present in the form!");
        }
        return "default";
    },
    /**
     use this when the formDef is known to be stored in the mdl
     */
    getDefaultFormLocaleValue:function() {
        return this.getDefaultFormLocale(this.getCurrentFormDef());
    },
    
    getFormLocalesValue:function() {
        return this.getFormLocales(this.getCurrentFormDef());
    }
};
});
