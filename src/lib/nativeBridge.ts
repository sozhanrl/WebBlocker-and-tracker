import { Capacitor, registerPlugin } from '@capacitor/core';

export interface InstalledApp {
  packageName: string;
  appName: string;
  icon?: string; // base64 data url (data:image/png;base64,...)
  category?: string;
  isSystemApp?: boolean;
  isBlocked?: boolean;
}

export interface AppUsageStat {
  packageName: string;
  appName?: string;
  totalTimeInForegroundMs: number; // Milliseconds
  lastTimeUsedMs: number; // Unix timestamp
  launchCount?: number;
}

export interface PermissionStatus {
  hasUsageStats: boolean;
  hasAccessibility: boolean;
  isAccessibilityRunning?: boolean;
  hasNotification: boolean;
  hasBatteryOptimizationIgnored: boolean;
  hasVpnPermission?: boolean;
  isVpnRunning?: boolean;
  isVpnStarting?: boolean;
  anotherVpnActive?: boolean;
  blockedDomainsCount?: number;
  lastVpnError?: string;
  hasExactAlarm?: boolean;
  hasDeviceAdmin?: boolean;
  isLockoutActive?: boolean;
  lockoutRemainingSec?: number;
}

export interface WarningStatusResult {
  targetId: string;
  targetType: string;
  warningCount: number;
  maxWarnings: number;
  lastWarningTimeMs: number;
  lockoutCount: number;
  lastLockoutTimeMs: number;
}

export interface WarningRecordResult {
  warningNumber: number;
  maxWarnings: number;
  isLockoutTriggered: boolean;
  lockoutRemainingSec: number;
  targetId: string;
  targetType: string;
  targetName: string;
}

export interface LockoutStatusResult {
  isLockoutActive: boolean;
  lockoutUntilMs: number;
  remainingSeconds: number;
  targetId?: string;
  targetType?: string;
  targetName?: string;
  subjectName?: string;
}

export interface BlockingStatusResult {
  isBlockingActive: boolean;
  isFocusSessionActive: boolean;
  isFocusSessionPaused: boolean;
  isStrictMode: boolean;
  activeSubject: string;
  blockedAppsCount: number;
  blockedDomainsCount: number;
  isAdultShieldActive: boolean;
  isLockoutActive: boolean;
  lockoutRemainingSec: number;
}

export interface BlockedEventItem {
  id: string;
  timestamp: number;
  eventType: string;
  targetType: string;
  targetId: string;
  targetName: string;
  warningNumber: number;
  subject?: string;
}

export interface FocusBlockerPluginInterface {
  isNative(): Promise<{ isNative: boolean; platform: string }>;
  getInstalledApps(options?: { includeSystemApps?: boolean }): Promise<{ apps: InstalledApp[] }>;
  getUsageStats(options: { startTimeMs: number; endTimeMs: number }): Promise<{ stats: AppUsageStat[] }>;
  updateBlockList(options: {
    blockedPackages?: string[];
    blockedDomains?: string[];
    isStrict?: boolean;
    allowEmergencyUnlock?: boolean;
    activeSubject?: string;
    isBlockingActive?: boolean;
    isAdultBlockingEnabled?: boolean;
  }): Promise<{ success: boolean }>;
  updateBlockedApps(options: { blockedPackages: string[] }): Promise<{ success: boolean }>;
  updateBlockedDomains(options: { blockedDomains: string[] }): Promise<{ success: boolean }>;
  getBlockingStatus(): Promise<BlockingStatusResult>;
  getWarningStatus(options: { targetType: string; targetId: string }): Promise<WarningStatusResult>;
  recordBlockedAttempt(options: { targetType: string; targetId: string; targetName?: string }): Promise<WarningRecordResult>;
  startFiveMinuteLockout(options: { targetType?: string; targetId?: string; targetName?: string; durationMinutes?: number }): Promise<LockoutStatusResult>;
  getLockoutStatus(): Promise<LockoutStatusResult>;
  cancelLockoutIfAllowed(): Promise<{ success: boolean }>;
  getBlockedEvents(): Promise<{ events: BlockedEventItem[] }>;
  resetDailyWarnings(): Promise<{ success: boolean }>;
  startFocusSession(options: {
    durationMinutes: number;
    subjectName: string;
    isStrict: boolean;
    remainingSeconds: number;
  }): Promise<{ success: boolean }>;
  stopFocusSession(): Promise<{ success: boolean }>;
  checkPermissions(): Promise<PermissionStatus>;
  getDiagnostics(): Promise<PermissionStatus>;
  getStrikeCounts(): Promise<{ strikes: Record<string, number>; isLockdownActive?: boolean; lockdownRemainingSec?: number }>;
  startVpnProtection(): Promise<{ started: boolean; needsPermission: boolean }>;
  stopVpnProtection(): Promise<{ stopped: boolean }>;
  requestPermission(options: {
    type: 'usage_stats' | 'accessibility' | 'notification' | 'battery_optimization' | 'vpn' | 'exact_alarm' | 'device_admin';
  }): Promise<{ granted: boolean }>;
  openAppSettings(): Promise<void>;
}

// Register native plugin with Capacitor
const FocusBlocker = registerPlugin<FocusBlockerPluginInterface>('FocusBlocker', {
  web: () => ({
    isNative: async () => ({ isNative: false, platform: 'web' }),
    getInstalledApps: async () => ({ apps: [] }),
    getUsageStats: async () => ({ stats: [] }),
    updateBlockList: async () => ({ success: true }),
    updateBlockedApps: async () => ({ success: true }),
    updateBlockedDomains: async () => ({ success: true }),
    getBlockingStatus: async () => ({
      isBlockingActive: true,
      isFocusSessionActive: false,
      isFocusSessionPaused: false,
      isStrictMode: false,
      activeSubject: 'NEET 2027 Preparation',
      blockedAppsCount: 0,
      blockedDomainsCount: 0,
      isAdultShieldActive: false,
      isLockoutActive: false,
      lockoutRemainingSec: 0
    }),
    getWarningStatus: async (opts: { targetType: string; targetId: string }) => ({
      targetId: opts.targetId,
      targetType: opts.targetType,
      warningCount: 0,
      maxWarnings: 5,
      lastWarningTimeMs: 0,
      lockoutCount: 0,
      lastLockoutTimeMs: 0
    }),
    recordBlockedAttempt: async (opts: { targetType: string; targetId: string; targetName?: string }) => ({
      warningNumber: 1,
      maxWarnings: 5,
      isLockoutTriggered: false,
      lockoutRemainingSec: 0,
      targetId: opts.targetId,
      targetType: opts.targetType,
      targetName: opts.targetName || opts.targetId
    }),
    startFiveMinuteLockout: async (opts?: { targetType?: string; targetId?: string; targetName?: string; durationMinutes?: number }) => ({
      isLockoutActive: true,
      lockoutUntilMs: Date.now() + 300000,
      remainingSeconds: 300,
      targetId: opts?.targetId,
      targetType: opts?.targetType,
      targetName: opts?.targetName
    }),
    getLockoutStatus: async () => ({
      isLockoutActive: false,
      lockoutUntilMs: 0,
      remainingSeconds: 0
    }),
    cancelLockoutIfAllowed: async () => ({ success: true }),
    getBlockedEvents: async () => ({ events: [] }),
    resetDailyWarnings: async () => ({ success: true }),
    getStrikeCounts: async () => ({ strikes: {}, isLockdownActive: false, lockdownRemainingSec: 0 }),
    startFocusSession: async () => ({ success: true }),
    stopFocusSession: async () => ({ success: true }),
    checkPermissions: async () => ({
      hasUsageStats: false,
      hasAccessibility: false,
      isAccessibilityRunning: false,
      hasNotification: false,
      hasBatteryOptimizationIgnored: false,
      hasVpnPermission: false,
      isVpnRunning: false,
      isVpnStarting: false,
      anotherVpnActive: false,
      blockedDomainsCount: 0,
      lastVpnError: '',
      hasExactAlarm: false,
      hasDeviceAdmin: false,
      isLockoutActive: false,
      lockoutRemainingSec: 0
    }),
    getDiagnostics: async () => ({
      hasUsageStats: false,
      hasAccessibility: false,
      isAccessibilityRunning: false,
      hasNotification: false,
      hasBatteryOptimizationIgnored: false,
      hasVpnPermission: false,
      isVpnRunning: false,
      isVpnStarting: false,
      anotherVpnActive: false,
      blockedDomainsCount: 0,
      lastVpnError: '',
      hasExactAlarm: false,
      hasDeviceAdmin: false,
      isLockoutActive: false,
      lockoutRemainingSec: 0
    }),
    startVpnProtection: async () => ({ started: false, needsPermission: true }),
    stopVpnProtection: async () => ({ stopped: true }),
    requestPermission: async () => ({ granted: true }),
    openAppSettings: async () => {}
  })
});

// Android JavaScript Interface adapter for native WebView
class AndroidBridgeAdapter implements FocusBlockerPluginInterface {
  private bridge: any;

  constructor() {
    this.bridge = (window as any).AndroidBridge;
  }

  private safeParse<T>(jsonStr: any, fallback: T): T {
    if (typeof jsonStr !== 'string') return jsonStr || fallback;
    try {
      return JSON.parse(jsonStr) as T;
    } catch {
      return fallback;
    }
  }

  async isNative(): Promise<{ isNative: boolean; platform: string }> {
    if (this.bridge?.isNative) {
      return this.safeParse(this.bridge.isNative(), { isNative: true, platform: 'android' });
    }
    return { isNative: true, platform: 'android' };
  }

  async getInstalledApps(options?: { includeSystemApps?: boolean }): Promise<{ apps: InstalledApp[] }> {
    if (this.bridge?.getInstalledApps) {
      return this.safeParse(this.bridge.getInstalledApps(options?.includeSystemApps ?? false), { apps: [] });
    }
    return { apps: [] };
  }

  async getUsageStats(options: { startTimeMs: number; endTimeMs: number }): Promise<{ stats: AppUsageStat[] }> {
    if (this.bridge?.getUsageStats) {
      return this.safeParse(this.bridge.getUsageStats(options.startTimeMs, options.endTimeMs), { stats: [] });
    }
    return { stats: [] };
  }

  async updateBlockList(options: {
    blockedPackages?: string[];
    blockedDomains?: string[];
    isStrict?: boolean;
    allowEmergencyUnlock?: boolean;
    activeSubject?: string;
    isBlockingActive?: boolean;
    isAdultBlockingEnabled?: boolean;
  }): Promise<{ success: boolean }> {
    if (this.bridge?.updateBlockList) {
      return this.safeParse(this.bridge.updateBlockList(JSON.stringify(options)), { success: true });
    }
    return { success: true };
  }

  async updateBlockedApps(options: { blockedPackages: string[] }): Promise<{ success: boolean }> {
    if (this.bridge?.updateBlockedApps) {
      return this.safeParse(this.bridge.updateBlockedApps(JSON.stringify(options.blockedPackages)), { success: true });
    }
    return { success: true };
  }

  async updateBlockedDomains(options: { blockedDomains: string[] }): Promise<{ success: boolean }> {
    if (this.bridge?.updateBlockedDomains) {
      return this.safeParse(this.bridge.updateBlockedDomains(JSON.stringify(options.blockedDomains)), { success: true });
    }
    return { success: true };
  }

  async getBlockingStatus(): Promise<BlockingStatusResult> {
    if (this.bridge?.getBlockingStatus) {
      return this.safeParse(this.bridge.getBlockingStatus(), {
        isBlockingActive: true,
        isFocusSessionActive: false,
        isFocusSessionPaused: false,
        isStrictMode: false,
        activeSubject: 'NEET 2027 Preparation',
        blockedAppsCount: 0,
        blockedDomainsCount: 0,
        isAdultShieldActive: false,
        isLockoutActive: false,
        lockoutRemainingSec: 0
      });
    }
    return {
      isBlockingActive: true,
      isFocusSessionActive: false,
      isFocusSessionPaused: false,
      isStrictMode: false,
      activeSubject: 'NEET 2027 Preparation',
      blockedAppsCount: 0,
      blockedDomainsCount: 0,
      isAdultShieldActive: false,
      isLockoutActive: false,
      lockoutRemainingSec: 0
    };
  }

  async getWarningStatus(options: { targetType: string; targetId: string }): Promise<WarningStatusResult> {
    if (this.bridge?.getWarningStatus) {
      return this.safeParse(this.bridge.getWarningStatus(options.targetType, options.targetId), {
        targetId: options.targetId,
        targetType: options.targetType,
        warningCount: 0,
        maxWarnings: 5,
        lastWarningTimeMs: 0,
        lockoutCount: 0,
        lastLockoutTimeMs: 0
      });
    }
    return {
      targetId: options.targetId,
      targetType: options.targetType,
      warningCount: 0,
      maxWarnings: 5,
      lastWarningTimeMs: 0,
      lockoutCount: 0,
      lastLockoutTimeMs: 0
    };
  }

  async recordBlockedAttempt(options: { targetType: string; targetId: string; targetName?: string }): Promise<WarningRecordResult> {
    if (this.bridge?.recordBlockedAttempt) {
      return this.safeParse(this.bridge.recordBlockedAttempt(options.targetType, options.targetId, options.targetName || options.targetId), {
        warningNumber: 1,
        maxWarnings: 5,
        isLockoutTriggered: false,
        lockoutRemainingSec: 0,
        targetId: options.targetId,
        targetType: options.targetType,
        targetName: options.targetName || options.targetId
      });
    }
    return {
      warningNumber: 1,
      maxWarnings: 5,
      isLockoutTriggered: false,
      lockoutRemainingSec: 0,
      targetId: options.targetId,
      targetType: options.targetType,
      targetName: options.targetName || options.targetId
    };
  }

  async startFiveMinuteLockout(options?: { targetType?: string; targetId?: string; targetName?: string; durationMinutes?: number }): Promise<LockoutStatusResult> {
    if (this.bridge?.startFiveMinuteLockout) {
      return this.safeParse(this.bridge.startFiveMinuteLockout(
        options?.targetType || 'app',
        options?.targetId || 'manual',
        options?.targetName || 'Focus Lockout',
        options?.durationMinutes || 5
      ), {
        isLockoutActive: true,
        lockoutUntilMs: Date.now() + (options?.durationMinutes || 5) * 60000,
        remainingSeconds: (options?.durationMinutes || 5) * 60
      });
    }
    return {
      isLockoutActive: true,
      lockoutUntilMs: Date.now() + 300000,
      remainingSeconds: 300
    };
  }

  async getLockoutStatus(): Promise<LockoutStatusResult> {
    if (this.bridge?.getLockoutStatus) {
      return this.safeParse(this.bridge.getLockoutStatus(), {
        isLockoutActive: false,
        lockoutUntilMs: 0,
        remainingSeconds: 0
      });
    }
    return {
      isLockoutActive: false,
      lockoutUntilMs: 0,
      remainingSeconds: 0
    };
  }

  async cancelLockoutIfAllowed(): Promise<{ success: boolean }> {
    if (this.bridge?.cancelLockoutIfAllowed) {
      return this.safeParse(this.bridge.cancelLockoutIfAllowed(), { success: true });
    }
    return { success: true };
  }

  async getBlockedEvents(): Promise<{ events: BlockedEventItem[] }> {
    if (this.bridge?.getBlockedEvents) {
      return this.safeParse(this.bridge.getBlockedEvents(), { events: [] });
    }
    return { events: [] };
  }

  async resetDailyWarnings(): Promise<{ success: boolean }> {
    if (this.bridge?.resetDailyWarnings) {
      return this.safeParse(this.bridge.resetDailyWarnings(), { success: true });
    }
    return { success: true };
  }

  async startFocusSession(options: {
    durationMinutes: number;
    subjectName: string;
    isStrict: boolean;
    remainingSeconds: number;
  }): Promise<{ success: boolean }> {
    if (this.bridge?.startFocusSession) {
      return this.safeParse(this.bridge.startFocusSession(
        options.durationMinutes,
        options.subjectName,
        options.isStrict,
        options.remainingSeconds
      ), { success: true });
    }
    return { success: true };
  }

  async stopFocusSession(): Promise<{ success: boolean }> {
    if (this.bridge?.stopFocusSession) {
      return this.safeParse(this.bridge.stopFocusSession(), { success: true });
    }
    return { success: true };
  }

  async checkPermissions(): Promise<PermissionStatus> {
    if (this.bridge?.checkPermissions) {
      return this.safeParse(this.bridge.checkPermissions(), {
        hasUsageStats: false,
        hasAccessibility: false,
        isAccessibilityRunning: false,
        hasNotification: false,
        hasBatteryOptimizationIgnored: false,
        hasVpnPermission: false,
        isVpnRunning: false,
        isVpnStarting: false,
        anotherVpnActive: false,
        blockedDomainsCount: 0,
        lastVpnError: '',
        hasExactAlarm: false,
        hasDeviceAdmin: false,
        isLockoutActive: false,
        lockoutRemainingSec: 0
      });
    }
    return {
      hasUsageStats: false,
      hasAccessibility: false,
      isAccessibilityRunning: false,
      hasNotification: false,
      hasBatteryOptimizationIgnored: false,
      hasVpnPermission: false,
      isVpnRunning: false,
      isVpnStarting: false,
      anotherVpnActive: false,
      blockedDomainsCount: 0,
      lastVpnError: '',
      hasExactAlarm: false,
      hasDeviceAdmin: false,
      isLockoutActive: false,
      lockoutRemainingSec: 0
    };
  }

  async getDiagnostics(): Promise<PermissionStatus> {
    return this.checkPermissions();
  }

  async getStrikeCounts(): Promise<{ strikes: Record<string, number>; isLockdownActive?: boolean; lockdownRemainingSec?: number }> {
    if (this.bridge?.getStrikeCounts) {
      return this.safeParse(this.bridge.getStrikeCounts(), { strikes: {}, isLockdownActive: false, lockdownRemainingSec: 0 });
    }
    return { strikes: {}, isLockdownActive: false, lockdownRemainingSec: 0 };
  }

  async startVpnProtection(): Promise<{ started: boolean; needsPermission: boolean }> {
    if (this.bridge?.startVpnProtection) {
      return this.safeParse(this.bridge.startVpnProtection(), { started: false, needsPermission: true });
    }
    return { started: false, needsPermission: true };
  }

  async stopVpnProtection(): Promise<{ stopped: boolean }> {
    if (this.bridge?.stopVpnProtection) {
      return this.safeParse(this.bridge.stopVpnProtection(), { stopped: true });
    }
    return { stopped: true };
  }

  async requestPermission(options: {
    type: 'usage_stats' | 'accessibility' | 'notification' | 'battery_optimization' | 'vpn' | 'exact_alarm' | 'device_admin';
  }): Promise<{ granted: boolean }> {
    if (this.bridge?.requestPermission) {
      return this.safeParse(this.bridge.requestPermission(options.type), { granted: true });
    }
    return { granted: true };
  }

  async openAppSettings(): Promise<void> {
    if (this.bridge?.openAppSettings) {
      this.bridge.openAppSettings();
    }
  }
}

export const isNativePlatform = (): boolean => {
  return typeof (window as any).AndroidBridge !== 'undefined' || Capacitor.isNativePlatform();
};

export const getNativeBridge = (): FocusBlockerPluginInterface => {
  if (typeof (window as any).AndroidBridge !== 'undefined') {
    return new AndroidBridgeAdapter();
  }
  return FocusBlocker;
};

