import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/common/Modal';
import ConfidenceBadge from '../components/common/ConfidenceBadge';
import StatusBadge from '../components/common/StatusBadge';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  ChevronRight, 
  ChevronLeft,
  Edit3,
  ExternalLink,
  ShieldAlert,
  FileText,
  RotateCw,
  Award
} from 'lucide-react';

export default function OnScreenMarkingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Examiner input state for active question
  const [examinerMarks, setExaminerMarks] = useState('');
  const [examinerComment, setExaminerComment] = useState('');
  const [savingMark, setSavingMark] = useState(false);

  // Edit OCR text modal
  const [isEditOcrOpen, setIsEditOcrOpen] = useState(false);
  const [editedText, setEditedText] = useState('');

  // Flag modal
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagSeverity, setFlagSeverity] = useState('MEDIUM');

  // Document viewer tab
  const [viewerMode, setViewerMode] = useState('doc'); // 'doc' or 'extracted'
  const [evaluatingAll, setEvaluatingAll] = useState(false);

  useEffect(() => {
    fetchSheetData();
  }, [id]);

  const fetchSheetData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/answer-sheets/${id}`);
      setSheet(res.data);
      if (res.data.answers && res.data.answers.length > 0) {
        initQuestionState(res.data.answers[0]);
      }
    } catch (err) {
      console.error('Error fetching answer sheet:', err);
    } finally {
      setLoading(false);
    }
  };

  const initQuestionState = (answer) => {
    if (!answer) return;
    const evalData = answer.evaluation;
    if (evalData) {
      setExaminerMarks(evalData.examinerMarks !== null && evalData.examinerMarks !== undefined ? evalData.examinerMarks : '');
      setExaminerComment(evalData.examinerComment || '');
    } else {
      setExaminerMarks('');
      setExaminerComment('');
    }
    setEditedText(answer.extractedText || '');
  };

  const handleSelectQuestion = (idx) => {
    if (!sheet?.answers || idx < 0 || idx >= sheet.answers.length) return;
    setActiveQuestionIdx(idx);
    initQuestionState(sheet.answers[idx]);
  };

  const currentAnswer = sheet?.answers ? sheet.answers[activeQuestionIdx] : null;
  const currentEval = currentAnswer?.evaluation;
  const currentQuestion = currentAnswer?.questionText ? {
    number: currentAnswer.questionNumber,
    text: currentAnswer.questionText,
    maxMarks: currentAnswer.maxMarks,
    rubric: currentAnswer.rubric,
  } : null;

  // Accept AI marks directly
  const handleAcceptAiMarks = () => {
    if (currentEval && currentEval.aiSuggestedMarks !== null) {
      setExaminerMarks(currentEval.aiSuggestedMarks);
    }
  };

  // Quick increment/decrement
  const adjustMark = (delta) => {
    const current = Number(examinerMarks) || 0;
    const max = currentAnswer?.maxMarks || 10;
    const adjusted = Math.min(Math.max(0, current + delta), max);
    setExaminerMarks(adjusted);
  };

  // Save current examiner mark
  const handleSaveMark = async (andAdvance = false) => {
    if (!currentEval) {
      alert('Please trigger AI evaluation first before saving marks');
      return;
    }

    if (examinerMarks === '' || isNaN(examinerMarks)) {
      alert('Please enter a valid numeric mark');
      return;
    }

    const marksNum = Number(examinerMarks);
    if (marksNum < 0 || marksNum > (currentAnswer?.maxMarks || 10)) {
      alert(`Marks must be between 0 and ${currentAnswer?.maxMarks}`);
      return;
    }

    try {
      setSavingMark(true);
      const res = await api.put(`/evaluations/${currentEval.id}/examiner-mark`, {
        examinerMarks: marksNum,
        examinerComment,
      });

      // Update local state
      const updatedAnswers = [...sheet.answers];
      updatedAnswers[activeQuestionIdx].evaluation = res.data;
      setSheet({ ...sheet, answers: updatedAnswers });

      if (andAdvance && activeQuestionIdx < sheet.answers.length - 1) {
        handleSelectQuestion(activeQuestionIdx + 1);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save marks');
    } finally {
      setSavingMark(false);
    }
  };

  // Trigger evaluation for all answers
  const handleEvaluateAll = async () => {
    try {
      setEvaluatingAll(true);
      const res = await api.post(`/answer-sheets/${id}/evaluate-all`);
      setSheet(res.data);
      if (res.data.answers && res.data.answers[activeQuestionIdx]) {
        initQuestionState(res.data.answers[activeQuestionIdx]);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'AI Evaluation encountered an error');
    } finally {
      setEvaluatingAll(false);
    }
  };

  // Save edited OCR text
  const handleSaveOcrText = async () => {
    try {
      const res = await api.put(`/answers/${currentAnswer.id}/text`, {
        text: editedText,
      });
      setSheet(res.data);
      setIsEditOcrOpen(false);
    } catch (err) {
      alert('Failed to update extracted text');
    }
  };

  // Flag evaluation for moderation review
  const handleFlagForReview = async (e) => {
    e.preventDefault();
    if (!currentEval) return;

    try {
      await api.post(`/evaluations/${currentEval.id}/flag`, {
        flagType: 'MANUAL_FLAG',
        severity: flagSeverity,
        reason: flagReason,
      });
      setIsFlagModalOpen(false);
      setFlagReason('');
      fetchSheetData();
    } catch (err) {
      alert('Failed to submit moderation flag');
    }
  };

  // Finalize answer sheet
  const handleFinalizeSheet = async () => {
    if (!window.confirm('Are you ready to finalize this answer sheet? All examiner marks will be committed.')) {
      return;
    }

    try {
      await api.post(`/answer-sheets/${id}/finalize`, { notes: examinerComment });
      navigate(`/results/${id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Could not finalize answer sheet.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const fileUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/files/${sheet.id}`;

  return (
    <div className="space-y-4">
      {/* Top Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to={`/examiner/exams/${sheet.examId}`}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Back to exam"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base">{sheet.candidateReference}</span>
              <StatusBadge status={sheet.processingStatus} type="processing" />
            </div>
            <p className="text-xs text-slate-500">{sheet.examTitle} &bull; {sheet.subjectName}</p>
          </div>
        </div>

        {/* Global Sheet Actions */}
        <div className="flex items-center gap-2">
          {(!currentEval || sheet.processingStatus === 'UPLOADED' || sheet.processingStatus === 'OCR_COMPLETED') && (
            <button
              onClick={handleEvaluateAll}
              disabled={evaluatingAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{evaluatingAll ? 'Evaluating Answers...' : 'Trigger AI Evaluation'}</span>
            </button>
          )}

          <button
            onClick={handleFinalizeSheet}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalize Marks</span>
          </button>
        </div>
      </div>

      {/* Main Split Screen Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-180px)] min-h-[650px]">
        {/* LEFT COLUMN: Document & Answer Viewer (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
          <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewerMode('doc')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewerMode === 'doc'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Original Document
              </button>
              <button
                onClick={() => setViewerMode('extracted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewerMode === 'extracted'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Raw Text View
              </button>
            </div>

            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              title="Open document in full screen tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="flex-1 bg-slate-100 p-2 overflow-hidden flex flex-col">
            {viewerMode === 'doc' ? (
              <div className="w-full h-full rounded-xl overflow-hidden bg-white border border-slate-200">
                <iframe
                  src={fileUrl}
                  title="Answer Sheet Document"
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <div className="w-full h-full p-4 bg-white rounded-xl border border-slate-200 overflow-y-auto font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {sheet.answers?.map((ans) => (
                  <div key={ans.id} className="mb-6 pb-4 border-b border-slate-100">
                    <span className="font-bold text-blue-700 block mb-1">
                      [Question {ans.questionNumber}]
                    </span>
                    <p className="text-slate-700">{ans.extractedText || 'No extracted text'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive On-Screen Marking Workbench (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Question Selector Tabs */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/70 overflow-x-auto flex items-center gap-2">
            {sheet.answers?.map((ans, idx) => {
              const isActive = idx === activeQuestionIdx;
              const hasMark = ans.evaluation?.examinerMarks !== null && ans.evaluation?.examinerMarks !== undefined;
              const isFlagged = ans.evaluation?.status === 'FLAGGED' || (ans.evaluation?.moderationFlags?.length > 0);

              return (
                <button
                  key={ans.id}
                  onClick={() => handleSelectQuestion(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : hasMark
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>Q{ans.questionNumber}</span>
                  {hasMark && !isActive && <Check className="w-3 h-3 text-emerald-600" />}
                  {isFlagged && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                </button>
              );
            })}
          </div>

          {/* Workbench Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Question Details Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Question {currentQuestion?.number} of {sheet.answers?.length}
                </span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Max Marks: {currentQuestion?.maxMarks}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {currentQuestion?.text}
              </h3>
            </div>

            {/* Extracted Student Answer with Edit Option */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  Extracted Student Answer (OCR)
                </label>
                <button
                  onClick={() => setIsEditOcrOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit OCR Text</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans min-h-[90px] shadow-2xs">
                {currentAnswer?.extractedText || (
                  <span className="text-slate-400 italic">
                    No text extracted. Click "Edit OCR Text" to type student response manually.
                  </span>
                )}
              </div>
            </div>

            {/* AI Evaluation Output (Explainable AI & Concepts) */}
            {currentEval ? (
              <div className="bg-gradient-to-br from-indigo-50/50 via-blue-50/40 to-slate-50 p-5 rounded-2xl border border-blue-100 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        AI Pedagogical Assessment
                      </h4>
                      <p className="text-[11px] text-slate-500">Based on model answer & marking rubric criteria</p>
                    </div>
                  </div>

                  <ConfidenceBadge confidence={currentEval.aiConfidence} />
                </div>

                {/* Score banner */}
                <div className="bg-white p-3.5 rounded-xl border border-blue-200/60 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-xs text-slate-500 block">AI Suggested Marks</span>
                    <span className="text-2xl font-black text-blue-700">
                      {currentEval.aiSuggestedMarks} <span className="text-sm font-semibold text-slate-400">/ {currentQuestion?.maxMarks}</span>
                    </span>
                  </div>

                  <button
                    onClick={handleAcceptAiMarks}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept AI Marks ({currentEval.aiSuggestedMarks})</span>
                  </button>
                </div>

                {/* Explainable AI: Matched and Missing Concepts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Matched Concepts */}
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-100">
                    <span className="font-extrabold text-emerald-800 text-[11px] uppercase tracking-wider block mb-2 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Matched Rubric Concepts
                    </span>
                    {currentEval.matchedConcepts && currentEval.matchedConcepts.length > 0 ? (
                      <ul className="space-y-1.5 text-slate-700 text-[11px]">
                        {currentEval.matchedConcepts.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-slate-400 text-[11px]">No specific concepts matched</span>
                    )}
                  </div>

                  {/* Missing Concepts */}
                  <div className="bg-white p-3.5 rounded-xl border border-rose-100">
                    <span className="font-extrabold text-rose-800 text-[11px] uppercase tracking-wider block mb-2 flex items-center gap-1">
                      <X className="w-3.5 h-3.5 text-rose-600" />
                      Missing / Inaccurate Elements
                    </span>
                    {currentEval.missingConcepts && currentEval.missingConcepts.length > 0 ? (
                      <ul className="space-y-1.5 text-slate-700 text-[11px]">
                        {currentEval.missingConcepts.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-500 font-bold">✗</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-slate-400 text-[11px]">None identified</span>
                    )}
                  </div>
                </div>

                {/* AI Explanation Text */}
                <div className="p-3 bg-white/80 rounded-xl border border-blue-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-800 block mb-1">AI Explanation & Justification:</span>
                  <p>{currentEval.explanation || 'No rationale provided'}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2 animate-bounce" />
                <p className="text-xs font-bold text-slate-700">AI Evaluation Pending</p>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">Trigger AI evaluation to compute rubric match & suggestions.</p>
                <button
                  onClick={handleEvaluateAll}
                  disabled={evaluatingAll}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700"
                >
                  {evaluatingAll ? 'Evaluating...' : 'Run AI Evaluation'}
                </button>
              </div>
            )}

            {/* Human Examiner Decision Area */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-300">
                    Final Examiner Assessment
                  </h4>
                  <p className="text-[11px] text-slate-400">Examiner has final authority to accept, edit, or override AI marks</p>
                </div>
                <Award className="w-5 h-5 text-blue-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Examiner Approved Marks
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => adjustMark(-0.5)}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm transition-colors border border-slate-700"
                    >
                      -0.5
                    </button>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={currentQuestion?.maxMarks || 10}
                      value={examinerMarks}
                      onChange={(e) => setExaminerMarks(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 text-center py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => adjustMark(+0.5)}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm transition-colors border border-slate-700"
                    >
                      +0.5
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Examiner Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={examinerComment}
                    onChange={(e) => setExaminerComment(e.target.value)}
                    placeholder="e.g. Conceptually correct, deducted 0.5 for missing code syntax"
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFlagModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-800/60 font-bold text-xs transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Flag for Moderation</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveMark(false)}
                    disabled={savingMark}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors border border-slate-700 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Marks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveMark(true)}
                    disabled={savingMark}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <span>Save & Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Edit OCR Text */}
      <Modal isOpen={isEditOcrOpen} onClose={() => setIsEditOcrOpen(false)} title={`Edit OCR Extracted Text (Question ${currentQuestion?.number})`}>
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            If OCR misrecognized characters or segmentation was imperfect, you can manually refine the student's text here.
          </p>
          <textarea
            rows="8"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full p-4 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsEditOcrOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveOcrText}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm"
            >
              Update Extracted Answer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Flag for Moderation */}
      <Modal isOpen={isFlagModalOpen} onClose={() => setIsFlagModalOpen(false)} title="Flag Evaluation for Senior Moderator Review">
        <form onSubmit={handleFlagForReview} className="space-y-4">
          <p className="text-xs text-slate-500">
            Submit this answer to the University Moderation Board for second review.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Severity Level
            </label>
            <select
              value={flagSeverity}
              onChange={(e) => setFlagSeverity(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            >
              <option value="LOW">Low (Informational)</option>
              <option value="MEDIUM">Medium (Requires Confirmation)</option>
              <option value="HIGH">High (Dispute / Critical Difference)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Justification
            </label>
            <textarea
              required
              rows="4"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="e.g. Handwriting is ambiguous in paragraph 2; discrepancy between AI mark and rubric criteria..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFlagModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md shadow-rose-600/20"
            >
              Submit Moderation Flag
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
