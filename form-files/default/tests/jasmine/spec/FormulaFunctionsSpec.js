require(['underscore', 'formulaFunctions'], function(_, formulaFunctions){
    describe("Formula Functions:", function() {
        describe("selected", function() {
            it("should be true if the given value is in the select array.", function() {
                expect(formulaFunctions.selected(['a', 'b', 'c'], 'a')).toBe(true);
            });
            it("shouldn't care about types.", function() {
                expect(formulaFunctions.selected(['1', '2', '3'], 3)).toBe(true);
            });
            it("should be true if only one parameter is supplied and it is not null/empty.", function() {
                expect(formulaFunctions.selected(['1', '2', '3'])).toBe(true);
                expect(formulaFunctions.selected("test")).toBe(true);
            });
            it("should be false for null and empty parameters", function() {
                expect(formulaFunctions.selected(null)).toBe(false);
                expect(formulaFunctions.selected([])).toBe(false);
            });
            it("should allow non-array promptValue arguements for select_one prompts", function() {
                expect(formulaFunctions.selected("test", "test")).toBe(true);
            });
        });
        describe("countSelected", function() {
            it("should return the number of prompts selected in a select_multiple.", function() {
                expect(formulaFunctions.countSelected(['a', 'b', 'c'])).toBe(3);
            });
        });
    });
});