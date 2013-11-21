rmdir /S /Q F:\odk\survey\framework\"
rmdir /S /Q F:\odk\survey\tables\"
rmdir /S /Q F:\odk\survey\forms\"
rmdir /S /Q F:\odk\survey\metadata\"
rmdir /S /Q F:\odk\survey\logging\"
rmdir /S /Q F:\odk\survey\framework.old\"
rmdir /S /Q F:\odk\survey\forms.old\"
xcopy . "F:\odk\survey\" /E /I /R /Y
del "F:\odk\survey\copy.bat"
del "F:\odk\survey\copyMnt.bat"
del "F:\odk\survey\convertToLegacy.hta"
del "F:\odk\survey\adbpush.bat"
echo # %DATE% %TIME% >> "F:\odk\survey\framework\manifest.appcache"
# pause 'Hit enter to continue'
