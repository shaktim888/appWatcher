set -x
work_path=$(cd `dirname $0`; pwd)

rm -rf $work_path/../../appWatcherlib_temp
cp -r -f $work_path/../../appWatcherlib $work_path/../../appWatcherlib_temp
cd $work_path/../../appWatcherlib

git filter-branch --force --index-filter 'git rm --cached -r --ignore-unmatch lib' --prune-empty --tag-name-filter cat -- --all

git push origin master:master --tags --force

rm -rf $work_path/../../appWatcherlib/lib

cp -r -f $work_path/../../appWatcherlib_temp/lib $work_path/../../appWatcherlib/lib

git add -A && git commit -m 'autoClean' && git push origin master
