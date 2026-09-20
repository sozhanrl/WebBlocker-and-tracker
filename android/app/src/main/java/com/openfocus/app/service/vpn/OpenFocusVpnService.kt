package com.openfocus.app.service.vpn

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import android.util.Log
import androidx.core.app.NotificationCompat
import com.openfocus.app.MainActivity
import com.openfocus.app.R
import com.openfocus.app.manager.BlockingStateManager
import com.openfocus.app.manager.LockdownManager
import com.openfocus.app.ui.screens.blockscreen.BlockScreenActivity
import com.openfocus.app.ui.screens.blockscreen.WebsiteBlockedActivity
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.nio.ByteBuffer
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean

/**
 * OpenFocusVpnService
 *
 * Real on-device DNS loopback VPN service for NEET Tracker / FocusForge.
 *
 * PRIVACY GUARANTEE:
 * - Operates 100% locally on device.
 * - Only intercepts DNS UDP port 53 packets to sinkhole configured distracting domains.
 * - Does NOT inspect HTTPS page content, capture passwords, or upload browsing history.
 */
class OpenFocusVpnService : VpnService(), Runnable {

    companion object {
        private const val TAG = "FocusVpnService"
        const val CHANNEL_ID = "focus_vpn_channel"
        const val NOTIFICATION_ID = 1002

        const val ACTION_START = "com.openfocus.app.action.START_VPN"
        const val ACTION_STOP = "com.openfocus.app.action.STOP_VPN"

        @Volatile
        var isVpnRunning: Boolean = false
            private set

        @Volatile
        var isStarting: Boolean = false
            private set

        @Volatile
        var lastVpnError: String? = null
            private set

        @Volatile
        var blockedQueriesCount: Int = 0
            private set

        @Volatile
        var anotherVpnActive: Boolean = false
            private set
    }

    private var vpnInterface: ParcelFileDescriptor? = null
    private var vpnThread: Thread? = null
    private val isRunning = AtomicBoolean(false)
    private lateinit var stateManager: BlockingStateManager
    private val domainDebounceMap = ConcurrentHashMap<String, Long>()

    private val upstreamDns = "1.1.1.1"
    private val upstreamDnsPort = 53

    override fun onCreate() {
        super.onCreate()
        stateManager = BlockingStateManager.getInstance(this)
        createNotificationChannel()
        Log.i(TAG, "OpenFocusVpnService initialized")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: ACTION_START

        if (action == ACTION_STOP) {
            Log.i(TAG, "Received STOP_VPN action")
            stopVpn()
            return START_NOT_STICKY
        }

        try {
            isStarting = true
            startForeground(NOTIFICATION_ID, buildVpnNotification())
            startVpnTunnel()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start VPN: ${e.message}", e)
            lastVpnError = e.message
            isVpnRunning = false
            isStarting = false
            stopSelf()
            return START_NOT_STICKY
        }

        return START_STICKY
    }

    private fun startVpnTunnel() {
        if (isRunning.get()) return

        try {
            val builder = Builder()
                .setSession("FocusForge Domain Filter")
                .addAddress("10.200.0.2", 24)
                .addDnsServer("10.200.0.1")
                .addRoute("10.200.0.1", 32)
                .addRoute("8.8.8.8", 32)
                .addRoute("8.8.4.4", 32)
                .addRoute("1.1.1.1", 32)
                .addRoute("1.0.0.1", 32)
                .addRoute("9.9.9.9", 32)
                .addRoute("208.67.222.222", 32)
                .addRoute("208.67.220.220", 32)
                .setMtu(1500)
                .setBlocking(true)

            vpnInterface = builder.establish()
            if (vpnInterface == null) {
                anotherVpnActive = true
                lastVpnError = "Another VPN application is already active on this device"
                Log.e(TAG, "Failed to establish VPN interface (another VPN is active)")
                isVpnRunning = false
                isStarting = false
                stopSelf()
                return
            }

            anotherVpnActive = false
            isRunning.set(true)
            isVpnRunning = true
            isStarting = false
            lastVpnError = null

            vpnThread = Thread(this, "FocusForgeVpnWorker").apply {
                priority = Thread.NORM_PRIORITY + 1
                start()
            }

            Log.i(TAG, "VPN loopback tunnel started successfully on 10.200.0.2:53")
        } catch (e: Exception) {
            Log.e(TAG, "Exception establishing VPN tunnel: ${e.message}", e)
            lastVpnError = e.message
            isVpnRunning = false
            isStarting = false
            stopSelf()
        }
    }

    override fun run() {
        val pfd = vpnInterface ?: return
        val inputStream = FileInputStream(pfd.fileDescriptor)
        val outputStream = FileOutputStream(pfd.fileDescriptor)
        val packet = ByteArray(32767)

        var upstreamSocket: DatagramSocket? = null
        try {
            upstreamSocket = DatagramSocket()
            protect(upstreamSocket)
            upstreamSocket.soTimeout = 2500
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open protected upstream DNS socket: ${e.message}")
        }

        while (isRunning.get() && !Thread.currentThread().isInterrupted) {
            try {
                val length = inputStream.read(packet)
                if (length <= 0) continue

                handleIpPacket(packet, length, outputStream, upstreamSocket)
            } catch (e: Exception) {
                if (!isRunning.get()) break
                Log.d(TAG, "VPN Packet read/process note: ${e.message}")
            }
        }

        try {
            upstreamSocket?.close()
            inputStream.close()
            outputStream.close()
        } catch (e: Exception) {
            // Ignore close exceptions
        }
        Log.i(TAG, "VPN Worker thread terminated")
    }

    private fun handleIpPacket(
        packet: ByteArray,
        length: Int,
        outputStream: FileOutputStream,
        upstreamSocket: DatagramSocket?
    ) {
        // IPv4 Header parsing
        val version = (packet[0].toInt() shr 4) and 0x0F
        if (version != 4) return // Focus on IPv4 DNS

        val ihl = (packet[0].toInt() and 0x0F) * 4
        if (length < ihl + 8) return

        val protocol = packet[9].toInt() and 0xFF
        if (protocol != 17) return // UDP only (17)

        // UDP Header
        val srcPort = ((packet[ihl].toInt() and 0xFF) shl 8) or (packet[ihl + 1].toInt() and 0xFF)
        val dstPort = ((packet[ihl + 2].toInt() and 0xFF) shl 8) or (packet[ihl + 3].toInt() and 0xFF)

        // Intercept DNS destination port 53
        if (dstPort != 53) return

        val udpPayloadOffset = ihl + 8
        val udpPayloadLength = length - udpPayloadOffset
        if (udpPayloadLength < 12) return // Minimum DNS header is 12 bytes

        val dnsData = ByteArray(udpPayloadLength)
        System.arraycopy(packet, udpPayloadOffset, dnsData, 0, udpPayloadLength)

        // Extract queried domain from question section
        val domain = extractDomainName(dnsData, 12) ?: return
        val normalizedDomain = normalizeDomain(domain)

        val isBlocked = stateManager.isDomainBlocked(normalizedDomain)

        if (isBlocked) {
            blockedQueriesCount++
            val now = System.currentTimeMillis()
            val lastBlocked = domainDebounceMap[normalizedDomain] ?: 0L

            if (now - lastBlocked > 2000L) {
                domainDebounceMap[normalizedDomain] = now

                // Strike tracking in SharedPreferences "focus_blocker_prefs" ("violations:<domain>")
                val strikes = LockdownManager.incrementStrikes(this, normalizedDomain)
                val warningResult = stateManager.recordBlockedAttempt("website", normalizedDomain, domain)

                Log.w(TAG, "🚫 DNS SINKHOLE: Intercepted '$domain' (norm: '$normalizedDomain') -> 127.0.0.1 [Strike $strikes/5]")

                // Launch lightweight WebsiteBlockedActivity from Service context with FLAG_ACTIVITY_NEW_TASK
                try {
                    val blockIntent = Intent(this, WebsiteBlockedActivity::class.java).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                        putExtra(WebsiteBlockedActivity.EXTRA_DOMAIN, domain)
                        putExtra(WebsiteBlockedActivity.EXTRA_STRIKE_COUNT, strikes)
                        putExtra(WebsiteBlockedActivity.EXTRA_CATEGORY, "Distracting Website")
                    }
                    startActivity(blockIntent)
                } catch (e: Exception) {
                    Log.e(TAG, "Error launching WebsiteBlockedActivity from VPN: ${e.message}")
                }

                // If 5th strike reached, trigger device lockdown
                if (strikes >= 5) {
                    LockdownManager.triggerLockdown(this, normalizedDomain, "website", domain)
                }
            }

            // Synthesize instant A-record DNS response pointing to 127.0.0.1
            val dnsResponse = buildDnsBlockResponse(dnsData)
            val fullResponsePacket = wrapInUdpIpPacket(packet, ihl, srcPort, dstPort, dnsResponse)

            synchronized(outputStream) {
                try {
                    outputStream.write(fullResponsePacket)
                    outputStream.flush()
                } catch (e: Exception) {
                    Log.d(TAG, "Error writing sinkhole packet: ${e.message}")
                }
            }
        } else if (upstreamSocket != null) {
            // Forward legitimate query to upstream DNS (1.1.1.1:53)
            try {
                val upstreamAddress = InetAddress.getByName(upstreamDns)
                val forwardPacket = DatagramPacket(dnsData, dnsData.size, upstreamAddress, upstreamDnsPort)
                upstreamSocket.send(forwardPacket)

                val responseBuf = ByteArray(4096)
                val receivePacket = DatagramPacket(responseBuf, responseBuf.size)
                upstreamSocket.receive(receivePacket)

                val upstreamDnsData = ByteArray(receivePacket.length)
                System.arraycopy(responseBuf, 0, upstreamDnsData, 0, receivePacket.length)

                val fullResponsePacket = wrapInUdpIpPacket(packet, ihl, srcPort, dstPort, upstreamDnsData)
                synchronized(outputStream) {
                    outputStream.write(fullResponsePacket)
                    outputStream.flush()
                }
            } catch (e: Exception) {
                // Upstream timeout or network error
            }
        }
    }

    private fun normalizeDomain(domain: String): String {
        var clean = domain.trim().lowercase()
        if (clean.endsWith(".")) {
            clean = clean.substring(0, clean.length - 1)
        }
        if (clean.startsWith("www.")) {
            clean = clean.substring(4)
        }
        if (clean.startsWith("m.")) {
            clean = clean.substring(2)
        }
        if (clean.startsWith("amp.")) {
            clean = clean.substring(4)
        }
        return clean
    }

    private fun extractDomainName(dnsData: ByteArray, startOffset: Int): String? {
        val sb = StringBuilder()
        var pos = startOffset
        while (pos < dnsData.size) {
            val len = dnsData[pos].toInt() and 0xFF
            if (len == 0) break
            if (len > 63) return null // Compression pointer in question is abnormal

            pos++
            if (pos + len > dnsData.size) return null

            if (sb.isNotEmpty()) sb.append(".")
            sb.append(String(dnsData, pos, len, Charsets.US_ASCII))
            pos += len
        }
        return sb.toString()
    }

    private fun buildDnsBlockResponse(queryDns: ByteArray): ByteArray {
        val buffer = ByteBuffer.allocate(queryDns.size + 16)

        // Transaction ID (2 bytes)
        buffer.put(queryDns[0])
        buffer.put(queryDns[1])

        // Flags (2 bytes): Standard query response, No error (0x8180)
        buffer.put(0x81.toByte())
        buffer.put(0x80.toByte())

        // Questions Count (2 bytes)
        buffer.put(queryDns[4])
        buffer.put(queryDns[5])

        // Answer RRs (2 bytes) -> 1 Answer
        buffer.put(0x00.toByte())
        buffer.put(0x01.toByte())

        // Authority RRs (2 bytes) -> 0
        buffer.put(0x00.toByte())
        buffer.put(0x00.toByte())

        // Additional RRs (2 bytes) -> 0
        buffer.put(0x00.toByte())
        buffer.put(0x00.toByte())

        // Copy original question section
        val questionSectionLength = queryDns.size - 12
        buffer.put(queryDns, 12, questionSectionLength)

        // Answer Section:
        // Name pointer pointing to question (0xC00C)
        buffer.put(0xC0.toByte())
        buffer.put(0x0C.toByte())

        // Type A (0x0001)
        buffer.put(0x00.toByte())
        buffer.put(0x01.toByte())

        // Class IN (0x0001)
        buffer.put(0x00.toByte())
        buffer.put(0x01.toByte())

        // TTL: 60 seconds (0x0000003C)
        buffer.put(0x00.toByte())
        buffer.put(0x00.toByte())
        buffer.put(0x00.toByte())
        buffer.put(0x3C.toByte())

        // Data Length: 4 bytes for IPv4 (0x0004)
        buffer.put(0x00.toByte())
        buffer.put(0x04.toByte())

        // IP Address: 127.0.0.1 (Sinkhole loopback)
        buffer.put(127.toByte())
        buffer.put(0.toByte())
        buffer.put(0.toByte())
        buffer.put(1.toByte())

        return buffer.array()
    }

    private fun wrapInUdpIpPacket(
        originalPacket: ByteArray,
        ihl: Int,
        srcPort: Int,
        dstPort: Int,
        udpPayload: ByteArray
    ): ByteArray {
        val totalIpLength = ihl + 8 + udpPayload.size
        val outPacket = ByteArray(totalIpLength)

        // Copy IP Header
        System.arraycopy(originalPacket, 0, outPacket, 0, ihl)

        // Swap Source IP and Destination IP
        System.arraycopy(originalPacket, 16, outPacket, 12, 4) // Destination becomes Source
        System.arraycopy(originalPacket, 12, outPacket, 16, 4) // Source becomes Destination

        // Total Length
        outPacket[2] = ((totalIpLength shr 8) and 0xFF).toByte()
        outPacket[3] = (totalIpLength and 0xFF).toByte()

        // Recalculate IP Checksum
        outPacket[10] = 0
        outPacket[11] = 0
        val ipChecksum = computeIpChecksum(outPacket, ihl)
        outPacket[10] = ((ipChecksum shr 8) and 0xFF).toByte()
        outPacket[11] = (ipChecksum and 0xFF).toByte()

        // UDP Header: Swap Ports
        outPacket[ihl] = ((dstPort shr 8) and 0xFF).toByte()
        outPacket[ihl + 1] = (dstPort and 0xFF).toByte()
        outPacket[ihl + 2] = ((srcPort shr 8) and 0xFF).toByte()
        outPacket[ihl + 3] = (srcPort and 0xFF).toByte()

        val udpLength = 8 + udpPayload.size
        outPacket[ihl + 4] = ((udpLength shr 8) and 0xFF).toByte()
        outPacket[ihl + 5] = (udpLength and 0xFF).toByte()
        outPacket[ihl + 6] = 0 // Checksum (0 is valid in IPv4 UDP)
        outPacket[ihl + 7] = 0

        // Copy Payload
        System.arraycopy(udpPayload, 0, outPacket, ihl + 8, udpPayload.size)

        return outPacket
    }

    private fun computeIpChecksum(header: ByteArray, length: Int): Int {
        var sum = 0L
        var i = 0
        while (i < length) {
            val word = ((header[i].toInt() and 0xFF) shl 8) or (header[i + 1].toInt() and 0xFF)
            sum += word
            i += 2
        }
        while (sum shr 16 > 0) {
            sum = (sum and 0xFFFF) + (sum shr 16)
        }
        return (sum.inv() and 0xFFFF).toInt()
    }

    private fun stopVpn() {
        isRunning.set(false)
        isVpnRunning = false
        isStarting = false

        try {
            vpnThread?.interrupt()
            vpnInterface?.close()
            vpnInterface = null
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping VPN: ${e.message}")
        }

        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
        Log.i(TAG, "VPN service stopped successfully")
    }

    override fun onDestroy() {
        super.onDestroy()
        stopVpn()
    }

    private fun buildVpnNotification(): android.app.Notification {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            notificationIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("FocusForge Domain Blocker Active")
            .setContentText("On-device loopback DNS filter protecting your focus session")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Focus Website Blocker VPN",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Background status for on-device DNS domain blocker"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }
}
