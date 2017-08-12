var idx = 0;
var loadCallback = function loadCallback() {
	if (tabs[idx] && "callback" in tabs[idx]) {
		tabs[idx]["callback"](document.getElementById("iframe"));
	}
}
var ol = function ol() {
	idx = Number(odkCommon.getSessionVariable("idx"));
	if (isNaN(idx)) idx = 0;
	var tabs_div = document.getElementById("tabs");
	tabs_div.innerHTML = "";
	var iframe = document.getElementById("iframe");
	iframe.addEventListener("load", loadCallback);
	for (var i = 0; i < tabs.length; i++) {
		var tab = document.createElement("span");
		tab.classList.add("tab");
		tab.innerText = _tu(tabs[i]["title"]);
		(function (tab, i) {
			tab.addEventListener("click", function() {
				odkCommon.setSessionVariable("idx", i);
				ol();
			});
		})(tab, i);
		if (i == idx) {
			tab.classList.add("tab-selected");
			iframe.src = tabs[i]["file"];
		}
		tabs_div.appendChild(tab);
	}
	iframe.style.top = tabs_div.clientHeight.toString() + "px";
	iframe.style.height = (document.body.clientHeight - tabs_div.clientHeight).toString() + "px";
}
