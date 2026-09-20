import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { NeetSubject } from '../types';
import { useApp } from './AppContext';
import confetti from 'canvas-confetti';
import { getNativeBridge } from '../lib/nativeBridge';

interface CompletedSessionStats {
  durationMinutes: number;
  subject?: NeetSubject;
  chapterTitle?: string;
  distractionsPrevented: number;
}

interface FocusTimerContextType {
  isRunning: boolean;
  isPaused: boolean;
  totalDurationSeconds: number;
  remainingSeconds: number;
  progressPercent: number;
  subject: NeetSubject;
  chapterTitle: string;
  taskTitle: string;
  isStrictMode: boolean;
  isBreakMode: boolean;
  distractionsPreventedCount: number;
  // Actions
  startFocusSession: (
    durationMinutes: number,
    subject?: NeetSubject,
    chapterTitle?: string,
    taskTitle?: string,
    isStrictMode?: boolean
  ) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  cancelSession: () => void;
  finishSession: () => void;
  incrementDistractionPrevented: () => void;
  // Emergency unlock
  isEmergencyUnlocking: boolean;
  emergencyUnlockSecondsLeft: number;
  startEmergencyUnlock: () => void;
  cancelEmergencyUnlock: () => void;
  // Session completion dialog
  completedStats: CompletedSessionStats | null;
  closeCompletionModal: () => void;
}

const FocusTimerContext = createContext<FocusTimerContextType | undefined>(undefined);

export const FocusTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addStudySession, updateUserProfile, settings } = useApp();

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [subject, setSubject] = useState<NeetSubject>('Physics');
  const [chapterTitle, setChapterTitle] = useState('Kinematics & Laws of Motion');
  const [taskTitle, setTaskTitle] = useState('');
  const [isStrictMode, setIsStrictMode] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [distractionsPreventedCount, setDistractionsPreventedCount] = useState(0);

  // Emergency unlock state
  const [isEmergencyUnlocking, setIsEmergencyUnlocking] = useState(false);
  const [emergencyUnlockSecondsLeft, setEmergencyUnlockSecondsLeft] = useState(30);

  // Completed stats modal
  const [completedStats, setCompletedStats] = useState<CompletedSessionStats | null>(null);

  const timerRef = useRef<any>(null);
  const emergencyTimerRef = useRef<any>(null);

  // Timer Tick
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused]);

  // Handle Session Complete
  const handleTimerComplete = () => {
    setIsRunning(false);
    setIsPaused(false);

    const minutesCompleted = Math.round(totalDurationSeconds / 60);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Confetti fallback
    }

    setCompletedStats({
      durationMinutes: minutesCompleted,
      subject,
      chapterTitle,
      distractionsPrevented: distractionsPreventedCount
    });

    // Automatically log session in history
    addStudySession({
      subject,
      chapterTitle,
      durationMinutes: minutesCompleted,
      completedAt: new Date().toISOString(),
      difficulty: 'Moderate',
      completedTarget: true,
      notes: taskTitle ? `Completed task: ${taskTitle}` : 'Scheduled focus session finished.'
    });

    getNativeBridge().stopFocusSession().catch(console.warn);
  };

  const startFocusSession = (
    durationMinutes: number,
    subj: NeetSubject = 'Physics',
    chapTitle: string = 'Kinematics',
    task: string = '',
    strict: boolean = false
  ) => {
    const totalSecs = durationMinutes * 60;
    setTotalDurationSeconds(totalSecs);
    setRemainingSeconds(totalSecs);
    setSubject(subj);
    setChapterTitle(chapTitle);
    setTaskTitle(task);
    setIsStrictMode(strict);
    setIsBreakMode(false);
    setDistractionsPreventedCount(0);
    setIsEmergencyUnlocking(false);
    setIsRunning(true);
    setIsPaused(false);

    getNativeBridge().startFocusSession({
      durationMinutes,
      subjectName: `${subj} (${chapTitle || 'Study Session'})`,
      isStrict: strict,
      remainingSeconds: totalSecs
    }).catch(console.warn);
  };

  const pauseSession = () => setIsPaused(true);
  const resumeSession = () => setIsPaused(false);

  const cancelSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setIsEmergencyUnlocking(false);
    getNativeBridge().stopFocusSession().catch(console.warn);
  };

  const finishSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    handleTimerComplete();
  };

  const incrementDistractionPrevented = () => {
    setDistractionsPreventedCount(prev => prev + 1);
  };

  // Emergency Unlock logic (30s cooldown before unlocking in strict mode)
  const startEmergencyUnlock = () => {
    setIsEmergencyUnlocking(true);
    setEmergencyUnlockSecondsLeft(settings.emergencyUnlockDelaySeconds || 30);

    emergencyTimerRef.current = setInterval(() => {
      setEmergencyUnlockSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(emergencyTimerRef.current!);
          cancelSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelEmergencyUnlock = () => {
    if (emergencyTimerRef.current) clearInterval(emergencyTimerRef.current);
    setIsEmergencyUnlocking(false);
    setEmergencyUnlockSecondsLeft(30);
  };

  const closeCompletionModal = () => {
    setCompletedStats(null);
  };

  const progressPercent = totalDurationSeconds > 0
    ? Math.min(100, Math.round(((totalDurationSeconds - remainingSeconds) / totalDurationSeconds) * 100))
    : 0;

  return (
    <FocusTimerContext.Provider
      value={{
        isRunning,
        isPaused,
        totalDurationSeconds,
        remainingSeconds,
        progressPercent,
        subject,
        chapterTitle,
        taskTitle,
        isStrictMode,
        isBreakMode,
        distractionsPreventedCount,
        startFocusSession,
        pauseSession,
        resumeSession,
        cancelSession,
        finishSession,
        incrementDistractionPrevented,
        isEmergencyUnlocking,
        emergencyUnlockSecondsLeft,
        startEmergencyUnlock,
        cancelEmergencyUnlock,
        completedStats,
        closeCompletionModal
      }}
    >
      {children}
    </FocusTimerContext.Provider>
  );
};

export const useFocusTimer = () => {
  const context = useContext(FocusTimerContext);
  if (!context) {
    throw new Error('useFocusTimer must be used within a FocusTimerProvider');
  }
  return context;
};
