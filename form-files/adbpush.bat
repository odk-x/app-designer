rem commands to push files to the default survey app...
adb shell rm -r /sdcard/opendatakit/survey/
adb shell mkdir /sdcard/opendatakit/survey/
adb push framework /sdcard/opendatakit/survey/framework
adb push tables /sdcard/opendatakit/survey/tables
