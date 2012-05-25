#!/usr/bin/perl

$LOG_DIR = "aaww_logs";
if (!(-d $LOG_DIR)) {
	mkdir $LOG_DIR;
}
use Date::Format;
use Time::ParseDate;
$time=time2str("%Y%m%d",parsedate(today));
$LOG_FILE = "$LOG_DIR/$time.log";

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
#use Data::Dumper;
#print Dumper($json_obj);

# get project meta data
$PROJ_NAME = $json_obj->{name};
$PROJ_NAME =~ s/(\w+)/ucfirst(lc($1))/ge;	# uppercase first letter, and lowercase all other letters
$PROJ_NAME =~ s/ //g;				# remove spaces
$PROJ_TARGET = "2";
$PROJ_PATH = "$PROJ_NAME";
$PROJ_PKG = "aaww.".$json_obj->{author};
$PROJ_PKG =~ s/(\w+)/lc($1)/ge;			# to lower case
$PROJ_PKG =~ s/ //g;				# remove spaces
$PROJ_ACT = "MainActivity";

# create project
$cmd = "date >> $LOG_FILE && ../android-sdk-linux/tools/android create project --name $PROJ_NAME --target $PROJ_TARGET --path $PROJ_PATH --package $PROJ_PKG --activity $PROJ_ACT >> $LOG_FILE";
`$cmd`;

# build
`date >> $LOG_FILE && cd $PROJ_PATH && ant release >> ../$LOG_FILE`;
# sign
`date >> $LOG_FILE && jarsigner -verbose -sigalg MD5withRSA -digestalg SHA1 -storepass aaww123 -keystore aaww.keystore $PROJ_PATH/bin/$PROJ_NAME-unsigned.apk aaww >> $LOG_FILE`;

#######################################################
# Now that we have built an *.apk package, we'll offer
# the file download.
#######################################################
# HTTP Header
print "Content-Type:application/octet-stream; name=\"$PROJ_NAME.apk\"\r\n";
print "Content-Disposition: attachment; filename=\"$PROJ_NAME.apk\"\r\n\n";
# Actual File Content will go hear.
open(FILE, "<$PROJ_PATH/bin/$PROJ_NAME-unsigned.apk");
while(read(FILE, $buffer, 100)) {
   print("$buffer");
}
#######################################################

`date >> $LOG_FILE`;
open(LOG, ">>$LOG_FILE");
print LOG ("Download link provided. Now we'll remove project directories.\n");

`date >> $LOG_FILE && rm -r $PROJ_PATH`;
print LOG ("Project directories removed.\n");
