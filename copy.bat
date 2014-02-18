rmdir /S /Q "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\FORM\"
xcopy app "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\FORM" /E /I /R /Y
del "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\FORM\copy.bat"
del "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\FORM\copyMnt.bat"
del "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\FORM\convertToLegacy.hta"
del "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\FORM\adbpush.bat"
echo # %DATE% %TIME% >> "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\FORM\framework\manifest.appcache"
rmdir /S /Q "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\XLSX\"
xcopy xlsxconverter\WebContent "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\XLSX" /E /I /R /Y
# pause 'Hit enter to continue'