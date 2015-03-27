#!/bin/bash
TEMP="/formDef.json"
if [ "$1" ]; then    
    for f in "$@"
    do
        TEMP2="${f%/*.xlsx}"
        if [ -f $TEMP2$TEMP ]; then
            rm $TEMP2$TEMP
        fi
        #base64 $f | /System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Resources/jsc macGenConverter.js  >> $TEMP2$TEMP
        node macGenConverter.js $f >> $TEMP2$TEMP
    done   
else
    for f in app/config/tables/*/forms/*/*.xlsx
    do
        x=$f
        P=${x%.xlsx}
        FILENAME="${P##*/}"
        P="${f%/*.xlsx}"
        FOLDERNAME="${P##*/}"
        TEMP2="${f%/*.xlsx}"
        if [ "$FILENAME" == "$FOLDERNAME" ]; then
            if [ -f $TEMP2$TEMP ]; then
                rm $TEMP2$TEMP
            fi
            #base64 $f | /System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Resources/jsc macGenConverter.js  >> $TEMP2$TEMP
            node macGenConverter.js $f >> $TEMP2$TEMP
        fi
    done
    for f in app/config/assets/framework/forms/framework/framework.xlsx
    do

        TEMP2="${f%/*.xlsx}"
        if [ -f $TEMP2$TEMP ]; then
            rm $TEMP2$TEMP
        fi
        #base64 $f | /System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Resources/jsc macGenConverter.js  >> $TEMP2$TEMP
        node macGenConverter.js $f >> $TEMP2$TEMP
    done        
fi
