import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Modal } from '../../components/Modal';
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  CheckCircle,
  FileText,
} from 'lucide-react';

export const ExamRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionIndex]: selectedOptionIndex }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  useEffect(() => {
    fetchExam();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/exams/${id}`);
      const data = res.data.exam;
      setExam(data);

      // Initialize timer duration
      const durationSec = (data.durationMinutes || 15) * 60;
      setTimeLeft(durationSec);

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.attemptId) {
        navigate(`/student/result/${err.response.data.attemptId}`);
      } else {
        setError(err.response?.data?.message || 'Failed to load exam details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleAutoSubmit = () => {
    submitExamAnswers(true);
  };

  const submitExamAnswers = async (isAuto = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpentSeconds = Math.max(
      1,
      Math.floor((Date.now() - startTimeRef.current) / 1000)
    );

    // Format answers array
    const formattedAnswers = Object.keys(answers).map((qIdx) => ({
      questionIndex: Number(qIdx),
      selectedOption: answers[qIdx],
    }));

    try {
      const res = await api.post(`/exams/${id}/submit`, {
        answers: formattedAnswers,
        timeSpentSeconds,
        isAutoSubmitted: isAuto,
      });

      const attemptId = res.data.attempt._id;
      navigate(`/student/result/${attemptId}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit exam. Please contact proctor.');
      setIsSubmitting(false);
    }
  };

  // Format time MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm font-medium">Entering secure examination environment...</p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="mx-auto max-w-lg mt-12 rounded-2xl border border-rose-200 bg-white p-6 shadow text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
        <h2 className="mt-3 text-lg font-bold text-slate-800">Cannot Open Examination</h2>
        <p className="mt-1 text-sm text-slate-500">{error || 'Exam could not be retrieved.'}</p>
        <button
          onClick={() => navigate('/student/dashboard')}
          className="mt-5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const questions = exam.questions || [];
  const currentQ = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  // Timer alert colors
  const isTimeCritical = timeLeft < 60; // < 1 min
  const isTimeWarning = timeLeft < 300 && !isTimeCritical; // < 5 min

  return (
    <div className="space-y-6">
      {/* Sticky Exam Status Bar */}
      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 px-6 py-4 shadow-sm backdrop-blur">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            {exam.subjectName}
          </span>
          <h1 className="text-lg font-bold text-slate-900">{exam.title}</h1>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-2 border font-mono text-base font-bold shadow-sm transition-colors ${
              isTimeCritical
                ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                : isTimeWarning
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <Clock className={`h-5 w-5 ${isTimeCritical ? 'text-rose-500' : 'text-slate-500'}`} />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <Send className="h-4 w-4" />
            <span>Submit Exam</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main Question Panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {currentQ.marks || 1} Marks
              </span>
            </div>

            {/* Question Text */}
            <h2 className="mt-5 text-lg font-semibold text-slate-800 leading-relaxed sm:text-xl">
              {currentQ.questionText}
            </h2>

            {/* Options */}
            <div className="mt-6 space-y-3">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = answers[currentQuestionIndex] === optIdx;
                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-sm ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase transition ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {letter}
                    </div>
                    <span className="text-sm font-medium">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Controls */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs text-slate-400 font-medium">
                {answers[currentQuestionIndex] !== undefined ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Answered
                  </span>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5" /> Not Answered
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={currentQuestionIndex === questions.length - 1}
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 transition"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Side Question Palette */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Question Navigator
            </h3>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="h-3 w-3 rounded bg-blue-600" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="h-3 w-3 rounded bg-slate-100 border border-slate-300" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                const isAnswered = answers[idx] !== undefined;
                const isCurrent = currentQuestionIndex === idx;

                let btnStyle = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
                if (isAnswered) {
                  btnStyle = 'bg-blue-600 text-white font-bold border-blue-600 shadow-sm';
                }
                if (isCurrent) {
                  btnStyle += ' ring-2 ring-blue-500 ring-offset-2';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`flex h-10 items-center justify-center rounded-xl border text-xs font-semibold transition ${btnStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Submit Exam Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Examination Submission"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to finalize and submit this examination? Your answers will be automatically scored on the server.
          </p>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Total Questions:</span>
              <span className="font-semibold text-slate-900">{questions.length}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Questions Answered:</span>
              <span className="font-semibold">{answeredCount}</span>
            </div>
            <div className="flex justify-between text-rose-600">
              <span>Questions Unanswered:</span>
              <span className="font-semibold">{unansweredCount}</span>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>You still have {unansweredCount} unanswered questions.</span>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Continue Writing
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => submitExamAnswers(false)}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Evaluating...' : 'Yes, Submit Exam'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
