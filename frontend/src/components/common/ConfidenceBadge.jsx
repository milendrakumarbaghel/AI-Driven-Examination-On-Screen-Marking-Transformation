import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function ConfidenceBadge({ confidence }) {
  if (confidence === null || confidence === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
        N/A
      </span>
    );
  }

  const scorePct = Math.round(confidence * 100);

  if (scorePct >= 90) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        {scorePct}% High Confidence
      </span>
    );
  }

  if (scorePct >= 70) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        {scorePct}% Medium Confidence
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
      {scorePct}% Low Confidence - Review Recommended
    </span>
  );
}
