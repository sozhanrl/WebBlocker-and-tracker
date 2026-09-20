package com.openfocus.app.ui.screens.blockscreen

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.CountDownTimer
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.openfocus.app.MainActivity
import com.openfocus.app.R
import com.openfocus.app.manager.LockdownManager
import java.util.Locale

/**
 * LockdownOverlayActivity
 *
 * Full-screen unskippable countdown overlay rendered during 5-minute
 * focus lockdowns. Shows exact remaining lockout time and prevents
 * returning to the blocked application.
 */
class LockdownOverlayActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_LOCKDOWN_UNTIL = "EXTRA_LOCKDOWN_UNTIL"
        const val EXTRA_TARGET_NAME = "EXTRA_TARGET_NAME"
    }

    private var countDownTimer: CountDownTimer? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        configureWindowFlags()
        setContentView(R.layout.activity_lockdown_overlay)

        val targetName = intent.getStringExtra(EXTRA_TARGET_NAME)
        if (!targetName.isNullOrBlank()) {
            findViewById<TextView>(R.id.tvLockdownReason).text =
                "5 attempts detected on '$targetName' during active study session."
        }

        val tvCountdown = findViewById<TextView>(R.id.tvCountdownTimer)
        val btnOpenTracker = findViewById<Button>(R.id.btnOpenNeetTracker)

        btnOpenTracker.setOnClickListener {
            val homeIntent = Intent(this, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            }
            startActivity(homeIntent)
            finish()
        }

        startLiveCountdown(tvCountdown)
    }

    private fun configureWindowFlags() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
            )
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // Immersive Sticky Mode
        @Suppress("DEPRECATION")
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
            View.SYSTEM_UI_FLAG_FULLSCREEN or
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
            View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
            View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        )
    }

    private fun startLiveCountdown(tv: TextView) {
        val remainingSec = LockdownManager.getRemainingLockdownSec(this)
        if (remainingSec <= 0L) {
            tv.text = "00:00"
            finish()
            return
        }

        countDownTimer = object : CountDownTimer(remainingSec * 1000L, 1000L) {
            override fun onTick(millisUntilFinished: Long) {
                val totalSec = millisUntilFinished / 1000L
                val mins = totalSec / 60L
                val secs = totalSec % 60L
                tv.text = String.format(Locale.US, "%02d:%02d", mins, secs)
            }

            override fun onFinish() {
                tv.text = "00:00"
                LockdownManager.cancelLockdown(this@LockdownOverlayActivity)
                val homeIntent = Intent(this@LockdownOverlayActivity, MainActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                }
                startActivity(homeIntent)
                finish()
            }
        }.start()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        // No-op during 5-minute lockdown to prevent escaping to blocked app
        val homeIntent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }
        startActivity(homeIntent)
    }

    override fun onDestroy() {
        super.onDestroy()
        countDownTimer?.cancel()
    }
}
