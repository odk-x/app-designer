// Constants
var SMALL_TEXT_SIZE = 9;
var MEDIUM_TEXT_SIZE = 11;
var LARGE_TEXT_SIZE = 14;

 
/*	Represents a generic box field.
	json_init: JSON 	// initialization values that come from a JSON file
	update_init: JSON 	// initialization values that come from updating the field
*/
function Box(json_init, update_init) {
	this.$box = $('<div/>');	
	this.$box.data("obj", this);
	this.$box.css('position', 'absolute');
	this.type = "string";
	//this.verify = "Yes"
	
	if(json_init) {
		this.$box.css({width: rem(json_init.box_width), 
					height: rem(json_init.box_height),
					left: rem(json_init.left),
					top: rem(json_init.top),
					borderWidth: rem(json_init.border_width),
					zIndex: json_init.zIndex});
		this.border_width = json_init.border_width;	
		this.order = json_init.order;
		this.name = json_init.name;
		this.displayText = json_init.displayText;
		this.verify = json_init.verify;
		
		//changing it before it was field_priority
		//console.log("actual left "+this.$box.position().left);
		//console.log("actual top "+this.$box.position().top);

	} else {	
		if (update_init) {
			// invoked from Update Field button
			this.$box.css({top: rem(update_init.top), 
						left: rem(update_init.left), 
						width: rem(update_init.box_width), 
						height: rem(update_init.box_height),
						zIndex: update_init.zIndex});
		} else {
			// invoked by Dialog menu			
			// NOTE: initial width and height are aligned
			// to the grid size
			this.$box.css({top: rem(0), left: rem(0), width: rem(GRID_X * 10), 
						height: rem(GRID_Y * 10), zIndex: globZIndex.getZ()});					
			globZIndex.incrZ();
		}
		this.border_width = $("#border_width").val();
		this.$box.css({borderWidth: rem(this.border_width)});
		
		// set other field attributes
		this.name = $("#field_name").val();
		this.displayText = $("#field_display_text").val();
		this.order = $("#order").val();
		console.log("order: " + $("#order").val());
		//this.field_priority = $("#field_priority").val();
		if ($("#verified").val() == "") {
          this.verify = "Yes";
		} else {
			this.verify = $("#verified").val();
		}
		
		//console.log(verify);
	}
}

/*	Adds event handlers to this box.
	$box: jQuery div representing the box
*/
Box.prototype.addEventHandlers = function($box) {
	var border_width = this.border_width;
		
	/*	Round up the width and height of the box to the nearest 
		multiple of GRID_X and GRID_Y respectively in order to
		maintain grid alignment.
	*/
	$box.on('resizestop', (function(event, ui) {
		var curr_size = ui.size;
		var nearest_width = Math.ceil(curr_size.width / GRID_X) * GRID_X;
		var nearest_height = Math.ceil(curr_size.height / GRID_Y) * GRID_Y;
		$(this).css("width", rem(nearest_width));
		$(this).css("height", rem(nearest_height));	
		convert_position($(this));
	}));
	
	$box.on('dragstop', function() {
		convert_position($(this));
	});	
	
	var obj = this;
	$box.mousedown(function(event) {	
		ODKScan.FieldContainer.popObject();
		// unhightlight any groups
		$(".highlighted_group").addClass("unhighlighted_group");
		$(".highlighted_group").removeClass("highlighted_group");
	
		// check if user pressed control during the click
		if (event.shiftKey) {  // has changed, before it was ctrlKey
			ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);
		
			// add this field to the set of group fields
			$(this).addClass("group_field");	
            
			// if a single field was already selected then add
			// it to the group of selected fields
			$(".selected_field").addClass("group_field");
			$(".selected_field").removeClass("selected_field");	
		} else {
			// single field has been selected, remove group
			// selectors from other fields
			$(".group_field").removeClass("group_field");	
			
			// make this field the only selected field
			$(".selected_field").removeClass("selected_field");	
			$(this).addClass("selected_field");
			if (obj.field_type == 'text_box') {
				ODKScan.FieldContainer.pushObject(ODKScan.TextBoxView);
			} else if (obj.field_type == "string") {  // before it was empty_box
				ODKScan.FieldContainer.pushObject(ODKScan.EmptyBoxView);
			} else if (obj.field_type == "qr_code") {
                 ODKScan.FieldContainer.pushObject(ODKScan.QrCodeView);
			}else {
				console.log("error - unsupported field type");
			}		
		}
		
		// if the field is contained within a group then we
		// don't want the click action to propagate to the 
		// group because that will cause the group to be 
		// selected rather than this field
		return false;
	});
}

//	Creates a generic box and adds it to the Scan document.
Box.prototype.constructBox = function() {
	this.$box.addClass('field').addClass('box');								
	this.$box.draggable({containment: 'parent', grid: [GRID_X, GRID_Y]});
	this.$box.resizable({handles: 'all', 
						containment: 'parent', 
						grid: [GRID_X, GRID_Y],
						minWidth: GRID_X,
						minHeight: GRID_Y});
	this.addEventHandlers(this.$box);


	// unhighlight any selected group
	$(".highlighted_group").addClass("unhighlighted_group");
	$(".highlighted_group").removeClass("highlighted_group");
	$(".group_field").removeClass("group_field");
	
	// unhighlight any selected field
	$(".selected_field").removeClass("selected_field");
	this.$box.addClass("selected_field");
	$(".selected_page").append(this.$box);
	
};

/*	Returns JSON containing DOM properties
	of this box, formatted for exporting 
	the document.
*/
Box.prototype.getFieldJSON = function() {
		
	var f_info = {};
	f_info.order = this.order;
	f_info.type = this.type;
	f_info.name = this.name;
	f_info.displayText = this.displayText;
	//f_info.priority = this.field_priority;
	f_info.verify = this.verify; //getting the value from here
	f_info.segments = [];


	var seg = {};
	
	seg.segment_x = (this.$box.position().left);
	seg.segment_y = (this.$box.position().top);
	
	// Account for the offset of the container field_group div
	if (this.$box.parent().hasClass("field_group")) {
		seg.segment_x += this.$box.parent().position().left;
		seg.segment_y += this.$box.parent().position().top;
	}

	seg.segment_width = this.$box.outerWidth();
	seg.segment_height = this.$box.outerHeight();
	
	f_info.segments.push(seg);
	return f_info;
};
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// NEED TO DELTE
Box.prototype.getSubFieldJSON = function() {
  
  if (this.$box.parent().hasClass("field_group")) {
  	if(sub_forms.name != undefined && this.name == sub_forms.name) {
  		groups.concat(this.name);
  		//console.log("groups "+ groups);
  		sub_forms.group1 = groups;
  		return sub_forms;
  	} else {
  	  sub_forms.name = $("#sub_form_name").val();
      groups.push(this.name);
      sub_forms.group1 = groups;
      return sub_forms;
    }
  }
    
};
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

/*	Returns JSON containing DOM properties
	of this generic box, formatted for saving 
	the document.
*/
Box.prototype.getProperties = function() {
	var json = {};
	json.order = this.order;
	json.left = this.$box.css('left');
	//console.log("left: "+this.$box.css('left'));
	json.top = this.$box.css('top');
	//console.log("top: "+this.$box.css('top'));
	json.box_width = this.$box.css('width');
	json.box_height = this.$box.css('height');
	json.border_width = this.border_width;	
	json.field_type = this.field_type;	
	json.name = this.name;
	json.displayText = this.displayText;
	//json.field_priority = this.field_priority;
	json.verify = this.verify;
	json.zIndex = this.$box.zIndex();
	
	return json;
};

/*	Makes a copy of the box, adds event handlers to it,
	and adds it to the Scan document.
*/
Box.prototype.copyField = function() {
	// make a new copy of the $box
	
	// Calling clone() first on $box causes a bug that 
	// makes it so $new_box cannot be resizable. As a 
	// workaround to this issue, the resizable attribute
	// of $box is destroyed before the clone and then
	// added back to $box.
	if (this.$box.hasClass("ui-resizable")) {
		this.$box.resizable('destroy');
	}
	var $new_box = this.$box.clone();
	this.$box.resizable({handles: 'all', 
						containment: 'parent', 
						grid: [GRID_X, GRID_Y],
						minWidth: GRID_X * 1,
						minHeight: GRID_Y * 1});
	$new_box.css({left: rem(0), top: rem(0), zIndex: globZIndex.getZ()});
	globZIndex.incrZ();
	$new_box.draggable({containment: 'parent', grid: [GRID_X, GRID_Y]});
	$new_box.resizable({handles: 'all', 
						containment: 'parent', 
						grid: [GRID_X, GRID_Y],
						minWidth: GRID_X * 1,
						minHeight: GRID_Y * 1});						
	this.addEventHandlers($new_box);
	
	// copy the field object
	var $new_field = jQuery.extend({}, this);
	$new_box.data('obj', $new_field);
	$new_field.$box = $new_box;
	
	$(".selected_field").removeClass("selected_field");	
	$new_box.addClass("selected_field");
	$(".selected_page").append($new_box);
};

/*	Loads properties that are common to all Box
	subclasses into the properties sidebar.
*/
Box.prototype.loadBoxProp = function() {
	// set border width
	$("#border_width").val(this.border_width);
	
	// set field attributes
	$("#field_name").val(this.name);
	$("#field_display_text").val(this.displayText);
	$("#order").val(this.order);
	
	if (this.field_priority == "low") {
		$("#field_priority").prop('selectedIndex', 0);
	} else if (this.field_priority == "medium") {
		$("#field_priority").prop('selectedIndex', 1);
	} else {
		$("#field_priority").prop('selectedIndex', 2);
	}
}

/*	Represents an empty box field.
	json_init: JSON 	// initialization values that come from a JSON file
	update_init: JSON 	// initialization values that come from updating the field
*/
function EmptyBox(json_init, update_init) {
	Box.call(this, json_init, update_init); // call super constructor.	
	this.field_type = 'string';  // before it was empty_box
}

// subclass extends superclass
EmptyBox.prototype = Object.create(Box.prototype);
EmptyBox.prototype.constructor = EmptyBox;

/* 	Loads the properties of the empty box into 
	the properties toolbar.
*/
EmptyBox.prototype.loadProperties = function() {
	// load properties that are common to all Box fields
	this.loadBoxProp();
}

/*	Creates a new empty box field with the updated
	properties listed in the properties sidebar.
*/
EmptyBox.prototype.updateProperties = function() {
	var empty_box = new EmptyBox(null, this.getProperties());
	empty_box.constructBox();	
}

/*	Returns JSON containing DOM properties
	of this empty box, formatted for saving 
	the document.
*/
EmptyBox.prototype.saveJSON = function() {
	return this.getProperties();
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function QrCode(json_init, update_init) {
	Box.call(this, json_init, update_init); // call super constructor.
	this.type = 'qrcode';
	this.field_type = 'qr_code';// before it was empty_box
	//this.grid_class = 'test'					
}

// subclass extends superclass
QrCode.prototype = Object.create(Box.prototype);
QrCode.prototype.constructor = QrCode;

/* 	Loads the properties of the qr code box into 
	the properties toolbar.*/

QrCode.prototype.loadProperties = function() {
	// load properties that are common to all Box fields
	this.loadBoxProp();
}

/*Creates a new qr code box field with the updated
properties listed in the properties sidebar.*/

QrCode.prototype.updateProperties = function() {
	var qr_code = new QrCode(null, this.getProperties());
	qr_code.constructBox();	
}

/*Returns JSON containing DOM properties
	of this qr code box, formatted for saving 
	the document.*/
QrCode.prototype.saveJSON = function() {
	return this.getProperties();
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
/*	Represents a text box field.
	json_init: JSON 	// initialization values that come from a JSON file
	update_init: JSON 	// initialization values that come from updating the field
*/
function TextBox(json_init, update_init) {
	Box.call(this, json_init, update_init); // call super constructor.	
	this.field_type = 'text_box';

	// add textbox specific properties to this.$box
	this.$box.css({wordWrap: 'break-word'});											
	var $text = $("<p/>");
	
	//var font_size_choice = (json_init) ? json_init.font_size 
						//: $("#text_size").val();

	this.font_size = (json_init) ? json_init.font_size 
						: $("#text_size").val();
    var font_size_choice = this.font_size;
	// set the font size
	var font_size_value;
	if (font_size_choice == "small") {
		font_size_value = SMALL_TEXT_SIZE;
	} else if (font_size_choice == "medium") {
		font_size_value = MEDIUM_TEXT_SIZE;
	} else {
		font_size_value = LARGE_TEXT_SIZE;
	}
	if (json_init) {
		this.$box.css({fontSize: rem(font_size_value)});
		$text.text(json_init.text);
		this.text = json_init.text;
	} else {
		this.text = $("#text_input").val();
		$text.text(this.text);
		this.font_size = $("#text_size").val();
		this.$box.css({fontSize: rem(font_size_value)});
	}
	this.$box.append($text);
}

// subclass extends superclass
TextBox.prototype = Object.create(Box.prototype);
TextBox.prototype.constructor = TextBox;

/* 	Loads the properties of the text box into 
	the properties toolbar.
*/
TextBox.prototype.loadProperties = function() {
	// load properties that are common to all Box fields
	this.loadBoxProp();

	// set text
	$("#text_input").val(this.text);
	
	// set text size
	$("#text_size").prop('selectedIndex', (this.font_size == "small") ? 0 :
						(this.font_size == "medium") ? 1 : 2);
	//console.log("loadProperties " + $("#text_size").val());	

}

/*	Creates a new text box field with the updated
	properties listed in the properties sidebar.
*/
TextBox.prototype.updateProperties = function() {
	var text_field = new TextBox(null, this.getProperties());
	text_field.constructBox();	
}

/*	Returns JSON containing DOM properties
	of this text box, formatted for saving 
	the document.
*/
TextBox.prototype.saveJSON = function() {
	var json = this.getProperties();
	json.text = this.text;
	json.font_size = this.font_size;
	return json;
}
