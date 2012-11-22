define(['promptTypes','jquery','underscore', 'prompts'],
function(promptTypes, $,       _) {
    return {
        "pulseox" : promptTypes.launch_intent.extend({
            type: "pulseox",
            datatype: "pulseox",
            intentString: 'org.opendatakit.sensors.PULSEOX'
        }),
        "breathcounter" : promptTypes.launch_intent.extend({
            type: "breathcounter",
            datatype: "breathcounter",
            buttonLabel: 'Launch breath counter',
            intentString: 'change.uw.android.BREATHCOUNT',
            parseValue: function(unparsedValue) {
                return { 'value' : unparsedValue };
            },
            serializeValue: function(value) {
                return value.value;
            }
        })
    };
});