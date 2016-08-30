/**
*	Rounds the top, left position of an image up or down to 
*	the nearest multiple of GRID_Y and GRID_X respectively 
*	in order to maintain grid alignment.
*/
var adjust_image_position = function($obj, ui) {
/*	NOTE:
	The top, left position of images are kept aligned to 
	grid vertically and horizontally. Since users can resize
	images in all directions then the top, left position of the
	image can fall out of alignment. That's why this function is
	neccessary to re-align their position.
*/
	var pos = ui.position;
	var left_rounded_down = Math.floor(pos.left / GRID_X) * GRID_X;
	var top_rounded_down = Math.floor(pos.top / GRID_Y) * GRID_Y;
	
	var left_rounded_up = Math.ceil(pos.left / GRID_X) * GRID_X;
	var top_rounded_up = Math.ceil(pos.top / GRID_Y) * GRID_Y
	
	if (Math.abs(pos.left - left_rounded_down) < Math.abs(pos.left - left_rounded_up)) {
		$obj.css("left", rem(left_rounded_down));
	} else {
		$obj.css("left", rem(left_rounded_up));
	}
	
	if (Math.abs(pos.top - top_rounded_down) < Math.abs(pos.top - top_rounded_up)) {
		$obj.css("top", rem(top_rounded_down));
	} else {
		$obj.css("top", rem(top_rounded_up));
	}
};

/**	
*	Wraps image in a div to eliminate the overflow
*	and only make the selected region visible.	
*	@param (image) A JSON object which has the following
*		attributes:
*		- img_src: src data for the image snippet
*		- top_pos: top offset within original image
*		- left_pos: left offset within original image
*		- img_height: height of image snippet
*		- img_width: width of image snippet
*/		
var crop_image = function(image) {		
	
	var $wrapped_image = $("<img/>");
	$wrapped_image.attr('src', image.img_src);
	$wrapped_image.css({
		position: 'relative',
		top: image.top_pos,
		left: image.left_pos,
	});		

	var $img_container = $("<div/>");
	$img_container.css({position: 'absolute',
					height: image.img_height, 
					width: image.img_width,
					overflow: 'hidden'});		
	$img_container.append($wrapped_image);

	/*	NOTE: html2canvas requires the DOM elements be loaded into
		the canvas in order to work correctly, so the image is loaded
		into the processed_images div.
	*/	
	$("#processed_images").append($img_container);
	return $img_container;
};

/** 
*	Creates a image field from the image attributes. 
*	@param (image) A JSON object which has the following
*		attributes:
*		- img_name: the name of the original source image
*		- img_src: src data for the image snippet
*		- img_top: top offset within original image
*		- img_left: left offset within original image
*		- div_top: top position of the field
*		- div_left: left position of the field
*		- orig_height: original height of image snippet
*		- orig_width: original width of image snippet
*		- img_height: current/resized height of image snippet
*		- img_width: current/resized width of image snippet
*	@param (jzon_zIndex) optional integer value that specifies
*		the zIndex to set on the image.
*/
var image_to_field = function(image, json_zIndex) {
	var $img = $("<img/>");
	$img.attr('src', image.img_src);	
	/* 	Original image selection offset and size
		are stored in order to resize and position
		the image after it's saved.
	*/
	$img.data('top', image.img_top);
	$img.data('left', image.img_left);
	$img.data('orig_width', image.orig_width);
	$img.data('orig_height', image.orig_height);		
	/*	NOTE: in order for the image to be resizable
		it is put into a div and set to match the div's
		width and height, the div is made resizable so
		the image matches its width and height as it 
		becomes resized.
	*/
	$img.css({width: '100%', height: '100%'});
	
	// create div container for the image
	var $img_draggable = $("<div/>");
	$img_draggable.data('img_name', image.img_name);	
	
	$img_draggable.css({width: rem(image.img_width), 
					height: rem(image.img_height), 
					left: rem(image.div_left), 
					top: rem(image.div_top), 
					position: 'absolute'});
	if (json_zIndex) {
		$img_draggable.css({zIndex: json_zIndex});
	} else {
		$img_draggable.css({zIndex: globZIndex.getZ()});
		globZIndex.incrZ();
	}	
					
	// make the div draggable/resizable
	$img_draggable.draggable({containment: 'parent', 
							grid: [GRID_X, GRID_Y]});
	$img_draggable.resizable({containment: 'parent', 
		aspectRatio: true, handles: 'all'});
	
	// convert units to REM on resize/drag stop
	$img_draggable.on('resizestop', function(event, ui) {		
		// ISSUE: rem function can cause loss of precision 
		// after converting units
		var width = $(this).css("width");
		var height = $(this).css("height");
		$(this).css("width", rem(width));
		$(this).css("height", rem(height));
		adjust_image_position($(this), ui);
	});
	
	$img_draggable.on("dragstop", function() {
		convert_position($(this));
	});
	
	// add event listeners
	$img_draggable.mousedown(function(event) {		
		ODKScan.FieldContainer.popObject();
		ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);	
		
		// check if user pressed control during the click
		if (event.shiftKey) {  // changed to shiftKey from CLTRLKEY
				ODKScan.FieldContainer.pushObject(ODKScan.DefaultPropView);			
				// add this field to the set of group fields
				$(this).addClass("group_field");	

				// if a single field was already selected then add
				// it to the group of selected fields
				$(".selected_field").addClass("group_field");
				$(".selected_field").removeClass("selected_field");	
		} else {
			// unhighlight any selected group
			$(".highlighted_group").addClass("unhighlighted_group");
			$(".highlighted_group").removeClass("highlighted_group");
			$(".group_field").removeClass("group_field");
			
			// unhighlight any selected field
			$(".selected_field").removeClass("selected_field");
			$(this).addClass("selected_field");
		}
	});
	
	// image fields are identified by the 'img_div' class
	$img_draggable.addClass('img_div').append($img);		
	$(".selected_page").append($img_draggable);
	
	return $img_draggable;
};