import React, { useState } from 'react';
import {
  Flame,
  ArrowRight,
  Check,
  Clock,
  Smartphone,
  ShieldCheck,
  Target,
  Sparkles,
  Bell,
  Sun
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

interface OnboardingFlowProps {
  onComplete: () => void;
  onOpenAuth: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onOpenAuth }) => {
  const { updateUserProfile, updateUserGoals } = useApp();
  const [step, setStep] = useState(1);

  // Form states
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Study for NEET', 'Reduce screen time']);
  const [dailyHours, setDailyHours] = useState<number>(6);
  const [customHours, setCustomHours] = useState<string>('');
  const [selectedDistractions, setSelectedDistractions] = useState<string[]>([
    'Instagram',
    'YouTube',
    'Short videos'
  ]);
  const [wakeUpTime, setWakeUpTime] = useState('05:30');
  const [studyStartTime, setStudyStartTime] = useState('06:30');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const goalOptions = [
    { id: 'neet', label: 'Study for NEET', sub: 'Target 680+ in NEET 2027', icon: '🎯' },
    { id: 'exams', label: 'Prepare for exams', sub: 'Class 11 & 12 Board + Competitive', icon: '📚' },
    { id: 'productivity', label: 'Improve productivity', sub: 'Consistent deep work routines', icon: '⚡' },
    { id: 'screen-time', label: 'Reduce screen time', sub: 'Cut Instagram & YouTube bingeing', icon: '📵' },
    { id: 'habits', label: 'Build better habits', sub: 'Pomodoro study discipline', icon: '🌱' },
    { id: 'work', label: 'Focus while working', sub: 'Eliminate interruptions', icon: '🧠' }
  ];

  const screenTimeOptions = [1, 2, 4, 6, 8];

  const distractionOptions = [
    { id: 'Instagram', label: 'Instagram', tag: 'Reels & DMs' },
    { id: 'YouTube', label: 'YouTube', tag: 'Shorts & Recommended' },
    { id: 'Games', label: 'Games & BGMI', tag: 'Mobile gaming' },
    { id: 'Facebook', label: 'Facebook', tag: 'Feed' },
    { id: 'WhatsApp', label: 'WhatsApp', tag: 'Status & Chatting' },
    { id: 'Browsers', label: 'Chrome & Browsers', tag: 'Random surfing' },
    { id: 'Short videos', label: 'Short videos / Reels', tag: 'Endless doomscrolling' },
    { id: 'Other apps', label: 'Shopping & Others', tag: 'Amazon, Netflix, etc.' }
  ];

  const toggleGoal = (label: string) => {
    setSelectedGoals(prev =>
      prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );
  };

  const toggleDistraction = (label: string) => {
    setSelectedDistractions(prev =>
      prev.includes(label) ? prev.filter(d => d !== label) : [...prev, label]
    );
  };

  const handleFinish = () => {
    const finalHours = customHours ? parseFloat(customHours) || dailyHours : dailyHours;
    updateUserProfile({
      dailyTargetMinutes: Math.round(finalHours * 60),
      wakeUpTime,
      studyStartTime,
      onboardingCompleted: true
    });
    updateUserGoals({
      primaryGoals: selectedGoals,
      distractions: selectedDistractions,
      dailyScreenTimeGoalHours: finalHours,
      notificationsEnabled
    });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B132B] overflow-y-auto">
      <div className="w-full max-w-lg my-auto">
        {/* Step Progress Bar */}
        <div className="mb-6 flex items-center justify-between gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-gradient-to-r from-sky-400 to-emerald-400' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <Card className="text-center p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-tr from-emerald-400 via-sky-500 to-indigo-600 p-0.5 shadow-xl shadow-sky-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-[#0B132B] rounded-[22px] flex items-center justify-center">
                <Flame className="w-10 h-10 text-sky-400" />
              </div>
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
              NEET 2027 Edition
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              FocusForge
            </h1>
            <p className="text-sm font-semibold text-emerald-400 mt-1">
              “Take control of your time”
            </p>
            <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed max-w-sm mx-auto">
              Block distracting apps, master your NEET 2027 syllabus, track Pomodoro study sessions, and build unstoppable focus habits.
            </p>

            <div className="mt-8 space-y-3">
              <Button
                onClick={() => setStep(2)}
                size="lg"
                className="w-full"
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Get Started
              </Button>
              <button
                onClick={onOpenAuth}
                className="w-full py-2.5 text-xs font-medium text-slate-400 hover:text-sky-400 transition-colors"
              >
                Already have an account? <span className="underline">Log in</span>
              </button>
            </div>
          </Card>
        )}

        {/* STEP 2: MAIN GOAL */}
        {step === 2 && (
          <Card className="p-6 sm:p-8 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-2 text-sky-400 text-xs font-bold uppercase">
              <Target className="w-4 h-4" />
              <span>Step 2 of 5</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">What is your main goal?</h2>
            <p className="text-xs text-slate-400 mt-1 mb-6">Select all that apply to personalize your daily targets.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {goalOptions.map((goal) => {
                const isSelected = selectedGoals.includes(goal.label);
                return (
                  <div
                    key={goal.id}
                    onClick={() => toggleGoal(goal.label)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500 text-white shadow-md shadow-sky-500/10'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{goal.icon}</span>
                        <span className="text-xs font-bold">{goal.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 pl-6">{goal.sub}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center text-white flex-shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={selectedGoals.length === 0}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 3: DAILY GOAL */}
        {step === 3 && (
          <Card className="p-6 sm:p-8 animate-in fade-in duration-200 text-center">
            <div className="flex items-center justify-center gap-2 mb-2 text-sky-400 text-xs font-bold uppercase">
              <Clock className="w-4 h-4" />
              <span>Step 3 of 5</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Daily Study Goal</h2>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              How much time do you want to spend productively each day?
            </p>

            {/* Visual Progress Ring representation */}
            <div className="py-4">
              <div className="inline-block p-6 rounded-full bg-slate-900/80 border-4 border-sky-500 shadow-xl shadow-sky-500/20">
                <span className="text-4xl font-extrabold text-white">
                  {customHours ? `${customHours}h` : `${dailyHours}h`}
                </span>
                <p className="text-xs text-slate-400 font-medium mt-1">per day</p>
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-5 gap-2 my-6">
              {screenTimeOptions.map((hours) => (
                <button
                  key={hours}
                  onClick={() => {
                    setDailyHours(hours);
                    setCustomHours('');
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    dailyHours === hours && !customHours
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="max-w-xs mx-auto mb-6">
              <input
                type="number"
                min="0.5"
                max="16"
                step="0.5"
                placeholder="Or enter custom hours..."
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs text-center focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)} icon={<ArrowRight className="w-4 h-4" />}>
                Continue
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 4: DISTRACTIONS */}
        {step === 4 && (
          <Card className="p-6 sm:p-8 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-2 text-rose-400 text-xs font-bold uppercase">
              <Smartphone className="w-4 h-4" />
              <span>Step 4 of 5</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">What distracts you the most?</h2>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              We will prepare active blocking rules for these during your study sessions.
            </p>

            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {distractionOptions.map((item) => {
                const isSelected = selectedDistractions.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleDistraction(item.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500 text-white'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{item.label}</span>
                      <span className="text-[10px] text-slate-400">{item.tag}</span>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-white flex-shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={() => setStep(5)} icon={<ArrowRight className="w-4 h-4" />}>
                Continue
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 5: WAKE UP & ROUTINE */}
        {step === 5 && (
          <Card className="p-6 sm:p-8 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-2 text-emerald-400 text-xs font-bold uppercase">
              <Sun className="w-4 h-4" />
              <span>Step 5 of 5</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Wake-Up Call & Routine</h2>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              Establish a consistent circadian rhythm for peak exam performance.
            </p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-700">
                <div>
                  <span className="text-xs font-semibold text-white block">Wake-up Time</span>
                  <span className="text-[11px] text-slate-400">Morning alarm & mindset prompt</span>
                </div>
                <input
                  type="time"
                  value={wakeUpTime}
                  onChange={(e) => setWakeUpTime(e.target.value)}
                  className="bg-slate-800 border border-slate-600 text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-700">
                <div>
                  <span className="text-xs font-semibold text-white block">Study Start Time</span>
                  <span className="text-[11px] text-slate-400">When your morning study block begins</span>
                </div>
                <input
                  type="time"
                  value={studyStartTime}
                  onChange={(e) => setStudyStartTime(e.target.value)}
                  className="bg-slate-800 border border-slate-600 text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-700">
                <div>
                  <span className="text-xs font-semibold text-white block">Reminder Notifications</span>
                  <span className="text-[11px] text-slate-400">Pings for scheduled study blocks & breaks</span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(4)}>
                Back
              </Button>
              <Button
                variant="success"
                onClick={handleFinish}
                icon={<Sparkles className="w-4 h-4" />}
              >
                Launch FocusForge
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
