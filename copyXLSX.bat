rmdir /s /q C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\XLSX\"
xcopy .\app\xlsxconverter "C:\Program Files\Apache Software Foundation\Apache2.4\htdocs\XLSX" /E /I /R /Y
# pause 'Hit enter to continue'