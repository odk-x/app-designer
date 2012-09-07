rmdir /s /q C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\collect"
rmdir /s /q C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\json-media"
xcopy . "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs" /E /I /R /Y
del "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\copy.bat"
del "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\copyMnt.bat"
echo # %DATE% %TIME% >> "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\collect\manifest.appcache"
# pause 'Hit enter to continue'