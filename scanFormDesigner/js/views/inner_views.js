/* 	This view controls the radio buttons for border options.
	If the user chooses a field to have a border then this 
	view makes the border width input visible, else the
	input is not displayed.
	
	This view has been borrowed/modified from: 
	http://thoughts.z-dev.org/2013/07/04/radio-buttons-in-ember-js/
*/
Ember.RadioButton = Ember.View.extend({
    tagName : "input",
    type : "radio",
	name: "borderOption",
    attributeBindings : ["name", "type", "value", "checked:checked:"],
    click : function() {
		if (this.$().val() == "1") {
			$("#border_width").val(1); // set border with to one
			$("#border_container").css('display', 'inline');
		} else {		
			$("#border_width").val(0); // set border with to zero
			$("#border_container").css('display', 'none');
		}
        this.set("selection", this.$().val())
    }.observes('selection'),
    checked : function() {
        return this.get("value") == this.get("selection");   
    }.property('selection'),
});
Ember.RadioButton1 = Ember.View.extend({
    tagName : "input",
    type : "radio",
	name: "fieldOption",
    attributeBindings : ["name", "type", "value", "checked:checked:"],
    click : function() {
    	if (this.$().val() == "1") {
         // seeting up the value for Json field verify
           $("#verified").val("Yes");
           ok = true;
           
    	} else {
           $("#verified").val("No");
           ok = false;
    	}
    	this.set("selection", this.$().val());
    	
    }.observes('selection'),
    checked : function() {
    	return this.get("value") == this.get("selection");
    }.property('selection')
   
});
/*
	These views contain field parameters and are individually 
	added to field views which support them.
*/
FullGridSize = Ember.View.extend({
	templateName: 'full-grid-size-view'
});

ColGridSize = Ember.View.extend({
	templateName: 'col-grid-size-view'
});

GridValues = Ember.View.extend({
	templateName: 'grid-values-view'
});

BorderOptions = Ember.View.extend({
	templateName: 'border-options-view'
});

MarginOptions = Ember.View.extend({
	templateName: 'margin-options-view'
});

AttributeOptions = Ember.View.extend({
	templateName: 'field-attributes-view'
});

PriorityOptions = Ember.View.extend({
	templateName: 'priority-view'
});
OrderOptions = Ember.View.extend({
    templateName: 'priority-order-view'
});