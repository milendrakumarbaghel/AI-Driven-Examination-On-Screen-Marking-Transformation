import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BarChart3, 
  TrendingUp, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const cards = [
    { title: 'Total Exams', value: stats?.totalExams || 0, icon: BookOpen, color: 'from-blue-600 to-indigo-600', link: '/admin/exams' },
    { title: 'Total Answer Sheets', value: stats?.totalAnswerSheets || 0, icon: FileText, color: 'from-slate-700 to-slate-900', link: '/examiner/dashboard' },
    { title: 'Evaluated Sheets', value: stats?.evaluatedSheets || 0, icon: CheckCircle2, color: 'from-emerald-600 to-teal-700', link: '/examiner/dashboard' },
    { title: 'Pending Evaluation', value: stats?.pendingSheets || 0, icon: Clock, color: 'from-amber-500 to-orange-600', link: '/examiner/dashboard' },
    { title: 'Flagged for Review', value: stats?.flaggedForReview || 0, icon: AlertTriangle, color: 'from-rose-600 to-pink-700', link: '/moderator/dashboard' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Examination Evaluation Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time telemetry, AI evaluation progress, and moderation analytics for MPOnline Hackathon 2026.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/exams"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Manage Exams</span>
          </Link>
          <Link
            to="/moderator/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Moderation Queue ({stats?.flaggedForReview || 0})</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link
              key={i}
              to={c.link}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{c.title}</span>
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${c.color} text-white flex items-center justify-center shadow-xs`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{c.value}</div>
              </div>
              <div className="flex items-center text-[11px] font-semibold text-blue-600 mt-3 group-hover:translate-x-1 transition-transform">
                <span>View Details</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-5 rounded-2xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">Overall Average Score</span>
            <TrendingUp className="w-5 h-5 text-blue-300" />
          </div>
          <div className="text-3xl font-extrabold mt-2">{stats?.overallAverageMarks || '0.0'} / 50.0</div>
          <p className="text-xs text-blue-300 mt-1">Across finalized & evaluated university answer sheets</p>
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 rounded-2xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Avg AI vs Examiner Diff</span>
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold mt-2">{stats?.averageAiVsExaminerDiff || '0.0'} marks</div>
          <p className="text-xs text-slate-300 mt-1">Mean absolute alignment between AI suggestion and human marks</p>
        </div>

        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-5 rounded-2xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">AI Confidence Health</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          </div>
          <div className="text-3xl font-extrabold mt-2">
            {stats?.lowConfidenceCount === 0 ? 'Optimal' : `${stats?.lowConfidenceCount} Flagged`}
          </div>
          <p className="text-xs text-emerald-200 mt-1">Evaluations with confidence score &lt; 70% threshold</p>
        </div>
      </div>

      {/* Recharts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Question Performance (Examiner vs AI Marks) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Question-wise Average Marks</h3>
              <p className="text-xs text-slate-400">Comparing Examiner Final Marks vs AI Suggested Marks</p>
            </div>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.questionPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="questionNumber" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="avgMarks" name="Examiner Marks" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="avgAiMarks" name="AI Suggestion" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Evaluation Progress Breakdown (Donut) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Answer Sheet Evaluation Status</h3>
              <p className="text-xs text-slate-400">Breakdown of sheets evaluated, pending, and flagged</p>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.progressBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(stats?.progressBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: AI vs Examiner Difference */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">AI vs Examiner Variance</h3>
              <p className="text-xs text-slate-400">Absolute difference (|Examiner - AI|) across questions</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.questionPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="questionNumber" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 4]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="diff" 
                  name="Mark Difference (Δ)" 
                  stroke="#ef4444" 
                  strokeWidth={2.5} 
                  dot={{ r: 5, fill: '#ef4444' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Question Difficulty Categorization */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Question Difficulty Analysis</h3>
              <p className="text-xs text-slate-400">
                Easy (&ge;75%), Moderate (50-74%), Difficult (&lt;50%)
              </p>
            </div>
          </div>

          <div className="space-y-3.5 mt-2">
            {(stats?.questionDifficulty || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-slate-800 text-sm">{item.question}</span>
                  <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.percentage >= 75 ? 'bg-emerald-500' :
                        item.percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{item.percentage}% avg</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  item.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                  item.difficulty === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                  'bg-rose-100 text-rose-700'
                }`}>
                  {item.difficulty}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 mt-4 italic text-center">
            * Prototype analytics derived from aggregate candidate percentage scores.
          </p>
        </div>
      </div>
    </div>
  );
}
