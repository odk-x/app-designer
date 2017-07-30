var green = "#75ab5f"
var blue = "#3dbcfe"
var grey = "#c5c8c6"
var update_canvas = function update_canvas(sections, global_current_section, global_section_stack, global_screen_idx, elem) {
	clearCanvas(elem);
	elem.style.width = "200px";
	elem.style.height = "66px";
	var h = (global_section_stack.length + 1) * 20;
	elem.height = Math.max(100, h);
	var w = sections[global_current_section].length * 20;
	for (var i = 0; i < global_section_stack.length; i++) {
		w += sections[global_section_stack[i][0]].length * 20
	}
	elem.width = Math.max(300, w);
	if (elem.height * 3 > elem.width) {
		elem.width = elem.height * 3;
	} else if (elem.height * 3 < elem.width) {
		elem.height = elem.width / 3;
	}
	var y = 0;
	var x = 0;
	for (var i = global_section_stack.length - 1; i >= 0; i--) {
		var num = global_section_stack[i][1] + 1;
		console.log("Drawing " + num + " blue squares")
		x--;
		for (var j = 0; j < num; j++) {
			x++;
			drawSquare(elem, x, y, blue);
		}
		y++;
	}
	for (var i = 0; i < global_screen_idx + (global_section_stack.length == 0 ? 0 : 1); i++) {
		drawSquare(elem, x, y, blue);
		x++;
	}
	drawSquare(elem, x, y, green);
	for (var i = 0; i < sections[global_current_section].length - global_screen_idx - (global_section_stack.length == 0 ? 1 : 0); i++) {
		x++;
		drawSquare(elem, x, y, grey);
	}
	for (var i = 0; i < global_section_stack.length; i++) {
		y--;
		x--;
		for (var j = 0; j < sections[global_section_stack[i][0]].length - global_section_stack[i][1]; j++) {
			x++;
			drawSquare(elem, x, y, grey);
		}
	}
}
var drawSquare = function drawSquare(elem, x, y, color) {
	var ctxt = elem.getContext("2d");
	ctxt.beginPath();
	ctxt.fillStyle = color;
	ctxt.rect(x * 20, y * 20, 10, 10);
	ctxt.fill();
}
var clearCanvas = function clearCanvas(elem) {
	var w = elem.width;
	var h = elem.height;
	var ctxt = elem.getContext("2d");
	ctxt.beginPath();
	ctxt.fillStyle = "#ffffff";
	ctxt.rect(0, 0, w, h);
	ctxt.fill();
}
