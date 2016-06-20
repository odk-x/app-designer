ODK Scan - Developer Documentation

Overview:
	The ODK Scan web application allows users to create digital forms. 
	Form content includes various fields including textboxes, checkboxes, 
	specially formatted numbers, and other types as well. These forms can 
	then be printed out, filled-in by hand, and then digital processed using 
	the ODK Scan Android application to save time in manually data entry.
	
Dependencies:
	There are multiple JavaScript libraries that the web app is dependent on,
	each is listed below along with the websites they can be found at.
		JQuery: for manipulating DOM elements
			- jquery.com
		JQuery UI: provides features like draggable, resizable DOM elements
			- jqueryui.com
		EmberJS: framework that supports the overall structure of the app
			- emberjs.com
		imgAreaSelect: allows users to select regions within images
			- http://odyniec.net/projects/imgareaselect/
		Bootstrap.js: provides UI functionality such as dropdown tabs
			- http://getbootstrap.com/javascript/
		Html2Canvas: used to take snapshots of Scan documents for exporting
			- http://html2canvas.hertzen.com/
		FileSaver: simplifies saving/loading web app files content to the user's computer
			- https://github.com/eligrey/FileSaver.js/
		JSZip: used to create/load zip files from the browser
			- http://stuk.github.io/jszip/
		JQuery Hotkeys: provides ability to nudge field positions using arrow keys
			- https://github.com/jeresig/jquery.hotkeys

App Structure:
	This web application uses the EmberJS framework. This framework handles user
	interaction with the webpage through a controller, and allow manages mulitple 
	UI views which display and respond to user input.

Bugs:
	- Currently (6/12/14) there is a bug with saving files in Chrome. When a user
	chooses to export or save a file from the application they are prompted to 
	give it a name, however, the actual downloaded filename is always set to
	"download". This is a due to a known bug in Google Chrome:
		- https://code.google.com/p/chromium/issues/detail?id=373182
		
	- When a field group that contains images is saved, the images contained
	within it are not saved with the group. They need to be assigned a group ID
	just as non-image fields are in the saveDoc function in fields_controller.js.