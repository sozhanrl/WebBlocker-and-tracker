import React, { useState } from 'react';
import { Card } from '../common/Card';
import { useApp } from '../../context/AppContext';
import { ActiveTestModal } from './ActiveTestModal';
import { MockTestRecord, QuestionItem, NeetSubject } from '../../types';
import {
  Award,
  Play,
  TrendingUp,
  AlertTriangle,
  Plus,
  Trash2,
  BookOpen,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Button } from '../common/Button';

export const MockTestHub: React.FC = () => {
  const { mockTests, deleteMockTest, questionBank, addMockTest } = useApp();

  const [showActiveTest, setShowActiveTest] = useState(false);
  const [testQuestions, setTestQuestions] = useState<QuestionItem[]>([]);
  const [testTitle, setTestTitle] = useState('Full Length NEET Mock Test 2027');
  const [testDuration, setTestDuration] = useState(200);

  // Manual Log State
  const [showManualLogModal, setShowManualLogModal] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualScore, setManualScore] = useState(580);
  const [manualPhysics, setManualPhysics] = useState(135);
  const [manualChemistry, setManualChemistry] = useState(145);
  const [manualBotany, setManualBotany] = useState(150);
  const [manualZoology, setManualZoology] = useState(150);
  const [manualWeak, setManualWeak] = useState('');

  // Start Instant Full Length Test
  const handleStartFullTest = () => {
    // Generate questions from question bank
    setTestQuestions(questionBank);
    setTestTitle('NEET 2027 Grand Mock Simulator');
    setTestDuration(200);
    setShowActiveTest(true);
  };

  // Start Quick 20-Question Subject Sprint
  const handleStartSubjectSprint = (subject: NeetSubject) => {
    const filtered = questionBank.filter(q => q.subject === subject);
    setTestQuestions(filtered.length > 0 ? filtered : questionBank);
    setTestTitle(`NEET 2027 ${subject} Rapid Sprint`);
    setTestDuration(30);
    setShowActiveTest(true);
  };

  const handleSaveManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedTotal = manualPhysics + manualChemistry + manualBotany + manualZoology;
    const record: MockTestRecord = {
      id: `mock-${Date.now()}`,
      title: manualTitle.trim() || 'Offline NEET Mock Test',
      date: new Date().toISOString().split('T')[0],
      totalMarks: 720,
      score: calculatedTotal || manualScore,
      physicsScore: manualPhysics,
      chemistryScore: manualChemistry,
      botanyScore: manualBotany,
      zoologyScore: manualZoology,
      biologyScore: manualBotany + manualZoology,
      accuracyPercentage: Math.round(((calculatedTotal || manualScore) / 720) * 100),
      totalQuestions: 180,
      correctQuestions: Math.round(((calculatedTotal || manualScore) / 4)),
      wrongQuestions: 15,
      unattemptedQuestions: 5,
      weakTopics: manualWeak ? manualWeak.split(',').map(s => s.trim()) : undefined
    };

    addMockTest(record);
    setShowManualLogModal(false);
    setManualTitle('');
    setManualWeak('');
  };

  const latestTest = mockTests[0];
  const avgScore = mockTests.length > 0
    ? Math.round(mockTests.reduce((acc, m) => acc + m.score, 0) / mockTests.length)
    : 0;
  const highestScore = mockTests.length > 0
    ? Math.max(...mockTests.map(m => m.score))
    : 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner */}
      <Card className="p-5 bg-gradient-to-br from-[#0e1733] via-[#1C2541] to-[#0B132B] border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                180 MCQs • 720 Marks
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              NEET Mock Test & Exam Arena
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Simulate actual NEET test-day conditions, analyze subject-wise score splits, identify error trends, and benchmark your 720-mark score trajectory.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              onClick={() => setShowManualLogModal(true)}
              className="text-xs"
            >
              <Plus className="w-4 h-4 mr-1 text-slate-300" />
              Log Offline Test
            </Button>
            <Button
              variant="primary"
              onClick={handleStartFullTest}
              className="text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-md shadow-emerald-500/25"
            >
              <Play className="w-4 h-4 mr-1 fill-white" />
              Launch Grand Mock
            </Button>
          </div>
        </div>

        {/* Score Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block">Tests Attempted</span>
            <span className="text-xl font-extrabold text-white">{mockTests.length}</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block">Average Score</span>
            <span className="text-xl font-extrabold text-sky-400">{avgScore} / 720</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block">Personal Best</span>
            <span className="text-xl font-extrabold text-emerald-400">{highestScore} / 720</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block">Latest Performance</span>
            <span className="text-xl font-extrabold text-amber-400">
              {latestTest ? `${latestTest.score}/720` : '—'}
            </span>
          </div>
        </div>
      </Card>

      {/* Quick Subject Sprint Test Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
        {(['Physics', 'Chemistry', 'Botany', 'Zoology'] as NeetSubject[]).map((subj) => (
          <div
            key={subj}
            onClick={() => handleStartSubjectSprint(subj)}
            className="cursor-pointer bg-slate-900/70 hover:bg-slate-800 p-3.5 rounded-xl border border-white/10 flex items-center justify-between transition-all"
          >
            <div>
              <span className="text-xs font-bold text-white block">{subj} Rapid Sprint</span>
              <span className="text-[10px] text-slate-400">30 Mins • Section Practice</span>
            </div>
            <Play className="w-4 h-4 text-sky-400" />
          </div>
        ))}
      </div>

      {/* Mock Tests History Table / Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-400" />
          Recorded Mock Tests History
        </h3>

        {mockTests.map((test) => (
          <Card key={test.id} className="p-4 sm:p-5 bg-[#1C2541]/90 border-white/10 hover:border-white/20 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {test.date}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Accuracy: {test.accuracyPercentage}%
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {test.title}
                </h4>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                  <span>Phy: <strong className="text-sky-300">{test.physicsScore || 0}</strong></span>
                  <span>Chem: <strong className="text-amber-300">{test.chemistryScore || 0}</strong></span>
                  <span>Bot: <strong className="text-emerald-300">{test.botanyScore || 0}</strong></span>
                  <span>Zoo: <strong className="text-purple-300">{test.zoologyScore || 0}</strong></span>
                  <span>• Correct: <strong className="text-emerald-400">{test.correctQuestions || 0}</strong></span>
                  <span>Wrong: <strong className="text-rose-400">{test.wrongQuestions || 0}</strong></span>
                </div>

                {test.weakTopics && test.weakTopics.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Weak Areas: {test.weakTopics.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                <div className="text-right">
                  <span className="text-xs text-slate-400 sm:block hidden">Total Score</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">
                    {test.score} <span className="text-xs text-slate-500">/ 720</span>
                  </span>
                </div>

                <button
                  onClick={() => deleteMockTest(test.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Active Test Modal */}
      <ActiveTestModal
        isOpen={showActiveTest}
        onClose={() => setShowActiveTest(false)}
        questions={testQuestions}
        testTitle={testTitle}
        durationMinutes={testDuration}
      />

      {/* Manual Test Log Modal */}
      {showManualLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0B132B] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Log Offline / Coaching Mock Test</h3>
            <form onSubmit={handleSaveManualLog} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Test Name</label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. Allen Major Test 04 / Aakash AIATS"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-sky-400 block mb-0.5">Physics (/180)</label>
                  <input
                    type="number"
                    value={manualPhysics}
                    onChange={(e) => setManualPhysics(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-amber-400 block mb-0.5">Chemistry (/180)</label>
                  <input
                    type="number"
                    value={manualChemistry}
                    onChange={(e) => setManualChemistry(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-emerald-400 block mb-0.5">Botany (/180)</label>
                  <input
                    type="number"
                    value={manualBotany}
                    onChange={(e) => setManualBotany(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-purple-400 block mb-0.5">Zoology (/180)</label>
                  <input
                    type="number"
                    value={manualZoology}
                    onChange={(e) => setManualZoology(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Weak Topics / Mistakes (Comma separated)</label>
                <input
                  type="text"
                  value={manualWeak}
                  onChange={(e) => setManualWeak(e.target.value)}
                  placeholder="e.g. Rotational Dynamics, Ionic Equilibrium"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <Button variant="ghost" onClick={() => setShowManualLogModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
