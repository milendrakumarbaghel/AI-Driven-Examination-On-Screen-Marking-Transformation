import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  HelpCircle, 
  CheckCircle, 
  FileText, 
  Key,
  BookOpen
} from 'lucide-react';

export default function AdminExamDetailPage() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Question Form State
  const [questionNumber, setQuestionNumber] = useState(1);
  const [questionText, setQuestionText] = useState('');
  const [maxMarks, setMaxMarks] = useState(10);
  const [modelAnswer, setModelAnswer] = useState('');
  const [criteria, setCriteria] = useState('');
  const [keywords, setKeywords] = useState('');

  useEffect(() => {
    fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/exams/${id}`);
      setExam(res.data);
      const nextQNum = (res.data.questions?.length || 0) + 1;
      setQuestionNumber(nextQNum);
    } catch (err) {
      console.error('Error fetching exam:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/exams/${id}/questions`, {
        questionNumber: Number(questionNumber),
        questionText,
        maxMarks: Number(maxMarks),
        rubric: {
          modelAnswer,
          criteria,
          keywords,
        },
      });
      setIsModalOpen(false);
      setQuestionText('');
      setModelAnswer('');
      setCriteria('');
      setKeywords('');
      fetchExam();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add question');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/questions/${qId}`);
      fetchExam();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exam) {
    return <div>Exam not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back button and Header */}
      <div>
        <Link
          to="/admin/exams"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Exams</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">
                {exam.subject?.code}
              </span>
              <StatusBadge status={exam.status} type="exam" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{exam.title}</h1>
            <p className="text-sm text-slate-500">{exam.subject?.name} &bull; Total Marks: {exam.totalMarks}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/examiner/exams/${exam.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Examiner Upload View</span>
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question & Rubric</span>
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span>Configured Examination Questions</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-200 text-slate-700">
            {exam.questions?.length || 0}
          </span>
        </h2>

        {exam.questions?.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">No questions added to this exam yet.</p>
            <p className="text-xs text-slate-400 mt-1">Add questions, maximum marks, model answers, and rubrics.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Question</span>
            </button>
          </div>
        ) : (
          exam.questions.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-sm flex items-center justify-center shrink-0">
                    Q{q.questionNumber}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{q.questionText}</h3>
                    <span className="inline-block mt-1 text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                      Maximum Marks: {q.maxMarks}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Rubric and Model Answer Drawer */}
              {q.rubric && (
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Model Answer */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Model Answer (Benchmark)
                    </span>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{q.rubric.modelAnswer}</p>
                  </div>

                  {/* Rubric Criteria */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Marking Rubric & Criteria
                    </span>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{q.rubric.criteria}</p>
                    {q.rubric.keywords && (
                      <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Key concepts:</span>
                        {q.rubric.keywords.split(',').map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-semibold">
                            {kw.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal: Add Question & Rubric */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Examination Question & Rubric">
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Q. No.
              </label>
              <input
                type="number"
                min="1"
                required
                value={questionNumber}
                onChange={(e) => setQuestionNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Maximum Marks
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Question Text
            </label>
            <textarea
              required
              rows="3"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. Explain inheritance in Java with suitable code snippets..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Model Answer
            </label>
            <textarea
              required
              rows="3"
              value={modelAnswer}
              onChange={(e) => setModelAnswer(e.target.value)}
              placeholder="Comprehensive ideal response against which student answers will be benchmarked..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Marking Rubric & Criteria
            </label>
            <textarea
              required
              rows="3"
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="e.g. Definition: 2 marks; Types: 2 marks; Diamond problem: 3 marks; Interface example: 3 marks"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Optional Keywords / Core Concepts (comma separated)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="inheritance, extends, subclass, diamond problem"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-colors"
            >
              Save Question & Rubric
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
