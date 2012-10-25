rmdir /s /q F:\odk\js\forms\collect"
rmdir /s /q F:\odk\js\forms\datetimeTest"
rmdir /s /q F:\odk\js\forms\example"
rmdir /s /q F:\odk\js\forms\imnci"
rmdir /s /q F:\odk\js\forms\json-media"
rmdir /s /q F:\odk\js\forms\lgform"
rmdir /s /q F:\odk\js\forms\selectImage"
xcopy . "F:\odk\js\forms" /E /I /R /Y
del "F:\odk\js\forms\copy.bat"
del "F:\odk\js\forms\collect\js\collect.js"
echo # %DATE% %TIME% >> "F:\odk\js\forms\collect\manifest.appcache"
# pause 'Hit enter to continue'