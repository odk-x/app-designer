/*	FormField class acts similar to an abstract class
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
function FormField(json_init, update_init) {
	this.$grid_div = $('<div/>');
	this.$grid_div.data("obj", this);
	
	if (json_init) {
		// invoke by Load button
		this.order = json_init.order;
		this.border_offset = json_init.border_offset;
		this.param = json_init.param;
		this.dot_width = json_init.dot_width;
		this.dot_height = json_init.dot_height;
		this.group_dx = json_init.group_dx;
		this.num_dx = json_init.num_dx;
		this.num_group = json_init.num_group;
		this.group_sizes = json_init.group_sizes;
		this.delim_type = json_init.delim_type;
		
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
		//this.field_priority = json_init.field_priority; changing here
		this.verify = json_init.verify;
	} else {
		if (update_init) {
			// invoked from Update Field button
			this.$grid_div.css({top: rem(update_init.top), 
								left: rem(update_init.left),
								zIndex: update_init.zIndex});
		} else {
			// invoked by Dialog menu
			this.$grid_div.css({top: rem(0), left: rem(0), zIndex: globZIndex.getZ()});			
			globZIndex.incrZ();
		}
		
		// margin values
		this.margin_top = parseInt($("#margin_top").val());
		this.margin_bottom = parseInt($("#margin_bottom").val());
		this.margin_left = parseInt($("#margin_left").val());
		this.margin_right = parseInt($("#margin_right").val());
		
		// set border width
		this.border_width = parseInt($("#border_width").val());
		
		// set other field attributes
		this.order = $("#order").val();
		this.name = $("#field_name").val();
		this.displayText = $("#field_display_text").val();

		//this.field_priority = $("#field_priority").val(); changing here
		//this.verify = $("#verified").val();
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
FormField.prototype.getProperties = function() {
	var json = {};
	json.order = this.order;
	json.field_type = this.field_type;
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
	
	json.param = this.param;
	json.border_offset = this.border_offset;
	json.dot_width = this.dot_width;
	json.dot_height = this.dot_height;
	json.num_dx = this.num_dx;
	json.group_dx = this.group_dx;
	json.group_sizes = this.group_sizes;
	json.delim_type = this.delim_type;
	json.name = this.name;
	json.displayText = this.displayText;
	//json.field_priority = this.field_priority; changing here
	//this.num_group = this.num_group;
	json.verify = this.verify;
	json.zIndex = this.$grid_div.zIndex();
	
	return json;
}

/*	Creates the formatted numbers and adds them
	to the Scan document.
*/
FormField.prototype.constructGrid = function() {
	// NOTE: initial width and height are aligned to the grid size
	this.$grid_div.addClass(this.grid_class).addClass('field');
	this.$grid_div.css({position: 'absolute', borderWidth: rem(this.border_width)});																	
	this.$grid_div.draggable({containment: 'parent', grid: [GRID_X, GRID_Y], stack: ".field"});		
	
	var fieldObj = this;
	$(this.group_sizes).each(function(index, group_size) {
		var $g_element = fieldObj.makeGridElement(group_size, index);
		$g_element.css({marginTop: fieldObj.margin_top, marginBottom: fieldObj.margin_bottom});

		if (index == 0) { // edge case, first grid element in the row
			$g_element.css({marginLeft: fieldObj.margin_left, marginRight: rem(0)});
			$g_element.addClass('first_col');
			fieldObj.$grid_div.append($g_element);
			
			var delim = fieldObj.makeGridDelim();
			fieldObj.$grid_div.append(delim);
		} else if (index < fieldObj.num_cols - 1) {			
			$g_element.css({marginLeft: rem(0), marginRight: rem(0)});
			fieldObj.$grid_div.append($g_element);
			
			var delim = fieldObj.makeGridDelim();
			fieldObj.$grid_div.append(delim.clone());
		} else { // edge case, last grid element in the row
			$g_element.css({marginLeft: rem(0), marginRight: fieldObj.margin_right});
			$g_element.addClass('last_col');
			fieldObj.$grid_div.append($g_element);
		}
	});			
	$(".selected_page").append(this.$grid_div);

	this.alignToGrid();
	this.addEventHandlers(this.$grid_div);

	// unhighlight any selected group
	$(".highlighted_group").addClass("unhighlighted_group");
	$(".highlighted_group").removeClass("highlighted_group");
	$(".group_field").removeClass("group_field");
	
	// unhighlight any selected field
	$(".selected_field").removeClass("selected_field");
	this.$grid_div.addClass("selected_field");
};

/*	Aligns the formatted number field to the grid in the 
	horizontal and vertical directions.
*/
FormField.prototype.alignToGrid = function() {
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
		this.$grid_div.children('div').css('marginTop', this.margin_top + top_pad);
		var bottom_pad = height_diff - top_pad;
		this.$grid_div.children('div').css('marginBottom', this.margin_bottom + bottom_pad);
	}
	
	var convert_sizes = function() {
		$(this).css({marginTop: rem($(this).css("marginTop")), 
					marginBottom: rem($(this).css("marginBottom")),
					marginRight: rem($(this).css("marginRight")),
					marginLeft: rem($(this).css("marginLeft"))});

		$(this).css("width", rem($(this).css("width")));
		$(this).css("height", rem($(this).css("height")));
	};
	
	// convert units to REM
	this.$grid_div.children(".num_group").each(convert_sizes); // all groups
	this.$grid_div.children(".num").each(convert_sizes); // all delimeters
	this.$grid_div.children(".num_group").children(".num").each(convert_sizes); // numbers within groups
	
	this.$grid_div.css("width", rem(this.$grid_div.css("width")));
	this.$grid_div.css("height", rem(this.$grid_div.css("height")));
		
	this.$grid_div.css("top", rem(this.$grid_div.css("top")));
	this.$grid_div.css("left", rem(this.$grid_div.css("left")));
}

/*	Adds event handlers to $grid.
	$grid: jQuery div representing the box
*/
FormField.prototype.addEventHandlers = function($grid) {
	var obj = this;
	$grid.mousedown(function() {
		ODKScan.FieldContainer.popObject();
		// unhightlight any groups
		$(".highlighted_group").addClass("unhighlighted_group");
		$(".highlighted_group").removeClass("highlighted_group");
	
		// check if user pressed shift during the click
		if (event.shiftKey) {  //has changed, before it was ctrlKey
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
			if (obj.field_type == 'form_num') {
				ODKScan.FieldContainer.pushObject(ODKScan.FormNumView);
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
FormField.prototype.getFieldJSON = function() {
	console.log(this);
	var f_info = {};
	f_info.order = this.order;
	f_info.type = this.type;
	f_info.name = this.name;
	f_info.displayText = this.displayText;
	f_info.delimiter = this.delimiter;
	//f_info.priority = this.field_priority; changing here
	f_info.delim_type = this.delim_type;
	f_info.num_group = this.group_sizes.length;
	f_info.element_each_group = this.group_sizes;
	f_info.verify = this.verify;
	
	var cf = {};
	// initialize classifier 
	cf.classifier_height = this.element_height;
	cf.classifier_width = this.element_width;						
	cf.training_data_uri = this.data_uri;
	cf.classification_map = this.cf_map;
	cf.default_classification = true;
	cf.advanced = this.cf_advanced;
		
	f_info.classifier = cf;
	
	// check if the field has a 'param'
	// attribute (only bubbles require it)
	if (this.param) {
		f_info.param = this.param;
	}
	
	f_info.segments = [];

	var seg = {};
	
	seg.segment_x = (this.$grid_div.position().left);
    seg.segment_y = (this.$grid_div.position().top);

	// Account for the offset of the contianer field_group div
	if (this.$grid_div.parent().hasClass("field_group")) {
		seg.segment_x += this.$grid_div.parent().position().left;
    	seg.segment_y += this.$grid_div.parent().position().top;
	}

	seg.segment_width = this.$grid_div.outerWidth();
	seg.segment_height = this.$grid_div.outerHeight();
	seg.align_segment = false;
	
	// seg.items contains list of locations of all grid elements
	seg.items = [];
	var number_groups = this.$grid_div.children('.num_group');
	
	number_groups.each(function() {
		$(this).children('.num').each(function() {
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
	});
	
	f_info.segments.push(seg);
	return f_info;
};

/*	Makes a copy of the grid, adds event handlers to it,
	and adds it to the Scan document.
*/
FormField.prototype.copyField = function() {
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

/*	Represents a group of formatted numbers.
	json_init: JSON 	// initialization values that come from a JSON file
	update_init: JSON 	// initialization values that come from updating the field
*/
function FormNumField(json_init, update_init) {
	FormField.call(this, json_init, update_init);
	/* Set all segmented number attributes. */
	this.field_type = 'form_num';
	
	// set the grid class
	this.grid_class = 'num_div';
	
	// TODO: find out what these values should actually be
	this.type = 'string';		
	this.data_uri = "numbers";
	this.cf_advanced = {flip_training_data : false, eigenvalues : 13}; // TODO: remove hardcoded value?
	this.cf_map = {"0":"0", "1":"1", "2":"2", "3":"3", "4":"4", 
					"5":"5", "6":"6", "7":"7", "8":"8", "9":"9"};
	
	if (!json_init) {
		// set the class of the grid elements
		this.ele_class = 'num';
		
		// TODO: allow user to modify the borders of grid elements?
		this.border_offset = 2;

		// number size
		this.element_width = ($("#form_num_size").val() == 'small') ? SEG_NUM_SMALL[0] : 
							($("#form_num_size").val() == 'medium') ? SEG_NUM_MEDIUM[0] : SEG_NUM_LARGE[0];
		this.element_height = ($("#form_num_size").val() == 'small') ? SEG_NUM_SMALL[1] : 
							($("#form_num_size").val() == 'medium') ? SEG_NUM_MEDIUM[1] : SEG_NUM_LARGE[1];
		
		// inner dot size
		this.dot_width = ($("#form_num_dot_size").val() == 'small') ? DOT_SMALL : 
							($("#form_num_dot_size").val() == 'medium') ? DOT_MEDIUM : DOT_LARGE;
		this.dot_height = ($("#form_num_dot_size").val() == 'small') ? DOT_SMALL : 
							($("#form_num_dot_size").val() == 'medium') ? DOT_MEDIUM : DOT_LARGE;
		
		// the horizontal spacing between the edges of numbers
		this.num_dx = parseInt($("#form_num_dx").val());
		
		// the horizontal spacing between the edges of groups
		this.group_dx = parseInt($("#form_num_group_dx").val()) + 8;
		
		/*	Each index corresponds to each group (index = 0 --> group 1, index = 1 --> group 1, etc.).
			The value at each index corresponds to the number of segmented numbers in that group.
			(group_sizes[0] = 3 --> size of group 1 is 3, etc.)
		*/
		var group_sizes = [];
		
		$(".num_groups").each(function() {
			group_sizes.push(parseInt($(this).val()));
		});
		
		// stores the size of each respective group of numbers
		this.group_sizes = group_sizes;
		
		this.delim_type = $("#delim_type").val();
				
		// number of columns
		this.num_cols = $("#num_col_form_num").val();
	}
}

// inherit FormField
FormNumField.prototype = Object.create(FormField.prototype);

// make the constructor point to the FormNumField class
FormNumField.prototype.constructor = FormNumField;

/* 	Returns a div representing a group of segmented numbers. */
FormNumField.prototype.makeGridElement = function(num_digits, group_num) {
	var $new_num = $("<div/>").addClass(this.ele_class).css({width: this.element_width, height: this.element_height});
	
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
	
	var $form_num_group = $("<div/>");
	$form_num_group.addClass('num_group');
	
	for (var i = 0; i < num_digits; i++) {
		var $num = $new_num.clone();
		
		if (i == 0) { // edge case, first grid element in the group
			$num.css({marginLeft: 0});
			if (num_digits == 1) { // edge case, one element in the group
				$num.css({marginRight: 0});
			} else {
				$num.css({marginRight: this.num_dx / 2});
			}
		} else if (i < num_digits - 1) {			
			$num.css({marginLeft: this.num_dx / 2, marginRight: this.num_dx / 2});
		} else { // edge case, last grid element in the group
			$num.css({marginLeft: this.num_dx / 2, marginRight: 0});
		}			
				
		$form_num_group.append($num);
	}
	
	return $form_num_group;
}

/* Returns a div representing a formatted number delimeter. */
FormNumField.prototype.makeGridDelim = function(num_digits) {
	var $delim_div = $("<div/>");
	$delim_div.addClass(this.ele_class);
	var delim_width = this.element_width * .8; //was * .5
	var delim_height = this.element_height;
	
	$delim_div.css({border: 'none',
					width: delim_width, 
					height: delim_height,
					marginTop: this.margin_top,
					marginBottom: this.margin_bottom,
					marginLeft: 0, 
					marginRight: 0,
					textAlign: 'center'});
					
	//	DEBUG test - adds horizontal and vertical line to the div
	//	to indicate the center of the number. 
	/*
	var border_offset = 1;
	var $horiz_line = $("<div/>");
	var hz_line_length = delim_width;
	var hz_vert_trans = (delim_height / 2) - border_offset;
	$horiz_line.css({border: "1px solid black", 
					width: hz_line_length, 
					height: "1px",
					position: "absolute"});
	$horiz_line.css('webkitTransform', 'translate(0px, ' + hz_vert_trans + "px)");
	$delim_div.append($horiz_line);
	
	var $vert_line = $("<div/>");
	var vt_line_length = delim_height;
	var vt_horiz_trans = (delim_width / 2) - border_offset;
	$vert_line.css({border: "1px solid black", 
					width: "1px", 
					height: vt_line_length,
					position: "absolute"});
	$vert_line.css('webkitTransform', 'translate(' + vt_horiz_trans + "px, 0px)");
	$delim_div.append($vert_line);
	*/
	// END DEBUG TEST
	
	var $delim = $("<div/>");
	if (this.delim_type == "/") {
		// calculate size, translation, rotation of slash symbol
		var slash_width = 1; // NOTE: hardcoded constant
		var slash_length = 0.5 * Math.sqrt(Math.pow(delim_width, 2) + Math.pow(delim_height, 2));
		var horiz_trans;
		if (slash_length > delim_width) {
			horiz_trans = -((slash_length / 2) - (delim_width / 2));
		} else {
			horiz_trans = (delim_width / 2) - (slash_length / 2);
		}
		var vert_trans = (delim_height / 2) - slash_width;
		var rot_angle = Math.atan2(delim_height, delim_width * .75) * 180 / Math.PI;
		
		$delim.css({borderWidth: rem(1),
					borderStyle: "solid",
					borderColor: "black",
					width: rem(slash_length), 
					height: rem(slash_width)});
		$delim.css('webkitTransform', 
			'translate(' + rem(horiz_trans) +', ' + rem(vert_trans) + ") " + 'rotate(-' + rot_angle + 'deg)');		
	} else if (this.delim_type == "-") {	
		var dash_width = 1; // NOTE: hardcoded constant
		var dash_length = 0.5 * delim_width;
		var horiz_trans;
		if (dash_length > delim_width) {
			horiz_trans = -((dash_length / 2) - (delim_width / 2));
		} else {
			horiz_trans = (delim_width / 2) - (dash_length / 2);
		}
		var vert_trans = (delim_height / 2) - dash_width;
		
		$delim.css({borderWidth: rem(1),
					borderStyle: "solid",
					borderColor: "black", 
					width: rem(dash_length), 
					height: rem(dash_width)});
		$delim.css('webkitTransform', "translate(" + rem(horiz_trans) + ", " + rem(vert_trans) + ")");		
	} else if (this.delim_type == ".") {		
		var circle_radius = (this.element_width == SEG_NUM_SMALL[0]) ? 3 :
							(this.element_width == SEG_NUM_MEDIUM[0]) ? 4 : 6;
		// must compensate for circle radius to center the circle vertically witin the div
		var vert_trans = (delim_height / 2) - circle_radius; 
		var circle_border = 1;
		var horiz_trans = (delim_width / 2) - circle_radius;		
		
		$delim.addClass("dot_delim");
		$delim.css({borderWidth: rem(circle_border), 
					backgroundColor: "black",
					position: "absolute",
					bottom: rem(1),
					borderColor: "black",
					borderStyle: "solid",
					borderRadius: rem(circle_radius),
					height: rem(circle_radius * 2),
					width: rem(circle_radius * 2)});
		$delim.css('webkitTransform', "translate(" + rem(horiz_trans) + ", " + rem(0) + ")");		
	} else {
		console.log("error, unsupported delimeter type for formatted numbers");
	}
	
	$delim_div.append($delim);
	return $delim_div;
}

/*	Returns JSON containing DOM properties
	of this bubble field, formatted for saving 
	the document.
*/
FormNumField.prototype.saveJSON = function() {
	return this.getProperties();
}

/* 	Loads the properties of the formatted number
	into the properties toolbar.
*/
FormNumField.prototype.loadProperties = function() {
	// NOTE: FormNumController takes care of loading the
	// group sizes of the formatted number.

	// NOTE: ASSUMING no duplicate values in first index of
	// SEG_NUM_SMALL, SEG_NUM_MEDIUM, and SEG_NUM_LARGE 
	$("#form_num_size").prop('selectedIndex', (this.element_width == SEG_NUM_SMALL[0]) ? 0 :
						(this.element_width == SEG_NUM_MEDIUM[0]) ? 1 : 2);					
	
	// NOTE: ASSUMING dot_width == dot_height
	$("#form_num_dot_size").prop('selectedIndex', (this.dot_width == DOT_SMALL) ? 0 :
						(this.dot_width == DOT_MEDIUM) ? 1 : 2);											
	
	// the horizontal spacing between the edges of numbers
	$("#form_num_dx").val(this.num_dx);
	
	// the horizontal spacing between the edges of groups
	$("#form_num_group_dx").val(this.group_dx);
	
	// margin values
	$("#margin_top").val(this.margin_top);
	$("#margin_bottom").val(this.margin_bottom);
	$("#margin_left").val(this.margin_left);
	$("#margin_right").val(this.margin_right);
	
	// set the delimeter type between groups of adjacent numbers
	$("#delim_type").val(this.delim_type);
			
	// set border width
	$("#border_width").val(this.border_width);

	// set number of columns
	$("#num_col_form_num").val(this.group_sizes.length);
	
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

/*	Creates a new formatted number field with 
	the updated properties listed in the 
	properties sidebar.
*/
FormNumField.prototype.updateProperties = function() {
	var formNumField = new FormNumField(null, this.getProperties());
	formNumField.constructGrid();	
}
