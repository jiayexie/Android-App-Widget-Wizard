package aaww.template.bookmark;

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
	final static String BROWSE_URL = "url_";
	final static String BROWSE_TAG = "tag_";
	//== define fields here ==
	final static String mBookmarkNames[] = {"image"};
	final static int mBookmarkIds[] = {R.id.image};
	final static int mBookmarkLinkIds[] = {R.id.tag};
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
		cConfigured += mBookmarkIds.length;
	}

	void finishOneConfiguration() {
		cConfigured--;
		if (cConfigured == 0) respond();
	}
	
	void configure() {
		if (cConfigured == 0) respond();
		
		for (int i = 0; i < mBookmarkIds.length; i++) {
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
			builder.setTitle(bookmarkName + " is a bookmark for:");
			builder.show();
		}
		//== configure functions here ==
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