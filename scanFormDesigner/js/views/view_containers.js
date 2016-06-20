/*	This container contains field views in the properties 
	sidebar. When a new field has been created or a field
	has been selected then its respective view will be put
	into the FieldContainer. Only one view is contained 
	within the FieldContainer at a time.
*/
ODKScan.FieldContainer = Ember.ContainerView.create({});

/*	Each dialog for every field contain a field container.
	When the user chosen to create a new field then the 
	view for that field is added to its respective view
	container.
*/
ODKScan.EmptyBoxContainer = Ember.ContainerView.create({});

ODKScan.QrCodeContainer = Ember.ContainerView.create({});  // added for qr code
ODKScan.TextBoxContainer = Ember.ContainerView.create({});

ODKScan.CheckboxContainer = Ember.ContainerView.create({});

ODKScan.BubbleContainer = Ember.ContainerView.create({});

ODKScan.SegNumContainer = Ember.ContainerView.create({});

ODKScan.FormNumContainer = Ember.ContainerView.create({});

