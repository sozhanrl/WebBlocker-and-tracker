package com.openfocus.app.manager

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.os.Process
import org.json.JSONArray
import org.json.JSONObject

class UsageStatsTracker(private val context: Context) {

    fun hasUsageStatsPermission(): Boolean {
        val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager ?: return false
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                context.packageName
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    fun getAppUsageStats(startTimeMs: Long, endTimeMs: Long): JSONArray {
        if (!hasUsageStatsPermission()) {
            return JSONArray()
        }

        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            ?: return JSONArray()

        val stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startTimeMs,
            endTimeMs
        )

        val packageManager = context.packageManager
        val jsonArray = JSONArray()

        // Aggregate by package
        val usageMap = HashMap<String, Pair<Long, Long>>() // pkg -> Pair(totalTimeMs, lastTimeUsedMs)

        for (stat in stats) {
            if (stat.totalTimeInForeground > 0) {
                val existing = usageMap[stat.packageName]
                val totalTime = (existing?.first ?: 0L) + stat.totalTimeInForeground
                val lastUsed = maxOf(existing?.second ?: 0L, stat.lastTimeUsed)
                usageMap[stat.packageName] = Pair(totalTime, lastUsed)
            }
        }

        for ((pkg, data) in usageMap) {
            val appName = try {
                val appInfo = packageManager.getApplicationInfo(pkg, 0)
                packageManager.getApplicationLabel(appInfo).toString()
            } catch (e: PackageManager.NameNotFoundException) {
                pkg
            }

            val item = JSONObject().apply {
                put("packageName", pkg)
                put("appName", appName)
                put("totalTimeInForegroundMs", data.first)
                put("lastTimeUsedMs", data.second)
            }
            jsonArray.put(item)
        }

        return jsonArray
    }
}
