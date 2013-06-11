rmdir /s /q F:\odk\survey\forms\"
rmdir /s /q F:\odk\survey\framework\"
xcopy . "F:\odk\survey\forms" /E /I /R /Y
rmdir /s /q F:\odk\survey\forms\default\"
mkdir F:\odk\survey\framework\
xcopy .\default "F:\odk\survey\framework\default" /E /I /R /Y
del "F:\odk\survey\forms\convertToLegacy.hta"
del "F:\odk\survey\forms\copy.bat"
del "F:\odk\survey\forms\copyMnt.bat"
echo # %DATE% %TIME% >> "F:\odk\survey\framework\default\manifest.appcache"
# pause 'Hit enter to continue'