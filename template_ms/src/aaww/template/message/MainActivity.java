package aaww.template.message;

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
import android.os.Bundle;
import android.provider.ContactsContract;
import android.provider.ContactsContract.PhoneLookup;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

public class MainActivity extends Activity {
	
	final static String SETTINGS_PREF = "settings_";
	final static String TEXT_NAME = "dial_name_";
	final static String TEXT_PHONE = "dial_phone_";
	//== define fields here ==
	final static String mTexterNames[] = {"image"};
	final static int mTexterIds[] = {R.id.image};
	final static int mTexterLinkIds[] = {R.id.tag};
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
		cConfigured += mTexterIds.length;
	}

	void finishOneConfiguration() {
		cConfigured--;
		if (cConfigured == 0) respond();
	}
	
	void configure() {
		if (cConfigured == 0) respond();
		
		final List<String> names = new ArrayList<String>();
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
                    number = number.replace(' ', '\0');
                    names.add(name);
                    phones.add(number);
                }  
        	} while (cursor.moveToNext());
        	cursor.close();
        }
		
		for (int i = 0; i < mTexterIds.length; i++) {
			final String dialerName = mTexterNames[i];
				
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
						.edit().putString(TEXT_NAME+dialerName, name)
							   .putString(TEXT_PHONE+dialerName, phone).commit();
					
					finishOneConfiguration();
				}
			});
			builder.setCancelable(false);
			
			builder.setTitle("\"" + dialerName + "\" will dial:");
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