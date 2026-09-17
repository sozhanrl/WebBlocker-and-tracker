import React, { useState } from 'react';
import { Card } from '../common/Card';
import { useApp } from '../../context/AppContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, Calendar, Clock, Award, AlertTriangle } from 'lucide-react';
import { formatMinutes } from '../../utils/formatters';

export const AnalyticsCharts: React.FC = () => {
  const { analytics, studySessions, blockedApps, mockTests } = useApp();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  // Format Daily Data for Recharts
  const dailyBarData = analytics.map(day => {
    const dateObj = new Date(day.date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      name: dayName,
      date: day.date,
      productiveHours: Number((day.productiveMinutes / 60).toFixed(1)),
      distractedHours: Number((day.distractedMinutes / 60).toFixed(1)),
      score: day.focusScore
    };
  });

  // Subject-wise Study Time Distribution (Pie Data)
  const subjectTotals: Record<string, number> = {
    Physics: 120,
    Chemistry: 95,
    Botany: 140,
    Zoology: 110
  };

  studySessions.forEach(session => {
    if (subjectTotals[session.subject] !== undefined) {
      subjectTotals[session.subject] += session.durationMinutes;
    }
  });

  const pieData = [
    { name: 'Physics', value: subjectTotals.Physics, color: '#3B82F6' },
    { name: 'Chemistry', value: subjectTotals.Chemistry, color: '#EC4899' },
    { name: 'Botany', value: subjectTotals.Botany, color: '#10B981' },
    { name: 'Zoology', value: subjectTotals.Zoology, color: '#F59E0B' }
  ];

  // Screen time comparison data
  const screenComparisonData = analytics.map(day => {
    const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
    return {
      day: dayName,
      studyTime: Number((day.productiveMinutes / 60).toFixed(1)),
      screenTime: Number((day.screenTimeMinutes / 60).toFixed(1)),
      target: 6.0 // 6 hour goal line
    };
  });

  // Mock Test Score Trend Data (Chronological)
  const mockTrendData = [...mockTests].reverse().map((test, idx) => ({
    name: `Mock #${idx + 1}`,
    score: test.score,
    physics: test.physicsScore || 0,
    chemistry: test.chemistryScore || 0,
    biology: (test.botanyScore || 0) + (test.zoologyScore || 0) || test.biologyScore || 0,
    target: 650
  }));

  const totalProductiveWeekMinutes = analytics.reduce((acc, curr) => acc + curr.productiveMinutes, 0);
  const averageFocusScore = Math.round(
    analytics.reduce((acc, curr) => acc + curr.focusScore, 0) / (analytics.length || 1)
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Controls & KPI Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            Performance, NEET Mocks & Distraction Analytics
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Locally recorded study data, NEET score progression, and prevented distraction metrics
          </p>
        </div>

        {/* Time range filters */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-white/10">
          {(['today', 'week', 'month'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                timeRange === range
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range === 'today' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Study Time</span>
          <span className="text-xl font-extrabold text-white mt-1 block">
            {formatMinutes(totalProductiveWeekMinutes)}
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14% vs last week
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Avg Focus Score</span>
          <span className="text-xl font-extrabold text-sky-400 mt-1 block">
            {averageFocusScore}%
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">High consistency</span>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Mock Test Record</span>
          <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
            {mockTests.length > 0 ? `${mockTests[0].score}/720` : '—'}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{mockTests.length} tests logged</span>
        </Card>

        <Card className="p-4">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Distractions Stopped</span>
          <span className="text-xl font-extrabold text-rose-400 mt-1 block">
            42 Attempts
          </span>
          <span className="text-[10px] text-emerald-400 mt-0.5 block font-medium">Saved ~3.5 hours</span>
        </Card>
      </div>

      {/* NEET Mock Test Score Trajectory Chart */}
      {mockTrendData.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                NEET 720-Marks Score Trajectory
              </h4>
              <p className="text-[11px] text-slate-400">Score progression across full length mock tests (Target: 650+)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E3D67" vertical={false} />
                <XAxis dataKey="name" stroke="#8B9BB4" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 720]} stroke="#8B9BB4" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C2541',
                    borderColor: '#2E3D67',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="score" name="Total Score (/720)" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: '#10B981' }} />
                <Line type="monotone" dataKey="target" name="NEET Cutoff Target (650)" stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Daily Focus Bar Chart */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-white">Daily Focus Time vs Distractions (Hours)</h4>
            <p className="text-[11px] text-slate-400">Green shows deep study time, Red shows distracted surfing</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E3D67" vertical={false} />
              <XAxis dataKey="name" stroke="#8B9BB4" fontSize={11} tickLine={false} />
              <YAxis stroke="#8B9BB4" fontSize={11} tickLine={false} unit="h" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C2541',
                  borderColor: '#2E3D67',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="productiveHours" name="Productive Study" fill="#06D6A0" radius={[6, 6, 0, 0]} />
              <Bar dataKey="distractedHours" name="Distracted Surfing" fill="#FF5A5F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Grid: Subject Breakdown & Weekly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subject-Wise Pie Chart */}
        <Card className="p-5">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              NEET Study Time by Subject
            </h4>
            <p className="text-[11px] text-slate-400">Total hours dedicated to Physics, Chem, Botany, Zoology</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${formatMinutes(Number(value))}`, 'Study Time']}
                  contentStyle={{
                    backgroundColor: '#1C2541',
                    borderColor: '#2E3D67',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5">
            {pieData.map(item => (
              <div key={item.name} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-semibold text-slate-300">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-white">{formatMinutes(item.value)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Study Time Line Chart vs 6-Hour Target */}
        <Card className="p-5">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Study Hours vs Daily Target (6h)
            </h4>
            <p className="text-[11px] text-slate-400">Blue line represents actual study hours achieved</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={screenComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E3D67" vertical={false} />
                <XAxis dataKey="day" stroke="#8B9BB4" fontSize={11} tickLine={false} />
                <YAxis stroke="#8B9BB4" fontSize={11} tickLine={false} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C2541',
                    borderColor: '#2E3D67',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="studyTime"
                  name="Study Hours"
                  stroke="#0EA5E9"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0EA5E9' }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="Daily Goal (6h)"
                  stroke="#F59E0B"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Distraction Culprits Card */}
      <Card className="p-5">
        <h4 className="text-sm font-bold text-white mb-3">Top Distraction Targets Blocked Today</h4>
        <div className="space-y-2.5">
          {blockedApps.filter(a => a.isBlocked).slice(0, 4).map((app, idx) => (
            <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 w-4">#{idx + 1}</span>
                <div>
                  <span className="text-xs font-bold text-white block">{app.name}</span>
                  <span className="text-[10px] text-slate-400">{app.category}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-rose-400 block">{app.usedTodayMinutes}m used</span>
                <span className="text-[10px] text-emerald-400 font-medium">Blocked by FocusForge</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

