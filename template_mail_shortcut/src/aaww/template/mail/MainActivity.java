package aaww.template.mail;

import android.app.Activity;
import android.app.AlertDialog;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;

public class MainActivity extends Activity {
	
	final static String SETTINGS_PREF = "settings_";
	final static String MAIL_ADDR = "mail_addr_";
	final static String MAIL_NAME = "mail_name_";
	//== define fields here ==
	final static String mMailerNames[] = {"image"};
	final static int mMailerIds[] = {R.id.image};
	final static int mMailerLinkIds[] = {R.id.tag};
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
		cConfigured += mMailerIds.length;
	}

	void finishOneConfiguration() {
		cConfigured--;
		if (cConfigured == 0) respond();
	}
	
	void configure() {
		if (cConfigured == 0) respond();
		
		//== configure functions here ==
		for (int i = 0; i < mMailerIds.length; i++) {
			final String mailerName = mMailerNames[i];
			
			AlertDialog.Builder builder = new AlertDialog.Builder(this);
			final View view = LayoutInflater.from(this).inflate(R.layout.mail_setting, null);
			builder.setView(view);
			builder.setCancelable(false);
			builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
				
				@Override
				public void onClick(DialogInterface dialog, int which) {
					String url = ((EditText)view.findViewById(R.id.mail_addr))
							.getText().toString();
					if (!url.startsWith("http://")) url = "http://"+url;
					String tag = ((EditText)view.findViewById(R.id.mail_name))
							.getText().toString();
					MainActivity.this.getSharedPreferences
						(SETTINGS_PREF+mAppWidgetId, Context.MODE_PRIVATE).edit()
						.putString(MAIL_ADDR+mailerName, url)
						.putString(MAIL_NAME+mailerName, tag)
						.commit();
					
					finishOneConfiguration();
				}
			});
			builder.setTitle("\"" + mailerName + "\" will mail:");
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
	
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        init();
        configure();
    }
}