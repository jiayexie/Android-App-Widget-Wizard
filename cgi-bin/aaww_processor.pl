#!/usr/bin/perl

$LOG_DIR = "aaww_logs";
if (!(-d $LOG_DIR)) {
	mkdir $LOG_DIR;
}
use Date::Format;
use Time::ParseDate;
$time=time2str("%Y%m%d",parsedate(today));
$LOG_FILE = "$LOG_DIR/$time.log";

print "Content-type: text/html\n\n";

print "<html><head><title>Hello, World!</title></head>";
print "<body>";
print "<h2>Hello World!</h2>";

#######################################################
# Handling input from POST.
#######################################################
# read submitted form (by POST method) from stdin
#read(STDIN, $buffer, $ENV{'CONTENT_LENGTH'});
# split information into name/value pairs
#@pairs = split(/&/, $buffer);
#foreach $pair (@pairs) {
#	($name, $value) = split(/=/, $pair);
#	$value =~ tr/+/ /;
#	$value =~ s/%(..)/pack("C", hex($1))/eg;
#	$FORM{$name} = $value;
#	print("$name: $value");
#}
#######################################################

# for now when the web page hasn't been completed, we'll just get the input from a test file
open(TEST_INPUT, "test_input.json") || die("cannot open input file");
@input = <TEST_INPUT>;
$input_string = join("", @input);

# parse into JSON object
use JSON;
$json_obj = decode_json($input_string);

$PROJ_NAME = $json_obj->{name};
$PROJ_NAME =~ s/(\w+)/ucfirst(lc($1))/ge;
$PROJ_TARGET = "2";
$PROJ_PATH = "$PROJ_NAME";
$PROJ_PKG = "aaww.".$json_obj->{author};
$PROJ_PKG =~ s/ //g;
$PROJ_ACT = "MainActivity";

$cmd = "date >> $LOG_FILE && ../android-sdk-linux/tools/android create project --name $PROJ_NAME --target $PROJ_TARGET --path $PROJ_PATH --package $PROJ_PKG --activity $PROJ_ACT >> $LOG_FILE";
`$cmd`;
#print "$cmd\n";


print "</body></html>";
