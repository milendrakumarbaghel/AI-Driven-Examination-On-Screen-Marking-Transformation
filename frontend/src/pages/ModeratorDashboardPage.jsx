import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/common/Modal';
import ConfidenceBadge from '../components/common/ConfidenceBadge';
import StatusBadge from '../components/common/StatusBadge';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Search, 
  Filter,
  Check,
  FileText
} from 'lucide-react';

export default function ModeratorDashboardPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [resolutionComment, setResolutionComment] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const res = await api.get('/moderation/flags');
      setFlags(res.data);
    } catch (err) {
      console.error('Error fetching moderation flags:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selectedFlag) return;

    try {
      setResolving(true);
      await api.put(`/moderation/flags/${selectedFlag.id}/resolve`, {
        resolutionComment,
      });
      setSelectedFlag(null);
      setResolutionComment('');
      fetchFlags();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to resolve moderation flag');
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
              Quality Assurance & Moderation Board
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">University Moderation Queue</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review low-confidence AI assessments, high AI-Examiner score variances, and flagged answers.
          </p>
        </div>
      </div>

      {/* Flagged Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">
              Active Moderation Flags ({flags.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">Requires Senior Moderator sign-off</span>
        </div>

        {flags.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">All moderation flags resolved!</p>
            <p className="text-xs text-slate-400 mt-1">
              No low-confidence evaluations or large score discrepancies currently pending review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Exam</th>
                  <th className="py-3 px-4">Question</th>
                  <th className="py-3 px-4">AI Marks</th>
                  <th className="py-3 px-4">Examiner Marks</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Flag Type</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {flags.map((flag) => (
                  <tr key={flag.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {flag.candidateReference}
                    </td>
                    <td className="py-4 px-4 text-slate-600 max-w-xs truncate">
                      {flag.examTitle}
                    </td>
                    <td className="py-4 px-4 font-bold text-blue-700">
                      Q{flag.questionNumber || 'N/A'}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-700">
                      {flag.aiMarks !== null ? flag.aiMarks : '—'}
                    </td>
                    <td className="py-4 px-4 font-bold text-blue-700">
                      {flag.examinerMarks !== null ? flag.examinerMarks : '—'}
                    </td>
                    <td className="py-4 px-4">
                      <ConfidenceBadge confidence={flag.confidence} />
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={flag.flagType} type="flag" />
                    </td>
                    <td className="py-4 px-4 text-slate-600 max-w-sm truncate text-[11px]" title={flag.reason}>
                      {flag.reason}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {flag.answerSheetId && (
                          <Link
                            to={`/examiner/answer-sheets/${flag.answerSheetId}`}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                            title="Open Marking Workspace"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setSelectedFlag(flag);
                            setResolutionComment(`Verified by Senior Moderator. ${flag.reason}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Resolve Flag */}
      <Modal isOpen={!!selectedFlag} onClose={() => setSelectedFlag(null)} title="Resolve University Moderation Flag">
        {selectedFlag && (
          <form onSubmit={handleResolve} className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Candidate:</span>
                <span className="font-bold text-slate-900">{selectedFlag.candidateReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Flag Type:</span>
                <span className="font-bold text-rose-700">{selectedFlag.flagType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Flag Reason:</span>
                <span className="font-medium text-slate-800 text-right max-w-xs">{selectedFlag.reason}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">AI Suggested Marks:</span>
                <span className="font-bold text-slate-900">{selectedFlag.aiMarks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Examiner Approved Marks:</span>
                <span className="font-bold text-blue-700">{selectedFlag.examinerMarks}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Moderator Decision & Audit Comment
              </label>
              <textarea
                required
                rows="4"
                value={resolutionComment}
                onChange={(e) => setResolutionComment(e.target.value)}
                placeholder="Explain the resolution decision, justification, and approval..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedFlag(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resolving}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
              >
                {resolving ? 'Submitting Resolution...' : 'Approve & Clear Flag'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
