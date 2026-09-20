package com.openfocus.app.ui.screens.blockscreen

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.os.Bundle
import android.os.CountDownTimer
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.openfocus.app.MainActivity
import com.openfocus.app.R
import com.openfocus.app.manager.BlockingStateManager
import java.util.Locale

/**
 * BlockScreenActivity
 *
 * Full-screen HUD Block Screen & 5-Minute Focus Lockout for NEET Tracker.
 *
 * Enforces 5 warnings per target and full-screen lockout countdown.
 * Does not claim that the device is powered off.
 */
class BlockScreenActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_TARGET_ID = "TARGET_ID"
        const val EXTRA_TARGET_NAME = "TARGET_NAME"
        const val EXTRA_TARGET_TYPE = "TARGET_TYPE"
        const val EXTRA_STRIKE_COUNT = "STRIKE_COUNT"
        const val EXTRA_WARNING_NUMBER = "WARNING_NUMBER"
        const val EXTRA_MAX_WARNINGS = "MAX_WARNINGS"
        const val EXTRA_IS_LOCKOUT = "IS_LOCKOUT"
        const val EXTRA_LOCKOUT_REMAINING_SEC = "LOCKOUT_REMAINING_SEC"
        const val EXTRA_ACTIVE_SUBJECT = "ACTIVE_SUBJECT"
    }

    private lateinit var stateManager: BlockingStateManager
    private lateinit var prefs: SharedPreferences
    private var lockoutTimer: CountDownTimer? = null
    private var sessionTimer: CountDownTimer? = null
    private var emergencyTimer: CountDownTimer? = null
    private var isEmergencyCounting = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_block_screen)

        stateManager = BlockingStateManager.getInstance(this)
        prefs = getSharedPreferences("focus_blocker_prefs", Context.MODE_PRIVATE)

        val targetId = intent.getStringExtra(EXTRA_TARGET_ID) ?: "com.target.app"
        val targetNameExtra = intent.getStringExtra(EXTRA_TARGET_NAME)
        val targetType = intent.getStringExtra(EXTRA_TARGET_TYPE) ?: "app"
        val strikeCount = intent.getIntExtra(EXTRA_STRIKE_COUNT, intent.getIntExtra(EXTRA_WARNING_NUMBER, 1))
        val maxWarnings = intent.getIntExtra(EXTRA_MAX_WARNINGS, 5)
        val activeSubject = intent.getStringExtra(EXTRA_ACTIVE_SUBJECT) ?: "NEET 2027 Study Session"

        // Check if an active 5-minute lockout is in effect (either from intent or state manager)
        val lockoutStatus = stateManager.getLockoutStatus()
        val isLockoutActive = lockoutStatus.isLockoutActive || intent.getBooleanExtra(EXTRA_IS_LOCKOUT, false)

        // Resolve App Name and Icon if target is an app
        val (resolvedName, appDrawable) = if (targetType == "app") {
            try {
                val appInfo = packageManager.getApplicationInfo(targetId, 0)
                Pair(
                    packageManager.getApplicationLabel(appInfo).toString(),
                    packageManager.getApplicationIcon(appInfo)
                )
            } catch (e: PackageManager.NameNotFoundException) {
                Pair(targetNameExtra ?: targetId, null)
            }
        } else {
            Pair(targetNameExtra ?: targetId, null)
        }

        // 1. Target Name & Type UI
        val tvAppName = findViewById<TextView>(R.id.tvAppName)
        val tvTargetType = findViewById<TextView>(R.id.tvTargetType)
        val ivIcon = findViewById<ImageView>(R.id.ivBlockedAppIcon)

        tvAppName.text = resolvedName

        when (targetType) {
            "app" -> {
                tvTargetType.text = "Target Type: Distracting Android App"
                if (appDrawable != null) {
                    ivIcon.setImageDrawable(appDrawable)
                }
            }
            "website" -> {
                tvTargetType.text = "Target Type: Distracting Website Domain"
                ivIcon.setImageResource(R.mipmap.ic_launcher)
            }
            "adult_website" -> {
                tvTargetType.text = "Target Type: Adult Website Domain"
                ivIcon.setImageResource(R.mipmap.ic_launcher)
            }
            else -> {
                tvTargetType.text = "Target Type: Distraction Filter"
            }
        }

        // 2. Reason for Blocking
        val tvReason = findViewById<TextView>(R.id.tvReason)
        tvReason.text = "⚠️ Warning $strikeCount/5 — $resolvedName"

        // 3. Warning and Lockout Banner Configuration
        val tvBadge = findViewById<TextView>(R.id.tvBadge)
        val tvTitle = findViewById<TextView>(R.id.tvTitle)
        val tvWarningTitle = findViewById<TextView>(R.id.tvWarningTitle)
        val tvWarningDesc = findViewById<TextView>(R.id.tvWarningDescription)
        val tvLockoutCountdown = findViewById<TextView>(R.id.tvLockoutCountdown)

        if (isLockoutActive) {
            // Lockout Mode
            tvBadge.text = "🚨 5-MINUTE FOCUS LOCKOUT"
            tvBadge.setTextColor(getColor(android.R.color.holo_red_light))
            tvTitle.text = "5-Minute Focus Lockout"

            tvWarningTitle.text = "Five warnings reached"
            tvWarningTitle.setTextColor(getColor(android.R.color.holo_red_light))
            tvWarningDesc.text = "Focus Lockout started for 5 minutes. Please return to your NEET study session."

            tvLockoutCountdown.visibility = View.VISIBLE
            setupLockoutCountdown(tvLockoutCountdown, lockoutStatus.remainingSeconds)
        } else {
            // Warning 1..4 Mode
            tvBadge.text = "🛑 ACCESS BLOCKED"
            tvTitle.text = "Focus Protection Shield"

            tvWarningTitle.text = "⚠️ Warning $strikeCount/5 — $resolvedName"
            tvWarningTitle.setTextColor(getColor(android.R.color.holo_orange_light))
            tvWarningDesc.text = "Attempting to open this target 5 times triggers a 5-minute screen lockdown."

            tvLockoutCountdown.visibility = View.GONE
        }

        // 4. Session Countdown
        val tvRemainingCountdown = findViewById<TextView>(R.id.tvRemainingCountdown)
        setupSessionCountdown(tvRemainingCountdown)

        // 5. Action Buttons
        val btnReturn = findViewById<Button>(R.id.btnReturn)
        val btnEndFocus = findViewById<Button>(R.id.btnEndFocus)
        val btnEmergency = findViewById<Button>(R.id.btnEmergencyUnlock)

        btnReturn.setOnClickListener {
            navigateToMainApp()
        }

        btnEndFocus.setOnClickListener {
            navigateToMainApp()
        }

        val allowEmergency = prefs.getBoolean("allow_emergency_unlock", true)
        if (!allowEmergency) {
            btnEmergency.visibility = View.GONE
        } else {
            btnEmergency.setOnClickListener {
                if (!isEmergencyCounting) {
                    startEmergencyCountdown(btnEmergency)
                }
            }
        }
    }

    private fun setupLockoutCountdown(tv: TextView, initialSec: Long) {
        val seconds = if (initialSec > 0) initialSec else 300L

        lockoutTimer = object : CountDownTimer(seconds * 1000L, 1000L) {
            override fun onTick(millisUntilFinished: Long) {
                val totalSec = millisUntilFinished / 1000L
                val mins = totalSec / 60L
                val secs = totalSec % 60L
                tv.text = String.format(Locale.US, "⏳ 5-Minute Focus Lockout: %02d:%02d remaining", mins, secs)
            }

            override fun onFinish() {
                tv.text = "⏳ Lockout Complete. Returning to NEET Tracker..."
                stateManager.cancelLockoutIfAllowed()
                navigateToMainApp()
            }
        }.start()
    }

    private fun setupSessionCountdown(tv: TextView) {
        val startTimeMs = prefs.getLong("focus_session_start_time", 0L)
        val durationSec = prefs.getLong("focus_session_duration_sec", 1500L)

        if (startTimeMs <= 0L) {
            tv.text = "⏳ Focus Mode Active"
            return
        }

        val elapsedSec = (System.currentTimeMillis() - startTimeMs) / 1000L
        val remainingSec = maxOf(0L, durationSec - elapsedSec)

        if (remainingSec <= 0L) {
            tv.text = "⏳ Study Session Complete"
            return
        }

        sessionTimer = object : CountDownTimer(remainingSec * 1000L, 1000L) {
            override fun onTick(millisUntilFinished: Long) {
                val totalSec = millisUntilFinished / 1000L
                val mins = totalSec / 60L
                val secs = totalSec % 60L
                tv.text = String.format(Locale.US, "⏳ %02d:%02d remaining in focus session", mins, secs)
            }

            override fun onFinish() {
                tv.text = "⏳ Focus Session Complete!"
            }
        }.start()
    }

    private fun startEmergencyCountdown(btn: Button) {
        isEmergencyCounting = true
        btn.isEnabled = false

        emergencyTimer = object : CountDownTimer(30000L, 1000L) {
            override fun onTick(millisUntilFinished: Long) {
                val secLeft = (millisUntilFinished / 1000L) + 1L
                btn.text = "Unlocking in ${secLeft}s... (Keep open)"
            }

            override fun onFinish() {
                // Grant temporary 60s emergency unlock
                prefs.edit().putLong("emergency_unlock_until", System.currentTimeMillis() + 60000L).apply()
                stateManager.cancelLockoutIfAllowed()
                btn.text = "Unlocked for 60s"
                finish()
            }
        }.start()
    }

    private fun navigateToMainApp() {
        val homeIntent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }
        startActivity(homeIntent)
        finish()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        navigateToMainApp()
    }

    override fun onDestroy() {
        super.onDestroy()
        lockoutTimer?.cancel()
        sessionTimer?.cancel()
        emergencyTimer?.cancel()
    }
}
