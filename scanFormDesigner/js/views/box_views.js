/*
*	These views contain the parameters which are avialable
*	when constructing fields of the box type. 
*	
*	These views appear in their respective dialog menus
*	when a user chooses to create a new field, and also 
*	in the field properties sidebar when a field in the 
*	Scan document has been selected by a user.
*/
ODKScan.EmptyBoxView = ODKScan.FieldViewController.create({
	templateName: 'empty-box-view'
});
ODKScan.QrCodeView = ODKScan.FieldViewController.create({
	templateName: 'qr-code-view'
});

ODKScan.TextBoxView = ODKScan.FieldViewController.create({
	templateName: 'textbox-view'
});