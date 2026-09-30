import React from 'react';

export default function StatusBadge({ status, type = 'processing' }) {
  if (!status) return null;

  const getStyle = () => {
    switch (status) {
      // ProcessingStatus
      case 'UPLOADED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'OCR_PROCESSING':
      case 'EVALUATING':
        return 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse';
      case 'OCR_COMPLETED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'EVALUATED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FINALIZED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      // EvaluationStatus
      case 'PENDING':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'AI_SUGGESTED':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'EXAMINER_REVIEWED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'FLAGGED':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';

      // ExamStatus
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      // ModerationFlagType
      case 'LOW_CONFIDENCE':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'MARK_VARIANCE':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'UNANSWERED_OR_EMPTY':
        return 'bg-orange-50 text-orange-700 border-orange-300';
      case 'MANUAL_FLAG':
        return 'bg-purple-50 text-purple-700 border-purple-300';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatText = (text) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()}`}>
      {formatText(status)}
    </span>
  );
}
