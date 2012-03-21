package aaww.template.activity;

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
	final static String LAUNCH_PACKAGE = "launch_package";
	
	int mAppWidgetId;
	
	void init() {
		Intent intent = getIntent();
		Bundle extras = intent.getExtras();
		if (extras != null) {
		    mAppWidgetId = extras.getInt(
		            AppWidgetManager.EXTRA_APPWIDGET_ID, 
		            AppWidgetManager.INVALID_APPWIDGET_ID);
		}
	}
	
	void configure() {
		final PackageManager pm = this.getPackageManager();
		final List<PackageInfo> plist = pm.getInstalledPackages(PackageManager.GET_ACTIVITIES);
		List<PackageInfo> unlaunchable = new ArrayList<PackageInfo>();
		for (int i = 0; i < plist.size(); i++) {
			PackageInfo p = plist.get(i);
			try {
				Intent launch = getPackageManager().getLaunchIntentForPackage(p.packageName);
				if (launch == null)
					unlaunchable.add(p); 
				else
					Log.i("packages", p.packageName+":"+launch);
			} catch (PackageManager.NameNotFoundException e) {
				unlaunchable.add(p);
			}
		}
		plist.removeAll(unlaunchable);
		unlaunchable.clear();
		
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
					.edit().putString(LAUNCH_PACKAGE, 
							pi.packageName).commit();
				
				respond();
			}
		});
		builder.setOnCancelListener(new DialogInterface.OnCancelListener() {
			
			@Override
			public void onCancel(DialogInterface dialog) {
				respond();
			}
		});
		
		builder.setTitle(getString(R.string.choose_app_hint));
		builder.show();
	}
	
	void respond() {
		
		try {
			AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(this);
			RemoteViews views = new RemoteViews(getPackageName(), R.layout.main);
			Intent intent = getPackageManager().getLaunchIntentForPackage(
					getSharedPreferences(SETTINGS_PREF+mAppWidgetId, Context.MODE_PRIVATE)
					.getString(LAUNCH_PACKAGE, null));
			
			PendingIntent pending = PendingIntent.getActivity(this, 0, intent, 0);
			views.setOnClickPendingIntent(R.id.image, pending);
			appWidgetManager.updateAppWidget(mAppWidgetId, views);
		} catch (NameNotFoundException e) {
			// Should not happen
			e.printStackTrace();
		}
		
		Intent resultValue = new Intent();
		resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, mAppWidgetId);
		setResult(RESULT_OK, resultValue);
		finish();
	}
    
    //==================== added end ======================
}