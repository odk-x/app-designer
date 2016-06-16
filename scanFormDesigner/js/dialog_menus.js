	/* Dialog menu initializations are provided below */

$(document).ready(function() {			
	// NOTE: buttons are implemented in the elements controller in 
	// order to allow communication between the controller and dialog menu
	$("#new_doc_dialog").dialog({
		autoOpen: false,
		modal: true
	});			
	
	// NOTE: buttons are implemented in the elements controller in 
	// order to allow communication between the controller and dialog menu
	$("#new_page_dialog").dialog({
		autoOpen: false,
		modal: true
	});		

	// NOTE: buttons are implemented in the elements controller in 
	// order to allow communication between the controller and dialog menu
	$("#remove_page_dialog").dialog({
		autoOpen: false,
		modal: true
	});		
	
	// NOTE: buttons are implemented in the elements controller in 
	// order to allow communication between the controller and dialog menu
	$("#page_style_dialog").dialog({
		autoOpen: false,
		modal: true
	});	
	
	// NOTE: buttons are implemented in the elements controller in 
	// order to allow communication between the controller and dialog menu
	$("#itab_remove_dialog").dialog({
		autoOpen: false,
		modal: true
	});	
	
	// NOTE: buttons are implemented in the elements controller in 
	// order to allow communication between the controller and dialog menu
	$("#export_progress_dialog").dialog({
		autoOpen: false,
		modal: true
	});	
	
	// NOTE: buttons are implemented in the elements controller in 
	// order to allow communication between the controller and dialog menu
	$("#save_check_dialog").dialog({
		autoOpen: false,
		modal: true
	});	
	
	$("#page_style_warning_dialog").dialog({
		autoOpen: false,
		modal: true,
		buttons: {
			"Continue": function() {
				$("#page_style_dialog").dialog("open");
				$(this).dialog("close");
			},
			"Cancel": function() {
				$(this).dialog("close");
			}
		}
	});	
	
	$("#load_dialog").dialog({
		autoOpen: false,
		modal: true
	});
	
	$("#save_dialog").dialog({
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function() {
				$("#scan_json_link").attr("download", $("#saved_scan_name").val());
				document.getElementById("scan_json_link").click();
				$("#save_dialog").dialog("close");
			},
			"Cancel": function() {
				$("#save_dialog").dialog("close");
			}
		}			
	});
				
	
	  $("#export_dialog").dialog({
		autoOpen: false,
		modal: true
	});
	  $("#saveToFileSystem_dialog").dialog({
		autoOpen: false,
		modal: true
	});
	// just added for subform
	$("#subform_dialog").dialog({
		autoOpen: false,
		modal: true			
	});
	$("#subname_dialog").dialog({
		autoOpen: false,
		modal: true		
	});
	
	$("#box_dialog").dialog({
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function() {
				if (is_name_valid()) {	
					var new_box = new EmptyBox();
					new_box.constructBox();
					
					ODKScan.EmptyBoxContainer.popObject();
					ODKScan.FieldContainer.popObject();
					ODKScan.FieldContainer.pushObject(ODKScan.EmptyBoxView);						
					$("#box_dialog").dialog("close");
				} 
			},
			"Cancel": function() {
				ODKScan.EmptyBoxContainer.popObject();
				$("#box_dialog").dialog("close");
			}
		}
	});
		
	$("#checkbox_dialog").dialog({
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function() {	
				if (is_name_valid) {				
					var cbField = new CheckboxField();
					cbField.constructGrid();							

					ODKScan.CheckboxContainer.popObject();
					ODKScan.FieldContainer.popObject();
					ODKScan.FieldContainer.pushObject(ODKScan.CheckboxView);	
					$("#checkbox_dialog").dialog("close");
				}
			},
			"Cancel": function() {
				ODKScan.CheckboxContainer.popObject();
				$("#checkbox_dialog").dialog("close");
			}
		}
	});			
	
	$("#bubble_dialog").dialog({
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function() {
				if (is_name_valid()) {		
					var bubbField = new BubbleField();
					bubbField.constructGrid();		

					ODKScan.BubbleContainer.popObject();
					ODKScan.FieldContainer.popObject();
					ODKScan.FieldContainer.pushObject(ODKScan.BubblesView);										
					$("#bubble_dialog").dialog("close");
				}
			},
			"Cancel": function() {
				ODKScan.BubbleContainer.popObject();
				$("#bubble_dialog").dialog("close");
			}
		}
	});

	$("#seg_num_dialog").dialog({
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function() {
				if (is_name_valid()) {	
					var numField = new SegNumField();
					numField.constructGrid();
					
					ODKScan.SegNumContainer.popObject();
					ODKScan.FieldContainer.popObject();
					ODKScan.FieldContainer.pushObject(ODKScan.SegNumView);									
					$("#seg_num_dialog").dialog("close");
				}
			},
			"Cancel": function() {
				ODKScan.SegNumContainer.popObject();
				$("#seg_num_dialog").dialog("close");
			}
		}
	});		

	$("#text_dialog").dialog({
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function() {
				if (is_name_valid()) {		
					var text_box = new TextBox();
					text_box.constructBox();
					
					ODKScan.TextBoxContainer.popObject();
					ODKScan.FieldContainer.popObject();
					ODKScan.FieldContainer.pushObject(ODKScan.TextBoxView);					
					$("#text_dialog").dialog("close");
				}
			},
			"Cancel": function() {
				ODKScan.TextBoxContainer.popObject();
				$("#text_dialog").dialog("close");
			}
		}
	});	

	$("#qrCode_dialog").dialog({
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function() {
				if (is_name_valid()) {		
					var qr_code = new QrCode();
					qr_code.constructBox();
					
					ODKScan.QrCodeContainer.popObject();
					ODKScan.FieldContainer.popObject();
					ODKScan.FieldContainer.pushObject(ODKScan.QrCodeView);					
					$("#qrCode_dialog").dialog("close");
				}
			},
			"Cancel": function() {
				ODKScan.QrCodeContainer.popObject();
				$("#qrCode_dialog").dialog("close");
			}
		}
	});			
	
	$("#form_num_dialog").dialog({
		autoOpen: false,
		modal: true,
		buttons: {
			"Ok": function() {	
				if (is_name_valid()) {
					var formNumField = new FormNumField();
					formNumField.constructGrid();		
					
					ODKScan.FormNumContainer.popObject();
					ODKScan.FieldContainer.popObject();
					ODKScan.FieldContainer.pushObject(ODKScan.FormNumView);						
					$("#form_num_dialog").dialog("close");
				}
			},
			"Cancel": function() {
				ODKScan.FormNumContainer.popObject();
				$("#form_num_dialog").dialog("close");
			}
		}
	});			
});