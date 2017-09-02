#!/bin/bash

set -e

rootDir=$(pwd)

# Parse arguments
while getopts ':s:t:r:' opt; do
  case $opt in
    s)
      surveyCopyPath=${OPTARG}
      ;;
    t)
      tablesCopyPath=${OPTARG}
      ;;
    r)
      rootDir=${OPTARG}
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
appDir="$rootDir/app"
appConfig="$appDir/config"
appSystem="$appDir/system"
tempZipDir="$rootDir/tempZipDir"
surveyDir="$tempZipDir/surveyDir"
surveyConfig="$surveyDir/config"
surveySystem="$surveyDir/system"
tablesDir="$tempZipDir/tablesDir"
tablesConfig="$tablesDir/config"
tablesSystem="$tablesDir/system"

rm -rf "$tempZipDir"

mkdir "$tempZipDir"
mkdir "$surveyDir"
mkdir "$surveyConfig"
mkdir "$surveyConfig/assets"
mkdir "$surveyConfig/assets/css"
mkdir "$surveyConfig/assets/framework"
mkdir "$surveyConfig/assets/img"

mkdir "$surveySystem"
mkdir "$surveySystem/js"
mkdir "$surveySystem/libs"
mkdir "$surveySystem/survey"
mkdir "$surveySystem/survey/js"
mkdir "$surveySystem/survey/templates"


# Move all the necessary Survey config files over
# Survey config CSS files
cp "$appConfig/assets/css/odk-survey.css" "$surveyConfig/assets/css/odk-survey.css"

# Survey config frameowrk files
cp -r "$appConfig/assets/framework"/* "$surveyConfig/assets/framework"

# Survey config img files
cp "$appConfig/assets/img/advance.png" "$surveyConfig/assets/img/advance.png"
cp "$appConfig/assets/img/backup.png" "$surveyConfig/assets/img/backup.png"
cp "$appConfig/assets/img/form_logo.png" "$surveyConfig/assets/img/form_logo.png"
cp "$appConfig/assets/img/play.png" "$surveyConfig/assets/img/play.png"

#Move all the necessary Survey system files over
cp "$appSystem/index.html" "$surveySystem/index.html"

# Survey system js files
cp -r "$appSystem/js"/* "$surveySystem/js"

# Survey system libs files
cp -r "$appSystem/libs"/* "$surveySystem/libs"

# Survey system survey files
cp -r "$appSystem/survey/js"/* "$surveySystem/survey/js"
cp -r "$appSystem/survey/templates"/* "$surveySystem/survey/templates"

(
  cd "$surveyDir" || exit
  zip -r config.zip config
  zip -r system.zip system
)

mv "$surveyDir/config.zip" "$surveyDir/configzip"
mv "$surveyDir/system.zip" "$surveyDir/systemzip"

if test -n "$surveyCopyPath"; then
    cp "$surveyDir/configzip" "$surveyCopyPath"
    cp "$surveyDir/systemzip" "$surveyCopyPath"
fi

mkdir "$tablesDir"
mkdir "$tablesConfig"
mkdir "$tablesConfig/assets"
mkdir "$tablesConfig/assets/img"
mkdir "$tablesConfig/assets/libs"

mkdir "$tablesSystem"
mkdir "$tablesSystem/js"
mkdir "$tablesSystem/libs"
mkdir "$tablesSystem/tables"


# Move all the necessary Tables config files over
# Tables config img files
cp "$appConfig/assets/img/little_arrow.png" "$tablesConfig/assets/img/little_arrow.png"

# Tables config libs files
cp -r "$appConfig/assets/libs"/* "$tablesConfig/assets/libs"

# Move all the necessary Tables system files over
# Tables system js files
cp -r "$appSystem/js"/* "$tablesSystem/js"

# Tables system libs files
cp -r "$appSystem/libs"/* "$tablesSystem/libs"

# Tables system tables files
cp -r "$appSystem/tables"/* "$tablesSystem/tables"

(
  cd "$tablesDir" || exit
  zip -r config.zip config
  zip -r system.zip system
)

mv "$tablesDir/config.zip" "$tablesDir/configzip"
mv "$tablesDir/system.zip" "$tablesDir/systemzip"

if test -n "$tablesCopyPath"; then
    cp "$tablesDir/configzip" "$tablesCopyPath"
    cp "$tablesDir/systemzip" "$tablesCopyPath"
fi

