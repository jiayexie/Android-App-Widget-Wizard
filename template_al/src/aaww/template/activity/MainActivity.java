package aaww.template.activity;

import java.util.ArrayList;
import java.util.List;

import android.app.Activity;
import android.app.AlertDialog;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.TextView;

public class MainActivity extends Activity {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // setContentView(R.layout.main); // deleted
        
        // add the following 2 lines:
        init();
        configure();
    }
    
    //==================== added beg ======================
	final static String SETTINGS_PREF = "settings_";
	final static String LAUNCH_PACKAGE = "launch_package_";
	//== define fields here ==
	int mAppWidgetId;
	int cConfigured;

	final static String mLauncherNames[] = {"image"};
	final static int mLauncherIds[] = {R.id.image};
	final static int mLauncherLinkIds[] = {R.id.tag};
	
	void init() {
		Intent intent = getIntent();
		Bundle extras = intent.getExtras();
		if (extras != null) {
		    mAppWidgetId = extras.getInt(
		            AppWidgetManager.EXTRA_APPWIDGET_ID, 
		            AppWidgetManager.INVALID_APPWIDGET_ID);
		}
		cConfigured = 0;
		cConfigured += mLauncherIds.length;
	}

	void finishOneConfiguration() {
		cConfigured--;
		if (cConfigured == 0) respond();
	}
	
	void configure() {
		if (cConfigured == 0) respond();
		
		final PackageManager pm = this.getPackageManager();
		final List<PackageInfo> plist = pm.getInstalledPackages(PackageManager.GET_ACTIVITIES);
		List<PackageInfo> unlaunchable = new ArrayList<PackageInfo>();
		for (int i = 0; i < plist.size(); i++) {
			PackageInfo p = plist.get(i);
			Intent launch = getPackageManager().getLaunchIntentForPackage(p.packageName);
			if (launch == null)
				unlaunchable.add(p); 
			else
				Log.i("packages", p.packageName+":"+launch);
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
		}
	}
	
	void respond() {
		
		WidgetProvider.update(this, mAppWidgetId);
		
		Intent resultValue = new Intent();
		resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, mAppWidgetId);
		setResult(RESULT_OK, resultValue);
		finish();
	}
    
    //==================== added end ======================
}