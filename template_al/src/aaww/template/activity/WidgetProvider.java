package aaww.template.activity;	// change package name to the user-specified one

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
}
