/* Global functions and constants are listed below. */

// These constants specify the imaginary 
// grid that fields are aligned to in the Scan doc.
var GRID_X = 10; // horizontal grid size unit
var GRID_Y = 10; // vertical grid size unit

/**
*	Singleton class which contains operations
*	to get and update the global zIndex.
*/
function ZIndex() {
	this._init_z = 0;
};

/**
*	Sets up all of the attributes that page
* 	needs to keep track of zIndex information.
*/
ZIndex.prototype.registerPage = function() {
	$(".selected_page").data("currZ", this._init_z);
	$(".selected_page").data("bottomZ", this._init_z);
};

/**
*	Returns the current zIndex.
*/
ZIndex.prototype.getZ = function() {
	return $(".selected_page").data("currZ");
};

/**
*	Sets the current zIndex value.
*/
ZIndex.prototype.setZ = function(val) {
	return $(".selected_page").data("currZ", val);
};

/**
*	Returns the bottom-most zIndex value.
*/
ZIndex.prototype.getBottomZ = function() {
	return $(".selected_page").data("bottomZ");
};

/**
*	Returns the current top-most zIndex value.
*/
ZIndex.prototype.getTopZ = function() {
	return $(".selected_page").data("currZ") - 1;
};

/**
*	Increments the current zIndex.
*/
ZIndex.prototype.incrZ = function() {
	var curr_val = $(".selected_page").data("currZ");
	$(".selected_page").data("currZ", curr_val + 1);
};

var globZIndex = new ZIndex();

/* 	Returns true if the field name in the #field_name
	input box is unique (no other field in the Scan 
	doc has the name), false otherwise. Prompts user
	with an alert box if the field name is not unique.
*/
var is_name_valid = function() {
	var name_unique = true;
	var field_name = $("#field_name").val().replace(/\s/g, "_");
	
	// iterate over all fields and check for a
	// duplicate name
	$(".field").each(function() {
		var is_name_match = $(this).data('obj').name == field_name;
		var is_other_field = !$(this).hasClass("selected_field");
		
		// check for duplicate name
		if (is_name_match && is_other_field) {				
			name_unique = false
		}
	});
	
	if (!name_unique) {
		alert("\"" + $("#field_name").val() + "\" is a duplicate field name.");
	} else if (field_name.length == 0) {
		alert("Please enter an ID with 1 or more characters.");
	} else {
		$("#field_name").val(field_name);
	}	
	
	return name_unique && field_name.length != 0;
};
/*
Prompts user with an alert box if the grid values are not unique.*/
var is_value_valid = function(grid_values) {
	for (var i = 0; i < grid_values.length; i++) {
		for(var j = i + 1; j < grid_values.length; j++) {
	        if(parseInt(grid_values[i]) == parseInt(grid_values[j])) {
	          alert("You have one or more duplecate Grid Values.");
	        }
        }
	}
};
// converts a numeric value to an rem unit
var rem = function(value) {
	return parseFloat(value) / 10 + "rem";
}

// converts position units to rem
var convert_position = function($obj) {
	$obj.css("top", rem($obj.css("top")));
	$obj.css("left", rem($obj.css("left")));
};	

/*
*	These key bindings allow selected fields to be nudged
*	up, down, left, or right be using the arrow keys.
*/
$(document).on("keydown", "left", function() {				
	var $field = $(".selected_field");
	if ($field.parent().hasClass("field_group")) {
		$field = $field.parent();
	}
	if ($field.length != 0) {
		// check if the field can be moved
		var curr_left = parseInt($field.css('left'));
		if (curr_left - GRID_X >= 0) {
			// move the field
			var new_left = rem(curr_left - GRID_X);
			$field.css('left', new_left);
		}					
		return false;
	}
});

$(document).on("keydown", "right", function() {
	var $field = $(".selected_field");
	if ($field.parent().hasClass("field_group")) {
		$field = $field.parent();
	}
	if ($field.length != 0) {
		// check if the field can be moved
		var curr_left = parseInt($field.css('left'));
		var field_width = parseInt($field.css('width'));
		var page_width = parseInt($(".selected_page").css('width'));
		
		var right_most_pos = curr_left + field_width + GRID_X;
		if (right_most_pos <  page_width) {
			// move the field
			var new_left = rem(curr_left + GRID_X);
			$field.css('left', new_left);
		}					
		return false;
	}
});

$(document).on("keydown", "up", function() {
	var $field = $(".selected_field");
	if ($field.parent().hasClass("field_group")) {
		$field = $field.parent();
	}
	if ($field.length != 0) {
		// check if the field can be moved
		var curr_top = parseInt($field.css('top'));
		if (curr_top - GRID_Y >= 0) {
			// move the field
			var new_top = rem(curr_top - GRID_Y);
			$field.css('top', new_top);
		}					
		return false;
	}
});

$(document).on("keydown", "down", function() {
	var $field = $(".selected_field");
	if ($field.parent().hasClass("field_group")) {
		$field = $field.parent();
	}
	if ($field.length != 0) {
		// check if the field can be moved
		var curr_top = parseInt($field.css('top'));
		var field_height = parseInt($field.css('height'));
		var page_height = parseInt($(".selected_page").css('height'));
		
		var bottom_most_pos = curr_top + field_height + GRID_Y;
		if (bottom_most_pos <  page_height) {
			// move the field
			var new_top = rem(curr_top + GRID_X);
			$field.css('top', new_top);
		}					
		return false;
	}
});