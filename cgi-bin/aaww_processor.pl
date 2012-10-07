#!/usr/bin/perl

$ENV{'JAVA_HOME'}='/var/www/aaww/jdk1.6.0_35';
$ENV{'CLASSPATH'}=".:$ENV{'JAVA_HOME'}/lib";
$ENV{'PATH'}="$ENV{'PATH'}:$ENV{'JAVA_HOME'}/bin";

$debug = 0; # this flag is set when the script is expected to run on server machine, and cleared when it's expected to run as a CGI script.

&init_log;
&retrieve_post;
&init_meta;
&create_project;
&general_modify_project;
&function_activity_launcher;
&function_web_bookmark;
&function_dial_shortcut;
&function_message_shortcut;
&function_mail_shortcut;
&build_and_sign;
if ($debug == 0) {
	&offer_download;
	&clear;
}

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

	if ($debug == 0) {
		# read submitted form (by POST method) from stdin
		read(STDIN, $buffer, $ENV{'CONTENT_LENGTH'});
		# split information into name/value pairs
		@pairs = split(/&/, $buffer);
		foreach $pair (@pairs) {
			($name, $value) = split(/=/, $pair);
			$value =~ tr/+/ /;
			$value =~ s/%(..)/pack("C", hex($1))/eg;
			$FORM{$name} = $value;
		}
		$input_string = $FORM{'aaww_json'};
	} else {
		# for now when the web page hasn't been completed, we'll just get the input from a test file
		open(TEST_INPUT, "test_input.json") || die("cannot open input file");
		@input = <TEST_INPUT>;
		$input_string = join("", @input);
	}
}

sub init_meta {	
	# parse into JSON object
	use JSON;
	$json_obj = decode_json($input_string);

	# get project meta data
	$PROJ_NAME = $json_obj->{name};
	$PROJ_NAME =~ s/(\w+)/ucfirst(lc($1))/ge;	# uppercase first letter, and lowercase all other letters
	$PROJ_NAME =~ s/ //g;				# remove spaces
	$PROJ_TARGET = "1";
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
	`echo "$cmd" >> $LOG_FILE && $cmd`;
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
		if ($manifest_line =~ /<application/) {
			$new_manifest_string .= '    <uses-sdk android:minSdkVersion="7" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>'."\n";
		}

		$new_manifest_string .= $manifest_line;

		if ($manifest_line =~ /<\/activity>/) {
			$tmp = '        <receiver android:name=".WidgetProvider">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE"/>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="PKG.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data android:resource="@xml/widget_provider" android:name="android.appwidget.provider"/>
        </receiver>'."\n";
			$tmp =~ s/PKG/$PROJ_PKG/g;
			$new_manifest_string .= $tmp;
			next;
		}
		if ($manifest_line =~ /android:name=".?MainActivity"/) {
			$new_manifest_string .= '            android:theme="@android:style/Theme.Translucent.NoTitleBar" >'."\n";
			next;
		}
	}
	open(MANIFEST, ">$manifest");
	print MANIFEST ($new_manifest_string);
	close(MANIFEST);

	# edit MainActivity.java
	$main = "$PROJ_SRC_PATH/$PROJ_ACT.java";
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

		WidgetProvider.update(this, mAppWidgetId);
	
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
import android.appwidget.AppWidgetManager;
import android.content.ContentResolver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.database.Cursor;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.provider.ContactsContract;
import android.provider.ContactsContract.PhoneLookup;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.EditText;
import android.widget.ImageView;
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
		`cp ../upload/$pic $drawable_dir/$pic`;
	}

	# add WidgetProvider.java
	$provider = "$PROJ_SRC_PATH/WidgetProvider.java";
	$new_provider_string = 'package PKG;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.net.Uri;
import android.os.SystemClock;
import android.widget.RemoteViews;

public class WidgetProvider extends AppWidgetProvider {

	final static String ACTION_UPDATE = "PKG.APPWIDGET_UPDATE";
	final static long UPDATE_TIME = 5000 * 60; // 5 minutes

	@Override
	public void onEnabled(Context context) {
		// Register an alarm to update reminder every UPDATE_TIME.
		final Intent intent = new Intent(ACTION_UPDATE);
		final PendingIntent pending = PendingIntent.getBroadcast(context, 0,
				intent, 0);
		final AlarmManager alarm = (AlarmManager) context
				.getSystemService(Context.ALARM_SERVICE);
		alarm.setRepeating(AlarmManager.ELAPSED_REALTIME,
				SystemClock.elapsedRealtime(), UPDATE_TIME, pending);
	}

	@Override
	public void onDisabled(Context context) {
		// Cancel registered alarm.
		final Intent intent = new Intent(ACTION_UPDATE);
		final PendingIntent pending = PendingIntent.getBroadcast(context, 0,
				intent, 0);
		final AlarmManager alarm = (AlarmManager) context
				.getSystemService(Context.ALARM_SERVICE);
		alarm.cancel(pending);
	}

	@Override
	public void onDeleted(Context context, int[] appWidgetIds) {
		super.onDeleted(context, appWidgetIds);
		for (int id : appWidgetIds) {
			context.getSharedPreferences(MainActivity.SETTINGS_PREF+id,
					Context.MODE_PRIVATE).edit().clear().commit();
		}
	}
	
	@Override
	public void onReceive(Context context, Intent intent) {
		String action = intent.getAction();
		if (action == ACTION_UPDATE || action == Intent.ACTION_BOOT_COMPLETED) {
			AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
			ComponentName cn = new ComponentName(context, WidgetProvider.class);
			int ids[] = appWidgetManager.getAppWidgetIds(cn);
			for (int id : ids) {
				update(context, id);
			}
		}
	}
	
	static void update(Context context, int appWidgetId) {

		AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
		RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.main);
		
		//== resolve functions here ==
		
		appWidgetManager.updateAppWidget(appWidgetId, views);
	}
}'."\n";	
	$new_provider_string =~ s/PKG/$PROJ_PKG/g;
	open(PROVIDER, ">$provider");
	print PROVIDER ($new_provider_string);
	close(PROVIDER);
}

sub function_activity_launcher {	

	@launchers = @{$json_obj->{activity_launcher}};
	if (@launchers == 0) {
		return;
	}

	# edit MainActivity.java
	$main = "$PROJ_SRC_PATH/$PROJ_ACT.java";
	open(MAIN, $main);
	@main_string = <MAIN>;
	close(MAIN);
	$new_main_string = "";
	foreach $main_line (@main_string) {
		if ($main_line =~ /\/\/== define fields here ==/) {
			$new_main_string .= '	final static String LAUNCH_PACKAGE = "launch_package_";'."\n";		
			$new_main_string .= $main_line;
			$tmp = '	final static String mLauncherNames[] = {LAUNCHER_NAMES};
	final static int mLauncherIds[] = {LAUNCHER_IDS};
	final static int mLauncherLinkIds[] = {LINK_IDS};'."\n";
			$launcher_names = join(", ", @launchers);
			$launcher_names =~ s/(\w+)/"$1"/g;
			$tmp =~ s/LAUNCHER_NAMES/$launcher_names/g;
			$launcher_ids = join(", ", @launchers);
			$launcher_ids =~ s/(\w+)/R.id.$1/g;
			$tmp =~ s/LAUNCHER_IDS/$launcher_ids/g;
			$links = $json_obj->{link};
			@link_ids = ();
			for ($i = 0; $i < @launchers; $i++) {
				$tag = $links->{$launchers[$i]};
				if ($tag ne "") {
					$link_ids[$i] = "R.id.$tag";
				} else {
					$link_ids[$i] = "0";
				}
			}	
			$link_ids = join(", ", @link_ids);
			$tmp =~ s/LINK_IDS/$link_ids/g;
			$new_main_string .= $tmp;
			next;
		}
		$new_main_string .= $main_line;
		if ($main_line =~ /\/\/== configure functions here ==/) {
			$new_main_string .= '		final PackageManager pm = this.getPackageManager();
		final List<PackageInfo> plist = pm.getInstalledPackages(PackageManager.GET_ACTIVITIES);
		List<PackageInfo> unlaunchable = new ArrayList<PackageInfo>();
		for (int i = 0; i < plist.size(); i++) {
			PackageInfo p = plist.get(i);
			Intent launch = getPackageManager().getLaunchIntentForPackage(p.packageName);
			if (launch == null) {
				unlaunchable.add(p);
			} 
		}
		plist.removeAll(unlaunchable);
		unlaunchable.clear();
		
		for (int i = 0; i < mLauncherIds.length; i++) {
			final String launcherName = mLauncherNames[i];
			
			BaseAdapter adapter = new BaseAdapter() {

				@Override
				public int getCount() {
					return plist.size();
				}

				@Override
				public Object getItem(int position) {
					return plist.get(position);
				}

				@Override
				public long getItemId(int position) {
					return position;
				}

				@Override
				public View getView(int position, View convertView, ViewGroup parent) {
					convertView = LayoutInflater.from(MainActivity.this)
							.inflate(R.layout.app_item, null);
					PackageInfo pi = plist.get(position);
					((ImageView) convertView.findViewById(R.id.app_icon))
						.setImageDrawable(pm.getApplicationIcon(pi.applicationInfo));
					((TextView) convertView.findViewById(R.id.app_name))
						.setText(pm.getApplicationLabel(pi.applicationInfo));
					return convertView;
				}
			};
			AlertDialog.Builder builder = new AlertDialog.Builder(this);
			builder.setAdapter(adapter, new DialogInterface.OnClickListener() {
				
				@Override
				public void onClick(DialogInterface dialog, int which) {
					PackageInfo pi = plist.get(which);
					
					MainActivity.this.getSharedPreferences
						(SETTINGS_PREF+mAppWidgetId, Context.MODE_PRIVATE)
						.edit().putString(LAUNCH_PACKAGE+launcherName,
								pi.packageName).commit();
					
					finishOneConfiguration();
				}
			});
			builder.setCancelable(false);
			
			builder.setTitle("\"" + launcherName + "\" will launch:");
			builder.show();
		}'."\n";
			next;
		}
		if ($main_line =~ /cConfigured = 0;/) {
			$new_main_string .= '		cConfigured += mLauncherIds.length;'."\n";
		}
	}
	open(MAIN, ">$main");
	print MAIN ($new_main_string);
	close(MAIN);

	# edit WidgetProvider.java
	$provider = "$PROJ_SRC_PATH/WidgetProvider.java";
	open(PROVIDER, $provider);
	@provider_string = <PROVIDER>;
	close(PROVIDER);
	$new_provider_string = "";
	foreach $provider_line (@provider_string) {	
		if ($provider_line =~ /\/\/== resolve functions here ==/) {
			$new_provider_string .= '		try {
				
			for (int i = 0; i < MainActivity.mLauncherIds.length; i++) {
				String launcherName = MainActivity.mLauncherNames[i];
				int launcherId = MainActivity.mLauncherIds[i];
				int launcherLinkId = MainActivity.mLauncherLinkIds[i];
				
				String packageName = context.getSharedPreferences(MainActivity.SETTINGS_PREF+appWidgetId,
						Context.MODE_PRIVATE).getString(MainActivity.LAUNCH_PACKAGE+launcherName, null);
				PackageManager packageManager = context.getPackageManager();
				
				Intent intent = packageManager.getLaunchIntentForPackage(packageName);
				String appName = packageManager.getApplicationLabel(packageManager
						.getApplicationInfo(packageName, 0)).toString();
				
				PendingIntent pending = PendingIntent.getActivity(context, 0, intent, 0);
				
				views.setOnClickPendingIntent(launcherId, pending);
				if (launcherLinkId != 0) views.setTextViewText(launcherLinkId, appName);
			}
			
		} catch (NameNotFoundException e) {
			// Should not happen
			e.printStackTrace();
		}
		appWidgetManager.updateAppWidget(appWidgetId, views);'."\n";
		}
		$new_provider_string .= $provider_line;
	}
	open(PROVIDER, ">$provider");
	print PROVIDER ($new_provider_string);
	close(PROVIDER);	

	# add app_item.xml
	$item = "$PROJ_PATH/res/layout/app_item.xml";
	$new_item_string = '<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="fill_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:paddingLeft="10dp"
    android:paddingRight="10dp"
    android:paddingTop="5dp"
    android:paddingBottom="5dp" >
    
    <ImageView
        android:id="@+id/app_icon"
        android:layout_width="30dp"
        android:layout_height="30dp"
        android:scaleType="centerInside" />
    
    <TextView android:id="@+id/app_name"
        android:layout_width="fill_parent"
        android:layout_height="30dp"
        android:gravity="center_vertical"
        android:textSize="10pt"
        android:textColor="#000000"/>

</LinearLayout>'."\n";
	open(ITEM, ">$item");
	print ITEM ($new_item_string);
	close(ITEM);

}

sub function_web_bookmark {
	@bookmarks = @{$json_obj->{web_bookmark}};
	if (@bookmarks == 0) {
		return;
	}

	# edit MainActivity.java
	$main = "$PROJ_SRC_PATH/$PROJ_ACT.java";	
	open(MAIN, $main);
	@main_string = <MAIN>;
	close(MAIN);
	$new_main_string = "";
	foreach $main_line (@main_string) {
		if ($main_line =~ /\/\/== define fields here ==/) {
			$new_main_string .= '	final static String BROWSE_URL = "url_";
	final static String BROWSE_TAG = "tag_";'."\n";
			$new_main_string .= $main_line;
			$tmp = '	final static String mBookmarkNames[] = {BOOKMARK_NAMES};
	final static int mBookmarkIds[] = {BOOKMARK_IDS};
	final static int mBookmarkLinkIds[] = {LINK_IDS};'."\n";
			$bookmark_names = join(", ", @bookmarks);
			$bookmark_names =~ s/(\w+)/"$1"/g;
			$tmp =~ s/BOOKMARK_NAMES/$bookmark_names/g;
			$bookmark_ids = join(", ", @bookmarks);
			$bookmark_ids =~ s/(\w+)/R.id.$1/g;
			$tmp =~ s/BOOKMARK_IDS/$bookmark_ids/g;
			$links = $json_obj->{link};
			@link_ids = ();
			for ($i = 0; $i < @bookmarks; $i++) {
				$tag = $links->{$bookmarks[$i]};
				if ($tag ne "") {
					$link_ids[$i] = "R.id.$tag";
				} else {
					$link_ids[$i] = "0";
				}
			}	
			$link_ids = join(", ", @link_ids);
			$tmp =~ s/LINK_IDS/$link_ids/g;
			$new_main_string .= $tmp;
			next;
		}
		$new_main_string .= $main_line;
		if ($main_line =~ /\/\/== configure functions here ==/) {
			$new_main_string .= '		for (int i = 0; i < mBookmarkIds.length; i++) {
			final String bookmarkName = mBookmarkNames[i];
			
			AlertDialog.Builder builder = new AlertDialog.Builder(this);
			final View view = LayoutInflater.from(this).inflate(R.layout.bookmark_setting, null);
			builder.setView(view);
			builder.setCancelable(false);
			builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
				
				@Override
				public void onClick(DialogInterface dialog, int which) {
					String url = ((EditText)view.findViewById(R.id.url))
							.getText().toString();
					if (!url.startsWith("http://")) url = "http://"+url;
					String tag = ((EditText)view.findViewById(R.id.site_name))
							.getText().toString();
					MainActivity.this.getSharedPreferences
						(SETTINGS_PREF+mAppWidgetId, Context.MODE_PRIVATE).edit()
						.putString(BROWSE_URL+bookmarkName, url)
						.putString(BROWSE_TAG+bookmarkName, tag)
						.commit();
					
					finishOneConfiguration();
				}
			});
			builder.setTitle("\"" + bookmarkName + "\" is a bookmark for:");
			builder.show();
		}'."\n";
			next;
		}	
		if ($main_line =~ /cConfigured = 0;/) {
			$new_main_string .= '		cConfigured += mBookmarkIds.length;'."\n";
		}
	}
	open(MAIN, ">$main");
	print MAIN ($new_main_string);
	close(MAIN);

	# add bookmark_setting.xml
	$setting = "$PROJ_PATH/res/layout/bookmark_setting.xml";
	$new_setting_string = '<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/linearLayout1"
    android:layout_width="fill_parent"
    android:layout_height="fill_parent"
    android:gravity="center_vertical"
    android:orientation="vertical"
    android:paddingLeft="5dp"
    android:paddingRight="5dp" >

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="URL:"
        android:textAppearance="?android:attr/textAppearanceMedium" />

    <EditText
        android:id="@+id/url"
        android:layout_width="fill_parent"
        android:layout_height="wrap_content">

        <requestFocus />
    </EditText>

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Site name:"
        android:textAppearance="?android:attr/textAppearanceMedium" />

    <EditText
        android:id="@+id/site_name"
        android:layout_width="fill_parent"
        android:layout_height="wrap_content" />

</LinearLayout>'."\n";
	open(SETTING, ">$setting");
	print SETTING ($new_setting_string);
	close(SETTING);

	# edit WidgetProvider.java
	$provider = "$PROJ_SRC_PATH/WidgetProvider.java";
	open(PROVIDER, $provider);
	@provider_string = <PROVIDER>;
	close(PROVIDER);
	$new_provider_string = "";
	foreach $provider_line (@provider_string) {
		if ($provider_line =~ /\/\/== resolve functions here ==/) {
			$new_provider_string .= '		for (int i = 0; i < MainActivity.mBookmarkIds.length; i++) {
			String bookmarkName = MainActivity.mBookmarkNames[i];
			int bookmarkId = MainActivity.mBookmarkIds[i];
			int bookmarkLinkId = MainActivity.mBookmarkLinkIds[i];
			
			SharedPreferences pref = context.getSharedPreferences
					(MainActivity.SETTINGS_PREF+appWidgetId,
					Context.MODE_PRIVATE);
			String url = pref.getString(MainActivity.BROWSE_URL+bookmarkName, "");
			String tag = pref.getString(MainActivity.BROWSE_TAG+bookmarkName, "");
			
			Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
			PendingIntent pending = PendingIntent.getActivity(context, 0, intent, 0);
			
			views.setOnClickPendingIntent(bookmarkId, pending);
			if (bookmarkLinkId != 0) views.setTextViewText(bookmarkLinkId, tag);
		}'."\n";
		}
		$new_provider_string .= $provider_line;
	}
	open(PROVIDER, ">$provider");
	print PROVIDER ($new_provider_string);
	close(PROVIDER);
}

sub function_dial_shortcut {

	@dialers = @{$json_obj->{dial_shortcut}};
	if (@dialers == 0) {
		return;
	}

	# edit MainActivity.java
	$main = "$PROJ_SRC_PATH/$PROJ_ACT.java";
	open(MAIN, $main);
	@main_string = <MAIN>;
	close(MAIN);
	$new_main_string = "";
	foreach $main_line (@main_string) {
		if ($main_line =~ /\/\/== define fields here ==/) {
			$new_main_string .= '	final static String DIAL_NAME = "dial_name_";
	final static String DIAL_PHONE = "dial_phone_";'."\n";
			$new_main_string .= $main_line;
			$tmp = '	final static String mDialerNames[] = {DIALER_NAMES};
	final static int mDialerIds[] = {DIALER_IDS};
	final static int mDialerLinkIds[] = {LINK_IDS};'."\n";
			$dialer_names = join(", ", @dialers);
			$dialer_names =~ s/(\w+)/"$1"/g;
			$tmp =~ s/DIALER_NAMES/$dialer_names/g;
			$dialer_ids = join(", ", @dialers);
			$dialer_ids =~ s/(\w+)/R.id.$1/g;
			$tmp =~ s/DIALER_IDS/$dialer_ids/g;
			$links = $json_obj->{link};
			@link_ids = ();
			for ($i = 0; $i < @dialers; $i++) {
				$tag = $links->{$dialers[$i]};
				if ($tag ne "") {
					$link_ids[$i] = "R.id.$tag";
				} else {
					$link_ids[$i] = "0";
				}
			}	
			$link_ids = join(", ", @link_ids);
			$tmp =~ s/LINK_IDS/$link_ids/g;
			$new_main_string .= $tmp;
			next;
		}
		$new_main_string .= $main_line;
		if ($main_line =~ /\/\/== configure functions here ==/) {
			$new_main_string .= '		final List<String> names = new ArrayList<String>();
		final List<String> phones = new ArrayList<String>();
		
        ContentResolver content = this.getContentResolver();  
        Cursor cursor = content.query(ContactsContract.Contacts.CONTENT_URI,
        		null, null, null, "sort_key asc");
        if (cursor != null && cursor.moveToFirst()) {
        	do {
        		String name = cursor.getString(cursor.getColumnIndex(PhoneLookup.DISPLAY_NAME));
                String contactId = cursor.getString(cursor.getColumnIndex(ContactsContract.Contacts._ID));  
                Cursor phoneCursor = content.query(ContactsContract.CommonDataKinds.Phone.CONTENT_URI, null, ContactsContract.CommonDataKinds.Phone.CONTACT_ID + "="+ contactId, null, null);  
                while(phoneCursor.moveToNext()){      
                    String number = phoneCursor.getString(phoneCursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER));  
                    number = number.replace(\' \', \'\\0\');
                    names.add(name);
                    phones.add(number);
                }  
        	} while (cursor.moveToNext());
        	cursor.close();
        }
		
		for (int i = 0; i < mDialerIds.length; i++) {
			final String dialerName = mDialerNames[i];
				
			BaseAdapter adapter = new BaseAdapter() {

				@Override
				public int getCount() {
					return names.size();
				}

				@Override
				public Object getItem(int position) {
					return names.get(position);
				}

				@Override
				public long getItemId(int position) {
					return position;
				}

				@Override
				public View getView(int position, View convertView, ViewGroup parent) {
					convertView = LayoutInflater.from(MainActivity.this)
							.inflate(R.layout.contact_item, null);
					String name = names.get(position);
					String phone = phones.get(position);
					((TextView) convertView.findViewById(R.id.contact_name))
						.setText(name);
					((TextView) convertView.findViewById(R.id.phone_number))
						.setText(phone);
					return convertView;
				}
			};
			AlertDialog.Builder builder = new AlertDialog.Builder(this);
			builder.setAdapter(adapter, new DialogInterface.OnClickListener() {
				
				@Override
				public void onClick(DialogInterface dialog, int which) {
					String name = names.get(which);
					String phone = phones.get(which);
					
					MainActivity.this.getSharedPreferences
						(SETTINGS_PREF+mAppWidgetId, Context.MODE_PRIVATE)
						.edit().putString(DIAL_NAME+dialerName, name)
							   .putString(DIAL_PHONE+dialerName, phone).commit();
					
					finishOneConfiguration();
				}
			});
			builder.setCancelable(false);
			
			builder.setTitle("\"" + dialerName + "\" will dial:");
			builder.show();
		}'."\n";
			next;
		}
		if ($main_line =~ /cConfigured = 0;/) {
			$new_main_string .= '		cConfigured += mDialerIds.length;'."\n";
			next;
		}
	}	
	open(MAIN, ">$main");
	print MAIN ($new_main_string);
	close(MAIN);

	# edit WidgetProvider.java
	$provider = "$PROJ_SRC_PATH/WidgetProvider.java";
	open(PROVIDER, $provider);
	@provider_string = <PROVIDER>;
	close(PROVIDER);
	$new_provider_string = "";
	foreach $provider_line (@provider_string) {
		if ($provider_line =~ /\/\/== resolve functions here ==/) {
			$new_provider_string .= '		for (int i = 0; i < MainActivity.mDialerIds.length; i++) {
			String dialerName = MainActivity.mDialerNames[i];
			int dialerId = MainActivity.mDialerIds[i];
			int dialerLinkId = MainActivity.mDialerLinkIds[i];
			
			SharedPreferences pref = context.getSharedPreferences
					(MainActivity.SETTINGS_PREF+appWidgetId, Context.MODE_PRIVATE);
			String name = pref.getString(MainActivity.DIAL_NAME+dialerName, "");
			String phone = pref.getString(MainActivity.DIAL_PHONE+dialerName, "");
			
			Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:"+phone));
			PendingIntent pending = PendingIntent.getActivity(context, 0, intent, 0);
			
			views.setOnClickPendingIntent(dialerId, pending);
			if (dialerLinkId != 0) views.setTextViewText(dialerLinkId, name);
		}'."\n";
		}
		$new_provider_string .= $provider_line;
	}
	open(PROVIDER, ">$provider");
	print PROVIDER ($new_provider_string);
	close(PROVIDER);	

	# add contact_item.xml
	$item = "$PROJ_PATH/res/layout/contact_item.xml";
	$new_item_string = '<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="fill_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:paddingLeft="10dp"
    android:paddingRight="10dp"
    android:paddingTop="5dp"
    android:paddingBottom="5dp" >

    <TextView
        android:id="@+id/contact_name"
        android:layout_width="40pt"
        android:layout_height="wrap_content"
        android:textColor="#000000"
        android:textSize="10pt" />
    
    <TextView android:id="@+id/phone_number"
        android:layout_width="fill_parent"
        android:layout_height="30dp"
        android:layout_marginLeft="5dp"
        android:gravity="center_vertical"
        android:textSize="10pt"
        android:textColor="#000000"/>

</LinearLayout>'."\n";
	open(ITEM, ">$item");
	print ITEM ($new_item_string);
	close(ITEM);	

	# edit AndroidManifest.xml
	$manifest = "$PROJ_PATH/AndroidManifest.xml";
	open(MANIFEST, $manifest);
	@manifest_string = <MANIFEST>;
	close(MANIFEST);
	$new_manifest_string = "";
	foreach $manifest_line (@manifest_string) {
		if ($manifest_line =~ /<application/) {
			$new_manifest_string .= '    <uses-permission android:name="android.permission.READ_CONTACTS"/>'."\n";
		}
		$new_manifest_string .= $manifest_line;
	}
	open(MANIFEST, ">$manifest");
	print MANIFEST ($new_manifest_string);
	close(MANIFEST);
}

sub function_message_shortcut {

	@texters = @{$json_obj->{message_shortcut}};
	if (@texters == 0) {
		return;
	}

	# edit MainActivity.java
	$main = "$PROJ_SRC_PATH/$PROJ_ACT.java";
	open(MAIN, $main);
	@main_string = <MAIN>;
	close(MAIN);
	$new_main_string = "";
	foreach $main_line (@main_string) {
		if ($main_line =~ /\/\/== define fields here ==/) {
			$new_main_string .= '	final static String TEXT_NAME = "text_name_";
	final static String TEXT_PHONE = "text_phone_";'."\n";
			$new_main_string .= $main_line;
			$tmp = '	final static String mTexterNames[] = {TEXTER_NAMES};
	final static int mTexterIds[] = {TEXTER_IDS};
	final static int mTexterLinkIds[] = {LINK_IDS};'."\n";
			$texter_names = join(", ", @texters);
			$texter_names =~ s/(\w+)/"$1"/g;
			$tmp =~ s/TEXTER_NAMES/$texter_names/g;
			$texter_ids = join(", ", @texters);
			$texter_ids =~ s/(\w+)/R.id.$1/g;
			$tmp =~ s/TEXTER_IDS/$texter_ids/g;
			$links = $json_obj->{link};
			@link_ids = ();
			for ($i = 0; $i < @texters; $i++) {
				$tag = $links->{$texters[$i]};
				if ($tag ne "") {
					$link_ids[$i] = "R.id.$tag";
				} else {
					$link_ids[$i] = "0";
				}
			}	
			$link_ids = join(", ", @link_ids);
			$tmp =~ s/LINK_IDS/$link_ids/g;
			$new_main_string .= $tmp;
			next;
		}
		$new_main_string .= $main_line;
		if ($main_line =~ /\/\/== configure functions here ==/) {
			$new_main_string .= '		final List<String> names = new ArrayList<String>();
		final List<String> phones = new ArrayList<String>();
		
        ContentResolver content = this.getContentResolver();  
        Cursor cursor = content.query(ContactsContract.Contacts.CONTENT_URI,
        		null, null, null, "sort_key asc");
        if (cursor != null && cursor.moveToFirst()) {
        	do {
        		String name = cursor.getString(cursor.getColumnIndex(PhoneLookup.DISPLAY_NAME));
                String contactId = cursor.getString(cursor.getColumnIndex(ContactsContract.Contacts._ID));  
                Cursor phoneCursor = content.query(ContactsContract.CommonDataKinds.Phone.CONTENT_URI, null, ContactsContract.CommonDataKinds.Phone.CONTACT_ID + "="+ contactId, null, null);  
                while(phoneCursor.moveToNext()){      
                    String number = phoneCursor.getString(phoneCursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER));  
                    number = number.replace(\' \', \'\\0\');
                    names.add(name);
                    phones.add(number);
                }  
        	} while (cursor.moveToNext());
        	cursor.close();
        }
		
		for (int i = 0; i < mTexterIds.length; i++) {
			final String texterName = mTexterNames[i];
				
			BaseAdapter adapter = new BaseAdapter() {

				@Override
				public int getCount() {
					return names.size();
				}

				@Override
				public Object getItem(int position) {
					return names.get(position);
				}

				@Override
				public long getItemId(int position) {
					return position;
				}

				@Override
				public View getView(int position, View convertView, ViewGroup parent) {
					convertView = LayoutInflater.from(MainActivity.this)
							.inflate(R.layout.contact_item, null);
					String name = names.get(position);
					String phone = phones.get(position);
					((TextView) convertView.findViewById(R.id.contact_name))
						.setText(name);
					((TextView) convertView.findViewById(R.id.phone_number))
						.setText(phone);
					return convertView;
				}
			};
			AlertDialog.Builder builder = new AlertDialog.Builder(this);
			builder.setAdapter(adapter, new DialogInterface.OnClickListener() {
				
				@Override
				public void onClick(DialogInterface dialog, int which) {
					String name = names.get(which);
					String phone = phones.get(which);
					
					MainActivity.this.getSharedPreferences
						(SETTINGS_PREF+mAppWidgetId, Context.MODE_PRIVATE)
						.edit().putString(TEXT_NAME+texterName, name)
							   .putString(TEXT_PHONE+texterName, phone).commit();
					
					finishOneConfiguration();
				}
			});
			builder.setCancelable(false);
			
			builder.setTitle("\"" + texterName + "\" will text:");
			builder.show();
		}'."\n";
			next;
		}
		if ($main_line =~ /cConfigured = 0;/) {
			$new_main_string .= '		cConfigured += mTexterIds.length;'."\n";
			next;
		}
	}	
	open(MAIN, ">$main");
	print MAIN ($new_main_string);
	close(MAIN);

	# edit WidgetProvider.java
	$provider = "$PROJ_SRC_PATH/WidgetProvider.java";
	open(PROVIDER, $provider);
	@provider_string = <PROVIDER>;
	close(PROVIDER);
	$new_provider_string = "";
	foreach $provider_line (@provider_string) {
		if ($provider_line =~ /\/\/== resolve functions here ==/) {
			$new_provider_string .= '		for (int i = 0; i < MainActivity.mTexterIds.length; i++) {
			String texterName = MainActivity.mTexterNames[i];
			int texterId = MainActivity.mTexterIds[i];
			int texterLinkId = MainActivity.mTexterLinkIds[i];
			
			SharedPreferences pref = context.getSharedPreferences
					(MainActivity.SETTINGS_PREF+appWidgetId, Context.MODE_PRIVATE);
			String name = pref.getString(MainActivity.TEXT_NAME+texterName, "");
			String phone = pref.getString(MainActivity.TEXT_PHONE+texterName, "");
			
			Intent intent = new Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:"+phone));
			PendingIntent pending = PendingIntent.getActivity(context, 0, intent, 0);
			
			views.setOnClickPendingIntent(texterId, pending);
			if (texterLinkId != 0) views.setTextViewText(texterLinkId, name);
		}'."\n";
		}
		$new_provider_string .= $provider_line;
	}
	open(PROVIDER, ">$provider");
	print PROVIDER ($new_provider_string);
	close(PROVIDER);	

	# add contact_item.xml
	$item = "$PROJ_PATH/res/layout/contact_item.xml";
	$new_item_string = '<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="fill_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:paddingLeft="10dp"
    android:paddingRight="10dp"
    android:paddingTop="5dp"
    android:paddingBottom="5dp" >

    <TextView
        android:id="@+id/contact_name"
        android:layout_width="40pt"
        android:layout_height="wrap_content"
        android:textColor="#000000"
        android:textSize="10pt" />
    
    <TextView android:id="@+id/phone_number"
        android:layout_width="fill_parent"
        android:layout_height="30dp"
        android:layout_marginLeft="5dp"
        android:gravity="center_vertical"
        android:textSize="10pt"
        android:textColor="#000000"/>

</LinearLayout>'."\n";
	open(ITEM, ">$item");
	print ITEM ($new_item_string);
	close(ITEM);	

	# edit AndroidManifest.xml
	$manifest = "$PROJ_PATH/AndroidManifest.xml";
	open(MANIFEST, $manifest);
	@manifest_string = <MANIFEST>;
	close(MANIFEST);
	$new_manifest_string = "";
	foreach $manifest_line (@manifest_string) {
		if ($manifest_line =~ /<application/) {
			$new_manifest_string .= '    <uses-permission android:name="android.permission.READ_CONTACTS"/>'."\n";
		}
		$new_manifest_string .= $manifest_line;
	}
	open(MANIFEST, ">$manifest");
	print MANIFEST ($new_manifest_string);
	close(MANIFEST);
}

sub function_mail_shortcut {
	@mailers = @{$json_obj->{mail_shortcut}};
	if (@mailers == 0) {
		return;
	}

	# edit MainActivity.java
	$main = "$PROJ_SRC_PATH/$PROJ_ACT.java";	
	open(MAIN, $main);
	@main_string = <MAIN>;
	close(MAIN);
	$new_main_string = "";
	foreach $main_line (@main_string) {
		if ($main_line =~ /\/\/== define fields here ==/) {
			$new_main_string .= '	final static String MAIL_ADDR = "mail_addr_";
	final static String MAIL_NAME = "mail_name";'."\n";
			$new_main_string .= $main_line;
			$tmp = '	final static String mMailerNames[] = {MAILER_NAMES};
	final static int mMailerIds[] = {MAILER_IDS};
	final static int mMailerLinkIds[] = {LINK_IDS};'."\n";
			$mailer_names = join(", ", @mailers);
			$mailer_names =~ s/(\w+)/"$1"/g;
			$tmp =~ s/MAILER_NAMES/$mailer_names/g;
			$mailer_ids = join(", ", @mailers);
			$mailer_ids =~ s/(\w+)/R.id.$1/g;
			$tmp =~ s/MAILER_IDS/$mailer_ids/g;
			$links = $json_obj->{link};
			@link_ids = ();
			for ($i = 0; $i < @mailers; $i++) {
				$tag = $links->{$mailers[$i]};
				if ($tag ne "") {
					$link_ids[$i] = "R.id.$tag";
				} else {
					$link_ids[$i] = "0";
				}
			}	
			$link_ids = join(", ", @link_ids);
			$tmp =~ s/LINK_IDS/$link_ids/g;
			$new_main_string .= $tmp;
			next;
		}
		$new_main_string .= $main_line;
		if ($main_line =~ /\/\/== configure functions here ==/) {
			$new_main_string .= '		for (int i = 0; i < mMailerIds.length; i++) {
			final String mailerName = mMailerNames[i];
			
			AlertDialog.Builder builder = new AlertDialog.Builder(this);
			final View view = LayoutInflater.from(this).inflate(R.layout.mail_setting, null);
			builder.setView(view);
			builder.setCancelable(false);
			builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
				
				@Override
				public void onClick(DialogInterface dialog, int which) {
					String addr = ((EditText)view.findViewById(R.id.mail_addr))
							.getText().toString();
					String tag = ((EditText)view.findViewById(R.id.mail_name))
							.getText().toString();
					MainActivity.this.getSharedPreferences
						(SETTINGS_PREF+mAppWidgetId, Context.MODE_PRIVATE).edit()
						.putString(MAIL_ADDR+mailerName, addr)
						.putString(MAIL_NAME+mailerName, tag)
						.commit();	
					finishOneConfiguration();
				}
			});
			builder.setTitle("\"" + mailerName + "\" will mail:");
			builder.show();
		}'."\n";
			next;
		}	
		if ($main_line =~ /cConfigured = 0;/) {
			$new_main_string .= '		cConfigured += mMailerIds.length;'."\n";
		}
	}
	open(MAIN, ">$main");
	print MAIN ($new_main_string);
	close(MAIN);

	# add mail_setting.xml
	$setting = "$PROJ_PATH/res/layout/mail_setting.xml";
	$new_setting_string = '<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/linearLayout1"
    android:layout_width="fill_parent"
    android:layout_height="fill_parent"
    android:gravity="center_vertical"
    android:orientation="vertical"
    android:paddingLeft="5dp"
    android:paddingRight="5dp" >

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="E-mail address:"
        android:textAppearance="?android:attr/textAppearanceMedium" />

    <EditText
        android:id="@+id/mail_addr"
        android:layout_width="fill_parent"
        android:layout_height="wrap_content">

        <requestFocus />
    </EditText>

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Who is this?"
        android:textAppearance="?android:attr/textAppearanceMedium" />

    <EditText
        android:id="@+id/mail_name"
        android:layout_width="fill_parent"
        android:layout_height="wrap_content" />

</LinearLayout>'."\n";
	open(SETTING, ">$setting");
	print SETTING ($new_setting_string);
	close(SETTING);

	# edit WidgetProvider.java
	$provider = "$PROJ_SRC_PATH/WidgetProvider.java";
	open(PROVIDER, $provider);
	@provider_string = <PROVIDER>;
	close(PROVIDER);
	$new_provider_string = "";
	foreach $provider_line (@provider_string) {
		if ($provider_line =~ /\/\/== resolve functions here ==/) {
			$new_provider_string .= '		for (int i = 0; i < MainActivity.mMailerIds.length; i++) {
			String mailerName = MainActivity.mMailerNames[i];
			int mailerId = MainActivity.mMailerIds[i];
			int mailerLinkId = MainActivity.mMailerLinkIds[i];
			
			SharedPreferences pref = context.getSharedPreferences
					(MainActivity.SETTINGS_PREF+appWidgetId,
					Context.MODE_PRIVATE);
			String addr = pref.getString(MainActivity.MAIL_ADDR+mailerName, "");
			String tag = pref.getString(MainActivity.MAIL_NAME+mailerName, "");
			
			Intent intent = new Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:"+addr));
			PendingIntent pending = PendingIntent.getActivity(context, 0, intent, 0);
			
			views.setOnClickPendingIntent(mailerId, pending);
			if (mailerLinkId != 0) views.setTextViewText(mailerLinkId, tag);
		}'."\n";
		}
		$new_provider_string .= $provider_line;
	}
	open(PROVIDER, ">$provider");
	print PROVIDER ($new_provider_string);
	close(PROVIDER);
}
sub build_and_sign {
	# build
	`date >> $LOG_FILE && cd $PROJ_PATH && ant release >> ../$LOG_FILE`;
	# sign
	`date >> $LOG_FILE && jarsigner -verbose -sigalg MD5withRSA -digestalg SHA1 -storepass aaww123 -keystore aaww.keystore $PROJ_PATH/bin/$PROJ_NAME-release-unsigned.apk aaww >> $LOG_FILE`;
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
	open(FILE, "<$PROJ_PATH/bin/$PROJ_NAME-release-unsigned.apk");
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
