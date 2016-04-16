TEMPDEF="/definition.csv"
TEMPPROP="/properties.csv"
for f in app/config/tables/*/*.csv
do
    x=$f
    P=${x%.csv}
    FILENAME="${P##*/}"
    P="${f%/*.csv}"
    FOLDERNAME="${P##*/}"
    TEMP2="${f%/*.csv}"
        if [ -f $TEMP2$TEMPDEF ]; then
            rm $TEMP2$TEMPDEF
        fi
        if [ -f $TEMP2$TEMPPROP ]; then
            rm $TEMP2$TEMPPROP
        fi
done       
