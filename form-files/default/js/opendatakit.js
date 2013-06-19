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
	initialPageRef: "initial/0",
    saved_complete: 'COMPLETE',
    saved_incomplete: 'INCOMPLETE',
    baseDir: '',
    databaseSettings: null,
    platformInfo: null,
    
    logInitDone:function(pagename) {
        console.log("logInitDone: doneInit ms: " + (+new Date()) + " page: " + pagename);
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
            console.log('opendatakit.getDatabaseSettings: ' + jsonString);
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
    
    getHashString:function(formPath, instanceId, pageRef) {
        if ( formPath == null ) {
            formPath = shim.getBaseUrl() + "/";
            return '#formPath=' + escape(formPath);
        }
        var qpl =
            '#formPath=' + escape(formPath) +
            ((instanceId == null) ? '' : ('&instanceId=' + escape(instanceId))) +
            '&pageRef=' + escape((pageRef == null) ? this.initialPageRef : pageRef);
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
    
    setCurrentInstanceId:function(instanceId) {
        mdl.instanceId = instanceId;
		// Update container so that it can save media and auxillary data
		// under different directories...
		shim.setInstanceId(instanceId);
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
        var qpl = this.getHashString(this.getCurrentFormPath(), id, this.initialPageRef);
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
		if ( formDef == null ) {
			return [ 'default' ];
		}
        // assume all the locales are specified by the title...
        var form_title = this.getSectionTitle(formDef, 'survey');
        if ( _.isUndefined(form_title) || _.isString(form_title) ) {
            // no internationalization -- just default choice
            return [ 'default' ];
        }
        // we have localization -- find all the tags
        for ( var f in form_title ) {
			// get the setting object for the tag (e.g., for display.text for that language)
            var translations = this.getSettingObject(formDef, f );	
            if ( translations == null || translations.display == null ) {
				locales.push( { display: { text: f }, name: f } );
			} else if ( translations.display.text == null ) {
                locales.push( { display: { text: f }, name: f } );
            } else {
				locales.push( { display: translations.display, name: f } );
			}
        }
        return locales;
    },
    
    /*
        The default locale is specified by the 'default_locale' setting.
        If this is not present, the first locale in the form_title array
        is used (this likely does not have any bearing to the order 
        of the translations in the XLSForm). Otherwise, if there are no
        form_title translations, then 'default' is returned.
     */
    getDefaultFormLocale:function(formDef) {
		var localeObject = this.getSettingObject(formDef, 'default_locale');
        if ( localeObject != null && localeObject.value != null ) {
			return localeObject.value;
		}
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
        return this.getDefaultFormLocale(this.getCurrentFormDef());
    },
    
    getFormLocalesValue:function() {
        return this.getFormLocales(this.getCurrentFormDef());
    }
};
});
