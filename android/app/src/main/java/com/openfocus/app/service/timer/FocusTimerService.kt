package com.openfocus.app.service.timer

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Build
import android.os.CountDownTimer
import android.os.IBinder
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import com.openfocus.app.MainActivity
import com.openfocus.app.R

class FocusTimerService : Service() {

    companion object {
        const val CHANNEL_ID = "focus_timer_channel"
        const val NOTIFICATION_ID = 1001

        const val ACTION_START = "com.openfocus.app.action.START_TIMER"
        const val ACTION_PAUSE = "com.openfocus.app.action.PAUSE_TIMER"
        const val ACTION_RESUME = "com.openfocus.app.action.RESUME_TIMER"
        const val ACTION_STOP = "com.openfocus.app.action.STOP_TIMER"

        const val EXTRA_DURATION_MINUTES = "extra_duration_minutes"
        const val EXTRA_SUBJECT_NAME = "extra_subject_name"
        const val EXTRA_REMAINING_SECONDS = "extra_remaining_seconds"
    }

    private lateinit var prefs: SharedPreferences
    private var countDownTimer: CountDownTimer? = null
    private var remainingSeconds: Long = 0
    private var isPaused = false
    private var subjectName: String = "NEET 2027 Study"

    override fun onCreate() {
        super.onCreate()
        prefs = getSharedPreferences("focus_blocker_prefs", Context.MODE_PRIVATE)
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: ACTION_START

        when (action) {
            ACTION_START -> {
                val durationMin = intent?.getIntExtra(EXTRA_DURATION_MINUTES, 25) ?: 25
                subjectName = intent?.getStringExtra(EXTRA_SUBJECT_NAME) ?: "NEET 2027 Study"
                val passedSec = intent?.getLongExtra(EXTRA_REMAINING_SECONDS, -1L) ?: -1L
                remainingSeconds = if (passedSec > 0) passedSec else (durationMin * 60L)
                isPaused = false

                prefs.edit()
                    .putBoolean("is_focus_session_active", true)
                    .putString("active_subject_name", subjectName)
                    .apply()

                startForeground(NOTIFICATION_ID, buildNotification())
                startTimer(remainingSeconds)
            }
            ACTION_PAUSE -> {
                isPaused = true
                countDownTimer?.cancel()
                updateNotification()
            }
            ACTION_RESUME -> {
                if (isPaused && remainingSeconds > 0) {
                    isPaused = false
                    startTimer(remainingSeconds)
                }
            }
            ACTION_STOP -> {
                stopTimerAndService()
            }
        }

        return START_NOT_STICKY
    }

    private fun startTimer(seconds: Long) {
        countDownTimer?.cancel()
        countDownTimer = object : CountDownTimer(seconds * 1000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                remainingSeconds = millisUntilFinished / 1000
                updateNotification()
            }

            override fun onFinish() {
                remainingSeconds = 0
                triggerCompletionAlert()
                stopTimerAndService()
            }
        }.start()
    }

    private fun triggerCompletionAlert() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            vibratorManager?.defaultVibrator?.vibrate(
                VibrationEffect.createWaveform(longArrayOf(0, 400, 200, 400), -1)
            )
        } else {
            @Suppress("DEPRECATION")
            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createOneShot(800, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(800)
            }
        }
    }

    private fun stopTimerAndService() {
        countDownTimer?.cancel()
        prefs.edit().putBoolean("is_focus_session_active", false).apply()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun formatTime(seconds: Long): String {
        val m = seconds / 60
        val s = seconds % 60
        return String.format("%02d:%02d", m, s)
    }

    private fun buildNotification(): Notification {
        val appIntent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        val contentPendingIntent = PendingIntent.getActivity(
            this, 0, appIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val pauseResumeIntent = Intent(this, FocusTimerService::class.java).apply {
            action = if (isPaused) ACTION_RESUME else ACTION_PAUSE
        }
        val pauseResumePendingIntent = PendingIntent.getService(
            this, 1, pauseResumeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, FocusTimerService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 2, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val timeStr = formatTime(remainingSeconds)
        val title = "Focus Session: $subjectName"
        val contentText = if (isPaused) "Paused ($timeStr remaining)" else "Remaining: $timeStr • NEET 2027 Shield Active"
        val pauseResumeText = if (isPaused) "Resume" else "Pause"

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(contentText)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(contentPendingIntent)
            .addAction(android.R.drawable.ic_media_pause, pauseResumeText, pauseResumePendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stop", stopPendingIntent)
            .build()
    }

    private fun updateNotification() {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
        manager?.notify(NOTIFICATION_ID, buildNotification())
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.focus_notification_channel_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.focus_notification_channel_desc)
                setShowBadge(false)
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            manager?.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        countDownTimer?.cancel()
        prefs.edit().putBoolean("is_focus_session_active", false).apply()
    }
}
