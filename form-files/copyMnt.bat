rmdir /s /q F:\odk\js\forms\"
xcopy . "F:\odk\js\forms" /E /I /R /Y
del "F:\odk\js\forms\copy.bat"
del "F:\odk\js\forms\copyMnt.bat"
echo # %DATE% %TIME% >> "F:\odk\js\forms\default\manifest.appcache"
# pause 'Hit enter to continue'