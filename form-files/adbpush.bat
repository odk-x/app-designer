rem commands to push files to the default survey app...
adb shell rm -r /sdcard/odk/survey/
adb shell mkdir /sdcard/odk/survey/
adb push framework /sdcard/odk/survey/framework
adb push tables /sdcard/odk/survey/tables
