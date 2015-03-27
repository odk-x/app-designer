//TODO: I would like to see builder function as more of a standalone module
//without all the dependencies.
//Importing mdl and setting its formDef property is a hack to avoid dealing
//with all the configuration that would normally be done in
//in parsequery.js and main.js
//TODO: Invariants that might be useful to test on built surveys:
//Are properties are parsed into the correct type?
//Does any runtime validation we have work correctly?
require(['builder', 'mdl'], function(builder, mdl){
    //The builder has a lot of dependencies
    describe("Builder", function() {
        it("should build a survey", function() {
            var flag, value;
            var testFormDef = {
                "settings": [
                    {
                        "setting": "table_id",
                        "value": "default01"
                    },
                    {
                        "setting": "form_id",
                        "value": "default"
                    },
                    {
                        "setting": "form_version"
                    },
                    {
                        "setting": "form_title",
                        "value": {
                            "en_us": "Default form"
                        }
                    }
                ],
                "survey": [
                    {
                        "type": "note", 
                        "image": "img/dolphin.png", 
                        "audio": "audio/carrioncrow.mp3", 
                        "_rowNum": 15, 
                        "param": null, 
                        "label": "Labels can contain &lt;img&gt; and &lt;audio&gt; HTML tags, but it is often easier to add media via the image and audio columns."
                    }, 
                    {
                        "name": "name", 
                        "hint": "It will be used in the next question.", 
                        "_rowNum": 16, 
                        "type": "text", 
                        "param": null, 
                        "label": "Enter your name"
                    }
                ], 
                "model": {
                }, 
                "choices": {
                }
            };
            mdl.formDef = testFormDef;
            runs(function() {
                flag = false;
                value = null;
                builder.buildSurvey(testFormDef, function(prompts) {
                    value = prompts;
                    flag = true;
                });
            });
            //The waitsFor block takes a latch function, a failure message, and a timeout.
            //The latch function polls until it returns true or the timeout expires,
            //whichever comes first. If the timeout expires, the spec fails with the error message.
            waitsFor(function() {
                return flag;
            }, "the builder to make a form.", 2000);
            
            //Once the asynchronous conditions have been met,
            //another runs block defines final test behavior.
            //This is usually expectations based on state after the asynch call returns.
            runs(function() {
                expect(true).toBe(true);
            });
        });
    });
});