import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import { 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function ExaminerExamDetailPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answerSheets, setAnswerSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload Form
  const [candidateRef, setCandidateRef] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchExamAndSheets();
  }, [examId]);

  const fetchExamAndSheets = async () => {
    try {
      setLoading(true);
      const [examRes, sheetsRes] = await Promise.all([
        api.get(`/exams/${examId}`),
        api.get(`/exams/${examId}/answer-sheets`),
      ]);
      setExam(examRes.data);
      setAnswerSheets(sheetsRes.data);
    } catch (err) {
      console.error('Error fetching exam sheets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a PDF, JPG, or PNG file');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');

      const formData = new FormData();
      formData.append('candidateReference', candidateRef);
      formData.append('file', selectedFile);

      const res = await api.post(`/exams/${examId}/answer-sheets`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsUploadModalOpen(false);
      setCandidateRef('');
      setSelectedFile(null);

      // Navigate straight to the On-Screen Marking UI for an instantaneous, frictionless demo!
      navigate(`/examiner/answer-sheets/${res.data.id}`);
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Failed to upload answer sheet');
    } finally {
      setUploading(false);
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
      {/* Top Header */}
      <div>
        <Link
          to="/examiner/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Examiner Workspace</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">
                {exam?.subject?.code}
              </span>
              <StatusBadge status={exam?.status} type="exam" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{exam?.title}</h1>
            <p className="text-sm text-slate-500">
              {exam?.subject?.name} &bull; Total Max Marks: {exam?.totalMarks} &bull; {exam?.questions?.length || 0} Questions
            </p>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Candidate Answer Sheet</span>
          </button>
        </div>
      </div>

      {/* Answer Sheets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Uploaded Answer Sheets ({answerSheets.length})
          </h2>
          <span className="text-xs text-slate-400">Click 'Open On-Screen Marking' to review AI suggestions & assign marks</span>
        </div>

        {answerSheets.length === 0 ? (
          <div className="p-12 text-center">
            <UploadCloud className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">No answer sheets uploaded for this exam yet.</p>
            <p className="text-xs text-slate-400 mt-1">Upload a scanned candidate answer sheet (PDF/Image) to begin evaluation.</p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Answer Sheet</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Candidate Reference</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Processing Status</th>
                  <th className="py-3 px-4">AI Suggested Marks</th>
                  <th className="py-3 px-4">Final Examiner Marks</th>
                  <th className="py-3 px-4">Flags</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {answerSheets.map((sheet) => (
                  <tr key={sheet.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {sheet.candidateReference}
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                      {sheet.originalFileName}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={sheet.processingStatus} type="processing" />
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {sheet.totalAiMarks !== null ? `${sheet.totalAiMarks} / ${sheet.totalMaxMarks}` : '—'}
                    </td>
                    <td className="py-4 px-4 font-bold text-blue-700 text-sm">
                      {sheet.totalFinalMarks !== null ? `${sheet.totalFinalMarks} / ${sheet.totalMaxMarks}` : 'In Progress'}
                    </td>
                    <td className="py-4 px-4">
                      {sheet.flagCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                          <AlertTriangle className="w-3 h-3" />
                          {sheet.flagCount} Flagged
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/examiner/answer-sheets/${sheet.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs"
                        >
                          <span>Open On-Screen Marking</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        {sheet.processingStatus === 'FINALIZED' && (
                          <Link
                            to={`/results/${sheet.id}`}
                            className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                          >
                            Result Card
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

      {/* Modal: Upload Answer Sheet */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Scanned Answer Sheet">
        <form onSubmit={handleUpload} className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {uploadError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Candidate Roll No / Reference ID
            </label>
            <input
              type="text"
              required
              value={candidateRef}
              onChange={(e) => setCandidateRef(e.target.value)}
              placeholder="e.g. MP-2026-CS-2045"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Scanned File (PDF, PNG, JPG)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <UploadCloud className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                <span className="text-xs font-bold text-blue-700 hover:underline">
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop answer sheet'}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Supported formats: PDF, PNG, JPG (up to 25MB)</p>
              </label>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              After upload, the system immediately runs OpenCV preprocessing and OCR extraction, then transfers you directly into the On-Screen Marking interface.
            </span>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {uploading ? 'Processing OCR & Uploading...' : 'Upload & Start Marking'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
