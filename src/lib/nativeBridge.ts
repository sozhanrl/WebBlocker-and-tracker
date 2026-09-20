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

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const getNativeBridge = (): FocusBlockerPluginInterface => {
  return FocusBlocker;
};
