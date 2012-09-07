rmdir /s /q F:\odk\js\forms\collect"
rmdir /s /q F:\odk\js\forms\json-media"
xcopy . "F:\odk\js\forms" /E /I /R /Y
del "F:\odk\js\forms\copy.bat"
del "F:\odk\js\forms\collect\js\collect.js"
del "F:\odk\js\forms\json-media\index.html"
ren "F:\odk\js\forms\json-media\indexPhone.html" index.html
echo # %DATE% %TIME% >> "F:\odk\js\forms\collect\manifest.appcache"
# pause 'Hit enter to continue'