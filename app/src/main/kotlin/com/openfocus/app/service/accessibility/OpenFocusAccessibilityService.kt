package com.openfocus.app.service.accessibility

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

class OpenFocusAccessibilityService : AccessibilityService() {
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Accessibility event handler
    }

    override fun onInterrupt() {
        // Interrupt handler
    }
}
