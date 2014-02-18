#!/bin/bash
rm -R -v /Library/WebServer/Documents/FORM
mkdir -p /Library/WebServer/Documents/FORM
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $DIR
cp -a -v -R ${DIR}/app/ /Library/WebServer/Documents/FORM
rm /Library/WebServer/Documents/FORM/copy.bat
rm /Library/WebServer/Documents/FORM/copyMnt.bat
rm /Library/WebServer/Documents/FORM/convertToLegacy.hta
rm /Library/WebServer/Documents/FORM/adbpush.bat
echo # %DATE% %TIME% >> /Library/WebServer/Documents/FORM/framework/manifest.appcache
# xlsxconverter has been moved to be under app/
# rm -R -v /Library/WebServer/Documents/XLSX
# mkdir -p /Library/WebServer/Documents/XLSX
# cp -R ${DIR}/xlsxconverter/WebContent /Library/WebServer/Documents/XLSX
# pause 'Hit enter to continue'
