// creates an instance of Ember.Application, adds it to the scope of the browser's JavaScript environment
window.ODKScan = Ember.Application.create();

ODKScan.Router.map(function () {
	this.resource('fields', {path: "/"}, function() {
	});
});

ODKScan.runGlobal = function(fname){
	return this.__container__.lookup('controller:fields')._actions[fname];	
}