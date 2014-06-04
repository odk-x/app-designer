define(['promptTypes','jquery','underscore', 'prompts'],
function(promptTypes, $,       _) {
    window.classifyWeight = function() {
        var tableBoySingle =   [[1.7, 1.9, 2, 2.2, 2.4], [1.8, 2, 2.2, 2.4, 2.6], [2, 2.1, 2.3, 2.5, 2.8], 
                                [2.1, 2.3, 2.5, 2.7, 2.9], [2.2, 2.4, 2.6, 2.9, 3.1], [2.4, 2.6, 2.8, 3, 3.3], 
                                [2.5, 2.7, 3, 3.2, 3.5], [2.7, 2.9, 3.2, 3.5, 3.8], [2.9, 3.1, 3.4, 3.7, 4], 
                                [3.1, 3.3, 3.6, 3.9, 4.3], [3.3, 3.6, 3.8, 4.2, 4.5], [3.5, 3.8, 4.1, 4.4, 4.8], 
                                [3.7, 4, 4.3, 4.7, 5.1], [3.9, 4.3, 4.6, 5, 5.4], [4.1, 4.5, 4.8, 5.3, 5.7], 
                                [4.3, 4.7, 5.1, 5.5, 6], [4.5, 4.9, 5.3, 5.8, 6.3], [4.7, 5.1, 5.6, 6, 6.5], 
                                [4.9, 5.3, 5.8, 6.2, 6.8], [5.1, 5.5, 6, 6.5, 7], [5.3, 5.7, 6.2, 6.7, 7.3], 
                                [5.5, 5.9, 6.4, 6.9, 7.5], [5.6, 6.1, 6.6, 7.1, 7.7], [5.8, 6.3, 6.8, 7.3, 8], 
                                [6, 6.5, 7, 7.6, 8.2], [6.1, 6.6, 7.2, 7.8, 8.4], [6.3, 6.8, 7.4, 8, 8.6], 
                                [6.4, 7, 7.6, 8.2, 8.9], [6.6, 7.2, 7.7, 8.4, 9.1], [6.7, 7.3, 7.9, 8.6, 9.3], 
                                [6.9, 7.5, 8.1, 8.8, 9.5], [7, 7.6, 8.3, 8.9, 9.7], [7.2, 7.8, 8.4, 9.1, 9.9], 
                                [7.3, 7.9, 8.6, 9.3, 10.1], [7.4, 8.1, 8.7, 9.5, 10.3], [7.6, 8.2, 8.9, 9.6, 10.4], 
                                [7.7, 8.4, 9.1, 9.8, 10.6], [7.9, 8.5, 9.2, 10, 10.8], [8, 8.7, 9.4, 10.2, 11], 
                                [8.2, 8.9, 9.6, 10.4, 11.3], [8.4, 9.1, 9.8, 10.6, 11.5], [8.6, 9.3, 10, 10.8, 11.7]];

        var tableGirlSingle =  [[1.7, 1.9, 2.1, 2.3, 2.5], [1.9, 2, 2.2, 2.4, 2.6], [2, 2.2, 2.4, 2.6, 2.8], 
                                [2.1, 2.3, 2.5, 2.7, 3], [2.2, 2.4, 2.6, 2.9, 3.2], [2.4, 2.6, 2.8, 3.1, 3.4], 
                                [2.5, 2.8, 3, 3.3, 3.6], [2.7, 2.9, 3.2, 3.5, 3.8], [2.8, 3.1, 3.4, 3.7, 4], 
                                [3, 3.3, 3.6, 3.9, 4.3], [3.2, 3.5, 3.8, 4.2, 4.5], [3.4, 3.7, 4, 4.4, 4.8], 
                                [3.6, 3.9, 4.3, 4.6, 5.1], [3.8, 4.1, 4.5, 4.9, 5.4], [3.9, 4.3, 4.7, 5.1, 5.6], 
                                [4.1, 4.5, 4.9, 5.4, 5.9], [4.3, 4.7, 5.1, 5.6, 6.1], [4.5, 4.9, 5.3, 5.8, 6.4], 
                                [4.7, 5.1, 5.5, 6, 6.6], [4.8, 5.3, 5.7, 6.3, 6.9], [5, 5.5, 5.9, 6.5, 7.1], 
                                [5.1, 5.6, 6.1, 6.7, 7.3], [5.3, 5.8, 6.3, 6.9, 7.5], [5.5, 6, 6.5, 7.1, 7.7], 
                                [5.6, 6.1, 6.7, 7.3, 8], [5.8, 6.3, 6.9, 7.5, 8.2], [5.9, 6.5, 7, 7.7, 8.4], 
                                [6, 6.6, 7.2, 7.8, 8.6], [6.2, 6.8, 7.4, 8, 8.8], [6.3, 6.9, 7.5, 8.2, 9], 
                                [6.5, 7.1, 7.7, 8.4, 9.1], [6.6, 7.2, 7.8, 8.5, 9.3], [6.7, 7.4, 8, 8.7, 9.5], 
                                [6.9, 7.5, 8.2, 8.9, 9.7], [7, 7.7, 8.3, 9.1, 9.9], [7.1, 7.8, 8.5, 9.2, 10.1], 
                                [7.3, 8, 8.7, 9.4, 10.3], [7.5, 8.1, 8.8, 9.6, 10.5], [7.6, 8.3, 9, 9.8, 10.7], 
                                [7.8, 8.5, 9.2, 10.1, 11], [8, 8.7, 9.4, 10.3, 11.2], [8.1, 8.9, 9.7, 10.5, 11.5]];

        var tableBoyHalf = [[]];
        var tableGirlHalf = [[]];

        var gender = database.getDataValue('gender');
        var height = database.getDataValue('height');

        var weights;
        if (height < 87) {
            if (gender == 'boy') {
                weights = tableBoySingle[height-45];
            } else {
                weights = tableGirlSingle[height-45];
            } if(weight < weights[0]) {
                return 'grade4';
            } else if (weight < weights[1]) {
                return 'grade3';
            } else if (weight < weights[2]) {
                return 'grade2';
            } else if (weight < weights[3]) {
                return 'grade1';
            } else  {
                return 'normal';
            }
        }
    }
    return {
        "pulseox" : promptTypes.launch_intent.extend({
            type: "pulseox",
            datatype: "pulseox",
            templatePath: "templates/pulseox.handlebars",
            intentString: 'org.opendatakit.sensors.PULSEOX',
            buttonLabel: {
                'default': 'Press Here to Start PulseOX',
                'hindi': 'Get Oxygen Saturation'
            },

            configureRenderContext: function(ctxt) {
                var that = this;
                var value = that.getValue();
                that.renderContext.value = value;
                that.renderContext.buttonLabel = that.buttonLabel;
                that.renderContext.display.color = (value.ox >= 90 ? "green" : "red");
                ctxt.success();
            }
        }),

        "breathcounter" : promptTypes.launch_intent.extend({
            type: "breathcounter",
            datatype: "breathcounter",
            buttonLabel: {
                'default': 'Press Here to Start Breath Counter',
                'hindi': 'शुरू करना सांस की गिनती'
            },
            intentString: 'change.uw.android.BREATHCOUNT',
            extractDataValue: function(jsonObject) {
                return jsonObject.result.value;
            }
        })
    };
});