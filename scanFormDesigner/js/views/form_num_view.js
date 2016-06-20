/*
*	A view which loads formatted number group sizes into
*	the formatted number view when a formatted number field
*	has been selected or a new one is being created.
*	
*	Also updates the number of groups listed in the view
*	when the user chooses to increase or decrease the 
*	of groups within a formatted number.
*/
ODKScan.FormNumViewController = ODKScan.FieldViewController.extend({
	/*	formNumGroups is an array of JSON objects that contain
		information about the size and position of each group 
		in the formatted number. 
	*/
	formNumGroups: [{groupNum:1, size:1}, {groupNum:2, size:1}],
	didInsertElement: function() {
		this._super();
		if ($(".selected_field").length != 0) {
			/*	If a formatted number has been selected 
				by the user, then update the view to show
				all of the groups it contains as well as 
				the number of digits in each group. 
			*/
			
			// get all of the group sizes from the selected field
			var group_sizes = $(".selected_field").data('obj').group_sizes;
			var size_lst = []
			for (var i = 1; i <= group_sizes.length; i++) {
				size_lst.push({groupNum:i, size:group_sizes[i-1]});
			}
		
			this.set('formNumGroups', size_lst);					
		} else {
			/*	Else this view is being loaded into a dialog 
				menu, resets the view to display the default
				number of groups being displayed (two groups).
			*/
			this.set('formNumGroups', [{groupNum:1, size:1}, {groupNum:2, size:1}]);			
		}
	},
	actions: {
		updateNumGroups: function() {	
			// user has increased/decreased the number of groups
			var arr = [];
			for (var i = 1; i <= $("#num_col_form_num").val(); i++) {
				arr.push({groupNum:i, size:1});
			}
			this.set('formNumGroups', arr);
		}
	}
});

/*
*	This views contain the parameters which are avialable
*	to the user when constructing fields of the formatted 
*	number type. 
*	
*	This view appear in the formatted number dialog menu
*	when a user chooses to create a new formatted number, 
*	and also in the field properties sidebar when a 
*	formatted number has been selected by the user
*/
ODKScan.FormNumView = ODKScan.FormNumViewController.create({
	templateName: 'form-num-view'
});
