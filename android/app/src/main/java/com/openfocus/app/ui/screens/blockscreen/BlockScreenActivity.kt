package com.openfocus.app.ui.screens.blockscreen

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.CountDownTimer
import android.text.Html
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.openfocus.app.MainActivity
import com.openfocus.app.R
import com.openfocus.app.manager.LockdownManager

/**
 * BlockScreenActivity
 *
 * Full-screen HUD Block Screen for NEET Tracker / FocusForge.
 * Shown when an active focus session restricts an application.
 * Matches the user-requested BlockP / Curbox calm mascot design:
 * - Top cute mascot with unplugged computer cable
 * - "You’re one good choice closer to your best self."
 * - "‘Instagram’ was blocked by OpenFocus as it was added to your block list."
 * - "Blocked Reason: Distracting Android App"
 * - "Number of sessions blocked today : {count}"
 * - Countdown pill button
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
        const val EXTRA_ACTIVE_SUBJECT = "ACTIVE_SUBJECT"
        const val EXTRA_TODAY_COUNT = "TODAY_COUNT"
    }

    private var countDownTimer: CountDownTimer? = null
    private var isCountDownFinished = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_block_screen)

        val targetId = intent.getStringExtra(EXTRA_TARGET_ID) ?: "distracting_app"
        val targetNameExtra = intent.getStringExtra(EXTRA_TARGET_NAME)
        val strikeCount = intent.getIntExtra(EXTRA_STRIKE_COUNT, intent.getIntExtra(EXTRA_WARNING_NUMBER, 1))
        val activeSubject = intent.getStringExtra(EXTRA_ACTIVE_SUBJECT) ?: "NEET 2027 Study Session"
        val todayCount = intent.getIntExtra(EXTRA_TODAY_COUNT, LockdownManager.getTodayBlockCount(this))

        val resolvedName = try {
            val appInfo = packageManager.getApplicationInfo(targetId, 0)
            packageManager.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
            targetNameExtra ?: targetId
        }

        val ivMascot = findViewById<ImageView>(R.id.ivBlockedMascot)
        val tvHeadline = findViewById<TextView>(R.id.tvAppHeadline)
        val tvBlockNotice = findViewById<TextView>(R.id.tvAppBlockNotice)
        val tvReasonContent = findViewById<TextView>(R.id.tvAppReasonContent)
        val tvCounterText = findViewById<TextView>(R.id.tvAppCounterText)
        val tvWarningBadge = findViewById<TextView>(R.id.tvAppWarningBadge)
        val btnPill = findViewById<Button>(R.id.btnAppPillCountdown)

        tvHeadline.text = "You’re one good choice closer to your best self."

        val formattedNotice = "‘<b>$resolvedName</b>’ was <b>blocked by OpenFocus</b> as it was added to your block list."
        tvBlockNotice.text = Html.fromHtml(formattedNotice, Html.FROM_HTML_MODE_LEGACY)

        tvReasonContent.text = "$resolvedName ($activeSubject)"
        tvCounterText.text = "Number of sessions blocked today : $todayCount"

        if (strikeCount >= 5) {
            tvWarningBadge.text = "🚨 Focus Lockout Triggered (5 of 5)"
            tvWarningBadge.setTextColor(getColor(android.R.color.holo_red_light))
        } else {
            tvWarningBadge.text = "Focus Protection Warning $strikeCount of 5"
            tvWarningBadge.setTextColor(getColor(android.R.color.holo_orange_light))
        }

        // Pill button immediately active without countdown timer
        btnPill.text = "Return to NEET Study"
        isCountDownFinished = true

        btnPill.setOnClickListener {
            returnSafely()
        }
    }

    private fun returnSafely() {
        countDownTimer?.cancel()
        val mainIntent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }
        startActivity(mainIntent)
        finish()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        returnSafely()
    }

    override fun onDestroy() {
        super.onDestroy()
        countDownTimer?.cancel()
    }
}
