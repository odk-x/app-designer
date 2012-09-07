requirejs.config({
    baseUrl: '../collect/js',
	paths: {
		templates : '../templates',
		},
    shim: {
        'zepto': {
			// Slimmer drop-in replacement for jquery
            //These script dependencies should be loaded before loading
            //zepto.js
            deps: [],
            //Once loaded, use the global '$' as the
            //module value.
            exports: '$'
        },
        'underscore': {
            //These script dependencies should be loaded before loading
            //underscore.js
            deps: [],
            //Once loaded, use the global '_' as the
            //module value.
            exports: '_'
        },
        'backbone': {
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['underscore', 'zepto'],
            //Once loaded, use the global 'Backbone' as the
            //module value.
            exports: 'Backbone'
        },
		'handlebars': {
            //These script dependencies should be loaded before loading
            //handlebars.js
            deps: ['zepto'],
            //Once loaded, use the global 'Handlebars' as the
            //module value.
            exports: 'Handlebars'
        },
		'templates/compiledTemplates': {
			deps: ['handlebars'],
		},
		'collect': {
		    deps: [],
			exports: 'collect'
		}
	}
});
var collect; // = JavaInterface; // loaded by WebKit...

requirejs(['opendatakit', 'collect', 'database','parsequery'], function(opendatakit, collect, database, parsequery) {
	parsequery.parseQueryParameters('lgform', null, 
		'en_us', 'Simple Test Form', function() {
		
requirejs(['zepto','builder', 'controller','prompts'/* mix-in additional prompts and support libs here */],function($,builder,controller) {
	console.log('scripts loaded');
	// build the survey and place it in the controller...
builder.buildSurvey(/* json start delimiter */{
    "settings": [{
		formId : 'lgform', // must match arg to parseQueryParameters
		formVersion : null, // must match arg to parseQueryParameters
		formLocale : 'en_us', // must match arg to parseQueryParameters
		formName : 'Simple Test Form' // must match arg to parseQueryParameters
	}],
    "survey": [
        {
            "type": "goto", 
            "param": "test"
        },
        {
            "prompts": [
                {
                    "name": "name", 
                    "validate": true, 
                    "type": "text", 
                    "param": null, 
                    "label": {
                        "english": "Enter your name:"
                    }
                }, 
                {
                    "type": "int", 
                    "name": "age", 
                    "param": null, 
                    "label": {
                        "english": "Enter your age:"
                    }
                }, 
                {
                    "name": "gender",
                    "type": "text", 
                    "param": null, 
                    "label": {
                        "english": "Enter your gender:"
                    }
                }
            ], 
            "type": "screen", 
            "name": "testScreen"
        }, 
        {
            "type": "label", 
            "param": "test"
        },
        {
            "name": "rep",
            "type": "repeat", 
            "param": "test", 
            "label": {
                "english": "Repeat"
            }
        },
        {
            "type": "audio", 
            "name": "aud", 
            "param": null
        }, 
        {
            "type": "video", 
            "name": "vid", 
            "param": null
        }, 
        {
            "type": "image", 
            "name": "img", 
            "param": null
        }
    ], 
    "datafields": {
        "gender": {
            "type": "string"
        }, 
        "img": {
            "type": "image/*"
        }, 
        "name": {
            "type": "string"
        }, 
        "vid": {
            "type": "video/*"
        }, 
        "aud": {
            "type": "audio/*"
        }
    }, 
    "choices": {
        "gender": [
            {
                "name": "male", 
                "label": "male"
            }, 
            {
                "name": "female", 
                "label": "female"
            }
        ]
    }
}/* json end delimiter */);
    
    /*
	var form = builder.buildSurvey({settings : {
				formId : 'lgform', // must match arg to parseQueryParameters
				formVersion : null, // must match arg to parseQueryParameters
				formLocale : 'en_us', // must match arg to parseQueryParameters
				formName : 'Simple Test Form' // must match arg to parseQueryParameters
			}, survey : [
			{type:"opening", name:"_opening", label:"opening page", nextPromptName:"page1"},
			{type:"instances", name:"_instances", label:"Saved Instances"},
			{type:"json", name:"_json", label:"JSON formatted survey answers"},
            {type:"text", name:"page1", label:"text:"},
			{type:"audio", name:"aud", label:"page1 Take a Audio:", nextPromptName:"page1a"},
			{type:"video", name:"page1a", label:"page1a Take a Video:", nextPromptName:"page2"},
			{type:"image", name:"page2", label:"page2 Take a Picture:", nextPromptName:"page3"},
			{type:"decimal", name:"page3", label:"page3 Enter your gpa:", nextPromptName:"page4"},
			{type:"group", name:"page4", label:"I'm a group", prompts:[
				{type:"integer", name:"page4a", label:"page4a Enter your age:"},
				{type:"text", name:"page4b", label:"page4b Enter your name:"}
			]},
			{type:"text", name:"page6", label:"page6 Enter your name:",
                nextPromptName:"page7",
                validate:'{{page6}}!=null && {{page6}}.length >=3'
            },
			{type:"text", name:"page7", label:"page7 Enter your name:", nextPromptName:"page8"},
			{type:"text", name:"page8", label:"page8 Enter your name:", nextPromptName:"page9"},
			{type:"text", name:"page9", label:"page9 Enter your name:", nextPromptName:"page10"},
			{type:"text", name:"page10", label:"page10 Enter your name:", nextPromptName:"page11"},
			{type:"text", name:"page11", label:"page11 Enter your name:", nextPromptName:"page12"},
			{type:"text", name:"page12", label:"page12 Enter your name:", nextPromptName:"page13"},
			{type:"text", name:"page13", label:"page13 Enter your name:", nextPromptName:"page14"},
			{type:"text", name:"page14", label:"page14 Enter your name:", nextPromptName:"page15"},
			{type:"text", name:"page15", label:"page15 Enter your name:", nextPromptName:"page16"},
			{type:"text", name:"page16", label:"page16 Enter your name:", nextPromptName:"page17"},
			{type:"text", name:"page17", label:"page17 Enter your name:", nextPromptName:"page18"},
			{type:"text", name:"page18", label:"page18 Enter your name:", nextPromptName:"page19"},
			{type:"text", name:"page19", label:"page19 Enter your name:", nextPromptName:"page20"},
			{type:"text", name:"page20", label:"page20 Enter your name:", nextPromptName:"page21"},
			{type:"text", name:"page21", label:"page21 Enter your name:", nextPromptName:"page22"},
			{type:"text", name:"page22", label:"page22 Enter your name:", nextPromptName:"page23"},
			{type:"text", name:"page23", label:"page23 Enter your name:", nextPromptName:"page24"},
			{type:"text", name:"page24", label:"page24 Enter your name:", nextPromptName:"page25"},
			{type:"text", name:"page25", label:"page25 Enter your name:", nextPromptName:"page26"},
			{type:"text", name:"page26", label:"page26 Enter your name:", nextPromptName:"page27"},
			{type:"text", name:"page27", label:"page27 Enter your name:", nextPromptName:"page28"},
			{type:"text", name:"page28", label:"page28 Enter your name:", nextPromptName:"page29"},
			{type:"text", name:"page29", label:"page29 Enter your name:", nextPromptName:"page30"},
			{type:"text", name:"page30", label:"page30 Enter your name:", nextPromptName:"page31"},
			{type:"text", name:"page31", label:"page31 Enter your name:", nextPromptName:"page32"},
			{type:"text", name:"page32", label:"page32 Enter your name:", nextPromptName:"page33"},
			{type:"text", name:"page33", label:"page33 Enter your name:", nextPromptName:"page34"},
			{type:"text", name:"page34", label:"page34 Enter your name:", nextPromptName:"page35"},
			{type:"text", name:"page35", label:"page35 Enter your name:", nextPromptName:"page36"},
			{type:"text", name:"page36", label:"page36 Enter your name:", nextPromptName:"page37"},
			{type:"text", name:"page37", label:"page37 Enter your name:", nextPromptName:"page38"},
			{type:"text", name:"page38", label:"page38 Enter your name:", nextPromptName:"page39"},
			{type:"text", name:"page39", label:"page39 Enter your name:", nextPromptName:"page40"},
			{type:"text", name:"page40", label:"page40 Enter your name:", nextPromptName:"page41"},
			{type:"text", name:"page41", label:"page41 Enter your name:", nextPromptName:"page42"},
			{type:"text", name:"page42", label:"page42 Enter your name:", nextPromptName:"page43"},
			{type:"text", name:"page43", label:"page43 Enter your name:", nextPromptName:"page44"},
			{type:"text", name:"page44", label:"page44 Enter your name:", nextPromptName:"page45"},
			{type:"text", name:"page45", label:"page45 Enter your name:", nextPromptName:"page46"},
			{type:"text", name:"page46", label:"page46 Enter your name:", nextPromptName:"page47"},
			{type:"text", name:"page47", label:"page47 Enter your name:", nextPromptName:"page48"},
			{type:"text", name:"page48", label:"page48 Enter your name:", nextPromptName:"page49"},
			{type:"text", name:"page49", label:"page49 Enter your name:", nextPromptName:"page50"},
			{type:"text", name:"page50", label:"page50 Enter your name:", nextPromptName:"page51"},
			{type:"text", name:"page51", label:"page51 Enter your name:", nextPromptName:"page52"},
			{type:"text", name:"page52", label:"page52 Enter your name:", nextPromptName:"page53"},
			{type:"text", name:"page53", label:"page53 Enter your name:", nextPromptName:"page54"},
			{type:"text", name:"page54", label:"page54 Enter your name:", nextPromptName:"page55"},
			{type:"text", name:"page55", label:"page55 Enter your name:", nextPromptName:"page56"},
			{type:"text", name:"page56", label:"page56 Enter your name:", nextPromptName:"page57"},
			{type:"text", name:"page57", label:"page57 Enter your name:", nextPromptName:"page58"},
			{type:"text", name:"page58", label:"page58 Enter your name:", nextPromptName:"page59"},
			{type:"text", name:"page59", label:"page59 Enter your name:", nextPromptName:"page60"},
			{type:"text", name:"page60", label:"page60 Enter your name:", nextPromptName:"page61"},
			{type:"text", name:"page61", label:"page61 Enter your name:", nextPromptName:"page62"},
			{type:"text", name:"page62", label:"page62 Enter your name:", nextPromptName:"page63"},
			{type:"text", name:"page63", label:"page63 Enter your name:", nextPromptName:"page64"},
			{type:"text", name:"page64", label:"page64 Enter your name:", nextPromptName:"page65"},
			{type:"text", name:"page65", label:"page65 Enter your name:", nextPromptName:"page66"},
			{type:"text", name:"page66", label:"page66 Enter your name:", nextPromptName:"page67"},
			{type:"text", name:"page67", label:"page67 Enter your name:", nextPromptName:"page68"},
			{type:"text", name:"page68", label:"page68 Enter your name:", nextPromptName:"page69"},
			{type:"text", name:"page69", label:"page69 Enter your name:", nextPromptName:"page70"},
			{type:"text", name:"page70", label:"page70 Enter your name:", nextPromptName:"page71"},
			{type:"text", name:"page71", label:"page71 Enter your name:", nextPromptName:"page72"},
			{type:"text", name:"page72", label:"page72 Enter your name:", nextPromptName:"page73"},
			{type:"text", name:"page73", label:"page73 Enter your name:", nextPromptName:"page74"},
			{type:"text", name:"page74", label:"page74 Enter your name:", nextPromptName:"page75"},
			{type:"text", name:"page75", label:"page75 Enter your name:", nextPromptName:"page76"},
			{type:"text", name:"page76", label:"page76 Enter your name:", nextPromptName:"page77"},
			{type:"text", name:"page77", label:"page77 Enter your name:", nextPromptName:"page78"},
			{type:"text", name:"page78", label:"page78 Enter your name:", nextPromptName:"page79"},
			{type:"text", name:"page79", label:"page79 Enter your name:", nextPromptName:"page80"},
			{type:"text", name:"page80", label:"page80 Enter your name:", nextPromptName:"page81"},
			{type:"text", name:"page81", label:"page81 Enter your name:", nextPromptName:"page82"},
			{type:"text", name:"page82", label:"page82 Enter your name:", nextPromptName:"page83"},
			{type:"text", name:"page83", label:"page83 Enter your name:", nextPromptName:"page84"},
			{type:"text", name:"page84", label:"page84 Enter your name:", nextPromptName:"page85"},
			{type:"text", name:"page85", label:"page85 Enter your name:", nextPromptName:"page86"},
			{type:"text", name:"page86", label:"page86 Enter your name:", nextPromptName:"page87"},
			{type:"text", name:"page87", label:"page87 Enter your name:", nextPromptName:"page88"},
			{type:"text", name:"page88", label:"page88 Enter your name:", nextPromptName:"page89"},
			{type:"text", name:"page89", label:"page89 Enter your name:", nextPromptName:"page90"},
			{type:"text", name:"page90", label:"page90 Enter your name:", nextPromptName:"page91"},
			{type:"text", name:"page91", label:"page91 Enter your name:", nextPromptName:"page92"},
			{type:"text", name:"page92", label:"page92 Enter your name:", nextPromptName:"page93"},
			{type:"text", name:"page93", label:"page93 Enter your name:", nextPromptName:"page94"},
			{type:"text", name:"page94", label:"page94 Enter your name:", nextPromptName:"page95"},
			{type:"text", name:"page95", label:"page95 Enter your name:", nextPromptName:"page96"},
			{type:"text", name:"page96", label:"page96 Enter your name:", nextPromptName:"page97"},
			{type:"text", name:"page97", label:"page97 Enter your name:", nextPromptName:"page98"},
			{type:"text", name:"page98", label:"page98 Enter your name:", nextPromptName:"page99"},
			{type:"text", name:"page99", label:"page99 Enter your name:", nextPromptName:"page100"},
			{type:"text", name:"page100", label:"page100 Enter your name:", nextPromptName:"page101"},
			{type:"text", name:"page101", label:"page101 Enter your name:", nextPromptName:"page102"},
			{type:"text", name:"page102", label:"page102 Enter your name:", nextPromptName:"page103"},
			{type:"text", name:"page103", label:"page103 Enter your name:", nextPromptName:"page104"},
			{type:"text", name:"page104", label:"page104 Enter your name:", nextPromptName:"page105"},
			{type:"text", name:"page105", label:"page105 Enter your name:", nextPromptName:"page106"},
			{type:"text", name:"page106", label:"page106 Enter your name:", nextPromptName:"page107"},
			{type:"text", name:"page107", label:"page107 Enter your name:", nextPromptName:"page108"},
			{type:"text", name:"page108", label:"page108 Enter your name:", nextPromptName:"page109"},
			{type:"text", name:"page109", label:"page109 Enter your name:", nextPromptName:"page110"},
			{type:"text", name:"page110", label:"page110 Enter your name:", nextPromptName:"page111"},
			{type:"text", name:"page111", label:"page111 Enter your name:", nextPromptName:"page112"},
			{type:"text", name:"page112", label:"page112 Enter your name:", nextPromptName:"page113"},
			{type:"text", name:"page113", label:"page113 Enter your name:", nextPromptName:"page114"},
			{type:"text", name:"page114", label:"page114 Enter your name:", nextPromptName:"page115"},
			{type:"text", name:"page115", label:"page115 Enter your name:", nextPromptName:"page116"},
			{type:"text", name:"page116", label:"page116 Enter your name:", nextPromptName:"page117"},
			{type:"text", name:"page117", label:"page117 Enter your name:", nextPromptName:"page118"},
			{type:"text", name:"page118", label:"page118 Enter your name:", nextPromptName:"page119"},
			{type:"text", name:"page119", label:"page119 Enter your name:", nextPromptName:"page120"},
			{type:"text", name:"page120", label:"page120 Enter your name:", nextPromptName:"page121"},
			{type:"text", name:"page121", label:"page121 Enter your name:", nextPromptName:"page122"},
			{type:"text", name:"page122", label:"page122 Enter your name:", nextPromptName:"page123"},
			{type:"text", name:"page123", label:"page123 Enter your name:", nextPromptName:"page124"},
			{type:"text", name:"page124", label:"page124 Enter your name:", nextPromptName:"page125"},
			{type:"text", name:"page125", label:"page125 Enter your name:", nextPromptName:"page126"},
			{type:"text", name:"page126", label:"page126 Enter your name:", nextPromptName:"page127"},
			{type:"text", name:"page127", label:"page127 Enter your name:", nextPromptName:"page128"},
			{type:"text", name:"page128", label:"page128 Enter your name:", nextPromptName:"page129"},
			{type:"text", name:"page129", label:"page129 Enter your name:", nextPromptName:"page130"},
			{type:"text", name:"page130", label:"page130 Enter your name:", nextPromptName:"page131"},
			{type:"text", name:"page131", label:"page131 Enter your name:", nextPromptName:"page132"},
			{type:"text", name:"page132", label:"page132 Enter your name:", nextPromptName:"page133"},
			{type:"text", name:"page133", label:"page133 Enter your name:", nextPromptName:"page134"},
			{type:"text", name:"page134", label:"page134 Enter your name:", nextPromptName:"page135"},
			{type:"text", name:"page135", label:"page135 Enter your name:", nextPromptName:"page136"},
			{type:"text", name:"page136", label:"page136 Enter your name:", nextPromptName:"page137"},
			{type:"text", name:"page137", label:"page137 Enter your name:", nextPromptName:"page138"},
			{type:"text", name:"page138", label:"page138 Enter your name:", nextPromptName:"page139"},
			{type:"text", name:"page139", label:"page139 Enter your name:", nextPromptName:"page140"},
			{type:"text", name:"page140", label:"page140 Enter your name:", nextPromptName:"page141"},
			{type:"text", name:"page141", label:"page141 Enter your name:", nextPromptName:"page142"},
			{type:"text", name:"page142", label:"page142 Enter your name:", nextPromptName:"page143"},
			{type:"text", name:"page143", label:"page143 Enter your name:", nextPromptName:"page144"},
			{type:"text", name:"page144", label:"page144 Enter your name:", nextPromptName:"page145"},
			{type:"text", name:"page145", label:"page145 Enter your name:", nextPromptName:"page146"},
			{type:"text", name:"page146", label:"page146 Enter your name:", nextPromptName:"page147"},
			{type:"text", name:"page147", label:"page147 Enter your name:", nextPromptName:"page148"},
			{type:"text", name:"page148", label:"page148 Enter your name:", nextPromptName:"page149"},
			{type:"text", name:"page149", label:"page149 Enter your name:", nextPromptName:"page150"},
			{type:"text", name:"page150", label:"page150 Enter your name:", nextPromptName:"page151"},
			{type:"text", name:"page151", label:"page151 Enter your name:", nextPromptName:"page152"},
			{type:"text", name:"page152", label:"page152 Enter your name:", nextPromptName:"page153"},
			{type:"text", name:"page153", label:"page153 Enter your name:", nextPromptName:"page154"},
			{type:"text", name:"page154", label:"page154 Enter your name:", nextPromptName:"page155"},
			{type:"text", name:"page155", label:"page155 Enter your name:", nextPromptName:"page156"},
			{type:"text", name:"page156", label:"page156 Enter your name:", nextPromptName:"page157"},
			{type:"text", name:"page157", label:"page157 Enter your name:", nextPromptName:"page158"},
			{type:"text", name:"page158", label:"page158 Enter your name:", nextPromptName:"page159"},
			{type:"text", name:"page159", label:"page159 Enter your name:", nextPromptName:"page160"},
			{type:"text", name:"page160", label:"page160 Enter your name:", nextPromptName:"page161"},
			{type:"text", name:"page161", label:"page161 Enter your name:", nextPromptName:"page162"},
			{type:"text", name:"page162", label:"page162 Enter your name:", nextPromptName:"page163"},
			{type:"text", name:"page163", label:"page163 Enter your name:", nextPromptName:"page164"},
			{type:"text", name:"page164", label:"page164 Enter your name:", nextPromptName:"page165"},
			{type:"text", name:"page165", label:"page165 Enter your name:", nextPromptName:"page166"},
			{type:"text", name:"page166", label:"page166 Enter your name:", nextPromptName:"page167"},
			{type:"text", name:"page167", label:"page167 Enter your name:", nextPromptName:"page168"},
			{type:"text", name:"page168", label:"page168 Enter your name:", nextPromptName:"page169"},
			{type:"text", name:"page169", label:"page169 Enter your name:", nextPromptName:"page170"},
			{type:"text", name:"page170", label:"page170 Enter your name:", nextPromptName:"page171"},
			{type:"text", name:"page171", label:"page171 Enter your name:", nextPromptName:"page172"},
			{type:"text", name:"page172", label:"page172 Enter your name:", nextPromptName:"page173"},
			{type:"text", name:"page173", label:"page173 Enter your name:", nextPromptName:"page174"},
			{type:"text", name:"page174", label:"page174 Enter your name:", nextPromptName:"page175"},
			{type:"text", name:"page175", label:"page175 Enter your name:", nextPromptName:"page176"},
			{type:"text", name:"page176", label:"page176 Enter your name:", nextPromptName:"page177"},
			{type:"text", name:"page177", label:"page177 Enter your name:", nextPromptName:"page178"},
			{type:"text", name:"page178", label:"page178 Enter your name:", nextPromptName:"page179"},
			{type:"text", name:"page179", label:"page179 Enter your name:", nextPromptName:"page180"},
			{type:"text", name:"page180", label:"page180 Enter your name:", nextPromptName:"page181"},
			{type:"text", name:"page181", label:"page181 Enter your name:", nextPromptName:"page182"},
			{type:"text", name:"page182", label:"page182 Enter your name:", nextPromptName:"page183"},
			{type:"text", name:"page183", label:"page183 Enter your name:", nextPromptName:"page184"},
			{type:"text", name:"page184", label:"page184 Enter your name:", nextPromptName:"page185"},
			{type:"text", name:"page185", label:"page185 Enter your name:", nextPromptName:"page186"},
			{type:"text", name:"page186", label:"page186 Enter your name:", nextPromptName:"page187"},
			{type:"text", name:"page187", label:"page187 Enter your name:", nextPromptName:"page188"},
			{type:"text", name:"page188", label:"page188 Enter your name:", nextPromptName:"page189"},
			{type:"text", name:"page189", label:"page189 Enter your name:", nextPromptName:"page190"},
			{type:"text", name:"page190", label:"page190 Enter your name:", nextPromptName:"page191"},
			{type:"text", name:"page191", label:"page191 Enter your name:", nextPromptName:"page192"},
			{type:"text", name:"page192", label:"page192 Enter your name:", nextPromptName:"page193"},
			{type:"text", name:"page193", label:"page193 Enter your name:", nextPromptName:"page194"},
			{type:"text", name:"page194", label:"page194 Enter your name:", nextPromptName:"page195"},
			{type:"text", name:"page195", label:"page195 Enter your name:", nextPromptName:"page196"},
			{type:"text", name:"page196", label:"page196 Enter your name:", nextPromptName:"page197"},
			{type:"text", name:"page197", label:"page197 Enter your name:", nextPromptName:"page198"},
			{type:"text", name:"page198", label:"page198 Enter your name:", nextPromptName:"page199"},
			{type:"text", name:"page199", label:"page199 Enter your name:", nextPromptName:"finalizer"},
			{type:"text", name:"_finalizer", label:"Final page", nextPromptName:"finalizer"}
		]});
	    */
	// we have saved all query parameters into the metaData table
	// and re-normalized the query string to remove them.
	//
	// register to handle manual #hash changes
	$(window).bind('hashchange', function(evt) {
		controller.odkHashChangeHandler();
	});

	// fire the controller to render the first page.
	controller.start($('#jqt'));
}
);

});

});

