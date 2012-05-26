#!/usr/bin/perl

&init_log;
&retrieve_post;
&init_meta;
&create_project;
&general_modify_project;
&function_activity_launcher;
#&build_and_sign;
#&offer_download;
#&clear;

sub init_log {
	$LOG_DIR = "logs";
	if (!(-d $LOG_DIR)) {
		mkdir $LOG_DIR;
	}
	use Date::Format;
	use Time::ParseDate;
	$time=time2str("%Y%m%d",parsedate(today));
	$LOG_FILE = "$LOG_DIR/$time.log";
}

sub retrieve_post {
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
}

sub init_meta {	
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
	$PROJ_PKG = "aaww.".$json_obj->{author}.".$PROJ_NAME";
	$PROJ_PKG =~ s/(\w+)/lc($1)/ge;			# to lower case
	$PROJ_PKG =~ s/ //g;				# remove spaces
	$PROJ_ACT = "MainActivity";
	$PROJ_SRC_PATH = "$PROJ_PATH/src/$PROJ_PKG";
	$PROJ_SRC_PATH =~ s/\./\//g;
}

sub create_project {
	# create project
	$cmd = "date >> $LOG_FILE && ../android-sdk-linux/tools/android create project --name $PROJ_NAME --target $PROJ_TARGET --path $PROJ_PATH --package $PROJ_PKG --activity $PROJ_ACT >> $LOG_FILE";
	`$cmd`;
}

sub general_modify_project {
	
	# edit AndroidManifest.xml
	$manifest = "$PROJ_PATH/AndroidManifest.xml";
	open(MANIFEST, $manifest);
	@manifest_string = <MANIFEST>;
	close(MANIFEST);
	$new_manifest_string = "";
	foreach $manifest_line (@manifest_string) {
		if ($manifest_line =~ /android.intent.action.MAIN/) {
			$new_manifest_string .= '			<action android:name="android.appwidget.action.APPWIDGET_CONFIGURE" />'."\n";
			next;
		}
		if ($manifest_line =~ /android.intent.category.LAUNCHER/) {
			next;
		}

		$new_manifest_string .= $manifest_line;

		if ($manifest_line =~ /<\/activity>/) {
			$new_manifest_string .= '        <receiver android:name=".WidgetProvider">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE"/>
            </intent-filter>
            <meta-data android:resource="@xml/widget_provider" android:name="android.appwidget.provider"/>
        </receiver>'."\n";
			next;
		}
	}
	open(MANIFEST, ">$manifest");
	print MANIFEST ($new_manifest_string);
	close(MANIFEST);

	# edit MainActivity.java
	$main = "$PROJ_SRC_PATH/MainActivity.java";
	open(MAIN, $main);
	@main_string = <MAIN>;
	close(MAIN);
	$new_main_string = "";
	foreach $main_line (@main_string) {
		if ($main_line =~ /import/) {
			next;
		}
		if ($main_line =~ /setContentView/) {
			$new_main_string .= '        init();
        configure();'."\n";
			next;
		}
		if ($main_line =~ /Called when the activity is first created/) {
			$new_main_string .= '	final static String SETTINGS_PREF = "settings_";
	//== define fields here ==
	int mAppWidgetId;
	int cConfigured;

	void init() {
		Intent intent = getIntent();
		Bundle extras = intent.getExtras();
		if (extras != null) {
		    mAppWidgetId = extras.getInt(
		            AppWidgetManager.EXTRA_APPWIDGET_ID, 
		            AppWidgetManager.INVALID_APPWIDGET_ID);
		}
		cConfigured = 0;
	}

	void finishOneConfiguration() {
		cConfigured--;
		if (cConfigured == 0) respond();
	}

	void configure() {
		if (cConfigured == 0) respond();
		//== configure functions here ==
	}

	void respond() {

		AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(this);
		RemoteViews views = new RemoteViews(getPackageName(), R.layout.main);
	
		//== resolve functions here ==	
		
		appWidgetManager.updateAppWidget(mAppWidgetId, views);
		
		Intent resultValue = new Intent();
		resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, mAppWidgetId);
		setResult(RESULT_OK, resultValue);
		finish();
	}'."\n\n";
		}

		$new_main_string .= $main_line;
		
		if ($main_line =~ /package/) {
			$new_main_string .= '
import java.util.ArrayList;
import java.util.List;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.RemoteViews;
import android.widget.TextView;'."\n";
			next;
		}
	}
	open(MAIN, ">$main");
	print MAIN ($new_main_string);
	close(MAIN);

	# edit strings.xml
	$string = "$PROJ_PATH/res/values/strings.xml";
	open(STRING, $string);
	@string_string = <STRING>;
	close(STRING);
	$new_string_string = "";
	foreach $string_line (@string_string) {
		$string_line =~ s/$PROJ_ACT/$PROJ_NAME/g;
		$new_string_string .= $string_line;
	}
	open(STRING, ">$string");
	print STRING ($new_string_string);
	close(STRING);

	# replace main.xml
	$layout = "$PROJ_PATH/res/layout/main.xml";
	$new_layout_string = $json_obj->{layout};
	open(LAYOUT, ">$layout");
	print LAYOUT ($new_layout_string);
	close(LAYOUT);

	# add widget_provider.xml
	$xml_dir = "$PROJ_PATH/res/xml";
	if (!(-d $xml_dir)) {
		mkdir $xml_dir;
	}
	$provider = "$xml_dir/widget_provider.xml";
	$new_provider_string = '<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android" 
    android:initialLayout="@layout/main" 
    android:minWidth="MIN_WIDTHdp" 
    android:minHeight="MIN_HEIGHTdp"
    android:configure="PKG.MainActivity"/>'."\n";
	$new_provider_string =~ s/PKG/$PROJ_PKG/g;
	$min_width = $json_obj->{col} * 70 - 30;
	$new_provider_string =~ s/MIN_WIDTH/$min_width/g;
	$min_height = $json_obj->{row} * 70 - 30;
	$new_provider_string =~ s/MIN_HEIGHT/$min_height/g;
	open(PROVIDER, ">$provider");
	print PROVIDER ($new_provider_string);
	close(PROVIDER);

	# copy necessary drawables
	$drawable_dir = "$PROJ_PATH/res/drawable";
	if (!(-d $drawable_dir)) {
		mkdir $drawable_dir;
	}
	for $pic (@{$json_obj->{pics}}) {
		`cp ../web_design/upload/$pic $drawable_dir/$pic`;
	}

	# add WidgetProvider.java
	$provider = "$PROJ_SRC_PATH/WidgetProvider.java";
	$new_provider_string = 'package PKG;

import android.appwidget.AppWidgetProvider;
import android.content.Context;

public class WidgetProvider extends AppWidgetProvider {

	@Override
	public void onDeleted(Context context, int[] appWidgetIds) {
		super.onDeleted(context, appWidgetIds);
		for (int id : appWidgetIds) {
			context.getSharedPreferences(MainActivity.SETTINGS_PREF+id,
					Context.MODE_PRIVATE).edit().clear().commit();
		}
	}
}'."\n";	
	$new_provider_string =~ s/PKG/$PROJ_PKG/g;
	open(PROVIDER, ">$provider");
	print PROVIDER ($new_provider_string);
	close(PROVIDER);
}

sub function_activity_launcher {	
}

sub build_and_sign {
	# build
	`date >> $LOG_FILE && cd $PROJ_PATH && ant release >> ../$LOG_FILE`;
	# sign
	`date >> $LOG_FILE && jarsigner -verbose -sigalg MD5withRSA -digestalg SHA1 -storepass aaww123 -keystore aaww.keystore $PROJ_PATH/bin/$PROJ_NAME-unsigned.apk aaww >> $LOG_FILE`;
}

sub offer_download {
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
}

sub clear {
	`date >> $LOG_FILE`;
	open(LOG, ">>$LOG_FILE");
	print LOG ("Download link provided. Now we'll remove project directories.\n");
	
	`date >> $LOG_FILE && rm -r $PROJ_PATH`;
	print LOG ("Project directories removed.\n");
	close(LOG);
}
