(function() {
'use strict';
/* globals Episample Configuration reader */
    window.EpsConfig = {
        _id:0,
        showCollectModule:1,
        showSelectModule:0,
        showNavigateModule:1,
        goodGpsAccuracyThresholds:10,
        moderateGpsAccuracyThresholds:50,
        mainPoints:0,
        additionalPoints:0,
        alternatePoints:0,
        formName:'',
        password:'',
        configCount:0,
        resultCount:0,
        init: function(successFnInit, failureFnInit) {
            var self = this;
            var successFnRead = function( result ) {
                self.resultCount = result.getCount();
                if(self.resultCount > 0) {
                    self._id = result.getData(0,"_id");
                    self.showCollectModule = result.getData(0,"show_collect_module")===1 ? 1 : 0;
                    self.showSelectModule = result.getData(0,"show_select_module")===1 ? 1 : 0;
                    self.showNavigateModule = result.getData(0,"show_navigate_module")===1? 1 : 0
                    self.goodGpsAccuracyThresholds = result.getData(0,"good_gps_accuracy_thresholds");
                    self.moderateGpsAccuracyThresholds = result.getData(0,"moderate_gps_accuracy_thresholds");
                    self.mainPoints = result.getData(0,"main_points");
                    self.additionalPoints = result.getData(0,"additional_points");
                    self.alternatePoints = result.getData(0,"alternate_points");
                    self.formName = result.getData(0,"form_name");
                    self.password = result.getData(0,"password");
                }
                if(successFnInit != null) successFnInit();
            }

            var failureFnRead = function( errorMsg) {
                console.log('Failed to read config table');
                if(failureFnInit!= null) failureFnInit();
            }

            
            odkData.query('config', null, null, null, null,
                    null, null, null, null, null, successFnRead, failureFnRead);
            
        },

        updateConfig: function(successFnUpdate, failureFnUpdate) {
            var config = {};
            config['show_collect_module']= this.showCollectModule;
            config['show_select_module']= this.showSelectModule;
            config['show_navigate_module']= this.showNavigateModule;
            config['good_gps_accuracy_thresholds']= this.goodGpsAccuracyThresholds;
            config['moderate_gps_accuracy_thresholds']= this.moderateGpsAccuracyThresholds;
            config['main_points']= this.mainPoints;
            config['additional_points']= this.additionalPoints;
            config['alternate_points'] = this.alternatePoints;
            config['form_name'] = this.formName;
            //encrypt password
            config['password'] = this.password;

            odkData.updateRow('config', config, this._id, successFnUpdate, failureFnUpdate);
        },

        insertConfig: function(successFnInsert, failureFnInsert) {
            var config = {};
            config['show_collect_module']= this.showCollectModule;
            config['show_select_module']= this.showSelectModule;
            config['show_navigate_module']= this.showNavigateModule;
            config['good_gps_accuracy_thresholds']= this.goodGpsAccuracyThresholds;
            config['moderate_gps_accuracy_thresholds']= this.moderateGpsAccuracyThresholds;
            config['main_points']= this.mainPoints;
            config['additional_points']= this.additionalPoints;
            config['alternate_points'] = this.alternatePoints;
            config['form_name'] = this.formName;
            //encrypt password
            config['password'] = this.password;
            odkData.addRow('config', config, EpsUtils.generateUUID(), successFnInsert, failureFnInsert);
        }
    };
})();