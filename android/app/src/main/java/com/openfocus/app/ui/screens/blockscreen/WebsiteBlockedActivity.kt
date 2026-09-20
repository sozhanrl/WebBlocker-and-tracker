package com.openfocus.app.ui.screens.blockscreen

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.openfocus.app.MainActivity
import com.openfocus.app.R
import com.openfocus.app.manager.LockdownManager

/**
 * WebsiteBlockedActivity
 *
 * Interstitial screen launched when a student queries a blocked domain.
 * Shows strike count ("⚠️ Warning {STRIKE_COUNT}/5 — {domain}")
 * and triggers 5-minute lockdown if strike reaches 5.
 */
class WebsiteBlockedActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_DOMAIN = "DOMAIN"
        const val EXTRA_STRIKE_COUNT = "STRIKE_COUNT"
        const val EXTRA_CATEGORY = "CATEGORY"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_website_blocked)

        val domain = intent.getStringExtra(EXTRA_DOMAIN) ?: "blocked-site.com"
        val strikes = intent.getIntExtra(EXTRA_STRIKE_COUNT, 1)
        val category = intent.getStringExtra(EXTRA_CATEGORY) ?: "Distracting Website"

        val tvDomain = findViewById<TextView>(R.id.tvDomainName)
        val tvWarningTitle = findViewById<TextView>(R.id.tvWebsiteWarningTitle)
        val tvWarningDesc = findViewById<TextView>(R.id.tvWebsiteWarningDesc)
        val tvCategory = findViewById<TextView>(R.id.tvWebsiteCategoryReason)
        val btnReturn = findViewById<Button>(R.id.btnWebsiteReturn)
        val btnOpenTracker = findViewById<Button>(R.id.btnWebsiteOpenTracker)

        tvDomain.text = domain
        tvCategory.text = "$category • NEET 2027 Study Session Active"

        if (strikes >= 5) {
            tvWarningTitle.text = "🚨 Warning $strikes/5 — $domain"
            tvWarningTitle.setTextColor(getColor(android.R.color.holo_red_light))
            tvWarningDesc.text = "5 attempts reached on this website. 5-Minute Focus Lockdown is now active."

            // Trigger full device lockdown
            LockdownManager.triggerLockdown(this, domain, "website", domain)
        } else {
            tvWarningTitle.text = "⚠️ Warning $strikes/5 — $domain"
            tvWarningTitle.setTextColor(getColor(android.R.color.holo_orange_light))
            tvWarningDesc.text = "Attempt $strikes/5 recorded. 5 attempts on this blocked site will trigger a 5-minute device lockdown."
        }

        btnReturn.setOnClickListener {
            navigateToMainApp()
        }

        btnOpenTracker.setOnClickListener {
            navigateToMainApp()
        }
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
}
