import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import { 
  FileCheck, 
  UploadCloud, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  BookOpen
} from 'lucide-react';

export default function ExaminerDashboardPage() {
  const [exams, setExams] = useState([]);
  const [answerSheets, setAnswerSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [examsRes, sheetsRes] = await Promise.all([
        api.get('/exams'),
        api.get('/answer-sheets'),
      ]);
      setExams(examsRes.data);
      setAnswerSheets(sheetsRes.data);
    } catch (err) {
      console.error('Error fetching examiner dashboard:', err);
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

  const pendingSheets = answerSheets.filter(s => s.processingStatus !== 'FINALIZED');
  const finalizedSheets = answerSheets.filter(s => s.processingStatus === 'FINALIZED');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Examiner Evaluation Workspace</h1>
          <p className="text-sm text-slate-500 mt-1">
            Access assigned university exams, upload scanned candidate answer sheets, and perform on-screen marking.
          </p>
        </div>
      </div>

      {/* Quick KPI stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Available Exams</span>
            <span className="text-2xl font-black text-slate-900">{exams.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Pending Evaluation</span>
            <span className="text-2xl font-black text-amber-600">{pendingSheets.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Finalized Answer Sheets</span>
            <span className="text-2xl font-black text-emerald-600">{finalizedSheets.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Select an Exam to Upload/Mark */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>Active Examinations for Evaluation</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex items-center justify-between"
            >
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-bold">
                  {exam.subject.code}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-2">{exam.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{exam.subject.name} &bull; Total Marks: {exam.totalMarks}</p>
              </div>
              <Link
                to={`/examiner/exams/${exam.id}`}
                className="shrink-0 ml-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm transition-all"
              >
                <span>Open Exam</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Answer Sheets Queue */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Recent Candidate Answer Sheets</h2>
          <span className="text-xs text-slate-500">{answerSheets.length} total recorded</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {answerSheets.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No answer sheets uploaded yet. Click on an exam above to upload the first candidate sheet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Candidate Ref</th>
                    <th className="py-3 px-4">Examination</th>
                    <th className="py-3 px-4">Processing Status</th>
                    <th className="py-3 px-4">AI Suggested</th>
                    <th className="py-3 px-4">Examiner Marks</th>
                    <th className="py-3 px-4">Moderation Flags</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {answerSheets.map((sheet) => (
                    <tr key={sheet.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {sheet.candidateReference}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {sheet.examTitle}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={sheet.processingStatus} type="processing" />
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        {sheet.totalAiMarks !== null ? `${sheet.totalAiMarks} / ${sheet.totalMaxMarks}` : '—'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-blue-700">
                        {sheet.totalFinalMarks !== null ? `${sheet.totalFinalMarks} / ${sheet.totalMaxMarks}` : 'Pending'}
                      </td>
                      <td className="py-3.5 px-4">
                        {sheet.flagCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                            <AlertTriangle className="w-3 h-3" />
                            {sheet.flagCount} Flagged
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/examiner/answer-sheets/${sheet.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
                          >
                            <span>Mark Sheet</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                          {sheet.processingStatus === 'FINALIZED' && (
                            <Link
                              to={`/results/${sheet.id}`}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100"
                            >
                              Summary
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
