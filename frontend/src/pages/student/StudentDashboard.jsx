import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Badge } from '../../components/Badge';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  Play,
  RotateCcw,
  Eye,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [examsRes, progressRes] = await Promise.all([
        api.get('/exams'),
        api.get(`/students/${user._id}/progress`),
      ]);
      setExams(examsRes.data.exams || []);
      setProgress(progressRes.data);
    } catch (err) {
      setError('Unable to load exams and academic status. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading your examination portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Personalized Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 text-white shadow-xl shadow-blue-500/10 sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Student Portal • {user?.classGrade || 'Class 10'}
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="mt-1 text-sm text-blue-100 max-w-xl">
              Student ID: <span className="font-mono font-semibold text-white">{user?.studentId || 'STU102'}</span>.
              Ready for your online assessments? Review your upcoming exams or track your academic improvement below.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/student/progress"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-900 shadow-md transition hover:bg-blue-50 hover:shadow-lg"
            >
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>Track Academic Progress</span>
            </Link>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute right-0 bottom-0 -z-0 h-64 w-64 translate-x-12 translate-y-12 rounded-full bg-white/10 blur-2xl" />
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Attempts</span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{progress?.metrics?.totalAttempts || 0}</span>
            <span className="text-xs text-slate-400">Exams taken</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Passed</span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{progress?.metrics?.passedCount || 0}</span>
            <span className="text-xs text-slate-400">Clear</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Failed</span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{progress?.metrics?.failedCount || 0}</span>
            <span className="text-xs text-slate-400">Alerted</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average</span>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{progress?.metrics?.averagePercentage || 0}%</span>
            <span className="text-xs text-slate-400">Overall score</span>
          </div>
        </div>
      </div>

      {/* Available & Upcoming Examinations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Available Examinations</h2>
            <p className="text-xs text-slate-500">Scheduled tests for your grade</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {exams.length} {exams.length === 1 ? 'Exam' : 'Exams'} listed
          </span>
        </div>

        {exams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">No active examinations</h3>
            <p className="mt-1 text-xs text-slate-500">Check back later for new examination schedules.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => {
              const attempt = exam.latestAttempt;
              const hasAttempted = exam.hasAttempted;
              const isPassed = attempt?.result === 'PASS';

              return (
                <div
                  key={exam._id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {exam.subjectName}
                      </span>
                      {hasAttempted && (
                        <Badge variant={isPassed ? 'pass' : 'fail'}>
                          {attempt.result} ({attempt.marksObtained}/{attempt.totalMarks})
                        </Badge>
                      )}
                    </div>

                    <h3 className="mt-3 text-base font-bold text-slate-900 line-clamp-1">
                      {exam.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {exam.description || 'Standard academic examination.'}
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 text-center text-xs">
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase font-semibold">Duration</span>
                        <span className="font-semibold text-slate-700">{exam.durationMinutes}m</span>
                      </div>
                      <div className="border-x border-slate-200">
                        <span className="block text-slate-400 text-[10px] uppercase font-semibold">Total Marks</span>
                        <span className="font-semibold text-slate-700">{exam.totalMarks}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase font-semibold">Passing</span>
                        <span className="font-semibold text-slate-700">{exam.passingMarks}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    {hasAttempted ? (
                      <>
                        <button
                          onClick={() => navigate(`/student/result/${attempt._id}`)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          <span>View Result</span>
                        </button>

                        {exam.allowRetake && (
                          <button
                            onClick={() => navigate(`/student/exam/${exam._id}`)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700 transition"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Retake</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => navigate(`/student/exam/${exam._id}`)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Start Examination</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
