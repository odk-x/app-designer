require(['underscore', 'prompts'], function(_, promptTypes){
    describe("Prompts", function() {
        it("should only have lower case names.", function() {
            //This is because the prompt names in the formDef
            //are all converted to lowercase.
            expect(_(promptTypes).keys().every(function(promptTypeName){
                return (promptTypeName === promptTypeName.toLowerCase());
            })).toBe(true);
        });
    });
});