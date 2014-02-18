rem commands to push files to the default survey app...
rem adb shell pm install -r package:org.opendatakit.survey.android
adb shell rm -rf /sdcard/opendatakit/survey/
pause
adb shell rm -rf /sdcard/opendatakit/survey/
adb shell mkdir /sdcard/opendatakit/survey/
adb push framework /sdcard/opendatakit/survey/framework
adb push tables /sdcard/opendatakit/survey/tables
pause