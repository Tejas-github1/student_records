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
  Eye,
  ArrowRight,
  BookOpen,
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
} from 'recharts';

export const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading teacher dashboard...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const passFailData = charts.passFailDistribution || [];
  const subjectData = charts.subjectPerformance || [];
  const struggling = data?.strugglingStudents || [];
  const recentAttempts = data?.recentAttempts || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-800 via-indigo-800 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              Teacher Faculty Portal
            </span>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">Class Overview & Assessment</h1>
            <p className="mt-1 text-xs text-blue-100 max-w-xl">
              Track student performance, monitor pass/fail metrics, and provide early guidance to struggling learners.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/teacher/progress"
              className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-blue-900 shadow hover:bg-blue-50"
            >
              Class Performance
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Enrolled Students</span>
          <div className="mt-2 text-2xl font-black text-slate-900">{summary.totalStudents || 0}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Exams Completed</span>
          <div className="mt-2 text-2xl font-black text-slate-900">{summary.totalAttempts || 0}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Pass Rate</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">{summary.overallPassPercentage || 0}%</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">Need Attention</span>
          <div className="mt-2 text-2xl font-black text-rose-600">{summary.requiringAttentionCount || 0}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Pass vs Fail Ratio</h2>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={passFailData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                  {passFailData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900 mb-4">Subject Average Scores</h2>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="subject" fontSize={11} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} fontSize={11} stroke="#94a3b8" />
                <Tooltip formatter={(val) => [`${val}%`, 'Average']} />
                <Bar dataKey="averagePercentage" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Struggling Students Alert List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Struggling Students Requiring Assistance</span>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
              {struggling.length}
            </span>
          </h2>
          <Link to="/teacher/progress" className="text-xs font-bold text-blue-600 hover:text-blue-800">
            View All Performance →
          </Link>
        </div>

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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {struggling.map((stu) => (
                <tr key={stu._id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-3.5">
                    <span className="font-semibold text-slate-900 block">{stu.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{stu.studentId}</span>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-600">{stu.classGrade}</td>
                  <td className="px-6 py-3.5 text-xs font-semibold text-slate-700">{stu.totalAttempts}</td>
                  <td className="px-6 py-3.5">
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                      {stu.failedCount} Failed
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{stu.averagePercentage}%</td>
                  <td className="px-6 py-3.5 text-xs text-slate-600">{stu.latestExam}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
