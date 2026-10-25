const mongoose = require('mongoose');

const attemptAnswerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true,
  },
  selectedOption: {
    type: Number,
    default: null, // null if unanswered
  },
});

const questionReviewSchema = new mongoose.Schema({
  questionIndex: Number,
  questionText: String,
  options: [String],
  selectedOption: Number,
  correctAnswer: Number,
  isCorrect: Boolean,
  marksAwarded: Number,
  maxMarks: Number,
  explanation: String,
});

const examAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true,
    },
    examTitle: {
      type: String,
      required: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    classGrade: {
      type: String,
      default: 'General',
    },
    answers: [attemptAnswerSchema],
    questionReview: [questionReviewSchema],
    marksObtained: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    passingMarks: {
      type: Number,
      required: true,
    },
    result: {
      type: String,
      enum: ['PASS', 'FAIL'],
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    isAutoSubmitted: {
      type: Boolean,
      default: false,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick lookups
examAttemptSchema.index({ student: 1, exam: 1, attemptNumber: 1 });
examAttemptSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);
