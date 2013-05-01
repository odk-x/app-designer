define(['promptTypes','jquery','underscore', 'prompts','database'],

function(promptTypes, $,       _,             prompts,  database) {

window.classifyWeight = function() {
	var table = [[0,0,0,0],[0,0,0,0],[2.75,3.5,4,4.5],[3.2,3.75,4.25,5],[3.4,4,4.75,5.5],[3.7,4.5,5.2,5.9],[3.9,4.75,5.5,6.25],[4.1,5,5.8,6.75],[4.3,5.3,6.2,7],[4.5,5.6,6.5,7.25],[4.7,5.8,6.7,7.5],[4.9,6,6.9,7.8],[5.1,6.2,7.1,8.1],[5.25,6.3,7.25,8.3],[5.4,6.5,7.45,8.5],[5.5,6.6,7.6,8.7],[5.6,6.7,7.75,8.9],[5.65,6.8,7.9,9.1],[5.75,7,8,9.25],[5.8,7.1,8.1,9.5],[5.9,7.2,8.3,9.6],[6,7.3,8.5,9.75],[6.1,7.4,8.6,9.9],[6.2,7.5,8.75,10.1],[6.25,7.6,8.9,10.2],[6.4,7.75,9,10.3],[6.5,7.9,9.2,10.5],[6.5,8,9.25,10.6],[6.6,8.1,9.4,10.7],[6.7,8.2,9.5,10.8],[6.8,8.3,9.6,11],[6.9,8.4,9.7,11.1],[7,8.45,9.9,11.2],[7.1,8.5,10,11.3],[7.2,8.6,10.1,11.5],[7.25,8.75,10.2,11.6],[7.3,8.8,10.3,11.7],[7.4,8.9,10.4,11.8],[7.45,9,10.5,12],[7.5,9.1,10.6,12.1],[7.6,9.2,10.7,12.2],[7.7,9.3,10.8,12.3],[7.8,9.4,11,12.5],[7.9,9.5,11.1,12.6],[8,9.6,11.2,12.7],[8,9.7,11.3,12.9],[8.1,9.8,11.4,13],[8.2,9.9,11.5,13.1],[8.3,10,11.6,13.3],[8.4,10.1,11.7,13.5],[8.5,10.2,11.8,13.6],[8.6,10.3,12,13.7],[8.7,10.4,12.1,13.85],[8.75,10.5,12.2,14],[8.7,10.6,12.3,14.1],[8.8,10.7,12.4,14.25],[8.9,10.75,12.5,14.35],[9,10.8,12.6,14.5],[9.1,10.9,12.7,14.6],[9.2,11,12.8,14.7]];

	//selected(data('birthdayKnown'), 'yes') ? (now().getTime() - new Date(data('birthday')).getTime()) / (1000 * 60 * 60 * 24) : data('monthsOld')*30
	
	var birthdayKnown = database.getDataValue('birthdayKnown');
	var birthdate = database.getDataValue('birthday');
	var monthsOld = database.getDataValue('monthsOld');
	var weight = database.getDataValue('weight');
	
	
	var months = 0;
	if(birthdayKnown == 'yes') {
		var days = ((new Date()).getTime() - (new Date(birthdate)).getTime()) / (1000 * 60 * 60 * 24);
		months = Math.floor( (days / 30 ));
	} else {
		months = monthsOld;
	}
	
	console.log(months);
	var weights = table[months];
	console.log(weights);

	if(weight < weights[0]) 
	{
		return 'grade4';
	}
	else if (weight < weights[1])
	{
		return 'grade3';
	}
	else if (weight < weights[2])
	{
		return 'grade2';
	}
	else if (weight < weights[3])
	{
		return 'grade1';
	}
	else 
	{
		return 'normal';
	}
}

    return {
        "pulseox" : promptTypes.launch_intent.extend({
            type: "pulseox",
            datatype: "pulseox",
            intentString: 'org.opendatakit.sensors.PULSEOX',
            buttonLabel: {
                'default': 'Get Oxygen Saturation',
                'hindi': 'Get Oxygen Saturation'
            }
        }),
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
}


);