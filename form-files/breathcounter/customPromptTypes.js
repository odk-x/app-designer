define(['promptTypes','jquery','underscore', 'prompts'],
function(promptTypes, $,       _) {
    return {
        "breathcounter" : promptTypes.launch_intent.extend({
            type: "breathcounter",
            datatype: "breathcounter",
            buttonLabel: {
                'default': 'Launch breath counter',
                'hindi': 'शुरू करना सांस की गिनती'
            },
            intentString: 'change.uw.android.BREATHCOUNT',
            extractDataValue: function(jsonObject) {
                return jsonObject.result.value;
            }
        })
    };
});