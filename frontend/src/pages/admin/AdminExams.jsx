import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import {
  FileCheck2,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const AdminExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewExam, setPreviewExam] = useState(null);

  // Form State
  const [examForm, setExamForm] = useState({
    title: '',
    subjectName: '',
    classGrade: 'Grade 10',
    description: '',
    durationMinutes: 15,
    totalMarks: 100,
    passingMarks: 40,
    allowRetake: false,
    status: 'published',
    questions: [
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        marks: 25,
        explanation: '',
      },
    ],
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/exams');
      setExams(res.data.exams || []);
    } catch (err) {
      setError('Failed to load examinations catalog.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setExamForm({
      title: '',
      subjectName: '',
      classGrade: 'Grade 10',
      description: '',
      durationMinutes: 15,
      totalMarks: 100,
      passingMarks: 40,
      allowRetake: false,
      status: 'published',
      questions: [
        {
          questionText: 'What is the primary function of a database index?',
          options: ['Encrypting records', 'Speeding up data retrieval', 'Deleting redundant records', 'Backing up data'],
          correctAnswer: 1,
          marks: 50,
          explanation: 'Indexes provide faster lookups by avoiding full table scans.',
        },
        {
          questionText: 'Which HTTP status code indicates a Successful resource creation?',
          options: ['200 OK', '201 Created', '204 No Content', '301 Moved'],
          correctAnswer: 1,
          marks: 50,
          explanation: 'HTTP 201 Created indicates the request succeeded and led to resource creation.',
        },
      ],
    });
    setShowCreateModal(true);
  };

  const handleAddQuestion = () => {
    setExamForm({
      ...examForm,
      questions: [
        ...examForm.questions,
        {
          questionText: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          marks: 10,
          explanation: '',
        },
      ],
    });
  };

  const handleRemoveQuestion = (idx) => {
    if (examForm.questions.length <= 1) return;
    const updated = examForm.questions.filter((_, i) => i !== idx);
    setExamForm({ ...examForm, questions: updated });
  };

  const handleQuestionChange = (qIdx, field, value) => {
    const updated = [...examForm.questions];
    updated[qIdx][field] = value;
    setExamForm({ ...examForm, questions: updated });
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    const updated = [...examForm.questions];
    updated[qIdx].options[optIdx] = value;
    setExamForm({ ...examForm, questions: updated });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      // Recalculate total marks from questions
      const calculatedTotal = examForm.questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
      const payload = {
        ...examForm,
        totalMarks: calculatedTotal,
      };

      await api.post('/exams', payload);
      setShowCreateModal(false);
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating examination');
    }
  };

  const toggleStatus = async (exam) => {
    try {
      const newStatus = exam.status === 'published' ? 'draft' : 'published';
      await api.put(`/exams/${exam._id}`, { status: newStatus });
      fetchExams();
    } catch (err) {
      alert('Failed to update exam status');
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this examination?')) return;
    try {
      await api.delete(`/exams/${id}`);
      fetchExams();
    } catch (err) {
      alert('Failed to delete exam');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Exam Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Online Examinations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Author multiple choice questions, set passing thresholds, and publish assessments
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Create Examination</span>
        </button>
      </div>

      {/* Exam Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading examinations...</div>
      ) : exams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <FileCheck2 className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-sm font-semibold text-slate-800">No examinations created yet</h3>
          <p className="mt-1 text-xs text-slate-500">Click "Create Examination" to author your first test.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div
              key={exam._id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                    {exam.subjectName}
                  </span>
                  <Badge variant={exam.status === 'published' ? 'published' : 'draft'}>
                    {exam.status}
                  </Badge>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900 line-clamp-1">
                  {exam.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                  {exam.description || 'Standard academic examination.'}
                </p>

                <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl bg-slate-50 p-2.5 text-center text-xs">
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-semibold">Duration</span>
                    <span className="font-semibold text-slate-700">{exam.durationMinutes}m</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-semibold">Total</span>
                    <span className="font-semibold text-slate-700">{exam.totalMarks}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-semibold">Pass Mark</span>
                    <span className="font-semibold text-slate-700">{exam.passingMarks}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-semibold">MCQs</span>
                    <span className="font-semibold text-slate-700">{exam.questions?.length || 0}</span>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400">
                  Retakes: <span className="font-semibold text-slate-600">{exam.allowRetake ? 'Allowed' : 'Single Attempt'}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => setPreviewExam(exam)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  title="Inspect Questions & Answers"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(exam)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      exam.status === 'published'
                        ? 'border border-amber-200 text-amber-700 hover:bg-amber-50'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {exam.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    onClick={() => handleDeleteExam(exam._id)}
                    className="rounded-xl border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                    title="Delete Exam"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Exam Modal with MCQ Builder */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Author Examination & MCQs"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-6 text-xs max-h-[75vh] overflow-y-auto pr-2">
          {/* General Exam Config */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Exam Title</label>
              <input
                type="text"
                required
                value={examForm.title}
                onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                placeholder="e.g. Python Basics Comprehensive Exam"
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
              <input
                type="text"
                required
                value={examForm.subjectName}
                onChange={(e) => setExamForm({ ...examForm, subjectName: e.target.value })}
                placeholder="e.g. Computer Science"
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Class / Grade</label>
              <input
                type="text"
                required
                value={examForm.classGrade}
                onChange={(e) => setExamForm({ ...examForm, classGrade: e.target.value })}
                placeholder="Grade 10"
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min="1"
                required
                value={examForm.durationMinutes}
                onChange={(e) => setExamForm({ ...examForm, durationMinutes: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Passing Marks Threshold</label>
              <input
                type="number"
                min="1"
                required
                value={examForm.passingMarks}
                onChange={(e) => setExamForm({ ...examForm, passingMarks: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows="2"
                value={examForm.description}
                onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                placeholder="Brief guidelines or syllabus scope..."
                className="w-full rounded-xl border border-slate-300 p-2.5 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={examForm.allowRetake}
                  onChange={(e) => setExamForm({ ...examForm, allowRetake: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-700">Allow Multiple Retakes</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={examForm.status === 'published'}
                  onChange={(e) => setExamForm({ ...examForm, status: e.target.checked ? 'published' : 'draft' })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-700">Publish Immediately</span>
              </label>
            </div>
          </div>

          {/* MCQ Question Builder */}
          <div className="border-t border-slate-200 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Multiple-Choice Questions ({examForm.questions.length})</h3>
                <p className="text-[11px] text-slate-500">Provide 4 options and mark the correct option radio button</p>
              </div>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {examForm.questions.map((q, qIdx) => (
              <div key={qIdx} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600">Question #{qIdx + 1}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500">Marks:</span>
                      <input
                        type="number"
                        min="1"
                        value={q.marks}
                        onChange={(e) => handleQuestionChange(qIdx, 'marks', Number(e.target.value))}
                        className="w-14 rounded-lg border border-slate-300 p-1 text-center font-mono focus:outline-none"
                      />
                    </div>
                    {examForm.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="rounded-lg p-1 text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Enter question text here..."
                  value={q.questionText}
                  onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 focus:border-blue-500 focus:outline-none"
                />

                {/* 4 Options with Radio selection for correct answer */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Mark the radio button next to the correct answer:
                  </span>
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct_q_${qIdx}`}
                        checked={q.correctAnswer === optIdx}
                        onChange={() => handleQuestionChange(qIdx, 'correctAnswer', optIdx)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-slate-500 w-4">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <input
                        type="text"
                        required
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                        className={`flex-1 rounded-xl border p-2 bg-white focus:outline-none ${
                          q.correctAnswer === optIdx
                            ? 'border-emerald-500 ring-1 ring-emerald-500/30'
                            : 'border-slate-300'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Explanation shown after test submission (optional)..."
                  value={q.explanation}
                  onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-slate-600 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-700 shadow"
            >
              Save Examination
            </button>
          </div>
        </form>
      </Modal>

      {/* Inspect Preview Modal */}
      <Modal
        isOpen={Boolean(previewExam)}
        onClose={() => setPreviewExam(null)}
        title={previewExam ? `Preview: ${previewExam.title}` : 'Exam Preview'}
        maxWidth="max-w-2xl"
      >
        {previewExam && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-xs">
            <div className="flex justify-between rounded-xl bg-slate-50 p-3 border border-slate-200">
              <div>
                <span className="text-slate-400">Subject: </span>
                <span className="font-bold text-slate-800">{previewExam.subjectName}</span>
              </div>
              <div>
                <span className="text-slate-400">Passing Mark: </span>
                <span className="font-bold text-emerald-600">
                  {previewExam.passingMarks} / {previewExam.totalMarks}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {previewExam.questions?.map((q, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 p-4 space-y-2">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Q{idx + 1}. {q.questionText}</span>
                    <span className="text-blue-600">{q.marks} pts</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {q.options?.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`rounded-lg p-2 border ${
                          optIdx === q.correctAnswer
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                        {optIdx === q.correctAnswer && ' (Correct Answer)'}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className="text-[11px] text-slate-500 italic mt-1">
                      Explanation: {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
