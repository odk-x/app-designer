define(['promptTypes','jquery','underscore', 'opendatakit', 'database', 'prompts'],
function(promptTypes, $,       _, opendatakit, database) {
// custom functions are placed under 'window' to be visible in calculates...
// note that you need to be careful about naming -- should probably go somewhere else?
window.is_finalized = function() {
    return ('COMPLETE' === database.getInstanceMetaDataValue('_savepoint_type'));
};

var async_assign = promptTypes.base.extend({
    type: "async_assign",
    debug: false,
    valid: true,
    templatePath: '../tables/agriculture/forms/agriculture/templates/async_assign.handlebars',
    _cachedSelection: null,
    getLinkedTableId: function() {
        var queryDefn = opendatakit.getQueriesDefinition(this.values_list);
        if ( queryDefn != null )
        {
            if ( queryDefn.linked_table_id == null ) {
                return queryDefn.linked_form_id;
            } else {
                return queryDefn.linked_table_id;
            }
        } else {
            shim.log('E',"query definiton is null for " + this.type + " in getLinkedTableId");
            return null;
        }
    },
    getLinkedFormId: function() {
        var queryDefn = opendatakit.getQueriesDefinition(this.values_list);
        if ( queryDefn != null )
        {
            return queryDefn.linked_form_id;
        } else {
            shim.log('E',"query definiton is null for " + this.type + " in getLinkedFormId");
            return null;
        }
    },
    getLinkedFieldName: function() {
        var queryDefn = opendatakit.getQueriesDefinition(this.values_list);
        if ( queryDefn != null )
        {
            return queryDefn.fieldName;
        } else {
            shim.log('E',"query definiton is null for " + this.type + " in getLinkedFieldName");
            return null;
        }
    },
    getFormPath: function() {
        if ( this.getLinkedFormId() === "framework" ) {
            return '../assets/framework/forms/framework/'; 
        } else {
            return '../tables/' + this.getLinkedTableId() + '/forms/' + this.getLinkedFormId() + '/'; 
        }
    },
    convertSelection: function(linkedMdl) {
        var queryDefn = opendatakit.getQueriesDefinition(this.values_list);
        var that = this;
        if ( queryDefn.selection == null || queryDefn.selection.length === 0 ) {
            return null;
        }
        if ( that._cachedSelection != null ) {
            return that._cachedSelection;
        }
        that._cachedSelection = database.convertSelectionString(linkedMdl, queryDefn.selection);
        return that._cachedSelection;
    },
    _linkedCachedMdl: null,
    _linkedCachedInstanceName: null,
    getLinkedInstanceName: function() {
        return this._linkedCachedInstanceName;
    },
    getLinkedMdl: function(ctxt) {
        var that = this;
        if ( that._linkedCachedMdl != null ) {
            ctxt.success(that._linkedCachedMdl);
            return;
        }
        var filePath = that.getFormPath() + 'formDef.json';
        opendatakit.readFormDefFile($.extend({},ctxt,{success:function(formDef) {
             var ino = opendatakit.getSettingObject(formDef, 'instance_name');
             if ( ino !== null ) {
                that._linkedCachedInstanceName = ino.value;
            } else {
                that._linkedCachedInstanceName = null;
            }
            database.readTableDefinition($.extend({}, ctxt, {success:function(tlo) {
                ctxt.log('D',"prompts." + that.type + 
                    'getLinkedMdl.readTableDefinition.success', "px: " + that.promptIdx );
                that._linkedCachedMdl = tlo;
                ctxt.success(tlo);
            }}), formDef, that.getLinkedTableId(), filePath);
        }}), filePath );
    },
    choice_filter: function(){ return true; },
    configureRenderContext: function(ctxt) {
        var that = this;
        var queryDefn = opendatakit.getQueriesDefinition(this.values_list);
        ctxt.log('D',"prompts." + that.type + ".configureRenderContext", "px: " + that.promptIdx);
        that.getLinkedMdl($.extend({},ctxt,{success:function(linkedMdl) {
            var dbTableName = linkedMdl.table_id;
            var selString = that.convertSelection(linkedMdl);
            var selArgs = queryDefn.selectionArgs();
            var displayElementName = that.getLinkedFieldName();
            ctxt.log('D',"prompts." + that.type + ".configureRenderContext.before.get_linked_instances", "px: " + that.promptIdx);
            database.get_linked_instances($.extend({},ctxt,{success:function(instanceList) {
                ctxt.log('D',"prompts." + that.type + ".configureRenderContext.success.get_linked_instances", "px: " + that.promptIdx);
                var filteredInstanceList = _.filter(instanceList, function(instance) {
                    return that.choice_filter(instance);
                });
                instanceList = filteredInstanceList;
                // get the value we are aggregating
                var valueList = _.map(instanceList, function(instance) {
                    return instance['display_field'];
                    });
                // discard any nulls or undefineds
                valueList = _.filter(valueList, function(value) {
                    return value !== null && value !== undefined;
                });
                
                var aggValue;
                if ( valueList.length === 0 ) {
                    // set aggValue to null
                    aggValue = null;
                    if ( that.type === "async_assign_total" ) {
                        aggValue = 0.0;
                    } else if ( that.type === "async_assign_count" ) {
                        aggValue = 0;
                    }
                } else {
                    if ( that.type === "async_assign_max" ) {
                        aggValue = _.max(valueList);
                    } else if ( that.type === "async_assign_min" ) {
                        aggValue = _.min(valueList);
                    } else if ( that.type === "async_assign_avg" ) {
                        var sum = _.reduce(valueList, function(memo, value) { return memo + value; }, 0.0);
                        aggValue = sum / valueList.length;
                    } else if ( that.type === "async_assign_sum"  || that.type === "async_assign_total" ) {
                        var sum = _.reduce(valueList, function(memo, value) { return memo + value; }, 0.0);
                        aggValue = sum;
                    } else if ( that.type === "async_assign_count" ) {
                        aggValue = valueList.length;
                    } else {
                        ctxt.log('E',"prompts." + that.type + ".configureRenderContext.unrecognizedPromptType", "px: " + that.promptIdx);
                        aggValue = null;
                    }
                }

                that.setValueDeferredChange(aggValue);
                that.renderContext.type = that.type;
                that.renderContext.valueList = JSON.stringify(valueList);
                that.renderContext.aggValue = (aggValue === null) ? "null" : ((aggValue === undefined) ? "undefined" : aggValue);
                
                ctxt.log('D',"prompts." + that.type + ".configureRenderContext.success.get_linked_instances.success", "px: " + that.promptIdx + " instanceList: " + instanceList.length);
                ctxt.success();
            }}), dbTableName, selString, selArgs, displayElementName, null);
        }}));
    }
});

return {
"async_assign" : async_assign,
"async_assign_max" : async_assign.extend({
    type: "async_assign_max",
    datatype: "number"
}),
"async_assign_min" : async_assign.extend({
    type: "async_assign_min",
    datatype: "number"
}),
"async_assign_avg" : async_assign.extend({
    type: "async_assign_avg",
    datatype: "number"
}),
"async_assign_sum" : async_assign.extend({
    type: "async_assign_sum",
    datatype: "number"
}),
"async_assign_total" : async_assign.extend({
    type: "async_assign_total",
    datatype: "number"
}),
"async_assign_count" : async_assign.extend({
    type: "async_assign_count",
    datatype: "integer"
})
}});