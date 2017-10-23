(function() {
'use strict';
/* globals Episample Configuration reader */
    window.EpsConfig = {
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
        getID: function() {
            return localStorage.id ? localStorage.id : '';
        },
        getShowCollectModule: function() {
            return localStorage.showCollectModule ? parseInt(localStorage.showCollectModule) : 1;
        },
        getShowSelectModule:function() {
            return localStorage.showSelectModule ? parseInt(localStorage.showSelectModule) : 0;
        },
        getShowNavigateModule: function() {
            return localStorage.showNavigateModule ? parseInt(localStorage.showNavigateModule) : 1;
        },
        getGoodGpsAccuracyThresholds: function() {
            return localStorage.goodGpsAccuracyThresholds ? parseInt(localStorage.goodGpsAccuracyThresholds) : 10;
        },
        getModerateGpsAccuracyThresholds: function() {
            return localStorage.moderateGpsAccuracyThresholds ? parseInt(localStorage.moderateGpsAccuracyThresholds) : 50;
        },
        getMainPoints: function() {
            return localStorage.mainPoints ? parseInt(localStorage.mainPoints) : 0;
        },
        getAdditionalPoints: function() {
            return localStorage.additionalPoints ? parseInt(localStorage.additionalPoints) : 0;
        },
        getAlternatePoints: function() {
            return localStorage.alternatePoints ? parseInt(localStorage.alternatePoints) : 0;
        },
        getFormName: function() {
            return localStorage.formName ? localStorage.formName : '';
        },
        getPassword: function() {
            return localStorage.password ? localStorage.password : '';
        },
        init: function(successFnInit, failureFnInit) {
            var successFnRead = function( result ) {
                if(result.getCount() > 0) {
                    localStorage.id = result.getData(0,"_id");
                    localStorage.showCollectModule = result.getData(0,"show_collect_module")===1 ? 1 : 0;
                    localStorage.showSelectModule = result.getData(0,"show_select_module")===1 ? 1 : 0;
                    localStorage.showNavigateModule = result.getData(0,"show_navigate_module")===1? 1 : 0
                    localStorage.goodGpsAccuracyThresholds = result.getData(0,"good_gps_accuracy_thresholds");
                    localStorage.moderateGpsAccuracyThresholds = result.getData(0,"moderate_gps_accuracy_thresholds");
                    localStorage.mainPoints = result.getData(0,"main_points");
                    localStorage.additionalPoints = result.getData(0,"additional_points");
                    localStorage.alternatePoints = result.getData(0,"alternate_points");
                    localStorage.formName = result.getData(0,"form_name");
                    localStorage.password = result.getData(0,"password");
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
            
            if(this.password.length > 0) {
                //encrypt password
                config['password'] = sha256(this.password);
            }

            odkData.updateRow('config', config, EpsConfig.getID(), successFnUpdate, failureFnUpdate);
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
            
            if(this.password.length > 0) {
                //encrypt password
                config['password'] = sha256(this.password);
            }
            
            odkData.addRow('config', config, util.genUUID(), successFnInsert, failureFnInsert);
        }
    };
})();