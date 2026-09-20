package com.openfocus.app

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * DomainNormalizationTest
 *
 * Verifies domain normalization and subdomain matching logic
 * for the on-device DNS filter.
 */
class DomainNormalizationTest {

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

    private fun isDomainBlocked(queryDomain: String, blockedSet: Set<String>): Boolean {
        val cleanDomain = normalizeDomain(queryDomain)
        for (blocked in blockedSet) {
            val cleanBlocked = normalizeDomain(blocked)
            if (cleanBlocked.isEmpty()) continue
            if (cleanDomain == cleanBlocked || cleanDomain.endsWith(".$cleanBlocked")) {
                return true
            }
        }
        return false
    }

    @Test
    fun testDomainNormalization() {
        assertEquals("youtube.com", normalizeDomain("www.youtube.com"))
        assertEquals("youtube.com", normalizeDomain("m.youtube.com"))
        assertEquals("youtube.com", normalizeDomain("amp.youtube.com"))
        assertEquals("youtube.com", normalizeDomain("youtube.com."))
        assertEquals("asurascans.com", normalizeDomain("www.asurascans.com."))
    }

    @Test
    fun testSubdomainMatching() {
        val blockedList = setOf("youtube.com", "asurascans.com", "instagram.com")

        // Direct apex match
        assertTrue(isDomainBlocked("youtube.com", blockedList))
        assertTrue(isDomainBlocked("asurascans.com", blockedList))
        assertTrue(isDomainBlocked("instagram.com", blockedList))

        // Normalized prefixes
        assertTrue(isDomainBlocked("www.youtube.com", blockedList))
        assertTrue(isDomainBlocked("m.asurascans.com", blockedList))

        // Deep subdomains
        assertTrue(isDomainBlocked("music.youtube.com", blockedList))
        assertTrue(isDomainBlocked("api.v2.instagram.com", blockedList))
        assertTrue(isDomainBlocked("cdn.asurascans.com", blockedList))

        // Should not block unrelated domains that contain substring
        assertFalse(isDomainBlocked("notyoutube.com", blockedList))
        assertFalse(isDomainBlocked("myoutube.com", blockedList))
        assertFalse(isDomainBlocked("google.com", blockedList))
        assertFalse(isDomainBlocked("neetprep.com", blockedList))
    }

    @Test
    fun testFiveWarningPolicyProgression() {
        var warningCount = 0
        val maxWarnings = 5
        var lockoutTriggered = false

        for (attempt in 1..6) {
            warningCount++
            if (warningCount >= maxWarnings) {
                lockoutTriggered = true
            }

            if (attempt in 1..4) {
                assertFalse("Lockout should not be triggered before 5th attempt", lockoutTriggered)
                assertEquals(attempt, warningCount)
            } else if (attempt == 5) {
                assertTrue("Lockout must be triggered at 5th attempt", lockoutTriggered)
                assertEquals(5, warningCount)
            }
        }
    }
}
