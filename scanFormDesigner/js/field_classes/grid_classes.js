// Constants 
var CLASSIFIER = 20;
var CHECKBOX_SMALL = 10;
var CHECKBOX_MEDIUM = 16;
var CHECKBOX_LARGE = 25;

var BUBBLE_SMALL = 10;
var BUBBLE_MEDIUM = 16;
var BUBBLE_LARGE = 26;

// sizes are set in [width, height]
var SEG_NUM_SMALL = [20, 28];
var SEG_NUM_MEDIUM = [30, 42];
var SEG_NUM_LARGE = [45, 63];

var DOT_SMALL = 2;
var DOT_MEDIUM = 5;
var DOT_LARGE = 7;

/*	GridElement class acts similar to an abstract class
	in Java, it has to be subclassed in order to invoke
	the constructGrid function.
	
	Each subclass requires the following fields to be 
	initialized:
		- num_rows (int) 
		- num_cols (int)
		- margin_top (int)
		- margin_bottom (int)
		- margin_left (int)
		- margin_right (int)
		- element_height (int)
		- element_width (int)
		- ele_class (string)
		- grid_class (string)
		- data_uri (string)
		- cf_map (JSON)
		- cf_advanced (JSON)
		- makeGridElement (function, returns jQuery object)
*/

/*	Represents a generic grid field.
	json_init: JSON 	// initialization values that come from a JSON file
	update_init: JSON 	// initialization values that come from updating the field
*/
function GridField(json_init, update_init, field_group) {
	this.$grid_div = $('<div/>');
	this.$grid_div.data("obj", this);
	
	if (json_init) {
		this.order = json_init.order;
		this.num_rows = json_init.num_rows;
		this.num_cols = json_init.num_cols;
		this.margin_top = json_init.margin_top;
		this.margin_bottom = json_init.margin_bottom;
		this.margin_left = json_init.margin_left;
		this.margin_right = json_init.margin_right;
		this.element_height = json_init.element_height;
		this.element_width = json_init.element_width;
		this.ele_class = json_init.ele_class;
		this.$grid_div.css({top: rem(json_init.top), 
							left: rem(json_init.left), 
							zIndex: json_init.zIndex});
		this.border_width = json_init.border_width;
		this.name = json_init.name;
		this.displayText = json_init.displayText;
		//this.field_priority = json_init.field_priority; making change here
		this.verify = json_init.verify;
	} else {
		if (update_init) {
			// invoked from Update Field button
			this.$grid_div.css({top: rem(update_init.top), 
							left: rem(update_init.left), zIndex: update_init.zIndex});
		} else {
			this.$grid_div.css({top: rem(0), left: rem(0), zIndex: globZIndex.getZ()});
			globZIndex.incrZ();
		}
		
		// margin values
		this.margin_top = parseInt($("#margin_top").val());
		this.margin_bottom = parseInt($("#margin_bottom").val());
		this.margin_left = parseInt($("#margin_left").val());
		this.margin_right = parseInt($("#margin_right").val());
		
		// number of rows
		this.num_rows = $("#num_row").val();
		
		// number of columns
		this.num_cols = $("#num_col").val();
		
		// set border with
		this.border_width = $("#border_width").val();
		
		// set other field attributes
		this.order = $("#order").val();
		this.name = $("#field_name").val();
		this.displayText = $("#field_display_text").val();
		//.field_priority = $("#field_priority").val(); changing here
		//.verify = $("#verified").val();
		if ($("#verified").val() == "") {
          this.verify = "Yes";
		} else {
			this.verify = $("#verified").val();
		}
	}
}

/* 	Returns properties of the field which are 
	common to all of the subclasses of GridField.
*/
GridField.prototype.getProperties = function() {
	var json = {};
	json.order = this.order;
	json.num_rows = this.num_rows;
	json.num_cols = this.num_cols;
	json.margin_top = this.margin_top;
	json.margin_bottom = this.margin_bottom;
	json.margin_left = this.margin_left;
	json.margin_right = this.margin_right;
	json.element_height = this.element_height;
	json.element_width = this.element_width;
	json.ele_class = this.ele_class;
	json.left = this.$grid_div.css('left');
	json.top = this.$grid_div.css('top');
	json.border_width = this.border_width;
	json.field_type = this.field_type;
	json.name = this.name;
	json.displayText = this.displayText;
	//json.field_priority = this.field_priority; changing here
	json.verify = this.verify;
	json.zIndex = this.$grid_div.zIndex();
	
	return json;
}

/*	Creates the actual grid of elements and
	adds it to the Scan document.
*/
GridField.prototype.constructGrid = function() {
	this.$grid_div.addClass(this.grid_class).addClass('field');
	this.$grid_div.css({position: 'absolute', borderWidth: rem(this.border_width)});																	
	this.$grid_div.draggable({containment: 'parent', grid: [GRID_X, GRID_Y]});			
	
	// construct the grid
	for (var i = 0; i < this.num_rows; i++) {	
		var row_pos;
		
		// special case: only one row
		if (this.num_rows == 1) {
			row_pos = 'first_row last_row';
		} else if (i == 0) { // first row
			row_pos = 'first_row';
		} else if (i < this.num_rows - 1) { // middle row
			row_pos = 'middle_row';
		} else { // last row
			row_pos = 'last_row';
		}
												
		for (var j = 0; j < this.num_cols; j++) {	
			var $g_element = this.makeGridElement();
			$g_element.css({marginTop: this.margin_top, marginBottom: this.margin_bottom, 
							marginLeft: this.margin_left, marginRight: this.margin_right});
			$g_element.addClass('row' + (i + 1) + '_col' + (j + 1));
			
			if (this.num_cols == 1) { // special case: only one column
				$g_element.addClass(row_pos).addClass('first_col last_col');
			} else if (j == 0) { // edge case, first grid element in the row				
				$g_element.addClass(row_pos).addClass('first_col');
			} else if (j < this.num_cols - 1) {
				$g_element.addClass(row_pos).addClass('middle_col');
			} else { // edge case, last grid element in the row
				$g_element.addClass(row_pos).addClass('last_col');
			}
			this.$grid_div.append($g_element);
		}				
	}
	$(".selected_page").append(this.$grid_div);
	
	this.alignToGrid(); // align this.$grid_div to the grid
	this.addEventHandlers(this.$grid_div);

	// unhighlight any selected group
	$(".highlighted_group").addClass("unhighlighted_group");
	$(".highlighted_group").removeClass("highlighted_group");
	$(".group_field").removeClass("group_field");
	
	// unhighlight any selected field
	$(".selected_field").removeClass("selected_field");
	this.$grid_div.addClass("selected_field");
};

/*	Aligns the grid field to the grid in the 
	horizontal and vertical directions.
*/
GridField.prototype.alignToGrid = function() {
	// Rounds up the width of the grid to the nearest multiple
	// of GRID_X (ex: if GRID_X is 10 and width of grid is 
	// initially 132 then it gets rounded up to 140).
	var width_diff = (Math.ceil(this.$grid_div.outerWidth() / GRID_X) * GRID_X) - this.$grid_div.outerWidth();
	if (width_diff != 0) {
		var left_pad = width_diff / 2;
		this.$grid_div.children('.first_col').css('marginLeft', this.margin_left + left_pad);
		var right_pad = width_diff - left_pad;
		this.$grid_div.children('.last_col').css('marginRight', this.margin_right + right_pad);
	}

	// Rounds up the height of the grid to the nearest multiple
	// of GRID_Y (ex: if GRID_Y is 10 and height of grid is 
	// initially 132 then it gets rounded up to 140).
	var height_diff = (Math.ceil(this.$grid_div.outerHeight() / GRID_Y) * GRID_Y) - this.$grid_div.outerHeight();
	if (height_diff != 0) {
		var top_pad = height_diff / 2;
		this.$grid_div.children('.first_row').css('marginTop', this.margin_top + top_pad);
		var bottom_pad = height_diff - top_pad;
		this.$grid_div.children('.last_row').css('marginBottom', this.margin_bottom + bottom_pad);
	}
	
	// convert units to REM
	this.$grid_div.children().each(function() {
		$(this).css({marginTop: rem($(this).css("marginTop")), 
					marginBottom: rem($(this).css("marginBottom")),
					marginRight: rem($(this).css("marginRight")),
					marginLeft: rem($(this).css("marginLeft"))});
					
		$(this).css("width", rem($(this).css("width")));
		$(this).css("height", rem($(this).css("height")));
	});
	
	this.$grid_div.css("width", rem(this.$grid_div.css("width")));
	this.$grid_div.css("height", rem(this.$grid_div.css("height")));
	
	this.$grid_div.css("top", rem(this.$grid_div.css("top")));
	this.$grid_div.css("left", rem(this.$grid_div.css("left")));
}

/*	Adds event handlers to $grid.
	$grid: jQuery div representing the box
*/
GridField.prototype.addEventHandlers = function($grid) {
	var obj = this;
	$grid.mousedown(function() {
		ODKScan.FieldContainer.popObject();		
		// unhightlight any groups
		$(".highlighted_group").addClass("unhighlighted_group");
		$(".highlighted_group").removeClass("highlighted_group");
	
		// check if user pressed control during the click
		if (event.shiftKey) {  // has changed before it was ctrlKey
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
		
			// change the view in the properties sidebar to 
			// match this field's view
			if (obj.field_type == 'checkbox') {
				ODKScan.FieldContainer.pushObject(ODKScan.CheckboxView);
			} else if (obj.field_type == "bubble") {
				ODKScan.FieldContainer.pushObject(ODKScan.BubblesView);
			} else if (obj.field_type == "int") {
				ODKScan.FieldContainer.pushObject(ODKScan.SegNumView);
			} else {
				console.log("error - unsupported field type");
			}	
		}
		
		// if the field is contained within a group then we
		// don't want the click action to propagate to the 
		// group because that will cause the group to be 
		// selected rather than this field
		return false;
	});
	
	$grid.on('dragstop', function() {
		convert_position($(this));
	});
}

/*	Returns JSON containing DOM properties
	of this box, formatted for exporting 
	the document.
*/
GridField.prototype.getFieldJSON = function() {
	var f_info = {};
	f_info.order = this.order;
	f_info.type = this.type;
	f_info.name = this.name;
	f_info.displayText = this.displayText;
	//f_info.priority = this.field_priority; changing here
	f_info.verify = this.verify;
	
	var cf = {};
	// initialize classifier 
	cf.classifier_height = CLASSIFIER; //this.element_height;
	cf.classifier_width = CLASSIFIER;//this.element_width;						
	cf.training_data_uri = this.data_uri;
	cf.classification_map = this.cf_map;
	cf.default_classification = true;
	cf.advanced = this.cf_advanced;
		
	f_info.classifier = cf;
	
	// check if fields have 'grid_values' or 'param' attributes
	if (this.param) {
		f_info.param = this.param;
	}
	
	if (this.grid_values) {
		f_info.grid_values = this.grid_values;
	}
	
	f_info.segments = [];

	var seg = {};
	
	seg.segment_x = (this.$grid_div.position().left);
	seg.segment_y = (this.$grid_div.position().top);

	// Account for the offset of the container field_group div
	if (this.$grid_div.parent().hasClass("field_group")) {
		seg.segment_x += this.$grid_div.parent().position().left;
		seg.segment_y += this.$grid_div.parent().position().top;
	}

	seg.segment_width = this.$grid_div.outerWidth();
	seg.segment_height = this.$grid_div.outerHeight();
	seg.align_segment = false;
	
	// seg.items contains list of locations of all grid elements
	seg.items = [];

	this.$grid_div.children('div').each(function() {
		var ele_loc = {}; // stores location of the grid element
		
		/* 	NOTE: The element location is given with
			respect to its center. Also, position().left
			and position().right do not take into account
			the margins around the div, we have to add
			horiz_offset to account for the margin.
		*/								
		var horiz_offset = parseInt($(this).css('margin-left'));
		var vert_offset = parseInt($(this).css('margin-top'));
		
		// we use outerWidth() and outerHeight() because they take borders into account
		ele_loc.item_x = horiz_offset + $(this).position().left + ($(this).outerWidth() / 2);
		ele_loc.item_y = vert_offset + $(this).position().top + ($(this).outerHeight() / 2);
		
		seg.items.push(ele_loc);
	});
	
	f_info.segments.push(seg);
	return f_info;
};

/*	Makes a copy of the grid, adds event handlers to it,
	and adds it to the Scan document.
*/
GridField.prototype.copyField = function() {
	// make a new copy of the $grid_div
	var $new_grid = this.$grid_div.clone();
	$new_grid.css({left: rem(0), top: rem(0), zIndex: globZIndex.getZ()});
	globZIndex.incrZ();
	$new_grid.draggable({containment: 'parent', grid: [GRID_X, GRID_Y]});
	this.addEventHandlers($new_grid);
	
	// copy the field object
	var $new_field = jQuery.extend({}, this);
	$new_grid.data('obj', $new_field);
	$new_field.$grid_div = $new_grid;
	
	$(".selected_field").removeClass("selected_field");	
	$new_grid.addClass("selected_field");
	$(".selected_page").append($new_grid);
};

/*	Loads properties that are common to all GridField
	subclasses into the properties sidebar.
*/
GridField.prototype.loadGridProp = function() {
	// margin values
	$("#margin_top").val(this.margin_top);
	$("#margin_bottom").val(this.margin_bottom);
	$("#margin_left").val(this.margin_left);
	$("#margin_right").val(this.margin_right);
	
	// number of rows
	$("#num_row").val(this.num_rows);
	
	// number of columns
	$("#num_col").val(this.num_cols);
	
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

/*	Represents a grid of checkboxes.
	json_init: JSON 	// initialization values that come from a JSON file
	update_init: JSON 	// initialization values that come from updating the field
*/
function CheckboxField(json_init, update_init) {
	GridField.call(this, json_init, update_init);
	/* Set all checkbox attributes. */
	this.field_type = "checkbox";
	this.grid_class = 'cb_div';

	this.data_uri = "checkboxes";
	this.cf_advanced = {flip_training_data : false};
	this.cf_map = {empty : false};
	
	if (json_init) {
		this.type = json_init.type;
		this.grid_values = json_init.grid_values;
	} else {
		// set the class of the grid elements
		this.ele_class = 'c_box';
		
		// set type
		this.type = $("#cb_type").val();
		
		// checkbox size
		this.element_width = ($("#cb_size").val() == 'small') ? CHECKBOX_SMALL : 
							($("#cb_size").val() == 'medium') ? CHECKBOX_MEDIUM : CHECKBOX_LARGE;
		this.element_height = ($("#cb_size").val() == 'small') ? CHECKBOX_SMALL : 
							($("#cb_size").val() == 'medium') ? CHECKBOX_MEDIUM : CHECKBOX_LARGE;		

		// set checkbox values
		grid_values = [];
		$(".grid_value").each(function() {
			grid_values.push($(this).val());
		});
		this.grid_values = grid_values;
		// checking whether there is a duplicate value or not
		is_value_valid(this.grid_values);
	}
}

// inherit GridField
CheckboxField.prototype = Object.create(GridField.prototype);

// make the constructor point to the CheckboxField class
CheckboxField.prototype.constructor = CheckboxField;

/* 	Returns a div representing a single checkbox. */
CheckboxField.prototype.makeGridElement = function() {
	$element = $("<div/>");
	$element.addClass(this.ele_class);
	$element.css({width: rem(this.element_width), 
				height: rem(this.element_height)});
	return $element;
}

/* 	Loads the properties of the checkbox into 
	the properties toolbar.
*/
CheckboxField.prototype.loadProperties = function() {
	// load properties that are common to all GridFields
	this.loadGridProp();

	// checkbox size
	$("#cb_size").prop('selectedIndex', (this.element_width == CHECKBOX_SMALL) ? 0 :
						(this.element_width == CHECKBOX_MEDIUM) ? 1 : 2);
						
	// checkbox type
	$("#cb_type").prop('selectedIndex', (this.type == 'tally') ? 0 : (this.type == 'select1') ? 1 : 2);	
}

/*	Creates a new checkbox field with the updated
	properties listed in the properties sidebar.
*/
CheckboxField.prototype.updateProperties = function() {
	var cbField = new CheckboxField(null, this.getProperties());
	cbField.constructGrid();	
}

/*	Returns JSON containing DOM properties
	of this checkbox field, formatted for saving 
	the document.
*/
CheckboxField.prototype.saveJSON = function() {
	var json = this.getProperties();
	json.grid_values = this.grid_values;
	json.type = this.type;
	return json;
}

/*	Represents a grid of fill-in bubbles.
	json_init: JSON 	// initialization values that come from a JSON file
	update_init: JSON 	// initialization values that come from updating the field
*/
function BubbleField(json_init, update_init) {
	GridField.call(this, json_init, update_init);
	/* Set all bubble attributes. */
	this.field_type = 'bubble';
	this.grid_class = 'bubble_div';
		
	this.data_uri = "bubbles";
	this.cf_advanced = {flip_training_data : false};
	this.cf_map = {empty : false};
	
	if (json_init) {
		this.param = json_init.param;
		this.type = json_init.type;
		this.grid_values = json_init.grid_values;
	} else {
		// set the class of the grid elements
		this.ele_class = ($("#bubb_size").val() == 'small') ? 'bubble_small' : 
							($("#bubb_size").val() == 'medium') ? 'bubble_med' : 'bubble_large';
		
		// set the bubble type
		this.type = $("#bubb_type").val();
		
		// set param according to the type
		if (this.type == 'tally') {
			this.param = $("#num_row_bubbles").val() * $("#num_col_bubbles").val();
		} else if (this.type == 'select1') {
			this.param = 'yes_no';
		} else if (this.type == 'select_many') {
			this.param = 'many'; // TODO: find out what this value should actually be
		} else {
			console.log("error, unsupported bubble type");
		}
		
		// bubble size
		this.element_width = ($("#bubb_size").val() == 'small') ? BUBBLE_SMALL : 
							($("#bubb_size").val() == 'medium') ? BUBBLE_MEDIUM : BUBBLE_LARGE;
		this.element_height = ($("#bubb_size").val() == 'small') ? BUBBLE_SMALL : 
							($("#bubb_size").val() == 'medium') ? BUBBLE_MEDIUM : BUBBLE_LARGE;
							
		// set bubble values
		grid_values = [];
		$(".grid_value").each(function() {
			grid_values.push($(this).val());
		});
		this.grid_values = grid_values;
		// checking whether there is a duplicate value or not
		is_value_valid(this.grid_values);
	}
}

// inherit GridField
BubbleField.prototype = Object.create(GridField.prototype);

// make the constructor point to the BubbleField class
BubbleField.prototype.constructor = BubbleField;

/* 	Returns a div representing a single bubble. */
BubbleField.prototype.makeGridElement = function() {
	$element = $("<div/>");
	$element.addClass(this.ele_class);
	$element.css({width: rem(this.element_width), 
				height: rem(this.element_height)});
	return $element;
}

/* 	Loads the properties of the bubbles into 
	the properties toolbar.
*/
BubbleField.prototype.loadProperties = function() {
	// load properties that are common to all GridFields
	this.loadGridProp();

	// bubble size
	$("#bubb_size").prop('selectedIndex', (this.element_width == BUBBLE_SMALL) ? 0 :
						(this.element_width == BUBBLE_MEDIUM) ? 1 : 2);		

	// bubble type
	$("#bubb_type").prop('selectedIndex', (this.type == 'tally') ? 0 : (this.type == 'select1') ? 1 : 2);			
}

/*	Creates a new bubble field with the updated
	properties listed in the properties sidebar.
*/
BubbleField.prototype.updateProperties = function() {
	var bubbField = new BubbleField(null, this.getProperties());
	bubbField.constructGrid();	
}

/*	Returns JSON containing DOM properties
	of this bubble field, formatted for saving 
	the document.
*/
BubbleField.prototype.saveJSON = function() {
	var json = this.getProperties();
	json.param = this.param;
	json.type = this.type;
	json.grid_values = this.grid_values;
	return json;
}

/*	Represents a grid of segmented numbers.
	json_init: JSON 	// initialization values that come from a JSON file
	update_init: JSON 	// initialization values that come from updating the field
*/
function SegNumField(json_init, update_init) {
	GridField.call(this, json_init, update_init);
	// Set all segmented number attributes
	this.field_type = 'int';  // has changed, before it was seg_num
	this.grid_class = 'num_div';
	
	this.type = 'int'; //has changed, before it was string	
	this.data_uri = "numbers";
	this.cf_advanced = {flip_training_data : false, eigenvalues : 13}; // TODO: remove hardcoded value?
	this.cf_map = {"0":"0", "1":"1", "2":"2", "3":"3", "4":"4", 
					"5":"5", "6":"6", "7":"7", "8":"8", "9":"9"};
	
	if (json_init) {
		this.border_offset = json_init.border_offset;
		this.param = json_init.param;
		this.dot_width = json_init.dot_width;
		this.dot_height = json_init.dot_height;
	} else {
		// set the class of the grid elements
		this.ele_class = 'num';
		
		// TODO: allow user to modify the borders of grid elements?
		this.border_offset = 2;

		// number size
		this.element_width = ($("#seg_num_size").val() == 'small') ? SEG_NUM_SMALL[0] : 
							($("#seg_num_size").val() == 'medium') ? SEG_NUM_MEDIUM[0] : SEG_NUM_LARGE[0];
		this.element_height = ($("#seg_num_size").val() == 'small') ? SEG_NUM_SMALL[1] : 
							($("#seg_num_size").val() == 'medium') ? SEG_NUM_MEDIUM[1] : SEG_NUM_LARGE[1];
		
		// inner dot size
		this.dot_width = ($("#dot_size").val() == 'small') ? DOT_SMALL : 
							($("#dot_size").val() == 'medium') ? DOT_MEDIUM : DOT_LARGE;
		this.dot_height = ($("#dot_size").val() == 'small') ? DOT_SMALL : 
							($("#dot_size").val() == 'medium') ? DOT_MEDIUM : DOT_LARGE;
		
		// number of rows is hardcoded to 1
		// for number fields
		this.num_rows = 1;
							
		this.param = this.num_rows * this.num_cols;
	}
}

// inherit GridField
SegNumField.prototype = Object.create(GridField.prototype);

// make the constructor point to the SegNumField class
SegNumField.prototype.constructor = SegNumField;

/* 	Returns a div representing a single segmented number. */
SegNumField.prototype.makeGridElement = function() {
	var $new_num = $("<div/>");
	$new_num.addClass(this.ele_class);
	$new_num.css({width: rem(this.element_width), 
				height: rem(this.element_height)});
	
	/*	NOTE: About dot position:
		Let y = 0 be located at the top of the
		segmented number, values of y increase
		downward. Let num_h be the height of 
		the number.
		
		1st row of dots is at y = num_h * 1/6
		2nd row of dots is at y = num_h * 3/6
		3rd row of dots is at y = num_h * 5/6

		Let x = 0 be located at the left of the
		segmented number, values of x increase
		toward the right. Let num_w be the width 
		of the number.

		1st column of dots is at x = num_w * 1/4
		2nd column of dots is at x = num_w * 3/4
	*/
	
	var y_pos = (this.element_height - this.border_offset) / 6;
	var x_pos = (this.element_width - this.border_offset) / 4;
	
	for (var i = 1; i <= 5; i += 2) {
		var $left_dot = $("<div/>");
		$left_dot.addClass("dot");
		// NOTE: assuming this.dot_width == this.dot_height for borderRadius calculation
		$left_dot.css({width: rem(this.dot_width), 
					height: rem(this.dot_height), 
					borderRadius: rem(this.dot_width / 2)});
		
		// shifts over the dot to place its center at the appropriate location
		$left_dot.css({left: rem(x_pos - (this.dot_width / 2)), 
					top: rem((y_pos * i) - (this.dot_height / 2))});
		
		var $right_dot = $("<div/>");
		$right_dot.addClass("dot");
		// NOTE: assuming this.dot_width == this.dot_height for borderRadius calculation
		$right_dot.css({width: rem(this.dot_width), 
						height: rem(this.dot_height), 
						borderRadius: rem(this.dot_width / 2)});
		
		// shifts over the dot to place its center at the appropriate location
		$right_dot.css({left: rem((3 * x_pos) - (this.dot_width / 2)), 
						top: rem((y_pos * i) - (this.dot_height / 2))});
		
		$new_num.append($left_dot);
		$new_num.append($right_dot);
	}
	return $new_num;
}

/* 	Loads the properties of the segmented number
	into the properties toolbar.
*/
SegNumField.prototype.loadProperties = function() {
	// load properties that are common to all GridFields
	this.loadGridProp();

	// NOTE: assuming no duplicate values in first index of
	// SEG_NUM_SMALL, SEG_NUM_MEDIUM, and SEG_NUM_LARGE 
	$("#seg_num_size").prop('selectedIndex', (this.element_width == SEG_NUM_SMALL[0]) ? 0 :
						(this.element_width == SEG_NUM_MEDIUM[0]) ? 1 : 2);					
	
	// NOTE: assuming dot_width == dot_height
	$("#dot_size").prop('selectedIndex', (this.dot_width == DOT_SMALL) ? 0 :
						(this.dot_width == DOT_MEDIUM) ? 1 : 2);											
}

/*	Creates a new segmented number field with 
	the updated properties listed in the 
	properties sidebar.
*/
SegNumField.prototype.updateProperties = function() {
	var segNumField = new SegNumField(null, this.getProperties());
	segNumField.constructGrid();	
}

/*	Returns JSON containing DOM properties
	of this bubble field, formatted for saving 
	the document.
*/
SegNumField.prototype.saveJSON = function() {
	var json = this.getProperties();
	json.param = this.param;
	json.border_offset = this.border_offset;
	json.dot_width = this.dot_width;
	json.dot_height = this.dot_height;
	return json;
}
