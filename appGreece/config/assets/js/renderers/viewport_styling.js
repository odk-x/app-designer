'use strict'


function setVirtualHeights() {
	$(':button').css({'height' : window.innerHeight * .15 + "px"});
	$(':button').css({'font-size' : Math.min(window.innerHeight, window.innerWidth) * .07 + "px"});
	$(':button').css({'margin-bottom' : window.innerHeight * .06 + "px"});
}