import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/Badge';
import {
  Users,
  FileCheck2,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Bell,
  ArrowRight,
  Filter,
  Eye,
  Info,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedResult, setSelectedResult] = useState('');

  useEffect(() => {
    fetchDashboardMetrics();
  }, [selectedClass, selectedResult]);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedClass) params.classGrade = selectedClass;
      if (selectedResult) params.result = selectedResult;

      const res = await api.get('/analytics/dashboard', { params });
      setData(res.data);
    } catch (err) {
      setError('Failed to load analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Aggregating platform intelligence...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const passFailData = charts.passFailDistribution || [];
  const subjectData = charts.subjectPerformance || [];
  const examData = charts.examPerformance || [];
  const struggling = data?.strugglingStudents || [];
  const recentAttempts = data?.recentAttempts || [];
  const whatsappStatus = data?.whatsappStatus || {};

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            System Administration
          </span>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Analytics & Examination Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time student monitoring, automated WhatsApp alerts, and performance metrics
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm text-xs">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="border-none bg-transparent font-medium text-slate-700 focus:outline-none"
            >
              <option value="">All Classes</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm text-xs">
            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
              className="border-none bg-transparent font-medium text-slate-700 focus:outline-none"
            >
              <option value="">All Results</option>
              <option value="PASS">Pass Only</option>
              <option value="FAIL">Fail Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* WhatsApp Cloud API Notification Status Banner */}
      {!whatsappStatus.isConfigured ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-700 shrink-0">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                WhatsApp Cloud API is in Simulation/Audit Mode
              </h3>
              <p className="text-xs text-amber-700">
                WHATSAPP_API_TOKEN is unset. Failure alerts for recipient{' '}
                <span className="font-mono font-bold text-amber-900">{whatsappStatus.recipient || '+91 6305497264'}</span>{' '}
                are recorded in the Notification history as NOT_CONFIGURED instead of falsely claiming delivery.
              </p>
            </div>
          </div>
          <Link
            to="/admin/notifications"
            className="shrink-0 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-700"
          >
            Configure & Test
          </Link>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 shrink-0">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Official WhatsApp Failure Alerts Active</h3>
              <p className="text-xs text-emerald-700">
                Connected to WhatsApp Cloud API. Target recipient:{' '}
                <span className="font-mono font-bold text-emerald-900">{whatsappStatus.recipient}</span>
              </p>
            </div>
          </div>
          <Link
            to="/admin/notifications"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
          >
            View Logs
          </Link>
        </div>
      )}

      {/* 6 Key Summary Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Students</span>
            <Users className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{summary.totalStudents || 0}</div>
          <span className="text-[10px] text-slate-400">Enrolled active</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Exams</span>
            <FileCheck2 className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{summary.totalExams || 0}</div>
          <span className="text-[10px] text-slate-400">Created in catalog</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Completed</span>
            <Award className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{summary.totalAttempts || 0}</div>
          <span className="text-[10px] text-slate-400">Exam submissions</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pass Rate</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {summary.overallPassPercentage || 0}%
          </div>
          <span className="text-[10px] text-slate-400">Platform average</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Failed</span>
            <XCircle className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">
            {summary.failedStudentsCount || 0}
          </div>
          <span className="text-[10px] text-slate-400">Students with fails</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Attention</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {summary.requiringAttentionCount || 0}
          </div>
          <span className="text-[10px] text-slate-400">Struggling learners</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pass vs Fail Donut Chart */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pass vs Fail Ratio</h2>
              <p className="text-xs text-slate-500">Overall attempt distribution</p>
            </div>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {passFailData.reduce((acc, cur) => acc + cur.value, 0) === 0 ? (
              <span className="text-xs text-slate-400">No submission records</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={passFailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {passFailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Subject-Wise Performance Bar Chart */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Subject-wise Average Marks</h2>
              <p className="text-xs text-slate-500">Mean score percentage across subjects</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>

          <div className="h-60 w-full">
            {subjectData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No subject data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                    formatter={(val) => [`${val}%`, 'Average Score']}
                  />
                  <Bar dataKey="averagePercentage" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Struggling Students Requiring Guidance */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Students Requiring Attention</span>
              <span className="rounded-full bg-rose-100 text-rose-700 px-2 py-0.5 text-xs font-bold">
                {struggling.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Students who failed recent exams or average below 50%
            </p>
          </div>
          <Link
            to="/admin/progress"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Full Class Progress</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {struggling.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            All students are currently maintaining passing grades above 50%!
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Class</th>
                  <th className="px-6 py-3.5">Exams Taken</th>
                  <th className="px-6 py-3.5">Failed Count</th>
                  <th className="px-6 py-3.5">Average %</th>
                  <th className="px-6 py-3.5">Latest Exam</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {struggling.map((stu) => (
                  <tr key={stu._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-800">{stu.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{stu.studentId}</div>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600">{stu.classGrade}</td>
                    <td className="px-6 py-3.5 text-xs font-semibold text-slate-700">
                      {stu.totalAttempts}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                        {stu.failedCount} Failed
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-800">
                      {stu.averagePercentage}%
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600">
                      <div className="truncate max-w-xs">{stu.latestExam}</div>
                      <Badge variant={stu.latestResult === 'PASS' ? 'pass' : 'fail'}>
                        {stu.latestResult}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/admin/results?search=${encodeURIComponent(stu.studentId || stu.name)}`)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Exam Attempts Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Exam Submissions</h2>
          <Link
            to="/admin/results"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Results</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Student</th>
                <th className="px-6 py-3.5">Exam</th>
                <th className="px-6 py-3.5">Score</th>
                <th className="px-6 py-3.5">Percentage</th>
                <th className="px-6 py-3.5">Result</th>
                <th className="px-6 py-3.5">Submitted</th>
                <th className="px-6 py-3.5 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentAttempts.map((att) => (
                <tr key={att._id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-3.5">
                    <span className="font-semibold text-slate-800">{att.student?.name}</span>
                    <span className="block text-xs text-slate-400 font-mono">
                      {att.student?.studentId}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-xs font-medium text-slate-700">
                    {att.examTitle}
                  </td>
                  <td className="px-6 py-3.5 font-mono text-xs font-semibold text-slate-800">
                    {att.marksObtained}/{att.totalMarks}
                  </td>
                  <td className="px-6 py-3.5 font-mono font-bold text-slate-800">
                    {att.percentage}%
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge variant={att.result === 'PASS' ? 'pass' : 'fail'}>
                      {att.result}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-500">
                    {new Date(att.submittedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => navigate(`/student/result/${att._id}`)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
