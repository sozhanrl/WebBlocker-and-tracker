import React, { useState, useEffect } from 'react';
import { QuestionItem, MockTestRecord, NeetSubject } from '../../types';
import { useApp } from '../../context/AppContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Flag,
  Award,
  BarChart2
} from 'lucide-react';

interface ActiveTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuestionItem[];
  testTitle?: string;
  durationMinutes?: number;
}

export const ActiveTestModal: React.FC<ActiveTestModalProps> = ({
  isOpen,
  onClose,
  questions,
  testTitle = 'NEET 2027 Full Length Mock Test',
  durationMinutes = 200 // standard 3h 20m
}) => {
  const { addMockTest } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [testResult, setTestResult] = useState<MockTestRecord | null>(null);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isFinished) return;
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isFinished]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = (optIndex: number) => {
    if (isFinished || !currentQ) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIndex
    }));
  };

  const handleClearAnswer = () => {
    if (isFinished || !currentQ) return;
    setUserAnswers(prev => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const handleToggleReview = () => {
    if (!currentQ) return;
    setMarkedForReview(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const handleSubmitTest = () => {
    let totalScore = 0;
    let physicsScore = 0;
    let chemistryScore = 0;
    let biologyScore = 0;
    let botanyScore = 0;
    let zoologyScore = 0;

    let totalCorrect = 0;
    let totalWrong = 0;
    let totalUnattempted = 0;

    const weakTopicsSet = new Set<string>();

    questions.forEach(q => {
      const selected = userAnswers[q.id];
      if (selected === undefined) {
        totalUnattempted++;
      } else if (selected === q.correctOptionIndex) {
        totalCorrect++;
        totalScore += 4;
        if (q.subject === 'Physics') physicsScore += 4;
        else if (q.subject === 'Chemistry') chemistryScore += 4;
        else if (q.subject === 'Botany') { botanyScore += 4; biologyScore += 4; }
        else if (q.subject === 'Zoology') { zoologyScore += 4; biologyScore += 4; }
        else if (q.subject === 'Biology') biologyScore += 4;
      } else {
        totalWrong++;
        totalScore -= 1;
        if (q.subject === 'Physics') physicsScore -= 1;
        else if (q.subject === 'Chemistry') chemistryScore -= 1;
        else if (q.subject === 'Botany') { botanyScore -= 1; biologyScore -= 1; }
        else if (q.subject === 'Zoology') { zoologyScore -= 1; biologyScore -= 1; }
        else if (q.subject === 'Biology') biologyScore -= 1;

        if (q.chapterTitle) {
          weakTopicsSet.add(q.chapterTitle);
        }
      }
    });

    const calculatedAccuracy = (totalCorrect + totalWrong > 0)
      ? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)
      : 0;

    const record: MockTestRecord = {
      id: `mock-${Date.now()}`,
      title: testTitle,
      date: new Date().toISOString().split('T')[0],
      totalMarks: 720,
      score: totalScore,
      physicsScore,
      chemistryScore,
      botanyScore,
      zoologyScore,
      biologyScore,
      accuracyPercentage: calculatedAccuracy,
      totalQuestions: questions.length,
      correctQuestions: totalCorrect,
      wrongQuestions: totalWrong,
      unattemptedQuestions: totalUnattempted,
      weakTopics: Array.from(weakTopicsSet),
      notes: `Completed in ${Math.round((durationMinutes * 60 - secondsRemaining) / 60)} minutes.`
    };

    addMockTest(record);
    setTestResult(record);
    setIsFinished(true);
  };

  const formatTimer = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[90vh] bg-[#0B132B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="p-4 bg-slate-900 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              NEET (+4 / -1 Marking)
            </span>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              {testTitle}
            </h3>
          </div>

          <div className="flex items-center gap-4">
            {!isFinished && (
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-white/10">
                <Clock className={`w-4 h-4 ${secondsRemaining < 300 ? 'text-rose-400 animate-pulse' : 'text-sky-400'}`} />
                <span className="font-mono text-sm font-bold text-white">
                  {formatTimer(secondsRemaining)}
                </span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Test Body or Results */}
        {!isFinished ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Main Question Panel */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-sky-400">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {currentQ?.subject}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {currentQ?.chapterTitle}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5">
                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed whitespace-pre-wrap">
                  {currentQ?.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ?.options.map((option, optIdx) => {
                  const isSelected = userAnswers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs sm:text-sm flex items-start gap-3 ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-500 text-white shadow-md shadow-sky-500/10'
                          : 'bg-slate-900/40 border-white/10 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          isSelected
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="mt-0.5">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleReview}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      markedForReview[currentQ?.id || '']
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    {markedForReview[currentQ?.id || ''] ? 'Marked' : 'Mark for Review'}
                  </button>
                  {userAnswers[currentQ?.id || ''] !== undefined && (
                    <button
                      onClick={handleClearAnswer}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-medium"
                    >
                      Clear Choice
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                    className="text-xs"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={currentIndex === questions.length - 1}
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    className="text-xs"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar Question Palette */}
            <div className="w-full md:w-64 bg-slate-900/90 border-t md:border-t-0 md:border-l border-white/10 p-4 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Question Palette ({Object.keys(userAnswers).length}/{questions.length})
                </h4>

                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((q, idx) => {
                    const isAns = userAnswers[q.id] !== undefined;
                    const isRev = markedForReview[q.id];
                    const isCur = currentIndex === idx;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-8 rounded-lg text-xs font-bold transition-all ${
                          isCur
                            ? 'ring-2 ring-sky-400 font-extrabold'
                            : ''
                        } ${
                          isAns
                            ? 'bg-emerald-500 text-white'
                            : isRev
                            ? 'bg-purple-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="space-y-1 text-[10px] text-slate-400 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Answered
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-purple-500" /> Marked for Review
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-slate-800" /> Not Attempted
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button
                  variant="primary"
                  onClick={handleSubmitTest}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-xs py-2.5 font-extrabold"
                >
                  Submit & Score Test
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Detailed Post-Test Result Screen */
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="text-center space-y-1">
              <Award className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-2xl font-extrabold text-white">Test Completed!</h2>
              <p className="text-xs text-slate-400">Your score has been logged to your NEET 2027 performance record.</p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-4 text-center bg-slate-900/90 border-emerald-500/30">
                <span className="text-[10px] text-slate-400 block font-semibold">Total Score</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {testResult?.score} <span className="text-xs text-slate-500">/ 720</span>
                </span>
              </Card>

              <Card className="p-4 text-center bg-slate-900/90 border-sky-500/30">
                <span className="text-[10px] text-slate-400 block font-semibold">Accuracy</span>
                <span className="text-2xl font-extrabold text-sky-400">
                  {testResult?.accuracyPercentage}%
                </span>
              </Card>

              <Card className="p-4 text-center bg-slate-900/90">
                <span className="text-[10px] text-slate-400 block font-semibold">Correct (+4)</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {testResult?.correctQuestions}
                </span>
              </Card>

              <Card className="p-4 text-center bg-slate-900/90">
                <span className="text-[10px] text-slate-400 block font-semibold">Wrong (-1)</span>
                <span className="text-2xl font-extrabold text-rose-400">
                  {testResult?.wrongQuestions}
                </span>
              </Card>
            </div>

            {/* Subject Breakdown */}
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Subject-wise Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Physics</span>
                  <span className="font-extrabold text-sky-400 text-sm">{testResult?.physicsScore} / 180</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Chemistry</span>
                  <span className="font-extrabold text-amber-400 text-sm">{testResult?.chemistryScore} / 180</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Botany</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{testResult?.botanyScore} / 180</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/80">
                  <span className="text-slate-400 block text-[11px]">Zoology</span>
                  <span className="font-extrabold text-purple-400 text-sm">{testResult?.zoologyScore} / 180</span>
                </div>
              </div>
            </div>

            {/* Weak Topics Analysis */}
            {testResult?.weakTopics && testResult.weakTopics.length > 0 && (
              <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Targeted Revision Required for Missed Topics:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {testResult.weakTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-rose-300 border border-rose-500/30"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <Button variant="primary" onClick={onClose} className="px-6">
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
