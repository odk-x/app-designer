/* globals odkCommon, odkSurvey */
/**
 * This is a random collection of methods that don't quite belong anywhere.
 *
 * A set of utilities, some of which wrap the Java interface (odkSurvey.js), and others
 * provide useful parsing or interpretation of localization details.
 *
 */

define(['underscore', 'XRegExp'],function(_,XRegExp) {
'use strict';
verifyLoad('opendatakit',
    ['underscore', 'XRegExp'],
    [ _,            XRegExp]);
return {
    initialScreenPath: "initial/0",
    savepoint_type_complete: 'COMPLETE',
    savepoint_type_incomplete: 'INCOMPLETE',
    baseDir: '',
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
            //     schemaETag: TableDefinitionEntry.getSchemaETag(),
            //     lastDataETag: TableDefinitionEntry.getLastDataETag(),
            //     lastSyncTime: TableDefinitionEntry.getLastSyncTime(),
            //
            // NOTE: elementKeyMap is NOT AVAILABLE in Feb 2016 app-designer. Only available on device.
            //     elementKeyMap: { columnElementKey: index-into-row[]-for-column-value },
            // NOTE: orderedColumns is NOT AVAILABLE in Feb 2016 app-designer. Only available on device.
            //     orderedColumns: {
            //                 fieldElementNameA: {
            //                    type: elementDataType,
            //                    elementType: elementType, // optional -- if different than type
            //                    elementKey: fullyQualifiedName, // underscore-concatenated elementName ancestor_..._this path
            //                    items: {  // only if type == 'array'
            //                          recursive JSON schema type defn. (type, elementType, ...)
            //                       },
            //                    properties: { // only if type == 'object'
            //                        nestedFieldElementNameA: {
            //                          recursive JSON Schema type defn. (type, elementType, ...)
            //                        },
            //                        nestedFieldElementNameB...
            //                      }
            //                   },
            //                 fieldElementNameB...
            //              }
            //     keyValueStoreList: [
            //                     //
            //                     // value is one of bool, integer, number or, for all other types (e.g., array, object), a string.
            //                     //
            //              { partition: xxx, aspect: xxx, key: xxx, type: xxx, value: xxx },
            //              ...
            //          ]
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
        /*jshint bitwise: false*/
        // construct a UUID (from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript )
        var id = "uuid:" +
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            // NOTE: the logical OR forces the number into an integer
            var r = Math.random()*16|0;
            // and the logical OR for 'y' values forces the number to be 8, 9, a or b.
            // https://en.wikipedia.org/wiki/Universally_unique_identifier -- Version 4 (random)
            var v = (c === 'x') ? r : (r&0x3|0x8);
            return v.toString(16);
        });
        return id;
    },
    getSameRefIdHashString:function(formPath, instanceId, screenPath) {
        var refId = this.getRefId();
        if ( formPath === undefined || formPath === null ) {
            formPath = odkCommon.getBaseUrl() + "/";
        }
        var qpl =
            '#formPath=' + encodeURIComponent(formPath) +
            ((instanceId === undefined || instanceId === null) ? '' : ('&instanceId=' + encodeURIComponent(instanceId))) +
            '&screenPath=' + encodeURIComponent((screenPath === undefined || screenPath === null) ? this.initialScreenPath : screenPath) +
            ((refId === undefined || refId === null) ? '' : ('&refId=' + encodeURIComponent(refId)));
        return qpl;
    },
    getHashString:function(formPath, instanceId, screenPath) {
        var refId = this.genUUID();
        if ( formPath === undefined || formPath === null ) {
            formPath = odkCommon.getBaseUrl() + "/";
        }
        var qpl =
            '#formPath=' + encodeURIComponent(formPath) +
            ((instanceId === undefined || instanceId === null) ? '' : ('&instanceId=' + encodeURIComponent(instanceId))) +
            '&screenPath=' + encodeURIComponent((screenPath === undefined || screenPath === null) ? this.initialScreenPath : screenPath) +
            ((refId === undefined || refId === null) ? '' : ('&refId=' + encodeURIComponent(refId)));
        return qpl;
    },
    convertHashStringToSurveyUri: function(hashString) {
        // assume we have a hashString:
        // #formPath=...&instanceId=...&...
        // reformat it into a URI suitable for invoking ODK Survey
        var that = this;
        odkCommon.log("D","convertHashStringToSurveyUri: hash " + hashString);
        if ( !hashString.match(/^(\??#).*/) ) {
            throw new Error('parsing of hashString failed - not a relative path (does not begin with ?# or #');
        }

        // we expect it to start with ?# or #
        if ( hashString.charAt(0) === '?' ) {
            hashString = hashString.substring(1);
        }
        if ( hashString.charAt(0) === '#' ) {
            hashString = hashString.substring(1);
        }
        var keyValues = hashString.split("&");
        var reconstitutedKeyValues = "";
        var formPath = null;
        var instanceId = null;
        var i;
        var parts;
        for ( i = 0 ; i < keyValues.length ; ++i ) {
            parts = keyValues[i].split('=');
            if ( parts.length > 2 ) {
                throw new Error('parsing of hashString failed - incorrect &key=value sequence');
            }
            var key = parts[0];
            if ( key === 'formPath' ) {
                formPath = parts[1];
            } else if ( key === 'instanceId' ) {
                instanceId = parts[1];
            } else {
                reconstitutedKeyValues = reconstitutedKeyValues +
                    "&" + keyValues[i];
            }
        }
        if ( instanceId !== null ) {
            reconstitutedKeyValues =
                "&instanceId=" + encodeURIComponent(instanceId) +
                reconstitutedKeyValues;
        }
        if ( formPath === null ) {
            throw new Error('parsing of hashString failed - no formPath found');
        }
        parts = decodeURIComponent(formPath).split("/");
        // the formPath ends in a slash, so we want the entry before the last one...
        var formId = parts[parts.length-2];

        var tableId = parts[parts.length-4];

        var appName = that.getPlatformInfo().appName;

        var uri = "content://org.opendatakit.common.android.provider.forms/" +
            appName + "/" + tableId + "/" + formId + "/#" +
            reconstitutedKeyValues.substring(1);

        odkCommon.log("D","convertHashStringToSurveyUri: as Uri " + uri);
        return uri;
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
        // this prevents saves into odkSurvey from succeeding...
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
        odkSurvey.clearInstanceId(this.getRefId());
    },

    setCurrentInstanceId:function(instanceId) {
        // Update container so that it can save media and auxillary data
        // under different directories...
        odkSurvey.setInstanceId( this.getRefId(), instanceId);
    },

    getCurrentInstanceId:function() {
        return odkSurvey.getInstanceId(this.getRefId());
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
                return display.title;
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

        [ { name: "en_us", display: { text: { "en_us": "English", "fr": "Anglais"}}},
           { name: "fr", display: { text: {"en_us": "French", "fr": "Francais"}}} ]
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
        return [ { display: { text: 'default' }, name: 'default' } ];
    },

    /**
        The default locale is a synthesized value. It is specified by
        the value of the '_default_locale' setting.

        This is generally the first locale in the _locales list, above.
     */
    getDefaultFormLocale:function(formDef) {
        if ( formDef !== null &&  formDef !== undefined ) {
            var localeObject = this.getSettingObject(formDef, '_default_locale');
            if ( localeObject !== null && localeObject !== undefined &&
                 localeObject.value !== null && localeObject.value !== undefined ) {
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
