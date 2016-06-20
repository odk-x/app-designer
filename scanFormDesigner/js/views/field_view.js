/*
*	This view responds to two actions that the user performs:
*		- creating a new field
*		- selecting a field in current page
*
*	The 'didInsertElement' (this event is triggered when the view is added
*	to the DOM) function responds to both of these events.
*
*	This view is inherited by all other field views, the 'didInsertElement'
*	event bubbles up to this parent view, so that all fields implement
*	this same behavior when responding to the events listed above.
*/

ODKScan.FieldViewController = Ember.View.extend({
	// contains global counts for each field type
	// NOTE: add new field types here
	//idCounts: {checkbox: 1, bubble: 1, seg_num: 1,
				//box: 1, code: 1, text: 1, form_num: 1},
	didInsertElement: function() {	
		/* 	If there is currently a selected field then the user 
			clicked on a field in the current page, load its 
			properties into the properties sidebar. Else
			the user is trying to create a new field, open
			its respective dialog menu, assign it a new 
			unique field name.
		*/
		
		if ($(".selected_field").length != 0) {
			// loading view into the properties sidebar
		    var field_obj = $(".selected_field").data("obj");			
			field_obj.loadProperties();
			//console.log(field_obj);
			// check if the selected field has a border, display the border
			// input box if it does
			//this.get('orderOptions').get('hello').set('selection', field_obj.order);
			if (field_obj.border_width > 0) {
				this.get('bdOptions').get('borderYesView').set('selection', 1);
				$("#border_width").val(field_obj.border_width); 
			} else {
				this.get('bdOptions').get('borderNoView').set('selection', 0);
			}
			
			if ($('.selected_field').data("obj").verify == "Yes") {
				this.get('verOptions').get('fieldYesView').set('selection', 1);
				
			} else {
				this.get('verOptions').get('fieldNoView').set('selection', 0);
			}
			

			// need to add prioprity
            	
		} else {
			// loading view into a dialog menu, default border option set to 'Yes'
			console.log($('#order').value);
			this.get('bdOptions').get('borderYesView').set('selection', 1);
			this.get('verOptions').get('fieldYesView').set('selection', 1);

			// the html for the dialog menu has finished loading, now the
			// dialog menu can be opened (if a dialog menu opens up before
			// the html has finished opening then the dialog menu can pop
			// up on the screen in a random location)
			var new_field_type = this.get('controller.newFieldType');		
			var idCounts = this.get("idCounts");
			
			if (new_field_type == 'checkbox') {
			    var name = ODKScan.runGlobal('getCopyName')("checkboxes");
				$("#field_name").val(name);	

				$("#checkbox_dialog").dialog("open");
			} else if (new_field_type == 'bubble') {
				var name = ODKScan.runGlobal('getCopyName')("bubbles");
				$("#field_name").val(name);
				$("#bubble_dialog").dialog("open");
			} else if (new_field_type == 'seg_num') {
				var name = ODKScan.runGlobal('getCopyName')("Number");
				$("#field_name").val(name); // has changed, before it was simpleNumber
				$("#seg_num_dialog").dialog("open");
			} else if (new_field_type == 'string') {  // it was before empty_box
				var name = ODKScan.runGlobal('getCopyName')("textBox");
				$("#field_name").val(name);
				$("#box_dialog").dialog("open");
			} else if(new_field_type == 'qr_code') {   // added for qr code
              var name = ODKScan.runGlobal('getCopyName')("qrCode");
			   $("#field_name").val(name);
			   $("#qrCode_dialog").dialog("open");
			} else if (new_field_type == 'text_box') {
				var name = ODKScan.runGlobal('getCopyName')("text");
				$("#field_name").val(name);
				$("#text_dialog").dialog("open");
			} else if (new_field_type == 'form_num') {
				var name = ODKScan.runGlobal('getCopyName')("formattedNumber");
				$("#field_name").val(name);
				$("#form_num_dialog").dialog("open");
			} else {
				console.log("error no dialog menu to open, unsupported field type");
			}
		}
	}
});