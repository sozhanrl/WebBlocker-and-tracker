import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

export function formatSecondsToTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export interface NeetCountdownDetails {
  daysLeft: number;
  weeksLeft: number;
  isExamPassed: boolean;
  formattedTarget: string;
}

export function getNeet2027CountdownInfo(): NeetCountdownDetails {
  // Official Exam Target: 5 May 2027
  const targetDate = new Date('2027-05-05T09:00:00');
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, diffDays);
  const weeksLeft = Math.ceil(daysLeft / 7);
  const isExamPassed = diffTime <= 0;

  return {
    daysLeft,
    weeksLeft,
    isExamPassed,
    formattedTarget: '5 May 2027'
  };
}

export function getNeet2027DaysRemaining(): number {
  return getNeet2027CountdownInfo().daysLeft;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getFormattedToday(): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  };
  return new Date().toLocaleDateString('en-US', options);
}
