#!/bin/bash

# Parse arguments
while getopts ':s:t:' opt; do
  case $opt in
    s)
      surveyCopyPath=${OPTARG}
      ;;
    t)
      tablesCopyPath=${OPTARG}
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done

# Build temp file structure
rm -rf tempZipDir

mkdir tempZipDir
mkdir tempZipDir/surveyDir
mkdir tempZipDir/surveyDir/config
mkdir tempZipDir/surveyDir/config/assets
mkdir tempZipDir/surveyDir/config/assets/css
mkdir tempZipDir/surveyDir/config/assets/framework
mkdir tempZipDir/surveyDir/config/assets/img

mkdir tempZipDir/surveyDir/system
mkdir tempZipDir/surveyDir/system/js
mkdir tempZipDir/surveyDir/system/libs
mkdir tempZipDir/surveyDir/system/survey
mkdir tempZipDir/surveyDir/system/survey/js
mkdir tempZipDir/surveyDir/system/survey/templates


# Move all the necessary Survey config files over
# Survey config CSS files
cp app/config/assets/css/odk-survey.css tempZipDir/surveyDir/config/assets/css/odk-survey.css

# Survey config frameowrk files
cp -r app/config/assets/framework/* tempZipDir/surveyDir/config/assets/framework

# Survey config img files
cp app/config/assets/img/advance.png tempZipDir/surveyDir/config/assets/img/advance.png
cp app/config/assets/img/backup.png tempZipDir/surveyDir/config/assets/img/backup.png
cp app/config/assets/img/form_logo.png tempZipDir/surveyDir/config/assets/img/form_logo.png
cp app/config/assets/img/play.png tempZipDir/surveyDir/config/assets/img/play.png

#Move all the necessary Survey system files over
cp app/system/index.html tempZipDir/surveyDir/system/index.html

# Survey system js files
cp -r app/system/js/* tempZipDir/surveyDir/system/js

# Survey system libs files
cp -r app/system/libs/* tempZipDir/surveyDir/system/libs

# Survey system survey files
cp -r app/system/survey/js/* tempZipDir/surveyDir/system/survey/js
cp -r app/system/survey/templates/* tempZipDir/surveyDir/system/survey/templates

cd tempZipDir/surveyDir
zip -r config.zip config
zip -r system.zip system

mv config.zip configzip
mv system.zip systemzip

if [ $surveyCopyPath ]; then
    cp configzip "$surveyCopyPath"
    cp systemzip "$surveyCopyPath"
fi

cd ../..

mkdir tempZipDir/tablesDir
mkdir tempZipDir/tablesDir/config
mkdir tempZipDir/tablesDir/config/assets
mkdir tempZipDir/tablesDir/config/assets/img
mkdir tempZipDir/tablesDir/config/assets/libs

mkdir tempZipDir/tablesDir/system
mkdir tempZipDir/tablesDir/system/js
mkdir tempZipDir/tablesDir/system/libs
mkdir tempZipDir/tablesDir/system/tables


# Move all the necessary Tables config files over
# Tables config img files
cp app/config/assets/img/little_arrow.png tempZipDir/tablesDir/config/assets/img/little_arrow.png

# Tables config libs files
cp -r app/config/assets/libs/* tempZipDir/tablesDir/config/assets/libs

# Move all the necessary Tables system files over
# Tables system js files
cp -r app/system/js/* tempZipDir/tablesDir/system/js

# Tables system libs files
cp -r app/system/libs/* tempZipDir/tablesDir/system/libs

# Tables system tables files
cp -r app/system/tables/* tempZipDir/tablesDir/system/tables

cd tempZipDir/tablesDir
zip -r config.zip config
zip -r system.zip system

mv config.zip configzip
mv system.zip systemzip

if [ "$tablesCopyPath" ]; then
    cp configzip "$tablesCopyPath"
    cp systemzip "$tablesCopyPath"
fi

cd ../..



