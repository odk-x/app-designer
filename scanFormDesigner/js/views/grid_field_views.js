/*
*	A view which loads grid values into the view for fields 
*	which contain grids with values (checkboxes and 
*	fill-in bubbles).
*/
//var count = 1;  // added to keep truck of the value of total element value
ODKScan.GridFieldWithValues = ODKScan.FieldViewController.extend({
	gridElements: [[{colIndex: 1, rowIndex: 1, ele_value: 1}]],  // has changed, before it was default_val
	numCol: 1,
	numRow: 1,
	prevNumCol: 1,
	prevNumRow: 1,
	layoutName: "grid-field-layout",
	updateGridValueView: function() {
		// User has chosen to add/remove columns/rows to a field. 
		var count = 0;
		var value_grid = this.get('gridElements');
		console.log("value_grid" + value_grid);
		
		// check if numRow increased of decreased
		if (this.get('numRow') > this.get('prevNumRow')) {
			// need to add new rows with default values
			var newOne = this.get('numRow');  // getting the current number of row
			var newColumn = this.get('numCol');  // getting the current number of column
			var total = newColumn * newOne;  // calculating total number of elements
			count = total - newColumn + 1;  // culculating where to start as the ele_value is supposed to be unique
			
			var num_new_rows = this.get('numRow') - this.get('prevNumRow');
			for (var i = this.get('prevNumRow') + 1; i <= this.get('prevNumRow') + num_new_rows; i++) {
				var new_row = [];
				for (var j = 1; j <= this.get('numCol'); j++) {
					count = count + 1;  // update count to start with unique value
					new_row.pushObject({colIndex: j, rowIndex: i, ele_value: count});
				}
				value_grid.pushObject(new_row);
			}
		} else if (this.get('numRow') < this.get('prevNumRow')) {
			// need to remove rows
			var num_removed_rows = this.get('prevNumRow') - this.get('numRow');
			for (var i = 0; i < num_removed_rows; i++) {
				value_grid.popObject();
			}
		}

		// check if numCol increased of decreased
		if (this.get('numCol') > this.get('prevNumCol')) {
			// need to add new columns with default values
			var newOne = this.get('numRow');  // getting the current number of row
			var newColumn = this.get('numCol');  // getting the current number of column
			 // if the count is less than total number of elements
			 // then it should start with current number of row * current number of column
			if(count < newOne * this.get('prevNumCol')) {
			   count = (newOne * this.get('numCol')) - 1;
			}

			var num_new_col = this.get('numCol') - this.get('prevNumCol');
			for (var i = 1; i <= this.get('numRow'); i++) {
				var curr_row = value_grid[i - 1];
				for (var j = this.get('prevNumCol') + 1; j <= this.get('prevNumCol') + num_new_col; j++) {
					count = count + 1;  // update count to start with unique vlaue
					curr_row.pushObject({colIndex: j, rowIndex: i, ele_value: count});  // has changed, before it was "default_val"
				}
			}
		} else if (this.get('numCol') < this.get('prevNumCol')) {
			// need to remove columns
			var num_removed_col = this.get('prevNumCol') - this.get('numCol');
			for (var i = 1; i <= this.get('numRow'); i++) {
				var curr_row = value_grid[i - 1];
				for (var j = 0; j < num_removed_col; j++) {
					curr_row.popObject();
				}
			}
		}
		
		// update previous values
		this.set('prevNumCol', this.get('numCol'));
		this.set('prevNumRow', this.get('numRow'));
		this.set('gridElements', value_grid);
	}.observes('numCol', 'numRow'),
	didInsertElement: function() {
		this._super();
		if ($(".selected_field").length != 0) {
			// If a field with values has been selected then load
			// its values into the view.
			var curr_field = $(".selected_field").data('obj');
			
			// NOTE: Grid values are stored in row-major order, all
			// values are stored in grid_values as one continous list.
			var grid_values = curr_field.grid_values;
			// set # of rows, columns
			this.set('numRow', parseInt(curr_field.num_rows));
			this.set('numCol', parseInt(curr_field.num_cols));
			this.set('prevNumRow', this.get('numRow'));
			this.set('prevNumCol', this.get('numCol'));
			var new_grid = [];
			var arr_index = 0;
			
			for (var i = 1; i <= this.get('numRow'); i++) {
				var new_row = [];
				for (var j = 1; j <= this.get('numCol'); j++) {
					new_row.push({colIndex: j, rowIndex: i, ele_value: grid_values[arr_index]});
					arr_index += 1;
				}	
				new_grid.push(new_row);
			}
			this.set('gridElements', new_grid);
		} else {
			// Dialog menu has been opened, reset the number of rows and columns
			// in the list of grid values.
			this.set('numRow', 1);
			this.set('numCol', 1);
			this.set('prevNumRow', 1);
			this.set('prevNumCol', 1);	
			this.set('gridElements', [[{colIndex: 1, rowIndex: 1, ele_value: 1}]]);  // has changed, it was default_val				
		}
	},
	focusOut: function() {
		// unhighlight any grid elements that may be highlighted
		$(".selected_field").children().css('backgroundColor', 'initial');
	},
	actions: {
		updateNumColumns: function() {
			// user has increased/decreased the number of columns
			this.set('numCol', parseInt($("#num_col").val()));
		},
		updateNumRows: function() {
			// user has increased/decreased the number of rows
			this.set('numRow', parseInt($("#num_row").val()));
		},
		inputBoxPressed: function(rowIndex, colIndex) {
			// highlight the selected element
			var ele_class = ".row" + rowIndex + "_col" + colIndex;
			$(".selected_field").children(ele_class).css('backgroundColor', 'black');
		}
	}
});

/*
*	These views contain the parameters which are avialable
*	when constructing fields of the grid type. 
*	
*	These views appear in their respective dialog menus
*	when a user chooses to create a new grid field, and also 
*	in the field properties sidebar when a grid field in the 
*	Scan document has been selected by a user.
*/
ODKScan.CheckboxView = ODKScan.GridFieldWithValues.create({
	templateName: 'cb-view'
});

ODKScan.BubblesView = ODKScan.GridFieldWithValues.create({
	templateName: 'bubbles-view'
});

ODKScan.GridFieldNoValues = ODKScan.FieldViewController.extend({
	layoutName: "grid-field-layout"
});

ODKScan.SegNumView = ODKScan.GridFieldNoValues.create({
	templateName: 'seg-num-view'
});