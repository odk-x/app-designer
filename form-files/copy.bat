rmdir /s /q C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\FORM\collect"
rmdir /s /q C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\FORM\json-media"
rmdir /s /q C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\FORM\lgform"
rmdir /s /q C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\FORM\example"
xcopy . "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\FORM" /E /I /R /Y
del "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\FORM\copy.bat"
del "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\FORM\copyMnt.bat"
echo # %DATE% %TIME% >> "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\FORM\collect\manifest.appcache"
# pause 'Hit enter to continue'