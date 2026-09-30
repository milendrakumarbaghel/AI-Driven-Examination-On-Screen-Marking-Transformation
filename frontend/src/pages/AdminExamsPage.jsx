import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import { BookOpen, Plus, ArrowRight, Calendar, Award, Layers } from 'lucide-react';

export default function AdminExamsPage() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // New Exam Form
  const [title, setTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [totalMarks, setTotalMarks] = useState(50);

  // New Subject Form
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');

  useEffect(() => {
    fetchExamsAndSubjects();
  }, []);

  const fetchExamsAndSubjects = async () => {
    try {
      setLoading(true);
      const [examsRes, subjectsRes] = await Promise.all([
        api.get('/exams'),
        api.get('/subjects'),
      ]);
      setExams(examsRes.data);
      setSubjects(subjectsRes.data);
      if (subjectsRes.data.length > 0) {
        setSelectedSubjectId(subjectsRes.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exams', {
        title,
        subjectId: selectedSubjectId,
        totalMarks: Number(totalMarks),
      });
      setIsModalOpen(false);
      setTitle('');
      fetchExamsAndSubjects();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create exam');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/subjects', {
        name: subjectName,
        code: subjectCode,
      });
      setIsSubjectModalOpen(false);
      setSubjectName('');
      setSubjectCode('');
      setSubjects([...subjects, res.data]);
      setSelectedSubjectId(res.data.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create subject');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">University Examination Management</h1>
          <p className="text-sm text-slate-500 mt-1">Configure exams, subjects, questions, model answers, and evaluation rubrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Add Subject</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Exam</span>
          </button>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">
                  {exam.subject.code}
                </span>
                <StatusBadge status={exam.status} type="exam" />
              </div>

              <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 mb-2">
                {exam.title}
              </h3>
              <p className="text-xs text-slate-500 mb-4">{exam.subject.name}</p>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Total Marks</span>
                  <span className="font-extrabold text-slate-800 text-sm">{exam.totalMarks} Marks</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Questions Configured</span>
                  <span className="font-extrabold text-slate-800 text-sm">{exam.questionCount} Questions</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-2 flex items-center justify-between">
              <Link
                to={`/examiner/exams/${exam.id}`}
                className="text-xs font-bold text-slate-600 hover:text-blue-700 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Upload & Mark Sheets
              </Link>
              <Link
                to={`/admin/exams/${exam.id}`}
                className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs"
              >
                <span>Edit Questions & Rubrics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Exam */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New University Exam">
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Exam Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. B.Tech Semester V - Final Examination"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Total Marks
            </label>
            <input
              type="number"
              min="1"
              required
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
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
              Create Exam
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Subject */}
      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Add New Subject">
        <form onSubmit={handleCreateSubject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject Name
            </label>
            <input
              type="text"
              required
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g. Data Structures and Algorithms"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject Code
            </label>
            <input
              type="text"
              required
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              placeholder="e.g. CS202"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 uppercase"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-colors"
            >
              Save Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
