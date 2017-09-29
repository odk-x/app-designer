/**
 * The odkSurveyStateManagement object is something we use to mock out some functionality for
 * testing in the browser. See the `window.odkSurveyStateManagement` definition below for more
 * information.
 */

/*
This odkSurveyStateManagement  object is just a facade for browser testing.
It defines the interface that ODK Survey or other container apps
must implement to work with the javascript library.
It will be replaced by one injected by Android Java code.
*/
(function() {
'use strict';
/* global odkCommon */
window.odkSurveyStateManagement = window.odkSurveyStateManagement || {
	_nonEmbeddedState: {},
    showAlerts: false,
    enforceRefIdMatch: true,
    clearAuxillaryHash: function() {
        // this only makes sense for screen-rotation recovery actions.
    },
	_getSurveyStateMgmt: function() {
		// if ( window.parent === window ) {
			return this._nonEmbeddedState;
		// } else {
		//	return window.parent.getSurveyStateMgmt();
		// }
	},
	_setRefId: function(refId) {
		var surveyStateMgmt = this._getSurveyStateMgmt();
		surveyStateMgmt.refId = refId;
	},
	_getRefId: function() {
		var surveyStateMgmt = this._getSurveyStateMgmt();
		if ( !('refId' in surveyStateMgmt) ) {
			surveyStateMgmt.refId = null;
		}
		return surveyStateMgmt.refId;
	},
    /**
     * The odkSurveyStateManagement now remembers an entire history of refId values.
     *
     * The manipulators below access the values for their respective refId
     * via refIdMap[refId]. The values tracked per refId are:
     *   instanceId
     *   sectionStateScreenHistory
     */
    lookupRefIdData: function(refId) {
		var surveyStateMgmt = this._getSurveyStateMgmt();
		if ( !('refIdMap' in surveyStateMgmt) ) {
			surveyStateMgmt.refIdMap = {};
		} 
        var settings = surveyStateMgmt.refIdMap[refId];
        if ( settings === undefined || settings === null ) {
            settings = {
                instanceId: null,
                sectionStateScreenHistory: []
            };
            surveyStateMgmt.refIdMap[refId] = settings;
        }
        return settings;
    },
    clearInstanceId: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: clearInstanceId(" + refId + ")");
            return;
        }
        odkCommon.log("D","odkSurveyStateManagement: DO: clearInstanceId(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        settings.instanceId = null;
    },
    setInstanceId: function( refId, instanceId ) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: setInstanceId(" + refId + ", " + instanceId + ")");
            return;
        }
        // report the new instanceId to ODK Survey...
        // needed so that callbacks, etc. can properly track the instanceId
        // currently being worked on.
        odkCommon.log("D","odkSurveyStateManagement: DO: setInstanceId(" + refId + ", " + instanceId + ")");
        var settings = this.lookupRefIdData(refId);
        settings.instanceId = instanceId;
    },
    getInstanceId: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: getInstanceId(" + refId + ")");
            return null;
        }
        // report the new instanceId to ODK Survey...
        // needed so that callbacks, etc. can properly track the instanceId
        // currently being worked on.
        odkCommon.log("D","odkSurveyStateManagement: DO: getInstanceId(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        return settings.instanceId;
    },
    _dumpScreenStateHistory : function(settings) {
        odkCommon.log("D","odkSurveyStateManagement -------------*start* dumpScreenStateHistory--------------------");
        if ( settings.sectionStateScreenHistory.length === 0 ) {
            odkCommon.log("D","odkSurveyStateManagement sectionScreenStateHistory EMPTY");
        } else {
            var i;
            for ( i = settings.sectionStateScreenHistory.length-1 ; i >= 0 ; --i ) {
                var thisSection = settings.sectionStateScreenHistory[i];
                odkCommon.log("D","odkSurveyStateManagement [" + i + "] screenPath: " + thisSection.screen );
                odkCommon.log("D","odkSurveyStateManagement [" + i + "] state:      " + thisSection.state );
                if ( thisSection.history.length === 0 ) {
                    odkCommon.log("D","odkSurveyStateManagement [" + i + "] history[] EMPTY" );
                } else {
                    var j;
                    for ( j = thisSection.history.length-1 ; j >= 0 ; --j ) {
                        var ss = thisSection.history[j];
                        odkCommon.log("D","odkSurveyStateManagement [" + i + "] history[" + j + "] screenPath: " + ss.screen );
                        odkCommon.log("D","odkSurveyStateManagement [" + i + "] history[" + j + "] state:      " + ss.state );
                    }
                }
            }
        }
        odkCommon.log("D","odkSurveyStateManagement ------------- *end*  dumpScreenStateHistory--------------------");
    },
    pushSectionScreenState: function( refId) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: pushSectionScreenState(" + refId + ")");
            return;
        }

        odkCommon.log("D","odkSurveyStateManagement: DO: pushSectionScreenState(" + refId + ")");
        var settings = this.lookupRefIdData(refId);

        if ( settings.sectionStateScreenHistory.length === 0 ) {
            return;
        }

        var lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
        lastSection.history.push( { screen: lastSection.screen, state: lastSection.state } );
    },
    setSectionScreenState: function( refId, screenPath, state) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: setSectionScreenState(" + refId + ", " + screenPath + ", " + state + ")");
            return;
        }

        odkCommon.log("D","odkSurveyStateManagement: DO: setSectionScreenState(" + refId + ", " + screenPath + ", " + state + ")");
        var settings = this.lookupRefIdData(refId);
        if ( screenPath === undefined || screenPath === null ) {
            alert("setSectionScreenState received a null screen path!");
            odkCommon.log("E","setSectionScreenState received a null screen path!");
            return;
        } else {
            var splits = screenPath.split('/');
            var sectionName = splits[0] + "/";
            if (settings.sectionStateScreenHistory.length === 0) {
                settings.sectionStateScreenHistory.push( { history: [], screen: screenPath, state: state } );
            } else {
                var lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
                if ( lastSection.screen.substring(0,sectionName.length) === sectionName ) {
                    lastSection.screen = screenPath;
                    lastSection.state = state;
                } else {
                    settings.sectionStateScreenHistory.push( { history: [], screen: screenPath, state: state } );
                }
            }
        }
    },
    clearSectionScreenState: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: clearSectionScreenState(" + refId + ")");
            return;
        }

        odkCommon.log("D","odkSurveyStateManagement: DO: clearSectionScreenState(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        settings.sectionStateScreenHistory = [ { history: [], screen: 'initial/0', state: null } ];
    },
    getControllerState: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: getControllerState(" + refId + ")");
            return null;
        }
        odkCommon.log("D","odkSurveyStateManagement: DO: getControllerState(" + refId + ")");
        var settings = this.lookupRefIdData(refId);

        if ( settings.sectionStateScreenHistory.length === 0 ) {
            odkCommon.log("D","odkSurveyStateManagement: getControllerState: NULL!");
            return null;
        }
        var lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
        return lastSection.state;
    },
    getScreenPath: function(refId) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: getScreenPath(" + refId + ")");
            return null;
        }
        odkCommon.log("D","odkSurveyStateManagement: DO: getScreenPath(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        this._dumpScreenStateHistory(settings);

        if ( settings.sectionStateScreenHistory.length === 0 ) {
            odkCommon.log("D","odkSurveyStateManagement: getScreenPath: NULL!");
            return null;
        }
        var lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
        return lastSection.screen;
    },
    hasScreenHistory: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: hasScreenHistory(" + refId + ")");
            return false;
        }
        odkCommon.log("D","odkSurveyStateManagement: DO: hasScreenHistory(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        // two or more sections -- there must be history!
        if ( settings.sectionStateScreenHistory.length > 1 ) {
            return true;
        }
        // nothing at all -- no history
        if ( settings.sectionStateScreenHistory.length === 0 ) {
            return false;
        }
        // just one section -- is there any screen history within it?
        var thisSection = settings.sectionStateScreenHistory[0];
        return ( thisSection.history.length !== 0 );
    },
    popScreenHistory: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: popScreenHistory(" + refId + ")");
            return null;
        }
        odkCommon.log("D","odkSurveyStateManagement: DO: popScreenHistory(" + refId + ")");
        var settings = this.lookupRefIdData(refId);

        if ( settings.sectionStateScreenHistory.length === 0 ) {
            return null;
        }

        var lastSection;

        lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
        if ( lastSection.history.length !== 0 ) {
            // pop history from within this section
            var lastHistory = lastSection.history.pop();
            lastSection.screen = lastHistory.screen;
            lastSection.state = lastHistory.state;
            return lastSection.screen;
        }

        // pop to an enclosing section
        settings.sectionStateScreenHistory.pop();
        if ( settings.sectionStateScreenHistory.length === 0 ) {
            return null;
        }

        // return the screen from that last section... (do not pop the history)
        lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
        return lastSection.screen;
    },
    /**
     * Section stack -- maintains the stack of sections from which you can exit.
     */
    hasSectionStack: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: hasSectionStack(" + refId + ")");
            return false;
        }
        odkCommon.log("D","odkSurveyStateManagement: DO: hasSectionStack(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        return settings.sectionStateScreenHistory.length !== 0;
    },
    popSectionStack: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: popSectionStack(" + refId + ")");
            return null;
        }
        odkCommon.log("D","odkSurveyStateManagement: DO: popSectionStack(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        if ( settings.sectionStateScreenHistory.length !== 0 ) {
            settings.sectionStateScreenHistory.pop();
        }

        if ( settings.sectionStateScreenHistory.length !== 0 ) {
            var lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
            return lastSection.screen;
        }

        return null;
    },
    saveAllChangesCompleted: function( refId, instanceId, asComplete ) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: saveAllChangesCompleted(" + refId + ", " + instanceId + ", " + asComplete + ")");
            return;
        }
        odkCommon.log("D","odkSurveyStateManagement: DO: saveAllChangesCompleted(" + refId + ", " + instanceId + ", " + asComplete + ")");
        if ( this.showAlerts ) alert("notify container OK save " + (asComplete ? 'COMPLETE' : 'INCOMPLETE') + '.');
		odkCommon.closeWindow(-1, {
			instanceId: instanceId, 
			savepoint_type: (asComplete ? 'COMPLETE' : 'INCOMPLETE') } );
    },
    saveAllChangesFailed: function( refId, instanceId ) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: saveAllChangesFailed(" + refId + ", " + instanceId + ")");
            return;
        }
        odkCommon.log("D","odkSurveyStateManagement: DO: saveAllChangesFailed(" + refId + ", " + instanceId + ")");
        if ( this.showAlerts ) alert("notify container FAILED save (unknown whether COMPLETE or INCOMPLETE was attempted).");
    },
    ignoreAllChangesCompleted: function( refId, instanceId ) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: ignoreAllChangesCompleted(" + refId + ", " + instanceId + ")");
            return;
        }
        odkCommon.log("D","odkSurveyStateManagement: DO: ignoreAllChangesCompleted(" + refId + ", " + instanceId + ")");
        if ( this.showAlerts ) alert("notify container OK ignore all changes.");
		// TODO: should we return current savepoint_type for this row?
		odkCommon.closeWindow(-1, {
			instanceId: instanceId, 
			savepoint_type: 'INCOMPLETE' } );
    },
    ignoreAllChangesFailed: function( refId, instanceId ) {
        if (this.enforceRefIdMatch && refId !== this._getRefId()) {
            odkCommon.log("D","odkSurveyStateManagement: IGNORED: ignoreAllChangesFailed(" + refId + ", " + instanceId + ")");
            return;
        }
        odkCommon.log("D","odkSurveyStateManagement: DO: ignoreAllChangesFailed(" + refId + ", " + instanceId + ")");
        if ( this.showAlerts ) alert("notify container FAILED ignore all changes.");
    }
};
})();
