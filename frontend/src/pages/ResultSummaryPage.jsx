import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ConfidenceBadge from '../components/common/ConfidenceBadge';
import { 
  ArrowLeft, 
  Printer, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ResultSummaryPage() {
  const { answerSheetId } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [answerSheetId]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/answer-sheets/${answerSheetId}/summary`);
      setSummary(res.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!summary) {
    return <div>Result Summary Not Found</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Non-printed action bar */}
      <div className="print:hidden flex items-center justify-between pb-4 border-b border-slate-200">
        <Link
          to={`/examiner/answer-sheets/${answerSheetId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marking Workspace</span>
        </Link>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shadow-md transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export Marksheet</span>
        </button>
      </div>

      {/* Official University Certificate / Marksheet Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="text-center border-b border-slate-200 pb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white mb-2 shadow-md">
            <Award className="w-7 h-7" />
          </div>
          <span className="text-xs font-extrabold text-blue-700 uppercase tracking-widest block">
            MPOnline Idea & Innovation Hackathon 2026
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Official University Examination Evaluation Summary
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            AI-Assisted Evaluation with Complete Human Examiner Verification Audit Trail
          </p>
        </div>

        {/* Candidate & Exam Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Candidate Roll / Reference:</span>
            <span className="font-extrabold text-slate-900 text-sm">{summary.candidateReference}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Subject:</span>
            <span className="font-bold text-slate-800">{summary.subjectCode} - {summary.subjectName}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Examination:</span>
            <span className="font-bold text-slate-800 truncate block">{summary.examTitle}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Moderation Status:</span>
            <span className={`inline-block font-extrabold px-2.5 py-0.5 rounded-md ${
              summary.moderationStatus === 'Approved & Verified'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {summary.moderationStatus}
            </span>
          </div>
        </div>

        {/* Overall Marks & Grade Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-tr from-blue-900 to-indigo-900 text-white p-5 rounded-2xl">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider block">
              Total Examiner Approved Marks
            </span>
            <div className="text-3xl font-black mt-2">
              {summary.totalFinalMarks} <span className="text-base font-semibold text-blue-300">/ {summary.totalMaxMarks}</span>
            </div>
            <p className="text-[11px] text-blue-200 mt-1">Legally binding university examination score</p>
          </div>

          <div className="bg-gradient-to-tr from-slate-800 to-slate-900 text-white p-5 rounded-2xl">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
              Percentage & Grade
            </span>
            <div className="text-3xl font-black mt-2 flex items-baseline gap-2">
              <span>{summary.percentage}%</span>
              <span className="text-xl font-extrabold text-emerald-400">({summary.grade})</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">Aggregated academic performance</p>
          </div>

          <div className="bg-gradient-to-tr from-cyan-900 to-teal-950 text-white p-5 rounded-2xl">
            <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider block">
              AI Suggestion Benchmark
            </span>
            <div className="text-3xl font-black mt-2">
              {summary.totalAiMarks} <span className="text-base font-semibold text-cyan-300">/ {summary.totalMaxMarks}</span>
            </div>
            <p className="text-[11px] text-cyan-200 mt-1">
              Alignment variance: {Math.abs(summary.totalFinalMarks - summary.totalAiMarks).toFixed(1)} marks
            </p>
          </div>
        </div>

        {/* Question-wise Breakdown Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
            Question-wise Detailed Marksheet & AI Comparison
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Q. No</th>
                  <th className="py-3 px-4">Question Statement</th>
                  <th className="py-3 px-4">Max Marks</th>
                  <th className="py-3 px-4">AI Suggested</th>
                  <th className="py-3 px-4">Final Examiner Marks</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Examiner Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.questionSummaries?.map((item) => (
                  <tr key={item.questionNumber} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-black text-slate-900">
                      Q{item.questionNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs leading-relaxed">
                      {item.questionText}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-500">
                      {item.maxMarks}
                    </td>
                    <td className="py-3 px-4 font-bold text-cyan-700">
                      {item.aiSuggestedMarks}
                    </td>
                    <td className="py-3 px-4 font-black text-blue-700 text-sm">
                      {item.finalExaminerMarks}
                    </td>
                    <td className="py-3 px-4">
                      <ConfidenceBadge confidence={item.confidence} />
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px] italic">
                      {item.examinerComment || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legal / Audit Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Finalized under Examiner Authority. Cryptographic integrity & audit trail secured.
            </span>
          </div>
          <span className="text-slate-400 font-mono">
            ID: {summary.answerSheetId} &bull; {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
