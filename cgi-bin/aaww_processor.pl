#!/usr/bin/perl

$LOG_DIR = "aaww_logs";
if (!(-d $LOG_DIR)) {
	mkdir $LOG_DIR;
}
$LOG_FILE = "$LOG_DIR/".localtime(time);

print "Content-type: text/html\n\n";

print "<html><head><title>Hello, World!</title></head>";
print "<body>";
print "<h2>Hello World!</h2>";

$PROJ_NAME = "TestProject";
$PROJ_TARGET = "1";
$PROJ_PATH = "$PROJ_NAME";
$PROJ_PKG = "aaww.test";
$PROJ_ACT = "MainActivity";

$cmd = "../android-sdk-linux/tools/android create project --name $PROJ_NAME --target $PROJ_TARGET --path $PROJ_PATH --package $PROJ_PKG --activity $PROJ_ACT >> $LOG_FILE";
system($cmd);



print "</body></html>";
