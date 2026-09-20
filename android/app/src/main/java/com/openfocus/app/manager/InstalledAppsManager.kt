package com.openfocus.app.manager

import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.util.Base64
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream

class InstalledAppsManager(private val context: Context) {

    companion object {
        private const val TAG = "InstalledAppsManager"
    }

    fun getInstalledLaunchableApps(includeSystemApps: Boolean = false): JSONArray {
        val packageManager = context.packageManager
        val prefs = context.getSharedPreferences("focus_blocker_prefs", Context.MODE_PRIVATE)
        val blockedPackages = prefs.getStringSet("blocked_packages", emptySet()) ?: emptySet()

        val mainIntent = Intent(Intent.ACTION_MAIN, null).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }

        val resolveInfos = packageManager.queryIntentActivities(mainIntent, 0)
        Log.d(TAG, "QueryIntentActivities found ${resolveInfos.size} launchable activities on device")

        val jsonArray = JSONArray()
        val seenPackages = HashSet<String>()
        val selfPackage = context.packageName
        seenPackages.add(selfPackage)

        val appList = ArrayList<JSONObject>()

        for (resolveInfo in resolveInfos) {
            try {
                val appInfo = resolveInfo.activityInfo.applicationInfo ?: continue
                val packageName = appInfo.packageName ?: continue

                if (seenPackages.contains(packageName)) continue
                seenPackages.add(packageName)

                val isSystemApp = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                if (isSystemApp && !includeSystemApps) {
                    continue
                }

                val appName = try {
                    packageManager.getApplicationLabel(appInfo).toString()
                } catch (e: Exception) {
                    packageName
                }

                val iconBase64 = try {
                    val drawable = packageManager.getApplicationIcon(appInfo)
                    drawableToBase64(drawable)
                } catch (e: Exception) {
                    ""
                }

                val category = categorizeApp(packageName, appName)
                val isBlocked = blockedPackages.contains(packageName)

                val appObj = JSONObject().apply {
                    put("packageName", packageName)
                    put("appName", appName)
                    put("isBlocked", isBlocked)
                    put("isSystemApp", isSystemApp)
                    put("category", category)
                    put("icon", iconBase64)
                }
                appList.add(appObj)
            } catch (e: Exception) {
                Log.e(TAG, "Error processing package: ${e.message}")
            }
        }

        // Sort alphabetically by app name
        appList.sortBy { it.optString("appName", "").lowercase() }
        for (item in appList) {
            jsonArray.put(item)
        }

        Log.d(TAG, "Returning ${jsonArray.length()} installed apps to frontend (${blockedPackages.size} blocked)")
        return jsonArray
    }

    private fun drawableToBase64(drawable: Drawable): String {
        return try {
            val width = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else 64
            val height = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else 64
            val bmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bmp)
            drawable.setBounds(0, 0, canvas.width, canvas.height)
            drawable.draw(canvas)

            val scaledBitmap = if (bmp.width > 64 || bmp.height > 64) {
                Bitmap.createScaledBitmap(bmp, 64, 64, true)
            } else {
                bmp
            }

            val outputStream = ByteArrayOutputStream()
            scaledBitmap.compress(Bitmap.CompressFormat.PNG, 85, outputStream)
            val byteArray = outputStream.toByteArray()
            "data:image/png;base64," + Base64.encodeToString(byteArray, Base64.NO_WRAP)
        } catch (e: Exception) {
            ""
        }
    }

    fun categorizeApp(packageName: String, appName: String): String {
        val lowerPkg = packageName.lowercase()
        val lowerName = appName.lowercase()

        return when {
            lowerPkg.contains("instagram") || lowerPkg.contains("snapchat") ||
            lowerPkg.contains("twitter") || lowerPkg.contains("facebook") ||
            lowerPkg.contains("tiktok") || lowerPkg.contains("reddit") ||
            lowerPkg.contains("threads") || lowerPkg.contains("pinterest") ||
            lowerPkg.contains("linkedin") || lowerName.contains("social") -> "Social Media"

            lowerPkg.contains("youtube") || lowerPkg.contains("netflix") ||
            lowerPkg.contains("primevideo") || lowerPkg.contains("hotstar") ||
            lowerPkg.contains("spotify") || lowerPkg.contains("twitch") ||
            lowerPkg.contains("disney") || lowerPkg.contains("vlc") ||
            lowerPkg.contains("music") || lowerPkg.contains("reels") ||
            lowerName.contains("video") || lowerName.contains("player") -> "Entertainment"

            lowerPkg.contains("whatsapp") || lowerPkg.contains("telegram") ||
            lowerPkg.contains("discord") || lowerPkg.contains("messenger") ||
            lowerPkg.contains("signal") || lowerPkg.contains("chat") ||
            lowerName.contains("message") -> "Messaging"

            lowerPkg.contains("chrome") || lowerPkg.contains("firefox") ||
            lowerPkg.contains("browser") || lowerPkg.contains("opera") ||
            lowerPkg.contains("brave") || lowerPkg.contains("edge") ||
            lowerPkg.contains("ucbrowser") || lowerName.contains("browser") -> "Browsers"

            lowerPkg.contains("pubg") || lowerPkg.contains("freefire") ||
            lowerPkg.contains("bgmi") || lowerPkg.contains("game") ||
            lowerPkg.contains("clash") || lowerPkg.contains("roblox") ||
            lowerPkg.contains("chess") || lowerPkg.contains("candycrush") ||
            lowerPkg.contains("codm") || lowerName.contains("game") -> "Games"

            lowerPkg.contains("amazon") || lowerPkg.contains("flipkart") ||
            lowerPkg.contains("myntra") || lowerPkg.contains("meesho") ||
            lowerPkg.contains("shopping") || lowerPkg.contains("zomato") ||
            lowerPkg.contains("swiggy") || lowerPkg.contains("blinkit") ||
            lowerPkg.contains("zepto") -> "Shopping & Food"

            else -> "Other Apps"
        }
    }
}
