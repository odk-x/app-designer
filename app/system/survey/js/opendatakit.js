/**
 * This is a random collection of methods that don't quite belong anywhere.
 *
 * A set of utilities, some of which wrap the Java interface (odkSurveyStateManagement.js), and others
 * provide useful parsing or interpretation of localization details.
 *
 */

define(['underscore', 'XRegExp', 'databaseUtils'],function(_,XRegExp,databaseUtils) {
/* globals odkCommon, odkSurvey, odkSurveyStateManagement */
'use strict';
verifyLoad('opendatakit',
    ['underscore', 'XRegExp', 'databaseUtils'],
    [ _,            XRegExp , databaseUtils  ]);
return {
    initialScreenPath: "initial/0",
    savepoint_type_complete: 'COMPLETE',
    savepoint_type_incomplete: 'INCOMPLETE',
    baseDir: '',
    cachedLocale: undefined,
    /**
     * Global object that is the container for
     * - formDef
     * - model structure metadata
     * - instance metadata
     * - survey instance data
     *
     * The data is accessed via the database.js utilities.
     * Those utilities are responsible for write-through
     * update of the database.  Data is cached here to
     * simplify Javascript user-defined expression coding.
     *
     * The W3C SQLite database has an asynchronous
     * interaction model.
     *
     */
    mdl: {  data: {},  // dataTable instance data values: (...)
            instanceMetadata: {}, // dataTable instance Metadata: (_savepoint_timestamp, _savepoint_creator, _savepoint_type, _form_id, _locale)
            // metadata: from the odkData interface...
            //  {  tableId: TableDefinitionEntry.getTableId(),
            //     canCreateRow:  true if user is able to create a row
            //     limit:
            //     offset:
            //     schemaETag: TableDefinitionEntry.getSchemaETag(),
            //     lastDataETag: TableDefinitionEntry.getLastDataETag(),
            //     lastSyncTime: TableDefinitionEntry.getLastSyncTime(),
            //
            //     elementKeyMap: { columnElementKey: index-into-row[]-for-column-value },
            //     metaDataRev: KVS metaData version for efficient caching in Javascript layer
            //     dataTableModel: copy in the one from formDef so that default values and session variables are known
            //     keyValueStoreList: [
            //                     //
            //                     // value is one of bool, integer, number or, for all other types (e.g., array, object), a string.
            //                     //
            //              { partition: xxx, aspect: xxx, key: xxx, type: xxx, value: xxx },
            //              ...
            //          ]
            //
            //      kvMap: [partition][aspect][key]
            //
            //   other tools can add additional fields (these are just the common ones)
            //   }
            //
            metadata: {},
            dataTableModel: {},// inverted and extended formDef.model for representing data store
            formDef: null,
            formPath: null,
            instanceId: null,
            table_id: null
        },
    platformInfo: null,

    logInitDone:function(pagename) {
        odkCommon.log("I","logInitDone: doneInit ms: " + (+new Date()) + " page: " + pagename);
    },

    /**
     * Encode the data element given the element key
     */
    encodeURIDataElement:function(elementKey) {
        var elementKeyDef = null;
        var dbKey;
        var def;

        // Get data table model info for the element_key specified
        for (dbKey in this.mdl.dataTableModel) {
            if ( this.mdl.dataTableModel.hasOwnProperty(dbKey) ) {
                def = this.mdl.dataTableModel[dbKey];
                if (def.elementKey === elementKey) {
                    elementKeyDef = def;
                    break;
                }
            }
        }

        if (elementKey === null) {
            return null;
        }

        // Get the database value
        var value = databaseUtils.getElementPathValue(this.mdl.data, elementKey);

        // Call the toSerializeFunction
        var finalValue = databaseUtils.toSerializationFromElementType(elementKeyDef, value, true);

        // Encode the URI component
        return encodeURIComponent(finalValue);
    },

    /**
     * Encode the data value 
     */
    encodeURIValue:function(value) {
        return encodeURIComponent(JSON.stringify(value));
    },

    /**
     * immediate return: platformInfo structure from ODK
     */
    getPlatformInfo:function() {
        // fetch these settings from ODK Survey (the container app)
        if ( this.platformInfo === undefined || this.platformInfo === null ) {
            var jsonString = odkCommon.getPlatformInfo();
            this.platformInfo = JSON.parse(jsonString);
        }
        return this.platformInfo;
    },

    _forbiddenInstanceDirCharsPattern: XRegExp('(\\p{P}|\\p{Z})', 'A'),

    /**
     * Matches the API of the same name under the control class
     *
     */
    getRowFileAsUrl:function(tableId, instanceId, rowpath) {
        return odkCommon.getRowFileAsUrl(tableId, instanceId, rowpath);
    },

    /**
     * constructs a full URI to a specified rowpath attachment under
     * the current tableId and instanceId.
     *
     * Handles the case where the rowpath is fully qualified vs. assuming
     * the rowpath is under the .../data/tables/tableId/instances/instanceId/
     * directory path.
     */
    getUriFromRowpath:function(rowpath) {
        return this.getRowFileAsUrl(this.getCurrentTableId(), this.getCurrentInstanceId(), rowpath);
    },

    /**
     * Given a uriFragment underneath this appName, reduce it to
     * a rowpath under the ...data/tables/tableId/instances/instanceId/
     * directory path, or, if it cannot be reduced, return the
     * full uriFragment.
     */
    getRowpathFromUriFragment:function(incomingFragment) {
        if ( incomingFragment === null || incomingFragment === undefined ) return null;

        var uriFragment = incomingFragment;
        if ( incomingFragment.charAt(0) === '/' ) {
            uriFragment = incomingFragment.substring(1);
        }

        var prefix = 'data/tables/' +
            this.getCurrentTableId() + '/instances/' + this.getCurrentInstanceId() + '/';

        if ( prefix.length < uriFragment.length && uriFragment.substring(0,prefix.length) === prefix ) {
            // trim off the prefix path
            return uriFragment.substring(prefix.length+1);
        } else {
            // already a rowpath that is under the prefix path.
            return uriFragment;
        }
    },

    getProperty:function(propertyId) {
        return odkCommon.getProperty(propertyId);
    },

    genUUID:function() {
        return odkCommon.genUUID();
    },
    getSameRefIdHashString:function(formPath, instanceId, screenPath) {
        var that = this;
        var refId = that.getRefId();
        if ( formPath === undefined || formPath === null ) {
            // this is a bad error case -- switch to framework form so we get 'Please wait...' screen
            odkCommon.log('E','opendatakit:getSameRefIdHashString null or undefined formPath resetting to ' + formPath);
            return '#formPath=' + encodeURIComponent(odkSurvey.getFormPath('framework','framework'));       
        }
        var qpl =
            '#formPath=' + encodeURIComponent(formPath) +
            ((instanceId === undefined || instanceId === null) ? '' : ('&instanceId=' + encodeURIComponent(instanceId))) +
            '&screenPath=' + encodeURIComponent((screenPath === undefined || screenPath === null) ? this.initialScreenPath : screenPath) +
            ((refId === undefined || refId === null) ? '' : ('&refId=' + encodeURIComponent(refId)));
        return qpl;
    },
    setCurrentFormDef:function(formDef) {
        this.mdl.formDef = formDef;
    },

    getCurrentFormDef:function() {
        return this.mdl.formDef;
    },

    getCurrentModel:function() {
        return this.mdl;
    },

    getQueriesDefinition: function(query_name) {
        return this.mdl.formDef.specification.queries[query_name];
    },

    getChoicesDefinition: function(choice_list_name) {
        // the table properties retrieved from the Java layer should provide the definitive choice list. 
        if ( this.mdl.resultObject !== null && this.mdl.resultObject !== undefined ) { 
            var result = this.mdl.resultObject.getColumnChoicesList(choice_list_name); 
            if ( result !== null && result !== undefined ) { 
                return result; 
            } 
        } 
        // but the list might not be available? In which case we use the one in the formDef. 
        odkCommon.log('W', 'Using this.mdl.formDef.specification.choices instead of Table properties for choice definitions'); 
        return this.mdl.formDef.specification.choices[choice_list_name];
    },

    setCurrentFormPath:function(formPath) {
        this.mdl.formPath = formPath;
    },

    getCurrentFormPath:function() {
        return this.mdl.formPath;
    },

    setRefId:function(refId) {
        this.mdl.ref_id = refId;
    },

    getRefId:function() {
        return this.mdl.ref_id;
    },

    clearLocalInfo:function(type) {
        // wipe the ref_id --
        // this prevents saves into odkSurveyStateManagement from succeeding...
        this.mdl.ref_id = this.genUUID();
        if ( type === "table" ) {
            this.mdl.table_id = null;
            this.mdl.formPath = null;
        } else if ( type === "form" ) {
            this.mdl.formPath = null;
        } else if ( type === "instance" ) {
          // do not alter instance id
          return;
        }
    },

    clearCurrentInstanceId:function() {
        // Update container so that it can save media and auxillary data
        // under different directories...
        odkSurveyStateManagement.clearInstanceId(this.getRefId());
    },

    setCurrentInstanceId:function(instanceId) {
        // Update container so that it can save media and auxillary data
        // under different directories...
        odkSurveyStateManagement.setInstanceId( this.getRefId(), instanceId);
    },

    getCurrentInstanceId:function() {
        return odkSurveyStateManagement.getInstanceId(this.getRefId());
    },

    setCurrentTableId:function(table_id) {
        this.mdl.table_id = table_id;
    },

    getCurrentTableId:function() {
        return this.mdl.table_id;
    },

    getSectionTitle:function(formDef, sectionName) {
        var ref = this.getSettingObject(formDef, sectionName);
        if ( ref === null ) {
            ref = this.getSettingObject(formDef, 'survey'); // fallback
        }
        if ( ref === null || !("display" in ref) ) {
            return "<no title>";
        } else {
            var display = ref.display;
            if ( "title" in display ) {
                var titleEntry = display.title;
                return titleEntry;
            } else {
                return "<no title>";
            }
        }
    },
    getCurrentSectionTitle:function(sectionName) {
        return this.getSectionTitle(this.getCurrentFormDef(),sectionName);
    },
    getCurrentSectionShowContents: function(sectionName) {
        var formDef = this.getCurrentFormDef();
        var sectionSettings = this.getSettingObject(formDef,sectionName);
        if ( sectionSettings === null ) {
            sectionSettings = this.getSettingObject(formDef, 'survey'); // fallback
        }

        if ( sectionSettings === null ||
             !('showContents' in sectionSettings) ) {
            return true;
        }

        return sectionSettings.showContents;
    },
    /**
     * Retrieve the value of a setting from the form definition file or null if
     * undefined.
     * NOTE: in Survey XLSX syntax, the settings are row-by-row, like choices.
     * The returned object is therefore a map of keys to values for that row.
     *
     * Immediate.
      */
    getSettingObject:function(formDef, key) {
        if (formDef === undefined || formDef === null) return null;
        var obj = formDef.specification.settings[key];
        if ( obj === undefined ) return null;
        return obj;
    },

    /**
     * use this if you know the formDef is valid within the mdl...
     */
    getSettingValue:function(key) {
        var obj = this.getSettingObject(this.getCurrentFormDef(), key);
        if ( obj === null ) return null;
        return obj.value;
    },
    /**
        The list of locales should have been constructed by the XLSXConverter.
        It will be saved under settings._locales.value as a list:

        [ { name: "en_us", locale: { text: { "en_us": "English", "fr": "Anglais"}}},
           { name: "fr", locale: { text: {"en_us": "French", "fr": "Francais"}}} ]
    */
    getFormLocales:function(formDef) {
        if ( formDef !== null && formDef !== undefined ) {
            var locales = this.getSettingObject(formDef, '_locales' );
            if ( locales !== null && locales !== undefined &&
                 locales.value !== null && locales.value !== undefined ) {
                return locales.value;
            }
            alert("_locales not present in form! See console:");
            console.error("The synthesized _locales field is not present in the form!");
        }
        return [ { locale: { text: 'default' }, name: 'default' } ];
    },

    /**
     changed in rev 210 to use the setting from the Java side's Device Settings menu.
     */
    getDefaultFormLocaleValue:function() {
        // fetch this from platformInfo -- all forms share the same default locale
        // and any user-defined locales must be defined in the framework form (so they
        // can be processed by the Java side in this settings menu).
        // 
        // individual forms can still offer different locales independent of this
        // global setting, and the user can change into and out of any locale as
        // they see fit, but those changes don't propogate up to the Java layer.
        //
        return odkCommon.getPreferredLocale();
    },

    getFormLocalesValue:function() {
        return this.getFormLocales(this.getCurrentFormDef());
    },
    
    /**
     * cache the locale here so that we preserve the locale when we leave an instance.
     */
    setCachedLocale:function(locale) {
        this.cachedLocale = locale;
    },
    
    getCachedLocale:function() {
        return this.cachedLocale;
    },
    
    /**
     * Lower-level function to access a formDef file and parse it.
     * Should not be called from renderers!
     *
     * Read and JSON.parse() the specified filename.
     * Then invoke ctxt.success(jsonObj).
     */
    readFormDefFile: function(ctxt, filename) {
        var that = this;
        require(['text!' + filename],
            function(formDefTxt) {
                if ( formDefTxt === undefined || formDefTxt === null || formDefTxt.length === 0 ) {
                    alert('Unable to find file: ' + filename);
                    ctxt.failure({message: "Form definition is empty."});
                } else {
                    setTimeout(function() {
                        var formDef;
                        try {
                            formDef = JSON.parse(formDefTxt);
                        } catch (ex) {
                            ctxt.log('E','opendatakit.readFormDefFile.require.JSONexception',  'JSON parsing error: ' + ex.message);
                            ctxt.failure({message: "Exception while processing form definition."});
                            return;
                        }
                        try {
                            ctxt.success(formDef);
                        } catch (ex) {
                            ctxt.log('E','opendatakit.readFormDefFile.require.continuationException',
                                        'formDef interpetation or database setup error: ' + ex.message);
                            ctxt.failure({message: "Exception while processing form definition."});
                        }
                    }, 0);
                }
            }, function(err) {
                ctxt.log('E',"opendatakit.readFormDefFile.require.failure" + err.requireType + ' modules: ', err.requireModules.toString());
                ctxt.failure({message: "Failure while reading form definition (" + err.requireType + ")."});
            });
    },

    getShortDateFormat:function(date) {
        if (date === null || date === undefined || date.constructor.name !== 'Date')
            return null;

        var shortDate = (date.getMonth() + 1) + "/" + date.getDate()  + "/" + date.getFullYear();

        return shortDate;
    }
};
});
