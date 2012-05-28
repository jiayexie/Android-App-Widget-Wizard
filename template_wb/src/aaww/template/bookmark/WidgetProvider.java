package aaww.template.bookmark;	// change package name to the user-specified one

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.SystemClock;
import android.widget.RemoteViews;

public class WidgetProvider extends AppWidgetProvider {

	final static String ACTION_UPDATE = "aaww.template.bookmark.APPWIDGET_UPDATE";
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
		
		for (int i = 0; i < MainActivity.mBookmarkIds.length; i++) {
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
		}
		//== resolve functions here ==
		
		appWidgetManager.updateAppWidget(appWidgetId, views);
	}
}
