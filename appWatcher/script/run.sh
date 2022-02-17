#!/bin/
set -x
work_path=$(cd `dirname $0`; pwd)
rm -rf $work_path/../../appWatcher_temp
cp -r -f $work_path/../../appWatcher $work_path/../../appWatcher_temp
# echo $work_path
lc_work_path=$work_path/../../appWatcher_temp
lib_work_path=$work_path/../../appWatcherlib

$work_path/HYCodeScan.app/Contents/MacOS/HYCodeScan --redefine -i $lc_work_path/appData/Classes/DataApplication.h -i $lc_work_path/appData/Classes/Obfuscation_PCH.h
# $work_path/HYCodeScan.app/Contents/MacOS/HYCodeScan --xcode --config $work_path/appConfig.json -p $lc_work_path/Example/Pods/Pods.xcodeproj

cp -rf $lc_work_path/appData/Classes/DataApplication.h $lc_work_path/Example/Pods/Headers/Public/appData/

xcodebuild -workspace $lc_work_path/Example/appData.xcworkspace -scheme appData-Example -sdk iphonesimulator -configuration Release build -jobs 8
xcodebuild -workspace $lc_work_path/Example/appData.xcworkspace -scheme appData-Example -sdk iphoneos -configuration Release build -jobs 8

sh $lib_work_path/updateVersion.sh

productFolder="Example/Pods/Products/appData"
for i in `ls $lc_work_path/$productFolder`; do
cp -rf $lc_work_path/$productFolder/$i $lib_work_path/lib/
done

cp -rf $lc_work_path/appData/Classes/DataApplication.h $lib_work_path/lib/

function comit()
{
	cd $lib_work_path
	git add -u && git commit -m 'autobuild' && git push origin master
}

comit

sh $work_path/clean.sh
