import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export const AdminResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const queryParams = new URLSearchParams(location.search);
  const [search, setSearch] = useState(queryParams.get('search') || '');
  const [resultFilter, setResultFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Inspector modal
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    fetchAttempts();
  }, [search, resultFilter, classFilter, page]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
      };
      if (search) params.search = search;
      if (resultFilter) params.result = resultFilter;
      if (classFilter) params.classGrade = classFilter;

      const res = await api.get('/exams/attempts', { params });
      setAttempts(res.data.attempts || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      setError('Failed to load examination attempts.');
    } finally {
      setLoading(false);
    }
  };

  const passCount = attempts.filter((a) => a.result === 'PASS').length;
  const failCount = attempts.filter((a) => a.result === 'FAIL').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Results & Evaluations
          </span>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Examination Attempt Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search submissions, audit pass/fail grades, and view question breakdowns
          </p>
        </div>

        {/* Quick count chips */}
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            {passCount} Passed
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
            {failCount} Failed
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by student name, ID, or exam title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={resultFilter}
            onChange={(e) => {
              setResultFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PASS">Pass Only</option>
            <option value="FAIL">Fail Only</option>
          </select>

          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="">All Classes</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading attempt records...</div>
        ) : attempts.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No attempts match current criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Examination</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Percentage</th>
                  <th className="px-6 py-4">Result</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((att) => {
                  const isPass = att.result === 'PASS';
                  return (
                    <tr key={att._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{att.student?.name}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          {att.student?.studentId} • {att.student?.classGrade || 'Class 10'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        <div>{att.examTitle}</div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          {att.subjectName}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-800">
                        {att.marksObtained}/{att.totalMarks}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-black text-slate-900">
                        {att.percentage}%
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={isPass ? 'pass' : 'fail'}>
                          {att.result}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(att.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedAttempt(att)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
            <span>
              Showing {attempts.length} of {totalCount} records
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1 font-semibold hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1 font-semibold hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Attempt Modal */}
      <Modal
        isOpen={Boolean(selectedAttempt)}
        onClose={() => setSelectedAttempt(null)}
        title={selectedAttempt ? `Review: ${selectedAttempt.student?.name} - ${selectedAttempt.examTitle}` : 'Exam Attempt'}
        maxWidth="max-w-2xl"
      >
        {selectedAttempt && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 border border-slate-200">
              <div>
                <span className="text-slate-400 block uppercase text-[10px] font-bold">Outcome</span>
                <Badge variant={selectedAttempt.result === 'PASS' ? 'pass' : 'fail'}>
                  {selectedAttempt.result}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[10px] font-bold">Marks</span>
                <span className="font-mono text-base font-bold text-slate-800">
                  {selectedAttempt.marksObtained} / {selectedAttempt.totalMarks} ({selectedAttempt.percentage}%)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[10px] font-bold">Passing Mark</span>
                <span className="font-mono text-base font-bold text-slate-800">
                  {selectedAttempt.passingMarks}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Question Answers
              </h4>
              {selectedAttempt.questionReview?.map((q, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-3 space-y-2 ${
                    q.isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Q{idx + 1}. {q.questionText}</span>
                    <Badge variant={q.isCorrect ? 'pass' : 'fail'}>
                      {q.isCorrect ? `+${q.marksAwarded} Pts` : '0 Pts'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-slate-400">Student Selected: </span>
                      <span className={`font-semibold ${q.isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {q.selectedOption !== null && q.selectedOption !== undefined
                          ? `${String.fromCharCode(65 + q.selectedOption)}. ${q.options[q.selectedOption]}`
                          : 'Unanswered'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Correct Answer: </span>
                      <span className="font-semibold text-emerald-700">
                        {String.fromCharCode(65 + q.correctAnswer)}. {q.options[q.correctAnswer]}
                      </span>
                    </div>
                  </div>

                  {q.explanation && (
                    <p className="text-[10px] text-slate-500 italic mt-1">
                      {q.explanation}
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
