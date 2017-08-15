var USER_CONFIG_LOCATION = "/app/file_manager_config";
var USER_PY_LOCATION = "/formgen/app_specific_default.py" // TODO HARDCODED APP NAME !!!!
var postFile = function postFile(path, data, optional_message) {
    if (typeof(optional_message) == "undefined") optional_message = "Success";
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == XMLHttpRequest.DONE && request.status == 200) {
            alert(optional_message);
        }
    }
    request.open("POST", path);
    request.send(data);
}
