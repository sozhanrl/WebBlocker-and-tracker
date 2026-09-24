package com.openfocus.app.manager

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.openfocus.app.MainActivity
import com.openfocus.app.R
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

/**
 * RoutineNotificationManager
 *
 * Manages an ongoing, persistent, glanceable Android notification showing the user's
 * active NEET Daily Routine block, countdown time remaining, and upcoming task.
 * Updates dynamically every minute via ACTION_TIME_TICK broadcast.
 */
object RoutineNotificationManager {

    private const val TAG = "RoutineNotifManager"
    const val CHANNEL_ID = "neet_routine_channel"
    const val NOTIFICATION_ID = 2001
    private const val PREFS_NAME = "focus_blocker_prefs"
    private const val KEY_ROUTINE_JSON = "neet_daily_routine_json"
    private const val KEY_ROUTINE_ENABLED = "neet_routine_notification_enabled"

    data class RoutineItem(
        val id: String,
        val time: String,
        val task: String,
        val category: String = "study",
        val startMins: Int = 0,
        val endMins: Int = 0
    )

    val ROUTINE_MONDAY = listOf(
        RoutineItem("rt-mon-1", "05:00–07:00", "NEET Study Block 1: Physics (Mechanics & Laws of Motion)", "study", 5 * 60, 7 * 60),
        RoutineItem("rt-mon-2", "07:00–07:30", "Breakfast and Bath (Morning Refresh)", "personal", 7 * 60, 7 * 60 + 30),
        RoutineItem("rt-mon-3", "07:30–10:00", "NEET Study Block 2: Chemistry (Organic / Physical Numericals)", "study", 7 * 60 + 30, 10 * 60),
        RoutineItem("rt-mon-4", "10:00–10:15", "Morning Break (Hydration & Stretch)", "break", 10 * 60, 10 * 60 + 15),
        RoutineItem("rt-mon-5", "10:15–11:45", "NEET Study Block 3: Botany (NCERT Line-by-Line Reading)", "study", 10 * 60 + 15, 11 * 60 + 45),
        RoutineItem("rt-mon-6", "11:45–12:00", "Midday Break (Eye Rest)", "break", 11 * 60 + 45, 12 * 60),
        RoutineItem("rt-mon-7", "12:00–13:00", "NEET Study Block 4: Zoology (Human Physiology High-Yield)", "study", 12 * 60, 13 * 60),
        RoutineItem("rt-mon-8", "13:00–14:00", "Lunch & Travel to College", "personal", 13 * 60, 14 * 60),
        RoutineItem("rt-mon-9", "14:00–14:50", "UI/UX Design - TH (A2+TA2 - SJT221)", "college", 14 * 60, 14 * 60 + 50),
        RoutineItem("rt-mon-10", "15:00–15:50", "Deep Learning - TH (F2+TF2 - SJT619)", "college", 15 * 60, 15 * 60 + 50),
        RoutineItem("rt-mon-11", "16:00–16:50", "Cyber Security - TH (D2+TD2 - SJTG24)", "college", 16 * 60, 16 * 60 + 50),
        RoutineItem("rt-mon-12", "17:00–17:50", "Software Metrics - TH (B2+TB2 - SJT115)", "college", 17 * 60, 17 * 60 + 50),
        RoutineItem("rt-mon-13", "18:00–18:50", "Adv Competitive Coding - I - SS (G2+TG2 - SJT619)", "college", 18 * 60, 18 * 60 + 50),
        RoutineItem("rt-mon-14", "18:50–19:15", "Evening Refresh & Tea Break", "break", 18 * 60 + 50, 19 * 60 + 15),
        RoutineItem("rt-mon-15", "19:15–20:00", "NEET Study Block 5: Spaced Revision & Formula Sheets", "study", 19 * 60 + 15, 20 * 60),
        RoutineItem("rt-mon-16", "20:00–20:30", "Dinner & Family Time", "personal", 20 * 60, 20 * 60 + 30),
        RoutineItem("rt-mon-17", "20:30–22:00", "NEET Question Solving Block 6 (50 MCQ Speed Sprint)", "study", 20 * 60 + 30, 22 * 60),
        RoutineItem("rt-mon-18", "22:00–05:00", "Bedtime Sleep (Recovery)", "sleep", 22 * 60, 5 * 60)
    )

    val ROUTINE_TUESDAY = listOf(
        RoutineItem("rt-tue-1", "05:00–07:00", "NEET Study Block 1: Physics (Mechanics Problem Solving)", "study", 5 * 60, 7 * 60),
        RoutineItem("rt-tue-2", "07:00–07:30", "Breakfast and Bath (Morning Refresh)", "personal", 7 * 60, 7 * 60 + 30),
        RoutineItem("rt-tue-3", "07:30–10:00", "NEET Study Block 2: Chemistry (Inorganic Trends & NCERT)", "study", 7 * 60 + 30, 10 * 60),
        RoutineItem("rt-tue-4", "10:00–10:15", "Morning Break (Hydration & Stretch)", "break", 10 * 60, 10 * 60 + 15),
        RoutineItem("rt-tue-5", "10:15–11:45", "NEET Study Block 3: Botany (Plant Physiology Focus)", "study", 10 * 60 + 15, 11 * 60 + 45),
        RoutineItem("rt-tue-6", "11:45–12:00", "Midday Break (Eye Rest)", "break", 11 * 60 + 45, 12 * 60),
        RoutineItem("rt-tue-7", "12:00–13:00", "NEET Study Block 4: Zoology (Animal Kingdom / Genetics)", "study", 12 * 60, 13 * 60),
        RoutineItem("rt-tue-8", "13:00–14:00", "Lunch & Travel to College", "personal", 13 * 60, 14 * 60),
        RoutineItem("rt-tue-9", "14:00–14:50", "Software Metrics - TH (B2+TB2 - SJT115)", "college", 14 * 60, 14 * 60 + 50),
        RoutineItem("rt-tue-10", "15:00–15:50", "Adv Competitive Coding - I - SS (G2+TG2 - SJT619)", "college", 15 * 60, 15 * 60 + 50),
        RoutineItem("rt-tue-11", "16:00–16:50", "Software Configuration Management - TH (E2+TE2 - SJT204)", "college", 16 * 60, 16 * 60 + 50),
        RoutineItem("rt-tue-12", "17:00–17:50", "Design Patterns - TH (C2+TC2 - SJT114)", "college", 17 * 60, 17 * 60 + 50),
        RoutineItem("rt-tue-13", "17:50–18:30", "Badminton / Fitness & Refresh", "exercise", 17 * 60 + 50, 18 * 60 + 30),
        RoutineItem("rt-tue-14", "18:30–19:30", "NEET Study Block 5: Spaced Revision (Physics / Chemistry)", "study", 18 * 60 + 30, 19 * 60 + 30),
        RoutineItem("rt-tue-15", "19:30–20:00", "Dinner", "personal", 19 * 60 + 30, 20 * 60),
        RoutineItem("rt-tue-16", "20:00–21:45", "NEET Question Solving Block 6 (50 MCQ Sprint)", "study", 20 * 60, 21 * 60 + 45),
        RoutineItem("rt-tue-17", "21:45–22:00", "Night Routine & Wind Down", "personal", 21 * 60 + 45, 22 * 60),
        RoutineItem("rt-tue-18", "22:00–05:00", "Bedtime Sleep (Recovery)", "sleep", 22 * 60, 5 * 60)
    )

    val ROUTINE_WEDNESDAY = listOf(
        RoutineItem("rt-wed-1", "05:00–07:00", "NEET Study Block 1: Physics (Electrodynamics & Optics)", "study", 5 * 60, 7 * 60),
        RoutineItem("rt-wed-2", "07:00–07:30", "Breakfast and Bath (Morning Refresh)", "personal", 7 * 60, 7 * 60 + 30),
        RoutineItem("rt-wed-3", "07:30–10:00", "NEET Study Block 2: Chemistry (Physical Chemistry Calculations)", "study", 7 * 60 + 30, 10 * 60),
        RoutineItem("rt-wed-4", "10:00–10:15", "Morning Break (Hydration & Stretch)", "break", 10 * 60, 10 * 60 + 15),
        RoutineItem("rt-wed-5", "10:15–11:45", "NEET Study Block 3: Botany (Genetics & Biotechnology)", "study", 10 * 60 + 15, 11 * 60 + 45),
        RoutineItem("rt-wed-6", "11:45–12:00", "Midday Break (Eye Rest)", "break", 11 * 60 + 45, 12 * 60),
        RoutineItem("rt-wed-7", "12:00–13:00", "NEET Study Block 4: Zoology (Cell Biology & Genetics)", "study", 12 * 60, 13 * 60),
        RoutineItem("rt-wed-8", "13:00–14:00", "Lunch & Travel to College", "personal", 13 * 60, 14 * 60),
        RoutineItem("rt-wed-9", "14:00–14:50", "Design Patterns - TH (C2+TC2 - SJT114)", "college", 14 * 60, 14 * 60 + 50),
        RoutineItem("rt-wed-10", "15:00–15:50", "UI/UX Design - TH (A2+TA2 - SJT221)", "college", 15 * 60, 15 * 60 + 50),
        RoutineItem("rt-wed-11", "16:00–16:50", "Deep Learning - TH (F2+TF2 - SJT619)", "college", 16 * 60, 16 * 60 + 50),
        RoutineItem("rt-wed-12", "17:00–17:50", "Cyber Security - TH (D2+TD2 - SJTG24)", "college", 17 * 60, 17 * 60 + 50),
        RoutineItem("rt-wed-13", "17:50–18:30", "Badminton / Fitness & Refresh", "exercise", 17 * 60 + 50, 18 * 60 + 30),
        RoutineItem("rt-wed-14", "18:30–19:30", "NEET Study Block 5: Spaced Revision (Botany / Zoology)", "study", 18 * 60 + 30, 19 * 60 + 30),
        RoutineItem("rt-wed-15", "19:30–20:00", "Dinner", "personal", 19 * 60 + 30, 20 * 60),
        RoutineItem("rt-wed-16", "20:00–21:45", "NEET Question Solving Block 6 (50 MCQ Sprint)", "study", 20 * 60, 21 * 60 + 45),
        RoutineItem("rt-wed-17", "21:45–22:00", "Night Routine & Wind Down", "personal", 21 * 60 + 45, 22 * 60),
        RoutineItem("rt-wed-18", "22:00–05:00", "Bedtime Sleep (Recovery)", "sleep", 22 * 60, 5 * 60)
    )

    val ROUTINE_THURSDAY = listOf(
        RoutineItem("rt-thu-1", "05:00–07:00", "NEET Study Block 1: Physics (Modern Physics & Thermodynamics)", "study", 5 * 60, 7 * 60),
        RoutineItem("rt-thu-2", "07:00–07:30", "Breakfast and Bath (Morning Refresh)", "personal", 7 * 60, 7 * 60 + 30),
        RoutineItem("rt-thu-3", "07:30–10:00", "NEET Study Block 2: Chemistry (Coordination & Organic Reactions)", "study", 7 * 60 + 30, 10 * 60),
        RoutineItem("rt-thu-4", "10:00–10:15", "Morning Break (Hydration & Stretch)", "break", 10 * 60, 10 * 60 + 15),
        RoutineItem("rt-thu-5", "10:15–11:30", "NEET Study Block 3: Biology (NCERT Intensive Line-by-Line)", "study", 10 * 60 + 15, 11 * 60 + 30),
        RoutineItem("rt-thu-6", "11:40–13:20", "UI/UX Design Lab - LO (L23+L24 - SJT217)", "college", 11 * 60 + 40, 13 * 60 + 20),
        RoutineItem("rt-thu-7", "13:20–14:00", "Lunch Break & Travel to Class", "personal", 13 * 60 + 20, 14 * 60),
        RoutineItem("rt-thu-8", "14:00–14:50", "Cyber Security - TH (D2+TD2 - SJTG24)", "college", 14 * 60, 14 * 60 + 50),
        RoutineItem("rt-thu-9", "15:00–15:50", "Software Metrics - TH (B2+TB2 - SJT115)", "college", 15 * 60, 15 * 60 + 50),
        RoutineItem("rt-thu-10", "16:00–16:50", "Adv Competitive Coding - I - SS (G2+TG2 - SJT619)", "college", 16 * 60, 16 * 60 + 50),
        RoutineItem("rt-thu-11", "17:00–17:50", "Software Configuration Management - TH (E2+TE2 - SJT204)", "college", 17 * 60, 17 * 60 + 50),
        RoutineItem("rt-thu-12", "17:50–18:30", "Badminton / Fitness & Refresh", "exercise", 17 * 60 + 50, 18 * 60 + 30),
        RoutineItem("rt-thu-13", "18:30–19:30", "NEET Study Block 5: Spaced Revision (Physics / Chemistry)", "study", 18 * 60 + 30, 19 * 60 + 30),
        RoutineItem("rt-thu-14", "19:30–20:00", "Dinner", "personal", 19 * 60 + 30, 20 * 60),
        RoutineItem("rt-thu-15", "20:00–21:45", "NEET Question Solving Block 6 (50 MCQ Sprint)", "study", 20 * 60, 21 * 60 + 45),
        RoutineItem("rt-thu-16", "21:45–22:00", "Night Routine & Wind Down", "personal", 21 * 60 + 45, 22 * 60),
        RoutineItem("rt-thu-17", "22:00–05:00", "Bedtime Sleep (Recovery)", "sleep", 22 * 60, 5 * 60)
    )

    val ROUTINE_FRIDAY = listOf(
        RoutineItem("rt-fri-1", "05:00–07:00", "NEET Study Block 1: Physics (Full Syllabus Numericals)", "study", 5 * 60, 7 * 60),
        RoutineItem("rt-fri-2", "07:00–07:30", "Breakfast and Bath (Morning Refresh)", "personal", 7 * 60, 7 * 60 + 30),
        RoutineItem("rt-fri-3", "07:30–10:00", "NEET Study Block 2: Chemistry (Organic Mechanisms & Reactions)", "study", 7 * 60 + 30, 10 * 60),
        RoutineItem("rt-fri-4", "10:00–10:15", "Morning Break (Hydration & Stretch)", "break", 10 * 60, 10 * 60 + 15),
        RoutineItem("rt-fri-5", "10:15–11:45", "NEET Study Block 3: Botany (Ecology & Environment)", "study", 10 * 60 + 15, 11 * 60 + 45),
        RoutineItem("rt-fri-6", "11:45–12:00", "Midday Break (Eye Rest)", "break", 11 * 60 + 45, 12 * 60),
        RoutineItem("rt-fri-7", "12:00–13:00", "NEET Study Block 4: Zoology (Human Reproduction & Health)", "study", 12 * 60, 13 * 60),
        RoutineItem("rt-fri-8", "13:00–14:00", "Lunch & Travel to College", "personal", 13 * 60, 14 * 60),
        RoutineItem("rt-fri-9", "14:00–14:50", "Software Configuration Management - TH (E2+TE2 - SJT204)", "college", 14 * 60, 14 * 60 + 50),
        RoutineItem("rt-fri-10", "15:00–15:50", "Design Patterns - TH (C2+TC2 - SJT114)", "college", 15 * 60, 15 * 60 + 50),
        RoutineItem("rt-fri-11", "16:00–16:50", "UI/UX Design - TH (A2+TA2 - SJT221)", "college", 16 * 60, 16 * 60 + 50),
        RoutineItem("rt-fri-12", "17:00–17:50", "Deep Learning - TH (F2+TF2 - SJT619)", "college", 17 * 60, 17 * 60 + 50),
        RoutineItem("rt-fri-13", "17:50–18:30", "Badminton / Fitness & Refresh", "exercise", 17 * 60 + 50, 18 * 60 + 30),
        RoutineItem("rt-fri-14", "18:30–19:30", "NEET Study Block 5: Weekly Topic Synthesis", "study", 18 * 60 + 30, 19 * 60 + 30),
        RoutineItem("rt-fri-15", "19:30–20:00", "Dinner", "personal", 19 * 60 + 30, 20 * 60),
        RoutineItem("rt-fri-16", "20:00–21:45", "NEET Question Solving Block 6 (50 MCQ Sprint)", "study", 20 * 60, 21 * 60 + 45),
        RoutineItem("rt-fri-17", "21:45–22:00", "Night Routine & Saturday Prep", "personal", 21 * 60 + 45, 22 * 60),
        RoutineItem("rt-fri-18", "22:00–05:00", "Bedtime Sleep (Recovery)", "sleep", 22 * 60, 5 * 60)
    )

    val ROUTINE_SATURDAY = listOf(
        RoutineItem("rt-sat-1", "05:00–07:00", "NEET Study Block 1: Physics (Weak Areas Review & Numerical Practice)", "study", 5 * 60, 7 * 60),
        RoutineItem("rt-sat-2", "07:00–07:30", "Breakfast and Bath (Morning Refresh)", "personal", 7 * 60, 7 * 60 + 30),
        RoutineItem("rt-sat-3", "07:30–10:00", "NEET Study Block 2: Chemistry (Formulas & Reaction Drills)", "study", 7 * 60 + 30, 10 * 60),
        RoutineItem("rt-sat-4", "10:00–10:15", "Morning Break (Hydration & Stretch)", "break", 10 * 60, 10 * 60 + 15),
        RoutineItem("rt-sat-5", "10:15–11:45", "NEET Study Block 3: Botany (NCERT Diagram & Tables Revision)", "study", 10 * 60 + 15, 11 * 60 + 45),
        RoutineItem("rt-sat-6", "11:45–12:00", "Midday Break (Eye Rest)", "break", 11 * 60 + 45, 12 * 60),
        RoutineItem("rt-sat-7", "12:00–13:00", "NEET Study Block 4: Zoology (PYQs & Rapid Fire Drills)", "study", 12 * 60, 13 * 60),
        RoutineItem("rt-sat-8", "13:00–14:00", "Lunch & Midday Rest", "personal", 13 * 60, 14 * 60),
        RoutineItem("rt-sat-9", "14:00–18:00", "College Class / Engineering Lab & Project Study", "college", 14 * 60, 18 * 60),
        RoutineItem("rt-sat-10", "18:00–18:30", "Badminton / Fitness & Refresh", "exercise", 18 * 60, 18 * 60 + 30),
        RoutineItem("rt-sat-11", "18:30–19:30", "NEET Study Block 5: Sunday Mock Test Pre-Review", "study", 18 * 60 + 30, 19 * 60 + 30),
        RoutineItem("rt-sat-12", "19:30–20:00", "Dinner", "personal", 19 * 60 + 30, 20 * 60),
        RoutineItem("rt-sat-13", "20:00–21:45", "NEET Question Solving Block 6 (50 High-Speed MCQ Sprint)", "study", 20 * 60, 21 * 60 + 45),
        RoutineItem("rt-sat-14", "21:45–22:00", "Sunday Mock Test Setup & Mindset Prep", "personal", 21 * 60 + 45, 22 * 60),
        RoutineItem("rt-sat-15", "22:00–08:00", "Bedtime Sleep (Full 10h Recovery Sleep until 8:00 AM)", "sleep", 22 * 60, 8 * 60)
    )

    val ROUTINE_SUNDAY = listOf(
        RoutineItem("rt-sun-1", "08:00–09:00", "Wake Up at 8:00 AM, Breakfast & Morning Refresh", "personal", 8 * 60, 9 * 60),
        RoutineItem("rt-sun-2", "09:00–09:30", "Mock Test Setup & Mindset Alignment (OMR & Formulas)", "study", 9 * 60, 9 * 60 + 30),
        RoutineItem("rt-sun-3", "09:30–12:30", "NEET Chapterwise Mock Test Sprint (Physics, Chem, Bio)", "study", 9 * 60 + 30, 12 * 60 + 30),
        RoutineItem("rt-sun-4", "12:30–13:30", "Lunch & Post-Test Relaxation", "personal", 12 * 60 + 30, 13 * 60 + 30),
        RoutineItem("rt-sun-5", "13:30–17:00", "Free Time: Hobbies, Movies & Relaxation", "break", 13 * 60 + 30, 17 * 60),
        RoutineItem("rt-sun-6", "17:00–19:30", "Free Time: Evening Outing & Social Rest", "break", 17 * 60, 19 * 60 + 30),
        RoutineItem("rt-sun-7", "19:30–20:30", "Dinner with Family", "personal", 19 * 60 + 30, 20 * 60 + 30),
        RoutineItem("rt-sun-8", "20:30–22:00", "Free Time: Wind Down & Week Planning", "break", 20 * 60 + 30, 22 * 60),
        RoutineItem("rt-sun-9", "22:00–05:00", "Bedtime Sleep (Rest for Monday 5:00 AM Wake Up)", "sleep", 22 * 60, 5 * 60)
    )

    fun getDefaultRoutineForDay(dayOfWeek: Int): List<RoutineItem> {
        return when (dayOfWeek) {
            Calendar.SUNDAY -> ROUTINE_SUNDAY
            Calendar.MONDAY -> ROUTINE_MONDAY
            Calendar.TUESDAY -> ROUTINE_TUESDAY
            Calendar.WEDNESDAY -> ROUTINE_WEDNESDAY
            Calendar.THURSDAY -> ROUTINE_THURSDAY
            Calendar.FRIDAY -> ROUTINE_FRIDAY
            Calendar.SATURDAY -> ROUTINE_SATURDAY
            else -> ROUTINE_MONDAY
        }
    }

    private val DEFAULT_ROUTINE = ROUTINE_MONDAY

    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun isNotificationEnabled(context: Context): Boolean {
        return getPrefs(context).getBoolean(KEY_ROUTINE_ENABLED, true)
    }

    fun setNotificationEnabled(context: Context, enabled: Boolean) {
        getPrefs(context).edit().putBoolean(KEY_ROUTINE_ENABLED, enabled).apply()
        if (enabled) {
            updateNotification(context)
        } else {
            cancelNotification(context)
        }
    }

    fun saveRoutineJson(context: Context, json: String) {
        getPrefs(context).edit().putString(KEY_ROUTINE_JSON, json).apply()
        updateNotification(context)
        Log.i(TAG, "Saved routine JSON and refreshed notification")
    }

    fun loadRoutineItems(context: Context): List<RoutineItem> {
        val todayOfWeek = Calendar.getInstance().get(Calendar.DAY_OF_WEEK)
        val defaultForToday = getDefaultRoutineForDay(todayOfWeek)

        val raw = getPrefs(context).getString(KEY_ROUTINE_JSON, null)
        if (raw.isNullOrBlank()) {
            return defaultForToday
        }

        return try {
            val list = mutableListOf<RoutineItem>()
            val array = JSONArray(raw)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val id = obj.optString("id", "rt-$i")
                val time = obj.optString("time", obj.optString("timeRange", ""))
                val task = obj.optString("task", obj.optString("text", "Routine Task"))
                val cat = obj.optString("category", "study")

                val (sMins, eMins) = parseTimeRange(time)
                list.add(RoutineItem(id, time, task, cat, sMins, eMins))
            }
            if (list.isNotEmpty()) list else defaultForToday
        } catch (e: Exception) {
            Log.e(TAG, "Failed to parse routine JSON: ${e.message}")
            defaultForToday
        }
    }

    private fun parseTimeRange(timeStr: String): Pair<Int, Int> {
        val delimiters = listOf("–", "-", "—", "to")
        for (delim in delimiters) {
            if (timeStr.contains(delim)) {
                val parts = timeStr.split(delim).map { it.trim() }
                if (parts.size >= 2) {
                    val sMins = parseTimeToMinutes(parts[0])
                    val eMins = parseTimeToMinutes(parts[1])
                    return Pair(sMins, eMins)
                }
            }
        }
        val single = parseTimeToMinutes(timeStr.trim())
        return Pair(single, single + 60)
    }

    private fun parseTimeToMinutes(timePart: String): Int {
        return try {
            val clean = timePart.replace("[^0-9:]".toRegex(), "")
            val parts = clean.split(":")
            val h = parts[0].toIntOrNull() ?: 0
            val m = if (parts.size > 1) parts[1].toIntOrNull() ?: 0 else 0
            h * 60 + m
        } catch (_: Exception) {
            0
        }
    }

    fun updateNotification(context: Context) {
        if (!isNotificationEnabled(context)) {
            cancelNotification(context)
            return
        }

        try {
            ensureNotificationChannel(context)

            val routine = loadRoutineItems(context)
            val now = Calendar.getInstance()
            val currentMins = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)

            var activeItem: RoutineItem? = null
            var nextItem: RoutineItem? = null

            for (i in routine.indices) {
                val item = routine[i]
                if (item.startMins <= item.endMins) {
                    if (currentMins in item.startMins until item.endMins) {
                        activeItem = item
                        nextItem = routine.getOrNull(i + 1) ?: routine.firstOrNull()
                        break
                    }
                } else {
                    // Over midnight block (e.g. 22:00 - 05:00)
                    if (currentMins >= item.startMins || currentMins < item.endMins) {
                        activeItem = item
                        nextItem = routine.getOrNull(i + 1) ?: routine.firstOrNull()
                        break
                    }
                }
            }

            // If not in an active block, find next upcoming task today
            if (activeItem == null) {
                for (item in routine) {
                    if (item.startMins > currentMins) {
                        nextItem = item
                        break
                    }
                }
                if (nextItem == null) {
                    nextItem = routine.firstOrNull()
                }
            }

            // Build rich strings
            val title: String
            val contentText: String
            val bigContent: String

            if (activeItem != null) {
                val endM = if (activeItem.endMins >= activeItem.startMins) {
                    activeItem.endMins
                } else {
                    activeItem.endMins + 24 * 60
                }
                val curM = if (currentMins >= activeItem.startMins) {
                    currentMins
                } else {
                    currentMins + 24 * 60
                }
                val remainingMins = maxOf(1, endM - curM)

                title = "📅 Now: ${activeItem.task}"
                val nextStr = if (nextItem != null && nextItem.id != activeItem.id) {
                    val nextStart = nextItem.time.split("–", "-", "—")[0].trim()
                    "Next: ${nextItem.task.take(24)} ($nextStart)"
                } else {
                    "Focus Shield Active"
                }
                contentText = "⏱️ ${activeItem.time} (${remainingMins}m left) • $nextStr"

                bigContent = StringBuilder().apply {
                    append("🎯 Current Block: ${activeItem.task}\n")
                    append("⏱️ Scheduled: ${activeItem.time} (${remainingMins}m remaining)\n")
                    if (nextItem != null && nextItem.id != activeItem.id) {
                        append("⏭️ Up Next: ${nextItem.task} [${nextItem.time}]\n")
                    }
                    append("🛡️ NEET 2027 Study OS • Daily Discipline Active")
                }.toString()
            } else if (nextItem != null) {
                val startM = if (nextItem.startMins >= currentMins) {
                    nextItem.startMins
                } else {
                    nextItem.startMins + 24 * 60
                }
                val minsUntil = startM - currentMins
                val timeLabel = if (minsUntil > 60) "${minsUntil / 60}h ${minsUntil % 60}m" else "${minsUntil}m"

                title = "📋 Next: ${nextItem.task}"
                contentText = "Starts in $timeLabel (${nextItem.time}) • NEET Daily Routine"
                bigContent = StringBuilder().apply {
                    append("⏭️ Upcoming Task: ${nextItem.task}\n")
                    append("⏱️ Starts at: ${nextItem.time} (in $timeLabel)\n")
                    append("📖 Tap to review your NEET checklist & study schedule")
                }.toString()
            } else {
                title = "📅 NEET Daily Study Routine"
                contentText = "Tap to open your daily study blocks & checklist"
                bigContent = "NEET Daily Study Routine is active and protected by Focus Shield."
            }

            val openIntent = Intent(context, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                putExtra("open_tab", "checklist")
            }
            val contentPendingIntent = PendingIntent.getActivity(
                context,
                100,
                openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val notif = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(contentText)
                .setStyle(NotificationCompat.BigTextStyle().bigText(bigContent))
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setCategory(NotificationCompat.CATEGORY_STATUS)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setContentIntent(contentPendingIntent)
                .addAction(
                    android.R.drawable.ic_menu_agenda,
                    "Open Checklist",
                    contentPendingIntent
                )
                .build()

            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            manager?.notify(NOTIFICATION_ID, notif)
        } catch (e: Exception) {
            Log.e(TAG, "Error updating routine notification: ${e.message}", e)
        }
    }

    fun cancelNotification(context: Context) {
        try {
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            manager?.cancel(NOTIFICATION_ID)
        } catch (e: Exception) {
            Log.e(TAG, "Error cancelling routine notification: ${e.message}")
        }
    }

    private fun ensureNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "NEET Daily Study Routine",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Live NEET daily routine study block schedule, timer countdown, and upcoming tasks"
                setShowBadge(false)
                enableLights(false)
                enableVibration(false)
            }
            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            manager?.createNotificationChannel(channel)
        }
    }
}
