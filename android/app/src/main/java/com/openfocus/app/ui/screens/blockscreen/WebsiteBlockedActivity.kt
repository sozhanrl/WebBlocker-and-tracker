package com.openfocus.app.ui.screens.blockscreen

import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.os.CountDownTimer
import android.provider.Browser
import android.text.Html
import android.util.Log
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.openfocus.app.MainActivity
import com.openfocus.app.R
import com.openfocus.app.manager.LockdownManager

/**
 * WebsiteBlockedActivity
 *
 * Full-screen HUD warning screen shown when a student attempts to open a restricted website
 * (e.g. asurascans.com or youtube.com) during active study sessions.
 * Matches the user-requested BlockP / Curbox calm mascot design:
 * - Top cute mascot with unplugged computer cable
 * - "You’re one good choice closer to your best self."
 * - "‘asurascans.com’ was blocked by OpenFocus as it was added to your block list."
 * - "Blocked Reason: asurascans.com"
 * - "Number of sessions blocked today : {count}"
 * - Countdown pill button
 *
 * Back Action: Opens a fresh clean new tab in the same browser (about:blank) to avoid
 * staying trapped on the blocked URL.
 */
class WebsiteBlockedActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_DOMAIN = "DOMAIN"
        const val EXTRA_STRIKE_COUNT = "STRIKE_COUNT"
        const val EXTRA_CATEGORY = "CATEGORY"
        const val EXTRA_TODAY_COUNT = "TODAY_COUNT"
        const val EXTRA_BROWSER_PACKAGE = "BROWSER_PACKAGE"
        private const val TAG = "WebsiteBlockedActivity"
    }

    private var countDownTimer: CountDownTimer? = null
    private var isCountDownFinished = false
    private var browserPackage: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_website_blocked)

        val domain = intent.getStringExtra(EXTRA_DOMAIN)?.ifBlank { null } ?: "Restricted Website"
        val strikes = intent.getIntExtra(EXTRA_STRIKE_COUNT, 1)
        val category = intent.getStringExtra(EXTRA_CATEGORY) ?: "Distracting Website"
        val todayCount = intent.getIntExtra(EXTRA_TODAY_COUNT, LockdownManager.getTodayBlockCount(this))
        browserPackage = intent.getStringExtra(EXTRA_BROWSER_PACKAGE)

        val ivMascot = findViewById<ImageView>(R.id.ivWebsiteMascot)
        val tvHeadline = findViewById<TextView>(R.id.tvWebsiteHeadline)
        val tvBlockNotice = findViewById<TextView>(R.id.tvWebsiteBlockNotice)
        val tvReasonContent = findViewById<TextView>(R.id.tvWebsiteReasonContent)
        val tvCounterText = findViewById<TextView>(R.id.tvWebsiteCounterText)
        val tvWarningBadge = findViewById<TextView>(R.id.tvWebsiteWarningBadge)
        val btnPill = findViewById<Button>(R.id.btnWebsitePillCountdown)

        tvHeadline.text = "You’re one good choice closer to your best self."

        val formattedNotice = "‘<b>$domain</b>’ was <b>blocked by OpenFocus</b> as it was added to your block list."
        tvBlockNotice.text = Html.fromHtml(formattedNotice, Html.FROM_HTML_MODE_LEGACY)

        tvReasonContent.text = domain
        tvCounterText.text = "Number of sessions blocked today : $todayCount"

        if (strikes >= 5) {
            tvWarningBadge.text = "🚨 Focus Lockout Triggered (5 of 5)"
            tvWarningBadge.setTextColor(getColor(android.R.color.holo_red_light))
        } else {
            tvWarningBadge.text = "Focus Protection Warning $strikes of 5"
            tvWarningBadge.setTextColor(getColor(android.R.color.holo_orange_light))
        }

        // Pill button immediately active without countdown timer
        btnPill.text = "Return to Browser"
        isCountDownFinished = true

        btnPill.setOnClickListener {
            returnToBrowser()
        }
    }

    /**
     * Returns the user to Google (https://www.google.com) in their browser
     * replacing the blocked website tab so they can search or open a new tab freely.
     */
    private fun returnToBrowser() {
        countDownTimer?.cancel()
        val pkg = browserPackage ?: getPreferredBrowserPackage()
        try {
            val googleIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com")).apply {
                if (!pkg.isNullOrBlank()) {
                    setPackage(pkg)
                }
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }
            startActivity(googleIntent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch Google in browser: ${e.message}")
            try {
                val genericIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com")).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                startActivity(genericIntent)
            } catch (_: Exception) {}
        }
        finish()
    }

    private fun getPreferredBrowserPackage(): String? {
        return try {
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://google.com"))
            val resolveInfo = packageManager.resolveActivity(browserIntent, PackageManager.MATCH_DEFAULT_ONLY)
            val resolvedPkg = resolveInfo?.activityInfo?.packageName
            if (resolvedPkg != null && resolvedPkg != packageName && resolvedPkg != "android") {
                resolvedPkg
            } else {
                val installedPackages = packageManager.getInstalledApplications(0).map { it.packageName }.toSet()
                val commonBrowsers = listOf(
                    "com.android.chrome",
                    "com.brave.browser",
                    "org.mozilla.firefox",
                    "com.microsoft.emmx",
                    "com.sec.android.app.sbrowser",
                    "com.opera.browser"
                )
                commonBrowsers.firstOrNull { installedPackages.contains(it) }
            }
        } catch (e: Exception) {
            null
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        returnToBrowser()
    }

    override fun onDestroy() {
        super.onDestroy()
        countDownTimer?.cancel()
    }
}
