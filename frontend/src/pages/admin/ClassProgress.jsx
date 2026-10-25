import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Badge } from '../../components/Badge';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ClassProgress = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClassProgress();
  }, [selectedClass]);

  const fetchClassProgress = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedClass) params.classGrade = selectedClass;

      const res = await api.get('/students/class-progress', { params });
      setStudents(res.data.students || []);
    } catch (err) {
      setError('Failed to load class-wide academic progress.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.studentId && s.studentId.toLowerCase().includes(term))
    );
  });

  const strugglingCount = students.filter((s) => s.needsSupport).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Academic Performance Intelligence
          </span>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Class-wide Progress Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comparative student benchmarks, improvement trajectories, and intervention alerts
          </p>
        </div>

        {strugglingCount > 0 && (
          <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2 text-xs font-bold text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>{strugglingCount} Students Require Academic Guidance</span>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search students in class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
        >
          <option value="">All Classes</option>
          <option value="Grade 10">Grade 10</option>
          <option value="Grade 11">Grade 11</option>
          <option value="General">General</option>
        </select>
      </div>

      {/* Comparison Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading class progress...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No student progress data found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4">Attempts</th>
                  <th className="px-6 py-4">Passed / Failed</th>
                  <th className="px-6 py-4">Pass Rate</th>
                  <th className="px-6 py-4">Average %</th>
                  <th className="px-6 py-4">Trajectory Trend</th>
                  <th className="px-6 py-4">Intervention</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr
                    key={s._id}
                    className={`transition ${
                      s.needsSupport ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{s.studentId}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                      {s.classGrade}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                      {s.totalAttempts} Exams
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="font-bold text-emerald-600">{s.passed} P</span>
                      <span className="mx-1 text-slate-300">/</span>
                      <span className="font-bold text-rose-600">{s.failed} F</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-800">
                      {s.passRate}%
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-black text-slate-900">
                      {s.avgPercentage}%
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      <span
                        className={
                          s.trend.startsWith('+')
                            ? 'text-emerald-600'
                            : s.trend.startsWith('-')
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }
                      >
                        {s.trend}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {s.needsSupport ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                          <AlertTriangle className="h-3 w-3" />
                          Needs Support
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          On Track
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/results?search=${encodeURIComponent(s.studentId || s.name)}`)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Audit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
