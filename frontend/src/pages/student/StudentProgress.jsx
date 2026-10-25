import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Badge } from '../../components/Badge';
import {
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  Calendar,
  Eye,
  AlertCircle,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export const StudentProgress = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentProgress();
  }, []);

  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students/${user._id}/progress`);
      setData(res.data);
    } catch (err) {
      setError('Unable to load progress analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Generating academic progress analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg mt-12 rounded-2xl border border-rose-200 bg-white p-6 shadow text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
        <h2 className="mt-3 text-lg font-bold text-slate-800">Progress Data Unavailable</h2>
        <p className="mt-1 text-sm text-slate-500">{error || 'Could not load your records.'}</p>
      </div>
    );
  }

  const { student, metrics, charts, history } = data;
  const trend = metrics.trend;

  return (
    <div className="space-y-8">
      {/* Header Profile Info & Performance Trend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Academic Performance Dashboard
          </span>
          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            {student.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Student ID: <span className="font-mono font-bold text-slate-700">{student.studentId}</span> • Class: <span className="font-semibold text-slate-700">{student.classGrade}</span>
          </p>
        </div>

        {/* Improvement / Trend Badge */}
        {trend && (
          <div
            className={`flex items-center gap-3 rounded-2xl p-4 border ${
              trend.isImprovement
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div
              className={`rounded-xl p-2.5 ${
                trend.isImprovement ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {trend.isImprovement ? (
                <TrendingUp className="h-6 w-6" />
              ) : (
                <TrendingDown className="h-6 w-6" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-75">
                Improvement Trend
              </span>
              <p className="text-sm font-extrabold">{trend.label}</p>
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Attempted</span>
          <div className="mt-2 text-2xl font-black text-slate-900">{metrics.totalAttempts}</div>
          <span className="text-[10px] text-slate-400">Total Exams</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Passed</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">{metrics.passedCount}</div>
          <span className="text-[10px] text-slate-400">{metrics.passRate}% Pass Rate</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">Failed</span>
          <div className="mt-2 text-2xl font-black text-rose-600">{metrics.failedCount}</div>
          <span className="text-[10px] text-slate-400">WhatsApp Alerted</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">Average %</span>
          <div className="mt-2 text-2xl font-black text-blue-600">{metrics.averagePercentage}%</div>
          <span className="text-[10px] text-slate-400">Overall Mean</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600">Highest %</span>
          <div className="mt-2 text-2xl font-black text-purple-600">{metrics.highestPercentage}%</div>
          <span className="text-[10px] text-slate-400">Peak Score</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">Lowest %</span>
          <div className="mt-2 text-2xl font-black text-amber-600">{metrics.lowestPercentage}%</div>
          <span className="text-[10px] text-slate-400">Base Score</span>
        </div>
      </div>

      {/* Progress Charts (Recharts) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Line Chart: Progression Across Examinations */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Score Progression Across Exams</h2>
              <p className="text-xs text-slate-500">Percentage obtained per examination timeline</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>

          <div className="h-72 w-full">
            {charts.lineChart.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No exam history available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.lineChart} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="shortTitle" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(value) => [`${value}%`, 'Percentage']}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', r: 5 }}
                    activeDot={{ r: 8, stroke: '#60a5fa', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart: Subject-wise Comparison */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Subject-wise Average Marks</h2>
              <p className="text-xs text-slate-500">Comparative mastery across curriculum</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>

          <div className="h-72 w-full">
            {charts.barChart.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No subject records available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.barChart} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(value) => [`${value}%`, 'Average Score']}
                  />
                  <Bar dataKey="averagePercentage" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Previous Exam Results Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Previous Examination Results</h2>
          <span className="text-xs text-slate-400">{history.length} records</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Examination</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Marks</th>
                  <th className="px-6 py-4">Percentage</th>
                  <th className="px-6 py-4">Result</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((att) => {
                  const isPass = att.result === 'PASS';
                  return (
                    <tr key={att._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {att.examTitle}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium">
                          {att.subjectName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(att.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-800">
                        {att.marksObtained}/{att.totalMarks}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">
                        {att.percentage}%
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={isPass ? 'pass' : 'fail'}>
                          {att.result}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/student/result/${att._id}`)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
