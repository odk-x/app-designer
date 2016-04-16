/* global odkCommon */
/**
 * The odkSurvey object is something we use to mock out some functionality for
 * testing in the browser. See the `window.odkSurvey` definition below for more
 * information.
 */

/*
This odkSurvey  object is just a facade for browser testing.
It defines the interface that ODK Survey or other container apps
must implement to work with the javascript library.
It will be replaced by one injected by Android Java code.
*/
window.odkSurvey = window.odkSurvey || {
    showAlerts: false,
    refId: null,
    enforceRefIdMatch: true,
    clearAuxillaryHash: function() {
        // this only makes sense for screen-rotation recovery actions.
    },
    /**
     * The odkSurvey now remembers an entire history of refId values.
     *
     * The manipulators below access the values for their respective refId
     * via refIdMap[refId]. The values tracked per refId are:
     *   instanceId
     *   sectionStateScreenHistory
     */
    refIdMap: {}, // map indexed by refId
    lookupRefIdData: function(refId) {
        var settings = this.refIdMap[refId];
        if ( settings === undefined || settings === null ) {
            settings = {
                instanceId: null,
                sectionStateScreenHistory: []
            };
            this.refIdMap[refId] = settings;
        }
        return settings;
    },
    clearInstanceId: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: clearInstanceId(" + refId + ")");
            return;
        }
        odkCommon.log("D","odkSurvey: DO: clearInstanceId(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        settings.instanceId = null;
    },
    setInstanceId: function( refId, instanceId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: setInstanceId(" + refId + ", " + instanceId + ")");
            return;
        }
        // report the new instanceId to ODK Survey...
        // needed so that callbacks, etc. can properly track the instanceId
        // currently being worked on.
        odkCommon.log("D","odkSurvey: DO: setInstanceId(" + refId + ", " + instanceId + ")");
        var settings = this.lookupRefIdData(refId);
        settings.instanceId = instanceId;
    },
    getInstanceId: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: getInstanceId(" + refId + ")");
            return null;
        }
        // report the new instanceId to ODK Survey...
        // needed so that callbacks, etc. can properly track the instanceId
        // currently being worked on.
        odkCommon.log("D","odkSurvey: DO: getInstanceId(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        return settings.instanceId;
    },
    _dumpScreenStateHistory : function(settings) {
        odkCommon.log("D","odkSurvey -------------*start* dumpScreenStateHistory--------------------");
        if ( settings.sectionStateScreenHistory.length === 0 ) {
            odkCommon.log("D","odkSurvey sectionScreenStateHistory EMPTY");
        } else {
            var i;
            for ( i = settings.sectionStateScreenHistory.length-1 ; i >= 0 ; --i ) {
                var thisSection = settings.sectionStateScreenHistory[i];
                odkCommon.log("D","odkSurvey [" + i + "] screenPath: " + thisSection.screen );
                odkCommon.log("D","odkSurvey [" + i + "] state:      " + thisSection.state );
                if ( thisSection.history.length === 0 ) {
                    odkCommon.log("D","odkSurvey [" + i + "] history[] EMPTY" );
                } else {
                    var j;
                    for ( j = thisSection.history.length-1 ; j >= 0 ; --j ) {
                        var ss = thisSection.history[j];
                        odkCommon.log("D","odkSurvey [" + i + "] history[" + j + "] screenPath: " + ss.screen );
                        odkCommon.log("D","odkSurvey [" + i + "] history[" + j + "] state:      " + ss.state );
                    }
                }
            }
        }
        odkCommon.log("D","odkSurvey ------------- *end*  dumpScreenStateHistory--------------------");
    },
    pushSectionScreenState: function( refId) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: pushSectionScreenState(" + refId + ")");
            return;
        }

        odkCommon.log("D","odkSurvey: DO: pushSectionScreenState(" + refId + ")");
        var settings = this.lookupRefIdData(refId);

        if ( settings.sectionStateScreenHistory.length === 0 ) {
            return;
        }

        var lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
        lastSection.history.push( { screen: lastSection.screen, state: lastSection.state } );
    },
    setSectionScreenState: function( refId, screenPath, state) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: setSectionScreenState(" + refId + ", " + screenPath + ", " + state + ")");
            return;
        }

        odkCommon.log("D","odkSurvey: DO: setSectionScreenState(" + refId + ", " + screenPath + ", " + state + ")");
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
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: clearSectionScreenState(" + refId + ")");
            return;
        }

        odkCommon.log("D","odkSurvey: DO: clearSectionScreenState(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        settings.sectionStateScreenHistory = [ { history: [], screen: 'initial/0', state: null } ];
    },
    getControllerState: function( refId ) {
        if (this.enforceRefIdMatch && refId != this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: getControllerState(" + refId + ")");
            return null;
        }
        odkCommon.log("D","odkSurvey: DO: getControllerState(" + refId + ")");
        var settings = this.lookupRefIdData(refId);

        if ( settings.sectionStateScreenHistory.length === 0 ) {
            odkCommon.log("D","odkSurvey: getControllerState: NULL!");
            return null;
        }
        var lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
        return lastSection.state;
    },
    getScreenPath: function(refId) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: getScreenPath(" + refId + ")");
            return null;
        }
        odkCommon.log("D","odkSurvey: DO: getScreenPath(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        this._dumpScreenStateHistory(settings);

        if ( settings.sectionStateScreenHistory.length === 0 ) {
            odkCommon.log("D","odkSurvey: getScreenPath: NULL!");
            return null;
        }
        var lastSection = settings.sectionStateScreenHistory[settings.sectionStateScreenHistory.length-1];
        return lastSection.screen;
    },
    hasScreenHistory: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: hasScreenHistory(" + refId + ")");
            return false;
        }
        odkCommon.log("D","odkSurvey: DO: hasScreenHistory(" + refId + ")");
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
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: popScreenHistory(" + refId + ")");
            return null;
        }
        odkCommon.log("D","odkSurvey: DO: popScreenHistory(" + refId + ")");
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
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: hasSectionStack(" + refId + ")");
            return false;
        }
        odkCommon.log("D","odkSurvey: DO: hasSectionStack(" + refId + ")");
        var settings = this.lookupRefIdData(refId);
        return settings.sectionStateScreenHistory.length !== 0;
    },
    popSectionStack: function( refId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: popSectionStack(" + refId + ")");
            return null;
        }
        odkCommon.log("D","odkSurvey: DO: popSectionStack(" + refId + ")");
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
    frameworkHasLoaded: function(refId, outcome) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: frameworkHasLoaded(" + refId + ", " + outcome + ")");
            return;
        }
        odkCommon.log("E","odkSurvey: DO: frameworkHasLoaded(" + refId + ", " + outcome + ")");
        if ( this.showAlerts ) alert("notify container frameworkHasLoaded " + (outcome ? "SUCCESS" : "FAILURE"));
    },
    saveAllChangesCompleted: function( refId, instanceId, asComplete ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: saveAllChangesCompleted(" + refId + ", " + instanceId + ", " + asComplete + ")");
            return;
        }
        odkCommon.log("D","odkSurvey: DO: saveAllChangesCompleted(" + refId + ", " + instanceId + ", " + asComplete + ")");
        if ( this.showAlerts ) alert("notify container OK save " + (asComplete ? 'COMPLETE' : 'INCOMPLETE') + '.');
        if ( window.parent === window ) {
            window.close();
        } else {
            window.parent.closeAndPopPage();
        }
    },
    saveAllChangesFailed: function( refId, instanceId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: saveAllChangesFailed(" + refId + ", " + instanceId + ")");
            return;
        }
        odkCommon.log("D","odkSurvey: DO: saveAllChangesFailed(" + refId + ", " + instanceId + ")");
        if ( this.showAlerts ) alert("notify container FAILED save (unknown whether COMPLETE or INCOMPLETE was attempted).");
    },
    ignoreAllChangesCompleted: function( refId, instanceId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: ignoreAllChangesCompleted(" + refId + ", " + instanceId + ")");
            return;
        }
        odkCommon.log("D","odkSurvey: DO: ignoreAllChangesCompleted(" + refId + ", " + instanceId + ")");
        if ( this.showAlerts ) alert("notify container OK ignore all changes.");
        if ( window.parent === window ) {
            window.close();
        } else {
            window.parent.closeAndPopPage();
        }
    },
    ignoreAllChangesFailed: function( refId, instanceId ) {
        if (this.enforceRefIdMatch && refId !== this.refId) {
            odkCommon.log("D","odkSurvey: IGNORED: ignoreAllChangesFailed(" + refId + ", " + instanceId + ")");
            return;
        }
        odkCommon.log("D","odkSurvey: DO: ignoreAllChangesFailed(" + refId + ", " + instanceId + ")");
        if ( this.showAlerts ) alert("notify container FAILED ignore all changes.");
    }
};
