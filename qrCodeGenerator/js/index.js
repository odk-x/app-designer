/**
 * The file for displaying a detail view.
 */
/* global $, control, data */

'use strict';

function makeQRCode() {
    // get user input
    var url = document.getElementById("odk-url").value;
    var userName = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    if (isError(url, userName, password)) {
        displayError(url, userName, password)
    } else {
        generateQRCode(url, userName, password)
    }
}

function isUrl(s) {
   var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
   return regexp.test(s);
}

function isError(url, userName, password) {
    return (url.length == 0 || !isUrl(url) || userName.length == 0 || password.length == 0)
}

function displayError(url, userName, password) {
    document.getElementById("qrcode").innerHTML = ''
    var error_message = ""
    if (url.length == 0) {
        error_message = "URL field cannot be left blank"
    } else if (!isUrl(url)) {
        error_message = "Please enter a valid url"
    } else if (userName.length == 0) {
        error_message = "Username field cannot be left blank"
    } else {
        error_message = "Password field cannot be left blank"
    }
    window.alert(error_message)
}

function generateQRCode(url, userName, password) {
    var serverParams = {};
    serverParams['url'] = url;
    serverParams['username'] = userName;
    serverParams['password'] = password;

    var jsonServerParams = JSON.stringify(serverParams);

    // Clear the div before adding a new qr code
    var qrcodeDiv = document.getElementById("qrcode").innerHTML = '';
    var qrcodeImg = new QRCode(document.getElementById("qrcode"), {
        width: 300,
        height: 300
    });

    qrcodeImg.makeCode(jsonServerParams);
}



