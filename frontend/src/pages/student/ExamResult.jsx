import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/Badge';
import {
  CheckCircle2,
  XCircle,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const ExamResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/exams/attempts/${attemptId}`);
      setAttempt(res.data.attempt);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load exam results.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Calculating your official score...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="mx-auto max-w-lg mt-12 rounded-2xl border border-rose-200 bg-white p-6 shadow text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
        <h2 className="mt-3 text-lg font-bold text-slate-800">Result Not Found</h2>
        <p className="mt-1 text-sm text-slate-500">{error || 'This exam result could not be located.'}</p>
        <button
          onClick={() => navigate('/student/dashboard')}
          className="mt-5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isPass = attempt.result === 'PASS';
  const reviews = attempt.questionReview || [];
  const correctCount = reviews.filter((q) => q.isCorrect).length;
  const incorrectCount = reviews.length - correctCount;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Result Hero Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl p-8 text-white shadow-xl ${
          isPass
            ? 'bg-gradient-to-tr from-emerald-600 via-teal-700 to-cyan-800 shadow-emerald-500/20'
            : 'bg-gradient-to-tr from-rose-600 via-red-700 to-orange-800 shadow-rose-500/20'
        }`}
      >
        <div className="relative z-10 flex flex-col items-center text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              {isPass ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              <span>Official Examination Result</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              {attempt.examTitle}
            </h1>
            <p className="text-sm opacity-90">
              Subject: {attempt.subjectName} • Completed on{' '}
              {new Date(attempt.submittedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="mt-6 flex flex-col items-center rounded-2xl bg-white/10 p-5 backdrop-blur-lg sm:mt-0">
            <span className="text-xs uppercase tracking-wider font-semibold opacity-80">Final Outcome</span>
            <span
              className={`mt-1 text-4xl font-extrabold tracking-wider ${
                isPass ? 'text-emerald-200' : 'text-rose-200'
              }`}
            >
              {attempt.result}
            </span>
            <span className="mt-1 text-xs font-medium opacity-80">
              Passing Mark: {attempt.passingMarks}/{attempt.totalMarks}
            </span>
          </div>
        </div>
      </div>

      {/* Primary KPI Breakdown */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Marks Obtained</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-900">{attempt.marksObtained}</span>
            <span className="text-sm font-semibold text-slate-400">/ {attempt.totalMarks}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Percentage</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span
              className={`text-3xl font-extrabold ${
                isPass ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {attempt.percentage}%
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Correct Answers</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-emerald-600">{correctCount}</span>
            <span className="text-sm font-semibold text-slate-400">/ {reviews.length}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Time Spent</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-900">
              {Math.ceil(attempt.timeSpentSeconds / 60)}
            </span>
            <span className="text-sm font-semibold text-slate-400">Minutes</span>
          </div>
        </div>
      </div>

      {/* Academic Progress CTA button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Track your performance across examinations
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Compare your scores across subjects, view improvement trends, and monitor historical records.
          </p>
        </div>

        <Link
          to="/student/progress"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition shrink-0"
        >
          <TrendingUp className="h-4 w-4" />
          <span>View Academic Progress</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Detailed Question Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Question-by-Question Review</h2>
          <span className="text-xs font-semibold text-slate-500">
            {reviews.length} Questions Evaluated
          </span>
        </div>

        <div className="space-y-4">
          {reviews.map((q, idx) => {
            const isCorrect = q.isCorrect;
            return (
              <div
                key={idx}
                className={`rounded-2xl border p-6 shadow-sm transition ${
                  isCorrect
                    ? 'border-emerald-200 bg-white'
                    : 'border-rose-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                        isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800">{q.questionText}</h3>
                  </div>

                  <div className="shrink-0">
                    <Badge variant={isCorrect ? 'pass' : 'fail'}>
                      {isCorrect ? `+${q.marksAwarded} Marks` : '0 Marks'}
                    </Badge>
                  </div>
                </div>

                {/* Options List */}
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = q.selectedOption === optIdx;
                    const isCorrectAnswer = q.correctAnswer === optIdx;

                    let optStyle = 'border-slate-200 bg-slate-50/50 text-slate-600';
                    let label = String.fromCharCode(65 + optIdx);

                    if (isCorrectAnswer) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500/20';
                    } else if (isSelected && !isCorrect) {
                      optStyle = 'border-rose-500 bg-rose-50 text-rose-900 font-semibold ring-1 ring-rose-500/20';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center justify-between rounded-xl border p-3 text-xs ${optStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{label}.</span>
                          <span>{opt}</span>
                        </div>
                        {isCorrectAnswer && (
                          <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                            Correct
                          </span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-200">
                    <span className="font-bold text-slate-700">Explanation: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
